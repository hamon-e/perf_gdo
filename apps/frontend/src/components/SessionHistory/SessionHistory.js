import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

import { ACCESS_TOKEN_NAME, API_BASE_URL } from '../../constants/apiConstants';
import { useContextObject } from '../Context/Context';
import './SessionHistory.css';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const authorization = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
});

const formatDateLabel = (value) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(`${formatDate(value)}T12:00:00`));

function formatDate(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const date = new Date(value);
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDifficulty(value) {
  if (!value) return '—';
  const floor = Math.floor(value);
  const decimal = value - floor;
  const suffixes = [[0.25, 'a'], [0.35, 'a+'], [0.5, 'b'], [0.6, 'b+'], [0.75, 'c'], [0.85, 'c+']];
  const closest = suffixes.reduce((best, item) => Math.abs(item[0] - decimal) < Math.abs(best[0] - decimal) ? item : best);
  return `${floor}${closest[1]}`;
}

export default function HistoryCalendar() {
  const history = useHistory();
  const { headerTitleHook, showBarHook, errorMessageHook } = useContextObject();
  const [, setHeaderTitle] = headerTitleHook;
  const [, setShowBar] = showBarHook;
  const [, setErrorMessage] = errorMessageHook;
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [voieHistory, setVoieHistory] = useState(null);
  const [voieHistoryLoading, setVoieHistoryLoading] = useState(false);

  useEffect(() => {
    setShowBar(true);
    setHeaderTitle('Historique');
  }, [setHeaderTitle, setShowBar]);

  const errorText = (error) => error.response?.data?.detail || 'Impossible de charger votre historique.';

  const loadMonth = async (date) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/userseance_days?date=${formatDate(date)}`, authorization());
      setEvents(response.data.map((day) => ({
        id: formatDate(day),
        title: 'Séance enregistrée',
        start: formatDate(day),
        allDay: true,
        backgroundColor: '#1f6b45',
        borderColor: '#1f6b45',
      })));
    } catch (error) {
      setErrorMessage(errorText(error));
    } finally {
      setLoading(false);
    }
  };

  const loadDay = async (date) => {
    const normalizedDate = formatDate(date);
    setSelectedDate(normalizedDate);
    setDetailLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/userseance?date=${normalizedDate}`, authorization());
      setAttempts(response.data);
    } catch (error) {
      setErrorMessage(errorText(error));
    } finally {
      setDetailLoading(false);
    }
  };

  const openVoieHistory = async (attempt) => {
    setVoieHistory(null);
    setVoieHistoryLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/voie/${attempt.voie_id}/userseance`, authorization());
      setVoieHistory(response.data);
    } catch (error) {
      setErrorMessage(errorText(error));
    } finally {
      setVoieHistoryLoading(false);
    }
  };

  const closeVoieHistory = () => {
    setVoieHistory(null);
    setVoieHistoryLoading(false);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1180, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 850 }}>Historique des séances</Typography>
          <Typography color="text.secondary">Les jours en vert contiennent au moins une voie enregistrée.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => history.push('/home')} sx={{ backgroundColor: '#1f6b45' }}>
          Enregistrer une séance
        </Button>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.55fr) minmax(320px, .8fr)' }, gap: 3, alignItems: 'start' }}>
        <Paper elevation={0} sx={{ position: 'relative', p: { xs: 1, sm: 2.5 }, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          {loading && <Box sx={{ position: 'absolute', inset: 0, zIndex: 2, display: 'grid', placeItems: 'center', backgroundColor: 'rgba(255,255,255,.72)' }}><CircularProgress /></Box>}
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            datesSet={(info) => loadMonth(info.view.currentStart)}
            eventClick={(info) => loadDay(info.event.start)}
            dateClick={(info) => loadDay(info.date)}
            firstDay={1}
            height="auto"
            buttonText={{ today: "Aujourd'hui" }}
          />
        </Paper>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, position: { lg: 'sticky' }, top: { lg: 88 } }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
              <CalendarMonthIcon sx={{ color: '#1f6b45' }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {selectedDate ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(`${selectedDate}T12:00:00`)) : 'Détail de la séance'}
                </Typography>
                <Typography variant="body2" color="text.secondary">Cliquez sur une journée puis sur une voie pour voir son historique.</Typography>
              </Box>
            </Stack>

            {detailLoading ? (
              <Box sx={{ py: 7, display: 'grid', placeItems: 'center' }}><CircularProgress size={30} /></Box>
            ) : !selectedDate ? (
              <Alert severity="info">Sélectionnez une date pour consulter les voies réalisées.</Alert>
            ) : attempts.length === 0 ? (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 750 }}>Aucune voie ce jour-là</Typography>
                <Button sx={{ mt: 1 }} onClick={() => history.push('/home')}>Ajouter une séance</Button>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
                  <Chip size="small" label={`${attempts.length} voie${attempts.length > 1 ? 's' : ''}`} />
                  <Chip size="small" icon={<CheckCircleOutlineIcon />} label={`${attempts.filter((attempt) => attempt.top === 100).length} réussie${attempts.filter((attempt) => attempt.top === 100).length > 1 ? 's' : ''}`} sx={{ backgroundColor: '#dff4e8', color: '#155b39' }} />
                </Stack>
                {attempts.map((attempt) => (
                  <Paper
                    key={attempt.id}
                    component="button"
                    type="button"
                    variant="outlined"
                    onClick={() => openVoieHistory(attempt)}
                    sx={{
                      display: 'block',
                      width: '100%',
                      p: 1.75,
                      borderRadius: 2,
                      cursor: 'pointer',
                      textAlign: 'left',
                      '&:hover': { borderColor: '#1f6b45', backgroundColor: 'rgba(31, 107, 69, 0.04)' },
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ width: 34, height: 34, borderRadius: 1.5, flexShrink: 0, backgroundColor: attempt.voie?.color || '#ddd', border: '2px solid white', boxShadow: '0 0 0 1px rgba(0,0,0,.15)' }} />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontWeight: 800 }}>{formatDifficulty(attempt.voie?.difficulty)} · couloir {attempt.voie?.couloir_id}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {attempt.en_tete ? 'En tête' : 'Moulinette'} · {attempt.top === 100 ? 'réussie' : `${attempt.top}% atteint`}{attempt.pause ? ` · ${attempt.pause} pause${attempt.pause > 1 ? 's' : ''}` : ''}
                        </Typography>
                      </Box>
                      <HistoryIcon sx={{ flexShrink: 0, color: 'text.secondary' }} titleAccess="Voir l'historique de la voie" />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

      <Dialog open={voieHistoryLoading || Boolean(voieHistory)} onClose={closeVoieHistory} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 1 }}>
          <Box sx={{ width: 34, height: 34, borderRadius: 1.5, flexShrink: 0, backgroundColor: voieHistory?.voie?.color || '#ddd', border: '2px solid white', boxShadow: '0 0 0 1px rgba(0,0,0,.15)' }} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 800 }}>
              {formatDifficulty(voieHistory?.voie?.difficulty)} · couloir {voieHistory?.voie?.couloir_id}
            </Typography>
            <Typography variant="body2" color="text.secondary">Historique de la voie</Typography>
          </Box>
          <IconButton onClick={closeVoieHistory} aria-label="Fermer"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {voieHistoryLoading ? (
            <Box sx={{ py: 6, display: 'grid', placeItems: 'center' }}><CircularProgress size={30} /></Box>
          ) : voieHistory ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1}>
                <Chip label={`${voieHistory.total_attempts} essai${voieHistory.total_attempts > 1 ? 's' : ''}`} sx={{ fontWeight: 700 }} />
                <Chip icon={<CheckCircleOutlineIcon />} label={`${voieHistory.total_tops} réussie${voieHistory.total_tops > 1 ? 's' : ''}`} sx={{ backgroundColor: '#dff4e8', color: '#155b39' }} />
              </Stack>
              {voieHistory.sessions.map((session, index) => (
                <Box key={session.id}>
                  {index > 0 && <Divider sx={{ mb: 2 }} />}
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>{formatDateLabel(session.date)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {session.en_tete ? 'En tête' : 'Moulinette'} · {session.top === 100 ? 'réussie' : `${session.top}% atteint`}{session.pause ? ` · ${session.pause} pause${session.pause > 1 ? 's' : ''}` : ''}
                      </Typography>
                    </Box>
                    {session.top === 100 && <CheckCircleOutlineIcon sx={{ color: '#1f6b45' }} />}
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

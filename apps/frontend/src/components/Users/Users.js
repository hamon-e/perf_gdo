import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { ACCESS_TOKEN_NAME, API_BASE_URL } from '../../constants/apiConstants';
import { useContextObject } from '../Context/Context';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const authorization = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
});

function initials(user) {
  const value = `${user.name || ''} ${user.surname || ''}`.trim() || user.email;
  return value.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function formatDate(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
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

function StatCard({ icon, value, label }) {
  return (
    <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ color: '#1f6b45', mb: 1 }}>{icon}</Box>
        <Typography variant="h4" sx={{ fontWeight: 850 }}>{value}</Typography>
        <Typography color="text.secondary">{label}</Typography>
      </CardContent>
    </Card>
  );
}

export default function Users() {
  const { headerTitleHook, showBarHook, errorMessageHook } = useContextObject();
  const [, setHeaderTitle] = headerTitleHook;
  const [, setShowBar] = showBarHook;
  const [, setErrorMessage] = errorMessageHook;
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sessionDays, setSessionDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/users/`, authorization());
      setUsers(response.data);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setShowBar(true);
    setHeaderTitle('Utilisateurs');
    loadUsers();
    // loadUsers is stable for the lifetime of this screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setHeaderTitle, setShowBar]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => `${user.name} ${user.surname} ${user.email}`.toLowerCase().includes(query));
  }, [search, users]);

  const adminCount = users.filter((user) => user.role_id === 0).length;

  const loadSessionMonth = async (date) => {
    if (!selectedUser) return;
    setHistoryLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/${selectedUser.id}/userseance_days?date=${formatDate(date)}`,
        authorization(),
      );
      setSessionDays(response.data.map((day) => ({
        id: formatDate(day),
        title: 'Séance enregistrée',
        start: formatDate(day),
        allDay: true,
        backgroundColor: '#1f6b45',
        borderColor: '#1f6b45',
      })));
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || "Impossible de charger l’historique de cet utilisateur.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadSessionDay = async (date) => {
    if (!selectedUser) return;
    const normalizedDate = formatDate(date);
    setSelectedDate(normalizedDate);
    setDetailLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/${selectedUser.id}/userseance?date=${normalizedDate}`,
        authorization(),
      );
      setAttempts(response.data);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || "Impossible de charger le détail de cette séance.");
    } finally {
      setDetailLoading(false);
    }
  };

  const openHistory = (user) => {
    setSelectedUser(user);
    setSessionDays([]);
    setSelectedDate(null);
    setAttempts([]);
  };

  const closeHistory = () => {
    setSelectedUser(null);
    setSessionDays([]);
    setSelectedDate(null);
    setAttempts([]);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1180, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 850 }}>Utilisateurs</Typography>
          <Typography color="text.secondary">Cliquez sur un utilisateur pour consulter l’historique de ses séances.</Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} variant="outlined" onClick={loadUsers} disabled={loading}>Actualiser</Button>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        <StatCard icon={<PeopleOutlineIcon />} value={users.length} label="comptes au total" />
        <StatCard icon={<PersonOutlineIcon />} value={users.length - adminCount} label="adhérents" />
        <StatCard icon={<AdminPanelSettingsOutlinedIcon />} value={adminCount} label="administrateurs" />
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un nom ou un e-mail"
            size="small"
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          />
        </Box>

        {loading ? (
          <Box sx={{ minHeight: 280, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <PeopleOutlineIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography sx={{ mt: 1, fontWeight: 700 }}>Aucun utilisateur trouvé</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8faf9' }}>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>E-mail</TableCell>
                  <TableCell align="right">Rôle</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    onClick={() => openHistory(user)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openHistory(user);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Consulter l’historique des séances de ${`${user.name || ''} ${user.surname || ''}`.trim() || user.email}`}
                    sx={{ cursor: 'pointer', '&:focus-visible': { outline: '3px solid #1f6b45', outlineOffset: -3 } }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 38, height: 38, bgcolor: user.role_id === 0 ? '#1f6b45' : '#dce9e1', color: user.role_id === 0 ? 'white' : '#1f6b45', fontSize: 14, fontWeight: 800 }}>
                          {initials(user)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{`${user.name || ''} ${user.surname || ''}`.trim() || 'Utilisateur'}</Typography>
                          <Typography variant="caption" color="text.secondary">ID {user.id} · Voir les séances</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell align="right">
                      <Chip
                        size="small"
                        label={user.role_id === 0 ? 'Administrateur' : 'Adhérent'}
                        sx={{ fontWeight: 700, color: user.role_id === 0 ? '#155b39' : '#5b6470', backgroundColor: user.role_id === 0 ? '#dff4e8' : '#edf0f2' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={Boolean(selectedUser)} onClose={closeHistory} fullWidth maxWidth="lg" aria-labelledby="user-history-title">
        {selectedUser && (
          <>
            <DialogTitle id="user-history-title" sx={{ pr: 7, fontWeight: 800 }}>
              Historique de {`${selectedUser.name || ''} ${selectedUser.surname || ''}`.trim() || selectedUser.email}
              <Button aria-label="Fermer" onClick={closeHistory} sx={{ position: 'absolute', right: 12, top: 12, minWidth: 0, p: 1, color: 'text.secondary' }}>
                <CloseIcon />
              </Button>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.45fr) minmax(280px, .85fr)' }, gap: 2.5, alignItems: 'start' }}>
                <Paper variant="outlined" sx={{ position: 'relative', p: { xs: 1, sm: 2 }, borderRadius: 2 }}>
                  {historyLoading && <Box sx={{ position: 'absolute', inset: 0, zIndex: 2, display: 'grid', placeItems: 'center', backgroundColor: 'rgba(255,255,255,.72)' }}><CircularProgress /></Box>}
                  <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={sessionDays}
                    datesSet={(info) => loadSessionMonth(info.view.currentStart)}
                    eventClick={(info) => loadSessionDay(info.event.start)}
                    dateClick={(info) => loadSessionDay(info.date)}
                    firstDay={1}
                    height="auto"
                    buttonText={{ today: "Aujourd'hui" }}
                  />
                </Paper>

                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
                      <CalendarMonthIcon sx={{ color: '#1f6b45' }} />
                      <Box>
                        <Typography sx={{ fontWeight: 800 }}>
                          {selectedDate ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(`${selectedDate}T12:00:00`)) : 'Détail de la séance'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Sélectionnez une journée du calendrier.</Typography>
                      </Box>
                    </Stack>

                    {detailLoading ? (
                      <Box sx={{ py: 6, display: 'grid', placeItems: 'center' }}><CircularProgress size={30} /></Box>
                    ) : !selectedDate ? (
                      <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Aucune journée sélectionnée.</Typography>
                    ) : attempts.length === 0 ? (
                      <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Aucune voie enregistrée ce jour-là.</Typography>
                    ) : (
                      <Stack spacing={1.25}>
                        <Stack direction="row" spacing={1}>
                          <Chip size="small" label={`${attempts.length} voie${attempts.length > 1 ? 's' : ''}`} />
                          <Chip size="small" icon={<CheckCircleOutlineIcon />} label={`${attempts.filter((attempt) => attempt.top === 100).length} réussie${attempts.filter((attempt) => attempt.top === 100).length > 1 ? 's' : ''}`} sx={{ backgroundColor: '#dff4e8', color: '#155b39' }} />
                        </Stack>
                        {attempts.map((attempt) => (
                          <Paper key={attempt.id} variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
                            <Stack direction="row" spacing={1.25} alignItems="center">
                              <Box sx={{ width: 30, height: 30, flexShrink: 0, borderRadius: 1, backgroundColor: attempt.voie?.color || '#ddd', border: '2px solid white', boxShadow: '0 0 0 1px rgba(0,0,0,.15)' }} />
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 800 }}>{formatDifficulty(attempt.voie?.difficulty)} · couloir {attempt.voie?.couloir_id}</Typography>
                                <Typography variant="body2" color="text.secondary">{attempt.en_tete ? 'En tête' : 'Moulinette'} · {attempt.top === 100 ? 'réussie' : `${attempt.top}% atteint`}{attempt.pause ? ` · ${attempt.pause} pause${attempt.pause > 1 ? 's' : ''}` : ''}</Typography>
                              </Box>
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}

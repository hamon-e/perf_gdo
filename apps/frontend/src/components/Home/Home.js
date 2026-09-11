import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import { ACCESS_TOKEN_NAME, API_BASE_URL } from '../../constants/apiConstants';
import { useContextObject } from '../Context/Context';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';

const emptyDashboard = {
  max_lvl: 0,
  tete_ratio: 0,
  coverage: 0,
  coverage_dalle: 0,
  coverage_devers: 0,
  coverage_diedre: 0,
  coverage_9m: 0,
  nbr_of_seances: 0,
};

function formatDifficulty(difficulty) {
  if (!difficulty) return '—';
  const floor = Math.floor(difficulty);
  const decimal = difficulty - floor;
  const suffixes = [[0.25, 'a'], [0.35, 'a+'], [0.5, 'b'], [0.6, 'b+'], [0.75, 'c'], [0.85, 'c+']];
  const closest = suffixes.reduce((best, candidate) => (
    Math.abs(candidate[0] - decimal) < Math.abs(best[0] - decimal) ? candidate : best
  ));
  return `${floor}${closest[1]}`;
}

function KpiCard({ icon, label, value, helper, loading }) {
  return (
    <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ color: '#1f6b45', mb: 1 }}>{icon}</Box>
        {loading ? (
          <>
            <Skeleton variant="text" sx={{ fontSize: '3.4rem', width: '55%' }} />
            <Skeleton variant="text" width="45%" />
            <Skeleton variant="text" width="60%" />
          </>
        ) : (
          <>
            <Typography variant="h4" sx={{ fontWeight: 850 }}>{value}</Typography>
            <Typography sx={{ fontWeight: 700 }}>{label}</Typography>
            <Typography variant="body2" color="text.secondary">{helper}</Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Home(props) {
  const { headerTitleHook, showBarHook, userHook, errorMessageHook } = useContextObject();
  const [, setHeaderTitle] = headerTitleHook;
  const [, setShowBar] = showBarHook;
  const [user] = userHook;
  const [, setErrorMessage] = errorMessageHook;
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setShowBar(true);
    setHeaderTitle('Tableau de bord');
  }, [setHeaderTitle, setShowBar]);

  useEffect(() => {
    let active = true;
    axios.get(`${API_BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    }).then((response) => {
      if (active) setDashboard(response.data);
    }).catch((error) => {
      if (active) setErrorMessage(error.response?.data?.detail || 'Impossible de charger le tableau de bord.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [setErrorMessage]);

  const profiles = useMemo(() => [
    { label: 'Dalle', value: dashboard.coverage_dalle },
    { label: 'Dévers', value: dashboard.coverage_devers },
    { label: 'Dièdre', value: dashboard.coverage_diedre },
    { label: 'Mur de 9 m', value: dashboard.coverage_9m },
  ], [dashboard]);
  const suggestedProfile = profiles.reduce((lowest, profile) => profile.value < lowest.value ? profile : lowest, profiles[0]);

  return (
    <Box sx={{ width: '100%', maxWidth: 1180, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3.5 }}>
        <Box>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 850 }}>
            Bonjour{user?.name && user.name !== 'User' ? ` ${user.name}` : ''} 👋
          </Typography>
          <Typography color="text.secondary">Voici où vous en êtes ce mois-ci.</Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => props.history.push('/home')}
          sx={{ minHeight: 48, backgroundColor: '#1f6b45' }}
        >
          Enregistrer une séance
        </Button>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid item xs={6} md={3}>
          <KpiCard loading={loading} icon={<CalendarMonthIcon />} label="Séances" value={dashboard.nbr_of_seances} helper="ce mois-ci" />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiCard loading={loading} icon={<EmojiEventsOutlinedIcon />} label="Niveau max" value={formatDifficulty(dashboard.max_lvl)} helper="voie terminée" />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiCard loading={loading} icon={<ExploreOutlinedIcon />} label="Mur exploré" value={`${Math.round(dashboard.coverage * 100)}%`} helper="sur le plan actuel" />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiCard loading={loading} icon={<VerticalAlignTopIcon />} label="En tête" value={`${Math.round(dashboard.tete_ratio * 100)}%`} helper="de vos essais" />
        </Grid>

        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Typography variant="h6" sx={{ fontWeight: 750 }}>Exploration du mur</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>Voies réussies par profil sur la version actuelle.</Typography>
              <Stack spacing={2.5}>
                {profiles.map((profile) => (
                  <Box key={profile.label}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                      <Typography sx={{ fontWeight: 650 }}>{profile.label}</Typography>
                      {loading
                        ? <Skeleton variant="text" width={40} />
                        : <Typography color="text.secondary">{Math.round(profile.value * 100)}%</Typography>}
                    </Stack>
                    <LinearProgress
                      variant={loading ? 'indeterminate' : 'determinate'}
                      value={loading ? undefined : profile.value * 100}
                      aria-label={`${profile.label} : ${Math.round(profile.value * 100)} %`}
                      sx={{ height: 10, borderRadius: 5, backgroundColor: '#e4ebe7', '& .MuiLinearProgress-bar': { borderRadius: 5 } }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ height: '100%', overflow: 'hidden', color: 'white', borderRadius: 3, backgroundColor: '#18251f' }}>
            <Box component="img" src="/gdo.png" alt="Plan du mur d'escalade" sx={{ width: '100%', height: 205, objectFit: 'cover', opacity: 0.62 }} />
            <CardContent sx={{ p: 3 }}>
              <Typography variant="overline" sx={{ color: '#72d49e', fontWeight: 800 }}>Suggestion</Typography>
              {loading ? (
                <>
                  <Skeleton variant="text" sx={{ fontSize: '1.75rem', maxWidth: 240, bgcolor: 'rgba(255,255,255,.18)' }} />
                  <Skeleton variant="text" width="90%" sx={{ bgcolor: 'rgba(255,255,255,.18)' }} />
                  <Skeleton variant="text" width="75%" sx={{ mb: 2.5, bgcolor: 'rgba(255,255,255,.18)' }} />
                </>
              ) : (
                <>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>Explorez le secteur {suggestedProfile.label}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,.72)', mt: 1, mb: 2.5 }}>
                    C’est actuellement la zone la moins parcourue de votre carnet.
                  </Typography>
                </>
              )}
              <Button variant="contained" onClick={() => props.history.push('/home')} sx={{ color: '#10251b', backgroundColor: '#72d49e' }}>
                Voir les voies
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default withRouter(Home);

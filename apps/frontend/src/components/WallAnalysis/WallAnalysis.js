import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useHistory, useLocation } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';

import { ACCESS_TOKEN_NAME, API_BASE_URL } from '../../constants/apiConstants';
import { useContextObject } from '../Context/Context';
import { formatDifficulty } from '../ListVoie/ListVoie';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

ChartJS.register(BarElement, CategoryScale, Legend, LinearScale, Tooltip);

const authorization = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
});

function StatCard({ icon, value, label, helper, tint = '#1f6b45' }) {
  return (
    <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ color: tint, mb: 1 }}>{icon}</Box>
        <Typography variant="h4" sx={{ fontWeight: 850, letterSpacing: '-.04em' }}>{value}</Typography>
        <Typography sx={{ fontWeight: 750 }}>{label}</Typography>
        <Typography variant="body2" color="text.secondary">{helper}</Typography>
      </CardContent>
    </Card>
  );
}

function sectorForLane(lane) {
  if (lane <= 3) return 'Plexi + toit';
  if (lane <= 8) return 'Vérin gauche';
  if (lane <= 19) return 'Dévers';
  if (lane <= 22) return 'Vérin droit';
  if (lane <= 27) return 'Dalle';
  return 'Mur de 9 m';
}

export default function WallAnalysis() {
  const history = useHistory();
  const location = useLocation();
  const { headerTitleHook, showBarHook, errorMessageHook } = useContextObject();
  const [, setHeaderTitle] = headerTitleHook;
  const [, setShowBar] = showBarHook;
  const [, setErrorMessage] = errorMessageHook;
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  const versionId = useMemo(() => new URLSearchParams(location.search).get('version'), [location.search]);

  useEffect(() => {
    setShowBar(true);
    setHeaderTitle('Analyse du mur');
  }, [setHeaderTitle, setShowBar]);

  useEffect(() => {
    if (!versionId) {
      history.replace('/listevoies');
      return undefined;
    }
    let live = true;
    setLoading(true);
    axios.get(`${API_BASE_URL}/wall-analysis?version_id=${versionId}`, authorization())
      .then((response) => { if (live) setAnalysis(response.data); })
      .catch((error) => {
        if (live) setErrorMessage(error.response?.data?.detail || "Impossible de charger l'analyse du mur.");
      })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [history, setErrorMessage, versionId]);

  const gradeData = useMemo(() => ({
    labels: analysis?.grade_distribution.map((item) => formatDifficulty(item.difficulty)) || [],
    datasets: [{
      label: 'Voies',
      data: analysis?.grade_distribution.map((item) => item.count) || [],
      backgroundColor: '#1f6b45',
      hoverBackgroundColor: '#f2a65a',
      borderRadius: 7,
      maxBarThickness: 42,
    }],
  }), [analysis]);

  const sectorData = useMemo(() => {
    const groups = (analysis?.lane_distribution || []).reduce((result, item) => {
      const sector = sectorForLane(item.lane);
      result[sector] = (result[sector] || 0) + item.count;
      return result;
    }, {});
    return {
      labels: Object.keys(groups),
      datasets: [{
        data: Object.values(groups),
        backgroundColor: ['#1f6b45', '#5da878', '#f2a65a', '#6787b7', '#b06c8c', '#9c8c55'],
        borderWidth: 0,
        hoverOffset: 5,
      }],
    };
  }, [analysis]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#52615a', font: { weight: '600' } } },
      y: { beginAtZero: true, ticks: { precision: 0, color: '#52615a' }, grid: { color: '#edf1ee' } },
    },
  };
  const climbCoverage = analysis?.total_routes ? Math.round((analysis.unique_climbed_routes / analysis.total_routes) * 100) : 0;
  const successRate = analysis?.climbs ? Math.round((analysis.tops / analysis.climbs) * 100) : 0;

  return (
    <Box sx={{ width: '100%', maxWidth: 1240, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3.5 }}>
        <Box>
          <Button startIcon={<ArrowBackIcon />} onClick={() => history.push('/listevoies')} sx={{ mb: 1, ml: -1, color: 'text.secondary' }}>Retour aux voies</Button>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 850 }}>Analyse du mur</Typography>
          <Typography color="text.secondary">Vue d'ensemble de l'équipement et de l'activité sur cette version du mur.</Typography>
        </Box>
        {analysis && <Paper variant="outlined" sx={{ px: 2.25, py: 1.25, alignSelf: { sm: 'flex-end' }, borderRadius: 2.5, backgroundColor: '#f7fbf8' }}>
          <Typography variant="caption" color="text.secondary">VERSION ANALYSÉE</Typography>
          <Typography sx={{ fontWeight: 800 }}>Mur #{analysis.version_id}</Typography>
        </Paper>}
      </Stack>

      {loading ? (
        <Box sx={{ minHeight: 420, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
      ) : analysis && (
        <>
          <Grid container spacing={2.25}>
            <Grid item xs={6} md={3}><StatCard icon={<RouteOutlinedIcon />} value={analysis.total_routes} label="Voies équipées" helper={`${analysis.equipped_lanes} couloirs occupés`} /></Grid>
            <Grid item xs={6} md={3}><StatCard icon={<TrendingUpIcon />} value={formatDifficulty(analysis.average_difficulty)} label="Niveau moyen" helper={`de ${formatDifficulty(analysis.lowest_difficulty)} à ${formatDifficulty(analysis.highest_difficulty)}`} tint="#e28d39" /></Grid>
            <Grid item xs={6} md={3}><StatCard icon={<EmojiEventsOutlinedIcon />} value={analysis.climbs} label="Passages enregistrés" helper={`${analysis.unique_climbed_routes} voies déjà grimpées`} tint="#6787b7" /></Grid>
            <Grid item xs={6} md={3}><StatCard icon={<CheckCircleOutlineIcon />} value={`${successRate}%`} label="Taux de réussite" helper={`${analysis.tops} réussites au total`} tint="#9b5b7c" /></Grid>
          </Grid>

          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={8}>
              <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Répartition par niveau</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Nombre de voies pour chaque cotation.</Typography>
                  <Box sx={{ height: 320 }}><Bar data={gradeData} options={chartOptions} /></Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Répartition par secteur</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Où se trouvent les voies du mur.</Typography>
                  <Box sx={{ height: 250 }}><Doughnut data={sectorData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 13 } } } }} /></Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={7}>
              <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Voies les plus grimpées</Typography>
                    <Typography variant="body2" color="text.secondary">tous passages confondus</Typography>
                  </Stack>
                  {analysis.top_routes.some((route) => route.climbs > 0) ? (
                    <Stack divider={<Divider flexItem />}>
                      {analysis.top_routes.map((route, index) => (
                        <Stack key={route.route_id} direction="row" alignItems="center" spacing={1.5} sx={{ py: 1.5 }}>
                          <Typography sx={{ width: 22, fontWeight: 850, color: 'text.secondary' }}>{index + 1}</Typography>
                          <Box sx={{ width: 28, height: 28, borderRadius: 1.5, backgroundColor: route.color, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.14)' }} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 800 }}>Voie #{route.route_id} · {formatDifficulty(route.difficulty)}</Typography>
                            <Typography variant="body2" color="text.secondary">Couloir {route.couloir_id} · {sectorForLane(route.couloir_id)}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontWeight: 850 }}>{route.climbs} passage{route.climbs > 1 ? 's' : ''}</Typography>
                            <Typography variant="body2" color="text.secondary">{route.success_rate}% réussis</Typography>
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  ) : <Typography color="text.secondary" sx={{ py: 7, textAlign: 'center' }}>Les passages apparaîtront ici dès les premières séances.</Typography>}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3, background: 'linear-gradient(145deg, #f7fbf8, #fff)' }}>
                <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Couverture de l'activité</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>Part des voies que les grimpeurs ont déjà essayées.</Typography>
                  <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1.5 }}>
                    <Typography variant="h3" sx={{ fontWeight: 850, color: '#1f6b45' }}>{climbCoverage}%</Typography>
                    <Typography color="text.secondary">des voies explorées</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={climbCoverage} sx={{ height: 11, borderRadius: 10, backgroundColor: '#dfe9e2', '& .MuiLinearProgress-bar': { borderRadius: 10, backgroundColor: '#1f6b45' } }} />
                  <Paper variant="outlined" sx={{ mt: 3, p: 2, borderRadius: 2.5, backgroundColor: 'rgba(255,255,255,.7)' }}>
                    <Typography variant="body2" color="text.secondary">Prochaine opportunité</Typography>
                    <Typography sx={{ mt: .4, fontWeight: 750 }}>{analysis.total_routes - analysis.unique_climbed_routes > 0 ? `${analysis.total_routes - analysis.unique_climbed_routes} voies restent à découvrir.` : 'Toutes les voies ont déjà été explorées !'}</Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}

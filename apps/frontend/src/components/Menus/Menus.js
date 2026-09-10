import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ACCESS_TOKEN_NAME, API_BASE_URL } from '../../constants/apiConstants';
import { useContextObject } from '../Context/Context';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

const ranges = [
  { value: 12, label: '12 mois' },
  { value: 6, label: '6 mois' },
  { value: 1, label: 'Ce mois' },
];

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } },
  scales: { y: { beginAtZero: true } },
};

function formatDifficulty(difficulty) {
  if (!difficulty) return '—';
  const floor = Math.floor(difficulty);
  const suffixes = [
    [0.25, 'a'], [0.35, 'a+'], [0.5, 'b'], [0.6, 'b+'], [0.75, 'c'], [0.85, 'c+'],
  ];
  const decimal = difficulty - floor;
  const closest = suffixes.reduce((best, candidate) => (
    Math.abs(candidate[0] - decimal) < Math.abs(best[0] - decimal) ? candidate : best
  ));
  return `${floor}${closest[1]}`;
}

function StatCard({ icon, label, value, helper }) {
  return (
    <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ color: '#1f6b45', mb: 1 }}>{icon}</Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>{value}</Typography>
        <Typography sx={{ fontWeight: 650 }}>{label}</Typography>
        <Typography variant="body2" color="text.secondary">{helper}</Typography>
      </CardContent>
    </Card>
  );
}

export default function Progression() {
  const { headerTitleHook, showBarHook, errorMessageHook } = useContextObject();
  const [, setHeaderTitle] = headerTitleHook;
  const [, setShowBar] = showBarHook;
  const [, setErrorMessage] = errorMessageHook;
  const [months, setMonths] = useState(12);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setShowBar(true);
    setHeaderTitle('Ma progression');
  }, [setHeaderTitle, setShowBar]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    axios.get(`${API_BASE_URL}/progression?months=${months}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    }).then((response) => {
      if (active) setPoints(response.data);
    }).catch((error) => {
      if (active) setErrorMessage(error.response?.data?.detail || 'Impossible de charger la progression.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [months, setErrorMessage]);

  const stats = useMemo(() => {
    const attempts = points.reduce((sum, point) => sum + point.attempts, 0);
    const tops = points.reduce((sum, point) => sum + point.tops, 0);
    const sessions = points.reduce((sum, point) => sum + point.sessions, 0);
    const maxLevel = Math.max(0, ...points.map((point) => point.max_level));
    const leadAttempts = points.reduce((sum, point) => sum + point.lead_ratio * point.attempts, 0);
    return {
      attempts,
      tops,
      sessions,
      maxLevel,
      leadRatio: attempts ? Math.round((leadAttempts / attempts) * 100) : 0,
      successRate: attempts ? Math.round((tops / attempts) * 100) : 0,
    };
  }, [points]);

  const labels = points.map((point) => new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit' }).format(new Date(point.period)));
  const levelData = {
    labels,
    datasets: [{
      label: 'Meilleure cotation réussie',
      data: points.map((point) => point.max_level),
      borderColor: '#1f6b45',
      backgroundColor: 'rgba(31, 107, 69, .16)',
      fill: true,
      tension: 0.3,
    }],
  };
  const volumeData = {
    labels,
    datasets: [
      { label: 'Essais', data: points.map((point) => point.attempts), backgroundColor: '#f2a65a' },
      { label: 'Réussites', data: points.map((point) => point.tops), backgroundColor: '#1f6b45' },
    ],
  };
  const styleData = {
    labels: ['En tête', 'Moulinette'],
    datasets: [{ data: [stats.leadRatio, 100 - stats.leadRatio], backgroundColor: ['#1f6b45', '#dbe5df'], borderWidth: 0 }],
  };
  const hasActivity = stats.attempts > 0;

  return (
    <Box sx={{ width: '100%', maxWidth: 1180, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 800 }}>Votre progression</Typography>
          <Typography color="text.secondary">Des indicateurs calculés à partir de vos séances enregistrées.</Typography>
        </Box>
        <ButtonGroup aria-label="Période affichée" size="small">
          {ranges.map((range) => (
            <Button
              key={range.value}
              variant={months === range.value ? 'contained' : 'outlined'}
              onClick={() => setMonths(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </ButtonGroup>
      </Stack>

      {loading ? (
        <Box sx={{ minHeight: 360, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
      ) : (
        <>
          <Grid container spacing={2.5}>
            <Grid item xs={6} md={3}>
              <StatCard icon={<CalendarMonthIcon />} label="Séances" value={stats.sessions} helper="jours de grimpe" />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={<CheckCircleOutlineIcon />} label="Réussites" value={stats.tops} helper={`${stats.successRate}% des essais`} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={<LeaderboardIcon />} label="Niveau max" value={formatDifficulty(stats.maxLevel)} helper="voie terminée" />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={<TrendingUpIcon />} label="En tête" value={`${stats.leadRatio}%`} helper="de vos essais" />
            </Grid>
          </Grid>

          {!hasActivity && (
            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
              Enregistrez votre première séance pour voir apparaître votre progression.
            </Alert>
          )}

          <Grid container spacing={2.5} sx={{ mt: 0 }}>
            <Grid item xs={12} md={8}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 750, mb: 2 }}>Évolution du niveau</Typography>
                  <Box sx={{ height: 310 }}><Line options={chartOptions} data={levelData} /></Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 750, mb: 2 }}>Style de grimpe</Typography>
                  <Box sx={{ height: 280 }}><Doughnut options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} data={styleData} /></Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 750, mb: 2 }}>Volume de grimpe</Typography>
                  <Box sx={{ height: 300 }}><Bar options={chartOptions} data={volumeData} /></Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}

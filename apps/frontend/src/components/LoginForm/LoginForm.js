import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../../constants/apiConstants';
import { withRouter, Redirect } from 'react-router-dom';
import { useContextObject } from '../Context/Context';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import TerrainIcon from '@mui/icons-material/Terrain';
import qs from 'qs';

function LoginForm(props) {
  const { connectedStateHook, errorMessageHook, showBarHook, isAdminHook, userHook } = useContextObject();
  const [connected, setConnected] = connectedStateHook;
  const [, setErrorMessage] = errorMessageHook;
  const [, setShowBar] = showBarHook;
  const [, setIsAdmin] = isAdminHook;
  const [, setUser] = userHook;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => setShowBar(false), [setShowBar]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setErrorMessage('Renseignez votre adresse e-mail et votre mot de passe.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/token`, qs.stringify({ username: email, password }));
      localStorage.setItem(ACCESS_TOKEN_NAME, response.data.access_token);
      const currentUser = await axios.get(`${API_BASE_URL}/me/`, {
        headers: { Authorization: `Bearer ${response.data.access_token}` },
      });
      setConnected(true);
      setUser(currentUser.data);
      setIsAdmin(currentUser.data.role_id === 0);
      props.history.push('/dashboard');
    } catch (error) {
      setErrorMessage(error.response?.status === 401
        ? 'Adresse e-mail ou mot de passe incorrect.'
        : error.response?.data?.detail || 'Connexion impossible. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  if (connected) return <Redirect to="/dashboard" />;

  return (
    <Box sx={{ minHeight: ['100vh', '100dvh'], display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' }, backgroundColor: '#f6f7fb' }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 8,
          color: 'white',
          backgroundImage: 'linear-gradient(180deg, rgba(20,37,29,.18), rgba(20,37,29,.92)), url(/gdo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 900, maxWidth: 560, lineHeight: 1.05 }}>
          Votre carnet de grimpe, voie après voie.
        </Typography>
        <Typography variant="h6" sx={{ mt: 2, maxWidth: 520, opacity: 0.84 }}>
          Enregistrez vos séances, suivez votre progression et préparez votre prochain objectif.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', placeItems: 'center', p: { xs: 2, sm: 5 } }}>
        <Paper elevation={0} sx={{ width: '100%', maxWidth: 440, p: { xs: 3, sm: 5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Stack component="form" onSubmit={handleSubmit} spacing={3}>
            <Box>
              <TerrainIcon sx={{ color: '#1f6b45', fontSize: 38 }} />
              <Typography variant="h4" component="h1" sx={{ mt: 1, fontWeight: 850 }}>Bon retour</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>Connectez-vous à votre espace GDO.</Typography>
            </Box>
            <TextField
              label="Adresse e-mail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              fullWidth
            />
            <TextField
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              fullWidth
            />
            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ minHeight: 48, backgroundColor: '#1f6b45' }}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Se connecter'}
            </Button>
            <Button onClick={() => props.history.push('/signup')} sx={{ color: '#1f6b45' }}>
              Créer un compte
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default withRouter(LoginForm);

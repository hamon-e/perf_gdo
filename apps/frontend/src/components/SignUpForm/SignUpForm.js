import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/apiConstants';
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

function SignUpForm(props) {
  const { connectedStateHook, errorMessageHook, showBarHook } = useContextObject();
  const [connected] = connectedStateHook;
  const [, setErrorMessage] = errorMessageHook;
  const [, setShowBar] = showBarHook;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => setShowBar(false), [setShowBar]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password.length < 8) {
      setErrorMessage('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/signup`, { email, password });
      props.history.push('/login');
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Création du compte impossible.');
    } finally {
      setLoading(false);
    }
  };

  if (connected) return <Redirect to="/home" />;

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' }, backgroundColor: '#f6f7fb' }}>
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
          Commencez votre carnet de grimpe.
        </Typography>
        <Typography variant="h6" sx={{ mt: 2, maxWidth: 520, opacity: 0.84 }}>
          Retrouvez le mur, notez chaque voie et observez votre progression séance après séance.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', placeItems: 'center', p: { xs: 2, sm: 5 } }}>
        <Paper elevation={0} sx={{ width: '100%', maxWidth: 440, p: { xs: 3, sm: 5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Stack component="form" onSubmit={handleSubmit} spacing={2.5}>
            <Box>
              <TerrainIcon sx={{ color: '#1f6b45', fontSize: 38 }} />
              <Typography variant="h4" component="h1" sx={{ mt: 1, fontWeight: 850 }}>Créer votre carnet</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>Quelques secondes suffisent pour commencer.</Typography>
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
              helperText="8 caractères minimum"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
              fullWidth
            />
            <TextField
              label="Confirmer le mot de passe"
              type="password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              autoComplete="new-password"
              error={Boolean(passwordConfirm && password !== passwordConfirm)}
              helperText={passwordConfirm && password !== passwordConfirm ? 'Les mots de passe ne correspondent pas' : ' '}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ minHeight: 48, backgroundColor: '#1f6b45' }}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Créer mon compte'}
            </Button>
            <Button onClick={() => props.history.push('/login')} sx={{ color: '#1f6b45' }}>J’ai déjà un compte</Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default withRouter(SignUpForm);

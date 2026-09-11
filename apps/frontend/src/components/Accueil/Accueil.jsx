import React, { useEffect } from 'react';
import withRouter from '../../utils/withRouter';
import { useContextObject } from '../Context/Context';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TerrainIcon from '@mui/icons-material/Terrain';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function Accueil(props) {
  const { showBarHook, openHook } = useContextObject();
  const [, setShowBar] = showBarHook;
  const [, setOpen] = openHook;

  useEffect(() => {
    setShowBar(false);
    setOpen(false);
  }, [setOpen, setShowBar]);

  return (
    <Box
      sx={{
        minHeight: ['100vh', '100dvh'],
        display: 'flex',
        alignItems: 'flex-end',
        p: { xs: 3, sm: 6, md: 10 },
        color: 'white',
        backgroundImage: 'linear-gradient(90deg, rgba(15,30,23,.96) 0%, rgba(15,30,23,.78) 42%, rgba(15,30,23,.18) 100%), url(/gdo.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Stack spacing={3} sx={{ width: '100%', maxWidth: 680, mb: { xs: 4, md: 7 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TerrainIcon sx={{ fontSize: 38, color: '#72d49e' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1 }}>GDO CLIMBING</Typography>
        </Stack>
        <Typography variant="h1" sx={{ fontSize: { xs: '3rem', md: '5.5rem' }, fontWeight: 900, lineHeight: 0.98 }}>
          Grimpez. Notez. Progressez.
        </Typography>
        <Typography variant="h6" sx={{ maxWidth: 570, color: 'rgba(255,255,255,.78)', lineHeight: 1.6 }}>
          Votre carnet numérique pour enregistrer chaque voie, retrouver vos séances et visualiser vos progrès.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={() => props.history.push('/login')}
            sx={{ minHeight: 52, px: 3, color: '#10251b', backgroundColor: '#72d49e', '&:hover': { backgroundColor: '#8ce0af' } }}
          >
            Se connecter
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => props.history.push('/signup')}
            sx={{ minHeight: 52, px: 3, color: 'white', borderColor: 'rgba(255,255,255,.55)', '&:hover': { borderColor: 'white' } }}
          >
            Créer un compte
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default withRouter(Accueil);

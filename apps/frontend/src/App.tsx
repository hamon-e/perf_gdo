import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';

import AlertComponent from './components/AlertComponent/AlertComponent';
import MobileNavigation from './components/AppNavigation/MobileNavigation';
import SideNavigation, { DRAWER_WIDTH } from './components/AppNavigation/SideNavigation';
import { adminItems, adminMenuItems, memberItems } from './components/AppNavigation/navigationItems';
import AppRoutes from './components/AppRoutes/AppRoutes';
import { useContextObject } from './components/Context/Context';
import Header from './components/Header/Header';
import { ACCESS_TOKEN_NAME } from './constants/apiConstants';

interface NavigationLayoutProps {
  desktop: boolean;
  drawerOpen: boolean;
}

interface MainProps extends NavigationLayoutProps {
  navigationVisible: boolean;
}

const Main = styled('main', {
  shouldForwardProp: (prop) => !['drawerOpen', 'desktop', 'navigationVisible'].includes(String(prop)),
})<MainProps>(({ theme, drawerOpen, desktop, navigationVisible }) => ({
  flexGrow: 1,
  minWidth: 0,
  minHeight: ['100vh', '100dvh'],
  paddingBottom: !desktop && navigationVisible ? 72 : 0,
  backgroundColor: '#f6f7fb',
  transition: theme.transitions.create('margin-left'),
  marginLeft: desktop && navigationVisible ? (drawerOpen ? 0 : -DRAWER_WIDTH) : 0,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => !['drawerOpen', 'desktop'].includes(String(prop)),
})<NavigationLayoutProps>(({ theme, drawerOpen, desktop }) => ({
  background: 'linear-gradient(120deg, #18251f 0%, #24543d 100%)',
  boxShadow: '0 6px 24px rgba(24, 37, 31, 0.18)',
  transition: theme.transitions.create(['margin-left', 'width']),
  ...(desktop && drawerOpen && {
    width: `calc(100% - ${DRAWER_WIDTH}px)`,
    marginLeft: DRAWER_WIDTH,
  }),
}));

function AppShell() {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const {
    showBarHook,
    openHook,
    errorMessageHook,
    isAdminHook,
    headerTitleHook,
  } = useContextObject();
  const [errorMessage, updateErrorMessage] = errorMessageHook;
  const [isAdmin] = isAdminHook;
  const [showBar] = showBarHook;
  const [open, setOpen] = openHook;
  const [headerTitle] = headerTitleHook;
  const drawerItems = desktop ? (isAdmin ? adminItems : memberItems) : adminMenuItems;

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_NAME);
    setOpen(false);
    navigate('/login', { replace: true });
    window.location.reload();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: ['100vh', '100dvh'] }}>
      <CssBaseline />
      {showBar && (
        <AppBar position="fixed" drawerOpen={open} desktop={desktop}>
          <Toolbar sx={{ minHeight: 64 }}>
            {(desktop || isAdmin) && (
              <IconButton
                color="inherit"
                aria-label="Ouvrir le menu"
                onClick={() => setOpen(true)}
                edge="start"
                sx={{ mr: 2, ...(desktop && open && { display: 'none' }) }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap component="h1" sx={{ fontWeight: 700 }}>
              {headerTitle || 'Climbing'}
            </Typography>
            {!desktop && (
              <IconButton color="inherit" aria-label="Déconnexion" onClick={logout} sx={{ ml: 'auto' }}>
                <LogoutIcon />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
      )}

      {showBar && (desktop || isAdmin) && (
        <SideNavigation
          desktop={desktop}
          items={drawerItems}
          onClose={() => setOpen(false)}
          onLogout={logout}
          open={open}
          pathname={location.pathname}
        />
      )}

      <Main role="main" drawerOpen={showBar && open} desktop={desktop} navigationVisible={showBar}>
        {showBar && <Toolbar />}
        <Header />
        <Box sx={{ width: '100%' }}><AppRoutes /></Box>
        <AlertComponent errorMessage={errorMessage} hideError={updateErrorMessage} />
      </Main>

      {showBar && !desktop && (
        <MobileNavigation
          pathname={location.pathname}
          onNavigate={(path) => navigate(path)}
          theme={theme}
        />
      )}
    </Box>
  );
}

export default function App() {
  return <Router><AppShell /></Router>;
}

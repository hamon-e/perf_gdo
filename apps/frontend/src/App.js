import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HistoryIcon from '@mui/icons-material/History';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

import PrivateRoute from './utils/PrivateRoute';
import Header from './components/Header/Header';
import LoginForm from './components/LoginForm/LoginForm';
import Products from './components/Products/Products';
import Menus from './components/Menus/Menus';
import Users from './components/Users/Users';
import UserGroups from './components/UserGroups/UserGroups';
import Accueil from './components/Accueil/Accueil.js';
import Annotate from './components/Annotate/Annotate';
import ListVoie from './components/ListVoie/ListVoie';
import SignUpForm from './components/SignUpForm/SignUpForm';
import Home from './components/Home/Home';
import Palmares from './components/Palmares/Palmares';
import Contest from './components/Contest/Contest';
import ContestRes from './components/Contest/ContestRes';
import CreateContest from './components/CreateContest/CreateContest';
import { useContextObject } from './components/Context/Context';
import AlertComponent from './components/AlertComponent/AlertComponent';
import { ACCESS_TOKEN_NAME } from './constants/apiConstants';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link as RouterLink,
  useHistory,
  useLocation,
} from 'react-router-dom';

const drawerWidth = 264;

const Main = styled('main', { shouldForwardProp: (prop) => !['drawerOpen', 'desktop', 'navigationVisible'].includes(prop) })(({
  theme,
  drawerOpen,
  desktop,
  navigationVisible,
}) => ({
  flexGrow: 1,
  minWidth: 0,
  minHeight: '100vh',
  paddingBottom: desktop ? 0 : 72,
  backgroundColor: '#f6f7fb',
  transition: theme.transitions.create('margin-left'),
  marginLeft: desktop && navigationVisible ? (drawerOpen ? 0 : -drawerWidth) : 0,
}));

const AppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== 'drawerOpen' && prop !== 'desktop' })(({
  theme,
  drawerOpen,
  desktop,
}) => ({
  background: 'linear-gradient(120deg, #18251f 0%, #24543d 100%)',
  boxShadow: '0 6px 24px rgba(24, 37, 31, 0.18)',
  transition: theme.transitions.create(['margin-left', 'width']),
  ...(desktop && drawerOpen && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  }),
}));

const memberItems = [
  { label: "Vue d'ensemble", path: '/dashboard', icon: HomeOutlinedIcon },
  { label: 'Ajouter une séance', path: '/home', icon: AddCircleOutlineIcon },
  { label: 'Historique', path: '/historique', icon: HistoryIcon },
  { label: 'Progression', path: '/maprogression', icon: TrendingUpIcon },
  { label: 'Palmarès', path: '/palmares', icon: EmojiEventsOutlinedIcon },
];

const adminItems = [
  { label: "Vue d'ensemble", path: '/dashboard', icon: HomeOutlinedIcon },
  { label: 'Ajouter une séance', path: '/home', icon: AddCircleOutlineIcon },
  { label: 'Historique', path: '/historique', icon: HistoryIcon },
  { label: 'Utilisateurs', path: '/users', icon: PeopleOutlineIcon },
  { label: 'Groupes', path: '/user-groups', icon: GroupsOutlinedIcon },
  { label: 'Voies', path: '/listevoies', icon: FormatListNumberedIcon },
];

function AppShell() {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const history = useHistory();
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
  const navigationItems = isAdmin ? adminItems : memberItems;

  const closeDrawerOnMobile = () => {
    if (!desktop) setOpen(false);
  };

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_NAME);
    setOpen(false);
    history.replace('/login');
    window.location.reload(false);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ minHeight: 72, px: 2.5 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1.4 }}>
            GDO
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            Carnet de grimpe
          </Typography>
        </Box>
        <IconButton aria-label="Fermer le menu" onClick={() => setOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1.5, py: 2 }}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={location.pathname === item.path}
                onClick={closeDrawerOnMobile}
                sx={{ borderRadius: 2, '&.Mui-selected': { color: '#1f6b45', backgroundColor: '#e5f3eb' } }}
              >
                <ListItemIcon sx={{ minWidth: 42, color: 'inherit' }}><Icon /></ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ mt: 'auto', p: 1.5 }}>
        <ListItemButton onClick={logout} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 42 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Déconnexion" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      {showBar && (
        <AppBar position="fixed" drawerOpen={open} desktop={desktop}>
          <Toolbar sx={{ minHeight: 64 }}>
            <IconButton
              color="inherit"
              aria-label="Ouvrir le menu"
              onClick={() => setOpen(true)}
              edge="start"
              sx={{ mr: 2, ...(desktop && open && { display: 'none' }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="h1" sx={{ fontWeight: 700 }}>
              {headerTitle || 'Climbing'}
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {showBar && (
        <Drawer
          variant={desktop ? 'persistent' : 'temporary'}
          anchor="left"
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Main role="main" drawerOpen={showBar && open} desktop={desktop} navigationVisible={showBar}>
        {showBar && <Toolbar />}
        <Header />
        <Box sx={{ width: '100%' }}>
          <Switch>
            <Route exact path="/"><Redirect to={localStorage.getItem(ACCESS_TOKEN_NAME) ? '/dashboard' : '/accueil'} /></Route>
            <Route path="/contest_classement"><ContestRes /></Route>
            <Route path="/contest"><Contest /></Route>
            <Route path="/createcontest"><CreateContest /></Route>
            <Route path="/login"><LoginForm /></Route>
            <Route path="/signup"><SignUpForm /></Route>
            <Route path="/accueil"><Accueil /></Route>
            <PrivateRoute path="/home"><Annotate /></PrivateRoute>
            <PrivateRoute path="/dashboard"><Home /></PrivateRoute>
            <PrivateRoute path="/maprogression"><Menus /></PrivateRoute>
            <PrivateRoute path="/maseance"><Redirect to="/home" /></PrivateRoute>
            <PrivateRoute path="/listevoies"><ListVoie /></PrivateRoute>
            <PrivateRoute path="/historique"><Products /></PrivateRoute>
            <PrivateRoute path="/palmares"><Palmares /></PrivateRoute>
            <PrivateRoute path="/users"><Users /></PrivateRoute>
            <PrivateRoute path="/user-groups"><UserGroups /></PrivateRoute>
            <Route><Redirect to="/dashboard" /></Route>
          </Switch>
        </Box>
        <AlertComponent errorMessage={errorMessage} hideError={updateErrorMessage} />
      </Main>

      {showBar && !desktop && (
        <BottomNavigation
          showLabels
          value={navigationItems.some((item) => item.path === location.pathname) ? location.pathname : false}
          onChange={(_, path) => history.push(path)}
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: theme.zIndex.appBar,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return <BottomNavigationAction key={item.path} label={item.label} value={item.path} icon={<Icon />} />;
          })}
        </BottomNavigation>
      )}
    </Box>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

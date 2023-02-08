import React,{ useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

import PrivateRoute from './utils/PrivateRoute';

import Header from './components/Header/Header';
import LoginForm from './components/LoginForm/LoginForm';
import Products from './components/Products/Products';
import ProductList from './components/ProductList/ProductList';
import Menus from './components/Menus/Menus';
import Users from './components/Users/Users';
import Accueil from './components/Accueil/Accueil.js';
import Restaurants from './components/Restaurants/Restaurants.js';
import ResetPassword from './components/ResetPassword/ResetPassword';
import Annotate from './components/Annotate/Annotate';
import ListVoie from './components/ListVoie/ListVoie';
import Crenaux from './components/Crenaux/Crenaux';
import Tryout from './components/Tryout/Tryout';
import SignUpForm from './components/SignUpForm/SignUpForm';
import Home from './components/Home/Home';
import History from './components/History/History';
import Palmares from './components/Palmares/Palmares';
import Palette from './components/Palette/Palette';

import {useContextObject} from './components/Context/Context';

import AlertComponent from './components/AlertComponent/AlertComponent';

import { ACCESS_TOKEN_NAME, API_BASE_URL } from './constants/apiConstants';



import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    //transition: theme.transitions.create('margin', {
      //easing: theme.transitions.easing.sharp,
      //duration: theme.transitions.duration.leavingScreen,
    //}),
       marginLeft: `-${drawerWidth}px`,
    ...(open && {
      //transition: theme.transitions.create('margin', {
        //easing: theme.transitions.easing.easeOut,
        //duration: theme.transitions.duration.enteringScreen,
      //}),
        marginLeft: 0,
    }),
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function PersistentDrawerLeft(props) {
  const theme = useTheme();

  const {showBarHook, openHook, errorMessageHook, languageStateHook, isAdminHook, headerTitleHook } = useContextObject();
  const [errorMessage, updateErrorMessage] = errorMessageHook;
  const [isAdmin, setIsAdmin] = isAdminHook;
  const [showBar, setShowBar] = showBarHook;
  const [open, setOpen] = openHook;

  const [headerTitle, setHeaderTitle] = headerTitleHook;

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

    function logout() {
        localStorage.setItem(ACCESS_TOKEN_NAME, '')

    window.location.reload(false);
    }

  return (

      <Router>
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} sx={{ ...(!showBar && { display: 'none' }) }} >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
              {headerTitle}

          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />

        <List>
          {['Home'].map((text, index) => (
          <Link to={"/" + text.toLowerCase().replace(/ /g,'') }>
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          </Link>
          ))}
          {!isAdmin && ['Ma Progression', 'Ma Seance', 'Historique', 'Palmares'].map((text, index) => (
          <Link to={"/" + text.toLowerCase().replace(/ /g,'') }>
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          </Link>
          ))}

          {isAdmin && ['Liste Voies', 'Statistiques', 'Users'].map((text, index) => (
          <Link to={"/" + text.toLowerCase().replace(/ /g,'') }>
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          </Link>
          ))}

            <ListItem key="Deconnection" disablePadding>
              <ListItemButton onClick={logout}>
                <ListItemIcon>
                    <MailIcon />
                </ListItemIcon>
                <ListItemText primary="Deconnection" />
              </ListItemButton>
            </ListItem>

        </List>
      </Drawer>
      <Main open={open}>
          {showBar && <DrawerHeader /> }
        <Header />

          <div className="d-flex align-items-center flex-column">
            <Switch>
              <Route path="/login">
                <LoginForm/>
              </Route>
              <Route path="/signup">
                <SignUpForm/>
              </Route>
              <Route path="/accueil">
                <Accueil/>
              </Route>

              <PrivateRoute path="/home">
                <Home/>
              </PrivateRoute>
              <PrivateRoute path="/inscriptions">
                <Products />
              </PrivateRoute>
              <PrivateRoute path="/maprogression">
                <Menus />
              </PrivateRoute>
              <PrivateRoute path="/maseance">
                    <Annotate />
              </PrivateRoute>
              <PrivateRoute path="/listevoies">
                    <ListVoie />
              </PrivateRoute>
              <PrivateRoute path="/historique">
                    <History />
              </PrivateRoute>
              <PrivateRoute path="/palmares">
                    <Palmares />
              </PrivateRoute>



              <PrivateRoute path="/users">
                    <Users />
              </PrivateRoute>

              <PrivateRoute path="/crenaux">
                    <Crenaux/>
              </PrivateRoute>


            </Switch>
            <AlertComponent errorMessage={errorMessage} hideError={updateErrorMessage}/>
          </div>
      </Main>
    </Box>

        </Router>
  );
}

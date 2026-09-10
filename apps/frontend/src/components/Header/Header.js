import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';

import { ACCESS_TOKEN_NAME, API_BASE_URL } from '../../constants/apiConstants';
import { useContextObject } from '../Context/Context';

const publicPaths = new Set([
  '/',
  '/accueil',
  '/login',
  '/signup',
  '/contest',
  '/contest_classement',
]);

function Header({ history, location }) {
  const {
    connectedStateHook,
    userHook,
    isAdminHook,
    showBarHook,
  } = useContextObject();
  const [, setConnected] = connectedStateHook;
  const [, setUser] = userHook;
  const [, setIsAdmin] = isAdminHook;
  const [, setShowBar] = showBarHook;

  useEffect(() => {
    const authenticate = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN_NAME);

      if (!token) {
        setConnected(false);
        setIsAdmin(false);
        setShowBar(false);
        if (!publicPaths.has(location.pathname)) history.replace('/login');
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConnected(true);
        setUser(response.data);
        setIsAdmin(response.data.role_id === 0);
        setShowBar(true);

        if (['/', '/accueil', '/login', '/signup'].includes(location.pathname)) {
          history.replace('/home');
        }
      } catch (error) {
        localStorage.removeItem(ACCESS_TOKEN_NAME);
        setConnected(false);
        setIsAdmin(false);
        setShowBar(false);
        if (!publicPaths.has(location.pathname)) history.replace('/login');
      }
    };

    authenticate();
  }, [history, location.pathname, setConnected, setIsAdmin, setShowBar, setUser]);

  return null;
}

export default withRouter(Header);

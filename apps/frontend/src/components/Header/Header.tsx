import { useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

import { ACCESS_TOKEN_NAME, API_BASE_URL } from '../../constants/apiConstants';
import type { AuthenticatedUser } from '../Context/Context';
import { useContextObject } from '../Context/Context';

const publicPaths = new Set([
  '/',
  '/accueil',
  '/login',
  '/signup',
  '/contest',
  '/contest_classement',
]);

interface MeResponse extends AuthenticatedUser {
  role_id: number;
}

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
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
        if (!publicPaths.has(location.pathname)) navigate('/login', { replace: true });
        return;
      }

      try {
        const response = await axios.get<MeResponse>(`${API_BASE_URL}/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConnected(true);
        setUser(response.data);
        setIsAdmin(response.data.role_id === 0);
        setShowBar(true);

        if (['/', '/accueil', '/login', '/signup'].includes(location.pathname)) {
          navigate('/home', { replace: true });
        }
      } catch {
        localStorage.removeItem(ACCESS_TOKEN_NAME);
        setConnected(false);
        setIsAdmin(false);
        setShowBar(false);
        if (!publicPaths.has(location.pathname)) navigate('/login', { replace: true });
      }
    };

    authenticate();
  }, [location.pathname, navigate, setConnected, setIsAdmin, setShowBar, setUser]);

  return null;
}

export default Header;

import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { ACCESS_TOKEN_NAME } from '../constants/apiConstants';

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const location = useLocation();

  return localStorage.getItem(ACCESS_TOKEN_NAME)
    ? <>{children}</>
    : <Navigate to="/login" state={{ from: location }} replace />;
}

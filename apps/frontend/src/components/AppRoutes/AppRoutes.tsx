import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ACCESS_TOKEN_NAME } from '../../constants/apiConstants';
import PrivateRoute from '../../utils/PrivateRoute';

const Accueil = lazy(() => import('../Accueil/Accueil'));
const Annotate = lazy(() => import('../Annotate/Annotate'));
const Contest = lazy(() => import('../Contest/Contest'));
const ContestRes = lazy(() => import('../Contest/ContestRes'));
const CreateContest = lazy(() => import('../CreateContest/CreateContest'));
const Home = lazy(() => import('../Home/Home'));
const ListVoie = lazy(() => import('../ListVoie/ListVoie'));
const LoginForm = lazy(() => import('../LoginForm/LoginForm'));
const SessionHistory = lazy(() => import('../SessionHistory/SessionHistory'));
const SignUpForm = lazy(() => import('../SignUpForm/SignUpForm'));
const UserGroups = lazy(() => import('../UserGroups/UserGroups'));
const Users = lazy(() => import('../Users/Users'));
const WallAnalysis = lazy(() => import('../WallAnalysis/WallAnalysis'));

export default function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
      <Route path="/" element={<Navigate to={localStorage.getItem(ACCESS_TOKEN_NAME) ? '/dashboard' : '/accueil'} replace />} />
      <Route path="/contest_classement" element={<ContestRes />} />
      <Route path="/contest" element={<Contest />} />
      <Route path="/createcontest" element={<CreateContest />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignUpForm />} />
      <Route path="/accueil" element={<Accueil />} />
      <Route path="/home" element={<PrivateRoute><Annotate /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/maseance" element={<PrivateRoute><Navigate to="/home" replace /></PrivateRoute>} />
      <Route path="/listevoies" element={<PrivateRoute><ListVoie /></PrivateRoute>} />
      <Route path="/analyse-mur" element={<PrivateRoute><WallAnalysis /></PrivateRoute>} />
      <Route path="/historique" element={<PrivateRoute><SessionHistory /></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
      <Route path="/user-groups" element={<PrivateRoute><UserGroups /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

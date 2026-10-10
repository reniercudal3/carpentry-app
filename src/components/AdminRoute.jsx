import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { currentUser, userIsAdmin } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!userIsAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

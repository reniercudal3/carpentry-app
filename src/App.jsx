import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Maintenance from './pages/Maintenance';
import { useEffect, useState } from 'react';
import { checkMaintenance } from './utils/maintenance';

// ─── LOCAL MAINTENANCE OVERRIDE ────────────────────────────────────────────
// Set to true to force maintenance page locally (overrides Firebase flag)
const LOCAL_MAINTENANCE = false;
// ────────────────────────────────────────────────────────────────────────────

import InstallPrompt from './components/InstallPrompt';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Module from './pages/Module';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Certificate from './pages/Certificate';
import InstructorDashboard from './pages/InstructorDashboard';

export default function App() {
  const [maintenance, setMaintenance] = useState(LOCAL_MAINTENANCE);
  const [checking, setChecking] = useState(!LOCAL_MAINTENANCE);

  useEffect(() => {
    if (LOCAL_MAINTENANCE) return;
    checkMaintenance().then((isOn) => {
      setMaintenance(isOn);
      setChecking(false);
    });
  }, []);

  // Show blank while checking Firebase (very brief)
  if (checking) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2c1810 0%, #8B4513 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: '56px' }}>🪚</div>
      </div>
    );
  }

  if (maintenance) {
    return <Maintenance />;
  }

  return (
    <>
      <InstallPrompt />
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/module/:id" element={<PrivateRoute><Module /></PrivateRoute>} />
              <Route path="/feedback" element={<PrivateRoute><Feedback /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
              <Route path="/certificate" element={<PrivateRoute><Certificate /></PrivateRoute>} />
              <Route path="/instructor" element={<AdminRoute><InstructorDashboard /></AdminRoute>} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}

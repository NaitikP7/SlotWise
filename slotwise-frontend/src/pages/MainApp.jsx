import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import VenueGridPage from './VenueGridPage';
import EventsListPage from './EventsListPage';
import CreateEventPage from './CreateEventPage';
import YourEventsPage from './YourEventsPage';
import ConflictResolutionPage from './ConflictResolutionPage';
import AdminPage from './AdminPage';
import AnalyticsPage from './AnalyticsPage';
import { useAuth } from '../context/AuthContext';

/**
 * MainApp — Authenticated layout wrapper
 * Handles navigation, routing, and conflict state
 */
export default function MainApp() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [conflictState, setConflictState] = useState(null);

  // Map URL path to active route for navbar highlighting
  const getActiveRoute = () => {
    const path = location.pathname;
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/analytics')) return 'analytics';
    if (path.startsWith('/create-event')) return 'create-event';
    if (path.startsWith('/your-events')) return 'your-events';
    if (path.startsWith('/events')) return 'events';
    if (path.startsWith('/conflict')) return 'create-event';
    return 'dashboard';
  };

  const handleNavigate = (route) => {
    const routeMap = {
      dashboard: '/dashboard',
      events: '/events',
      'create-event': '/create-event',
      'your-events': '/your-events',
      admin: '/admin',
      analytics: '/analytics',
    };
    navigate(routeMap[route] || '/dashboard');
  };

  const handleConflict = (data) => {
    setConflictState(data);
    navigate('/conflict-resolution');
  };

  return (
    <div>
      <Navbar activeRoute={getActiveRoute()} onNavigate={handleNavigate} />
      <Routes>
        <Route path="/dashboard" element={<VenueGridPage />} />
        <Route path="/events" element={<EventsListPage />} />
        <Route path="/create-event" element={<CreateEventPage onConflict={handleConflict} />} />
        <Route path="/your-events" element={<YourEventsPage onConflict={handleConflict} />} />
        <Route path="/conflict-resolution" element={
          <ConflictResolutionPage
            conflictData={conflictState?.conflictData}
            originalForm={conflictState?.originalForm}
            onResolve={() => { setConflictState(null); navigate('/events'); }}
            onBack={() => { setConflictState(null); navigate('/create-event'); }}
          />
        } />
        <Route path="/admin/*" element={user?.role === 'ADMIN' ? <AdminPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/analytics/*" element={user?.role === 'ADMIN' ? <AnalyticsPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />} />
      </Routes>
    </div>
  );
}

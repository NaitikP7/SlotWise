import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import VenueGridPage from './VenueGridPage';
import EventsListPage from './EventsListPage';
import CreateEventPage from './CreateEventPage';
import ConflictResolutionPage from './ConflictResolutionPage';
import AdminPage from './AdminPage';

export default function MainApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for conflict resolution data (passed from CreateEventPage)
  const [conflictState, setConflictState] = useState(null);

  const pathToRoute = (path) => {
    const p = path.replace(/^\//, '');
    if (p === 'admin') return 'admin';
    if (p === 'events') return 'events';
    if (p === 'create-event') return 'create-event';
    if (p === 'conflict-resolution') return 'conflict-resolution';
    return 'dashboard';
  };

  const [route, setRoute] = useState(pathToRoute(location.pathname));

  useEffect(() => {
    setRoute(pathToRoute(location.pathname));
  }, [location.pathname]);

  const handleNavigate = (id) => {
    // Clear conflict state when navigating away from conflict resolution
    if (id !== 'conflict-resolution') {
      setConflictState(null);
    }
    setRoute(id);
    navigate(`/${id === 'dashboard' ? 'dashboard' : id}`);
  };

  const handleConflict = ({ conflictData, originalForm }) => {
    setConflictState({ conflictData, originalForm });
    setRoute('conflict-resolution');
    navigate('/conflict-resolution');
  };

  const effectiveRoute = (route === 'admin' && user?.role !== 'ADMIN') ? 'dashboard' : route;

  const renderPage = () => {
    switch (effectiveRoute) {
      case 'dashboard':
        return <VenueGridPage />;
      case 'events':
        return <EventsListPage />;
      case 'create-event':
        return <CreateEventPage onNavigate={handleNavigate} onConflict={handleConflict} />;
      case 'conflict-resolution':
        return (
          <ConflictResolutionPage
            conflictData={conflictState?.conflictData}
            originalForm={conflictState?.originalForm}
            onNavigate={handleNavigate}
          />
        );
      case 'admin':
        return <AdminPage />;
      default:
        return <VenueGridPage />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeRoute={effectiveRoute} onNavigate={handleNavigate} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderPage()}
      </div>
    </div>
  );
}

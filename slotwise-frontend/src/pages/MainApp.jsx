import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import VenueGridPage from './VenueGridPage';
import EventsListPage from './EventsListPage';
import CreateEventPage from './CreateEventPage';
import AdminPage from './AdminPage';

export default function MainApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Derive route from URL path
  const pathToRoute = (path) => {
    const p = path.replace(/^\//, '');
    if (p === 'admin') return 'admin';
    if (p === 'events') return 'events';
    if (p === 'create-event') return 'create-event';
    return 'dashboard';
  };

  const [route, setRoute] = useState(pathToRoute(location.pathname));

  // Sync route state when URL changes
  useEffect(() => {
    setRoute(pathToRoute(location.pathname));
  }, [location.pathname]);

  const handleNavigate = (id) => {
    setRoute(id);
    navigate(`/${id === 'dashboard' ? 'dashboard' : id}`);
  };

  // Protect admin route: non-admin users can't access /admin
  const effectiveRoute = (route === 'admin' && user?.role !== 'ADMIN') ? 'dashboard' : route;

  const renderPage = () => {
    switch (effectiveRoute) {
      case 'dashboard':
        return <VenueGridPage />;
      case 'events':
        return <EventsListPage />;
      case 'create-event':
        return <CreateEventPage onNavigate={handleNavigate} />;
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

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeRoute, onNavigate }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
    { id: 'events', label: 'Events', icon: 'event' },
    { id: 'create-event', label: 'Create Event', icon: 'add_circle' },
    { id: 'your-events', label: 'Your Events', icon: 'person' },
    // Only show Analytics and Admin links for ADMIN users
    ...(isAdmin ? [
      { id: 'analytics', label: 'Analytics', icon: 'analytics' },
      { id: 'admin', label: 'Admin', icon: 'admin_panel_settings' },
    ] : []),
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleNav = (id) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  // Logo click → redirect to home based on role
  const handleLogoClick = () => {
    const dest = isAdmin ? 'admin' : 'dashboard';
    handleNav(dest);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <div className="navbar-brand" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <div className="navbar-brand-icon">
              <img src="/mlogo.png" alt="SlotWise" className="navbar-logo-img" />
            </div>
          </div>
          <div className="navbar-links">
            {links.map((link) => (
              <button
                key={link.id}
                className={`navbar-link ${activeRoute === link.id ? 'active' : ''}`}
                onClick={() => handleNav(link.id)}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
        <div className="navbar-right">
          <button className="navbar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
          {/* <button className="navbar-notification" title="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button> */}
          <div className="navbar-user">
            <div className="navbar-user-info">
              <span className="navbar-user-name">{user?.name || 'User'}</span>
              <span className="navbar-user-role">{user?.role || 'User'}</span>
            </div>
            <div className="navbar-avatar" title={user?.name}>
              {getInitials(user?.name)}
            </div>
            <button className="navbar-logout-btn" onClick={logout} title="Sign out">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        {links.map((link) => (
          <button
            key={link.id}
            className={`mobile-nav-link ${activeRoute === link.id ? 'active' : ''}`}
            onClick={() => handleNav(link.id)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{link.icon}</span>
            {link.label}
          </button>
        ))}
      </div>
    </>
  );
}

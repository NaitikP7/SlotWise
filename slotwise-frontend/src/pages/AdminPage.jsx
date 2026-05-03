import { useState } from 'react';
import OverviewPanel from '../components/panels/OverviewPanel';
import InstitutesPanel from '../components/panels/InstitutesPanel';
import DepartmentsPanel from '../components/panels/DepartmentsPanel';
import UsersPanel from '../components/panels/UsersPanel';
import VenuesPanel from '../components/panels/VenuesPanel';
import EventsPanel from '../components/panels/EventsPanel';

/**
 * AdminPage — Admin dashboard with sidebar navigation
 * Mobile-responsive: sidebar collapses to slide-out drawer
 */
const panels = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'institutes', label: 'Institutes', icon: 'account_balance' },
  { id: 'departments', label: 'Departments', icon: 'folder' },
  { id: 'users', label: 'Users', icon: 'group' },
  { id: 'venues', label: 'Venues', icon: 'domain' },
  { id: 'events', label: 'Events', icon: 'event' },
];

export default function AdminPage() {
  const [activePanel, setActivePanel] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handlePanelChange = (id) => {
    setActivePanel(id);
    setSidebarOpen(false); // close mobile sidebar
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'overview': return <OverviewPanel />;
      case 'institutes': return <InstitutesPanel />;
      case 'departments': return <DepartmentsPanel />;
      case 'users': return <UsersPanel />;
      case 'venues': return <VenuesPanel />;
      case 'events': return <EventsPanel />;
      default: return <OverviewPanel />;
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile sidebar toggle */}
      <button className="admin-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <span className="material-symbols-outlined">{sidebarOpen ? 'close' : 'menu'}</span>
        <span>Admin Menu</span>
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar-open' : ''}`}>
        <div className="admin-sidebar-header">
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>admin_panel_settings</span>
          <span>Admin Panel</span>
        </div>
        <nav className="admin-sidebar-nav">
          {panels.map(p => (
            <button
              key={p.id}
              className={`admin-sidebar-btn ${activePanel === p.id ? 'active' : ''}`}
              onClick={() => handlePanelChange(p.id)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="admin-content">
        <div className="admin-content-header">
          <h2 className="page-title" style={{ fontSize: '1.375rem' }}>
            {panels.find(p => p.id === activePanel)?.label || 'Overview'}
          </h2>
        </div>
        {renderPanel()}
      </main>
    </div>
  );
}

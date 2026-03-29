import { useState } from 'react';
import OverviewPanel from '../components/panels/OverviewPanel';
import InstitutesPanel from '../components/panels/InstitutesPanel';
import DepartmentsPanel from '../components/panels/DepartmentsPanel';
import UsersPanel from '../components/panels/UsersPanel';
import VenuesPanel from '../components/panels/VenuesPanel';
import EventsPanel from '../components/panels/EventsPanel';

const sections = [
  { id: 'overview', label: 'Overview', icon: 'dashboard', component: OverviewPanel },
  { id: 'institutes', label: 'Institutes', icon: 'account_balance', component: InstitutesPanel },
  { id: 'departments', label: 'Departments', icon: 'folder', component: DepartmentsPanel },
  { id: 'users', label: 'Users', icon: 'group', component: UsersPanel },
  { id: 'venues', label: 'Venues', icon: 'location_on', component: VenuesPanel },
  { id: 'events', label: 'Events', icon: 'event', component: EventsPanel },
];

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const section = sections.find(s => s.id === activeSection) || sections[0];
  const Panel = section.component;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">Management</div>
        <nav className="admin-sidebar-nav">
          {sections.map(s => (
            <button
              key={s.id}
              className={`admin-nav-link ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              <span className="material-symbols-outlined">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">{section.label}</h1>
              <p className="page-subtitle">
                {activeSection === 'overview' ? 'System-wide analytics and recent activity' : `Manage ${section.label.toLowerCase()}`}
              </p>
            </div>
          </div>
          <Panel key={activeSection} />
        </div>
      </div>
    </div>
  );
}

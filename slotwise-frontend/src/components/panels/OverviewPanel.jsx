import { useState, useEffect, useCallback } from 'react';
import { instituteAPI, departmentAPI, userAPI, venueAPI, eventAPI } from '../../services/api';

export default function OverviewPanel() {
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [instRes, deptRes, userRes, venueRes, eventRes] = await Promise.all([
        instituteAPI.getAll(), departmentAPI.getAll(), userAPI.getAll(), venueAPI.getAll(), eventAPI.getAll(),
      ]);
      const events = eventRes.data;
      const users = userRes.data;
      const activeEvents = events.filter(e => e.active);
      const activeUsers = users.filter(u => u.active !== false);
      const totalCapacity = venueRes.data.reduce((s, v) => s + (v.capacity || 0), 0);

      setStats({
        institutes: instRes.data.length,
        departments: deptRes.data.length,
        totalUsers: users.length,
        activeUsers: activeUsers.length,
        venues: venueRes.data.length,
        totalCapacity,
        totalEvents: events.length,
        activeEvents: activeEvents.length,
      });

      // Most recent 5 events
      const sorted = [...events].sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const db = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return db - da;
      });
      setRecentEvents(sorted.slice(0, 5));
    } catch { /* empty stats on error */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fmtDT = (dt) => dt ? new Date(dt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const cards = [
    { label: 'Institutes', value: stats?.institutes || 0, icon: 'account_balance', bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', sub: 'Registered institutions' },
    { label: 'Departments', value: stats?.departments || 0, icon: 'folder', bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', sub: 'Across all institutes' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: 'group', bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', sub: `${stats?.activeUsers || 0} active` },
    { label: 'Venues', value: stats?.venues || 0, icon: 'location_on', bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', sub: `${stats?.totalCapacity || 0} total seats` },
    { label: 'Total Events', value: stats?.totalEvents || 0, icon: 'event', bg: 'rgba(159, 223, 32, 0.1)', color: '#9FDF20', sub: `${stats?.activeEvents || 0} active` },
    { label: 'Active Events', value: stats?.activeEvents || 0, icon: 'event_available', bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', sub: 'Currently scheduled' },
  ];

  return (
    <>
      {/* Stat cards */}
      <div className="overview-grid">
        {cards.map((c) => (
          <div className="stat-card" key={c.label}>
            <div className="stat-card-icon" style={{ background: c.bg, color: c.color }}>
              <span className="material-symbols-outlined">{c.icon}</span>
            </div>
            <div className="stat-card-content">
              <div className="stat-card-label">{c.label}</div>
              <div className="stat-card-value">{c.value}</div>
              <div className="stat-card-sub">{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent events table */}
      <div className="overview-section-title">
        <span className="material-symbols-outlined">schedule</span>
        Recent Events
      </div>
      <div className="table-card recent-table">
        {recentEvents.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="empty-state-icon"><span className="material-symbols-outlined">event</span></div>
            <h3>No events yet</h3>
            <p>Events will appear here once created</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Venue</th>
                  <th style={{ textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map(ev => (
                  <tr key={ev.id}>
                    <td><span className="cell-primary">{ev.title}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtDT(ev.startTime)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtDT(ev.endTime)}</td>
                    <td><span className="badge badge-info">{ev.venueName || '—'}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`badge ${ev.active ? 'badge-confirmed' : 'badge-danger'}`}>
                        <span className="badge-dot" />{ev.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

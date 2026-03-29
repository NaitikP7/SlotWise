import { useState, useEffect, useCallback } from 'react';
import { eventAPI } from '../services/api';

export default function EventsListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const res = await eventAPI.getAll(); setEvents(res.data); }
    catch { /* error state handled by empty */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = events.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    (e.venueName || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.organizerName || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (event) => {
    if (!event.active) {
      return (
        <span className="badge badge-cancelled">
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>close</span>
          Cancelled
        </span>
      );
    }
    const start = new Date(event.startTime);
    const now = new Date();
    if (start > now) {
      return (
        <span className="badge badge-pending">
          <span className="badge-dot" />
          Pending
        </span>
      );
    }
    return (
      <span className="badge badge-confirmed">
        <span className="badge-dot" />
        Confirmed
      </span>
    );
  };

  const formatDate = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (start, end) => {
    if (!start || !end) return '—';
    const fmt = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${fmt(start)} - ${fmt(end)}`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scheduled Events</h1>
          <p className="page-subtitle">Administrative master schedule for the current term</p>
        </div>
      </div>

      <div className="table-card">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <span className="record-count"><strong>{filtered.length}</strong> of <strong>{events.length}</strong> events</span>
          </div>
        </div>
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <span className="material-symbols-outlined">event</span>
            </div>
            <h3>No events found</h3>
            <p>{search ? 'Try adjusting your search term' : 'No events have been scheduled yet'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '35%' }}>Event Details</th>
                  <th style={{ width: '15%' }}>Date</th>
                  <th style={{ width: '15%' }}>Time</th>
                  <th style={{ width: '20%' }}>Venue</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ev) => (
                  <tr key={ev.id}>
                    <td>
                      <div>
                        <span className="cell-primary">{ev.title}</span>
                        <div className="cell-secondary">{ev.description || ev.organizerName || 'Event'}</div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--color-slate-600)' }}>{formatDate(ev.startTime)}</td>
                    <td className="cell-mono">{formatTime(ev.startTime, ev.endTime)}</td>
                    <td style={{ color: 'var(--color-slate-600)' }}>{ev.venueName || ev.location || '—'}</td>
                    <td style={{ textAlign: 'right' }}>{getStatusBadge(ev)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="table-footer">
            <span className="table-footer-text">
              Showing <strong>{filtered.length}</strong> of <strong>{events.length}</strong> events
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

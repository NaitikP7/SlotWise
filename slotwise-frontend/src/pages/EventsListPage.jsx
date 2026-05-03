import { useState, useEffect, useCallback } from 'react';
import { eventAPI, venueAPI } from '../services/api';

/**
 * EventsListPage — List all scheduled events with venue and status filters
 */
export default function EventsListPage() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [venueFilter, setVenueFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [evRes, vnRes] = await Promise.all([eventAPI.getAll(), venueAPI.getAll()]);
      setEvents(evRes.data);
      setVenues(vnRes.data);
    } catch {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Determine event status
  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    if (!event.active) return 'cancelled';
    if (now >= start && now <= end) return 'active';
    if (now < start) return 'upcoming';
    return 'completed';
  };

  const statusConfig = {
    upcoming: { label: 'Upcoming', badge: 'badge-info', icon: 'schedule' },
    active: { label: 'Active', badge: 'badge-confirmed', icon: 'play_circle' },
    completed: { label: 'Completed', badge: 'badge-muted', icon: 'check_circle' },
    cancelled: { label: 'Cancelled', badge: 'badge-danger', icon: 'cancel' },
  };

  // Apply filters
  const filtered = events.filter((ev) => {
    // Text search
    const matchesSearch = !search ||
      ev.title?.toLowerCase().includes(search.toLowerCase()) ||
      ev.organizerName?.toLowerCase().includes(search.toLowerCase()) ||
      ev.venueName?.toLowerCase().includes(search.toLowerCase());

    // Venue filter
    const matchesVenue = !venueFilter || String(ev.venueId) === venueFilter;

    // Status filter
    const status = getEventStatus(ev);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    return matchesSearch && matchesVenue && matchesStatus;
  });

  // Sort by startTime descending (newest first)
  const sortedEvents = [...filtered].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  const formatDateTime = (dt) => {
    if (!dt) return '—';
    const d = new Date(dt);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return '';
    const ms = new Date(end) - new Date(start);
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    return hrs > 0 ? `${hrs}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scheduled Events</h1>
          <p className="page-subtitle">Browse and filter all scheduled events</p>
        </div>
      </div>

      <div className="table-card">
        {/* Toolbar with search + filters */}
        <div className="toolbar" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div className="toolbar-left" style={{ flex: 1, minWidth: 200 }}>
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input type="text" placeholder="Search events, organizer, venue..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="toolbar-filters" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Venue filter */}
            <select className="form-select filter-select" value={venueFilter} onChange={(e) => setVenueFilter(e.target.value)} style={{ height: 40, fontSize: '0.8125rem', minWidth: 160 }}>
              <option value="">All Venues</option>
              {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            {/* Status filter */}
            <select className="form-select filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ height: 40, fontSize: '0.8125rem', minWidth: 140 }}>
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <span className="record-count"><strong>{sortedEvents.length}</strong> events</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : error ? (
          <div className="error-alert">
            <span className="material-symbols-outlined">error</span>
            <p>{error}</p>
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><span className="material-symbols-outlined">event_busy</span></div>
            <h3>No events found</h3>
            <p>{search || venueFilter || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No events have been scheduled yet'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Venue</th>
                  <th>Organizer</th>
                  <th>Date & Time</th>
                  <th>Duration</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedEvents.map((ev) => {
                  const status = getEventStatus(ev);
                  const cfg = statusConfig[status];
                  return (
                    <tr key={ev.id}>
                      <td>
                        <span className="cell-primary">{ev.title}</span>
                        {ev.description && <span className="cell-sub" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-slate-400)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.description}</span>}
                      </td>
                      <td><span className="badge badge-info">{ev.venueName || '—'}</span></td>
                      <td style={{ color: 'var(--color-slate-500)' }}>{ev.organizerName || '—'}</td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>{formatDateTime(ev.startTime)}</td>
                      <td style={{ color: 'var(--color-slate-500)', fontSize: '0.8125rem' }}>{formatDuration(ev.startTime, ev.endTime)}</td>
                      <td>{ev.eventType ? <span className="badge badge-muted">{ev.eventType}</span> : '—'}</td>
                      <td>
                        <span className={`badge ${cfg.badge}`}>
                          <span className="badge-dot" />{cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

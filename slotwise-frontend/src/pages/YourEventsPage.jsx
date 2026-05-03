import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventAPI, venueAPI } from '../services/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

/**
 * YourEventsPage — Shows events organized by the logged-in user
 * Tabs: Upcoming, Active, Completed, Cancelled
 * Actions: Update (upcoming only), Cancel (upcoming only)
 */
export default function YourEventsPage({ onConflict }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Edit modal state
  const [editEvent, setEditEvent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [allVenues, setAllVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);

  // Cancel confirmation modal state
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await eventAPI.getByOrganizer(user.id);
      setEvents(res.data);
    } catch {
      setError('Failed to load your events');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Load venues for edit modal
  useEffect(() => {
    venueAPI.getAll().then(res => {
      setAllVenues(res.data);
      setFilteredVenues(res.data);
    }).catch(() => {});
  }, []);

  const now = new Date();

  const categorize = (ev) => {
    if (!ev.active) return 'cancelled';
    const start = new Date(ev.startTime);
    const end = new Date(ev.endTime);
    if (now >= start && now <= end) return 'active';
    if (now < start) return 'upcoming';
    return 'completed';
  };

  const tabCounts = { upcoming: 0, active: 0, completed: 0, cancelled: 0 };
  events.forEach(ev => { tabCounts[categorize(ev)]++; });

  const filtered = events
    .filter(ev => categorize(ev) === activeTab)
    .sort((a, b) => {
      if (activeTab === 'completed' || activeTab === 'cancelled')
        return new Date(b.startTime) - new Date(a.startTime);
      return new Date(a.startTime) - new Date(b.startTime);
    });

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
    return hrs > 0 ? `${hrs}h${mins > 0 ? ` ${mins}m` : ''}` : `${mins}m`;
  };

  // ===== EDIT MODAL =====
  const openEditModal = (ev) => {
    setEditEvent(ev);
    setEditForm({
      title: ev.title || '',
      description: ev.description || '',
      startTime: ev.startTime ? ev.startTime.substring(0, 16) : '',
      endTime: ev.endTime ? ev.endTime.substring(0, 16) : '',
      venueId: ev.venueId || '',
      eventType: ev.eventType || '',
      expectedAttendees: ev.expectedAttendees || '',
    });
  };

  const handleEditChange = (e) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Filter venues by expected attendees
  useEffect(() => {
    const attendees = parseInt(editForm.expectedAttendees, 10);
    if (attendees > 0) {
      setFilteredVenues(allVenues.filter(v => v.capacity >= attendees));
    } else {
      setFilteredVenues(allVenues);
    }
  }, [editForm.expectedAttendees, allVenues]);

  const handleEditSubmit = async () => {
    if (!editForm.title.trim()) { toast.error('Error', 'Title is required'); return; }
    if (!editForm.startTime || !editForm.endTime) { toast.error('Error', 'Times are required'); return; }
    if (new Date(editForm.endTime) <= new Date(editForm.startTime)) {
      toast.error('Error', 'End time must be after start time'); return;
    }

    setEditLoading(true);
    const payload = {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      startTime: editForm.startTime,
      endTime: editForm.endTime,
      venueId: editForm.venueId ? Number(editForm.venueId) : null,
      organizerId: user?.id,
      eventType: editForm.eventType || null,
      expectedAttendees: editForm.expectedAttendees ? Number(editForm.expectedAttendees) : null,
    };

    try {
      await eventAPI.update(editEvent.id, payload);
      toast.success('Updated', `"${payload.title}" has been updated`);
      setEditEvent(null);
      fetchEvents();
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data) {
        // Conflict detected — navigate to resolution page
        setEditEvent(null);
        if (onConflict) {
          onConflict({ conflictData: err.response.data, originalForm: payload });
        }
      } else {
        toast.error('Error', err.response?.data?.message || err.response?.data || 'Failed to update event');
      }
    } finally {
      setEditLoading(false);
    }
  };

  // ===== CANCEL =====
  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await eventAPI.cancel(cancelTarget.id);
      toast.success('Cancelled', `"${cancelTarget.title}" has been cancelled`);
      setCancelTarget(null);
      fetchEvents();
    } catch (err) {
      toast.error('Error', err.response?.data || 'Failed to cancel event');
    } finally {
      setCancelLoading(false);
    }
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', icon: 'schedule', color: 'var(--color-blue-500)' },
    { id: 'active', label: 'Active Now', icon: 'play_circle', color: 'var(--color-primary)' },
    { id: 'completed', label: 'Completed', icon: 'check_circle', color: 'var(--color-slate-400)' },
    { id: 'cancelled', label: 'Cancelled', icon: 'cancel', color: '#ef4444' },
  ];

  const eventTypes = ['Lecture', 'Workshop', 'Seminar', 'Lab', 'Meeting', 'Exam', 'Conference', 'Cultural', 'Sports', 'Other'];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Your Events</h1>
          <p className="page-subtitle">Events you've organized — {events.length} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/create-event')}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_circle</span>
          New Event
        </button>
      </div>

      {/* Tabs */}
      <div className="your-events-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`ye-tab ${activeTab === tab.id ? 'ye-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{tab.icon}</span>
            {tab.label}
            <span className="ye-tab-count">{tabCounts[tab.id]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : error ? (
        <div className="error-alert"><span className="material-symbols-outlined">error</span><p>{error}</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 32 }}>
          <div className="empty-state-icon">
            <span className="material-symbols-outlined">{
              activeTab === 'upcoming' ? 'event_upcoming' :
              activeTab === 'active' ? 'play_circle' :
              activeTab === 'cancelled' ? 'cancel' : 'history'
            }</span>
          </div>
          <h3>No {activeTab} events</h3>
          <p>{
            activeTab === 'upcoming' ? 'You don\'t have any upcoming events scheduled' :
            activeTab === 'active' ? 'No events are happening right now' :
            activeTab === 'cancelled' ? 'No cancelled events' :
            'No completed events found'
          }</p>
          {activeTab === 'upcoming' && (
            <button className="btn btn-primary" onClick={() => navigate('/create-event')} style={{ marginTop: 12 }}>
              Schedule Event
            </button>
          )}
        </div>
      ) : (
        <div className="ye-cards">
          {filtered.map(ev => {
            const cat = categorize(ev);
            const isUpcoming = cat === 'upcoming';
            return (
              <div key={ev.id} className={`ye-card ye-card-${cat}`}>
                <div className="ye-card-header">
                  <div>
                    <h3 className="ye-card-title">{ev.title}</h3>
                    {ev.description && <p className="ye-card-desc">{ev.description}</p>}
                  </div>
                  {ev.eventType && <span className="badge badge-muted">{ev.eventType}</span>}
                </div>
                <div className="ye-card-meta">
                  <div className="ye-card-meta-item">
                    <span className="material-symbols-outlined">location_on</span>
                    {ev.venueName || '—'}
                  </div>
                  <div className="ye-card-meta-item">
                    <span className="material-symbols-outlined">schedule</span>
                    {formatDateTime(ev.startTime)}
                  </div>
                  <div className="ye-card-meta-item">
                    <span className="material-symbols-outlined">timelapse</span>
                    {formatDuration(ev.startTime, ev.endTime)}
                  </div>
                  {ev.expectedAttendees && (
                    <div className="ye-card-meta-item">
                      <span className="material-symbols-outlined">groups</span>
                      {ev.expectedAttendees} attendees
                    </div>
                  )}
                  {ev.createdAt && (
                    <div className="ye-card-meta-item">
                      <span className="material-symbols-outlined">calendar_today</span>
                      Created {formatDateTime(ev.createdAt)}
                    </div>
                  )}
                </div>
                <div className="ye-card-footer">
                  <span className={`badge ${
                    cat === 'upcoming' ? 'badge-info' :
                    cat === 'active' ? 'badge-confirmed' :
                    cat === 'cancelled' ? 'badge-cancelled' :
                    'badge-muted'
                  }`}>
                    <span className="badge-dot" />{
                      cat === 'upcoming' ? 'Upcoming' :
                      cat === 'active' ? 'Active' :
                      cat === 'cancelled' ? 'Cancelled' :
                      'Completed'
                    }
                  </span>

                  {/* Actions — only for upcoming events */}
                  {isUpcoming && (
                    <div className="ye-card-actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(ev)}
                        title="Edit event">
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                        Update
                      </button>
                      <button className="btn btn-sm btn-danger-outline" onClick={() => setCancelTarget(ev)}
                        title="Cancel event">
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>cancel</span>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== EDIT MODAL ===== */}
      <Modal isOpen={!!editEvent} onClose={() => setEditEvent(null)} title="Update Event"
        footer={
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setEditEvent(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleEditSubmit} disabled={editLoading}>
              {editLoading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Updating...</>
                : <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span> Save Changes</>}
            </button>
          </div>
        }>
        <div className="ye-edit-form">
          <div className="form-group">
            <label className="form-label">Event Title *</label>
            <input className="form-input" name="title" value={editForm.title || ''} onChange={handleEditChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" name="description" rows={3} value={editForm.description || ''} onChange={handleEditChange} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Start Time *</label>
              <input className="form-input" type="datetime-local" name="startTime" value={editForm.startTime || ''} onChange={handleEditChange} />
            </div>
            <div className="form-group">
              <label className="form-label">End Time *</label>
              <input className="form-input" type="datetime-local" name="endTime" value={editForm.endTime || ''} onChange={handleEditChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Expected Attendees</label>
            <input className="form-input" type="number" name="expectedAttendees" min="1"
              value={editForm.expectedAttendees || ''} onChange={handleEditChange}
              placeholder="Filters venues by capacity" />
          </div>
          <div className="form-group">
            <label className="form-label">Venue *</label>
            <select className="form-input" name="venueId" value={editForm.venueId || ''} onChange={handleEditChange}>
              <option value="">Select venue</option>
              {filteredVenues.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.capacity} seats){v.instituteName ? ` — ${v.instituteName}` : ''}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Event Type</label>
            <select className="form-input" name="eventType" value={editForm.eventType || ''} onChange={handleEditChange}>
              <option value="">Select type</option>
              {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      {/* ===== CANCEL CONFIRMATION MODAL ===== */}
      <Modal isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Event"
        footer={
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setCancelTarget(null)}>Go Back</button>
            <button className="btn btn-danger" onClick={handleCancel} disabled={cancelLoading}>
              {cancelLoading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Cancelling...</>
                : <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>cancel</span> Confirm Cancel</>}
            </button>
          </div>
        }>
        {cancelTarget && (
          <div className="ye-cancel-confirm">
            <div className="ye-cancel-icon">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <p>Are you sure you want to cancel <strong>"{cancelTarget.title}"</strong>?</p>
            <p className="ye-cancel-sub">This action cannot be undone. The event will be marked as cancelled.</p>
            <div className="ye-cancel-details">
              <div><span className="material-symbols-outlined" style={{ fontSize: 16 }}>location_on</span> {cancelTarget.venueName}</div>
              <div><span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span> {formatDateTime(cancelTarget.startTime)}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

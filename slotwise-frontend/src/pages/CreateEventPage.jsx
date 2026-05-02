import { useState, useEffect } from 'react';
import { eventAPI, venueAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function CreateEventPage({ onNavigate, onConflict }) {
  const { user } = useAuth();
  const toast = useToast();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', startTime: '', endTime: '',
    location: '', active: true, venueId: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    venueAPI.getAll()
      .then((res) => setVenues(res.data))
      .catch(() => { });
  }, []);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Event name is required';
    if (!form.startTime) e.startTime = 'Required';
    if (!form.endTime) e.endTime = 'Required';
    if (form.startTime && form.endTime && new Date(form.startTime) >= new Date(form.endTime))
      e.endTime = 'Must be after start';
    if (!form.venueId) e.venueId = 'Venue is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const toISO = (dt) => {
      if (!dt) return null;
      return dt.length === 16 ? dt + ':00' : dt;
    };

    const payload = {
      title: form.title,
      description: form.description,
      startTime: toISO(form.startTime),
      endTime: toISO(form.endTime),
      location: form.location,
      active: form.active,
      organizerId: user?.id ? Number(user.id) : null,
      venueId: Number(form.venueId),
    };

    try {
      await eventAPI.create(payload);
      toast.success('Event Created', `"${form.title}" has been scheduled`);
      if (onNavigate) onNavigate('events');
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.collision) {
        // Conflict detected — redirect to conflict resolution page
        if (onConflict) {
          onConflict({
            conflictData: err.response.data,
            originalForm: payload,
          });
        }
      } else {
        toast.error('Error', err.response?.data?.message || err.response?.data || 'Failed to create event');
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Create New Event</h1>
          <p className="page-subtitle">Schedule a new event at an available venue</p>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-card-title">
          <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>event</span>
          Event Information
        </h3>

        {/* Show organizer info as read-only badge
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
          background: 'rgba(99, 102, 241, 0.08)', borderRadius: 10, marginBottom: 20,
          border: '1px solid rgba(99, 102, 241, 0.15)'
        }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 20 }}>person</span>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Organizer:</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{user?.name || 'You'}</span>
          <span style={{
            fontSize: 11, background: 'var(--color-primary)', color: '#fff',
            padding: '2px 8px', borderRadius: 6, marginLeft: 'auto'
          }}>Auto-assigned</span>
        </div> */}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="evt-name">
              <span className="material-symbols-outlined">badge</span>
              Event Name
            </label>
            <input id="evt-name" type="text" className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="e.g., Q3 Quarterly Review" value={form.title}
              onChange={(e) => set('title', e.target.value)} autoFocus />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="evt-desc">
              <span className="material-symbols-outlined">notes</span>
              Description
            </label>
            <textarea id="evt-desc" className="form-textarea"
              placeholder="Brief description..." value={form.description}
              onChange={(e) => set('description', e.target.value)} rows={3} />
          </div>

          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="evt-venue">
                <span className="material-symbols-outlined">location_on</span>
                Venue
              </label>
              <select id="evt-venue" className={`form-select ${errors.venueId ? 'error' : ''}`}
                value={form.venueId} onChange={(e) => set('venueId', e.target.value)}>
                <option value="">Select venue...</option>
                {venues.map(v => <option key={v.id} value={v.id}>{v.name} ({v.capacity} seats) - {v.location}</option>)}
              </select>
              {errors.venueId && <div className="form-error">{errors.venueId}</div>}
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="evt-start">
                <span className="material-symbols-outlined">schedule</span>
                Start Time
              </label>
              <input id="evt-start" type="datetime-local" className={`form-input ${errors.startTime ? 'error' : ''}`}
                value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
              {errors.startTime && <div className="form-error">{errors.startTime}</div>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="evt-end">
                <span className="material-symbols-outlined">schedule</span>
                End Time
              </label>
              <input id="evt-end" type="datetime-local" className={`form-input ${errors.endTime ? 'error' : ''}`}
                value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
              {errors.endTime && <div className="form-error">{errors.endTime}</div>}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="evt-loc">
              <span className="material-symbols-outlined">meeting_room</span>
              Location Details
            </label>
            <input id="evt-loc" type="text" className="form-input"
              placeholder="e.g., Room 304, Building A" value={form.location}
              onChange={(e) => set('location', e.target.value)} />
          </div>

          <div className="form-card-footer">
            <button type="button" className="btn btn-secondary" onClick={() => onNavigate && onNavigate('events')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Scheduling...</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>event_available</span> Schedule Event</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

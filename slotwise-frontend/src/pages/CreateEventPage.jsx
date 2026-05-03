import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventAPI, venueAPI } from '../services/api';

/**
 * CreateEventPage — Form to schedule new events.
 * - Center-aligned card layout
 * - No "Location" field (venue stores location)
 * - Expected Attendees field with dynamic venue capacity filtering
 * - Read-only Organizer (auto-filled from logged-in user)
 * - Accepts prefill data from navigation state (dashboard quick-add)
 */
export default function CreateEventPage({ onConflict }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Prefill from navigation state (from dashboard quick-add)
  const prefill = location.state?.prefill || {};

  const [allVenues, setAllVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    title: prefill.title || '',
    description: prefill.description || '',
    startTime: prefill.startTime || '',
    endTime: prefill.endTime || '',
    venueId: prefill.venueId || '',
    eventType: prefill.eventType || '',
    expectedAttendees: prefill.expectedAttendees || '',
  });

  // Fetch all venues on mount
  useEffect(() => {
    const loadVenues = async () => {
      setVenuesLoading(true);
      try {
        const res = await venueAPI.getAll();
        setAllVenues(res.data);
        setFilteredVenues(res.data);
      } catch {
        setError('Failed to load venues');
      } finally {
        setVenuesLoading(false);
      }
    };
    loadVenues();
  }, []);

  // Dynamic venue filtering by capacity
  useEffect(() => {
    const attendees = parseInt(form.expectedAttendees, 10);
    if (attendees > 0) {
      const matching = allVenues.filter(v => v.capacity >= attendees);
      setFilteredVenues(matching);
      // If currently selected venue doesn't meet capacity, clear it
      if (form.venueId && !matching.find(v => String(v.id) === String(form.venueId))) {
        setForm(prev => ({ ...prev, venueId: '' }));
      }
    } else {
      setFilteredVenues(allVenues);
    }
  }, [form.expectedAttendees, allVenues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const validate = () => {
    if (!form.title.trim()) return 'Event title is required';
    if (!form.startTime) return 'Start time is required';
    if (!form.endTime) return 'End time is required';
    if (new Date(form.endTime) <= new Date(form.startTime)) return 'End time must be after start time';
    if (!form.venueId) return 'Please select a venue';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      startTime: form.startTime,
      endTime: form.endTime,
      venueId: Number(form.venueId),
      organizerId: user?.id,
      eventType: form.eventType || null,
      expectedAttendees: form.expectedAttendees ? Number(form.expectedAttendees) : null,
    };

    try {
      await eventAPI.create(payload);
      setSuccess('Event created successfully!');
      // Reset form
      setForm({ title: '', description: '', startTime: '', endTime: '', venueId: '', eventType: '', expectedAttendees: '' });
      setTimeout(() => navigate('/events'), 1200);
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data) {
        // Collision detected — pass to conflict resolution
        if (onConflict) {
          onConflict({
            conflictData: err.response.data,
            originalForm: payload,
          });
        }
      } else {
        setError(err.response?.data?.message || err.response?.data || 'Failed to create event. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const eventTypes = ['Lecture', 'Workshop', 'Seminar', 'Lab', 'Meeting', 'Exam', 'Conference', 'Cultural', 'Sports', 'Other'];

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 640 }}>
        <div className="page-header" style={{ textAlign: 'center', display: 'block', marginBottom: 24 }}>
          <h1 className="page-title">Schedule New Event</h1>
          <p className="page-subtitle">Fill in the details to book a venue slot</p>
        </div>

        <div className="table-card" style={{ padding: '32px 36px' }}>
          {/* Organizer badge */}
          <div className="organizer-badge" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'var(--color-primary-05)', borderRadius: 'var(--radius-md)', marginBottom: 28, border: '1px solid var(--color-primary-15)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary-15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-green-text)' }}>
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>Organizer · {user?.departmentName || 'N/A'}</div>
            </div>
            <span className="material-symbols-outlined" style={{ marginLeft: 'auto', fontSize: 16, color: 'var(--color-primary)' }}>verified</span>
          </div>

          {error && (
            <div className="login-error" style={{ marginBottom: 20 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
              {error}
            </div>
          )}

          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'rgba(159,223,32,0.1)', border: '1px solid rgba(159,223,32,0.3)', borderRadius: 'var(--radius-md)', color: '#6a9a12', fontSize: '0.875rem', fontWeight: 600, marginBottom: 20 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" htmlFor="ce-title">
                <span className="material-symbols-outlined">event</span> Event Title
              </label>
              <input id="ce-title" name="title" type="text" className="form-input" placeholder="e.g., Machine Learning Workshop" value={form.title} onChange={handleChange} autoFocus />
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" htmlFor="ce-desc">
                <span className="material-symbols-outlined">description</span> Description <span className="form-label-sub">(optional)</span>
              </label>
              <textarea id="ce-desc" name="description" className="form-textarea" placeholder="Describe the event..." rows={3} value={form.description} onChange={handleChange} />
            </div>

            {/* Date/Time row */}
            <div className="form-row" style={{ marginBottom: 20 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ce-start">
                  <span className="material-symbols-outlined">schedule</span> Start Time
                </label>
                <input id="ce-start" name="startTime" type="datetime-local" className="form-input" value={form.startTime} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ce-end">
                  <span className="material-symbols-outlined">schedule</span> End Time
                </label>
                <input id="ce-end" name="endTime" type="datetime-local" className="form-input" value={form.endTime} onChange={handleChange} />
              </div>
            </div>

            {/* Event Type + Expected Attendees row */}
            <div className="form-row" style={{ marginBottom: 20 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ce-type">
                  <span className="material-symbols-outlined">category</span> Event Type <span className="form-label-sub">(optional)</span>
                </label>
                <select id="ce-type" name="eventType" className="form-select" value={form.eventType} onChange={handleChange}>
                  <option value="">Select type...</option>
                  {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ce-attendees">
                  <span className="material-symbols-outlined">groups</span> Expected Attendees
                </label>
                <input id="ce-attendees" name="expectedAttendees" type="number" min="1" className="form-input" placeholder="e.g., 50" value={form.expectedAttendees} onChange={handleChange} />
              </div>
            </div>

            {/* Venue (dynamically filtered by capacity) */}
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label" htmlFor="ce-venue">
                <span className="material-symbols-outlined">location_on</span> Venue
                {form.expectedAttendees && parseInt(form.expectedAttendees) > 0 && (
                  <span className="form-label-sub" style={{ marginLeft: 4 }}>
                    (showing venues with capacity ≥ {form.expectedAttendees})
                  </span>
                )}
              </label>
              {venuesLoading ? (
                <div style={{ padding: 12, color: 'var(--color-slate-400)', fontSize: '0.875rem' }}>Loading venues...</div>
              ) : (
                <select id="ce-venue" name="venueId" className="form-select" value={form.venueId} onChange={handleChange}>
                  <option value="">Select venue...</option>
                  {filteredVenues.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} — Capacity: {v.capacity}{v.instituteName ? ` · ${v.instituteName}` : ''}
                    </option>
                  ))}
                </select>
              )}
              {form.expectedAttendees && parseInt(form.expectedAttendees) > 0 && filteredVenues.length === 0 && (
                <div className="form-error" style={{ marginTop: 6 }}>
                  No venues available with capacity ≥ {form.expectedAttendees}. Try reducing the number.
                </div>
              )}
            </div>

            {/* Submit */}
            <button type="submit" className="login-btn" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? (
                <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating...</>
              ) : (
                <><span className="material-symbols-outlined">add_circle</span> Schedule Event</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

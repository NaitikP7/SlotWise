import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import FormInput from '../components/ui/FormInput';
import FormSelect from '../components/ui/FormSelect';
import { venueApi } from '../services/api';

const TIME_OPTIONS = [
  { value: '08:00', label: '08:00 AM' },
  { value: '09:00', label: '09:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '01:00 PM' },
  { value: '14:00', label: '02:00 PM' },
  { value: '15:00', label: '03:00 PM' },
  { value: '16:00', label: '04:00 PM' },
  { value: '17:00', label: '05:00 PM' },
  { value: '18:00', label: '06:00 PM' },
];

export default function CreateEventPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state || {};

  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);

  const [form, setForm] = useState({
    name: prefill.name || '',
    date: prefill.date || '',
    venueId: prefill.venue ? String(prefill.venue) : '',
    startTime: prefill.startTime || '',
    endTime: prefill.endTime || '',
  });

  // Fetch venues from database
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await venueApi.getAll();
        setVenues(res.data);
      } catch (err) {
        console.error('Failed to load venues:', err);
      } finally {
        setLoadingVenues(false);
      }
    };
    fetchVenues();
  }, []);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Collision detection — check against existing events
    // In a full implementation, this would be a backend API call
    // For now, redirect to conflict page if future event API detects collision
    const selectedVenue = venues.find(v => String(v.id) === form.venueId);

    // TODO: Once event API is available, check collision here:
    // const existingEvents = await eventApi.getByVenueAndDate(form.venueId, form.date);
    // const conflict = existingEvents.find(...overlap logic...)
    // if (conflict) { navigate('/conflict', { state: { ... } }); return; }

    alert('Event scheduled successfully!');
    navigate('/events');
  };

  const venueOptions = venues.map(v => ({ value: String(v.id), label: v.name }));

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative w-full">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl z-10 flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create New Event</h2>
          <p className="text-slate-500 mt-2">Enter the details below to schedule your event.</p>
        </div>

        {/* Pre-fill info banner */}
        {prefill.venueName && (
          <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-lg text-sm">
            <span className="material-symbols-outlined text-primary">info</span>
            <span className="text-slate-700">
              Pre-filled from dashboard: <strong>{prefill.venueName}</strong>, {prefill.startTime} – {prefill.endTime}
            </span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden relative">
          <div className="h-1 w-full bg-primary opacity-80" />
          <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
            <FormInput
              label="Event Name" id="event-name" placeholder="e.g., Spring Orientation"
              value={form.name} onChange={handleChange('name')} required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput label="Date" id="event-date" type="date" value={form.date} onChange={handleChange('date')} required />
              <FormSelect
                label="Venue" id="venue" placeholder={loadingVenues ? 'Loading...' : 'Select Venue'}
                value={form.venueId} onChange={handleChange('venueId')}
                options={venueOptions} required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSelect
                label="Start Time" id="start-time" placeholder="Select hour"
                value={form.startTime} onChange={handleChange('startTime')}
                options={TIME_OPTIONS} icon="schedule" required
              />
              <FormSelect
                label="End Time" id="end-time" placeholder="Select hour"
                value={form.endTime} onChange={handleChange('endTime')}
                options={TIME_OPTIONS} icon="schedule" required
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 mt-2 border-t border-slate-100">
              <Link to="/events" className="w-full sm:w-auto text-center px-6 py-3 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                Cancel
              </Link>
              <button
                type="submit"
                className="group w-full sm:w-auto px-10 py-3 rounded-lg bg-slate-900 text-white hover:bg-primary hover:text-black text-sm font-bold shadow-lg shadow-slate-200 transition-all duration-300"
              >
                Schedule Event
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400">
          Double-check availability in the{' '}
          <Link to="/" className="hover:text-primary transition-colors underline decoration-slate-300 underline-offset-2">
            Calendar View
          </Link>{' '}
          before submitting.
        </p>
      </div>
    </main>
  );
}

import { useLocation, useNavigate, Link } from 'react-router-dom';
import ConflictCard from '../components/domain/ConflictCard';
import { mockVenues } from '../data/mockData';

function addHours(time, hours) {
  const [h, m] = time.split(':').map(Number);
  const newH = h + hours;
  return `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function nextWeekday(dateStr) {
  const d = new Date(dateStr || Date.now());
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function ConflictResolutionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { newEvent, conflictingEvent, venue } = location.state || {};

  // If no conflict data, redirect back
  if (!conflictingEvent) {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-slate-500 mb-4">No conflict data found.</p>
          <Link to="/events/create" className="text-primary font-bold hover:underline">Go to Create Event</Link>
        </div>
      </main>
    );
  }

  const duration = parseInt(newEvent.endTime) - parseInt(newEvent.startTime);
  const newStartAfterConflict = addHours(conflictingEvent.endTime, 0.5 >= 0.5 ? 1 : 0);
  const newEndAfterConflict = addHours(newStartAfterConflict, duration || 2);

  // Find an alternative venue
  const altVenue = mockVenues.find(v => v.id !== parseInt(newEvent.venueId) && v.capacity && v.capacity >= 8);
  const nextDay = nextWeekday(newEvent.date);

  const suggestions = [
    {
      type: 'Time Shift',
      icon: 'schedule',
      label: 'Later same day',
      badge: 'Same Room',
      primary: `${newStartAfterConflict} - ${newEndAfterConflict}`,
      secondary: newEvent.date ? new Date(newEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Same day',
      venue: venue?.name || 'Same venue',
      data: { ...newEvent, startTime: newStartAfterConflict, endTime: newEndAfterConflict },
    },
    {
      type: 'Venue Change',
      icon: 'location_on',
      label: 'Nearby alternative',
      badge: 'Exact Time',
      primary: altVenue?.name || 'Conference Room B',
      secondary: '2nd Floor, East Wing',
      venue: `${newEvent.startTime} - ${newEvent.endTime} (${newEvent.date ? new Date(newEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Same date'})`,
      data: { ...newEvent, venueId: String(altVenue?.id || newEvent.venueId) },
    },
    {
      type: 'Date Change',
      icon: 'event_upcoming',
      label: 'Same time, next day',
      badge: 'Next Day',
      primary: nextDay,
      secondary: `${newEvent.startTime} - ${newEvent.endTime}`,
      venue: venue?.name || 'Same venue',
      data: { ...newEvent }, // would update date
    },
  ];

  const handleSelect = (suggestion) => {
    navigate('/events/create', { state: suggestion.data });
  };

  return (
    <main className="flex-1 flex justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-gray-200 pb-8">
          <Link to="/events/create" className="flex items-center gap-2 text-accent-lime-dark mb-1 hover:underline">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="text-xs font-bold uppercase tracking-widest">Back to Scheduling</span>
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight text-text-main">Conflict Resolution</h1>
          <p className="text-text-secondary text-lg">
            A collision was detected for your requested time slot. Select a recommended alternative to proceed.
          </p>
        </div>

        {/* Conflict Banner */}
        <div className="bg-white border-l-4 border-l-orange-400 rounded-r-2xl shadow-sm p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden ring-1 ring-gray-200">
          <div className="absolute right-0 top-0 h-full w-1/4 bg-gradient-to-l from-orange-50 to-transparent pointer-events-none" />
          <div className="flex items-start gap-6 relative z-10 w-full">
            <div className="size-14 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0 text-orange-600">
              <span className="material-symbols-outlined text-3xl font-bold">warning</span>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-text-main leading-tight">
                  Collision: {venue?.name || 'Selected Venue'}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
                  <span className="size-2 rounded-full bg-red-600 animate-pulse" /> Occupied
                </span>
              </div>
              <p className="text-text-secondary text-base leading-relaxed">
                The requested slot <strong className="text-text-main font-bold">
                  {newEvent.date ? new Date(newEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}, {newEvent.startTime} - {newEvent.endTime}
                </strong> is currently booked by '<em className="font-medium">{conflictingEvent.name}</em>' ({conflictingEvent.host || 'Unknown'}).
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-lg">group</span>
                  Capacity: {venue?.capacity || '—'} people
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-text-main">Suggested Alternatives</h2>
            <span className="bg-primary/20 text-accent-lime-dark text-xs font-black px-3 py-1 rounded-full border border-primary/30">
              {suggestions.length} OPTIONS FOUND
            </span>
          </div>
        </div>

        {/* Suggestion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((s, i) => (
            <ConflictCard key={i} {...s} onSelect={() => handleSelect(s)} />
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12 pb-12">
          <Link
            to="/"
            className="w-full sm:w-auto px-10 py-4 rounded-xl border border-gray-300 text-text-main font-bold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">close</span>
            Cancel Scheduling
          </Link>
          <button className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gray-100 text-text-secondary font-bold text-sm hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-xl">help</span>
            Request Override
          </button>
        </div>
      </div>
    </main>
  );
}

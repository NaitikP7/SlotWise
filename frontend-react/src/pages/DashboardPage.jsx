import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OccupancyGrid from '../components/domain/OccupancyGrid';
import EventModal from '../components/domain/EventModal';
import { venueApi } from '../services/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch venues from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const venueRes = await venueApi.getAll();
        setVenues(venueRes.data);
      } catch (err) {
        setError('Failed to load venues. Is the backend running?');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleSlotClick = (venue, startTime, endTime) => {
    const today = new Date().toISOString().split('T')[0];
    navigate('/events/create', {
      state: {
        venue: venue.id,
        venueName: venue.name,
        startTime,
        endTime,
        date: today,
      }
    });
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="animate-spin material-symbols-outlined text-4xl text-primary">progress_activity</span>
          <p className="text-slate-500 font-medium">Loading venues...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <span className="material-symbols-outlined text-5xl text-red-400 mb-4">cloud_off</span>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Error</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary text-slate-900 font-bold rounded-lg hover:brightness-105 transition-all">
            Retry
          </button>
        </div>
      </main>
    );
  }

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-background-light relative overflow-hidden">
      {/* Page header */}
      <header className="flex flex-col gap-4 p-6 border-b border-gray-200 bg-white z-20 shadow-sm shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-text-main text-2xl font-extrabold leading-tight tracking-tight">
              Venue Availability
            </h2>
            <p className="text-text-secondary text-sm font-normal">
              Manage bookings and view real-time occupancy across all institutional venues.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center h-9 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm">
              <span className="text-gray-500 mr-2">Date:</span>
              <span className="font-semibold">{today}</span>
            </div>
            <button
              onClick={() => navigate('/events/create')}
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-text-main text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-gray-200"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Create Event</span>
            </button>
          </div>
        </div>
      </header>

      {/* Occupancy Grid */}
      <OccupancyGrid
        venues={venues}
        events={[]}
        maintenanceVenueIds={[]}
        reservedSlots={[]}
        onEventClick={handleEventClick}
        onSlotClick={handleSlotClick}
      />

      {/* Legend */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white text-xs flex gap-8 items-center z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.02)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-red-50 border border-red-200" />
          <span className="font-medium text-gray-700">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-white border border-gray-200" />
          <span className="font-medium text-gray-700">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-[#f9fdeb] border border-primary" />
          <span className="font-medium text-gray-700">Selected / Hover</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-gray-50 border border-gray-200 flex items-center justify-center text-[10px] text-gray-400">
            <span className="material-symbols-outlined text-[10px]">build</span>
          </div>
          <span className="font-medium text-gray-700">Maintenance</span>
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedEvent(null); }}
      />
    </main>
  );
}

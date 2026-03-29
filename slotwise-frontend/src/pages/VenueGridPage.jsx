import { useState, useEffect } from 'react';
import { venueAPI, eventAPI } from '../services/api';

const HOURS = Array.from({ length: 10 }, (_, i) => 8 + i); // 08:00–17:00

export default function VenueGridPage() {
  const [venues, setVenues] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([venueAPI.getAll(), eventAPI.getAll()])
      .then(([vRes, eRes]) => { setVenues(vRes.data); setEvents(eRes.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDateDisplay = (dateStr) =>
    new Date(dateStr + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Get events for a specific venue on the selected date
  const getVenueEvents = (venueId) => {
    return events.filter(e => {
      if (e.venueId !== venueId) return false;
      const start = new Date(e.startTime);
      const evDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      return evDate === selectedDate;
    });
  };

  // Calculate pixel positioning for events
  const getEventStyle = (event) => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const top = (startHour - 8) * 80; // 80px per hour
    const height = (endHour - startHour) * 80;
    return { top: `${top}px`, height: `${Math.max(height, 40)}px` };
  };

  const fmtTime = (dt) => {
    const d = new Date(dt);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (loading) return <div className="loading-spinner" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', background: 'var(--color-surface)' }}>
      {/* Header */}
      <div className="venue-header-bar">
        <div>
          <h2>Venue Availability</h2>
          <p>Manage bookings and view real-time occupancy across all institutional venues.</p>
        </div>
        <div className="venue-header-controls">
          <div className="date-display">
            <span>Date:</span>
            <input type="date" value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                border: 'none', background: 'none', fontFamily: 'var(--font-family)',
                fontWeight: 600, fontSize: '0.875rem', outline: 'none', cursor: 'pointer',
              }}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {venues.length === 0 ? (
        <div className="empty-state" style={{ flex: 1 }}>
          <div className="empty-state-icon"><span className="material-symbols-outlined">location_off</span></div>
          <h3>No venues available</h3>
          <p>Add venues in the Admin panel to view the occupancy grid</p>
        </div>
      ) : (
        <>
          <div className="grid-scroll">
            <div className="grid-wrap">
              {/* Column headers */}
              <div className="grid-col-headers">
                <div className="grid-time-corner">
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--color-slate-400)' }}>schedule</span>
                </div>
                <div className="grid-venue-cols" style={{ gridTemplateColumns: `repeat(${venues.length}, 1fr)` }}>
                  {venues.map(v => (
                    <div key={v.id} className="grid-venue-header">
                      <h3>{v.name}</h3>
                      <p>Cap: {v.capacity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="grid-body">
                <div className="grid-time-col">
                  {HOURS.map(h => (
                    <div key={h} className="grid-time-cell">
                      {String(h).padStart(2, '0')}:00
                    </div>
                  ))}
                </div>
                <div className="grid-cells" style={{ gridTemplateColumns: `repeat(${venues.length}, 1fr)` }}>
                  {venues.map(venue => {
                    const venueEvents = getVenueEvents(venue.id);
                    return (
                      <div key={venue.id} className="grid-col">
                        {/* Empty cells for each hour */}
                        {HOURS.map(h => <div key={h} className="grid-empty-cell" />)}
                        {/* Event blocks */}
                        {venueEvents.map(ev => (
                          <div key={ev.id} className="grid-event grid-event-occupied"
                            style={getEventStyle(ev)} title={`${ev.title}\n${fmtTime(ev.startTime)} - ${fmtTime(ev.endTime)}`}>
                            <span className="grid-event-time">{fmtTime(ev.startTime)} - {fmtTime(ev.endTime)}</span>
                            <div className="grid-event-title">{ev.title}</div>
                            {ev.organizerName && <div className="grid-event-host">{ev.organizerName}</div>}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid-legend">
            <div className="grid-legend-item">
              <div className="grid-legend-swatch" style={{ background: 'var(--color-red-50)', border: '1px solid var(--color-red-200)' }} />
              <span className="grid-legend-label">Occupied</span>
            </div>
            <div className="grid-legend-item">
              <div className="grid-legend-swatch" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
              <span className="grid-legend-label">Available</span>
            </div>
            <div className="grid-legend-item">
              <div className="grid-legend-swatch" style={{ background: 'rgba(159, 223, 32, 0.07)', border: '1px solid var(--color-primary)' }} />
              <span className="grid-legend-label">Selected / Hover</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

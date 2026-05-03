import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI, venueAPI } from '../services/api';
import Modal from '../components/Modal';

/**
 * VenueGridPage — Dashboard scheduling grid
 * - Events span their full time range (not just individual cells)
 * - Booked events shown in light red
 * - Calendar date picker instead of arrows
 * - Legend for color codes
 * - Quick add "+" on empty cells
 * - Event detail modal on booked cells
 */
const TIME_SLOTS = [];
for (let h = 9; h <= 17; h++) {
  TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:00`);
}

export default function VenueGridPage() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [venues, setVenues] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vRes, eRes] = await Promise.all([venueAPI.getAll(), eventAPI.getAll()]);
      setVenues(vRes.data);
      setEvents(eRes.data);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Get events for a specific venue on the selected date
  const getVenueEvents = (venueId) => {
    return events.filter(ev => {
      if (String(ev.venueId) !== String(venueId)) return false;
      const evDate = new Date(ev.startTime).toISOString().split('T')[0];
      return evDate === selectedDate && ev.active;
    });
  };

  // Build a grid map: for each venue, which time slots are occupied and by which event
  const buildGridMap = (venueId) => {
    const venueEvents = getVenueEvents(venueId);
    const slotMap = {}; // { "09:00": { event, isStart, span } }
    
    TIME_SLOTS.forEach(time => {
      slotMap[time] = null; // empty by default
    });

    venueEvents.forEach(ev => {
      const evStart = new Date(ev.startTime);
      const evEnd = new Date(ev.endTime);
      const startHour = evStart.getHours();
      const endHour = Math.min(evEnd.getHours() + (evEnd.getMinutes() > 0 ? 1 : 0), 18);
      
      let isFirst = true;
      let span = Math.max(1, endHour - startHour);
      
      for (let h = startHour; h < endHour && h <= 17; h++) {
        const timeKey = `${h.toString().padStart(2, '0')}:00`;
        if (slotMap.hasOwnProperty(timeKey)) {
          if (isFirst) {
            slotMap[timeKey] = { event: ev, isStart: true, span: Math.min(span, 18 - h) };
            isFirst = false;
          } else {
            slotMap[timeKey] = { event: ev, isStart: false, span: 0 }; // continuation
          }
        }
      }
    });

    return slotMap;
  };

  // Get institute name for a venue
  const getInstituteName = (venueId) => {
    const venue = venues.find(v => String(v.id) === String(venueId));
    return venue?.instituteName || '';
  };

  // Quick add — navigate to create event with prefill
  const handleQuickAdd = (venue, timeStr) => {
    const startHour = parseInt(timeStr.split(':')[0], 10);
    const startTime = `${selectedDate}T${timeStr}`;
    const endTime = `${selectedDate}T${(startHour + 1).toString().padStart(2, '0')}:00`;
    navigate('/create-event', {
      state: {
        prefill: { venueId: String(venue.id), startTime, endTime },
      },
    });
  };

  // Scroll controls
  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatEventTime = (dt) => {
    if (!dt) return '';
    return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Venue scheduling overview</p>
        </div>
        {/* Date picker */}
        <div className="date-nav">
          <div className="dashboard-date-picker">
            <span className="material-symbols-outlined dashboard-date-icon">calendar_today</span>
            <input
              type="date"
              className="dashboard-date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            {isToday && <span className="badge badge-confirmed" style={{ fontSize: '0.625rem', marginLeft: 8 }}>Today</span>}
          </div>
          {!isToday && (
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
              Today
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="grid-legend">
        <div className="grid-legend-item">
          <span className="grid-legend-swatch grid-legend-booked" />
          <span>Booked</span>
        </div>
        <div className="grid-legend-item">
          <span className="grid-legend-swatch grid-legend-available" />
          <span>Available</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : error ? (
        <div className="error-alert"><span className="material-symbols-outlined">error</span><p>{error}</p></div>
      ) : venues.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><span className="material-symbols-outlined">domain</span></div>
          <h3>No venues available</h3>
          <p>Add venues in the Admin panel to start scheduling</p>
        </div>
      ) : (
        <div className="grid-wrapper">
          {/* Scroll controls */}
          {venues.length > 4 && (
            <div className="grid-scroll-controls">
              <button className="grid-scroll-btn" onClick={() => scroll(-1)} title="Scroll left">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="grid-scroll-info">{venues.length} venues · scroll to see all</span>
              <button className="grid-scroll-btn" onClick={() => scroll(1)} title="Scroll right">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}

          <div className="venue-grid-scroll" ref={scrollRef}>
            <table className="venue-grid">
              <thead>
                <tr>
                  <th className="grid-time-col">Time</th>
                  {venues.map(v => (
                    <th key={v.id} className="grid-venue-header">
                      <div className="venue-header-name">{v.name}</div>
                      <div className="venue-header-meta">
                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>groups</span> {v.capacity}
                        {v.instituteName && <> · {v.instituteName}</>}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map(time => (
                  <tr key={time}>
                    <td className="grid-time-cell">{time}</td>
                    {venues.map(venue => {
                      const gridMap = buildGridMap(venue.id);
                      const slotInfo = gridMap[time];
                      
                      // Skip continuation cells (they're merged into the start cell)
                      if (slotInfo && !slotInfo.isStart) {
                        return null; // skip — rowSpan handles it
                      }

                      if (slotInfo && slotInfo.isStart) {
                        const ev = slotInfo.event;
                        return (
                          <td key={`${venue.id}-${time}`} className="grid-cell grid-cell-booked"
                              rowSpan={slotInfo.span}>
                            <div className="grid-event-span" onClick={() => setSelectedEvent(ev)} title={ev.title}>
                              <span className="grid-event-title">{ev.title}</span>
                              <span className="grid-event-time">{formatEventTime(ev.startTime)} – {formatEventTime(ev.endTime)}</span>
                              {ev.organizerName && <span className="grid-event-org">{ev.organizerName}</span>}
                            </div>
                          </td>
                        );
                      }

                      // Empty slot
                      return (
                        <td key={`${venue.id}-${time}`} className="grid-cell grid-cell-empty">
                          <div className="grid-cell-add" onClick={() => handleQuickAdd(venue, time)} title="Quick add event">
                            <span className="material-symbols-outlined">add</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Event Details"
        footer={<button className="btn btn-primary" onClick={() => setSelectedEvent(null)}>Close</button>}>
        {selectedEvent && (
          <div className="event-detail-modal">
            <div className="edm-row">
              <span className="material-symbols-outlined edm-icon">event</span>
              <div><div className="edm-label">Event Name</div><div className="edm-value">{selectedEvent.title}</div></div>
            </div>
            {selectedEvent.description && (
              <div className="edm-row">
                <span className="material-symbols-outlined edm-icon">description</span>
                <div><div className="edm-label">Description</div><div className="edm-value">{selectedEvent.description}</div></div>
              </div>
            )}
            <div className="edm-row">
              <span className="material-symbols-outlined edm-icon">person</span>
              <div><div className="edm-label">Organizer</div><div className="edm-value">{selectedEvent.organizerName || '—'}</div></div>
            </div>
            {selectedEvent.departmentName && (
              <div className="edm-row">
                <span className="material-symbols-outlined edm-icon">folder</span>
                <div><div className="edm-label">Department</div><div className="edm-value">{selectedEvent.departmentName}</div></div>
              </div>
            )}
            <div className="edm-row">
              <span className="material-symbols-outlined edm-icon">location_on</span>
              <div><div className="edm-label">Venue</div><div className="edm-value">{selectedEvent.venueName || '—'}</div></div>
            </div>
            {getInstituteName(selectedEvent.venueId) && (
              <div className="edm-row">
                <span className="material-symbols-outlined edm-icon">school</span>
                <div><div className="edm-label">Institute</div><div className="edm-value">{getInstituteName(selectedEvent.venueId)}</div></div>
              </div>
            )}
            <div className="edm-row">
              <span className="material-symbols-outlined edm-icon">schedule</span>
              <div>
                <div className="edm-label">Time</div>
                <div className="edm-value">
                  {formatEventTime(selectedEvent.startTime)} – {formatEventTime(selectedEvent.endTime)}
                  <span style={{ marginLeft: 8, color: 'var(--color-slate-400)', fontSize: '0.8125rem' }}>
                    ({new Date(selectedEvent.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
                  </span>
                </div>
              </div>
            </div>
            {selectedEvent.eventType && (
              <div className="edm-row">
                <span className="material-symbols-outlined edm-icon">category</span>
                <div><div className="edm-label">Type</div><div className="edm-value"><span className="badge badge-muted">{selectedEvent.eventType}</span></div></div>
              </div>
            )}
            {selectedEvent.expectedAttendees && (
              <div className="edm-row">
                <span className="material-symbols-outlined edm-icon">groups</span>
                <div><div className="edm-label">Expected Attendees</div><div className="edm-value">{selectedEvent.expectedAttendees}</div></div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

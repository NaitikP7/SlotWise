import { useState, useMemo } from 'react';
import EventBlock from './EventBlock';

const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const SLOT_HEIGHT = 80; // px per hour

function timeToOffset(time) {
  const [h, m] = time.split(':').map(Number);
  return ((h - 8) * SLOT_HEIGHT) + (m / 60) * SLOT_HEIGHT;
}

function timeToDuration(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return ((eh * 60 + em) - (sh * 60 + sm)) / 60 * SLOT_HEIGHT;
}

function addOneHour(time) {
  const [h, m] = time.split(':').map(Number);
  return `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function OccupancyGrid({ venues, events, maintenanceVenueIds = [], reservedSlots = [], onEventClick, onSlotClick }) {
  const eventsByVenue = useMemo(() => {
    const map = {};
    venues.forEach(v => { map[v.id] = []; });
    events.forEach(e => {
      if (map[e.venueId]) map[e.venueId].push(e);
    });
    return map;
  }, [venues, events]);

  // Check if a given hour slot is occupied by an event for a given venue
  const isOccupied = (venueId, hour) => {
    const venueEvents = eventsByVenue[venueId] || [];
    const hourEnd = addOneHour(hour);
    return venueEvents.some(e => hour < e.endTime && e.startTime < hourEnd);
  };

  return (
    <div className="flex-1 overflow-auto relative bg-white">
      <div className="min-w-[1000px] inline-block w-full">
        {/* Header row */}
        <div className="sticky-header flex border-b border-gray-200 bg-white shadow-sm z-30">
          <div className="sticky-corner w-20 shrink-0 border-r border-gray-200 bg-gray-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-400 text-sm">schedule</span>
          </div>
          <div className="grid w-full divide-x divide-gray-100" style={{ gridTemplateColumns: `repeat(${venues.length}, 1fr)` }}>
            {venues.map(v => (
              <div key={v.id} className="p-4 text-center bg-white hover:bg-gray-50 transition-colors">
                <h3 className="font-bold text-sm text-text-main">{v.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {v.capacity ? `Cap: ${v.capacity}` : 'Public Space'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex relative">
          {/* Time column */}
          <div className="sticky-col w-20 shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col text-xs font-semibold text-gray-500 z-20">
            {HOURS.map(h => (
              <div key={h} className="h-20 flex items-center justify-center border-b border-gray-100">
                {h}
              </div>
            ))}
          </div>

          {/* Venue columns */}
          <div className="w-full grid divide-x divide-gray-100 bg-white relative" style={{ gridTemplateColumns: `repeat(${venues.length}, 1fr)` }}>
            {venues.map(v => {
              const isMaintenance = maintenanceVenueIds.includes(v.id);
              const venueEvents = eventsByVenue[v.id] || [];
              const venueReserved = reservedSlots.filter(r => r.venueId === v.id);

              return (
                <div key={v.id} className="relative" style={{ height: HOURS.length * SLOT_HEIGHT }}>
                  {isMaintenance ? (
                    <div className="absolute top-2 bottom-2 left-1 right-1 rounded bg-gray-50 border border-gray-200 flex flex-col items-center justify-center z-10 opacity-75">
                      <span className="material-symbols-outlined text-gray-400 mb-2">build_circle</span>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Maintenance</span>
                    </div>
                  ) : (
                    <>
                      {/* Blank tile slots — clickable for available slots */}
                      <div className="absolute inset-0 flex flex-col z-0">
                        {HOURS.map(h => {
                          const occupied = isOccupied(v.id, h);
                          return (
                            <div
                              key={h}
                              onClick={!occupied ? () => onSlotClick && onSlotClick(v, h, addOneHour(h)) : undefined}
                              className={`h-20 w-full border-b border-gray-100 transition-colors duration-150 ${
                                occupied
                                  ? ''
                                  : 'cursor-pointer hover:bg-[#f9fdeb] hover:border-primary/30'
                              }`}
                            />
                          );
                        })}
                      </div>

                      {/* Event blocks */}
                      {venueEvents.map(e => (
                        <EventBlock
                          key={e.id}
                          event={{ ...e, venueName: v.name, capacity: v.capacity }}
                          onClick={() => onEventClick && onEventClick({ ...e, venueName: v.name, capacity: v.capacity })}
                          style={{
                            top: timeToOffset(e.startTime),
                            height: timeToDuration(e.startTime, e.endTime),
                          }}
                        />
                      ))}

                      {/* Reserved blocks */}
                      {venueReserved.map((r, i) => (
                        <EventBlock
                          key={`r-${i}`}
                          event={{ ...r, name: r.label, reserved: true }}
                          style={{
                            top: timeToOffset(r.startTime),
                            height: timeToDuration(r.startTime, r.endTime),
                          }}
                        />
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { eventAPI } from '../services/api';
import { useToast } from '../components/Toast';

/**
 * ConflictResolutionPage — shown when event creation/edit hits a scheduling conflict.
 * Displays the conflicting event details and offers 3 alternative categories:
 *   A) Alternative time slots (same day, same venue) — ALL valid slots
 *   B) Alternative days (same time, same venue)
 *   C) Alternative venues (same time, same day) — with institute & capacity
 */
export default function ConflictResolutionPage({ conflictData, originalForm, onResolve, onBack }) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('time');
  const [selectedAlt, setSelectedAlt] = useState(null);
  const [creating, setCreating] = useState(false);

  if (!conflictData || !originalForm) {
    return (
      <div className="page-container">
        <div className="cr-empty-state">
          <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--color-text-muted)' }}>info</span>
          <h2>No conflict data</h2>
          <p>Return to the event creation form to start again.</p>
          <button className="btn btn-primary" onClick={() => onBack && onBack()}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            Back to Create Event
          </button>
        </div>
      </div>
    );
  }

  const { conflictingEvent, alternativeTimeSlots = [], alternativeDays = [], alternativeVenues = [] } = conflictData;

  const formatTime = (dt) => {
    if (!dt) return '';
    try {
      const d = new Date(dt);
      if (isNaN(d.getTime())) return String(dt);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return String(dt);
    }
  };

  const formatDate = (dt) => {
    if (!dt) return '';
    try {
      const d = new Date(dt);
      if (isNaN(d.getTime())) return String(dt);
      return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return String(dt);
    }
  };

  /**
   * Get "why recommended" label based on slot position
   */
  const getTimeSlotReason = (index, total) => {
    if (index === 0) return 'Closest to requested time';
    if (index === 1) return 'Next closest slot';
    return 'Available slot';
  };

  const handleSelect = (type, index) => {
    setSelectedAlt({ type, index });
  };

  const handleConfirm = async () => {
    if (!selectedAlt) {
      toast.error('No selection', 'Please select an alternative option first');
      return;
    }

    setCreating(true);
    let payload = { ...originalForm };

    if (selectedAlt.type === 'time') {
      const slot = alternativeTimeSlots[selectedAlt.index];
      payload.startTime = slot.startTime;
      payload.endTime = slot.endTime;
    } else if (selectedAlt.type === 'day') {
      const day = alternativeDays[selectedAlt.index];
      payload.startTime = day.startTime;
      payload.endTime = day.endTime;
    } else if (selectedAlt.type === 'venue') {
      const venue = alternativeVenues[selectedAlt.index];
      payload.venueId = venue.id;
    }

    try {
      await eventAPI.create(payload);
      toast.success('Event Created', `"${payload.title}" has been scheduled successfully`);
      if (onResolve) onResolve();
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('Still Conflicting', 'The selected alternative also has a conflict. Please try another option.');
      } else {
        const errMsg = typeof err.response?.data === 'string'
          ? err.response.data
          : (err.response?.data?.message || 'Failed to create event');
        toast.error('Error', errMsg);
      }
    } finally {
      setCreating(false);
    }
  };

  const tabs = [
    { id: 'time', label: 'Same Venue — Alt. Times', icon: 'schedule', count: alternativeTimeSlots.length },
    { id: 'day', label: 'Same Venue — Alt. Days', icon: 'calendar_month', count: alternativeDays.length },
    { id: 'venue', label: 'Alt. Venues — Same Time', icon: 'location_on', count: alternativeVenues.length },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Resolve Scheduling Conflict</h1>
          <p className="page-subtitle">Choose an alternative to reschedule your event</p>
        </div>
      </div>

      {/* Conflict Alert Banner */}
      <div className="cr-alert-banner">
        <div className="cr-alert-icon-wrap">
          <span className="material-symbols-outlined">warning</span>
        </div>
        <div className="cr-alert-content">
          <h3 className="cr-alert-title">This slot is already booked</h3>
          {conflictingEvent && (
            <div className="cr-conflict-details">
              <div className="cr-conflict-detail">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>event</span>
                <span><strong>{conflictingEvent.eventName}</strong></span>
              </div>
              <div className="cr-conflict-detail">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
                <span>{formatTime(conflictingEvent.startTime)} — {formatTime(conflictingEvent.endTime)}</span>
              </div>
              <div className="cr-conflict-detail">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>location_on</span>
                <span>{conflictingEvent.venueName}</span>
              </div>
              {conflictingEvent.organizerName && (
                <div className="cr-conflict-detail">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
                  <span>Booked by <strong>{conflictingEvent.organizerName}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Your Event Info */}
      <div className="cr-your-event">
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-primary)' }}>info</span>
        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Your event:</span>
        <strong style={{ color: 'var(--color-text)' }}>{originalForm.title}</strong>
        <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
          {formatTime(originalForm.startTime)} – {formatTime(originalForm.endTime)}
        </span>
      </div>

      {/* Tabs */}
      <div className="cr-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`cr-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.id); setSelectedAlt(null); }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{tab.icon}</span>
            <span className="cr-tab-label">{tab.label}</span>
            <span className="cr-tab-badge">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="cr-options-grid">
        {/* Time Slots — ALL valid slots, sorted by proximity */}
        {activeTab === 'time' && (
          alternativeTimeSlots.length > 0 ? (
            alternativeTimeSlots.map((slot, i) => (
              <div
                key={i}
                className={`cr-option-card ${selectedAlt?.type === 'time' && selectedAlt?.index === i ? 'selected' : ''}`}
                onClick={() => handleSelect('time', i)}
              >
                <div className="cr-option-icon">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div className="cr-option-body">
                  <div className="cr-option-title">
                    {formatTime(slot.startTime)} — {formatTime(slot.endTime)}
                  </div>
                  <div className="cr-option-sub">Same day • Same venue</div>
                  <div className="cr-option-reason">{getTimeSlotReason(i, alternativeTimeSlots.length)}</div>
                </div>
                <div className="cr-option-check">
                  <span className="material-symbols-outlined">
                    {selectedAlt?.type === 'time' && selectedAlt?.index === i ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="cr-no-options">
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-text-muted)' }}>event_busy</span>
              <p>No alternative time slots available on this day.</p>
            </div>
          )
        )}

        {/* Days */}
        {activeTab === 'day' && (
          alternativeDays.length > 0 ? (
            alternativeDays.map((day, i) => (
              <div
                key={i}
                className={`cr-option-card ${selectedAlt?.type === 'day' && selectedAlt?.index === i ? 'selected' : ''}`}
                onClick={() => handleSelect('day', i)}
              >
                <div className="cr-option-icon day">
                  <span className="material-symbols-outlined">calendar_month</span>
                </div>
                <div className="cr-option-body">
                  <div className="cr-option-title">{formatDate(day.startTime)}</div>
                  <div className="cr-option-sub">
                    {formatTime(day.startTime)} — {formatTime(day.endTime)} • Same venue
                  </div>
                  <div className="cr-option-reason">Same time slot, different day</div>
                </div>
                <div className="cr-option-check">
                  <span className="material-symbols-outlined">
                    {selectedAlt?.type === 'day' && selectedAlt?.index === i ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="cr-no-options">
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-text-muted)' }}>event_busy</span>
              <p>No alternative dates available in the next 7 days.</p>
            </div>
          )
        )}

        {/* Venues — with institute + capacity */}
        {activeTab === 'venue' && (
          alternativeVenues.length > 0 ? (
            alternativeVenues.map((venue, i) => (
              <div
                key={i}
                className={`cr-option-card ${selectedAlt?.type === 'venue' && selectedAlt?.index === i ? 'selected' : ''}`}
                onClick={() => handleSelect('venue', i)}
              >
                <div className="cr-option-icon venue">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div className="cr-option-body">
                  <div className="cr-option-title">{venue.name}</div>
                  <div className="cr-option-sub">
                    {venue.capacity} seats • {venue.location || 'No location'} • Same time
                  </div>
                  {venue.instituteName && (
                    <div className="cr-option-institute">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>school</span>
                      {venue.instituteName}
                    </div>
                  )}
                  <div className="cr-option-reason">Available venue at same time</div>
                </div>
                <div className="cr-option-check">
                  <span className="material-symbols-outlined">
                    {selectedAlt?.type === 'venue' && selectedAlt?.index === i ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="cr-no-options">
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-text-muted)' }}>location_off</span>
              <p>No alternative venues available at this time.</p>
            </div>
          )
        )}
      </div>

      {/* Actions */}
      <div className="cr-actions">
        <button className="btn btn-secondary" onClick={() => onBack && onBack()}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          disabled={!selectedAlt || creating}
          onClick={handleConfirm}
        >
          {creating ? (
            <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating...</>
          ) : (
            <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span> Select & Continue</>
          )}
        </button>
      </div>
    </div>
  );
}

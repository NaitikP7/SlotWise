import { useState, useRef, useEffect } from 'react';

const PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 3 months', days: 90 },
  { label: 'Last 6 months', days: 180 },
  { label: 'Last year', days: 365 },
  { label: 'All time', days: null },
];

/**
 * Date range filter with presets and custom range
 */
export default function DateFilter({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeLabel = PRESETS.find(p => p.days === value.days)?.label || 'Custom Range';

  const selectPreset = (preset) => {
    if (preset.days === null) {
      onChange({ days: null, fromDate: null, toDate: null });
    } else {
      const now = new Date();
      const from = new Date(now);
      from.setDate(from.getDate() - preset.days);
      onChange({
        days: preset.days,
        fromDate: from.toISOString(),
        toDate: now.toISOString(),
      });
    }
    setOpen(false);
    setCustomMode(false);
  };

  const applyCustom = () => {
    if (customFrom && customTo) {
      onChange({
        days: -1,
        fromDate: new Date(customFrom).toISOString(),
        toDate: new Date(customTo + 'T23:59:59').toISOString(),
      });
      setOpen(false);
    }
  };

  return (
    <div className="date-filter" ref={ref} id="analytics-date-filter">
      <button className="date-filter-btn" onClick={() => setOpen(!open)}>
        <span className="material-symbols-outlined">calendar_today</span>
        {activeLabel}
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_more</span>
      </button>
      {open && (
        <div className="date-filter-dropdown">
          {!customMode ? (
            <>
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  className={`date-filter-option ${p.days === value.days ? 'active' : ''}`}
                  onClick={() => selectPreset(p)}
                >
                  {p.label}
                </button>
              ))}
              <div className="date-filter-divider" />
              <button className="date-filter-option" onClick={() => setCustomMode(true)}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>date_range</span>
                Custom Range
              </button>
            </>
          ) : (
            <div className="date-filter-custom">
              <div className="date-filter-custom-row">
                <label>From</label>
                <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="form-input" style={{ height: 36, fontSize: '0.8125rem' }} />
              </div>
              <div className="date-filter-custom-row">
                <label>To</label>
                <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="form-input" style={{ height: 36, fontSize: '0.8125rem' }} />
              </div>
              <div className="date-filter-custom-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => setCustomMode(false)}>Back</button>
                <button className="btn btn-lime btn-sm" onClick={applyCustom} disabled={!customFrom || !customTo}>Apply</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

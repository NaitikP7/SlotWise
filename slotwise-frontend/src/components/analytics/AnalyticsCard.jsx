/**
 * Reusable analytics stat card with icon, value, trend indicator
 */
export default function AnalyticsCard({ label, value, icon, color, bgColor, sub, trend, trendLabel, title }) {
  const trendUp = trend > 0;
  const trendDown = trend < 0;

  return (
    <div className="analytics-stat-card" id={`analytics-card-${label?.toLowerCase().replace(/\s+/g, '-')}`} title={title || ''}>
      <div className="analytics-stat-card-icon" style={{ background: bgColor || 'rgba(159,223,32,0.1)', color: color || '#9FDF20' }}>
        <span className="material-symbols-outlined">{icon || 'analytics'}</span>
      </div>
      <div className="analytics-stat-card-content">
        <div className="analytics-stat-card-label">{label}</div>
        <div className="analytics-stat-card-value" style={{ wordBreak: 'break-word' }}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {(sub || trend !== undefined) && (
          <div className="analytics-stat-card-footer">
            {trend !== undefined && trend !== null && (
              <span className={`trend-indicator ${trendUp ? 'trend-up' : trendDown ? 'trend-down' : 'trend-flat'}`}>
                <span className="material-symbols-outlined">
                  {trendUp ? 'trending_up' : trendDown ? 'trending_down' : 'trending_flat'}
                </span>
                {Math.abs(trend).toFixed(1)}%
              </span>
            )}
            {sub && <span className="analytics-stat-card-sub">{sub}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

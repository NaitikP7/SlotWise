/**
 * Skeleton loading placeholder for analytics cards and charts
 */
export function CardSkeleton({ count = 4 }) {
  return (
    <div className="analytics-cards-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="analytics-stat-card skeleton-card">
          <div className="skeleton skeleton-icon" />
          <div className="skeleton-content">
            <div className="skeleton skeleton-label" />
            <div className="skeleton skeleton-value" />
            <div className="skeleton skeleton-sub" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ count = 2 }) {
  return (
    <div className="analytics-charts-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="chart-card skeleton-chart">
          <div className="skeleton skeleton-chart-title" />
          <div className="skeleton skeleton-chart-body" />
        </div>
      ))}
    </div>
  );
}

export function FullSkeleton() {
  return (
    <>
      <CardSkeleton count={5} />
      <ChartSkeleton count={3} />
    </>
  );
}

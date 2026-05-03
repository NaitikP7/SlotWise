/**
 * Reusable chart wrapper card
 */
export default function ChartCard({ title, description, children, className = '' }) {
  return (
    <div className={`chart-card ${className}`}>
      <div className="chart-card-header">
        <h3 className="chart-card-title">{title}</h3>
        {description && <p className="chart-card-desc">{description}</p>}
      </div>
      <div className="chart-card-body">
        {children}
      </div>
    </div>
  );
}

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import AnalyticsCard from './AnalyticsCard';
import ChartCard from './ChartCard';
import { FullSkeleton } from './SkeletonLoader';

const COLORS = ['#9FDF20', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="analytics-tooltip">
      <p className="analytics-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function OverviewTab({ data, loading }) {
  if (loading) return <FullSkeleton />;
  if (!data) return <div className="analytics-empty">No data available</div>;

  const cards = [
    { label: 'Total Events', value: data.totalEvents, icon: 'event', color: '#9FDF20', bgColor: 'rgba(159,223,32,0.1)', sub: `${data.activeEvents} active`, trend: data.eventsGrowthPercent },
    { label: 'Active Venues', value: data.activeVenues, icon: 'location_on', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.1)', sub: `of ${data.totalVenues} total` },
    { label: 'Avg Utilization', value: `${data.averageUtilization}%`, icon: 'speed', color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.1)', sub: 'across all venues' },
    { label: 'Conflicts', value: data.totalConflicts, icon: 'warning', color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)', sub: 'in selected period' },
    { label: 'Previous Period', value: data.previousPeriodEvents, icon: 'history', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)', sub: 'events comparison' },
  ];

  return (
    <>
      <div className="analytics-cards-grid" id="overview-stats">
        {cards.map(c => <AnalyticsCard key={c.label} {...c} />)}
      </div>

      <div className="analytics-charts-grid">
        {/* Events per month */}
        <ChartCard title="Events Over Time" description="Monthly event distribution" className="chart-wide">
          {data.eventsPerMonth?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.eventsPerMonth} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Events" fill="#9FDF20" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No event data for this period</div>
          )}
        </ChartCard>

        {/* Event Type Distribution */}
        <ChartCard title="Event Type Distribution" description="Breakdown by event category">
          {data.eventTypeDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.eventTypeDistribution} dataKey="count" nameKey="type" cx="50%" cy="45%" outerRadius={90} innerRadius={45} paddingAngle={3} label={false} labelLine={false}>
                  {data.eventTypeDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 12, paddingLeft: 16 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              <span className="material-symbols-outlined">pie_chart</span>
              <p>No event type data yet</p>
              <p className="chart-empty-sub">Event types will appear here once events are tagged</p>
            </div>
          )}
        </ChartCard>

        {/* Day of Week Distribution */}
        <ChartCard title="Bookings by Day" description="Which days are most popular">
          {data.bookingsByDayOfWeek?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.bookingsByDayOfWeek} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Events" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No day-of-week data for this period</div>
          )}
        </ChartCard>
      </div>
    </>
  );
}

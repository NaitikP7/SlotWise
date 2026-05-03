import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import AnalyticsCard from './AnalyticsCard';
import ChartCard from './ChartCard';
import { FullSkeleton } from './SkeletonLoader';

const VENUE_COLORS = ['#9FDF20', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#06b6d4', '#ec4899', '#14b8a6', '#f97316'];

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

export default function VenueAnalyticsTab({ data, loading }) {
  if (loading) return <FullSkeleton />;
  if (!data) return <div className="analytics-empty">No data available</div>;

  const cards = [
    { label: 'Most Booked', value: data.mostBookedVenue || 'N/A', icon: 'emoji_events', color: '#9FDF20', bgColor: 'rgba(159,223,32,0.1)', sub: data.mostBookedVenueCount ? `${data.mostBookedVenueCount} bookings` : '' },
    { label: 'Least Used', value: data.leastUsedVenue || 'N/A', icon: 'event_busy', color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)', sub: data.leastUsedVenueCount !== undefined ? `${data.leastUsedVenueCount} bookings` : '' },
    { label: 'Avg Utilization', value: `${data.averageUtilization || 0}%`, icon: 'speed', color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.1)', sub: 'across all venues' },
    { label: 'Peak Day', value: data.peakBookingDay || 'N/A', icon: 'today', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.1)', sub: 'most popular day' },
  ];

  // Top 10 venues bar chart data
  const top10 = (data.venueStats || []).slice(0, 10);

  // Monthly by venue — pivot into stacked bar chart data
  const monthlyData = buildMonthlyStackedData(data.monthlyByVenue || [], data.venueStats || []);

  return (
    <>
      <div className="analytics-cards-grid" id="venue-stats">
        {cards.map(c => <AnalyticsCard key={c.label} {...c} />)}
      </div>

      <div className="analytics-charts-grid">
        {/* Top Venues by Bookings */}
        <ChartCard title="Venue Bookings Comparison" description="Top venues by number of bookings" className="chart-wide">
          {top10.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={top10} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <YAxis type="category" dataKey="venueName" tick={{ fontSize: 11, fill: '#64748b' }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="bookingCount" name="Bookings" fill="#9FDF20" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No venue booking data</div>
          )}
        </ChartCard>

        {/* Utilization Rate */}
        <ChartCard title="Venue Utilization Rate" description="Utilization percentage by venue">
          {top10.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={top10} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} unit="%" />
                <YAxis type="category" dataKey="venueName" tick={{ fontSize: 11, fill: '#64748b' }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="utilizationPercent" name="Utilization" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No utilization data</div>
          )}
        </ChartCard>

        {/* Monthly Venue Breakdown */}
        <ChartCard title="Monthly Venue Activity" description="Bookings per venue over time" className="chart-wide">
          {monthlyData.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {monthlyData.venues.map((v, i) => (
                  <Bar key={v} dataKey={v} stackId="a" fill={VENUE_COLORS[i % VENUE_COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No monthly venue data</div>
          )}
        </ChartCard>
      </div>
    </>
  );
}

function buildMonthlyStackedData(monthlyByVenue, venueStats) {
  if (!monthlyByVenue.length) return { data: [], venues: [] };

  // Get top 5 venue names
  const topVenues = venueStats.slice(0, 5).map(v => v.venueName);
  const venueSet = new Set(topVenues);

  // Group by month label
  const monthMap = {};
  monthlyByVenue.forEach(item => {
    if (!venueSet.has(item.venueName)) return;
    if (!monthMap[item.label]) monthMap[item.label] = { label: item.label };
    monthMap[item.label][item.venueName] = item.count;
  });

  return {
    data: Object.values(monthMap),
    venues: topVenues,
  };
}

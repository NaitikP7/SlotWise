import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import AnalyticsCard from './AnalyticsCard';
import ChartCard from './ChartCard';
import { FullSkeleton } from './SkeletonLoader';

const COLORS = ['#9FDF20', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

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

/**
 * Format hour number to readable time (e.g., 9 → "9:00 AM", 14 → "2:00 PM")
 */
const formatHour = (h) => {
  if (h === 0) return '12:00 AM';
  if (h < 12) return `${h}:00 AM`;
  if (h === 12) return '12:00 PM';
  return `${h - 12}:00 PM`;
};

export default function ConflictTab({ data, loading }) {
  if (loading) return <FullSkeleton />;
  if (!data) return <div className="analytics-empty">No data available</div>;

  const cards = [
    { label: 'Total Conflicts', value: data.totalConflicts, icon: 'warning', color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)', sub: 'in selected period' },
    { label: 'Resolved', value: data.resolvedConflicts, icon: 'check_circle', color: '#10b981', bgColor: 'rgba(16,185,129,0.1)', sub: 'successfully handled' },
    { label: 'Resolution Rate', value: `${data.resolutionRatePercent}%`, icon: 'percent', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.1)', sub: 'of all conflicts' },
    { label: 'Peak Clash Hour', value: data.totalConflicts > 0 ? formatHour(data.peakClashHour) : '—', icon: 'nest_clock_farsight_analog', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)', sub: 'most conflicts at' },
    { label: 'Alt. Slot Used', value: `${data.alternateSlotPercent}%`, icon: 'schedule', color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.1)', sub: 'slot/day changes' },
    { label: 'Alt. Venue Used', value: `${data.alternateVenuePercent}%`, icon: 'swap_horiz', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)', sub: 'venue changes' },
  ];

  return (
    <>
      <div className="analytics-cards-grid" id="conflict-stats">
        {cards.map(c => <AnalyticsCard key={c.label} {...c} />)}
      </div>

      <div className="analytics-charts-grid">
        {/* Monthly Conflict Trend */}
        <ChartCard title="Conflict Trend" description="Monthly conflict occurrence" className="chart-wide">
          {data.monthlyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" name="Conflicts" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              <span className="material-symbols-outlined" style={{ color: '#10b981' }}>verified</span>
              <p>No conflicts recorded</p>
              <p className="chart-empty-sub">Great news! No scheduling conflicts in this period</p>
            </div>
          )}
        </ChartCard>

        {/* Top Conflict Venues */}
        <ChartCard title="Top Conflict Venues" description="Venues with most scheduling conflicts">
          {data.topConflictVenues?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topConflictVenues} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <YAxis type="category" dataKey="venueName" tick={{ fontSize: 11, fill: '#64748b' }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="conflictCount" name="Conflicts" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No venue conflict data</div>
          )}
        </ChartCard>

        {/* Resolution Methods */}
        <ChartCard title="Resolution Methods" description="How conflicts were resolved">
          {data.resolutionMethods?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.resolutionMethods} dataKey="count" nameKey="method" cx="50%" cy="45%" outerRadius={90} innerRadius={45} paddingAngle={3} label={false} labelLine={false}>
                  {data.resolutionMethods.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 12, paddingLeft: 16 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No resolution data</div>
          )}
        </ChartCard>

        {/* Top Conflict Organizers — Phase 17 */}
        <ChartCard title="Frequent Conflict Users" description="Organizers who encounter most conflicts">
          {data.topConflictOrganizers?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topConflictOrganizers.slice(0, 8)} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <YAxis type="category" dataKey="organizerName" tick={{ fontSize: 11, fill: '#64748b' }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="conflictCount" name="Conflicts" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No organizer conflict data</div>
          )}
        </ChartCard>
      </div>
    </>
  );
}

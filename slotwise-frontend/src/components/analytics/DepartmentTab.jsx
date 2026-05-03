import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import AnalyticsCard from './AnalyticsCard';
import ChartCard from './ChartCard';
import { FullSkeleton } from './SkeletonLoader';

const COLORS = ['#9FDF20', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#06b6d4', '#ec4899'];

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
 * Custom tooltip for pie chart showing department name + count
 */
const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="analytics-tooltip">
      <p className="analytics-tooltip-label">{entry.name}</p>
      <p style={{ color: entry.payload.fill }}>
        Events: <strong>{entry.value}</strong> ({(entry.percent * 100).toFixed(1)}%)
      </p>
    </div>
  );
};

export default function DepartmentTab({ data, loading }) {
  if (loading) return <FullSkeleton />;
  if (!data) return <div className="analytics-empty">No data available</div>;

  // Build the most active department display with institute info
  const mostActiveDeptDisplay = data.mostActiveDepartment || 'N/A';
  const mostActiveDeptFull = data.mostActiveDepartmentInstitute
    ? `${data.mostActiveDepartment}\n${data.mostActiveDepartmentInstitute}`
    : data.mostActiveDepartment || 'N/A';

  const cards = [
    {
      label: 'Most Active Dept',
      value: mostActiveDeptDisplay,
      icon: 'corporate_fare',
      color: '#9FDF20',
      bgColor: 'rgba(159,223,32,0.1)',
      sub: data.mostActiveDeptEventCount ? `${data.mostActiveDeptEventCount} events` : '',
      title: mostActiveDeptFull, // full name on hover
    },
    { label: 'Top Organizer', value: data.topOrganizer || 'N/A', icon: 'person', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.1)', sub: data.topOrganizerEventCount ? `${data.topOrganizerEventCount} events` : '' },
    { label: 'Inactive Depts', value: data.inactiveDepartments, icon: 'do_not_disturb', color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)', sub: 'no events in period' },
    { label: 'New Users', value: data.newUsersAdded, icon: 'person_add', color: '#10b981', bgColor: 'rgba(16,185,129,0.1)', sub: 'added in period' },
  ];

  const deptData = (data.eventsByDepartment || []).slice(0, 10);
  const orgData = (data.topOrganizers || []).slice(0, 10);

  return (
    <>
      <div className="analytics-cards-grid" id="department-stats">
        {cards.map(c => <AnalyticsCard key={c.label} {...c} />)}
      </div>

      <div className="analytics-charts-grid">
        {/* Events by Department */}
        <ChartCard title="Events by Department" description="Top departments by event count" className="chart-wide">
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={deptData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <YAxis type="category" dataKey="departmentName" tick={{ fontSize: 11, fill: '#64748b' }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="eventCount" name="Events" fill="#9FDF20" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No department event data</div>
          )}
        </ChartCard>

        {/* Top Organizers */}
        <ChartCard title="Top Organizers" description="Most active event organizers">
          {orgData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={orgData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <YAxis type="category" dataKey="organizerName" tick={{ fontSize: 11, fill: '#64748b' }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="eventCount" name="Events" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No organizer data</div>
          )}
        </ChartCard>

        {/* Department Event Distribution (Pie) — legends only, no label arrows */}
        <ChartCard title="Event Share by Department" description="Proportional distribution">
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={deptData}
                  dataKey="eventCount"
                  nameKey="departmentName"
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  innerRadius={45}
                  paddingAngle={3}
                  label={false}
                  labelLine={false}
                >
                  {deptData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: 12, paddingLeft: 16 }}
                  formatter={(value) => <span style={{ color: '#475569', fontWeight: 500 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No department distribution data</div>
          )}
        </ChartCard>

        {/* User Growth Trend */}
        <ChartCard title="User Growth Trend" description="New users added per month" className="chart-wide">
          {data.departmentGrowthTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.departmentGrowthTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" name="New Users" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No user growth data</div>
          )}
        </ChartCard>
      </div>
    </>
  );
}

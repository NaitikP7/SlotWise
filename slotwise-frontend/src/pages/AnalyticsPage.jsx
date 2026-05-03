import { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '../services/api';
import { exportCSV, exportExcel, exportPDF, flattenForExport } from '../utils/exportUtils';
import DateFilter from '../components/analytics/DateFilter';
import ExportButtons from '../components/analytics/ExportButtons';
import OverviewTab from '../components/analytics/OverviewTab';
import VenueAnalyticsTab from '../components/analytics/VenueAnalyticsTab';
import DepartmentTab from '../components/analytics/DepartmentTab';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'venue', label: 'Venue Analytics', icon: 'location_on' },
  { id: 'departments', label: 'Department Activity', icon: 'corporate_fare' },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateFilter, setDateFilter] = useState({ days: 30, fromDate: getDateNDaysAgo(30), toDate: new Date().toISOString() });
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFilter.fromDate) params.fromDate = dateFilter.fromDate;
      if (dateFilter.toDate) params.toDate = dateFilter.toDate;

      let res;
      switch (activeTab) {
        case 'overview':
          res = await analyticsAPI.getOverview(params);
          break;
        case 'venue':
          res = await analyticsAPI.getVenue(params);
          break;
        case 'departments':
          res = await analyticsAPI.getDepartments(params);
          break;
        default:
          break;
      }
      if (res?.data) {
        setData(prev => ({ ...prev, [activeTab]: res.data }));
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, dateFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Export handlers
  const handleExportCSV = () => {
    const exportData = getExportData();
    if (exportData.length) exportCSV(exportData, `slotwise-${activeTab}-analytics`);
  };

  const handleExportExcel = () => {
    const exportData = getExportData();
    if (exportData.length) exportExcel(exportData, `slotwise-${activeTab}-analytics`, activeTab);
  };

  const handleExportPDF = () => {
    const exportData = getExportData();
    const tabLabel = TABS.find(t => t.id === activeTab)?.label || 'Analytics';
    if (exportData.length) exportPDF(exportData, `SlotWise — ${tabLabel}`, `slotwise-${activeTab}-analytics`);
  };

  const getExportData = () => {
    const d = data[activeTab];
    if (!d) return [];

    switch (activeTab) {
      case 'overview':
        return flattenForExport(d.eventsPerMonth || [], {
          label: 'Month', count: 'Events',
        });
      case 'venue':
        return flattenForExport(d.venueStats || [], {
          venueName: 'Venue', bookingCount: 'Bookings', bookedHours: 'Booked Hours', utilizationPercent: 'Utilization %',
        });
      case 'departments':
        return flattenForExport(d.eventsByDepartment || [], {
          departmentName: 'Department', instituteName: 'Institute', eventCount: 'Events',
        });
      default:
        return [];
    }
  };

  const currentData = data[activeTab];

  return (
    <div className="admin-layout" id="analytics-page">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">Analytics</div>
        <nav className="admin-sidebar-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin-nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              id={`analytics-tab-${tab.id}`}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <div className="page-container">
          {/* Header */}
          <div className="analytics-header">
            <div className="analytics-header-left">
              <h1 className="page-title">
                {TABS.find(t => t.id === activeTab)?.label || 'Analytics'}
              </h1>
              <p className="page-subtitle">
                {getTabDescription(activeTab)}
              </p>
            </div>
            <div className="analytics-header-right">
              <DateFilter value={dateFilter} onChange={setDateFilter} />
              <ExportButtons
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportPDF={handleExportPDF}
                disabled={loading || !currentData}
              />
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="analytics-mobile-tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`analytics-mobile-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="analytics-content">
            {activeTab === 'overview' && <OverviewTab data={currentData} loading={loading} />}
            {activeTab === 'venue' && <VenueAnalyticsTab data={currentData} loading={loading} />}
            {activeTab === 'departments' && <DepartmentTab data={currentData} loading={loading} />}
          </div>
        </div>
      </main>
    </div>
  );
}

function getDateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function getTabDescription(tab) {
  switch (tab) {
    case 'overview': return 'High-level metrics and trends across the platform';
    case 'venue': return 'Venue booking patterns, utilization rates, and capacity insights';
    case 'departments': return 'Department-level activity, organizer performance, and growth';
    default: return '';
  }
}

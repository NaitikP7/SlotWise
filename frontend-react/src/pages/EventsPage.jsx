import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/ui/Pagination';
import { mockEvents } from '../data/mockData';

const PAGE_SIZE = 6;

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(mockEvents.length / PAGE_SIZE);
  const visibleEvents = mockEvents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main className="max-w-7xl mx-auto w-full p-6 md:p-12">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Scheduled Events</h1>
          <p className="text-sm text-slate-500 mt-1">Administrative master schedule for the current term</p>
        </div>
        <Link
          to="/events/create"
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-sm active:scale-95 group"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:text-primary transition-colors">add</span>
          <span className="hidden sm:inline">New Event</span>
        </Link>
      </header>

      {/* Events Table */}
      <div className="bg-white rounded-xl border border-subtle-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-subtle-border">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[35%]">Event Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[15%]">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[15%]">Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[20%]">Venue</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[15%] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleEvents.map((event) => (
                <tr key={event.id} className="group hover:bg-primary/5 transition-colors duration-200">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-black transition-colors">{event.name}</span>
                      <span className="text-xs text-slate-400 mt-0.5">{event.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500 font-mono group-hover:text-slate-700 transition-colors">
                    {event.startTime} - {event.endTime}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                    {event.venue}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <StatusBadge status={event.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-700">{visibleEvents.length}</span> of{' '}
            <span className="font-bold text-slate-700">{mockEvents.length}</span> events
          </span>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </main>
  );
}

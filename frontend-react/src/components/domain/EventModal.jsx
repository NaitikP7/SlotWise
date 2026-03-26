import Modal from '../ui/Modal';

export default function EventModal({ event, isOpen, onClose }) {
  if (!event) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Event Details</h3>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-500 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="space-y-4">
          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-red-500 text-sm">event</span>
              <span className="text-xs font-bold text-red-700 uppercase tracking-wide">{event.name}</span>
            </div>
            <p className="text-sm text-gray-600">{event.startTime} - {event.endTime}</p>
            {event.host && <p className="text-xs text-gray-500 mt-1">Host: {event.host}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-[10px] uppercase text-gray-500 font-semibold">Venue</p>
              <p className="text-sm font-medium">{event.venueName || 'TBD'}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-[10px] uppercase text-gray-500 font-semibold">Attendees</p>
              <p className="text-sm font-medium">{event.capacity ? `${event.capacity} (Max)` : '—'}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Edit Event
          </button>
          <button className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm">
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function EventBlock({ event, onClick, style }) {
  const isReserved = event.reserved;
  const bgClass = isReserved
    ? 'bg-blue-50 border-blue-200'
    : 'bg-red-50 border-red-200 cursor-pointer hover:bg-red-100';

  return (
    <div
      className={`absolute left-1 right-1 rounded ${bgClass} border p-2 z-10 transition-colors shadow-sm`}
      style={style}
      onClick={!isReserved ? onClick : undefined}
    >
      {isReserved ? (
        <>
          <p className="text-[10px] text-blue-500 font-bold">RESERVED</p>
          <p className="text-xs font-bold text-blue-800 truncate">{event.name}</p>
        </>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
              {event.startTime} - {event.endTime}
            </span>
            {event.locked && (
              <span className="material-symbols-outlined text-red-300 text-sm">lock</span>
            )}
            {event.public && (
              <span className="material-symbols-outlined text-red-300 text-sm">public</span>
            )}
          </div>
          <p className="text-sm font-bold text-red-800 mt-1 leading-tight truncate">{event.name}</p>
          {event.host && (
            <p className="text-[10px] text-red-400 mt-0.5">Host: {event.host}</p>
          )}
        </>
      )}
    </div>
  );
}

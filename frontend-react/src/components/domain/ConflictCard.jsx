export default function ConflictCard({ type, icon, label, badge, primary, secondary, venue, onSelect }) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:bg-primary/[0.04] hover:border-primary/40 flex flex-col justify-between h-full relative cursor-pointer ring-1 ring-transparent hover:ring-primary/20">
      <div className="absolute top-6 right-6">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-primary group-hover:text-black text-xs font-bold border border-transparent transition-colors">
          {badge}
        </span>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-primary group-hover:text-black transition-all duration-300">
            <span className="material-symbols-outlined text-2xl">{icon}</span>
          </div>
          <div>
            <h4 className="font-bold text-lg text-text-main">{type}</h4>
            <p className="text-xs font-medium text-text-secondary">{label}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-black">
              {type === 'Venue Change' ? 'New Venue' : type === 'Date Change' ? 'New Date' : 'New Time Window'}
            </div>
            <div className="text-xl font-extrabold text-text-main">{primary}</div>
            <div className="text-sm font-medium text-text-secondary">{secondary}</div>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-text-main">
            <span className="material-symbols-outlined text-[20px] text-accent-lime-dark">
              {type === 'Venue Change' ? 'schedule' : 'meeting_room'}
            </span>
            <span>{venue}</span>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={onSelect}
          className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-bold shadow-sm hover:bg-primary hover:text-black transition-all duration-200"
        >
          Select Recommendation
        </button>
      </div>
    </div>
  );
}

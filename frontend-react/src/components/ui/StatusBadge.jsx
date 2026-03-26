export default function StatusBadge({ status }) {
  const config = {
    Confirmed: { bg: 'bg-[#9FDF20]/15', text: 'text-[#88c11a]', border: 'border-[#9FDF20]/30', dot: 'bg-[#9FDF20]' },
    Pending:   { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', dot: 'bg-amber-500' },
    Cancelled: { bg: 'bg-red-500/10',   text: 'text-red-500',   border: 'border-red-500/20',   dot: null, icon: 'close' },
    Active:    { bg: 'bg-[rgba(79,109,122,0.08)]', text: 'text-muted-blue-grey', border: 'border-[rgba(79,109,122,0.15)]', dot: 'bg-muted-blue-grey' },
    Inactive:  { bg: 'bg-[rgba(100,116,139,0.08)]', text: 'text-slate-500', border: 'border-[rgba(100,116,139,0.15)]', dot: 'bg-slate-400' },
  };

  const c = config[status] || config.Confirmed;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${c.bg} ${c.text} border ${c.border} uppercase tracking-wide`}>
      {c.dot && <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />}
      {c.icon && <span className="material-symbols-outlined text-[12px]">{c.icon}</span>}
      {status}
    </span>
  );
}

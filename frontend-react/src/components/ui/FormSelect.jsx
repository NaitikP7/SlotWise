export default function FormSelect({ label, id, value, onChange, options, placeholder, required, icon }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          required={required}
          className="input-transition w-full rounded-lg border border-slate-200 bg-white text-slate-800 px-4 py-3 text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer"
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-3.5 text-slate-400 pointer-events-none text-[20px]">
          {icon || 'expand_more'}
        </span>
      </div>
    </div>
  );
}

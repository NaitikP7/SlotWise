export default function FormInput({ label, icon, id, type = 'text', placeholder, value, onChange, required, children }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
          {label}
        </label>
      )}
      {children ? (
        children
      ) : (
        <input
          type={type}
          id={id}
          name={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="input-transition w-full rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 px-4 py-3 text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 font-medium"
        />
      )}
    </div>
  );
}

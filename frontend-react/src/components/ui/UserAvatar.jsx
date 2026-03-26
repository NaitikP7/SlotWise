export default function UserAvatar({ name }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-bold">
      {initials}
    </div>
  );
}

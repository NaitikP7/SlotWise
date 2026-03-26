import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/events', label: 'Events' },
    { to: '/events/create', label: 'Create Event' },
    ...(isAdmin ? [{ to: '/admin/users', label: 'Admin' }] : []),
  ];

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <nav className="w-full h-16 flex items-center justify-between px-6 lg:px-12 bg-white border-b border-gray-200 z-50 sticky top-0">
      <div className="flex items-center gap-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary flex items-center justify-center rounded-lg size-8 text-slate-900">
            <span className="material-symbols-outlined text-[20px] font-bold">bolt</span>
          </div>
          <h1 className="text-slate-900 text-lg font-extrabold tracking-tight">SlotWise</h1>
        </Link>
        <div className="hidden md:flex items-center gap-8 h-16">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-sm font-semibold h-full flex items-center border-b-2 transition-all ${
                  isActive
                    ? 'text-slate-900 border-primary'
                    : 'text-slate-500 border-transparent hover:text-slate-900 hover:border-slate-300'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-5">
        <button className="text-slate-500 hover:text-slate-900 flex items-center">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="flex items-center gap-3 pl-2">
          {user && (
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900">{user.name}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{user.role}</span>
            </div>
          )}
          <button
            onClick={logout}
            title="Sign out"
            className="cursor-pointer"
          >
            <div className="size-9 rounded-full bg-primary flex items-center justify-center font-bold text-sm text-slate-900 hover:ring-2 hover:ring-primary/40 transition-shadow">
              {initials}
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}

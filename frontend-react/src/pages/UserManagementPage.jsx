import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/ui/StatusBadge';
import UserAvatar from '../components/ui/UserAvatar';
import Pagination from '../components/ui/Pagination';
import { userApi, departmentApi } from '../services/api';

const PAGE_SIZE = 10;

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deptOpen, setDeptOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  // Fetch users and departments from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, deptsRes] = await Promise.all([
          userApi.getAll(),
          departmentApi.getAll(),
        ]);
        setUsers(usersRes.data);
        setDepartments(deptsRes.data);
      } catch (err) {
        setError('Failed to load users. Is the backend running?');
        console.error('User management fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // UserResponseDTO fields: id, name, email, departmentId, departmentName, role (ADMIN/USER), active
  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q
        || u.name?.toLowerCase().includes(q)
        || u.email?.toLowerCase().includes(q)
        || u.departmentName?.toLowerCase().includes(q);
      const matchDept = !deptFilter || u.departmentName === deptFilter;
      const matchRole = !roleFilter || u.role === roleFilter;
      return matchSearch && matchDept && matchRole;
    });
  }, [users, search, deptFilter, roleFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const roles = [...new Set(users.map(u => u.role).filter(Boolean))];

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="animate-spin material-symbols-outlined text-4xl text-primary">progress_activity</span>
          <p className="text-slate-500 font-medium">Loading users...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <span className="material-symbols-outlined text-5xl text-red-400 mb-4">cloud_off</span>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Error</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary text-slate-900 font-bold rounded-lg hover:brightness-105 transition-all">
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col px-10 py-8 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-text-main text-4xl font-black leading-tight tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-slate-500">Manage institutional access, roles, and permissions across the campus.</p>
        </div>
        <Link to="/admin/users/add">
          <button className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-6 bg-primary text-slate-900 text-sm font-bold leading-normal tracking-wide hover:brightness-105 transition-all shadow-md shadow-primary/10">
            <span className="material-symbols-outlined">person_add</span>
            <span>Add New User</span>
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-6 lg:col-span-8">
          <div className="flex w-full items-stretch rounded-lg h-12 shadow-sm border border-slate-200 bg-white">
            <div className="text-slate-400 flex items-center justify-center pl-4">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="flex w-full border-none bg-transparent focus:ring-0 text-text-main placeholder:text-slate-400 text-base font-normal px-4 outline-none"
              placeholder="Search by name, email, or department..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
        <div className="md:col-span-3 lg:col-span-2 relative">
          <button
            onClick={() => { setDeptOpen(!deptOpen); setRoleOpen(false); }}
            className="flex w-full h-12 items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 text-text-main hover:border-muted-blue-grey transition-colors"
          >
            <span className="text-sm font-medium">{deptFilter || 'Department'}</span>
            <span className="material-symbols-outlined text-slate-400">keyboard_arrow_down</span>
          </button>
          {deptOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              <button onClick={() => { setDeptFilter(''); setDeptOpen(false); setPage(1); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50">All Departments</button>
              {departments.map(d => (
                <button key={d.id} onClick={() => { setDeptFilter(d.name); setDeptOpen(false); setPage(1); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50">{d.name}</button>
              ))}
            </div>
          )}
        </div>
        <div className="md:col-span-3 lg:col-span-2 relative">
          <button
            onClick={() => { setRoleOpen(!roleOpen); setDeptOpen(false); }}
            className="flex w-full h-12 items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 text-text-main hover:border-muted-blue-grey transition-colors"
          >
            <span className="text-sm font-medium">{roleFilter || 'Role'}</span>
            <span className="material-symbols-outlined text-slate-400">filter_list</span>
          </button>
          {roleOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
              <button onClick={() => { setRoleFilter(''); setRoleOpen(false); setPage(1); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50">All Roles</button>
              {roles.map(r => (
                <button key={r} onClick={() => { setRoleFilter(r); setRoleOpen(false); setPage(1); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50">{r}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    {search || deptFilter || roleFilter ? 'No users match the current filters.' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                visible.map(user => (
                  <tr key={user.id} className="row-hover transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.name} />
                        <div className="font-bold text-text-main">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{user.email}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{user.departmentName || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold muted-badge">{user.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.active ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-muted-blue-grey hover:bg-slate-100 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
          <p className="text-sm text-slate-500">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users
          </p>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-8 p-6 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-10 flex items-center justify-center bg-muted-blue-grey/10 rounded-full text-muted-blue-grey">
            <span className="material-symbols-outlined">info</span>
          </div>
          <div>
            <h4 className="font-bold text-text-main">Admin Tools</h4>
            <p className="text-sm text-slate-500">Need to update multiple users? Use the CSV import tool to sync your institutional database.</p>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-all">
          <span className="material-symbols-outlined">upload_file</span>
          <span>Import CSV</span>
        </button>
      </div>
    </main>
  );
}

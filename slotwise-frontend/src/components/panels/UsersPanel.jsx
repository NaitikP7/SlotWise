import { useState, useEffect, useCallback } from 'react';
import { userAPI, departmentAPI, instituteAPI } from '../../services/api';
import Modal from '../Modal';
import DeleteConfirm from '../DeleteConfirm';
import { useToast } from '../Toast';

export default function UsersPanel() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', departmentId: '', role: 'USER', active: true });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [u, d, i] = await Promise.all([userAPI.getAll(), departmentAPI.getAll(), instituteAPI.getAll()]);
      setUsers(u.data);
      setDepartments(d.data);
      setInstitutes(i.data);
    }
    catch { setError('Failed to load users'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Build a lookup: departmentId -> instituteName
  const getInstituteName = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId);
    if (!dept) return '—';
    return dept.instituteName || '—';
  };

  const openCreate = () => { setEditingItem(null); setFormData({ name: '', email: '', password: '', departmentId: departments[0]?.id || '', role: 'USER', active: true }); setFormErrors({}); setShowForm(true); };
  const openEdit = (item) => { setEditingItem(item); setFormData({ name: item.name, email: item.email, password: '', departmentId: item.departmentId, role: item.role || 'USER', active: item.active !== false }); setFormErrors({}); setShowForm(true); };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Required';
    if (!formData.email.trim()) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email';
    if (!editingItem && !formData.password.trim()) e.password = 'Required';
    if (!formData.departmentId) e.departmentId = 'Required';
    setFormErrors(e); return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validate()) return;
    setFormLoading(true);
    const payload = { name: formData.name, email: formData.email, departmentId: Number(formData.departmentId), role: formData.role, active: formData.active };
    // Only include password if provided (avoids overwriting with empty string)
    if (formData.password && formData.password.trim()) payload.password = formData.password;
    try {
      if (editingItem) { await userAPI.update(editingItem.id, payload); toast.success('Updated', `"${formData.name}" updated`); }
      else { if (!formData.password) { toast.error('Error', 'Password is required for new users'); setFormLoading(false); return; } payload.password = formData.password; await userAPI.create(payload); toast.success('Created', `"${formData.name}" added`); }
      setShowForm(false); fetchData();
    } catch (err) {
      const errMsg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.status === 400 ? 'Email may already exist' : 'Operation failed');
      toast.error('Error', errMsg);
    }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await userAPI.delete(deleteItem.id); toast.success('Deleted', `"${deleteItem.name}" removed`); setDeleteItem(null); fetchData(); }
    catch { toast.error('Error', 'Failed to delete'); }
    finally { setDeleteLoading(false); }
  };

  const handleToggle = async (item) => {
    try {
      if (item.active) { await userAPI.deactivate(item.id); toast.info('Deactivated', `"${item.name}" deactivated`); }
      else { await userAPI.activate(item.id); toast.success('Activated', `"${item.name}" activated`); }
      fetchData();
    } catch { toast.error('Error', 'Failed to toggle status'); }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const colors = ['#5BA4B5', '#9B7ED8', '#E8A952', '#7FBB7F', '#E07070', '#6B89AB'];

  return (
    <>
      <div className="table-card">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-box"><span className="material-symbols-outlined">search</span>
              <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <span className="record-count"><strong>{filtered.length}</strong> records</span>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span> Add User
          </button>
        </div>
        {loading ? <div className="loading-spinner"><div className="spinner" /></div>
          : error ? <div className="error-alert"><span className="material-symbols-outlined">error</span><p>{error}</p></div>
          : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><span className="material-symbols-outlined">group</span></div>
              <h3>No users found</h3><p>{search ? 'Try adjusting your search' : 'Add your first user'}</p>
              {!search && <button className="btn btn-primary" onClick={openCreate}>Add User</button>}
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>User</th><th>Email</th><th>Department</th><th>Institute</th><th>Role</th><th>Status</th><th style={{ width: 100 }}>Actions</th></tr></thead>
                <tbody>
                  {filtered.map((item, idx) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="user-avatar-circle" style={{ background: `${colors[idx % colors.length]}22`, color: colors[idx % colors.length] }}>
                            {getInitials(item.name)}
                          </div>
                          <span className="cell-primary">{item.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-slate-500)' }}>{item.email}</td>
                      <td><span className="badge badge-muted">{item.departmentName || '—'}</span></td>
                      <td><span className="badge badge-info">{getInstituteName(item.departmentId)}</span></td>
                      <td><span className={`badge ${item.role === 'ADMIN' ? 'badge-warning' : 'badge-neutral'}`}>{item.role}</span></td>
                      <td>
                        <button className={`badge status-toggle ${item.active ? 'badge-confirmed' : 'badge-danger'}`}
                          onClick={() => handleToggle(item)} title={`Click to ${item.active ? 'deactivate' : 'activate'}`}>
                          <span className="badge-dot" />{item.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="row-action-btn" onClick={() => openEdit(item)} title="Edit"><span className="material-symbols-outlined">edit</span></button>
                          <button className="row-action-btn danger" onClick={() => setDeleteItem(item)} title="Delete"><span className="material-symbols-outlined">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingItem ? 'Edit User' : 'Add User'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)} disabled={formLoading}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit} disabled={formLoading}>{formLoading ? 'Saving...' : editingItem ? 'Update' : 'Create'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="u-name"><span className="material-symbols-outlined">person</span> Full Name</label>
            <input id="u-name" type="text" className={`form-input ${formErrors.name ? 'error' : ''}`} placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} autoFocus />
            {formErrors.name && <div className="form-error">{formErrors.name}</div>}
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="u-email"><span className="material-symbols-outlined">alternate_email</span> Email</label>
            <input id="u-email" type="email" className={`form-input ${formErrors.email ? 'error' : ''}`} placeholder="user@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            {formErrors.email && <div className="form-error">{formErrors.email}</div>}
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="u-pw"><span className="material-symbols-outlined">key</span> Password {editingItem && <span className="form-label-sub">(leave blank to keep)</span>}</label>
            <input id="u-pw" type="password" className={`form-input ${formErrors.password ? 'error' : ''}`} placeholder={editingItem ? '••••••••' : 'Enter password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            {formErrors.password && <div className="form-error">{formErrors.password}</div>}
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="u-dept"><span className="material-symbols-outlined">folder</span> Department</label>
            <select id="u-dept" className={`form-select ${formErrors.departmentId ? 'error' : ''}`} value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}>
              <option value="">Select...</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {formErrors.departmentId && <div className="form-error">{formErrors.departmentId}</div>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="u-role"><span className="material-symbols-outlined">shield_person</span> Role</label>
              <select id="u-role" className="form-select" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <option value="USER">User</option><option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="u-status"><span className="material-symbols-outlined">toggle_on</span> Status</label>
              <select id="u-status" className="form-select" value={formData.active ? 'true' : 'false'} onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}>
                <option value="true">Active</option><option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
      <DeleteConfirm isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} entityName="User" itemName={deleteItem?.name} loading={deleteLoading} />
    </>
  );
}

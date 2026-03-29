import { useState, useEffect, useCallback } from 'react';
import { departmentAPI, instituteAPI } from '../../services/api';
import Modal from '../Modal';
import DeleteConfirm from '../DeleteConfirm';
import { useToast } from '../Toast';

export default function DepartmentsPanel() {
  const toast = useToast();
  const [departments, setDepartments] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', instituteId: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try { const [d, i] = await Promise.all([departmentAPI.getAll(), instituteAPI.getAll()]); setDepartments(d.data); setInstitutes(i.data); }
    catch { setError('Failed to load departments'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditingItem(null); setFormData({ name: '', instituteId: institutes[0]?.id || '' }); setFormErrors({}); setShowForm(true); };
  const openEdit = (item) => { setEditingItem(item); setFormData({ name: item.name, instituteId: item.instituteId }); setFormErrors({}); setShowForm(true); };
  const validate = () => { const e = {}; if (!formData.name.trim()) e.name = 'Required'; if (!formData.instituteId) e.instituteId = 'Required'; setFormErrors(e); return !Object.keys(e).length; };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validate()) return;
    setFormLoading(true);
    const payload = { name: formData.name, instituteId: Number(formData.instituteId) };
    try {
      if (editingItem) { await departmentAPI.update(editingItem.id, payload); toast.success('Updated', `"${formData.name}" updated`); }
      else { await departmentAPI.create(payload); toast.success('Created', `"${formData.name}" added`); }
      setShowForm(false); fetchData();
    } catch (err) { toast.error('Error', err.response?.status === 400 ? 'Invalid data' : 'Operation failed'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await departmentAPI.delete(deleteItem.id); toast.success('Deleted', `"${deleteItem.name}" removed`); setDeleteItem(null); fetchData(); }
    catch { toast.error('Error', 'Failed to delete'); }
    finally { setDeleteLoading(false); }
  };

  const filtered = departments.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || (d.instituteName || '').toLowerCase().includes(search.toLowerCase()));
  const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <>
      <div className="table-card">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input type="text" placeholder="Search departments..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <span className="record-count"><strong>{filtered.length}</strong> records</span>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span> Add Department
          </button>
        </div>
        {loading ? <div className="loading-spinner"><div className="spinner" /></div>
          : error ? <div className="error-alert"><span className="material-symbols-outlined">error</span><p>{error}</p></div>
          : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><span className="material-symbols-outlined">folder</span></div>
              <h3>No departments found</h3>
              <p>{search ? 'Try adjusting your search' : 'Add your first department'}</p>
              {!search && <button className="btn btn-primary" onClick={openCreate}>Add Department</button>}
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Name</th><th>Institute</th><th>Created</th><th>Updated</th><th style={{ width: 100 }}>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id}>
                      <td style={{ color: 'var(--color-slate-400)' }}>#{item.id}</td>
                      <td><span className="cell-primary">{item.name}</span></td>
                      <td><span className="badge badge-info">{item.instituteName || '—'}</span></td>
                      <td>{fmtDate(item.createdAt)}</td>
                      <td>{fmtDate(item.updatedAt)}</td>
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
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingItem ? 'Edit Department' : 'Add Department'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)} disabled={formLoading}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit} disabled={formLoading}>{formLoading ? 'Saving...' : editingItem ? 'Update' : 'Create'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="dept-name"><span className="material-symbols-outlined">folder</span> Department Name</label>
            <input id="dept-name" type="text" className={`form-input ${formErrors.name ? 'error' : ''}`} placeholder="e.g. Computer Science" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} autoFocus />
            {formErrors.name && <div className="form-error">{formErrors.name}</div>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="dept-inst"><span className="material-symbols-outlined">account_balance</span> Institute</label>
            <select id="dept-inst" className={`form-select ${formErrors.instituteId ? 'error' : ''}`} value={formData.instituteId} onChange={(e) => setFormData({ ...formData, instituteId: e.target.value })}>
              <option value="">Select institute...</option>
              {institutes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            {formErrors.instituteId && <div className="form-error">{formErrors.instituteId}</div>}
          </div>
        </form>
      </Modal>
      <DeleteConfirm isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} entityName="Department" itemName={deleteItem?.name} loading={deleteLoading} />
    </>
  );
}

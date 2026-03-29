import { useState, useEffect, useCallback } from 'react';
import { instituteAPI } from '../../services/api';
import Modal from '../Modal';
import DeleteConfirm from '../DeleteConfirm';
import { useToast } from '../Toast';

export default function InstitutesPanel() {
  const toast = useToast();
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try { const res = await instituteAPI.getAll(); setInstitutes(res.data); }
    catch { setError('Failed to load institutes'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditingItem(null); setFormData({ name: '' }); setFormErrors({}); setShowForm(true); };
  const openEdit = (item) => { setEditingItem(item); setFormData({ name: item.name }); setFormErrors({}); setShowForm(true); };
  const validate = () => { const e = {}; if (!formData.name.trim()) e.name = 'Name is required'; setFormErrors(e); return !Object.keys(e).length; };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validate()) return;
    setFormLoading(true);
    try {
      if (editingItem) { await instituteAPI.update(editingItem.id, formData); toast.success('Updated', `"${formData.name}" updated`); }
      else { await instituteAPI.create(formData); toast.success('Created', `"${formData.name}" added`); }
      setShowForm(false); fetchData();
    } catch (err) { toast.error('Error', err.response?.status === 400 ? 'Name may already exist' : 'Operation failed'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await instituteAPI.delete(deleteItem.id); toast.success('Deleted', `"${deleteItem.name}" removed`); setDeleteItem(null); fetchData(); }
    catch { toast.error('Error', 'Failed to delete'); }
    finally { setDeleteLoading(false); }
  };

  const filtered = institutes.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <>
      <div className="table-card">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input type="text" placeholder="Search institutes..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <span className="record-count"><strong>{filtered.length}</strong> records</span>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span> Add Institute
          </button>
        </div>
        {loading ? <div className="loading-spinner"><div className="spinner" /></div>
          : error ? <div className="error-alert"><span className="material-symbols-outlined">error</span><p>{error}</p></div>
          : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><span className="material-symbols-outlined">account_balance</span></div>
              <h3>No institutes found</h3>
              <p>{search ? 'Try adjusting your search' : 'Add your first institute'}</p>
              {!search && <button className="btn btn-primary" onClick={openCreate}>Add Institute</button>}
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Name</th><th>Created</th><th>Updated</th><th style={{ width: 100 }}>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id}>
                      <td style={{ color: 'var(--color-slate-400)' }}>#{item.id}</td>
                      <td><span className="cell-primary">{item.name}</span></td>
                      <td>{fmtDate(item.createdAt)}</td>
                      <td>{fmtDate(item.updatedAt)}</td>
                      <td>
                        <div className="row-actions">
                          <button className="row-action-btn" onClick={() => openEdit(item)} title="Edit">
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button className="row-action-btn danger" onClick={() => setDeleteItem(item)} title="Delete">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingItem ? 'Edit Institute' : 'Add Institute'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)} disabled={formLoading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={formLoading}>{formLoading ? 'Saving...' : editingItem ? 'Update' : 'Create'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="inst-name"><span className="material-symbols-outlined">account_balance</span> Institute Name</label>
            <input id="inst-name" type="text" className={`form-input ${formErrors.name ? 'error' : ''}`} placeholder="e.g. MIT, Stanford" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} autoFocus />
            {formErrors.name && <div className="form-error">{formErrors.name}</div>}
          </div>
        </form>
      </Modal>
      <DeleteConfirm isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete}
        entityName="Institute" itemName={deleteItem?.name} loading={deleteLoading} />
    </>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { venueAPI, instituteAPI } from '../../services/api';
import Modal from '../Modal';
import DeleteConfirm from '../DeleteConfirm';
import { useToast } from '../Toast';

export default function VenuesPanel() {
  const toast = useToast();
  const [venues, setVenues] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', capacity: '', location: '', instituteId: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try { const [v, i] = await Promise.all([venueAPI.getAll(), instituteAPI.getAll()]); setVenues(v.data); setInstitutes(i.data); }
    catch { setError('Failed to load venues'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditingItem(null); setFormData({ name: '', capacity: '', location: '', instituteId: institutes[0]?.id || '' }); setFormErrors({}); setShowForm(true); };
  const openEdit = (item) => { setEditingItem(item); setFormData({ name: item.name, capacity: item.capacity || '', location: item.location || '', instituteId: item.instituteId }); setFormErrors({}); setShowForm(true); };
  const validate = () => { const e = {}; if (!formData.name.trim()) e.name = 'Required'; if (!formData.capacity || Number(formData.capacity) <= 0) e.capacity = 'Required'; if (!formData.location.trim()) e.location = 'Required'; if (!formData.instituteId) e.instituteId = 'Required'; setFormErrors(e); return !Object.keys(e).length; };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validate()) return;
    setFormLoading(true);
    const payload = { name: formData.name, capacity: Number(formData.capacity), location: formData.location, instituteId: Number(formData.instituteId) };
    try {
      if (editingItem) { await venueAPI.update(editingItem.id, payload); toast.success('Updated', `"${formData.name}" updated`); }
      else { await venueAPI.create(payload); toast.success('Created', `"${formData.name}" added`); }
      setShowForm(false); fetchData();
    } catch (err) { toast.error('Error', err.response?.status === 400 ? 'Invalid data' : 'Operation failed'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await venueAPI.delete(deleteItem.id); toast.success('Deleted', `"${deleteItem.name}" removed`); setDeleteItem(null); fetchData(); }
    catch { toast.error('Error', 'Failed to delete'); }
    finally { setDeleteLoading(false); }
  };

  const filtered = venues.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || (v.location || '').toLowerCase().includes(search.toLowerCase()));
  const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <>
      <div className="table-card">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-box"><span className="material-symbols-outlined">search</span>
              <input type="text" placeholder="Search venues..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <span className="record-count"><strong>{filtered.length}</strong> records</span>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span> Add Venue
          </button>
        </div>
        {loading ? <div className="loading-spinner"><div className="spinner" /></div>
          : error ? <div className="error-alert"><span className="material-symbols-outlined">error</span><p>{error}</p></div>
          : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><span className="material-symbols-outlined">location_on</span></div>
              <h3>No venues found</h3><p>{search ? 'Try adjusting your search' : 'Add your first venue'}</p>
              {!search && <button className="btn btn-primary" onClick={openCreate}>Add Venue</button>}
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Name</th><th>Capacity</th><th>Location</th><th>Institute</th><th>Created</th><th style={{ width: 100 }}>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id}>
                      <td style={{ color: 'var(--color-slate-400)' }}>#{item.id}</td>
                      <td><span className="cell-primary">{item.name}</span></td>
                      <td><span className="badge badge-neutral">{item.capacity} seats</span></td>
                      <td>{item.location}</td>
                      <td><span className="badge badge-info">{item.instituteName || '—'}</span></td>
                      <td>{fmtDate(item.createdAt)}</td>
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
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingItem ? 'Edit Venue' : 'Add Venue'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)} disabled={formLoading}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit} disabled={formLoading}>{formLoading ? 'Saving...' : editingItem ? 'Update' : 'Create'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="v-name"><span className="material-symbols-outlined">meeting_room</span> Venue Name</label>
            <input id="v-name" type="text" className={`form-input ${formErrors.name ? 'error' : ''}`} placeholder="e.g. Main Auditorium" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} autoFocus />
            {formErrors.name && <div className="form-error">{formErrors.name}</div>}
          </div>
          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="v-cap"><span className="material-symbols-outlined">groups</span> Capacity</label>
              <input id="v-cap" type="number" className={`form-input ${formErrors.capacity ? 'error' : ''}`} placeholder="e.g. 200" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} min="1" />
              {formErrors.capacity && <div className="form-error">{formErrors.capacity}</div>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="v-inst"><span className="material-symbols-outlined">account_balance</span> Institute</label>
              <select id="v-inst" className={`form-select ${formErrors.instituteId ? 'error' : ''}`} value={formData.instituteId} onChange={(e) => setFormData({ ...formData, instituteId: e.target.value })}>
                <option value="">Select...</option>{institutes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
              {formErrors.instituteId && <div className="form-error">{formErrors.instituteId}</div>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="v-loc"><span className="material-symbols-outlined">location_on</span> Location</label>
            <input id="v-loc" type="text" className={`form-input ${formErrors.location ? 'error' : ''}`} placeholder="e.g. Building A, Floor 2" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            {formErrors.location && <div className="form-error">{formErrors.location}</div>}
          </div>
        </form>
      </Modal>
      <DeleteConfirm isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} entityName="Venue" itemName={deleteItem?.name} loading={deleteLoading} />
    </>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { eventAPI, userAPI, venueAPI } from '../../services/api';
import Modal from '../Modal';
import DeleteConfirm from '../DeleteConfirm';
import { useToast } from '../Toast';

export default function EventsPanel() {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', startTime: '', endTime: '', location: '', active: true, organizerId: '', venueId: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try { const [e, u, v] = await Promise.all([eventAPI.getAll(), userAPI.getAll(), venueAPI.getAll()]); setEvents(e.data); setUsers(u.data); setVenues(v.data); }
    catch { setError('Failed to load events'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toDTLocal = (dt) => { if (!dt) return ''; const d = new Date(dt); const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
  const toISO = (dt) => {
    if (!dt) return null;
    // datetime-local gives us "YYYY-MM-DDTHH:mm" — append :00 for seconds
    return dt.length === 16 ? dt + ':00' : dt;
  };

  const openCreate = () => { setEditingItem(null); setFormData({ title: '', description: '', startTime: '', endTime: '', location: '', active: true, organizerId: '', venueId: '' }); setFormErrors({}); setShowForm(true); };
  const openEdit = (item) => { setEditingItem(item); setFormData({ title: item.title, description: item.description || '', startTime: toDTLocal(item.startTime), endTime: toDTLocal(item.endTime), location: item.location || '', active: item.active !== false, organizerId: item.organizerId || '', venueId: item.venueId || '' }); setFormErrors({}); setShowForm(true); };

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'Required';
    if (!formData.startTime) e.startTime = 'Required';
    if (!formData.endTime) e.endTime = 'Required';
    if (formData.startTime && formData.endTime && new Date(formData.startTime) >= new Date(formData.endTime)) e.endTime = 'Must be after start';
    if (!formData.organizerId) e.organizerId = 'Required';
    if (!formData.venueId) e.venueId = 'Required';
    setFormErrors(e); return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validate()) return;
    setFormLoading(true);
    const payload = { title: formData.title, description: formData.description, startTime: toISO(formData.startTime), endTime: toISO(formData.endTime), location: formData.location, active: formData.active, organizerId: Number(formData.organizerId), venueId: Number(formData.venueId) };
    try {
      if (editingItem) { await eventAPI.update(editingItem.id, payload); toast.success('Updated', `"${formData.title}" updated`); }
      else { await eventAPI.create(payload); toast.success('Created', `"${formData.title}" scheduled`); }
      setShowForm(false); fetchData();
    } catch (err) {
      if (err.response?.status === 409) toast.error('Collision', 'This event conflicts with an existing booking');
      else toast.error('Error', 'Operation failed');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await eventAPI.delete(deleteItem.id); toast.success('Deleted', `"${deleteItem.title}" removed`); setDeleteItem(null); fetchData(); }
    catch { toast.error('Error', 'Failed to delete'); }
    finally { setDeleteLoading(false); }
  };

  const filtered = events.filter(ev => ev.title.toLowerCase().includes(search.toLowerCase()) || (ev.venueName || '').toLowerCase().includes(search.toLowerCase()));
  const fmtDT = (dt) => dt ? new Date(dt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <>
      <div className="table-card">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-box"><span className="material-symbols-outlined">search</span>
              <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <span className="record-count"><strong>{filtered.length}</strong> records</span>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span> Add Event
          </button>
        </div>
        {loading ? <div className="loading-spinner"><div className="spinner" /></div>
          : error ? <div className="error-alert"><span className="material-symbols-outlined">error</span><p>{error}</p></div>
          : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><span className="material-symbols-outlined">event</span></div>
              <h3>No events found</h3><p>{search ? 'Try adjusting your search' : 'Schedule your first event'}</p>
              {!search && <button className="btn btn-primary" onClick={openCreate}>Add Event</button>}
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Title</th><th>Start</th><th>End</th><th>Venue</th><th>Organizer</th><th>Status</th><th style={{ width: 100 }}>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id}>
                      <td style={{ color: 'var(--color-slate-400)' }}>#{item.id}</td>
                      <td><span className="cell-primary">{item.title}</span></td>
                      <td style={{ whiteSpace: 'nowrap' }}>{fmtDT(item.startTime)}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{fmtDT(item.endTime)}</td>
                      <td><span className="badge badge-info">{item.venueName || '—'}</span></td>
                      <td>{item.organizerName || '—'}</td>
                      <td>
                        <span className={`badge ${item.active ? 'badge-confirmed' : 'badge-danger'}`}>
                          <span className="badge-dot" />{item.active ? 'Active' : 'Inactive'}
                        </span>
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
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingItem ? 'Edit Event' : 'Add Event'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)} disabled={formLoading}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit} disabled={formLoading}>{formLoading ? 'Saving...' : editingItem ? 'Update' : 'Create'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="ae-title"><span className="material-symbols-outlined">badge</span> Title</label>
            <input id="ae-title" type="text" className={`form-input ${formErrors.title ? 'error' : ''}`} placeholder="Event title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} autoFocus />
            {formErrors.title && <div className="form-error">{formErrors.title}</div>}
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="ae-desc"><span className="material-symbols-outlined">notes</span> Description</label>
            <textarea id="ae-desc" className="form-textarea" placeholder="Description..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
          </div>
          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="ae-start"><span className="material-symbols-outlined">schedule</span> Start</label>
              <input id="ae-start" type="datetime-local" className={`form-input ${formErrors.startTime ? 'error' : ''}`} value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
              {formErrors.startTime && <div className="form-error">{formErrors.startTime}</div>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ae-end"><span className="material-symbols-outlined">schedule</span> End</label>
              <input id="ae-end" type="datetime-local" className={`form-input ${formErrors.endTime ? 'error' : ''}`} value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
              {formErrors.endTime && <div className="form-error">{formErrors.endTime}</div>}
            </div>
          </div>
          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="ae-org"><span className="material-symbols-outlined">person</span> Organizer</label>
              <select id="ae-org" className={`form-select ${formErrors.organizerId ? 'error' : ''}`} value={formData.organizerId} onChange={(e) => setFormData({ ...formData, organizerId: e.target.value })}>
                <option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {formErrors.organizerId && <div className="form-error">{formErrors.organizerId}</div>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ae-venue"><span className="material-symbols-outlined">location_on</span> Venue</label>
              <select id="ae-venue" className={`form-select ${formErrors.venueId ? 'error' : ''}`} value={formData.venueId} onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}>
                <option value="">Select...</option>{venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              {formErrors.venueId && <div className="form-error">{formErrors.venueId}</div>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="ae-status"><span className="material-symbols-outlined">toggle_on</span> Status</label>
            <select id="ae-status" className="form-select" value={formData.active ? 'true' : 'false'} onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}>
              <option value="true">Active</option><option value="false">Inactive</option>
            </select>
          </div>
        </form>
      </Modal>
      <DeleteConfirm isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} entityName="Event" itemName={deleteItem?.title} loading={deleteLoading} />
    </>
  );
}

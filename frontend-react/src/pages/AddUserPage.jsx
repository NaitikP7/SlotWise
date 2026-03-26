import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FormInput from '../components/ui/FormInput';
import FormSelect from '../components/ui/FormSelect';
import { userApi, departmentApi, instituteApi } from '../services/api';

export default function AddUserPage() {
  const navigate = useNavigate();
  const [institutes, setInstitutes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', instituteId: '', departmentId: '', role: '',
  });

  // Fetch institutes and departments from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [instRes, deptRes] = await Promise.all([
          instituteApi.getAll(),
          departmentApi.getAll(),
        ]);
        setInstitutes(instRes.data);
        setDepartments(deptRes.data);
      } catch (err) {
        console.error('Failed to load form data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Re-fetch departments when institute changes
  useEffect(() => {
    if (!form.instituteId) return;
    const fetchDepts = async () => {
      try {
        const res = await departmentApi.getByInstitute(form.instituteId);
        setDepartments(res.data);
      } catch (err) {
        console.error('Failed to load departments for institute:', err);
      }
    };
    fetchDepts();
  }, [form.instituteId]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // UserRequestDTO: name, email, password, departmentId, role (enum: USER/ADMIN)
      await userApi.create({
        name: form.name,
        email: form.email,
        password: form.password,
        departmentId: parseInt(form.departmentId),
        role: form.role || 'USER',
      });
      navigate('/admin/users');
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Invalid data. Please check all fields and try again.');
      } else if (err.response?.status === 409) {
        setError('A user with this email already exists.');
      } else {
        setError('Failed to create user. Please try again.');
      }
      console.error('Create user error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const instituteOptions = institutes.map(i => ({ value: String(i.id), label: i.name }));
  const departmentOptions = departments
    .filter(d => !form.instituteId || String(d.instituteId || d.institute?.id) === form.instituteId)
    .map(d => ({ value: String(d.id), label: d.name }));

  // Must match UserRole enum: USER, ADMIN
  const roleOptions = [
    { value: 'USER', label: 'User' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  return (
    <main className="flex flex-1 flex-col px-10 py-8 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/users">
          <button className="flex items-center justify-center gap-2 p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-text-main text-4xl font-black leading-tight tracking-tight">Add New User</h1>
          <p className="text-sm text-slate-500">Enter faculty details to create a new user account.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">error</span>
          {error}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm p-8">
        <form id="addUserForm" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Full Name" id="facultyName" placeholder="Enter full name" value={form.name} onChange={handleChange('name')} required />
            <FormInput label="Email Address" id="emailAddress" type="email" placeholder="Enter email address" value={form.email} onChange={handleChange('email')} required />
            <FormInput label="Password" id="password" type="password" placeholder="Set initial password" value={form.password} onChange={handleChange('password')} required />
            <FormSelect
              label="Role" id="role" placeholder="Select role"
              value={form.role} onChange={handleChange('role')}
              options={roleOptions} required
            />
            <FormSelect
              label="Institute" id="institute" placeholder={loading ? 'Loading...' : 'Select institute'}
              value={form.instituteId} onChange={handleChange('instituteId')}
              options={instituteOptions} required
            />
            <FormSelect
              label="Department" id="department" placeholder={loading ? 'Loading...' : 'Select department'}
              value={form.departmentId} onChange={handleChange('departmentId')}
              options={departmentOptions} required
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 justify-center items-center gap-2 rounded-lg h-12 px-6 bg-primary text-slate-900 text-sm font-bold leading-normal tracking-wide hover:brightness-105 transition-all shadow-md shadow-primary/10 disabled:opacity-60"
            >
              {submitting ? (
                <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined">person_add</span>
                  <span>Add User</span>
                </>
              )}
            </button>
            <Link to="/admin/users">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg h-12 px-6 bg-slate-100 text-text-main text-sm font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>

      {/* Info Section */}
      <div className="mt-8 p-6 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-start gap-4">
        <div className="size-10 flex items-center justify-center bg-muted-blue-grey/10 rounded-full text-muted-blue-grey flex-shrink-0">
          <span className="material-symbols-outlined">info</span>
        </div>
        <div>
          <h4 className="font-bold text-text-main">User Account Creation</h4>
          <p className="text-sm text-slate-500">The new user will receive an email with login credentials and instructions to set up their password.</p>
        </div>
      </div>
    </main>
  );
}

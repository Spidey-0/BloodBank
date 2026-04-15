import { useEffect, useState } from 'react';
import api from '../api/api';

const ROLES = ['receptionist', 'lab_technician', 'admin'];
const EMPTY = { name: '', username: '', password: '', role: 'receptionist' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchUsers = () => api.get('/auth/users').then(r => setUsers(r.data));

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try {
      await api.post('/auth/register', form);
      setSuccess(`Account created for ${form.name}`);
      setShowModal(false); setForm(EMPTY); fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally { setLoading(false); }
  };

  const roleLabel = { admin: '🔑 Administrator', receptionist: '📋 Receptionist', lab_technician: '🔬 Lab Technician' };
  const roleBadge = { admin: 'badge-red', receptionist: 'badge-blue', lab_technician: 'badge-green' };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Staff Accounts</h2>
        <p>Manage system users and their roles</p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setError(''); setForm(EMPTY); }}>
          + Add Staff Account
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Name</th><th>Username</th><th>Role</th><th>Created</th></tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u._id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{u.username}</td>
                  <td><span className={`badge ${roleBadge[u.role]}`}>{roleLabel[u.role]}</span></td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3>Create Staff Account</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group form-full">
                  <label>Full Name</label>
                  <input placeholder="Staff member's full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input placeholder="Login username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" placeholder="Set a password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                </div>
                <div className="form-group form-full">
                  <label>Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map(r => <option key={r} value={r}>{roleLabel[r]}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

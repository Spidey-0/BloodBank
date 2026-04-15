import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const EMPTY = { name: '', age: '', gender: 'Male', bloodGroup: 'A+', phone: '', address: '' };

export default function Donors() {
  const [donors, setDonors] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDonors = async (q = '') => {
    const { data } = await api.get(`/donors${q ? `?search=${q}` : ''}`);
    setDonors(data);
  };

  useEffect(() => { fetchDonors(); }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchDonors(e.target.value);
  };

  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setShowModal(true); };
  const openEdit = (d) => { setForm({ name: d.name, age: d.age, gender: d.gender, bloodGroup: d.bloodGroup, phone: d.phone, address: d.address || '' }); setEditing(d._id); setError(''); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (editing) await api.put(`/donors/${editing}`, form);
      else await api.post('/donors', form);
      setShowModal(false); fetchDonors(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save donor');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this donor?')) return;
    await api.delete(`/donors/${id}`);
    fetchDonors(search);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Donors</h2>
        <p>Manage blood donor records</p>
      </div>

      <div className="search-bar">
        <input placeholder="🔍 Search by name or phone..." value={search} onChange={handleSearch} style={{ maxWidth: 320 }} />
        <button className="btn btn-primary" onClick={openAdd}>+ Add Donor</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Blood Group</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donors.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">🧑‍🤝‍🧑</div><p>No donors found</p></div></td></tr>
              ) : donors.map(d => (
                <tr key={d._id}>
                  <td>
                    <button onClick={() => navigate(`/donors/${d._id}`)} style={{ background: 'none', border: 'none', color: 'var(--red)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                      {d.name}
                    </button>
                  </td>
                  <td><span className="badge badge-red">{d.bloodGroup}</span></td>
                  <td>{d.age}</td>
                  <td>{d.gender}</td>
                  <td>{d.phone}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>{d.address || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(d)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit Donor' : 'Register New Donor'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group form-full">
                  <label>Full Name</label>
                  <input placeholder="Enter full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" min="18" max="65" placeholder="Age" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Blood Group</label>
                  <select value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                    {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input placeholder="10-digit mobile number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                </div>
                <div className="form-group form-full">
                  <label>Address</label>
                  <input placeholder="City, State" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editing ? 'Update Donor' : 'Register Donor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

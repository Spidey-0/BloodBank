import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const EMPTY = { patientName: '', patientAge: '', bloodGroup: 'A+', unitsRequired: 1, hospital: '', urgency: 'Routine', notes: '' };

export default function Requests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchRequests = () => api.get('/requests').then(r => setRequests(r.data));

  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/requests', form);
      setShowModal(false); setForm(EMPTY); fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to raise request');
    } finally { setLoading(false); }
  };

  const handleFulfill = async (id) => {
    try {
      await api.patch(`/requests/${id}/fulfill`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fulfill request');
    }
  };

  const handleReject = async () => {
    await api.patch(`/requests/${rejectId}/reject`, { reason: rejectReason });
    setRejectId(null); setRejectReason(''); fetchRequests();
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Blood Requests</h2>
        <p>Raise, review, and fulfill patient blood requests</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'pending', 'fulfilled', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} style={{ textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setError(''); setForm(EMPTY); }}>+ New Request</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Patient</th><th>Blood Group</th><th>Units</th><th>Hospital</th><th>Urgency</th><th>Status</th><th>Requested By</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">📋</div><p>No requests found</p></div></td></tr>
              ) : filtered.map(r => (
                <tr key={r._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.patientName}</div>
                    {r.patientAge && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.patientAge} yrs</div>}
                  </td>
                  <td><span className="badge badge-red">{r.bloodGroup}</span></td>
                  <td>{r.unitsRequired}</td>
                  <td style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{r.hospital || '—'}</td>
                  <td><span className={`urgency-${r.urgency}`}>{r.urgency}</span></td>
                  <td>
                    <span className={`badge ${r.status === 'pending' ? 'badge-yellow' : r.status === 'fulfilled' ? 'badge-green' : 'badge-gray'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{r.requestedBy?.name || '—'}</td>
                  <td>
                    {r.status === 'pending' && (user?.role === 'lab_technician' || user?.role === 'admin') && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleFulfill(r._id)}>Fulfill</button>
                        <button className="btn btn-danger btn-sm" onClick={() => { setRejectId(r._id); setRejectReason(''); }}>Reject</button>
                      </div>
                    )}
                    {r.status === 'rejected' && r.notes && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.notes}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Raise Blood Request</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Patient Name</label>
                  <input placeholder="Full name" value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Patient Age</label>
                  <input type="number" min="0" placeholder="Age" value={form.patientAge} onChange={e => setForm({ ...form, patientAge: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Blood Group Required</label>
                  <select value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                    {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Units Required</label>
                  <input type="number" min="1" value={form.unitsRequired} onChange={e => setForm({ ...form, unitsRequired: Number(e.target.value) })} required />
                </div>
                <div className="form-group">
                  <label>Hospital Name</label>
                  <input placeholder="Hospital / clinic name" value={form.hospital} onChange={e => setForm({ ...form, hospital: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Urgency</label>
                  <select value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}>
                    <option>Routine</option><option>Urgent</option><option>Emergency</option>
                  </select>
                </div>
                <div className="form-group form-full">
                  <label>Notes (optional)</label>
                  <input placeholder="Any additional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setRejectId(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>Reject Request</h3>
              <button className="modal-close" onClick={() => setRejectId(null)}>✕</button>
            </div>
            <div className="form-group">
              <label>Reason for Rejection</label>
              <input placeholder="e.g. Incompatible blood type, Insufficient stock" value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setRejectId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReject}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

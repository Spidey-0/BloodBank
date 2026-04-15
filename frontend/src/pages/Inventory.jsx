import { useEffect, useState } from 'react';
import api from '../api/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const EMPTY = { donor: '', bloodGroup: 'A+', units: 1, collectedDate: new Date().toISOString().split('T')[0] };

export default function Inventory() {
  const [units, setUnits] = useState([]);
  const [summary, setSummary] = useState({});
  const [donors, setDonors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDiscard, setShowDiscard] = useState(null);
  const [discardReason, setDiscardReason] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    const [u, s] = await Promise.all([
      api.get('/blood-units'),
      api.get('/blood-units/inventory-summary')
    ]);
    setUnits(u.data);
    setSummary(s.data);
  };

  useEffect(() => {
    fetchAll();
    api.get('/donors').then(r => setDonors(r.data));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/blood-units', form);
      setShowModal(false); setForm(EMPTY); fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record donation');
    } finally { setLoading(false); }
  };

  const handleDiscard = async () => {
    if (!discardReason.trim()) return;
    await api.patch(`/blood-units/${showDiscard}/discard`, { reason: discardReason });
    setShowDiscard(null); setDiscardReason(''); fetchAll();
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Blood Inventory</h2>
        <p>Track collected units, stock levels, and discard records</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>STOCK SUMMARY</h3>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setError(''); }}>+ Record Donation</button>
      </div>

      <div className="inventory-grid" style={{ marginBottom: '2rem' }}>
        {BLOOD_GROUPS.map(bg => {
          const count = summary[bg] || 0;
          return (
            <div key={bg} className="inventory-cell">
              <div className="inv-group">{bg}</div>
              <div className="inv-units" style={{ color: count === 0 ? '#C0392B' : count < 5 ? '#D68910' : '#1E8449' }}>{count}</div>
              <div className="inv-label">{count === 0 ? '⚠ Out of Stock' : count < 5 ? '⚠ Low' : 'units'}</div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>All Blood Units</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Donor</th><th>Blood Group</th><th>Units</th><th>Collected</th><th>Expiry</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {units.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">🩸</div><p>No blood units recorded</p></div></td></tr>
              ) : units.map(u => {
                const expired = new Date(u.expiryDate) < new Date();
                return (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 500 }}>{u.donor?.name || '—'}</td>
                    <td><span className="badge badge-red">{u.bloodGroup}</span></td>
                    <td>{u.units}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{new Date(u.collectedDate).toLocaleDateString('en-IN')}</td>
                    <td style={{ fontSize: '0.82rem', color: expired ? '#C0392B' : 'var(--text-muted)' }}>{new Date(u.expiryDate).toLocaleDateString('en-IN')}{expired && ' ⚠'}</td>
                    <td>
                      <span className={`badge ${u.status === 'available' ? 'badge-green' : u.status === 'issued' ? 'badge-blue' : 'badge-gray'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      {u.status === 'available' && (
                        <button className="btn btn-danger btn-sm" onClick={() => { setShowDiscard(u._id); setDiscardReason(''); }}>
                          Discard
                        </button>
                      )}
                      {u.status === 'discarded' && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.discardReason}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Donation Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Record Blood Donation</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleAdd}>
              <div className="form-grid">
                <div className="form-group form-full">
                  <label>Select Donor</label>
                  <select value={form.donor} onChange={e => {
                    const d = donors.find(x => x._id === e.target.value);
                    setForm({ ...form, donor: e.target.value, bloodGroup: d?.bloodGroup || form.bloodGroup });
                  }} required>
                    <option value="">-- Select a registered donor --</option>
                    {donors.map(d => <option key={d._id} value={d._id}>{d.name} ({d.bloodGroup}) — {d.phone}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Blood Group</label>
                  <select value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                    {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Units Collected</label>
                  <input type="number" min="1" max="3" value={form.units} onChange={e => setForm({ ...form, units: Number(e.target.value) })} required />
                </div>
                <div className="form-group form-full">
                  <label>Collection Date</label>
                  <input type="date" value={form.collectedDate} onChange={e => setForm({ ...form, collectedDate: e.target.value })} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Record Donation'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discard Modal */}
      {showDiscard && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowDiscard(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>Discard Blood Unit</h3>
              <button className="modal-close" onClick={() => setShowDiscard(null)}>✕</button>
            </div>
            <div className="form-group">
              <label>Reason for Discarding</label>
              <input placeholder="e.g. Failed TTI test, Expired, Damaged bag" value={discardReason} onChange={e => setDiscardReason(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowDiscard(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDiscard} disabled={!discardReason.trim()}>Confirm Discard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

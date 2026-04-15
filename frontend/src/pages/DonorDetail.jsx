import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function DonorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/donors/${id}`).then(r => { setData(r.data); setLoading(false); });
  }, [id]);

  if (loading) return <div className="page-content"><p>Loading...</p></div>;
  if (!data) return <div className="page-content"><p>Donor not found.</p></div>;

  const { donor, history } = data;

  const daysSinceLast = history.length > 0
    ? Math.floor((Date.now() - new Date(history[0].collectedDate)) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="page-content">
      <button className="btn btn-outline btn-sm" onClick={() => navigate('/donors')} style={{ marginBottom: '1.25rem' }}>
        ← Back to Donors
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        <div className="card">
          <div style={{ textAlign: 'center', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)', marginBottom: '1.25rem' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 0.75rem' }}>🧑</div>
            <h3 style={{ fontSize: '1.3rem' }}>{donor.name}</h3>
            <span className="badge badge-red" style={{ marginTop: '0.5rem', fontSize: '1rem', padding: '0.3rem 0.9rem' }}>{donor.bloodGroup}</span>
          </div>
          {[
            ['Age', donor.age + ' years'],
            ['Gender', donor.gender],
            ['Phone', donor.phone],
            ['Address', donor.address || '—'],
            ['Registered', new Date(donor.createdAt).toLocaleDateString('en-IN')],
            ['Total Donations', history.length],
            ['Last Donated', daysSinceLast !== null ? `${daysSinceLast} days ago` : 'Never'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ fontWeight: 500 }}>{v}</span>
            </div>
          ))}
          {daysSinceLast !== null && daysSinceLast < 90 && (
            <div className="alert alert-error" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
              ⚠ Not eligible yet. Must wait {90 - daysSinceLast} more days.
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Donation History</h3>
          {history.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🩸</div><p>No donations recorded yet</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Blood Group</th><th>Units</th><th>Status</th><th>Expiry</th></tr></thead>
                <tbody>
                  {history.map(u => (
                    <tr key={u._id}>
                      <td>{new Date(u.collectedDate).toLocaleDateString('en-IN')}</td>
                      <td><span className="badge badge-red">{u.bloodGroup}</span></td>
                      <td>{u.units}</td>
                      <td>
                        <span className={`badge ${u.status === 'available' ? 'badge-green' : u.status === 'issued' ? 'badge-blue' : 'badge-gray'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{new Date(u.expiryDate).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import api from '../api/api';

export default function Reports() {
  const today = new Date().toISOString().split('T')[0];
  const monthStart = today.slice(0, 7) + '-01';
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    const { data } = await api.get(`/dashboard/report?from=${from}&to=${to}`);
    setReport(data);
    setLoading(false);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Reports</h2>
        <p>Generate donation and issue reports by date range</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>From Date</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ width: 180 }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>To Date</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ width: 180 }} />
          </div>
          <button className="btn btn-primary" onClick={fetchReport} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {report && (
        <>
          <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
            {[
              { icon: '📥', label: 'Total Donations', value: report.donations.length },
              { icon: '📤', label: 'Total Issues', value: report.issues.length },
              { icon: '🩸', label: 'Units Collected', value: report.donations.reduce((s, d) => s + d.units, 0) },
              { icon: '💉', label: 'Units Issued', value: report.issues.reduce((s, r) => s + r.unitsRequired, 0) },
            ].map(c => (
              <div key={c.label} className="stat-card">
                <div className="stat-icon">{c.icon}</div>
                <div className="stat-value">{c.value}</div>
                <div className="stat-label">{c.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Donations in Period</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Donor</th><th>Blood Group</th><th>Units</th></tr></thead>
                  <tbody>
                    {report.donations.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No donations in this period</td></tr>
                    ) : report.donations.map(d => (
                      <tr key={d._id}>
                        <td style={{ fontSize: '0.82rem' }}>{new Date(d.collectedDate).toLocaleDateString('en-IN')}</td>
                        <td>{d.donor?.name || '—'}</td>
                        <td><span className="badge badge-red">{d.bloodGroup}</span></td>
                        <td>{d.units}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Issues in Period</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Patient</th><th>Blood Group</th><th>Units</th></tr></thead>
                  <tbody>
                    {report.issues.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No issues in this period</td></tr>
                    ) : report.issues.map(r => (
                      <tr key={r._id}>
                        <td style={{ fontSize: '0.82rem' }}>{new Date(r.updatedAt).toLocaleDateString('en-IN')}</td>
                        <td>{r.patientName}</td>
                        <td><span className="badge badge-red">{r.bloodGroup}</span></td>
                        <td>{r.unitsRequired}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

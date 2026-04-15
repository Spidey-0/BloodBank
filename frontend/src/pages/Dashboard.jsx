import { useEffect, useState } from 'react';
import api from '../api/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => { setStats(r.data); setLoading(false); });
  }, []);

  if (loading) return <div className="page-content"><p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p></div>;

  const inventoryMap = {};
  stats?.inventorySummary?.forEach(i => { inventoryMap[i._id] = i.total; });

  const summaryCards = [
    { icon: '🧑‍🤝‍🧑', label: 'Total Donors', value: stats.totalDonors, color: '#1A5276' },
    { icon: '🩸', label: 'Units Available', value: stats.totalAvailableUnits, color: '#C0392B' },
    { icon: '📥', label: 'Collected Today', value: stats.collectedToday, color: '#1E8449' },
    { icon: '📤', label: 'Issued Today', value: stats.issuedToday, color: '#7D3C98' },
    { icon: '⏳', label: 'Pending Requests', value: stats.pendingRequests, color: '#B7770D' },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Real-time overview of blood bank operations</p>
      </div>

      <div className="stat-grid">
        {summaryCards.map(card => (
          <div key={card.label} className="stat-card">
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.2rem' }}>Blood Inventory by Group</h3>
        <div className="inventory-grid">
          {BLOOD_GROUPS.map(bg => {
            const units = inventoryMap[bg] || 0;
            const low = units < 5;
            return (
              <div key={bg} className="inventory-cell" style={{ borderColor: low && units > 0 ? '#F1948A' : undefined }}>
                <div className="inv-group">{bg}</div>
                <div className="inv-units" style={{ color: units === 0 ? '#C0392B' : units < 5 ? '#D68910' : '#1E8449' }}>
                  {units}
                </div>
                <div className="inv-label">{units === 0 ? '⚠ Out of Stock' : units < 5 ? '⚠ Low Stock' : 'units available'}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

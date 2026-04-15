import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div>
          <h1>Saving Lives,<br />One Unit at a Time.</h1>
          <p>A streamlined blood bank management platform for efficient donor tracking, inventory management, and blood request processing.</p>
          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '2rem' }}>
            {[['Donors', 'Tracked'], ['Blood Groups', 'Managed'], ['Requests', 'Processed']].map(([label, sub]) => (
              <div key={label}>
                <div style={{ fontSize: '1.5rem', fontFamily: 'DM Serif Display, serif', color: '#C0392B' }}>✓</div>
                <div style={{ fontSize: '0.8rem', color: '#9E8880', marginTop: '0.25rem' }}>{label}<br />{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="login-right">
        <div className="login-box">
          <h2>Welcome Back</h2>
          <p className="sub">Sign in to access the blood bank dashboard</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text" placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required autoFocus
              />
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Password</label>
              <input
                type="password" placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
          <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            First time? Run <code style={{ background: '#F0EDE8', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>POST /api/auth/seed-admin</code> to create admin account.
          </p>
        </div>
      </div>
    </div>
  );
}

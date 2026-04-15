import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: '📊', label: 'Dashboard', exact: true },
  { to: '/donors', icon: '🧑‍🤝‍🧑', label: 'Donors' },
  { to: '/inventory', icon: '🩸', label: 'Inventory' },
  { to: '/requests', icon: '📋', label: 'Blood Requests' },
  { to: '/reports', icon: '📈', label: 'Reports', adminOnly: true },
  { to: '/users', icon: '👤', label: 'Staff Accounts', adminOnly: true },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleLabel = { admin: 'Administrator', receptionist: 'Receptionist', lab_technician: 'Lab Technician' };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>BloodBank</h1>
          <span>Management System</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => {
            if (item.adminOnly && user?.role !== 'admin') return null;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <strong>{user?.name}</strong>
          {roleLabel[user?.role]}
          <button
            onClick={handleLogout}
            style={{ marginTop: '0.75rem', display: 'block', background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#9E8880', padding: '0.4rem 0.85rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', width: '100%' }}
          >
            Sign Out
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

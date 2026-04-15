import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/', icon: '⚡', label: 'Dashboard' },
  { path: '/upload', icon: '☁️', label: 'Upload CSV' },
  { path: '/analytics', icon: '🔬', label: 'Analytics' },
  { path: '/history', icon: '📋', label: 'History' },
  { path: '/alerts', icon: '🔔', label: 'Alerts' },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Logo size={52} />
        <div className="brand-text">
          <h1>VIDYUT</h1>
          <span>Energy Intelligence</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            <span className="nav-arrow">→</span>
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `nav-link admin-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🛡️</span>
            <span className="nav-label">Admin Panel</span>
            <span className="nav-arrow">→</span>
          </NavLink>
        )}
      </nav>

      {user && (
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <p className="user-name">{user.name}</p>
              <span className={`role-badge ${user.role}`}>{user.role}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              ⏻
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

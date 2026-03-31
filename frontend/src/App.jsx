import { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import Appointments from './components/Appointments';
import Billing from './components/Billing';
import Toast from './components/Toast';
import './index.css';

export default function App() {
  const [session, setSession] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((title, msg, type = 'success') => {
    setToast({ title, msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleLogin = (user) => {
    setSession(user);
    setActiveNav('dashboard');
    showToast('Welcome!', `Signed in as ${user.name}`);
  };

  const handleLogout = () => {
    setSession(null);
    showToast('Logged out', 'See you soon!');
  };

  if (!session) {
    return (
      <>
        <Login onLogin={handleLogin} showToast={showToast} />
        {toast && <Toast {...toast} />}
      </>
    );
  }

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
    ...(session.role === 'doctor' ? [{ key: 'patients', label: 'Patient Records', icon: 'fas fa-users' }] : []),
    { key: 'appointments', label: 'Appointments', icon: 'fas fa-calendar-alt' },
    { key: 'billing', label: 'Billing & Payments', icon: 'fas fa-file-invoice-dollar' },
  ];

  const views = {
    dashboard: <Dashboard session={session} />,
    patients: <Patients />,
    appointments: <Appointments session={session} showToast={showToast} />,
    billing: <Billing session={session} showToast={showToast} />,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand"><i className="fas fa-heartbeat" /> NexCare</div>
        <div className="nav-label">Main Menu</div>
        <nav className="nav-menu">
          {navItems.map(item => (
            <a key={item.key}
               className={`nav-item${activeNav === item.key ? ' active' : ''}`}
               onClick={() => setActiveNav(item.key)}>
              <i className={item.icon} /> {item.label}
            </a>
          ))}
        </nav>
        <div className="user-profile">
          <div className="user-avatar">{session.name.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <h4>{session.name}</h4>
            <p>{session.role === 'doctor' ? 'Medical Professional' : 'Registered Patient'}</p>
          </div>
          <div className="logout-icon" onClick={handleLogout} title="Log Out">
            <i className="fas fa-sign-out-alt" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-wrapper">
        <div className="topbar">
          <div className="topbar-greeting">Good {getGreeting()}!</div>
          <div className="date-display">
            <i className="fas fa-clock" style={{ color: 'var(--primary)' }} />
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        <div className="content-area">
          {views[activeNav]}
        </div>
      </div>

      {toast && <Toast {...toast} />}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 18) return 'Afternoon';
  return 'Evening';
}

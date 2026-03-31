import { useState } from 'react';
import { api } from '../api';

export default function Login({ onLogin, showToast }) {
  const [role, setRole] = useState('patient');
  const [showRegister, setShowRegister] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmed, setConfirmed] = useState({});

  // Login form state
  const [lName, setLName] = useState('');
  const [lContact, setLContact] = useState('');
  const [lEmail, setLEmail] = useState('');
  const [lDocId, setLDocId] = useState('');
  const [lPwd, setLPwd] = useState('');

  // Register form state
  const [rName, setRName] = useState('');
  const [rAge, setRAge] = useState('');
  const [rGender, setRGender] = useState('');
  const [rContact, setRContact] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const payload = { role };
      if (role === 'patient') { payload.name = lName; payload.contact = lContact; }
      else { payload.email = lEmail; payload.id = lDocId; payload.password = lPwd; }
      const user = await api.login(payload);
      onLogin(user);
    } catch (err) {
      showToast('Login Failed', err.message, 'error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.registerPatient({ name: rName, age: rAge, gender: rGender, contact: rContact });
      setConfirmed({ name: rName, contact: rContact });
      setShowRegister(false);
      setShowConfirm(true);
    } catch (err) {
      showToast('Registration Failed', err.message, 'error');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-left">
        <div className="login-brand"><i className="fas fa-heartbeat" /> NexCare</div>
        <div className="login-left-content">
          <h2>The Standard in<br /><span>Next-Gen Healthcare.</span></h2>
          <p>Seamlessly manage appointments, patient records, and workflow in a beautifully unified ecosystem.</p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-form-container">

          {/* -- LOGIN -- */}
          {!showRegister && !showConfirm && (
            <>
              <h3 className="login-title">Welcome Back</h3>
              <p className="login-subtitle">Sign in to access your portal</p>
              <div className="premium-tabs">
                <div className={`premium-tab${role === 'patient' ? ' active' : ''}`} onClick={() => setRole('patient')}>Patient</div>
                <div className={`premium-tab${role === 'doctor' ? ' active' : ''}`} onClick={() => setRole('doctor')}>Doctor</div>
              </div>
              {role === 'patient' ? (
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" className="form-control" required placeholder="John Doe" value={lName} onChange={e => setLName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input type="tel" className="form-control" required placeholder="+1 234 567 8900" value={lContact} onChange={e => setLContact(e.target.value)} />
                  </div>
                  <button type="submit" className="btn-primary">Sign In <i className="fas fa-arrow-right" /></button>
                </form>
              ) : (
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" className="form-control" required placeholder="doctor@hospital.com" value={lEmail} onChange={e => setLEmail(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Doctor ID</label>
                    <input type="number" className="form-control" required placeholder="ID Number" value={lDocId} onChange={e => setLDocId(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" className="form-control" required placeholder="••••••••" value={lPwd} onChange={e => setLPwd(e.target.value)} />
                  </div>
                  <button type="submit" className="btn-primary">Sign In <i className="fas fa-arrow-right" /></button>
                </form>
              )}
              {role === 'patient' && (
                <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  New patient? <a href="#" onClick={(e) => { e.preventDefault(); setShowRegister(true); }} style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Register here</a>
                </p>
              )}
            </>
          )}

          {/* -- REGISTER -- */}
          {showRegister && !showConfirm && (
            <>
              <h3 className="login-title">Create Account</h3>
              <p className="login-subtitle">Register to schedule appointments</p>
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" className="form-control" required placeholder="John Doe" value={rName} onChange={e => setRName(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Age</label>
                    <input type="number" className="form-control" required placeholder="35" value={rAge} onChange={e => setRAge(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Gender</label>
                    <select className="form-control" required value={rGender} onChange={e => setRGender(e.target.value)}>
                      <option value="" disabled>Select</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Mobile Number (Login Key)</label>
                  <input type="tel" className="form-control" required placeholder="+1 234 567 8900" value={rContact} onChange={e => setRContact(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary">Complete Registration <i className="fas fa-check" /></button>
                <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                  Already registered? <a href="#" onClick={(e) => { e.preventDefault(); setShowRegister(false); }} style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign in</a>
                </p>
              </form>
            </>
          )}

          {/* -- CONFIRM -- */}
          {showConfirm && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', color: 'var(--success)', marginBottom: '1rem' }}><i className="fas fa-check-circle" /></div>
              <h3 className="login-title">Registration Confirmed!</h3>
              <p className="login-subtitle">Your patient profile has been created.</p>
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--border-color)', marginBottom: '2rem' }}>
                <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>{confirmed.name}</p>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>Login with mobile: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{confirmed.contact}</span></p>
              </div>
              <button className="btn-primary btn-success" onClick={() => { setShowConfirm(false); }}>
                Proceed to Login <i className="fas fa-arrow-right" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

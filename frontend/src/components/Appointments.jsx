import { useEffect, useState, useCallback } from 'react';
import { api } from '../api';

export default function Appointments({ session, showToast }) {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [problem, setProblem] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [datetime, setDatetime] = useState('');

  const fetchAll = useCallback(() => {
    api.getAppointments().then(setAppointments).catch(() => {});
  }, []);

  useEffect(() => {
    fetchAll();
    if (session.role === 'patient') api.getDoctors().then(setDoctors).catch(() => {});
  }, [fetchAll, session.role]);

  const filtered = appointments.filter(a =>
    session.role === 'patient' ? a.patient_name === session.name : a.doctor_name === session.name
  );

  const handleBook = async (e) => {
    e.preventDefault();
    const iso = new Date(datetime).toISOString().slice(0, 19).replace('T', ' ');
    try {
      await api.bookAppointment({ patient_id: session.id, doctor_id: doctorId, problem, appointment_date: iso });
      showToast('Booking Confirmed', 'Appointment and invoice generated!');
      setProblem(''); setDoctorId(''); setDatetime('');
      fetchAll();
    } catch (err) { showToast('Failed', err.message, 'error'); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await api.cancelAppointment(id);
      showToast('Cancelled', 'Appointment cancelled successfully.');
      fetchAll();
    } catch (err) { showToast('Error', err.message, 'error'); }
  };

  const now = new Date();
  const minDate = (() => { const d = new Date(now); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0,16); })();

  return (
    <div>
      <div className="section-header"><h1>Appointment Schedule</h1><p>Manage scheduling and upcoming visits</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: session.role === 'patient' ? '1fr 2.5fr' : '1fr', gap: '2rem' }}>
        {session.role === 'patient' && (
          <div className="card-panel">
            <h3 style={{ marginBottom: '1.5rem' }}>Book Appointment</h3>
            <form onSubmit={handleBook}>
              <div className="form-group">
                <label>Medical Problem</label>
                <textarea className="form-control" required rows={3} placeholder="e.g. Fever, Chest pain..." value={problem} onChange={e => setProblem(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Select Specialist</label>
                <select className="form-control" required value={doctorId} onChange={e => setDoctorId(e.target.value)}>
                  <option value="" disabled>Select a specialist</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name} • {d.specialization} (9AM–5PM)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date & Time</label>
                <input type="datetime-local" className="form-control" required min={minDate} value={datetime} onChange={e => setDatetime(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Confirm Booking</button>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>* A billing invoice is auto-generated on booking.</p>
            </form>
          </div>
        )}
        <div className="card-panel">
          <h3 style={{ marginBottom: '1.5rem' }}>Schedule Itineraries</h3>
          <div className="table-responsive">
            <table>
              <thead><tr><th>Ref #</th><th>{session.role === 'patient' ? 'Doctor' : 'Patient'}</th><th>Problem</th><th>Date & Time</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan="6" className="empty-row">No appointments found.</td></tr>}
                {filtered.map(a => {
                  const dt = new Date(a.appointment_date + 'Z');
                  const hoursUntil = (dt - now) / 36e5;
                  const person = session.role === 'patient' ? `Dr. ${a.doctor_name}` : a.patient_name;
                  let badgeClass = 'badge-primary';
                  if (a.status === 'SCHEDULED') badgeClass = 'badge-pending';
                  else if (a.status === 'COMPLETED') badgeClass = 'badge-success';
                  else if (a.status === 'CANCELLED') badgeClass = 'badge-danger';

                  return (
                    <tr key={a.id}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#APT-{a.id}</td>
                      <td style={{ fontWeight: 700 }}>{person}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{a.problem || 'N/A'}</td>
                      <td><i className="fas fa-clock" style={{ color: 'var(--primary)', marginRight: 5 }} />{dt.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td><span className={`badge ${badgeClass}`}>{a.status}</span></td>
                      <td>
                        {a.status === 'SCHEDULED' && session.role === 'patient' && (
                          hoursUntil > 24
                            ? <button className="btn-danger-outline" onClick={() => handleCancel(a.id)}>Cancel</button>
                            : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><i className="fas fa-lock" /> Locked (&lt;24h)</span>
                        )}
                        {a.status !== 'SCHEDULED' && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

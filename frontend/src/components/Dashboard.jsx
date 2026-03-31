import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Dashboard({ session }) {
  const [stats, setStats] = useState({ totalPatients: '-', totalDoctors: '-', totalAppointments: '-' });

  useEffect(() => {
    api.dashboard().then(setStats).catch(() => {});
  }, []);

  return (
    <div>
      <div className="section-header">
        <h1>Overview</h1>
        <p>A quick summary of the system performance</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon p"><i className="fas fa-procedures" /></div>
          <div className="stat-value">{stats.totalPatients}</div>
          <div className="stat-label">Total Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon s"><i className="fas fa-user-md" /></div>
          <div className="stat-value">{stats.totalDoctors}</div>
          <div className="stat-label">Available Doctors</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon w"><i className="fas fa-calendar-check" /></div>
          <div className="stat-value">{stats.totalAppointments}</div>
          <div className="stat-label">Total Appointments</div>
        </div>
      </div>
    </div>
  );
}

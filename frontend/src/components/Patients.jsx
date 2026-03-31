import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  useEffect(() => { api.getPatients().then(setPatients).catch(() => {}); }, []);

  return (
    <div>
      <div className="section-header">
        <h1>Patient Directory</h1>
        <p>View all registered patient records</p>
      </div>
      <div className="card-panel">
        <div className="table-responsive">
          <table>
            <thead><tr><th>Patient ID</th><th>Full Name</th><th>Demographics</th><th>Contact</th><th>Registered</th></tr></thead>
            <tbody>
              {patients.length === 0 && <tr><td colSpan="5" className="empty-row">No patients found.</td></tr>}
              {patients.map(p => (
                <tr key={p.id}>
                  <td><span className="badge badge-primary">#PT-{String(p.id).padStart(4,'0')}</span></td>
                  <td style={{ fontWeight: 700 }}>{p.name}</td>
                  <td>{p.age} yrs • <span style={{ color: 'var(--text-muted)' }}>{p.gender}</span></td>
                  <td>{p.contact}</td>
                  <td>{p.registration_date?.substring(0,10) ?? 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

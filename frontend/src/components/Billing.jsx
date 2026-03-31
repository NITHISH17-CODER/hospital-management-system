import { useEffect, useState, useCallback } from 'react';
import { api } from '../api';

export default function Billing({ session, showToast }) {
  const [bills, setBills] = useState([]);

  const fetchAll = useCallback(() => {
    api.getBilling().then(setBills).catch(() => {});
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = bills.filter(b =>
    session.role === 'patient' ? b.patient_name === session.name : b.doctor_name === session.name
  );

  const handlePay = async (id) => {
    if (!confirm('Proceed with payment?')) return;
    try {
      await api.payBill(id);
      showToast('Payment Successful', 'Invoice has been paid in full!');
      fetchAll();
    } catch (err) { showToast('Error', err.message, 'error'); }
  };

  return (
    <div>
      <div className="section-header"><h1>Billing & Payments</h1><p>Manage patient invoices and payment statuses</p></div>
      <div className="card-panel">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>{session.role === 'patient' ? 'Doctor' : 'Patient'}</th>
                <th>Date of Visit</th>
                <th>Amount Due</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan="6" className="empty-row">No billing records found.</td></tr>}
              {filtered.map(b => {
                const dt = new Date(b.appointment_date + 'Z').toLocaleDateString('en-US');
                const person = session.role === 'patient' ? `Dr. ${b.doctor_name}` : b.patient_name;
                const paid = b.status === 'PAID';
                return (
                  <tr key={b.id}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#INV-{b.id}</td>
                    <td style={{ fontWeight: 700 }}>{person}</td>
                    <td>{dt}</td>
                    <td style={{ fontWeight: 800, fontSize: '1.05rem' }}>${b.amount?.toFixed(2)}</td>
                    <td><span className={`badge ${paid ? 'badge-success' : 'badge-danger'}`}>{b.status}</span></td>
                    <td>
                      {!paid && session.role === 'patient'
                        ? <button className="btn-success-small" onClick={() => handlePay(b.id)}>Pay Now</button>
                        : <span style={{ fontSize: '0.8rem', color: paid ? 'var(--success)' : 'var(--text-muted)', fontWeight: 700 }}>{paid ? '✓ Paid' : '—'}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

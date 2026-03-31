const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000/api';

const req = async (method, path, body = null) => {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  // Auth
  login: (payload) => req('POST', '/auth/login', payload),

  // Dashboard
  dashboard: () => req('GET', '/dashboard'),

  // Patients
  getPatients: () => req('GET', '/patients'),
  registerPatient: (data) => req('POST', '/patients', data),

  // Doctors
  getDoctors: () => req('GET', '/doctors'),

  // Appointments
  getAppointments: () => req('GET', '/appointments'),
  bookAppointment: (data) => req('POST', '/appointments', data),
  cancelAppointment: (id) => req('PUT', `/appointments/${id}/cancel`),

  // Billing
  getBilling: () => req('GET', '/billing'),
  payBill: (id) => req('PUT', `/billing/${id}/pay`),
};

export default function Toast({ title, msg, type = 'success' }) {
  const border = type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)';
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  return (
    <div style={{
      position: 'fixed', top: 30, right: 30,
      background: 'var(--bg-surface)',
      border: `1px solid var(--border-color)`,
      borderLeft: `4px solid ${border}`,
      padding: '1rem 2rem', borderRadius: 8,
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      display: 'flex', alignItems: 'center', gap: '1rem',
      zIndex: 9999, animation: 'slideIn 0.4s ease'
    }}>
      <i className={`fas ${icon}`} style={{ color: border, fontSize: '1.3rem' }} />
      <div>
        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{title}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{msg}</div>
      </div>
    </div>
  );
}

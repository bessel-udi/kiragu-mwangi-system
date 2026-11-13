// ui-kit/src/components/EmptyState.jsx
// Friendly message when a list or search has no results, with an optional action button.
// Usage: <EmptyState title="No bookings yet" message="Book a viewing to get started."
//          action={<a className="btn btn-primary" href="/properties">Browse properties</a>} />
export default function EmptyState({
  icon = 'fa-regular fa-folder-open',
  title,
  message,
  action = null,
  className = '',
}) {
  return (
    <div className={`text-center py-5 px-3 ${className}`}>
      <i className={`${icon} fa-2x mb-3`} style={{ color: 'var(--km-slate)' }} aria-hidden="true" />
      <h2 className="h5">{title}</h2>
      {message && <p className="text-secondary mb-3">{message}</p>}
      {action}
    </div>
  );
}

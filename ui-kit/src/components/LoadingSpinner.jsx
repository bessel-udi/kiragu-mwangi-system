// ui-kit/src/components/LoadingSpinner.jsx
// Centred loading spinner with an accessible label.
// Usage: <LoadingSpinner /> or <LoadingSpinner label="Loading bookings" inline />
import Spinner from 'react-bootstrap/Spinner';

export default function LoadingSpinner({ label = 'Loading', inline = false, className = '' }) {
  return (
    <div
      role="status"
      className={`${inline ? 'd-inline-flex' : 'd-flex justify-content-center py-5'} align-items-center gap-2 ${className}`}
    >
      <Spinner
        animation="border"
        size={inline ? 'sm' : undefined}
        variant="primary"
        aria-hidden="true"
      />
      <span className={inline ? '' : 'visually-hidden'}>{label}</span>
    </div>
  );
}

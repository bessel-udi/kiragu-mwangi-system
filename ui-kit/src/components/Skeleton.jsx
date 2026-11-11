// ui-kit/src/components/Skeleton.jsx
// Grey placeholder shown while content loads.
// Usage: <Skeleton lines={3} /> for text, <Skeleton variant="card" /> for a listing-card shape.
import Placeholder from 'react-bootstrap/Placeholder';

export default function Skeleton({ variant = 'text', lines = 3, className = '' }) {
  if (variant === 'card') {
    return (
      <div className={`card ${className}`} aria-hidden="true">
        <Placeholder as="div" animation="glow">
          <Placeholder xs={12} style={{ height: '10rem', display: 'block' }} />
        </Placeholder>
        <div className="card-body">
          <Placeholder as="p" animation="glow">
            <Placeholder xs={8} />
          </Placeholder>
          <Placeholder as="p" animation="glow" className="mb-0">
            <Placeholder xs={5} />
          </Placeholder>
        </div>
      </div>
    );
  }

  return (
    <Placeholder as="div" animation="glow" className={className} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Placeholder key={index} xs={index === lines - 1 ? 6 : 12} className="d-block mb-2" />
      ))}
    </Placeholder>
  );
}

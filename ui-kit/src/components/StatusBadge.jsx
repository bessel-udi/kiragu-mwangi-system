// ui-kit/src/components/StatusBadge.jsx
// The single status badge used everywhere (web and admin), so colours never drift.
// Usage: <StatusBadge kind="booking" status="pending" />
// kind: "booking" | "valuation" | "property"; status: the contract's enum value.

// One mapping per kind (guide Section 1.6). "muted" = withdrawn properties.
const TONES = {
  booking: {
    pending: 'warning',
    confirmed: 'success',
    rescheduled: 'info',
    completed: 'secondary',
    cancelled: 'danger',
  },
  valuation: {
    submitted: 'warning',
    under_review: 'info',
    completed: 'success',
  },
  property: {
    available: 'success',
    under_offer: 'warning',
    sold: 'secondary',
    rented: 'secondary',
    withdrawn: 'muted',
  },
};

// "under_review" -> "Under review"
function humanise(status) {
  const text = String(status ?? '').replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function StatusBadge({ kind, status, label, className = '' }) {
  const tone = TONES[kind]?.[status] ?? 'muted';
  const colour = tone === 'muted' ? 'var(--km-slate)' : `var(--bs-${tone})`;

  return (
    <span
      className={`badge d-inline-flex align-items-center gap-2 fw-semibold ${className}`}
      style={{
        color: 'var(--km-ink)',
        backgroundColor:
          tone === 'muted' ? 'transparent' : `color-mix(in srgb, ${colour} 14%, white)`,
        border: `1px ${tone === 'muted' ? 'dashed' : 'solid'} color-mix(in srgb, ${colour} 55%, white)`,
        fontSize: '0.8rem',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: '0.5rem',
          height: '0.5rem',
          borderRadius: '50%',
          backgroundColor: colour,
        }}
      />
      {label ?? humanise(status)}
    </span>
  );
}

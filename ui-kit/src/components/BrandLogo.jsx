// ui-kit/src/components/BrandLogo.jsx
// Company brand mark: a brass "K&M" tile plus the company name in the heading typeface.
// Usage: <BrandLogo /> on light backgrounds, <BrandLogo inverse /> on navy (e.g. the footer or sidebar).
export default function BrandLogo({ inverse = false, showName = true, className = '' }) {
  const nameColour = inverse ? '#ffffff' : 'var(--km-navy)';

  return (
    <span
      className={`d-inline-flex align-items-center gap-2 text-decoration-none ${className}`}
      aria-label="Kiragu & Mwangi"
    >
      <span
        aria-hidden="true"
        className="d-inline-flex align-items-center justify-content-center fw-bold"
        style={{
          width: '2.25rem',
          height: '2.25rem',
          borderRadius: 'var(--km-radius)',
          backgroundColor: 'var(--km-brass)',
          color: 'var(--km-navy)',
          fontFamily: 'var(--km-font-heading)',
          fontSize: '1rem',
        }}
      >
        K&amp;M
      </span>
      {showName && (
        <span
          style={{
            fontFamily: 'var(--km-font-heading)',
            fontWeight: 700,
            fontSize: '1.15rem',
            color: nameColour,
          }}
        >
          Kiragu &amp; Mwangi
        </span>
      )}
    </span>
  );
}

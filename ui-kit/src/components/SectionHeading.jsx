// ui-kit/src/components/SectionHeading.jsx
// Section title in the heading typeface with an optional subtitle, a short brass rule
// and an optional actions slot (e.g. a button on the right).
// Usage: <SectionHeading title="Featured properties" subtitle="Newest listings" level={2} />
export default function SectionHeading({
  title,
  subtitle,
  level = 2,
  align = 'start',
  actions = null,
  className = '',
}) {
  const Tag = `h${level}`;
  const centred = align === 'center';

  return (
    <div
      className={`mb-4 d-flex flex-wrap gap-3 align-items-end ${
        centred ? 'justify-content-center text-center' : 'justify-content-between'
      } ${className}`}
    >
      <div>
        <Tag className="mb-2">{title}</Tag>
        <div
          aria-hidden="true"
          className={centred ? 'mx-auto' : ''}
          style={{
            width: '3rem',
            height: '3px',
            borderRadius: '2px',
            backgroundColor: 'var(--km-brass)',
          }}
        />
        {subtitle && <p className="text-secondary mt-2 mb-0">{subtitle}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}

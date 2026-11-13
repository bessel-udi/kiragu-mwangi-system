// ui-kit/src/components/InlineAlert.jsx
// In-page message box for form-level or page-level feedback (not a popup).
// Usage: <InlineAlert variant="danger" title="Could not save">Email is already registered.</InlineAlert>
import Alert from 'react-bootstrap/Alert';

export default function InlineAlert({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) {
  return (
    <Alert variant={variant} dismissible={Boolean(onClose)} onClose={onClose} className={className}>
      {title && (
        <Alert.Heading as="h2" className="h6">
          {title}
        </Alert.Heading>
      )}
      {children}
    </Alert>
  );
}

// ui-kit/src/components/ErrorState.jsx
// Shown when a page or list fails to load, with a Retry button.
// Usage: <ErrorState message={error.message} onRetry={refetch} />
export default function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this. Please try again.',
  onRetry,
  retryLabel = 'Try again',
  className = '',
}) {
  return (
    <div role="alert" className={`text-center py-5 px-3 ${className}`}>
      <i className="fa-solid fa-triangle-exclamation fa-2x mb-3 text-danger" aria-hidden="true" />
      <h2 className="h5">{title}</h2>
      <p className="text-secondary mb-3">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline-primary" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  );
}

// ui-kit/src/components/ConfirmDialog.jsx
// Modal that asks the user to confirm an action (delete, cancel, deactivate).
// Usage: <ConfirmDialog show={open} title="Delete listing?" message="This cannot be undone."
//          confirmLabel="Delete" variant="danger" busy={deleting}
//          onConfirm={handleDelete} onCancel={() => setOpen(false)} />
import Modal from 'react-bootstrap/Modal';

export default function ConfirmDialog({
  show,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  busy = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal show={show} onHide={busy ? undefined : onCancel} centered>
      <Modal.Header closeButton={!busy}>
        <Modal.Title as="h2" className="h5 mb-0">
          {title}
        </Modal.Title>
      </Modal.Header>
      {message && <Modal.Body>{message}</Modal.Body>}
      <Modal.Footer>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onCancel}
          disabled={busy}
        >
          {cancelLabel}
        </button>
        <button type="button" className={`btn btn-${variant}`} onClick={onConfirm} disabled={busy}>
          {busy && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
          {confirmLabel}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

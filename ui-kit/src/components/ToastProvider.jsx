// ui-kit/src/components/ToastProvider.jsx
// Renders toast messages in the top-right corner and provides showToast() through useToast().
// Place it once near the root of each app, inside the router if toasts follow navigation.
import { useCallback, useMemo, useRef, useState } from 'react';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { ToastContext } from './ToastContext.js';

export default function ToastProvider({ children, autoHideMs = 5000 }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  // Adds a toast; variant is a Bootstrap colour name
  const showToast = useCallback((message, variant = 'success') => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, variant }]);
  }, []);

  // Removes one toast by id
  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 2000, position: 'fixed' }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            onClose={() => dismiss(toast.id)}
            delay={autoHideMs}
            autohide
            style={{ borderLeft: `4px solid var(--bs-${toast.variant})` }}
          >
            <div className="d-flex">
              <Toast.Body className="flex-grow-1">{toast.message}</Toast.Body>
              <button
                type="button"
                className="btn-close m-2 ms-0"
                aria-label="Close"
                onClick={() => dismiss(toast.id)}
              />
            </div>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

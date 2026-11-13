// ui-kit/src/components/ToastContext.js
// Context and hook for toast messages. Wrap the app in <ToastProvider>, then in any component:
//   const { showToast } = useToast();
//   showToast("Booking cancelled", "success");   // variants: success, danger, warning, info
import { createContext, useContext } from 'react';

export const ToastContext = createContext(null);

// Returns { showToast(message, variant?) }; throws if the provider is missing
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return context;
}

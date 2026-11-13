// ui-kit/src/index.js
// Common entry point of the ui-kit: loads fonts and exports the shared components and helpers.
// Styles are imported separately by each app via "ui-kit/styles".
import './styles/fonts.js';

export { default as BrandLogo } from './components/BrandLogo.jsx';
export { default as PageContainer } from './components/PageContainer.jsx';
export { default as SectionHeading } from './components/SectionHeading.jsx';
export { default as StatusBadge } from './components/StatusBadge.jsx';
export { default as FormField } from './components/FormField.jsx';
export { default as PasswordField } from './components/PasswordField.jsx';
export { default as SelectField } from './components/SelectField.jsx';
export { default as DateField } from './components/DateField.jsx';
export { default as TimeSlotPicker } from './components/TimeSlotPicker.jsx';
export { default as ConfirmDialog } from './components/ConfirmDialog.jsx';
export { default as ToastProvider } from './components/ToastProvider.jsx';
export { useToast } from './components/ToastContext.js';
export { default as InlineAlert } from './components/InlineAlert.jsx';
export { default as LoadingSpinner } from './components/LoadingSpinner.jsx';
export { default as Skeleton } from './components/Skeleton.jsx';
export { default as EmptyState } from './components/EmptyState.jsx';
export { default as ErrorState } from './components/ErrorState.jsx';
export { default as Pagination } from './components/Pagination.jsx';
export { default as DataTable } from './components/DataTable.jsx';

export {
  formatMoney,
  formatDate,
  formatDateTime,
  formatTime12,
  toApiTime,
} from './utils/format.js';

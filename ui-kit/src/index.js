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

export {
  formatMoney,
  formatDate,
  formatDateTime,
  formatTime12,
  toApiTime,
} from './utils/format.js';

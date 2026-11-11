# ui-kit

Shared "Heritage Navy & Brass" design system used by `/web` and `/admin`.
Owner: Kennedy (everything except `src/admin/`). Kwame owns `src/admin/` (the admin-only export).

## Use it in an app

```js
// once, in the app's entry file (main.jsx): theme + Bootstrap styles
import 'ui-kit/styles';
// anywhere: components and helpers
import { StatusBadge, formatMoney } from 'ui-kit';
// admin app only: admin-specific components
import {} from 'ui-kit/admin';
```

Wrap the app in `<ToastProvider>` once if you use toasts.

## Run the demo page

Opens http://localhost:5175 and shows every component and state. Check it on desktop and at 360px width.

## Theme

- `src/theme/_tokens.scss`: palette, typefaces, radius and shadows (guide Section 1.6).
- `src/theme/_bootstrap-overrides.scss`: Bootstrap 5.3 variable overrides built from the tokens.
- `src/styles/index.scss`: stylesheet entry (overrides, Bootstrap, global rules, component styles).
- Fonts (Inter, Playfair Display) and Font Awesome 6 Free are self-hosted through npm packages.
- Brass (#C8A24A) is for fills and borders. Do not use it as text colour on light backgrounds.
- Helper classes: `.btn-brass`, `.bg-brass`, `.border-brass`, `.km-price-badge`.

## Components

| Component                   | What it is for                                            | Main props                                                                                        |
| --------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `BrandLogo`                 | Company mark and name                                     | `inverse`, `showName`                                                                             |
| `PageContainer`             | Centred page wrapper with spacing                         | `fluid`, `as`                                                                                     |
| `SectionHeading`            | Title with brass rule, subtitle and actions slot          | `title`, `subtitle`, `level`, `align`, `actions`                                                  |
| `StatusBadge`               | The one status badge for bookings, valuations, properties | `kind` (`booking`, `valuation`, `property`), `status`, `label`                                    |
| `FormField`                 | Label, hint, control and inline error                     | `label`, `hint`, `error`, `required`; children is `(controlProps) => <input {...controlProps} />` |
| `PasswordField`             | Password input with show/hide                             | same as `FormField`; spread `register()`                                                          |
| `SelectField`               | Labelled dropdown                                         | `options` (`{ value, label }`), `placeholder`                                                     |
| `DateField`                 | Labelled date input (`YYYY-MM-DD`)                        | `min`, `max`                                                                                      |
| `TimeSlotPicker`            | Slot buttons; shows 12-hour, returns `HH:mm`              | `slots` (`{ time, available }`), `value`, `onChange`                                              |
| `ConfirmDialog`             | Confirm delete, cancel or deactivate                      | `show`, `title`, `message`, `confirmLabel`, `variant`, `busy`, `onConfirm`, `onCancel`            |
| `ToastProvider`, `useToast` | Toast messages                                            | `showToast(message, variant)`                                                                     |
| `InlineAlert`               | In-page message box                                       | `variant`, `title`, `onClose`                                                                     |
| `LoadingSpinner`            | Spinner with accessible label                             | `label`, `inline`                                                                                 |
| `Skeleton`                  | Loading placeholder                                       | `variant` (`text`, `card`), `lines`                                                               |
| `EmptyState`                | No results message with optional action                   | `title`, `message`, `action`, `icon`                                                              |
| `ErrorState`                | Failed to load, with retry                                | `title`, `message`, `onRetry`                                                                     |
| `Pagination`                | Page navigation (hidden if one page)                      | `page`, `totalPages`, `onPageChange`                                                              |
| `DataTable`                 | Table that stacks into cards on phones                    | `columns` (`{ key, header, render? }`), `rows`, `getRowKey`, `emptyState`, `caption`              |

## Helpers

| Function                    | Example                              |
| --------------------------- | ------------------------------------ |
| `formatMoney(12500000)`     | `KES 12,500,000`                     |
| `formatDate("2026-11-07")`  | `7 Nov 2026`                         |
| `formatDateTime(isoString)` | `7 Nov 2026, 2:00 PM` (Nairobi time) |
| `formatTime12("14:00")`     | `2:00 PM`                            |
| `toApiTime("2:00 PM")`      | `14:00` (what the API expects)       |

## Rules

- Use `StatusBadge` for every status so colours never drift.
- The ui-kit calls no API. Pages map API responses to component props.
- Need a new common component? Ask Kennedy. Need an admin-only one? Ask Kwame.

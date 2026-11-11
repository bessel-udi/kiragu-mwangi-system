// ui-kit/demo/DemoPage.jsx
// Visual test page: shows every ui-kit component and its main states, for desktop and 360px checks.
// Not part of the web or admin apps. Uses sample data only (no API calls).
import { useState } from 'react';
import {
  BrandLogo,
  PageContainer,
  SectionHeading,
  StatusBadge,
  FormField,
  PasswordField,
  SelectField,
  DateField,
  TimeSlotPicker,
  ConfirmDialog,
  useToast,
  InlineAlert,
  LoadingSpinner,
  Skeleton,
  EmptyState,
  ErrorState,
  Pagination,
  DataTable,
  formatMoney,
  formatDate,
  formatDateTime,
  formatTime12,
  toApiTime,
} from '../src/index.js';

const BOOKING_STATUSES = ['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'];
const VALUATION_STATUSES = ['submitted', 'under_review', 'completed'];
const PROPERTY_STATUSES = ['available', 'under_offer', 'sold', 'rented', 'withdrawn'];

// Slots 09:00 to 16:00; two are marked taken to show the disabled state
const SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'].map(
  (time) => ({ time, available: time !== '11:00' && time !== '14:00' }),
);

const TABLE_ROWS = [
  { id: 1, property: '3 bedroom apartment, Kilimani', date: '2026-11-07', status: 'pending' },
  { id: 2, property: 'Commercial plot, Westlands', date: '2026-11-09', status: 'confirmed' },
  { id: 3, property: 'Townhouse, Karen', date: '2026-11-12', status: 'completed' },
];

// Wrapper that gives each demo block a heading
function Block({ title, children }) {
  return (
    <section className="mb-5">
      <SectionHeading title={title} level={2} />
      {children}
    </section>
  );
}

export default function DemoPage() {
  const { showToast } = useToast();
  const [slot, setSlot] = useState('');
  const [page, setPage] = useState(3);
  const [dialogOpen, setDialogOpen] = useState(false);

  const columns = [
    { key: 'property', header: 'Property' },
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge kind="booking" status={row.status} />,
    },
  ];

  return (
    <PageContainer>
      <h1 className="mb-4">UI kit demo</h1>

      <Block title="Brand and headings">
        <div className="d-flex flex-wrap gap-4 align-items-center">
          <BrandLogo />
          <div className="p-3 rounded" style={{ backgroundColor: 'var(--km-navy)' }}>
            <BrandLogo inverse />
          </div>
        </div>
        <div className="mt-4">
          <SectionHeading
            title="Section with subtitle and action"
            subtitle="A short supporting line"
            actions={<button className="btn btn-brass">Brass call to action</button>}
          />
        </div>
      </Block>

      <Block title="Buttons">
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-brass">Brass</button>
          <button className="btn btn-outline-primary">Outline</button>
          <button className="btn btn-danger">Danger</button>
          <button className="btn btn-primary" disabled>
            Disabled
          </button>
        </div>
        <div className="mt-3">
          <span className="km-price-badge">{formatMoney(12500000)}</span>
        </div>
      </Block>

      <Block title="Status badges">
        {[
          ['booking', BOOKING_STATUSES],
          ['valuation', VALUATION_STATUSES],
          ['property', PROPERTY_STATUSES],
        ].map(([kind, statuses]) => (
          <div key={kind} className="d-flex flex-wrap gap-2 align-items-center mb-2">
            <strong className="me-2 text-capitalize" style={{ minWidth: '5.5rem' }}>
              {kind}
            </strong>
            {statuses.map((status) => (
              <StatusBadge key={status} kind={kind} status={status} />
            ))}
          </div>
        ))}
      </Block>

      <Block title="Form fields">
        <div className="row">
          <div className="col-md-6">
            <FormField label="Full name" hint="As it appears on your ID" required>
              {(props) => <input className="form-control" {...props} />}
            </FormField>
            <FormField label="Email" error="Enter a valid email address" required>
              {(props) => (
                <input className="form-control is-invalid" defaultValue="not-an-email" {...props} />
              )}
            </FormField>
            <PasswordField label="Password" hint="8 to 72 characters" />
          </div>
          <div className="col-md-6">
            <SelectField
              label="Category"
              placeholder="Any category"
              options={[
                { value: 'residential', label: 'Residential' },
                { value: 'commercial', label: 'Commercial' },
                { value: 'land', label: 'Land' },
              ]}
            />
            <DateField label="Viewing date" min="2026-11-11" />
            <DateField label="Date with an error" error="Pick a date that is not a Sunday" />
          </div>
        </div>
      </Block>

      <Block title="Time-slot picker">
        <TimeSlotPicker slots={SLOTS} value={slot} onChange={setSlot} />
        <p className="text-secondary mb-0">
          Selected:{' '}
          {slot
            ? `${formatTime12(slot)} (sent to the API as ${toApiTime(formatTime12(slot))})`
            : 'none'}
        </p>
        <TimeSlotPicker slots={[]} label="Empty day (for example a Sunday)" className="mt-3" />
      </Block>

      <Block title="Feedback">
        <div className="d-flex flex-wrap gap-2 mb-3">
          <button
            className="btn btn-outline-success"
            onClick={() => showToast('Booking saved', 'success')}
          >
            Success toast
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={() => showToast('Could not reach the server', 'danger')}
          >
            Error toast
          </button>
          <button className="btn btn-outline-danger" onClick={() => setDialogOpen(true)}>
            Open confirm dialog
          </button>
        </div>
        <InlineAlert variant="info" title="Heads up">
          Bookings stay pending until an admin confirms them.
        </InlineAlert>
        <InlineAlert variant="danger">
          The slot was just taken. Please choose another time.
        </InlineAlert>
        <ConfirmDialog
          show={dialogOpen}
          title="Delete this listing?"
          message="This cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => {
            setDialogOpen(false);
            showToast('Listing deleted', 'success');
          }}
          onCancel={() => setDialogOpen(false)}
        />
      </Block>

      <Block title="Loading, empty and error states">
        <div className="row g-3">
          <div className="col-md-4">
            <LoadingSpinner label="Loading listings" />
            <Skeleton lines={3} />
          </div>
          <div className="col-md-4">
            <Skeleton variant="card" />
          </div>
          <div className="col-md-4">
            <EmptyState
              title="No bookings yet"
              message="Book a viewing to get started."
              action={<button className="btn btn-primary">Browse properties</button>}
            />
          </div>
        </div>
        <ErrorState onRetry={() => showToast('Retrying...', 'info')} />
      </Block>

      <Block title="Data table and pagination">
        <DataTable columns={columns} rows={TABLE_ROWS} caption="Sample bookings" />
        <Pagination page={page} totalPages={9} onPageChange={setPage} className="mt-3" />
      </Block>

      <Block title="Formatting helpers">
        <ul className="mb-0">
          <li>Money: {formatMoney(12500000)}</li>
          <li>Date: {formatDate('2026-11-07')}</li>
          <li>Date and time (Nairobi): {formatDateTime('2026-11-07T11:00:00Z')}</li>
          <li>12-hour time: {formatTime12('14:00')}</li>
          <li>To API time: {toApiTime('2:00 PM')}</li>
        </ul>
      </Block>
    </PageContainer>
  );
}

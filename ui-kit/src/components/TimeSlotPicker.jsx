// ui-kit/src/components/TimeSlotPicker.jsx
// Group of time-slot buttons. Slots are [{ time: "09:00", available: true }].
// Shows 12-hour labels but calls onChange with the 24-hour "HH:mm" value the API expects.
// The page maps the availability response to this shape.
//   <TimeSlotPicker slots={slots} value={time} onChange={setTime} />
import { useId } from 'react';
import { formatTime12 } from '../utils/format.js';

export default function TimeSlotPicker({
  slots = [],
  value = '',
  onChange,
  label = 'Choose a time',
  disabled = false,
  emptyMessage = 'No viewing slots are available on this date.',
  className = '',
}) {
  const labelId = useId();

  return (
    <div className={`mb-3 ${className}`}>
      <div id={labelId} className="form-label">
        {label}
      </div>
      {slots.length === 0 ? (
        <p className="text-secondary mb-0">{emptyMessage}</p>
      ) : (
        <div role="radiogroup" aria-labelledby={labelId} className="d-flex flex-wrap gap-2">
          {slots.map((slot) => {
            const selected = slot.time === value;
            const unavailable = !slot.available;
            return (
              <button
                key={slot.time}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={disabled || unavailable}
                title={unavailable ? 'This slot is taken' : undefined}
                className={`btn ${selected ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => onChange?.(slot.time)}
              >
                {formatTime12(slot.time)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ui-kit/src/components/DataTable.jsx
// Table that stacks into labelled cards on phones (below 768px) and stays a normal
// compact table on larger screens. Columns: [{ key, header, render?, className? }].
// render(row) returns the cell content; without it the cell shows row[key].
// Usage: <DataTable columns={columns} rows={items} getRowKey={(row) => row.id}
//          emptyState={<EmptyState title="No bookings" />} caption="Bookings" />
export default function DataTable({
  columns = [],
  rows = [],
  getRowKey = (row) => row.id,
  caption,
  emptyState = null,
  className = '',
}) {
  if (rows.length === 0 && emptyState) return emptyState;

  return (
    <div className="km-table-wrap">
      <table className={`table table-hover align-middle km-data-table ${className}`}>
        {caption && <caption className="visually-hidden">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={column.className}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => (
                <td key={column.key} data-label={column.header} className={column.className}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

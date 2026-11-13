// ui-kit/src/components/Pagination.jsx
// Page navigation control: Previous, numbered pages with "..." gaps, Next.
// Renders nothing when there is only one page.
// Usage: <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
import BsPagination from 'react-bootstrap/Pagination';

// Lists the pages to show (first, last, current and its neighbours) with gap markers
function buildPages(page, totalPages) {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const pages = [...wanted].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const result = [];
  pages.forEach((n, index) => {
    if (index > 0 && n - pages[index - 1] > 1) result.push(`gap-${n}`);
    result.push(n);
  });
  return result;
}

export default function Pagination({ page = 1, totalPages = 1, onPageChange, className = '' }) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className={`d-flex justify-content-center ${className}`}>
      <BsPagination className="mb-0 flex-wrap justify-content-center">
        <BsPagination.Prev
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
          aria-label="Previous page"
        />
        {buildPages(page, totalPages).map((item) =>
          typeof item === 'string' ? (
            <BsPagination.Ellipsis key={item} disabled />
          ) : (
            <BsPagination.Item
              key={item}
              active={item === page}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange?.(item)}
            >
              {item}
            </BsPagination.Item>
          ),
        )}
        <BsPagination.Next
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(page + 1)}
          aria-label="Next page"
        />
      </BsPagination>
    </nav>
  );
}

"use client";

import { PAGE_SIZE } from "@/lib/api";

interface PagerProps {
  page: number;
  total: number;
  onChange: (page: number) => void;
}

// Numbered pages: Prev, a window of page numbers around the current page, Next
export default function Pager({ page, total, onChange }: PagerProps) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (totalPages <= 1) return null;

  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  const numbers: number[] = [];
  for (let p = start; p <= end; p++) numbers.push(p);

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <nav className="pager" aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Prev
      </button>
      {start > 1 && (
        <>
          <button type="button" onClick={() => onChange(1)}>
            1
          </button>
          {start > 2 && <span>…</span>}
        </>
      )}
      {numbers.map((p) => (
        <button
          key={p}
          type="button"
          className={p === page ? "current" : ""}
          aria-current={p === page ? "page" : undefined}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span>…</span>}
          <button type="button" onClick={() => onChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}
      <button type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
      <span className="muted">
        {from}–{to} of {total}
      </span>
    </nav>
  );
}

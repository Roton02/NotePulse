"use client";

import { PAGE_SIZE } from "@/lib/api";

interface PagerProps {
  page: number;
  total: number;
  onChange: (page: number) => void;
}

export default function Pager({ page, total, onChange }: PagerProps) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <div className="pager">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Prev
      </button>
      <span>
        Page {page} of {totalPages} ({total} total)
      </span>
      <button type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  );
}

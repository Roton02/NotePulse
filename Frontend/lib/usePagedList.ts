"use client";

import { useCallback, useEffect, useState } from "react";
import { api, errorMessage, PAGE_SIZE } from "@/lib/api";
import { ApiEnvelope, Meta } from "@/lib/types";

// Loads one page of a list endpoint and keeps the page state in one place
export function usePagedList<T>(url: string) {
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: PAGE_SIZE, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const { data } = await api.get<ApiEnvelope<T[]>>(url, { params: { page, limit: PAGE_SIZE } });
        // If the last item on a page was removed, step back to the previous page
        if (data.result.length === 0 && page > 1) {
          setLoading(false);
          return load(page - 1);
        }
        setItems(data.result);
        if (data.meta) setMeta(data.meta);
        setError("");
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  return { items, meta, loading, error, load, reload: () => load(meta.page) };
}

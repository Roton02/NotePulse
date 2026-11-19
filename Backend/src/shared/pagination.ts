export const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;

// Reads ?page and ?limit safely: invalid or missing values fall back to defaults,
// and limit is capped so one request cannot pull the whole collection.
export const getPagination = (query: { page?: unknown; limit?: unknown }) => {
  const page = Math.max(1, Math.floor(Number(query.page)) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(Number(query.limit)) || DEFAULT_LIMIT));
  return { page, limit, skip: (page - 1) * limit };
};

export const buildMeta = (page: number, limit: number, total: number) => ({ page, limit, total });

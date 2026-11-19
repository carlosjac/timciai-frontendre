/**
 * Fetches every row for a list by paging until `total` is reached.
 * Pure orchestration — inject `fetchPage` from infrastructure / Refine adapter.
 */

export async function fetchAllListPages<T>(options: {
  fetchPage: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>;
  pageSize?: number;
  /** Page already loaded. The walk continues at page 2. */
  initial?: { data: T[]; total: number };
}): Promise<T[]> {
  const pageSize = options.pageSize ?? 100;
  const acc: T[] = options.initial ? [...options.initial.data] : [];
  let page = options.initial ? 2 : 1;
  let total = options.initial?.total ?? Number.POSITIVE_INFINITY;
  if (options.initial && (acc.length >= total || options.initial.data.length === 0)) {
    return acc;
  }

  while (acc.length < total) {
    const { data, total: t } = await options.fetchPage(page, pageSize);
    total = t;
    acc.push(...data);
    if (data.length === 0) break;
    page += 1;
    if (acc.length >= total) break;
  }

  return acc;
}

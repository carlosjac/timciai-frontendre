/**
 * Fetches every row for a list by paging until `total` is reached.
 * Pure orchestration — inject `fetchPage` from infrastructure / Refine adapter.
 */

export async function fetchAllListPages<T>(options: {
  fetchPage: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>;
  pageSize?: number;
}): Promise<T[]> {
  const pageSize = options.pageSize ?? 300;
  const acc: T[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

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

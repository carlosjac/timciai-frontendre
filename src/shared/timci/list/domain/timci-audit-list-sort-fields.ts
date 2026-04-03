/**
 * TimciColumnDef.sortField values for audit columns. Must match backend list `sort` (e.g. §4.8.1).
 */
export const TIMCI_LIST_SORT_BY_AUDIT_USER_NAME = {
  createdBy: 'createdByName',
  updatedBy: 'updatedByName',
} as const;

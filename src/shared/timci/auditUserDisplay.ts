import type { TimciAuditUserRef } from './auditUserRef.js';

/** UUID v4 / v7 style (backend user ids). */
const UUID_LIKE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function timciLooksLikeUuid(value: string): boolean {
  return UUID_LIKE.test(value.trim());
}

function mergeRef(
  row: Record<string, unknown>,
  idKey: 'createdBy' | 'updatedBy',
  nameKey: 'createdByName' | 'updatedByName',
): void {
  const v = row[idKey];
  const flatNameRaw = row[nameKey];
  const flatName = typeof flatNameRaw === 'string' ? flatNameRaw.trim() : '';

  if (typeof v === 'string' && v.trim()) {
    row[idKey] = { id: v.trim(), name: flatName };
    delete row[nameKey];
    return;
  }

  if (v != null && typeof v === 'object' && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    const id = typeof o.id === 'string' ? o.id.trim() : '';
    let name = typeof o.name === 'string' ? o.name.trim() : '';
    if (!name && flatName) name = flatName;
    row[idKey] = { id, name };
    delete row[nameKey];
  }
}

function applySnakeName(
  row: Record<string, unknown>,
  idKey: 'createdBy' | 'updatedBy',
  snakeKey: 'created_by_name' | 'updated_by_name',
): void {
  const snake = row[snakeKey];
  if (typeof snake !== 'string' || snake.trim() === '') return;
  const cur = row[idKey];
  if (cur != null && typeof cur === 'object' && !Array.isArray(cur)) {
    const o = cur as Record<string, unknown>;
    const n = typeof o.name === 'string' ? o.name.trim() : '';
    if (!n) o.name = snake;
  }
}

/**
 * Normalizes audit fields to backend shape: `createdBy` / `updatedBy` as `{ id, name }`.
 * Accepts legacy flat string ids + `*Name`, or snake_case `*_name` helpers.
 */
export function normalizeTimciAuditFieldsInPlace(row: Record<string, unknown>): void {
  mergeRef(row, 'createdBy', 'createdByName');
  mergeRef(row, 'updatedBy', 'updatedByName');
  applySnakeName(row, 'createdBy', 'created_by_name');
  applySnakeName(row, 'updatedBy', 'updated_by_name');
}

export function mapTimciListRowsWithAuditFields<T>(rows: T[]): T[] {
  return rows.map((row) => {
    if (row != null && typeof row === 'object') {
      normalizeTimciAuditFieldsInPlace(row as Record<string, unknown>);
    }
    return row;
  });
}

function displayNameFromRef(ref: unknown): string {
  if (ref == null || typeof ref !== 'object' || Array.isArray(ref)) return '';
  const name = typeof (ref as TimciAuditUserRef).name === 'string' ? (ref as TimciAuditUserRef).name.trim() : '';
  if (!name) return '';
  if (timciLooksLikeUuid(name)) return '';
  return name;
}

/**
 * Human-readable label for “created by” / “updated by” (never a bare UUID).
 */
export function timciAuditUserDisplayText(
  record: Record<string, unknown>,
  kind: 'created' | 'updated',
): string {
  const key = kind === 'created' ? 'createdBy' : 'updatedBy';
  const fromRef = displayNameFromRef(record[key]);
  if (fromRef) return fromRef;

  const nameKeys =
    kind === 'created'
      ? (['createdByName', 'created_by_name'] as const)
      : (['updatedByName', 'updated_by_name'] as const);
  for (const k of nameKeys) {
    const v = record[k];
    if (typeof v !== 'string') continue;
    const t = v.trim();
    if (!t) continue;
    if (!timciLooksLikeUuid(t)) return t;
  }
  return '';
}

export function timciAuditColumnKind(dataIndex: string): 'created' | 'updated' | null {
  if (
    dataIndex === 'createdBy' ||
    dataIndex === 'createdByName' ||
    dataIndex === 'created_by_name'
  ) {
    return 'created';
  }
  if (
    dataIndex === 'updatedBy' ||
    dataIndex === 'updatedByName' ||
    dataIndex === 'updated_by_name'
  ) {
    return 'updated';
  }
  return null;
}

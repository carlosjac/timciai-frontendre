import { getV1Base } from '../../config.js';
import { timciLooksLikeUuid } from './auditUserDisplay.js';
import { timciFetch } from './http.js';
import { parseContentRangeTotal } from './listQuery.js';

const USERS_LIST_PAGE_SIZE = 500;
const CACHE_TTL_MS = 90_000;

let usersDisplayNameCache: { map: Map<string, string>; at: number } | null = null;

function userRecordDisplayLabel(r: Record<string, unknown>): string {
  const name = typeof r.name === 'string' ? r.name.trim() : '';
  if (name) return name;
  const email = typeof r.email === 'string' ? r.email.trim() : '';
  if (email) return email;
  return '';
}

/**
 * Descarga todos los usuarios (paginado) y arma id → nombre/email, como el catálogo de referencias del `frontend`.
 */
async function fetchAllUsersDisplayNameMapUncached(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let start = 0;
  let total = Number.POSITIVE_INFINITY;

  while (start < total) {
    const end = start + USERS_LIST_PAGE_SIZE - 1;
    const qs = new URLSearchParams({
      sort: JSON.stringify(['email', 'ASC']),
      range: JSON.stringify([start, end]),
    });
    const { json, headers } = await timciFetch(`${getV1Base()}/authentication/users?${qs.toString()}`);
    const arr = Array.isArray(json) ? json : [];
    const t = parseContentRangeTotal(headers);
    if (t != null) total = t;

    for (const raw of arr) {
      if (raw == null || typeof raw !== 'object') continue;
      const row = raw as Record<string, unknown>;
      const id = String(row.id ?? '').trim();
      const label = userRecordDisplayLabel(row);
      if (id && label) map.set(id, label);
    }

    if (arr.length === 0) break;
    start += USERS_LIST_PAGE_SIZE;
    if (arr.length < USERS_LIST_PAGE_SIZE) break;
  }

  return map;
}

export async function getCachedUsersDisplayNameMap(): Promise<Map<string, string>> {
  const now = Date.now();
  if (usersDisplayNameCache && now - usersDisplayNameCache.at < CACHE_TTL_MS) {
    return usersDisplayNameCache.map;
  }
  const map = await fetchAllUsersDisplayNameMapUncached();
  usersDisplayNameCache = { map, at: now };
  return map;
}

function auditRefId(row: Record<string, unknown>, key: 'createdBy' | 'updatedBy'): string {
  const v = row[key];
  if (typeof v === 'string' && v.trim()) return v.trim();
  if (v != null && typeof v === 'object' && !Array.isArray(v)) {
    const id = typeof (v as { id?: unknown }).id === 'string' ? (v as { id: string }).id.trim() : '';
    if (id) return id;
  }
  return '';
}

function rowHasAuditUserIds(row: Record<string, unknown>): boolean {
  return auditRefId(row, 'createdBy') !== '' || auditRefId(row, 'updatedBy') !== '';
}

function anyRowMayNeedUserDirectory(rows: Record<string, unknown>[]): boolean {
  return rows.some(
    (r) =>
      rowHasAuditUserIds(r) ||
      (typeof r.userId === 'string' && r.userId.trim() !== ''),
  );
}

function ensureAuditObject(row: Record<string, unknown>, key: 'createdBy' | 'updatedBy'): Record<string, unknown> | null {
  const raw = row[key];
  if (typeof raw === 'string' && raw.trim()) {
    const o = { id: raw.trim(), name: '' };
    row[key] = o;
    return o;
  }
  if (raw != null && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return null;
}

function fillAuditNamesFromMap(row: Record<string, unknown>, map: Map<string, string>): void {
  const apply = (key: 'createdBy' | 'updatedBy') => {
    const ref = ensureAuditObject(row, key);
    if (!ref) return;
    const id = typeof ref.id === 'string' ? ref.id.trim() : '';
    if (!id) return;
    const nameRaw = ref.name;
    const nameStr = typeof nameRaw === 'string' ? nameRaw.trim() : '';
    if (nameStr && !timciLooksLikeUuid(nameStr)) return;
    const label = map.get(id);
    if (label) ref.name = label;
  };
  apply('createdBy');
  apply('updatedBy');
}

/** Asignaciones UTR: si `userName` falta o es el id, completar desde el directorio. */
function fillAssignmentUserNameFromMap(row: Record<string, unknown>, map: Map<string, string>): void {
  const uidRaw = row.userId;
  if (typeof uidRaw !== 'string' || !uidRaw.trim()) return;
  const uid = uidRaw.trim();
  const un = row.userName;
  const unStr = typeof un === 'string' ? un.trim() : '';
  if (unStr && unStr !== uid && !timciLooksLikeUuid(unStr)) return;
  const label = map.get(uid);
  if (label) row.userName = label;
}

/**
 * Completa `createdBy.name` / `updatedBy.name` (y a veces `userName` en UTR) usando el listado global de usuarios,
 * alineado con cómo el `frontend` resuelve identidades vía el recurso `users`.
 */
export async function hydrateTimciRowsWithUserDirectory(
  rows: Record<string, unknown>[],
): Promise<void> {
  if (rows.length === 0 || !anyRowMayNeedUserDirectory(rows)) return;
  let map: Map<string, string>;
  try {
    map = await getCachedUsersDisplayNameMap();
  } catch {
    return;
  }
  if (map.size === 0) return;
  for (const row of rows) {
    fillAuditNamesFromMap(row, map);
    fillAssignmentUserNameFromMap(row, map);
  }
}

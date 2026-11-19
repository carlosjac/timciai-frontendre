import { usePermissions, useTranslate } from '@refinedev/core';
import { Alert, Button } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  canSeeResourceMenuItem,
  type TimciPermissionsData,
} from '../../shared/timci/actionCodes.js';
import { getResourceApiBase, getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { timciFetch } from '../../shared/timci/http.js';
import { parseContentRangeTotal } from '../../shared/timci/listQuery.js';
import {
  DRAFT_NOTICE_ORDER,
  draftNoticeMessage,
  type DraftNoticeItem,
  type DraftNoticeResource,
} from './draftNotice.js';

const DRAFT_NOTICE_TTL_MS = 20_000;

type DraftNoticeCache = {
  tenantId: string;
  visibleKey: string;
  at: number;
  counts: Partial<Record<DraftNoticeResource, number>>;
};

let draftNoticeCache: DraftNoticeCache | null = null;
let draftNoticeInflight: Promise<DraftNoticeCache> | null = null;
const draftNoticeListeners = new Set<(cache: DraftNoticeCache) => void>();
let draftNoticeFocusBound = false;

function publishDraftNotice(cache: DraftNoticeCache) {
  draftNoticeCache = cache;
  for (const listener of draftNoticeListeners) listener(cache);
}

function loadDraftNotice(tenantId: string, visibleKey: string, force = false): Promise<DraftNoticeCache> {
  const fresh =
    draftNoticeCache != null &&
    draftNoticeCache.tenantId === tenantId &&
    draftNoticeCache.visibleKey === visibleKey &&
    Date.now() - draftNoticeCache.at < DRAFT_NOTICE_TTL_MS;
  if (!force && fresh && draftNoticeCache) return Promise.resolve(draftNoticeCache);
  if (!force && draftNoticeInflight) return draftNoticeInflight;
  const resources = visibleKey.split(',') as DraftNoticeResource[];
  draftNoticeInflight = Promise.all(
    resources.map(async (resource) => {
      try {
        return [resource, await fetchDraftCount(resource)] as const;
      } catch {
        return [resource, 0] as const;
      }
    }),
  ).then((rows) => {
    const cache: DraftNoticeCache = {
      tenantId,
      visibleKey,
      at: Date.now(),
      counts: Object.fromEntries(rows),
    };
    draftNoticeInflight = null;
    publishDraftNotice(cache);
    return cache;
  });
  return draftNoticeInflight;
}

function ensureDraftNoticeFocusRefresh() {
  if (draftNoticeFocusBound || typeof window === 'undefined') return;
  draftNoticeFocusBound = true;
  window.addEventListener('focus', () => {
    const current = draftNoticeCache;
    if (!current) return;
    if (Date.now() - current.at < DRAFT_NOTICE_TTL_MS) return;
    void loadDraftNotice(current.tenantId, current.visibleKey, true);
  });
}

async function fetchDraftCount(resource: DraftNoticeResource): Promise<number> {
  const base = getResourceApiBase(resource);
  if (!base) return 0;
  const params = new URLSearchParams({
    sort: JSON.stringify(['createdAt', 'DESC']),
    range: JSON.stringify([0, 0]),
    filter: JSON.stringify({ status: { operator: 'eq', value: 'draft' } }),
  });
  const { headers } = await timciFetch(`${base}?${params.toString()}`);
  return parseContentRangeTotal(headers) ?? 0;
}

type Props = {
  /** Franja de la cabecera, o aviso del tablero con la explicación. */
  placement: 'banner' | 'panel';
};

export function DraftNotice({ placement }: Props) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const [tenantId, setTenantId] = useState(() => getStoredTenantId());
  const [snapshot, setSnapshot] = useState<{
    tenantId: string;
    visibleKey: string;
    counts: Partial<Record<DraftNoticeResource, number>>;
  } | null>(null);

  useEffect(() => {
    const syncTenant = () => setTenantId(getStoredTenantId());
    window.addEventListener('timci-tenant-changed', syncTenant);
    window.addEventListener('storage', syncTenant);
    return () => {
      window.removeEventListener('timci-tenant-changed', syncTenant);
      window.removeEventListener('storage', syncTenant);
    };
  }, []);

  const codes = permData?.actionCodes;
  const visibleKey = DRAFT_NOTICE_ORDER.filter((entry) =>
    codes ? canSeeResourceMenuItem(entry.resource, codes) : false,
  )
    .map((entry) => entry.resource)
    .join(',');

  useEffect(() => {
    if (!tenantId || !visibleKey) return;
    ensureDraftNoticeFocusRefresh();
    let cancelled = false;
    const apply = (cache: DraftNoticeCache) => {
      if (cancelled || cache.tenantId !== tenantId || cache.visibleKey !== visibleKey) return;
      setSnapshot({ tenantId: cache.tenantId, visibleKey: cache.visibleKey, counts: cache.counts });
    };
    draftNoticeListeners.add(apply);
    void loadDraftNotice(tenantId, visibleKey).then(apply);
    return () => {
      cancelled = true;
      draftNoticeListeners.delete(apply);
    };
  }, [tenantId, visibleKey]);

  const counts =
    snapshot?.tenantId === tenantId && snapshot.visibleKey === visibleKey ? snapshot.counts : {};
  const present: DraftNoticeItem[] = DRAFT_NOTICE_ORDER.flatMap((entry) => {
    const count = counts[entry.resource] ?? 0;
    if (count < 1) return [];
    return [
      {
        resource: entry.resource,
        path: entry.path,
        count,
        noun: translate(
          count === 1
            ? `header.drafts.noun.${entry.resource}.one`
            : `header.drafts.noun.${entry.resource}.other`,
        ),
      },
    ];
  });
  if (present.length === 0) return null;

  return (
    <Alert
      type="info"
      showIcon
      banner={placement === 'banner'}
      role="status"
      style={placement === 'panel' ? { marginBottom: 16 } : { marginBottom: 0 }}
      message={draftNoticeMessage(present)}
      description={placement === 'panel' ? translate('header.drafts.description') : undefined}
      action={
        <Button
          size={placement === 'banner' ? 'small' : 'middle'}
          type="primary"
          onClick={() => navigate('/reports/drafts')}
        >
          {translate('header.drafts.openReport')}
        </Button>
      }
    />
  );
}

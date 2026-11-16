import { usePermissions, useTranslate } from '@refinedev/core';
import { Alert, Button, Space } from 'antd';
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
    const resources = visibleKey.split(',') as DraftNoticeResource[];
    let cancelled = false;
    const load = () => {
      void Promise.all(
        resources.map(async (resource) => {
          try {
            return [resource, await fetchDraftCount(resource)] as const;
          } catch {
            return [resource, 0] as const;
          }
        }),
      ).then((rows) => {
        if (cancelled) return;
        setSnapshot({ tenantId, visibleKey, counts: Object.fromEntries(rows) });
      });
    };
    load();
    window.addEventListener('focus', load);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', load);
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
        <Space wrap size="small">
          {present.map((item) => (
            <Button
              key={item.resource}
              size={placement === 'banner' ? 'small' : 'middle'}
              type="primary"
              onClick={() => navigate(item.path)}
            >
              {translate(`header.drafts.open.${item.resource}`)}
            </Button>
          ))}
        </Space>
      }
    />
  );
}

import { useMemo, useState } from 'react';
import {
  useCan,
  useDataProvider,
  useInvalidate,
  useLogout,
  useTranslate,
  type BaseRecord,
} from '@refinedev/core';
import { App, Button, Modal, Tag } from 'antd';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type SessionRow = BaseRecord & {
  id: string;
  userName?: string;
  startedAt: number;
  expiresAt: number;
  current: boolean;
  isOwn?: boolean;
};

function truncateId(id: string): string {
  if (id.length <= 8) return id;
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

export function SessionList() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const dataProvider = useDataProvider();
  const invalidate = useInvalidate();
  const { mutate: logout } = useLogout();
  const { message } = App.useApp();
  const { data: canDelete, isSuccess: canDeleteLoaded } = useCan({
    resource: 'sessions',
    action: 'delete',
  });

  const [revokeTarget, setRevokeTarget] = useState<{ id: string; isOwn?: boolean } | null>(null);
  const [revoking, setRevoking] = useState(false);

  const columnDefs = useMemo((): TimciColumnDef<SessionRow>[] => {
    const showRevoke = canDeleteLoaded && !!canDelete?.can;

    return [
      {
        key: 'id',
        dataIndex: 'id',
        titleKey: 'table.sessions.id',
        sorter: true,
        render: (v: unknown) => truncateId(String(v ?? '')),
        exportValue: (r) => r.id,
      },
      {
        key: 'userName',
        dataIndex: 'userName',
        titleKey: 'table.sessions.userName',
        sorter: true,
        render: (v: unknown) => (typeof v === 'string' && v ? v : '—'),
      },
      {
        key: 'startedAt',
        dataIndex: 'startedAt',
        titleKey: 'table.sessions.startedAt',
        sorter: true,
        render: (v: unknown) =>
          formatTimciUserDateTime(typeof v === 'number' ? v : Number(v), { dateFormat, timeZone }),
      },
      {
        key: 'expiresAt',
        dataIndex: 'expiresAt',
        titleKey: 'table.sessions.expiresAt',
        sorter: true,
        render: (v: unknown) =>
          formatTimciUserDateTime(typeof v === 'number' ? v : Number(v), { dateFormat, timeZone }),
      },
      {
        key: 'current',
        dataIndex: 'current',
        titleKey: 'table.sessions.current',
        sorter: true,
        render: (v: unknown) =>
          v ? (
            <Tag color="green">{translate('table.sessions.yes')}</Tag>
          ) : (
            <Tag>{translate('table.sessions.no')}</Tag>
          ),
        exportValue: (r) =>
          r.current ? translate('table.sessions.yes') : translate('table.sessions.no'),
      },
      ...(showRevoke
        ? ([
            {
              key: 'actions',
              dataIndex: 'id',
              titleKey: 'table.sessions.actions',
              width: 140,
              render: (_: unknown, record: SessionRow) => (
                <Button
                  type="link"
                  danger
                  size="small"
                  disabled={revoking}
                  onClick={() => setRevokeTarget({ id: record.id, isOwn: record.isOwn })}
                >
                  {translate('pages.sessions.revoke')}
                </Button>
              ),
              exportValue: () => '',
            },
          ] satisfies TimciColumnDef<SessionRow>[])
        : []),
    ];
  }, [canDelete?.can, canDeleteLoaded, dateFormat, revoking, timeZone, translate]);

  const handleRevokeOk = async () => {
    if (!revokeTarget) return;
    const { id, isOwn } = revokeTarget;
    setRevoking(true);
    try {
      await dataProvider().deleteOne({ resource: 'sessions', id });
      message.success(translate('pages.sessions.revoked'));
      setRevokeTarget(null);
      await invalidate({ resource: 'sessions', invalidates: ['list'] });
      if (isOwn) {
        setTimeout(() => logout(), 1000);
      }
    } catch (e: unknown) {
      message.error(
        e instanceof Error ? e.message : translate('pages.sessions.revokeError'),
      );
    } finally {
      setRevoking(false);
    }
  };

  return (
    <>
      <TimciDataList<SessionRow>
        resource="sessions"
        rowKey="id"
        titleKey="pages.sessions.title"
        columnDefs={columnDefs}
        pickerDateFormat={dateFormat}
      />
      <Modal
        open={revokeTarget != null}
        title={translate('pages.sessions.revokeConfirmTitle')}
        okText={translate('pages.sessions.revoke')}
        okButtonProps={{ danger: true, loading: revoking }}
        cancelText={translate('buttons.cancel')}
        onCancel={() => setRevokeTarget(null)}
        onOk={() => void handleRevokeOk()}
        destroyOnHidden
      >
        <p>{translate('pages.sessions.revokeConfirmBody')}</p>
      </Modal>
    </>
  );
}

import { useInvalidate, useTranslate } from '@refinedev/core';
import { App } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { timciFetch } from '../http.js';

type ToggleRecord = {
  id?: string;
  isActive?: boolean;
  name?: string;
};

type ToggleQuery = {
  refetch?: () => Promise<unknown>;
};

export function useTimciActivateDeactivateToggle(options: {
  resource: string;
  record: ToggleRecord | undefined;
  canActivate: boolean;
  canDeactivate: boolean;
  resolveToggleUrls: (id: string) => { activate: string; deactivate: string };
  i18nPrefix: string;
  query?: ToggleQuery;
  toggleEnabled?: boolean;
  /** HTTP method for activate/deactivate endpoints (default PATCH). */
  toggleMethod?: 'PATCH' | 'POST';
}) {
  const {
    resource,
    record,
    canActivate,
    canDeactivate,
    resolveToggleUrls,
    i18nPrefix,
    query,
    toggleEnabled = true,
    toggleMethod = 'PATCH',
  } = options;

  const translate = useTranslate();
  const { message } = App.useApp();
  const invalidate = useInvalidate();

  const [toggleOpen, setToggleOpen] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  const showToggle = useMemo(
    () =>
      toggleEnabled &&
      !!record?.id &&
      ((record.isActive && canDeactivate) || (!record.isActive && canActivate)),
    [canActivate, canDeactivate, record?.id, record?.isActive, toggleEnabled],
  );

  const performActivateDeactivate = useCallback(async () => {
    if (!record?.id) return;
    setToggleLoading(true);
    setToggleOpen(false);
    try {
      const { activate, deactivate } = resolveToggleUrls(record.id);
      const url = record.isActive ? deactivate : activate;
      await timciFetch(url, { method: toggleMethod });
      message.success(
        record.isActive
          ? translate(`${i18nPrefix}.deactivated`)
          : translate(`${i18nPrefix}.activated`),
      );
      await invalidate({
        resource,
        invalidates: ['list', 'detail'],
        id: record.id,
      });
      await query?.refetch?.();
    } catch (e: unknown) {
      message.error(
        e instanceof Error ? e.message : translate(`${i18nPrefix}.toggleError`),
      );
    } finally {
      setToggleLoading(false);
    }
  }, [
    i18nPrefix,
    invalidate,
    message,
    query,
    record?.id,
    record?.isActive,
    resolveToggleUrls,
    resource,
    toggleMethod,
    translate,
  ]);

  const toggleLabel = record?.isActive
    ? translate(`${i18nPrefix}.deactivate`)
    : translate(`${i18nPrefix}.activate`);
  const toggleConfirmTitle = record?.isActive
    ? translate(`${i18nPrefix}.confirmDeactivateTitle`)
    : translate(`${i18nPrefix}.confirmActivateTitle`);
  const toggleConfirmBody = record?.isActive
    ? translate(`${i18nPrefix}.confirmDeactivateBody`)
    : translate(`${i18nPrefix}.confirmActivateBody`);

  return {
    showToggle,
    toggleOpen,
    setToggleOpen,
    toggleLoading,
    toggleLabel,
    toggleConfirmTitle,
    toggleConfirmBody,
    performActivateDeactivate,
    recordName: record?.name,
    isActive: record?.isActive,
  };
}

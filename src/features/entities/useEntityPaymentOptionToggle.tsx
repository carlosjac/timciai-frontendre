import { useCallback, useState } from 'react';
import { App, Modal } from 'antd';
import { useInvalidate, useTranslate } from '@refinedev/core';
import {
  getEntityPaymentOptionActivateUrl,
  getEntityPaymentOptionDeactivateUrl,
} from '../../shared/timci/entitiesApi.js';
import { timciFetch } from '../../shared/timci/http.js';
import type { PaymentOptionRow } from './entity-types.js';

type UseEntityPaymentOptionToggleParams = {
  tenantId: string | null;
  entityId: string | undefined;
  onRefetch?: () => Promise<unknown> | void;
};

export function useEntityPaymentOptionToggle({
  tenantId,
  entityId,
  onRefetch,
}: UseEntityPaymentOptionToggleParams) {
  const translate = useTranslate();
  const { message } = App.useApp();
  const invalidate = useInvalidate();
  const [paymentToggleOpen, setPaymentToggleOpen] = useState(false);
  const [paymentToggleLoading, setPaymentToggleLoading] = useState(false);
  const [paymentToggleTarget, setPaymentToggleTarget] = useState<PaymentOptionRow | null>(null);

  const openPaymentToggle = useCallback((row: PaymentOptionRow) => {
    setPaymentToggleTarget(row);
    setPaymentToggleOpen(true);
  }, []);

  const closePaymentToggle = useCallback(() => {
    setPaymentToggleOpen(false);
    setPaymentToggleTarget(null);
  }, []);

  const performPaymentOptionToggle = useCallback(async () => {
    if (!tenantId || !entityId || !paymentToggleTarget?.id) return;
    setPaymentToggleLoading(true);
    setPaymentToggleOpen(false);
    try {
      const url = paymentToggleTarget.isActive
        ? getEntityPaymentOptionDeactivateUrl(tenantId, entityId, paymentToggleTarget.id)
        : getEntityPaymentOptionActivateUrl(tenantId, entityId, paymentToggleTarget.id);
      await timciFetch(url, { method: 'PATCH' });
      message.success(
        paymentToggleTarget.isActive
          ? translate('pages.entities.paymentOptionDeactivated')
          : translate('pages.entities.paymentOptionActivated'),
      );
      await invalidate({
        resource: 'entities',
        invalidates: ['detail'],
        id: entityId,
      });
      await onRefetch?.();
    } catch (e: unknown) {
      message.error(
        e instanceof Error ? e.message : translate('pages.entities.paymentOptionToggleError'),
      );
    } finally {
      setPaymentToggleLoading(false);
      setPaymentToggleTarget(null);
    }
  }, [entityId, invalidate, message, onRefetch, paymentToggleTarget, tenantId, translate]);

  const paymentToggleLabel = paymentToggleTarget?.isActive
    ? translate('pages.entities.paymentOptionDeactivate')
    : translate('pages.entities.paymentOptionActivate');
  const paymentToggleConfirmTitle = paymentToggleTarget?.isActive
    ? translate('pages.entities.confirmPaymentOptionDeactivateTitle')
    : translate('pages.entities.confirmPaymentOptionActivateTitle');
  const paymentToggleConfirmBody = paymentToggleTarget?.isActive
    ? translate('pages.entities.confirmPaymentOptionDeactivateBody')
    : translate('pages.entities.confirmPaymentOptionActivateBody');

  const paymentToggleModal = (
    <Modal
      open={paymentToggleOpen}
      title={paymentToggleConfirmTitle}
      okText={paymentToggleLabel}
      okButtonProps={{ danger: paymentToggleTarget?.isActive, loading: paymentToggleLoading }}
      cancelText={translate('buttons.cancel')}
      onCancel={closePaymentToggle}
      onOk={() => void performPaymentOptionToggle()}
      destroyOnClose
    >
      <p>
        {paymentToggleTarget?.name != null && paymentToggleTarget.name !== '' ? (
          <>
            <strong>«{paymentToggleTarget.name}»</strong>
            <br />
          </>
        ) : null}
        {paymentToggleConfirmBody}
      </p>
    </Modal>
  );

  return {
    paymentToggleLoading,
    openPaymentToggle,
    paymentToggleModal,
  };
}

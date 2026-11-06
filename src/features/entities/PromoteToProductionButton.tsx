import { useTranslate } from '@refinedev/core';
import { App, Button, Input, Modal } from 'antd';
import { useState } from 'react';
import { timciFetch } from '../../shared/timci/http.js';
import { getEntityPromoteToProductionUrl } from '../../shared/timci/entitiesApi.js';

type PromoteToProductionButtonProps = {
  tenantId: string;
  entityId: string;
  entityName: string;
  onPromoted: () => void;
};

export function PromoteToProductionButton({
  tenantId,
  entityId,
  entityName,
  onPromoted,
}: PromoteToProductionButtonProps) {
  const translate = useTranslate();
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const expected = entityName.trim();
  const matches = confirmation.trim() === expected && expected !== '';

  const close = () => {
    setOpen(false);
    setConfirmation('');
  };

  const submit = async () => {
    if (!matches) return;
    setSubmitting(true);
    try {
      await timciFetch(getEntityPromoteToProductionUrl(tenantId, entityId), {
        method: 'POST',
        body: JSON.stringify({ confirmationName: confirmation.trim() }),
      });
      message.success(translate('pages.entities.promoted'));
      close();
      window.dispatchEvent(new CustomEvent('timci-tenant-changed'));
      onPromoted();
    } catch (error) {
      const text = error instanceof Error ? error.message : translate('pages.entities.promoteError');
      message.error(text || translate('pages.entities.promoteError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button danger onClick={() => setOpen(true)}>
        {translate('pages.entities.promote')}
      </Button>
      <Modal
        title={translate('pages.entities.promoteTitle')}
        open={open}
        okText={translate('pages.entities.promote')}
        cancelText={translate('buttons.cancel')}
        okButtonProps={{ disabled: !matches }}
        confirmLoading={submitting}
        onOk={() => void submit()}
        onCancel={close}
        destroyOnHidden
      >
        <p>{translate('pages.entities.promoteBody')}</p>
        <label htmlFor="promote-entity-name" style={{ display: 'block', marginBottom: 8 }}>
          {translate('pages.entities.promoteConfirmLabel')}
        </label>
        <Input
          id="promote-entity-name"
          value={confirmation}
          autoComplete="off"
          onChange={(event) => setConfirmation(event.target.value)}
          onPressEnter={() => void submit()}
        />
      </Modal>
    </>
  );
}

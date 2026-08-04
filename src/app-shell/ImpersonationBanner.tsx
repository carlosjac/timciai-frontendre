import { useGetIdentity, useTranslate } from '@refinedev/core';
import { Alert, Button } from 'antd';
import { useState } from 'react';
import { invalidateTimciActionCodes } from '../shared/timci/actionCodes.js';
import {
  stopImpersonation,
  type TimciImpersonationState,
} from '../shared/timci/impersonationApi.js';

export type TimciIdentity = {
  id: string;
  name: string;
  email: string;
  impersonation?: TimciImpersonationState | null;
};

export function ImpersonationBanner() {
  const translate = useTranslate();
  const { data: identity } = useGetIdentity<TimciIdentity>();
  const [loading, setLoading] = useState(false);
  const impersonation = identity?.impersonation;

  if (!impersonation?.active) return null;

  const targetLabel = impersonation.target.name || impersonation.target.email;
  const actorLabel = impersonation.actor.name || impersonation.actor.email;

  const onStop = async () => {
    setLoading(true);
    try {
      await stopImpersonation();
      invalidateTimciActionCodes();
      window.location.assign('/');
    } catch {
      setLoading(false);
    }
  };

  return (
    <Alert
      type="warning"
      showIcon
      banner
      style={{ marginBottom: 0 }}
      message={translate('header.impersonation.banner', {
        target: targetLabel,
        actor: actorLabel,
      })}
      action={
        <Button
          size="small"
          type="primary"
          loading={loading}
          onClick={() => void onStop()}
          aria-label={translate('header.impersonation.stop')}
        >
          {translate('header.impersonation.stop')}
        </Button>
      }
    />
  );
}

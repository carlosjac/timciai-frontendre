import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useTranslate } from '@refinedev/core';
import { Alert, Button, Card, Typography } from 'antd';
import { Link } from 'react-router';
import { getV1Base } from '../../config.js';
import { timciFetch } from '../../shared/timci/http.js';
import {
  dismissReadyBanner,
  isEntitySettingsReviewed,
  isMonetaryPolicySkipped,
  isReadyBannerDismissed,
  skipMonetaryPolicyStep,
} from '../../shared/timci/setupProgress.js';

type SetupProgress = {
  hasActiveSellableItem: boolean;
  hasPricedPriceList: boolean;
  hasCustomer: boolean;
  monetaryPolicyIsDefaultNone: boolean;
};

type Step = {
  key: string;
  href: string;
  done: boolean;
  optional: boolean;
  later: boolean;
};

export function FirstSteps({
  userId,
  tenantId,
}: {
  userId: string;
  tenantId: string;
}): ReactElement | null {
  const translate = useTranslate();
  const [progress, setProgress] = useState<SetupProgress | null>(null);
  const [error, setError] = useState(false);
  const [skipped, setSkipped] = useState(() => isMonetaryPolicySkipped(userId, tenantId));
  const [dismissed, setDismissed] = useState(() => isReadyBannerDismissed(userId, tenantId));
  const [detailOpen, setDetailOpen] = useState(false);
  const reviewed = isEntitySettingsReviewed(userId, tenantId);
  const currentRef = useRef<HTMLAnchorElement>(null);
  const focused = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void timciFetch(`${getV1Base()}/tenants/${tenantId}/setup-progress`)
      .then((result) => {
        if (!cancelled) setProgress(result.json as SetupProgress);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  const steps: Step[] = progress
    ? [
        {
          key: 'settings',
          href: '/entity-settings',
          done: reviewed,
          optional: false,
          later: false,
        },
        {
          key: 'products',
          href: '/sellable-items',
          done: progress.hasActiveSellableItem,
          optional: false,
          later: false,
        },
        {
          key: 'priceLists',
          href: '/price-lists',
          done: progress.hasPricedPriceList,
          optional: false,
          later: false,
        },
        {
          key: 'monetary',
          href: '/monetary-policies',
          done: !progress.monetaryPolicyIsDefaultNone || skipped,
          optional: true,
          later: false,
        },
        {
          key: 'customers',
          href: '/customers',
          done: progress.hasCustomer,
          optional: false,
          later: false,
        },
        { key: 'subscriptions', href: '/subscriptions', done: false, optional: false, later: true },
        { key: 'sales', href: '/sales', done: false, optional: false, later: true },
        { key: 'collections', href: '/collections', done: false, optional: false, later: true },
      ]
    : [];

  const current = steps.find((step) => !step.later && !step.done);
  const ready = progress != null && steps.filter((step) => !step.later).every((step) => step.done);

  useEffect(() => {
    if (!current || focused.current) return;
    focused.current = true;
    currentRef.current?.focus();
  }, [current]);

  if (!tenantId) return null;
  if (dismissed && !error && (progress == null || ready)) return null;

  const hide = () => {
    dismissReadyBanner(userId, tenantId);
    setDismissed(true);
  };

  const checklist = (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
      {steps.map((step, index) => {
        const status = step.later
          ? translate('dashboard.firstSteps.later')
          : step.done
            ? translate('dashboard.firstSteps.done')
            : step.optional
              ? translate('dashboard.firstSteps.optional')
              : translate('dashboard.firstSteps.pending');
        const isCurrent = current?.key === step.key;

        return (
          <li
            key={step.key}
            aria-current={isCurrent ? 'step' : undefined}
            style={{
              display: 'grid',
              gap: 4,
              padding: 12,
              border: '1px solid var(--ant-color-border, #d9d9d9)',
              borderRadius: 8,
            }}
          >
            <Typography.Text strong>
              {index + 1}. {translate(`dashboard.firstSteps.steps.${step.key}.name`)}
            </Typography.Text>
            <Typography.Paragraph style={{ margin: 0 }}>
              {translate(`dashboard.firstSteps.steps.${step.key}.purpose`)}
            </Typography.Paragraph>
            <Typography.Text>
              {translate('dashboard.firstSteps.statusLabel')}: {status}
            </Typography.Text>
            <span>
              <Link ref={isCurrent ? currentRef : undefined} to={step.href}>
                {translate('dashboard.firstSteps.go')}
              </Link>
              {step.key === 'monetary' && !step.done ? (
                <Button
                  type="link"
                  onClick={() => {
                    skipMonetaryPolicyStep(userId, tenantId);
                    setSkipped(true);
                  }}
                >
                  {translate('dashboard.firstSteps.skip')}
                </Button>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );

  if (ready) {
    return (
      <Card
        style={{ marginBottom: 16 }}
        title={`${translate('dashboard.firstSteps.title')} · ${translate('dashboard.firstSteps.readyTitle')}`}
        extra={
          <span>
            <Button type="link" onClick={() => setDetailOpen((open) => !open)}>
              {translate(
                detailOpen ? 'dashboard.firstSteps.hideDetail' : 'dashboard.firstSteps.showDetail',
              )}
            </Button>
            <Button type="text" onClick={hide}>
              {translate('dashboard.firstSteps.hide')}
            </Button>
          </span>
        }
        styles={detailOpen ? undefined : { body: { display: 'none', padding: 0 } }}
      >
        <Alert
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
          message={translate('dashboard.firstSteps.readyTitle')}
          description={
            <span>
              {translate('dashboard.firstSteps.readyBody')}{' '}
              <Link to="/subscriptions">{translate('nav.subscriptions')}</Link>
              {' · '}
              <Link to="/sales">{translate('nav.sales')}</Link>
            </span>
          }
        />
        {checklist}
      </Card>
    );
  }

  return (
    <Card style={{ marginBottom: 16 }} title={translate('dashboard.firstSteps.title')}>
      <Typography.Paragraph>{translate('dashboard.firstSteps.intro')}</Typography.Paragraph>
      {error ? (
        <Alert type="error" showIcon message={translate('dashboard.firstSteps.loadError')} />
      ) : null}
      {checklist}
    </Card>
  );
}

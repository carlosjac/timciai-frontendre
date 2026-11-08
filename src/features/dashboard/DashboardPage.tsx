import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { Responsive, useContainerWidth, type Layout, type LayoutItem } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { useGetIdentity, useTranslate } from '@refinedev/core';
import { Alert, Button, Card, Modal, Select, Space, Statistic, Typography } from 'antd';
import { Link } from 'react-router';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { fetchTimciActionCodes } from '../../shared/timci/actionCodes.js';
import { TimciHelpButton } from '../../shared/timci/help/TimciHelpButton.js';
import { formatTimciMoney } from '../../shared/timci/formatMoney.js';
import {
  fetchEntityDashboard,
  fetchPlatformDashboard,
  periodRange,
  type EntityDashboard,
  type PlatformDashboard,
} from './api.js';
import {
  dashboardProfile,
  freshLayout,
  loadLayout,
  packLayout,
  saveLayout,
  sizeUnits,
  widgetDef,
  WIDGET_TYPES,
  type DashboardLayoutState,
  type DashboardProfile,
  type ListLimit,
  type WidgetInstance,
  type WidgetSize,
} from './model.js';
import { WidgetBody, WidgetCard } from './widgets.js';

const PERIODS = [7, 30, 90] as const;

function sameLayout(current: DashboardLayoutState['layout'], next: DashboardLayoutState['layout']): boolean {
  if (current.length !== next.length) return false;

  return current.every((item, index) => {
    const other = next[index];

    return (
      other != null &&
      item.i === other.i &&
      item.x === other.x &&
      item.y === other.y &&
      item.w === other.w &&
      item.h === other.h
    );
  });
}
const REPORT_WIDGETS = new Set(['aging', 'invoiced', 'collected', 'tax']);

function reportDetailHref(
  type: string,
  currencyId: string | undefined,
  from: string | undefined,
  to: string | undefined,
  enabled: boolean,
): string | undefined {
  if (!enabled || !currencyId || !from || !to || !REPORT_WIDGETS.has(type)) return undefined;
  const params = new URLSearchParams({ from, to, currencyId });

  return `/reports/${type}?${params.toString()}`;
}

function applySize(layout: DashboardLayoutState['layout'], instance: WidgetInstance): DashboardLayoutState['layout'] {
  const units = sizeUnits(instance.size);

  return layout.map((item) => (item.i === instance.id ? { ...item, w: units.w, h: units.h } : item));
}

export function DashboardPage(): ReactElement {
  const translate = useTranslate();
  const identity = useGetIdentity<{ id: string }>();
  const userId = identity.data?.id ?? 'anonymous';
  const [profile, setProfile] = useState<DashboardProfile | null | undefined>(undefined);
  const [canOpenReports, setCanOpenReports] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchTimciActionCodes().then((codes) => {
      if (!cancelled) {
        setProfile(dashboardProfile(codes));
        setCanOpenReports(codes.includes('menu.reports'));
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (profile === undefined) {
    return <Typography.Text type="secondary">{translate('dashboard.loading')}</Typography.Text>;
  }
  if (!profile) {
    return <Alert type="info" showIcon message={translate('dashboard.noAccess')} />;
  }

  return <DashboardLoaded userId={userId} profile={profile} canOpenReports={canOpenReports} />;
}

function DashboardLoaded({
  userId,
  profile,
  canOpenReports,
}: {
  userId: string;
  profile: DashboardProfile;
  canOpenReports: boolean;
}): ReactElement {
  const translate = useTranslate();
  const [days, setDays] = useState<(typeof PERIODS)[number]>(30);
  const [tenantId, setTenantId] = useState(() => getStoredTenantId());
  const tenantRef = useRef(tenantId);
  const [entity, setEntity] = useState<EntityDashboard | null>(null);
  const [platform, setPlatform] = useState<PlatformDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      const next = getStoredTenantId();
      if (tenantRef.current === next) return;
      tenantRef.current = next;
      setTenantId(next);
      setEntity(null);
      setError(null);
    };
    window.addEventListener('focus', sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener('focus', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const range = useMemo(() => periodRange(days), [days]);

  useEffect(() => {
    let cancelled = false;
    const run =
      profile === 'platform'
        ? fetchPlatformDashboard(range.from, range.to).then((data) => {
            if (!cancelled) setPlatform(data);
          })
        : tenantId
          ? fetchEntityDashboard(tenantId, range.from, range.to).then((data) => {
              if (!cancelled) setEntity(data);
            })
          : Promise.resolve();
    void run.catch((err: unknown) => {
      if (!cancelled) setError(err instanceof Error ? err.message : translate('dashboard.loadError'));
    });

    return () => {
      cancelled = true;
    };
  }, [profile, tenantId, range.from, range.to, translate]);

  if (profile === 'entity' && !tenantId) {
    return <Alert type="info" showIcon message={translate('tenant.selectFirst')} />;
  }

  const dataReady = profile === 'platform' ? platform !== null : entity !== null;
  if (!dataReady && !error) {
    return <Typography.Text type="secondary">{translate('dashboard.loading')}</Typography.Text>;
  }

  return (
    <DashboardBoard
      key={`${userId}:${profile}:${entity?.defaultCurrencyId ?? 'platform'}`}
      userId={userId}
      profile={profile}
      days={days}
      onDays={setDays}
      entity={entity}
      platform={platform}
      error={error}
      canOpenReports={canOpenReports}
    />
  );
}

function DashboardBoard(props: {
  userId: string;
  profile: DashboardProfile;
  days: (typeof PERIODS)[number];
  onDays: (days: (typeof PERIODS)[number]) => void;
  entity: EntityDashboard | null;
  platform: PlatformDashboard | null;
  error: string | null;
  canOpenReports: boolean;
}): ReactElement {
  const translate = useTranslate();
  const { userId, profile, entity, platform, error } = props;
  const [layoutState, setLayoutState] = useState<DashboardLayoutState>(
    () => loadLayout(userId, profile) ?? freshLayout(profile, entity?.defaultCurrencyId ?? null)
  );
  const [customizing, setCustomizing] = useState(false);
  const { width, containerRef, mounted } = useContainerWidth();

  const persist = useCallback(
    (next: DashboardLayoutState) => {
      if (!profile) return;
      setLayoutState(next);
      saveLayout(userId, profile, next);
    },
    [profile, userId]
  );

  const onLayoutChange = useCallback(
    (_current: Layout, allLayouts?: Partial<Record<string, Layout>>) => {
      const source = allLayouts?.lg;
      if (!source) return;
      const layout = source.map((item: LayoutItem) => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
      }));
      if (sameLayout(layoutState.layout, layout)) return;
      persist({ ...layoutState, layout });
    },
    [layoutState, persist]
  );

  const currencies = entity?.currencies ?? [];
  const todayCurrency =
    currencies.find((item) => item.id === layoutState.todayCurrencyId) ??
    currencies.find((item) => item.id === entity?.defaultCurrencyId) ??
    currencies[0];
  const todaySlice = todayCurrency ? entity?.byCurrency[todayCurrency.id] : undefined;

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {translate(profile === 'platform' ? 'dashboard.platformTitle' : 'dashboard.entityTitle')}
        </Typography.Title>
        {PERIODS.map((value) => (
          <Button key={value} type={props.days === value ? 'primary' : 'default'} onClick={() => props.onDays(value)}>
            {translate('dashboard.periodDays', { count: value })}
          </Button>
        ))}
        <Button onClick={() => setCustomizing(true)}>{translate('dashboard.customize')}</Button>
        <Button onClick={() => persist(freshLayout(profile, entity?.defaultCurrencyId ?? null))}>
          {translate('dashboard.reset')}
        </Button>
      </Space>
      {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}

      {profile === 'entity' && entity && todayCurrency && todaySlice ? (
        <Card style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space wrap>
              <Typography.Text strong>{translate('dashboard.today')}</Typography.Text>
              <TimciHelpButton topic={translate('dashboard.today')} text={translate('dashboard.help.today')} />
              <Select
                aria-label={translate('dashboard.currency')}
                value={todayCurrency.id}
                style={{ minWidth: 160 }}
                options={currencies.map((item) => ({ value: item.id, label: item.code }))}
                onChange={(value) => persist({ ...layoutState, todayCurrencyId: value })}
              />
            </Space>
            <Space size="large" wrap>
              <Statistic title={translate('dashboard.todayOverdue')} value={formatTimciMoney(todaySlice.today.overdueAmount)} suffix={todayCurrency.code} />
              <Statistic title={translate('dashboard.todayCustomers')} value={todaySlice.today.overdueCustomerCount} />
              <Statistic title={translate('dashboard.todayMaxDays')} value={todaySlice.today.maxOverdueDays} />
            </Space>
          </Space>
        </Card>
      ) : null}

      <div ref={containerRef}>
        {mounted ? (
          <Responsive
            width={width}
            layouts={{ lg: layoutState.layout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={36}
            onLayoutChange={onLayoutChange}
          >
            {layoutState.instances.map((instance) => {
              const def = widgetDef(instance.type);
              const code = currencies.find((item) => item.id === instance.currencyId)?.code;
              const title = def ? translate(def.titleKey) : instance.type;

              const detailHref = reportDetailHref(
                instance.type,
                instance.currencyId,
                entity?.from,
                entity?.to,
                props.canOpenReports,
              );

              return (
                <div key={instance.id}>
                  <WidgetCard
                    title={code ? `${title} (${code})` : title}
                    help={def ? translate(`dashboard.help.${instance.type}`) : undefined}
                    extra={
                      detailHref ? (
                        <span
                          onMouseDown={(event) => event.stopPropagation()}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Link to={detailHref}>{translate('dashboard.openReport')}</Link>
                        </span>
                      ) : undefined
                    }
                  >
                    <WidgetBody
                      type={instance.type}
                      currencyId={instance.currencyId}
                      limit={instance.limit}
                      entity={entity ?? undefined}
                      platform={platform ?? undefined}
                    />
                  </WidgetCard>
                </div>
              );
            })}
          </Responsive>
        ) : null}
      </div>

      <CustomizeDialog
        open={customizing}
        profile={profile}
        currencies={currencies}
        state={layoutState}
        onClose={() => setCustomizing(false)}
        onChange={(next) => persist(next)}
      />
    </div>
  );
}

function CustomizeDialog(props: {
  open: boolean;
  profile: DashboardProfile;
  currencies: { id: string; code: string }[];
  state: DashboardLayoutState | null;
  onClose: () => void;
  onChange: (next: DashboardLayoutState) => void;
}): ReactElement {
  const translate = useTranslate();
  const types = WIDGET_TYPES.filter((item) => item.profile === props.profile);
  const [type, setType] = useState(types[0]?.type ?? '');
  const [currencyId, setCurrencyId] = useState(props.currencies[0]?.id);
  const [size, setSize] = useState<WidgetSize>('medium');
  const [limit, setLimit] = useState<ListLimit>(10);
  const selected = widgetDef(type);

  return (
    <Modal
      open={props.open}
      title={translate('dashboard.customize')}
      onCancel={props.onClose}
      footer={null}
      width={720}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {props.state?.instances.map((instance) => {
          const def = widgetDef(instance.type);
          const code = props.currencies.find((item) => item.id === instance.currencyId)?.code;

          return (
            <Space key={instance.id} wrap>
              <Typography.Text>
                {def ? translate(def.titleKey) : instance.type}
                {code ? ` (${code})` : ''}
              </Typography.Text>
              <Select<WidgetSize>
                aria-label={translate('dashboard.size')}
                value={instance.size}
                style={{ width: 140 }}
                options={[
                  { value: 'small', label: translate('dashboard.sizes.small') },
                  { value: 'medium', label: translate('dashboard.sizes.medium') },
                  { value: 'large', label: translate('dashboard.sizes.large') },
                ]}
                onChange={(value) => {
                  if (!props.state) return;
                  const instances = props.state.instances.map((item) =>
                    item.id === instance.id ? { ...item, size: value } : item
                  );
                  const updated = instances.find((item) => item.id === instance.id)!;
                  props.onChange({ ...props.state, instances, layout: applySize(props.state.layout, updated) });
                }}
              />
              {def?.needsLimit ? (
                <Select<ListLimit>
                  aria-label={translate('dashboard.limit')}
                  value={instance.limit ?? 10}
                  style={{ width: 100 }}
                  options={[5, 10, 20].map((value) => ({ value: value as ListLimit, label: String(value) }))}
                  onChange={(value) => {
                    if (!props.state) return;
                    props.onChange({
                      ...props.state,
                      instances: props.state.instances.map((item) =>
                        item.id === instance.id ? { ...item, limit: value } : item
                      ),
                    });
                  }}
                />
              ) : null}
              <Button
                onClick={() => {
                  if (!props.state) return;
                  props.onChange({
                    instances: props.state.instances.filter((item) => item.id !== instance.id),
                    layout: props.state.layout.filter((item) => item.i !== instance.id),
                    todayCurrencyId: props.state.todayCurrencyId,
                  });
                }}
              >
                {translate('dashboard.remove')}
              </Button>
            </Space>
          );
        })}
        <Space wrap>
          <Select
            aria-label={translate('dashboard.addPanel')}
            value={type}
            style={{ minWidth: 220 }}
            options={types.map((item) => ({ value: item.type, label: translate(item.titleKey) }))}
            onChange={(value) => {
              setType(value);
              const def = widgetDef(value);
              if (def) setSize(def.defaultSize);
            }}
          />
          {selected?.needsCurrency ? (
            <Select
              aria-label={translate('dashboard.currency')}
              value={currencyId}
              style={{ width: 120 }}
              options={props.currencies.map((item) => ({ value: item.id, label: item.code }))}
              onChange={setCurrencyId}
            />
          ) : null}
          <Select<WidgetSize>
            aria-label={translate('dashboard.size')}
            value={size}
            style={{ width: 140 }}
            options={[
              { value: 'small', label: translate('dashboard.sizes.small') },
              { value: 'medium', label: translate('dashboard.sizes.medium') },
              { value: 'large', label: translate('dashboard.sizes.large') },
            ]}
            onChange={setSize}
          />
          <Button
            type="primary"
            onClick={() => {
              if (!props.state || !selected) return;
              const instance: WidgetInstance = {
                id: crypto.randomUUID(),
                type: selected.type,
                size,
                currencyId: selected.needsCurrency ? currencyId : undefined,
                limit: selected.needsLimit ? limit : undefined,
              };
              const instances = [...props.state.instances, instance];
              props.onChange({ ...props.state, instances, layout: packLayout(instances) });
            }}
          >
            {translate('dashboard.add')}
          </Button>
          {selected?.needsLimit ? (
            <Select<ListLimit>
              aria-label={translate('dashboard.limit')}
              value={limit}
              style={{ width: 100 }}
              options={[5, 10, 20].map((value) => ({ value: value as ListLimit, label: String(value) }))}
              onChange={setLimit}
            />
          ) : null}
        </Space>
      </Space>
    </Modal>
  );
}

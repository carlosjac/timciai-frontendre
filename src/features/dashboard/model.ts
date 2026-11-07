export type DashboardProfile = 'platform' | 'entity';
export type WidgetSize = 'small' | 'medium' | 'large';
export type ListLimit = 5 | 10 | 20;

export interface WidgetInstance {
  id: string;
  type: string;
  currencyId?: string;
  limit?: ListLimit;
  size: WidgetSize;
}

export interface StoredLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardLayoutState {
  todayCurrencyId: string | null;
  instances: WidgetInstance[];
  layout: StoredLayoutItem[];
}

export interface WidgetTypeDef {
  type: string;
  titleKey: string;
  profile: DashboardProfile;
  needsCurrency: boolean;
  needsLimit: boolean;
  defaultSize: WidgetSize;
}

export const WIDGET_TYPES: WidgetTypeDef[] = [
  { type: 'collectionPace', titleKey: 'dashboard.widgets.collectionPace', profile: 'entity', needsCurrency: true, needsLimit: false, defaultSize: 'small' },
  { type: 'openAmount', titleKey: 'dashboard.widgets.openAmount', profile: 'entity', needsCurrency: true, needsLimit: false, defaultSize: 'small' },
  { type: 'invoiced', titleKey: 'dashboard.widgets.invoiced', profile: 'entity', needsCurrency: true, needsLimit: false, defaultSize: 'small' },
  { type: 'collected', titleKey: 'dashboard.widgets.collected', profile: 'entity', needsCurrency: true, needsLimit: false, defaultSize: 'small' },
  { type: 'customerCredit', titleKey: 'dashboard.widgets.customerCredit', profile: 'entity', needsCurrency: true, needsLimit: false, defaultSize: 'small' },
  { type: 'aging', titleKey: 'dashboard.widgets.aging', profile: 'entity', needsCurrency: true, needsLimit: false, defaultSize: 'medium' },
  { type: 'periodNet', titleKey: 'dashboard.widgets.periodNet', profile: 'entity', needsCurrency: true, needsLimit: false, defaultSize: 'medium' },
  { type: 'subscriptions', titleKey: 'dashboard.widgets.subscriptions', profile: 'entity', needsCurrency: true, needsLimit: false, defaultSize: 'medium' },
  { type: 'tax', titleKey: 'dashboard.widgets.tax', profile: 'entity', needsCurrency: true, needsLimit: false, defaultSize: 'medium' },
  { type: 'overdue60', titleKey: 'dashboard.widgets.overdue60', profile: 'entity', needsCurrency: true, needsLimit: false, defaultSize: 'small' },
  { type: 'collectionQueue', titleKey: 'dashboard.widgets.collectionQueue', profile: 'entity', needsCurrency: true, needsLimit: true, defaultSize: 'large' },
  { type: 'topDebtors', titleKey: 'dashboard.widgets.topDebtors', profile: 'entity', needsCurrency: true, needsLimit: true, defaultSize: 'medium' },
  { type: 'oldestDebtors', titleKey: 'dashboard.widgets.oldestDebtors', profile: 'entity', needsCurrency: true, needsLimit: true, defaultSize: 'medium' },
  { type: 'bouncedEmails', titleKey: 'dashboard.widgets.bouncedEmails', profile: 'entity', needsCurrency: false, needsLimit: false, defaultSize: 'small' },
  { type: 'tenants', titleKey: 'dashboard.widgets.tenants', profile: 'platform', needsCurrency: false, needsLimit: false, defaultSize: 'small' },
  { type: 'users', titleKey: 'dashboard.widgets.users', profile: 'platform', needsCurrency: false, needsLimit: false, defaultSize: 'small' },
  { type: 'sessions', titleKey: 'dashboard.widgets.sessions', profile: 'platform', needsCurrency: false, needsLimit: false, defaultSize: 'small' },
  { type: 'entitiesInTest', titleKey: 'dashboard.widgets.entitiesInTest', profile: 'platform', needsCurrency: false, needsLimit: false, defaultSize: 'small' },
  { type: 'readiness', titleKey: 'dashboard.widgets.readiness', profile: 'platform', needsCurrency: false, needsLimit: false, defaultSize: 'large' },
  { type: 'activity', titleKey: 'dashboard.widgets.activity', profile: 'platform', needsCurrency: false, needsLimit: false, defaultSize: 'medium' },
  { type: 'health', titleKey: 'dashboard.widgets.health', profile: 'platform', needsCurrency: false, needsLimit: false, defaultSize: 'medium' },
];

const SIZE_UNITS: Record<WidgetSize, { w: number; h: number }> = {
  small: { w: 3, h: 4 },
  medium: { w: 6, h: 6 },
  large: { w: 12, h: 8 },
};

export function widgetDef(type: string): WidgetTypeDef | undefined {
  return WIDGET_TYPES.find((item) => item.type === type);
}

export function dashboardProfile(codes: string[]): DashboardProfile | null {
  if (!codes.includes('menu.bi')) return null;
  if (codes.includes('menu.sales')) return 'entity';
  if (codes.includes('menu.allEntities')) return 'platform';

  return null;
}

export function sizeUnits(size: WidgetSize): { w: number; h: number } {
  return SIZE_UNITS[size];
}

export function defaultInstances(profile: DashboardProfile, currencyId: string | null): WidgetInstance[] {
  return WIDGET_TYPES.filter((item) => item.profile === profile).map((item) => ({
    id: crypto.randomUUID(),
    type: item.type,
    size: item.defaultSize,
    currencyId: item.needsCurrency ? (currencyId ?? undefined) : undefined,
    limit: item.needsLimit ? 10 : undefined,
  }));
}

export function packLayout(instances: WidgetInstance[]): StoredLayoutItem[] {
  const items: StoredLayoutItem[] = [];
  let x = 0;
  let y = 0;
  let rowH = 0;
  for (const instance of instances) {
    const { w, h } = SIZE_UNITS[instance.size];
    if (x + w > 12) {
      y += rowH;
      x = 0;
      rowH = 0;
    }
    items.push({ i: instance.id, x, y, w, h });
    x += w;
    rowH = Math.max(rowH, h);
  }

  return items;
}

function storageKey(userId: string, profile: DashboardProfile): string {
  return `timci-dashboard:${userId}:${profile}`;
}

export function loadLayout(userId: string, profile: DashboardProfile): DashboardLayoutState | null {
  try {
    const raw = localStorage.getItem(storageKey(userId, profile));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DashboardLayoutState;
    if (!Array.isArray(parsed.instances) || !Array.isArray(parsed.layout)) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function saveLayout(userId: string, profile: DashboardProfile, state: DashboardLayoutState): void {
  localStorage.setItem(storageKey(userId, profile), JSON.stringify(state));
}

export function freshLayout(profile: DashboardProfile, currencyId: string | null): DashboardLayoutState {
  const instances = defaultInstances(profile, currencyId);

  return {
    todayCurrencyId: currencyId,
    instances,
    layout: packLayout(instances),
  };
}

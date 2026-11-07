import { getV1Base } from '../../config.js';
import { timciFetch } from '../../shared/timci/http.js';

export interface CurrencyRef {
  id: string;
  code: string;
  name: string;
}

export interface DebtorRow {
  customerId: string;
  customerName: string;
  openAmount: string;
  oldestDueDate: string | null;
  overdueDays: number;
}

export interface QueueRow extends DebtorRow {
  lastCollectionDate: string | null;
  reason: 'no_recent_collection' | 'overdue_60' | 'high_amount';
}

export interface CurrencySlice {
  today: { overdueAmount: string; overdueCustomerCount: number; maxOverdueDays: number };
  openAmount: string;
  invoiced: string;
  collected: string;
  pace: { invoiced: string; collected: string; ratio: string | null };
  customerCredit: string;
  aging: { current: string; d1To30: string; d31To60: string; d61To90: string; d90Plus: string };
  periodNet: {
    sales: string;
    debits: string;
    credits: string;
    net: string;
    policyAdjustments: string;
    voidCount: number;
    voidAmount: string;
  };
  subscriptions: { withNextBilling: number; dueIn7Days: number; stopped: number };
  tax: { percent: string; amount: string }[];
  overdue60CustomerCount: number;
  collectionQueue: QueueRow[];
  topDebtors: DebtorRow[];
  oldestDebtors: DebtorRow[];
}

export interface EntityDashboard {
  defaultCurrencyId: string;
  currencies: CurrencyRef[];
  byCurrency: Record<string, CurrencySlice>;
  bouncedEmails: number;
  from: string;
  to: string;
  asOf: string;
}

export interface ReadinessRow {
  entityId: string;
  name: string;
  emissionMode: string;
  taxEnabled: boolean;
  taxProfileComplete: boolean;
  hasActivePaymentOption: boolean;
  hasLogo: boolean;
  isActive: boolean;
  operatingMode: string;
}

export interface PlatformDashboard {
  from: string;
  to: string;
  tenantsActive: number;
  tenantsInactive: number;
  tenantsCreatedInPeriod: number;
  users: number;
  usersWithoutAssignment: number;
  openSessions: number;
  entitiesInTest: number;
  readiness: ReadinessRow[];
  activity: {
    sales: number;
    collections: number;
    subscriptionsWithError: number;
    silentTenants: number;
  };
  health: {
    fxSnapshotAgeMinutes: number | null;
    documentIssueFailed: number;
    smtpTransportFailed: number;
    documentsIssued: number;
    documentsPending: number;
    documentsFailed: number;
  };
}

function rangeQuery(from: string, to: string): string {
  return `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
}

export async function fetchEntityDashboard(tenantId: string, from: string, to: string): Promise<EntityDashboard> {
  const { json } = await timciFetch(
    `${getV1Base()}/tenants/${encodeURIComponent(tenantId)}/dashboard?${rangeQuery(from, to)}`
  );

  return json as EntityDashboard;
}

export async function fetchPlatformDashboard(from: string, to: string): Promise<PlatformDashboard> {
  const { json } = await timciFetch(`${getV1Base()}/dashboard/platform?${rangeQuery(from, to)}`);

  return json as PlatformDashboard;
}

export function periodRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (days - 1));

  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

import { getV1Base } from '../../config.js';

export function getCustomerByIdUrl(tenantId: string, id: string): string {
  return `${getV1Base()}/tenants/${tenantId}/customers/${encodeURIComponent(id)}`;
}

export function getCustomerActivateUrl(tenantId: string, id: string): string {
  return `${getV1Base()}/tenants/${tenantId}/customers/${encodeURIComponent(id)}/activate`;
}

export function getCustomerDeactivateUrl(tenantId: string, id: string): string {
  return `${getV1Base()}/tenants/${tenantId}/customers/${encodeURIComponent(id)}/deactivate`;
}

export function getCustomerReplaceContactsUrl(tenantId: string, id: string): string {
  return `${getV1Base()}/tenants/${tenantId}/customers/${encodeURIComponent(id)}/contacts`;
}

export type CustomerContactInput = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  notifySales: boolean;
  notifyCreditos: boolean;
  notifyDebits: boolean;
  notifyCollections: boolean;
  notifyOverduePayments: boolean;
};

export function buildCustomerUpdateBody(variables: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (variables.name !== undefined) payload.name = String(variables.name).trim();
  if (variables.address !== undefined) payload.address = String(variables.address).trim();
  if (variables.countryId !== undefined) payload.countryId = variables.countryId;
  if (variables.entityId !== undefined) payload.entityId = variables.entityId;
  if (variables.priceListId !== undefined) payload.priceListId = variables.priceListId;
  if (variables.defaultCurrencyId !== undefined) payload.defaultCurrencyId = variables.defaultCurrencyId;
  if (variables.personType !== undefined) payload.personType = variables.personType;
  if (variables.defaultOverdueNotificationPolicyKey !== undefined) {
    payload.defaultOverdueNotificationPolicyKey = variables.defaultOverdueNotificationPolicyKey;
  }
  if (variables.defaultPaymentTermDays !== undefined) {
    payload.defaultPaymentTermDays = variables.defaultPaymentTermDays;
  }
  return payload;
}

export function mapContactsForReplace(raw: unknown): CustomerContactInput[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    const r = row as Record<string, unknown>;
    const mapped: CustomerContactInput = {
      name: String(r.name ?? '').trim(),
      email: String(r.email ?? '').trim(),
      phone: String(r.phone ?? '').trim(),
      notifySales: r.notifySales === true,
      notifyCreditos: r.notifyCreditos === true,
      notifyDebits: r.notifyDebits === true,
      notifyCollections: r.notifyCollections === true,
      notifyOverduePayments: r.notifyOverduePayments === true,
    };
    if (typeof r.id === 'string' && r.id.trim() !== '') {
      mapped.id = r.id.trim();
    }
    return mapped;
  });
}

import { getV1Base } from '../../config.js';

export function getEntityByIdUrl(tenantId: string, id: string): string {
  return `${getV1Base()}/tenants/${tenantId}/entities/${encodeURIComponent(id)}`;
}

export function getEntityActivateUrl(tenantId: string, id: string): string {
  return `${getV1Base()}/tenants/${tenantId}/entities/${encodeURIComponent(id)}/activate`;
}

export function getEntityDeactivateUrl(tenantId: string, id: string): string {
  return `${getV1Base()}/tenants/${tenantId}/entities/${encodeURIComponent(id)}/deactivate`;
}

export function getEntityPaymentOptionActivateUrl(
  tenantId: string,
  entityId: string,
  paymentOptionId: string,
): string {
  return `${getV1Base()}/tenants/${tenantId}/entities/${encodeURIComponent(entityId)}/payment-options/${encodeURIComponent(paymentOptionId)}/activate`;
}

export function getEntityPaymentOptionDeactivateUrl(
  tenantId: string,
  entityId: string,
  paymentOptionId: string,
): string {
  return `${getV1Base()}/tenants/${tenantId}/entities/${encodeURIComponent(entityId)}/payment-options/${encodeURIComponent(paymentOptionId)}/deactivate`;
}

type PaymentOptionInput = {
  id?: string;
  ordinal?: number;
  name?: string;
  details?: string;
  currencyIds?: string[];
  isActive?: boolean;
};

function mapPaymentOptions(raw: unknown): PaymentOptionInput[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row, index) => {
    const r = row as PaymentOptionInput;
    const mapped: PaymentOptionInput = {
      ordinal: index,
      name:
        typeof r.name === 'string' && r.name.trim() !== '' ? r.name.trim() : 'Principal',
      details:
        typeof r.details === 'string' && r.details.trim() !== '' ? r.details.trim() : '-',
      currencyIds: Array.isArray(r.currencyIds)
        ? r.currencyIds.filter((id) => id != null && String(id).trim() !== '')
        : [],
      isActive: r.isActive !== false,
    };
    if (typeof r.id === 'string' && r.id.trim() !== '') {
      mapped.id = r.id.trim();
    }
    return mapped;
  });
}

export function buildEntityUpdateBody(variables: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (variables.name !== undefined) payload.name = String(variables.name).trim();
  if (variables.countryId !== undefined) payload.countryId = variables.countryId;
  if (variables.address !== undefined) payload.address = String(variables.address).trim();
  if (variables.email !== undefined) payload.email = String(variables.email).trim();
  if (variables.phone !== undefined) payload.phone = String(variables.phone).trim();
  if (variables.defaultCountryId !== undefined) payload.defaultCountryId = variables.defaultCountryId;
  if (variables.defaultCurrencyId !== undefined) payload.defaultCurrencyId = variables.defaultCurrencyId;
  if (variables.personType !== undefined) payload.personType = variables.personType;
  if (variables.documentTypeId !== undefined) payload.documentTypeId = variables.documentTypeId;
  if (variables.documentNumber !== undefined) {
    payload.documentNumber = String(variables.documentNumber).trim();
  }
  if (variables.defaultOverdueNotificationPolicyKey !== undefined) {
    payload.defaultOverdueNotificationPolicyKey = variables.defaultOverdueNotificationPolicyKey;
  }
  if (variables.defaultPaymentTermDays !== undefined) {
    payload.defaultPaymentTermDays = variables.defaultPaymentTermDays;
  }
  if (variables.availableOverduePolicyKeys !== undefined) {
    payload.availableOverduePolicyKeys = variables.availableOverduePolicyKeys;
  }
  if (variables.addAdvertisement !== undefined) payload.addAdvertisement = variables.addAdvertisement;
  if (variables.fantasyName !== undefined) {
    const fantasyRaw = variables.fantasyName;
    payload.fantasyName =
      typeof fantasyRaw === 'string' && fantasyRaw.trim() !== '' ? fantasyRaw.trim() : null;
  }
  if (variables.paymentOptions !== undefined) {
    payload.paymentOptions = mapPaymentOptions(variables.paymentOptions);
  }
  return payload;
}

export type EntityCustomerDefaultSource = {
  defaultCountryId?: string | null;
  defaultCurrencyId?: string | null;
  defaultMonetaryPolicyId?: string | null;
  defaultOverdueNotificationPolicyKey?: string | null;
  defaultPaymentTermDays?: number | string | null;
  availableOverduePolicyKeys?: string[] | null;
};

export type CustomerDefaultFieldValues = {
  countryId?: unknown;
  defaultCurrencyId?: unknown;
  defaultMonetaryPolicyId?: unknown;
  defaultOverdueNotificationPolicyKey?: unknown;
  defaultPaymentTermDays?: unknown;
};

function text(value: unknown): string {
  return value == null ? '' : String(value).trim();
}

export function isUnsetCustomerDefault(value: unknown): boolean {
  return value == null || (typeof value === 'string' && value.trim() === '');
}

export function paymentTermDaysFromEntity(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

/** Campos vacíos del alta que deben salir de los defaults de la entidad. */
export function customerDefaultsPatchFromEntity(
  entity: EntityCustomerDefaultSource,
  current: CustomerDefaultFieldValues,
): Record<string, string | number> {
  const patch: Record<string, string | number> = {};
  const countryId = text(entity.defaultCountryId);
  if (countryId && isUnsetCustomerDefault(current.countryId)) patch.countryId = countryId;
  const currencyId = text(entity.defaultCurrencyId);
  if (currencyId && isUnsetCustomerDefault(current.defaultCurrencyId)) {
    patch.defaultCurrencyId = currencyId;
  }
  const monetaryPolicyId = text(entity.defaultMonetaryPolicyId);
  if (monetaryPolicyId && isUnsetCustomerDefault(current.defaultMonetaryPolicyId)) {
    patch.defaultMonetaryPolicyId = monetaryPolicyId;
  }
  const termDays = paymentTermDaysFromEntity(entity.defaultPaymentTermDays);
  if (termDays != null && isUnsetCustomerDefault(current.defaultPaymentTermDays)) {
    patch.defaultPaymentTermDays = termDays;
  }
  const policyKey = text(entity.defaultOverdueNotificationPolicyKey);
  if (policyKey && isUnsetCustomerDefault(current.defaultOverdueNotificationPolicyKey)) {
    patch.defaultOverdueNotificationPolicyKey = policyKey;
  }
  return patch;
}

export function overduePoliciesForEntity<T extends { key: string }>(
  catalog: T[],
  availableKeys: string[] | null | undefined,
): T[] {
  const allowed = (availableKeys ?? []).map((key) => key.trim()).filter((key) => key !== '');
  if (allowed.length === 0) return catalog;
  const allowedSet = new Set(allowed);
  return catalog.filter((policy) => allowedSet.has(policy.key));
}

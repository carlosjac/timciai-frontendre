import type { BaseRecord } from '@refinedev/core';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';

export type DocTypeRow = BaseRecord & {
  id: string;
  name: string;
  countryId?: string | null;
  appliesTo?: string;
};

export type PaymentOptionRow = {
  id?: string;
  ordinal?: number;
  name?: string;
  details?: string;
  currencyIds?: string[];
  isActive?: boolean;
};

export type EntityRecord = {
  id?: string;
  name?: string;
  countryId?: string;
  address?: string;
  email?: string;
  phone?: string;
  defaultCountryId?: string;
  defaultCurrencyId?: string;
  personType?: string;
  documentTypeId?: string;
  documentNumber?: string;
  documentTypeName?: string;
  defaultOverdueNotificationPolicyKey?: string;
  defaultPaymentTermDays?: number;
  availableOverduePolicyKeys?: string[];
  addAdvertisement?: boolean;
  fantasyName?: string | null;
  isActive?: boolean;
  paymentOptions?: PaymentOptionRow[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export const ENTITY_IDENTITY_FIELD_NAMES = [
  'name',
  'countryId',
  'personType',
  'documentTypeId',
  'documentNumber',
  'addAdvertisement',
  'fantasyName',
] as const;

export const ENTITY_GENERAL_SETTINGS_FIELD_NAMES = [
  'address',
  'email',
  'phone',
  'defaultCountryId',
  'defaultCurrencyId',
  'defaultOverdueNotificationPolicyKey',
  'defaultPaymentTermDays',
  'availableOverduePolicyKeys',
] as const;

export const ENTITY_EDIT_FIELD_NAMES = [
  ...ENTITY_IDENTITY_FIELD_NAMES,
  ...ENTITY_GENERAL_SETTINGS_FIELD_NAMES,
] as const;

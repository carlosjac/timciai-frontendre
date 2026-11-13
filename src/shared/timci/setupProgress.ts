const REVIEWED = 'timci.setup.entitySettingsReviewed';
const MONETARY_SKIPPED = 'timci.setup.monetaryPolicySkipped';
const READY_DISMISSED = 'timci.setup.readyDismissed';

function key(prefix: string, userId: string, tenantId: string): string {
  return `${prefix}:${userId}:${tenantId}`;
}

export function isEntitySettingsReviewed(userId: string, tenantId: string): boolean {
  return localStorage.getItem(key(REVIEWED, userId, tenantId)) === '1';
}

export function markEntitySettingsReviewed(userId: string, tenantId: string): void {
  localStorage.setItem(key(REVIEWED, userId, tenantId), '1');
}

export function isMonetaryPolicySkipped(userId: string, tenantId: string): boolean {
  return localStorage.getItem(key(MONETARY_SKIPPED, userId, tenantId)) === '1';
}

export function skipMonetaryPolicyStep(userId: string, tenantId: string): void {
  localStorage.setItem(key(MONETARY_SKIPPED, userId, tenantId), '1');
}

export function isReadyBannerDismissed(userId: string, tenantId: string): boolean {
  return localStorage.getItem(key(READY_DISMISSED, userId, tenantId)) === '1';
}

export function dismissReadyBanner(userId: string, tenantId: string): void {
  localStorage.setItem(key(READY_DISMISSED, userId, tenantId), '1');
}

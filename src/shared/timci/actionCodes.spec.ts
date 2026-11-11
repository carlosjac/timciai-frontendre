import { describe, expect, it } from 'vitest';
import {
  canCreateResource,
  canFullyEditEntity,
  canSeeEntitySettingsMenuItem,
  canSeeResourceMenuItem,
  getFirstAccessibleListPath,
} from './actionCodes.js';

describe('canSeeResourceMenuItem', () => {
  it('requires menu.* for countries', () => {
    expect(canSeeResourceMenuItem('countries', [])).toBe(false);
    expect(canSeeResourceMenuItem('countries', ['menu.countries'])).toBe(true);
  });

  it('maps assignments and permissions menus', () => {
    expect(canSeeResourceMenuItem('userTenantRoles', ['menu.assignments'])).toBe(true);
    expect(canSeeResourceMenuItem('permissions', ['menu.permissions'])).toBe(true);
  });

  it('maps alerts and outbound email menus', () => {
    expect(canSeeResourceMenuItem('alerts', ['menu.alerts'])).toBe(true);
    expect(canSeeResourceMenuItem('outboundEmails', ['menu.outboundEmails'])).toBe(true);
  });
});

describe('canCreateResource', () => {
  it('checks resource-specific add/create codes', () => {
    expect(canCreateResource('users', ['users.create'])).toBe(true);
    expect(canCreateResource('countries', ['countries.add'])).toBe(true);
    expect(canCreateResource('countries', ['menu.countries'])).toBe(false);
    expect(canCreateResource('subscriptions', ['subscriptions.add'])).toBe(true);
    expect(canSeeResourceMenuItem('subscriptions', ['menu.subscriptions'])).toBe(true);
  });
});

describe('entity gates', () => {
  it('distinguishes root vs entity admin', () => {
    expect(canFullyEditEntity(['menu.allEntities'])).toBe(true);
    expect(canSeeEntitySettingsMenuItem(['entities.update'])).toBe(true);
    expect(canSeeEntitySettingsMenuItem(['entities.update', 'menu.allEntities'])).toBe(false);
  });
});

describe('getFirstAccessibleListPath', () => {
  it('returns first matching list path in order', () => {
    expect(getFirstAccessibleListPath(['menu.users'])).toBe('/users');
    expect(getFirstAccessibleListPath(['menu.countries', 'menu.users'])).toBe('/users');
  });

  it('opens the dashboard when the user can see it', () => {
    expect(canSeeResourceMenuItem('reports', ['menu.reports'])).toBe(true);
    expect(canSeeResourceMenuItem('reports', ['menu.bi'])).toBe(false);
    expect(getFirstAccessibleListPath(['menu.bi', 'menu.countries'])).toBe('/bi');
    expect(getFirstAccessibleListPath(['menu.sales', 'menu.bi', 'menu.customers'])).toBe('/bi');
  });

  it('falls back to preferences', () => {
    expect(getFirstAccessibleListPath([])).toBe('/preferences');
  });
});

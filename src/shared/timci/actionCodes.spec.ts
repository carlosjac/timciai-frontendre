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
    expect(getFirstAccessibleListPath(['menu.countries', 'menu.users'])).toBe('/countries');
  });

  it('falls back to preferences', () => {
    expect(getFirstAccessibleListPath([])).toBe('/preferences');
  });
});

import type { AccessControlProvider } from '@refinedev/core';
import {
  canCreateResource,
  canSeeEntitySettingsMenuItem,
  canSeeResourceMenuItem,
  fetchTimciActionCodes,
} from '../shared/timci/actionCodes.js';

/**
 * Misma lógica de visibilidad que `frontend/src/app/layout/Menu.tsx` (actionCodes / menu.*).
 */
export function createTimciAccessControlProvider(): AccessControlProvider {
  return {
    can: async ({ resource, action }) => {
      const codes = await fetchTimciActionCodes();
      if (action === 'create') {
        return { can: canCreateResource(resource, codes) };
      }
      if (action === 'edit' && resource === 'customers') {
        return { can: codes.includes('customers.update') };
      }
      if (action === 'show' && resource === 'customers') {
        return { can: codes.includes('customers.view') };
      }
      if (action === 'edit' && resource === 'sellable_items') {
        return { can: codes.includes('sellable_items.update') };
      }
      if (action === 'show' && resource === 'sellable_items') {
        return { can: codes.includes('sellable_items.view') };
      }
      if (action === 'edit' && resource === 'price_lists') {
        return { can: codes.includes('price_lists.update') };
      }
      if (action === 'show' && resource === 'price_lists') {
        return { can: codes.includes('price_lists.view') };
      }
      if (action === 'edit' && resource === 'price_list_items') {
        return { can: codes.includes('price_list_items.update') };
      }
      if (action === 'show' && resource === 'document_types') {
        return { can: codes.includes('document_types.view') };
      }
      if (action === 'edit' && resource === 'document_types') {
        return { can: codes.includes('document_types.update') };
      }
      if (action === 'show' && resource === 'users') {
        return { can: codes.includes('users.view') };
      }
      if (action === 'edit' && resource === 'users') {
        return { can: codes.includes('users.update') };
      }
      if (action === 'show' && resource === 'countries') {
        return { can: codes.includes('countries.view') };
      }
      if (action === 'edit' && resource === 'countries') {
        return { can: codes.includes('countries.update') };
      }
      if (action === 'show' && resource === 'currencies') {
        return { can: codes.includes('currencies.view') };
      }
      if (action === 'edit' && resource === 'currencies') {
        return { can: codes.includes('currencies.update') };
      }
      if (action === 'show' && resource === 'tenants') {
        return { can: codes.includes('tenants.view') };
      }
      if (action === 'edit' && resource === 'tenants') {
        return { can: codes.includes('tenants.update') };
      }
      if (action === 'show' && resource === 'roles') {
        return { can: codes.includes('roles.view') };
      }
      if (action === 'edit' && resource === 'roles') {
        return { can: codes.includes('roles.update') };
      }
      if (action === 'show' && resource === 'entities') {
        return {
          can: codes.includes('entities.view') || codes.includes('entities.update'),
        };
      }
      if (action === 'edit' && resource === 'entities') {
        return { can: codes.includes('entities.update') };
      }
      if (resource === 'entity_settings') {
        return { can: canSeeEntitySettingsMenuItem(codes) };
      }
      if (action === 'delete' && resource === 'sessions') {
        return { can: codes.includes('menu.sessions') };
      }
      if (action === 'delete' && resource === 'userTenantRoles') {
        return { can: codes.includes('assignments.admin') };
      }
      if (action === 'delete' && resource === 'permissions') {
        return { can: codes.includes('permissions.admin') };
      }
      return { can: canSeeResourceMenuItem(resource, codes) };
    },
    options: {
      buttons: {
        enableAccessControl: true,
      },
    },
  };
}

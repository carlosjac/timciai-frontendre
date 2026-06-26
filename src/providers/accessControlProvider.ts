import type { AccessControlProvider } from '@refinedev/core';
import {
  canCreateResource,
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
      if (action === 'edit' && resource === 'sellable_items') {
        return { can: codes.includes('sellable_items.update') };
      }
      if (action === 'edit' && resource === 'price_lists') {
        return { can: codes.includes('price_lists.update') };
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
      if (action === 'delete' && resource === 'sessions') {
        return { can: codes.includes('menu.sessions') };
      }
      if (action === 'delete' && resource === 'userTenantRoles') {
        return { can: codes.includes('assignments.admin') };
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

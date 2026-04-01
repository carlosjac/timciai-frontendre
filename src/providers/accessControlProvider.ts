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

import type { AccessControlProvider } from '@refinedev/core';
import {
  canSeeResourceMenuItem,
  fetchTimciActionCodes,
} from '../shared/timci/actionCodes.js';

/**
 * Misma lógica de visibilidad que `frontend/src/app/layout/Menu.tsx` (actionCodes / menu.*).
 */
export function createTimciAccessControlProvider(): AccessControlProvider {
  return {
    can: async ({ resource }) => {
      const codes = await fetchTimciActionCodes();
      return { can: canSeeResourceMenuItem(resource, codes) };
    },
    options: {
      buttons: {
        enableAccessControl: true,
      },
    },
  };
}

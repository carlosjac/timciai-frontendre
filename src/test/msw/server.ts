import { setupServer } from 'msw/node';

/** Shared MSW server for Vitest (handlers added per test / suite). */
export const mswServer = setupServer();

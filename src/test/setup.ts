import { afterAll, afterEach, beforeAll } from 'vitest';
import { mswServer } from './msw/server.js';

beforeAll(() => {
  mswServer.listen({ onUnhandledFrame: 'error' });
});

afterEach(() => {
  mswServer.resetHandlers();
});

afterAll(() => {
  mswServer.close();
});

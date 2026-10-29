import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { invalidateTimciActionCodes } from '../shared/timci/actionCodes.js';
import { mswServer } from '../test/msw/server.js';
import { createTimciAccessControlProvider } from './accessControlProvider.js';

const API = 'http://127.0.0.1/v1';

function withCodes(codes: string[]) {
  mswServer.use(
    http.get(`${API}/authorization/me/action-codes`, () =>
      HttpResponse.json({ actionCodes: codes }),
    ),
  );
}

describe('createTimciAccessControlProvider', () => {
  beforeEach(() => {
    invalidateTimciActionCodes();
  });

  afterEach(() => {
    mswServer.resetHandlers();
    invalidateTimciActionCodes();
  });

  it('gates commercial edit/show/delete/list', async () => {
    withCodes(['collections.update', 'collections.view', 'menu.collections']);
    const ac = createTimciAccessControlProvider();
    await expect(ac.can!({ resource: 'collections', action: 'edit' })).resolves.toEqual({
      can: true,
    });
    await expect(ac.can!({ resource: 'collections', action: 'show' })).resolves.toEqual({
      can: true,
    });
    await expect(ac.can!({ resource: 'collections', action: 'delete' })).resolves.toEqual({
      can: false,
    });
    await expect(ac.can!({ resource: 'collections', action: 'list' })).resolves.toEqual({
      can: true,
    });
  });

  it('entity_settings requires entities.update without menu.allEntities', async () => {
    withCodes(['entities.update']);
    const ac = createTimciAccessControlProvider();
    await expect(ac.can!({ resource: 'entity_settings', action: 'list' })).resolves.toEqual({
      can: true,
    });

    invalidateTimciActionCodes();
    withCodes(['entities.update', 'menu.allEntities']);
    await expect(ac.can!({ resource: 'entity_settings', action: 'list' })).resolves.toEqual({
      can: false,
    });
  });

  it('sessions delete uses menu.sessions', async () => {
    withCodes(['menu.sessions']);
    const ac = createTimciAccessControlProvider();
    await expect(ac.can!({ resource: 'sessions', action: 'delete' })).resolves.toEqual({
      can: true,
    });
  });

  it('falls back to menu visibility for list', async () => {
    withCodes(['menu.countries']);
    const ac = createTimciAccessControlProvider();
    await expect(ac.can!({ resource: 'countries', action: 'list' })).resolves.toEqual({
      can: true,
    });
    await expect(ac.can!({ resource: 'users', action: 'list' })).resolves.toEqual({ can: false });
  });

  it('gates documents list/show via menu.documents and documents.view', async () => {
    withCodes(['menu.documents', 'documents.view']);
    const ac = createTimciAccessControlProvider();
    await expect(ac.can!({ resource: 'documents', action: 'list' })).resolves.toEqual({
      can: true,
    });
    await expect(ac.can!({ resource: 'documents', action: 'show' })).resolves.toEqual({
      can: true,
    });
    await expect(ac.can!({ resource: 'documents', action: 'create' })).resolves.toEqual({
      can: false,
    });
  });
});

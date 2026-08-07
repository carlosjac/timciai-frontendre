import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import type { HttpError } from '@refinedev/core';
import { timciFetch, toHttpError } from './http.js';
import { mswServer } from '../../test/msw/server.js';

const API = 'http://127.0.0.1/v1';

describe('timciFetch', () => {
  afterEach(() => {
    mswServer.resetHandlers();
  });

  it('sends Accept, X-Use-Session, credentials, and Content-Type for JSON body', async () => {
    let saw: {
      accept: string | null;
      useSession: string | null;
      contentType: string | null;
    } | null = null;

    mswServer.use(
      http.post(`${API}/probe`, async ({ request }) => {
        saw = {
          accept: request.headers.get('Accept'),
          useSession: request.headers.get('X-Use-Session'),
          contentType: request.headers.get('Content-Type'),
        };
        expect(request.credentials).toBe('include');
        return HttpResponse.json({ ok: true });
      }),
    );

    const result = await timciFetch(`${API}/probe`, {
      method: 'POST',
      body: JSON.stringify({ a: 1 }),
    });
    expect(result.status).toBe(200);
    expect(result.json).toEqual({ ok: true });
    expect(saw).toEqual({
      accept: 'application/json',
      useSession: 'true',
      contentType: 'application/json',
    });
  });

  it('returns parsed JSON and headers on success', async () => {
    mswServer.use(
      http.get(`${API}/ok`, () =>
        HttpResponse.json([{ id: '1' }], {
          headers: { 'Content-Range': 'items 0-0/1' },
        }),
      ),
    );
    const { json, headers, status } = await timciFetch(`${API}/ok`);
    expect(status).toBe(200);
    expect(json).toEqual([{ id: '1' }]);
    expect(headers.get('Content-Range')).toBe('items 0-0/1');
  });

  it('throws HttpError with statusCode and errors body on 4xx', async () => {
    mswServer.use(
      http.get(`${API}/fail`, () =>
        HttpResponse.json(
          {
            message: 'Validation failed',
            errors: [{ message: 'Required', source: 'body/name' }],
          },
          { status: 400 },
        ),
      ),
    );

    try {
      await timciFetch(`${API}/fail`);
      expect.unreachable('should throw');
    } catch (e) {
      const err = e as HttpError;
      expect(err.statusCode).toBe(400);
      expect(err.message.length).toBeGreaterThan(0);
      expect(err.errors).toMatchObject({ message: 'Validation failed' });
    }
  });

  it('handles empty body as null json', async () => {
    mswServer.use(
      http.delete(`${API}/empty`, () => new HttpResponse(null, { status: 204 })),
    );
    const { json, status } = await timciFetch(`${API}/empty`, { method: 'DELETE' });
    expect(status).toBe(204);
    expect(json).toBeNull();
  });
});

describe('toHttpError', () => {
  it('builds a Refine-shaped error', () => {
    expect(toHttpError(400, 'bad')).toEqual({ message: 'bad', statusCode: 400 });
  });
});

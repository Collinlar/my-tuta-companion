// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from './groq';
import type { VercelRequest, VercelResponse } from '@vercel/node';

function makeReq(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return {
    method: 'POST',
    body: {
      messages: [{ role: 'user', content: 'Hello' }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 100,
    },
    ...overrides,
  } as unknown as VercelRequest;
}

function makeRes(): { res: VercelResponse; statusCode: () => number; json: () => unknown } {
  let _status = 200;
  let _json: unknown;
  const res = {
    status: vi.fn((code: number) => { _status = code; return res; }),
    json: vi.fn((data: unknown) => { _json = data; return res; }),
    end: vi.fn(() => res),
  } as unknown as VercelResponse;
  return { res, statusCode: () => _status, json: () => _json };
}

describe('api/groq proxy', () => {
  const originalEnv = process.env.GROQ_API_KEY;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    process.env.GROQ_API_KEY = originalEnv;
  });

  it('returns 405 for non-POST requests', async () => {
    const { res, statusCode } = makeRes();
    await handler(makeReq({ method: 'GET' }), res);
    expect(statusCode()).toBe(405);
  });

  it('returns 500 when GROQ_API_KEY is not set', async () => {
    delete process.env.GROQ_API_KEY;
    const { res, statusCode, json } = makeRes();
    await handler(makeReq(), res);
    expect(statusCode()).toBe(500);
    expect((json() as any).error).toContain('not configured');
  });

  it('returns 400 when messages or model is missing', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    const { res, statusCode } = makeRes();
    await handler(makeReq({ body: {} }), res);
    expect(statusCode()).toBe(400);
  });

  it('forwards a successful Groq response to the client', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    const mockData = { choices: [{ message: { content: 'Hello back' } }] };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    } as any);

    const { res, statusCode, json } = makeRes();
    await handler(makeReq(), res);

    expect(statusCode()).toBe(200);
    expect(json()).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.groq.com/openai/v1/chat/completions',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-key' }),
      })
    );
  });

  it('passes Groq error status back to client', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: 'rate limit exceeded' }),
    } as any);

    const { res, statusCode } = makeRes();
    await handler(makeReq(), res);
    expect(statusCode()).toBe(429);
  });
});

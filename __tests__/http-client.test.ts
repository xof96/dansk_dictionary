import { z } from 'zod';
import { Platform } from 'react-native';

import { DictionaryError } from '@/domain/models/errors';
import { getValidatedJson } from '@/infrastructure/api/http-client';

const schema = z.object({ value: z.string() });
const originalFetch = global.fetch;

describe('getValidatedJson', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('distingue un rate limit del resto de errores de red', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 429 } as Response);

    await expect(getValidatedJson('https://example.test', schema)).rejects.toMatchObject<
      Partial<DictionaryError>
    >({ code: 'RATE_LIMIT', retryable: true });
  });

  it('identifica la app con un User-Agent real en plataformas nativas', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ value: 'ok' }),
    } as Response);

    await getValidatedJson('https://example.test', schema);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.test',
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': expect.stringContaining('DanskDictionary/'),
        }),
      }),
    );
  });

  it('usa Api-User-Agent sin intentar modificar User-Agent en web', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ value: 'ok' }),
    } as unknown as Response);

    await getValidatedJson('https://example.test', schema);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.test',
      expect.objectContaining({
        headers: {
          Accept: 'application/json',
          'Api-User-Agent': expect.stringContaining('DanskDictionary/'),
        },
      }),
    );
  });

  it.each([401, 403])('tipa un rechazo HTTP %s del proveedor', async (status) => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status,
      statusText: 'Forbidden',
      headers: {
        get: (name: string) => {
          if (name === 'x-request-id') return 'request-id';
          if (name === 'content-type') return 'text/plain';
          return null;
        },
      },
    } as unknown as Response);

    await expect(
      getValidatedJson('https://example.test/?page=consulta-privada', schema),
    ).rejects.toMatchObject<Partial<DictionaryError>>({
      code: 'PROVIDER_REJECTED',
      retryable: false,
    });
    expect(warn).toHaveBeenCalledWith(
      '[dictionary:http] Provider request failed',
      expect.objectContaining({
        status,
        requestId: 'request-id',
        contentType: 'text/plain',
      }),
    );
    const details: unknown = warn.mock.calls[0]?.[1];
    expect(details).not.toHaveProperty('url');
    expect(details).not.toHaveProperty('responseBody');
  });

  it('impide que una respuesta inválida entre en el dominio', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ value: 42 }),
    } as Response);

    await expect(getValidatedJson('https://example.test', schema)).rejects.toMatchObject<
      Partial<DictionaryError>
    >({ code: 'INVALID_RESPONSE', retryable: false });
  });

  it('tipa JSON malformado como respuesta inválida y no como fallo de red', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    } as unknown as Response);

    await expect(getValidatedJson('https://example.test', schema)).rejects.toMatchObject<
      Partial<DictionaryError>
    >({ code: 'INVALID_RESPONSE', retryable: false });
  });

  it('distingue un timeout de un fallo de red genérico', async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
      });
    });

    const request = expect(getValidatedJson('https://example.test', schema)).rejects.toMatchObject<
      Partial<DictionaryError>
    >({ code: 'TIMEOUT', retryable: true });
    await jest.advanceTimersByTimeAsync(8_000);
    await request;
  });

  it('tipa un fallo de transporte como error de red reintentable', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('offline'));

    await expect(getValidatedJson('https://example.test', schema)).rejects.toMatchObject<
      Partial<DictionaryError>
    >({ code: 'NETWORK', retryable: true });
  });
});

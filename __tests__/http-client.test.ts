import { z } from 'zod';

import { DictionaryError } from '@/domain/models/errors';
import { getValidatedJson } from '@/infrastructure/api/http-client';

const schema = z.object({ value: z.string() });
const originalFetch = global.fetch;

describe('getValidatedJson', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('distingue un rate limit del resto de errores de red', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 429 } as Response);

    await expect(getValidatedJson('https://example.test', schema)).rejects.toMatchObject<
      Partial<DictionaryError>
    >({ code: 'RATE_LIMIT', retryable: true });
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

  it('tipa un fallo de transporte como error de red reintentable', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('offline'));

    await expect(getValidatedJson('https://example.test', schema)).rejects.toMatchObject<
      Partial<DictionaryError>
    >({ code: 'NETWORK', retryable: true });
  });
});

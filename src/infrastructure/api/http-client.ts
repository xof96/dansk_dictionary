import { z, ZodType } from 'zod';

import { DictionaryError } from '@/domain/models/errors';

const DEFAULT_TIMEOUT_MS = 8_000;

export async function getValidatedJson<T>(
  url: string,
  schema: ZodType<T>,
  signal?: AbortSignal,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort('timeout'), DEFAULT_TIMEOUT_MS);
  const cancelFromCaller = () => controller.abort('cancelled');
  signal?.addEventListener('abort', cancelFromCaller, { once: true });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Api-User-Agent': 'DanskDictionary/0.1 (educational dictionary app)',
      },
      signal: controller.signal,
    });

    if (response.status === 429) {
      throw new DictionaryError(
        'RATE_LIMIT',
        'Wiktionary ha limitado temporalmente las consultas.',
        true,
      );
    }
    if (!response.ok) {
      throw new DictionaryError(
        'NETWORK',
        `El proveedor respondió con HTTP ${response.status}.`,
        response.status >= 500,
      );
    }

    const untrusted: unknown = await response.json();
    const parsed = schema.safeParse(untrusted);
    if (!parsed.success) {
      throw new DictionaryError(
        'INVALID_RESPONSE',
        'Wiktionary devolvió una respuesta con un formato inesperado.',
        false,
        { cause: z.prettifyError(parsed.error) },
      );
    }
    return parsed.data;
  } catch (error: unknown) {
    if (error instanceof DictionaryError) throw error;
    if (controller.signal.aborted) {
      if (signal?.aborted) throw error;
      throw new DictionaryError('TIMEOUT', 'La consulta tardó demasiado.', true, { cause: error });
    }
    throw new DictionaryError('NETWORK', 'No se pudo conectar con Wiktionary.', true, {
      cause: error,
    });
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancelFromCaller);
  }
}

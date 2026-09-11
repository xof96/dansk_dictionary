import { ZodType } from 'zod';
import { Platform } from 'react-native';

import { DictionaryError } from '@/domain/models/errors';

const DEFAULT_TIMEOUT_MS = 8_000;
const WIKIMEDIA_USER_AGENT = 'DanskDictionary/1.0 (com.danskdictionary.app)';

interface HttpFailureDetails {
  status: number;
  statusText: string;
  requestId?: string;
  contentType?: string;
}

function buildRequestHeaders(): Record<string, string> {
  const identificationHeader =
    Platform.OS === 'web'
      ? { 'Api-User-Agent': WIKIMEDIA_USER_AGENT }
      : {
          'User-Agent': WIKIMEDIA_USER_AGENT,
          'Api-User-Agent': WIKIMEDIA_USER_AGENT,
        };

  return {
    Accept: 'application/json',
    ...identificationHeader,
  };
}

function getFailureDetails(response: Response): HttpFailureDetails {
  const requestId = response.headers?.get?.('x-request-id') ?? undefined;
  const contentType = response.headers?.get?.('content-type') ?? undefined;

  return {
    status: response.status,
    statusText: response.statusText ?? '',
    ...(requestId ? { requestId } : {}),
    ...(contentType ? { contentType } : {}),
  };
}

function logHttpFailure(details: HttpFailureDetails): void {
  if (__DEV__) {
    console.warn('[dictionary:http] Provider request failed', details);
  }
}

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
      headers: buildRequestHeaders(),
      signal: controller.signal,
    });

    // Never include the query URL, request headers, or response body in diagnostics: the URL
    // contains the searched term and future provider configuration could contain credentials.
    const failureDetails = response.ok ? undefined : getFailureDetails(response);
    if (failureDetails) logHttpFailure(failureDetails);

    if (response.status === 429) {
      throw new DictionaryError(
        'RATE_LIMIT',
        'Wiktionary ha limitado temporalmente las consultas.',
        true,
        { cause: failureDetails },
      );
    }
    if (response.status === 401 || response.status === 403) {
      throw new DictionaryError(
        'PROVIDER_REJECTED',
        `El proveedor rechazó la consulta (HTTP ${response.status}).`,
        false,
        { cause: failureDetails },
      );
    }
    if (!response.ok) {
      throw new DictionaryError(
        'NETWORK',
        `El proveedor respondió con HTTP ${response.status}.`,
        response.status >= 500,
        { cause: failureDetails },
      );
    }

    let untrusted: unknown;
    try {
      untrusted = await response.json();
    } catch (error: unknown) {
      throw new DictionaryError(
        'INVALID_RESPONSE',
        'Wiktionary devolvió una respuesta que no es JSON válido.',
        false,
        { cause: error },
      );
    }
    const parsed = schema.safeParse(untrusted);
    if (!parsed.success) {
      throw new DictionaryError(
        'INVALID_RESPONSE',
        'Wiktionary devolvió una respuesta con un formato inesperado.',
        false,
        { cause: parsed.error },
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

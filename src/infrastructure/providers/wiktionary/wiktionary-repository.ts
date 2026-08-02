import { DictionaryLookupResult } from '@/domain/models/dictionary';
import { DictionaryRepository } from '@/domain/repositories/dictionary-repository';
import { normalizeSearchTerm } from '@/domain/services/dictionary-policy';
import { getValidatedJson } from '@/infrastructure/api/http-client';
import { normalizeWiktionaryPage } from '@/infrastructure/providers/wiktionary/wiktionary-normalizer';
import {
  wiktionaryOpenSearchSchema,
  wiktionaryParseResponseSchema,
} from '@/infrastructure/providers/wiktionary/wiktionary-schema';

const DEFAULT_API_URL = 'https://en.wiktionary.org/w/api.php';

function buildUrl(params: Record<string, string>): string {
  const apiUrl = process.env.EXPO_PUBLIC_WIKTIONARY_API_URL ?? DEFAULT_API_URL;
  const query = new URLSearchParams({ ...params, format: 'json', formatversion: '2', origin: '*' });
  return `${apiUrl}?${query.toString()}`;
}

export class WiktionaryDictionaryRepository implements DictionaryRepository {
  async lookupExact(term: string, signal?: AbortSignal): Promise<DictionaryLookupResult> {
    const normalizedTerm = normalizeSearchTerm(term);
    const response = await getValidatedJson(
      buildUrl({ action: 'parse', page: normalizedTerm, prop: 'wikitext|revid' }),
      wiktionaryParseResponseSchema,
      signal,
    );

    if ('error' in response) {
      return {
        exactMatch: false,
        suggestions: await this.suggest(normalizedTerm, signal),
      };
    }

    const entry = normalizeWiktionaryPage(response.parse, normalizedTerm);
    if (!entry) {
      return {
        exactMatch: false,
        suggestions: await this.suggest(normalizedTerm, signal),
      };
    }

    return { entry, suggestions: [], exactMatch: true };
  }

  private async suggest(term: string, signal?: AbortSignal) {
    const response = await getValidatedJson(
      buildUrl({ action: 'opensearch', search: term, limit: '6', namespace: '0' }),
      wiktionaryOpenSearchSchema,
      signal,
    );
    return response[1].map((suggestion) => ({ term: suggestion, source: 'Wiktionary (en)' }));
  }
}

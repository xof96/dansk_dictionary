import { onlineManager, useQuery } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import { DictionaryLookupResult } from '@/domain/models/dictionary';
import { normalizeSearchTerm } from '@/domain/services/dictionary-policy';
import { WiktionaryDictionaryRepository } from '@/infrastructure/providers/wiktionary/wiktionary-repository';
import { getStoredEntry, recordHistory, saveEntry } from '@/infrastructure/storage/database';

const repository = new WiktionaryDictionaryRepository();

export function useDictionaryEntry(term: string) {
  const database = useSQLiteContext();
  const normalizedTerm = normalizeSearchTerm(term);

  return useQuery({
    queryKey: ['dictionary-entry', normalizedTerm],
    enabled: normalizedTerm.length > 0,
    queryFn: async ({ signal }): Promise<DictionaryLookupResult> => {
      const stored = await getStoredEntry(database, normalizedTerm);

      if (!onlineManager.isOnline() && stored) {
        const entry = {
          ...stored.entry,
          cacheState: stored.isStale ? ('stale-cache' as const) : ('fresh-cache' as const),
        };
        await recordHistory(database, entry);
        return { entry, exactMatch: true, suggestions: [] };
      }

      try {
        const result = await repository.lookupExact(normalizedTerm, signal);
        if (result.entry) {
          await saveEntry(database, result.entry);
          await recordHistory(database, result.entry);
        }
        return result;
      } catch (error: unknown) {
        if (!stored) throw error;
        const entry = {
          ...stored.entry,
          cacheState: stored.isStale ? ('stale-cache' as const) : ('fresh-cache' as const),
        };
        await recordHistory(database, entry);
        return { entry, exactMatch: true, suggestions: [] };
      }
    },
  });
}

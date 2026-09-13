import { onlineManager, useQuery } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import { normalizeSearchTerm } from '@/domain/services/dictionary-policy';
import { loadDictionaryEntry } from '@/features/dictionary/services/load-dictionary-entry';
import { WiktionaryDictionaryRepository } from '@/infrastructure/providers/wiktionary/wiktionary-repository';

const repository = new WiktionaryDictionaryRepository();

export function useDictionaryEntry(term: string) {
  const database = useSQLiteContext();
  const normalizedTerm = normalizeSearchTerm(term);

  return useQuery({
    queryKey: ['dictionary-entry', normalizedTerm],
    enabled: normalizedTerm.length > 0,
    queryFn: ({ signal }) =>
      loadDictionaryEntry({
        database,
        isOnline: onlineManager.isOnline(),
        normalizedTerm,
        repository,
        signal,
      }),
  });
}

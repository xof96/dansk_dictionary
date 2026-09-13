import { SQLiteDatabase } from 'expo-sqlite';

import { DictionaryEntry, DictionaryLookupResult } from '@/domain/models/dictionary';
import { DictionaryError } from '@/domain/models/errors';
import { DictionaryRepository } from '@/domain/repositories/dictionary-repository';
import { getStoredEntry, recordHistory, saveEntry } from '@/infrastructure/storage/database';

interface LoadDictionaryEntryOptions {
  database: SQLiteDatabase;
  isOnline: boolean;
  normalizedTerm: string;
  repository: DictionaryRepository;
  signal?: AbortSignal;
  now?: Date;
}

function cachedLookupResult(
  entry: DictionaryEntry,
  isStale: boolean,
): DictionaryLookupResult & { entry: DictionaryEntry } {
  return {
    entry: {
      ...entry,
      cacheState: isStale ? 'stale-cache' : 'fresh-cache',
    },
    exactMatch: true,
    suggestions: [],
  };
}

export async function loadDictionaryEntry({
  database,
  isOnline,
  normalizedTerm,
  repository,
  signal,
  now,
}: LoadDictionaryEntryOptions): Promise<DictionaryLookupResult> {
  const stored = await getStoredEntry(database, normalizedTerm, now);

  if (!isOnline) {
    if (!stored) {
      throw new DictionaryError(
        'NETWORK',
        'No hay conexión y no existe una copia local para esta palabra.',
        true,
      );
    }

    const result = cachedLookupResult(stored.entry, stored.isStale);
    await recordHistory(database, result.entry);
    return result;
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
    const result = cachedLookupResult(stored.entry, stored.isStale);
    await recordHistory(database, result.entry);
    return result;
  }
}

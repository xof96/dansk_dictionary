import { DictionaryLookupResult } from '@/domain/models/dictionary';

export interface DictionaryRepository {
  lookupExact(term: string, signal?: AbortSignal): Promise<DictionaryLookupResult>;
}

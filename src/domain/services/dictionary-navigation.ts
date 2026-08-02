import { normalizeSearchTerm } from '@/domain/services/dictionary-policy';

export function buildEntryHref(term: string) {
  return {
    pathname: '/entry/[term]' as const,
    params: { term: normalizeSearchTerm(term) },
  };
}

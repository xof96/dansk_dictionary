import { DataConflict, ProviderFact } from '@/domain/models/dictionary';

const PROVIDER_PRIORITY = ['Wiktionary (en)', 'Dansk Dictionary editorial'];

export function normalizeSearchTerm(term: string): string {
  return term.trim().normalize('NFC').toLocaleLowerCase('da-DK');
}

export function selectPreferredFact<T>(facts: ProviderFact<T>[]): {
  selected?: ProviderFact<T>;
  conflict?: DataConflict;
} {
  if (facts.length === 0) return {};

  const sorted = [...facts].sort((left, right) => {
    const leftProvider = left.attributionIds[0]?.split(':')[0] ?? '';
    const rightProvider = right.attributionIds[0]?.split(':')[0] ?? '';
    return PROVIDER_PRIORITY.indexOf(leftProvider) - PROVIDER_PRIORITY.indexOf(rightProvider);
  });

  const selected = sorted[0];
  if (!selected) return {};

  const uniqueValues = new Set(sorted.map((fact) => JSON.stringify(fact.value)));
  if (uniqueValues.size === 1) return { selected };

  return {
    selected,
    conflict: {
      field: 'unspecified',
      values: sorted,
      resolution: 'provider-priority',
      explanation: 'Se conserva el dato del proveedor prioritario y el conflicto queda registrado.',
    },
  };
}

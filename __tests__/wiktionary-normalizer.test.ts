import { buildEntryHref } from '@/domain/services/dictionary-navigation';
import { normalizeWiktionaryPage } from '@/infrastructure/providers/wiktionary/wiktionary-normalizer';

import { ARBEJDE_PAGE, HEDDE_PAGE, HEDDER_PAGE, HUS_PAGE } from './fixtures/wiktionary-pages';

const NOW = new Date('2026-08-02T10:00:00.000Z');

describe('normalizeWiktionaryPage', () => {
  it('normaliza hus con género et, IPA, homógrafos e inflexiones navegables', () => {
    const entry = normalizeWiktionaryPage(HUS_PAGE, 'hus', NOW);

    expect(entry).toBeDefined();
    expect(entry?.entryKind).toBe('lemma');
    expect(entry?.grammaticalUnits).toHaveLength(2);
    expect(entry?.grammaticalUnits[0]?.features.gender).toBe('et');
    expect(entry?.grammaticalUnits[0]?.inflections.map((item) => item.form)).toEqual(
      expect.arrayContaining(['huset', 'husene']),
    );
    expect(entry?.pronunciations[0]).toMatchObject({
      transcription: '[ˈhuˀs]',
      transcriptionType: 'phonetic',
    });
  });

  it('mantiene hedder como forma actual y enlaza a hedde sin copiar su IPA', () => {
    const entry = normalizeWiktionaryPage(HEDDER_PAGE, 'hedder', NOW);

    expect(entry).toMatchObject({ queriedForm: 'hedder', entryKind: 'surface-form' });
    expect(entry?.formRelations[0]).toMatchObject({
      lemma: 'hedde',
      relationLabel: 'presente',
      partOfSpeech: 'verb',
    });
    expect(entry?.pronunciations).toEqual([]);
    expect(entry?.examples[0]).toMatchObject({
      original: 'Jeg hedder Matías.',
      kind: 'pedagogical',
    });
    expect(entry?.examples[0]?.translations.map((item) => item.text)).toEqual([
      'Me llamo Matías.',
      'My name is Matías.',
    ]);
  });

  it('normaliza el lema hedde y permite volver a hedder desde su conjugación', () => {
    const entry = normalizeWiktionaryPage(HEDDE_PAGE, 'hedde', NOW);
    const present = entry?.grammaticalUnits[0]?.inflections.find(
      (inflection) => inflection.label === 'presente',
    );

    expect(entry?.entryKind).toBe('lemma');
    expect(entry?.pronunciations[0]?.transcription).toBe('[ˈheðə]');
    expect(present?.form).toBe('hedder');
    expect(buildEntryHref(present?.form ?? '')).toEqual({
      pathname: '/entry/[term]',
      params: { term: 'hedder' },
    });
  });

  it('conserva múltiples categorías, acepciones y pronunciaciones', () => {
    const entry = normalizeWiktionaryPage(ARBEJDE_PAGE, 'arbejde', NOW);

    expect(entry?.grammaticalUnits.map((unit) => unit.partOfSpeech)).toEqual(['noun', 'verb']);
    expect(entry?.grammaticalUnits[0]?.senses).toHaveLength(3);
    expect(entry?.pronunciations).toHaveLength(3);
    expect(entry?.pronunciations.map((item) => item.transcriptionType)).toEqual([
      'phonemic',
      'phonemic',
      'phonetic',
    ]);
  });

  it('devuelve undefined si la página no contiene una sección danesa', () => {
    expect(
      normalizeWiktionaryPage(
        { title: 'x', pageid: 1, revid: 2, wikitext: '==English==\n===Noun===\n# x' },
        'x',
        NOW,
      ),
    ).toBeUndefined();
  });
});

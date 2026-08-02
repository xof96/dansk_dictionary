import { wiktionaryParseResponseSchema } from '@/infrastructure/providers/wiktionary/wiktionary-schema';

import { HUS_PAGE } from './fixtures/wiktionary-pages';

describe('wiktionaryParseResponseSchema', () => {
  it('acepta una respuesta real de action=parse', () => {
    expect(wiktionaryParseResponseSchema.safeParse({ parse: HUS_PAGE }).success).toBe(true);
  });

  it('rechaza respuestas sin revisión ni wikitext', () => {
    expect(
      wiktionaryParseResponseSchema.safeParse({
        parse: { title: 'hus', pageid: 40446, wikitext: 123 },
      }).success,
    ).toBe(false);
  });
});

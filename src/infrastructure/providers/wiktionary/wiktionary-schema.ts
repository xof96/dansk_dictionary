import { z } from 'zod';

export const wiktionaryParseResponseSchema = z.union([
  z.object({
    parse: z.object({
      title: z.string(),
      pageid: z.number().int(),
      revid: z.number().int(),
      wikitext: z.string(),
    }),
  }),
  z.object({
    error: z.object({
      code: z.string(),
      info: z.string(),
    }),
  }),
]);

export const wiktionaryOpenSearchSchema = z.tuple([
  z.string(),
  z.array(z.string()),
  z.array(z.string()),
  z.array(z.string()),
]);

export type WiktionaryParseResponse = z.infer<typeof wiktionaryParseResponseSchema>;

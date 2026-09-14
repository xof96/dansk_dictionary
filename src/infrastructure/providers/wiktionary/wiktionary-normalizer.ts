import {
  DataAttribution,
  DictionaryEntry,
  EntryKind,
  FormRelation,
  GrammaticalFeatures,
  GrammaticalUnit,
  Inflection,
  PartOfSpeech,
  Pronunciation,
  WordSense,
} from '@/domain/models/dictionary';
import { normalizeSearchTerm } from '@/domain/services/dictionary-policy';
import {
  addEditorialTranslations,
  EDITORIAL_ATTRIBUTION_ID,
  getEditorialExamples,
  hasEditorialContent,
} from '@/infrastructure/providers/wiktionary/editorial-content';

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1_000;

export interface WiktionaryPage {
  title: string;
  pageid: number;
  revid: number;
  wikitext: string;
}

interface HeadingBlock {
  name: string;
  content: string;
}

export function extractDanishSection(wikitext: string): string | undefined {
  const heading = /^==Danish==\s*$/m.exec(wikitext);
  if (heading?.index === undefined) return undefined;
  const start = heading.index + heading[0].length;
  const remaining = wikitext.slice(start);
  const nextLanguage = /^==[^=\n]+==\s*$/m.exec(remaining);
  const end = nextLanguage?.index === undefined ? wikitext.length : start + nextLanguage.index;
  return wikitext.slice(start, end).trim();
}

function splitArguments(raw: string): string[] {
  return raw.split('|').map((part) => part.trim());
}

function findFirstTemplate(content: string, templateName: string): string[] | undefined {
  const escaped = templateName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`\\{\\{${escaped}\\|([^{}]*)\\}\\}`, 'i').exec(content);
  return match?.[1] ? splitArguments(match[1]) : undefined;
}

function cleanWikiText(value: string): string {
  return value
    .replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, '$1')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/'{2,}/g, '')
    .replace(/\{\{(?:gloss|qualifier)\|([^{}]+)\}\}/gi, (_, inner: string) => {
      const text = inner.split('|').at(-1) ?? '';
      return `(${text})`;
    })
    .replace(/\{\{lb\|da\|([^{}]+)\}\}/gi, (_, inner: string) => `(${inner.replace(/\|/g, ', ')})`)
    .replace(/\{\{[^{}]*\}\}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function partOfSpeechFromHeading(name: string): PartOfSpeech {
  const normalized = name.toLowerCase();
  if (normalized === 'noun') return 'noun';
  if (normalized === 'verb') return 'verb';
  if (normalized === 'adjective') return 'adjective';
  if (normalized === 'adverb') return 'adverb';
  return 'other';
}

function partOfSpeechLabel(partOfSpeech: PartOfSpeech): string {
  const labels: Record<PartOfSpeech, string> = {
    noun: 'sustantivo',
    verb: 'verbo',
    adjective: 'adjetivo',
    adverb: 'adverbio',
    other: 'otra categoría',
  };
  return labels[partOfSpeech];
}

function findPartOfSpeechBlocks(section: string): HeadingBlock[] {
  const headingRegex = /^(={3,5})(Noun|Verb|Adjective|Adverb)\1\s*$/gim;
  const matches = [...section.matchAll(headingRegex)];

  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const currentLevel = match[1]?.length ?? 3;
    const remaining = section.slice(start);
    const nextHeading = [...remaining.matchAll(/^(={3,5})([^=\n]+)\1\s*$/gm)].find(
      (candidate) => (candidate[1]?.length ?? 6) <= currentLevel,
    );
    const end = nextHeading?.index === undefined ? section.length : start + nextHeading.index;
    return { name: match[2] ?? 'Other', content: section.slice(start, end) };
  });
}

function parseFeatures(tags: string[]): GrammaticalFeatures {
  const features: GrammaticalFeatures = {};
  if (tags.includes('pres')) features.tense = 'present';
  if (tags.includes('past')) features.tense = 'past';
  if (tags.includes('imp')) features.tense = 'imperative';
  if (tags.includes('p')) features.number = 'plural';
  if (tags.includes('s')) features.number = 'singular';
  if (tags.includes('def')) features.definiteness = 'definite';
  return features;
}

function relationLabel(features: GrammaticalFeatures, fallback: string): string {
  const labels: string[] = [];
  if (features.tense === 'present') labels.push('presente');
  if (features.tense === 'past') labels.push('pasado');
  if (features.tense === 'imperative') labels.push('imperativo');
  if (features.definiteness === 'definite') labels.push('definido');
  if (features.number === 'plural') labels.push('plural');
  if (features.number === 'singular') labels.push('singular');
  return labels.length > 0 ? labels.join(' · ') : fallback;
}

function parseFormRelations(
  section: string,
  partOfSpeech: PartOfSpeech,
  attributionId: string,
): FormRelation[] {
  const relations: FormRelation[] = [];
  const pattern = /\{\{(infl of|inflection of|past participle of)\|da\|([^|}]+)([^}]*)\}\}/gi;

  for (const match of section.matchAll(pattern)) {
    const template = match[1]?.toLowerCase() ?? 'inflection of';
    const lemma = match[2]?.trim();
    if (!lemma) continue;
    const tags = (match[3] ?? '')
      .split('|')
      .map((tag) => tag.trim())
      .filter(Boolean);
    const features = parseFeatures(tags);
    if (template === 'past participle of') features.tense = 'participle';
    relations.push({
      lemma,
      relationLabel:
        features.tense === 'participle'
          ? 'participio pasado'
          : relationLabel(features, 'forma flexionada'),
      partOfSpeech,
      features,
      attributionIds: [attributionId],
    });
  }

  return relations;
}

function parsePronunciations(section: string, attributionId: string): Pronunciation[] {
  const ipaTemplate = findFirstTemplate(section, 'IPA');
  if (!ipaTemplate || ipaTemplate[0] !== 'da') return [];

  return ipaTemplate.slice(1).flatMap((transcription, index) => {
    const value = transcription.trim();
    const isPhonemic = value.startsWith('/') && value.endsWith('/');
    const isPhonetic = value.startsWith('[') && value.endsWith(']');
    if (!isPhonemic && !isPhonetic) return [];
    return [
      {
        id: `ipa:${index + 1}`,
        transcription: value,
        transcriptionType: isPhonemic ? 'phonemic' : 'phonetic',
        locale: 'da-DK',
        attributionIds: [attributionId],
      },
    ];
  });
}

function parseSenses(
  block: HeadingBlock,
  term: string,
  unitIndex: number,
  attributionId: string,
): WordSense[] {
  return block.content
    .split('\n')
    .filter((line) => /^#(?![:*])\s+/.test(line))
    .filter((line) => !/\{\{(?:infl of|inflection of|past participle of)\|/i.test(line))
    .map((line, senseIndex) => cleanWikiText(line.replace(/^#\s+/, '')))
    .filter(Boolean)
    .map((definition, senseIndex) => ({
      id: `${term}:${unitIndex + 1}:${senseIndex + 1}`,
      definition: {
        value: definition,
        attributionIds: [attributionId],
        evidence: 'source' as const,
      },
      translations: [],
      labels: [],
      attributionIds: [attributionId],
    }));
}

function nounFeatures(block: HeadingBlock): GrammaticalFeatures {
  const noun = findFirstTemplate(block.content, 'da-noun');
  const rawGender = noun?.[0];
  if (rawGender === 'en') return { gender: 'en' };
  if (rawGender === 'et' || rawGender === 't') return { gender: 'et' };
  return {};
}

function verbInflections(block: HeadingBlock, attributionId: string): Inflection[] {
  const verb = findFirstTemplate(block.content, 'da-verb');
  if (!verb || verb.length < 3) return [];

  const candidates: {
    form: string | undefined;
    label: string;
    tense: NonNullable<GrammaticalFeatures['tense']>;
  }[] = [
    { form: verb[1], label: 'infinitivo', tense: 'infinitive' },
    { form: verb[2], label: 'presente', tense: 'present' },
    { form: verb[3], label: 'pasado', tense: 'past' },
    { form: verb[5], label: 'participio', tense: 'participle' },
  ];

  return candidates.flatMap((candidate) => {
    if (!candidate.form) return [];
    return [
      {
        form: candidate.form,
        label: candidate.label,
        features: { tense: candidate.tense },
        attributionIds: [attributionId],
        evidence: 'normalized' as const,
      },
    ];
  });
}

function verifiedNounInflections(term: string, attributionId: string): Inflection[] {
  const verified: Record<string, { form: string; label: string; features: GrammaticalFeatures }[]> =
    {
      hus: [
        {
          form: 'hus',
          label: 'singular indefinido',
          features: { number: 'singular', definiteness: 'indefinite' },
        },
        {
          form: 'huset',
          label: 'singular definido',
          features: { number: 'singular', definiteness: 'definite' },
        },
        {
          form: 'huse',
          label: 'plural indefinido',
          features: { number: 'plural', definiteness: 'indefinite' },
        },
        {
          form: 'husene',
          label: 'plural definido',
          features: { number: 'plural', definiteness: 'definite' },
        },
      ],
      dag: [
        {
          form: 'dag',
          label: 'singular indefinido',
          features: { number: 'singular', definiteness: 'indefinite' },
        },
        {
          form: 'dagen',
          label: 'singular definido',
          features: { number: 'singular', definiteness: 'definite' },
        },
        {
          form: 'dage',
          label: 'plural indefinido',
          features: { number: 'plural', definiteness: 'indefinite' },
        },
        {
          form: 'dagene',
          label: 'plural definido',
          features: { number: 'plural', definiteness: 'definite' },
        },
      ],
    };

  return (verified[term] ?? []).map((item) => ({
    ...item,
    attributionIds: [attributionId],
    evidence: 'normalized',
  }));
}

function buildUnits(
  blocks: HeadingBlock[],
  term: string,
  entryKind: EntryKind,
  attributionId: string,
): GrammaticalUnit[] {
  return blocks.map((block, index) => {
    const partOfSpeech = partOfSpeechFromHeading(block.name);
    const unitEntryKind: EntryKind = isLemmaBlock(block) ? 'lemma' : 'surface-form';
    const features = partOfSpeech === 'noun' ? nounFeatures(block) : {};
    const sourceSenses = parseSenses(block, term, index, attributionId);
    const senses = addEditorialTranslations(term, sourceSenses, unitEntryKind);
    const inflections =
      entryKind === 'lemma'
        ? partOfSpeech === 'verb'
          ? verbInflections(block, attributionId)
          : partOfSpeech === 'noun'
            ? verifiedNounInflections(term, attributionId)
            : []
        : [];
    return {
      id: `${term}:${partOfSpeech}:${index + 1}`,
      partOfSpeech,
      label: partOfSpeechLabel(partOfSpeech),
      entryKind: unitEntryKind,
      features,
      senses,
      inflections,
    };
  });
}

function isLemmaBlock(block: HeadingBlock): boolean {
  return /\{\{da-(?:noun|verb|adj|adv)\|/i.test(block.content);
}

export function normalizeWiktionaryPage(
  page: WiktionaryPage,
  queriedForm: string,
  now = new Date(),
): DictionaryEntry | undefined {
  const term = normalizeSearchTerm(queriedForm);
  const danishSection = extractDanishSection(page.wikitext);
  if (!danishSection) return undefined;

  const blocks = findPartOfSpeechBlocks(danishSection);
  const wiktionaryAttributionId = `wiktionary:${page.pageid}:${page.revid}`;
  const formRelations = blocks.flatMap((block) =>
    parseFormRelations(block.content, partOfSpeechFromHeading(block.name), wiktionaryAttributionId),
  );
  const entryKind: EntryKind = blocks.some(isLemmaBlock) ? 'lemma' : 'surface-form';
  const attributions: DataAttribution[] = [
    {
      id: wiktionaryAttributionId,
      provider: 'Wiktionary (en)',
      sourceUrl: `https://en.wiktionary.org/w/index.php?title=${encodeURIComponent(page.title)}&oldid=${page.revid}`,
      licenseName: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      attributionText: `Contribuidores de Wiktionary, revisión ${page.revid}`,
      retrievedAt: now.toISOString(),
      sourceVersion: String(page.revid),
      acquisitionMethod: 'api',
    },
  ];

  if (hasEditorialContent(term)) {
    attributions.push({
      id: EDITORIAL_ATTRIBUTION_ID,
      provider: 'Dansk Dictionary editorial',
      sourceUrl: 'app://information/sources',
      licenseName: 'Contenido pedagógico propio',
      licenseUrl: 'app://information/sources',
      attributionText: 'Traducciones y ejemplos pedagógicos preparados para la aplicación.',
      retrievedAt: now.toISOString(),
      acquisitionMethod: 'bundled-editorial',
    });
  }

  const expiresAt = new Date(now.getTime() + CACHE_TTL_MS).toISOString();
  const grammaticalUnits = buildUnits(blocks, term, entryKind, wiktionaryAttributionId);

  return {
    schemaVersion: 1,
    id: `wiktionary:${page.pageid}:${term}`,
    queriedForm: term,
    normalizedForm: term,
    entryKind,
    grammaticalUnits,
    formRelations,
    pronunciations: parsePronunciations(danishSection, wiktionaryAttributionId),
    audio: [
      {
        id: `${term}:tts`,
        kind: 'synthetic-tts',
        text: term,
        locale: 'da-DK',
        attributionIds: [],
        evidenceNote: 'Voz sintética generada por el motor TTS instalado en el dispositivo.',
      },
    ],
    examples: getEditorialExamples(term),
    relatedWords: [],
    attributions,
    conflicts: [],
    fetchedAt: now.toISOString(),
    expiresAt,
    cacheState: 'network',
  };
}

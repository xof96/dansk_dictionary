export type EntryKind = 'lemma' | 'surface-form';
export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';
export type EvidenceKind = 'source' | 'normalized' | 'editorial' | 'synthetic' | 'inferred';

export interface DataAttribution {
  id: string;
  provider: string;
  sourceUrl: string;
  licenseName: string;
  licenseUrl: string;
  attributionText: string;
  retrievedAt: string;
  sourceVersion?: string;
  acquisitionMethod: 'api' | 'bundled-editorial';
}

export interface ProviderFact<T> {
  value: T;
  attributionIds: string[];
  evidence: EvidenceKind;
  confidence?: number;
  note?: string;
}

export interface GrammaticalFeatures {
  gender?: 'en' | 'et';
  number?: 'singular' | 'plural';
  definiteness?: 'indefinite' | 'definite';
  tense?: 'infinitive' | 'present' | 'past' | 'participle' | 'imperative';
  person?: string;
  regionalVariant?: string;
}

export interface FormRelation {
  lemma: string;
  relationLabel: string;
  partOfSpeech: PartOfSpeech;
  features: GrammaticalFeatures;
  attributionIds: string[];
}

export interface Inflection {
  form: string;
  label: string;
  features: GrammaticalFeatures;
  attributionIds: string[];
  evidence: EvidenceKind;
}

export interface Translation {
  language: 'es' | 'en';
  text: string;
  attributionIds: string[];
  evidence: EvidenceKind;
}

export interface WordSense {
  id: string;
  definition?: ProviderFact<string>;
  translations: Translation[];
  labels: string[];
  attributionIds: string[];
}

export interface Pronunciation {
  id: string;
  transcription: string;
  transcriptionType: 'phonemic' | 'phonetic';
  locale: string;
  stress?: string;
  stod?: string;
  variant?: string;
  attributionIds: string[];
}

export interface AudioSource {
  id: string;
  kind: 'human-recording' | 'synthetic-tts';
  url?: string;
  text?: string;
  locale: string;
  attributionIds: string[];
  evidenceNote: string;
}

export interface ExampleSentence {
  id: string;
  original: string;
  translations: Translation[];
  kind: 'source-example' | 'pedagogical';
  attributionIds: string[];
  audio: AudioSource[];
  sentencePronunciation?: Pronunciation;
}

export interface GrammaticalUnit {
  id: string;
  partOfSpeech: PartOfSpeech;
  label: string;
  entryKind: EntryKind;
  features: GrammaticalFeatures;
  senses: WordSense[];
  inflections: Inflection[];
}

export interface DataConflict {
  field: string;
  values: ProviderFact<unknown>[];
  resolution: 'shown-separately' | 'provider-priority' | 'unresolved';
  explanation: string;
}

export interface DictionaryEntry {
  schemaVersion: 1;
  id: string;
  queriedForm: string;
  normalizedForm: string;
  entryKind: EntryKind;
  grammaticalUnits: GrammaticalUnit[];
  formRelations: FormRelation[];
  pronunciations: Pronunciation[];
  audio: AudioSource[];
  examples: ExampleSentence[];
  etymology?: ProviderFact<string>;
  relatedWords: ProviderFact<string>[];
  attributions: DataAttribution[];
  conflicts: DataConflict[];
  fetchedAt: string;
  expiresAt: string;
  cacheState?: 'network' | 'fresh-cache' | 'stale-cache';
}

export interface DictionarySuggestion {
  term: string;
  source: string;
}

export interface DictionaryLookupResult {
  entry?: DictionaryEntry;
  suggestions: DictionarySuggestion[];
  exactMatch: boolean;
}

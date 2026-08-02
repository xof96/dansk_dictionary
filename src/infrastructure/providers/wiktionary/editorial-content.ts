import { EntryKind, ExampleSentence, Translation, WordSense } from '@/domain/models/dictionary';

export const EDITORIAL_ATTRIBUTION_ID = 'editorial:v1';

interface EditorialEntry {
  senses: { es: string; en: string }[];
  example?: { da: string; es: string; en: string };
}

const CONTENT: Record<string, EditorialEntry> = {
  hus: {
    senses: [
      { es: 'casa; vivienda', en: 'house' },
      { es: 'edificio', en: 'building' },
      { es: 'bloque de pisos; casa de campo', en: 'block of flats; cottage' },
      { es: 'cáscara; armazón', en: 'shell' },
    ],
    example: { da: 'Huset er gammelt.', es: 'La casa es antigua.', en: 'The house is old.' },
  },
  dag: {
    senses: [{ es: 'día', en: 'day' }],
    example: { da: 'Det er en god dag.', es: 'Es un buen día.', en: 'It is a good day.' },
  },
  arbejde: {
    senses: [
      { es: 'trabajo; empleo', en: 'work; employment' },
      { es: 'trabajo (en física)', en: 'work (physics)' },
      { es: 'trabajo; esfuerzo', en: 'work; effort' },
      { es: 'trabajar', en: 'to work' },
    ],
    example: {
      da: 'Jeg arbejder i København.',
      es: 'Trabajo en Copenhague.',
      en: 'I work in Copenhagen.',
    },
  },
  forstå: {
    senses: [{ es: 'entender; comprender', en: 'to understand' }],
    example: { da: 'Jeg forstår dansk.', es: 'Entiendo danés.', en: 'I understand Danish.' },
  },
  hedde: {
    senses: [
      { es: 'llamarse', en: 'to be called' },
      { es: 'tener por nombre', en: 'to be named' },
      { es: 'decirse; afirmarse', en: 'to be said; to be claimed' },
    ],
    example: { da: 'Hvad hedder du?', es: '¿Cómo te llamas?', en: 'What is your name?' },
  },
  hedder: {
    senses: [{ es: 'me/te/se llamo, llamas, llama; presente de hedde', en: 'am/is/are called' }],
    example: { da: 'Jeg hedder Matías.', es: 'Me llamo Matías.', en: 'My name is Matías.' },
  },
  lytter: {
    senses: [{ es: 'escucha; presente de lytte', en: 'listens; is listening' }],
    example: {
      da: 'Hun lytter til musik.',
      es: 'Ella escucha música.',
      en: 'She listens to music.',
    },
  },
};

function translation(language: 'es' | 'en', text: string): Translation {
  return {
    language,
    text,
    attributionIds: [EDITORIAL_ATTRIBUTION_ID],
    evidence: 'editorial',
  };
}

export function addEditorialTranslations(
  term: string,
  senses: WordSense[],
  entryKind: EntryKind,
): WordSense[] {
  const content = CONTENT[term];
  if (!content) return senses;

  if (senses.length === 0 && entryKind === 'surface-form') {
    return content.senses.map((sense, index) => ({
      id: `${term}:editorial:${index + 1}`,
      translations: [translation('es', sense.es), translation('en', sense.en)],
      labels: ['uso contextual'],
      attributionIds: [EDITORIAL_ATTRIBUTION_ID],
    }));
  }

  return senses.map((sense, index) => {
    const editorial = content.senses[index];
    if (!editorial) return sense;
    return {
      ...sense,
      translations: [translation('es', editorial.es), translation('en', editorial.en)],
      attributionIds: [...new Set([...sense.attributionIds, EDITORIAL_ATTRIBUTION_ID])],
    };
  });
}

export function getEditorialExamples(term: string): ExampleSentence[] {
  const example = CONTENT[term]?.example;
  if (!example) return [];

  return [
    {
      id: `${term}:editorial-example:1`,
      original: example.da,
      translations: [translation('es', example.es), translation('en', example.en)],
      kind: 'pedagogical',
      attributionIds: [EDITORIAL_ATTRIBUTION_ID],
      audio: [
        {
          id: `${term}:example:tts`,
          kind: 'synthetic-tts',
          text: example.da,
          locale: 'da-DK',
          attributionIds: [],
          evidenceNote: 'Voz sintética generada por el motor TTS instalado en el dispositivo.',
        },
      ],
    },
  ];
}

export function hasEditorialContent(term: string): boolean {
  return term in CONTENT;
}

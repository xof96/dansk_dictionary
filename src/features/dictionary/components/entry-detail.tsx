import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { ActionButton, AppText, Card, Pill } from '@/components/ui';
import { typography } from '@/constants/theme';
import { DataAttribution, DictionaryEntry, GrammaticalFeatures } from '@/domain/models/dictionary';
import { buildEntryHref } from '@/domain/services/dictionary-navigation';
import { TtsButton } from '@/features/dictionary/components/tts-button';
import { useFavorite } from '@/features/favorites/use-favorite';
import { useAppTheme } from '@/hooks/use-app-theme';

function sourceNames(ids: string[], sources: DataAttribution[]): string {
  return [
    ...new Set(
      ids.map((id) => sources.find((source) => source.id === id)?.provider).filter(Boolean),
    ),
  ].join(' · ');
}

function SourceLine({ ids, entry }: { ids: string[]; entry: DictionaryEntry }) {
  const names = sourceNames(ids, entry.attributions);
  if (!names) return null;
  return <AppText variant="caption">Fuente: {names}</AppText>;
}

function featureSummary(features: GrammaticalFeatures): string {
  const values = [
    features.gender ? `género ${features.gender}` : undefined,
    features.tense,
    features.definiteness,
    features.number,
  ].filter(Boolean);
  return values.join(' · ');
}

function partOfSpeechLabel(partOfSpeech: string): string {
  return (
    { noun: 'sustantivo', verb: 'verbo', adjective: 'adjetivo', adverb: 'adverbio' }[
      partOfSpeech
    ] ?? 'forma'
  );
}

function openEntry(term: string) {
  router.push(buildEntryHref(term));
}

export function EntryDetail({ entry }: { entry: DictionaryEntry }) {
  const colors = useAppTheme();
  const favorite = useFavorite(entry);
  const mainUnit = entry.grammaticalUnits[0];

  return (
    <View style={styles.content}>
      <LinearGradient
        colors={[colors.heroStart, colors.heroMiddle, colors.heroEnd]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={[styles.wordHero, { borderColor: colors.border }]}
      >
        <View style={styles.heroToolbar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.heroButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="arrow-back" size={21} color={colors.text} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={favorite.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            disabled={favorite.isUpdating}
            onPress={() => void favorite.toggle()}
            style={({ pressed }) => [
              styles.heroButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={favorite.isFavorite ? 'heart' : 'heart-outline'}
              size={25}
              color={favorite.isFavorite ? colors.danger : colors.text}
            />
          </Pressable>
        </View>
        <View style={styles.titleBlock}>
          <AppText variant="caption" style={[styles.eyebrow, { color: colors.accent }]}>
            Entrada danesa exacta
          </AppText>
          <AppText variant="display">{entry.queriedForm}</AppText>
          <View style={styles.inlineWrap}>
            <Pill tone="neutral">
              {entry.entryKind === 'surface-form' ? 'forma flexionada' : 'lema'}
            </Pill>
            {mainUnit?.features.gender ? (
              <Pill tone="yellow">género {mainUnit.features.gender}</Pill>
            ) : null}
          </View>
          {mainUnit ? (
            <AppText>
              {mainUnit.label}
              {featureSummary(mainUnit.features) ? ` · ${featureSummary(mainUnit.features)}` : ''}
            </AppText>
          ) : null}
        </View>
      </LinearGradient>

      {entry.cacheState === 'stale-cache' ? (
        <Card style={{ borderColor: colors.warning }}>
          <AppText variant="heading">Copia guardada sin conexión</AppText>
          <AppText variant="caption">
            La caché ha superado su fecha de actualización. Se muestra con su procedencia original.
          </AppText>
        </Card>
      ) : entry.cacheState === 'fresh-cache' ? (
        <Pill>Disponible sin conexión · copia vigente</Pill>
      ) : null}

      {entry.formRelations.map((relation) => (
        <Card key={`${relation.lemma}:${relation.relationLabel}`} tone="soft">
          <AppText variant="caption">Relación morfológica</AppText>
          <View style={styles.inlineWrap}>
            <AppText>
              {partOfSpeechLabel(relation.partOfSpeech)} · {relation.relationLabel} de{' '}
            </AppText>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`Abrir el lema ${relation.lemma}`}
              onPress={() => openEntry(relation.lemma)}
            >
              <AppText style={{ color: colors.accent, fontFamily: typography.bold }}>
                {relation.lemma}
              </AppText>
            </Pressable>
          </View>
          <SourceLine ids={relation.attributionIds} entry={entry} />
        </Card>
      ))}

      <Card>
        <AppText variant="heading">Pronunciación</AppText>
        {entry.pronunciations.length > 0 ? (
          entry.pronunciations.map((pronunciation) => (
            <View key={pronunciation.id} style={styles.itemGroup}>
              <AppText
                style={styles.ipa}
                accessibilityLabel={`${pronunciation.transcriptionType === 'phonemic' ? 'Transcripción fonémica' : 'Transcripción fonética'} ${pronunciation.transcription}`}
              >
                {pronunciation.transcription}
              </AppText>
              <AppText variant="caption">
                {pronunciation.transcriptionType === 'phonemic'
                  ? 'Transcripción fonémica /…/'
                  : 'Transcripción fonética […]'}
              </AppText>
              <SourceLine ids={pronunciation.attributionIds} entry={entry} />
            </View>
          ))
        ) : (
          <View style={styles.itemGroup}>
            <AppText>Pronunciación IPA específica no disponible.</AppText>
            {entry.entryKind === 'surface-form' ? (
              <AppText variant="caption">
                No se reutiliza la IPA del lema porque la fuente no verifica esta forma.
              </AppText>
            ) : null}
          </View>
        )}
        <TtsButton text={entry.queriedForm} />
      </Card>

      {entry.grammaticalUnits.map((unit) => (
        <Card key={unit.id}>
          <View style={styles.inlineWrap}>
            <AppText variant="heading">{unit.label}</AppText>
            {unit.features.gender ? <Pill>género {unit.features.gender}</Pill> : null}
          </View>

          {unit.senses.length === 0 ? (
            <AppText variant="caption">
              No hay acepciones verificadas disponibles para esta categoría.
            </AppText>
          ) : (
            unit.senses.map((sense, index) => (
              <View key={sense.id} style={[styles.sense, { borderTopColor: colors.border }]}>
                <AppText variant="caption">Acepción {index + 1}</AppText>
                {sense.definition ? <AppText>{sense.definition.value}</AppText> : null}
                {sense.translations.map((translation) => (
                  <View key={`${sense.id}:${translation.language}`} style={styles.translationRow}>
                    <Pill>{translation.language.toUpperCase()}</Pill>
                    <AppText style={styles.flex}>{translation.text}</AppText>
                  </View>
                ))}
                <SourceLine ids={sense.attributionIds} entry={entry} />
              </View>
            ))
          )}

          {unit.inflections.length > 0 ? (
            <View style={styles.itemGroup}>
              <AppText variant="heading">Flexiones</AppText>
              <View style={styles.inflections}>
                {unit.inflections.map((inflection) => (
                  <Pressable
                    key={`${unit.id}:${inflection.label}:${inflection.form}`}
                    accessibilityRole="link"
                    accessibilityLabel={`Abrir ${inflection.form}, ${inflection.label}`}
                    onPress={() => openEntry(inflection.form)}
                    style={({ pressed }) => [
                      styles.inflection,
                      { borderColor: colors.border, backgroundColor: colors.primarySoft },
                      pressed && styles.pressed,
                    ]}
                  >
                    <AppText style={{ fontFamily: typography.bold }}>{inflection.form}</AppText>
                    <AppText variant="caption">{inflection.label}</AppText>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </Card>
      ))}

      {entry.examples.map((example) => (
        <Card key={example.id} tone="soft">
          <View style={styles.inlineWrap}>
            <AppText variant="heading">Ejemplo</AppText>
            <Pill>{example.kind === 'pedagogical' ? 'pedagógico propio' : 'de la fuente'}</Pill>
          </View>
          <AppText style={styles.example}>{example.original}</AppText>
          {example.translations.map((translation) => (
            <View key={`${example.id}:${translation.language}`} style={styles.translationRow}>
              <Pill>{translation.language.toUpperCase()}</Pill>
              <AppText style={styles.flex}>{translation.text}</AppText>
            </View>
          ))}
          <View style={styles.audioRow}>
            <TtsButton text={example.original} />
            <TtsButton text={example.original} slow />
          </View>
          <AppText variant="caption">
            No se muestra IPA de la frase: no hay una transcripción completa verificada.
          </AppText>
          <SourceLine ids={example.attributionIds} entry={entry} />
        </Card>
      ))}

      <Card>
        <AppText variant="heading">Fuentes y atribución</AppText>
        {entry.attributions.map((attribution) => (
          <View key={attribution.id} style={styles.itemGroup}>
            <AppText style={{ fontFamily: typography.semibold }}>{attribution.provider}</AppText>
            <AppText variant="caption">{attribution.attributionText}</AppText>
            <AppText variant="caption">
              {attribution.licenseName} · consultado{' '}
              {new Date(attribution.retrievedAt).toLocaleDateString('es-ES')}
            </AppText>
            {attribution.sourceUrl.startsWith('https://') ? (
              <ActionButton
                label="Abrir fuente"
                kind="secondary"
                onPress={() => void Linking.openURL(attribution.sourceUrl)}
              />
            ) : null}
          </View>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16 },
  wordHero: { borderRadius: 27, borderWidth: 1, padding: 20, gap: 24, overflow: 'hidden' },
  heroToolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroButton: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: { gap: 11, paddingBottom: 2 },
  eyebrow: {
    fontFamily: typography.bold,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  flex: { flex: 1 },
  inlineWrap: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  itemGroup: { gap: 7 },
  ipa: { fontFamily: typography.semibold, fontSize: 25, lineHeight: 32 },
  sense: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12, gap: 8 },
  translationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  inflections: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  inflection: { borderWidth: 1, borderRadius: 10, padding: 12, minWidth: 120, gap: 2 },
  pressed: { opacity: 0.65 },
  example: { fontFamily: typography.semibold, fontSize: 21, lineHeight: 29 },
  audioRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});

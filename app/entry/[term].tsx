import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  ActionButton,
  AppText,
  Card,
  GradientHeader,
  LoadingState,
  PageScroll,
  SuggestionButton,
} from '@/components/ui';
import { EntryDetail } from '@/features/dictionary/components/entry-detail';
import { useDictionaryEntry } from '@/features/dictionary/hooks/use-dictionary-entry';
import { useAppTheme } from '@/hooks/use-app-theme';

function BackButton() {
  const colors = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Volver"
      accessibilityHint="Vuelve a la pantalla anterior"
      onPress={() => router.back()}
      style={({ pressed }) => [
        styles.backButton,
        { backgroundColor: colors.surface, borderColor: colors.muted },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons accessible={false} name="arrow-back" size={21} color={colors.text} />
    </Pressable>
  );
}

export default function EntryScreen() {
  const params = useLocalSearchParams<{ term: string | string[] }>();
  const term = Array.isArray(params.term) ? (params.term[0] ?? '') : (params.term ?? '');
  const query = useDictionaryEntry(term);

  if (query.isPending) {
    return (
      <PageScroll>
        <GradientHeader
          eyebrow="Consulta exacta"
          title={term || 'Buscando'}
          action={<BackButton />}
        />
        <LoadingState label={`Buscando “${term}”…`} />
      </PageScroll>
    );
  }

  if (query.isError) {
    return (
      <PageScroll>
        <GradientHeader
          eyebrow="Consulta exacta"
          title={term || 'Entrada'}
          action={<BackButton />}
        />
        <Card>
          <AppText variant="heading" accessibilityRole="alert" accessibilityLiveRegion="assertive">
            No se pudo completar la consulta
          </AppText>
          <AppText>
            {query.error instanceof Error ? query.error.message : 'Error desconocido.'}
          </AppText>
          <AppText variant="caption">
            Si ya consultaste esta palabra, se intentó recuperar primero su copia local.
          </AppText>
          <ActionButton label="Reintentar" onPress={() => void query.refetch()} />
        </Card>
      </PageScroll>
    );
  }

  if (!query.data.entry) {
    return (
      <PageScroll>
        <GradientHeader
          eyebrow="Sin coincidencia exacta"
          title={`“${term}”`}
          description="La búsqueda no se ha redirigido a ningún lema."
          action={<BackButton />}
        />
        <Card tone="soft">
          <AppText variant="heading">Puedes elegir una sugerencia</AppText>
          <AppText variant="caption">
            Cada opción abrirá una entrada nueva y conservará la forma que selecciones.
          </AppText>
          <View style={styles.suggestions}>
            {query.data.suggestions.length > 0 ? (
              query.data.suggestions.map((suggestion) => (
                <SuggestionButton
                  key={suggestion.term}
                  label={suggestion.term}
                  onPress={() =>
                    router.push({ pathname: '/entry/[term]', params: { term: suggestion.term } })
                  }
                />
              ))
            ) : (
              <AppText variant="caption">El proveedor tampoco devolvió sugerencias.</AppText>
            )}
          </View>
        </Card>
      </PageScroll>
    );
  }

  return (
    <PageScroll contentContainerStyle={styles.entryPage}>
      <EntryDetail entry={query.data.entry} />
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingVertical: 5 },
  entryPage: { paddingTop: 10 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});

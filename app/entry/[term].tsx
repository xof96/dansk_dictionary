import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ActionButton, AppText, Card, LoadingState, PageScroll } from '@/components/ui';
import { EntryDetail } from '@/features/dictionary/components/entry-detail';
import { useDictionaryEntry } from '@/features/dictionary/hooks/use-dictionary-entry';

export default function EntryScreen() {
  const params = useLocalSearchParams<{ term: string | string[] }>();
  const term = Array.isArray(params.term) ? (params.term[0] ?? '') : (params.term ?? '');
  const query = useDictionaryEntry(term);

  if (query.isPending) {
    return (
      <PageScroll>
        <LoadingState label={`Buscando “${term}”…`} />
      </PageScroll>
    );
  }

  if (query.isError) {
    return (
      <PageScroll>
        <Card>
          <AppText variant="heading">No se pudo completar la consulta</AppText>
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
        <Card>
          <AppText variant="heading">Sin coincidencia exacta para “{term}”</AppText>
          <AppText>No se ha redirigido la búsqueda. Puedes elegir una sugerencia:</AppText>
          <View style={styles.suggestions}>
            {query.data.suggestions.length > 0 ? (
              query.data.suggestions.map((suggestion) => (
                <ActionButton
                  key={suggestion.term}
                  label={suggestion.term}
                  kind="secondary"
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
    <PageScroll>
      <EntryDetail entry={query.data.entry} />
    </PageScroll>
  );
}

const styles = StyleSheet.create({ suggestions: { gap: 10 } });

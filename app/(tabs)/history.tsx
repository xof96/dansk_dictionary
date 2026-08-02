import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { StoredEntryRow } from '@/components/stored-entry-row';
import { ActionButton, AppText, Card, EmptyState, LoadingState, PageScroll } from '@/components/ui';
import { useHistory } from '@/features/history/use-history';

export default function HistoryScreen() {
  const history = useHistory();
  const confirmClear = () => {
    Alert.alert('Borrar todo el historial', 'Esta acción elimina todas las consultas recientes.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: () => void history.clear() },
    ]);
  };

  return (
    <PageScroll>
      <View style={styles.header}>
        <AppText variant="title">Historial</AppText>
        {history.items.length > 0 ? (
          <ActionButton label="Borrar todo" kind="danger" onPress={confirmClear} />
        ) : null}
      </View>
      {history.loading ? (
        <LoadingState label="Cargando historial…" />
      ) : history.items.length === 0 ? (
        <EmptyState
          title="Historial vacío"
          message="Aquí se conserva la forma exacta que buscaste."
        />
      ) : (
        <Card>
          {history.items.map((item) => (
            <StoredEntryRow
              key={item.query}
              term={item.displayTerm}
              entryKind={item.entryKind}
              subtitle={new Date(item.searchedAt).toLocaleString('es-ES')}
              onOpen={() =>
                router.push({ pathname: '/entry/[term]', params: { term: item.query } })
              }
              onRemove={() => void history.remove(item.query)}
            />
          ))}
        </Card>
      )}
    </PageScroll>
  );
}

const styles = StyleSheet.create({ header: { gap: 12, alignItems: 'flex-start' } });

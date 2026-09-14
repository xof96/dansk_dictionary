import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { StoredEntryRow } from '@/components/stored-entry-row';
import {
  ActionButton,
  Card,
  EmptyState,
  ErrorState,
  GradientHeader,
  LoadingState,
  PageScroll,
} from '@/components/ui';
import { useHistory } from '@/features/history/use-history';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function HistoryScreen() {
  const colors = useAppTheme();
  const history = useHistory();
  const confirmClear = () => {
    Alert.alert('Borrar todo el historial', 'Esta acción elimina todas las consultas recientes.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: () => void history.clear() },
    ]);
  };

  return (
    <PageScroll>
      <GradientHeader
        eyebrow="Consultas exactas"
        title="Historial"
        description="Vuelve a cualquier forma que hayas consultado, incluso cuando no tengas conexión."
        action={
          <View
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            style={[styles.iconTile, { backgroundColor: colors.surface }]}
          >
            <Ionicons accessible={false} name="time" size={27} color={colors.accent} />
          </View>
        }
      >
        {history.items.length > 0 ? (
          <View style={styles.clearButton}>
            <ActionButton label="Borrar todo" kind="danger" compact onPress={confirmClear} />
          </View>
        ) : null}
      </GradientHeader>
      {history.loading ? (
        <LoadingState label="Cargando historial…" />
      ) : history.error ? (
        <ErrorState
          title="No se pudo cargar el historial"
          message={history.error}
          onRetry={() => void history.refresh()}
        />
      ) : history.items.length === 0 ? (
        <EmptyState
          title="Historial vacío"
          message="Aquí se conserva la forma exacta que buscaste."
        />
      ) : (
        <Card style={styles.listCard}>
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

const styles = StyleSheet.create({
  iconTile: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: { alignItems: 'flex-start' },
  listCard: { paddingTop: 2, paddingBottom: 2 },
});

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { StoredEntryRow } from '@/components/stored-entry-row';
import { Card, EmptyState, GradientHeader, LoadingState, PageScroll } from '@/components/ui';
import { useFavorites } from '@/features/favorites/use-favorites';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function FavoritesScreen() {
  const colors = useAppTheme();
  const favorites = useFavorites();
  return (
    <PageScroll>
      <GradientHeader
        eyebrow="Tu colección"
        title="Favoritos"
        description="Guarda las palabras que quieres repasar. Cada forma se conserva por separado: hedder nunca se confunde con hedde."
        action={
          <View style={[styles.iconTile, { backgroundColor: colors.surface }]}>
            <Ionicons name="heart" size={26} color={colors.danger} />
          </View>
        }
      />
      {favorites.loading ? (
        <LoadingState label="Cargando favoritos…" />
      ) : favorites.items.length === 0 ? (
        <EmptyState
          title="No hay favoritos"
          message="Abre una entrada y pulsa el corazón para conservarla."
        />
      ) : (
        <Card style={styles.listCard}>
          {favorites.items.map((item) => (
            <StoredEntryRow
              key={item.query}
              term={item.displayTerm}
              entryKind={item.entryKind}
              subtitle={`Guardado ${new Date(item.addedAt).toLocaleString('es-ES')}`}
              onOpen={() =>
                router.push({ pathname: '/entry/[term]', params: { term: item.query } })
              }
              onRemove={() => void favorites.remove(item.query)}
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
  listCard: { paddingTop: 2, paddingBottom: 2 },
});

import { router } from 'expo-router';

import { StoredEntryRow } from '@/components/stored-entry-row';
import { AppText, Card, EmptyState, LoadingState, PageScroll } from '@/components/ui';
import { useFavorites } from '@/features/favorites/use-favorites';

export default function FavoritesScreen() {
  const favorites = useFavorites();
  return (
    <PageScroll>
      <AppText variant="title">Favoritos</AppText>
      <AppText variant="body">
        Cada forma se guarda por separado: hedder nunca se confunde con hedde.
      </AppText>
      {favorites.loading ? (
        <LoadingState label="Cargando favoritos…" />
      ) : favorites.items.length === 0 ? (
        <EmptyState
          title="No hay favoritos"
          message="Abre una entrada y pulsa el corazón para conservarla."
        />
      ) : (
        <Card>
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

import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router/react-navigation';
import { useSQLiteContext } from 'expo-sqlite';

import { FavoriteItem, listFavorites, removeFavorite } from '@/infrastructure/storage/database';

export function useFavorites() {
  const database = useSQLiteContext();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setItems(await listFavorites(database));
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'No se pudieron leer los favoritos.');
    } finally {
      setLoading(false);
    }
  }, [database]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const remove = useCallback(
    async (query: string) => {
      setError(undefined);
      try {
        await removeFavorite(database, query);
        await refresh();
      } catch (caught: unknown) {
        setError(caught instanceof Error ? caught.message : 'No se pudo eliminar el favorito.');
      }
    },
    [database, refresh],
  );

  return { items, loading, error, refresh, remove };
}

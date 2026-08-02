import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';

import { FavoriteItem, listFavorites, removeFavorite } from '@/infrastructure/storage/database';

export function useFavorites() {
  const database = useSQLiteContext();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listFavorites(database));
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
      await removeFavorite(database, query);
      await refresh();
    },
    [database, refresh],
  );

  return { items, loading, remove };
}

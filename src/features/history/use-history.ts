import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router/react-navigation';
import { useSQLiteContext } from 'expo-sqlite';

import {
  clearHistory,
  HistoryItem,
  listHistory,
  removeHistory,
} from '@/infrastructure/storage/database';

export function useHistory(limit = 30) {
  const database = useSQLiteContext();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setItems(await listHistory(database, limit));
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'No se pudo leer el historial.');
    } finally {
      setLoading(false);
    }
  }, [database, limit]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const remove = useCallback(
    async (query: string) => {
      setError(undefined);
      try {
        await removeHistory(database, query);
        await refresh();
      } catch (caught: unknown) {
        setError(caught instanceof Error ? caught.message : 'No se pudo eliminar la consulta.');
      }
    },
    [database, refresh],
  );

  const clear = useCallback(async () => {
    setError(undefined);
    try {
      await clearHistory(database);
      await refresh();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'No se pudo borrar el historial.');
    }
  }, [database, refresh]);

  return { items, loading, error, refresh, remove, clear };
}

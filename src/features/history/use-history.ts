import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listHistory(database, limit));
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
      await removeHistory(database, query);
      await refresh();
    },
    [database, refresh],
  );

  const clear = useCallback(async () => {
    await clearHistory(database);
    await refresh();
  }, [database, refresh]);

  return { items, loading, refresh, remove, clear };
}

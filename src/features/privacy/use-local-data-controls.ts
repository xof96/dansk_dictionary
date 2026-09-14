import { useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import {
  clearAllLocalData,
  clearEntryCache,
  clearFavorites,
  clearHistory,
} from '@/infrastructure/storage/database';

export type LocalDataScope = 'history' | 'favorites' | 'cache' | 'all';

const successMessages: Record<LocalDataScope, string> = {
  history: 'Se borró todo el historial.',
  favorites: 'Se borraron todos los favoritos.',
  cache: 'Se borró toda la caché de entradas.',
  all: 'Se borraron el historial, los favoritos y la caché.',
};

export function useLocalDataControls() {
  const database = useSQLiteContext();
  const queryClient = useQueryClient();
  const [activeScope, setActiveScope] = useState<LocalDataScope>();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  const clear = useCallback(
    async (scope: LocalDataScope) => {
      if (activeScope) return;
      setActiveScope(scope);
      setMessage(undefined);
      setError(undefined);

      try {
        if (scope === 'history') await clearHistory(database);
        if (scope === 'favorites') await clearFavorites(database);
        if (scope === 'cache') await clearEntryCache(database);
        if (scope === 'all') await clearAllLocalData(database);

        if (scope === 'cache' || scope === 'all') {
          queryClient.removeQueries({ queryKey: ['dictionary-entry'] });
        }
        setMessage(successMessages[scope]);
      } catch (caught: unknown) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'No se pudieron borrar los datos seleccionados.',
        );
      } finally {
        setActiveScope(undefined);
      }
    },
    [activeScope, database, queryClient],
  );

  return { activeScope, message, error, clear };
}

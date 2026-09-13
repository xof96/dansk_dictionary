import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { DictionaryEntry } from '@/domain/models/dictionary';
import {
  addFavorite,
  isFavorite as readIsFavorite,
  removeFavorite,
} from '@/infrastructure/storage/database';

export function useFavorite(entry?: DictionaryEntry) {
  const database = useSQLiteContext();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!entry) return;
    let active = true;
    void readIsFavorite(database, entry.normalizedForm)
      .then((value) => {
        if (active) setIsFavorite(value);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'No se pudo consultar el favorito.');
        }
      });
    return () => {
      active = false;
    };
  }, [database, entry]);

  const toggle = useCallback(async () => {
    if (!entry || isUpdating) return;
    setIsUpdating(true);
    setError(undefined);
    try {
      if (isFavorite) {
        await removeFavorite(database, entry.normalizedForm);
        setIsFavorite(false);
      } else {
        await addFavorite(database, entry);
        setIsFavorite(true);
      }
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'No se pudo actualizar el favorito.');
    } finally {
      setIsUpdating(false);
    }
  }, [database, entry, isFavorite, isUpdating]);

  return { isFavorite, isUpdating, error, toggle };
}

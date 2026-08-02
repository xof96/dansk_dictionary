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

  useEffect(() => {
    if (!entry) return;
    let active = true;
    void readIsFavorite(database, entry.normalizedForm).then((value) => {
      if (active) setIsFavorite(value);
    });
    return () => {
      active = false;
    };
  }, [database, entry]);

  const toggle = useCallback(async () => {
    if (!entry || isUpdating) return;
    setIsUpdating(true);
    try {
      if (isFavorite) {
        await removeFavorite(database, entry.normalizedForm);
        setIsFavorite(false);
      } else {
        await addFavorite(database, entry);
        setIsFavorite(true);
      }
    } finally {
      setIsUpdating(false);
    }
  }, [database, entry, isFavorite, isUpdating]);

  return { isFavorite, isUpdating, toggle };
}

import { SQLiteDatabase } from 'expo-sqlite';

import { DictionaryEntry } from '@/domain/models/dictionary';
import { DictionaryError } from '@/domain/models/errors';
import { DictionaryRepository } from '@/domain/repositories/dictionary-repository';
import { loadDictionaryEntry } from '@/features/dictionary/services/load-dictionary-entry';
import { normalizeWiktionaryPage } from '@/infrastructure/providers/wiktionary/wiktionary-normalizer';

import { HEDDER_PAGE } from './fixtures/wiktionary-pages';

const NOW = new Date('2026-08-02T10:00:00.000Z');

function createEntry(): DictionaryEntry {
  const entry = normalizeWiktionaryPage(HEDDER_PAGE, 'hedder', NOW);
  if (!entry) throw new Error('La fixture de hedder debe producir una entrada.');
  return entry;
}

function cacheRow(entry: DictionaryEntry, expiresAt: string) {
  return { entry_json: JSON.stringify(entry), expires_at: expiresAt };
}

function createDatabase(row: ReturnType<typeof cacheRow> | null) {
  return {
    getFirstAsync: jest.fn().mockResolvedValue(row),
    runAsync: jest.fn().mockResolvedValue({}),
  } as unknown as SQLiteDatabase;
}

function createRepository() {
  return {
    lookupExact: jest.fn(),
  } as jest.Mocked<DictionaryRepository>;
}

describe('carga online y recuperación offline', () => {
  it('usa una copia vigente sin consultar la red cuando el dispositivo está offline', async () => {
    const entry = createEntry();
    const database = createDatabase(cacheRow(entry, '2026-08-03T00:00:00.000Z'));
    const repository = createRepository();

    const result = await loadDictionaryEntry({
      database,
      isOnline: false,
      normalizedTerm: 'hedder',
      now: NOW,
      repository,
    });

    expect(result.entry).toMatchObject({ queriedForm: 'hedder', cacheState: 'fresh-cache' });
    expect(repository.lookupExact).not.toHaveBeenCalled();
    expect(database.runAsync).toHaveBeenCalledTimes(1);
  });

  it('usa una copia obsoleta cuando la renovación online falla', async () => {
    const entry = createEntry();
    const database = createDatabase(cacheRow(entry, '2026-08-01T00:00:00.000Z'));
    const repository = createRepository();
    repository.lookupExact.mockRejectedValue(
      new DictionaryError('NETWORK', 'No se pudo conectar.', true),
    );

    const result = await loadDictionaryEntry({
      database,
      isOnline: true,
      normalizedTerm: 'hedder',
      now: NOW,
      repository,
    });

    expect(repository.lookupExact).toHaveBeenCalledWith('hedder', undefined);
    expect(result.entry).toMatchObject({ queriedForm: 'hedder', cacheState: 'stale-cache' });
    expect(database.runAsync).toHaveBeenCalledTimes(1);
  });

  it('guarda en caché e historial una respuesta online exacta', async () => {
    const entry = createEntry();
    const database = createDatabase(null);
    const repository = createRepository();
    repository.lookupExact.mockResolvedValue({ entry, exactMatch: true, suggestions: [] });

    const result = await loadDictionaryEntry({
      database,
      isOnline: true,
      normalizedTerm: 'hedder',
      now: NOW,
      repository,
    });

    expect(result.entry).toBe(entry);
    expect(repository.lookupExact).toHaveBeenCalledWith('hedder', undefined);
    expect(database.runAsync).toHaveBeenCalledTimes(2);
    expect(database.runAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO entry_cache'),
      'hedder',
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.anything(),
      1,
    );
  });

  it('no intenta la API y devuelve un error accionable si está offline sin caché', async () => {
    const database = createDatabase(null);
    const repository = createRepository();

    await expect(
      loadDictionaryEntry({
        database,
        isOnline: false,
        normalizedTerm: 'ukendt',
        now: NOW,
        repository,
      }),
    ).rejects.toMatchObject<Partial<DictionaryError>>({ code: 'NETWORK', retryable: true });

    expect(repository.lookupExact).not.toHaveBeenCalled();
    expect(database.runAsync).not.toHaveBeenCalled();
  });

  it('conserva el error del proveedor cuando tampoco existe caché', async () => {
    const database = createDatabase(null);
    const repository = createRepository();
    const networkError = new DictionaryError('TIMEOUT', 'La consulta tardó demasiado.', true);
    repository.lookupExact.mockRejectedValue(networkError);

    await expect(
      loadDictionaryEntry({
        database,
        isOnline: true,
        normalizedTerm: 'ukendt',
        now: NOW,
        repository,
      }),
    ).rejects.toBe(networkError);
  });
});

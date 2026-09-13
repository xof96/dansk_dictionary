import { SQLiteDatabase } from 'expo-sqlite';

import { selectPreferredFact } from '@/domain/services/dictionary-policy';
import { DictionaryError } from '@/domain/models/errors';
import { normalizeWiktionaryPage } from '@/infrastructure/providers/wiktionary/wiktionary-normalizer';
import {
  addFavorite,
  DATABASE_VERSION,
  getStoredEntry,
  migrateDatabase,
  recordHistory,
  removeFavorite,
  removeHistory,
  saveEntry,
} from '@/infrastructure/storage/database';

import { HEDDE_PAGE, HEDDER_PAGE } from './fixtures/wiktionary-pages';

const NOW = new Date('2026-08-02T10:00:00.000Z');

function tableInfo(names: readonly string[]) {
  return names.map((name) => ({ name }));
}

describe('migraciones SQLite', () => {
  it('crea el esquema vigente desde una instalación limpia', async () => {
    const execAsync = jest.fn().mockResolvedValue(undefined);
    const withTransactionAsync = jest.fn(async (task: () => Promise<void>) => task());
    const database = {
      getFirstAsync: jest.fn().mockResolvedValue({ user_version: 0 }),
      getAllAsync: jest
        .fn()
        .mockResolvedValueOnce(
          tableInfo([
            'query',
            'entry_json',
            'fetched_at',
            'expires_at',
            'provider',
            'source_revision',
            'schema_version',
          ]),
        )
        .mockResolvedValueOnce(tableInfo(['query', 'display_term', 'entry_kind', 'searched_at']))
        .mockResolvedValueOnce(
          tableInfo(['query', 'display_term', 'entry_kind', 'added_at', 'snapshot_json']),
        ),
      execAsync,
      withTransactionAsync,
    } as unknown as SQLiteDatabase;

    await migrateDatabase(database);

    const executedSql = execAsync.mock.calls.flat().join('\n');
    expect(executedSql).toContain('CREATE TABLE IF NOT EXISTS entry_cache');
    expect(executedSql).toContain('CREATE TABLE IF NOT EXISTS history');
    expect(executedSql).toContain('CREATE TABLE IF NOT EXISTS favorites');
    expect(executedSql).toContain(`PRAGMA user_version = ${DATABASE_VERSION}`);
    expect(withTransactionAsync).toHaveBeenCalledTimes(1);
  });

  it('mantiene los pragmas de conexión y no repite una migración sobre v2', async () => {
    const execAsync = jest.fn().mockResolvedValue(undefined);
    const withTransactionAsync = jest.fn();
    const database = {
      getFirstAsync: jest.fn().mockResolvedValue({ user_version: DATABASE_VERSION }),
      execAsync,
      withTransactionAsync,
    } as unknown as SQLiteDatabase;

    await migrateDatabase(database);

    expect(execAsync).toHaveBeenCalledTimes(1);
    expect(execAsync.mock.calls[0]?.[0]).toContain('PRAGMA foreign_keys = ON');
    expect(withTransactionAsync).not.toHaveBeenCalled();
  });

  it('migra la clave term de una base v1 a query sin borrar datos', async () => {
    const execAsync = jest.fn().mockResolvedValue(undefined);
    const withTransactionAsync = jest.fn(async (task: () => Promise<void>) => task());
    const database = {
      getFirstAsync: jest.fn().mockResolvedValue({ user_version: 1 }),
      getAllAsync: jest
        .fn()
        .mockResolvedValueOnce(
          tableInfo([
            'term',
            'entry_json',
            'fetched_at',
            'expires_at',
            'provider',
            'source_revision',
            'schema_version',
          ]),
        )
        .mockResolvedValueOnce(tableInfo(['term', 'display_term', 'entry_kind', 'searched_at']))
        .mockResolvedValueOnce(
          tableInfo(['term', 'display_term', 'entry_kind', 'added_at', 'snapshot_json']),
        ),
      execAsync,
      withTransactionAsync,
    } as unknown as SQLiteDatabase;

    await migrateDatabase(database);

    const executedSql = execAsync.mock.calls.flat().join('\n');
    expect(executedSql).toContain('ALTER TABLE "entry_cache" RENAME COLUMN "term" TO "query"');
    expect(executedSql).toContain('ALTER TABLE "history" RENAME COLUMN "term" TO "query"');
    expect(executedSql).toContain('ALTER TABLE "favorites" RENAME COLUMN "term" TO "query"');
    expect(executedSql).toContain('PRAGMA user_version = 2');
    expect(withTransactionAsync).toHaveBeenCalledTimes(1);
  });

  it('conserva como respaldo una tabla v1 incompatible y crea el esquema vigente', async () => {
    const execAsync = jest.fn().mockResolvedValue(undefined);
    const database = {
      getFirstAsync: jest.fn().mockResolvedValue({ user_version: 1 }),
      getAllAsync: jest
        .fn()
        .mockResolvedValueOnce(tableInfo(['unexpected_cache_column']))
        .mockResolvedValueOnce(tableInfo(['query', 'display_term', 'entry_kind', 'searched_at']))
        .mockResolvedValueOnce(
          tableInfo(['query', 'display_term', 'entry_kind', 'added_at', 'snapshot_json']),
        ),
      execAsync,
      withTransactionAsync: jest.fn(async (task: () => Promise<void>) => task()),
    } as unknown as SQLiteDatabase;

    await migrateDatabase(database);

    const executedSql = execAsync.mock.calls.flat().join('\n');
    expect(executedSql).toContain('ALTER TABLE "entry_cache" RENAME TO "entry_cache_legacy_v1"');
    expect(executedSql).toContain('CREATE TABLE IF NOT EXISTS entry_cache');
  });
});

describe('persistencia exacta y caché', () => {
  it('marca como vigente una entrada cuya expiración aún no pasó', async () => {
    const entry = normalizeWiktionaryPage(HEDDER_PAGE, 'hedder', NOW);
    expect(entry).toBeDefined();
    const database = {
      getFirstAsync: jest.fn().mockResolvedValue({
        entry_json: JSON.stringify(entry),
        expires_at: '2026-08-03T00:00:00.000Z',
      }),
    } as unknown as SQLiteDatabase;

    const stored = await getStoredEntry(database, 'hedder', NOW);

    expect(stored?.entry.queriedForm).toBe('hedder');
    expect(stored?.isStale).toBe(false);
  });

  it('marca como obsoleta una entrada cuya expiración ya pasó', async () => {
    const entry = normalizeWiktionaryPage(HEDDER_PAGE, 'hedder', NOW);
    expect(entry).toBeDefined();
    const database = {
      getFirstAsync: jest.fn().mockResolvedValue({
        entry_json: JSON.stringify(entry),
        expires_at: '2026-08-01T00:00:00.000Z',
      }),
    } as unknown as SQLiteDatabase;

    const stored = await getStoredEntry(database, 'hedder', NOW);

    expect(stored?.entry.queriedForm).toBe('hedder');
    expect(stored?.isStale).toBe(true);
  });

  it('rechaza una caché dañada sin introducirla en el dominio', async () => {
    const database = {
      getFirstAsync: jest.fn().mockResolvedValue({
        entry_json: JSON.stringify({ schemaVersion: 99, queriedForm: 'hedder' }),
        expires_at: '2099-01-01T00:00:00.000Z',
      }),
    } as unknown as SQLiteDatabase;

    await expect(getStoredEntry(database, 'hedder', NOW)).resolves.toBeUndefined();
  });

  it('trata JSON malformado como caché inválida recuperable', async () => {
    const database = {
      getFirstAsync: jest.fn().mockResolvedValue({
        entry_json: '{contenido-incompleto',
        expires_at: '2099-01-01T00:00:00.000Z',
      }),
    } as unknown as SQLiteDatabase;

    await expect(getStoredEntry(database, 'hedder', NOW)).resolves.toBeUndefined();
  });

  it('devuelve ausencia cuando no existe una fila de caché', async () => {
    const database = {
      getFirstAsync: jest.fn().mockResolvedValue(null),
    } as unknown as SQLiteDatabase;

    await expect(getStoredEntry(database, 'ukendt', NOW)).resolves.toBeUndefined();
  });

  it('tipa como almacenamiento un fallo real al consultar SQLite', async () => {
    const cause = new Error('database is locked');
    const database = {
      getFirstAsync: jest.fn().mockRejectedValue(cause),
    } as unknown as SQLiteDatabase;

    await expect(getStoredEntry(database, 'hedder', NOW)).rejects.toMatchObject<
      Partial<DictionaryError>
    >({ code: 'STORAGE', retryable: false, cause });
  });

  it('usa claves diferentes para hedde y hedder en caché, historial y favoritos', async () => {
    const hedde = normalizeWiktionaryPage(HEDDE_PAGE, 'hedde', NOW);
    const hedder = normalizeWiktionaryPage(HEDDER_PAGE, 'hedder', NOW);
    expect(hedde).toBeDefined();
    expect(hedder).toBeDefined();
    const runAsync = jest.fn().mockResolvedValue({});
    const database = { runAsync } as unknown as SQLiteDatabase;

    await saveEntry(database, hedde!);
    await saveEntry(database, hedder!);
    await recordHistory(database, hedde!);
    await recordHistory(database, hedder!);
    await addFavorite(database, hedde!);
    await addFavorite(database, hedder!);

    const exactKeys = runAsync.mock.calls.map((call: unknown[]) => call[1]);
    expect(exactKeys).toEqual(['hedde', 'hedder', 'hedde', 'hedder', 'hedde', 'hedder']);
  });

  it('elimina una sola clave mediante SQL parametrizado', async () => {
    const query = "hedde'); DROP TABLE favorites; --";
    const runAsync = jest.fn().mockResolvedValue({});
    const database = { runAsync } as unknown as SQLiteDatabase;

    await removeHistory(database, query);
    await removeFavorite(database, query);

    expect(runAsync).toHaveBeenNthCalledWith(1, 'DELETE FROM history WHERE query = ?', query);
    expect(runAsync).toHaveBeenNthCalledWith(2, 'DELETE FROM favorites WHERE query = ?', query);
  });
});

describe('política de conflictos', () => {
  it('registra valores incompatibles en vez de mezclarlos', () => {
    const result = selectPreferredFact([
      {
        value: '[a]',
        attributionIds: ['Wiktionary (en):1'],
        evidence: 'source',
      },
      {
        value: '[b]',
        attributionIds: ['Dansk Dictionary editorial:1'],
        evidence: 'editorial',
      },
    ]);

    expect(result.selected?.value).toBe('[a]');
    expect(result.conflict).toMatchObject({ resolution: 'provider-priority' });
    expect(result.conflict?.values).toHaveLength(2);
  });
});

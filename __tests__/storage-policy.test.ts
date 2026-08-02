import { SQLiteDatabase } from 'expo-sqlite';

import { selectPreferredFact } from '@/domain/services/dictionary-policy';
import { normalizeWiktionaryPage } from '@/infrastructure/providers/wiktionary/wiktionary-normalizer';
import {
  addFavorite,
  getStoredEntry,
  migrateDatabase,
  recordHistory,
} from '@/infrastructure/storage/database';

import { HEDDE_PAGE, HEDDER_PAGE } from './fixtures/wiktionary-pages';

const NOW = new Date('2026-08-02T10:00:00.000Z');

function tableInfo(names: readonly string[]) {
  return names.map((name) => ({ name }));
}

describe('migraciones SQLite', () => {
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

  it('usa claves diferentes para hedde y hedder en historial y favoritos', async () => {
    const hedde = normalizeWiktionaryPage(HEDDE_PAGE, 'hedde', NOW);
    const hedder = normalizeWiktionaryPage(HEDDER_PAGE, 'hedder', NOW);
    expect(hedde).toBeDefined();
    expect(hedder).toBeDefined();
    const runAsync = jest.fn().mockResolvedValue({});
    const database = { runAsync } as unknown as SQLiteDatabase;

    await recordHistory(database, hedde!);
    await recordHistory(database, hedder!);
    await addFavorite(database, hedde!);
    await addFavorite(database, hedder!);

    const exactKeys = runAsync.mock.calls.map((call: unknown[]) => call[1]);
    expect(exactKeys).toEqual(['hedde', 'hedder', 'hedde', 'hedder']);
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

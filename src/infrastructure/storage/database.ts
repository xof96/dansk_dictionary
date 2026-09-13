import { SQLiteDatabase } from 'expo-sqlite';
import { z } from 'zod';

import { DictionaryEntry, EntryKind } from '@/domain/models/dictionary';
import { DictionaryError } from '@/domain/models/errors';

export const DATABASE_VERSION = 2;

interface TableInfoRow {
  name: string;
}

interface TableMigration {
  name: 'entry_cache' | 'history' | 'favorites';
  requiredColumns: readonly string[];
  legacyQueryColumns: readonly string[];
  createSql: string;
  indexNames: readonly string[];
}

const TABLE_MIGRATIONS: readonly TableMigration[] = [
  {
    name: 'entry_cache',
    requiredColumns: [
      'query',
      'entry_json',
      'fetched_at',
      'expires_at',
      'provider',
      'source_revision',
      'schema_version',
    ],
    legacyQueryColumns: ['term', 'search_term', 'normalized_term', 'word'],
    createSql: `
      CREATE TABLE IF NOT EXISTS entry_cache (
        query TEXT PRIMARY KEY NOT NULL,
        entry_json TEXT NOT NULL,
        fetched_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        provider TEXT NOT NULL,
        source_revision TEXT,
        schema_version INTEGER NOT NULL
      );`,
    indexNames: [],
  },
  {
    name: 'history',
    requiredColumns: ['query', 'display_term', 'entry_kind', 'searched_at'],
    legacyQueryColumns: ['term', 'search_term', 'normalized_term', 'word'],
    createSql: `
      CREATE TABLE IF NOT EXISTS history (
        query TEXT PRIMARY KEY NOT NULL,
        display_term TEXT NOT NULL,
        entry_kind TEXT NOT NULL CHECK(entry_kind IN ('lemma', 'surface-form')),
        searched_at TEXT NOT NULL
      );`,
    indexNames: ['history_searched_at_idx'],
  },
  {
    name: 'favorites',
    requiredColumns: ['query', 'display_term', 'entry_kind', 'added_at', 'snapshot_json'],
    legacyQueryColumns: ['term', 'search_term', 'normalized_term', 'word'],
    createSql: `
      CREATE TABLE IF NOT EXISTS favorites (
        query TEXT PRIMARY KEY NOT NULL,
        display_term TEXT NOT NULL,
        entry_kind TEXT NOT NULL CHECK(entry_kind IN ('lemma', 'surface-form')),
        added_at TEXT NOT NULL,
        snapshot_json TEXT NOT NULL
      );`,
    indexNames: ['favorites_added_at_idx'],
  },
];

const cachedEntryShape = z
  .object({
    schemaVersion: z.literal(1),
    id: z.string(),
    queriedForm: z.string(),
    normalizedForm: z.string(),
    entryKind: z.enum(['lemma', 'surface-form']),
    grammaticalUnits: z.array(z.unknown()),
    formRelations: z.array(z.unknown()),
    pronunciations: z.array(z.unknown()),
    audio: z.array(z.unknown()),
    examples: z.array(z.unknown()),
    relatedWords: z.array(z.unknown()),
    attributions: z.array(z.unknown()),
    conflicts: z.array(z.unknown()),
    fetchedAt: z.string(),
    expiresAt: z.string(),
  })
  .passthrough();

export interface StoredEntryResult {
  entry: DictionaryEntry;
  isStale: boolean;
}

export interface HistoryItem {
  query: string;
  displayTerm: string;
  entryKind: EntryKind;
  searchedAt: string;
}

export interface FavoriteItem {
  query: string;
  displayTerm: string;
  entryKind: EntryKind;
  addedAt: string;
}

async function migrateTableToVersion2(
  db: SQLiteDatabase,
  migration: TableMigration,
): Promise<void> {
  const columns = await db.getAllAsync<TableInfoRow>(`PRAGMA table_info("${migration.name}")`);
  const columnNames = new Set(columns.map((column) => column.name));

  if (migration.requiredColumns.every((column) => columnNames.has(column))) return;

  const missingColumns = migration.requiredColumns.filter((column) => !columnNames.has(column));
  const legacyQueryColumn = migration.legacyQueryColumns.find((column) => columnNames.has(column));
  const canRenameLegacyQuery =
    missingColumns.length === 1 && missingColumns[0] === 'query' && legacyQueryColumn;

  if (canRenameLegacyQuery) {
    await db.execAsync(
      `ALTER TABLE "${migration.name}" RENAME COLUMN "${legacyQueryColumn}" TO "query";`,
    );
    return;
  }

  if (columns.length > 0) {
    const backupName = `${migration.name}_legacy_v1`;
    const dropIndexes = migration.indexNames
      .map((indexName) => `DROP INDEX IF EXISTS "${indexName}";`)
      .join('\n');
    await db.execAsync(`
      ALTER TABLE "${migration.name}" RENAME TO "${backupName}";
      ${dropIndexes}
      ${migration.createSql}
    `);
    return;
  }

  await db.execAsync(migration.createSql);
}

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  if (currentVersion >= DATABASE_VERSION) return;

  await db.withTransactionAsync(async () => {
    if (currentVersion < 1) {
      await db.execAsync(TABLE_MIGRATIONS.map((migration) => migration.createSql).join('\n'));
    }

    if (currentVersion < 2) {
      for (const migration of TABLE_MIGRATIONS) {
        await migrateTableToVersion2(db, migration);
      }

      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS history_searched_at_idx ON history(searched_at DESC);
        CREATE INDEX IF NOT EXISTS favorites_added_at_idx ON favorites(added_at DESC);
        PRAGMA user_version = 2;
      `);
    }
  });
}

export async function saveEntry(db: SQLiteDatabase, entry: DictionaryEntry): Promise<void> {
  const primaryAttribution = entry.attributions[0];
  await db.runAsync(
    `INSERT INTO entry_cache
      (query, entry_json, fetched_at, expires_at, provider, source_revision, schema_version)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(query) DO UPDATE SET
      entry_json = excluded.entry_json,
      fetched_at = excluded.fetched_at,
      expires_at = excluded.expires_at,
      provider = excluded.provider,
      source_revision = excluded.source_revision,
      schema_version = excluded.schema_version`,
    entry.normalizedForm,
    JSON.stringify(entry),
    entry.fetchedAt,
    entry.expiresAt,
    primaryAttribution?.provider ?? 'unknown',
    primaryAttribution?.sourceVersion ?? null,
    entry.schemaVersion,
  );
}

export async function getStoredEntry(
  db: SQLiteDatabase,
  query: string,
  now = new Date(),
): Promise<StoredEntryResult | undefined> {
  let row: { entry_json: string; expires_at: string } | null;
  try {
    row = await db.getFirstAsync<{ entry_json: string; expires_at: string }>(
      'SELECT entry_json, expires_at FROM entry_cache WHERE query = ?',
      query,
    );
  } catch (error: unknown) {
    throw new DictionaryError('STORAGE', 'No se pudo leer la entrada guardada.', false, {
      cause: error,
    });
  }
  if (!row) return undefined;

  try {
    const parsedJson: unknown = JSON.parse(row.entry_json);
    const parsed = cachedEntryShape.safeParse(parsedJson);
    if (!parsed.success) return undefined;
    return {
      entry: parsed.data as unknown as DictionaryEntry,
      isStale: new Date(row.expires_at).getTime() <= now.getTime(),
    };
  } catch {
    return undefined;
  }
}

export async function recordHistory(db: SQLiteDatabase, entry: DictionaryEntry): Promise<void> {
  await db.runAsync(
    `INSERT INTO history (query, display_term, entry_kind, searched_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(query) DO UPDATE SET
       display_term = excluded.display_term,
       entry_kind = excluded.entry_kind,
       searched_at = excluded.searched_at`,
    entry.normalizedForm,
    entry.queriedForm,
    entry.entryKind,
    new Date().toISOString(),
  );
}

export async function listHistory(db: SQLiteDatabase, limit = 30): Promise<HistoryItem[]> {
  const rows = await db.getAllAsync<{
    query: string;
    display_term: string;
    entry_kind: EntryKind;
    searched_at: string;
  }>(
    'SELECT query, display_term, entry_kind, searched_at FROM history ORDER BY searched_at DESC LIMIT ?',
    limit,
  );
  return rows.map((row) => ({
    query: row.query,
    displayTerm: row.display_term,
    entryKind: row.entry_kind,
    searchedAt: row.searched_at,
  }));
}

export async function removeHistory(db: SQLiteDatabase, query: string): Promise<void> {
  await db.runAsync('DELETE FROM history WHERE query = ?', query);
}

export async function clearHistory(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM history');
}

export async function isFavorite(db: SQLiteDatabase, query: string): Promise<boolean> {
  const row = await db.getFirstAsync<{ present: number }>(
    'SELECT 1 AS present FROM favorites WHERE query = ?',
    query,
  );
  return row?.present === 1;
}

export async function addFavorite(db: SQLiteDatabase, entry: DictionaryEntry): Promise<void> {
  await db.runAsync(
    `INSERT INTO favorites (query, display_term, entry_kind, added_at, snapshot_json)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(query) DO UPDATE SET
       display_term = excluded.display_term,
       entry_kind = excluded.entry_kind,
       snapshot_json = excluded.snapshot_json`,
    entry.normalizedForm,
    entry.queriedForm,
    entry.entryKind,
    new Date().toISOString(),
    JSON.stringify(entry),
  );
}

export async function removeFavorite(db: SQLiteDatabase, query: string): Promise<void> {
  await db.runAsync('DELETE FROM favorites WHERE query = ?', query);
}

export async function listFavorites(db: SQLiteDatabase): Promise<FavoriteItem[]> {
  const rows = await db.getAllAsync<{
    query: string;
    display_term: string;
    entry_kind: EntryKind;
    added_at: string;
  }>('SELECT query, display_term, entry_kind, added_at FROM favorites ORDER BY added_at DESC');
  return rows.map((row) => ({
    query: row.query,
    displayTerm: row.display_term,
    entryKind: row.entry_kind,
    addedAt: row.added_at,
  }));
}

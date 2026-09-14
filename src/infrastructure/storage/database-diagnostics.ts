import { deleteDatabaseAsync, openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';

import { DictionaryEntry } from '@/domain/models/dictionary';
import {
  addFavorite,
  clearAllLocalData,
  DATABASE_VERSION,
  getStoredEntry,
  isFavorite,
  listFavorites,
  listHistory,
  migrateDatabase,
  recordHistory,
  removeFavorite,
  removeHistory,
  saveEntry,
} from '@/infrastructure/storage/database';

export interface StorageDiagnosticCheck {
  detail: string;
  name: string;
  passed: boolean;
}

export interface StorageDiagnosticReport {
  checks: StorageDiagnosticCheck[];
  databaseVersion: number;
  passed: boolean;
}

const DIAGNOSTIC_NOW = new Date('2026-08-02T10:00:00.000Z');

function assertDiagnostic(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function diagnosticEntry(
  term: 'hedde' | 'hedder',
  entryKind: DictionaryEntry['entryKind'],
  expiresAt: string,
): DictionaryEntry {
  return {
    schemaVersion: 1,
    id: `dd6:${term}`,
    queriedForm: term,
    normalizedForm: term,
    entryKind,
    grammaticalUnits: [],
    formRelations: [],
    pronunciations: [],
    audio: [],
    examples: [],
    relatedWords: [],
    attributions: [],
    conflicts: [],
    fetchedAt: '2026-08-01T10:00:00.000Z',
    expiresAt,
  };
}

async function withDatabase(
  databaseName: string,
  task: (database: SQLiteDatabase) => Promise<void>,
): Promise<void> {
  const database = await openDatabaseAsync(databaseName);
  try {
    await task(database);
  } finally {
    await database.closeAsync();
  }
}

async function removeDatabase(databaseName: string): Promise<void> {
  try {
    await deleteDatabaseAsync(databaseName);
  } catch {
    // Cada ejecución usa un nombre único; un fallo de limpieza no cambia el resultado funcional.
  }
}

async function captureCheck(
  name: string,
  task: () => Promise<string>,
): Promise<StorageDiagnosticCheck> {
  try {
    return { name, passed: true, detail: await task() };
  } catch (error: unknown) {
    return { name, passed: false, detail: errorMessage(error) };
  }
}

async function readDatabaseVersion(database: SQLiteDatabase): Promise<number> {
  const row = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  return row?.user_version ?? 0;
}

async function cleanInstallAndReopen(databaseName: string): Promise<string> {
  try {
    await withDatabase(databaseName, async (database) => {
      await migrateDatabase(database);
      const version = await readDatabaseVersion(database);
      const tables = await database.getAllAsync<{ name: string }>(
        `SELECT name FROM sqlite_master
         WHERE type = 'table' AND name IN ('entry_cache', 'history', 'favorites')`,
      );
      assertDiagnostic(version === DATABASE_VERSION, `Versión inesperada: ${version}`);
      assertDiagnostic(tables.length === 3, `Se crearon ${tables.length} de 3 tablas`);
    });

    await withDatabase(databaseName, async (database) => {
      await migrateDatabase(database);
      assertDiagnostic(
        (await readDatabaseVersion(database)) === DATABASE_VERSION,
        'La versión cambió al reabrir',
      );
    });

    return 'Esquema v2 creado y conservado después de cerrar y reabrir la base.';
  } finally {
    await removeDatabase(databaseName);
  }
}

async function cacheAndSelectiveCrud(databaseName: string): Promise<string> {
  const hedde = diagnosticEntry('hedde', 'lemma', '2026-08-03T00:00:00.000Z');
  const hedder = diagnosticEntry('hedder', 'surface-form', '2026-08-01T00:00:00.000Z');

  try {
    await withDatabase(databaseName, async (database) => {
      await migrateDatabase(database);
      await saveEntry(database, hedde);
      await saveEntry(database, hedder);
      await recordHistory(database, hedde);
      await recordHistory(database, hedder);
      await addFavorite(database, hedde);
      await addFavorite(database, hedder);

      const fresh = await getStoredEntry(database, 'hedde', DIAGNOSTIC_NOW);
      const stale = await getStoredEntry(database, 'hedder', DIAGNOSTIC_NOW);
      const missing = await getStoredEntry(database, 'mangler', DIAGNOSTIC_NOW);
      assertDiagnostic(fresh?.isStale === false, 'hedde no quedó como caché vigente');
      assertDiagnostic(stale?.isStale === true, 'hedder no quedó como caché obsoleta');
      assertDiagnostic(missing === undefined, 'Una clave ausente devolvió contenido');

      await database.runAsync(
        `INSERT INTO entry_cache
          (query, entry_json, fetched_at, expires_at, provider, source_revision, schema_version)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        'ugyldig',
        '{json-incompleto',
        DIAGNOSTIC_NOW.toISOString(),
        '2099-01-01T00:00:00.000Z',
        'diagnostic',
        null,
        1,
      );
      assertDiagnostic(
        (await getStoredEntry(database, 'ugyldig', DIAGNOSTIC_NOW)) === undefined,
        'La caché malformada entró al dominio',
      );

      await removeHistory(database, 'hedde');
      await removeFavorite(database, 'hedde');
      assertDiagnostic(!(await isFavorite(database, 'hedde')), 'hedde siguió en favoritos');
      assertDiagnostic(await isFavorite(database, 'hedder'), 'hedder se eliminó por error');
    });

    await withDatabase(databaseName, async (database) => {
      await migrateDatabase(database);
      const history = await listHistory(database);
      const favorites = await listFavorites(database);
      assertDiagnostic(
        history.length === 1 && history[0]?.query === 'hedder',
        'El historial selectivo no sobrevivió al reinicio',
      );
      assertDiagnostic(
        favorites.length === 1 && favorites[0]?.query === 'hedder',
        'Los favoritos selectivos no sobrevivieron al reinicio',
      );
      assertDiagnostic(
        Boolean(await getStoredEntry(database, 'hedde', DIAGNOSTIC_NOW)),
        'Eliminar historial/favorito afectó a la caché de hedde',
      );
      assertDiagnostic(
        Boolean(await getStoredEntry(database, 'hedder', DIAGNOSTIC_NOW)),
        'La caché de hedder no sobrevivió al reinicio',
      );
    });

    return 'Caché, historial y favoritos conservaron claves independientes y borrado selectivo.';
  } finally {
    await removeDatabase(databaseName);
  }
}

async function migrateRecognizableVersion1Data(databaseName: string): Promise<string> {
  try {
    await withDatabase(databaseName, async (database) => {
      await database.execAsync(`
        CREATE TABLE entry_cache (
          term TEXT PRIMARY KEY NOT NULL,
          entry_json TEXT NOT NULL,
          fetched_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          provider TEXT NOT NULL,
          source_revision TEXT,
          schema_version INTEGER NOT NULL
        );
        CREATE TABLE history (
          term TEXT PRIMARY KEY NOT NULL,
          display_term TEXT NOT NULL,
          entry_kind TEXT NOT NULL,
          searched_at TEXT NOT NULL
        );
        CREATE TABLE favorites (
          term TEXT PRIMARY KEY NOT NULL,
          display_term TEXT NOT NULL,
          entry_kind TEXT NOT NULL,
          added_at TEXT NOT NULL,
          snapshot_json TEXT NOT NULL
        );
        PRAGMA user_version = 1;
      `);
      await database.runAsync(
        'INSERT INTO entry_cache VALUES (?, ?, ?, ?, ?, ?, ?)',
        'hedder',
        '{"marker":"cache-v1"}',
        DIAGNOSTIC_NOW.toISOString(),
        '2099-01-01T00:00:00.000Z',
        'diagnostic',
        'v1',
        1,
      );
      await database.runAsync(
        'INSERT INTO history VALUES (?, ?, ?, ?)',
        'hedder',
        'hedder',
        'surface-form',
        DIAGNOSTIC_NOW.toISOString(),
      );
      await database.runAsync(
        'INSERT INTO favorites VALUES (?, ?, ?, ?, ?)',
        'hedde',
        'hedde',
        'lemma',
        DIAGNOSTIC_NOW.toISOString(),
        '{"marker":"favorite-v1"}',
      );

      await migrateDatabase(database);

      const cache = await database.getFirstAsync<{ entry_json: string }>(
        'SELECT entry_json FROM entry_cache WHERE query = ?',
        'hedder',
      );
      const history = await database.getFirstAsync<{ display_term: string }>(
        'SELECT display_term FROM history WHERE query = ?',
        'hedder',
      );
      const favorite = await database.getFirstAsync<{ snapshot_json: string }>(
        'SELECT snapshot_json FROM favorites WHERE query = ?',
        'hedde',
      );
      assertDiagnostic(cache?.entry_json.includes('cache-v1'), 'Se perdió la caché v1');
      assertDiagnostic(history?.display_term === 'hedder', 'Se perdió el historial v1');
      assertDiagnostic(favorite?.snapshot_json.includes('favorite-v1'), 'Se perdió el favorito v1');
      assertDiagnostic(
        (await readDatabaseVersion(database)) === DATABASE_VERSION,
        'user_version no avanzó a v2',
      );
    });

    return 'La migración v1→v2 conservó filas reconocibles en las tres tablas.';
  } finally {
    await removeDatabase(databaseName);
  }
}

async function preserveIncompatibleTable(databaseName: string): Promise<string> {
  try {
    await withDatabase(databaseName, async (database) => {
      await database.execAsync(`
        CREATE TABLE entry_cache (unexpected_cache_column TEXT NOT NULL);
        INSERT INTO entry_cache VALUES ('legacy-marker');
        PRAGMA user_version = 1;
      `);

      await migrateDatabase(database);

      const backup = await database.getFirstAsync<{ unexpected_cache_column: string }>(
        'SELECT unexpected_cache_column FROM entry_cache_legacy_v1',
      );
      const currentColumns = await database.getAllAsync<{ name: string }>(
        'PRAGMA table_info("entry_cache")',
      );
      assertDiagnostic(
        backup?.unexpected_cache_column === 'legacy-marker',
        'La tabla incompatible no conservó su fila',
      );
      assertDiagnostic(
        currentColumns.some((column) => column.name === 'query'),
        'No se creó la tabla vigente después del respaldo',
      );
    });

    return 'La tabla incompatible se preservó como entry_cache_legacy_v1.';
  } finally {
    await removeDatabase(databaseName);
  }
}

async function clearEveryLocalRecord(databaseName: string): Promise<string> {
  const entry = diagnosticEntry('hedde', 'lemma', '2026-08-03T00:00:00.000Z');

  try {
    await withDatabase(databaseName, async (database) => {
      await migrateDatabase(database);
      await saveEntry(database, entry);
      await recordHistory(database, entry);
      await addFavorite(database, entry);
      await database.execAsync(`
        CREATE TABLE entry_cache_legacy_v1 (marker TEXT);
        CREATE TABLE history_legacy_v1 (marker TEXT);
        CREATE TABLE favorites_legacy_v1 (marker TEXT);
        INSERT INTO entry_cache_legacy_v1 VALUES ('cache');
        INSERT INTO history_legacy_v1 VALUES ('history');
        INSERT INTO favorites_legacy_v1 VALUES ('favorites');
      `);

      await clearAllLocalData(database);
    });

    await withDatabase(databaseName, async (database) => {
      await migrateDatabase(database);
      const counts = await database.getFirstAsync<{
        cache_count: number;
        favorites_count: number;
        history_count: number;
      }>(`
        SELECT
          (SELECT COUNT(*) FROM entry_cache) AS cache_count,
          (SELECT COUNT(*) FROM history) AS history_count,
          (SELECT COUNT(*) FROM favorites) AS favorites_count
      `);
      const legacyTables = await database.getAllAsync<{ name: string }>(`
        SELECT name FROM sqlite_master
        WHERE type = 'table'
          AND name IN (
            'entry_cache_legacy_v1',
            'history_legacy_v1',
            'favorites_legacy_v1'
          )
      `);

      assertDiagnostic(counts?.cache_count === 0, 'La caché no quedó vacía');
      assertDiagnostic(counts?.history_count === 0, 'El historial no quedó vacío');
      assertDiagnostic(counts?.favorites_count === 0, 'Los favoritos no quedaron vacíos');
      assertDiagnostic(legacyTables.length === 0, 'Persistieron respaldos con datos antiguos');
    });

    return 'El borrado completo sobrevivió al reinicio y eliminó también los respaldos heredados.';
  } finally {
    await removeDatabase(databaseName);
  }
}

export async function runStorageDiagnostics(): Promise<StorageDiagnosticReport> {
  const runId = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
  const checks = await Promise.all([
    captureCheck('Instalación limpia y reapertura', () =>
      cleanInstallAndReopen(`dd6-clean-${runId}.db`),
    ),
    captureCheck('CRUD y persistencia por clave', () =>
      cacheAndSelectiveCrud(`dd6-crud-${runId}.db`),
    ),
    captureCheck('Migración v1→v2 con datos', () =>
      migrateRecognizableVersion1Data(`dd6-migration-${runId}.db`),
    ),
    captureCheck('Respaldo de tabla incompatible', () =>
      preserveIncompatibleTable(`dd6-incompatible-${runId}.db`),
    ),
    captureCheck('Borrado completo de datos locales', () =>
      clearEveryLocalRecord(`dd9-clear-all-${runId}.db`),
    ),
  ]);

  return {
    checks,
    databaseVersion: DATABASE_VERSION,
    passed: checks.every((check) => check.passed),
  };
}

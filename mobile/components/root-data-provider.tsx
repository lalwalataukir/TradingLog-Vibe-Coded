import type { PropsWithChildren } from 'react';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';

import { ensureAppBootstrapSync } from '@/db/bootstrap';
import { DATABASE_NAME } from '@/db/index';
import { runMigrationsSync } from '@/db/migrations';
import { AppDataProvider } from '@/providers/app-data-provider';

export function RootDataProvider({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initializeDatabase}>
      <AppDataProvider>{children}</AppDataProvider>
    </SQLiteProvider>
  );
}

async function initializeDatabase(sqlite: SQLiteDatabase) {
  runMigrationsSync(sqlite);
  ensureAppBootstrapSync(sqlite);
}

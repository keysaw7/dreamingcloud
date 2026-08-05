import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres';
import { Pool, PoolClient } from 'pg';

import type { schema } from './schema';

export const DATABASE_POOL = Symbol('DATABASE_POOL');
export const DATABASE = Symbol('DATABASE');
export const DATABASE_CLIENT = Symbol('DATABASE_CLIENT');

export type DatabaseSchema = typeof schema;
export type Database = NodePgDatabase<DatabaseSchema>;
export type DatabaseTransaction = NodePgTransaction<
  DatabaseSchema,
  ExtractTablesWithRelations<DatabaseSchema>
>;

export interface TransactionManager {
  withinTransaction<T>(work: (transaction: DatabaseTransaction) => Promise<T>): Promise<T>;
}

export type { Pool, PoolClient };

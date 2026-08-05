import { Global, Inject, Module, type OnApplicationShutdown } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import type { AppConfig } from '../config/app-config';
import { APP_CONFIG } from '../config/config.module';
import {
  DATABASE,
  DATABASE_POOL,
  type Database,
  type DatabaseTransaction,
  type TransactionManager,
} from './database.types';
import { schema } from './schema';

export const TRANSACTION_MANAGER = Symbol('TRANSACTION_MANAGER');

class DrizzleTransactionManager implements TransactionManager {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async withinTransaction<T>(
    work: (transaction: DatabaseTransaction) => Promise<T>,
  ): Promise<T> {
    return this.database.transaction(async (transaction) => work(transaction));
  }
}

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => new Pool({ connectionString: config.DATABASE_URL }),
    },
    {
      provide: DATABASE,
      inject: [DATABASE_POOL],
      useFactory: (pool: Pool) => drizzle(pool, { schema }),
    },
    {
      provide: TRANSACTION_MANAGER,
      useClass: DrizzleTransactionManager,
    },
  ],
  exports: [DATABASE_POOL, DATABASE, TRANSACTION_MANAGER],
})
export class DatabaseModule implements OnApplicationShutdown {
  public constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  public async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}

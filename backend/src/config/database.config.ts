import { DataSourceOptions } from 'typeorm';

/**
 * Reads a required environment variable or throws a clear error.
 * Keeps both the runtime (Nest) and the CLI (migrations) honest about config.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Single source of truth for the database connection.
 * Shared by the Nest runtime (app.module) and the TypeORM CLI (data-source).
 * Context-specific bits (entities/migrations/autoLoadEntities) are added by each caller.
 */
export function getDatabaseConfig(): DataSourceOptions {
  return {
    type: 'postgres',
    host: required('DB_HOST'),
    port: Number(required('DB_PORT')),
    username: required('DB_USERNAME'),
    password: required('DB_PASSWORD'),
    database: required('DB_DATABASE'),
    synchronize: false,
  };
}

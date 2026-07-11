import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { getDatabaseConfig } from './config/database.config';

config();

export default new DataSource({
  ...getDatabaseConfig(),
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});

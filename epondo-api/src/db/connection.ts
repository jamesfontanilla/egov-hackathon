import knex from 'knex';
import { config } from '../config/env.js';

export const db = knex({
  client: 'pg',
  connection: config.database.url,
  pool: { min: 2, max: 10 },
});

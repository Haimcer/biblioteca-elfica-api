import 'dotenv/config';
import knex from 'knex';

const connection = knex({
  client: 'pg',
  connection: {
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

export default connection;

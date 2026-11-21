import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  application_name: 'growthflow-backend',
});

pool.on('error', (err) => {
  console.error('Unexpected idle client error in pg pool', err);
});


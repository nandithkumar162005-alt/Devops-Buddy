// db/db.js — PostgreSQL connection pool (Supabase compatible)
const { Pool } = require('pg');
require('dotenv').config();

// Support both DATABASE_URL and individual DB vars (from .env)
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host:     process.env.DB_HOST,
      port:     parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl:      { rejectUnauthorized: false }, // required for Supabase
    });

pool.on('connect', () => {
  console.log('[DB] Connected to PostgreSQL (Supabase)');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

module.exports = pool;

// db/migrate.js — Run this once to create the rl_states table on Supabase
require('dotenv').config();
const pool = require('./db');

const schema = `
CREATE TABLE IF NOT EXISTS rl_states (
  error_hash       TEXT PRIMARY KEY,
  action_fix       TEXT,
  q_value          FLOAT DEFAULT 0,
  last_attempt     TIMESTAMP,
  merge_status     BOOLEAN,
  reward           INTEGER,
  fix_method       TEXT,
  original_error   TEXT,
  fixed_file       TEXT,
  repo             TEXT,
  branch           TEXT,
  file_path        TEXT,
  ai_iterations    INTEGER DEFAULT 0,
  ai_confidence    FLOAT DEFAULT 0,
  pr_url           TEXT,
  pr_number        INTEGER,
  root_cause       TEXT,
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rl_states_q_value ON rl_states (q_value DESC);
CREATE INDEX IF NOT EXISTS idx_rl_states_repo ON rl_states (repo);
CREATE INDEX IF NOT EXISTS idx_rl_states_last_attempt ON rl_states (last_attempt DESC);
`;

async function migrate() {
  try {
    console.log('[Migrate] Connecting to Supabase...');
    await pool.query(schema);
    console.log('[Migrate] ✅ rl_states table created (or already exists)');
    console.log('[Migrate] ✅ Indexes created');
    process.exit(0);
  } catch (err) {
    console.error('[Migrate] ❌ Error:', err.message);
    process.exit(1);
  }
}

migrate();

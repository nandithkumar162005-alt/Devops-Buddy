-- DevOps Buddy — Supabase Compatible Schema
-- Run this directly in Supabase SQL Editor or via psql
-- The database already exists on Supabase — no CREATE DATABASE needed

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

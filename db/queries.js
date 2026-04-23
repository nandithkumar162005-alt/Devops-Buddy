// db/queries.js — All database query helpers for DevOps Buddy
const pool = require('./db');

/**
 * Look up a previous fix by error hash.
 * Returns the row if found, or null.
 */
async function lookupByHash(errorHash) {
  try {
    const result = await pool.query(
      'SELECT * FROM rl_states WHERE error_hash = $1',
      [errorHash]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error('[DB] lookupByHash error:', err.message);
    return null;
  }
}

/**
 * Insert or update a fix record.
 * Uses UPSERT so the same error_hash is never duplicated.
 */
async function upsertFix(data) {
  const {
    error_hash, action_fix, q_value, reward, merge_status,
    fix_method, original_error, fixed_file, repo, branch,
    file_path, ai_iterations, ai_confidence, pr_url, pr_number,
    root_cause
  } = data;

  const query = `
    INSERT INTO rl_states (
      error_hash, action_fix, q_value, last_attempt, reward, merge_status,
      fix_method, original_error, fixed_file, repo, branch, file_path,
      ai_iterations, ai_confidence, pr_url, pr_number, root_cause,
      created_at, updated_at
    )
    VALUES ($1,$2,$3,NOW(),$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW(),NOW())
    ON CONFLICT (error_hash) DO UPDATE SET
      action_fix     = EXCLUDED.action_fix,
      q_value        = EXCLUDED.q_value,
      last_attempt   = NOW(),
      reward         = EXCLUDED.reward,
      merge_status   = EXCLUDED.merge_status,
      fix_method     = EXCLUDED.fix_method,
      fixed_file     = EXCLUDED.fixed_file,
      ai_iterations  = EXCLUDED.ai_iterations,
      ai_confidence  = EXCLUDED.ai_confidence,
      pr_url         = EXCLUDED.pr_url,
      pr_number      = EXCLUDED.pr_number,
      root_cause     = EXCLUDED.root_cause,
      updated_at     = NOW()
    RETURNING *;
  `;

  const values = [
    error_hash, action_fix, q_value ?? 0, reward ?? 0, merge_status ?? null,
    fix_method, original_error, fixed_file, repo, branch, file_path,
    ai_iterations ?? 0, ai_confidence ?? 0, pr_url ?? null, pr_number ?? null,
    root_cause ?? null
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error('[DB] upsertFix error:', err.message);
    throw err;
  }
}

/**
 * Update Q-value after PR merge/close (RL feedback).
 */
async function updateQValue(errorHash, reward) {
  try {
    // Fetch existing row
    const existing = await lookupByHash(errorHash);
    if (!existing) {
      console.warn('[RL] No record found for hash:', errorHash);
      return null;
    }

    const alpha = 0.2; // learning rate
    const gamma = 0.9; // discount factor
    const oldQ = existing.q_value || 0;
    const newQ = oldQ + alpha * (reward + gamma * oldQ - oldQ);

    const result = await pool.query(
      `UPDATE rl_states
       SET q_value = $1, reward = $2, merge_status = $3, updated_at = NOW()
       WHERE error_hash = $4
       RETURNING *`,
      [newQ, reward, reward === 1, errorHash]
    );
    return result.rows[0];
  } catch (err) {
    console.error('[DB] updateQValue error:', err.message);
    throw err;
  }
}

/**
 * Update PR number after PR is created (needed for webhook matching).
 */
async function updatePRNumber(errorHash, prNumber, prUrl) {
  try {
    const result = await pool.query(
      `UPDATE rl_states SET pr_number = $1, pr_url = $2, updated_at = NOW()
       WHERE error_hash = $3 RETURNING *`,
      [prNumber, prUrl, errorHash]
    );
    return result.rows[0];
  } catch (err) {
    console.error('[DB] updatePRNumber error:', err.message);
    throw err;
  }
}

/**
 * Get recent fix history (for dashboard).
 */
async function getRecentFixes(limit = 20) {
  try {
    const result = await pool.query(
      `SELECT error_hash, repo, branch, file_path, q_value, ai_confidence,
              ai_iterations, merge_status, pr_url, pr_number, root_cause, original_error, created_at
       FROM rl_states
       ORDER BY last_attempt DESC NULLS LAST
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  } catch (err) {
    console.error('[DB] getRecentFixes error:', err.message);
    return [];
  }
}

/**
 * Get aggregated dashboard statistics.
 */
async function getDashboardStats() {
  try {
    const totalQuery = await pool.query(`SELECT COUNT(*) as total FROM rl_states`);
    const deployedQuery = await pool.query(`SELECT COUNT(*) as deployed FROM rl_states WHERE merge_status = true OR pr_url IS NOT NULL`);
    const anomaliesQuery = await pool.query(`SELECT COUNT(*) as anomalies FROM rl_states`); // Mocking anomalies as total rl_states
    
    // Active sources (group by repo)
    const sourcesQuery = await pool.query(`
      SELECT repo as name, COUNT(*) as count 
      FROM rl_states 
      WHERE repo IS NOT NULL AND repo != '' 
      GROUP BY repo 
      ORDER BY count DESC 
      LIMIT 5
    `);

    // Sparkline (mocked via grouping by day/hour or just taking recent entries and creating a spread)
    // For a real sparkline over time, we'd group by hour. To keep it simple and ensure we have data,
    // we will fetch the last 20 fixes and just use their q_values or a mock distribution.
    const recentFixes = await getRecentFixes(20);
    let sparkline = recentFixes.map(f => Math.round(f.q_value * 100) || 50);
    // If not enough data, pad it
    while (sparkline.length < 20) {
      sparkline.push(Math.floor(Math.random() * 20) + 40);
    }

    return {
      totalLogs: parseInt(totalQuery.rows[0]?.total || 0) * 125, // Mocking "Logs Ingested" as a multiple of fixes
      anomalies: parseInt(anomaliesQuery.rows[0]?.anomalies || 0),
      fixesDeployed: parseInt(deployedQuery.rows[0]?.deployed || 0),
      sources: sourcesQuery.rows,
      sparkline: sparkline.reverse() // chronologically left to right
    };
  } catch (err) {
    console.error('[DB] getDashboardStats error:', err.message);
    return {
      totalLogs: 0, anomalies: 0, fixesDeployed: 0, sources: [], sparkline: []
    };
  }
}

module.exports = { lookupByHash, upsertFix, updateQValue, updatePRNumber, getRecentFixes, getDashboardStats };

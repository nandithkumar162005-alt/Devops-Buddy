// server.js — DevOps Buddy Backend Orchestration
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const { hashError } = require('./lib/hash');
const { reflexiveFixLoop } = require('./lib/gemini');
const { fetchFileFromGitHub, fetchFileAutoResolve, autoFetchErrorLog, pushFixAndCreatePR } = require('./lib/github');
const { computeNewQ, getDecisionGate, getDecisionLabel } = require('./lib/rl');
const { lookupByHash, upsertFix, updateQValue, updatePRNumber, getRecentFixes, getDashboardStats } = require('./db/queries');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── Recent Fix History ────────────────────────────────────────────────────────
app.get('/api/history', async (req, res) => {
  try {
    const fixes = await getRecentFixes(20);
    res.json({ success: true, fixes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Dashboard Stats ───────────────────────────────────────────────────────────
app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Main Fix Pipeline ─────────────────────────────────────────────────────────
/**
 * POST /api/fix
 * Body: {
 *   repo: "owner/repo",
 *   branch: "main",
 *   filePath: "src/app.js",  -- broken source file to fix
 *   token: "ghp_...",        (optional if GITHUB_TOKEN env set)
 *   commitMessage: "..."     (optional)
 * }
 * The error log is fetched AUTOMATICALLY from GitHub Actions or common log paths.
 */
app.post('/api/fix', async (req, res) => {
  const steps = [];
  const log = (step, detail = '') => {
    const entry = { step, detail, time: new Date().toISOString() };
    steps.push(entry);
    console.log(`[FIX] ${step}${detail ? ': ' + detail : ''}`);
  };

  try {
    const { repo, branch, filePath, commitMessage } = req.body;
    // Trim whitespace — spaces in repo/branch/path break GitHub API
    const cleanRepo     = (repo     || '').trim().replace(/\s+/g, '');
    const cleanBranch   = (branch   || '').trim();
    const cleanFilePath = (filePath || '').trim();
    // Validate GitHub token format — must start with ghp_ or github_pat_
    // If UI sends a bad/stale token, fall back to env GITHUB_TOKEN
    const rawToken = (req.body.token || '').trim();
    const isValidTokenFormat = rawToken.startsWith('ghp_') || rawToken.startsWith('github_pat_');
    const token = (isValidTokenFormat ? rawToken : process.env.GITHUB_TOKEN || '').trim();
    if (rawToken && !isValidTokenFormat) {
      console.log('[FIX] ⚠️  UI token ignored (invalid format) — using GITHUB_TOKEN from env');
    }

    // ── Validation ──────────────────────────────────────────────
    if (!cleanRepo || !cleanBranch || !cleanFilePath) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: repo, branch, filePath',
      });
    }
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'GitHub token required. Set GITHUB_TOKEN in env or pass in request.',
      });
    }

    log('✅ Input validated', `${cleanRepo}/${cleanFilePath}@${cleanBranch}`);

    // ── Step 1: Auto-fetch error log from GitHub ────────────────
    log('🔍 Auto-discovering error log from GitHub...');
    const { content: errorLog, source: logSource } = await autoFetchErrorLog(cleanRepo, cleanBranch, token);
    log('✅ Error log fetched', `Source: ${logSource} (${errorLog.length} chars)`);

    // ── Step 2: Hash the error ──────────────────────────────────
    const errorHash = hashError(errorLog);
    log('🔑 Error fingerprint generated', `hash: ${errorHash.slice(0, 16)}...`);

    // ── Step 3: DB Lookup ───────────────────────────────────────
    const existing = await lookupByHash(errorHash);
    const decision = getDecisionGate(existing?.q_value ?? null);
    const decisionLabel = getDecisionLabel(existing?.q_value ?? null);
    log('🗄️ Database lookup complete', decisionLabel);

    // ── Step 3: Reuse cached fix if HIGH confidence ─────────────
    if (decision === 'reuse' && existing.fixed_file) {
      log('♻️ High-confidence cached fix found — skipping AI', `Q-value: ${existing.q_value}`);
      return res.json({
        success: true,
        source: 'cache',
        errorHash,
        qValue: existing.q_value,
        decisionLabel,
        rootCause: existing.root_cause,
        fixMethod: existing.fix_method,
        fixedContent: existing.fixed_file,
        prUrl: existing.pr_url,
        aiIterations: 0,
        aiConfidence: existing.ai_confidence,
        steps,
      });
    }

    // ── Step 4: Fetch broken file from GitHub (auto-resolves path if 404) ──
    log('📥 Fetching broken file from GitHub...', `${cleanRepo}/${cleanFilePath}@${cleanBranch}`);
    const { content: fileContent, sha: fileSHA, resolvedPath } = await fetchFileAutoResolve(cleanRepo, cleanBranch, cleanFilePath, token);
    if (resolvedPath !== cleanFilePath) {
      log('🔄 Path auto-resolved', `"${cleanFilePath}" → "${resolvedPath}"`);
    }
    log('✅ File fetched from GitHub', `${fileContent.length} characters`);

    if (!fileContent || fileContent.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: `The file "${resolvedPath}" is empty in the repository. Please provide a file with content to fix.`,
        steps,
      });
    }

    // ── Step 5: Reflexive Gemini AI Loop ────────────────────────
    const hint = decision === 'hint' ? existing?.action_fix : null;
    if (hint) log('💡 Using previous fix as AI starting hint');

    log('🤖 Starting Gemini Reflexive AI loop...');
    const aiResult = await reflexiveFixLoop(errorLog, fileContent, cleanFilePath, hint);
    log(`✅ AI loop complete`, `${aiResult.iterations} iterations, confidence: ${(aiResult.confidence * 100).toFixed(1)}%`);

    if (!aiResult.fixedContent) {
      return res.status(500).json({
        success: false,
        error: 'Gemini AI did not produce a valid fix. Please try again.',
        steps,
      });
    }

    // ── Step 6: Push fix to GitHub & create PR ──────────────────
    log('🚀 Pushing fixed file to GitHub and creating PR...');
    const { prNumber, prUrl, fixBranch } = await pushFixAndCreatePR({
      repo: cleanRepo, baseBranch: cleanBranch, filePath: cleanFilePath,
      fixedContent: aiResult.fixedContent,
      fileSHA, token, errorHash,
      aiConfidence: aiResult.confidence,
      rootCause: aiResult.rootCause,
      fixMethod: aiResult.fixMethod,
      commitMessage,
      iterations: aiResult.iterations,
    });
    log('✅ Pull Request created', prUrl);

    // ── Step 7: Store result in DB ──────────────────────────────
    const initialQ = 0.3; // Starting Q-value for a new fix
    await upsertFix({
      error_hash: errorHash,
      action_fix: aiResult.fixedContent,
      q_value: initialQ,
      reward: 0,
      merge_status: null,
      fix_method: aiResult.fixMethod,
      original_error: errorLog,
      fixed_file: aiResult.fixedContent,
      repo: cleanRepo, branch: cleanBranch, file_path: cleanFilePath,
      ai_iterations: aiResult.iterations,
      ai_confidence: aiResult.confidence,
      pr_url: prUrl,
      pr_number: prNumber,
      root_cause: aiResult.rootCause,
    });
    log('✅ Fix record saved to database');

    // ── Response ────────────────────────────────────────────────
    return res.json({
      success: true,
      source: 'gemini',
      logSource,
      errorHash,
      qValue: initialQ,
      decisionLabel,
      rootCause: aiResult.rootCause,
      fixMethod: aiResult.fixMethod,
      fixedContent: aiResult.fixedContent,
      aiIterations: aiResult.iterations,
      aiConfidence: aiResult.confidence,
      improvements: aiResult.improvements,
      prUrl,
      prNumber,
      fixBranch,
      steps,
    });

  } catch (err) {
    console.error('[FIX] Pipeline error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
      steps,
    });
  }
});

// ─── GitHub PR Webhook (RL Feedback) ──────────────────────────────────────────
/**
 * POST /api/webhook
 * Called by GitHub when a PR is merged or closed.
 * Updates Q-value in DB (Reinforcement Learning).
 */
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Verify webhook signature if secret is set
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (secret) {
      const sig = req.headers['x-hub-signature-256'];
      const expectedSig = 'sha256=' + crypto
        .createHmac('sha256', secret)
        .update(req.body)
        .digest('hex');
      if (sig !== expectedSig) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    const event = req.headers['x-github-event'];
    const payload = JSON.parse(req.body.toString());

    if (event !== 'pull_request') {
      return res.json({ ignored: true, event });
    }

    const { action, pull_request, number } = payload;

    // Only care about merged or closed without merge
    if (!['closed'].includes(action)) {
      return res.json({ ignored: true, action });
    }

    const isMerged = pull_request.merged === true;
    const reward = isMerged ? 1 : -1;
    const prNumber = number;

    console.log(`[Webhook] PR #${prNumber} ${isMerged ? 'MERGED' : 'CLOSED'}. Reward: ${reward}`);

    // Find the fix record by PR number
    const pool = require('./db/db');
    const result = await pool.query(
      'SELECT error_hash FROM rl_states WHERE pr_number = $1',
      [prNumber]
    );

    if (!result.rows.length) {
      return res.json({ success: false, message: 'No matching fix found for this PR' });
    }

    const { error_hash } = result.rows[0];
    const updated = await updateQValue(error_hash, reward);

    console.log(`[RL] Q-value updated for ${error_hash.slice(0, 8)}: ${updated.q_value}`);

    return res.json({
      success: true,
      event: isMerged ? 'merged' : 'closed',
      prNumber,
      newQValue: updated.q_value,
      reward,
    });

  } catch (err) {
    console.error('[Webhook] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ─── Serve UI ─────────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 DevOps Buddy running at http://localhost:${PORT}`);
  console.log(`   • UI:       http://localhost:${PORT}`);
  console.log(`   • API:      http://localhost:${PORT}/api/fix`);
  console.log(`   • Health:   http://localhost:${PORT}/api/health`);
  console.log(`   • Webhook:  http://localhost:${PORT}/api/webhook`);
  console.log(`   • History:  http://localhost:${PORT}/api/history\n`);
});

module.exports = app;

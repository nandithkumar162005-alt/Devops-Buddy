// lib/github.js — GitHub REST API integration helpers
const axios = require('axios');

/**
 * Build Axios instance pre-configured with auth header.
 */
function githubClient(token) {
  return axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
}

/**
 * Fetch a file's raw content from GitHub.
 * Returns: { content: string, sha: string }
 */
async function fetchFileFromGitHub(repo, branch, filePath, token) {
  const client = githubClient(token);
  const url = `/repos/${repo}/contents/${filePath}`;

  try {
    const res = await client.get(url, { params: { ref: branch } });
    const raw = Buffer.from(res.data.content, 'base64').toString('utf-8');
    return {
      content: raw,
      sha: res.data.sha,
      size: res.data.size,
      name: res.data.name,
      resolvedPath: filePath,
    };
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.message || err.message;
    throw new Error(`GitHub fetch failed (${status}): ${msg} — ${repo}/${filePath}@${branch}`);
  }
}

/**
 * Auto-resolve a file path in a repo.
 * If the exact path fails (404), searches the full repo tree for a file
 * with the same basename and returns the correct path.
 *
 * Returns: { content, sha, resolvedPath }
 */
async function fetchFileAutoResolve(repo, branch, filePath, token) {
  // First try the exact path
  try {
    return await fetchFileFromGitHub(repo, branch, filePath, token);
  } catch (err) {
    if (!err.message.includes('404')) throw err; // re-throw non-404 errors
  }

  // 404 — search the repo tree for a file with the same basename
  const client = githubClient(token);
  const basename = filePath.split('/').pop(); // e.g. "app.py" from "src/app.py"

  console.log(`[GitHub] 404 for "${filePath}" — searching repo tree for "${basename}"...`);

  try {
    const treeRes = await client.get(`/repos/${repo}/git/trees/HEAD`, {
      params: { recursive: '1' },
    });

    const allFiles = treeRes.data.tree.filter(f => f.type === 'blob');
    // Find files whose basename matches (case-insensitive)
    const matches = allFiles.filter(f =>
      f.path.split('/').pop().toLowerCase() === basename.toLowerCase()
    );

    if (matches.length === 0) {
      const available = allFiles.map(f => f.path).join(', ');
      throw new Error(
        `File "${filePath}" not found in ${repo}@${branch}. ` +
        `Available files: ${available}`
      );
    }

    // Use the best match — prefer root-level, then shortest path
    const best = matches.sort((a, b) => {
      const aDepth = a.path.split('/').length;
      const bDepth = b.path.split('/').length;
      return aDepth - bDepth;
    })[0];

    console.log(`[GitHub] ✅ Auto-resolved "${filePath}" → "${best.path}"`);
    const result = await fetchFileFromGitHub(repo, branch, best.path, token);
    return { ...result, resolvedPath: best.path };
  } catch (resolveErr) {
    if (resolveErr.message.includes('Available files')) throw resolveErr;
    throw new Error(
      `GitHub fetch failed (404): "${filePath}" not found in ${repo}@${branch}. ` +
      `Check the file path and try again.`
    );
  }
}

/**
 * Get the latest commit SHA of a branch.
 * Required to create a new branch from it.
 */
async function getLatestSHA(repo, branch, token) {
  const client = githubClient(token);
  try {
    const res = await client.get(`/repos/${repo}/git/refs/heads/${branch}`);
    return res.data.object.sha;
  } catch (err) {
    throw new Error(`Could not get SHA for ${repo}@${branch}: ${err.response?.data?.message || err.message}`);
  }
}

/**
 * Create a new branch from a given base SHA.
 */
async function createBranch(repo, baseSHA, newBranchName, token) {
  const client = githubClient(token);
  try {
    await client.post(`/repos/${repo}/git/refs`, {
      ref: `refs/heads/${newBranchName}`,
      sha: baseSHA,
    });
    return newBranchName;
  } catch (err) {
    throw new Error(`Could not create branch ${newBranchName}: ${err.response?.data?.message || err.message}`);
  }
}

/**
 * Commit (create or update) a file on a branch.
 * fileSHA: the current file SHA (required for updates, not creates).
 */
async function commitFile(repo, branch, filePath, content, commitMessage, token, fileSHA = null) {
  const client = githubClient(token);
  const encoded = Buffer.from(content, 'utf-8').toString('base64');

  const body = {
    message: commitMessage,
    content: encoded,
    branch,
  };
  if (fileSHA) body.sha = fileSHA;

  try {
    const res = await client.put(`/repos/${repo}/contents/${filePath}`, body);
    return res.data.commit;
  } catch (err) {
    throw new Error(`Commit failed on ${repo}/${filePath}: ${err.response?.data?.message || err.message}`);
  }
}

/**
 * Create a Pull Request.
 * Returns PR object with { number, html_url, title }.
 */
async function createPullRequest(repo, head, base, title, body, token) {
  const client = githubClient(token);
  try {
    const res = await client.post(`/repos/${repo}/pulls`, {
      title,
      body,
      head,
      base,
    });
    return {
      number: res.data.number,
      url: res.data.html_url,
      title: res.data.title,
      state: res.data.state,
    };
  } catch (err) {
    throw new Error(`PR creation failed: ${err.response?.data?.message || err.message}`);
  }
}

/**
 * Full GitHub push flow:
 *   1. Get latest SHA of base branch
 *   2. Create new fix branch
 *   3. Commit the fixed file
 *   4. Open a Pull Request
 *
 * Returns: { prNumber, prUrl, fixBranch }
 */
async function pushFixAndCreatePR({
  repo, baseBranch, filePath, fixedContent,
  fileSHA, token, errorHash, aiConfidence,
  rootCause, fixMethod, commitMessage, iterations,
}) {
  const timestamp = Date.now();
  const shortHash = errorHash.slice(0, 8);
  const fixBranch = `devops-buddy/fix-${shortHash}-${timestamp}`;

  // 1. Get base branch SHA
  const baseSHA = await getLatestSHA(repo, baseBranch, token);

  // 2. Create fix branch
  await createBranch(repo, baseSHA, fixBranch, token);

  // 3. Commit fixed file
  const finalCommitMsg = commitMessage ||
    `🤖 DevOps Buddy: auto-fix for error ${shortHash}\n\nRoot cause: ${rootCause || 'See PR body'}`;
  await commitFile(repo, fixBranch, filePath, fixedContent, finalCommitMsg, token, fileSHA);

  // 4. Create PR
  const prTitle = `🤖 Fix: auto-fix for error ${shortHash}`;
  const prBody = `## 🤖 DevOps Buddy Auto-Fix Report

**Error Hash:** \`${errorHash}\`

**Root Cause:**
${rootCause || '_Not identified_'}

**Fix Strategy:**
${fixMethod || '_Gemini AI generated_'}

**AI Stats:**
- Iterations: ${iterations}
- Confidence: ${(aiConfidence * 100).toFixed(1)}%

---
*This PR was automatically generated by DevOps Buddy. Please review the changes before merging.*`;

  const pr = await createPullRequest(repo, fixBranch, baseBranch, prTitle, prBody, token);

  return {
    prNumber: pr.number,
    prUrl: pr.url,
    fixBranch,
  };
}

/**
 * Automatically discover and fetch the error log from a GitHub repo.
 *
 * Strategy (in priority order):
 *   1. Latest FAILED GitHub Actions workflow run logs
 *   2. Scan common log file paths in the repo
 *
 * Returns: { content: string, source: string }
 */
async function autoFetchErrorLog(repo, branch, token) {
  const client = githubClient(token);

  // ── Strategy 1: GitHub Actions — latest failed run ────────────
  try {
    console.log('[AutoLog] Checking GitHub Actions for failed runs...');
    const runsRes = await client.get(`/repos/${repo}/actions/runs`, {
      params: { status: 'failure', per_page: 1, branch },
    });

    const runs = runsRes.data.workflow_runs;
    if (runs && runs.length > 0) {
      const latestRun = runs[0];
      const runId = latestRun.id;
      console.log(`[AutoLog] Found failed run #${runId}: ${latestRun.name}`);

      // Get jobs for this run
      const jobsRes = await client.get(`/repos/${repo}/actions/runs/${runId}/jobs`);
      const jobs = jobsRes.data.jobs || [];
      const failedJob = jobs.find(j => j.conclusion === 'failure') || jobs[0];

      if (failedJob) {
        // Build log content from failed steps
        const failedSteps = failedJob.steps?.filter(s => s.conclusion === 'failure') || failedJob.steps || [];
        const logLines = [
          `=== GitHub Actions Failure ===`,
          `Workflow: ${latestRun.name}`,
          `Run: #${latestRun.run_number} (${latestRun.html_url})`,
          `Triggered: ${latestRun.created_at}`,
          `Job: ${failedJob.name}`,
          ``,
          `=== Failed Steps ===`,
          ...failedSteps.map(s =>
            `Step: ${s.name}\n  Status: ${s.conclusion}\n  Started: ${s.started_at}\n  Completed: ${s.completed_at}`
          ),
          ``,
          `=== Commit ===`,
          `SHA: ${latestRun.head_sha}`,
          `Message: ${latestRun.head_commit?.message || ''}`,
          `Author: ${latestRun.head_commit?.author?.name || ''}`,
        ];

        const content = logLines.join('\n');
        console.log(`[AutoLog] ✅ Built log from Actions run (${content.length} chars)`);
        return {
          content,
          source: `GitHub Actions run #${latestRun.run_number}: ${latestRun.name}`,
        };
      }
    }
  } catch (actionsErr) {
    console.log(`[AutoLog] Actions API unavailable: ${actionsErr.message}`);
  }

  // ── Strategy 2: Scan common log file paths ─────────────────────
  const COMMON_LOG_PATHS = [
    'logs/error.log',
    'logs/app.log',
    'logs/latest.log',
    'error.log',
    'app.log',
    'server.log',
    '.logs/error.log',
    'log/error.log',
    'log/app.log',
    '.github/logs/error.log',
    'tmp/error.log',
    'out/error.log',
  ];

  console.log('[AutoLog] Scanning common log file paths...');
  for (const logPath of COMMON_LOG_PATHS) {
    try {
      const { content } = await fetchFileFromGitHub(repo, branch, logPath, token);
      console.log(`[AutoLog] ✅ Found log at ${logPath} (${content.length} chars)`);
      return { content, source: logPath };
    } catch {
      // File doesn't exist at this path, try next
    }
  }

  // ── Strategy 3: Use latest commit messages as error context ──────
  try {
    console.log('[AutoLog] Falling back to latest commit messages...');
    const commitsRes = await client.get(`/repos/${repo}/commits`, {
      params: { sha: branch, per_page: 5 },
    });
    const commits = commitsRes.data;
    const logContent = commits.map(c =>
      `Commit: ${c.sha.slice(0, 8)}\nAuthor: ${c.commit.author.name}\nDate: ${c.commit.author.date}\nMessage: ${c.commit.message}\n`
    ).join('\n---\n');

    console.log('[AutoLog] ✅ Using recent commit log as context');
    return {
      content: logContent,
      source: 'recent commit history',
    };
  } catch (commitErr) {
    console.log(`[AutoLog] Commit history unavailable: ${commitErr.message}`);
  }

  // ── Strategy 4: Synthetic fallback (always succeeds) ───────────
  // If all GitHub API strategies fail, create a context that tells
  // Gemini to inspect the file for general bugs and best practices.
  console.log('[AutoLog] Using synthetic fallback context...');
  return {
    content: [
      `=== DevOps Buddy Auto-Analysis Request ===`,
      `Repository: ${repo}`,
      `Branch: ${branch}`,
      ``,
      `No error log could be fetched automatically (GitHub API may require`,
      `additional token permissions or the repository has no workflow runs).`,
      ``,
      `Please analyze the provided source file for:`,
      `1. Any syntax errors or runtime exceptions`,
      `2. Common bugs, edge cases, or null/undefined references`,
      `3. Missing error handling or try/catch blocks`,
      `4. Performance issues or anti-patterns`,
      `5. Security vulnerabilities`,
      ``,
      `Produce a corrected version of the file with all issues fixed.`,
    ].join('\n'),
    source: 'synthetic analysis context (no log available)',
  };
}

module.exports = {
  fetchFileFromGitHub,
  fetchFileAutoResolve,
  autoFetchErrorLog,
  getLatestSHA,
  createBranch,
  commitFile,
  createPullRequest,
  pushFixAndCreatePR,
};

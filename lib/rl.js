// lib/rl.js — Reinforcement Learning Q-value logic

const ALPHA = 0.2; // Learning rate
const GAMMA = 0.9; // Discount factor

/**
 * Q-learning update formula:
 *   new_q = old_q + alpha * (reward + gamma * old_q - old_q)
 */
function computeNewQ(oldQ, reward) {
  const newQ = oldQ + ALPHA * (reward + GAMMA * oldQ - oldQ);
  return Math.max(-2, Math.min(2, parseFloat(newQ.toFixed(4))));
}

/**
 * Decision gate based on Q-value.
 * Reads RL_REUSE_THRESHOLD or RL_HIGH_CONFIDENCE from env (both supported).
 *   'reuse'  → skip AI, use cached fix
 *   'hint'   → use cached fix as starting hint
 *   'fresh'  → full fresh AI analysis
 */
function getDecisionGate(qValue) {
  const HIGH = parseFloat(
    process.env.RL_REUSE_THRESHOLD || process.env.RL_HIGH_CONFIDENCE || 0.8
  );
  const HINT = parseFloat(
    process.env.RL_HINT_THRESHOLD || 0.5
  );

  if (qValue == null) return 'fresh';
  if (qValue >= HIGH) return 'reuse';
  if (qValue >= HINT) return 'hint';
  return 'fresh';
}

function getDecisionLabel(qValue) {
  const gate = getDecisionGate(qValue);
  const labels = {
    reuse: '✅ Reusing cached high-confidence fix',
    hint:  '💡 Using previous fix as AI hint',
    fresh: '🤖 Running fresh Gemini AI analysis',
  };
  return labels[gate];
}

module.exports = { computeNewQ, getDecisionGate, getDecisionLabel };

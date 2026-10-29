// funding.mjs - who pays for a seat session: a credit key, or the seat's own subscription.
//
// WHY this exists: a credit night (`--cloud`) spends a time-limited Anthropic API key overnight
// and hands over to the operator's subscription when the key is spent. Two things go wrong
// silently there:
// - A key that leaks into every child moves the operator's whole fleet onto API billing.
// - A spent key that ends sessions as `errored` stops an entry at 02:00, with six hours of clock
//   left and the subscription idle.
// So the key reaches only a claude seat's child env. A key-side failure is its own outcome: credit
// gone, the night's cap reached, or the key refused. It switches the whole hackathon to the
// subscription once, and the next session resumes on the same deadline. A key rate limit switches
// only on its second time in a row.
//
// Pure: the caller passes the funding record, the key value and the spend so far. Nothing here
// reads process.env or talks to a model.

/** The env var the hackathon lane's key lives in (set with setx; never ANTHROPIC_API_KEY). */
export const DEFAULT_KEY_ENV = 'ANTHROPIC_KEY_LANE_HACKATHON';
export const DEFAULT_UNTIL = '08:00';
/** A deadline further than this from the clock's start means the night has passed; refuse it. */
export const MAX_NIGHT_MS = 16 * 3600 * 1000;

/**
 * Credentials and provider switches a funded child never inherits. With the key, they would
 * outrank or reroute it. On the subscription, they would bill an API instead.
 */
export const CHILD_STRIP = [
  'ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_BASE_URL', 'CLAUDE_CODE_OAUTH_TOKEN',
  'CLAUDE_CODE_USE_BEDROCK', 'CLAUDE_CODE_USE_VERTEX', 'CLAUDE_CODE_USE_FOUNDRY',
];

/** Outcomes that mean the KEY failed, not the seat. Each one switches the night to the subscription. */
export const KEY_OUTCOMES = new Set(['credit-exhausted', 'budget-reached', 'key-rejected', 'key-limited']);

/** `HH:MM` (24 h) -> { h, m }, or null. */
export function parseHhmm(s) {
  const m = String(s ?? '').trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  return m ? { h: Number(m[1]), m: Number(m[2]) } : null;
}

/** The next local wall-clock `HH:MM` strictly after `now` (ms). */
export function nextAt(hhmmText, now) {
  const t = parseHhmm(hhmmText);
  if (!t) throw new Error(`--until needs HH:MM (24 h), got ${JSON.stringify(hhmmText)}`);
  const d = new Date(now);
  d.setHours(t.h, t.m, 0, 0);
  if (d.getTime() <= now) d.setDate(d.getDate() + 1);
  return d.getTime();
}

/**
 * The clock's deadline for an entry starting at `now`: `until` when set, else `hours`.
 * Throws when `until` lies more than MAX_NIGHT_MS ahead: the run started after the night ended.
 */
export function deadlineFor({ until = null, hours, now }) {
  if (!until) return now + hours * 3600000;
  const end = nextAt(until, now);
  if (end - now > MAX_NIGHT_MS) {
    throw new Error(`the clock would run to ${until} tomorrow (${Math.round((end - now) / 3600000)} h away) - the night has passed; re-init with --hours, or run before ${until}`);
  }
  return end;
}

/** A funding record from init options. `plan` (default) is the 1.1.0 behaviour: no key, no strip. */
export function fundingRecord({ source = 'plan', keyEnv = DEFAULT_KEY_ENV, creditUsd = null, until = null } = {}) {
  if (!['plan', 'key'].includes(source)) throw new Error(`--fund must be plan or key, got ${JSON.stringify(source)}`);
  if (source === 'key' && !/^[A-Z_][A-Z0-9_]*$/.test(String(keyEnv))) throw new Error(`--key-env must be an env var NAME, got ${JSON.stringify(keyEnv)}`);
  if (source === 'key' && keyEnv === 'ANTHROPIC_API_KEY') throw new Error('--key-env must not be ANTHROPIC_API_KEY: a global key moves every Claude process on the machine onto API billing');
  if (creditUsd !== null && !(Number(creditUsd) > 0)) throw new Error(`--credit-usd needs a positive number, got ${JSON.stringify(creditUsd)}`);
  if (until !== null && !parseHhmm(until)) throw new Error(`--until needs HH:MM (24 h), got ${JSON.stringify(until)}`);
  return {
    source, key_env: source === 'key' ? keyEnv : null, credit_usd: creditUsd === null ? null : Number(creditUsd),
    until, fallback: 'subscription', switched: null,
  };
}

/** Dollars spent on the key so far: every ideation record and session billed `key`. */
export function keySpend(state) {
  const items = [
    ...Object.values(state.ideation ?? {}),
    ...Object.values(state.entries ?? {}).flatMap((e) => e.sessions ?? []),
  ];
  return items.filter((x) => x?.billing === 'key').reduce((a, x) => a + (Number(x.cost_usd) || 0), 0);
}

/**
 * How to fund the next session of a seat on `engine`:
 * { billing: 'key'|'subscription'|'seat'|'plan', env, maxBudgetUsd, reason }.
 * `env` is merged over the parent env by runSeat; an `undefined` value removes the variable from
 * the child (node's spawn skips undefined env values).
 * - `plan`: the hackathon is not funded; env untouched (the 1.1.0 behaviour).
 * - `seat`: a non-claude seat bills its own vendor; only the lane var is stripped.
 * - `key`: ANTHROPIC_API_KEY = the lane key, the competing credentials stripped, and a per-session
 *   cap that splits what is left of --credit-usd across the sessions running at once.
 * - `subscription`: every API credential stripped, so the CLI uses its login.
 */
export function billingFor({ funding, engine, keyValue, spentUsd = 0, concurrent = 1 }) {
  if (!funding || funding.source !== 'key') return { billing: 'plan', env: {}, maxBudgetUsd: null, reason: null };
  const strip = Object.fromEntries([...CHILD_STRIP, funding.key_env].map((k) => [k, undefined]));
  if (engine !== 'claude') return { billing: 'seat', env: { [funding.key_env]: undefined }, maxBudgetUsd: null, reason: `${engine} seats bill their own vendor` };
  const sub = (reason) => ({ billing: 'subscription', env: strip, maxBudgetUsd: null, reason });
  if (funding.switched) return sub(`switched ${funding.switched.at}: ${funding.switched.reason}`);
  if (!keyValue || !String(keyValue).trim()) return sub(`${funding.key_env} is not set`);
  let maxBudgetUsd = null;
  if (funding.credit_usd !== null && funding.credit_usd !== undefined) {
    const left = funding.credit_usd - spentUsd;
    if (left <= 0) return sub(`the night's credit cap $${funding.credit_usd} is spent ($${spentUsd.toFixed(2)})`);
    maxBudgetUsd = Math.max(0.001, Math.floor((left / Math.max(1, concurrent)) * 1000) / 1000);
  }
  return { billing: 'key', env: { ...strip, ANTHROPIC_API_KEY: String(keyValue).trim() }, maxBudgetUsd, reason: null };
}

/**
 * Refine a classified outcome for a key-billed session: the key's failures are not the seat's.
 * Text comes from parseEnvelope's `errors` (claude: "<subtype>: <result>"). Anything else is returned as is.
 */
export function fundingOutcome({ billing, outcome, errors = [] }) {
  if (billing !== 'key' || outcome === 'completed' || outcome === 'timed-out') return outcome;
  const text = errors.join(' ').toLowerCase();
  if (/credit balance|purchase credits|plans & billing|insufficient.{0,20}credit/.test(text)) return 'credit-exhausted';
  if (/error_max_budget_usd|reached maximum budget/.test(text)) return 'budget-reached';
  if (/invalid x-api-key|authentication_error|invalid api key|api key.{0,20}(invalid|revoked|disabled)/.test(text)) return 'key-rejected';
  if (outcome === 'seat-limit') return 'key-limited';
  return outcome;
}

/**
 * Does this key outcome switch the night to the subscription? A spent, capped or refused key does,
 * at once. A rate limit is often transient (the CLI already retried), so the first one resumes on
 * the key after a pause and only a second in a row for the same entry switches. Otherwise, credit
 * the operator wants spent would go unspent.
 */
export function shouldSwitch(outcome, previousOutcome = null) {
  if (!KEY_OUTCOMES.has(outcome)) return false;
  if (outcome !== 'key-limited') return true;
  return previousOutcome === 'key-limited';
}

/** The one-line reason a key outcome switches the night, for the funding record and the log. */
export function switchReason(outcome, { seat, n = null }) {
  const what = {
    'credit-exhausted': 'the key is out of credit',
    'budget-reached': 'the night\'s credit cap was reached',
    'key-rejected': 'the API refused the key',
    'key-limited': 'the key hit its API rate limit',
  }[outcome] ?? outcome;
  return `${what} (${seat}${n ? ` session ${n}` : ''})`;
}

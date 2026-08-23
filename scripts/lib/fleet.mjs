/**
 * fleet — the dispatcher every bulk-model pass in this repository shares.
 *
 * ## Why this is a module and not a copied helper
 *
 * The rest of `scripts/` is deliberately standalone, and duplication there is cheap
 * because a divergence shows up as a different verdict on the same file, loudly. A
 * retry policy is not like that. Every rule below was earned by a measured failure,
 * and a copy that quietly dropped one would not produce a different verdict — it
 * would produce a THINNER corpus of proposals and look exactly like a model having a
 * bad day. One dispatcher, imported by every task.
 *
 * ## What it is not
 *
 * It is not an integration with any particular vendor. The endpoint and the model
 * roster are configuration, because the provider this was first measured against was
 * a free preview with a stated lifetime of about a week. A task written here must
 * survive its model disappearing mid-run, which is why `dispatch` rotates models on
 * retry rather than binding an item to one.
 *
 * ## The four failure modes it exists to absorb
 *
 * 1. SILENT TRUNCATION. A reasoning model can spend an entire completion budget
 *    thinking and emit zero content tokens: `finish_reason: "length"` with an empty
 *    body. Measured on 2026-08-21: at a 3,000-token budget only 1 of 6 calls returned
 *    parseable output; at 12,000 the truncation vanished entirely. This reads as "the
 *    model is unreliable" and is in fact "the budget was too small", so truncation is
 *    a RETRY WITH A LARGER BUDGET, never a failure.
 * 2. TRANSPORT FLAKINESS, AND OUTRIGHT DEATH. The same run returned HTTP 500/503 for 3
 *    of 8 concurrent heavy calls while 30 concurrent trivial calls all succeeded: errors
 *    scale with prompt weight, not request count, so heavy tasks get a lower concurrency
 *    cap and every 5xx falls back to the next model. A free model can also simply DIE
 *    mid-run — one began returning "Internal server error" for every call — so a model
 *    that fails repeatedly is benched rather than retried forever (see `BENCH_AFTER`).
 * 3. A MODEL THAT NEVER LOOKED. Some free models answer in a second with an empty
 *    finding list. That is not agreement, and a caller counting votes must be able to
 *    tell "looked and found nothing" from "did not look" — so every result carries its
 *    model, attempt count and usage, and callers weight rather than tally.
 * 4. AN ERROR WEARING A 200. The gateway can wrap an upstream failure in an HTTP 200
 *    whose body is `{"error":...}` with no `choices`. Measured 2026-08-23: a 502
 *    "Service temporarily overloaded" arrived as a 200 in about a second, and read as
 *    success it was indistinguishable from mode 3. `callModel` reports it as a failure
 *    carrying the upstream status, so the bench and the rotation see it.
 */

const DEFAULT_ENDPOINT = 'https://opencode.ai/zen/v1/chat/completions';

/**
 * Models known to reason hard enough to be worth asking. Order is PREFERENCE order:
 * the first is the primary, the rest are fallbacks, and a dead one costs nothing after
 * it is benched.
 */
const DEFAULT_MODELS = ['x-preview-f-free', 'nemotron-3-ultra-free'];

export const fleetConfig = () => ({
  endpoint: process.env.FLEET_ENDPOINT || DEFAULT_ENDPOINT,
  apiKey: process.env.FLEET_API_KEY || null,
  models: (process.env.FLEET_MODELS || DEFAULT_MODELS.join(',')).split(',').map((s) => s.trim()).filter(Boolean),
});

/**
 * The budget floor. Below this, a reasoning model's thinking eats the whole completion
 * and the content arrives empty. Measured, not guessed — see the header.
 */
export const MIN_MAX_TOKENS = 12000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Pull the first balanced JSON object out of a response that may be fenced or prefaced. */
export const extractJson = (text) => {
  if (!text) return null;
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(text.slice(start, i + 1)); } catch { return null; }
      }
    }
  }
  return null;
};

/** One call. Returns `{ ok, json, content, finish, usage, ms }` or `{ ok:false, err, status }`. */
export async function callModel({ endpoint, apiKey, model, system, user, maxTokens, timeoutMs = 300000 }) {
  const t0 = Date.now();
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  const messages = system ? [{ role: 'system', content: system }, { role: 'user', content: user }]
    : [{ role: 'user', content: user }];
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, err: text.slice(0, 200), status: res.status, ms: Date.now() - t0 };
    const json = JSON.parse(text);
    // A 4th failure mode, measured 2026-08-23: the gateway wraps an UPSTREAM failure in an
    // HTTP 200 whose body is `{"error":{...}}` with no `choices` - "[502] Upstream error
    // from Nvidia: Service temporarily overloaded" arrived as a 200 in ~1s. Read as
    // success, it looks exactly like mode 3 (a model that never looked) and is retried
    // on the same dead model. It is a transport failure; report it as one.
    if (json.error && !json.choices) {
      const msg = typeof json.error === 'string' ? json.error : json.error.message ?? JSON.stringify(json.error);
      const upstream = /\[(\d{3})\]/.exec(msg)?.[1];
      return { ok: false, err: msg.slice(0, 200), status: upstream ? Number(upstream) : 502, wrapped: true, ms: Date.now() - t0 };
    }
    const choice = json.choices?.[0];
    return {
      ok: true,
      content: choice?.message?.content ?? '',
      finish: choice?.finish_reason,
      usage: json.usage,
      model,
      ms: Date.now() - t0,
    };
  } catch (e) {
    return { ok: false, err: String(e).slice(0, 160), status: 0, ms: Date.now() - t0 };
  }
}

/**
 * Run `items` through the fleet, `concurrency` at a time.
 *
 * `build(item)` -> `{ system, user }`.
 * `parse(content, item)` -> a value, or `null` to force a retry (a shape the caller
 *   cannot use is indistinguishable from truncation, and is treated the same way).
 *
 * Resolves to one record per item, in input order, each carrying its provenance.
 */
export async function dispatch({
  items,
  build,
  parse = (c) => extractJson(c),
  models,
  endpoint,
  apiKey,
  concurrency = 10,
  maxTokens = MIN_MAX_TOKENS,
  attempts = 3,
  onDone = null,
}) {
  const cfg = fleetConfig();
  const eps = endpoint || cfg.endpoint;
  const key = apiKey === undefined ? cfg.apiKey : apiKey;
  const roster = (models && models.length ? models : cfg.models);
  const out = new Array(items.length);
  let cursor = 0;
  let done = 0;

  // The bench. A free roster is not a stable roster: mid-run, one model began returning
  // "Internal server error" for every call, and because the dispatcher was spreading
  // items across the roster by index, HALF of them burned a full attempt and its timeout
  // on a model that was simply down. Throughput halved and nothing said why.
  //
  // So two rules now. Roster order is PREFERENCE order, not a load-balance — every item
  // starts on the first model and falls back only on failure. And a model that fails
  // this many times in a row is benched for the rest of the run, because the difference
  // between "flaky" and "down" is just how many times you were willing to find out.
  const BENCH_AFTER = 5;
  const consecutiveFails = new Map();
  const benched = new Set();
  const live = () => roster.filter((m) => !benched.has(m));

  const runOne = async (idx) => {
    const item = items[idx];
    const { system, user } = build(item);
    const tried = [];
    let budget = Math.max(maxTokens, MIN_MAX_TOKENS);

    for (let a = 0; a < attempts; a++) {
      const usable = live();
      if (!usable.length) return { item, value: null, err: 'every model benched', attempts: tried };
      const model = usable[a % usable.length];
      const r = await callModel({ endpoint: eps, apiKey: key, model, system, user, maxTokens: budget });
      tried.push({ model, ok: r.ok, status: r.status, finish: r.finish, ms: r.ms });

      if (r.ok) {
        consecutiveFails.set(model, 0);
        const value = parse(r.content, item);
        if (value != null) {
          return { item, value, model, attempts: tried, usage: r.usage, ms: r.ms };
        }
        // Empty body with finish=length is the truncation signature: buy more room.
        // Not the model's fault, so it does not count against the bench.
        if (r.finish === 'length') budget = Math.min(budget * 2, 64000);
      } else if (r.status >= 500 || r.status === 0) {
        const n = (consecutiveFails.get(model) ?? 0) + 1;
        consecutiveFails.set(model, n);
        if (n >= BENCH_AFTER && !benched.has(model) && live().length > 1) {
          benched.add(model);
          console.error(`  fleet: benching ${model} after ${n} consecutive failures`);
        }
        await sleep(1200 * (a + 1));
      } else if (r.status === 429) {
        await sleep(5000 * (a + 1));
      } else {
        // A 4xx that is not rate limiting is a bad request; retrying it is superstition.
        return { item, value: null, err: r.err, attempts: tried };
      }
    }
    return { item, value: null, err: 'exhausted attempts', attempts: tried };
  };

  const worker = async () => {
    for (;;) {
      const idx = cursor++;
      if (idx >= items.length) return;
      out[idx] = await runOne(idx);
      done++;
      if (onDone) onDone(done, items.length, out[idx]);
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return out;
}

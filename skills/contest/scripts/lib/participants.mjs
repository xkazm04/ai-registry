// Pure half of the contest runner: participant specs, engine commands, envelope parsing.
//
// Nothing here touches the filesystem or a process, so `tests/` can import it with
// `node --test` and no install. The engine table is the contract: one line per CLI,
// with the flags that make a run headless, self-approving and free of the operator's
// own user configuration (a participant competes on the brief, not on the host's
// personal rules, plugins or memory).

export const EFFORTS = new Set(['low', 'medium', 'high', 'xhigh', 'max']);
export const ENGINES = new Set(['claude', 'codex', 'grok']);

/**
 * `engine:model@effort[#label]` -> { engine, model, effort, label, id }.
 * `claude:opus@xhigh`, `grok:grok-4.6@high`, `codex:gpt-5.6-sol@high#second`.
 * The id is filesystem-safe and stable, so a rerun lands in the same workspace.
 */
export function parseParticipant(spec) {
  const m = String(spec).trim().match(/^([a-z]+):([A-Za-z0-9._-]+)@([a-z]+)(?:#([A-Za-z0-9._-]+))?$/);
  if (!m) throw new Error(`participant "${spec}" is not engine:model@effort[#label]`);
  const [, engine, model, effort, label] = m;
  if (!ENGINES.has(engine)) throw new Error(`participant "${spec}": unknown engine "${engine}" (${[...ENGINES].join(', ')})`);
  if (!EFFORTS.has(effort)) throw new Error(`participant "${spec}": unknown effort "${effort}" (${[...EFFORTS].join(', ')})`);
  const id = `${engine}-${model}_${effort}${label ? `-${label}` : ''}`.replace(/[^A-Za-z0-9._-]/g, '_');
  return { engine, model, effort, label: label ?? null, id, spec: `${engine}:${model}@${effort}${label ? `#${label}` : ''}` };
}

export function parseParticipants(list) {
  const out = [];
  const seen = new Set();
  for (const spec of String(list).split(',').map((s) => s.trim()).filter(Boolean)) {
    const p = parseParticipant(spec);
    if (seen.has(p.id)) throw new Error(`participant "${spec}" repeats "${p.id}" - add #label to run the same seat twice`);
    seen.add(p.id);
    out.push(p);
  }
  if (out.length === 0) throw new Error('no participants given');
  return out;
}

/**
 * The argv for one engine. `prompt` is short by design - it points at a file in the
 * workspace - so it is safe as an argument (grok) and as stdin (claude, codex).
 * `bin` is the resolved executable; codex may resolve to [node, codex.js] so the
 * first element(s) are passed through untouched.
 */
export function engineCommand(p, bin, prompt, { workspace = '.' } = {}) {
  const head = Array.isArray(bin) ? bin : [bin];
  if (p.engine === 'grok') {
    return {
      argv: [...head, '-p', prompt, '-m', p.model, '--effort', p.effort, '--output-format', 'json',
        '--always-approve', '--permission-mode', 'bypassPermissions', '--cwd', workspace],
      stdin: '',
      env: { GROK_MEMORY: '0', GROK_AGENT_DASHBOARD: '0' },
    };
  }
  if (p.engine === 'codex') {
    return {
      argv: [...head, 'exec', '--json', '--skip-git-repo-check', '--ephemeral', '--ignore-user-config',
        '--ignore-rules', '-C', workspace, '--dangerously-bypass-approvals-and-sandbox', '-m', p.model,
        '-c', `model_reasoning_effort="${p.effort}"`, '-'],
      stdin: prompt,
      env: {},
    };
  }
  return {
    argv: [...head, '-p', '--output-format', 'json', '--model', p.model, '--effort', p.effort,
      '--permission-mode', 'bypassPermissions', '--setting-sources', 'project,local',
      '--strict-mcp-config', '--no-session-persistence'],
    stdin: prompt,
    env: {},
  };
}

// ---------------------------------------------------------------- envelopes

const lastJsonObject = (text) => {
  // claude and grok print one JSON document; a banner line before it is tolerated.
  const start = text.indexOf('{');
  if (start === -1) return null;
  try { return JSON.parse(text.slice(start)); } catch { /* fall through */ }
  for (let i = text.lastIndexOf('{'); i >= 0; i = text.lastIndexOf('{', i - 1)) {
    try { return JSON.parse(text.slice(i)); } catch { /* keep looking */ }
  }
  return null;
};

export function parseClaude(stdout) {
  const v = lastJsonObject(stdout);
  if (!v) return { final: '', errors: ['no JSON envelope on stdout'], usage: {}, turns: 0, cost_usd: null };
  const errors = [];
  if (v.is_error || (v.subtype && v.subtype !== 'success')) errors.push(`${v.subtype ?? 'error'}: ${String(v.result ?? '').slice(0, 300)}`);
  return {
    final: String(v.result ?? ''), errors, usage: v.usage ?? {}, turns: v.num_turns ?? 0,
    cost_usd: v.total_cost_usd ?? null, duration_ms: v.duration_ms ?? null, model_usage: v.modelUsage ?? {},
  };
}

export function parseGrok(stdout) {
  const v = lastJsonObject(stdout);
  if (!v) return { final: '', errors: ['no JSON envelope on stdout'], usage: {}, turns: 0, cost_usd: null };
  const stop = v.stopReason ?? v.stop_reason ?? 'unknown';
  const errors = stop === 'end_turn' ? [] : [`${stop}: ${String(v.text ?? '').slice(0, 300)}`];
  return {
    final: String(v.text ?? ''), errors, usage: v.usage ?? {}, turns: v.num_turns ?? 0,
    cost_usd: v.total_cost_usd ?? null, duration_ms: v.duration_ms ?? null, model_usage: v.modelUsage ?? {},
  };
}

export function parseCodex(stdout) {
  let final = '';
  let usage = {};
  let turns = 0;
  const errors = [];
  for (const line of stdout.split(/\r?\n/)) {
    let v;
    try { v = JSON.parse(line); } catch { continue; }
    const t = v.type;
    if (t === 'item.completed') {
      const it = v.item ?? {};
      if (it.type === 'agent_message') final = it.text ?? final;
    } else if (t === 'turn.completed') {
      turns += 1;
      usage = v.usage ?? usage;
    } else if (t === 'error' || t === 'turn.failed') {
      const msg = v.message ?? v.error?.message;
      if (msg && !String(msg).startsWith('Reconnecting')) errors.push(String(msg).slice(0, 300));
    }
  }
  return { final, errors, usage, turns, cost_usd: null, duration_ms: null, model_usage: {} };
}

export function parseEnvelope(engine, stdout) {
  if (engine === 'codex') return parseCodex(stdout);
  if (engine === 'grok') return parseGrok(stdout);
  return parseClaude(stdout);
}

/** A refusal or a seat limit is not a score of zero; it is a run that did not happen. */
export function classifyOutcome(parsed, { exit, timedOut }) {
  if (timedOut) return 'timed-out';
  if (parsed.errors.length) {
    const text = parsed.errors.join(' ').toLowerCase();
    if (/usage limit|rate limit|quota|out of (extra )?usage|seat/.test(text)) return 'seat-limit';
    return 'errored';
  }
  if (exit !== 0) return 'errored';
  return 'completed';
}

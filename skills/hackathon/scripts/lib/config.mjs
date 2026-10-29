// config.mjs - the per-repo overlay (.claude/hackathon/config.md) and how it meets the CLI.
//
// WHY a hand parser: the overlay is a markdown file a person edits, read by a builtins-only
// script, and it only ever holds scalars, quoted strings and `[a, b]` lists in its frontmatter.
// A YAML dependency would be the only one in the skill. The precedence is fixed: a CLI option
// beats the overlay, the overlay beats the default, and `init` prints which one each value came
// from so a surprising clock or seat list is traceable to its source.
//
// Pure: no fs or process here. The caller passes file text, the CLI options, cwd, tmpdir and an
// `exists` predicate.
import path from 'node:path';
import { EFFORTS, parseParticipants } from '../../../contest/scripts/lib/participants.mjs';

export const DEFAULT_IDEATORS = 'claude:claude-opus-5-5@high,claude:claude-sonnet-5-5@high';

const unquote = (s) => {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
  return t;
};

/** One frontmatter value: "quoted", 'quoted', [a, "b"], or a bare scalar (kept as a string). */
export function parseScalar(raw) {
  const t = String(raw).trim();
  if (t.startsWith('[') && t.endsWith(']')) {
    const inner = t.slice(1, -1).trim();
    if (!inner) return [];
    const items = [];
    let cur = '';
    let q = null;
    for (const ch of inner) {
      if (q) { cur += ch; if (ch === q) q = null; continue; }
      if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
      if (ch === ',') { items.push(unquote(cur)); cur = ''; continue; }
      cur += ch;
    }
    items.push(unquote(cur));
    return items.filter((x) => x !== '');
  }
  return unquote(t);
}

/** `---\nkey: value\n---\nbody` -> { data, body }. A file without frontmatter is all body. */
export function parseFrontmatter(text) {
  const src = String(text ?? '').replace(/\r\n/g, '\n').replace(/^\uFEFF/, '');
  const m = src.match(/^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
  if (!m) return { data: {}, body: src };
  const data = {};
  for (const line of m[1].split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    // A trailing ` # comment` outside quotes and brackets is dropped.
    let v = kv[2];
    const hash = v.search(/\s#/);
    if (hash !== -1 && !/^["'[]/.test(v.trim())) v = v.slice(0, hash);
    data[kv[1]] = parseScalar(v);
  }
  return { data, body: src.slice(m[0].length) };
}

/** `## Heading` sections of a markdown body, keyed by lower-cased heading. */
export function sections(body) {
  const out = {};
  let key = null;
  for (const line of String(body).split('\n')) {
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) { key = h[1].toLowerCase(); out[key] = []; continue; }
    if (key) out[key].push(line);
  }
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.join('\n').trim()]));
}

/** Bullets that carry one backticked command each; a bullet without one is reported, not run. */
export function commandBullets(text) {
  const commands = [];
  const skipped = [];
  for (const line of String(text ?? '').split('\n')) {
    const b = line.match(/^\s*[-*]\s+(.*)$/);
    if (!b) continue;
    const c = b[1].match(/`([^`]+)`/);
    if (c) commands.push(c[1].trim()); else skipped.push(b[1].trim());
  }
  return { commands, skipped };
}

/** The whole overlay: { data, setup, gates, taste, repo_law, warnings }. */
export function parseOverlay(text) {
  const { data, body } = parseFrontmatter(text);
  const sec = sections(body);
  const setup = commandBullets(sec.setup);
  const gates = commandBullets(sec.gates);
  const warnings = [
    ...setup.skipped.map((s) => `overlay ## Setup bullet has no backticked command, ignored: ${s}`),
    ...gates.skipped.map((s) => `overlay ## Gates bullet has no backticked command, ignored: ${s}`),
  ];
  return { data, setup: setup.commands, gates: gates.commands, taste: sec.taste ?? '', repo_law: sec['repo law'] ?? '', warnings };
}

export const DEFAULTS = {
  vault_subdir: 'Hackathon',
  arena: '.hackathon/arena',
  ideators: DEFAULT_IDEATORS,
  ideas: 10,
  hours: 5,
  build_effort: 'xhigh',
  base_port: 3300,
  baseline_frac: 0.35,
  sprint_min: 60,
  ideate_timeout_min: 30,
  max_sessions: 6,
  mode: 'long',
};

// CLI option name for each config key.
const CLI = {
  vault: 'vault', vault_subdir: 'vault-subdir', arena: 'arena', ideators: 'ideators', ideas: 'ideas', hours: 'hours',
  build_effort: 'build-effort', base_port: 'base-port', worktrees_root: 'worktrees-root', baseline_frac: 'baseline-frac',
  sprint_min: 'sprint-min', ideate_timeout_min: 'ideate-timeout-min', max_sessions: 'max-sessions',
};

const num = (key, v, { int = false, min = -Infinity, max = Infinity, open = false } = {}) => {
  const n = Number(v);
  const bad = !Number.isFinite(n) || (int && !Number.isInteger(n)) || (open ? n <= min || n >= max : n < min || n > max);
  if (bad) throw new Error(`${key} must be ${int ? 'an integer' : 'a number'} ${open ? `in (${min}, ${max})` : `>= ${min}`}, got ${JSON.stringify(v)}`);
  return n;
};

const expandHome = (p, home) => (home && /^~(?=$|[\\/])/.test(p) ? path.join(home, p.slice(1)) : p);

/** The first existing vault candidate, else <cwd>/.hackathon. */
export function resolveVault(value, { cwd, home, exists }) {
  const list = value === undefined || value === null || value === '' ? [] : (Array.isArray(value) ? value : [value]);
  for (const v of list) {
    const p = path.resolve(cwd, expandHome(String(v), home));
    if (exists(p)) return { root: p, source: 'overlay' };
  }
  return { root: path.join(cwd, '.hackathon'), source: list.length ? 'default (no listed vault exists)' : 'default' };
}

/**
 * Where entry and ideation worktrees go. The value may carry `<id>`; one without it gets
 * `hk-<id>` appended, so two hackathons never share a root (wrap clears leftover `idea-*`
 * worktrees under it, and a shared root would let one hackathon's wrap reach another's).
 */
export function resolveWorktreesRoot(value, { id, platform, tmpdir }) {
  if (!value) return platform === 'win32' ? `C:/t/hk-${id}` : path.join(tmpdir, `hk-${id}`);
  const v = String(value);
  return v.includes('<id>') ? v.replaceAll('<id>', id) : path.join(v, `hk-${id}`);
}

/**
 * Merge CLI options over the overlay over the defaults. `cli` is the parsed argv object (string or
 * true values, arrays for repeatable options). Returns { config, sources, warnings }.
 */
export function resolveConfig({ cli = {}, overlay = { data: {}, setup: [], gates: [], taste: '', repo_law: '', warnings: [] }, id, cwd, home, platform, tmpdir, exists = () => false }) {
  const sources = {};
  const warnings = [...(overlay.warnings ?? [])];
  const pick = (key) => {
    const flag = CLI[key];
    if (flag && cli[flag] !== undefined && cli[flag] !== true) { sources[key] = 'cli'; return cli[flag]; }
    if (flag && cli[flag] === true) throw new Error(`--${flag} needs a value`);
    if (overlay.data?.[key] !== undefined && overlay.data[key] !== '') { sources[key] = 'overlay'; return overlay.data[key]; }
    sources[key] = 'default';
    return DEFAULTS[key];
  };
  const c = {};
  const ideators = pick('ideators');
  c.ideators = parseParticipants(Array.isArray(ideators) ? ideators.join(',') : ideators).map((p) => p.spec);
  c.ideas_per_seat = num('ideas', pick('ideas'), { int: true, min: 1 });
  c.hours = num('hours', pick('hours'), { min: 0, max: 48, open: true });
  c.build_effort = String(pick('build_effort'));
  if (!EFFORTS.has(c.build_effort)) throw new Error(`build_effort "${c.build_effort}" is not one of ${[...EFFORTS].join(', ')}`);
  c.base_port = num('base_port', pick('base_port'), { int: true, min: 1, max: 65000 });
  c.baseline_frac = num('baseline_frac', pick('baseline_frac'), { min: 0, max: 1, open: true });
  c.sprint_min = num('sprint_min', pick('sprint_min'), { min: 0, max: 24 * 60, open: true });
  c.ideate_timeout_min = num('ideate_timeout_min', pick('ideate_timeout_min'), { min: 0, max: 24 * 60, open: true });
  c.max_sessions = num('max_sessions', pick('max_sessions'), { int: true, min: 1 });
  c.arena = String(pick('arena'));
  c.vault_subdir = String(pick('vault_subdir'));
  if (cli.sprints === true) { c.mode = 'sprints'; sources.mode = 'cli'; } else if (overlay.data?.mode) {
    c.mode = String(overlay.data.mode); sources.mode = 'overlay';
    if (!['long', 'sprints'].includes(c.mode)) throw new Error(`mode "${c.mode}" is not long or sprints`);
  } else { c.mode = DEFAULTS.mode; sources.mode = 'default'; }

  const vaultValue = cli.vault !== undefined && cli.vault !== true ? cli.vault : overlay.data?.vault;
  const vault = resolveVault(vaultValue, { cwd, home, exists });
  c.vault = vault.root;
  sources.vault = cli.vault !== undefined && cli.vault !== true ? (vault.source === 'overlay' ? 'cli' : vault.source) : vault.source;

  const wtRaw = cli['worktrees-root'] !== undefined && cli['worktrees-root'] !== true ? cli['worktrees-root'] : overlay.data?.worktrees_root;
  sources.worktrees_root = cli['worktrees-root'] !== undefined ? 'cli' : (overlay.data?.worktrees_root ? 'overlay' : 'default');
  c.worktrees_root = resolveWorktreesRoot(wtRaw, { id, platform, tmpdir }).replace(/\\/g, '/');

  const listOpt = (v) => (v === undefined ? [] : (Array.isArray(v) ? v : [v])).filter((x) => x !== true && String(x).trim());
  const cliSetup = listOpt(cli.setup);
  const cliGates = listOpt(cli.gate);
  c.setup = cliSetup.length ? cliSetup : overlay.setup ?? [];
  sources.setup = cliSetup.length ? 'cli' : (overlay.setup?.length ? 'overlay' : 'default');
  c.gates = cliGates.length ? cliGates : overlay.gates ?? [];
  sources.gates = cliGates.length ? 'cli' : (overlay.gates?.length ? 'overlay' : 'default');
  c.taste = overlay.taste ?? '';
  c.repo_law = overlay.repo_law ?? '';

  // The default session cap must not cut a sprint plan short: 5 h of 30-minute sprints is 8
  // sessions. An explicit cap (cli or overlay) is the owner's and is kept, with a warning.
  if (c.mode === 'sprints') {
    const total = c.hours * 60;
    const scheduled = 1 + Math.ceil((total * (1 - c.baseline_frac)) / c.sprint_min);
    if (scheduled > c.max_sessions) {
      if (sources.max_sessions === 'default') {
        c.max_sessions = scheduled + 2;
        warnings.push(`sprints mode schedules ${scheduled} sessions; max_sessions raised from the default ${DEFAULTS.max_sessions} to ${c.max_sessions}`);
      } else {
        warnings.push(`sprints mode schedules ${scheduled} sessions but max_sessions is ${c.max_sessions}; the run stops early unless you raise it`);
      }
    }
  }
  return { config: c, sources, warnings };
}

// Context-map upkeep without the app: a deterministic refresh from git, targeted deep-rescan packets for the
// contexts that churned most, and a ledger that tunes WHEN a rescan is worth an LLM call.
//   refresh   git diff since the map's commit -> drop gone files, follow renames, attach new files to the
//             nearest context by directory, flag contexts whose churn crossed their calibrated threshold
//   plan      per flagged context: the packet a session LLM needs to re-judge just that context
//   apply     merge the session's patch into the map and record whether the rescan changed anything
//   sync      hand the map to the app's declare door (spooled when the app is down)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { call, appUp, findProject, appendSpool, pending, mintId } from './door.mjs';

export const BASE_THRESHOLD = 0.25;   // changed files / context size before a rescan is considered
export const MIN_ABS = 4;             // ...and never for fewer changed files than this
const IGNORE = /(^|\/)(node_modules|dist|target|\.git)\/|(^|\/)(package-lock\.json|pnpm-lock\.yaml|Cargo\.lock)$/;

const git = (repo, args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8', maxBuffer: 256 << 20 });
const dirOf = (f) => f.split('/').slice(0, -1).join('/');
const extOf = (f) => (path.posix.extname(f) || '').toLowerCase();
const arr = (v) => (Array.isArray(v) ? v : typeof v === 'string' && v.trim().startsWith('[') ? JSON.parse(v) : []);

export const mapPath = (repo) => path.join(repo, 'context-map.json');
export const stateDir = (repo) => path.join(repo, '.claude', 'context-refresh');
export const ledgerPath = (repo) => path.join(stateDir(repo), 'ledger.jsonl');

export function readLedger(repo) {
  try { return fs.readFileSync(ledgerPath(repo), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; }
}
function appendLedger(repo, rec) {
  fs.mkdirSync(stateDir(repo), { recursive: true });
  fs.appendFileSync(ledgerPath(repo), JSON.stringify({ ts: new Date().toISOString(), ...rec }) + '\n');
}

/** Rescan threshold for one context: a context whose past rescans changed nothing earns a higher bar. */
export function thresholdFor(ledger, name) {
  const rs = ledger.filter((r) => r.kind === 'rescan');
  const mine = rs.filter((r) => r.context === name);
  const pool = mine.length >= 2 ? mine : rs.length >= 4 ? rs : [];
  if (!pool.length) return { threshold: BASE_THRESHOLD, basis: 'base (no history)' };
  const yieldRate = pool.filter((r) => r.changed).length / pool.length;
  return { threshold: +(BASE_THRESHOLD * (1 + 2 * (1 - yieldRate))).toFixed(3), basis: `${mine.length >= 2 ? 'own' : 'global'} yield ${yieldRate.toFixed(2)} over ${pool.length} rescans` };
}

function changesSince(repo, base) {
  const added = new Set(); const removed = new Set(); const renamed = new Map();
  let ok = false;
  try {
    git(repo, ['cat-file', '-e', `${base}^{commit}`]);
    const out = git(repo, ['-c', 'diff.renameLimit=20000', 'diff', '--name-status', '-M', '-z', `${base}..HEAD`]).split('\0');
    for (let i = 0; i < out.length;) {
      const s = out[i++]; if (!s) continue;
      if (s[0] === 'R') { const from = out[i++]; const to = out[i++]; renamed.set(from, to); }
      else { const f = out[i++]; if (s[0] === 'A') added.add(f); else if (s[0] === 'D') removed.add(f); }
    }
    ok = true;
  } catch { /* base commit unknown (shallow clone / rewritten history): degrade to a tree comparison */ }
  return { added, removed, renamed, ok };
}

export function refresh(repo, { write = true } = {}) {
  const mp = mapPath(repo);
  if (!fs.existsSync(mp)) throw new Error(`no context-map.json in ${repo}; run a full scan once (in the app, or a session scan)`);
  const map = JSON.parse(fs.readFileSync(mp, 'utf8'));
  const head = git(repo, ['rev-parse', 'HEAD']).trim();
  const base = map.provenance?.git_commit;
  const tracked = new Set(git(repo, ['ls-files', '-z']).split('\0').filter(Boolean));
  const ch = base ? changesSince(repo, base) : { added: new Set(), removed: new Set(), renamed: new Map(), ok: false };
  const ledger = readLedger(repo);

  const owner = new Map(); // file -> context
  const dirIndex = new Map(); // dir -> Map(contextId -> count)
  const exts = new Set();
  const stat = new Map(); // context id -> {added, removed, before}
  for (const c of map.contexts) {
    const before = arr(c.file_paths); const next = [];
    const st = { added: 0, removed: 0, before: before.length };
    for (let f of before) {
      if (ch.renamed.has(f)) f = ch.renamed.get(f);
      if (!tracked.has(f)) { st.removed++; continue; }
      next.push(f); owner.set(f, c); exts.add(extOf(f));
      const d = dirOf(f); const m = dirIndex.get(d) ?? dirIndex.set(d, new Map()).get(d); m.set(c.id, (m.get(c.id) ?? 0) + 1);
    }
    c.file_paths = next; stat.set(c.id, st);
  }
  const byId = new Map(map.contexts.map((c) => [c.id, c]));
  const unassigned = [];
  const candidates = ch.ok ? [...ch.added] : [...tracked].filter((f) => dirIndex.has(dirOf(f)));
  for (const f0 of candidates) {
    const f = ch.renamed.get(f0) ?? f0;
    if (!tracked.has(f) || owner.has(f) || IGNORE.test(f) || !exts.has(extOf(f))) continue;
    let d = dirOf(f); let hit = null;
    for (let depth = d ? d.split('/').length : 0; depth >= 2 && !hit; depth--) {
      d = d.split('/').slice(0, depth).join('/');
      const m = dirIndex.get(d); if (m) hit = [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
    }
    if (!hit) { unassigned.push(f); continue; }
    const c = byId.get(hit); c.file_paths.push(f); owner.set(f, c); stat.get(hit).added++;
  }

  const flagged = [];
  for (const c of map.contexts) {
    const st = stat.get(c.id); const moved = st.added + st.removed;
    const { threshold, basis } = thresholdFor(ledger, c.name);
    const churn = moved / Math.max(st.before, 1);
    if (moved >= MIN_ABS && churn >= threshold) flagged.push({ context: c.name, id: c.id, added: st.added, removed: st.removed, size: c.file_paths.length, churn: +churn.toFixed(2), threshold, basis });
  }
  flagged.sort((a, b) => b.churn - a.churn);
  const clusters = {};
  for (const f of unassigned) { const k = f.split('/').slice(0, 3).join('/'); clusters[k] = (clusters[k] ?? 0) + 1; }
  const unassignedClusters = Object.entries(clusters).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([dir, files]) => ({ dir, files }));

  const total = [...stat.values()].reduce((n, s) => ({ added: n.added + s.added, removed: n.removed + s.removed }), { added: 0, removed: 0 });
  const report = { from: base ?? null, to: head, exact: ch.ok, renamed: ch.renamed.size, added: total.added, removed: total.removed, unassigned: unassigned.length, unassignedClusters, flagged, wrote: false };

  if (write) {
    map.provenance = { ...(map.provenance ?? {}), git_commit: head, refreshed_at: new Date().toISOString(), refresh_mode: 'deterministic' };
    map.stats = { ...(map.stats ?? {}), contexts: map.contexts.length, files: new Set(map.contexts.flatMap((c) => c.file_paths)).size };
    fs.writeFileSync(mp, JSON.stringify(map, null, 2) + '\n');
    fs.mkdirSync(stateDir(repo), { recursive: true });
    fs.writeFileSync(path.join(stateDir(repo), 'flagged.json'), JSON.stringify({ at: head, flagged, unassignedClusters }, null, 2) + '\n');
    appendLedger(repo, { kind: 'refresh', from: base ?? null, to: head, exact: ch.ok, added: total.added, removed: total.removed, unassigned: unassigned.length, flagged: flagged.map((f) => ({ context: f.context, churn: f.churn })) });
    report.wrote = true;
  }
  return report;
}

/** Packets for the session LLM: only the flagged contexts, each with what moved and why it matters. */
export function plan(repo, { names, limit = 12 } = {}) {
  const f = JSON.parse(fs.readFileSync(path.join(stateDir(repo), 'flagged.json'), 'utf8'));
  const map = JSON.parse(fs.readFileSync(mapPath(repo), 'utf8'));
  const ranked = [...f.flagged].sort((a, b) => (b.added + b.removed) - (a.added + a.removed));
  const want = names?.length ? ranked.filter((x) => names.includes(x.context)) : ranked.slice(0, limit);
  const deferred = names?.length ? 0 : Math.max(0, ranked.length - want.length);
  const packets = want.map((x) => {
    const c = map.contexts.find((k) => k.id === x.id);
    const dirs = [...new Set(c.file_paths.map(dirOf))].slice(0, 12);
    let log = '';
    try { log = git(repo, ['log', '--oneline', '-n', '12', '--', ...dirs]).trim(); } catch { /* no history */ }
    return { context: c.name, group: c.group, description: c.description, entry_points: arr(c.entry_points), files: c.file_paths.length, churn: x, recent_commits: log.split('\n').filter(Boolean) };
  });
  return { instructions: 'Re-judge ONLY these contexts: read the changed areas, then return a patch {"contexts":[{"name":...,"description"?,"file_paths"?,"entry_points"?,"keywords"?,"api_surface"?,"db_tables"?,"cross_refs"?}],"newContexts"?:[{...,"group"}]} to `contexts apply`. Change nothing that is still true.', packets, deferred, unassignedClusters: f.unassignedClusters };
}

/** Merge a session patch into the map; record whether the rescan changed anything (this is what tunes thresholds). */
export function apply(repo, patch, { tokensEst = null, note = null } = {}) {
  const mp = mapPath(repo); const map = JSON.parse(fs.readFileSync(mp, 'utf8'));
  const outcomes = [];
  for (const p of patch.contexts ?? []) {
    const c = map.contexts.find((k) => k.name === p.name);
    if (!c) { outcomes.push({ context: p.name, changed: false, error: 'unknown context' }); continue; }
    let changed = false;
    for (const [k, v] of Object.entries(p)) {
      if (k === 'name') continue;
      if (JSON.stringify(c[k]) !== JSON.stringify(v)) { c[k] = v; changed = true; }
    }
    outcomes.push({ context: c.name, changed });
  }
  for (const n of patch.newContexts ?? []) {
    const g = (map.groups ?? []).find((x) => x.name === n.group);
    map.contexts.push({ pinned: false, ...n, id: crypto.randomUUID(), group_id: g?.id ?? null });
    outcomes.push({ context: n.name, changed: true, created: true });
  }
  map.stats = { ...(map.stats ?? {}), contexts: map.contexts.length, files: new Set(map.contexts.flatMap((c) => arr(c.file_paths))).size };
  fs.writeFileSync(mp, JSON.stringify(map, null, 2) + '\n');
  const per = tokensEst && outcomes.length ? Math.round(tokensEst / outcomes.length) : null;
  for (const o of outcomes) appendLedger(repo, { kind: 'rescan', context: o.context, changed: o.changed, tokensEst: per, note });
  return outcomes;
}

/** The ledger as numbers: how often a rescan paid off, and what the thresholds are now. */
export function stats(repo) {
  const l = readLedger(repo); const rs = l.filter((r) => r.kind === 'rescan');
  const byCtx = {}; for (const r of rs) { const b = (byCtx[r.context] ??= { rescans: 0, changed: 0 }); b.rescans++; if (r.changed) b.changed++; }
  const tok = rs.map((r) => r.tokensEst).filter(Number.isFinite);
  return { refreshes: l.filter((r) => r.kind === 'refresh').length, rescans: rs.length, yield: rs.length ? +(rs.filter((r) => r.changed).length / rs.length).toFixed(2) : null,
    tokensEstTotal: tok.reduce((a, b) => a + b, 0), global: thresholdFor(l, '*'), contexts: byCtx };
}

/** Give the app the map through its declare door; spool a marker when it is down (the file is read at replay). */
export async function sync(repo) {
  const id = `contexts:${path.resolve(repo)}`;
  const p = await findProject(repo);
  if (!(await appUp())) { appendSpool('contexts', { id, state: 'queued', repo: path.resolve(repo), queuedAt: new Date().toISOString() }); return { mode: 'spool', project: p?.name ?? null }; }
  const projects = await call('GET', '/projects');
  const proj = projects.find((x) => x.root_path.replace(/\\/g, '/').toLowerCase() === path.resolve(repo).replace(/\\/g, '/').toLowerCase());
  if (!proj) return { mode: 'door', error: 'repo is not a registered Personas project' };
  const map = JSON.parse(fs.readFileSync(mapPath(repo), 'utf8'));
  const r = await call('POST', `/contexts/${proj.id}/declare`, map, { timeoutMs: 60000 });
  appendSpool('contexts', { id, state: 'done', doneAt: new Date().toISOString() });
  return { mode: 'door', ...r };
}

export async function syncPending() {
  const out = [];
  for (const e of pending('contexts')) { try { out.push({ repo: e.repo, ...(await sync(e.repo)) }); } catch (x) { out.push({ repo: e.repo, error: x.message }); } }
  return out;
}

export { mintId };

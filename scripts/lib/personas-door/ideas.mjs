// Backlog filing that survives the app being down: deliver through the door now, else spool and replay.
// The door keeps dedup / rating / near-duplicate logic, so nothing here ever writes the app DB.
import path from 'node:path';
import { call, appUp, findProject, query, norm, appendSpool, readSpool, pending, mintId } from './door.mjs';
import { toFiling as sweepFiling } from '../../../skills/scan-sweep/scripts/filing.mjs';

const SIZE_EFFORT = { XS: 1, S: 1, M: 2, L: 3, XL: 4 };
const to5 = (v) => (Number.isFinite(v) && v > 0 ? Math.min(5, Math.max(1, Math.ceil(v / 2))) : null);
export const LANDED = new Set(['created', 'deduped', 'rated', 'near_duplicate']);

export function parseCards(text) {
  const cards = []; const unreadable = [];
  text.split('\n').forEach((raw, i) => {
    const l = raw.trim(); if (!l) return;
    let c; try { c = JSON.parse(l); } catch { unreadable.push({ line: i + 1, error: 'not JSON' }); return; }
    if (!c || typeof c.title !== 'string' || !c.title.trim()) { unreadable.push({ line: i + 1, error: 'no title' }); return; }
    cards.push(c);
  });
  return { cards, unreadable };
}

/**
 * The body for one card, or `{ error }` when the card cannot be filed (it stays owed). A scan-sweep card goes through
 * the skill's own scan-finding/1 mapping (native 1-10 scales, every contract field top-level, score computed): the
 * door normalizes a scan_sweep row once, so the halving below would land it at half scale. Other origins file 1-5.
 */
export function filingFor(c, projectId, contexts, origin = 'scan_sweep') {
  if (origin !== 'scan_sweep') return { body: toFiling(c, projectId, contexts, origin) };
  return sweepFiling(c, { projectId, contexts });
}

/** Card (skill finding shape, scales 1-10) -> the door's filing body (scales 1-5), for origins other than scan_sweep. */
export function toFiling(c, projectId, contexts, origin = 'scan_sweep') {
  const defaulted = [];
  let effort = to5(c.effort); if (effort == null) { effort = SIZE_EFFORT[String(c.size || '').toUpperCase()] || 2; defaulted.push('effort'); }
  let impact = to5(c.impact); if (impact == null) { impact = 3; defaulted.push('impact'); }
  let risk = to5(c.risk); if (risk == null) { risk = 3; defaulted.push('risk'); }
  const lane = String(c.lane || '').toUpperCase();
  const head = lane === 'B' ? '> **Lane B - A/B-drainable.** An instrument can decide this. Accept = run `/scan-sweep --ab-only` on it; reject = drop it.\n\n' : '';
  const evidence = c.evidence ? `\n\n## Evidence\n${c.evidence}` : '';
  const why = [lane ? `Lane ${lane}` : null, c.gate && c.gate !== 'none' ? `gate ${c.gate}` : null, c.result ? `result ${c.result}` : null,
    c.method ? `method ${c.method}` : null, c.size ? `size ${c.size}` : null, c.source ? `from ${c.source}` : null,
    defaulted.length ? `scales defaulted: ${defaulted.join(', ')}` : null].filter(Boolean).join('; ');
  return {
    project_id: projectId, title: c.title.trim().slice(0, 200), description: (head + (c.body || '') + evidence).slice(0, 6000),
    reasoning: `${origin.replace('_', '-')} hand-off - ${why}`, category: c.category || 'technical', effort, impact, risk,
    context_id: c.context ? contexts.get(String(c.context).trim().toLowerCase()) ?? null : null, origin, lens: c.lens || null,
  };
}

async function contextIds(projectId) {
  const m = new Map();
  try { for (const c of await call('GET', `/contexts/${projectId}`)) if (c?.name && c?.id) m.set(String(c.name).trim().toLowerCase(), c.id); } catch { /* unbound */ }
  return m;
}

/** Deliver cards for one repo through the door. Returns per-card results; never throws on a card failure. */
export async function deliver(cards, repo, { register = false, dryRun = false, origin } = {}) {
  const projects = await call('GET', '/projects');
  let project = projects.find((p) => norm(p.root_path) === norm(repo));
  if (!project) {
    if (!register) return { unregistered: true, results: cards.map((c) => ({ title: c.title, outcome: 'unregistered' })) };
    if (!dryRun) project = await call('POST', '/projects', { name: path.basename(repo), root_path: repo });
  }
  const ctx = project ? await contextIds(project.id) : new Map();
  const results = [];
  for (const c of cards) {
    const f = filingFor(c, project ? project.id : '<unregistered>', ctx, origin);
    if (f.error) { results.push({ title: c.title, outcome: 'invalid', error: f.error }); continue; }
    const body = f.body;
    if (dryRun) { results.push({ title: body.title, outcome: 'dry-run', filing: body }); continue; }
    try {
      const r = await call('POST', '/ideas', body);
      results.push({ title: body.title, outcome: r.outcome, id: r.idea?.id, status: r.idea?.status, note: r.duplicateNote || r.goalNote || null });
    } catch (e) { results.push({ title: body.title, outcome: 'error', error: e.message }); }
  }
  return { project, results };
}

export const tally = (results) => results.reduce((t, r) => ((t[r.outcome] = (t[r.outcome] || 0) + 1), t), {});

/**
 * File cards: door when up, else spool. Returns { mode: 'door'|'spool'|'dry-run'|'none', results, tally }.
 * A spooled card is durable (the caller may delete its source file) but not yet in Approvals.
 */
export async function file(cards, repo, opts = {}) {
  const { spool = true } = opts;
  if (opts.dryRun) {
    const project = await findProject(repo);
    const results = cards.map((c) => { const f = filingFor(c, project?.id ?? '<unregistered>', new Map(), opts.origin); return f.error ? { title: c.title, outcome: 'invalid', error: f.error } : { title: c.title, outcome: 'dry-run', filing: f.body }; });
    return { mode: 'dry-run', project, results, tally: { 'dry-run': cards.length } };
  }
  if (await appUp()) {
    const r = await deliver(cards, repo, opts);
    if (!r.unregistered) return { mode: 'door', ...r, tally: tally(r.results) };
    if (!spool) return { mode: 'door', ...r, tally: tally(r.results) };
  }
  if (!spool) return { mode: 'none', results: cards.map((c) => ({ title: c.title, outcome: 'app-down' })), tally: { 'app-down': cards.length } };
  const results = cards.map((c) => {
    const id = mintId();
    appendSpool('ideas', { id, state: 'queued', repo: path.resolve(repo), register: !!opts.register, origin: opts.origin || 'scan_sweep', queuedAt: new Date().toISOString(), card: c });
    return { title: c.title, outcome: 'queued', id };
  });
  return { mode: 'spool', results, tally: tally(results) };
}

/** Drain the spool through the door, grouped by repo. Entries that land are marked done; the rest stay queued. */
export async function sync() {
  const queued = pending('ideas');
  if (!queued.length) return { drained: 0, left: 0, results: [] };
  if (!(await appUp())) return { drained: 0, left: queued.length, results: [], appDown: true };
  const byRepo = new Map();
  for (const e of queued) { const k = `${e.repo}|${e.origin || ''}|${!!e.register}`; (byRepo.get(k) ?? byRepo.set(k, []).get(k)).push(e); }
  const out = [];
  for (const entries of byRepo.values()) {
    const { repo, register, origin } = entries[0];
    const r = await deliver(entries.map((e) => e.card), repo, { register, origin });
    r.results.forEach((res, i) => {
      const e = entries[i];
      if (LANDED.has(res.outcome)) appendSpool('ideas', { id: e.id, state: 'done', doneAt: new Date().toISOString(), outcome: res.outcome, ideaId: res.id ?? null });
      else appendSpool('ideas', { id: e.id, state: 'queued', lastError: res.error || res.outcome, lastTriedAt: new Date().toISOString() });
      out.push({ ...res, repo });
    });
  }
  const done = out.filter((r) => LANDED.has(r.outcome)).length;
  return { drained: done, left: queued.length - done, results: out };
}

export async function list(repo, { status, limit = 50 } = {}) {
  const p = await findProject(repo);
  if (!p) return [];
  const where = status ? 'AND status = ?' : '';
  return query(`SELECT id, title, status, effort, impact, risk, scan_type, created_at FROM dev_ideas WHERE project_id = ? ${where} ORDER BY created_at DESC LIMIT ${Number(limit) | 0}`, status ? [p.id, status] : [p.id]);
}

export { readSpool };

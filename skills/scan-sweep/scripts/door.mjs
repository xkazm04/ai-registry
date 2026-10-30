#!/usr/bin/env node
// door - the Personas local HTTP door, shared by approvals.mjs and SKILL.md section 2's reads.
//
// Why: the sweep used to learn what the human decided only from a capped title digest, and the only
// earned-trust signal it had was a repo-wide false-positive counter. Personas now records both - the
// decisions with their reasons (GET /dev-tools/scan/decisions) and the per-slice autonomy level it
// computes from its own history (GET /dev-tools/scan/trust). This file is the one place that reaches
// them, so the hand-off and the reads cannot drift onto two handshakes.
//
// Usage:
//   node door.mjs decisions --repo <root> [--context <name>] [--lens <id>] [--limit 50]
//   node door.mjs trust     --repo <root> [--slice <category|lens|risk_class|size>]
// Both print one JSON object. `reachable: false` (exit 3) means the app is down, the handshake is
// missing, or the app predates the endpoint - the caller falls back to the backlog digest and SAYS so.
// Exit 4: the repo is not a registered Personas project. Exit 2: bad arguments.
//
// levelFor() is the ladder lookup SKILL.md section 5 routes by; the door stays the authority (it
// re-checks every autoDecide itself), so a wrong local answer can only cost autonomy, never grant it.
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const handshakePath = () => process.env.PERSONAS_HANDSHAKE || join(homedir(), '.personas', 'local-http.json');

/** @returns {{port: number, token: string} | null} */
export function readHandshake() {
  const p = handshakePath();
  if (!existsSync(p)) return null;
  try {
    const h = JSON.parse(readFileSync(p, 'utf8'));
    return h && h.port && h.token ? h : null;
  } catch { return null; }
}

/** A `call(method, path, body)` bound to the handshake, or null when there is none. */
export function connect(h = readHandshake()) {
  if (!h) return null;
  const base = `http://127.0.0.1:${h.port}/dev-tools`;
  return async function call(method, path, body) {
    const res = await fetch(base + path, {
      method,
      headers: { 'content-type': 'application/json', 'x-personas-local-token': h.token },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      const e = new Error(`${method} ${path} -> ${res.status} ${text.slice(0, 300)}`);
      e.status = res.status;
      throw e;
    }
    return text ? JSON.parse(text) : null;
  };
}

export const norm = (p) => String(p ?? '').replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();

export async function findProject(call, repo) {
  const projects = await call('GET', '/projects');
  return (projects ?? []).find((p) => norm(p.root_path) === norm(repo)) ?? null;
}

/** context name (lower-cased) -> context id; empty when the project has no contexts. */
export async function contextIds(call, projectId) {
  const m = new Map();
  try {
    for (const c of (await call('GET', `/contexts/${projectId}`)) ?? []) {
      if (c && c.name && c.id) m.set(String(c.name).trim().toLowerCase(), c.id);
    }
  } catch { /* no contexts, or the last context scan was refused: unbound */ }
  return m;
}

const qs = (o) => Object.entries(o)
  .filter(([, v]) => v !== undefined && v !== null && v !== '')
  .map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');

/** Seam A3. Newest first; limit 1-100 (the door's own bounds). */
export async function decisions(call, { projectId, contextId, lens, limit = 50 }) {
  const n = Math.min(100, Math.max(1, Number(limit) || 50));
  const r = await call('GET', `/scan/decisions?${qs({ projectId, contextId, lens, limit: n })}`);
  return r?.decisions ?? [];
}

/** Seam A4. */
export async function trust(call, { projectId, slice }) {
  const r = await call('GET', `/scan/trust?${qs({ projectId, slice })}`);
  return { slices: r?.slices ?? [], events: r?.events ?? [] };
}

// ---- the ladder lookup -------------------------------------------------------------------------

/** Contract start levels. An overlay (`autonomy.start.*`) may only LOWER them. */
export const START = Object.freeze({ technical: 2, product: 0 });
const CEILING_L1 = new Set(['secret', 'authz', 'money']);
const HUMAN_GATES = new Set(['direction', 'architecture', 'irreversible', 'policy-loosen']);

/** `<category>|<lens>|<risk_class>|<size>`, an absent part written `-`. */
export function sliceKey({ category, lens, risk_class: riskClass, size } = {}) {
  return [category, lens, riskClass, size].map((p) => (p === undefined || p === null || p === '' ? '-' : String(p))).join('|');
}

/** `*` matches one part; a pattern has exactly four parts. */
export function sliceMatches(pattern, key) {
  const p = String(pattern).split('|');
  const k = key.split('|');
  return p.length === k.length && p.every((x, i) => x === '*' || x === k[i]);
}

/**
 * The level this skill routes a finding by.
 * @param {object} f  finding: category, lens, risk_class?, size
 * @param {{reachable: boolean, slices?: object[], start?: object, frozen?: string[], strict?: boolean}} o
 * @returns {{slice: string, level: number, source: string, effective: number, lane_a_ok: boolean, auto_decide: boolean}}
 */
export function levelFor(f, { reachable, slices = [], start = {}, frozen = [], strict = false } = {}) {
  const slice = sliceKey(f);
  const startOf = (cat) => {
    if (!Object.hasOwn(START, cat)) return 0; // category unknown: no autonomy
    const o = start[cat];
    return Number.isInteger(o) ? Math.max(0, Math.min(START[cat], o)) : START[cat];
  };
  let level;
  let source;
  if (frozen.some((p) => sliceMatches(p, slice))) { level = 0; source = 'frozen'; }
  else if (reachable) {
    const row = slices.find((s) => s && s.slice === slice);
    if (row && Number.isInteger(row.level)) { level = row.level; source = 'door'; }
    else { level = startOf(f.category); source = 'start'; }
    // The door never reads the overlay, so a lowered start is also a LOCAL ceiling on its levels:
    // the project said "no higher than this" and only this side can hear it.
    if (startOf(f.category) < START[f.category]) level = Math.min(level, startOf(f.category));
  } else { level = startOf(f.category); source = 'unreachable'; }
  if (CEILING_L1.has(f.risk_class)) level = Math.min(level, 1);
  // The repo-wide false-positive counter (section 5) is a LOCAL demotion on top: one level down while strict.
  const effective = Math.max(0, level - (strict ? 1 : 0));
  // Door unreachable: autoDecide is only ASKED (L1 at most); the door re-decides it when the card lands.
  // A Lane C escalation is the human's by the skill's own law, whatever the slice has earned.
  const human = HUMAN_GATES.has(f.gate);
  return { slice, level, source, effective, lane_a_ok: !human && effective >= 2, auto_decide: !human && effective >= 1 };
}

// ---- CLI ---------------------------------------------------------------------------------------

async function main(argv) {
  const opt = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
  const [verb] = argv;
  const print = (o) => console.log(JSON.stringify(o, null, 2));
  if (verb !== 'decisions' && verb !== 'trust') {
    console.error('usage: door.mjs decisions --repo <root> [--context <name>] [--lens <id>] [--limit 50]\n       door.mjs trust --repo <root> [--slice <key>]');
    return 2;
  }
  const repo = resolve(opt('--repo', process.cwd()));
  const call = connect();
  if (!call) { print({ reachable: false, reason: `no Personas handshake at ${handshakePath()}` }); return 3; }
  let project;
  try { project = await findProject(call, repo); } catch (e) {
    print({ reachable: false, reason: `Personas did not answer: ${e.message}` }); return 3;
  }
  if (!project) { print({ reachable: true, registered: false, reason: `${repo} is not a registered Personas project` }); return 4; }
  try {
    if (verb === 'decisions') {
      const ctxName = opt('--context');
      let contextId;
      let note;
      if (ctxName) {
        contextId = (await contextIds(call, project.id)).get(ctxName.trim().toLowerCase());
        if (!contextId) note = `context "${ctxName}" is not in the app's map: decisions read project-wide`;
      }
      const rows = await decisions(call, { projectId: project.id, contextId, lens: opt('--lens'), limit: opt('--limit', 50) });
      print({ reachable: true, project: project.id, scope: contextId ? 'context' : 'project', ...(contextId ? { contextId } : {}), ...(note ? { note } : {}), decisions: rows });
    } else {
      const r = await trust(call, { projectId: project.id, slice: opt('--slice') });
      print({ reachable: true, project: project.id, ...r });
    }
    return 0;
  } catch (e) {
    // 404 = an app that predates the endpoint: unreachable for this purpose, so the caller falls back.
    print({ reachable: false, reason: e.status === 404 ? `the app has no ${verb} endpoint yet (${e.message})` : e.message });
    return 3;
  }
}

/**
 * Is this module the process entry? Compares REAL paths: SKILL.md runs every script through the skill
 * link (.claude/skills/scan-sweep is a junction/symlink), so argv[1] is the link path while Node resolves
 * import.meta.url to the real one. A plain path compare made the CLI a silent exit-0 no-op through the
 * link (personas, 2026-10-30: trust.json came out empty). Same pattern as lens-scan's drive.mjs.
 */
export function isEntry(argv1, url) {
  if (!argv1) return false;
  try { return realpathSync(resolve(argv1)) === realpathSync(fileURLToPath(url)); } catch { return resolve(argv1) === fileURLToPath(url); }
}

if (isEntry(process.argv[1], import.meta.url)) {
  // exitCode, not exit(): exiting while fetch's sockets close trips a libuv assertion on Windows.
  process.exitCode = await main(process.argv.slice(2));
}

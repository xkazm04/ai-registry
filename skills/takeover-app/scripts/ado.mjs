#!/usr/bin/env node
// ado - Azure DevOps work items into the lens-scan store, so an inherited app's existing backlog and the scan's
// findings rank in ONE queue (takeover-app phase P5). Import is built and fixture-tested; write-back is a designed,
// DISABLED adapter (references/ado-sync.md): the operator gets ticket communication only after a smoke test on a real
// org, never by accident.
//
//   node ado.mjs import --product-root <repo> [--org o --project p] [--wiql <file> | --query-id <id>]
//                       [--fixture <json>] [--dry-run] [--db <scan.db>] [--structure <app-structure.json>]
//     Reads the PAT from <repo>/.env.local AZURE_DEVOPS_PAT (never printed, never logged, redacted from errors).
//     REST api-version 7.1: the WIQL (POST wiql, or GET wiql/<query id>), then workitemsbatch in chunks of 200.
//     --fixture <json> replays a recorded answer instead ({wiql, batches: [{value}]}, or {value}, or an array).
//     Each item maps per ado-map.mjs; new ones become `work-item` proposals in one propose run, an external_ref the
//     store already holds is refreshed with update-external when its title, body or link changed, else skipped.
//     An item whose area path matches no feature lands in `backlog`; the importer adds that feature to the
//     app-structure when it is missing. --dry-run writes nothing and lists what it would do.
//     -> {imported, updated, skipped, run?, backlog?, dry_run?, items?}
//   node ado.mjs sync --product-root <repo> [--dry-run] [--enable-write]
//     Imported items whose status the store owns (approved and later) -> System.State + a comment, per the state map.
//   node ado.mjs push --product-root <repo> --ids a,b [--dry-run] [--enable-write]
//     Scan items -> new work items (JSON-patch create payloads).
//     push and sync REFUSE (exit 1) unless --enable-write AND the overlay's `ado.write: true`; --dry-run prints the
//     payloads and sends nothing, with or without the switches. push refuses even then: the store cannot yet record
//     a new work item's id on a scan-origin item, so a second push would duplicate it (ado-sync.md, open gaps).
//
// Defaults: --db <repo>/.ai/lens-scan/scan.db, --structure beside the db; org, project, wiql/query_id, areaPathMap,
// process and write from <repo>/.claude/takeover-app/config.md `ado:` (flags win). Exit codes are the registry's
// (scripts/lib/exit-codes.mjs): 0 ok, 1 refused by a rule, 2 could not run (usage, missing input, network).
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import { dirname, join, resolve, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  mapWorkItem, featureIndex, batchBodies, wiqlIds, syncRequest, pushRequest, API_VERSION, projectBase, BACKLOG_FEATURE,
} from './ado-map.mjs';
import { readOverlay } from './overlay.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
// The registry's one declaration of exit meanings. A copied (not linked) installation has no registry beside it,
// so the same frozen values stand in - the codes cannot drift, they are the declaration's own.
let EXIT;
try { ({ EXIT } = await import(pathToFileURL(resolve(HERE, '../../../scripts/lib/exit-codes.mjs')).href)); } catch { EXIT = Object.freeze({ OK: 0, VIOLATIONS: 1, FATAL: 2, CONTENDED: 3 }); }

export class AdoError extends Error {
  constructor(message, code) { super(message); this.code = code; }
}
const fatal = (m) => { throw new AdoError(m, EXIT.FATAL); };
const refused = (m) => { throw new AdoError(m, EXIT.VIOLATIONS); };

/** lens-scan's store, the only writer of scan.db: the sibling skill in the same lane (or installation). */
export const STORE_SCRIPT = resolve(HERE, '../../lens-scan/scripts/store.mjs');
export async function loadStore(path = STORE_SCRIPT) {
  if (!existsSync(path)) fatal(`lens-scan is not installed beside takeover-app (${path} missing) - link it, then rerun`);
  const s = await import(pathToFileURL(path).href);
  if (!s.KINDS?.includes('work-item') || typeof s.updateExternal !== 'function') {
    fatal('lens-scan store is older than v4 (no work-item kind / update-external) - update lens-scan before importing');
  }
  return s;
}

// ------------------------------------------------------------------------------------- secrets
/** AZURE_DEVOPS_PAT from <root>/.env.local; undefined when absent. The value never leaves this module but in a header. */
export function readPat(root) {
  const p = join(root, '.env.local');
  if (!existsSync(p)) return undefined;
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = /^\s*(?:export\s+)?AZURE_DEVOPS_PAT\s*=\s*(.*)$/.exec(line);
    if (!m) continue;
    let v = m[1].trim();
    const q = /^(['"])(.*?)\1/.exec(v);
    v = q ? q[2] : v.replace(/\s+#.*$/, '');
    return v || undefined;
  }
  return undefined;
}
/** Every occurrence of a secret (and its Basic-auth form) in a text, replaced. */
export function redact(text, pat) {
  let t = String(text);
  if (!pat) return t;
  for (const s of [pat, Buffer.from(`:${pat}`).toString('base64')]) t = t.split(s).join('[redacted]');
  return t;
}

// ------------------------------------------------------------------------------------- http
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
/**
 * One ADO REST call. 429 and 503 are retried (Retry-After honoured, capped at 60 s, 4 attempts): ADO's
 * global rate limiter answers 429 with a Retry-After and expects the client to back off.
 */
export async function adoFetch(url, { method = 'GET', body, pat, contentType = 'application/json', fetchImpl = globalThis.fetch } = {}) {
  if (!pat) fatal('no AZURE_DEVOPS_PAT in <repo>/.env.local (the importer reads it there and nowhere else)');
  const headers = { Authorization: `Basic ${Buffer.from(`:${pat}`).toString('base64')}`, Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = contentType;
  for (let attempt = 1; ; attempt += 1) {
    let res;
    try {
      res = await fetchImpl(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    } catch (e) { fatal(redact(`${method} ${url} failed: ${e.message}`, pat)); }
    if ((res.status === 429 || res.status === 503) && attempt < 4) {
      const after = Number(res.headers?.get?.('retry-after'));
      await wait(Math.min(60, Number.isFinite(after) && after > 0 ? after : 2 ** attempt) * 1000);
      continue;
    }
    const text = await res.text();
    if (res.status === 203 || /<html/i.test(text.slice(0, 200))) fatal(`${method} ${url}: ADO answered a sign-in page - the PAT is invalid or expired`);
    if (!res.ok) fatal(redact(`${method} ${url}: HTTP ${res.status} ${text.slice(0, 300)}`, pat));
    try { return text ? JSON.parse(text) : {}; } catch { fatal(`${method} ${url}: the answer is not JSON`); }
  }
}

/** WIQL (text or saved query id) -> every work item it lists, with the mapped fields. */
export async function fetchWorkItems({ org, project, wiql, queryId, pat, fetchImpl }) {
  const base = projectBase(org, project);
  const answer = queryId
    ? await adoFetch(`${base}/_apis/wit/wiql/${encodeURIComponent(queryId)}?api-version=${API_VERSION}`, { pat, fetchImpl })
    : await adoFetch(`${base}/_apis/wit/wiql?api-version=${API_VERSION}`, { method: 'POST', body: { query: wiql }, pat, fetchImpl });
  const items = [];
  for (const b of batchBodies(wiqlIds(answer))) {
    const r = await adoFetch(`${base}/_apis/wit/workitemsbatch?api-version=${API_VERSION}`, { method: 'POST', body: b, pat, fetchImpl });
    items.push(...(r.value ?? []));
  }
  return items;
}

/** A recorded answer: {wiql, batches: [{value}]} (the shape ado.mjs fetches), {value: [...]}, or an array. */
export function fixtureItems(json) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.value)) return json.value;
  if (Array.isArray(json?.batches)) {
    const items = json.batches.flatMap((b) => b?.value ?? []);
    const listed = json.wiql ? new Set(wiqlIds(json.wiql).map(Number)) : null;
    return listed ? items.filter((w) => listed.has(Number(w.id))) : items;
  }
  fatal('the fixture holds {wiql, batches: [{value}]}, {value: [...]} or an array of work items');
}

// ------------------------------------------------------------------------------------- the import
const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch (e) { fatal(`${p} is not readable JSON (${e.message})`); } };

/**
 * Adds the `backlog` feature to the app-structure when it is missing, atomically (lens-scan structure.mjs's
 * writer). A declared product tree (what adopt-bp writes) keeps it across re-maps; a 1:1 contexts tree drops it
 * on the next structure.mjs run - the items keep their feature in the store either way.
 */
export async function ensureBacklogFeature(structurePath) {
  if (!existsSync(structurePath)) return { added: false, reason: 'no app-structure' };
  const s = readJson(structurePath);
  if ((s.features ?? []).some((f) => f?.slug === BACKLOG_FEATURE)) return { added: false };
  const { writeAtomic } = await import(pathToFileURL(resolve(dirname(STORE_SCRIPT), 'structure.mjs')).href);
  s.features = [...(s.features ?? []), {
    slug: BACKLOG_FEATURE,
    name: 'Backlog',
    summary: 'Imported work items whose area path matches no feature (takeover-app ado import).',
    kind: 'backlog',
  }];
  writeAtomic(structurePath, `${JSON.stringify(s, null, 2)}\n`);
  return { added: true };
}

/**
 * Work items -> the store. `store` is lens-scan's store module (loadStore). Returns the summary; with dryRun the
 * store is only read (and only when it exists).
 */
export async function importItems({ items, dbPath, structurePath, org, project, areaPathMap, dryRun = false, store, note }) {
  const structure = existsSync(structurePath) ? readJson(structurePath) : undefined;
  const index = featureIndex(structure);
  const mapped = [];
  const errors = [];
  for (const wi of items) {
    try {
      const m = mapWorkItem(wi, { org, project, index, areaPathMap });
      if (!m.externalUrl && typeof wi?._links?.html?.href === 'string') m.externalUrl = wi._links.html.href;
      mapped.push(m);
    } catch (e) { errors.push(e.message); }
  }
  const db = dryRun ? store.openStore(dbPath, { readOnly: true }) : store.openStore(dbPath);
  const existing = (ref) => db?.prepare('SELECT id, title, body, external_url FROM proposals WHERE external_ref = ?').get(ref);
  const plan = mapped.map((m) => {
    const cur = existing(m.externalRef);
    if (!cur) return { action: 'import', m };
    const change = {};
    if (cur.title !== m.title) change.title = m.title;
    if ((cur.body ?? '') !== m.body) change.body = m.body;
    if (m.externalUrl && cur.external_url !== m.externalUrl) change.externalUrl = m.externalUrl;
    return { action: Object.keys(change).length ? 'update' : 'skip', m, id: cur.id, change };
  });
  const summary = { imported: 0, updated: 0, skipped: 0 };
  const backlog = plan.filter((p) => p.action === 'import' && p.m.feature === BACKLOG_FEATURE).length;
  if (dryRun) {
    db?.close();
    for (const p of plan) summary[{ import: 'imported', update: 'updated', skip: 'skipped' }[p.action]] += 1;
    return clean({ ...summary, backlog: backlog || undefined, structure: structure ? undefined : "absent - no feature to match, every item maps to backlog (run P4 first)", errors: errors.length ? errors : undefined, dry_run: true,
      items: plan.map((p) => clean({ action: p.action, id: p.id, external_ref: p.m.externalRef, feature: p.m.feature, lens: p.m.lens,
        tier: p.m.tier, risk_class: p.m.riskClass, title: p.m.title, changed: p.change && Object.keys(p.change).length ? Object.keys(p.change) : undefined })) });
  }
  let run;
  try {
    const fresh = plan.filter((p) => p.action === 'import');
    if (fresh.length) {
      run = store.runStart(db, { phase: 'propose', lenses: [...new Set(fresh.map((p) => p.m.lens))], note: note ?? 'takeover-app ado import' }).id;
    }
    for (const p of plan) {
      if (p.action === 'skip') { summary.skipped += 1; continue; }
      if (p.action === 'update') { store.updateExternal(db, { id: p.id, ...p.change }); summary.updated += 1; continue; }
      try {
        store.propose(db, { run, ...p.m });
        store.activity(db, { run, kind: 'proposed', feature: p.m.feature, lens: p.m.lens, text: `${p.m.externalRef} ${p.m.title}` });
        summary.imported += 1;
      } catch (e) {
        // a concurrent importer took the ref between the read and the insert: the store names the row; refresh it
        const id = e?.detail?.existing;
        if (!id) throw e;
        store.updateExternal(db, { id, title: p.m.title, body: p.m.body, ...(p.m.externalUrl ? { externalUrl: p.m.externalUrl } : {}) });
        summary.updated += 1;
      }
    }
    if (run) store.runEnd(db, { run, status: 'done', note: `${note ?? 'takeover-app ado import'}: ${summary.imported} imported, ${summary.updated} updated, ${summary.skipped} unchanged` });
  } catch (e) {
    if (run) { try { store.runEnd(db, { run, status: 'failed', note: String(e.message).slice(0, 200) }); } catch { /* the run is the store's to reconcile */ } }
    throw e;
  } finally { db.close(); }
  const added = backlog ? await ensureBacklogFeature(structurePath) : undefined;
  return clean({ ...summary, run, backlog: backlog || undefined, structure: structure ? undefined : "absent - no feature to match, every item maps to backlog (run P4 first)", backlog_feature_added: added?.added || undefined,
    errors: errors.length ? errors : undefined });
}
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null));

// ------------------------------------------------------------------------------------- write-back (disabled)
/** The two switches: the invocation's --enable-write AND the overlay's ado.write: true. */
export function writeAllowed(args, overlay) {
  return args.enableWrite === true && overlay?.ado?.write === true;
}
function needWrite(cmd, args, overlay) {
  if (args.dryRun) return;
  if (!writeAllowed(args, overlay)) {
    refused(`${cmd} writes to Azure DevOps and is off: it needs --enable-write AND \`ado.write: true\` in .claude/takeover-app/config.md `
      + `(have: --enable-write ${args.enableWrite === true ? 'yes' : 'no'}, ado.write ${overlay?.ado?.write === true ? 'true' : 'not true'}). `
      + 'Use --dry-run to see the payloads; smoke-test on a real org first (references/ado-sync.md).');
  }
}

export async function syncPlan({ store, dbPath, org, project, process = 'agile' }) {
  const db = store.openStore(dbPath, { readOnly: true });
  if (!db) return [];
  try { return store.proposals(db, { origin: 'ado' }).map((p) => syncRequest(p, { org, project, process })).filter(Boolean); } finally { db.close(); }
}
export async function pushPlan({ store, dbPath, ids, org, project, process = 'agile', areaPath }) {
  const db = store.openStore(dbPath, { readOnly: true });
  if (!db) return [];
  try { return store.proposals(db, { ids }).map((p) => pushRequest(p, { org, project, process, areaPath })).filter(Boolean); } finally { db.close(); }
}

/** Sends the sync requests: a state already at its target is left alone, so a re-run neither re-patches nor re-comments. */
async function sendSync(reqs, { pat, fetchImpl }) {
  const out = { sent: 0, unchanged: 0 };
  for (const r of reqs) {
    const getUrl = r.url.replace(/\?api-version=.*$/, `?fields=System.State,System.Rev&api-version=${API_VERSION}`);
    const cur = await adoFetch(getUrl, { pat, fetchImpl });
    if (cur?.fields?.['System.State'] === r.body[0].value) { out.unchanged += 1; continue; }
    // test the revision read above: an edit made in ADO since then fails the patch instead of being overwritten
    await adoFetch(r.url, { method: 'PATCH', body: [{ op: 'test', path: '/rev', value: cur.rev }, ...r.body], contentType: r.contentType, pat, fetchImpl });
    await adoFetch(r.comment.url, { method: 'POST', body: r.comment.body, pat, fetchImpl });
    out.sent += 1;
  }
  return out;
}

// ------------------------------------------------------------------------------------- cli
export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const key = a.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) out[key] = true;
    else { out[key] = next; i += 1; }
  }
  return out;
}
const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
const HELP = readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\nimport ')[0].replace(/^#!.*\n/, '').replace(/^\/\/ ?/gm, '');

export async function main(argv, { fetchImpl } = {}) {
  const a = parseArgs(argv);
  const cmd = a._[0];
  if (!cmd || a.help) return { help: HELP };
  if (!['import', 'push', 'sync'].includes(cmd)) fatal(`unknown subcommand ${JSON.stringify(cmd)} - run with --help`);
  const root = str(a.productRoot) ? resolve(a.productRoot) : fatal('--product-root <repo> is required');
  if (!existsSync(root)) fatal(`--product-root ${root} does not exist`);
  const overlay = readOverlay(root);
  const ado = overlay.ado ?? {};
  const org = str(a.org) ?? str(ado.org);
  const project = str(a.project) ?? str(ado.project);
  const adoProcess = str(a.process) ?? str(ado.process) ?? 'agile';
  const dbPath = str(a.db) ? resolve(a.db) : join(root, '.ai/lens-scan/scan.db');
  const structurePath = str(a.structure) ? resolve(a.structure) : join(dirname(dbPath), 'app-structure.json');
  const store = await loadStore();
  const rel = (p) => (isAbsolute(p) ? p : join(root, p));

  if (cmd === 'import') {
    let items;
    if (str(a.fixture)) items = fixtureItems(readJson(resolve(a.fixture)));
    else {
      if (!org || !project) fatal('import needs --org and --project (or ado.org / ado.project in the overlay), or a --fixture');
      const queryId = str(a.queryId) ?? str(ado.query_id ?? ado.queryId);
      const wiqlFile = str(a.wiql) ?? str(ado.wiql);
      if (!queryId && !wiqlFile) fatal('import needs --wiql <file> or --query-id <id> (or ado.wiql / ado.query_id in the overlay)');
      const wiql = queryId ? undefined : (existsSync(rel(wiqlFile)) ? readFileSync(rel(wiqlFile), 'utf8') : fatal(`--wiql ${wiqlFile} does not exist`));
      const pat = readPat(root);
      items = await fetchWorkItems({ org, project, wiql, queryId, pat, fetchImpl });
    }
    return importItems({ items, dbPath, structurePath, org, project, areaPathMap: ado.areaPathMap ?? {}, dryRun: a.dryRun === true, store });
  }

  needWrite(cmd, a, overlay);
  if (!org || !project) fatal(`${cmd} needs --org and --project (or ado.org / ado.project in the overlay)`);
  if (cmd === 'sync') {
    const reqs = await syncPlan({ store, dbPath, org, project, process: adoProcess });
    if (a.dryRun) return { dry_run: true, requests: reqs };
    return { ...(await sendSync(reqs, { pat: readPat(root), fetchImpl })), requests: reqs.length };
  }
  // push
  const ids = str(a.ids) ?? fatal('push names the scan items it creates work items for: --ids a,b');
  const reqs = await pushPlan({ store, dbPath, ids, org, project, process: adoProcess, areaPath: str(a.areaPath) ?? str(ado.area_path ?? ado.areaPath) });
  if (a.dryRun) return { dry_run: true, requests: reqs };
  refused('push is designed, not enabled: the store cannot record the created work item id on a scan-origin item yet, '
    + 'so a second push would duplicate it (references/ado-sync.md, open gaps). --dry-run shows the payloads.');
}

function isEntry(argv1, url) {
  try { return realpathSync(resolve(argv1)) === realpathSync(fileURLToPath(url)); } catch { return resolve(argv1) === fileURLToPath(url); }
}
if (process.argv[1] && isEntry(process.argv[1], import.meta.url)) {
  try {
    const out = await main(process.argv.slice(2));
    if (out?.help) process.stdout.write(out.help);
    else process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
    process.exit(EXIT.OK);
  } catch (e) {
    process.stderr.write(`ado: ${e.message}\n`);
    process.exit(e instanceof AdoError ? e.code : e?.code === 1 || e?.code === 2 ? e.code : EXIT.FATAL);
  }
}

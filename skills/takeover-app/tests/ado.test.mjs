// node --test "skills/takeover-app/tests/*.mjs"
// Pins the ADO import contract (store v4 wire contract, references/ado-sync.md) on a recorded fixture: the pure
// mapping of six representative work items, the end-to-end import into a temp lens-scan store, an idempotent
// re-import that refreshes changed text, and the write-back switches - push and sync refuse unless BOTH
// --enable-write and the overlay's ado.write: true are set, while --dry-run prints payloads of the documented shape.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  mapWorkItem, featureIndex, featureOf, stripHtml, tierOf, batchBodies, wiqlIds, syncRequest, pushRequest, STATE_MAP,
} from '../scripts/ado-map.mjs';
import { fixtureItems, readPat, redact, main, writeAllowed, STORE_SCRIPT, adoFetch } from '../scripts/ado.mjs';
import { parseOverlay } from '../scripts/overlay.mjs';

const made = [];
const tmp = (p) => { const d = mkdtempSync(join(tmpdir(), p)); made.push(d); return d; };
after(() => { for (const d of made) rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

const FIXTURE = fileURLToPath(new URL('./fixtures/ado-workitems.json', import.meta.url));
const SCRIPT = fileURLToPath(new URL('../scripts/ado.mjs', import.meta.url));
const items = fixtureItems(JSON.parse(readFileSync(FIXTURE, 'utf8')));
const STRUCTURE = {
  features: [
    { slug: 'invoices', name: 'Invoices', contexts: ['invoices'] },
    { slug: 'supplier-management', name: 'Supplier management', contexts: ['Suppliers'] },
    { slug: 'crm', name: 'CRM contacts', contexts: ['crm'] },
  ],
};
const ctx = { org: 'contoso', project: 'Ledger', index: featureIndex(STRUCTURE) };
const byId = Object.fromEntries(items.map((w) => [w.id, mapWorkItem(w, ctx)]));

// lens-scan's store v4 is another package's work (B1); the end-to-end tests need it and say so when it is absent
const storeV4 = await import(pathToFileURL(STORE_SCRIPT).href).then((s) => s.KINDS?.includes('work-item') && typeof s.updateExternal === 'function', () => false);
const NEEDS_V4 = storeV4 ? false : 'lens-scan store.mjs is not v4 yet (no work-item kind / updateExternal) - the end-to-end import cannot run';

test('fixture: the recorded WIQL lists six items and the batch carries all six', () => {
  assert.equal(items.length, 6);
  assert.deepEqual(wiqlIds(JSON.parse(readFileSync(FIXTURE, 'utf8')).wiql), [101, 102, 103, 104, 105, 106]);
});

test('mapping: a P1 bug -> quality, tier 1, reliability, repro steps as body, display name only', () => {
  const m = byId[101];
  assert.equal(m.kind, 'work-item');
  assert.equal(m.origin, 'ado');
  assert.equal(m.externalRef, 'ado:101');
  assert.equal(m.externalUrl, 'https://dev.azure.com/contoso/Ledger/_workitems/edit/101');
  assert.equal(m.feature, 'invoices');
  assert.equal(m.lens, 'quality');
  assert.equal(m.tier, 1);
  assert.equal(m.riskClass, 'reliability');
  assert.equal(m.title, 'Invoice totals double-count credit notes');
  assert.match(m.body, /Total shows 140 & not 80/);
  assert.match(m.body, /State: Active/);
  assert.match(m.body, /Assigned to: Jane Doe/);
  assert.ok(!m.body.includes('example.com'), 'the unique name (an email) never reaches the store');
  assert.ok(!/<[a-z]/i.test(m.body), 'HTML is stripped');
});

test('mapping: a P2 story -> business, tier 2, no risk class (left to triage), acceptance criteria kept', () => {
  const m = byId[102];
  assert.equal(m.lens, 'business');
  assert.equal(m.feature, 'supplier-management', 'area path segment matches a context name case-insensitively');
  assert.equal(m.tier, 2);
  assert.equal(m.riskClass, undefined);
  assert.match(m.body, /As a buyer I want the supplier list as CSV\./);
  assert.match(m.body, /Acceptance criteria:\n- All columns exported\n- UTF-8 with BOM/);
});

test('mapping: a P3 task -> tier 3; the area path matches a feature NAME', () => {
  const m = byId[103];
  assert.equal(m.tier, 3);
  assert.equal(m.lens, 'business');
  assert.equal(m.feature, 'crm');
});

test('mapping: a security tag -> security lens, authz, whatever the type', () => {
  const m = byId[104];
  assert.equal(m.lens, 'security');
  assert.equal(m.riskClass, 'authz');
  assert.equal(m.tier, 2);
});

test('mapping: severity 1 - Critical -> tier 0 over its priority', () => {
  const m = byId[105];
  assert.equal(m.tier, 0);
  assert.equal(m.lens, 'quality');
  assert.equal(m.riskClass, 'reliability');
});

test('mapping: an unknown area path -> backlog; no priority -> untriaged (absent, never null)', () => {
  const m = byId[106];
  assert.equal(m.feature, 'backlog');
  assert.equal('tier' in m, false);
  assert.equal('riskClass' in m, false);
  assert.ok(Object.values(m).every((v) => v !== null && v !== undefined));
});

test('mapping: an overlay areaPathMap entry wins over the index, by full path or last segment', () => {
  const idx = featureIndex(STRUCTURE);
  assert.equal(featureOf('Ledger\\Reporting\\Board', idx, { 'Ledger\\Reporting\\Board': 'invoices' }), 'invoices');
  assert.equal(featureOf('Ledger\\Reporting\\Board', idx, { board: 'crm' }), 'crm');
  assert.equal(featureOf('Ledger\\Invoices', idx, {}), 'invoices');
  assert.equal(featureOf('', idx, {}), 'backlog');
});

test('pure helpers: tiers, HTML, batches of 200', () => {
  assert.equal(tierOf({ 'Microsoft.VSTS.Common.Priority': 4 }), 3);
  assert.equal(tierOf({}), undefined);
  assert.equal(stripHtml('<p>a&nbsp;&lt;b&gt;</p><br/>c &#39;d&#x27;'), "a <b>\n\nc 'd'");
  const ids = Array.from({ length: 450 }, (_, i) => i + 1);
  const b = batchBodies(ids);
  assert.deepEqual(b.map((x) => x.ids.length), [200, 200, 50]);
  assert.ok(b[0].fields.includes('System.Title'));
});

test('secrets: the PAT is read from .env.local and redacted (plain and Basic form) from any text', () => {
  const root = tmp('takeover-pat-');
  writeFileSync(join(root, '.env.local'), 'OTHER=1\nexport AZURE_DEVOPS_PAT="s3cr3t-pat" # comment\n');
  assert.equal(readPat(root), 's3cr3t-pat');
  const basic = Buffer.from(':s3cr3t-pat').toString('base64');
  assert.equal(redact(`x s3cr3t-pat y ${basic}`, 's3cr3t-pat'), 'x [redacted] y [redacted]');
  assert.equal(readPat(tmp('takeover-nopat-')), undefined);
});

test('http: WIQL then workitemsbatch with Basic auth, and a 429 is retried', async () => {
  const calls = [];
  let n = 0;
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    n += 1;
    if (n === 1) return { status: 429, ok: false, headers: { get: () => '0.01' }, text: async () => '' };
    return { status: 200, ok: true, headers: { get: () => null }, text: async () => JSON.stringify({ workItems: [] }) };
  };
  const r = await adoFetch('https://dev.azure.com/contoso/Ledger/_apis/wit/wiql?api-version=7.1', { method: 'POST', body: { query: 'x' }, pat: 'p', fetchImpl });
  assert.deepEqual(r, { workItems: [] });
  assert.equal(calls.length, 2);
  assert.equal(calls[1].init.headers.Authorization, `Basic ${Buffer.from(':p').toString('base64')}`);
});

// ------------------------------------------------------------------------------------- end to end (store v4)
function product() {
  const root = tmp('takeover-ado-');
  mkdirSync(join(root, '.ai/lens-scan'), { recursive: true });
  writeFileSync(join(root, '.ai/lens-scan/app-structure.json'), `${JSON.stringify({ ...STRUCTURE, provenance: { product_tree: 'declared' } }, null, 2)}\n`);
  return root;
}
const run = (args) => main(args, { fetchImpl: () => { throw new Error('no network in tests'); } });

test('import: the fixture lands as six work-item proposals in one propose run, backlog feature added', { skip: NEEDS_V4 }, async () => {
  const root = product();
  const out = await run(['import', '--product-root', root, '--org', 'contoso', '--project', 'Ledger', '--fixture', FIXTURE]);
  assert.equal(out.imported, 6);
  assert.equal(out.updated, 0);
  assert.equal(out.skipped, 0);
  assert.match(out.run, /^r-/);
  assert.equal(out.backlog, 1);
  const store = await import(pathToFileURL(STORE_SCRIPT).href);
  const db = store.openStore(join(root, '.ai/lens-scan/scan.db'));
  try {
    const rows = store.proposals(db, { origin: 'ado' });
    assert.equal(rows.length, 6);
    assert.ok(rows.every((p) => p.kind === 'work-item' && p.status === 'proposed' && /^ado:\d+$/.test(p.external_ref)));
    assert.equal(rows[0].external_ref, 'ado:105', 'tier 0 sorts first');
    const crit = rows.find((p) => p.external_ref === 'ado:105');
    assert.equal(crit.tier, 0);
    assert.equal(crit.risk_class, 'reliability');
    const board = rows.find((p) => p.external_ref === 'ado:106');
    assert.equal(board.feature, 'backlog');
    assert.equal('tier' in board, false, 'untriaged is omitted, never null');
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM runs WHERE phase = 'propose' AND status = 'done'").get().n, 1);
  } finally { db.close(); }
  const s = JSON.parse(readFileSync(join(root, '.ai/lens-scan/app-structure.json'), 'utf8'));
  assert.ok(s.features.some((f) => f.slug === 'backlog'));
});

test('import: a re-import is idempotent; a changed title refreshes the item through update-external', { skip: NEEDS_V4 }, async () => {
  const root = product();
  const args = ['import', '--product-root', root, '--org', 'contoso', '--project', 'Ledger', '--fixture', FIXTURE];
  await run(args);
  const again = await run(args);
  assert.deepEqual({ imported: again.imported, updated: again.updated, skipped: again.skipped }, { imported: 0, updated: 0, skipped: 6 });
  assert.equal(again.run, undefined, 'nothing new, no run opened');

  const changed = JSON.parse(readFileSync(FIXTURE, 'utf8'));
  changed.batches[0].value[1].fields['System.Title'] = 'Export supplier list to CSV and XLSX';
  const f2 = join(tmp('takeover-fx-'), 'changed.json');
  writeFileSync(f2, JSON.stringify(changed));
  const third = await run(['import', '--product-root', root, '--org', 'contoso', '--project', 'Ledger', '--fixture', f2]);
  assert.deepEqual({ imported: third.imported, updated: third.updated, skipped: third.skipped }, { imported: 0, updated: 1, skipped: 5 });
  const store = await import(pathToFileURL(STORE_SCRIPT).href);
  const db = store.openStore(join(root, '.ai/lens-scan/scan.db'));
  try {
    const rows = store.proposals(db, { origin: 'ado' });
    assert.equal(rows.length, 6, 'never a duplicate');
    assert.equal(rows.find((p) => p.external_ref === 'ado:102').title, 'Export supplier list to CSV and XLSX');
  } finally { db.close(); }
});

test('import --dry-run writes nothing and lists what it would do', { skip: NEEDS_V4 }, async () => {
  const root = product();
  const out = await run(['import', '--product-root', root, '--org', 'contoso', '--project', 'Ledger', '--fixture', FIXTURE, '--dry-run']);
  assert.equal(out.dry_run, true);
  assert.equal(out.imported, 6);
  assert.equal(out.items.length, 6);
  assert.equal(existsSync(join(root, '.ai/lens-scan/scan.db')), false, 'no store created');
});

// ------------------------------------------------------------------------------------- write-back stays off
test('switches: write needs BOTH --enable-write and ado.write: true', () => {
  assert.equal(writeAllowed({ enableWrite: true }, { ado: { write: true } }), true);
  assert.equal(writeAllowed({ enableWrite: true }, { ado: { write: false } }), false);
  assert.equal(writeAllowed({}, { ado: { write: true } }), false);
  assert.equal(writeAllowed({ enableWrite: true }, {}), false);
});

function overlay(root, write) {
  mkdirSync(join(root, '.claude/takeover-app'), { recursive: true });
  writeFileSync(join(root, '.claude/takeover-app/config.md'), `---\nado:\n  org: contoso\n  project: Ledger\n  process: agile\n  write: ${write}\n---\n`);
}
const cli = (args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });

for (const [label, flags, write] of [['no switch', [], false], ['only --enable-write', ['--enable-write'], false], ['only ado.write', [], true]]) {
  test(`push and sync refuse (exit 1) with ${label}`, { skip: NEEDS_V4 }, () => {
    const root = product();
    overlay(root, write);
    for (const cmd of [['sync'], ['push', '--ids', 'p-000000']]) {
      const r = cli([...cmd, '--product-root', root, ...flags]);
      assert.equal(r.status, 1, `${cmd[0]}: ${r.stderr}`);
      assert.match(r.stderr, /--enable-write AND `ado.write: true`/);
    }
  });
}

test('push refuses even with both switches: the store cannot record the new item id yet', { skip: NEEDS_V4 }, () => {
  const root = product();
  overlay(root, true);
  const r = cli(['push', '--product-root', root, '--ids', 'p-000000', '--enable-write']);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /designed, not enabled/);
});

test('sync --dry-run: state patches for items the store owns, with the comment payload', { skip: NEEDS_V4 }, async () => {
  const root = product();
  overlay(root, false);
  await run(['import', '--product-root', root, '--fixture', FIXTURE]);
  const store = await import(pathToFileURL(STORE_SCRIPT).href);
  const db = store.openStore(join(root, '.ai/lens-scan/scan.db'));
  const id = store.proposals(db, { origin: 'ado' }).find((p) => p.external_ref === 'ado:105').id;
  store.decide(db, { ids: id, decision: 'approve', by: 'operator:test' });
  db.close();
  const r = cli(['sync', '--product-root', root, '--dry-run']);
  assert.equal(r.status, 0, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.equal(out.dry_run, true);
  assert.equal(out.requests.length, 1, 'proposed items stay ADO-owned; only the approved one syncs');
  const q = out.requests[0];
  assert.equal(q.method, 'PATCH');
  assert.equal(q.url, 'https://dev.azure.com/contoso/Ledger/_apis/wit/workitems/105?api-version=7.1');
  assert.equal(q.contentType, 'application/json-patch+json');
  assert.deepEqual(q.body, [{ op: 'add', path: '/fields/System.State', value: 'Active' }]);
  assert.match(q.comment.body.text, new RegExp(`^\\[bp\\] ${id} is approved: Payment run posts twice on retry`));
});

test('payload builders: the state map and a push create payload', () => {
  assert.equal(STATE_MAP.agile.released, 'Closed');
  assert.equal(STATE_MAP.agile.descoped, 'Removed');
  assert.equal(syncRequest({ id: 'p-1', status: 'proposed', external_ref: 'ado:1', title: 't' }, { org: 'o', project: 'p' }), undefined);
  const push = pushRequest({ id: 'p-abc123', origin: 'scan', lens: 'security', title: 'Rate-limit login', body: 'a <b>\nc', tier: 0, risk_class: 'authz' },
    { org: 'contoso', project: 'Ledger' });
  assert.equal(push.method, 'POST');
  assert.equal(push.url, 'https://dev.azure.com/contoso/Ledger/_apis/wit/workitems/$Bug?api-version=7.1');
  assert.deepEqual(push.body.find((o) => o.path === '/fields/System.Tags').value, 'bp; bp:p-abc123; lens:security; T0; risk:authz');
  assert.equal(push.body.find((o) => o.path === '/fields/System.Description').value, 'a &lt;b&gt;<br>c');
  assert.equal(pushRequest({ id: 'p-2', origin: 'ado', external_ref: 'ado:9', title: 't' }, { org: 'o', project: 'p' }), undefined);
});

test('overlay: the YAML subset reads the ado block, the area path map and inline lists', () => {
  const o = parseOverlay('---\nbp: ../bp\njudge_model: opus # the judge\nado:\n  org: contoso\n  project: "Ledger App"\n  write: false\n  areaPathMap:\n    "Ledger\\\\CRM": crm\n    Suppliers: supplier-management\ntop_screens: [dashboard, invoices]\n---\n## Gates\nnpm test\n');
  assert.equal(o.bp, '../bp');
  assert.equal(o.judge_model, 'opus');
  assert.equal(o.ado.project, 'Ledger App');
  assert.equal(o.ado.write, false);
  assert.deepEqual(o.ado.areaPathMap, { 'Ledger\\CRM': 'crm', Suppliers: 'supplier-management' });
  assert.deepEqual(o.top_screens, ['dashboard', 'invoices']);
  assert.equal(o.sections.Gates, 'npm test');
});

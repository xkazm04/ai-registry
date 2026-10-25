// node --test skills/lens-scan/tests
// Pins harness.py's reading of the generic `## Harness` overlay (SKILL.md "Harness") without a browser: --dry
// parses and plans, starts nothing. Skipped when no Python is on PATH; the capture itself needs Playwright and
// is shown by hand (a static fixture site, one route missing -> unscreenable).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Every temp dir this file makes is removed when its tests are done: on 2026-10-15 these
// suites had left hundreds in the OS temp dir (hygiene disk lane, temp-leak rows).
const madeDirs = [];
const mkdtempTracked = (prefix) => { const d = mkdtempSync(prefix); madeDirs.push(d); return d; };
after(() => { for (const d of madeDirs) rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

const SCRIPT = fileURLToPath(new URL('../scripts/harness.py', import.meta.url));
const PY = ['python', 'python3'].find((p) => spawnSync(p, ['--version']).status === 0);

function overlay(body) {
  const root = mkdtempTracked(join(tmpdir(), 'lens-scan-harness-'));
  mkdirSync(join(root, '.claude', 'lens-scan'), { recursive: true });
  writeFileSync(join(root, '.claude', 'lens-scan', 'config.md'), `---\ndefault_lens: design\n---\n\n## Harness\n${body}\n## Probes\nnone\n`);
  return root;
}
const harness = (root, ...args) => spawnSync(PY, ['-I', SCRIPT, '--root', root, '--run', 'r-20261014000000-abcd', '--dry', ...args], { encoding: 'utf8' });

test('harness --dry: the generic form parses; unscreenable features are listed; an unmapped scoped feature is named', { skip: !PY && 'no python on PATH' }, () => {
  const root = overlay(`command: npm run dev -- --port 4173      # starts the front end
url: http://localhost:4173
ready: /
sizes: 1280x800, 390x844
themes: light, dark
theme: query ?theme=
features:
  invoices: route /invoices?tab=open      # a query in a route survives the comment rule
  settings: steps click "Settings" > click "Billing"
  tray: unscreenable "native window only"
`);
  const r = harness(root, '--features', 'invoices,tray,ghost');
  assert.equal(r.status, 0, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.deepEqual(out.unscreenable, [{ feature: 'tray', why: 'native window only' }]);
  assert.deepEqual(out.unmapped, ['ghost']);
  assert.deepEqual([out.shots, out.measurements], [[], []], '--dry captures nothing');
  // a comma list typed with spaces names the same features (store.mjs and drive.mjs trim theirs)
  const spaced = JSON.parse(harness(root, '--features', 'invoices, tray , ghost').stdout);
  assert.deepEqual(spaced.unscreenable, [{ feature: 'tray', why: 'native window only' }]);
  assert.deepEqual(spaced.unmapped, ['ghost'], 'a mapped feature is never reported unmapped for its leading space');
});

test('harness --dry: a storage seed template, theme values, dismiss and full_page parse', { skip: !PY && 'no python on PATH' }, () => {
  const root = overlay(`url: http://localhost:4173
themes: light, dark=dark-midnight          # the label names the shot, the value is what the app stores
theme: storage personas-theme {"state":{"themeId":"{theme}"},"version":0}
storage: personas-cookie-consent essential   # a consent already given
dismiss: "Essential Only", "Close"
full_page: true
ready_timeout: 420
features:
  home: route /
`);
  const r = harness(root);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(r.stdout).unmapped, []);
});

test('harness --dry: click/nav timeouts and an expected status parse; linked_command serves a root whose node_modules is a link', { skip: !PY && 'no python on PATH' }, () => {
  const body = `command: npx next dev --port 4173
linked_command: npx next dev --webpack --port 4173   # Turbopack refuses a junctioned node_modules
url: http://localhost:4173
click_timeout: 30
nav_timeout: 90
features:
  not-found: route /this-page-does-not-exist expect 404
  home: route /
`;
  const plain = overlay(body);
  const r = harness(plain);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(r.stdout).served_by, undefined, 'a real node_modules keeps command');
  const linked = overlay(body);
  const target = mkdtempTracked(join(tmpdir(), 'lens-scan-harness-nm-'));
  symlinkSync(target, join(linked, 'node_modules'), 'junction');
  const l = harness(linked);
  assert.equal(l.status, 0, l.stderr);
  assert.equal(JSON.parse(l.stdout).served_by, 'linked_command');
});

test('harness: bad overlays exit 2 with the reason', { skip: !PY && 'no python on PATH' }, () => {
  for (const [body, why] of [
    ['features:\n  a: route /\n', /needs url/],
    ['url: http://x\nsizes: big\n', /not WxH/],
    ['url: http://x\ntheme: colour\n', /not media/],
    ['url: http://x\nfeatures:\n  a: hover "x"\n', /not route, steps or unscreenable/],
    ['url: http://x\nfeatures:\n  a: steps press "x"\n', /click "Text" or goto/],
    ['url: http://x\ntheme: storage app-theme {"mode":"dark"}\n', /not media/],
    ['url: http://x\ndismiss: Accept\n', /quote each button text/],
    ['url: http://x\nfull_page: yes\n', /not true \| false/],
    ['url: http://x\nstorage: lonely-key\n', /not <localStorage key> <value>/],
    ['url: http://x\nready_timeout: 5\n', /not 10\.\.1800 seconds/],
    ['url: http://x\nclick_timeout: 0\n', /click_timeout: '0' is not 1\.\.120 seconds/],
    ['url: http://x\nnav_timeout: soon\n', /nav_timeout: 'soon' is not 5\.\.300 seconds/],
    ['url: http://x\nfeatures:\n  a: route /gone expect gone\n', /not route \/path \[expect <HTTP status>\]/],
  ]) {
    const r = harness(overlay(body));
    assert.equal(r.status, 2, body);
    assert.match(r.stderr, why);
  }
  const none = mkdtempTracked(join(tmpdir(), 'lens-scan-harness-'));
  assert.equal(harness(none).status, 2, 'no overlay');
});

test('harness refuses when the url already answers before its command starts (another checkout would be shot)', { skip: !PY && 'no python on PATH' }, async () => {
  const { createServer } = await import('node:http');
  const srv = createServer((_, res) => res.end('other checkout')).listen(0, '127.0.0.1');
  await new Promise((r) => srv.once('listening', r));
  const port = srv.address().port;
  try {
    const root = overlay(`command: python -c "pass" --port ${port}
url: http://127.0.0.1:${port}
ready: /
features:
  home: route /
`);
    const r = await new Promise((resolve) => {
      import('node:child_process').then(({ spawn }) => {
        const c = spawn(PY, ['-I', SCRIPT, '--root', root, '--run', 'r-20261014000000-abcd'], { encoding: 'utf8' });
        let out = '';
        c.stdout.on('data', (d) => (out += d));
        c.on('close', (status) => resolve({ status, out }));
      });
    });
    assert.equal(r.status, 1);
    assert.match(JSON.parse(r.out).error, /already answers before the command started/);
  } finally { srv.close(); }
});

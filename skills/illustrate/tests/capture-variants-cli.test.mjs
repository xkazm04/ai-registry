// End-to-end tests for capture-variants.mjs without a browser.
//
// The script resolves its automation library from the CONSUMING project's working
// directory, so a temp project carrying a fake `node_modules/playwright/index.js` is a
// real seam: the product runs unmodified as a child process and meets a scripted page.
// The fake never launches anything. It records the source of every function the product
// sends into the page (so a test can say WHICH code was shipped), runs the text-probe
// against a tiny fake DOM (so a test can say what that code COUNTED), and can be told by
// environment to throw on the Nth screenshot or to report every section as hidden.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../scripts/capture-variants.mjs', import.meta.url));

// Written to the temp project verbatim. CommonJS on purpose: the product resolves it
// with createRequire(), exactly as it resolves the real library.
const FAKE_PLAYWRIGHT = String.raw`
const fs = require('fs');
const vm = require('vm');
const env = process.env;
const NL = String.fromCharCode(10);
const log = (o) => { if (env.FAKE_PW_LOG) fs.appendFileSync(env.FAKE_PW_LOG, JSON.stringify(o) + NL); };
const texts = JSON.parse(env.FAKE_PW_TEXT);
const throwAt = Number(env.FAKE_PW_THROW_ON_SHOT || 0);
const hidden = env.FAKE_PW_HIDDEN === '1';
let shots = 0;

// Just enough DOM for the in-page text probe to run for real.
function runInDom(src, root) {
  class SVGGraphicsElement {}
  const ctx = vm.createContext({
    NodeFilter: { SHOW_TEXT: 4 },
    SVGGraphicsElement,
    getComputedStyle: () => ({ fontSize: '14px' }),
    document: {
      createTreeWalker: () => {
        const list = texts.map((t) => ({ textContent: t, parentElement: { closest: () => null } }));
        let i = -1;
        return { get currentNode() { return list[i]; }, nextNode() { i++; return i < list.length; } };
      },
      createRange: () => ({ selectNodeContents() {}, getClientRects: () => [{ width: 10, height: 10 }] }),
    },
  });
  return JSON.parse(JSON.stringify(vm.runInContext('(' + src + ')', ctx)(root)));
}
const fakeRoot = { querySelectorAll: () => [], getBoundingClientRect: () => ({ width: 100, height: 100 }) };

function evaluate(fn) {
  const src = String(fn);
  log({ kind: 'evaluate', src });
  if (src.includes('createTreeWalker')) return runInDom(src, fakeRoot);
  if (src.includes('decode')) {
    const data = [];
    for (let i = 0; i < 96 * 96; i++) data.push(...(i % 2 ? [240, 240, 240, 255] : [10, 10, 10, 255]));
    return { w: 96, h: 96, data };
  }
  if (src.includes('scrollBy')) return true;
  if (src.includes('getAnimations')) return 0;
  return undefined;
}

const root = {
  scrollIntoViewIfNeeded: async () => {},
  isVisible: async () => !hidden,
  evaluate: async (fn) => evaluate(fn),
  screenshot: async (opts) => {
    shots++;
    log({ kind: 'screenshot', n: shots });
    if (throwAt && shots === throwAt) throw new Error('fake screenshot failure #' + shots);
    const buf = Buffer.from('fake-png');
    if (opts && opts.path) fs.writeFileSync(opts.path, buf);
    return buf;
  },
  locator(sel) {
    const n = sel.includes('data-illustrate-tab') ? 1 : 0;
    return { count: async () => n, click: async () => {}, first() { return root; } };
  },
};
const page = {
  goto: async () => {},
  locator: () => ({ count: async () => 1, first: () => root }),
  evaluate: async (fn) => evaluate(fn),
  waitForTimeout: async () => {},
  addStyleTag: async () => {},
};
const context = { newPage: async () => page, close: async () => {} };
const browser = { newContext: async () => context, close: async () => {} };
module.exports = { chromium: { launch: async () => browser } };
`;

// 15 words across three text nodes, irregular whitespace, longest run 7. Chosen to clear
// the TEXT-THIN floor (14) and the TEXT-HEAVY ceiling (40 words, 8-word runs) so a clean
// run is a clean exit 0.
const DEFAULT_TEXT = ['one two three  four five six seven', 'eight   nine ten eleven', 'twelve thirteen fourteen fifteen'];

/** Run capture-variants in a fresh temp project that carries the fake library. */
function runCapture({ env = {}, extra = [] } = {}) {
  const proj = fs.mkdtempSync(path.join(os.tmpdir(), 'capture-variants-'));
  const lib = path.join(proj, 'node_modules', 'playwright');
  fs.mkdirSync(lib, { recursive: true });
  fs.writeFileSync(path.join(proj, 'package.json'), '{"type":"commonjs"}');
  fs.writeFileSync(path.join(lib, 'package.json'), '{"name":"playwright","main":"index.js"}');
  fs.writeFileSync(path.join(lib, 'index.js'), FAKE_PLAYWRIGHT);
  const out = path.join(proj, 'out');
  const logFile = path.join(proj, 'evaluated.jsonl');
  const r = spawnSync(process.execPath,
    [SCRIPT, '--url', 'http://fake.invalid/', '--section', 'demo', '--tabs', 'current,alpha', '--out', out, '--settle', '0', ...extra], {
      cwd: proj, encoding: 'utf8',
      env: { ...process.env, FAKE_PW_TEXT: JSON.stringify(DEFAULT_TEXT), FAKE_PW_LOG: logFile, ...env },
    });
  const read = (f) => (fs.existsSync(path.join(out, f)) ? fs.readFileSync(path.join(out, f), 'utf8') : null);
  const evaluated = fs.existsSync(logFile)
    ? fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)).filter((e) => e.kind === 'evaluate').map((e) => e.src)
    : [];
  const result = {
    status: r.status, stdout: r.stdout, stderr: r.stderr, out, evaluated,
    reportText: read('report.json'), contact: read('contact.html'),
    files: fs.existsSync(out) ? fs.readdirSync(out).sort() : [],
  };
  result.report = result.reportText ? JSON.parse(result.reportText) : null;
  fs.rmSync(proj, { recursive: true, force: true });
  return result;
}

test('fake playwright: a clean run captures every tab at both widths and exits 0', () => {
  const r = runCapture();
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.equal(r.report.rows.length, 8); // 2 tabs x 2 widths x 2 motions
  assert.ok(r.report.rows.every((row) => row.file && !row.hidden));
  assert.ok(r.contact.includes('demo'));
  assert.equal(r.files.filter((f) => f.endsWith('.png')).length, 8);
});

test('fake playwright: the text probe really runs in the fake DOM and reports what it counted', () => {
  const row = runCapture().report.rows[0];
  assert.equal(row.words, 15);
  assert.equal(row.longestRun, 7);
  assert.equal(row.sectionWords, 15);
  assert.equal(row.minLabelPx, 14);
});

#!/usr/bin/env node
/**
 * Headless visual pass over the entries - the host's eyes when no browser tool is attached.
 * Node port of `visual-pass.py`, for repos that carry Playwright for Node rather than for
 * Python (the common case: a web repo has `playwright` in node_modules already).
 *
 *   node visual-pass.mjs <contest-dir> [options]
 *
 *   --widths 1280x800,1920x1080   viewports to open at
 *   --settle 3                    seconds to wait after load before the first shot
 *   --query canvas                what to type into the first text input, if any
 *   --click-text "<label>"        a label to click for a descent screenshot
 *   --keys "j,j,Enter,Escape"     a keyboard probe, for keyboard-first subjects
 *   --from entries|judging        which tree to read (default: judging/entries when it
 *                                 exists, else entries/). Read `entries/` when the
 *                                 blinder's IDENTITY_WORDS collide with staged material.
 *   --titles <file.json>          a JSON array of strings, or {notes:[{title}]}; the pass
 *                                 reports how many are rendered in full at load
 *
 * Writes screenshots and `runs/visual/report.json` under `runs/`, never under `judging/`:
 * a judge working in that directory must not see the host's eyes. This script scores
 * nothing; the host reads the images and writes its own verdict.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith('--'));
const opt = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 || !argv[i + 1] || argv[i + 1].startsWith('--') ? dflt : argv[i + 1];
};
const contestDir = positional[0];
if (!contestDir) { console.error('usage: visual-pass.mjs <contest-dir> [--widths ...] [--keys ...]'); process.exit(2); }

const settle = Number(opt('settle', 3)) * 1000;
const query = opt('query', 'canvas');
const clickText = opt('click-text', '');
const keys = opt('keys', '').split(',').map((k) => k.trim()).filter(Boolean);
const sizes = opt('widths', '1280x800,1920x1080').split(',').map((w) => {
  const [x, y] = w.split('x').map(Number);
  return { width: x, height: y };
});

// Playwright from the consuming repo, then from this script's own tree.
let chromium;
for (const base of [process.cwd(), path.dirname(new URL(import.meta.url).pathname)]) {
  try { ({ chromium } = createRequire(path.join(base, 'noop.js'))('playwright')); break; } catch { /* keep looking */ }
}
if (!chromium) { console.error('playwright for Node not found - npm i -D playwright && npx playwright install chromium'); process.exit(2); }

const root = path.resolve(contestDir);
const preferred = opt('from', '');
const judging = path.join(root, 'judging', 'entries');
const plain = path.join(root, 'entries');
const entriesRoot = preferred === 'entries' ? plain
  : preferred === 'judging' ? judging
  : (fs.existsSync(judging) ? judging : plain);
if (!fs.existsSync(entriesRoot)) { console.error(`${entriesRoot} missing - run collect first`); process.exit(2); }

const out = path.join(root, 'runs', 'visual');
fs.mkdirSync(out, { recursive: true });

// Expected titles, so the pass can report how many render IN FULL.
let expectedTitles = [];
const titlesFile = opt('titles', '');
if (titlesFile && fs.existsSync(titlesFile)) {
  const raw = JSON.parse(fs.readFileSync(titlesFile, 'utf8'));
  expectedTitles = Array.isArray(raw) ? raw : (raw.notes ?? []).map((n) => n.title).filter(Boolean);
}

// entries/<id-or-letter>/variant-<n>/index.html
const pages = [];
for (const seat of fs.readdirSync(entriesRoot).sort()) {
  const seatDir = path.join(entriesRoot, seat);
  if (!fs.statSync(seatDir).isDirectory()) continue;
  for (const v of fs.readdirSync(seatDir).sort()) {
    const index = path.join(seatDir, v, 'index.html');
    if (/^variant-\d+$/.test(v) && fs.existsSync(index)) {
      pages.push({ key: `${seat}/${v.split('-')[1]}`, tag: `${seat}-${v.split('-')[1]}`, index });
    }
  }
}
if (pages.length === 0) { console.error(`no variant-*/index.html under ${entriesRoot}`); process.exit(2); }

// ---------------------------------------------------------------- in-page measurements
function MEASURE() {
  const vis = (el, r, cs) => r.width && r.height && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity !== 0
    && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  const counts = {
    text: document.body.innerText.length,
    canvas: document.querySelectorAll('canvas').length,
    svgNodes: document.querySelectorAll('svg *').length,
    inputs: document.querySelectorAll('input[type=text],input[type=search],input:not([type])').length,
    buttons: document.querySelectorAll('button,[role=button]').length,
    title: document.title,
  };
  // The "one view" claim: does the page itself scroll, and by how much?
  counts.page = {
    scrollHeight: document.documentElement.scrollHeight,
    innerHeight: innerHeight,
    pageScrolls: document.documentElement.scrollHeight > innerHeight + 2,
    overflowRatio: Math.round(document.documentElement.scrollHeight / innerHeight * 100) / 100,
    scrollers: [...document.querySelectorAll('*')].filter((el) => {
      const cs = getComputedStyle(el);
      return /auto|scroll/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2;
    }).length,
  };
  // A frame looks fine at 11px; reading it for a minute does not.
  let min = null, small = 0, total = 0; const by = {};
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n.textContent.trim(); const el = n.parentElement;
    if (!t || !el || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue;
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    if (!vis(el, r, cs)) continue;
    let px = parseFloat(cs.fontSize);
    const m = el.namespaceURI === 'http://www.w3.org/2000/svg' && el.getScreenCTM ? el.getScreenCTM() : null;
    if (m) px *= Math.hypot(m.a, m.b);
    px = Math.round(px * 10) / 10;
    total += t.length; if (px < 12) small += t.length;
    min = min === null ? px : Math.min(min, px);
    const k = String(Math.round(px)); by[k] = (by[k] || 0) + t.length;
  }
  counts.type = { minPx: min, chars: total, shareUnder12px: total ? Math.round(small / total * 100) / 100 : 0, byPx: by };
  // Clipped text: the constraint a screenshot cannot settle. An element whose own text
  // overflows its box horizontally, or is line-clamped and taller than its box.
  const clipped = [];
  for (const el of document.querySelectorAll('*')) {
    if (el.children.length > 0) continue;
    const t = (el.textContent || '').trim();
    if (!t) continue;
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    if (!vis(el, r, cs)) continue;
    const h = el.scrollWidth > el.clientWidth + 1 && /hidden|clip/.test(cs.overflowX + cs.overflow);
    const v = el.scrollHeight > el.clientHeight + 1 && (cs.webkitLineClamp !== 'none' || /hidden|clip/.test(cs.overflowY + cs.overflow));
    if (h || v) clipped.push({ axis: h ? 'x' : 'y', px: Math.round(parseFloat(cs.fontSize)), text: t.slice(0, 70) });
  }
  counts.clipped = { count: clipped.length, samples: clipped.slice(0, 12) };
  return counts;
}

function TITLES(titles) {
  const hay = document.body.innerText.replace(/\s+/g, ' ');
  const missing = [];
  let n = 0;
  for (const t of titles) {
    const needle = String(t).replace(/\s+/g, ' ').trim();
    if (!needle) continue;
    if (hay.includes(needle)) n += 1; else missing.push(needle.slice(0, 70));
  }
  return { rendered: n, of: titles.length, missingSample: missing.slice(0, 10) };
}

// ---------------------------------------------------------------- the pass
const report = {};
const browser = await chromium.launch();
for (const { key, tag, index } of pages) {
  report[key] = {};
  for (const { width, height } of sizes) {
    const size = `${width}x${height}`;
    const page = await browser.newPage({ viewport: { width, height } });
    page.setDefaultTimeout(20000);
    const errors = []; const consoleErrors = []; const failed = [];
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 300)));
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300)); });
    page.on('requestfailed', (r) => failed.push(r.url().slice(0, 200)));
    const t0 = Date.now();
    try {
      try {
        await page.goto(pathToFileURL(index).href, { waitUntil: 'load' });
      } catch {
        // One slow load under host contention is not a broken variant; a second is.
        page.setDefaultTimeout(60000);
        await page.goto(pathToFileURL(index).href, { waitUntil: 'load', timeout: 60000 });
      }
      const loadS = Math.round((Date.now() - t0) / 10) / 100;
      await page.waitForTimeout(settle);
      await page.screenshot({ path: path.join(out, `${tag}-${size}-load.png`) });
      const counts = await page.evaluate(MEASURE);
      if (expectedTitles.length) counts.titles = await page.evaluate(TITLES, expectedTitles);

      // The same neutral probe for everyone, so what it reveals is comparable.
      await page.mouse.move(width / 2, height / 2);
      await page.waitForTimeout(400);
      await page.mouse.wheel(0, -300);
      await page.waitForTimeout(600);
      await page.mouse.click(width / 2, height / 2);
      await page.waitForTimeout(settle / 2);
      await page.screenshot({ path: path.join(out, `${tag}-${size}-probe.png`) });
      await page.keyboard.press('Escape');

      // A keyboard probe, for a subject the operator drives from the keyboard.
      if (keys.length) {
        try {
          await page.locator('body').click({ position: { x: 8, y: 8 } });
          for (const k of keys) { await page.keyboard.press(k); await page.waitForTimeout(260); }
          await page.waitForTimeout(settle / 2);
          await page.screenshot({ path: path.join(out, `${tag}-${size}-keys.png`) });
          if (expectedTitles.length) counts.titlesAfterKeys = await page.evaluate(TITLES, expectedTitles);
        } catch (e) { consoleErrors.push(`key probe skipped: ${String(e).slice(0, 120)}`); }
      }

      if (clickText) {
        try {
          await page.getByText(clickText, { exact: false }).first().click({ timeout: 3000 });
          await page.waitForTimeout(settle / 2);
          await page.screenshot({ path: path.join(out, `${tag}-${size}-descend.png`) });
          if (expectedTitles.length) counts.titlesAfterDescend = await page.evaluate(TITLES, expectedTitles);
        } catch {
          consoleErrors.push(`descend probe skipped: no clickable text '${clickText}' (canvas-drawn labels are not findable)`);
        }
      }

      let searched = false;
      if (counts.inputs) {
        try {
          await page.locator('input[type=text],input[type=search],input:not([type])').first().fill(query);
          await page.waitForTimeout(settle * 0.4);
          await page.screenshot({ path: path.join(out, `${tag}-${size}-search.png`) });
          searched = true;
        } catch (e) { consoleErrors.push(`search probe skipped: ${String(e).slice(0, 120)}`); }
      }
      report[key][size] = { loadS, errors, consoleErrors: consoleErrors.slice(0, 10), failedRequests: failed.slice(0, 10), counts, searched };
    } catch (e) {
      report[key][size] = { broken: String(e).slice(0, 300), errors, consoleErrors: consoleErrors.slice(0, 10) };
    } finally {
      await page.close();
    }
  }
  const line = Object.entries(report[key]).map(([s, v]) => {
    if (v.broken) return `${s}: BROKEN ${v.broken}`;
    const c = v.counts;
    const t = c.titles ? ` titles ${c.titles.rendered}/${c.titles.of}` : '';
    return `${s}: ${v.errors.length} err, min type ${c.type.minPx}px, ${Math.round(c.type.shareUnder12px * 100)}% under 12px, clipped ${c.clipped.count}, page ${c.page.overflowRatio}x${t}`;
  }).join('; ');
  console.log(`${key}: ${line}`);
}
await browser.close();
fs.writeFileSync(path.join(out, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`screenshots and report in ${out}`);

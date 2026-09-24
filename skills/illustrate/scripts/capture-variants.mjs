#!/usr/bin/env node
/*
 * capture-variants - screenshot every illustration variant of one section, at two
 * widths, with motion allowed and with reduced motion emulated, and flag the
 * captures a reviewer must not trust.
 *
 *   node capture-variants.mjs --url http://localhost:3000/ --section use-cases \
 *     --tabs current,console,relay,switchboard --out ./illustrate-run
 *
 * Output: <out>/<section>-<tab>-<width>-<motion>.png, report.json, contact.html.
 * Exit 0 = captured, 2 = instrument failure (no browser library, page unreachable,
 * section or tab not found), 3 = captured but at least one capture is BLANK, a
 * variant runs an infinite animation under reduced motion, or a variant's art is
 * TEXT-HEAVY (more words than a label layer, a sentence-length run, or text covering
 * too much of the picture; limits via --max-words --max-run --max-ratio).
 *
 * No dependencies of its own: it resolves the browser automation library from the
 * consuming project (the current working directory), because that project already
 * pins it and has its browsers installed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { parseArgs, blankScore, captureName, textVerdict, TEXT_LIMITS } from './lib/capture-core.mjs';

const args = parseArgs(process.argv.slice(2));
if (args.error) { console.error(args.error); process.exit(2); }
const limits = { ...TEXT_LIMITS, ...args.limits };

let chromium;
try {
  chromium = createRequire(path.join(process.cwd(), 'package.json'))('playwright').chromium;
} catch {
  console.error('capture-variants: no browser automation library resolvable from ' + process.cwd() +
    ' - run from the consuming project root, where it is installed.');
  process.exit(2);
}

fs.mkdirSync(args.out, { recursive: true });
const browser = await chromium.launch();
// Decoding happens on a blank page so the app's content security policy cannot block it.
const decoder = await (await browser.newContext()).newPage();
async function pixels(buf) {
  return decoder.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); const w = 96; const h = Math.max(1, Math.round(96 * img.height / img.width));
    c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(img, 0, 0, w, h);
    return Array.from(g.getImageData(0, 0, w, h).data);
  }, buf.toString('base64'));
}
// Sections below the fold often mount only when the reader approaches: walk down to it.
async function reach(page, sel) {
  for (let i = 0; i < 40; i++) {
    if (await page.locator(sel).count()) return page.locator(sel).first();
    const atEnd = await page.evaluate(() => { window.scrollBy(0, window.innerHeight * 0.8); return window.innerHeight + window.scrollY >= document.body.scrollHeight - 2; });
    await page.waitForTimeout(250);
    if (atEnd && !(await page.locator(sel).count())) break;
  }
  if (await page.locator(sel).count()) return page.locator(sel).first();
  throw new Error(`section ${sel} not found`);
}
const rows = [];
let failed = false;
try {
  for (const motion of ['no-preference', 'reduce']) {
    for (const width of args.widths) {
      const ctx = await browser.newContext({ reducedMotion: motion, viewport: { width, height: 900 } });
      const page = await ctx.newPage();
      await page.goto(args.url, { waitUntil: 'networkidle', timeout: 180000 });
      const root = await reach(page, `[data-illustrate="${args.section}"]`);
      await root.scrollIntoViewIfNeeded().catch(() => {});
      // A section the layout hides at this width (a desktop-only column) is a fact about
      // the design, not an instrument failure: record it and move on.
      if (!(await root.isVisible())) {
        for (const tab of args.tabs) rows.push({ tab, width, motion, file: null, hidden: true });
        await ctx.close();
        continue;
      }
      for (const tab of args.tabs) {
        const btn = root.locator(`[data-illustrate-tab="${tab}"]`);
        if (!(await btn.count())) throw new Error(`tab [data-illustrate-tab="${tab}"] not found in ${args.section}`);
        await btn.click();
        await root.scrollIntoViewIfNeeded();
        await page.waitForTimeout(args.settle);
        const file = captureName(args.section, tab, width, motion);
        const buf = await root.screenshot({ path: path.join(args.out, file) });
        const blank = blankScore(await pixels(buf));
        const infinite = await page.evaluate((sel) => {
          const r = document.querySelector(sel);
          return document.getAnimations().filter((a) => a.effect?.getComputedTiming?.().iterations === Infinity &&
            r?.contains(a.effect.target)).length;
        }, `[data-illustrate="${args.section}"]`);
        const smil = await root.locator('animate, animateTransform, animateMotion').count();
        // Text inside the illustration: variants mark their art root with data-illustrate-art,
        // so the section's own heading and copy are not counted against the picture.
        const text = await root.evaluate((r) => {
          const art = r.querySelector('[data-illustrate-art]');
          const scope = art || r;
          const box = scope.getBoundingClientRect();
          const area = Math.max(1, box.width * box.height);
          let words = 0, longestRun = 0, textArea = 0;
          const walk = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
          while (walk.nextNode()) {
            const n = walk.currentNode; const t = n.textContent.trim(); if (!t) continue;
            const range = document.createRange(); range.selectNodeContents(n);
            const a = [...range.getClientRects()].reduce((s, q) => s + q.width * q.height, 0);
            if (a < 1) continue; // not rendered
            const k = t.split(/s+/).length; words += k; longestRun = Math.max(longestRun, k); textArea += a;
          }
          return { scoped: !!art, words, longestRun, textRatio: textArea / area };
        });
        const tv = textVerdict(text, limits);
        const row = { tab, width, motion, file, blank: blank.blank, spread: blank.spread, infinite, smil,
          artScoped: text.scoped, words: text.words, longestRun: text.longestRun, textRatio: +text.textRatio.toFixed(3),
          textHeavy: tv.heavy, textReasons: tv.reasons };
        if (blank.blank || (motion === 'reduce' && (infinite > 0 || smil > 0)) || (tab !== 'current' && tv.heavy)) failed = true;
        rows.push(row);
      }
      await ctx.close();
    }
  }
} catch (e) {
  console.error('capture-variants: ' + e.message);
  await browser.close();
  process.exit(2);
}
await browser.close();

fs.writeFileSync(path.join(args.out, 'report.json'), JSON.stringify({ url: args.url, section: args.section, rows }, null, 2));
const cell = (r) => r.hidden ? `<figure><figcaption>${r.tab} · ${r.width}px · ${r.motion} · hidden at this width by the layout</figcaption></figure>` : `<figure><img src="${r.file}" loading="lazy"><figcaption>${r.tab} · ${r.width}px · ${r.motion}` +
  `${r.blank ? ' · <b>BLANK</b>' : ''}${r.textHeavy ? ` · <b>TEXT-HEAVY: ${r.textReasons.join('; ')}</b>` : ` · ${r.words} words`}${r.motion === 'reduce' && (r.infinite || r.smil) ? ` · <b>moving under reduce (${r.infinite}+${r.smil})</b>` : ''}</figcaption></figure>`;
const byTab = args.tabs.map((t) => `<section><h2>${t}</h2><div class="g">${rows.filter((r) => r.tab === t).map(cell).join('')}</div></section>`).join('');
fs.writeFileSync(path.join(args.out, 'contact.html'), `<!doctype html><meta charset="utf-8"><title>${args.section} variants</title>
<style>body{font:14px system-ui;margin:24px;background:#f4f5f7}h2{margin:24px 0 8px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:12px}
figure{margin:0;background:#fff;padding:8px;border-radius:8px}img{width:100%;display:block}figcaption{font:12px ui-monospace,monospace;margin-top:6px;color:#444}b{color:#b00}</style>
<h1>${args.section}</h1>${byTab}`);

for (const r of rows) if (r.hidden) console.log(`${r.tab.padEnd(14)} ${String(r.width).padEnd(5)} ${r.motion.padEnd(14)} hidden-by-layout`); else console.log(`${r.tab.padEnd(14)} ${String(r.width).padEnd(5)} ${r.motion.padEnd(14)} ${r.blank ? 'BLANK ' : 'ok    '} infinite=${r.infinite} smil=${r.smil} words=${r.words}${r.artScoped ? '' : '(section)'} run=${r.longestRun} text=${Math.round(r.textRatio * 100)}%${r.textHeavy ? ' TEXT-HEAVY' : ''}`);
console.log(`contact sheet: ${path.join(args.out, 'contact.html')}`);
process.exit(failed ? 3 : 0);

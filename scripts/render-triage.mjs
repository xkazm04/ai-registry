#!/usr/bin/env node
/**
 * render-triage - the operator's blind view of a render proof, and the cleanup it gates.
 *
 *   node scripts/render-triage.mjs sheet  <dir> [--allow-indistinct]
 *   node scripts/render-triage.mjs reveal <dir> <pairId>=<label|tie|neither> ...
 *   node scripts/render-triage.mjs clean  <dir> [--also <path> ...] [--force]
 *
 * /intake's render proof (references/render-proof.md) renders the same brief through
 * two arms - the corpus as it stood before the landing, and the corpus as the landing
 * would leave it - and the operator, not the run, decides which output is better. Three
 * things make that decision worth recording, and each is a step here rather than a
 * sentence in a method nobody re-reads:
 *
 *   0. DISCRIMINABLE. Every pair carries `discrimination: {between, within}` - the arms'
 *      distance from each other and the same approach's distance from itself at a second
 *      seed - and `sheet` refuses a pair whose arms do not clear 1.5x that floor. The first
 *      two pairs ever shown to an operator tied because the arms were two runs of one
 *      process ("basically identical"); a tie between indistinguishable arms is not a
 *      verdict, it is a wasted look.
 *   1. BLIND. The run knows which arm is which and wants one of them to win. `sheet`
 *      hard-links every arm's output to a neutral name (`shot1-X.mp4`), shuffles the
 *      labels per pair, writes the key to a separate file, and then asserts that the
 *      page it wrote contains neither an arm's file name nor an arm's prompt. A sheet
 *      that leaks the arm is refused, not warned about.
 *   2. REVEALED AFTER. `reveal` takes the operator's picks by label and only then maps
 *      them to arms, writing verdict.json - the durable artifact. Renders are cheap to
 *      remake; the judgement is not.
 *   3. CLEANED ONLY AFTER A VERDICT. Generated media is large and the run's disk is
 *      shared with a pagefile that generation itself grows. `clean` deletes every media
 *      file under <dir> and every --also path that carries the run id, reports the bytes,
 *      and refuses to run before verdict.json exists: deleting before triage throws away
 *      the only thing the test was for. --also never sweeps - a directory whose name
 *      lacks the run id only loses the files inside it whose names START with the run id.
 *
 * <dir>/manifest.json:
 *   { "run": "intake-q5qs", "question": "...", "variable": "...",
 *     "pairs": [ { "id": "shot1", "brief": "...",
 *                  "arms": { "A": { "file": "renders/shot1-armA.mp4", "prompt": "..." },
 *                            "B": { "file": "renders/shot1-armB.mp4", "prompt": "..." } } } ],
 *     "showcase": [ { "file": "renders/s1-character-sheet.png", "caption": "..." } ] }
 *
 * Exits 0 on success, 2 when it could not run (bad usage, missing manifest or key, a
 * leaking sheet, a cleanup requested before a verdict or outside the run's name).
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';

const LABELS = ['X', 'Y', 'Z', 'W'];
const MEDIA = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp4', '.webm', '.mov', '.mkv',
  '.wav', '.mp3', '.flac', '.ogg', '.glb', '.gltf', '.obj', '.fbx', '.blend', '.exr', '.hdr', '.latent']);
const VIDEO = new Set(['.mp4', '.webm', '.mov', '.mkv']);
const AUDIO = new Set(['.wav', '.mp3', '.flac', '.ogg']);

function fail(msg) {
  console.error(`render-triage: ${msg}`);
  process.exit(EXIT.FATAL);
}

function readJson(file, what) {
  if (!fs.existsSync(file)) fail(`${what} not found: ${file}`);
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { fail(`${what} is not JSON: ${e.message}`); }
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/**
 * Tokens that would tell the operator which arm is which, found in a page.
 *
 * A prompt only identifies its arm if some other arm's prompt does not contain it. The
 * common shape - arm B is the bare brief, arm A is a block plus the same brief - puts B's
 * whole prompt inside A's, and showing that shared brief on the sheet reveals nothing.
 * The first real sheet was refused on exactly that until this rule existed.
 */
export function leaks(html, manifest) {
  const found = [];
  for (const pair of manifest.pairs) {
    const entries = Object.entries(pair.arms);
    for (const [arm, spec] of entries) {
      const base = path.basename(spec.file);
      if (html.includes(base)) found.push(`${pair.id}: file name of arm ${arm}`);
      if (!spec.prompt || spec.prompt.length < 20) continue;
      const shared = entries.every(([other, o]) => other === arm || (o.prompt || '').includes(spec.prompt));
      if (!shared && html.includes(esc(spec.prompt))) found.push(`${pair.id}: prompt of arm ${arm}`);
    }
  }
  return found;
}

function mediaTag(src) {
  const ext = path.extname(src).toLowerCase();
  if (VIDEO.has(ext)) return `<video src="${esc(src)}" controls loop muted playsinline></video>`;
  if (AUDIO.has(ext)) return `<audio src="${esc(src)}" controls></audio>`;
  return `<img src="${esc(src)}" alt="">`;
}

function linkOrCopy(from, to) {
  fs.rmSync(to, { force: true });
  try { fs.linkSync(from, to); } catch { fs.copyFileSync(from, to); }
}

/** Arms must differ from each other by this multiple of the same approach's seed noise. */
export const DISCRIMINATION_RATIO = 1.5;

/** Why a pair may not reach the operator, or null. */
export function indistinct(pair) {
  const d = pair.discrimination;
  if (!d || !Number.isFinite(d.between) || !Number.isFinite(d.within)) {
    return `pair ${pair.id} has no discrimination record: render the same approach at a second seed and record {between, within} before triage`;
  }
  if (d.between < DISCRIMINATION_RATIO * d.within) {
    return `pair ${pair.id}: arms differ by ${d.between} against a seed-noise floor of ${d.within} (need ${DISCRIMINATION_RATIO}x) - the operator would be judging two runs of the same process; redesign the arms as different approaches`;
  }
  return null;
}

export function sheet(dir, { allowIndistinct = false } = {}) {
  const manifest = readJson(path.join(dir, 'manifest.json'), 'manifest');
  if (!manifest.run || !Array.isArray(manifest.pairs) || !manifest.pairs.length) fail('manifest needs run and pairs[]');
  const refused = manifest.pairs.map(indistinct).filter(Boolean);
  if (refused.length && !allowIndistinct) fail(refused.join('\n  '));
  const out = path.join(dir, 'triage');
  fs.mkdirSync(out, { recursive: true });
  const key = { run: manifest.run, created: new Date().toISOString(), pairs: {} };
  const sections = [];
  for (const pair of manifest.pairs) {
    const arms = Object.keys(pair.arms);
    if (arms.length < 2 || arms.length > LABELS.length) fail(`pair ${pair.id} needs 2-${LABELS.length} arms`);
    const order = [...arms];
    for (let i = order.length - 1; i > 0; i--) { const j = crypto.randomInt(i + 1); [order[i], order[j]] = [order[j], order[i]]; }
    key.pairs[pair.id] = {};
    const cells = order.map((arm, i) => {
      const label = LABELS[i];
      const src = path.join(dir, pair.arms[arm].file);
      if (!fs.existsSync(src)) fail(`pair ${pair.id} arm ${arm}: missing ${src}`);
      const neutral = `${pair.id}-${label}${path.extname(src).toLowerCase()}`;
      linkOrCopy(src, path.join(out, neutral));
      key.pairs[pair.id][label] = arm;
      return `<figure><figcaption>${label}</figcaption>${mediaTag(neutral)}</figure>`;
    });
    sections.push(`<section><h2>${esc(pair.id)}</h2><p class="brief">${esc(pair.brief || '')}</p><div class="row">${cells.join('')}</div></section>`);
  }
  const showcase = (manifest.showcase || []).map((s) => {
    const src = path.join(dir, s.file);
    if (!fs.existsSync(src)) fail(`showcase missing ${src}`);
    const name = `showcase-${path.basename(src)}`;
    linkOrCopy(src, path.join(out, name));
    return `<figure><figcaption>${esc(s.caption || '')}</figcaption>${mediaTag(name)}</figure>`;
  });
  const html = `<!doctype html><meta charset="utf-8"><title>Render triage - ${esc(manifest.run)}</title>
<style>body{font:15px system-ui;margin:0;padding:16px;background:#111;color:#eee}h1{font-size:20px}section{margin:24px 0}
.row{display:flex;gap:12px;flex-wrap:wrap}figure{margin:0;flex:1 1 420px}figcaption{font-weight:700;font-size:22px;margin:4px 0}
video,img{width:100%;border-radius:6px;background:#000}.brief,.q{color:#bbb;max-width:70ch}</style>
<h1>Render triage: ${esc(manifest.run)}</h1><p class="q">${esc(manifest.question || 'Which output is better?')}</p>
<p class="q">Arms are shuffled per pair. Answer with the letter, "tie", or "neither".</p>
${sections.join('\n')}
${showcase.length ? `<h2>Context (not blind, not judged)</h2><div class="row">${showcase.join('')}</div>` : ''}`;
  const leaked = leaks(html, manifest);
  if (leaked.length) fail(`sheet would reveal the arms, refusing: ${leaked.join('; ')}`);
  fs.writeFileSync(path.join(out, 'index.html'), html);
  fs.writeFileSync(path.join(out, 'key.json'), JSON.stringify(key, null, 2));
  console.log(`sheet: ${path.join(out, 'index.html')}  (${manifest.pairs.length} pair(s), key sealed in key.json)`);
  return key;
}

export function reveal(dir, picks) {
  const manifest = readJson(path.join(dir, 'manifest.json'), 'manifest');
  const key = readJson(path.join(dir, 'triage', 'key.json'), 'key (run sheet first)');
  const chosen = Object.fromEntries(picks.map((p) => {
    const m = /^([^=]+)=(.+)$/.exec(p);
    if (!m) fail(`pick must be <pairId>=<label|tie|neither>, got ${p}`);
    return [m[1], m[2]];
  }));
  const verdict = { run: manifest.run, variable: manifest.variable || null, decided_on: new Date().toISOString().slice(0, 10), grader: 'operator', pairs: {} };
  for (const pair of manifest.pairs) {
    const pick = chosen[pair.id];
    if (!pick) fail(`no pick for pair ${pair.id}; every pair is decided or none is`);
    const arm = pick === 'tie' || pick === 'neither' ? pick : key.pairs[pair.id]?.[pick];
    if (!arm) fail(`pair ${pair.id}: label ${pick} is not on the sheet`);
    verdict.pairs[pair.id] = { operator: pick, arm, key: key.pairs[pair.id] };
  }
  fs.writeFileSync(path.join(dir, 'verdict.json'), JSON.stringify(verdict, null, 2));
  for (const [id, v] of Object.entries(verdict.pairs)) console.log(`${id.padEnd(16)} picked ${v.operator.padEnd(8)} -> arm ${v.arm}`);
  return verdict;
}

function sizeOf(p) {
  const st = fs.statSync(p);
  if (!st.isDirectory()) return st.size;
  return fs.readdirSync(p).reduce((n, e) => n + sizeOf(path.join(p, e)), 0);
}

export function clean(dir, also = [], force = false) {
  const manifest = readJson(path.join(dir, 'manifest.json'), 'manifest');
  const run = manifest.run;
  if (!force && !fs.existsSync(path.join(dir, 'verdict.json'))) fail('no verdict.json: triage before cleanup (reveal first, or --force)');
  const doomed = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (MEDIA.has(path.extname(e.name).toLowerCase())) doomed.push(p);
    }
  };
  walk(dir);
  for (const target of also) {
    if (!fs.existsSync(target)) continue;
    if (path.basename(target).includes(run)) { doomed.push(target); continue; }
    if (!fs.statSync(target).isDirectory()) fail(`--also ${target} does not carry the run id ${run}`);
    const hits = fs.readdirSync(target).filter((n) => n.startsWith(run)).map((n) => path.join(target, n));
    if (!hits.length) console.log(`clean: nothing in ${target} starts with ${run}`);
    doomed.push(...hits);
  }
  let bytes = 0, removed = 0;
  for (const p of new Set(doomed.map((d) => path.resolve(d)))) {
    if (!fs.existsSync(p)) continue;
    bytes += sizeOf(p); removed++;
    fs.rmSync(p, { recursive: true, force: true });
  }
  console.log(`clean: removed ${removed} path(s), ${(bytes / 1048576).toFixed(1)} MB`);
  return { removed, bytes };
}

function main(argv) {
  const [cmd, dir, ...rest] = argv;
  if (!cmd || !dir || !['sheet', 'reveal', 'clean'].includes(cmd)) fail('usage: sheet <dir> | reveal <dir> <pair>=<label> ... | clean <dir> [--also <path>] [--force]');
  if (!fs.existsSync(dir)) fail(`no such directory: ${dir}`);
  // Assert the leak detector before trusting it with a page.
  const planted = { pairs: [{ id: 'p', arms: { A: { file: 'r/p-armA.mp4', prompt: 'a prompt long enough to count' } } }] };
  if (leaks('<video src="p-armA.mp4">', planted).length !== 1) fail('leak detector failed its planted positive');
  if (cmd === 'sheet') {
    const bad = rest.filter((a) => a !== '--allow-indistinct');
    if (bad.length) fail(`unknown sheet argument ${bad[0]}`);
    sheet(dir, { allowIndistinct: rest.includes('--allow-indistinct') });
  }
  else if (cmd === 'reveal') reveal(dir, rest);
  else {
    const also = [];
    let force = false;
    for (let i = 0; i < rest.length; i++) {
      if (rest[i] === '--also' && rest[i + 1]) also.push(rest[++i]);
      else if (rest[i] === '--force') force = true;
      else fail(`unknown clean argument ${rest[i]}`);
    }
    clean(dir, also, force);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));

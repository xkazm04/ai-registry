#!/usr/bin/env node
/**
 * codex-draw - draw a queue of images through `codex exec` and its built-in image_gen, on the
 * operator's ChatGPT seat. Staged into every seat's data/ by the `ideas` preset, so every seat
 * draws with the same tool, the same size and the same prefix.
 *
 *   node data/codex-draw.mjs --queue boards.json --out variant-1/img [--workers 2] [--budget-min 8]
 *
 * The queue is [{ "name": "idea-01-a", "prompt": "...", "refs": ["optional/ref.png"] }]. Each image
 * lands as <out>/<name>.png (16:9, about 1672x941). Resumable: an existing png is skipped, so run it
 * again until it prints `all drawn`. It stops launching new images after --budget-min minutes (default
 * 8, under an agent shell's 10-minute ceiling) and exits 3 while images remain, 0 when all are drawn.
 *
 * Seats run at once, so a machine-wide cap (CODEX_DRAW_SLOTS, default 6) holds the total number of
 * concurrent codex processes across every seat: slot files in the temp directory, taken with an
 * exclusive create, stale after 12 minutes. A refused or failed image is retried once, then logged
 * to <out>/failed.jsonl with the tail of codex's output, and left for the seat to reword.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const queueFile = opt('queue');
const out = path.resolve(opt('out', 'img'));
const workers = Math.max(1, Number(opt('workers', 2)));
const budgetMs = Number(opt('budget-min', 8)) * 60_000;
const SLOTS = Math.max(1, Number(process.env.CODEX_DRAW_SLOTS || 6));
const IMAGE_MS = 6 * 60_000;
if (!queueFile) { console.error('usage: node codex-draw.mjs --queue <file.json> --out <dir> [--workers 2] [--budget-min 8]'); process.exit(2); }

const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
if (!Array.isArray(queue)) { console.error('queue must be a JSON array of {name, prompt, refs?}'); process.exit(2); }
const bad = queue.filter((q) => !q || typeof q.name !== 'string' || !/^[A-Za-z0-9._-]+$/.test(q.name) || typeof q.prompt !== 'string' || q.prompt.length < 20);
if (bad.length) { console.error(`bad queue items (name [A-Za-z0-9._-], prompt >= 20 chars): ${bad.map((b) => b?.name).join(', ')}`); process.exit(2); }
fs.mkdirSync(out, { recursive: true });

const slotDir = path.join(os.tmpdir(), 'codex-draw-slots');
fs.mkdirSync(slotDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function takeSlot() {
  for (;;) {
    for (let i = 0; i < SLOTS; i++) {
      const f = path.join(slotDir, `slot-${i}`);
      try {
        if (fs.existsSync(f) && Date.now() - fs.statSync(f).mtimeMs > 12 * 60_000) fs.rmSync(f, { force: true });
        fs.closeSync(fs.openSync(f, 'wx'));
        return f;
      } catch { /* taken */ }
    }
    await sleep(3000);
  }
}

const PREFIX = 'Use your built-in image_gen tool to make exactly ONE image, wide 16:9 landscape (the widest landscape size you have).';
function drawOnce(item) {
  const name = item.name;
  const png = path.join(out, `${name}.png`);
  const refs = (item.refs || []).map((r) => path.resolve(r));
  const missing = refs.filter((r) => !fs.existsSync(r));
  if (missing.length) return Promise.resolve({ ok: false, why: `missing ref ${missing.join(', ')}` });
  const full = `${PREFIX} ${item.prompt} After generating, copy the image file into the current working directory as ${name}.png and print its pixel size. Do nothing else.`;
  const logFile = path.join(out, `${name}.log`);
  const log = fs.openSync(logFile, 'w');
  const argv = ['exec', '--skip-git-repo-check', '-s', 'workspace-write', '-C', `"${out}"`, ...refs.flatMap((r) => ['-i', `"${r}"`]), '--', '-'];
  return new Promise((resolve) => {
    // shell: the npm shim is a .cmd on Windows and spawn refuses a .cmd without one
    const p = spawn('codex', argv, { shell: true, stdio: ['pipe', log, log], windowsHide: true });
    p.stdin?.end(full);
    const kill = () => (process.platform === 'win32'
      ? spawn('taskkill', ['/PID', String(p.pid), '/T', '/F'], { windowsHide: true })
      : p.kill('SIGKILL'));
    const timer = setTimeout(kill, IMAGE_MS);
    let done = false;
    const finish = (code) => {
      if (done) return; done = true; clearTimeout(timer); fs.closeSync(log);
      const ok = code === 0 && fs.existsSync(png);
      if (ok) fs.rmSync(logFile, { force: true });
      const tail = ok ? '' : fs.readFileSync(logFile, 'utf8').slice(-600);
      resolve({ ok, why: ok ? '' : `exit ${code}: ${tail.replace(/\s+/g, ' ').trim()}` });
    };
    p.on('error', () => finish(-1));
    p.on('close', finish);
  });
}

const t0 = Date.now();
// A prompt that already failed twice is not sent again unchanged: reword it in the queue.
const hash = (q) => createHash('sha1').update(q.prompt).digest('hex').slice(0, 12);
const failedFile = path.join(out, 'failed.jsonl');
const failedBefore = new Set((fs.existsSync(failedFile) ? fs.readFileSync(failedFile, 'utf8').split(String.fromCharCode(10)).filter(Boolean) : [])
  .map((l) => { try { const j = JSON.parse(l); return `${j.name}:${j.hash}`; } catch { return ''; } }));
const pending = queue.filter((q) => !fs.existsSync(path.join(out, `${q.name}.png`)));
const todo = pending.filter((q) => !failedBefore.has(`${q.name}:${hash(q)}`));
if (pending.length > todo.length) console.log(`${pending.length - todo.length} skipped: failed before with the same prompt (${pending.filter((q) => !todo.includes(q)).map((q) => q.name).join(', ')})`);
console.log(`${queue.length} queued, ${queue.length - todo.length} already drawn, ${todo.length} to draw`);
let drawn = 0; let failed = 0;
async function worker() {
  for (;;) {
    if (Date.now() - t0 > budgetMs) return;
    const item = todo.shift();
    if (!item) return;
    const slot = await takeSlot();
    try {
      const s = Date.now();
      let r = await drawOnce(item);
      if (!r.ok) r = await drawOnce(item);
      if (r.ok) { drawn++; console.log(`${item.name}: ok in ${Math.round((Date.now() - s) / 1000)} s`); }
      else {
        failed++;
        fs.appendFileSync(path.join(out, 'failed.jsonl'), `${JSON.stringify({ name: item.name, hash: hash(item), why: r.why, at: new Date().toISOString() })}\n`);
        console.log(`${item.name}: FAILED - ${r.why.slice(-200)}`);
      }
    } finally { fs.rmSync(slot, { force: true }); }
  }
}
await Promise.all(Array.from({ length: workers }, worker));
const leftItems = queue.filter((q) => !fs.existsSync(path.join(out, `${q.name}.png`)));
const failedNow = fs.existsSync(failedFile) ? fs.readFileSync(failedFile, 'utf8') : '';
const retryable = leftItems.filter((q) => !failedNow.includes(`"hash":"${hash(q)}"`));
console.log(`${drawn} drawn, ${failed} failed this call; ${leftItems.length} without an image${retryable.length ? ` - run again for ${retryable.length}` : ''}${leftItems.length > retryable.length ? `; ${leftItems.length - retryable.length} refused or failed: reword those prompts or drop them` : ''}${leftItems.length ? '' : ' - all drawn'}`);
process.exit(retryable.length ? 3 : 0);

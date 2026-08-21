#!/usr/bin/env node
/**
 * research-ingest — the ingestion half of /research.
 *
 * ## Why this is a script and not a prompt
 *
 * Every other instrument in this repository exists because a model that produces its
 * own numbers produces numbers nobody can check. This one exists for the adjacent
 * reason: a model that produces its own *transcript* produces a source nobody can
 * audit. A finding is only as reviewable as the text it quotes, so the text has to
 * arrive by a path that can be re-run and compared, with the fetch failures named
 * rather than smoothed over.
 *
 * It normalizes four source kinds into one artifact — a deduped, timestamped plain
 * text file plus a metadata line — and it refuses to report success on an empty one.
 *
 *   youtube  watch / youtu.be / shorts / live URLs, via yt-dlp subtitles
 *   web      any other http(s) URL, fetched and stripped to prose
 *   file     a local .txt/.md/.vtt already on disk
 *   stdin    raw pasted text (`-`)
 *
 * ## The instrument is asserted before the result
 *
 * Exit codes are distinct on purpose, because "the fetch broke" and "the source is
 * thin" lead to opposite next moves and a single failure code merges them:
 *
 *   0  a usable transcript was written
 *   2  FATAL — the instrument failed (no yt-dlp, no captions, fetch error, zero words)
 *   3  the instrument worked and the SOURCE is too thin to mine (< --min-words)
 *
 * Output goes to a scratch directory outside the repository by default: transcripts
 * are inputs to a run, not registry content, and nothing here should ever be tempted
 * into a commit.
 *
 * Usage:
 *   node scripts/research-ingest.mjs <url|path|-> [--out <dir>] [--json]
 *   node scripts/research-ingest.mjs <url> --min-words 500
 *   node scripts/research-ingest.mjs <url> --meta-only     # title/author, no transcript
 *
 * Zero dependencies, like every gate here. yt-dlp is an external binary and its
 * absence is reported as an instrument failure, never as an empty source.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const pick = (name, dflt) => {
  const i = argv.indexOf(name);
  return i === -1 ? dflt : argv[i + 1];
};

// Flags that consume the next argument; everything else that is not `--…` is the source.
const VALUED = new Set(['--out', '--min-words']);
const positional = [];
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i].startsWith('--')) {
    if (VALUED.has(argv[i])) i += 1;
    continue;
  }
  positional.push(argv[i]);
}
const source = positional[0];

const asJson = flag('--json');
const metaOnly = flag('--meta-only');
const minWords = Number(pick('--min-words', 300));
const outDir = pick('--out', path.join(os.tmpdir(), 'ai-registry-research'));

if (!source) {
  console.error('usage: node scripts/research-ingest.mjs <url|path|-> [--out <dir>] [--json] [--meta-only] [--min-words N]');
  process.exit(2);
}

const fatal = (msg, hint) => {
  console.error(`research-ingest FATAL: ${msg}`);
  if (hint) console.error(`  ${hint}`);
  console.error('  Reporting nothing is not the same as finding nothing - refusing to exit 0.');
  process.exit(2);
};

// ---------------------------------------------------------------- source kind
const YT_RE = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

const classify = (s) => {
  if (s === '-') return { kind: 'stdin' };
  const yt = YT_RE.exec(s);
  if (yt) return { kind: 'youtube', id: yt[1] };
  if (/^https?:\/\//i.test(s)) return { kind: 'web', url: s };
  if (fs.existsSync(s)) return { kind: 'file', file: s };
  return { kind: 'unknown' };
};

const src = classify(source);
if (src.kind === 'unknown') {
  fatal(`cannot classify source ${JSON.stringify(source)}`, 'Expected a http(s) URL, an existing file path, or "-" for stdin.');
}

// ---------------------------------------------------------------- helpers
const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'source';

const decodeEntities = (s) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));

const wordsOf = (s) => s.split(/\s+/).filter(Boolean).length;

/**
 * A VTT auto-caption track is mostly repetition: YouTube emits a rolling window, so
 * the same sentence arrives three or four times with one new word each. Dedupe on
 * the exact line AND on the lowercased line seen anywhere, then re-emit a timestamp
 * roughly every 25 seconds so a finding can cite [HH:MM:SS] and a reviewer can check
 * it. Ported from the same cleaner proven against auto-subs elsewhere.
 */
const cleanVtt = (raw) => {
  const lines = raw.split(/\r?\n/);
  const out = [];
  let last = null;
  let curTs = null;
  const seen = new Set();

  for (const ln of lines) {
    if (/^(WEBVTT|Kind:|Language:|NOTE\b|STYLE\b)/.test(ln)) continue;
    const m = /^(\d{2}:\d{2}:\d{2})\.\d+\s*-->/.exec(ln);
    if (m) {
      curTs = m[1];
      continue;
    }
    if (!ln.trim()) continue;
    if (/^\d+$/.test(ln.trim())) continue; // standalone cue index
    let txt = ln.replace(/<[^>]+>/g, '').trim();
    txt = decodeEntities(txt).replace(/\s+/g, ' ');
    if (!txt || txt === last) continue;
    last = txt;
    const key = txt.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push([curTs, txt]);
  }

  const secs = (t) => {
    const [h, m, s] = t.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  };
  const result = [];
  let lastEmit = null;
  for (const [ts, txt] of out) {
    let prefix = '';
    if (ts && (lastEmit === null || secs(ts) - secs(lastEmit) >= 25)) {
      prefix = `[${ts}] `;
      lastEmit = ts;
    }
    result.push(prefix + txt);
  }
  return result.join('\n');
};

/**
 * Strip an HTML document to readable prose. Deliberately crude: the goal is text a
 * model can mine and a human can spot-check, not a faithful render. Drops the
 * containers that carry navigation, promotion and cookie theatre - a research run
 * that quotes a cookie banner has ingested the page's chrome, not its argument.
 */
const htmlToText = (html) => {
  let s = html;
  s = s.replace(/<!--[\s\S]*?-->/g, '');
  s = s.replace(/<(script|style|noscript|svg|iframe|form)\b[\s\S]*?<\/\1>/gi, ' ');
  s = s.replace(/<(nav|header|footer|aside)\b[\s\S]*?<\/\1>/gi, ' ');
  s = s.replace(/<\/(p|div|section|article|li|tr|h[1-6]|blockquote|pre)>/gi, '\n');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<li\b[^>]*>/gi, '- ');
  s = s.replace(/<[^>]+>/g, ' ');
  s = decodeEntities(s);
  s = s.replace(/[ \t ]+/g, ' ');
  s = s.replace(/\n\s*\n\s*\n+/g, '\n\n');
  return s
    .split('\n')
    .map((l) => l.trim())
    .filter((l, i, arr) => l || (arr[i - 1] || '').length > 0)
    .join('\n')
    .trim();
};

const titleOfHtml = (html) => {
  const og = /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i.exec(html);
  if (og) return decodeEntities(og[1]);
  const t = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return t ? decodeEntities(t[1]).trim() : null;
};

const run = (cmd, args, timeoutMs) =>
  spawnSync(cmd, args, { encoding: 'utf8', timeout: timeoutMs, windowsHide: true, shell: false });

// ---------------------------------------------------------------- ingest
fs.mkdirSync(outDir, { recursive: true });

const meta = { kind: src.kind, source, fetched_on: new Date().toISOString().slice(0, 10) };
let text = '';
let id = null;

if (src.kind === 'youtube') {
  id = src.id;
  meta.id = id;
  meta.url = `https://www.youtube.com/watch?v=${id}`;

  // Metadata first, and from oEmbed rather than yt-dlp: it is one cheap request that
  // keeps working when extraction is throttled, which is exactly when you still want
  // to be able to name what you failed to read.
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(meta.url)}&format=json`);
    if (res.ok) {
      const j = await res.json();
      meta.title = j.title;
      meta.author = j.author_name;
    }
  } catch {
    /* non-fatal: a missing title never blocks a transcript */
  }

  if (!metaOnly) {
    const probe = run('yt-dlp', ['--version'], 20000);
    if (probe.error || probe.status !== 0) {
      fatal('yt-dlp is not runnable', 'Install it (pip install -U yt-dlp) or pass a transcript file instead.');
    }
    meta.yt_dlp = (probe.stdout || '').trim();

    const stem = path.join(outDir, id);
    // Two attempts: throttling on this endpoint is routinely transient, and one retry
    // is the difference between a dead run and a slow one.
    let ok = false;
    let lastErr = '';
    for (let attempt = 1; attempt <= 2 && !ok; attempt += 1) {
      const r = run(
        'yt-dlp',
        [
          '--skip-download',
          '--write-auto-subs',
          '--write-subs',
          '--sub-langs',
          'en.*',
          '--sub-format',
          'vtt',
          '--no-progress',
          '--output',
          `${stem}.%(ext)s`,
          meta.url,
        ],
        180000,
      );
      lastErr = `${r.stderr || ''}${r.error ? ` ${r.error.message}` : ''}`.trim();
      ok = fs.readdirSync(outDir).some((f) => f.startsWith(`${id}.`) && f.endsWith('.vtt'));
    }
    if (!ok) {
      fatal(
        `yt-dlp wrote no .vtt for ${id}`,
        `Captions may be disabled, or extraction is throttled. Last error: ${lastErr.split('\n').slice(-2).join(' ') || '(none)'}`,
      );
    }

    const vtts = fs
      .readdirSync(outDir)
      .filter((f) => f.startsWith(`${id}.`) && f.endsWith('.vtt'))
      .sort();
    meta.subtitle_files = vtts.length;
    // Prefer a manually authored track over an auto one when both exist.
    const preferred = vtts.find((f) => !/auto/i.test(f)) ?? vtts[0];
    meta.subtitle_track = preferred;
    text = cleanVtt(fs.readFileSync(path.join(outDir, preferred), 'utf8'));

    // Scoped cleanup, this run's id only. A blind sweep of the work directory races
    // any parallel run sharing it.
    for (const f of vtts) fs.rmSync(path.join(outDir, f), { force: true });
  }
} else if (src.kind === 'web') {
  meta.url = src.url;
  let res;
  try {
    res = await fetch(src.url, {
      redirect: 'follow',
      headers: { 'user-agent': 'ai-registry-research/1 (+https://github.com/xkazm04/ai-registry)' },
    });
  } catch (e) {
    fatal(`fetch failed for ${src.url}`, e.message);
  }
  if (!res.ok) fatal(`fetch returned HTTP ${res.status} for ${src.url}`, 'A paywall or a bot wall reads as an instrument failure, not a thin source.');
  const body = await res.text();
  meta.title = titleOfHtml(body);
  id = slugify(meta.title || new URL(src.url).hostname);
  text = htmlToText(body);
} else if (src.kind === 'file') {
  meta.file = src.file;
  const raw = fs.readFileSync(src.file, 'utf8');
  text = src.file.toLowerCase().endsWith('.vtt') ? cleanVtt(raw) : raw;
  id = slugify(path.basename(src.file).replace(/\.[^.]+$/, ''));
  meta.title = path.basename(src.file);
} else if (src.kind === 'stdin') {
  text = fs.readFileSync(0, 'utf8');
  id = `pasted-${new Date().toISOString().slice(0, 10)}`;
  meta.title = 'pasted text';
}

// ---------------------------------------------------------------- assert + write
if (metaOnly) {
  meta.words = null;
  console.log(asJson ? JSON.stringify(meta, null, 1) : `${meta.kind}: ${meta.title ?? '(untitled)'}${meta.author ? ` - ${meta.author}` : ''}`);
  process.exit(0);
}

const words = wordsOf(text);
meta.words = words;

if (words === 0) {
  fatal('the ingest produced ZERO words', 'THE READER IS BROKEN or the source carries no text - either way nothing was mined.');
}

const outPath = path.join(outDir, `${id}.clean.txt`);
fs.writeFileSync(outPath, text, 'utf8');
meta.path = outPath;

const metaPath = path.join(outDir, `${id}.meta.json`);
fs.writeFileSync(metaPath, JSON.stringify(meta, null, 1), 'utf8');
meta.meta_path = metaPath;

if (asJson) {
  console.log(JSON.stringify(meta, null, 1));
} else {
  console.log(`${meta.kind}: ${meta.title ?? id}${meta.author ? ` - ${meta.author}` : ''}`);
  console.log(`${words} words -> ${outPath}`);
  console.log(`metadata -> ${metaPath}`);
}

if (words < minWords) {
  console.error(`\nSOURCE TOO THIN: ${words} words < --min-words ${minWords}.`);
  console.error('The instrument worked; the source does not carry enough to mine. Say so and stop.');
  process.exit(3);
}

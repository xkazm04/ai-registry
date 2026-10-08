// Wrap: the hygiene step after the owner decides. A decided contest keeps what an auditor needs -
// the decision, the verdicts and run records, each variant's own notes and the screenshots it was
// judged from - and the winner's source for the promotion; every other implementation, copy and
// build tree goes. The first fleet survey found 18 GB of arenas, 9 GB of it one seat's stray Unity
// project and 0.8 GB a node_modules beside a 15 MB variant.
//
// The decision rules and the text helpers are pure; the two tree walkers touch the filesystem and
// never follow a link: a junctioned node_modules points at a real checkout, and a recursive delete
// that follows it wipes the original.

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const decided = (c) => !!c.winner || !!c.combined?.length || !!c.closed;
export const label = (x) => (typeof x === 'string' ? x : x?.label);

/**
 * The state of one contest family: the first round, its reveal and its refinement or fuse rounds,
 * linked by `parent`. A reveal is a mastering round its parent's verdict covers; every other round
 * that has no round after it is a leaf, and the family is decided only when every leaf is - a
 * refinement round still waiting on the owner keeps the whole family open. `closed` on the first
 * round (the owner ended it with no winner) decides the family.
 * members: [{ c }] -> { decided, open: [ids of undecided leaves], keep: [{ id, key, why }] }
 */
export function familyState(members) {
  const byId = new Map(members.map((m) => [m.c.id, m.c]));
  const root = members.map((m) => m.c).find((c) => !c.parent || !byId.has(c.parent));
  const rounds = members.map((m) => m.c).filter((c) => c.kind !== 'reveal');
  const leaves = rounds.filter((c) => !rounds.some((x) => x.parent === c.id));
  const open = root?.closed ? [] : leaves.filter((c) => !decided(c)).map((c) => c.id);
  const keep = [];
  for (const c of members.map((m) => m.c)) {
    const picks = [...(c.winner ? [[label(c.winner), 'winner']] : []), ...(c.combined ?? []).map((x) => [label(x), 'combined'])];
    for (const [key, why] of picks) {
      keep.push({ id: c.id, key, why });
      // A reveal keeps its parent's letters, so B/2 mastered in the reveal is the same pick, improved.
      for (const r of members.map((m) => m.c).filter((x) => x.kind === 'reveal' && x.parent === c.id)) keep.push({ id: r.id, key, why: `${why} (mastered)` });
    }
  }
  return { decided: !!root && open.length === 0, open, keep, root: root?.id ?? null };
}

const IMAGE = /\.(png|jpe?g|webp|gif)$/i;

/** Screenshots of one variant: the visual pass names them `<letter>-<n>-...`. */
export function shotsFor(names, letter, n) {
  const re = new RegExp(`^${letter}-${n}[-_.]`);
  return names.filter((x) => IMAGE.test(x) && re.test(path.basename(x)));
}

/** The words the visual pass read off the rendered page: `<letter>-<n>-text.txt`. */
export function renderedTextFor(names, letter, n) {
  return names.filter((x) => new RegExp(`^${letter}-${n}-text\\.txt$`).test(path.basename(x)));
}

/**
 * A directory that a tool rebuilds and no reviewer reads. Build outputs count only beside the
 * manifest that rebuilds them, so a variant's own `build/` folder is never mistaken for one.
 */
export function isRebuildable(name, siblings) {
  const has = (x) => siblings.includes(x);
  if (['node_modules', '.venv', 'venv', '__pycache__', '.pytest_cache', '.next', '.nuxt', '.svelte-kit', '.turbo', '.parcel-cache', '.vite'].includes(name)) return true;
  if (['dist', 'build', '.cache'].includes(name)) return has('package.json');
  if (name === 'target') return has('Cargo.toml');
  if (['Library', 'Temp', 'Logs', 'obj'].includes(name)) return has('Assets') && has('ProjectSettings');
  return false;
}

/**
 * The text of the element carrying `id` - the reveal round's "Why this design" section, kept as
 * Markdown-ish prose so the argument survives the deletion of the page that held it.
 */
export function extractById(html, id) {
  const open = new RegExp(`<([a-zA-Z][\\w-]*)\\b[^>]*\\bid=["']${id}["'][^>]*>`, 'i').exec(html);
  if (!open) return null;
  const tag = open[1].toLowerCase();
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  re.lastIndex = open.index + open[0].length;
  let depth = 1;
  let end = html.length;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) { end = m.index; break; }
  }
  return htmlToText(html.slice(open.index + open[0].length, end));
}

/**
 * The words of a whole page. A design contest's variant is a report, and its argument is the
 * part an auditor needs; a screenshot holds only the first screen of it. The first wrap kept
 * screenshots alone and lost nine reports' text, leaving the seats' one-page notes.
 */
export function pageText(html) {
  const body = /<body\b[^>]*>([\s\S]*)<\/body>/i.exec(html)?.[1] ?? html;
  const title = /<title>([^<]*)<\/title>/i.exec(html)?.[1]?.trim();
  const text = htmlToText(body.replace(/<(svg|canvas|noscript|template)\b[\s\S]*?<\/\1>/gi, ''));
  return text ? `${title ? `# ${title}\n\n` : ''}${text}` : null;
}

function htmlToText(inner) {
  const text = inner
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<h([1-6])\b[^>]*>/gi, (_, n) => `\n\n${'#'.repeat(Math.min(6, Number(n) + 1))} `)
    .replace(/<\/(h[1-6]|p|div|section|table|ul|ol)>/gi, '\n\n')
    .replace(/<tr\b[^>]*>/gi, '\n|').replace(/<t[dh]\b[^>]*>/gi, ' ').replace(/<\/t[dh]>/gi, ' |')
    .replace(/<li\b[^>]*>/gi, '\n- ').replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim()).join('\n')
    .replace(/\n{3,}/g, '\n\n').trim();
  return text || null;
}

/** Replace (or append) one `## <heading>` section of a Markdown note; the rest is untouched. */
export function upsertSection(text, heading, body) {
  const block = `## ${heading}\n\n${body.trim()}\n`;
  const src = String(text ?? '').replace(/\r\n/g, '\n');
  const start = src.search(new RegExp(`^## ${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm'));
  if (start === -1) return `${src.trimEnd()}\n\n${block}`;
  const rest = src.slice(start + 3 + heading.length);
  const next = rest.search(/^## /m);
  return `${src.slice(0, start)}${block}${next === -1 ? '' : `\n${rest.slice(next)}`}`;
}

export const human = (bytes) => (bytes >= 1 << 30 ? `${(bytes / (1 << 30)).toFixed(2)} GB` : bytes >= 1 << 20 ? `${(bytes / (1 << 20)).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);

// ---------------------------------------------------------------- filesystem (links never followed)

/** Bytes under p, counting a link as nothing. */
export function treeBytes(p) {
  let st;
  try { st = fs.lstatSync(p); } catch { return 0; }
  if (st.isSymbolicLink()) return 0;
  if (!st.isDirectory()) return st.size;
  let total = 0;
  for (const name of fs.readdirSync(p)) total += treeBytes(path.join(p, name));
  return total;
}

/** Delete p. A symlink or junction is unlinked, never entered, so its target survives. */
export function removeTree(p) {
  let st;
  try { st = fs.lstatSync(p); } catch { return; }
  if (st.isSymbolicLink()) {
    try { fs.unlinkSync(p); } catch { fs.rmdirSync(p); }
    return;
  }
  if (st.isDirectory()) {
    for (const name of fs.readdirSync(p)) removeTree(path.join(p, name));
    fs.rmdirSync(p);
    return;
  }
  try { fs.unlinkSync(p); } catch (e) {
    if (e.code !== 'EPERM') throw e;
    fs.chmodSync(p, 0o666); fs.unlinkSync(p);  // a read-only file a toolchain left behind
  }
}

/** Every rebuildable directory under p, outside the paths in `skip`; links are not entered. */
export function findRebuildable(p, skip = []) {
  const out = [];
  const walk = (d) => {
    if (skip.some((s) => path.resolve(s) === path.resolve(d))) return;
    let names;
    try { names = fs.readdirSync(d); } catch { return; }
    for (const name of names) {
      const full = path.join(d, name);
      let st;
      try { st = fs.lstatSync(full); } catch { continue; }
      if (st.isSymbolicLink() || !st.isDirectory()) continue;
      if (isRebuildable(name, names)) out.push(full); else walk(full);
    }
  };
  walk(p);
  return out;
}

/**
 * Byte-identical screenshots in one directory, all but the first of each set by name ('load' first).
 * The visual pass's probe frame is often the load frame again: every pair in two fleet backfills.
 */
export function duplicateShots(dir) {
  if (!fs.existsSync(dir)) return [];
  const seen = new Map();
  const dupes = [];
  const names = fs.readdirSync(dir).sort((a, b) => (/load/i.test(b) - /load/i.test(a)) || a.localeCompare(b));
  for (const name of names) {
    const full = path.join(dir, name);
    const st = fs.lstatSync(full);
    if (!st.isFile()) continue;
    const key = `${st.size}:${createHash('sha1').update(fs.readFileSync(full)).digest('hex')}`;
    if (seen.has(key)) dupes.push(full); else seen.set(key, full);
  }
  return dupes;
}

/** Files under p as paths relative to p, links not entered, rebuildable directories skipped. */
export function listFiles(p) {
  const out = [];
  const walk = (d, rel) => {
    let names;
    try { names = fs.readdirSync(d); } catch { return; }
    for (const name of names) {
      const full = path.join(d, name);
      let st;
      try { st = fs.lstatSync(full); } catch { continue; }
      if (st.isSymbolicLink()) continue;
      if (st.isDirectory()) { if (!isRebuildable(name, names)) walk(full, path.join(rel, name)); } else out.push(path.join(rel, name));
    }
  };
  walk(p, '');
  return out;
}

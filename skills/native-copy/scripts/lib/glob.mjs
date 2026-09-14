// glob.mjs - a tiny glob matcher and source expander. Builtins only.
//
// Supports `**` (any depth, including zero directories), `*` (within one segment),
// `?` (one character) and `{a,b}` alternation (alternatives may themselves hold
// wildcards). Paths are compared in POSIX form relative to the project root.

import fs from 'node:fs';
import path from 'node:path';

const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'out', 'coverage', '.turbo', '.vercel', '.cache']);

const escapeRe = (s) => s.replace(/[.+^$()|[\]\\]/g, '\\$&');

function convert(g) {
  let re = '';
  let i = 0;
  while (i < g.length) {
    const c = g[i];
    if (c === '*') {
      if (g[i + 1] === '*') {
        if (g[i + 2] === '/') { re += '(?:.*/)?'; i += 3; continue; }
        re += '.*'; i += 2; continue;
      }
      re += '[^/]*'; i += 1; continue;
    }
    if (c === '?') { re += '[^/]'; i += 1; continue; }
    if (c === '{') {
      let depth = 0; let end = -1;
      for (let j = i; j < g.length; j++) {
        if (g[j] === '{') depth++;
        else if (g[j] === '}') { depth--; if (depth === 0) { end = j; break; } }
      }
      if (end > i) {
        const alts = splitTopLevel(g.slice(i + 1, end));
        re += `(?:${alts.map(convert).join('|')})`;
        i = end + 1; continue;
      }
    }
    re += escapeRe(c); i += 1;
  }
  return re;
}

function splitTopLevel(s) {
  const out = []; let depth = 0; let cur = '';
  for (const ch of s) {
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur);
  return out;
}

export const toPosix = (p) => p.replace(/\\/g, '/');
export const isGlob = (p) => /[*?{]/.test(p);

export function globToRegExp(glob) {
  return new RegExp(`^${convert(toPosix(glob).replace(/^\.\//, ''))}$`);
}

export function matchGlob(glob, relPath) {
  return globToRegExp(glob).test(toPosix(relPath).replace(/^\.\//, ''));
}

/** The directory prefix before the first segment holding a wildcard. */
export function staticPrefix(glob) {
  const segs = toPosix(glob).replace(/^\.\//, '').split('/');
  const out = [];
  for (const s of segs) { if (isGlob(s)) break; out.push(s); }
  if (out.length === segs.length) out.pop();
  return out.join('/');
}

function walk(root, relDir, acc) {
  let entries;
  try { entries = fs.readdirSync(path.join(root, relDir), { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    const rel = relDir ? `${relDir}/${e.name}` : e.name;
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(root, rel, acc); }
    else if (e.isFile()) acc.push(rel);
  }
  return acc;
}

/**
 * Expand contract sources into files. First source to claim a file wins.
 * Returns { files: [{ file, kind, source }], perSource: [count] }.
 */
export function expandSources(root, sources, exclude = []) {
  const excludeRes = exclude.map(globToRegExp);
  const claimed = new Map();
  const perSource = sources.map(() => 0);
  const walked = new Map();
  sources.forEach((src, idx) => {
    const pattern = toPosix(src.path).replace(/^\.\//, '');
    let candidates;
    if (!isGlob(pattern)) {
      candidates = fs.existsSync(path.join(root, pattern)) ? [pattern] : [];
    } else {
      const prefix = staticPrefix(pattern);
      if (!walked.has(prefix)) walked.set(prefix, walk(root, prefix, []));
      const re = globToRegExp(pattern);
      candidates = walked.get(prefix).filter((f) => re.test(f));
    }
    for (const f of candidates.sort()) {
      if (excludeRes.some((re) => re.test(f))) continue;
      perSource[idx] += 1;
      if (!claimed.has(f)) claimed.set(f, { file: f, kind: src.kind, source: idx });
    }
  });
  return { files: [...claimed.values()], perSource };
}

/**
 * consult-log - the front door writes down what it opened.
 *
 * `scripts/consult-check.mjs` counts a governing subject as covered when a non-"missed"
 * row in the project's `.ai/consults.jsonl` names it inside the freshness window. Until
 * this module existed nothing but hand-written skill steps appended such rows, so a
 * session that did exactly what the access rule says (query, then read the one document)
 * was still recorded `missed`. The query front door (`registry_read` / `registry_subject`
 * over MCP, `--read` / `--subject` on scripts/registry-query.mjs) now appends the row
 * itself, through `logConsult` below.
 *
 * What counts as a consult: opening a knowledge document, or a subject's card. A search
 * (`registry_query`) is not one and never reaches this module.
 *
 * Where it writes: `<main checkout>/.ai/consults.jsonl` of the project the process runs
 * in. The project is the CALLER'S working directory, not the registry root: the MCP
 * server inherits the cwd of the client that spawned it, which for a project-scope or
 * user-scope server is the project being worked on. The main checkout is the common git
 * dir minus `/.git`, so a linked worktree logs where the project's own ledger lives
 * rather than into a directory its removal deletes. The write needs `.ai/manifest.yaml`
 * there (the same declaration consult-check uses to recognise a consumer); a git repo
 * that never subscribed is left alone rather than given a stray `.ai/`.
 *
 * Row: `{"ts","bundle","subjects":[slug],"techniques":[slug],"deviations":0,
 * "from":"registry-query"}`. Bare slugs only, never a path (the signals lane is public
 * and drops path-shaped values). No `outcome`: consult-check skips only
 * `outcome:"missed"`, signals-collect reads `bundle`/`subjects`/`deviations`, and
 * `deviations:0` on a one-subject row is read as that subject's state, so the writer
 * puts `null` there instead when it does not know the state (a null is ignored by the
 * Number.isInteger check in signals-collect).
 *
 * Contract: append-only, one line, never rewrites the file; every failure is swallowed
 * (the read it records must not fail because the log could not be written); a no-op when
 * env `REGISTRY_CONSULT_LOG=0`, when cwd is not inside a git checkout, or when the
 * checkout has no `.ai/manifest.yaml`. Zero dependencies.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/** Opt-out switch: REGISTRY_CONSULT_LOG=0 (also "false"/"off"). */
export function loggingDisabled(env = process.env) {
  return /^(0|false|off|no)$/i.test(String(env.REGISTRY_CONSULT_LOG ?? '').trim());
}

/**
 * The main checkout of the git repository containing `cwd`, or null when `cwd` is not
 * inside one (or git cannot say). A linked worktree resolves to its main checkout.
 */
export function mainCheckoutOf(cwd) {
  const git = (args) => spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf8', windowsHide: true, timeout: 5_000 });
  const r = git(['rev-parse', '--path-format=absolute', '--git-common-dir']);
  if (r.error || r.status !== 0) return null;
  const common = path.resolve(r.stdout.trim());
  if (path.basename(common) === '.git') return path.dirname(common);
  // A bare repository or a submodule's gitdir: no sibling checkout to name; use the toplevel.
  const top = git(['rev-parse', '--show-toplevel']);
  return !top.error && top.status === 0 && top.stdout.trim() ? path.resolve(top.stdout.trim()) : null;
}

/**
 * {bundle, subject, technique} for a repo-relative knowledge path, or null when the path
 * names no subject (a bundle's _laws.md, a README, a recipe, a skill, a doc). Taxonomy
 * depth varies, so the subject is found structurally: the directory above `techniques/`
 * or `applications/`, or the directory whose own file (<dir>/<dir>.md) is the golden path.
 */
export function consultFromPath(rel) {
  const seg = String(rel ?? '').replace(/\\/g, '/').split('/').filter(Boolean);
  if (seg[0] !== 'knowledge' || seg.length < 4 || seg.some((s) => s === '..')) return null;
  const bundle = seg[1];
  const file = seg[seg.length - 1];
  if (!file.endsWith('.md')) return null;
  const base = file.slice(0, -3);
  const dirs = seg.slice(2, -1);
  const k = dirs.findIndex((d) => d === 'techniques' || d === 'applications');
  let subject = null;
  let technique = null;
  if (k > 0) {
    subject = dirs[k - 1];
    if (dirs[k] === 'techniques' && k === dirs.length - 1) technique = base;
  } else if (dirs.length && dirs[dirs.length - 1] === base) {
    subject = base;
  }
  const slug = /^[a-z0-9-]+$/;
  if (!subject || !slug.test(bundle) || !slug.test(subject) || (technique && !slug.test(technique))) return null;
  return { bundle, subject, technique };
}

/**
 * Append one consult row. Returns the path written, or null when nothing was written
 * (opt-out, no checkout, no manifest, bad input, or a write error). Never throws.
 */
export function logConsult({ cwd = process.cwd(), bundle, subject, technique = null, env = process.env, now = () => new Date() } = {}) {
  try {
    if (loggingDisabled(env)) return null;
    const slug = /^[a-z0-9-]+$/;
    if (!slug.test(String(bundle ?? '')) || !slug.test(String(subject ?? ''))) return null;
    const root = mainCheckoutOf(cwd);
    if (!root || !fs.existsSync(path.join(root, '.ai', 'manifest.yaml'))) return null;
    const row = {
      ts: now().toISOString().replace(/\.\d+Z$/, 'Z'),
      bundle,
      subjects: [subject],
      techniques: technique && slug.test(technique) ? [technique] : [],
      deviations: null,
      from: 'registry-query',
    };
    const file = path.join(root, '.ai', 'consults.jsonl');
    fs.appendFileSync(file, JSON.stringify(row) + '\n', 'utf8');
    return file;
  } catch {
    return null;
  }
}

/** logConsult for a document the front door just served, derived from its path. */
export function logDocConsult(relPath, opts = {}) {
  const c = consultFromPath(relPath);
  return c ? logConsult({ ...opts, ...c }) : null;
}

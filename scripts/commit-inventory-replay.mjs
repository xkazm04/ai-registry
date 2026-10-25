#!/usr/bin/env node
/**
 * commit-inventory-replay - replay a commit-inventory guard over recorded sessions BEFORE
 * anyone enables it, and print the rows it would have refused.
 *
 * Why this exists. The shared checkout is written by many live sessions at once, so
 * "modified in the working tree" never means "modified by me". Three incident classes
 * land foreign files under a run's name: a pathspec derived from `git status`, a commit
 * without a pathspec that takes whatever a sibling staged, and a pathspec commit that
 * takes the working-tree content of a file a sibling also edits. The proposed guard is a
 * pre-commit check: refuse a commit carrying a path the committing session never wrote.
 * Doctrine says a guard is replayed over recorded sessions before it is enabled, and the
 * matched rows are read, not only counted. This is that replay. It installs nothing.
 *
 * Why "replay" and not "guard": nothing here runs at commit time. It reconstructs, from
 * Claude Code transcripts, what a live guard would have known at the moment each commit
 * was made, and reports the verdict that guard would have returned.
 *
 * What it does, per non-merge commit in the range:
 *
 *   1. MAP the commit to the tool call that made it. A commit-bearing Bash/PowerShell call
 *      (`git ... commit|revert|cherry-pick|am`) whose call..result window brackets the
 *      commit's AUTHOR date (a rebase rewrites the sha and committer date, never the
 *      author date). Evidence, strongest first: the sha in that call's output, the subject
 *      in its command or output, the subject in a message file the session wrote earlier,
 *      the window alone. Two different sessions tied at the best evidence = ambiguous,
 *      never guessed.
 *   2. INVENTORY the committing session (main transcript + all its subagents, Workflow
 *      agents included) up to that call: Write/Edit/MultiEdit/NotebookEdit paths; shell
 *      write targets (redirects, tee, sed -i, cp/mv/rm, PowerShell content cmdlets, git
 *      checkout/restore of a path); paths named to a git staging verb (add, rm, mv,
 *      update-index, commit pathspec, restore --staged); path literals in inline code or a
 *      script the session wrote and then ran, when that code stages or writes (the "HEAD +
 *      my rows" blob staging of a shared ledger is done this way); and the declared outputs
 *      of a registry generator the session ran (index, catalog, rules, marketplace, recipe
 *      and publication indexes, run results, usage rows). Shell words are expanded the way
 *      the shell would: variables (unquoted ones word-split), braces, one loop body per
 *      `for` value. A path computed at run time (`$(git status ...)`, a list read from a
 *      checker's output) is invisible here - which is exactly the sweep shape, and also the
 *      main source of false flags.
 *   3. COMPARE with the commit's own paths (`--name-status --no-renames`). A committed path
 *      in no tier is FLAGGED. Two verdicts are reported side by side:
 *        B        the guard as briefed: wrote + generated + named-to-git
 *        B-strict wrote + generated only. Naming a path to `git add` is the commit itself,
 *                 not evidence of authorship - a sweep TYPED from `git status` output passes
 *                 B and fails B-strict.
 *   4. HINT each flagged path for the reader: did this session mention it at all, and did
 *      another session write it shortly before. The hint is not the verdict.
 *
 * What it cannot see, by construction: a sibling's HUNK inside a file this session also
 * wrote (path granularity), a sibling's subject baked into a regenerated hash, and any
 * commit made by a process that leaves no Claude Code transcript.
 *
 * Self-assertion: before reading any transcript it builds a synthetic session and commit
 * with one planted foreign path and requires its own comparator to flag exactly that
 * path. A replay that cannot find a planted positive has no standing to report an absence.
 *
 * Privacy: transcripts are read, never copied. Rows (session ids, paths, verdicts) are
 * written only to --out, which belongs outside the repository. Stdout carries counts and
 * commit shas only.
 *
 * Reader and retirement. Its reader is whoever proposes enabling a commit-time inventory
 * guard: the replay is that guard's arm A/B, and its first numbers are the 2026-10-14
 * row for concurrent-vcs/commit-verification in librarian/applied.md. Retire it when a
 * live guard checks an inventory the agent declares at commit time and carries its own
 * replay, or when transcripts are no longer retained long enough to cover a sweep.
 *
 * Usage:
 *   node scripts/commit-inventory-replay.mjs --since 2026-09-01 --out <dir outside the repo>
 *     [--until <date>] [--rev <rev>] [--sha <sha>]... [--claude-projects <dir>]
 *     [--transcripts <dir>]... [--all-folders] [--expect <sha>=<path>,<path>]... [--plant <sha>=<path>,...]...
 *   --all-folders  also read sessions launched in OTHER projects (prefiltered: written since
 *             --since, naming this repo, holding a commit-bearing call)
 *   --expect  a known sweep: the replay reports whether exactly these paths were flagged
 *   --plant   a synthetic seed: these foreign paths are ADDED to the commit's path list
 *             before comparison; each must come back flagged or the run is FATAL
 *
 * Exit: 0 nothing flagged; 1 commits flagged (the instrument found what it looks for);
 * 2 could not run (no transcripts, git failed, self-assertion or a planted seed failed).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';
import { encodeProjectPath, transcriptDirs } from './lib/runs-transcript.mjs';

const HERE_ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

// ---------------------------------------------------------------- paths

/** Comparable form of an absolute path: forward slashes, msys drive form folded, lowercase. */
export function normAbs(p) {
  let s = String(p).replace(/\\/g, '/');
  const msys = /^\/([a-zA-Z])(\/|$)/.exec(s);
  if (msys) s = `${msys[1]}:/${s.slice(3)}`;
  s = path.posix.normalize(s);
  if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1);
  return s.toLowerCase();
}

// `/tmp/x` is absolute too (an msys path outside any drive form); only `/c/...` is folded to `c:/...`
const isAbsLike = (t) => /^[a-zA-Z]:[\\/]/.test(t) || t.startsWith('/') || t.startsWith('\\\\');

/** Resolve a path token against a cwd (both raw), return the comparable absolute form. */
export function resolveTok(tok, cwd) {
  let t = tok;
  if (t.startsWith('~/')) t = path.join(os.homedir(), t.slice(2));
  if (isAbsLike(t)) return normAbs(t);
  if (!cwd) return null;
  return normAbs(`${String(cwd).replace(/\\/g, '/')}/${t}`);
}

/**
 * The repository root a commit's working directory sits in: `.claude/worktrees/<name>`,
 * else a registered root it falls under, else the directory itself - a commit is run from
 * its worktree's root (`cd <worktree> && git commit`), which may sit at any depth
 * (`<drive>:/t/<run>/wt` is common), so no depth convention is imposed here.
 */
export function rootOf(dir, knownRoots = []) {
  const d = normAbs(dir);
  const wt = /^(.*\/\.claude\/worktrees\/[^/]+)/.exec(d);
  if (wt) return wt[1];
  let best = null;
  for (const r of knownRoots) if ((d === r || d.startsWith(`${r}/`)) && (!best || r.length > best.length)) best = r;
  return best ?? d;
}

/**
 * Repo-relative form of an absolute path, or null. The root is the longest of: a known
 * root it falls under, a `.claude/worktrees/<name>` worktree, a `<drive>:/t/<name>` short
 * worktree. A path under none of them is unrooted (the comparator may still suffix-match it).
 */
export function relTo(abs, roots) {
  const cands = [];
  for (const r of roots) if (abs === r || abs.startsWith(`${r}/`)) cands.push(r);
  const wt = /^(.*\/\.claude\/worktrees\/[^/]+)(\/|$)/.exec(abs);
  if (wt) cands.push(wt[1]);
  const short = /^([a-z]:\/t\/[^/]+)(\/|$)/.exec(abs);
  if (short) cands.push(short[1]);
  if (!cands.length) return null;
  const best = cands.reduce((a, b) => (b.length > a.length ? b : a));
  return abs === best ? '' : abs.slice(best.length + 1);
}

const globToRe = (g) => new RegExp(`^${g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*\/?/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]').replace(/\u0000/g, '.*')}$`);

// ---------------------------------------------------------------- shell tokenizer

/**
 * Split a shell (bash or PowerShell) command into segments of tokens. Quotes are honoured,
 * heredoc bodies are lifted out (returned in `bodies`, never parsed as commands), `$(...)`
 * and backticks make a token dynamic, `$VAR` stays a variable part for the caller to expand.
 * A token is { parts: [{lit}|{v}|{dyn}], op? }. Operators && || ; | & newline end a segment.
 */
export function tokenize(cmd, { powershell = false } = {}) {
  const segs = []; const bodies = [];
  let toks = []; let cur = null; let pendingTarget = null;
  const heredocs = [];
  // q marks a part that was quoted or escaped: it is not word-split or brace-expanded
  const lit = (s, q = false) => { if (!cur) cur = { parts: [] }; const last = cur.parts[cur.parts.length - 1]; if (last && 'lit' in last && last.q === q) last.lit += s; else cur.parts.push({ lit: s, q }); };
  const part = (p) => { if (!cur) cur = { parts: [] }; cur.parts.push(p); };
  let inDq = false;
  const push = () => { if (cur) { if (pendingTarget) { cur.target = pendingTarget; pendingTarget = null; } toks.push(cur); cur = null; } };
  const endSeg = () => { push(); pendingTarget = null; if (toks.length) segs.push(toks); toks = []; };
  const n = cmd.length; let i = 0;
  const readVar = () => {
    // at cmd[i] === '$'
    if (cmd[i + 1] === '(') { let depth = 0; let j = i + 1; for (; j < n; j++) { if (cmd[j] === '(') depth++; else if (cmd[j] === ')') { depth--; if (depth === 0) break; } } part({ dyn: true }); i = j + 1; return; }
    if (cmd[i + 1] === '{') { const j = cmd.indexOf('}', i + 2); const name = cmd.slice(i + 2, j < 0 ? n : j); if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) part({ v: name, q: inDq }); else part({ dyn: true }); i = j < 0 ? n : j + 1; return; }
    const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(cmd.slice(i + 1, i + 80));
    if (m) { part({ v: m[0], q: inDq }); i += 1 + m[0].length; return; }
    if (/[0-9@*#?$!-]/.test(cmd[i + 1] ?? '')) { part({ dyn: true }); i += 2; return; }
    lit('$', inDq); i += 1;
  };
  const esc = powershell ? '`' : '\\';
  while (i < n) {
    const ch = cmd[i];
    if (ch === '\n') {
      endSeg(); i++;
      while (heredocs.length) {
        const { delim, strip, seg } = heredocs.shift();
        let body = '';
        while (i < n) {
          let e = cmd.indexOf('\n', i); if (e < 0) e = n;
          const line = cmd.slice(i, e).replace(/\r$/, '');
          i = e + 1;
          if ((strip ? line.replace(/^\t+/, '') : line).trim() === delim) break;
          body += `${line}\n`;
        }
        bodies.push({ text: body, seg });
      }
      continue;
    }
    if (ch === "'") {
      const j = cmd.indexOf("'", i + 1); lit(cmd.slice(i + 1, j < 0 ? n : j), true); i = j < 0 ? n : j + 1; continue;
    }
    if (ch === '"') {
      lit('', true);
      i++; inDq = true;
      while (i < n && cmd[i] !== '"') {
        if (cmd[i] === esc && i + 1 < n) { const nx = cmd[i + 1]; if (powershell || '"\\$`\n'.includes(nx)) { if (nx !== '\n') lit(nx, true); i += 2; continue; } lit(cmd[i], true); i++; continue; }
        if (cmd[i] === '$') { readVar(); continue; }
        if (!powershell && cmd[i] === '`') { const j = cmd.indexOf('`', i + 1); part({ dyn: true }); i = j < 0 ? n : j + 1; continue; }
        lit(cmd[i], true); i++;
      }
      inDq = false;
      i++; continue;
    }
    if (ch === esc && i + 1 < n) { if (cmd[i + 1] === '\n') { i += 2; continue; } lit(cmd[i + 1], true); i += 2; continue; }
    if (!powershell && ch === '`') { const j = cmd.indexOf('`', i + 1); part({ dyn: true }); i = j < 0 ? n : j + 1; continue; }
    if (ch === '$') { readVar(); continue; }
    if (ch === '#' && !cur) { const e = cmd.indexOf('\n', i); i = e < 0 ? n : e; continue; }
    if (ch === ' ' || ch === '\t' || ch === '\r') { push(); i++; continue; }
    if (ch === ';' || ch === '|' || ch === '&' || ch === '(' || ch === ')') {
      if (ch === '&' && cmd[i + 1] === '>') { push(); i += 2; if (cmd[i] === '>') i++; pendingTarget = 'out'; continue; }
      if (ch === '&' && cur && cur.parts.length === 1 && cur.parts[0].lit === '' ) { /* empty */ }
      endSeg(); i += (cmd[i + 1] === ch && (ch === '&' || ch === '|')) ? 2 : 1; continue;
    }
    if (ch === '>' || ch === '<') {
      if (ch === '<' && cmd[i + 1] === '<' && cmd[i + 2] !== '<') {
        push(); let j = i + 2; let strip = false; if (cmd[j] === '-') { strip = true; j++; }
        while (cmd[j] === ' ') j++;
        const m = /^(['"]?)([A-Za-z0-9_.-]+)\1/.exec(cmd.slice(j, j + 80));
        // the body belongs to the segment being built now: its index once it is pushed
        if (m) { heredocs.push({ delim: m[2], strip, seg: segs.length }); i = j + m[0].length; continue; }
        i += 2; continue;
      }
      // a pure-digit token right before > is a file descriptor
      let fd = '';
      if (cur && cur.parts.length === 1 && /^[0-9]$/.test(cur.parts[0].lit ?? '')) { fd = cur.parts[0].lit; cur = null; } else push();
      let j = i + 1;
      if (ch === '>' && (cmd[j] === '>' || cmd[j] === '|')) j++;
      if (cmd[j] === '&') { j++; while (/[0-9-]/.test(cmd[j] ?? '')) j++; i = j; continue; } // dup: 2>&1, >&2
      i = j;
      pendingTarget = ch === '>' ? (fd === '' || fd === '1' || fd === '2' ? 'out' : 'out') : 'in';
      continue;
    }
    lit(ch); i++;
  }
  endSeg();
  return { segs, bodies };
}

/** `a/{x,y}.md` -> [`a/x.md`, `a/y.md`], capped so a pathological token cannot explode. */
export function expandBraces(s, cap = 256) {
  const m = /\{([^{}]*,[^{}]*)\}/.exec(s);
  if (!m) return [s];
  const pre = s.slice(0, m.index); const post = s.slice(m.index + m[0].length);
  const out = [];
  for (const alt of m[1].split(',')) { for (const x of expandBraces(pre + alt + post, cap)) { if (out.length >= cap) return out; out.push(x); } }
  return out;
}

/**
 * Expand a token into the words the shell would pass: known variables substituted, an
 * UNQUOTED variable word-split on whitespace (`git add $FILES`), an all-unquoted token
 * brace-expanded. Returns null when any part is dynamic or unknown - unless `placeholder`
 * is given, which then stands in for the unknown part.
 */
export function expandWords(tok, vars, placeholder = null) {
  // a `for NAME in a b c` variable holds { loop: [...] }: one expansion per value
  const lp = tok.parts.find((x) => 'v' in x && vars.get(x.v)?.loop);
  if (lp) {
    const out = [];
    for (const val of vars.get(lp.v).loop.slice(0, 256)) {
      const one = new Map(vars); one.set(lp.v, val);
      const w = expandWords(tok, one, placeholder);
      if (w === null) return null;
      out.push(...w);
    }
    return out;
  }
  return expandWords0(tok, vars, placeholder);
}

function expandWords0(tok, vars, placeholder = null) {
  let fields = ['']; let anyQuoted = false;
  for (const p of tok.parts) {
    if ('lit' in p) { fields[fields.length - 1] += p.lit; if (p.q) anyQuoted = true; continue; }
    if ('v' in p && vars.has(p.v)) {
      const val = vars.get(p.v);
      if (p.q) { fields[fields.length - 1] += val; anyQuoted = true; continue; }
      const pieces = val.split(/\s+/);
      fields[fields.length - 1] += pieces[0];
      for (const x of pieces.slice(1)) fields.push(x);
      continue;
    }
    if (placeholder === null) return null;
    fields[fields.length - 1] += placeholder;
  }
  const nonEmpty = fields.filter((f) => f !== '');
  fields = nonEmpty.length ? nonEmpty : (anyQuoted ? [''] : []);
  return anyQuoted ? fields : fields.flatMap((f) => expandBraces(f));
}

/** One-string form of expandWords, for callers that need a single value. */
export function expandTok(tok, vars, placeholder = null) {
  const w = expandWords(tok, vars, placeholder);
  return w === null ? null : w.join(' ');
}

// ---------------------------------------------------------------- command -> claims

const STAGING_RE = /update-index|hash-object|\bgit\b[^\n]{0,40}\b(?:add|commit|rm)\b|['"](?:add|update-index)['"]/;
const WRITING_RE = /writeFileSync|appendFileSync|copyFileSync|renameSync|\bopen\([^)\n]*['"][wax]\+?b?['"]|write_text|write_bytes|Set-Content|Add-Content|Out-File|WriteAllText|AppendAllText/;
/** Does this code stage into the index, write files, both or neither. */
export const codeFlags = (code) => ({ staging: STAGING_RE.test(code), writing: WRITING_RE.test(code) });
const SCRIPT_EXT = /\.(mjs|cjs|js|py|ts|sh|ps1)$/i;

/**
 * Path literals in code that stages or writes, as claims relative to `base`:
 * 'code-staged' when the code stages, 'code-write' when it writes. A literal directory in
 * writing code carries the code's other literals as stems, so `base + name + '.md'` can
 * match a committed path under that directory whose stem is one of them.
 */
export function literalClaims(code, base) {
  const { staging, writing } = codeFlags(code);
  if (!staging && !writing) return [];
  const out = []; const dirs = []; const stems = new Set();
  for (const m of code.matchAll(/(['"`])([^'"`\n]{1,300})\1/g)) {
    const l = m[2];
    if (/^[A-Za-z0-9_.@~:\\/-]+$/.test(l) && (/[\\/]/.test(l) || (writing && /^[A-Za-z0-9][A-Za-z0-9_.-]*\.[A-Za-z0-9]{1,8}$/.test(l))) && !/^[a-z]+:\/\//i.test(l)) {
      if (/[\\/]$/.test(l)) dirs.push(l);
      else if (/\.[A-Za-z0-9]{1,8}$/.test(l)) {
        const abs = resolveTok(l, base);
        if (abs) { if (staging) out.push({ tier: 'code-staged', abs }); if (writing) out.push({ tier: 'code-write', abs }); }
      }
    }
    if (/^[A-Za-z0-9][A-Za-z0-9._-]{1,120}$/.test(l)) stems.add(l.toLowerCase().replace(/\.[a-z0-9]{1,8}$/, ''));
  }
  if (writing) for (const d of dirs) { const abs = resolveTok(d, base); if (abs) out.push({ tier: 'code-write', abs, stems: [...stems] }); }
  return out;
}

/** Registry generators by script basename -> the repo-relative outputs they own. */
export const GENERATORS = Object.freeze({
  'build-index': [/^knowledge\/[^/]+\/index\.json$/],
  'build-catalog': [/^catalog\.json$/],
  'build-knowledge-rules': [/^rules\//],
  'build-marketplace': [/^\.claude-plugin\/marketplace\.json$/],
  'render-recipes': [/^recipes\//],
  'build-recipes-index': [/^recipes\/index\.json$/],
  'build-publications-index': [/^publications\/index\.json$/],
  'librarian-scan': [/^librarian\/standard\.md$/],
  'build-fleet-map': [/^librarian\/fleet-map\.(json|md)$/],
  converge: [/^librarian\/fleet-coverage\.md$/],
  'leads-collect': [/^librarian\/inbox\.md$/],
  'upstream-check': [/^librarian\/upstream\.md$/],
  'backlog-wave': [/^librarian\/harvest\/backlog\.jsonl$/],
  'signals-collect': [/^signals\//],
  'usage-from-personas': [/^usage\//],
  'runs-backfill': [/^usage\/runs\//],
  'log-run': [/^usage\/runs\//, /^\.ai\/skill-runs\.local\.jsonl$/],
  'run-result': [/^librarian\/runs\/[^/]+\/result\.json$/],
  'register-project': [/^projects\.json$/],
  'apply-skill-clauses': [/^\.claude\/skills\//, /^skills\//],
  // A knowledge move rewrites links wherever they point from: broad on purpose.
  'apply-taxonomy': [/^knowledge\//, /^rules\//, /^catalog\.json$/, /^librarian\//, /^practices\//, /^skills\//, /^\.claude\/skills\//],
});
const GATE_WRITE = ['build-index', 'build-catalog', 'build-knowledge-rules', 'build-marketplace', 'render-recipes', 'build-recipes-index', 'build-publications-index', 'librarian-scan'];

const SKIP_LEAD = new Set(['then', 'do', 'else', 'elif', 'if', 'while', 'until', '!', 'time', '{', '}', 'exec', 'command', 'nohup', 'env', 'xargs', 'timeout']);
const pathish = (t) => t && !t.startsWith('-') && !/^[a-z]+:\/\//i.test(t) && (t.includes('/') || t.includes('\\') || /\.[A-Za-z0-9]{1,8}$/.test(t)) && !/[\s<>|]/.test(t) && t.length < 400;
const DEVNULL = /^(\/dev\/null|nul|\$null)$/i;

/**
 * Every path claim one command makes. Returns
 *   { claims: [{tier, abs, glob?}], broad: bool, gens: [name], commitCwd: string|null,
 *     commitKind: string|null, revs: [rev], bodies: [{text, seg}] }
 * tiers: 'shell-write' | 'staged' | 'arg'. Generators are returned by name, their outputs
 * resolved at comparison time.
 */
export function claimsOfCommand(command, cwd0, { powershell = false } = {}) {
  const out = { claims: [], broad: false, gens: [], commitCwd: null, commitKind: null, revs: [], bodies: [], commits: [], scripts: [], runs: [] };
  let tz;
  try { tz = tokenize(command, { powershell }); } catch { return out; }
  out.bodies = tz.bodies;
  const vars = new Map();
  let cwd = cwd0;
  const add = (tier, tok, base = cwd) => {
    if (tok === null || tok === undefined || tok === '' || DEVNULL.test(tok)) return;
    if (/[*?]/.test(tok)) { const abs = resolveTok(tok, base); if (abs) out.claims.push({ tier, abs, glob: globToRe(abs) }); return; }
    const abs = resolveTok(tok, base);
    if (abs) out.claims.push({ tier, abs });
  };
  // Inline code (node -e, python -c, an interpreter's heredoc) that stages or writes:
  // the registry's own "HEAD + my rows" method stages a ledger by blob from a JS array of
  // literal paths, and appends to it from the same array. Its path literals are claims:
  // 'code-staged' when the code stages, 'code-write' when it writes. A literal directory
  // in writing code is kept with the code's other literals, so `base + name + '.md'` can
  // be matched to a committed path under that directory whose stem is one of them.
  const codeClaims = (code, base) => { out.claims.push(...literalClaims(code, base)); };
  const INTERP = new Set(['node', 'python', 'python3', 'py', 'bun', 'deno', 'bash', 'sh', 'pwsh', 'powershell']);
  // A segment that names a loop variable runs once per value, as the shell would:
  // `for f in a b; do cp "$D/$f" "/w/$D/$f"; done` is two copies, not one with four words.
  const queue = tz.segs.map((seg, si) => ({ seg, si, bind: null }));
  let restore = null;
  for (let qi = 0; qi < queue.length; qi++) {
    if (restore) { vars.set(restore[0], restore[1]); restore = null; }
    const { seg, si, bind } = queue[qi];
    if (bind) { restore = [bind[0], vars.get(bind[0])]; vars.set(bind[0], bind[1]); }
    else {
      const lv = seg.flatMap((t) => t.parts).find((x) => 'v' in x && vars.get(x.v)?.loop);
      if (lv) { queue.splice(qi + 1, 0, ...vars.get(lv.v).loop.slice(0, 256).map((val) => ({ seg, si, bind: [lv.v, val] }))); continue; }
    }
    // redirect targets first: they are writes whatever the command is
    // words: expanded, null when any part is unknown; loose: unknown parts as \u0001, so
    // a value whose unknown part is not the path (`--cacheinfo 100644,$B,<path>`) survives
    const words = []; const loose = [];
    for (const t of seg) {
      const ws = expandWords(t, vars); const ls = expandWords(t, vars, '\u0001');
      if (t.target === 'out') {
        add('shell-write', ws ? ws[0] : null);
        // `cat > stage.mjs <<'EOF'` writes a script whose behaviour a later run inherits
        if (ws && SCRIPT_EXT.test(ws[0])) { const abs = resolveTok(ws[0], cwd); const body = tz.bodies.filter((b) => b.seg === si).map((b) => b.text).join('\n'); if (abs && body) out.scripts.push({ abs, code: body.slice(0, 200000), ...codeFlags(body) }); }
        continue;
      }
      if (t.target === 'in') continue;
      if (ws) for (let q = 0; q < ws.length; q++) { words.push(ws[q]); loose.push(ls[q] ?? ws[q]); }
      else for (const l of ls) { words.push(null); loose.push(l); }
    }
    // assignments: NAME=value (bash); a value with an unknown part forgets the name
    while (loose.length && loose[0] && /^[A-Za-z_][A-Za-z0-9_]*=/.test(loose[0])) {
      const k = loose[0].slice(0, loose[0].indexOf('='));
      if (words[0] === null) vars.delete(k); else vars.set(k, words[0].slice(k.length + 1));
      words.shift(); loose.shift();
    }
    if (powershell && words.length >= 3 && words[1] === '=' && seg[0]?.parts?.[0]?.v) { vars.set(seg[0].parts[0].v, words[2] ?? ''); continue; }
    if (words[0] === 'export' && words[1] && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[1])) { const w = words[1]; vars.set(w.slice(0, w.indexOf('=')), w.slice(w.indexOf('=') + 1)); continue; }
    if (words[0] === 'for' && words[2] === 'in' && words[1]) { vars.set(words[1], { loop: words.slice(3).filter((w) => w !== null) }); continue; }
    for (;;) {
      if (!words.length) break;
      const w0 = words[0];
      const drop = () => { words.shift(); loose.shift(); };
      if (w0 === 'timeout') {
        drop();
        while (words.length && words[0] && words[0].startsWith('-')) { const o = words[0]; drop(); if ((o === '-k' || o === '-s') && words.length) drop(); }
        if (words.length && /^\d+(\.\d+)?[smhd]?$/.test(words[0] ?? '')) drop();
        continue;
      }
      if (w0 === 'env') { drop(); while (words.length && words[0] && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[0])) drop(); continue; }
      if (SKIP_LEAD.has(w0)) { drop(); continue; }
      // a prefix assignment after a keyword: `then GIT_INDEX_FILE="$IDX" git commit ...`
      if (loose[0] && /^[A-Za-z_][A-Za-z0-9_]*=/.test(loose[0]) && words.length > 1) { drop(); continue; }
      break;
    }
    if (!words.length) continue;
    const verb = words[0] === null ? null : String(words[0]).replace(/\.exe$/i, '');
    const args = words.slice(1);
    const vlow = verb ? verb.toLowerCase() : '';
    if (vlow === 'cd' || vlow === 'pushd' || vlow === 'set-location' || vlow === 'sl') {
      const target = args.find((a) => a !== null && !a.startsWith('-'));
      if (target) { const r = resolveTok(target, cwd); if (r) cwd = r; }
      continue;
    }
    if (vlow === 'git') {
      let k = 0; let gcwd = cwd;
      while (k < args.length && args[k] !== null && args[k].startsWith('-')) {
        if (args[k] === '-C') { const r = args[k + 1] !== null ? resolveTok(args[k + 1], cwd) : null; if (r) gcwd = r; k += 2; continue; }
        if (args[k] === '-c' || args[k] === '--git-dir' || args[k] === '--work-tree') { k += 2; continue; }
        k++;
      }
      const sub = args[k]; const rest = args.slice(k + 1);
      // withArg: options whose value is the next word; argLetters: a short-option cluster
      // ending in one of these letters (`-qm "msg"`, `-qF file`) also takes the next word.
      const nonOpt = (list, withArg = [], argLetters = '') => {
        const r = []; let afterDash = false;
        for (let q = 0; q < list.length; q++) {
          const a = list[q];
          if (a === null) { r.push(null); continue; }
          if (!afterDash && a === '--') { afterDash = true; continue; }
          if (!afterDash && a.startsWith('-')) {
            if (withArg.includes(a) || (argLetters && /^-[a-zA-Z]+$/.test(a) && argLetters.includes(a[a.length - 1]))) q++;
            continue;
          }
          r.push(a);
        }
        return r;
      };
      const afterDashes = (list) => { const at = list.indexOf('--'); return at < 0 ? null : list.slice(at + 1); };
      if (sub === 'add') {
        if (rest.some((a) => a === '-A' || a === '--all' || a === '-u' || a === '--update')) out.broad = true;
        for (const a of nonOpt(rest, ['--chmod', '--pathspec-from-file'])) {
          if (a === null) continue;
          const abs = resolveTok(a, gcwd);
          if (a === '.' || a === ':/' || a === '*') { out.broad = true; out.claims.push({ tier: 'staged-dir', abs }); continue; }
          add('staged', a, gcwd);
        }
      } else if (sub === 'rm' || sub === 'mv') {
        for (const a of nonOpt(rest)) { add('staged', a, gcwd); add('shell-write', a, gcwd); }
      } else if (sub === 'update-index') {
        const lrest = loose.slice(1).slice(k + 1);
        const known = (x) => (x && !x.includes('\u0001') ? x : null);
        for (let q = 0; q < lrest.length; q++) {
          const a = lrest[q]; if (a === null) continue;
          if (a === '--cacheinfo') { if (/^\d{6}$/.test(lrest[q + 1] ?? '') && lrest[q + 3] !== undefined) { add('staged', known(lrest[q + 3]), gcwd); q += 3; } continue; }
          const v = (a.startsWith('--cacheinfo=') ? a.slice(12) : a).split(',');
          if (v.length === 3 && /^\d{6}$/.test(v[0])) { add('staged', known(v[2]), gcwd); continue; }
          if (a.includes('\u0001') || a.startsWith('-')) continue;
          add('staged', a, gcwd);
        }
      } else if (sub === 'commit' || sub === 'revert' || sub === 'cherry-pick' || sub === 'am') {
        out.commitCwd = gcwd; out.commitKind = sub; out.commits.push({ cwd: gcwd, kind: sub });
        if (sub === 'commit') {
          if (rest.some((a) => a === '-a' || a === '--all' || (a && /^-[a-zA-Z]*a[a-zA-Z]*$/.test(a) && !a.startsWith('--')))) out.broad = true;
          const ps = afterDashes(rest) ?? nonOpt(rest, ['--author', '--date', '--fixup', '--squash', '--file', '--message', '--trailer', '--cleanup', '--template', '--reuse-message', '--reedit-message'], 'mFCct');
          for (const a of ps) if (a !== null) add('staged', a, gcwd);
        } else {
          for (const a of nonOpt(rest, ['-m', '--mainline', '-X', '--strategy'])) if (a) out.revs.push(a);
        }
      } else if (sub === 'restore') {
        const staged = rest.includes('--staged') || rest.includes('-S');
        const worktree = !staged || rest.includes('--worktree') || rest.includes('-W');
        for (const a of nonOpt(rest.filter((x) => !(x && x.startsWith('--source'))), ['-s', '--source'])) { if (staged) add('staged', a, gcwd); if (worktree) add('shell-write', a, gcwd); }
      } else if (sub === 'checkout' || sub === 'reset') {
        const ps = afterDashes(rest);
        if (ps) for (const a of ps) { if (sub === 'checkout') add('shell-write', a, gcwd); add('staged', a, gcwd); }
      }
      for (const a of rest) if (a && pathish(a)) add('arg', a, gcwd);
      continue;
    }
    if (vlow === 'node' || vlow === 'python' || vlow === 'python3' || vlow === 'py' || vlow === 'bun' || vlow === 'deno') {
      const script = args.find((a) => a !== null && !a.startsWith('-'));
      if (script && /\.(mjs|js|cjs|py|ts)$/i.test(script)) {
        const base = path.basename(script.replace(/\\/g, '/')).replace(/\.(mjs|js|cjs|py|ts)$/i, '');
        if (base === 'gate') { if (args.includes('--write')) out.gens.push(...GATE_WRITE); }
        else if (base === 'run-result') { if (args.includes('write')) out.gens.push(base); }
        else if (GENERATORS[base]) {
          // A --check or --dry-run invocation writes nothing.
          if (!args.some((a) => a === '--check' || a === '--dry-run' || a === '--self-test' || a === '--check-weights')) out.gens.push(base);
        }
      }
      for (const a of args) if (a && pathish(a) && a !== script) add('arg', a);
      if (script && SCRIPT_EXT.test(script)) { const sabs = resolveTok(script, cwd); if (sabs) out.runs.push({ script: sabs, cwd, args: args.filter((a) => a && a !== script && pathish(a)).map((a) => resolveTok(a, cwd)).filter(Boolean) }); }
      const inline = [];
      for (let q = 0; q < args.length; q++) if (['-e', '-c', '--eval', '-p', '--print'].includes(args[q]) && args[q + 1]) inline.push(args[q + 1]);
      for (const b of tz.bodies) if (b.seg === si) inline.push(b.text);
      if (inline.length) codeClaims(inline.join('\n'), cwd);
      continue;
    }
    if (INTERP.has(vlow)) {
      // a shell fed a heredoc runs that heredoc: parse it as commands from this cwd
      for (const b of tz.bodies) {
        if (b.seg !== si) continue;
        if (vlow === 'bash' || vlow === 'sh') {
          const sub = claimsOfCommand(b.text, cwd, { powershell: false });
          out.claims.push(...sub.claims); out.gens.push(...sub.gens); if (sub.broad) out.broad = true;
        } else codeClaims(b.text, cwd);
      }
      continue;
    }
    const noOpt = args.filter((a) => a !== null && !a.startsWith('-'));
    if (vlow === 'sed' || vlow === 'perl') {
      if (args.some((a) => a && /^-[a-zA-Z]*i/.test(a))) {
        const hasE = args.some((a) => a === '-e' || a === '-f');
        const files = hasE ? args.filter((a, q) => a !== null && !a.startsWith('-') && !(args[q - 1] === '-e' || args[q - 1] === '-f')) : noOpt.slice(1);
        for (const f of files) add('shell-write', f);
      }
      continue;
    }
    if (vlow === 'cp' || vlow === 'mv' || vlow === 'install' || vlow === 'copy-item' || vlow === 'move-item' || vlow === 'cpi' || vlow === 'mi') {
      let dst; let srcs;
      const di = args.findIndex((a) => a && /^-dest/i.test(a));
      if (di >= 0) { dst = args[di + 1]; srcs = noOpt.filter((a) => a !== dst); } else { dst = noOpt[noOpt.length - 1]; srcs = noOpt.slice(0, -1); }
      if (dst) {
        add('shell-write', dst);
        // into a directory when the destination says so: a trailing slash, several sources, no extension
        const intoDir = /[\\/]$/.test(dst) || srcs.length > 1 || !/\.[A-Za-z0-9]{1,8}$/.test(dst);
        if (intoDir) for (const s of srcs) add('shell-write', `${dst.replace(/[\\/]$/, '')}/${path.basename(s.replace(/\\/g, '/'))}`);
      }
      if (vlow === 'mv' || vlow === 'move-item' || vlow === 'mi') for (const s of srcs) add('shell-write', s);
      continue;
    }
    if (vlow === 'rm' || vlow === 'touch' || vlow === 'tee' || vlow === 'truncate' || vlow === 'unlink' || vlow === 'remove-item' || vlow === 'ri' || vlow === 'del' || vlow === 'new-item' || vlow === 'ni') {
      for (const a of noOpt) add('shell-write', a);
      continue;
    }
    if (vlow === 'set-content' || vlow === 'add-content' || vlow === 'out-file' || vlow === 'sc' || vlow === 'ac') {
      const pi = args.findIndex((a) => a && /^-(path|literalpath|filepath)$/i.test(a));
      if (pi >= 0) add('shell-write', args[pi + 1]); else if (noOpt[0]) add('shell-write', noOpt[0]);
      continue;
    }
    for (const a of args) if (a && pathish(a)) add('arg', a);
  }
  // string literals handed to a file-writing call inside inline code or a heredoc
  const code = [command, ...tz.bodies.map((b) => b.text)].join('\n');
  // first argument of a writer; second argument (the destination) of a copy or rename
  const LIT = /(?:writeFileSync|appendFileSync|rmSync|unlinkSync|WriteAllText|AppendAllText)\(\s*(['"`])([^'"`\n]{1,300})\1/g;
  const DST = /(?:copyFileSync|renameSync)\(\s*[^,()]{1,300}?,\s*(['"`])([^'"`\n]{1,300})\1/g;
  for (const m of [...code.matchAll(LIT), ...code.matchAll(DST)]) if (!m[2].includes('${')) add('shell-write', m[2]);
  for (const m of code.matchAll(/\bopen\(\s*(?:r)?(['"])([^'"\n]{1,300})\1\s*,\s*(['"])[^'"]*[wax+][^'"]*\3/g)) add('shell-write', m[2]);
  return out;
}

// ---------------------------------------------------------------- transcripts -> sessions

const SHELL_TOOLS = new Set(['Bash', 'bash', 'PowerShell']);
const WRITE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);
const COMMIT_RE = /\bgit\b[^\n]{0,400}?\s(?:commit|revert|cherry-pick|am)\b|['"]git['"]\s*,\s*\[\s*['"](?:commit|revert|cherry-pick)['"]/;
const resultText = (b) => (typeof b.content === 'string' ? b.content : Array.isArray(b.content) ? b.content.map((x) => (typeof x?.text === 'string' ? x.text : '')).join('\n') : '');

/**
 * One root session (main transcript + subagents) reduced to what the replay needs:
 *   uses:    [{ id, name, ts, cwd, command?, file?, head?, sub }]
 *   results: Map(id -> { ts, text?, isError })  (text kept only for commit-bearing calls)
 */
export function sessionFromLines(id, lineSets) {
  const uses = []; const results = new Map(); const commitIds = new Set();
  let first = Infinity; let last = -Infinity;
  lineSets.forEach((lines, sub) => {
    for (const l of lines) {
      const ts = typeof l?.timestamp === 'string' ? Date.parse(l.timestamp) : NaN;
      if (!Number.isNaN(ts)) { if (ts < first) first = ts; if (ts > last) last = ts; }
      const c = l?.message?.content;
      if (!Array.isArray(c)) continue;
      for (const b of c) {
        if (b?.type === 'tool_use') {
          if (Number.isNaN(ts)) continue; // an untimed line cannot be placed before or after a commit
          const u = { id: b.id, name: b.name, ts, cwd: l.cwd ?? null, sub };
          if (SHELL_TOOLS.has(b.name) && typeof b.input?.command === 'string') {
            u.command = b.input.command;
            if (COMMIT_RE.test(u.command)) { u.commit = true; commitIds.add(b.id); }
          } else if (WRITE_TOOLS.has(b.name)) {
            u.file = b.input?.file_path ?? b.input?.notebook_path ?? null;
            if (b.name === 'Write' && typeof b.input?.content === 'string') {
              u.head = b.input.content.slice(0, 600);
              if (u.file && SCRIPT_EXT.test(u.file)) u.flags = { ...codeFlags(b.input.content), code: b.input.content.slice(0, 200000) };
            }
          } else continue;
          uses.push(u);
        } else if (b?.type === 'tool_result' && b.tool_use_id) {
          const r = { ts, isError: b.is_error === true };
          if (commitIds.has(b.tool_use_id)) r.text = resultText(b).slice(0, 40000);
          results.set(b.tool_use_id, r);
        }
      }
    }
  });
  uses.sort((a, b) => a.ts - b.ts);
  return { id, uses, results, span: first === Infinity ? null : { first, last } };
}

/** Root sessions under the given transcript folders, parsed once. */
/** A transcript larger than this is skipped and counted, never half-read. */
const MAX_TRANSCRIPT_BYTES = 400 * 1024 * 1024;
const parseText = (text) => {
  const out = [];
  for (const line of text.split(/\r?\n/)) { if (!line.trim()) continue; try { out.push(JSON.parse(line)); } catch { /* torn line */ } }
  return out;
};

/**
 * Root sessions under the given transcript folders, parsed once.
 * `foreign` folders (sessions launched in another project that may still commit here) are
 * prefiltered: a session is parsed only when its raw text names `marker`, was written
 * after `minMtime`, and kept only when it holds a commit-bearing call.
 */
export function loadSessions(dirs, { foreign = [], marker = null, minMtime = 0, stats = {} } = {}) {
  const out = [];
  stats.skippedLarge = stats.skippedLarge ?? 0; stats.foreignRead = stats.foreignRead ?? 0; stats.foreignKept = stats.foreignKept ?? 0;
  const load = (dir, isForeign) => {
    let names; try { names = fs.readdirSync(dir); } catch { return; }
    for (const name of names.filter((n) => n.endsWith('.jsonl')).sort()) {
      const id = name.replace(/\.jsonl$/, '');
      const files = [path.join(dir, name)];
      // subagents, including a Workflow's agents one level down (subagents/workflows/wf_*/)
      const walk = (d, depth) => {
        let ents; try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
        for (const e of ents.sort((a, b) => a.name.localeCompare(b.name))) {
          if (e.isFile() && e.name.endsWith('.jsonl')) files.push(path.join(d, e.name));
          else if (e.isDirectory() && depth < 3) walk(path.join(d, e.name), depth + 1);
        }
      };
      walk(path.join(dir, id, 'subagents'), 0);
      if (isForeign) {
        let newest = 0; let big = false;
        for (const f of files) { try { const st = fs.statSync(f); newest = Math.max(newest, st.mtimeMs); if (st.size > MAX_TRANSCRIPT_BYTES) big = true; } catch { /* gone */ } }
        if (newest < minMtime) continue;
        if (big) { stats.skippedLarge += 1; continue; }
      }
      const texts = [];
      let big = false;
      for (const f of files) {
        try { if (fs.statSync(f).size > MAX_TRANSCRIPT_BYTES) { big = true; continue; } texts.push(fs.readFileSync(f, 'utf8')); } catch { /* gone */ }
      }
      if (big) stats.skippedLarge += 1;
      if (isForeign) {
        stats.foreignRead += 1;
        if (marker && !texts.some((t) => t.toLowerCase().includes(marker))) continue;
      }
      const s = sessionFromLines(isForeign ? `${path.basename(dir)}/${id}` : id, texts.map(parseText));
      if (isForeign && !s.uses.some((u) => u.commit)) continue;
      if (isForeign) stats.foreignKept += 1;
      out.push(s);
    }
  };
  for (const dir of dirs) load(dir, false);
  for (const dir of foreign) load(dir, true);
  return out;
}

// ---------------------------------------------------------------- mapping

export const normText = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '');
const WINDOW_SLACK_MS = 3000;
/** A message file is looked for this far back before the commit call. */
const MESSAGE_LOOKBACK_MS = 3 * 3600 * 1000;
const normOf = (u) => { if (u.norm === undefined) u.norm = normText(`${u.command ?? ''}\n${u.head ?? ''}`); return u.norm; };

/** The commit-bearing calls of all sessions, with their result window. */
export function commitEvents(sessions) {
  const ev = [];
  for (const s of sessions) {
    for (const u of s.uses) {
      if (!u.commit) continue;
      const r = s.results.get(u.id);
      const end = r && !Number.isNaN(r.ts) ? r.ts : u.ts + 10 * 60 * 1000;
      ev.push({ session: s, use: u, start: u.ts, end, text: r?.text ?? '', isError: r?.isError ?? false });
    }
  }
  ev.sort((a, b) => a.start - b.start);
  return ev;
}

/**
 * Tie one commit to the call that made it. Returns { event, evidence } or { unmapped }.
 * Evidence: 'sha' > 'subject' > 'message-file' > 'window'.
 */
export function mapCommit(commit, events) {
  const ad = Date.parse(commit.authorDate);
  const needle = normText(commit.subject).slice(0, 60);
  const generic = needle.length < 12;
  const sha7 = commit.sha.slice(0, 7).toLowerCase();
  const RANK = { sha: 4, subject: 3, 'message-file': 2, window: 1 };
  const cands = [];
  for (const e of events) {
    if (e.start - WINDOW_SLACK_MS > ad || e.end + WINDOW_SLACK_MS < ad) continue;
    let evidence = 'window';
    const shaRe = new RegExp(`\\b(${sha7}[0-9a-f]{0,33})\\b`, 'ig');
    if ([...e.text.matchAll(shaRe)].some((m) => commit.sha.toLowerCase().startsWith(m[1].toLowerCase()))) evidence = 'sha';
    else if (!generic && (normOf(e.use).includes(needle) || normText(e.text).includes(needle))) evidence = 'subject';
    else if (!generic && e.session.uses.some((u) => u.ts <= e.start && u.ts >= e.start - MESSAGE_LOOKBACK_MS && normOf(u).includes(needle))) evidence = 'message-file';
    cands.push({ e, evidence, rank: RANK[evidence] });
  }
  if (!cands.length) return { unmapped: 'no commit-bearing call brackets the author date' };
  const best = Math.max(...cands.map((c) => c.rank));
  let pool = cands.filter((c) => c.rank === best);
  let roots = new Set(pool.map((c) => c.e.session.id));
  if (roots.size > 1) {
    // A launcher whose one long call ran a headless worker brackets the worker's commit
    // and prints its sha too. The call that made the commit is the narrow one: accept the
    // narrowest window only when every other session's is at least twice as wide.
    const width = (c) => c.e.end - c.e.start;
    const sorted = [...pool].sort((a, b) => width(a) - width(b));
    const narrow = sorted[0];
    if (sorted.filter((c) => c.e.session.id !== narrow.e.session.id).every((c) => width(c) >= 2 * Math.max(width(narrow), 1000))) {
      pool = pool.filter((c) => c.e.session.id === narrow.e.session.id);
      roots = new Set([narrow.e.session.id]);
    } else return { unmapped: `ambiguous - ${roots.size} sessions tie at ${pool[0].evidence}`, sessions: [...roots] };
  }
  if (best === RANK.window && pool.length > 1) {
    // one session, several calls in the window: take the last one that started before the author date
    pool.sort((a, b) => a.e.start - b.e.start);
  }
  const pick = pool.filter((c) => c.e.start <= ad + WINDOW_SLACK_MS).pop() ?? pool[0];
  return { event: pick.e, evidence: pick.evidence };
}

// ---------------------------------------------------------------- inventory + verdict

/** Every claim a session makes, once, with timestamps. Cached on the session object. */
export function sessionClaims(session) {
  if (session.claims) return session.claims;
  const claims = []; const gens = []; const broad = []; const commitCwds = [];
  const scripts = new Map(); // script abs -> { staging, writing }, as last written by this session
  for (const u of session.uses) {
    if (u.file) {
      const abs = resolveTok(u.file, u.cwd);
      if (abs) { claims.push({ tier: 'tool-write', abs, ts: u.ts }); if (u.flags) scripts.set(abs, u.flags); }
      continue;
    }
    if (!u.command) continue;
    const r = claimsOfCommand(u.command, u.cwd, { powershell: u.name === 'PowerShell' });
    for (const c of r.claims) claims.push({ ...c, ts: u.ts });
    for (const sc of r.scripts) scripts.set(sc.abs, { staging: sc.staging, writing: sc.writing, code: sc.code });
    for (const run of r.runs) {
      const f = scripts.get(run.script);
      if (!f) continue;
      for (const a of run.args) { if (f.staging) claims.push({ tier: 'code-staged', abs: a, ts: u.ts }); if (f.writing) claims.push({ tier: 'code-write', abs: a, ts: u.ts }); }
      // the script's own path literals, resolved from where it was run
      if (f.code) for (const c of literalClaims(f.code, run.cwd ?? u.cwd)) claims.push({ ...c, ts: u.ts });
    }
    for (const g of r.gens) gens.push({ gen: g, ts: u.ts });
    if (r.broad) broad.push({ ts: u.ts, id: u.id });
    // one entry per commit segment: a call may commit in two repositories (`cd a && git commit; cd b && git commit`)
    for (const c of r.commits) commitCwds.push({ id: u.id, cwd: c.cwd, kind: c.kind, revs: r.revs, ts: u.ts });
  }
  session.claims = { claims, gens, broad, commitCwds };
  return session.claims;
}

const WROTE = new Set(['tool-write', 'shell-write', 'code-write']);
const NAMED = new Set(['staged', 'staged-dir', 'code-staged']);

/**
 * Claims indexed by repo-relative path, built once per session for one root list:
 *   byRel: Map(rel -> [{tier, ts}]), unrooted: [{tier, ts, abs}], globs: [{tier, ts, glob}]
 */
export function indexClaims(claims, roots) {
  const byRel = new Map(); const unrooted = []; const globs = []; const composed = [];
  for (const c of claims) {
    if (c.glob) { globs.push(c); continue; }
    const rel = relTo(c.abs, roots);
    if (c.stems) { if (rel) composed.push({ rel, stems: new Set(c.stems), tier: c.tier, ts: c.ts }); continue; }
    if (rel === null) { unrooted.push(c); continue; }
    if (!byRel.has(rel)) byRel.set(rel, []);
    byRel.get(rel).push({ tier: c.tier, ts: c.ts });
  }
  return { byRel, unrooted, globs, composed };
}

/**
 * The guard's verdict for one commit given the committing session's claims up to `cutoff`.
 * `index` is indexClaims(...) of the session; `replayed` holds paths a revert or cherry-pick
 * in the same call wrote. Returns per-path tiers and the two flagged lists.
 */
export function verdict({ paths, index, gens, cutoff, roots, replayed = new Set() }) {
  const ran = new Set(gens.filter((g) => g.ts <= cutoff).map((g) => g.gen));
  const rows = [];
  for (const p of paths) {
    const lp = p.toLowerCase();
    const tiers = new Set();
    for (const c of index.byRel.get(lp) ?? []) if (c.ts <= cutoff) tiers.add(c.tier);
    // a directory named to a staging verb covers what is under it (the root itself never does)
    const segs = lp.split('/');
    for (let k = 1; k < segs.length; k++) {
      for (const c of index.byRel.get(segs.slice(0, k).join('/')) ?? []) if (c.ts <= cutoff && NAMED.has(c.tier)) tiers.add('staged-dir');
    }
    for (const c of index.globs) if (c.ts <= cutoff && roots.some((r) => c.glob.test(`${r}/${lp}`))) tiers.add(c.tier);
    const stem = segs[segs.length - 1].replace(/\.[a-z0-9]{1,8}$/, '');
    for (const c of index.composed ?? []) if (c.ts <= cutoff && lp.startsWith(`${c.rel}/`) && c.stems.has(stem)) tiers.add(`${c.tier}~composed`);
    if (lp.includes('/')) for (const c of index.unrooted) if (c.ts <= cutoff && c.abs.endsWith(`/${lp}`)) tiers.add(`${c.tier}~suffix`);
    for (const [g, outs] of Object.entries(GENERATORS)) if (ran.has(g) && outs.some((re) => re.test(lp))) tiers.add(`gen:${g}`);
    if (replayed.has(lp)) tiers.add('replayed');
    const t = [...tiers].sort();
    const bare = (x) => x.replace(/~(suffix|composed)$/, '');
    const wrote = t.some((x) => WROTE.has(bare(x)) || x.startsWith('gen:') || x === 'replayed');
    const named = t.some((x) => NAMED.has(bare(x)));
    rows.push({ path: p, tiers: t, allowB: wrote || named, allowStrict: wrote });
  }
  return { rows, flaggedB: rows.filter((r) => !r.allowB).map((r) => r.path), flaggedStrict: rows.filter((r) => !r.allowStrict).map((r) => r.path) };
}

// ---------------------------------------------------------------- self-assertion

/** A synthetic session that wrote a.md, staged b.md, ran build-catalog; a commit that also carries foreign.md. */
export function selfAssert() {
  const root = normAbs(path.join(os.tmpdir(), 'cir-self', 'repo'));
  const cmd = `cd ${root} && printf x > b.md && node scripts/build-catalog.mjs && git add a.md b.md catalog.json && git commit -m "self test"`;
  const s = sessionFromLines('self', [[
    { type: 'assistant', timestamp: '2026-01-01T00:00:00Z', cwd: root, message: { content: [{ type: 'tool_use', id: 't1', name: 'Write', input: { file_path: `${root}/a.md`, content: 'a' } }] } },
    { type: 'assistant', timestamp: '2026-01-01T00:00:10Z', cwd: root, message: { content: [{ type: 'tool_use', id: 't2', name: 'Bash', input: { command: cmd } }] } },
    { type: 'user', timestamp: '2026-01-01T00:00:12Z', cwd: root, message: { content: [{ type: 'tool_result', tool_use_id: 't2', content: '[main 1234abc] self test' }] } },
  ]]);
  const commit = { sha: '1234abcdef', authorDate: '2026-01-01T00:00:11Z', subject: 'self test', paths: ['a.md', 'b.md', 'catalog.json', 'foreign.md'] };
  const m = mapCommit(commit, commitEvents([s]));
  if (!m.event || m.evidence !== 'sha') return `mapping failed: ${JSON.stringify(m.unmapped ?? m.evidence)}`;
  const { claims, gens } = sessionClaims(s);
  const v = verdict({ paths: commit.paths, index: indexClaims(claims, [root]), gens, cutoff: m.event.end, roots: [root] });
  if (v.flaggedB.length !== 1 || v.flaggedB[0] !== 'foreign.md') return `guard B flagged ${JSON.stringify(v.flaggedB)}, expected ["foreign.md"]`;
  if (v.flaggedStrict.length !== 1 || v.flaggedStrict[0] !== 'foreign.md') return `guard B-strict flagged ${JSON.stringify(v.flaggedStrict)}, expected ["foreign.md"]`;
  return null;
}

// ---------------------------------------------------------------- git

const git = (repo, args) => execFileSync('git', ['-C', repo, '-c', 'core.quotepath=off', ...args], { encoding: 'utf8', maxBuffer: 1 << 29, stdio: ['ignore', 'pipe', 'pipe'] });

/** Non-merge and merge commits in range with their name-status lists. */
export function readCommits(repo, { since, until, rev = 'HEAD', shas = [] }) {
  const fmt = '%x1e%H%x1f%P%x1f%aI%x1f%cI%x1f%(trailers:key=Co-Authored-By,valueonly,separator=;)%x1f%s';
  const args = ['log', '--no-renames', '--name-status', `--format=${fmt}`];
  if (shas.length) args.push('--no-walk=unsorted', ...shas);
  else {
    // a bare date means its midnight: git would otherwise read "2026-09-01" as that date at
    // the current time of day, and the range would drift between two runs
    const day = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d} 00:00:00` : d);
    if (since) args.push(`--since=${day(since)}`); if (until) args.push(`--until=${day(until)}`); args.push(rev);
  }
  const text = git(repo, args);
  const out = [];
  for (const rec of text.split('\x1e').slice(1)) {
    const nl = rec.indexOf('\n');
    const head = nl < 0 ? rec : rec.slice(0, nl);
    const [sha, parents, authorDate, commitDate, coauthor, subject] = head.split('\x1f');
    const files = [];
    for (const line of (nl < 0 ? '' : rec.slice(nl + 1)).split('\n')) {
      const m = /^([AMDTCRUX])[0-9]*\t(.+)$/.exec(line.trim());
      if (m) files.push({ status: m[1], path: m[2] });
    }
    out.push({ sha, parents: parents ? parents.split(' ') : [], merge: parents.split(' ').length > 1, authorDate, commitDate, coauthor: (coauthor ?? '').replace(/\s*<[^>]*>/g, '').trim(), subject, files, paths: files.map((f) => f.path) });
  }
  return out;
}

// ---------------------------------------------------------------- run

function parseArgs(argv) {
  const o = { since: null, until: null, rev: 'HEAD', shas: [], out: null, claudeProjects: path.join(os.homedir(), '.claude', 'projects'), transcripts: [], expect: [], plant: [], root: HERE_ROOT };
  const pairs = (v) => { const at = v.indexOf('='); if (at < 1) throw new Error(`expected <sha>=<path>[,<path>] - got "${v}"`); return { sha: v.slice(0, at), paths: v.slice(at + 1).split(',').map((s) => s.trim()).filter(Boolean) }; };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]; const v = () => { const x = argv[++i]; if (x === undefined) throw new Error(`${a} needs a value`); return x; };
    if (a === '--since') o.since = v();
    else if (a === '--until') o.until = v();
    else if (a === '--rev') o.rev = v();
    else if (a === '--sha') o.shas.push(v());
    else if (a === '--out') o.out = v();
    else if (a === '--root') o.root = path.resolve(v());
    else if (a === '--claude-projects') o.claudeProjects = v();
    else if (a === '--transcripts') o.transcripts.push(v());
    else if (a === '--all-folders') o.allFolders = true;
    else if (a === '--expect') o.expect.push(pairs(v()));
    else if (a === '--plant') o.plant.push(pairs(v()));
    else throw new Error(`unknown argument ${a}`);
  }
  if (!o.since && !o.shas.length) throw new Error('give --since <date> or --sha <sha>');
  // The range has two readers, git and the transcript mtime filter (Date.parse), and they
  // disagree on a bad value: git reads `garbage` as "now" (0 commits, exit 0 - a false
  // clean) and `2026-13-01` as no bound at all, while Date.parse gives NaN. Accept only
  // what both read the same way: a real calendar day, or an instant Date.parse accepts.
  for (const [flag, val] of [['--since', o.since], ['--until', o.until]]) {
    if (val === null) continue;
    const ms = Date.parse(val);
    const day = /^\d{4}-\d{2}-\d{2}$/.test(val);
    if (Number.isNaN(ms) || (day && new Date(ms).toISOString().slice(0, 10) !== val)) {
      throw new Error(`${flag} "${val}" is not a date - give YYYY-MM-DD or an ISO instant`);
    }
  }
  if (!o.out) throw new Error('give --out <dir outside the repository> (rows carry session ids)');
  return o;
}

/** The main checkout behind this (possibly worktree) checkout: the parent of the common git dir. */
function mainCheckout(repo) {
  const common = git(repo, ['rev-parse', '--path-format=absolute', '--git-common-dir']).trim();
  return path.dirname(common);
}

export function run(o, log = console.log) {
  const fail = selfAssert();
  if (fail) { console.error(`FATAL: the replay failed its own planted positive - ${fail}`); return EXIT.FATAL; }
  log('self-assertion: a synthetic commit with one planted foreign path was flagged with exactly that path (B and B-strict)');

  const main = mainCheckout(o.root);
  const dirs = [...new Set([...transcriptDirs(o.claudeProjects, main), ...o.transcripts])];
  if (!dirs.length) { console.error(`FATAL: no transcript folder for ${encodeProjectPath(main)} under the Claude projects root`); return EXIT.FATAL; }
  const outDir = path.resolve(o.out);
  const inRepo = (d) => { const r = normAbs(d); return [normAbs(main), normAbs(o.root)].some((x) => r === x || r.startsWith(`${x}/`)); };
  if (inRepo(outDir)) { console.error('FATAL: --out is inside the repository; rows carry session ids and must stay outside it'); return EXIT.FATAL; }

  const t0 = Date.now();
  // --all-folders: sessions launched in any other project may still commit here (a harvest
  // run started in its source project, a headless worker started in a scratchpad).
  let foreign = [];
  if (o.allFolders) {
    const own = new Set(dirs.map((d) => path.resolve(d)));
    try { foreign = fs.readdirSync(o.claudeProjects, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => path.join(o.claudeProjects, e.name)).filter((d) => !own.has(path.resolve(d))); } catch { foreign = []; }
  }
  const sinceMs = o.since ? Date.parse(o.since) : 0;
  const stats = {};
  const sessions = loadSessions(dirs, { foreign, marker: path.basename(main).toLowerCase(), minMtime: Number.isNaN(sinceMs) ? 0 : sinceMs, stats });
  if (o.allFolders) log(`other project folders: ${foreign.length} scanned, ${stats.foreignRead} sessions read after the mtime filter, ${stats.foreignKept} kept (name the repo and hold a commit-bearing call)`);
  if (stats.skippedLarge) log(`transcripts over ${MAX_TRANSCRIPT_BYTES >> 20} MB skipped: ${stats.skippedLarge}`);
  const events = commitEvents(sessions);
  const spans = sessions.map((s) => s.span).filter(Boolean);
  // Zero spans would make the retention window Infinity..-Infinity and throw out of the
  // summary line as a bare RangeError; say what was read and found empty instead.
  if (!spans.length) { console.error(`FATAL: no session with a timestamp in ${dirs.join(', ')} - nothing to replay commits against`); return EXIT.FATAL; }
  const oldest = Math.min(...spans.map((s) => s.first));
  const newest = Math.max(...spans.map((s) => s.last));
  log(`transcripts: ${dirs.length} folder(s), ${sessions.length} root sessions, ${events.length} commit-bearing calls, ${new Date(oldest).toISOString()} .. ${new Date(newest).toISOString()} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);

  let commits = readCommits(o.root, { since: o.since, until: o.until, rev: o.rev, shas: o.shas });
  const wantShas = [...o.expect, ...o.plant].map((x) => x.sha);
  const missing = wantShas.filter((s) => !commits.some((c) => c.sha.startsWith(s)));
  if (missing.length) commits = commits.concat(readCommits(o.root, { shas: missing }));
  const plants = new Map(o.plant.map((p) => [commits.find((c) => c.sha.startsWith(p.sha))?.sha, p.paths]));
  const mainRoot = normAbs(main);

  // A root that still exists is checked against this repository's common git dir: a fleet
  // checkout named in the same call as a registry commit must not become a registry root.
  const commonDir = normAbs(git(o.root, ['rev-parse', '--path-format=absolute', '--git-common-dir']).trim());
  const rootCheck = new Map();
  const isThisRepo = (root) => {
    if (!rootCheck.has(root)) {
      let ok = true;
      if (fs.existsSync(root)) { try { ok = normAbs(git(root, ['rev-parse', '--path-format=absolute', '--git-common-dir']).trim()) === commonDir; } catch { ok = true; } }
      rootCheck.set(root, ok);
    }
    return rootCheck.get(root);
  };
  // of a call's commit segments, the one that ran in this repository
  const pickCommitCwd = (list) => list.find((x) => isThisRepo(rootOf(x.cwd, [mainRoot]))) ?? list[list.length - 1];

  // pass 1: map every commit, learn the registry roots the mapped calls ran in
  const rows = [];
  const roots = new Set([mainRoot]);
  for (const c of commits) {
    const row = { sha: c.sha, authorDate: c.authorDate, subject: c.subject, coauthor: c.coauthor, merge: c.merge, nPaths: c.paths.length };
    rows.push(row);
    if (c.merge) { row.status = 'merge-excluded'; continue; }
    const ad = Date.parse(c.authorDate);
    if (ad < oldest - 60 * 1000 || ad > newest + 60 * 1000) { row.status = 'outside-retention'; continue; }
    const m = mapCommit(c, events);
    if (!m.event) { row.status = m.unmapped.startsWith('ambiguous') ? 'ambiguous' : 'unmapped'; row.reason = m.unmapped; if (m.sessions) row.sessions = m.sessions; continue; }
    row.status = 'mapped'; row.evidence = m.evidence; row.session = m.event.session.id; row.callAt = new Date(m.event.start).toISOString();
    row._m = m; row._c = c;
    const cc = pickCommitCwd(sessionClaims(m.event.session).commitCwds.filter((x) => x.id === m.event.use.id));
    row._commitCwd = cc?.cwd ?? (m.event.use.cwd ? normAbs(m.event.use.cwd) : null);
    row.root = row._commitCwd ? rootOf(row._commitCwd, [mainRoot]) : null;
    if (row.root) roots.add(row.root);
  }
  // A window-only match is never judged. The same second can hold another session's commit
  // in another repository, and when the session that made THIS commit is missing from the
  // folders read (launched elsewhere, or rolled off), the window lands on a stranger and every
  // path reads as foreign: replayed over the registry folder alone, 6 of 8 flagged commits
  // were such strangers. It is reported as its own status instead.
  const strongRoots = new Set([mainRoot, ...rows.filter((r) => r._m && r.evidence !== 'window' && r.root && isThisRepo(r.root)).map((r) => r.root)]);
  for (const r of rows) {
    if (r._m && r.evidence === 'window') {
      r.status = 'window-only'; r.reason = 'only the time window ties a call to this commit; not judged';
      delete r._m; delete r.evidence; delete r.session; delete r.callAt;
    }
  }
  roots.clear(); for (const x of strongRoots) roots.add(x);
  const rootList = [...roots];
  for (const r of rows) if (r._commitCwd) r.root = rootOf(r._commitCwd, rootList);
  const indexOf = (s) => { if (!s.index) s.index = indexClaims(sessionClaims(s).claims, rootList); return s.index; };

  // amend calls extend the inventory cutoff of the commit they rewrite (an amend keeps the author date)
  const mappedUse = new Set(rows.filter((r) => r._m).map((r) => r._m.event.use.id));
  const cutoffOf = new Map();
  for (const r of rows.filter((x) => x._m)) {
    const s = r._m.event.session;
    const later = events.filter((e) => e.session === s && e.start > r._m.event.start && /--amend\b/.test(e.use.command) && !mappedUse.has(e.use.id));
    cutoffOf.set(r.sha, later.length ? later[later.length - 1].end : r._m.event.end);
  }

  // who-wrote index for the reader's hint: repo-relative path -> [{session, ts}]
  const writers = new Map();
  for (const s of sessions) {
    for (const c of sessionClaims(s).claims) {
      if (!WROTE.has(c.tier) || c.glob) continue;
      const rel = relTo(c.abs, rootList);
      if (!rel) continue;
      if (!writers.has(rel)) writers.set(rel, []);
      writers.get(rel).push({ session: s.id, ts: c.ts });
    }
  }

  // pass 2: verdicts
  const replayCache = new Map();
  const replayedPaths = (revs) => {
    const set = new Set();
    for (const rv of revs) {
      if (!replayCache.has(rv)) { let ps = []; try { ps = git(o.root, ['show', '--no-renames', '--name-only', '--format=', rv]).split('\n').filter(Boolean).map((p) => p.toLowerCase()); } catch { /* not a registry rev */ } replayCache.set(rv, ps); }
      for (const p of replayCache.get(rv)) set.add(p);
    }
    return set;
  };
  const expectResults = []; const plantResults = [];
  for (const r of rows) {
    if (!r._m) continue;
    const s = r._m.event.session;
    const { gens, broad, commitCwds } = sessionClaims(s);
    const cutoff = cutoffOf.get(r.sha);
    const cc = pickCommitCwd(commitCwds.filter((x) => x.id === r._m.event.use.id));
    const planted = plants.get(r.sha) ?? [];
    const paths = [...r._c.paths, ...planted.filter((p) => !r._c.paths.includes(p))];
    const v = verdict({ paths, index: indexOf(s), gens, cutoff, roots: rootList, replayed: cc && cc.kind !== 'commit' ? replayedPaths(cc.revs) : new Set() });
    r.allFlagged = paths.length > 0 && v.flaggedB.length === paths.length;
    r.kind = cc?.kind ?? 'commit';
    r.shared = r.root === mainRoot;
    r.broadAdd = broad.some((b) => b.ts <= cutoff && b.ts >= r._m.event.start - 30 * 60 * 1000);
    r.flaggedB = v.flaggedB; r.flaggedStrict = v.flaggedStrict;
    r.tiers = Object.fromEntries(v.rows.map((x) => [x.path, x.tiers]));
    const ad = Date.parse(r.authorDate);
    r.hints = {};
    for (const p of new Set([...v.flaggedB, ...v.flaggedStrict])) {
      const lp = p.toLowerCase();
      const mentioned = s.uses.some((u) => u.ts <= cutoff && ((u.command && u.command.toLowerCase().includes(lp)) || (u.head && u.head.toLowerCase().includes(lp))));
      const others = (writers.get(lp) ?? []).filter((w) => w.session !== s.id && w.ts <= ad && w.ts >= ad - 3 * 24 * 3600 * 1000);
      const late = (indexOf(s).byRel.get(lp) ?? []).some((c) => c.ts > cutoff && WROTE.has(c.tier));
      r.hints[p] = { mentioned, otherWriters: [...new Set(others.map((w) => w.session))], lastOtherWrite: others.length ? new Date(Math.max(...others.map((w) => w.ts))).toISOString() : null, writtenAfter: late };
    }
    if (planted.length) {
      const ok = planted.every((p) => v.flaggedB.includes(p)) && planted.every((p) => v.flaggedStrict.includes(p));
      plantResults.push({ sha: r.sha, planted, ok, flaggedB: v.flaggedB, flaggedStrict: v.flaggedStrict });
    }
  }
  for (const e of o.expect) {
    const r = rows.find((x) => x.sha.startsWith(e.sha));
    if (!r || !r._m) { expectResults.push({ sha: e.sha, expected: e.paths, status: r ? r.status : 'not-in-range', caughtB: null, caughtStrict: null }); continue; }
    const fb = new Set(r.flaggedB); const fs2 = new Set(r.flaggedStrict);
    expectResults.push({
      sha: r.sha, expected: e.paths, status: 'mapped',
      caughtB: e.paths.filter((p) => fb.has(p)).length, caughtStrict: e.paths.filter((p) => fs2.has(p)).length,
      exactB: e.paths.length === fb.size && e.paths.every((p) => fb.has(p)), exactStrict: e.paths.length === fs2.size && e.paths.every((p) => fs2.has(p)),
      extraB: r.flaggedB.filter((p) => !e.paths.includes(p)), extraStrict: r.flaggedStrict.filter((p) => !e.paths.includes(p)),
    });
  }

  // write rows (private) and print counts (public-safe)
  fs.mkdirSync(outDir, { recursive: true });
  const clean = (r) => { const { _m, _c, _commitCwd, ...rest } = r; return rest; };
  fs.writeFileSync(path.join(outDir, 'rows.jsonl'), rows.map((r) => `${JSON.stringify(clean(r))}\n`).join(''));
  const flaggedRows = rows.filter((r) => r.flaggedB?.length || r.flaggedStrict?.length);
  const tsv = ['sha\tauthor_date\tshared\tkind\tevidence\tsession\tverdict\tpath\ttiers\tmentioned\tother_writers\tlast_other_write\twritten_after\tsubject'];
  for (const r of flaggedRows) {
    for (const p of new Set([...r.flaggedStrict, ...r.flaggedB])) {
      const h = r.hints[p];
      tsv.push([r.sha.slice(0, 10), r.authorDate, r.shared ? 'shared' : 'worktree', r.kind, r.evidence, r.session, r.flaggedB.includes(p) ? 'B' : 'strict-only', p, (r.tiers[p] ?? []).join('+') || '-', h.mentioned ? 'yes' : 'no', h.otherWriters.join(' ') || '-', h.lastOtherWrite ?? '-', h.writtenAfter ? 'yes' : 'no', r.subject.replace(/\t/g, ' ')].join('\t'));
    }
  }
  fs.writeFileSync(path.join(outDir, 'flagged.tsv'), `${tsv.join('\n')}\n`);
  const count = (f) => rows.filter(f).length;
  const summary = {
    range: { since: o.since, until: o.until, rev: o.rev },
    transcripts: { folders: dirs.length, sessions: sessions.length, commitCalls: events.length, oldest: new Date(oldest).toISOString(), newest: new Date(newest).toISOString() },
    commits: rows.length,
    merges: count((r) => r.status === 'merge-excluded'),
    outsideRetention: count((r) => r.status === 'outside-retention'),
    inRetention: count((r) => !r.merge && r.status !== 'outside-retention'),
    mapped: count((r) => r.status === 'mapped'),
    mappedBy: Object.fromEntries(['sha', 'subject', 'message-file'].map((k) => [k, count((r) => r.evidence === k)])),
    ambiguous: count((r) => r.status === 'ambiguous'),
    unmapped: count((r) => r.status === 'unmapped'),
    windowOnly: count((r) => r.status === 'window-only'),
    mappedShared: count((r) => r.status === 'mapped' && r.shared),
    flaggedB: count((r) => r.flaggedB?.length),
    flaggedStrict: count((r) => r.flaggedStrict?.length),
    flaggedBShared: count((r) => r.flaggedB?.length && r.shared),
    flaggedStrictShared: count((r) => r.flaggedStrict?.length && r.shared),
    flaggedPathsB: rows.reduce((a, r) => a + (r.flaggedB?.length ?? 0), 0),
    flaggedPathsStrict: rows.reduce((a, r) => a + (r.flaggedStrict?.length ?? 0), 0),
    expect: expectResults, plant: plantResults,
  };
  fs.writeFileSync(path.join(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);

  log(`commits: ${summary.commits} (merges excluded ${summary.merges}, outside transcript retention ${summary.outsideRetention}, in retention ${summary.inRetention})`);
  log(`mapped: ${summary.mapped} (sha ${summary.mappedBy.sha}, subject ${summary.mappedBy.subject}, message-file ${summary.mappedBy['message-file']}); window-only (not judged) ${summary.windowOnly}; ambiguous ${summary.ambiguous}; unmapped ${summary.unmapped}; mapped in the shared checkout ${summary.mappedShared}`);
  log(`flagged commits: B ${summary.flaggedB} (${summary.flaggedPathsB} paths, ${summary.flaggedBShared} in the shared checkout); B-strict ${summary.flaggedStrict} (${summary.flaggedPathsStrict} paths, ${summary.flaggedStrictShared} shared)`);
  for (const e of expectResults) log(`expect ${e.sha.slice(0, 10)}: ${e.status}${e.status === 'mapped' ? ` - B caught ${e.caughtB}/${e.expected.length}${e.exactB ? ' exactly' : ` (extra ${e.extraB.length})`}, B-strict caught ${e.caughtStrict}/${e.expected.length}${e.exactStrict ? ' exactly' : ` (extra ${e.extraStrict.length})`}` : ''}`);
  for (const p of plantResults) log(`plant ${p.sha.slice(0, 10)}: ${p.ok ? 'every planted path flagged' : 'A PLANTED PATH WAS NOT FLAGGED'} (B ${p.flaggedB.length} flagged, B-strict ${p.flaggedStrict.length})`);
  log(`rows: ${path.join(outDir, 'rows.jsonl')} | flagged: ${path.join(outDir, 'flagged.tsv')} | summary: ${path.join(outDir, 'summary.json')}`);

  const unplanted = o.plant.filter((p) => !plantResults.some((r) => r.sha.startsWith(p.sha)));
  if (unplanted.length) { console.error(`FATAL: planted seed(s) on unmapped commit(s): ${unplanted.map((p) => p.sha).join(', ')} - the seed could not be evaluated`); return EXIT.FATAL; }
  if (plantResults.some((p) => !p.ok)) { console.error('FATAL: a planted foreign path came back unflagged - the comparator is broken'); return EXIT.FATAL; }
  return summary.flaggedB || summary.flaggedStrict ? EXIT.VIOLATIONS : EXIT.OK;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  let o;
  try { o = parseArgs(process.argv.slice(2)); } catch (e) { console.error(`FATAL: ${e.message}`); process.exit(EXIT.FATAL); }
  try { process.exitCode = run(o); } catch (e) { console.error(`FATAL: ${e.stack ?? e.message}`); process.exitCode = EXIT.FATAL; }
}

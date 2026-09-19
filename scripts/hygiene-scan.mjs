#!/usr/bin/env node
/**
 * hygiene-scan - the instrument behind `/hygiene`, the start-of-day fleet sweep.
 *
 * ## What it answers
 *
 * For every project `projects.json` resolves on THIS machine: which pull requests are
 * open and can ship, which branches (local and remote) are already on the default branch
 * and only cost attention, which worktrees are abandoned, whether the default branch is
 * red, and what GitHub's security surfaces (code scanning, secret scanning, Dependabot)
 * hold open. Then it CLASSIFIES every finding into an action, so no agent ever counts or
 * classifies by hand.
 *
 * ## Why classification lives here and not in the skill
 *
 * The fleet's checkouts are shared. On the day this was written kp carried 73 local
 * branches and 38 worktrees, most of them created by the Personas desktop app's autopilot
 * under `AppData/Roaming/com.personas.desktop/worktrees/`, several of them committed to
 * minutes earlier by live sessions. "Merged, so delete it" is only safe after four checks
 * that a prose instruction reliably forgets one of: is the tip really on the default
 * branch, is anything checked out on it, is anyone working in it right now, and who owns
 * the worktree. Those checks are code, so they run the same way every morning.
 *
 * ## Action classes
 *
 *   mechanical  deterministic and reversible: delete a branch whose content is on the
 *               default branch (its tip is archived to refs/hygiene-archive/ first),
 *               remove a clean idle Claude Code or temp worktree, prune missing ones,
 *               fast-forward an idle primary checkout. `--apply` executes ONLY these, and
 *               re-verifies every precondition immediately before acting.
 *   worker      needs judgment: ship an open PR, fix a red default branch, triage an
 *               unmerged branch, fix security alerts. Dispatched per project by the skill.
 *   operator    a human decision: rotate a leaked secret, someone's uncommitted WIP,
 *               a primary checkout parked on a feature branch.
 *   hands-off   something live touched it within --live-minutes. Reported, never acted on.
 *
 * Never discarded by anything here: uncommitted changes, a branch checked out anywhere,
 * a worktree the Personas app owns, a branch that is the base of an open PR.
 *
 * ## Usage
 *
 *   node scripts/hygiene-scan.mjs [--only kp,ascent] [--live-minutes 120]
 *                                 [--idle-hours 24] [--no-fetch] [--json] [--out <dir>]
 *   node scripts/hygiene-scan.mjs --apply [--out <dir>] [--only kp]
 *   node scripts/hygiene-scan.mjs --brief <slug> [--out <dir>]   # one worker's full prompt
 *
 * Output: `<out>/plan.json` (full scan + actions) and `<out>/plan.md` (one screen).
 * `--apply` appends each executed or skipped action to `<out>/applied.jsonl`.
 * Default `<out>` is `$(git rev-parse --git-common-dir)/hygiene/<YYYY-MM-DD>/` - the same
 * uncommittable location the run-board uses, because run state is not registry content.
 *
 * Exit codes: 0 scan (or apply) completed; 1 the instrument failed.
 *
 * Zero dependencies. Needs `git` and an authenticated `gh` on PATH.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadFleet } from './lib/projects.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const opt = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : dflt;
};

const LIVE_MIN = Number(opt('live-minutes', 120));
const IDLE_H = Number(opt('idle-hours', 24));
const ONLY = opt('only', '') ? new Set(opt('only', '').split(',').map((s) => s.trim())) : null;
const NOW = Date.now();
const TODAY = new Date().toISOString().slice(0, 10);
const NEVER_DELETE = /^(main|master|develop|development|trunk|gh-pages|release\/.*|production|staging)$/;

// ---------------------------------------------------------------------------- process

function run(cmd, args, { cwd, timeout = 120_000 } = {}) {
  return new Promise((resolve) => {
    execFile(cmd, args, { cwd, timeout, maxBuffer: 256 * 1024 * 1024, windowsHide: true }, (err, stdout, stderr) => {
      resolve({ ok: !err, stdout: String(stdout ?? ''), stderr: String(stderr ?? ''), err });
    });
  });
}
const git = (cwd, args, o) => run('git', ['-C', cwd, '--no-optional-locks', ...args], o);
async function gitOut(cwd, args, o) {
  const r = await git(cwd, args, o);
  return r.ok ? r.stdout.trim() : null;
}
async function ghJson(args, o) {
  const r = await run('gh', args, o);
  if (!r.ok) return { error: (r.stderr || String(r.err?.message)).split('\n')[0].trim() };
  try { return { data: JSON.parse(r.stdout || 'null') }; } catch (e) { return { error: `unparseable gh output: ${e.message}` }; }
}

const minutesSince = (ms) => (ms ? Math.round((NOW - ms) / 60_000) : null);
const norm = (p) => p.replace(/\\/g, '/').toLowerCase();

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
}

// ---------------------------------------------------------------------------- probes

function ownerOf(p, isPrimary) {
  if (isPrimary) return 'primary';
  const n = norm(p);
  if (n.includes('/com.personas.desktop/worktrees/')) return 'personas-app';
  if (n.includes('/.claude/worktrees/')) return 'claude-code';
  if (n.includes('/appdata/local/temp/') || /^[a-z]:\/t\//.test(n)) return 'temp';
  return 'other';
}

/** Parse `git status --porcelain=v1 -z`, returning paths (rename sources skipped). */
function statusPaths(z) {
  const parts = z.split('\0').filter(Boolean);
  const paths = [];
  for (let i = 0; i < parts.length; i++) {
    const xy = parts[i].slice(0, 2);
    paths.push(parts[i].slice(3));
    if (xy[0] === 'R' || xy[0] === 'C') i++;
  }
  return paths;
}

/**
 * Activity of one checkout: the newest of its HEAD commit, its reflog, and its dirty
 * files. Status runs with --no-optional-locks, so this probe does not make a checkout
 * look live by looking at it.
 *
 * NOT the index mtime on its own. Any tool that runs a plain `git status` rewrites the
 * index, and the Personas app polls its worktrees: on 2026-09-15 three clean app
 * worktrees with a nine-day-old HEAD read "active 6 min ago" off the index alone. The
 * reflog (`logs/HEAD`) moves on commit, checkout, reset and rebase - real work - and
 * never on a read. The index still counts when the tree is dirty, since an edit in
 * progress can predate its first stat.
 */
async function probeCheckout(wtPath) {
  const res = { exists: fs.existsSync(wtPath), dirty: null, newestDirtyMin: null, indexMin: null, reflogMin: null, headMin: null, lastActivityMin: null };
  if (!res.exists) return res;
  const gitDir = await gitOut(wtPath, ['rev-parse', '--absolute-git-dir']);
  let indexMs = null, reflogMs = null;
  if (gitDir) {
    try { indexMs = fs.statSync(path.join(gitDir, 'index')).mtimeMs; } catch { /* no index yet */ }
    for (const f of ['logs/HEAD', 'HEAD']) {
      try { const m = fs.statSync(path.join(gitDir, f)).mtimeMs; if (!reflogMs || m > reflogMs) reflogMs = m; } catch { /* absent */ }
    }
  }
  const st = await git(wtPath, ['status', '--porcelain=v1', '-z', '--untracked-files=normal'], { timeout: 90_000 });
  let newest = null;
  if (st.ok) {
    const paths = statusPaths(st.stdout);
    res.dirty = paths.length;
    res.dirtySample = paths.slice(0, 5);
    // The full set, so Phase 4 can prove a worker left the primary's WIP exactly as found:
    // a count survives an edit-then-revert of a different file (systedo-case, 2026-09-15).
    res.dirtyPaths = paths.slice(0, 2000).sort();
    for (const p of paths.slice(0, 400)) {
      try { const m = fs.statSync(path.join(wtPath, p)).mtimeMs; if (!newest || m > newest) newest = m; } catch { /* deleted file */ }
    }
  }
  const ct = await gitOut(wtPath, ['log', '-1', '--format=%ct']);
  const headMs = ct ? Number(ct) * 1000 : null;
  res.newestDirtyMin = minutesSince(newest);
  res.indexMin = minutesSince(indexMs);
  res.reflogMin = minutesSince(reflogMs);
  res.headMin = minutesSince(headMs);
  const latest = Math.max(newest ?? 0, reflogMs ?? 0, headMs ?? 0, res.dirty > 0 ? indexMs ?? 0 : 0);
  res.lastActivityMin = latest ? minutesSince(latest) : null;
  return res;
}

function parseWorktrees(porcelain) {
  const out = [];
  for (const block of porcelain.split(/\r?\n\r?\n/)) {
    const wt = {};
    for (const line of block.split(/\r?\n/)) {
      const [k, ...rest] = line.split(' ');
      const v = rest.join(' ');
      if (k === 'worktree') wt.path = v;
      else if (k === 'HEAD') wt.head = v;
      else if (k === 'branch') wt.branch = v.replace(/^refs\/heads\//, '');
      else if (k === 'detached') wt.detached = true;
      else if (k === 'locked') wt.locked = v || true;
      else if (k === 'prunable') wt.prunable = v || true;
    }
    if (wt.path) out.push(wt);
  }
  return out;
}

function summarizeChecks(rollup = []) {
  const c = { pass: 0, fail: 0, pending: 0, failing: [] };
  for (const x of rollup ?? []) {
    const state = (x.conclusion || x.state || x.status || '').toUpperCase();
    if (['SUCCESS', 'NEUTRAL', 'SKIPPED'].includes(state)) c.pass++;
    else if (['FAILURE', 'ERROR', 'TIMED_OUT', 'CANCELLED', 'ACTION_REQUIRED', 'STARTUP_FAILURE'].includes(state)) {
      c.fail++; c.failing.push(x.name || x.context || x.workflowName || '?');
    } else c.pending++;
  }
  return c;
}

/** GitHub security surface: an array of alerts, or a posture string when unavailable. */
async function securitySurface(repo, kind, pick) {
  const r = await ghJson(['api', '--paginate', '--slurp', `repos/${repo}/${kind}/alerts?state=open&per_page=100`], { timeout: 180_000 });
  if (r.error) {
    const e = r.error.toLowerCase();
    const posture = e.includes('no analysis') ? 'not-configured'
      : e.includes('disabled') || e.includes('not enabled') ? 'disabled'
      : e.includes('advanced security') || e.includes('not available') ? 'unavailable'
      : e.includes('404') || e.includes('not found') ? 'not-configured'
      : 'error';
    return { posture, error: posture === 'error' ? r.error : undefined, alerts: [] };
  }
  const alerts = (r.data ?? []).flat().map(pick);
  return { posture: 'enabled', alerts };
}

/**
 * Does a permissions.deny list forbid pushing outright - not just one variant of it?
 *
 * Blanket shapes: `Bash(git push:*)` (systedo-case's deny) and `Bash(git push *)` (the same
 * rule in the harness's space-wildcard form). Read `deny` only - the same strings sit in
 * several repos' `allow` lists, and a grep over settings once misread ascent's allow as a
 * deny. Every other repo denies only variants -
 * `Bash(git push*--force*)`, `Bash(git push* -f *)` - which must NOT count: the first
 * version of this check matched `git push` anywhere and flagged goat as push-denied,
 * which would have moved every worker action in the fleet to the operator list.
 * A rule is blanket when nothing but a wildcard follows `git push`.
 */
export function denyBlocksPush(rules) {
  return rules.some((rule) => /^Bash\(\s*git\s+push\s*(:\s*\*|\s\*|\*)?\s*\)$/.test(String(rule).trim()));
}

const bySeverity = (alerts) => alerts.reduce((acc, a) => { acc[a.severity ?? 'unknown'] = (acc[a.severity ?? 'unknown'] ?? 0) + 1; return acc; }, {});

// ---------------------------------------------------------------------------- scan one

async function scanProject(slug, proj) {
  const P = { slug, path: proj.path, problems: [] };
  if (!proj.exists) { P.problems.push('checkout not found'); return P; }

  const url = await gitOut(proj.path, ['remote', 'get-url', 'origin']);
  const m = url?.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?\/?$/i);
  if (!m) { P.problems.push(`origin is not a GitHub remote (${url ?? 'none'})`); return P; }
  P.repo = `${m[1]}/${m[2]}`;

  // Primary activity BEFORE fetch or status touch anything.
  const primaryActivity = await probeCheckout(proj.path);

  const view = await ghJson(['repo', 'view', P.repo, '--json', 'defaultBranchRef,isArchived,viewerPermission,squashMergeAllowed,mergeCommitAllowed,rebaseMergeAllowed,deleteBranchOnMerge']);
  if (view.error) P.problems.push(`gh repo view: ${view.error}`);
  const v = view.data ?? {};
  P.defaultBranch = v.defaultBranchRef?.name
    ?? (await gitOut(proj.path, ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD']))?.replace(/^origin\//, '')
    ?? null;
  P.mergeMethods = ['squash', 'merge', 'rebase'].filter((k) => v[`${k === 'merge' ? 'mergeCommit' : k + 'Merge'}Allowed`]);
  P.deleteBranchOnMerge = !!v.deleteBranchOnMerge;
  P.archived = !!v.isArchived;
  P.permission = v.viewerPermission ?? null;
  if (!P.defaultBranch) { P.problems.push('cannot resolve the default branch'); return P; }
  const DEF = `origin/${P.defaultBranch}`;

  if (!flag('no-fetch')) {
    const f = await git(proj.path, ['fetch', '--prune', '--quiet', 'origin'], { timeout: 300_000 });
    if (!f.ok) P.problems.push(`fetch failed: ${f.stderr.split('\n')[0]}`);
  }
  P.originHeadSet = (await git(proj.path, ['symbolic-ref', '-q', 'refs/remotes/origin/HEAD'])).ok;
  // A repo whose own Claude settings deny `git push` has said agents do not push there.
  // The worker runs with cwd elsewhere, so the deny does not bind it mechanically - the
  // plan has to carry it. (systedo-case, 2026-09-15: a worker pushed a PR branch anyway.)
  P.pushDenied = ['settings.json', 'settings.local.json'].some((f) => {
    try {
      const s = JSON.parse(fs.readFileSync(path.join(proj.path, '.claude', f), 'utf8'));
      return denyBlocksPush(s.permissions?.deny ?? []);
    } catch { return false; }
  });
  P.defaultSha = await gitOut(proj.path, ['rev-parse', DEF]);

  // ---- worktrees
  const wtRaw = await gitOut(proj.path, ['worktree', 'list', '--porcelain']) ?? '';
  const wts = parseWorktrees(wtRaw);
  P.worktrees = await mapLimit(wts, 6, async (wt, i) => {
    const owner = ownerOf(wt.path, i === 0);
    const act = i === 0 ? primaryActivity : (wt.prunable ? { exists: false } : await probeCheckout(wt.path));
    return { ...wt, owner, ...act, live: act.lastActivityMin != null && act.lastActivityMin < LIVE_MIN };
  });
  const primary = P.worktrees[0] ?? { ...primaryActivity };
  P.primary = {
    branch: primary.branch ?? null,
    headSha: primary.head ?? null,
    onDefault: primary.branch === P.defaultBranch,
    dirty: primary.dirty,
    dirtyPaths: primary.dirtyPaths ?? [],
    live: primary.live,
    lastActivityMin: primary.lastActivityMin,
    behind: null, ahead: null,
  };
  if (P.primary.onDefault && P.defaultSha) {
    const lr = await gitOut(proj.path, ['rev-list', '--left-right', '--count', `${P.defaultBranch}...${DEF}`]);
    if (lr) { const [a, b] = lr.split(/\s+/).map(Number); P.primary.ahead = a; P.primary.behind = b; }
    P.primary.unpushed = P.primary.ahead
      ? ((await gitOut(proj.path, ['log', '-3', '--format=%h %s', `${DEF}..${P.defaultBranch}`])) ?? '').split(/\r?\n/).filter(Boolean)
      : [];
  }
  const checkedOut = new Map(P.worktrees.filter((w) => w.branch).map((w) => [w.branch, w]));

  // ---- pull requests
  const allPrs = await ghJson(['pr', 'list', '-R', P.repo, '--state', 'all', '--limit', '400', '--json', 'number,state,headRefName,headRefOid,baseRefName,mergedAt,updatedAt,isCrossRepository']);
  if (allPrs.error) P.problems.push(`gh pr list: ${allPrs.error}`);
  const prsByHead = new Map();
  for (const pr of allPrs.data ?? []) {
    if (pr.isCrossRepository) continue;
    if (!prsByHead.has(pr.headRefName)) prsByHead.set(pr.headRefName, []);
    prsByHead.get(pr.headRefName).push(pr);
  }
  const openPrs = await ghJson(['pr', 'list', '-R', P.repo, '--state', 'open', '--limit', '200', '--json', 'number,title,headRefName,headRefOid,baseRefName,isDraft,mergeable,mergeStateStatus,reviewDecision,updatedAt,author,statusCheckRollup,isCrossRepository,additions,deletions,changedFiles']);
  const openBases = new Set((openPrs.data ?? []).map((p) => p.baseRefName));

  // ---- branches (local + remote)
  const refsRaw = await gitOut(proj.path, ['for-each-ref', '--format=%(refname)%09%(objectname)%09%(upstream:short)%09%(upstream:track)%09%(committerdate:unix)', 'refs/heads', 'refs/remotes/origin']) ?? '';
  const refs = refsRaw.split(/\r?\n/).filter(Boolean).map((l) => {
    const [ref, sha, upstream, track, ct] = l.split('\t');
    const remote = ref.startsWith('refs/remotes/');
    return { ref, name: ref.replace(/^refs\/(heads|remotes\/origin)\//, ''), remote, sha, upstream: upstream || null, gone: track === '[gone]', commitMin: minutesSince(Number(ct) * 1000) };
  }).filter((b) => b.name !== 'HEAD' && b.name !== P.defaultBranch);

  const classify = async (b) => {
    const ahead = Number(await gitOut(proj.path, ['rev-list', '--count', `${DEF}..${b.sha}`]) ?? -1);
    const prs = prsByHead.get(b.name) ?? [];
    const open = prs.find((p) => p.state === 'OPEN');
    const merged = prs.find((p) => p.state === 'MERGED');
    const closed = prs.find((p) => p.state === 'CLOSED');
    let cls;
    // Content already in the primary's LOCAL default branch (its unpushed commits) is
    // safe to drop too: pof's first run showed a 70-commit branch that was a literal
    // ancestor of a local master 76 commits ahead of origin, classified `unpushed`.
    const onLocalDefault = ahead > 0 && P.primary.onDefault && P.primary.ahead > 0
      && (await git(proj.path, ['merge-base', '--is-ancestor', b.sha, `refs/heads/${P.defaultBranch}`])).ok;
    if (ahead === 0) cls = 'merged';
    else if (onLocalDefault && !open) cls = 'on-local-default';
    else if (open) cls = 'open-pr';
    else if (merged && merged.headRefOid === b.sha) cls = 'squash-merged';
    else {
      const cherry = await gitOut(proj.path, ['cherry', DEF, b.sha]);
      const plus = cherry == null ? -1 : cherry.split(/\r?\n/).filter((l) => l.startsWith('+')).length;
      if (plus === 0) cls = 'patch-on-default';
      else if (merged) cls = 'merged-pr-then-more-commits';
      else if (closed) cls = 'closed-pr';
      else if (!b.remote && !b.upstream) cls = 'unpushed';
      else cls = 'no-pr';
    }
    // A branch cut from a primary whose default branch is ahead of origin carries the
    // primary's unpushed commits too: 2026-09-19 pof `backlog/c26` read "82 not on master"
    // with only 2 of its own. Shipping it would push commits the owner has not read.
    let ridesUnpushed = 0;
    if (ahead > 0 && cls !== 'on-local-default' && P.primary.onDefault && P.primary.ahead > 0) {
      const own = Number(await gitOut(proj.path, ['rev-list', '--count', `refs/heads/${P.defaultBranch}..${b.sha}`]) ?? ahead);
      ridesUnpushed = Math.max(0, ahead - own);
    }
    const wt = b.remote ? null : checkedOut.get(b.name) ?? null;
    return {
      ...b, ahead, cls, ridesUnpushed,
      pr: (open ?? merged ?? closed)?.number ?? null,
      worktree: wt ? { path: wt.path, owner: wt.owner, dirty: wt.dirty, live: wt.live } : null,
      baseOfOpenPr: openBases.has(b.name),
      live: (b.commitMin != null && b.commitMin < LIVE_MIN) || !!wt?.live,
    };
  };
  const branches = await mapLimit(refs, 8, classify);
  P.localBranches = branches.filter((b) => !b.remote);
  P.remoteBranches = branches.filter((b) => b.remote);

  P.openPrs = (openPrs.data ?? []).filter((p) => !p.isCrossRepository).map((p) => {
    const head = P.remoteBranches.find((b) => b.name === p.headRefName);
    const checks = summarizeChecks(p.statusCheckRollup);
    // A head branch another tool has checked out is shared: repair it with a merge, never a
    // rebase + force-push (personas-web 2026-09-15 force-pushed three app-worktree branches).
    const headWorktree = P.worktrees.find((w) => w.branch === p.headRefName && w.owner !== 'primary');
    return {
      number: p.number, title: p.title, head: p.headRefName, base: p.baseRefName, draft: p.isDraft,
      mergeable: p.mergeable, mergeState: p.mergeStateStatus, review: p.reviewDecision || null,
      author: p.author?.login, updatedMin: minutesSince(Date.parse(p.updatedAt)),
      size: { additions: p.additions, deletions: p.deletions, files: p.changedFiles },
      checks: { pass: checks.pass, fail: checks.fail, pending: checks.pending, failing: checks.failing },
      stacked: p.baseRefName !== P.defaultBranch,
      headCheckedOutBy: headWorktree?.owner ?? null,
      live: minutesSince(Date.parse(p.updatedAt)) < LIVE_MIN || !!head?.live,
    };
  });

  // ---- which checks actually gate a merge (branch protection); null when unprotected.
  // A red check outside this list never blocks a merge - systedo-case's secret scan was red
  // on every push for weeks and nothing required it.
  const req = await ghJson(['api', `repos/${P.repo}/branches/${P.defaultBranch}/protection/required_status_checks`]);
  P.requiredChecks = req.data?.contexts ?? (req.data?.checks ?? []).map((c) => c.context) ?? null;
  if (req.error) P.requiredChecks = null;

  // ---- CI on the default branch: latest run per workflow
  const runs = await ghJson(['run', 'list', '-R', P.repo, '--branch', P.defaultBranch, '--limit', '30', '--json', 'databaseId,conclusion,status,workflowName,headSha,createdAt,event']);
  const latest = new Map();
  for (const r of runs.data ?? []) if (!latest.has(r.workflowName)) latest.set(r.workflowName, r);
  P.defaultCi = [...latest.values()].map((r) => ({
    workflow: r.workflowName, status: r.status, conclusion: r.conclusion || null, id: r.databaseId, event: r.event,
    onTip: r.headSha === P.defaultSha, ageMin: minutesSince(Date.parse(r.createdAt)),
  }));
  // For a red push run on a protected branch, which jobs failed - and is any of them a
  // required check? tracklight's tip run was red on gitleaks + cargo-deny advisories only,
  // neither required: a signal, not a blocked gate.
  if (P.requiredChecks?.length) {
    for (const r of P.defaultCi) {
      if (r.status !== 'completed' || !RED_CONCLUSIONS.has(r.conclusion) || (r.event && r.event !== 'push')) continue;
      const jobs = await ghJson(['run', 'view', String(r.id), '-R', P.repo, '--json', 'jobs']);
      if (jobs.error) continue;
      r.failingJobs = (jobs.data?.jobs ?? []).filter((j) => RED_CONCLUSIONS.has(j.conclusion)).map((j) => j.name);
      r.failsRequired = r.failingJobs.some((n) => P.requiredChecks.includes(n));
    }
  }

  // ---- security
  P.security = {
    codeScanning: await securitySurface(P.repo, 'code-scanning', (a) => ({
      number: a.number, severity: a.rule?.security_severity_level || a.rule?.severity || null, rule: a.rule?.id,
      tool: a.tool?.name, path: a.most_recent_instance?.location?.path, line: a.most_recent_instance?.location?.start_line,
    })),
    secretScanning: await securitySurface(P.repo, 'secret-scanning', (a) => ({
      number: a.number, severity: 'secret', type: a.secret_type_display_name || a.secret_type, validity: a.validity ?? null, createdAt: a.created_at,
    })),
    dependabot: await securitySurface(P.repo, 'dependabot', (a) => ({
      number: a.number, severity: a.security_advisory?.severity ?? null, package: a.dependency?.package?.name,
      ecosystem: a.dependency?.package?.ecosystem, manifest: a.dependency?.manifest_path,
      patched: a.security_vulnerability?.first_patched_version?.identifier ?? null,
    })),
  };
  for (const s of Object.values(P.security)) s.bySeverity = bySeverity(s.alerts);

  P.actions = planActions(P);
  return P;
}

// ---------------------------------------------------------------------------- plan

const ridesText = (b) => (b?.ridesUnpushed > 0
  ? ` (${b.ridesUnpushed} of them are the primary's unpushed commits: never push this branch - delete if superseded, else leave)`
  : '');
const CONTENT_ON_DEFAULT = new Set(['merged', 'squash-merged', 'patch-on-default', 'on-local-default']);
const RED_CONCLUSIONS = new Set(['failure', 'timed_out', 'startup_failure']);

/**
 * Split the default branch's latest red runs into the GATE (blocks merges) and SIGNALS
 * (worth a human's look, block nothing). One function, used by the planner and the
 * rendered table alike: on 2026-09-15 the table's own "any red run" test showed gravitone
 * RED on a parked workflow while the planner had already learned better.
 *
 * Gate: a push-triggered run that failed at least one required check - or, when branch
 * protection is unknown or the jobs could not be read, any push-triggered failure.
 */
export function splitRed(defaultCi = []) {
  const failed = defaultCi.filter((r) => r.status === 'completed' && RED_CONCLUSIONS.has(r.conclusion));
  const isGate = (r) => (!r.event || r.event === 'push') && r.failsRequired !== false;
  return { gate: failed.filter(isGate), signal: failed.filter((r) => !isGate(r)) };
}

function planActions(P) {
  const A = [];
  const add = (cls, kind, target, reason, extra = {}) => A.push({ project: P.slug, class: cls, kind, target, reason, ...extra });
  const checkedOut = new Set(P.worktrees.map((w) => w.branch).filter(Boolean));

  if (P.archived) { add('operator', 'archived-repo', P.repo, 'repository is archived - nothing will ship'); return A; }

  if (!P.originHeadSet) add('mechanical', 'set-origin-head', P.defaultBranch, 'refs/remotes/origin/HEAD is unset, so tools that read it guess the default branch');

  for (const wt of P.worktrees) {
    if (wt.owner === 'primary') continue;
    if (wt.prunable) { add('mechanical', 'prune-worktrees', wt.path, 'worktree directory is gone; its admin entry is stale'); continue; }
    if (wt.live) { add('hands-off', 'live-worktree', wt.path, `activity ${wt.lastActivityMin} min ago`, { owner: wt.owner, branch: wt.branch ?? null }); continue; }
    const branch = wt.branch ? P.localBranches.find((b) => b.name === wt.branch) : null;
    const contentHome = wt.detached || (branch && CONTENT_ON_DEFAULT.has(branch.cls));
    const idle = wt.lastActivityMin != null && wt.lastActivityMin >= IDLE_H * 60;
    if (wt.owner === 'personas-app') continue; // summarized once below
    if (wt.dirty > 0) {
      add('operator', 'stale-uncommitted-worktree', wt.path, `${wt.dirty} uncommitted change(s), idle ${Math.round((wt.lastActivityMin ?? 0) / 60)} h - hygiene never discards WIP`, { owner: wt.owner, branch: wt.branch ?? null });
    } else if (contentHome && idle && (wt.owner === 'claude-code' || wt.owner === 'temp')) {
      add('mechanical', 'remove-worktree', wt.path, `clean, idle ${Math.round(wt.lastActivityMin / 60)} h, ${wt.detached ? 'detached' : `branch ${branch.cls}`}`, { owner: wt.owner, branch: wt.branch ?? null, sha: wt.head, deleteBranch: !!branch && !NEVER_DELETE.test(branch.name) });
    } else if (branch?.cls === 'open-pr') {
      // The PR action ships it; its worktree goes on a later morning once merged.
    } else if (!contentHome && idle && (wt.owner === 'claude-code' || wt.owner === 'temp' || wt.owner === 'other')) {
      add('worker', 'triage-worktree-branch', wt.path, `clean, idle, branch ${branch?.cls ?? 'unknown'} carries ${branch?.ahead ?? '?'} commit(s) not on ${P.defaultBranch}${ridesText(branch)}`, { owner: wt.owner, branch: wt.branch ?? null, ridesUnpushed: branch?.ridesUnpushed ?? 0 });
    }
  }
  const app = P.worktrees.filter((w) => w.owner === 'personas-app');
  if (app.length) {
    const appIdle = app.filter((w) => !w.live && !w.prunable);
    const appMerged = appIdle.filter((w) => CONTENT_ON_DEFAULT.has(P.localBranches.find((b) => b.name === w.branch)?.cls));
    add('operator', 'personas-app-worktrees', `${app.length} worktree(s)`, `${app.length - appIdle.length} live, ${appMerged.length} idle with content already on ${P.defaultBranch} - the app owns these and finalizes them itself; hygiene reports, never removes`, { mergedIdle: appMerged.map((w) => w.branch) });
  }

  for (const b of P.localBranches) {
    if (NEVER_DELETE.test(b.name)) continue;
    if (b.worktree) continue; // handled through its worktree
    if (b.live) { add('hands-off', 'live-branch', b.name, `last commit ${b.commitMin} min ago`); continue; }
    if (CONTENT_ON_DEFAULT.has(b.cls)) add('mechanical', 'delete-local-branch', b.name, `${b.cls}${b.pr ? ` (#${b.pr})` : ''}`, { sha: b.sha });
    else if (b.cls !== 'open-pr' && !P.remoteBranches.some((r) => r.name === b.name)) {
      add('worker', 'triage-branch', b.name, `local-only, ${b.cls}, ${b.ahead} commit(s) not on ${P.defaultBranch}${ridesText(b)}`, { sha: b.sha, scope: 'local', ridesUnpushed: b.ridesUnpushed ?? 0 });
    }
  }
  for (const b of P.remoteBranches) {
    if (NEVER_DELETE.test(b.name)) continue;
    if (b.baseOfOpenPr) continue; // a stacked PR targets it
    if (b.cls === 'open-pr') continue; // the PR action covers it
    // Someone's branch in progress. On 2026-09-15 the personas-web primary sat on a fresh
    // feature branch 0 commits ahead of master with 10 uncommitted changes; its remote
    // twin read "merged" and was only saved by the repo's pre-push hook.
    if (checkedOut.has(b.name)) continue;
    if (b.live) { add('hands-off', 'live-branch', `origin/${b.name}`, `last commit ${b.commitMin} min ago`); continue; }
    if (CONTENT_ON_DEFAULT.has(b.cls)) add('mechanical', 'delete-remote-branch', b.name, `${b.cls}${b.pr ? ` (#${b.pr})` : ''}`, { sha: b.sha });
    else add('worker', 'triage-branch', `origin/${b.name}`, `${b.cls}${b.pr ? ` (#${b.pr})` : ''}, ${b.ahead} commit(s) not on ${P.defaultBranch}${ridesText(b)}`, { sha: b.sha, scope: 'remote', ridesUnpushed: b.ridesUnpushed ?? 0 });
  }

  for (const pr of P.openPrs) {
    if (pr.live) { add('hands-off', 'live-pr', `#${pr.number}`, `updated ${pr.updatedMin} min ago - a session is still delivering it`, { title: pr.title }); continue; }
    const ready = !pr.draft && pr.mergeable === 'MERGEABLE' && pr.checks.fail === 0 && pr.checks.pending === 0 && !pr.stacked;
    add('worker', pr.draft ? 'pr-draft' : ready ? 'pr-ship' : 'pr-repair-then-ship', `#${pr.number}`,
      `${pr.title} | ${pr.mergeable}/${pr.mergeState} checks ${pr.checks.pass}✓ ${pr.checks.fail}✗ ${pr.checks.pending}… ${pr.stacked ? `stacked on ${pr.base}` : ''}`.trim(),
      { head: pr.head, base: pr.base, failing: pr.checks.failing, headCheckedOutBy: pr.headCheckedOutBy, sharedHead: !!pr.headCheckedOutBy });
  }

  // Only push-triggered runs are the default branch's gate. A red scheduled or dispatched
  // job (politicas sentinel.yml: dispatch-only, red by design until its store is wired) is
  // an operator signal, not an outage a worker should "fix".
  const { gate, signal: other } = splitRed(P.defaultCi);
  const fmt = (rs) => rs.map((r) => `${r.workflow} (run ${r.id}, ${r.event ?? '?'}${r.onTip ? ', on tip' : ', not on tip'}${r.failingJobs ? `; failing: ${r.failingJobs.join(', ')}${r.failsRequired === false ? ' - none required' : ''}` : ''})`).join('; ');
  if (gate.length) add('worker', 'default-branch-red', P.defaultBranch, fmt(gate), { runs: gate.map((r) => r.id) });
  if (other.length) add('operator', 'non-gate-workflow-red', P.defaultBranch, fmt(other), { runs: other.map((r) => r.id) });

  if (P.primary.onDefault && P.primary.behind > 0 && P.primary.ahead === 0) {
    if (P.primary.live) add('hands-off', 'primary-behind-live', P.defaultBranch, `${P.primary.behind} behind origin, but the checkout was active ${P.primary.lastActivityMin} min ago`);
    else add('mechanical', 'ff-primary', P.defaultBranch, `${P.primary.behind} commit(s) behind origin, 0 ahead`);
  } else if (P.primary.onDefault && P.primary.ahead > 0) {
    // Operator decision 2026-09-15: every fleet repo's CLAUDE.md says the owner pushes
    // after reading the log, and these are exactly the commits not yet read. Hygiene
    // lists them; it never ships commits it did not author.
    add('operator', 'primary-unpushed', P.defaultBranch, `${P.primary.ahead} unpushed commit(s) on ${P.defaultBranch}${P.primary.behind ? `, ${P.primary.behind} behind origin (diverged)` : ''}${P.primary.live ? ', checkout live' : ''} - newest: ${P.primary.unpushed.join(' | ')}`, { ahead: P.primary.ahead, behind: P.primary.behind });
  }
  if (!P.primary.onDefault) {
    add('operator', 'primary-off-default', P.primary.branch ?? '(detached)', `primary checkout is on ${P.primary.branch ?? 'a detached HEAD'} with ${P.primary.dirty ?? '?'} uncommitted change(s)${P.primary.live ? ', live' : ''}`);
  }

  const cs = P.security.codeScanning, ss = P.security.secretScanning, db = P.security.dependabot;
  if (cs.alerts.length) add('worker', 'code-scanning', `${cs.alerts.length} open`, JSON.stringify(cs.bySeverity));
  if (db.alerts.length) add('worker', 'dependabot', `${db.alerts.length} open`, JSON.stringify(db.bySeverity));
  if (ss.alerts.length) add('operator', 'secret-scanning', `${ss.alerts.length} open`, `${ss.alerts.map((a) => `#${a.number} ${a.type}`).join(', ')} - rotation is a human action; a worker may only remove the secret from HEAD`);
  const posture = Object.entries(P.security).filter(([, s]) => s.posture !== 'enabled').map(([k, s]) => `${k}:${s.posture}`);
  if (posture.length) add('operator', 'security-posture', P.repo, posture.join(', '));

  // Push-denied repos: only server-side actions stay with a worker. Everything that needs
  // a branch or default-branch push (including remote deletes) goes to the operator.
  if (P.pushDenied) {
    const SERVER_SIDE = new Set(['pr-ship', 'pr-draft']);
    for (const a of A) {
      const needsPush = (a.class === 'worker' && !SERVER_SIDE.has(a.kind)) || a.kind === 'delete-remote-branch';
      if (needsPush) { a.class = 'operator'; a.reason = `${a.reason} - repo settings deny git push; hygiene does not push here`; }
    }
  }
  return A;
}

// ---------------------------------------------------------------------------- report

function renderMarkdown(fleet, projects) {
  const L = [];
  L.push(`# Fleet hygiene plan - ${TODAY}`, '');
  L.push(`machine ${fleet.machine} | live window ${LIVE_MIN} min | worktree idle floor ${IDLE_H} h`, '');
  L.push('| project | default | CI | open PRs | local br | remote br | worktrees | code scan | secrets | dependabot | mech | worker | operator | hands-off |');
  L.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const P of projects) {
    if (!P.actions) { L.push(`| ${P.slug} | - | - | - | - | - | - | - | - | - | - | - | - | ${P.problems.join('; ')} |`); continue; }
    const n = (c) => P.actions.filter((a) => a.class === c).length;
    const red = splitRed(P.defaultCi);
    const ci = red.gate.length ? 'RED' : red.signal.length ? 'green (signals red)' : P.defaultCi.length ? 'green' : 'none';
    const sec = (s) => (s.posture === 'enabled' ? String(s.alerts.length) : s.posture);
    L.push(`| ${P.slug} | ${P.defaultBranch} | ${ci} | ${P.openPrs.length} | ${P.localBranches.length} | ${P.remoteBranches.length} | ${P.worktrees.length} | ${sec(P.security.codeScanning)} | ${sec(P.security.secretScanning)} | ${sec(P.security.dependabot)} | ${n('mechanical')} | ${n('worker')} | ${n('operator')} | ${n('hands-off')} |`);
  }
  for (const P of projects) {
    if (!P.actions?.length && !P.problems?.length) continue;
    L.push('', `## ${P.slug}`);
    for (const p of P.problems ?? []) L.push(`- PROBLEM ${p}`);
    for (const cls of ['worker', 'operator', 'mechanical', 'hands-off']) {
      const rows = (P.actions ?? []).filter((a) => a.class === cls);
      if (!rows.length) continue;
      L.push(`- **${cls}** (${rows.length})`);
      const shown = cls === 'mechanical' || cls === 'hands-off' ? rows.slice(0, 12) : rows;
      for (const a of shown) L.push(`  - ${a.kind} \`${a.target}\` - ${a.reason}`);
      if (shown.length < rows.length) L.push(`  - ... ${rows.length - shown.length} more in plan.json`);
    }
  }
  return L.join('\n') + '\n';
}

// ---------------------------------------------------------------------------- apply

async function applyAction(P, a) {
  const cwd = P.path;
  const archive = async (name, sha) => git(cwd, ['update-ref', `refs/hygiene-archive/${TODAY}/${name}`, sha]);
  switch (a.kind) {
    case 'set-origin-head': {
      const r = await git(cwd, ['remote', 'set-head', 'origin', a.target]);
      return r.ok ? { done: true } : { skipped: r.stderr.trim() };
    }
    case 'prune-worktrees': {
      const r = await git(cwd, ['worktree', 'prune']);
      return r.ok ? { done: true } : { skipped: r.stderr.trim() };
    }
    case 'delete-local-branch': {
      const sha = await gitOut(cwd, ['rev-parse', '--verify', '-q', `refs/heads/${a.target}`]);
      if (sha !== a.sha) return { skipped: `tip moved (${a.sha?.slice(0, 8)} -> ${sha?.slice(0, 8) ?? 'gone'})` };
      const ct = Number(await gitOut(cwd, ['log', '-1', '--format=%ct', sha]));
      if (minutesSince(ct * 1000) < LIVE_MIN) return { skipped: 'became live' };
      await archive(a.target, sha);
      const r = await git(cwd, ['branch', '-D', a.target]);
      return r.ok ? { done: true, archived: sha } : { skipped: r.stderr.trim() };
    }
    case 'delete-remote-branch': {
      const ls = await gitOut(cwd, ['ls-remote', 'origin', `refs/heads/${a.target}`]);
      const sha = ls?.split(/\s+/)[0] || null;
      if (sha !== a.sha) return { skipped: `remote tip moved (${a.sha?.slice(0, 8)} -> ${sha?.slice(0, 8) ?? 'gone'})` };
      const wtNow = parseWorktrees(await gitOut(cwd, ['worktree', 'list', '--porcelain']) ?? '');
      if (wtNow.some((w) => w.branch === a.target)) return { skipped: 'a worktree now has this branch checked out' };
      const bases = await ghJson(['pr', 'list', '-R', P.repo, '--state', 'open', '--base', a.target, '--json', 'number']);
      if (bases.error || bases.data?.length) return { skipped: bases.error ?? `now the base of #${bases.data.map((x) => x.number).join(', #')}` };
      await archive(`origin/${a.target}`, sha);
      // Server-side delete, not `git push --delete`: a push from the primary checkout runs
      // its full pre-push hook (personas: typecheck + census + i18n + evals) for a ref
      // deletion no hook has an opinion on. The safety the hook once supplied by accident
      // (personas-web, 2026-09-15) is now the checked-out guard above. Push-denied repos
      // never reach this: their remote deletes are operator rows.
      const r = await run('gh', ['api', '-X', 'DELETE', `repos/${P.repo}/git/refs/heads/${a.target}`], { timeout: 60_000 });
      if (!r.ok) return { skipped: (r.stderr || String(r.err?.message)).split('\n')[0] };
      await git(cwd, ['update-ref', '-d', `refs/remotes/origin/${a.target}`]);
      return { done: true, archived: sha };
    }
    case 'remove-worktree': {
      const act = await probeCheckout(a.target);
      if (!act.exists) return { skipped: 'worktree already gone' };
      if (act.dirty !== 0) return { skipped: `now has ${act.dirty} uncommitted change(s)` };
      if (act.lastActivityMin < IDLE_H * 60) return { skipped: `became active ${act.lastActivityMin} min ago` };
      const head = await gitOut(a.target, ['rev-parse', 'HEAD']);
      if (a.sha && head !== a.sha) return { skipped: 'HEAD moved' };
      const r = await git(cwd, ['worktree', 'remove', a.target], { timeout: 600_000 });
      if (!r.ok) return { skipped: r.stderr.trim() };
      if (a.deleteBranch && a.branch) {
        const sha = await gitOut(cwd, ['rev-parse', '--verify', '-q', `refs/heads/${a.branch}`]);
        if (sha) { await archive(a.branch, sha); await git(cwd, ['branch', '-D', a.branch]); }
      }
      return { done: true, archived: head };
    }
    case 'ff-primary': {
      const act = await probeCheckout(cwd);
      if (act.lastActivityMin < LIVE_MIN) return { skipped: `primary active ${act.lastActivityMin} min ago` };
      const branch = await gitOut(cwd, ['branch', '--show-current']);
      if (branch !== a.target) return { skipped: `primary moved to ${branch}` };
      const r = await git(cwd, ['merge', '--ff-only', `origin/${a.target}`], { timeout: 300_000 });
      return r.ok ? { done: true } : { skipped: (r.stderr || r.stdout).trim().split('\n').slice(0, 3).join(' ') };
    }
    default:
      return { skipped: `not a mechanical kind: ${a.kind}` };
  }
}

// ---------------------------------------------------------------------------- main

async function main() {
  const fleet = loadFleet(ROOT);
  if (!fleet.machine) { console.error(`FATAL: ${fleet.problems.join('; ')}`); process.exit(1); }
  const common = (await gitOut(ROOT, ['rev-parse', '--path-format=absolute', '--git-common-dir'])) ?? path.join(ROOT, '.git');
  const outDir = path.resolve(opt('out', path.join(common, 'hygiene', TODAY)));
  fs.mkdirSync(outDir, { recursive: true });

  if (opt('brief')) {
    // The worker prompt, assembled from files rather than retyped: the brief verbatim,
    // the project's slice of plan.json, and its fleet-quirks sections.
    const plan = JSON.parse(fs.readFileSync(path.join(outDir, 'plan.json'), 'utf8'));
    const P = plan.projects.find((p) => p.slug === opt('brief'));
    if (!P) { console.error(`FATAL: no project ${opt('brief')} in the plan`); process.exit(1); }
    const skillDir = path.join(ROOT, '.claude', 'skills', 'hygiene', 'references');
    const brief = fs.readFileSync(path.join(skillDir, 'worker-brief.md'), 'utf8').replace(/\r/g, '');
    const quirks = fs.readFileSync(path.join(skillDir, 'fleet-quirks.md'), 'utf8').replace(/\r/g, '');
    const sections = Object.fromEntries(quirks.split(/^## /m).slice(1).map((s) => {
      const nl = s.indexOf('\n');
      return [s.slice(0, nl).trim(), s.slice(nl + 1).trim()];
    }));
    const pick = (cls) => (P.actions ?? []).filter((a) => a.class === cls);
    const block = {
      slug: P.slug, repo: P.repo, path: P.path, date: TODAY,
      defaultBranch: P.defaultBranch, mergeMethods: P.mergeMethods, deleteBranchOnMerge: P.deleteBranchOnMerge,
      pushDenied: P.pushDenied, requiredChecks: P.requiredChecks,
      primary: { ...P.primary, dirtyPaths: undefined, dirtyCount: P.primary.dirtyPaths?.length },
      worker: pick('worker'),
      operator: pick('operator').map(({ kind, target, reason }) => ({ kind, target, reason })),
      handsOff: pick('hands-off').map((a) => a.target),
    };
    process.stdout.write(`${brief}\n\n## Your project\n\n\`\`\`json\n${JSON.stringify(block, null, 2)}\n\`\`\`\n\n` +
      `### Fleet quirks - all projects\n\n${sections['All projects'] ?? '(none recorded)'}\n\n` +
      `### Fleet quirks - ${P.slug}\n\n${sections[P.slug] ?? '(none recorded)'}\n`);
    return;
  }

  if (flag('apply')) {
    const planPath = path.join(outDir, 'plan.json');
    if (!fs.existsSync(planPath)) { console.error(`FATAL: no plan at ${planPath} - scan first`); process.exit(1); }
    const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
    const ledger = path.join(outDir, 'applied.jsonl');
    const tally = { done: 0, skipped: 0 };
    for (const P of plan.projects) {
      if (ONLY && !ONLY.has(P.slug)) continue;
      // Order matters: worktrees before their branches, prune before anything reads the list.
      const order = ['set-origin-head', 'prune-worktrees', 'remove-worktree', 'delete-local-branch', 'delete-remote-branch', 'ff-primary'];
      const mech = (P.actions ?? []).filter((a) => a.class === 'mechanical').sort((x, y) => order.indexOf(x.kind) - order.indexOf(y.kind));
      let pruned = false;
      for (const a of mech) {
        if (a.kind === 'prune-worktrees' && pruned) continue;
        const res = await applyAction(P, a);
        if (a.kind === 'prune-worktrees') pruned = true;
        res.done ? tally.done++ : tally.skipped++;
        fs.appendFileSync(ledger, JSON.stringify({ at: new Date().toISOString(), ...a, ...res }) + '\n');
        console.log(`${res.done ? 'DONE ' : 'SKIP '} ${P.slug} ${a.kind} ${a.target}${res.skipped ? ` - ${res.skipped}` : ''}`);
      }
    }
    console.log(`\napplied: ${tally.done} done, ${tally.skipped} skipped -> ${ledger}`);
    return;
  }

  const slugs = Object.keys(fleet.projects).filter((s) => !ONLY || ONLY.has(s));
  const projects = await mapLimit(slugs, 4, async (slug) => {
    const t = Date.now();
    try {
      const P = await scanProject(slug, fleet.projects[slug]);
      process.stderr.write(`scanned ${slug} in ${Math.round((Date.now() - t) / 1000)} s\n`);
      return P;
    } catch (e) {
      return { slug, problems: [`scan crashed: ${e.stack?.split('\n').slice(0, 2).join(' ')}`] };
    }
  });
  const plan = { generatedAt: new Date().toISOString(), machine: fleet.machine, liveMinutes: LIVE_MIN, idleHours: IDLE_H, fleetProblems: fleet.problems, projects };
  fs.writeFileSync(path.join(outDir, 'plan.json'), JSON.stringify(plan, null, 2));
  const md = renderMarkdown(fleet, projects);
  fs.writeFileSync(path.join(outDir, 'plan.md'), md);
  if (flag('json')) process.stdout.write(JSON.stringify(plan, null, 2));
  else process.stdout.write(md + `\nplan: ${path.join(outDir, 'plan.json')}\n`);
}

export { planActions, RED_CONCLUSIONS };

// Run only as a command; scripts/tests/hygiene-scan.test.mjs imports the planner.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(`FATAL: ${e.stack}`); process.exit(1); });
}

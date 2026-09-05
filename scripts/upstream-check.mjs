#!/usr/bin/env node
/**
 * upstream-check - the deterministic half of `/librarian upstream`.
 *
 * ## What it is for
 *
 * This registry has mined 73 distinct GitHub repositories. 23 of their source notes
 * carry a `rescan_when:` condition naming a concrete upstream event, and 163 application
 * files assert things about code at a specific external commit. Nothing read either on a
 * clock: `/intake` checks its own conditions at Phase 1, which means a condition is only
 * ever evaluated when an operator arrives with a DIFFERENT link. A mechanism that fires
 * only as a side effect of unrelated work is not a mechanism.
 *
 * So this script answers two questions per mined repository, and nothing else:
 *
 *   1. Has it moved since we pinned it, and is our pin still reachable?
 *   2. Is it eligible and due for a delta re-scan?
 *
 * ## What it refuses to do
 *
 * **It never claims a prose condition fired.** A `rescan_when:` value is a sentence
 * written by whoever mined the tree ("the invalidation dispatcher's default branch
 * becomes fatal for non-system keys"). Two clauses of such a sentence are mechanical -
 * a release landing, and a calendar date passing - and this script decides exactly
 * those. Everything else comes back `undecidable`, with the condition text and the
 * release evidence printed beside it, for a reader to judge. Same division of labour as
 * `librarian-scan.mjs`: the script counts, the skill judges.
 *
 * **It never reports an absence it did not establish.** An unpinned note yields
 * `delta: unknown`, never "no change". A network failure or a rate-limit yields
 * `state: error` on that row, never a quiet "not due" - a dead API that grades as
 * all-clear is the failure this repo's 2026-08-23 dispatcher lesson already paid for.
 * And `--self-test` asserts the compare call against a repository known to have moved
 * before any absence in the run is trusted.
 *
 * ## Eligibility: reach into our code, not reach across the corpus
 *
 * The obvious rule - join the source to the subjects it moved, then to the projects
 * holding contexts under them - was prototyped and rejected on its output: 33 of 78
 * sources scored the whole fleet, because the subjects most sources touch are present
 * everywhere, and `vllm` scored ZERO having forged six systems, because subjects born
 * from a source are not yet in any project's registry map. A signal that is always on
 * is off, and one that ranks a source lowest when it taught us most is worse.
 *
 * What is measured instead is whether this repository's knowledge reached a project's
 * tree, which the source notes already record:
 *
 *   tier 1  peer      - a peer comparison study, or a forge handoff
 *   tier 2  shipped   - `shipped: >= 1`
 *   tier 3  applied   - `applied: >= 2` and a `better` verdict in applied.md on a
 *                       subject this source touched
 *
 * Excluded by class: catalogues (awesome-lists, reference indexes, paper aggregators,
 * curricula, doctrine corpora) - their delta is more rows, and rows belong in the
 * harvest queue. Excluded by lane: everything named in `librarian/watchlist.md` outside
 * its Track A table - Track B is admitted on engineering reputation, and re-scanning it
 * is `/reconcile`'s job on `/reconcile`'s terms. Excluded by evidence: no commit pin.
 *
 * Usage:
 *   node scripts/upstream-check.mjs                 # the human table (calls the API)
 *   node scripts/upstream-check.mjs --json          # what the skill reads
 *   node scripts/upstream-check.mjs --offline       # eligibility only, no API calls
 *   node scripts/upstream-check.mjs --due           # only rows that are due
 *   node scripts/upstream-check.mjs --exit-code     # exit 3 when anything is due
 *   node scripts/upstream-check.mjs --self-test     # assert the instrument, then exit
 *   node scripts/upstream-check.mjs --ledger        # rewrite librarian/upstream.md
 *   node scripts/upstream-check.mjs --repo o/r      # one repository
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const SOURCES = path.join(ROOT, 'librarian', 'sources');
const SUBJECTS = path.join(ROOT, 'librarian', 'subjects');
const HANDOFFS = path.join(ROOT, 'librarian', 'handoffs');
const APPLIED = path.join(ROOT, 'librarian', 'applied.md');
const WATCHLIST = path.join(ROOT, 'librarian', 'watchlist.md');
const HARVEST = path.join(ROOT, 'librarian', 'harvest');
const LEDGER = path.join(ROOT, 'librarian', 'upstream.md');

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const arg = (f) => (argv.indexOf(f) >= 0 ? argv[argv.indexOf(f) + 1] : undefined);
const OPT = {
  json: has('--json'),
  offline: has('--offline'),
  dueOnly: has('--due'),
  exitCode: has('--exit-code'),
  selfTest: has('--self-test'),
  ledger: has('--ledger'),
  repo: arg('--repo'),
  concurrency: Number(arg('--concurrency')) || 8,
};

/** Floors in days, by tier. A condition firing overrides all of them. */
const FLOOR = { 1: 30, 2: 60, 3: 90 };
/** A tree nobody has pushed to in this many days is reported dormant. */
const DORMANT_DAYS = 90;

const TODAY = new Date();
const days = (from) => Math.floor((TODAY - new Date(from)) / 86400000);

// ---------------------------------------------------------------- source notes

function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].replace(/^"|"$/g, '');
  }
  return out;
}
const leadingCount = (v) => {
  const m = String(v ?? '').match(/^\s*(\d+)/);
  return m ? Number(m[1]) : 0;
};
const CATALOGUE = /awesome|reference[- ]index|paper[- ]aggregator|aggregator|curriculum|curriculum-repo|doctrine-corpus|pattern catalogue|curated prompt/i;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, (c) => `\\${c}`);

/** Every subject note, read once - the join target for run ids and source wikilinks. */
function loadSubjectNotes() {
  const notes = [];
  if (!fs.existsSync(SUBJECTS)) return notes;
  for (const domain of fs.readdirSync(SUBJECTS)) {
    const dir = path.join(SUBJECTS, domain);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.md')) continue;
      notes.push({
        subject: file.replace(/\.md$/, ''),
        key: `${domain}/${file.replace(/\.md$/, '')}`,
        text: fs.readFileSync(path.join(dir, file), 'utf8'),
      });
    }
  }
  return notes;
}

/** applied.md rows, keyed by subject slug. The tier-3 evidence. */
function loadApplied() {
  const bySubject = new Map();
  if (!fs.existsSync(APPLIED)) return bySubject;
  for (const line of fs.readFileSync(APPLIED, 'utf8').split(/\r?\n/)) {
    if (!line.startsWith('| 20')) continue;
    const c = line.split('|').map((s) => s.trim());
    const row = { date: c[1], technique: c[2], subject: c[3], project: c[4], mode: c[5], verdict: c[6] };
    if (!bySubject.has(row.subject)) bySubject.set(row.subject, []);
    bySubject.get(row.subject).push(row);
  }
  return bySubject;
}

/**
 * Repositories named in watchlist.md OUTSIDE its Track A table. Track B is the
 * external-reconcile lane's roster (admitted on engineering reputation, which
 * [[2026-08-22-2]] measured near-orthogonal to this lane's axis); the standards and
 * counterpart tables below it are class B/C, re-pinned by the wave that cites them.
 */
function loadLaneExclusions() {
  const out = new Set();
  if (!fs.existsSync(WATCHLIST)) return out;
  let section = '';
  for (const line of fs.readFileSync(WATCHLIST, 'utf8').split(/\r?\n/)) {
    const h = line.match(/^#{2,3}\s+(.*)$/);
    if (h) {
      // a `###` inherits the `##` above it unless it names a track of its own
      if (/^##\s/.test(line) || /track\s+[ab]/i.test(h[1])) section = h[1];
      continue;
    }
    if (/^track\s+a/i.test(section)) continue;
    for (const m of line.matchAll(/\b([A-Za-z0-9][\w.-]+)\/([A-Za-z0-9][\w.-]+)\b/g)) {
      const [owner, name] = [m[1], m[2]];
      // the table cells also carry grades (`L4/83`) and ratios (`206/206`); a repo slug
      // has at least two letters on each side and is not a filename
      if (!/[A-Za-z]{2}/.test(owner) || !/[A-Za-z]{2}/.test(name)) continue;
      const slug = `${owner}/${name}`.toLowerCase();
      if (/\.(md|json|mjs|js|xml|yaml)$/.test(slug)) continue;
      out.add(slug);
    }
  }
  return out;
}

/**
 * Handoff documents that have not been marked EXECUTED.
 *
 * Matched on the FILENAME's hyphen-delimited segments, not on the body text. The first
 * reading searched the body for the bare repository name, and "mcp" and "gateway" are
 * words: `microsoft/mcp` was told it owed dora's handoff and `Portkey-AI/gateway` was
 * told it owed hermes-agent's. A substring match over prose is not an identity test.
 */
function loadOpenHandoffs() {
  const open = [];
  if (!fs.existsSync(HANDOFFS)) return open;
  for (const file of fs.readdirSync(HANDOFFS)) {
    if (!file.endsWith('.md')) continue;
    const text = fs.readFileSync(path.join(HANDOFFS, file), 'utf8');
    open.push({
      file,
      name: file.replace(/\.md$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      body: text.toLowerCase(),
      executed: /^status:\s*EXECUTED/im.test(text) || /^##\s+EXECUTED\b/im.test(text),
    });
  }
  return open;
}

/**
 * Does this handoff document name this repository?
 *
 * The whole owner or the whole repository name inside the filename, or the full
 * `owner/name` slug inside the body. Deliberately NOT the filename's individual
 * segments: `agent`, `source`, `task` and `spec` are how half these documents are
 * named, and matching on one told `VoltAgent/awesome-ai-agent-papers` that it owed
 * hermes-agent's handoff.
 */
function handoffNames(handoff, repoKey) {
  if (handoff.body.includes(repoKey)) return true;
  const [owner, name] = repoKey.split('/');
  if (name && name.length >= 4 && handoff.name.includes(name)) return true;
  return !!owner && owner.length >= 5 && handoff.name.includes(owner);
}

/** URLs already queued in the harvest lane - that queue owns them, not this one. */
function loadHarvestQueue() {
  const urls = new Set();
  if (!fs.existsSync(HARVEST)) return urls;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir)) {
      const p = path.join(dir, entry);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (entry.endsWith('.md') || entry.endsWith('.jsonl') || entry.endsWith('.json')) {
        for (const m of fs.readFileSync(p, 'utf8').matchAll(/github\.com\/([\w.-]+\/[\w.-]+)/gi)) {
          urls.add(m[1].replace(/\.git$/, '').toLowerCase());
        }
      }
    }
  };
  walk(HARVEST);
  return urls;
}

function loadRepos() {
  const subjectNotes = loadSubjectNotes();
  const applied = loadApplied();
  const laneExcluded = loadLaneExclusions();
  const handoffs = loadOpenHandoffs();
  const queued = loadHarvestQueue();
  const byRepo = new Map();

  for (const file of fs.readdirSync(SOURCES)) {
    if (!file.endsWith('.md') || file === 'index.md') continue;
    const text = fs.readFileSync(path.join(SOURCES, file), 'utf8');
    const fm = frontmatter(text);
    const url = fm.url || '';
    if (!/^https:\/\/github\.com\//.test(url)) continue;

    const slug = file.replace(/\.md$/, '');
    const repo = (url.match(/github\.com\/([^/\s]+\/[^/\s)#?]+)/) || [])[1];
    if (!repo) continue;
    const key = repo.replace(/\.git$/, '').toLowerCase();
    // the filename date is the fallback: 49 notes carry `mined_on`, all 156 are dated
    const minedOn = fm.mined_on && /^\d{4}-\d{2}-\d{2}/.test(fm.mined_on)
      ? fm.mined_on.slice(0, 10)
      : slug.slice(0, 10);

    // subjects this source moved: by run id, else by a wikilink to its own slug
    const runId = (fm.run_id || '').split(/\s/)[0];
    let subjects = runId ? subjectNotes.filter((n) => n.text.includes(runId)) : [];
    if (!subjects.length) {
      const re = new RegExp(`\\[\\[([^\\]]*/)?${escapeRe(slug)}\\]\\]`);
      subjects = subjectNotes.filter((n) => re.test(n.text));
    }
    const subjectSlugs = subjects.map((n) => n.subject);

    // tier-3 evidence: a `better` verdict on one of those subjects, at or after the mine
    const betterProjects = new Set();
    for (const s of subjectSlugs) {
      for (const row of applied.get(s) || []) {
        if (row.date >= minedOn && /^better/i.test(row.verdict) && row.project && !/^[-—]$/.test(row.project)) {
          betterProjects.add(row.project);
        }
      }
    }

    const kind = `${fm.kind || ''} ${fm.source || ''}`;
    const handoffField = (fm.handoff || '').trim();
    const rec = {
      repo: repo.replace(/\.git$/, ''),
      key,
      url,
      note: slug,
      minedOn,
      pin: fm.commit ? fm.commit.trim() : null,
      condition: fm.rescan_when || null,
      catalogue: CATALOGUE.test(kind),
      peer: /peer/i.test(fm.directions || '') || /peer/i.test(handoffField),
      handoff: !!handoffField && !/^(no|none|-|—)\b/i.test(handoffField),
      shipped: leadingCount(fm.shipped),
      applied: leadingCount(fm.applied),
      subjects: subjectSlugs,
      betterProjects: [...betterProjects],
    };

    const prev = byRepo.get(key);
    if (!prev) { byRepo.set(key, rec); continue; }
    // one repo, several notes: keep the newest, but OR the evidence across all of them
    const [keep, drop] = rec.minedOn >= prev.minedOn ? [rec, prev] : [prev, rec];
    keep.peer = keep.peer || drop.peer;
    keep.handoff = keep.handoff || drop.handoff;
    keep.condition = keep.condition || drop.condition;
    keep.pin = keep.pin || drop.pin;
    keep.shipped = Math.max(keep.shipped, drop.shipped);
    keep.applied = Math.max(keep.applied, drop.applied);
    keep.subjects = [...new Set([...keep.subjects, ...drop.subjects])];
    keep.betterProjects = [...new Set([...keep.betterProjects, ...drop.betterProjects])];
    keep.notes = [...new Set([...(keep.notes || [keep.note]), drop.note])];
    byRepo.set(key, keep);
  }

  for (const r of byRepo.values()) {
    r.tier = (r.peer || r.handoff) ? 1 : r.shipped >= 1 ? 2 : (r.applied >= 2 && r.betterProjects.length) ? 3 : 0;
    r.exclusions = [];
    if (r.tier === 0) r.exclusions.push('no fleet evidence: nothing this source landed has been shipped, applied with a better verdict, or made a peer study or a handoff');
    if (r.catalogue) r.exclusions.push('catalogue class: a delta is more rows, which belong in the harvest queue');
    if (laneExcluded.has(r.key)) r.exclusions.push('reconcile lane: named in watchlist.md outside Track A');
    if (!r.pin) r.exclusions.push('no commit pin: a delta has no base, so movement is unknown rather than absent');
    r.eligible = r.exclusions.length === 0;
    r.floor = FLOOR[r.tier] || null;
    r.queuedInHarvest = queued.has(r.key);
    const own = handoffs.filter((h) => handoffNames(h, r.key));
    r.openHandoff = own.find((h) => !h.executed)?.file || null;
  }
  return [...byRepo.values()];
}

// ------------------------------------------------------------------- the API

function gh(endpoint, jq) {
  return new Promise((resolve) => {
    const args = ['api', endpoint];
    if (jq) args.push('--jq', jq);
    execFile('gh', args, { maxBuffer: 32 * 1024 * 1024, windowsHide: true }, (err, stdout, stderr) => {
      if (err) {
        const msg = `${stderr || err.message}`.trim();
        const status = /HTTP (\d{3})/.exec(msg);
        return resolve({ ok: false, status: status ? Number(status[1]) : null, error: msg.split('\n')[0].slice(0, 200) });
      }
      const body = stdout.trim();
      if (!body) return resolve({ ok: true, data: null });
      try {
        return resolve({ ok: true, data: JSON.parse(body) });
      } catch { /* not one JSON value - try the two shapes --jq also emits */ }
      try {
        // a stream of one JSON value per line
        return resolve({ ok: true, data: body.split('\n').filter(Boolean).map((l) => JSON.parse(l)) });
      } catch { /* not that either */ }
      // a bare scalar: `--jq '.default_branch'` prints `main`, which is not JSON
      if (!body.includes('\n')) return resolve({ ok: true, data: body, scalar: true });
      return resolve({ ok: false, status: null, error: `unparseable response: ${body.slice(0, 120)}` });
    });
  });
}

async function probe(r) {
  const meta = await gh(`repos/${r.repo}`, '{default_branch,pushed_at,archived}');
  if (!meta.ok) {
    r.state = 'error';
    r.error = meta.status === 404 ? 'repository not found (renamed, deleted, or made private)' : meta.error;
    return r;
  }
  r.defaultBranch = meta.data.default_branch;
  r.pushedAt = meta.data.pushed_at ? meta.data.pushed_at.slice(0, 10) : null;
  r.archived = !!meta.data.archived;

  const rel = await gh(`repos/${r.repo}/releases?per_page=5`, '{tag:.tag_name,published:.published_at}');
  r.releasesSince = [];
  if (rel.ok && rel.data) {
    const list = Array.isArray(rel.data) ? rel.data : [rel.data];
    r.releasesSince = list
      .filter((x) => x && x.published && x.published.slice(0, 10) > r.minedOn)
      .map((x) => ({ tag: x.tag, published: x.published.slice(0, 10) }));
  }

  if (r.archived) {
    r.state = 'archived';
  } else if (!r.pin) {
    r.state = 'unknown';
  } else {
    const cmp = await gh(`repos/${r.repo}/compare/${r.pin}...${r.defaultBranch}`,
      '{status,ahead_by,behind_by,total_commits,files:(.files|length)}');
    if (!cmp.ok) {
      if (cmp.status === 404) {
        // the commit we cite is not reachable from the default branch any more
        r.state = 'pin-unreachable';
        r.citationRisk = true;
      } else {
        r.state = 'error';
        r.error = cmp.error;
        return r;
      }
    } else {
      r.aheadBy = cmp.data.ahead_by ?? 0;
      r.behindBy = cmp.data.behind_by ?? 0;
      r.filesChanged = cmp.data.files ?? 0;
      if (r.behindBy > 0) { r.state = 'rewritten'; r.citationRisk = true; }
      else if (r.aheadBy > 0) r.state = 'moved';
      else if (r.pushedAt && days(r.pushedAt) > DORMANT_DAYS) r.state = 'dormant';
      else r.state = 'unmoved';
    }
  }
  return r;
}

/**
 * Three states, and the middle one is the honest default.
 *
 *   none         no condition was written
 *   fired        a MECHANICAL clause is satisfied: a release landed after the mine, or
 *                a calendar date named in the condition has passed
 *   undecidable  a condition exists and no mechanical clause fired - its prose clauses
 *                cannot be settled here, and this script will not pretend either way
 */
function conditionState(r) {
  if (!r.condition) return { state: 'none', why: [] };
  const why = [];
  if (r.releasesSince && r.releasesSince.length) {
    why.push(`release ${r.releasesSince[0].tag} published ${r.releasesSince[0].published}, after the mine`);
  }
  for (const d of deadlineDates(r.condition)) {
    if (days(d) >= 0) why.push(`the deadline clause ${d} has passed`);
  }
  return { state: why.length ? 'fired' : 'undecidable', why };
}

/**
 * Dates that are a DEADLINE, not a date mentioned in passing.
 *
 * A condition is a sentence of clauses joined by `;` and `or`. Written in this vault as
 * "...; or 8 weeks elapse (2026-10-28)" or "; or 2026-11-01" - but also, in prose, as
 * "1.6.0 shipped 2026-06-12, cadence roughly two per year", which is a fact about the
 * past. The first reading of this function fired MONAI's condition on that fact and
 * reported the repo due, which is exactly the confident wrong answer the whole script
 * is built to avoid. A date counts only when its clause is ABOUT the waiting: strip the
 * date and what remains must be nothing, or an elapse phrase.
 */
function deadlineDates(condition) {
  const out = [];
  for (const clause of condition.split(/;|\bor\b/i)) {
    const m = clause.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
    if (!m) continue;
    const residue = clause.replace(m[1], '').replace(/[^a-z0-9]/gi, '').toLowerCase();
    if (residue === '' || /^\d*(week|month|day|year)s?(elapsed?)?$/.test(residue)) out.push(m[1]);
  }
  return out;
}

function decide(r) {
  const c = conditionState(r);
  r.conditionState = c.state;
  r.conditionWhy = c.why;
  r.due = false;
  r.reasons = [];

  if (!r.eligible) { r.reasons = r.exclusions.slice(); return r; }
  if (!r.state) {
    // --offline: the clock is knowable, movement is not, and "due" means BOTH. Report
    // the clock separately rather than letting an unprobed row claim a due date.
    const age = days(r.minedOn);
    r.clockDue = age >= r.floor;
    r.reasons.push(`not probed (offline): ${r.clockDue ? `tier ${r.tier} floor of ${r.floor} days has passed` : `${r.floor - age} days short of the tier ${r.tier} floor`}, upstream movement unknown`);
    return r;
  }
  if (r.state === 'error') { r.reasons.push(`instrument error, not an absence: ${r.error}`); return r; }
  if (r.state === 'archived') { r.reasons.push('archived upstream - retire the row'); return r; }
  if (r.openHandoff) { r.reasons.push(`handoff ${r.openHandoff} is not marked EXECUTED - owed work, not a re-scan`); return r; }
  if (r.queuedInHarvest) { r.reasons.push('already queued in librarian/harvest/ - that lane owns it'); return r; }

  // corpus decay outranks the clock: a citation we cannot re-open is due now
  if (r.citationRisk) {
    r.due = true;
    r.reasons.push(r.state === 'pin-unreachable'
      ? 'the pinned commit is unreachable from the default branch - every application citing it is unverifiable now'
      : `history was rewritten under the pin (behind_by ${r.behindBy}) - re-open the citations`);
    return r;
  }
  if (r.state === 'unknown') { r.reasons.push('no pin, so movement is unknown - re-pin at the next mine'); return r; }
  if (r.state === 'unmoved' || r.state === 'dormant') {
    r.reasons.push(r.state === 'dormant'
      ? `no push in ${days(r.pushedAt)} days - nothing to read`
      : 'no commits since the pin - nothing to read');
    return r;
  }

  const age = days(r.minedOn);
  if (r.conditionState === 'fired') {
    r.due = true;
    r.reasons.push(`condition fired: ${r.conditionWhy.join('; ')}`);
  } else if (age >= r.floor) {
    r.due = true;
    r.reasons.push(`tier ${r.tier} floor of ${r.floor} days passed (${age} days since the mine) and the tree is ahead by ${r.aheadBy}`);
  } else {
    r.reasons.push(`ahead by ${r.aheadBy}, but ${r.floor - age} days short of the tier ${r.tier} floor` +
      (r.conditionState === 'undecidable' ? '; condition is prose and undecidable here' : ''));
  }
  return r;
}

// -------------------------------------------------------------- the self test

/**
 * An absence is only worth reporting if the instrument can see a presence. This asserts
 * the compare call against a repository and a commit known to be far behind its default
 * branch, and refuses the run if the answer is not "ahead".
 */
async function selfTest() {
  const cases = [
    { repo: 'openbao/openbao', pin: '6b5f82e1acc4868c19e5b11c0aee25ce4fd3ec38', expect: 'ahead' },
    { repo: 'kube-rs/kube', pin: '7a4641d4cc', expect: 'ahead' },
  ];
  let failed = 0;
  for (const c of cases) {
    const meta = await gh(`repos/${c.repo}`, '.default_branch');
    if (!meta.ok) { console.error(`FAIL  ${c.repo}: metadata call failed - ${meta.error}`); failed++; continue; }
    const branch = String(meta.data).replace(/"/g, '');
    const cmp = await gh(`repos/${c.repo}/compare/${c.pin}...${branch}`, '{status,ahead_by}');
    if (!cmp.ok) { console.error(`FAIL  ${c.repo}: compare failed - ${cmp.error}`); failed++; continue; }
    const ok = cmp.data.status === c.expect && cmp.data.ahead_by > 0;
    console.log(`${ok ? 'ok  ' : 'FAIL'}  ${c.repo}  status=${cmp.data.status} ahead_by=${cmp.data.ahead_by} (expected ${c.expect}, ahead > 0)`);
    if (!ok) failed++;
  }
  const limit = await gh('rate_limit', '.resources.core');
  if (limit.ok) console.log(`ok    rate limit: ${limit.data.remaining}/${limit.data.limit} remaining`);
  else { console.error(`FAIL  rate limit unreadable - ${limit.error}`); failed++; }
  if (failed) {
    console.error(`\n${failed} assertion(s) failed. Do NOT trust an absence from this run.`);
    process.exit(2);
  }
  console.log('\nInstrument asserted against known positives. Absences in this run are readable.');
}

// ------------------------------------------------------------------- reporting

function ledgerMarkdown(rows) {
  const eligible = rows.filter((r) => r.eligible).sort((a, b) => a.tier - b.tier || a.repo.localeCompare(b.repo));
  const excluded = rows.filter((r) => !r.eligible).sort((a, b) => a.repo.localeCompare(b.repo));
  const stamp = TODAY.toISOString().slice(0, 10);
  const cell = (s) => String(s ?? '').replace(/\|/g, '\\|');
  const out = [];
  out.push('---', 'kind: upstream-ledger', `updated: ${stamp}`, '---', '');
  out.push('# Upstream ledger - the trees we already mined, and when we last looked');
  out.push('');
  out.push('One row per mined GitHub repository. Regenerated by');
  out.push('[`scripts/upstream-check.mjs --ledger`](../scripts/upstream-check.mjs); the columns are');
  out.push('derived, and the **Note** column is the only place to write by hand.');
  out.push('');
  out.push('This answers one question in one second: **when did we last look at this tree, and');
  out.push('what did we see?** A repository checked and found unmoved still gets its date moved');
  out.push('forward - without that row, "are we overdue?" is unanswerable. Rows are never');
  out.push('deleted; an archived or retired tree is struck through and dated.');
  out.push('');
  out.push('Eligibility, cadence and the two exclusions are specified in');
  out.push('[`docs/plans/upstream-lane-2026-09-04.md`](../docs/plans/upstream-lane-2026-09-04.md);');
  out.push('the worker contract is [`docs/upstream-brief.md`](../docs/upstream-brief.md).');
  out.push('');
  out.push(`## Eligible (${eligible.length})`);
  out.push('');
  out.push('| repo | tier | pinned | last scanned | last checked | upstream | condition | due | note |');
  out.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const r of eligible) {
    out.push(`| ${cell(r.repo)} | ${r.tier} | ${r.pin ? `\`${r.pin.slice(0, 8)}\`` : '-'} | ${r.minedOn} | ${r.checkedOn || '-'} | ${r.state || '-'} | ${r.conditionState} | ${r.due ? '**yes**' : 'no'} | ${cell((r.reasons || [])[0] || '')} |`);
  }
  out.push('');
  out.push(`## Excluded (${excluded.length})`);
  out.push('');
  out.push('Not a backlog. Each row states why the lane does not own this tree, so the next run');
  out.push('does not re-derive it.');
  out.push('');
  out.push('| repo | last scanned | why |');
  out.push('| --- | --- | --- |');
  for (const r of excluded) out.push(`| ${cell(r.repo)} | ${r.minedOn} | ${cell(r.exclusions.join('; '))} |`);
  out.push('');
  return out.join('\n');
}

function humanTable(rows) {
  const shown = OPT.dueOnly ? rows.filter((r) => r.due) : rows;
  const eligible = rows.filter((r) => r.eligible);
  const due = rows.filter((r) => r.due);
  const pad = (s, n) => String(s ?? '').padEnd(n).slice(0, n);
  console.log('');
  console.log(pad('repo', 38), pad('tier', 4), pad('mined', 11), pad('state', 16), pad('cond', 12), 'due');
  console.log('-'.repeat(96));
  for (const r of shown.sort((a, b) => Number(b.due) - Number(a.due) || a.tier - b.tier || a.repo.localeCompare(b.repo))) {
    console.log(pad(r.repo, 38), pad(r.eligible ? r.tier : '-', 4), pad(r.minedOn, 11),
      pad(r.state || (OPT.offline ? 'not probed' : '-'), 16), pad(r.conditionState || '-', 12), r.due ? 'DUE' : '');
    if (r.due || (OPT.dueOnly && r.reasons.length)) for (const why of r.reasons) console.log(`      ${why}`);
  }
  console.log('');
  console.log(`${rows.length} repositories | ${eligible.length} eligible | ${rows.length - eligible.length} excluded | ${due.length} due`);
  const errs = rows.filter((r) => r.state === 'error');
  if (errs.length) {
    console.log(`\n${errs.length} row(s) could NOT be probed. These are errors, not absences:`);
    for (const r of errs) console.log(`  ${r.repo}: ${r.error}`);
  }
  const risk = rows.filter((r) => r.citationRisk);
  if (risk.length) {
    console.log(`\n${risk.length} row(s) carry CITATION RISK - the corpus cites a commit that moved or vanished:`);
    for (const r of risk) console.log(`  ${r.repo} (${r.state})`);
  }
  if (due.length > 3) console.log(`\nCap: dispatch at most 3 per run and 6 per month. Record the rest as due-and-not-taken.`);
}

// ------------------------------------------------------------------------ main

async function main() {
  if (OPT.selfTest) return selfTest();

  let rows = loadRepos();
  if (OPT.repo) {
    const want = OPT.repo.toLowerCase();
    rows = rows.filter((r) => r.key === want);
    if (!rows.length) { console.error(`No mined source note names ${OPT.repo}.`); process.exit(1); }
  }

  if (!OPT.offline) {
    const targets = rows.filter((r) => r.eligible);
    const queue = targets.slice();
    const workers = Array.from({ length: Math.min(OPT.concurrency, queue.length) }, async () => {
      for (let next = queue.shift(); next; next = queue.shift()) await probe(next);
    });
    await Promise.all(workers);
  }
  for (const r of rows) {
    if (!OPT.offline && r.eligible) r.checkedOn = TODAY.toISOString().slice(0, 10);
    decide(r);
  }

  if (OPT.ledger) {
    fs.writeFileSync(LEDGER, ledgerMarkdown(rows).replace(/\r?\n/g, '\n'), 'utf8');
    console.log(`wrote ${path.relative(ROOT, LEDGER)} (${rows.filter((r) => r.eligible).length} eligible, ${rows.filter((r) => !r.eligible).length} excluded)`);
  }

  if (OPT.json) {
    console.log(JSON.stringify({
      generatedAt: TODAY.toISOString(),
      probed: !OPT.offline,
      floors: FLOOR,
      caps: { perRun: 3, perMonth: 6 },
      totals: {
        repositories: rows.length,
        eligible: rows.filter((r) => r.eligible).length,
        due: rows.filter((r) => r.due).length,
        errors: rows.filter((r) => r.state === 'error').length,
        citationRisk: rows.filter((r) => r.citationRisk).length,
      },
      repositories: rows,
    }, null, 2));
  } else if (!OPT.ledger) {
    humanTable(rows);
  }

  if (OPT.exitCode && rows.some((r) => r.due)) process.exit(3);
}

main().catch((err) => { console.error(err); process.exit(2); });

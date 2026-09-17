#!/usr/bin/env node
// Screen the harvest backlog for PHANTOM rows.
//
// The backlog is enumerated from each source note's untriaged table. A later
// intake run can forge those same candidates into techniques; if it does not
// also update the note, the table stays standing and the next enumeration
// turns already-landed claims into backlog rows. Those rows are phantoms:
// real claims, already in the corpus, waiting to be measured a second time.
//
// Found 2026-09-17, by wave 5 unit 2-001 returning COVERED against a technique
// that had been forged by the very intake run that read its own source note.
//
//   node scripts/backlog-phantom-screen.mjs            # the report
//   node scripts/backlog-phantom-screen.mjs --json     # machine-readable
//
// The screen is NOTE-LEVEL and deliberately over-flags, so it prints a triage
// list and never a verdict. Four discriminators, each one earned by a false
// positive the one before it produced:
//
//   1. Did a commit that ADDED techniques name this note's source slug?
//      Nearly useless alone - it flagged 392 of 929 rows. A note can have some
//      candidates forged and others genuinely untriaged: one source screened
//      positive here AND carried a residual that landed the same day.
//   2. Was the note itself touched at or after that forge commit? A run that
//      forges a note's candidates and writes its counters in the same commit
//      leaves no phantoms. 392 rows -> 48.
//   3. Is the commit a LATER forge, rather than the note's own intake commit or
//      a sibling's? A run is trivially 'after itself', so for a note whose only
//      named commit is its own, the screen is vacuous. 48 rows -> 22, and the
//      two notes it dropped held 1 phantom between 9 rows.
//   4. Is the row's home inside a subject that forge actually created? A forge
//      handoff lands the new subject cluster and leaves the note's cross-subject
//      amendment rows standing - one forge added 30 techniques and covered none
//      of its 4 rows, because all four aimed at other subjects. Reported as a
//      per-row signal rather than a filter, because it is the difference between
//      'read this first' and 'read this last', not between suspect and clean.
//
// Only rows failing BOTH are reported. Verify them by reading; this script
// marks nothing.

import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const JSON_OUT = process.argv.includes('--json');
const LEDGER = 'librarian/harvest/backlog.jsonl';

const git = (...args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } catch {
    return '';
  }
};

// ---- every commit that added a technique, with the files it added ----
function techniqueAdds() {
  const depths = [1, 2, 3, 4, 5].map(
    (d) => `knowledge/${'*/'.repeat(d)}techniques/*.md`,
  );
  const out = git(
    'log', '--diff-filter=A', '--name-only', '--format=COMMIT\t%h\t%ct\t%s', '--', ...depths,
  );
  const adds = [];
  let cur = null;
  for (const line of out.split('\n')) {
    if (line.startsWith('COMMIT\t')) {
      const [, h, ts, ...rest] = line.split('\t');
      cur = { h, ts: Number(ts), subject: rest.join('\t'), paths: [] };
      adds.push(cur);
    } else if (line.trim() && cur) {
      cur.paths.push(line.trim());
    }
  }
  return adds;
}

// A source note is `<date>-<slug>`; the slug is what an intake commit scopes on.
const slugOf = (note) => {
  const m = /^\d{4}-\d{2}-\d{2}-(.+)$/.exec(note);
  return m ? m[1] : null;
};

const forgeCommitsFor = (adds, slug) => {
  if (!slug || slug.length < 4) return [];
  const esc = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`[(\\s:]${esc}[)\\s:,]`, 'i');
  return adds.filter((a) => re.test(a.subject) || a.subject.toLowerCase().startsWith(`intake ${slug}`));
};

/** Third discriminator, and the one that halves the false positives. A commit that
 *  names a slug is one of three things, and only the first is evidence:
 *    (a) a LATER run that forged this note's standing candidates - the phantom maker;
 *    (b) the note's OWN intake commit, which creates the note in the same commit as its
 *        techniques. A run is trivially "after itself", so "the note was never touched
 *        afterwards" says nothing, and the screen is vacuous for that note;
 *    (c) a SIBLING run that mentions the same product and writes a different note.
 *  Told apart by asking which source notes the commit created. Found 2026-09-17 by the
 *  verification sweep: of eight notes screened stale, the four backed only by (b) or (c)
 *  held 4 phantoms across 20 rows, while the four backed by (a) held 22 across 28. */
function forgeKind(hash, note) {
  const out = git('show', '--name-only', '--diff-filter=A', '--format=', hash);
  const created = out.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.startsWith('librarian/sources/'));
  if (!created.length) return 'later-forge';
  if (created.includes(`librarian/sources/${note}.md`)) return 'own-intake';
  return 'sibling-note';
}

/** The subject directories a forge commit actually landed techniques in. A technique
 *  lives at <subject-dir>/techniques/<slug>.md, so the subject dir is the prefix. */
function subjectsTouched(hits) {
  const out = new Set();
  for (const h of hits) {
    for (const f of h.paths) {
      const cut = f.indexOf('/techniques/');
      if (cut > 0) out.add(f.slice(0, cut));
    }
  }
  return out;
}

/** Does this row's home sit inside one of them? The ledger's home field is a bundle
 *  address like `software-engineering/a/b/subject`; the path is `knowledge/<that>`. */
function homeInside(home, subjectDirs) {
  if (!home) return false;
  for (const d of subjectDirs) if (d === 'knowledge/' + home || d.endsWith('/' + home)) return true;
  return false;
}

function noteLastTouched(note) {
  const p = `librarian/sources/${note}.md`;
  const out = git('log', '-1', '--format=%ct\t%h\t%s', '--', p).trim();
  if (!out) return null;
  const [ts, h, ...rest] = out.split('\t');
  return { ts: Number(ts), h, subject: rest.join('\t') };
}

function untriagedCount(note) {
  const p = `librarian/sources/${note}.md`;
  if (!existsSync(p)) return null;
  for (const line of readFileSync(p, 'utf8').split('\n').slice(0, 30)) {
    if (line.startsWith('untriaged:')) {
      const n = Number(line.slice(10).trim());
      return Number.isFinite(n) ? n : null;
    }
  }
  return null;
}

// ---- assert the instrument before trusting a single row of its output ----
// A screen for absent evidence must be shown to fire on a known positive, or a
// clean report means nothing (the registry has written this down twice).
function selfCheck(adds) {
  const fixture = [
    { subject: 'intake(widgetkit): four techniques', h: 'aaaaaaa', ts: 200, paths: ['a.md'] },
    { subject: 'harvest backlog wave 9: unrelated', h: 'bbbbbbb', ts: 300, paths: ['b.md'] },
  ];
  const hit = forgeCommitsFor(fixture, 'widgetkit');
  if (hit.length !== 1 || hit[0].h !== 'aaaaaaa') {
    console.error('self-check FAILED: scoped-subject match did not fire');
    process.exit(2);
  }
  if (forgeCommitsFor(fixture, 'zzzznotasource').length !== 0) {
    console.error('self-check FAILED: a non-source slug matched something');
    process.exit(2);
  }
  // and it must find at least one real forge commit in this repo's history
  if (!adds.some((a) => /^intake[( ]/i.test(a.subject))) {
    console.error('self-check FAILED: no intake commit added a technique - is the pathspec wrong?');
    process.exit(2);
  }
}

function main() {
  const adds = techniqueAdds();
  selfCheck(adds);

  const rows = readFileSync(LEDGER, 'utf8')
    .split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
  const queued = rows.filter((r) => r.status === 'queued');

  const byNote = new Map();
  for (const r of queued) {
    if (!byNote.has(r.note)) byNote.set(r.note, []);
    byNote.get(r.note).push(r);
  }

  const stale = [];
  for (const [note, rs] of byNote) {
    const named = forgeCommitsFor(adds, slugOf(note));
    if (!named.length) continue;
    // Keep only a LATER forge. The note's own intake commit, or a sibling run's, says
    // nothing about whether this note's untriaged table went stale.
    const kinds = new Map(named.map((h) => [h.h, forgeKind(h.h, note)]));
    const hits = named.filter((h) => kinds.get(h.h) === 'later-forge');
    if (!hits.length) continue;
    const touched = noteLastTouched(note);
    if (!touched) continue;
    const lastForge = Math.max(...hits.map((h) => h.ts));
    if (touched.ts >= lastForge) continue; // the forge run updated the note: no phantom
    const subjectDirs = subjectsTouched(hits);
    const inForged = rs.filter((r) => homeInside(r.home, subjectDirs)).map((r) => r.id);
    stale.push({
      note,
      queued_rows: rs.length,
      ids: rs.map((r) => r.id),
      ids_home_in_forged_subject: inForged,
      untriaged_frontmatter: untriagedCount(note),
      techniques_forged: hits.reduce((n, h) => n + h.paths.length, 0),
      forge_commits: hits.map((h) => h.h),
      discarded_commits: named.filter((h) => kinds.get(h.h) !== 'later-forge')
        .map((h) => `${h.h}:${kinds.get(h.h)}`),
      note_last_commit: `${touched.h} ${touched.subject}`,
    });
  }
  stale.sort((a, b) => b.queued_rows - a.queued_rows);
  const total = stale.reduce((n, s) => n + s.queued_rows, 0);

  if (JSON_OUT) {
    process.stdout.write(`${JSON.stringify({ stale, total_rows: total, queued: queued.length }, null, 1)}\n`);
    return;
  }

  if (!stale.length) {
    console.log(`no phantom candidates: every note behind the ${queued.length} queued rows was updated at or after its candidates were forged.`);
    return;
  }
  console.log(`${stale.length} note(s) forged candidates and were never updated afterwards, covering ${total} of ${queued.length} queued rows.`);
  console.log('These are SUSPECTS. Read the forge commit and the corpus before marking anything covered.\n');
  for (const s of stale) {
    console.log(`  ${String(s.queued_rows).padStart(3)} rows | untriaged:${String(s.untriaged_frontmatter ?? '?').padEnd(4)} | ${String(s.techniques_forged).padStart(3)} techniques forged | ${s.note}`);
    console.log(`      forge ${s.forge_commits.join(',')} | note last: ${s.note_last_commit.slice(0, 70)}`);
    console.log(`      ids: ${s.ids.join(',')}`);
    if (s.ids_home_in_forged_subject.length) {
      console.log(`      read first (home is inside a subject this forge created): ${s.ids_home_in_forged_subject.join(',')}`);
    } else {
      console.log('      read last: no row here has its home inside a subject this forge created');
    }
  }
  console.log('\nThe fix is upstream, not here: an intake run that forges a note\'s candidates');
  console.log('updates that note\'s untriaged table in the same commit.');
}

main();

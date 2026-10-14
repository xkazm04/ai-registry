# `--wave <n>` - parallel read-only judges, one writer

Loaded by Phase 3 when the run was invoked with `--wave <n>`. The shape is the one conform
LESSONS 1.8.2 measured in a shared checkout (160 stale verdicts, nine workers, one merge):
**workers judge, one writer merges, one commit records it.** Several agents cannot share one
JSON file, so no worker ever opens `.ai/registry-map.json` for writing. Each writes one run
file; `scripts/merge-conform-runs.mjs` is the only thing that writes the map.

What does not change: each judge keeps conform's own budget of 3-6 pairs. A wave adds
judges, never pairs per judge. `n` is capped at 8; ask for more and the run says it used 8.

The sections below are numbered as SKILL.md Phase 3's wave steps.

## 1. Preconditions - per project, before any worker starts

- The map is **committed**: `git -C <checkout> status --porcelain -- .ai/registry-map.json`
  prints nothing (Phase 1 committed it, or it was clean). A `dirty` project gets no wave -
  the merge rewrites the whole file, and that would write around somebody's edit. Say so in
  the report and fall back to nothing for that project; do not run a single judge either.
- `.ai/conform-detail.json` is clean too (`git status --porcelain` on it prints nothing): the
  merge rewrites it, so a modified one is the same reason for no wave.
- No live merge: `.ai/conform-runs/.merge.lock` is absent, or the merge will wait on it. Never
  delete that lock; merge-conform-runs breaks a dead holder's lock itself.
- Record whether `.ai/conform-detail.json` and `.ai/conform-runs/merged/` are **tracked**
  (`git -C <checkout> ls-files -- .ai/conform-detail.json .ai/conform-runs/merged`). The merge
  writes both; section 9 commits them only when the project already tracks them.

## 2. The work list - truncate, then deal

Candidates come from the rebuilt map in the **debt table's order**: Phase 2's ranking, and
within one row the pairs whose context code changed in git since the verdict's `evaluatedAt`
first; then pairs on contexts with `arrived: true`; `priorNotApplicable` pairs last within each
group. When there are more than `6 x n`, keep the first `6 x n` and **drop from the tail** -
the dropped pairs are the next run's starting point, listed in the report.

Deal the kept pairs:

- Group them **by subject** - a judge reads one golden path once and applies it to every
  context it governs here.
- Deal the subject groups **round-robin** in list order, each worker taking the next whole
  group while it stays at or under 6 pairs. A subject stays with one worker wherever its
  group fits; only a group larger than the room any worker has left splits, and two workers
  reading one golden path is then the cost of keeping each judge's budget honest.
- A worker with fewer than 3 pairs is fine when the list ran out; do not pad it.

Worker ids: `straighten-<YYYYMMDD>T<HHMM>-<slug>-w<i>` (UTC). The id is the run file's name,
so a later wave never collides with an archived file of the same name. **Write the dealt
slices down** (id -> pairs) before spawning: section 4's resume reads them.

Orphans are **not** dealt to workers: the merge never adds or moves a pair, so adopting an
orphan is the single writer's act, section 7.

## 3. Workers - the brief

Spawn all `n` workers in one message, so they run concurrently. Each gets the brief below
with its own slice filled in. A worker is read-only on everything except its one file.

```text
You are a read-only /conform judge for project <slug> at <checkout>.
Method: <registry>/skills/conform/SKILL.md, sections 2 and 3 only (read the governing golden
path and the techniques whose use_when applies, then the context's real code, then judge).
Your pairs (context id | context name | bundle | subject | stale? | prior verdict):
<one line per pair>

Rules:
- Do NOT edit .ai/registry-map.json, .ai/conform-detail.json or .ai/consults.jsonl. Do not
  commit, stage, stash, switch branches or write any other file. Do not write the
  rkb-run-result file of conform section 5.
- The prior verdict is a lead, not an answer: re-read the code it anchors.
- Read each subject's current digest and revision in <registry>/knowledge/<bundle>/index.json
  for your own reading - the golden path you judge against is that version. Do not put them
  in the run file; the merge stamps them from the same index.
- Evidence is one line: "<repo-relative path>:<line> <consequence>". The path uses forward
  slashes and no brackets or spaces (the merge's anchor floor cannot read those); anchor on a
  line that exists and is not blank, or the merge skips the verdict.
- List in techniques[] every technique you judged - at least half the subject's techniques
  for every verdict, not only the conformant ones. The merge keeps a technique you leave out
  only as `carriedFrom: <its older date>`, so an unjudged technique reads as inherited, not
  current.
- Uncertain is "unknown"; put it in declined[] with the reason instead of guessing.
- Write exactly one file, whole, in one write:
  <checkout>/.ai/conform-runs/<worker-id>.json
  in the conform-run/1 shape below. Then reply with the file path and one line per pair.
```

The run file (the contract `scripts/merge-conform-runs.mjs` reads):

```json
{
  "schema": "conform-run/1",
  "worker": "<worker-id>",
  "evaluatedAt": "<ISO timestamp, UTC>",
  "pairs": [
    { "context": "<context id from the map>", "subject": "<slug>", "bundle": "<bundle>",
      "state": "conformant|deviation|not-applicable",
      "evidence": "<path>:<line> <consequence>",
      "techniques": [{ "technique": "<slug>", "verdict": "conformant|deviation|not-applicable", "evidence": "<path>:<line>" }],
      "registryProposal": "<optional: a registry finding, one sentence>" }
  ],
  "declined": [{ "subject": "<slug>", "context": "<context id>", "reason": "<why left unjudged>" }],
  "consults": [{ "ts": "<ISO>", "bundle": "<bundle>", "subjects": ["<slug>"], "techniques": ["<slug>"], "deviations": 0 }]
}
```

`context` is the map's `context` key (an id or a `group/name` string). One consult object per
**pair**, single subject each - the signals collector credits deviations only from
single-subject lines. A file without `evaluatedAt` is skipped by the merge, and a file that is
not JSON yet is left for the next merge.

## 4. Collect - and resume an interrupted wave

When every worker has answered:

1. Each expected file exists, parses, and covers every pair dealt to it (judged in `pairs[]`
   or explained in `declined[]`). A worker that wrote nothing is a decline for all its pairs;
   say so, do not re-run it inside this wave.
2. Spot-check one anchor per worker by printing the line it cites
   (`sed -n '<line>p' <checkout>/<path>`) and reading it against the evidence. A line that
   does not say what the evidence claims removes that file from the merge (`--only` without
   it) and is reported.

**A wave interrupted before the merge resumes from disk** (a session limit, a crash, a worker
that stopped mid-reply). For each dealt worker id from section 2:

- a run file that parses and covers every dealt pair is **complete** - spot-check **all** its
  anchors, not one, since its print-back may not have finished and nobody has read it;
- a missing or partial file is re-spawned with the **same** worker id and the same slice;
- never re-spawn a worker whose file is complete - a second judge on the same pairs is a
  second, unordered verdict.

Then merge with `--only` naming all the ids, as below.

## 5. Merge - once, as the only writer

Dry run, then the real merge, always naming this wave's files:

```sh
node <registry>/scripts/merge-conform-runs.mjs <checkout> --dry --only <w1>.json,<w2>.json
node <registry>/scripts/merge-conform-runs.mjs <checkout> --only <w1>.json,<w2>.json --wait-lock-ms 60000
```

Read the funnel: merged, unchanged, older, skipped (with reasons), declined, conflicts. Exit 3
means a live merger holds the lock: wait and run the same command again. Exit 2 is a stop for
this project. Never merge without `--only` - pending files from another session are theirs.

## 6. Verify - the 1.8.2 check

Every row the wave merged carries the subject's own digest and its revision, `stale` cleared:

```sh
node ${CLAUDE_SKILL_DIR}/scripts/map-state.mjs verify-merge --checkout <checkout> --runs <w1>.json,<w2>.json
```

Exit 0 is the pass. Exit 1 names the rows (`wrongDigest`, `missingRevision`, `stillStale`): do
**not** commit, report the merge writer as the defect (a registry finding), and leave the map as
merged - `merge-conform-runs.mjs --reapply` can restore it later. `notApplied` lists verdicts
the map does not hold (skipped by the anchor floor or older than the map's); match them
against the funnel's skipped list.

**Same-day reaffirmation.** A verdict whose state and evidence equal the row's, dated the same
day, is re-stamped against the current subject and its `stale` flag cleared; the funnel counts
it `reaffirmed`, not `merged` (merge-conform-runs since 2026-10-14). A replay of an
already-merged file still finds the row current and changes nothing. A `stillStale` row after
the merge therefore means a real problem - read it against the funnel's skipped list.

## 7. Orphans - the single writer, after the merge

Run conform's Orphans step on the map's `orphans[]` yourself, now that no merge is running:
adopt into the context the orphan's **evidence anchors** now live under (`source: "conform"`,
`adoptedFrom`, the current digest from the index - never the orphan's own), or leave it. A
stale adopted pair is re-judged by you, in this step, within one more 3-6 pair budget. Never
hand-delete an orphan. **Without an operator, leave.**

## 8. Rebuild and count

The merge writes rows and never the header: `stats.staleVerdicts` and `staleSubjects` still say
what the builder last counted, and `converge.mjs --only report` reads the header. So:

```sh
node <registry>/scripts/build-registry-map.mjs --project <slug>
```

The rebuild carries every verdict field the merge wrote (`state`, `evidence`, `evaluatedAt`,
`evaluatedAgainst`, `evaluatedRevision`) and recomputes `stale` against the current digests,
so a merged verdict stays merged. Then count `stale: true` rows yourself (rows, plus pairs
under `orphans[]` reported separately) and check that `stats.staleVerdicts` agrees. That count,
not the header you started from, is the **after** column.

## 9. Commit - one, pathspec, in the project

```sh
git -C <checkout> diff --cached --name-only
git -C <checkout> diff --numstat -- .ai/registry-map.json
git -C <checkout> diff --numstat --ignore-cr-at-eol -- .ai/registry-map.json
```

The first shows what a sibling has staged (leave it staged; the pathspec commit below does not
take it). The two numstat lines must agree - when they differ, the commit would rewrite line
endings, so stop for this project and report it.

Paths: always `.ai/registry-map.json`. Add `.ai/conform-detail.json` and this wave's archived
run files (`.ai/conform-runs/merged/<worker-id>.json`, or the `<worker-id>.<hash>.json` name the
merge printed) **only** when section 1 found the project tracking them. `.ai/consults.jsonl` is
appended by the merge and never committed here - it may carry a sibling's lines.

```sh
git -C <checkout> add -- .ai/conform-runs/merged/<w1>.json .ai/conform-runs/merged/<w2>.json
git -C <checkout> commit -m "chore(registry-map): straighten <k> stale verdict(s) in a <n>-judge wave, <m> orphan(s) adopted" -- .ai/registry-map.json .ai/conform-detail.json .ai/conform-runs/merged/<w1>.json .ai/conform-runs/merged/<w2>.json
git -C <checkout> show --stat HEAD
```

The `add` line exists only for untracked archive files (a pathspec commit cannot name a path git
has never seen); skip it, and the extra paths, when the project does not track them. The `show
--stat` must list nothing but the named paths.

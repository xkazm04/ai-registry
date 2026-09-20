# Lessons - conform

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-08-23 - ascent (the first run)

- **Selecting the work found a defect in the map before any code was read, and that is the
  order paying off.** The candidate list showed `test-harness` as a top match on 33 of 52
  contexts. It is a matcher artifact - every context's file list carries `*.test.ts`, so
  `test` is rare among SUBJECTS (high IDF) and near-universal among CONTEXTS, and IDF over
  one side of a join cannot see the other. Fixed in the generator by weighting both sides;
  the most-matched subject fell from 63% of contexts to 15%. **Look at the map before
  spending the expensive pass on it** - the cheap step is the one that protects the costly one.
- **A deliberately doubtful pair was the most valuable of the five.** `cicd-monitoring` was
  dispatched against a "Provider Integrations" context precisely because the strong score
  looked wrong. It came back `not-applicable` with the subject's own boundary statement
  quoted, the failing precondition named, and the subject that SHOULD govern identified
  (`connector-catalog`) with a technique-by-technique mapping. Brief at least one doubtful
  pair per run and say in the brief that refusing it is a first-class answer; a reader told
  only to find deviations will find them.
- **Lexical matching misses silently, and the miss is invisible without a reader.**
  `connector-catalog` - the correct subject - scored ZERO on that context and appeared
  nowhere in the map, while five wrong subjects ranked strong. The repo says
  provider/integration; the subject says connector/catalog/adapter. Word overlap cannot see
  a concept under a different name. Applied in 1.1.0: a corrected pairing is written back
  with `source: "conform"` and the generator carries it forward, so the map LEARNS what the
  matcher cannot compute.
- **"Strong" was relative to the leader, so a context nothing matched well reported five
  strong subjects.** The confidence band now also requires the context's own leader to reach
  the project median. Strong pairs in that project fell from a flat wall to 31 of 179 - a
  set worth prioritising rather than a label on everything.
- **A technique-shaped resonance is not a subject match.** The context genuinely realizes
  `provider-capability-honesty` (declared capabilities, absent capability = absent
  affordance, an honest "not reported" instead of a fabricated zero) - but that technique
  lives inside a subject whose precondition (watching something you do not own, over time)
  the context fails. Route by the golden path's stated precondition, not by vocabulary.

## 1.1.0 - 2026-08-23 - twelve pairs across five repos (the second wave)

- **Eight of eleven deviations were at a boundary the technique never mentions.** The
  mechanism a technique asks for was present, well built and incident-commented in nearly
  every case; it stopped at the edge of the module that owned it - a wire projection that
  keeps the prose and drops the codes, an export seam that drops the caveats, an error
  branch that falls back to the default bar, a process split that turns redrive into
  duplication. kp named the corollary: **the extraction boundary, not the claim's
  importance, predicts which numbers are honest.** ascent showed the purest form - one
  sensor refusing to derive a confident false negative from a failed read, its neighbour
  in the same pipeline spelling the identical failure as an empty success. When a pattern
  recurs under eight techniques in four bundles, the finding is about the corpus's shape,
  not about the repos. Recorded as a forge lead in [[2026-08-23-6]].
- **Brief the doubt, but require the premise to be TESTED, not honored.** Both pairs
  briefed as probably-not-applicable came back governed, and in both cases the test was
  the finding: one reader traced a dispatch proxy to prove the surface was not a mock
  before judging it, the other read the golden path's object definition and the bundle's
  transplant-clean clause to establish that taxonomy location is not a boundary. A
  `not-applicable` on either would have silently retired a live surface. The 1.1.0 rule
  ("say in the brief that refusing is a first-class answer") is right and incomplete: the
  flag is a hypothesis handed to the reader, and the brief must ask for it to be falsified
  either way.
- **A conformance finding can overstate its reach, and that is the same defect class as an
  instrument bug.** One reader reported that defect codes "reach no route or component";
  they reach two. Verified before recording and narrowed to the lane it is true of. An
  overstated finding cannot be falsified by the next reader - it just gets re-found as a
  contradiction, exactly like a miscounted coverage gap.
- Judging a bundle against the repo it was forged FROM works, but only with the brief
  saying so: both `recruiting` and `game-production` returned deviations against their own
  origin repo, because a technique describing what a repo used to do is not conformance.

- **The wave's own verdicts are a backtest, and they refuted the fix every worker
  proposed.** After the 2026-08-31 wave the fleet held 287 labelled pairs. A
  `not-applicable` IS the matcher's error and `conformant`/`deviation` are both its
  successes, so the set grades matcher changes directly. Ten workers had independently
  proposed down-weighting the polysemous tokens (`vault`, `eval`, the bare `matrix` that
  scored 324). Measured, every variant traded about ONE real governance pair for ONE bad
  pair — a scaffolding stoplist, a path-weight cut, an ambiguity penalty, all three
  together, and dropping lexical-only outright (which cost a sixth of everything the
  matcher correctly found). The tokens are polysemous *and* they are how the right pairs
  are found. What worked instead was the verdicts themselves: "this subject already has
  >= 2 not-applicable verdicts in this project, and more not-applicable than governed"
  predicts the next one at 69% precision / 57% recall — better than 2:1 where every token
  fix was 1:1. **A skill that accumulates judgments eventually holds the data to grade its
  own instrument; reach for that before reaching for a heuristic.**
- **A ranking hint must never become a verdict.** `priorNotApplicable` ships as a
  deprioritization, not a filter: the pair is still emitted and still judgeable, and a
  `conformant` verdict weakens the prior that produced it. The failure mode to guard is a
  reader writing an unread `not-applicable` *because the map suggested one* — that poisons
  the exact tally the next run trusts, and unlike a dropped pair it looks like evidence.
- **Priming a worker toward a pattern will get you the pattern.** Three briefs in the
  2026-08-31 wave suggested that N contexts failing one subject "probably share one root
  cause — one fix, not N." All three came back split: four `fleet-orchestration` contexts
  had four different answers, the `settings` triple was two not-applicable plus one
  conformant, and `browser-credential-boundary` turned out not to apply because that repo
  routes all data through a server-only client. Every one of those refusals was correct
  and the tidier answer would have been wrong. State the hypothesis, ask for it to be
  falsified, and say plainly that splitting it is a first-class result.

## 1.4.2 - 2026-09-09 - ai-registry

- Architecture review: the shared reflection clause assumed a writable registry link in every installation. Replaced that assumption with installation-aware scope and explicit adoption. This records an instruction audit, not a field effectiveness result.

## 1.5.0 - 2026-09-17 - skillbench

Benchmark of 414 judged runs; ~25 verdicts faulted anchors and ~16 faulted `not-applicable`
evidence the skill did not ask for. Applied in 1.6.0.

- **Ambiguity about committing cost runs their keep vote.** 26 verdicts complained the map was
  left uncommitted and **13 keep=False verdicts named "no commits to merge" as the only
  blocker**, while other judges wrote that the skill does not require a commit - the two
  readings together are the defect. The map edit is the deliverable, so the skill now names the
  default: one path-scoped `conform: <n> verdicts on <context>` commit, your paths only when
  another session's work is in the tree.
- **The date cutoff invited the rebuild it was meant to prevent.** The rule allowed rebuilding a
  missing map or one predating 2026-09-02. Six rebuilds happened across three effort levels: on
  tracklight (a map by an older builder, `contextKey: null`) *and* on kp, whose map was dated
  2026-09-14, after the cutoff - that one "added 628 pairs and turned every verdict into an
  orphan". A rule stated as a date gets read as permission. Restated positively: a run never
  regenerates an existing map; when the builder or the bundle digests lag, judge the pairs that
  are there and report the lag with the command that fixes it.
- **"At least the load-bearing ones" is not a floor.** ~8 verdicts faulted thin `conformant`
  evidence and one faulted the opposite (reading all 70 techniques), which is what an
  uncountable bar produces. Now: list the techniques judged, anchor every one claimed realized,
  and a verdict citing fewer than half its techniques is `unknown`.
- **A rubric/skill mismatch, not a run defect.** ~16 verdicts faulted `not-applicable` for
  missing `file:line` - which the skill explicitly did not require. Judges are right: an
  unanchored precondition cannot be falsified. `not-applicable` now names the precondition AND
  anchors the absence.
- **`file:line` was demanded without saying from where.** ~116 verdicts across the corpus fault
  an anchor that did not resolve, clustering in multi-crate repos where `compare.rs:270` is
  ambiguous. Spelled out: repo-root-relative as `git ls-files` prints it; a basename is not an
  anchor.

## 1.7.0 - 2026-09-20 - nine repos, one subject (the table wave)

Nine `/conform` runs on one subject across the fleet, in parallel, on a shared machine with
live sibling sessions. Three corrections landed in the skill; the rest is what the wave saw.

- **A pathspec on `git add` does not scope a commit.** The skill said to stage the map by
  explicit path, "never `-A`". One run did exactly that, then ran `git commit -F msg` with no
  pathspec — which commits the whole INDEX — and swept a sibling's pre-staged file. It caught
  the sweep in the commit output and recovered with `git reset --soft HEAD~1` plus a pathspec
  commit. In the same wave a second repository was holding **sixty-five** staged files from
  another session's live feature branch, so the blast radius was already there. Now stated on
  the commit, with the recovery.
- **"Copy the pair's `digest` verbatim" can stamp a verdict against a document nobody read.**
  Five maps were rebuilt at 14:35 and a technique landed in the subject the same afternoon, so
  every pair read revision 4 while every reader read revision 5. Four runs independently took
  the digest from the registry index instead and said so. Now the stated rule, with the pair's
  copy as the fallback.
- **A subject that scored zero and a surface that should not carry it are indistinguishable
  from the map.** The correction for the first is the mistake for the second. Reading the
  golden path's "when NOT to use this" section before adding a zero-scored pair stopped four
  unearned pairings on card grids and a log feed in one repo, a four-card deck in another, and
  a whole repository in a third — where the honest output was *no pairing at all*, because the
  grid's cells across a row are different records, which is the inverse of a column model.
- **The scorer, not the diction.** `table` scored zero on a context named
  `display-table-primitives` whose paths are `UnifiedTable.tsx`/`SortableHeader.tsx`/
  `DataGrid.tsx`, and zero on a context whose own tracked catalog says the word eleven times.
  In the first, "table" appeared in the *`why` list of the top-scoring pair* — a different
  subject matched partly on the word, while the subject named `table` scored nothing. Two
  repos, same zero, opposite vocabularies.
- **Context-map gaps sit upstream of matcher gaps and are invisible in the map's stats.**
  Three repos had table-bearing files in **no context's `paths` at all** (33 `<table>` files
  with one paired context; 31 files with several directories uncontexted; an entire
  `views/modules/**` tree absent). `stats.contextsWithMissingPaths` measures the other
  direction, so nothing in the map reports it. A `/conform` run can only judge what the
  context map reaches.
- **A brief's premise is a hypothesis.** Two runs were handed starting points drawn from an
  earlier sweep and refuted them from the code: five "bespoke paginations re-deriving a shared
  table" turned out to be four card grids plus a list, around a shared component that never had
  the axes to bypass; two "near-duplicate table modules" were per-record edit forms. Both added
  no pairing and said why. A conform run that cannot contradict its brief is not judging.
- **`git grep '<table'` is not how you find tables.** The golden path explicitly sanctions a
  CSS grid carrying `role="table"/"row"/"columnheader"/"cell"`, and in one repo the LARGEST
  table in the tree was exactly that - the element grep returned 13 files and silently
  excluded it, so the brief's first-named candidate would have come back "no table surface
  here". Every `<table>` count this wave produced is therefore a lower bound. Grep the ARIA
  roles as well as the element.
- **A repo may already hold a conformance record that your verdicts contradict.** One project
  carries a 416-line `.ai/registry-conformance.md` from an earlier audit tallying
  `table: deviations=0`; this run found four. The run correctly did not edit it - it belongs
  to a different process - but a verdict that silently disagrees with a committed record is a
  second source of truth. Say so in the report when you find one.
- **Hand-edited derived fields.** One run incremented `stats.pairs` and extended
  `subjectIndex` so the header would not contradict the body, and flagged it. The generator
  owns both and recomputes them; leaving them stale for one build is cheaper than a silent
  hand-maintained derived value. Left as-is, recorded here.

## 1.7.0 - 2026-09-20 - gravitone (unscoped run, first verdicts in the repo)

- **A proxy layer draws the subject its upstream owns, and the correction has two halves.**
  `job-coordination` matched the BFF route folder at 545 because the paths say job/route/probe;
  every file there forwards to the service and owns no record, so the pair is `not-applicable`.
  The same subject scored *nothing* on the context that holds `JOBS`, the persisted state
  mirror, the claim and the owner heartbeat - that context's vocabulary is scan/stem/speaker.
  Writing only the not-applicable would have left the subject unpaired in the repo that
  realizes it best. Do both in one move: refuse the resonant pair, and add the pair on the
  context whose precondition actually holds.
- **Where the enforcement lives decides the evidence floor.** Three of this run's pairs govern
  a client or a proxy while the subject's techniques are mostly server-side; the honest
  outcomes are a `deviation` on the technique that does land there or an argued
  `not-applicable`, never a `conformant` assembled from the half the context can reach.
- **Five pairs, five digests, zero disagreement.** The map was rebuilt at 14:35 and § 4's
  fallback never fired - every pair digest equalled the registry index's. Worth reporting
  either way, because "they agreed" is the evidence that the check ran.

## 1.7.0 - 2026-09-20 - the unscoped wave (four never-judged repos)

Consolidated by the director from six runs on projects with no prior verdicts. The
per-project entries above stand; this is what only shows up across them.

- **The matcher pairs a subject to the layer that TALKS ABOUT the thing, not the layer that
  IS it.** Three independent sightings in one afternoon. `job-coordination` scored 545 on a
  BFF route folder that forwards every call upstream and **zero** on the context holding the
  job table, the claim and the owner heartbeat. `mcp-tools` was matched to seventeen of one
  repo's forty-six contexts and to **none** of the code under `crates/server/src/mcp/`,
  which is in no context at all. In a third repo the same subject was the densest unjudged
  strong pair in the map. The mechanism is that a proxy's vocabulary is the domain's
  vocabulary — route, job, probe, request — while an implementation's vocabulary is its
  own nouns. So the correction has two halves and doing one is worse than doing neither:
  refuse the resonant pair with an argued `not-applicable`, **and** add the pair on the
  context whose precondition actually holds.
- **A repo's consult ledger is not a proxy for its map's `state`.** One project's
  `.ai/consults.jsonl` held 2026-09-07 reads of two subjects the map reported as never
  tested. A run that skips a pair because the ledger shows a consult skips exactly the pairs
  worth reading: a consult is a read, a state is a verdict, and nothing joins them.
- **Re-measure a number the brief hands you.** A coordinator's fleet summary told one worker
  its repo was at 43% context coverage; it measured 89% of non-test source declared and said
  so, and the coordinator's instrument was wrong — it had counted test files in a denominator
  no context map ever fills. A per-project worker is the only reader positioned to catch a
  fleet-level statistic that is wrong about one project.
- **`not-applicable` is the honest verdict far more often than the wave expected**, and its
  quality depends entirely on naming the precondition rather than the absence. "This context
  is a proxy and the subject begins at a durable record" is a verdict; "no job code here" is
  a shrug.
- **Nine parallel workers share one scratchpad directory.** Four of them reported a sibling
  overwriting a script at the same generic filename mid-run. Nothing was lost because each
  had already executed, but a worker that writes a file and reads it back in a later call
  will read another project's data. Name per-project scratch files.

## 1.7.1 - 2026-09-20 - goat (the anchor check)

- **"An anchor that does not resolve is not evidence" is the wrong test, because a blank
  line resolves.** Four of twenty-three anchors in one run first landed on a blank line, a
  `*/`, or the line above the construct — recorded as the line the author had scrolled to
  rather than the line the construct is on. Every one of them passed a resolve check. The
  run caught them only by printing each anchor back with `sed -n`. §3 now says to do that,
  and states the real test: not that the line exists, but that it says what the evidence
  claims.

## 1.7.2 - 2026-09-20 - gravity (a merge promotes the flattering verdict)

- **Two contexts that merge bring both their verdicts, and one wins silently.** A
  `conformant` and a contradicting `deviation` on the same subject collided when
  `production-phases` merged into `frames-score-cut`; the `conformant` was carried onto the
  merged context and the `deviation` was orphaned. Neither `staleVerdicts` nor
  `orphanedVerdicts` can flag this, because each row is individually ordinary. The orphaned
  verdict was the true one and the defect was still live four weeks later — two time
  authorities on one timeline. §1 now says to check `orphans[]` for the same subject when a
  context's paths have grown.
- **The twelve-path sample is not merely misleading, it changes verdicts.** In one repo the
  only anchor for a surviving deviation was outside the sample in three separate contexts.
  A judge reading the map's `paths` alone returns `conformant` on all three. §2 now sends
  the reader to the project's own `context-map.json`.
- **A verdict that names a BUNDLE digest cannot say what it read.** Five of six stale
  verdicts in this repo recorded the same `evaluatedAgainst` for five different subjects —
  the media-generation bundle digest as of the day they were written. That is why the
  project looked maximally stale; the verdicts were not wrong, they were unattributable.
- **The loop closed, visibly.** Three August deviations were repaired before this re-judge,
  and one repair's commit trailer cites the conformance lens by name — the verdict caused
  the fix. Re-judging stale pairs is not bookkeeping.

# Scorecard - intake

One row per run. The five stages are the pipeline this skill exists to master:
**research -> extract -> test -> apply -> ship.** `apply` is written as
`<code>c/<experiment>e/<simulation>s`. A zero in `apply` or `ship` carries its reason
in the last column. After appending, read the last ten rows and name the stage the
funnel loses most at under the table; that stage is the next run's declared focus.

| Version | Date | Source | Research | Extract | Test | Landed | Apply | Ship | Zero reason / focus moved? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.15.0 | 2026-08-29 | ai-native-sdlc-and-ci-on-call | 2 | 15 | 8 | 5 | 0c/0e/0s | 0 | Phase 7.5 did not exist; run landed five and applied none. Backfill owed: `oracle-frozen-during-repair`, and the four amendments. |
| 1.0.0 | 2026-08-29 | apply wave 1 (backtest deviations, personas + gravity) | 0 (no source - apply-only run) | 0 | 0 | 0 | 24c/4e/1s | 23 of 24 branches merged (same day, director-reviewed diff + project gates: tsc, 188 vitest, 312 playwright-node) | First run of the apply lane. 29 rows: 27 better / 1 not-better / 1 unmeasurable. One branch held: its gate is deliberately red until a repair lands. |
| 1.1.0 | 2026-08-30 | tesana-loop-mode-game-builds | 1 | 13 | 1 | 1 | 0c/1e/0s | 0 (record-only commit in pof) | Ship 0: the `better` change touches three harness files and the gate that would see it (visual-check) cannot start on this machine, so it is filed as the project's next change rather than committed unpaired. First end-to-end `/intake <url>` run since the apply lane landed: research -> extract -> test -> apply all converted on one source. |
| 1.1.0 | 2026-08-30 | headlong-agent-microharness | 1 | 8 | 2 | 2 | 0c/0e/2s | 0 (record-only commit in ascent) | Ship 0: both simulations - the B arms need the production episode/turn store, which no local gate can see (declared focus 'start the gate first' was checked and failed honestly: vitest/tsc cannot observe spend cadence or history reach). One not-better verdict fed its condition back into the technique - the apply stage producing corpus content is the lane working as designed. |
| 1.2.0 | 2026-08-30 | operator-control-plane | 1 | 22 | 5 | 5 | 1e/0c/0s (4 unapplied, no seam) | 0 (fix filed, not shipped - triage pick named no project, so Phase 8 confirmation was never given) | **Declared focus hit.** Previous row's focus was 'pick the seam by instrument reachability first': `prose-rule-drift` -> ascent chose a seam whose instrument is IN the tree (a checker in the shared tooling lane, locally runnable, no production state) and it converted first try - arm A 0 violations, arm B **27 across four projects**, one invocation apart. Ship is still 0, but for the first time not because the instrument was unreachable: the change is a one-line gate wiring in someone else's repo and the operator has not confirmed the lane. **The run's largest output was a method fix, not content**: the source was triaged off 2,639 words of rendered landing page over a 168,969-word tree, the operator caught it, and SKILL.md 1.2.0 now requires a repository source to be mined from a clone (Phase 2b). Fourteen past repo sources audited by the new tell; three had the defect; two re-runs dispatched and both returned - one **refuted a prior run's accepted finding at its premise**. |
| 1.2.0 | 2026-08-31 | tigerbeetle | 1 (421 landing / 111,264 in-tree = 0.4% read fraction, recorded) | 15 | 4 | 1 | 0c/0e/1s | 0 (project edit never confirmed; operator steered the run to diagnosis) | **Declared focus hit**: the previous row asked that a repository source record its read fraction, and this row carries it. Landed 1 of 15 by operator choice, not by yield - the run's largest output was a corpus finding. First triage returned twelve process rows and **zero architecture rows from a database**; the operator rejected the framing and the audit found a **construction frontier** the bundle has never stated: it builds at the application layer and consumes everything below. Two method defects named - Phase 2b's operating-document examples are all process-flavored (I opened TIGER_STYLE.md and skipped ARCHITECTURE.md, the largest doc in the tree), and the strip test is biased toward process because architecture claims arrive wrapped in domain terms that read as proper nouns. |

## Weakest stage, as of the latest row

**research** - with 23 of 24 branches merged the apply and ship stages both convert,
and the wave that produced them consumed no external source at all: it ran on the
backtest's deviations. The funnel's front is now the one not being fed - the next run
should be a real `/intake <url>` whose landings are applied in the same run, so the
whole pipeline is exercised end to end rather than in two halves. Secondary, unchanged:
every Rust seam fell to experiment or simulation for want of a warm cargo gate.

**ship** (2026-08-30 second reading) - ship is still the losing stage, and two
consecutive runs now name the same cause with different faces: the B arm's
instrument lives in production state (a recorded-run store, an episode store)
that no locally startable gate can reach. The corrective is not "start the gate"
- it is to prefer, at Phase 7.5 seam selection, a seam whose instrument is IN
the tree (a fixture, a recorded log, a replayable script) over a sharper seam
whose instrument is remote. Next run's declared focus: pick the seam by
instrument reachability first, effect size second, and record the trade.

**apply/ship (2026-08-30 third reading)** - the seam-reachability corrective
worked and should be kept: one `experiment` row converted on the first attempt
because its instrument was a script in the tree rather than a store in
production. Ship remains 0 for a **different** reason than the last two runs -
not an unreachable instrument but an unconfirmed lane, which is a cheaper
blocker and one only the operator can clear.

The stage the funnel is now losing most at is **extract**, and this run makes the
mechanism visible for the first time. Fifteen candidates reached the table and every
one was process; the source's densest document was never opened, and the eight
architecture claims that eventually surfaced did so only because the operator rejected
the triage. Extract is not losing rows to carelessness - it is losing a whole *class* of
row, silently, because two filters compound: Phase 2b's operating-document examples read
as process, and the strip test reads domain vocabulary as proper nouns. Neither failure
produces a declined row, so neither is visible in any count.
| 1.3.0 | 2026-08-31 | genesis-agi | 1 | 13 | 3 | 3 | 0c/3e/0s | 0 (no project confirmed) | Ship 0: operator directive named a focus, not a project, and Phase 8 step 2 gates any project-tree write - so a real reachable defect found in goat with a paired measurement is filed, not fixed, and the three seam records are owed. Declared focus MET: the source note names opened and unopened documents by name, and the honest sample is ~15% of the memory subsystem with the two largest files skipped. First run where BOTH `better` verdicts amended the corpus from the A/B tree rather than the source - the apply stage acting as a second source, not a checkbox. |
| 1.3.0 | 2026-08-31 | claude-of-tanks-geometry-gate | 1 (26,981 landing / ~60,000+ in-tree operating docs = 31% read fraction, recorded) | 14 | 5 | 5 (1 new subject + 6 techniques as one landing) | 0c/1e/0s (5 unapplied: landed same-run, apply budget went to the one technique with a reachable seam) | 0 (no project confirmed; the experiment was read-only and warranted no change - verdict was not-better) | **Highest-yield source class the ledger holds so far**: a contract document whose sections are numbered AND carry the owner-directive date plus the incident that caused them - the release-walkthrough property in repository form. Thirteen dated addenda produced four of six techniques. Two class tells recorded for reuse: read the POSTMORTEM before the lessons file for correction-class findings (the lessons file is written from the winning side, the postmortem from the losing one, and it produced both strongest leads); and a dated-addendum contract outranks the README by an order of magnitude. The subject came from the **enumeration hunt, not the source** - `generated-mesh-acceptance` declares its own boundary in prose and nothing owned the other side, which the bundle's motion-vs-geometry asymmetry confirmed. Placement overrode both Phase 4's HOME IF NEW and my own instinct: `asset-production` sits at exactly the 10-directory cap, so the taxonomy authority, not a subject count, decided the home. Apply produced corpus content again: the `not-better` fired the technique's OWN third decision rule against me - my arm B read the same representation with a different parser, so its two catches were parser artifacts. The technique gained `a different parser is not a different authority`. Ship 0 is honest here rather than blocked: a not-better verdict warrants no project change. |
| 1.3.0 | 2026-08-31 | archify | 1 | 16 | 12 | 1/9 rows (0c/1e/0s) | 0 (no project confirmed) | Declared focus was **ship**; NOT met, and the row names the cost precisely as the last scorecard demanded. The one sentence that would have unblocked it: *"yes, apply the three-state detector change to politicas."* What DID move: the seam record the previous run listed as owed is now written to the project's `.ai/applied.jsonl` - first run to do so - though uncommitted, so ship stays 0 honestly rather than by redefinition. Apply reached `better` via a two-arm harness over shipped code with the amendment's safety property measured (detection unchanged), and the **structural fact outranked the A/B**: the target's report has no skipped record type, so the defect is forced by the record shape rather than chosen. Extract 16 from a tree whose landing page is 1.6% of it - the clone was the run. Two citation errors caught by Phase 8's open-one-cited-line (three of five line numbers off, because the same guard text appears in two functions), and the A/B harness reproduced the very defect it was testing, which arm A could not have revealed and arm B did on the first run. |
| 1.3.0 | 2026-08-31 | herdr (re-run, Rust/backend lens) | 1 (3,304 AGENTS.md + justfile + 200-line arch test vs 420 README) | 9 | 3 | 4 (2 techniques + 2 amendments) | 1e/0c/0s (1 unapplied: no seam in fleet) | 0 (verdict was not-better - nothing to ship) | Ship 0 is **correct here, not a miss**: the A/B returned `not-better` because the consumer already satisfies the rule, so there is no change to commit. Declared focus was extract; met - a re-run of an already-mined tree under an orthogonal lens produced 3 landings entirely from the prior run's untriaged table, at zero re-derivation cost. The front of the funnel has a cheaper source than new URLs: **already-mined trees re-swept under a different lens.** |
| 1.3.0 | 2026-08-31 | openmontage | 1 (5,357 landing / 943,274 in-tree = **0.6% read fraction**, the sharpest the ledger holds) | 12 | 3 | 3 | 0c/2e/1s | 0 (no project confirmed) | Declared focus was **ship**; NOT met, and the row names the cost as the standing directive demands. The one sentence that would have unblocked it: *"yes, add the settle-cause field to gravity's extract round record."* That is the only one of the three that was shippable - the coverage contract's first change is a **declaration by the operator** (which unnamed skills are deliberate) rather than code, and the promise lock's arm B has no implementation to commit. Two firsts worth keeping. (1) **The clone was nearly the run's undoing**: the first attempt under the scratchpad prefix dropped 2,159 files including the entire densest directory and reported success; `git status --short` on a fresh clone is the tell, and no phase currently tells you to look. (2) **The single fetch corrected the source rather than confirming it** - the cited paper is real but its axes were renamed and its institutions invented, and writing against the paper produced a strictly better technique (a retrieval pair that trades off, which the source's renaming hid). Both landed media-generation findings came from hunts rather than from the source's own emphasis: one from the enumeration hunt, one from an asymmetry *inside the source* (it held both the rotting and the durable form of the same test). Apply produced corpus content again - two of three `better` verdicts found the target tree had reached the rule independently, which is evidence rather than adoption. |
| 1.3.0 | 2026-08-31 | omniroute | 1 (11,691 README vs ~34,000 mined in-tree; the densest artifact was a 70-line middleware file whose header is a post-mortem) | 18 | 4 | 4 rows (1c/0e/2s + 1 unapplied, no seam) | **2 commits (goat)** | Declared focus was **ship**, and it was **met**: the A/B came back `better` on a real seam, the one-sentence confirmation was asked for explicitly rather than recorded as a missing affordance, and the operator gave it. Two techniques contradict the corpus rather than extend it (`depth-bounds-and-shed`'s pessimistic count sizing; `priority-and-fairness`'s unstated attestation assumption), which is the outcome the method calls the best case. The most reusable measurement was the losing arm: an indiscriminate skip served 0/6 high-intent prefetches, promoting a caveat in the new technique to a stated boundary. 0 of 3 fetches — fourth consecutive practitioner-codebase run to spend none |

Next run's declared focus: **ship**, for the sixth run running, and the notation now says
how bad it is. The archify row is the first to write apply as `<rows>/<landed>` per the
1.3.0 lesson, and the honest fraction is **1 of 9** - seven techniques and two amendments
landed, one carries an A/B. Eight documents are wiki pages until a later run reaches them,
and the bare-mode notation had been hiding exactly that.

Two distinct blockers now separate, and only one is a method defect:

- **Ship-blocked-by-confirmation** (five runs). The triage pick names no project, so Phase
  8 step 2 is never satisfied. The archify run at least paid the cost forward: it wrote the
  seam record to the project's `.ai/applied.jsonl`, which the previous run listed as owed,
  and named the exact confirming sentence in its row. The affordance the invocation still
  lacks is a standing project authorisation.
- **Apply-under-covered** (new, and the larger number). Nine landings, one row. This is not
  a confirmation problem - a simulation is always reachable and costs twenty minutes. It is
  the budget-language defect the 1.3.0 redesign proposal already named, now measured.

The proposal in `LESSONS.md` 1.3.0 - make the unit of the apply budget the landing rather
than the finding - is no longer supported by one observation. It has two, and the second
one measured 1/9. A third makes it a rule this file carries.

**Update after `omniroute` (2026-08-31).** Ship was met for the first time in six runs, and
the mechanism was trivial: the run *asked*. The previous row named the confirming sentence
it needed but did not put it to the operator; this one raised it as its own question once
the A/B returned `better`, and got a yes in one turn. That is evidence the blocker is a
prompting habit rather than the missing standing authorisation — the affordance is still
worth having, but a run that reaches a `better` verdict and stops has chosen to stop.
**Apply-under-coverage remains the weakest stage and is now the declared focus**: this run
owed 4 rows for 4 landings and wrote 4, but it is the first to do so, and it managed it by
counting one `unmeasurable` and one honest `no seam` among them — which is the notation
working, not a full apply. The next run's row should say whether 1:1 landing-to-row holds
when the landings are more than four.

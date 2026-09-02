# Scorecard - intake

One row per run. The five stages are the pipeline this skill exists to master:
**research -> extract -> test -> apply -> ship.** `apply` is written as
`<code>c/<experiment>e/<simulation>s`. A zero in `apply` or `ship` carries its reason
in the last column. After appending, read the last ten rows and name the stage the
funnel loses most at under the table; that stage is the next run's declared focus.

| Version | Date | Source | Research | Extract | Test | Landed | Apply | Ship | Zero reason / focus moved? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1.5.0 | 2026-08-31 | `pgrust` | 1 (2,480 landing / ~7,500 in-tree operating docs + a 1,241-row unit catalog) | 13 | 6 | 3 (1 technique + 2 amendments) | 3 rows: 0c/2e/1s — **1:1 with landings** | 0 (declined: no change warranted for 1 of 3; blocked: confirmation for 2 of 3 — the changes are argued and the measurables named, but the triage answer named no project and Phase 8 step 2 gates the tree write) | **Ship written with its predicate, as the focus asked, and the split matters: 1 of the 3 zeros is not a funnel loss.** The oracle row's tree already implements the remedy, so no change was warranted; the other two are the modal `confirmation` blocker again. **Focus's other half could not fire** — parallelising Phase 6's mechanical lane needs a wave, and one repository is one document; agent dispatch is also off in this session by standing operator instruction. Said so rather than manufacturing it. Extract→Test was 13→6 (46%) serially, above the window. **All three landings came from one hunt — an enumeration that claims completeness and misses a case the same file describes**: two rot axes named with a third in the prose; "no self-check exists" true for only one direction of an undrawn distinction; "compare against that one rather than writing a third" silent on what that oracle cannot see. Third consecutive run where the denial hunt carried the yield. **The apply refuted the run's own document before commit** (second consecutive run): the new technique covered the fitted *corpus* and not the fitted *predicate*, and the arm that found it scored **11/11 while 9 of 11 payloads passed through unmodified** — a section was added. **A first hypothesis was wrong and one command settled it** (fourth consecutive run of this): I expected a project's non-default test arms to be env-gated out of CI; the workflow runs all three. 0 of 3 fetches, thirteenth consecutive zero-fetch run on a source carrying its own primary material. |
| 1.5.0 | 2026-08-31 | `semantica` | 1 | 18 | 6 | 5 techniques + 1 amendment | 6 rows: 2c/3e/0s + 1 unapplied | 0 (declined: confirmation — 2 `better` rows had the change argued and the measurable named, but the triage answer named no project, and Phase 8 step 2 gates on it) | Focus **did not apply** — it was scoped to the reference-index wave lane and this was a single-source repository run; said so rather than manufacturing parallelism. Extract→Test landed at 18→6 (a third) anyway, via the enumeration hunt rather than via parallelism |
| 0.15.0 | 2026-08-29 | ai-native-sdlc-and-ci-on-call | 2 | 15 | 8 | 5 | 0c/0e/0s | 0 | Phase 7.5 did not exist; run landed five and applied none. Backfill owed: `oracle-frozen-during-repair`, and the four amendments. |
| 1.0.0 | 2026-08-29 | apply wave 1 (backtest deviations, personas + gravity) | 0 (no source - apply-only run) | 0 | 0 | 0 | 24c/4e/1s | 23 of 24 branches merged (same day, director-reviewed diff + project gates: tsc, 188 vitest, 312 playwright-node) | First run of the apply lane. 29 rows: 27 better / 1 not-better / 1 unmeasurable. One branch held: its gate is deliberately red until a repair lands. |
| 1.1.0 | 2026-08-30 | tesana-loop-mode-game-builds | 1 | 13 | 1 | 1 | 0c/1e/0s | 0 (record-only commit in pof) | Ship 0: the `better` change touches three harness files and the gate that would see it (visual-check) cannot start on this machine, so it is filed as the project's next change rather than committed unpaired. First end-to-end `/intake <url>` run since the apply lane landed: research -> extract -> test -> apply all converted on one source. |
| 1.1.0 | 2026-08-30 | headlong-agent-microharness | 1 | 8 | 2 | 2 | 0c/0e/2s | 0 (record-only commit in ascent) | Ship 0: both simulations - the B arms need the production episode/turn store, which no local gate can see (declared focus 'start the gate first' was checked and failed honestly: vitest/tsc cannot observe spend cadence or history reach). One not-better verdict fed its condition back into the technique - the apply stage producing corpus content is the lane working as designed. |
| 1.2.0 | 2026-08-30 | operator-control-plane | 1 | 22 | 5 | 5 | 1e/0c/0s (4 unapplied, no seam) | 0 (fix filed, not shipped - triage pick named no project, so Phase 8 confirmation was never given) | **Declared focus hit.** Previous row's focus was 'pick the seam by instrument reachability first': `prose-rule-drift` -> ascent chose a seam whose instrument is IN the tree (a checker in the shared tooling lane, locally runnable, no production state) and it converted first try - arm A 0 violations, arm B **27 across four projects**, one invocation apart. Ship is still 0, but for the first time not because the instrument was unreachable: the change is a one-line gate wiring in someone else's repo and the operator has not confirmed the lane. **The run's largest output was a method fix, not content**: the source was triaged off 2,639 words of rendered landing page over a 168,969-word tree, the operator caught it, and SKILL.md 1.2.0 now requires a repository source to be mined from a clone (Phase 2b). Fourteen past repo sources audited by the new tell; three had the defect; two re-runs dispatched and both returned - one **refuted a prior run's accepted finding at its premise**. |
| 1.2.0 | 2026-08-31 | tigerbeetle | 1 (421 landing / 111,264 in-tree = 0.4% read fraction, recorded) | 15 | 4 | 1 | 0c/0e/1s | 0 (project edit never confirmed; operator steered the run to diagnosis) | **Declared focus hit**: the previous row asked that a repository source record its read fraction, and this row carries it. Landed 1 of 15 by operator choice, not by yield - the run's largest output was a corpus finding. First triage returned twelve process rows and **zero architecture rows from a database**; the operator rejected the framing and the audit found a **construction frontier** the bundle has never stated: it builds at the application layer and consumes everything below. Two method defects named - Phase 2b's operating-document examples are all process-flavored (I opened TIGER_STYLE.md and skipped ARCHITECTURE.md, the largest doc in the tree), and the strip test is biased toward process because architecture claims arrive wrapped in domain terms that read as proper nouns. |
| 1.3.0 | 2026-08-31 | anydoc | 1 (2,100 landing / ~32,000 lines in-tree) | 13 | 4 | 8 docs (1 new subject: golden path + 5 techniques; 2 amendments) | 1c/0e/0s (6 unapplied: 4 no seam, 2 budget) | 1 (personas, master, pathspec) | **Apply-under-coverage, the declared focus, was NOT met at 1:1 and this row says so plainly.** 8 documents landed; 1 apply row with a real A/B, plus 6 honest no-seam/budget rows. The previous row asked whether 1:1 holds when landings exceed four - it does not, and the reason is structural rather than lazy: a run that forges a whole subject lands five techniques at once and only one of them had a live instance in the fleet, **because the subject was forged precisely where the corpus had nothing**. Forging a new subject and applying it are in tension - the emptier the map, the fewer seams exist. The notation absorbed it (4 rows carry a return condition naming what would create a seam) but the funnel number is honest at 1 of 7. Ship was met without being asked twice: the operator confirmed the lane at triage, which is the previous row's lesson holding. **Method finding 1: `.github/releases/` is an operating-document location Phase 2b does not name**, and here it was the densest yield in a tree with **no `docs/` at all** - four release notes that, read in order, are the same defect found four times. **Method finding 2: a `research-map` empty for a phrase is not an empty for the concern.** The spec asserted no prior art for amplification caps; the dispatched worker found `import-validation` already owned two thirds of it, one subject away in the same category. The worker catching the director is the review direction working, and it is the second consecutive run where a worker's override was right. |
| 1.3.0 | 2026-08-31 | tc39-proposals | 1 (1,540 landing / ~10,900 in-tree; 1,603 outbound links enumerated, 0 read) | 8 | 2 | 2 (2 techniques + golden-path section + 1 amendment earned from the apply step) | 2 rows (0c/2e/0s) — **1:1 with landings** | 0 (both arms read-only; no project change warranted, and the operator's approval named no project — Phase 8 step 2 gates the tree write) | **Declared focus `apply` was MET at 1:1, and the apply step produced corpus content twice, which is the pattern the last four rows have been converging on.** The `unmeasurable` row is the more useful of the two: running the technique's own diagnostic against a second seam found its **precondition missing** — a flat status queue has no per-item trail, so "last-touched is free" is true only where dated per-item events already exist. The technique now carries that condition. **Class finding, and it corrects Phase 2c**: the ratio test called this a reference index (1,603 links / ~10,900 words) and the lane it prescribes — enumerate, rank, read in waves — would have burned ~40 fetches for ~200 negatives, because the references were all out of scope. The rows here are *maintained records*, not pointers, so **the table's schema was the source**. The discriminator the class row needs: does the curator maintain per-row state over time, or only select rows? Second reference-index run in the ledger and the two answer it differently. **The 1 fetch was spent as extraction and inverted the source twice** — the column set tracks the entrance criteria exactly, and "no explicit rule addresses stalled proposals" turned an observation into a technique. Both landings came from the asymmetry hunt: 14 of 14 existing techniques take the checker as subject, none takes the item being gated. **Parallel-run finding**: a sibling landed an undeclared technique into my subject mid-run, and the `index` lock did not prevent its WIP being baked into the regenerated artifacts — the lock serialises regenerations, not the tree they read. Artifacts left unstaged; only content committed by pathspec. |

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
| 1.3.0 | 2026-08-31 | archify | 1 | 16 | 12 | 1/9 rows (1c/0e/0s) | 1 | Declared focus was **ship**: MET, and the manner matters more than the number. The run first landed at ship 0 having named the exact unblocking sentence the previous scorecard demanded (*"yes, apply the three-state detector change to politicas"*); the operator said it, and the change shipped in the same session - mode upgraded `experiment` -> `code`, 3 files, +92/-9, committed unpushed. **This is the first direct evidence that the missing affordance is the only thing between a `better` verdict and a shipped change**, which the 1.3.0 redesign proposal predicted and five prior runs could only assert. Apply is still 1 of 9 landings. The **structural facts outranked the A/B**, all three of them: the target's report had no skipped record type (the defect was forced, not chosen), the vocabulary already existed one layer up and died at a module boundary, and the same repository implements `checked-vs-skipped-denominators` exemplarily in a *different* gate - a discipline is adopted by a gate, not by a codebase. The commit's own pre-commit hook then passed by not looking (`.claude/skills/**` is an eslint ignore pattern), which is the defect demonstrating itself on the gate doing the repair. Extract 16 from a tree whose landing page is 1.6% of it - the clone was the run. Two citation errors caught by Phase 8's open-one-cited-line (three of five line numbers off, because the same guard text appears in two functions), and the A/B harness reproduced the very defect it was testing, which arm A could not have revealed and arm B did on the first run. |
| 1.3.0 | 2026-08-31 | herdr (re-run, Rust/backend lens) | 1 (3,304 AGENTS.md + justfile + 200-line arch test vs 420 README) | 9 | 3 | 4 (2 techniques + 2 amendments) | 1e/0c/0s (1 unapplied: no seam in fleet) | 0 (verdict was not-better - nothing to ship) | Ship 0 is **correct here, not a miss**: the A/B returned `not-better` because the consumer already satisfies the rule, so there is no change to commit. Declared focus was extract; met - a re-run of an already-mined tree under an orthogonal lens produced 3 landings entirely from the prior run's untriaged table, at zero re-derivation cost. The front of the funnel has a cheaper source than new URLs: **already-mined trees re-swept under a different lens.** |
| 1.3.0 | 2026-08-31 | openmontage | 1 (5,357 landing / 943,274 in-tree = **0.6% read fraction**, the sharpest the ledger holds) | 12 | 3 | 3 | 1c/1e/1s | **1** (gravity `b256f24`, gate green: tsc, lint ratchet at baseline, 387 tests) | Declared focus was **ship**; **MET** - first source-driven run to convert all five stages since the apply lane landed. The operator confirmed the lane in three words after reading the row that named the missing sentence, which is the affordance the last six scorecards were asking for. The other two remain unshipped for stated reasons: the coverage contract's first change is a **declaration by the operator** (which unnamed skills are deliberate) rather than code, and the promise lock's arm B has no implementation to commit. **The ship corrected the experiment that proposed it** - the over-credit measure that looked like the defect was not one, and committing it would have reintroduced a stall an earlier fix removed; the real cost was one layer downstream, at the door where a finding becomes durable evidence rather than schedule. Two firsts worth keeping. (1) **The clone was nearly the run's undoing**: the first attempt under the scratchpad prefix dropped 2,159 files including the entire densest directory and reported success; `git status --short` on a fresh clone is the tell, and no phase currently tells you to look. (2) **The single fetch corrected the source rather than confirming it** - the cited paper is real but its axes were renamed and its institutions invented, and writing against the paper produced a strictly better technique (a retrieval pair that trades off, which the source's renaming hid). Both landed media-generation findings came from hunts rather than from the source's own emphasis: one from the enumeration hunt, one from an asymmetry *inside the source* (it held both the rotting and the durable form of the same test). Apply produced corpus content again - two of three `better` verdicts found the target tree had reached the rule independently, which is evidence rather than adoption. |
| 1.3.0 | 2026-08-31 | omniroute | 1 (11,691 README vs ~34,000 mined in-tree; the densest artifact was a 70-line middleware file whose header is a post-mortem) | 18 | 4 | 4 rows (1c/0e/2s + 1 unapplied, no seam) | **2 commits (goat)** | Declared focus was **ship**, and it was **met**: the A/B came back `better` on a real seam, the one-sentence confirmation was asked for explicitly rather than recorded as a missing affordance, and the operator gave it. Two techniques contradict the corpus rather than extend it (`depth-bounds-and-shed`'s pessimistic count sizing; `priority-and-fairness`'s unstated attestation assumption), which is the outcome the method calls the best case. The most reusable measurement was the losing arm: an indiscriminate skip served 0/6 high-intent prefetches, promoting a caveat in the new technique to a stated boundary. 0 of 3 fetches — fourth consecutive practitioner-codebase run to spend none |
| 1.3.0 | 2026-08-31 | cline | 1 (1,178 landing / 124,315 in-tree = ~105x read fraction) | 14 | 5 | 2 rows (0c/1e/1s) | 0 (no code change warranted; both verdicts filed as the project's next change) | Declared focus was **apply-under-coverage**, and it was **met at 1:1**: 2 landings, 2 rows, no `unapplied` and no `no seam` among them - the first run to owe rows and write them all with a real seam behind each. Ship 0 is honest rather than a miss: the experiment's adoption needs a pass predicate the target does not declare, and the simulation's fix is a type change across a Rust enum's match sites, neither of which is a few readable lines - and the tree carries another session's WIP besides. **The run's best output was a merge, not a find**: two candidates triaged separately (a defaulted status in a transport projector, a probe collapsing 'could not ask' into 'not there') were the same root, and landing them as one technique with three laundering points is the synthesis step the operator's standing critique asks the skill to perform. Both hunts paid again - the enumeration hunt found an aggregation-rule list missing its most load-bearing entry, and the missing-stage hunt found a third producer of state in a subject that models two. **The apply produced corpus content twice**: the fleet tree already satisfies the rule at its most dangerous gate but only because a map lookup returns an optional (discipline on loan from the type system, nobody designed it), and the eval A/B surfaced a second defect it was not looking for. 0 of 3 fetches - tenth consecutive for a source carrying its own primary material, and the sixth straight repository run where the README contributed nothing. |
| 1.3.0 | 2026-08-31 | aider | 1 (1,156 README vs ~9,500 LOC of core engineering mined; ~428k words in-tree markdown) | 10 | 2 | 2 (1 technique + 1 amendment, plus golden-path and roster edits) | 2 rows (0c/2e/0s) | **1** (the budget amendment shipped to a managed project's default branch; the centrality lane did not - writing a new module into a tree whose build was contended would have compounded the risk that held this one, and it is the branch-worthy half) | Declared focus **apply-under-coverage met at 1:1 for the second run running**: 2 landings, 2 rows, both with a real seam in one tree, both `better`, no `unapplied` and no `no seam`. The run's own lesson is about **Test**, not Apply: both picks came from hunting an *enumeration* and an *asymmetry* inside already-mature files, neither of which `research-map` can see - it scores two files that both "cover" a concept identically, and only opening both reveals that one models it and the other mentions it. New: the apply step generated a corpus finding of its own (a ranking field at 93.7% schema default = `unknown-is-not-a-value`), the second run in four to have the seam amend the technique rather than merely test it |
| 1.3.0 | 2026-08-31 | voltagent-awesome-ai-agent-papers | 1 (382 refs enumerated, 16 read, 366 ranked+recorded) | 40 | 16 | 7 | 0c/2e/0s (5 unapplied, reasons in ledger) | 0 | **First run of the reference-wave lane, and of the run board.** Ship 0: both applications are `structural-only` - the personas research-lab store holds zero rows and the agent layer has no field a tool conflict could be recorded in, so no behavioural arm existed to ship. Read fraction **16/382 = 4.2%** vs the ~0.8% a top-3 sample would have given, and the other 366 are ranked in a companion file rather than discarded. The run's largest output was **a correction to its own method**: wave 1's central premise was verified with a proper-noun grep over a purity-gated corpus - guaranteed empty, measured the gate not the coverage - and two wave-2 lanes independently refuted it. Root cause is `research-map` slug matching, which cannot see an 8-technique build filed under an unrelated name. |
| 1.3.1 | 2026-08-31 | whatwg-html | 1 (302 landing / 717,109 in-tree = **2,374x**, the sharpest read fraction the ledger holds) | 13 | 2 | 2 | **2 rows / 2 landed** (0c/1e/1s) | 0 - both assessments read-only; neither proposes a few-readable-lines change, and the register's first change is a declaration rather than code | Declared focus **apply coverage, written as `<rows>/<landed>`** - **met at 1:1 for the third run running**, and written in that notation without being reminded, which was the specific ask. The ledger's **first standard-repository source**: a primary normative document, so it authorizes rather than merely originates - and the yield inverted inside the tree as sharply as it did against the landing page. 711,540 words of normative text produced **zero** landings; ~120 words of `<p class="note">` plus a 5,472-word FAQ and contributor guide produced both. A standard's subject matter is un-strippable by construction, so the extraction lane is the meta-layer: how the specification is engineered as an artifact. The reusable instruction for the class is to grep the normative text for its **annotation vocabulary** - the marked-up concept classes it defines for itself - rather than reading it. **The board changed what was mined**, for the first time on the record: a sibling held `quality-gates` and was mining the other major web standard's process repository, which owns the better authority for staged advancement - so this source's change-admission gate was routed away untriaged and both landings came from material that source does not carry. The `content`-lock re-read then paid on the same file: the sibling had added two techniques to the roster between Phase 4 and Phase 7, and the insert preserved both. **The apply step disproved its own premise and produced a better result.** The run picked a tree expecting to measure a gate manufacturing fabrications; the tree has no such gate - 21 hand-written lint rules, none touching the field - and carries the fabrication at 55.6% of the population anyway. The technique gained a measured correction (*a gate is sufficient, not necessary*; the pressure comes from the requirement's shape and propagates by convention) rather than a confirmation. Third run in five where the seam amended the technique instead of merely testing it. Both hunts paid again: the enumeration hunt (twelfth consecutive) found `unmeasurable-criteria`'s "exactly three honest resolutions" missing a fourth state that its own deciding question cannot reach, and a corpus-wide `research-map` **empty** - none for `"intentional nonconformance"` across 341 subjects - was verified by opening the four nearest subjects rather than trusted. Two candidates sharing a root were **deliberately not merged**, with the discriminator written into both files; the last two runs merged theirs, and saying why this one did not is the same synthesis discipline running in the other direction. 0 of 3 fetches - eleventh consecutive for a source carrying its own primary material. |

Next run's declared focus: **apply coverage**, not ship. Ship moved this run - the archify
row is the first `1` in six - and it moved for a reason worth naming precisely: the run
reached a `better` verdict, named the one sentence of confirmation it needed, the operator
said it, and the change shipped in the same session. **Five runs asserted that the missing
affordance was the only blocker; this one demonstrated it.** That is the second sighting
the 1.3.0 redesign proposal needed, and it now has the stronger kind of evidence - not a
run that failed for want of authorisation, but a run that succeeded the moment it arrived.

The weakest stage is now unambiguously **apply**, and the `<rows>/<landed>` notation is
what exposed it: 1 of 9. Seven techniques and two amendments landed; one carries an A/B.
This is not a confirmation problem - a simulation is always reachable and costs twenty
minutes - so it cannot be blamed on the invocation. It is the budget-language defect the
1.3.0 proposal named: Phase 7.5's "one project per finding per run" reads as a ceiling and
behaves as one.

Two observations now support making the unit of the apply budget the **landing** rather
than the finding, with the budget capping the *mode* rather than the count. A third makes
it a rule `SKILL.md` carries. The next run should write its apply column as `<rows>/<landed>`
without being reminded, and a run that lands N and applies 1 should say in its row which
N-1 it chose not to test and why.

**Update after `aider` (2026-08-31).** Apply held at 1:1 for a second run (2 landings, 2
rows, both with a real seam, both `better`), and **ship was met**: the budget amendment
landed on a managed project's default branch. So both of the standing blockers were
cleared in one run - the ask happened (the omniroute lesson applied) and the test happened.
What the run adds is a **third blocker, and it is not a prompting habit**: for most of the
run the change could not be *verified*, because a second session in the same tree held the
cargo build lock from before the edit, and the crate's default feature set fails in its
build script besides. Ship happened only because the verification was recovered by other
means - a separate target directory for the type-check, and a standalone `rustc` harness
for the behaviour.

That is worth separating from the two known blockers, because the fix is different. "Never
asked" is fixed by asking; "never tested" is fixed by budgeting for a simulation. "Cannot
verify right now" is fixed by having a cheaper instrument than the project's own gate
ready, and by knowing which of the project's feature combinations actually builds.

Three things follow, and only the third is a method change:

- **The shared artifact in a compiled project is the BUILD, not the files.** Phase 8's
  foreign-WIP test ("another session has uncommitted work in the files you touch") passed
  cleanly here and was the wrong question: the other session's `cargo test` compiled this
  run's uncommitted edits into its own run minutes after they landed. For a compiled
  tree the test wants a second half - *is anything building or testing this tree right
  now* - which is one process query and changes whether you edit before or after you can
  verify.
- **`ship` needs a third zero-reason, distinct from the two above.** "Held on an
  unverifiable tree" is not the same failure as "never asked" or "never tested", and
  collapsing it into either would make the next reader think the prompting fix already
  applied here had failed. It had not: the ask worked, and the verification is what was
  unavailable.

- **The standalone harness is a pattern, not an excuse.** Extracting the changed functions
  into a single-file `rustc` harness fed with the real size distribution took one command,
  proved the algorithm and its four edge cases, and is why this row says `code` rather than
  `unproven`. Where a project's build is contended or slow it is the cheapest arm B
  available - it is just not the project's gate, and the application says so in its own
  "what this does not show" rather than letting the mode imply otherwise.

The honest residue: the four committed tests have still never been run by the project's own
runner. `code` mode does not require that, but a reader of the row would assume it, so the
application states it plainly. A run that ships into a tree it cannot fully build owes that
sentence.

**2026-08-31, after the whatwg-html row — apply is no longer the weakest stage.** Three
consecutive runs (cline, aider, whatwg-html) owed rows and wrote them all, at 1:1, with a
real seam behind each. That is the third sighting the `<rows>/<landed>` notation was
introduced to get, and it makes the budget-language fix a rule `SKILL.md` should carry
rather than a proposal: the unit of the apply budget is the **landing**, and the budget
caps the *mode*, not the count.

The funnel now loses most at **ship**: 1 of the last 6 runs. The reasons in those rows are
not excuses and should not be treated as one problem. Two are *honest zeros* — a read-only
assessment changes no product code, and a finding whose first change is a declaration by
the operator has nothing to commit. One was *held*, not skipped: the change was written and
verified and the project's own suite could not run it. So the next run's declared focus is
narrower than "ship": **pick at least one landing whose apply mode can be `code`**, chosen
at triage rather than discovered at Phase 7.5, and say in the row which landing was chosen
for that reason. A run that reaches Phase 8 with two read-only experiments did not fail to
ship; it failed to *select* for shipping, three phases earlier.
| 1.3.1 | 2026-08-31 | brooker-blog | 1 index / **16 references read of 33 ranked, 163 enumerated** (2 waves, 8 lanes each) | 33 | 16 | 8 (2 techniques, 5 corrections, 1 amendment) | **8 rows / 8 landed** (0c/8e/0s; 7 better, 1 not-better) | 0 | **Declared focus MISSED, and the miss was mine at the brief, not at Phase 7.5.** The last row asked the next run to *pick at least one landing whose apply mode can be `code`, chosen at triage*. I instead wrote all four apply briefs read-only in project trees, which made `code` unreachable by construction before a seam was ever looked at - the exact three-phases-earlier selection failure the last row diagnosed, repeated one turn later in a new disguise. Three of the eight had a genuinely small code arm (a one-character config flip that was already implemented and shipped disabled; a four-line last-known-good fallback; repointing five dead prefetch rules) and every one was foreclosed by my own instruction. Apply coverage itself held at **1:1 for the fourth run running**, at 8 rows for 8 landings with a real seam behind each. **The lane's read fraction is the headline: 16/33 ranked = 48%**, against the ~9% a top-3 sample would have given, and the 17 unread are ranked and recorded rather than discarded. Class note: a single-author archive inverts the reference-wave lane's economics - within-index convergence deduped by *author* is structurally unavailable, so every convergence is n=1 and the references originate freely while authorizing almost nothing. What authorized the landings was corpus-internal evidence, training-data convergence on textbook results, and in two cases a primary the post pointed at. **The instrument lied three times and workers caught it every time.** `research-map` reported *the corpus has never heard of this* for `fair queuing`, `utilization` and `queueing theory`; all three were false. One lived under a slug no queueing term reaches (`scale-investment-timing` owns open-vs-closed arrivals and the 70-90% knee); **two lived inside an application document, which `research-map` does not rank**. That second failure mode is new to the ledger and is the run's most portable finding: a near-empty can mean the corpus wrote the material at the application layer and never lifted it to a technique. **Test is where this run actually performed.** The enumeration hunt paid in **10 of 16 lanes** - thirteenth consecutive - because this source's genre is the decomposition, and a decomposition is a probe against any document that declares itself complete. Five landings are corrections to sentences the corpus already published, **three of them against content sibling runs landed the same morning**; the strongest needed no source at all (`reliability-aggregation` opened with a model over a rate and forbade that move two sections later). Conversely the source's *assertions* landed almost nothing: 4 of 16 lanes found the stated class wrong - position essay, vendor product paragraph, teaching relay, 74-word aphorism - and correctly returned `nothing`. **Four of eight apply rows amended the corpus from the tree**, the highest count the ledger holds: a 4.3x measured regression bounded the new technique with a coexistence test; a fleet A/B put honest throughput at 1/min under the *correct* fairness policy, so the global bound protects the resource and abandons the user; a reaper's activity gate supplied a **third** retention mechanism my own amendment's enumeration had excluded, plus its harm-bound clause; a broadcast-artifact experiment kept 32/32 assertions alive across 6/6 refusals that take them all to zero, and found the repair's own blind spot (the truncated case fails in the decoder with no filename). The single `not-better` is the most valuable row. Measured en route: failures cluster **123x** over independence in an eval corpus (chi-square 1737 on 2 df), direct empirical support for the independence correction landed the same hour. **One real error**: I overwrote an existing 2026-08-18 application with `cat >` without checking the path existed, then restored it from HEAD and refiled mine under the stack that actually ran the arm. Look before overwriting - the method says so and I did not. 24 fetches across 16 lanes (first non-zero-fetch run in twelve, and correctly so: this class's references *are* the extraction). 8 catches, 9 leads including one at law altitude, 17 references ranked-and-unread. Ship 0. |
| 1.3.1 | 2026-08-31 | voltagent-awesome-ai-agent-papers (wave 3) | 1 (24 of 382 read, 358 ranked+recorded) | 26 | 8 | 6 + 1 instrument | 0c/0e/0s (2 unapplied, reasons in ledger) | 0 | **The ranking was aimed at our own enumerations rather than at topics, and it is the highest-yield change the lane has made**: 8/8 lanes worth a slot, two independent three-way convergences (`baseline-ladder`, `deterministic-backbone`), against wave 2's 4/8-ish. Apply 0: both landings are rules about how a number is produced, and no managed project runs a memory comparison or a structural extractor to test them against - stated per row rather than skipped. Ship 0 follows. The run's largest output was again infrastructure: `research-map --prose` now reads document bodies, after the slug-blindness was measured a second and third time (14 techniques across two civic-intelligence subjects own claim verification and were invisible to every llm-agent query). Also corrected a number this run itself had committed - a relayed 43% that was a miss rate, not a catch rate. |

Next run's declared focus: **carry the `code`-reachability decision into the worker brief.**
Apply coverage has now held at 1:1 for four consecutive runs and is no longer the weakest
stage - across the last ten rows it is `ship` by a wide margin, at 2 of ~30 landings, and
this run makes the cause legible for the first time. The last two rows blamed selection
"three phases earlier" at triage. That was half right. This run *did* select well at
triage and still shipped zero, because the foreclosure happened at a step neither row
names: **the apply lane's brief.** Four briefs said "you are read-only in project trees",
which is the correct default for a fan-out that touches seven trees at once, and it made
`code` unreachable before any seam was examined. Three of the eight landings had a
genuinely small code arm and the brief had already excluded all three.

So the instruction is narrower than "pick for `code` at triage": **when a landing is
picked whose seam is plausibly a few readable lines, its apply lane must be briefed with
write access to exactly one named tree, and the row says which lane got it.** A fleet-wide
read-only sweep and a single-tree code A/B are different jobs and should not share a
brief. A run that dispatches only the first has decided its ship column at dispatch time,
which is where this run decided it.
| 1.3.1 | 2026-08-31 | danluu-2026 | 1 index / **6 of 6 reachable 2026 refs read = 100% sample** (3 more are Patreon-only and unreachable) | 12 | 5 | 5 | **4 rows / 5 landings** (0c/3e/1s; 4 better, 1 honestly unapplied) | 0 | **Declared focus MISSED for the third run running, and this run has a different root cause than the last one, which is the useful part.** brooker-blog diagnosed its own ship-0 as *the apply lane's brief* and prescribed briefing one lane with write access to a named tree. That prescription could not have fired here: this run dispatched no lanes and wrote every arm itself. The actual foreclosure was **one phase earlier still** - the operator picked rows by number (`1-6 per your recommendation`) and the triage table carried no project column, so no tree was ever authorized, and Phase 8 step 2 correctly refuses to edit one without confirmation. The fix is not a brief, it is the **table**: a row whose seam is plausibly a few readable lines should carry the project it would touch, so that picking the row authorizes the tree in the same breath. Two runs have now blamed two different mechanisms for the same zero; both are downstream of a triage table that never mentions a project. **The run's largest method output is that it refutes a standing open question in LESSONS.** The last entry proposed a fourth apply mode, `re-analysis`, on the grounds that measurement-discipline techniques *'have their seam in another measurement'* and cannot be A/B'd in running code. All five landings here are measurement-discipline techniques and three got real two-arm code A/Bs anyway - because a project's **own measurement apparatus is itself code you can run**. The eval lane, the integrity gate and the judged corpus were the seams. No fourth mode needed; what was needed was to stop looking for the seam in the product and look for it in the instrument. Numbers: a 110-byte vacuous agent spec scores **6/6, identical to the real 2,414-byte one** (0 of 6 quality assertions survive candidate write access); the shipped integrity gate refuses **0 of 2** fabricated-citation proposals while a 20-line arm refuses 1 of 2 with no false positive; and **r = -0.378** between how much of a subject was judged and its deviation rate, with **0 of 142** judged pairs ever double-judged. **The best landing came from a cross-bundle asymmetry, and that is a repeatable probe**: two bundles both 'cover' judge instability, and only opening both showed that the builder side has carried a repeatability floor for weeks while the operator side - which runs kappa, a trust bar, per-cycle drop alerts and windowed regression off it - has none, so both its detectors fire on unmeasured re-score noise. Neither the slug map nor a summary can see this; the two files score identically on any keyword. **The catches were the discipline**: 4 of 12 candidates resolved to already-covered by *opening the files* (`judge-stability` owns the repeatability floor AND the cross-instrument swing; `discriminating-task-selection` owns the unanimous-cells argument; `retrieval-evaluation` owns human tuning leak), and the one that looked strongest at triage - a repeatability floor - had to be re-homed into a different bundle because of it. Class note, second sighting in one afternoon and independently reached by a sibling: **a single-author archive makes within-index convergence structurally unavailable** (dedupe by author -> every convergence is n=1). 0 of 3 fetches. 4 leads, 6 untriaged with anchors, 1 currency signal that resets no clock. Ship 0. |
| 1.3.1 | 2026-08-31 | tigerbeetle-blog | 1 index / **11 of 31 refs read (35%)**, all 31 ranked and tabled | 11 | 3 | 3 (1 subject + 2 techniques) | **3 rows / 3 landings** (0c/2e/1s; 3 better) | 0 | **Declared focus MISSED for the fourth run running — and this run found where the mechanism actually breaks.** The last row prescribed *'carry a project on every triage row whose seam is a few readable lines'*. I did not, and the reason is structural rather than forgetful: **the declared focus is written in Phase 11 and read by nothing.** Phase 1 tells a run to load `librarian-scan`, the source ledger and the board; it never says to read this file. So each run writes a focus at the end and the next run discovers it at the end too, having already shipped its triage table. Three consecutive rows have now blamed three different proximate mechanisms (selection at triage → the apply lane's brief → the missing project column) and all three are downstream of the same thing: **the feedback loop this scorecard exists to close has no reader.** Fixed this run in SKILL.md Phase 1 (v1.3.1 → 1.4.0), which is the first structural change any of the four runs has made. **Yield.** One new SUBJECT, `test-input-generation`, specced and forged same-session — four posts by three authors converge on it and the corpus held nothing (0 hits for `deterministic simulation`, `swarm test`, `property-based`; all 56 `fuzz` hits are *fuzzy matching*, which is why the slug map returned confident noise and the hole survived 153 subjects). Home decided on the **neighbour's stated boundary** — `test-harness` opens *'the tests themselves assert facts'*, an explicit exclusion — so landing there would have falsified its own opening paragraph. Its strongest content is a symmetry: **both clever and naive generators collapse the reachable space, in opposite directions**, and the constraint lives in the generator either way, invisible from the test. **One technique was written against the literature rather than the source**, which is the run's best editorial call: the post presents swarm testing with no limits at all and closes 'Please steal this and use this!', while Groce et al. ISSTA 2012 (the run's single corroboration fetch) states the boundary that decides when it *loses*. The corrected version is the stronger artifact and the source note says so. **Apply was 3/3 `better` with two real `ab-paired` experiments, and both found things the trees could not have been built to prove.** (1) A project declares `rust-version 1.80.0` against a resolved graph whose effective floor is **1.88.0** — 60 of 518 packages above the claim, set by a transitive crate at *patch* level — while all 11 Rust CI jobs run `@stable`; and the same repository declares a **runtime** floor and *does* run a job at it, so two identical claims are enforced asymmetrically for no reason anyone decided. (2) A property suite at ≥1,000 cases per invariant asserts a violation branch its own generator makes **structurally unreachable** (`media_duration` pinned to 60, source-end bounded far below), plus 8 more pinned dimensions, two of them *documented* choices — which is what makes it a good case rather than a careless one. (3) A confirming tree: an independently-designed bitemporal schema whose enforcement splits exactly where the technique predicts (record clock `not null`, world clock nullable and unpopulated), and which avoids the unrecoverable failure by storing unknown as NULL. **Class note.** A **first-party reference index** is a real hybrid the ledger should carry: Phase 2c's *mechanics* were entirely right (enumerate 31, rank all, wave, table the tail) and its *triage signal* entirely wrong, because within-index convergence needs independence and this index is 3–4 voices — matklad wrote 13 of 31. Third sighting of that shape in one afternoon, and the second reached independently by a sibling. Ship 0. 2 catches, 6 untriaged with anchors, 3 leads. 12 fetches on a per-reference budget. |
| 1.3.1 | 2026-08-31 | verou-2026-blog | 1 (4 articles, 12768 words; index page 107 and correctly thin) | 13 | 4 | 4 (2 techniques + 1 correction + 2 golden-path sections) | **3 rows / 3 landings** (1c/1e/1s) | **1** (goat `facc957` + `ed512ae`, typecheck 29 before and after with 0 in the changed file, eslint clean) | **Declared focus MET, and by the mechanism the last row predicted.** The focus was: pick a landing whose seam is plausibly a few readable lines and brief its lane with write access to one named tree. This run had no lane to brief - it ran single-session - so the equivalent step was to *ask*, and the shape that worked is worth recording: the triage pick named no project, so Phase 8 step 2 was unsatisfied and the run correctly went read-only; then, at Phase 7.5, having a measured `better` verdict and a sized diff (~8 lines, one file, palette already in custom properties), it went back and asked with the size and the verification plan attached. That ask was cheap because the measurement already existed. **The generalizable form: ask for the tree AFTER the A/B, not at triage - the question is far more answerable when it carries a number and a diff size.** The 1.3.0-era proposal to authorize the tree at triage would have asked earlier and worse. Second observation: `code` mode paid for itself beyond the verdict - re-running the arms against the *real* revisions (HEAD vs working tree, functions extracted and executed) turned the instrument's self-assertions into regression checks for free, and the change surfaced a clause the desk-written technique lacked (defer a resolution only to a consumer that can perform it), because the second seam could not take the same fix. **A technique written at a desk and a technique written through a tree differ by exactly that clause.** |
| 1.3.1 | 2026-08-31 | tanstack-query | 1 repo @ `1566c16d` (383-word README vs 134k words of in-tree docs; 7.2k LOC core, 105k LOC tests) | 12 | 3 | 3 techniques | **3 rows / 3 landings** (3c/0e/0s; 3 better) | **1** (goat `d4995c3`; typecheck 29 before and after with 0 in the changed files, eslint 0 errors, ratchet matching on all 27 buckets) | **Declared focus MISSED, and this run is the controlled test of whether v1.4.0's fix was sufficient — it was not, for the reason the fix cannot cover.** The focus was *carry a project and a file on every triage row whose seam is plausibly a few readable lines*. My triage table carried no project column. The cause is clean and worth the row: **v1.4.0 landed in `SKILL.md` while this run was in flight**, and the copy I loaded at Phase 0 was 1.3.1 — whose Phase 1 does not mention this file. So I did not read the focus, for exactly the reason the previous four rows diagnosed, in a run that started before the fix existed. That is not an argument against the fix; it is the boundary on it: **a Phase 1 instruction reaches only runs that start after it lands, and a dozen-terminal fleet always has runs in flight.** The row is filed at the version used (1.3.1), per the method. **The verou row's prescription is the one that would have worked here and I reached it too late**: *ask for the tree AFTER the A/B, not at triage.* All three landings finished at `better` with sized repairs — routing a retry predicate through an error code that already exists (a few lines), and installing a lint rule (one dependency, one config line) — and both asks are far more answerable now, carrying a number, than they would have been at Phase 5. **Ship converted, and the mechanism is now confirmed twice.** Asking after the A/B — carrying a measured delta and a diff size — was answered yes for all three, where the same question at Phase 5 had no number attached to it. Two consecutive runs have now converted ship by asking late rather than early, which is stronger evidence than the v1.3.0-era proposal to authorize the tree at triage. **Yield: 3 new techniques, all from probing an enumeration or an asymmetry, none from a feature.** Two of the three landed on sentences where our own documents declare themselves complete (*"Every cache declares four policies"*; *"exactly four legitimate terminal states"*) — fourteenth consecutive run where the enumeration hunt paid — and the third came from the probe that is becoming the more valuable one: **the corpus states one half of a symmetry and never names it as a half.** `client-state` models *declared* subscription narrowing and had no vocabulary for the *observed* form; neither the slug map nor a summary can see that, because the file genuinely covers the concept. **Test is where the run spent its effort and where it nearly failed.** Every landing was verified against the code that implements it (0 of 3 fetches, fifth consecutive such run for this class), and in the apply lane **the instrument lied twice**: a flat constant table let `GC_TIME_MS.STANDARD` (600000) silently overwrite `CACHE_TTL_MS.STANDARD` (300000), producing a **reported 2.0x spread that did not exist**, and a 900-character lookahead window bled into an adjacent registration and invented a divergence between two *different* keys. Both were caught by opening the cited lines by hand — not by re-reading the output, which looked entirely plausible. After the second, the harness was given assertions over its own parse and immediately refused to print, correctly. **Two runs in two days have now had a fabricated multiplier survive to a draft; the rule that catches it is the cheap one — open one cited line per number before it reaches a document.** Real numbers after the corrections: 2 of 7 shared keys diverge (2.0x, 3.0x), a retry classifier refuses **0 of 17** permanent error codes, and a read-tracking optimization runs at 100% of call sites with its linter uninstalled. **Class note.** A mature single-library repository is the cleanest instance of the open-engine row yet and confirms the rule that the README is the least useful file: a 383-word landing page over 134k words of docs, and the densest artifact in the tree was neither — it was the **eight-rule lint plugin**, 8 short documents that outproduced every guide, because a linter is the one file that cannot hedge about what the contract is. Next run over a repo that ships a linter should read it second, after the migration guides (which are release walkthroughs and state what was wrong before) and long before the README. 2 catches, 2 leads, 7 untriaged with anchors — including that lint-taxonomy finding, which the operator did not pick and which is the best unlanded thing here. |
| 1.4.0 | 2026-08-31 | youtube:3IyKC5EtNkM (9 Ways to do Inheritance in Rust) | 1 talk, 7358 words | 11 | 3 | 3 (1 technique + 2 amendments) | **2 rows / 3 landings** (1c/1e/0s; 2 better) | **1** (personas, `personas-db` settings validator: same test FAILED on arm A, ok on arm B; 41/41 settings tests green) | **Declared focus N/A, honestly: no `XL` row arose.** The largest row this source offered was `M`, and the triage table said so - a language-mechanics talk contains bounded amendments, not subject-sized gaps, and pricing an XL row that does not exist would be theatre. The focus mechanism is untested by this run rather than passed by it. **Apply owes 3 rows and paid 2**, and the third is the honest gap: the `seams-and-adapters` fourth signal shares `borrowed-surface`'s root and its seam, so it was tested by the same arms rather than separately - one A/B, two landings, and the ledger shows two rows not three. Ship 1 breaks a four-run ship-0 streak, and the mechanism that produced it is worth naming: the seam was found by grepping the fleet for the *technique's own shape* (implicit delegation, generic typed reads) during Phase 7.5 rather than by asking which project the source mentioned - the source mentions none. |
| 1.3.1 (loaded; a sibling landed 1.4.0 mid-run) | 2026-08-31 | github:remeda/remeda | 1 repo @ `e11dcf2` (**240-word README vs 47,025 words of in-tree markdown**; 58,249 LOC ts) | 20 | 4 | 4 (2 techniques + 2 amendments) | **4 rows / 4 landings** (1c/1e/1s + 1 unapplied; 2 better, 1 unmeasurable) | **1** (personas, master, pathspec, `ba7f613e`) | **Declared focus (price the XL row) did not apply — no candidate was XL, and the run says so rather than claiming a hit.** Ship was 0 at first pass for a stated reason (pick named no project; repair 71 sites/32 files), then **the operator confirmed the lane and set the size constraint, and the slice shipped in the same session** — which is the addendum below being executed rather than merely written. **The finding worth carrying is that the apply step corrected its own technique, twice, in the same run.** `mutating-local-gates` was drafted claiming mutation creates the termination contract; the seam (a managed project's turn-end gate) neither mutates nor blocks and *still* guards re-entry, because its advisory exit re-enters the model's loop — so the contract is created by the gate's **output reaching the agent**, and the technique now carries a three-tier ladder naming the advisory tier as the one most likely to ship unguarded. This is the first row in this file where Phase 7.5 refuted the technique it was testing rather than confirming or bounding it, and it argues the apply step is a *drafting* instrument and not only a validation one. **Best number:** 0 warnings vs 63, same crate, one minute apart, only the suppression form changed — 63 of 71 (89%) stale, against a surface that is 0.7% self-retiring, with a grep-shaped proxy landing within ten points of the compiler for free. **Contention was the dominant filter on yield for the first time**: 4 of 12 candidates routed into subjects one sibling held (`release-pipeline`, `quality-gates`, `test-input-generation`, `test-harness`) and were recorded untriaged with anchors rather than declined — including an inverted-semver finding the corpus has no owner for. The board worked; the cost is real and belongs in the trend, not in this row's yield. **Class note:** the `.agents/` tree is a source-class tell — a repository instrumented for agent contributors gives a first-party account of agent operation whatever the repository is *for*, and here it outproduced every other surface combined while the README was 0.5% of the tree's prose. 0 of 3 fetches, eleventh consecutive. 5 siblings live. |
| 1.3.1 | 2026-08-31 | voltagent-awesome-ai-agent-papers (wave-3 leads, landing pass) | 0 (no new source - banked findings) | 0 | 15 | 15 | 2e/0c/0s (13 unapplied, one reason) | 0 | **The pass that cleared the backlog the previous row named.** 15 banked amendments landed across 10 files in 3 file-batched scripted passes, gate between each. Two applied with paired arms on a live store and both `better`: referential integrity passes 74/74 where the read-back passes 14 and fails 60, on a schema carrying an unused `verified_at` column; and 693 memory nodes against 14 edges. Apply rose from 0 to 2 because the seam was found by **grepping the schema rather than the source** - three earlier passes looked for code implementing the decision and walked past a store that already had a column for the check. Ship 0: both arms are read-only measurements, no product change proposed. |
| 1.3.1 | 2026-08-31 | verou-2026-blog (XL follow-up) | 0 (no new ingest - the banked XL row from the same source) | 4 folded | 4 | **7 (1 new subject: golden path + 6 techniques)** | 1 row / 7 landed (0c/1e/0s; 5 unapplied with per-technique reasons) | 0 (the repair is architectural, not a diff) | **The previous row's declared focus, tested immediately and answered.** That row said an `XL` candidate loses every head-to-head against a technique that lands in one file, and proposed pricing it in the triage table. The operator instead picked it directly, which produced the better experiment: the XL row *was* built, in the same session, from context still loaded - and the cost came in far below what the triage table would have estimated, because the four cheap rows it absorbed were the same four candidates that made it XL. **The generalizable form is stronger than the pricing proposal**: an XL row's cost is not additive with the small rows beside it, it is *substitutive* - four fragments folded into one subject cost less than four techniques written separately, because the fragments were always one subject that extraction had shattered. A triage table that prices XL against the cheap rows is still pricing it wrongly, just more precisely. Second observation: `apply` coverage was 1 of 7 and the row does NOT treat that as a miss - a new subject's techniques are not seven independent findings, and four of the five untested ones need a project that *owns a resolver* rather than one that consumes somebody else's, which no managed project does. The row states that per technique rather than as one reason |
| 1.4.0 | 2026-08-31 | github:TkDodo/react-query-beyond-the-basics | 1 repo @ `32c39be` (**158-word README, 13 source files - and seven feature branches whose diffs are the actual source**) | 10 | 1 verified + 3 caught | 1 technique + 1 golden-path correction (2 subjects touched) | 1e/0c/0s | 0 | **Ship 0 for a reason the standing binary does not cover: neither confirmation nor size, but that the verdict never reached `better`.** The seam is real and structural (7-field params bag, 3 identifying + 4 windowing, no retention, search setter does not reset the page) and **latent** - pagination is off by default with no caller enabling it and no shipped control calls the sort setters, so no gate can see a difference no user can trigger. Recorded `unmeasurable` with the instrument named rather than promoted to `better` on a structural confirmation. **Declared focus (price the XL row) was a no-op and is reported as such**: no row this run was XL, the largest being one technique document. Extract 10 / test 1 reflects an operator pick of one row, not a triage failure - 4 rows recorded untriaged with anchors |
| 1.4.0 | 2026-08-31 | `github:future-agi/future-agi` @ `5b84ef4` (operator-directed at memory) | 1 repo (2676-word landing page vs **42422 in-tree md**, 16x; ~2500 LOC memory path is where all yield was) | 9 | 3 verified + 3 caught | **2 amendments, 0 new techniques** (2 subjects, 2 bundles) | **1e/0c/0s** (1 of 2 unapplied — no managed project carries the seam, reason in the row) | **1** (comment-only slice; behavioural fix withheld — see below) | Focus 1 (price any XL row) **N/A and said so before the table**: against a 13-technique subject every real finding was an amendment, so no XL row existed to price. Focus 2 (name the valve when `better` ships nothing) **moved, and found the dichotomy incomplete** |
| 1.4.0 | 2026-08-31 | tigerbeetle-blog **w3** | 1 index, wave 3 / **17 of 31 refs read (55%)** | 6 | 3 | 3 (2 techniques + 1 amendment) | **3 rows / 3 landings** (0c/1e/0s + 2 measured-unapplied; 1 better) | 0 | **Declared focus READ AT PHASE 1 for the first time — the v1.4.0 change worked, and it changed the run.** Every triage row carried a project and a file before the operator picked, the operator authorized a tree in the same keystroke, and the apply lane went straight to a code arm instead of rediscovering the permission question at Phase 8. That is the loop closing. **Ship is still 0, but for the first time by a blocker neither prior diagnosis names**: not size (~40 lines) and not confirmation (the tree WAS authorized) — the build could not relink because a running instance of the app held the binary, and killing an operator's running app is not a run's call. Name it as a third class: **environment**. The focus's two-way split (size / confirmation) is incomplete and should become three. **The wave's best outcome is that the apply refuted my own remedy.** `seed-is-not-a-reproduction` claims a recorded seed dies when the generator changes, and prescribes persisting the derived input instead. Measured over 50 fixed seeds against the *exact repair this corpus had already recommended in writing* for that generator (a prior application found `trim_end` pinned, making an invariant unreachable, and prescribed drawing it): **50/50 seeds re-point** — structural, not probabilistic, since one added draw replaces the whole subsequent sequence. Then arm B, included only as a control on the assumption that a serialized structure obviously round-trips, came back **12/50 bit-exact and 38/50 lossy**. Verified at bit level: the writer emits the correct shortest round-tripping text, the language's own standard parser returns the original bits, and the JSON library's **default decoder** returns one ULP off; its documented exact-decode opt-in moves the same measurement to **50/50**. So the remedy had an unstated precondition, the technique gained a section for it, and the honest bound is stated too — for this suite's 1e-6 tolerance a 4e-16 error changes no verdict, which is a fact about its assertions and not about the practice. **A control that fails is worth more than the arm it was controlling for.** **Two rows are `unapplied` with MEASURED absences rather than assertions** — 0 fault-injecting lanes across seven trees, and **0 recorded-output assertions across four** (the fleet's oracles are entirely invariant-and-example based, so the amendment's rung has never been reached for, which is a stronger datum than 'unused'). Yield: three landings, all inside the subject wave 2 created, absorbed with **no home argument** — the best available evidence a boundary was drawn correctly. One cross-bundle catch (`seed-determinism-contract` states the rule better; landed as the discriminator, identity-vs-evidence, since cross-bundle links are forbidden). Two honest negatives about **wave 2's own ranking**: a post banded B for a docs taxonomy that turns out to live in the repository, not the post. Second slug collision in two waves (`snapshot testing` → `versioning-snapshots` at 9). Gate went red mid-wave on a sibling's half-forged subject; reported, not touched, and they fixed it. index/catalog left uncommitted twice — the regenerated index described a sibling's uncommitted application. |
| 1.4.0 | 2026-08-31 | `arxiv:2606.10106` agent-harness definition | 1 (768-word landing page vs **11,504 full text**, 15x) | 11 | 8 | 0 (8 already-covered, 2 leads, 1 declined) | 0 rows — none owed, nothing landed | 0 | **Focus did not apply, and that is the row's result.** The focus (name the ship blocker when an apply row reaches `better`) presupposes a landing; this run landed nothing, so it never reached the valve. Zero is correct here, not a miss: a definitional paper with no measurement, mined against a corpus that already owns all four of its conditions. Six of the eight catches state the rule *more sharply than the paper does* |
| 1.4.0 | 2026-08-31 | `arxiv:2604.11378` agent-loops-to-structured-graphs | 1 (739-word landing page vs **21,597 full text**, 29x) | 14 | 1 | 1 technique + 1 application (2 already-covered, 2 leads, 9 untriaged) | 1e (`experiment`, verdict `better`) | 0 | **Ship 0, blocker named per the declared focus: `confirmation` + `indeterminacy` - two of the four classes, both correct outcomes.** The triage pick named no project, so the cross-repo lane was never authorised; and two fixes are defensible (partition inert edges out of the severity denominator, or give explanatory nodes the evidence edges the code was built to carry) with nothing in the tree settling which, so shipping either would decide an open semantic question silently. **The focus applied cleanly and worked** - naming the class turned a bare zero into a return condition the owner can answer in one sentence. Source class called correctly before triage: a position paper that disclaims measurement twice is the weakest sub-kind the method recognises, expected yield was stated as 1-2 amendment-shaped landings, and that is what it produced. 0 of 3 fetches (twelfth consecutive). Landing found by the **enumeration hunt** - `graph-validation` states its coverage as a binary and names the space between as the category that must not exist; the source demonstrates a third class where the graph is valid, all checks pass, the run *succeeds*, and the plan was still wrong |
| 1.4.0 | 2026-08-31 | agent-harness-design-decisions (arXiv) | 1 (661 abstract / 16,055 full text = **24x**; the `/abs/` ingest returns the ad, the `/html/<id>v1` sibling returns the source) | 10 | 3 | 2 (1 technique + 1 golden-path amendment) | **1 row / 2 landed** (0c/1e/0s) | **1** (goat, main, pathspec, not pushed) - the `confirmation` blocker was named, the operator lifted it, and the change shipped in the same session | **Declared focus MET, and it is the first row to name a ship blocker by class AND then clear it.** The last row asked that an apply row reaching `better` name which of the four blockers held it; this one does, and rules out the other three explicitly: not `size` (a few lines, no foreign WIP in the file), not `indeterminacy` (the store's own statistic settles what the project intends), not `environment` (the harness ran). It is `confirmation` - the triage pick named registry rows only, and Phase 8 step 2 gates the tree write. **Apply coverage was 1 row for 2 landings and the row says so rather than inflating it**: the amendment is definitionally the same rule as the technique, so a second row would have been the same A/B counted twice. **The run's substance is that the source refutes its own headline statistics.** A 70-project study defines support/confidence/lift correctly in §5.1, then publishes a Table 10 whose support values exceed the marginal frequencies of their own antecedents as given in its own Tables 4/6/7 - by 2.87x, 4.34x and 1.04x - and whose highest-lift row recomputes from the paper's own conditional to lift 2.13 against a reported 3.4. Three of four rows also evidence a **binary** co-occurrence metric with a difference of **continuous mean scores**. The technique was written from the identity rather than from the paper: support(A^B) <= min(P(A),P(B)) is arithmetic, so corroboration cost **0 of 3 fetches** - twelfth consecutive zero-fetch run for a source carrying its own primary material. This is the method's "a source that implements a good idea badly is worth more than one that implements it well" holding at full strength: the paper located something real and the proof refutes itself. **Both hunts paid again.** The missing-stage hunt found the home - all six prior techniques on `measurement-honesty` are producer-side, and the golden path's thesis is that a dishonest number is *unfalsifiable*, so the gap was precisely the inversion. The enumeration hunt (fourteenth consecutive) then found the amendment in the same file's section heading: "A datum has five states, not two" was short by one, and the sixth - *refuted* - is absorbed by none of the five, because nothing errored, the instrument saw fine, and the value still cannot stand. **The apply step falsified my own prediction**, which is the fourth run in six where the seam corrected the finding rather than confirming it: I expected the 100% clamp to be the defect; it fires in 9 of 101 flagged states and never in the shipped configuration, so the defect is the denominator and the clamp is only its fingerprint - a distinction that matters, because removing the clamp changes nothing and looks like a fix. Ground-truth arm available for free, which is what made the A/B strong: the application already computes the same quantity correctly in the store that owns the data, and **needs no clamp there** because numerator and denominator share a predicate. **Parallel-run discipline held**: 4 live siblings, none on this subject; the regenerated index referenced four sibling techniques absent from `HEAD` (13 mentions, verified by `git grep`), so `index.json` and `catalog.json` were left uncommitted and only content was committed by pathspec - the v1.4.0 rule working as written, on its first encounter with the condition it was added for. 1 catch (the paper independently states Phase 2b's own rule), 5 untriaged with anchors, 1 lead. |
 **SHIP UPDATE (same session).** The operator lifted the `confirmation` blocker, so the apply moved from `experiment` to `code` and shipped as `4788b2c`. The A/B was re-run as arm A vs arm B of the real code on the project's own test runner and reproduced the scratch numbers exactly - 66/120 (55%) percentages wrong, 21 `isComplete` wrong, 9 clamped, against 0/0/0 after - which is the strongest form of this proof: the harness was not measuring a transcription of the tree, it was measuring the tree. **The blocker taxonomy earned itself here.** Naming `confirmation` rather than writing a bare zero is what made the ship a one-word request from the operator instead of a re-derivation, and the gap between the two was minutes. That is the first evidence the four-position valve does more than classify - it makes the correct outcome *actionable*, because three of the four positions name someone who can clear them. Worth carrying: **a run that names its blocker by class should also name who clears it.**
| 1.4.0 | 2026-08-31 | tkdodo/the-vertical-codebase (blog) | 1 (1,889 words) | 8 | 1 | 1 (amendment + a tenth golden-path failure mode) | **2 rows / 1 landed** (1c/1e/0s - escalated) | **1** (personas `16a4a978c`, not pushed) - the `confirmation` blocker was lifted by the operator in-session and the change shipped with no other obstacle; secondary **indeterminacy** stands on the third copy, deliberately left | **Focus applied and it held.** Declared focus was: when an apply row reaches `better`, name the ship blocker from the four and act per class. Reached `better`, named `confirmation` as primary with `indeterminacy` scoped to a single case rather than the whole row - the finer grain is the only refinement to report, and it argues the classes attach to *cases*, not to rows. Yield calibration stated before the triage table (1-2 findings, mostly catches, zero fetches) and matched exactly. 0/3 fetches, sixth consecutive for this class |
| 1.4.0 | 2026-08-31 | github:TkDodo/knip (OSS tool repo) | 1 (380 landing / 32,535 in-tree) | 21 | 2 | 2 techniques | **2 rows / 2 landed** (0c/2e/0s) | **1** - row 1 reached `not-better` so no ship was owed; row 2's **confirmation** blocker was cleared by the operator in the same session and the probe shipped (proven red on all three exit paths; project ratchet unmoved) | Focus applied and discharged: both apply rows named their blocker class. **The apply step refuted the run's own technique** - `excess-indicts-the-instrument` predicted that clustering separates misconfiguration from debt; on a real frozen baseline (230/982 unreachable files, 23.4%) it fired on 7 clusters at 2.4-4.3x lift and all 7 were genuine dead code, 0 root errors. Confound: dead code arrives in whole features, so both hypotheses predict the same distribution. Technique shipped with the correction folded in (clustering samples, a referrer check discriminates). Row 2 `better` on a zero result: 11/11 shadowing constructs detected, converting an unmeasurable property into a measured negative. 0 of 3 fetches - the class predicted it. |
| 1.4.0 | 2026-08-31 | github:TkDodo/pacer | 1 repo @ `e5c2b53` (836-word README vs **29,268 words of authored guides**; the 87k-word generated `reference/` tree excluded on purpose) | 12 | 4 | 1 amendment | **1 row / 1 landing** (1c/0e/0s; 1 better) | **0 — blocker class `environment`** | **The declared focus applied and named its class on the first try.** Apply reached `better` on a real paired arm (33 passed/1 failed → 34/0, same test binary, same inputs), and the ship blocker is the fourth position the last two runs discovered: the change spans two crates, the library crate builds and ran both arms, the caller crate's build script fails on a missing plugin permission — **pre-existing, reproduced with the diff stashed**. Per the focus's environment row: one line on what the operator must do, diff left uncommitted. Shipping the tested half alone was considered and rejected — it would leave the other crate failing on a field it does not yet know about, which is a landmine rather than a slice. **That is a refinement the focus's table does not carry: `size` says ship the smallest honest slice, and this run found a case where the smallest honest slice is the whole change, because the seam crosses a compilation boundary.** Extract 12 → test 4 → land 1 is the expected shape for a mature-subject source and was called before the table, not after. |
| 1.4.0 | 2026-08-31 | tkdodo.eu/creating-query-abstractions | 1 (3,789 words) | 10 | 2 | **1 technique + 1 golden-path amendment** | **1 row / 1 landing** (1c/0e/0s; 1 better) | **1** | **Focus moved, and it found a gap in its own vocabulary.** The declared focus was: when an apply row reaches `better`, name the ship blocker from the four classes and act per class. This row reached `better` and hit **two blockers in sequence, of different classes** - `confirmation` (the triage pick named no project), then, once authorized, `size` (compiling the change required narrowing two pre-existing pass-through option bags, past the authorized slice). Acting per class twice is what shipped it. The four-class table is written as if a row has one blocker; a row can have a queue of them, and the second only becomes visible after the first is cleared. |
| 1.4.0 | 2026-08-31 | `web:pgsql-hackers/2026-08` (uncurated reference index) | 1 index, **20 pages paginated by hand after the ingest returned page 1 of 20 silently** (2,680 msgs / 578 threads / 255 authors) | 9 | 2 verified + 4 caught | **2 techniques + 2 golden-path corrections + 1 sibling-technique amendment** | **2 rows / 2 landings** (1c/1e/0s; 1 better, 1 not-better) | **1** (tracklight, main, pathspec, not pushed) - `confirmation` cleared by the operator, and `artifact-choice` cleared in the same sentence | **Focus moved twice and both readings held.** The census rule fired three times, and once against the run's own A/B: 899 threads -> 578, six alarming repairs -> one. The ship-blocker-is-a-queue rule found a second blocker the first one hid, and it was not a `size` blocker this time but an **artifact-choice** one. |
| 1.4.0 | 2026-08-31 | agentic-coding-trends-report | 1 (13,029 words reported by the instrument / **3,418 real** - the reader was broken, not the source) | 9 | 3 | 3 (1 technique + 2 golden-path sections; 1 amendment; 1 script + new lib) | 2 rows (0c/1e/1s) - **1:1 with the two knowledge landings** | 1 (registry: `scripts/lib/pdf-text.mjs` + `research-ingest.mjs`, code A/B, `better`) | **Declared focus hit, both halves.** The census rule fired on the run's first command: the instrument's first number (13,029) and the hand-verified number (3,418) are reported as two figures, and the shape the instrument could not see is named - a PDF container decoded as UTF-8, which `--min-words` can never catch because binary always clears the floor. The ship-blocker-is-a-queue half also paid: the `better` row's first blocker was **capability** (no PDF reader existed anywhere in the fleet), and clearing it exposed the second, **fidelity** (a naive reader returns mojibake for subset fonts - exactly the bold runs where this class puts its numbers), which was invisible until the first cleared. Two blockers, in order, neither visible from where the other stood |
| 1.5.0 | 2026-08-31 | icse-2026-seip | 1 (74 refs, 8 read) | 30 | 7 | 2 | 0c/2e/0s | 1 | Ship 1 (tracklight docs correction, `de0a85f`). The second apply row is `unmeasurable` with its instrument named, not a zero. **Focus was handed forward and worked in an unexpected direction**: the declared focus said treat a ship blocker as a queue; here the queue was empty because the operator named the apply targets *in the triage answer*, so `confirmation` never fired and the run reached a tree write with no blocker at all. The other half of the focus — report an instrument's first number and its hand-verified number as two different figures — fired **four** times and changed a conclusion each time (150→74 references, 88→8→0 comparability claims, 12→0 promotion paths, and a worker's convergence premise that the citation graph refuted). |
| 1.2.0 | 2026-08-31 | 3d-documentary-ai | 1 | 13 | 2 | 2 | 0c/0e/2s | 0 (record-only commit in gravity) | Ship 0, and the reason is NEW - not an unreachable instrument (2026-08-30 first reading) and not an unconfirmed lane (second reading), but an **absent precondition**: neither amendment governs a call any fleet project makes. The tree has no generative-video request path at all and no composite subject+plate imaging call, so there was no code arm to build. Both simulations used three real cases from shipped data and each names its falsifier. Read fraction focus from the last run did not apply - this source is a 2,214-word video, not a repository |
| 1.5.0 | 2026-08-31 | breeze-tts2-local-voice | 1 (2,746-word video; apply step read 7 files across one connected tree) | 11 | 3 | 3 (1 new technique + 2 amendments + 1 cross-boundary half) | 3 rows (0c/2e/1s) — **1:1 with landings** | 0 (both experiments read-only and uncommitted; the operator's pick named no project, and Phase 8 step 2 gates the tree write) | **Declared focus NOT met, and the reason is a session constraint rather than a finding**: the focus asked for one parallel verification lane per candidate, and this session's standing instruction forbids dispatching agents unless asked, so Phase 6 ran serially. Extract→Test was 3/11, which the focus predicted would only be meaningful *after* the parallel change; it is owed by the next run that can dispatch. **Class calibration was declared and beat its own average**: a review class is reliable for "it shipped" and little else, but the hybrid's operating half is first-party, the expected yield was said out loud as 2–3 before the table, and it landed 3 — all from the operating half, none from the sponsored tour half. **The retrieval move is the reusable part**: all three landings came from holding the corpus's own ENUMERATIONS in mind while listening (a six-axis matrix, a capability-axis list, a four-item audition script) rather than from ranking the source's emphasis — which would have picked three catches instead. **The apply step produced corpus content twice and is now the run's most productive stage**, continuing the pattern the last five rows converge on: it refuted the new technique's transcript bullet at its premise (the tree's cloning engine is zero-shot), and it found a fact larger than anything the source said — a **non-commercially-licensed** engine recorded as a doc comment, protected today only by an identity guard about something else, which the obvious next feature deletes. |
| 1.5.0 | 2026-08-31 | ripgrep | 1 | 12 | 2 | 2 | 1c/0e/1s | 1 | **Extract->Test was 2/12 by operator choice, not by director capacity** - the declared focus does not apply and the reason is worth recording rather than scoring as a miss. Test->Landed converted 2/2, both landings carry an apply row with a verdict, and **one escalated `experiment` -> `code` and shipped in the same session** once the operator authorized the tree. `confirmation` was again the entire ship blocker, and again it cost one round trip - the second run in a row where the modal blocker was a question rather than an obstacle. Board pressure shaped the run: 3 of 12 candidates routed to subjects a live sibling held, so they sit untriaged rather than verified. |
| 1.6.0 | 2026-09-01 | adaptive-harness-review (youtube) | 1 (4,823-word video) | 10 | 7 | 1 technique + 2 corpus amendments (a golden-path enumeration, a sibling technique's predicate) | **1 row / 1 landing** (**1c**/0e/0s; 1 better) | **1** (tracklight `92c733b`, not pushed) — the operator lifted the tree question at Phase 7.5, where it was concrete, and the change shipped in the same session | **The declared focus was applied and one prediction was WRONG in the informative direction.** Focus: predict the ship class at triage from the fleet, carrying `seam: <slug>` or `seam: none` per row. Predicted `seam: tracklight` on the landing row from a `.rs`/schema grep, and it resolved — but **to a different seam than the one predicted**. The grep pointed at `decide_gate` + the `baseline_score` column; the runnable arm turned out to be `config/model_aliases.json`, a shipped config file the seam grep never looked at, and `decide_gate` proved *unmeasurable* (no update path, empty store). So the prediction was right about the project and wrong about the file, which is the honest answer to the focus's own question: **the fleet-level prediction is cheap and reliable; the file-level one is not, and pretending otherwise is what makes a prediction that is never wrong.** Recommend the row carry `seam: <slug>` only, never `seam: <file>`. One row also carried `seam: ?` because the cross-fleet loop grep **timed out at 2 minutes and was not retried** — recorded as unknown rather than absent, per the truncation rule. Class calibration stated before the table (mostly catches, 1 landing, in the evidence half) and matched exactly: 6/6 architecture candidates already covered, 1/1 landing from the critique half. **0 of 3 fetches, and the class table says this class's fetch IS the extraction** — a real exception with a reason: that rule holds for the *relay* half, which was 6/6 covered, so the fetch would have corroborated candidates that needed none. The apply step corrected the technique for the third consecutive run, and **shipping corrected it a second time** — the code arm narrowed the claim three ways the experiment arm could not see (one condition rather than the predicate; no baseline dating without a four-store schema change; the frozen flag is a proxy with false refusals). **This is the first `code` row in eight runs**, and the cause is the one the previous focus predicted: the tree question asked at 7.5 against a named seam and a run A/B, plus a target chosen at triage for being quiescent (1 untracked file) rather than merely in-domain. |

**apply, at `code` mode specifically (2026-08-31 fourth reading) - and the cause is
upstream of everything the last three correctives addressed.** Across the four
source-driven runs since the apply wave, `code` rows total **zero**: one experiment,
one experiment, two simulations, two simulations. Each run diagnosed a different
local blocker - a store that lives in production, an unconfirmed lane, an instrument
outside the tree - and each corrective worked on its own terms. This run exposes the
thing under all of them.

The two amendments landed here are good and neither could be A/B-tested anywhere,
because **no project in the fleet makes the call either one governs.** The domain has
two declared projects; one is a web product that declares `media-generation` and does
not generate media, and the other is a genuine studio that has no video generation and
makes no composite imaging calls. The corpus is being deepened in exactly the places
the fleet does not exercise, and Phase 7.5 discovers this at the *end* of a run, after
the verification budget is already spent.

That is a **domain-coverage** problem, not a seam-reachability one, and it needs a
different corrective than "pick the seam by instrument reachability". Next run's
declared focus: **check seam existence at Phase 5, not at Phase 7.5.** A triage row
should carry whether any fleet project makes the call its finding governs - a one-grep
question at triage time - so the apply expectation is declared before the operator
picks rather than discovered after. A row with no seam anywhere is still worth landing
(both of this run's were), but it should be picked knowing it will produce a
simulation, and the run should say so in the same breath it says the expected yield.

The secondary reading, owed to the operator: **the fleet's `media-generation` domain
declaration is doing less work than it looks like it is.** Two projects declare it and
neither exercises the bundle's video lane. Worth a `projects.json` conversation, or
worth accepting explicitly - but not worth rediscovering at Phase 7.5 a third time.

Reading the last ten rows: **the v1.4.0 fix worked and the funnel moved.** For the first
time in the window a run read the declared focus at Phase 1, carried a project and a file
on every triage row, and had a tree authorized by the same keystroke that picked the
finding — the failure four consecutive rows had each diagnosed differently. Apply held at
1:1 for a sixth run.

**Ship is still 0, and the diagnosis is now complete rather than merely different.** This
run was blocked by neither of the two causes the focus names: the change was ~40 lines
(not size) and the tree was authorized (not confirmation). It was blocked by a running
app holding the binary — an **environment** cause, which no run should resolve on its own
because killing an operator's process is their call, not the run's. So the focus's binary
split is wrong and becomes a trichotomy.

**Correction, made after reading a sibling's commit that landed minutes before this row.**
`future-agi` (run at the same hour, independently) reached the *same meta-finding* — the
focus's size/confirmation split is incomplete — and found a **different** missing
position: *indeterminacy*, where the tree is authorized and the change is two lines and
the run still correctly ships nothing, because the right semantics is an open question.
Its generalization is **change-shaped vs check-shaped techniques**: a check-shaped
technique applies by running against a tree and produces a finding, not a diff, so
"ship 0" is its correct outcome rather than a failure.

Two independent runs in one afternoon, each finding a different third position, is
stronger evidence than either alone — and it says the valve is not a trichotomy either.
Recording both rather than resolving them by majority:

| blocker | the run's correct action |
| --- | --- |
| **size** | ship the smallest honest slice — one file, one call site — measurement re-run on the slice |
| **confirmation** | say so in one clause and stop; the operator's to fix, not the run's |
| **indeterminacy** | the change is small and authorized but its semantics is open: report the finding, ship nothing, say what would settle it |
| **environment** | say in one line what the operator would have to do; leave the diff uncommitted rather than commit code that could not be built |
| 1.5.0 | 2026-08-31 | awesome-agentic-patterns | 1 (1,748-word landing page vs **~996k in-tree**; queue graded it a reference index, the **link/word ratio refuted that at Phase 2c** — 1 link per 193 words is a code-repository ratio, so no wave ran) | 11 | 3 | 2 (1 technique amendment + 1 script) | **1 row / 1 landing** (0c/1e/0s; 1 not-better) | 0 — the experiment returned `not-better`, so no ship was owed | **Declared focus did not apply and that is the result.** The focus (parallelise Phase 6 when a wave floods the director) presumes a reference index; this source was not one, and the queue's grade was the thing that was wrong. Focus should attach to the LANE, not to the next run. |
| 1.5.0 | 2026-08-31 | agentic-operating-level | 1 (7,937-word doctrine talk; **no system, no artifact, no number, no n=1** — class read at Phase 2 and expected yield stated as 1-2 amendments before the table) | 14 | 3 (operator picked 1/2/6) | 2 amendments | **2 rows / 2 landings** (0c/1e/1s; both `better`) | 0 — triage answer named no project, and Phase 8 requires operator confirmation before a project tree is touched; both arms were read-only | **Declared focus did not bind and the row says why**: it governs a wave returning more candidates than the director can verify, and one video produced 14 candidates of which the operator picked 3 — Phase 6 ran serially in full. **The class reading did the work the focus would have.** A doctrine talk inverts this method's economics: it **strips perfectly** (a proper-noun-free ladder) and **corroborates not at all**, so the strip test performed zero triage and the corroboration table refused nearly everything. Both landings came from the same move — a document declaring its own completeness (`"three honest resolutions"`, `"owned by exactly one of these"`) — and **the source was contradicted on both while having located both**, the cleanest instance of that pattern the ledger holds. Extract→Test 3/14 is low by design, not by failure |
| 1.5.0 | 2026-08-31 | boundary-software-factory | 1 | 12 | 1 | 1 | 1e | 0 | **Ship 0 is correct and owed nothing** - the landing is a registry-side gate measure; no project change was warranted, and the apply step was read-only by design. The declared focus (parallelise the mechanical half of Phase 6) **did not apply and was said so before the table**: it was written for wave runs returning more candidates than a director can verify, and a single dialogue with one operator-picked row has no mechanical half to fan out. Extract->Test is 1/12 by operator choice, not director capacity. Class economics predicted the run exactly: dialogue, expected yield stated as 1-3 findings before triage, **0 of 3 fetches spent**, corroboration entirely corpus-internal. **The apply step refuted its own first number for the second time in this skill's history** - arm B's 1.42x by changed lines was surface-area artifact; the control (hold files-touched fixed) collapsed and inverted the gradient. Instrument's first number wrong again: that is now five sightings across three runs |
| 1.3.1 | 2026-09-01 | voltagent-awesome-ai-agent-papers (wave 4) | 1 (32 of 382 read, 350 ranked+recorded) | 24 | 8 | 9 | 0c/0e/0s (9 unapplied, one reason, checked per finding) | 0 | **8/8 lanes worth a slot - the run's best rate**, on the Multi-Agent cluster wave 1 dropped for contention. Three headlines died to arithmetic (a hindsight-oracle denominator reproduced 5/5; an authority paper that measured the inverse of its title; a phase transition whose control parameter has no budget term). One worker retracted its own candidate after applying the corpus's own test. **The run's own error: an acceptance rule built on a hole that was not one** - a verification grep returned 22 files piped through `head -8`, and a second instrument truncated the same subject out of its top-6. Two independent truncations, one hidden subject. Apply 0 for a reason distinct from wave 3's: these govern structures the fleet does not build (no join, no recursive decomposer, no panel, no a11y ladder), each checked against the tree individually. |
| 1.6.0 | 2026-09-01 | `slideops` (practitioner repo, README as artifact of FORM) | 1 (1,033 landing / ~2,470 in-tree operating docs) | 8 | 7 | **1 new subject** (golden path + 7 techniques + 2 applications) + 1 technique in `docs-sync` + 1 instrument (`check-readmes.mjs`) | 2 rows: 0c/**1e**/0s + 1 unapplied — 2:2 with the landing clusters | 0 (**blocked: foreign WIP**, not confirmation) | **Both halves of the declared focus applied, and the second one worked.** Class carried into the numbers: this was a repository mined under an *inverted* rule — the operator scoped the run to the README as an artifact of form, so the file Phase 2b says to distrust was the primary source. Expected yield was stated as 4-8 candidates + one subject-sized gap before the triage table; actual 8 and one. The tree question was moved to Phase 7.5 and **the ship zero changed character because of it**: the operator authorized a named tree against a concrete seam and a measured two-arm result, and the block that remained was the tree carrying a live 38-line in-flight append in the exact file — a genuine authorization-independent boundary, which is precisely the distinction the focus was written to expose. Six consecutive runs blocked on `confirmation`; this one was not. |
| 1.6.0 | 2026-09-01 | `firstmate` (OSS tool repo behaving as first-party practitioner account; **2,434 landing / 174,027 in-tree**, 76:1) | 1 | 14 | 4 | 2 techniques + 2 amendments | **4 rows: 0c/4e/0s — 1:1 with landings** | 0 (**3 of 4 `declined: no change warranted`**, 1 open decision) | **Both halves of the declared focus applied.** Class carried into the numbers before the triage table: expected yield stated as *above the class norm, 3-5, mostly amendments*; actual 4. The 14→4 ratio is an operator pick, not director capacity — 10 rows recorded **untriaged with anchors**, none declined. **The tree question was asked at Phase 7.5, not at triage**, and the ship zero changed character again because of it: three of four rows are `declined: no change warranted` rather than `blocked: confirmation` — no project holds the caching-injector defect, the fleet's turn-end hook *already implements* the amendment (which is why it could validate it), and the delivery probe is an instrument rather than a change. Seventh consecutive run with ship 0; second consecutive run where the zero is not an authorization failure. **The apply step refuted the run's own document before commit for the second consecutive run**, and this time from a tree that had already solved the problem *better* than the draft prescribed — the amendment's "fail-open, silently" became "open to the actor, loud to the operator, on a code of its own." Reading a project that agrees with a finding is where the finding's wording gets fixed. **0 of 3 fetches — fourteenth consecutive.** Three of four landings came from an enumeration declaring its own completeness. |
| 1.6.0 | 2026-09-01 | `reallusion-ai-studio` (**vendor release announcement**, product landing page) | 1 (1,263 words) | 7 | 3 | **1 golden-path scope clause** (`cinematic-language`) + 1 application | 1 row: 0c/0e/**1s** — 1:1 with the landing | 0 (**declined: no change warranted** — the clause confirms the authorized tree's design; gravity AND pof were both authorized and neither needed a commit) | **The declared focus worked and the run still landed almost nothing — those are the same sentence.** Seam prediction was made at triage from `loadFleet()` + each candidate's registry-map, before picks: `gravity` predicted for rows 1/2/4/7, `seam: none` for 3/5/6. **Prediction was right in direction and wrong about what it would buy** — gravity was the first `code`-reachable tree in eight runs (0 WIP, both seams, a calibrated A/B harness already built), the operator authorized it *and* pof, and the correct mode was still `simulation`, because what survived verification was navigational rather than behavioural. That is the honest answer to the focus's own check question: the prediction was not wrong, the *ship-class inference from it* was — a seam predicts where a finding would land, not that the finding will be code-shaped. **5 of 7 candidates already covered, including one this run first wrote up as a verified hole and caught before commit.** Both operator-picked "real gaps" fell to techniques stating the same rules with more care. The run's product is a method lesson (lane 2): an absence check run on *industry jargon* (`previsualization`, `blocking pass`, `proxy render`) returns a genuine zero over a corpus that strips jargon as thoroughly as product names — it measured the purity gate, and `scene-grammar-progression` had owned the concept since run 26. Expected yield was stated at 1-3 before the triage table; actual 1 landing, 0 leads, 5 catches, 3 untriaged. |

Next run's declared focus: **when an apply row reaches `better`, name the ship blocker
from those four, and act per class.** A run that reports "ship 0" without naming which
has not finished its own row. And note the shape both sightings share: **three of the four
are correct outcomes, not failures.** Only *size* is a blocker a run should have beaten.
That reframes the whole ship column — it has been read as a defect count for five runs,
and at least some of its zeros were the method working.

**The focus above stands, untested.** The `2606.10106` run could not reach it — the valve
opens only after a landing, and that run landed nothing. It adds a different observation
instead, about the scorecard rather than about the ship column: **a `landed 0` because the
corpus already owned every candidate is structurally different from a `landed 0` because
the run failed to convert its picks, and the five stage counts render them identically.**
This row is the first in the window of the first kind — 11 extracted, 8 verified, 8
already-covered, and in six of those the corpus's own phrasing was the better instrument.
Nothing in `research / extract / test / apply / ship` can express "the corpus won". Until
it can, a saturation run and a botched run look the same in the funnel, and averaging them
mis-reads both. **Next run's declared focus is unchanged** (name the ship blocker on a
`better` row); the secondary ask is to record, on any row landing zero, *which* of the two
zeros it is.

**2026-08-31, `arxiv:2604.11378`.** The focus was applied and it worked: the `better`
row's ship-0 resolved to `confirmation` + `indeterminacy`, and naming them converted a
bare zero into a one-sentence question the project owner can answer. Two of the four
classes fired at once, which the focus's table permits but does not discuss — worth
noting that they are not exclusive, and that the *indeterminacy* half is the one that
would have survived even with authorisation. The prior run's secondary ask is also
answerable here: this run's zero is a **blocked** zero, not a saturation zero.

But the stage this run actually lost at is neither. Extract 14, test 1 — and **9 rows
recorded untriaged, two of which carry a `real gap` read** (a context-partition rule with
no prior art anywhere in `llm-agent/`, and a proved bound on how staged validation
compounds). Those are fully extracted, anchored, and cost nothing more to verify; they
are strictly cheaper than the next fresh source, whose extraction has not been paid for
yet. Across the last ten rows `research` is the constant **1** — never the variable — so
the front of the funnel is not short of sources, it is short of *returns to sources
already mined*. The convergence rule the method leans on ("two independent sources from
different runs reaching the same rule… it only exists if past runs wrote down what they
saw") has been faithfully fed by every untriaged table written, and nothing reads them:
`/intake apply` reads `applied.md`, `status` reads the ledger, and no path reads an
untriaged row.

**Next run's declared focus: at Phase 1, grep the untriaged tables of the last five
source notes for the incoming source's subjects, and say in the row what that returned.**
A hit is either a second sighting — the cheapest corroboration this method has, costing
no fetch — or a candidate whose extraction is already paid for. A miss costs one grep and
is worth reporting as a miss. The row after next says whether the untriaged backlog moved
or only grew.

---

**Added by `intake-vertical-0831`, after the paragraph above.** That focus was written by a
sibling while this run was at Phase 7; this run loaded and executed the *previous* focus
(name the ship blocker from the four classes and act per class). Both readings are recorded
rather than merged, and the sibling's focus stands as the next run's — this is an
observation about a column, not a competing instruction.

**The focus held, with one refinement: the blocker classes attach to CASES, not to rows.**
This run reached `better` and named `confirmation` for the row, but `indeterminacy` applied
to exactly one of the two waste cases inside it — one duplicate was byte-identical to a
public function and carries no open question, while the other may be deliberately cheaper
for a hot path. A row forced to carry one class would have had to discard that, and the
discarded half is the part that tells the operator which question to answer.

**And the ship column's dominant blocker is self-inflicted, which no row has yet said.**
Across the last ten rows, `confirmation` is the most frequent named blocker — three of the
last four runs that reached `better`. It is not the operator withholding permission: it is
that **nobody asked.** Phase 5 puts the operator in the chair, prints a table, and asks
exactly one question — which candidates to land. It never asks which tree may be touched,
even though Phase 4 has *already* named the finding's domain and `loadFleet()` can list the
projects that declare it. So the run spends its whole budget, reaches a verdict that
warrants a change, and only then discovers it lacks an authorization it could have had for
free an hour earlier, when the operator was present and answering questions.

That reframes the ship column a third time. The last two runs established that three of the
four blocker classes are correct outcomes rather than failures. This one adds: the fourth
is mostly a **prompt defect**, not a permission problem — and it is the one blocker the
method can remove without the operator changing anything they do.

---

**Reading the last ten rows (pacer, 2026-08-31).** `apply` is fixed: ten of ten rows
carry apply rows, which was the weak stage four runs ago and is not any more. `ship`
is 0 in eight of those ten, and the last three runs have been busy re-classifying
those zeros rather than reducing them. That work was right, and it is now finished
enough to read: across the ten, the blocker classes are **`confirmation` ×3**,
**`environment` ×1**, **`not-better`/none-owed ×2**, and the rest architectural or
too large for a diff.

**`confirmation` is the modal blocker, and it is the only one the method causes
itself.** Environment is the machine's, not-better is a correct outcome, and
architectural is honest scope. But `confirmation` fires because Phase 5 asks the
operator to pick a *candidate* and Phase 8 then discovers, three phases later, that
touching a tree needed a project named at pick time. The run does all the work, reaches
`better`, and stops at a gate it could have opened in the same sentence it opened the
triage table with. Three runs have now paid for this and each recorded it as a correct
refusal — which it is, per the rules as written, and which is exactly why it keeps
happening.

This run adds one refinement to the valve's `size` row from the other direction. The
focus's table says a `size` blocker should ship the smallest honest slice. Here the
tested half was small, green, and *unshippable alone*: it changes a type the other
crate consumes, so shipping it would leave a second crate failing on a field it does
not yet know about. **A slice is only honest if it compiles on both sides of every
boundary it crosses** — otherwise the smallest honest slice is the whole change, and
"ship something" is the wrong instinct.

Next run's declared focus: **when the triage table is put to the operator, every row
whose shape is `technique`, `amendment` or `golden-path` carries the project it would
be applied against, named in its own column.** The pick then confirms the tree by
construction and Phase 8 step 2 is already satisfied. A run that reports `ship 0` with
blocker class `confirmation` after that change has found something new; before it, it
has only found the gap between two phases of this file.

---

**Run 2026-08-31 (`tkdodo-creating-query-abstractions`), reading the focus it was handed.**
The focus worked and is not finished. Naming the blocker class did change the run's
behaviour - it turned "ship 0, needs confirmation" into an ask, and the ask into a
landing. But the row hit `confirmation` and then `size`, in that order, and the second
was invisible until the first cleared: nobody could have known the compiling change
exceeded the slice before the slice was authorized. **A ship blocker is a queue, not a
value.** A run that names one and stops has answered only the blocker it could see from
where it was standing.

The other thing this run is evidence for is older and got sharper: **an instrument's
first number is not a measurement.** The census reported 13 divergent keys, then 3 after
the parse window was tightened, then 1 real after hand-verification - and the most
serious defect in the tree was in none of those counts, because it is written in a shape
the instrument cannot parse. Three of the four rows the instrument produced were wrong in
some way, in both directions, and every correction came from opening the file. The
technique landed stronger for it, and the application says so in its own limitations
section rather than in a footnote.

Next run's declared focus: **when an apply row reaches `better`, expect the ship blocker
to be a queue - name the one in front, clear it, then re-ask what blocks now.** And carry
the instrument rule beside it: report a census's first number and its hand-verified
number as two different figures, never one, and state what shape the instrument cannot
see before reporting what it found.
---

**Run 2026-08-31 (`pgsql-hackers-2026-08`), reading the focus it was handed.**

The census rule is now the most productive line in this file, and this run is the
evidence that it should be promoted from a lesson to a rule the method carries. It
fired three times: 899 threads to 578 (a 36% overcount from one unstripped HTML
entity), 257 authors to 255, and — the one that matters — **six alarming repairs to
one**, against an instrument this run had built ten minutes earlier to test its own
landing. Three of the four rows the harness promoted were hardening commits, not
repairs, because *hardening and repair share a vocabulary*: a commit that adds a panic
guard and one that fixes a panic read identically at the subject line. The technique
shipped with that limitation in its own text rather than in a footnote, and the
application says which number was the instrument's and which was hand-verified.

The ship-blocker-is-a-queue rule also held, and returned a class the previous run's
table does not have. Row 1 hit `confirmation`, exactly as the vertical-codebase run
predicted for a pick that names candidates rather than a project. But clearing it in
imagination exposes a blocker that is not on the list: **there is no product change to
ship.** The technique is a measurement, so the shippable artifact is the *harness*, and
the harness is the thing the A/B just proved unreliable in its most attention-grabbing
column. Call the class **artifact-choice**: the row is authorized, the change is small,
and what is unresolved is *which object* the landing is. It is worth adding to the
blocker table, because a measurement technique will hit it every time and a code
technique never will.

One thing about the source class is worth carrying forward. The reference-index lane
assumes a **curator** — its "one finding of its own" is what a bibliography's author
chose to include and leave out. A mailing list, an issue tracker and a commit log invert
the ratio the same way and have no curator at all, so that finding does not exist and a
run reaching for it will invent an opinion nobody held. What an uncurated index offers
instead is a *distribution*, and the distribution is a fact about attention rather than
about judgement. The lane should say so in one line.

Next run's declared focus: **when a run builds an instrument to test its own landing,
report the instrument's number and the hand-verified number as two figures in the
application itself, and state the shape the instrument cannot see BEFORE stating what it
found.** Three consecutive runs have now had their own instrument corrected by opening
the files it ranked, and in every case the error ran toward the alarming reading. A run
that reports a single number from an instrument it wrote this session has not measured
anything yet.

---

**Run 2026-08-31 (`agentic-coding-trends-report`), and a defect in this table's own
`ship` column.**

The declared focus was hit twice over and is written up in the row. The more useful
finding is about the scorecard rather than the run. `ship` counts project commits, and
this run's two knowledge landings produced zero of them — correctly, both times. One
application resolved `structural-only`: the tree confirmed the technique by its shape
and no behavioural change was warranted. The other resolved `not-better`: the
discriminator ran on two real instruments and both said the existing rule already
governed, so changing either project would have been changing it for nothing.

**A correct decline and a blocked run score identically here, and they are opposite
results.** Ten rows of `ship 0` have been read for several runs now as the funnel's
weakest stage, and the reading is unsafe: some of those zeros are the method working.
This is the same defect shape as both findings the run landed — a count keying on the
property that was easy to measure rather than the one that decides the verdict — which
is either a coincidence worth noting or a third sighting of something the corpus should
own, and the source note records it as the latter for a future run to confirm.

Next run's declared focus: **write `ship` with its predicate.** A zero is
`ship 0 (declined: no change warranted)` or `ship 0 (blocked: <class>)`, and only the
second is a funnel loss. Then re-read the last ten rows under that split and say which
stage the funnel actually loses at — the current answer may not survive the correction.

---

**Run 2026-08-31 (`icse-2026-seip`), reading the wave it was handed.** The declared focus
arrived in two halves and only one of them could fire. The ship-blocker-as-a-queue half
never engaged, because the operator named the apply targets *inside the triage answer* —
so `confirmation`, the modal blocker of the last ten runs, was satisfied three phases
before Phase 8 asked for it. That is worth stating as a result rather than a miss: **the
cheapest fix for the modal ship blocker is to ask for the tree in the same question that
asks for the pick**, and the previous focus that put a project column on every triage row
is what made it natural to ask.

The other half fired four times and changed a conclusion each time. **An instrument's
first number is not its measurement**: a raw grep counted 150 references where two
structural parses agreed on 74; a comparability census returned 88 matches that
hand-classified to 8 and then to 0; a promotion-path census returned 12 sites that
hand-verified to 0; and a worker's confident convergence claim was refuted by the citation
graph. Four instruments, four wrong first numbers, and in every case the correction came
from opening the thing. Two runs now say this; a third makes it a rule this file carries.

**The weakest stage has moved, and the wave moved it.** `apply` is fixed — ten of ten rows
carry rows or a stated none-owed — and `ship` is now 1 in five of the last ten, up from
one in ten. The loss is now at **Extract→Test**: 30 candidates in, 7 verified, the worst
ratio in the window. That is the direct consequence of fixing the stage above it. Eight
parallel readers produce candidates faster than one serial director can verify them, and
most of what the director did was mechanical quote-checking rather than judgment.

Next run's declared focus: **when a wave returns more candidates than the director can
verify, parallelise the mechanical half of Phase 6 and keep only the judgment serial.**
Dispatch one verification lane per candidate — given the claim, the prior-art file address
and the worker's quote, returning whether the quote is verbatim, what the surrounding
section says, and what the file's own enumeration claims — then spend the director's whole
serial budget on deciding which confirmed gaps to land. A run that reports a
Extract→Test ratio under a third after that change has found something new; before it, it
has only found that this method parallelised its front and left its middle alone.

**SHIP UPDATE (same session).** The operator lifted `confirmation` and, in the same
sentence, answered the blocker behind it by naming the destination — so the proposed
fifth class **artifact-choice** was real, was hit, and was cleared by one word from the
person who had it. That is the second run in a row where naming a blocker by class
turned a zero into a landing within minutes, and the first evidence that the *queue*
reading pays: the second blocker was invisible until the first cleared, exactly as the
previous row predicted, and it was not `size`.

The shipped artifact is smaller than the tested one **because the A/B said so**. The
severity ranking — the column a reader's eye goes to first — was built, measured wrong
three times in four, and removed before shipping; what ships prints the repair subjects
instead and says in its own output that the counts rank the reading order and not the
risk. Worth carrying: **when an A/B refutes part of a technique, the ship is where that
refutation becomes load-bearing** — a landing that ships the refuted half anyway has
recorded the finding and then contradicted it.

One project-side fact belongs in the next run's expectations rather than here: the
tree's suite was **already red** on a guard unrelated to this work, verified by stashing
and re-running. A cross-repo ship onto a red board is fine when the red is proven
pre-existing and named, and the proving costs one stash — but a run that does not stash
cannot tell its own breakage from the tree's, and would either claim a false green or
abandon a good landing.

### 2026-08-31 - ripgrep

**The declared focus did not apply, and that is a result rather than a miss.** The
previous run's focus was to parallelise the mechanical half of Phase 6 when a wave
returns more candidates than one director can verify. This run had no wave: one
source, twelve candidates, and an attended triage in which the operator picked two.
Extract->Test reads 2/12, and the ratio is a *steering decision*, not a capacity
loss - the eight unverified rows were never in contention for the budget. Reporting
2/12 beside the wave runs' 7/30 without that distinction would corrupt the funnel
reading the lane exists to produce, which is the lesson worth carrying: **the
Extract->Test ratio is only a capacity signal on unattended or wave runs; on an
attended run it measures the operator's appetite and nothing about the method.**
The scorecard should separate the two before the next reading is taken.

**What the run confirms instead is the value of the class-first read.** The class
was named before extraction, its prediction was stated out loud - corroborates
corpus-internally, fetch budget will not bind, yield concentrated in amendments to
mature subjects - and all three held: **0 of 3 fetches spent**, both landings in
ten-technique and eight-technique subjects, neither a new subject. Three runs now
have made a class prediction before the triage table; three have had it hold.

**The strongest landing came from the contradiction hunt, again.** `stake-before-merit`
explicitly denies that text authorship matters, and the source draws exactly that
denied distinction by channel. That is the third consecutive run where a *denied
symmetry* in a mature technique produced the finding, and it is now the highest-yield
Phase 6 hunt this method has: an enumeration invites one question, and a denial
invites the same question with a stronger prior, because somebody already thought
about it and wrote down a boundary that can be tested.

**The two-numbers discipline fired again and changed the verdict's meaning.** The
apply probe's raw falsifier count was 184 excluded files carrying URL-shaped content;
hand-classifying every one collapsed it to **0**. Reporting 184 would have turned a
disclosure finding into a phantom near-miss. That is now five consecutive runs in
which an instrument's first number was wrong and the correction came from opening the
thing - the rule the method already carries, earning its keep on a run that had no
wave and no worker to blame it on.

Next run's declared focus: **split the Extract->Test column by triage mode before
reading the funnel again.** An attended run and a wave run are measuring different
things through the same ratio, and the last ten rows mix them freely - which means the
"weakest stage" reading that drives every method edit is computed over two
incomparable populations. Record the mode on the row (attended / unattended /
wave), read the two series separately, and name the weakest stage *within* the
series the next run belongs to. A run that reports a stage loss without saying which
series it belongs to has measured nothing the method can act on.

**The focus missed because the grade did, and that is a new failure mode.** Nine of the
last ten rows moved their declared focus or said why not; this one could not even
attempt it, because the focus was written for a source class this source turned out
not to belong to. The queue graded it a reference index from its stars and its
topic; Phase 2c's ratio test — outbound links over the source's own word count —
refuted that in one command, before a single fetch. **Grade the class from the tree,
never from the queue row**, and run the ratio test on every repository-shaped source
rather than only on ones that look like bibliographies. A focus inherited from run
N-1 is only spendable if run N's class matches; otherwise it should be handed
forward intact rather than reported as missed.

**Extract→Test is 11→3 and still the loss**, but this run says the ratio is not
one number. Eight of the eleven candidates were never picked, and that was correct:
the corpus is mature (343 subjects, 2,224 techniques), so most extractions resolve to
prior art that already says it better — `gate-liveness` owned an entire candidate,
and owned it more thoroughly than the source explained it. The stage that actually
cost this run was neither Extract nor Test but **verification of the instrument**:
three separate first numbers (24 surviving placeholders, 576 contradictions, 1797
statute flags) were each wrong, and each correction came from opening the artifact
instead of trusting the count. That is now the fourth, fifth and sixth confirmations
of the rule the last scorecard promoted.

Next run's declared focus: **when a run builds or runs an instrument, budget a
hand-inspection pass before the number reaches the note, and record the first number
beside the corrected one.** Every run that has done this found the first number
wrong; no run has yet reported the pair, so the corpus cannot see how large the
correction usually is. A run that reports both numbers has made the rule measurable
instead of merely repeated.

---

**Run 2026-08-31 (`semantica`), and the declared focus did not apply.** The focus
inherited from the wave run was to parallelise the mechanical half of Phase 6 when a
wave returns more candidates than the director can verify. This run had no wave: one
repository, one director, 18 candidates. **Saying why a focus did not fire is a result,
not a miss** — the focus was written for a reference-index lane and is scoped to it, and
a single-source run should say so rather than manufacture parallelism to comply.

What the run has instead is a clean number on the stage that focus was aimed at.
**Extract→Test was 18→6, a third**, against the 30→7 that named Extract→Test as the
weakest stage. The mechanism was not parallelism; it was **reading the corpus's own
denials first**. Two of the six landings were located by the Phase 6 enumeration hunt
rather than by the source: `absent-degrades-malformed-fails-fast` declines a case in one
line ("that is a runtime fact and a different technique") and the technique it names did
not exist; `quality-gates` enumerates three ways a check cannot fire and the source
supplied a fourth of a different kind. Neither was visible in the candidate list — both
were visible in the file the candidate mapped to.

**The apply stage produced the run's best material, and it did so by losing.** Six rows,
six modes, and the two `not-better` verdicts each **corrected the technique that
generated them** before it was a day old. The SSRF consumer's own comments explained why
the pre-flight validator the technique had implicitly deprecated is not redundant — a
literal address never reaches a connect-time resolver — and the lockfile row discovered
that the ecosystem's strict-install command already *is* the oracle the technique
prescribes building, which would otherwise have shipped duplicated logic to every reader
whose installer already enforces it. **A technique that survives its own A/B unchanged
has been confirmed; one that is corrected by it has been finished.** Three runs have now
produced an amendment from a `not-better`; that is a rule this method should carry rather
than a recurring pleasant surprise.

The counter-observation is worth recording against it: `ship` is 0 again, and the reason
is the same one the blocker taxonomy keeps naming — **confirmation**. Two rows
(`vacuous-by-evaluation`, `verification-scope`) came back `better` with the change
argued, the measurable named, and the fix under ten lines, and both stopped at Phase 8
step 2 because the operator's triage answer named no project. The previous run learned
that the cheapest fix is to ask for the tree in the same question that asks for the pick;
this run asked, in one line, and the answer did not include one. Asking is necessary and
was not sufficient.

Next run's declared focus: **when a triage answer picks rows but names no project, treat
the highest-`better` row's project as a second question asked at the moment the apply
step confirms a seam — not at Phase 8.** The seam is what makes the question concrete
("this gate scores identically with its manifest gutted; may I fix it in `personas`?"),
and asking it at Phase 7.5, with the arms already run, is a different question from the
speculative one asked at triage. A run that reports a non-zero `ship` after that change
has found something; before it, the taxonomy has only been re-confirmed.

**Weakest stage, last ten runs: still Extract->Test, and the previous focus never got
tested.** Roughly 27 verified out of ~134 extracted, about a fifth - no better than the
window that named it. `apply` is healthy (ten of ten rows carry a row or a stated
none-owed) and `ship` has genuinely moved, 5 of the last 10 against 1 in 10 two windows
ago. The declared focus - parallelise the mechanical half of Phase 6 - has now sat
undischarged for three consecutive runs because all three were single-source runs with
no wave to parallelise. A focus that only fires on one source class is not a focus, it
is a contingency.

**And the ratio is probably measuring the wrong thing.** Three of the last four runs
recorded Extract->Test explicitly as *operator choice*: 1 of 12 here, 2 of 12 on
ripgrep, 2 of 21 on knip. Phase 3 is instructed to extract 5-15 candidates and Phase 5
is a cheap steering gate whose whole purpose is that most of them do not advance - so a
low ratio is the gate working, not the funnel leaking. Counting an unpicked candidate as
loss reads operator selectivity as pipeline failure, and it is the same error the method
forbids elsewhere: an untriaged candidate carries no judgment, and filing it as one
poisons the reading.

Next run's declared focus: **split the Test column so the funnel stops mismeasuring
itself.** Record `test` as `picked/verified/dropped` against `extracted`, where `picked`
is the operator's (or the unattended rule's) selection and `dropped` is a candidate that
was verified and resolved to already-covered. Then the stage that can actually leak -
picked-but-not-resolved - becomes visible, and the untriaged remainder stops being
counted against the run. A run that reports the split and finds picked->verified below
80% has found a real loss; before the split, nobody can tell the two apart.

Second, carried because it is now well past its threshold: **an instrument's first
number is not its measurement** has fired five times across three runs, and twice in
this one (arm B's 1.42x line gradient was surface-area artifact; the 62.9% baseline was
a saturated predicate). It is no longer a lesson. It belongs in the method as a rule of
Phase 7.5, and the next run to touch `SKILL.md` should carry it there.

**Ship converted after the fact, and the mechanism is worth naming.** The row above
first read `ship 0` for the reason nine of the last ten did: the operator's triage
answer named the rows and not a tree, so Phase 8's confirmation gate was unsatisfied
and the apply row banked the authorization as a return condition. The operator then
asked for the change in one line, and it shipped in one session - an `experiment` row
escalating to `code` with no new investigation, because the seam, the measurable, the
arms and the falsifier were all already established. **That is the second consecutive
run where `confirmation` was the whole of the ship blocker and lifting it cost a single
round trip**, which says the previous focus's fix - ask for the tree in the same
question that asks for the pick - is the right fix and simply was not applied here. It
should be a standing part of the Phase 5 question rather than a lesson that has to be
re-derived: **the triage prompt should ask which rows to land AND which trees may be
touched, in one question.**

**Run 2026-08-31 (`agentic-operating-level`), and the third consecutive confirmation
zero.** The paragraph above named the fix - *the triage prompt should ask which rows
to land AND which trees may be touched, in one question* - and this run did not apply
it either, asked the standard question, got three row numbers and no tree, and filed
two `better` apply rows with `ship 0 (blocked: confirmation)`. That is now three runs
running, which is this method's own threshold for promoting a lesson into a rule, so
it has been promoted: Phase 5's question in `SKILL.md` now asks for both in one
breath. **The instructive part is that the diagnosis was already written down and
still did not travel** - the closing paragraph of a scorecard is read at Phase 1 for
the focus line and apparently not for anything else, which is a second-order version
of the same failure the focus mechanism exists to fix.

**What the run did produce is a class reading, and it belongs beside the
source-class table.** A **doctrine talk** - a practitioner presenting a framework
with no system, no artifact and no measurement - inverts this method's economics.
The strip test and the corroboration table are ordered on the assumption that
sources are made of proper nouns: strip first because it is cheap and kills most
candidates, then spend the corroboration budget on survivors. A doctrine talk strips
*perfectly*, by construction, so the cheap filter removes nothing and every candidate
arrives at the expensive one. Running the two in the shipped order cost a full
ranking pass over rows the corroboration table was always going to refuse.
**For a doctrine talk, ask what could authorize this before asking what survives
stripping.**

Both landings then came from one move, and it is the move that works when a source
cannot authorize anything: **find where a document declares its own completeness and
ask whether it is short by one.** *"There are three honest resolutions"* was short by
one; *"every failing case is owned by exactly one of these"* had a row holding two
causes. Neither finding is in the source. The source pointed at both and got both
wrong - a direction with no mechanism, and a mechanism that is backwards - which is
the fourth run to say that a source implementing a good idea badly outperforms one
implementing it well, and the cleanest instance so far, because *nothing* here was
quotable.

Next run's declared focus: **stop reporting Extract→Test as a funnel loss without
splitting it by what the corroboration table can authorize.** This run extracted 14
and tested 3, which reads as a 79% loss at the method's weakest-looking stage - and
is nothing of the kind, because eleven of those rows were unmeasured doctrine that no
amount of verification budget could have promoted. The stage that actually loses
content is invisible in that ratio. Split the extract count at triage into
*authorizable* (a primary exists, or convergence is reachable, or a tree can be
opened) and *unauthorizable-by-class*, carry both numbers into the row, and measure
Test against the first. A run that then still shows a low ratio has found a real
verification-budget problem; before the split, it has only found that it read a
source class whose claims nobody could have landed.

---

**Run 2026-08-31 (`pgrust`), and the authorizability split arrived one run early.**
The focus above was written by a sibling *after* this run's triage table had shipped,
so it could not steer the run — but the run happens to be the cleanest possible test
of it, and the answer is not the one the split was designed to produce.

Of 13 candidates, **13 were authorizable and 0 were unauthorizable-by-class.** That
is not luck, it is the class: a repository source ships the code that implements its
claims, so every row arrives with a tree that can be opened, and the corroboration
table's "real code you read" lane is available for all of them at zero fetch. Test
was 6 of 13 (46%), and the seven that did not advance were dropped on *judgment* —
two resolved to catches against subjects that say it better, three went to leads
because they had no home or too little evidence, two were parked untriaged. Under the
new split this run reports 6/13 authorizable, which is a real verification-budget
number and not a class artefact.

So the split works, and it immediately shows something the aggregate hides: **the
Extract→Test ratio is a property of the source class, not of the method.** A vendor
prediction report cannot exceed a low ratio no matter how well it is mined; a
repository cannot fall below a high one without the director actually wasting budget.
Reporting one number across both has been comparing a talk to a codebase.

The other half of the previous focus — parallelising Phase 6's mechanical lane —
could not fire and this is the second run to say so. It is scoped to the wave lane,
and a single repository is one document. Two consecutive non-applications is enough
to say the focus was mis-scoped rather than unmet: it belongs in
`references/reference-waves.md` as a wave-lane rule, not in the scorecard as a
standing focus every source-class run has to decline.

**Ship, read under the predicate the focus before last asked for, is 0 of 3 with one
of the three not a loss.** The oracle row is `declined: no change warranted` — that
tree already implements the remedy, which is exactly why it could validate it. The
other two are `blocked: confirmation`, the modal blocker for the sixth run running,
and both are now stronger cases than the usual: each has a measured two-arm result, a
named repair under ten lines, and a return condition that retires it. The pattern is
no longer "the change was not argued well enough"; it is that a triage answer naming
picks does not name trees, and nothing after triage asks again.

Next run's declared focus: **carry the source class into the funnel numbers, and ask
for the tree at Phase 7.5 rather than at triage.** Two edits, both cheap. Put the
class beside `Research` in the row so `Extract`→`Test` is read against its class
expectation rather than against the ten-row average — the last ten rows mix a PDF
prediction report, two videos, a mailing list and five repositories, and their ratios
have been averaged as if they measured one thing. And move the tree question to the
moment it is concrete: Phase 7.5 holds a named seam, a run A/B and a verdict, and an
operator answering "yes, ship that" there is answering about something they can see,
where at triage they were answering about a hypothesis. A run that then still reports
`ship 0 (blocked: confirmation)` has found a genuine authorization boundary; before
the move, it has only found that it asked too early.

| 1.6.0 | 2026-09-01 | `faceless-channel-claude-code` (**practitioner build-walkthrough**, tour-half dominant, sponsored vendor demo) | 1 (2,837 words) | 8 | 6 | **1 application** (`never-the-account-default`, game-production) | 1 row: **1c**/0e/0s — 1:1 with the landing | **1** (`e3b3f09`, gravity, main, pathspec, not pushed) | **Focus APPLIED and it was wrong in the informative direction.** Every row carried `seam: <slug>` before the picks, from `loadFleet()` + one grep; `systedo-case` was predicted and confirmed to have no provider seam, so gravity was the sole candidate. The prediction that FAILED is the one worth recording: row 6 was predicted `partial` → an amendment, and it resolved to **already covered** — the corpus contained the case twice — while its *seam* prediction held exactly and the run shipped from it anyway. So the seam grep was right and the corpus read was wrong, which is the opposite pairing the focus was designed to catch. **Cause: an absence established from a truncated FILE** (`head -45` on the technique), the method's own grep warning applied to a Read. Ship 0 did not recur: the triage question named the tree and the operator answered it in one line, and the `code` arm was reachable because the measurable was the project's own `tsc`. |
| 1.6.0 | 2026-09-01 | `stefan3d-free-ai-level` (**practitioner build-walkthrough**, ~85% tour half, free-tools 3D tutorial) | 1 (5,616 words) | 12 | 1 | **1 amendment** (`placeholder-is-not-an-asset` + its golden path, `game-production`) + 1 application | 1 row: 0c/**1e**/0s — 1:1 with the landing | **1** (`3de20873`, pof, master, pathspec, not pushed) | **Both foci applied, and the file grew a newer one mid-run.** At Phase 1 the closing block declared *predict the ship class at triage*; a sibling appended a newer block (*open the prior-art subject's `librarian/subjects/` note before writing `real gap`*) between that read and Phase 9. Both were honoured. The seam prediction held exactly — `pof` is the only project declaring `game-production`, its `.ai/registry-map.json` joined two contexts to the subject, and it was named on the triage row before picks — and this time the ship class inferred from it was **right**, which is the first `code`-adjacent ship in eight runs. The newer focus paid too, though not via the note (`librarian/subjects/game-production/` held only two, neither mine): the same instinct applied to the *technique file* caught a pre-existing *"Where the stand-in is the deliverable"* exception that the `research-map` summary did not surface, which downgraded the finding from "missing exception" to the sharper and correct "missing third origin". **Catch rate 6/12 (50%), fifth run in six at or above 50% — and this time the calibration was right**: expected yield was stated as *low* before the table, and 1 landing from a tool tutorial is the class norm, not a miss. **0 of 3 fetches — fifteenth consecutive.** The pick was corroborated corpus-internally by a subject two doors down in the same bundle contradicting the one being amended, which is cheaper and stronger than any fetch. **The run's most reusable output is an instrument correction, not a landing**: the apply probe reported 4 insensitive gates and all 4 were the probe's own fault (uniform mutation preserves ratios; top-level-only mutation never reaches nested artifacts). |
| 1.6.0 | 2026-09-01 | `openwiki-v0.5.0` (**vendor repository, re-scanned as a version delta**; 132 files, +10,542/-2,295 over 7 days; 4,673 README unmined / 15,155 in changed operating docs) | 1 | 14 | 2 | **2 rows: 1c/1e/0s - 1:1 with landings** | **2** (`c355b79` personas-web, `05ef946e` ascent; pathspec, not pushed) | **First delta re-scan in the log, and the sub-class earns its own row in the class table.** A delta's unique product is not new features, it is **reversals** - a reversal is a design decision production tested and found wrong - and this one contained ours. The prior note ([[2026-08-27-openwiki-self-correcting-memory]]) was the run's *instrument*, not its context: without it, `retractedClaimIds` is a changelog line; with it, it is the source conceding a claim this corpus disputed one release earlier. **The amendment is stronger than the vindication**: our rule refused every omission, which forces a full re-declaration each pass - the exact round-trip `repair-rides-the-open-page` exists to avoid - while v0.5.0 binds omission to the non-destructive reading and refuses only *already-flagged* claims, getting both properties. Declared focus applied on every row (`seam:` before the picks) and it **worked in the direction the last four runs said it would not**: the seam grep found a live, measurable defect in two authorized trees, and ship went 0 -> 2 for the first time in the coverage lane. Expected yield stated before the table as 2-4 with a high catch rate; actual 2 landings, 2 leads, 12 untriaged, 0 declines. 0 of 3 fetches - sixteenth consecutive. **The untriaged table paid measurably for the first time**: prior rows 12 and 14 confirmed real by v0.5.0 fixes (#744, #743), free, with nobody re-deriving them. |
---

**Read across the last ten rows, the funnel's weakest stage is still `ship`, but for
the first time in seven runs the reason is not `confirmation`.** The previous focus
predicted exactly this test: move the tree question to Phase 7.5, and a remaining zero
either reveals a genuine boundary or reveals that the earlier ask was premature. It
revealed a boundary — the authorized tree held a live in-flight append in the one file
the change touches, and no amount of asking earlier would have moved it. That is a
result, and it retires the `confirmation` diagnosis rather than repeating it.

The stage now worth naming is **`apply` mode, not apply count**. Two rows for two
landing clusters is 1:1 and healthy, but both are the weakest admissible modes:
one `experiment` and one honest `unapplied`. Zero `code` rows have been filed in seven
runs. The blocker is no longer permission and is not effort — it is that the fleet's
trees are almost always mid-work, because the same operator runs a dozen sessions
across them. A method that only lands `code` into a quiescent tree will never land one.

**Next run's declared focus: check the target tree's WIP state at Phase 5, not at
Phase 8.** The tree question was moved once already and it worked; this is the same
move one stage earlier for the same reason. `git status --short` on the candidate
project costs one command and turns "which tree may I touch?" into "which tree is
*touchable today*?" — a question the operator can answer correctly, where the current
one invites an authorization that the tree then refuses. Two consequences to check in
the next row: whether a `code` row becomes reachable at all, and whether naming the
constraint at triage changes which project the operator picks.

---

**Read across the last ten rows, `ship` is still the losing stage at 0 — but for
the first time the zero has two different causes and merging them would misread
the funnel.** Six runs to 2026-08-31 reported `blocked: confirmation`. The last
two do not: slideops was `blocked: foreign WIP` against an authorized tree, and
firstmate is **3 of 4 `declined: no change warranted`**. Moving the tree question
to Phase 7.5 retired the authorization cause; what remains is a different fact
and it is not a stage failure at all — the fleet does not hold the defects these
findings describe. No project ships a session-start injector, none spawns an
agent CLI relying on injected context, and the fleet's one in-path gate already
implemented the amendment it was tested against.

That points at the stage *upstream* of ship, and it is the one nothing currently
measures: **source-to-fleet fit**. Four consecutive runs have landed via the
enumeration and asymmetry hunts against mature subjects, which is the corpus
finding gaps in itself. Those findings are genuine and they raise the standard —
but a standard-level finding often has no project behind it, and a run that
discovers this at Phase 8 has spent its apply budget learning something it could
have predicted at Phase 4, where `research-map` already names the subject and
`loadFleet()` already knows which projects declare its domain.

Next run's declared focus: **predict the ship class at triage, from the fleet,
before the picks are made.** For each candidate row, say in the triage table
whether any managed project has a seam for it — the bridge resolves in one call
and the answer is usually a one-line grep — and carry the prediction into the
row as `seam: <slug>` or `seam: none`. A row marked `seam: none` is not a row to
drop; it is a row whose apply mode is known in advance to be `simulation` and
whose ship is known to be `declined: no change warranted`, which stops the run
reporting as a loss what was actually a correct outcome. The check the next row
should make: did any row's predicted ship class turn out wrong, in either
direction? A prediction that is never wrong is not being made honestly, and a
prediction that is often wrong means the seam grep is looking in the wrong place.


---

**The prediction was made and it was half-wrong, in the direction the focus asked
about.** Seam class was carried into the triage table before picks (`gravity` for
rows 1/2/4/7, `seam: none` for 3/5/6), and `gravity` was right — 0 WIP, both seams,
and a calibrated A/B harness already in the tree. It was still a `simulation`. The
prediction that failed was not *where* but *what*: a seam says a finding has a place
to land, and the run inferred from that a `code`-shaped ship. What survived
verification was a navigational clause, which no seam and no gate can be behind.
**So `seam: <slug>` should keep being carried, and the inference drawn from it should
be narrowed to what it actually supports** — a seam predicts the apply *target*, never
the apply *mode*. Mode is decided by the finding's shape, and that is knowable at
triage too: a row whose `shape` is `correction` or a golden-path clause is a
`simulation` row before anyone opens a tree.

**Across the last ten rows, `ship` is still 0 — and this row makes it three
consecutive zeros with three different, all-correct causes**: foreign WIP, no change
warranted because the fleet lacks the defect, and now no change warranted because the
finding is not code-shaped. The ship column has now spent five rows measuring
something other than a failure to ship, which is a strong signal it is the wrong
denominator. But the stage genuinely worth naming is upstream of all of it and this
run is the clearest instance yet: **`extract`→`test` conversion, where 5 of 7
candidates and *both* operator-picked "real gaps" resolved to already-covered.** Four
of the last five runs have had catch rates at or above 50%, and the cost is not the
wasted verification — it is that the triage table's own read column said `real gap` on
two rows the corpus already owned better than the source did.

Next run's declared focus: **before writing `real gap` in the read column, open the
top prior-art subject's `librarian/subjects/` note — not just the technique files.**
This run's single worst error was a "verified uncapped" absence that was refuted by a
subject note recording the exact concept, landed by run 26, under a name no query
built from the source's vocabulary could reach. The note is the cheapest artifact in
the repository and it is written specifically to say what a subject has recently
gained; Phase 6 currently sends the run to `research-map`'s `file` and to the
neighbouring techniques, and never to the note. One file read per picked candidate.
The check the next row should make: did reading the note change any row's read from
`real gap` to `likely catch` *before* the verification budget was spent — and if it
never does, the note is not carrying what this focus assumes it carries.

---

**`ship` moved off zero for the first time in eight runs, and the cause is worth separating from the celebration.** The last three zeros were all correct outcomes (foreign WIP; the fleet lacking the defect; a finding that was not code-shaped), so the column has spent five rows measuring something other than a failure to ship. This row does not refute that reading — it completes it. What made a ship reachable was not better authorization or a quieter tree: it was that the finding's **apply step needed an instrument the project did not have**, so the shippable artifact was the instrument rather than the change. The technique already prescribed it (*"Rerun the probe whenever a gate is rewritten"*) and no connected tree had ever run it. That is a repeatable move and it deserves naming, because it converts the common case — the corpus is right, the tree already agrees, nothing needs changing — from `declined: no change warranted` into a real commit.

**The stage now worth naming is `test`, and specifically the honesty of the instrument that decides it.** This run's A/B was decided by a probe that returned a confident, well-formed, entirely wrong answer on its first run: 4 of 13 gates insensitive, which would have indicted four working gates in a connected project and landed as a finding. Nothing about the output looked wrong. It was caught only because two of the four named steps had predicates visibly reading the values the probe claimed they ignored, and opening them showed the mutation could not have reached them. The corpus already holds this rule for *remedies* — `regeneration-vs-repair-economics` says a remedy earns its place by measurement on a before/after pair, never by plausibility — and the run had to rediscover it for the **measuring instrument itself**.

**Next run's declared focus: before an A/B verdict is written, run the instrument against a case whose answer is already known.** One arm, one known-good and one known-bad input, checked by hand. A probe that cannot separate those two has not measured the run's actual question either, and the cost of finding that out afterwards is a wrong verdict shipped into `librarian/applied.md` under a `better` or a `not-better` that reads as evidence forever. This is cheap — the known case is usually one of the artifacts already in front of the run — and it is the only step in Phase 7.5 that currently has no check on it at all. The check the next row should make: did the calibration case change any verdict or any count, and if it never does across three runs, it is ceremony and should be dropped rather than kept for comfort.

---

**The newer focus arrived mid-run and it changed a verdict, which is the answer its own check asked for.** The calibration step — run the instrument against a case whose answer is already known — was applied to both A/Bs. On the coverage arms it confirmed the instrument and changed nothing: arm A reproduced the shipped config's own stated scope exactly, and the five gated files held their prior percentages after the change. On the registry arms it **changed the result outright.** The first paired run returned `0 pairs dropped`, which is the shape of a null result and would have been written as `not-better` or `unmeasurable`. But `0` was the *known-correct* answer for a log whose oldest record is nine days old, and recognising that is what turned a null into a correctly-diagnosed latent defect with a computable arrival date. The focus is worth keeping for at least the two more runs its own check specifies.

**The stage this run exposes is upstream of all five, and the funnel cannot see it because it has no column: `research` counts sources ingested and nothing counts sources that should have been re-ingested.** This was the first delta re-scan in 35 runs, and it produced the highest-value landing in several — a source conceding a claim this corpus had disputed one release earlier — for a fraction of a first scan's cost, because the prior note did the extraction and the delta only had to be read against it. It happened because the operator asked. Nothing in the method would have surfaced it: `librarian/sources/index.md` records what was mined and when, leads carry return conditions, and **sources carry none.** The ledger now holds 60-odd rows, a large share of them living repositories that ship weekly, and every untriaged table in every one of those notes is a standing bet that only a human remembering can settle. This run settled two such bets for free (prior rows 12 and 14, both confirmed by v0.5.0 fixes) and could not have known to try.

**Next run's declared focus: give every repository-class source a re-scan condition at Phase 9, and check the fired ones at Phase 1.** One line in the ledger row — a version, a tag, an elapsed interval, or a named untriaged candidate whose confirmation would matter — written when the source is mined, while the run still knows what would make a second look worthwhile. At Phase 1, after reading the ledger for "was this already mined", read it a second time for "has any row's condition fired", and say so out loud even when the answer is no. The cost is one line written and one column read. The check the next row should make: did any run open a source because its condition fired rather than because a human pasted a link — and if after three runs no condition has ever fired, they are being written too far out and the interval is the thing to fix, not the practice.


| 1.6.0 | 2026-09-01 | `awesome-game-security` (**reference index, hybrid** — 4,017-link README inside an LLM curation pipeline; 30,704 README / ~381,000 in-tree md; **0 waves, by decision**: total empties on concept vocabulary + no security category, so all 3,871 refs score `new-subject`; ranked at section granularity, all unread) | 1 | 12 | 4 | **1 amendment** (`prose-rule-drift`, quality-gates) + 1 application | 1 row: **1c**/0e/0s — 1:1 with the landing | **1** (`49f05f22`, pof, master, pathspec, not pushed) | **All three standing foci applied; one changed nothing, one confirmed, one fired for the first time.** (1) Re-scan condition: written into the ledger row and the note's frontmatter for the first time — three triggers, one dated. (2) Calibration before the verdict: run on a known-clean and a known-over artifact and on commits known to violate the per-edit cap; it changed no verdict and no count, which is the second of the three runs its own check allows before it is ceremony. (3) Read the subject note before spending verification: read, changed no row's read. **The finding came from the tree's own maintained artifacts, not its prose** — a log with 3,950 entries of one mode and 0 of the mode that guards the invariant, and a state file whose caps are visible as ring sizes; Phase 2b's sweep order item 3 ("the measurement") applies to a pipeline's *ledgers*, not only to `evals/`. **Ship reached because the apply step needed an instrument the project lacked** (same mechanism as the 2026-08-31 row), and this time the instrument was also the calibration case: the probe that decided the A/B is the check that shipped, minus the history walk. |
| 1.6.0 | 2026-09-01 | `matrix-rust-sdk` (**vendor repository**; ingest body EMPTY at 597 landing words; ~30,200 in-tree md + **191 per-PR changelog fragments**, which produced 3 of 4 landings) | 1 | 20 | 5 (unattended: the five `real gap` rows) | **1 technique** (`ordered-lane-blocking`, from a rule INVERSION against `optimistic-write-path`) + **3 amendments** (`cross-process-exclusion`, `journal-and-durability-modes`, `optimistic-write-path`) + 4 applications | **4 rows: 1c/0e/3s - 1:1 with landings** (3 better, **1 not-better** with its condition landed) | **1** (`0f4a3b468`, personas, master, pathspec, not pushed; `ab-paired` 2/6 vs 6/6) | Focus applied: no ledger row carried a re-scan condition, so none had fired - said out loud at Phase 1 - and this run's ledger row is the **first to carry one** (`rescan_when:` in the note). 0 of 3 fetches. |

**The stage worth naming this run is `research`, in the sense the last row named: what the funnel cannot see.** This source's domain half is 3,871 references with no home, and the method's answer — rank, record, lead — is right and leaves a standing debt nobody measures: the section ranking is a wave plan that fires only if a managed project grows the seam, and no column counts leads whose return condition has fired. The re-scan focus was written for the first time this run; the same shape applies to leads, which have carried return conditions since the skill's first version and have never once been checked at Phase 1. **Next run's declared focus: at Phase 1, after the ledger's re-scan column, read the last ten source notes' leads and say out loud which return conditions have fired.** One file read per note, ten notes, and the answer is usually "none", which is a result. The check the next row should make: did any lead advance because its condition was read rather than because a source happened to land on it — and if none does across three runs, the conditions are being written too far out, and *that* is the thing to fix.

**The funnel over the last ten rows, read after this one.** Ship is no longer the zero stage: 0 -> 1 -> 1 -> 2 -> 1 -> 1 over the last five rows, every one a pathspec commit on a project's active branch with a paired proof, and apply has been 1:1 with landings for eight consecutive rows. What this run adds to the reading is a **first `not-better` row in several** - and it was the cheapest of the four to reach, because the tree's shape (every loop re-reads the store per tick) settled it without an instrument. The stage still losing most, by count, is **extract -> test**: 5 of 20 here, 4 of 12, 2 of 14, 1 of 12 before it. That is partly by design - unattended runs advance only `real gap` rows and file the rest as untriaged, and the openwiki row showed the untriaged table paying off - but it means the triage read is doing the work a verification should, on twelve rows a run, with nobody checking whether the reads were right. The instrument that would tell us is already in the ledger: the untriaged tables carry anchors, and a delta re-scan (the openwiki shape) is the cheapest way to find out how many `partial` reads were real.

**Next run's declared focus: keep the re-scan condition for two more runs (two rows now carry one; check at Phase 1 whether either fired and say so), and for any repository-class source, sweep per-PR changelog fragments before the operating documents.** This run's yield came from `changelog.d/*.fixed.md` files of 40-250 words each, written under a contributing rule that a fragment must be understandable outside the project; the 30,000 words of curated markdown produced the catches. The check the next repository row should make: did the fragment sweep produce a landing the docs sweep would not have, and how many words did it cost.
| 1.6.0 | 2026-09-02 | `sherpa-onnx` (**vendor repository**; 2,516 landing / ~38,300 in-tree md incl. a 10,422-word per-PR CHANGELOG; yield from config headers + validators + one recognizer's silence guard) | 1 | 15 | 3 (unattended: the three `real gap` rows; #4 and #15 folded into #3) | **1 technique** (`decode-time-vocabulary-biasing`) + **2 amendments** (`stt-pipeline`: content-conditioned endpoint rules with a cap; the engine's no-speech verdict in the text channel) + 2 applications | **3 rows: 1c/1e/1s - 1:1 with landings** (1 not-better, 2 better) | **1** (`cc9b2df0d`, personas, master, pathspec, not pushed; `ab-paired` 2/2 silent + 3/3 speech) | **Focus applied: changelog fragments swept first - one trigger, no content, ~10,400 words.** The fragment sweep named the hazard ("hallucinating text on silent audio with hotwords set"); the rule came from the C++ that implements the guard, and would not have been found from the fragment alone. Third ledger row now carries `rescan_when:`; the two earlier ones checked at Phase 1 - neither fired (one day old). Leads in the last ten notes read at Phase 1 - none fired. **The run's shipped fix came from arm A of the A/B**: running the connected tree's own engine on the source's named failure case, before drafting, produced a first-party measurement the source could not have - and it was the highest-tier evidence in the run. |

**Next run's declared focus: when the connected project ships the same engine class the source is about, run the source's named failure case through the project's own engine at Phase 6 - before drafting, not at Phase 7.5.** This run's shipped landing and its strongest amendment came from arm A - the baseline, the tree exactly as it stands - not from the source and not from the technique. The source pointed at "prompted decoders hallucinate on silence"; the measurement of the unmodified product on two silent captures found a different and cheaper defect (the engine's no-speech verdict arriving as text) that no reading of either tree would have surfaced, because both the guard and its comment said the right thing. A baseline measured on a real engine is a first-party account at the top of the tier table, and it costs one download and five runs. Keep the re-scan check (three rows now carry a condition; check all three next run and say so). The check the next row should make: did running the baseline first change what was drafted - and if it only confirmed the draft, say so, because that is the second of three runs before it becomes ceremony.

**The funnel over the last ten rows, read after this one.** Apply 1:1 for nine consecutive rows; ship 1 -> 1 -> 2 -> 1 -> 1 -> 1 -> 1. Extract -> test is still the stage losing most by count (3 of 15 here, 5 of 20, 4 of 12 before it) and still partly by design under the unattended rule - but this run's #2 (VAD hysteresis, read `partial`) landed folded into a `real gap` row, which is the third time a `partial` row has been absorbed by a neighbour rather than filed untriaged. The untriaged tables are carrying the cost of the unattended rule and nobody re-scans them; the openwiki delta shape remains the cheapest instrument for finding out how many `partial` reads were real.
| 1.6.0 | 2026-09-02 | `sentry-self-hosted` (**vendor repository, packaging flavour**; 308 landing / ~10,966 in-tree md + 2,242 lines installer shell + 1,727 lines tests; no `docs/` - the step scripts were the fragments) | 1 | 16 | 4 (unattended: the four `real gap` rows; 6 `partial`/`likely catch` rows filed untriaged with anchors) | **4 amendments** (`probe-design`, `installer-authoring`, `flake-lifecycle`, `update-automation-review`) + 3 applications | **3 rows + 1 unapplied: 0c/2e/1s** (1 better, 1 not-better, 1 unmeasurable with the instrument named; the unapplied row states the negative structural fact - no fleet lane floats its inputs, both scheduled Rust lanes pin deliberately) | **0** - the `better` row is a simulation whose change is not a few lines (a token writer plus a host probe); the `not-better` and `unmeasurable` rows warrant no change | All four standing foci applied. Re-scan conditions: two rows carry one, neither fired; lead return conditions in the last ten notes: none fired - both said out loud at Phase 1. Fragments-first: applied, and on a packaging repo the fragments are the step scripts' issue-number comments, not the changelog. **Calibration changed a count (4 -> 1)** - the third run of three the focus's own check allows, and it has now changed a verdict once and a count once. 1 of 3 fetches. One sibling live (voice-io, no overlap); index and catalog regenerated and left uncommitted over its WIP. |

**The calibration focus has now earned its place: three runs, one changed verdict, one changed count, one no-op.** Its own check said drop it if it never moved anything in three runs; it moved something in two. It is a rule this file should carry, and it is not carried yet because a method edit is the one change a parallel fleet cannot absorb quietly and a sibling is mid-run - the next run that finds itself alone on the board promotes it into Phase 7.5 under a minor bump. What this run adds to the reading of it: the calibration case that moved the count was not a planted one. The known-merged and single-proposal checks passed and changed nothing; **reading the four rows the classifier returned** is what found that three were the bot rebuilding grouped proposals. A calibration case drawn from the run's own output costs nothing and sees the failure the constructed cases were not shaped for.

**The stage still losing most is `extract -> test`, and this run measured why from the other side.** 4 of 16 advanced, all four by the unattended rule (`real gap` only), and the six `partial` rows were filed with anchors - which is the method working, not failing. But the two best findings of the run came from the *apply* seam contradicting the source, not from the source: the lease-versus-progress split from a worker's comment, and the machine-owned-region boundary from a not-better against the registry's own script. Neither would have existed if the triage had been right and the apply skipped. The untriaged rows have no such second chance: nobody opens a tree for them.

**Next run's declared focus: for every `partial` row at Phase 5, write the one question whose answer would promote it to `real gap`, and file that question with the row.** One sentence per row, in the untriaged table, written while the anchors and the neighbouring file are open. The check the next row should make: did any untriaged row from a *prior* note get promoted because its question was answered by this run's source or tree - and if after three runs no question has ever been answered, they are being written too far from any seam, and *that* is the thing to fix. Keep the calibration focus alongside until it is promoted into the method.

| 1.6.0 | 2026-09-02 | `create-better-t-stack` (**first-party practitioner account, repository form**; 669 landing / 32,182 in-tree md excl. templates; yield from the upstream-defect findings log + the validator's provided-flags set; the README contributed proper nouns) | 1 | 15 | 2 (unattended: the two `real gap` rows; #6 and #12 folded into A, #9's explicit-payload half into B) | **2 amendments** (`fallback-retirement-condition`: the pinned-upstream lane - evidence tiers, release-is-the-reaper, disproved-claims ledger, policy vs workaround; `inherited-default-override`: the derived-default column + provenance through the validation door) + 2 applications | **2 rows: 0c/0e/2s - 1:1 with landings** (both `better`, both `structural-only`) | **0** - B's one concrete change crosses a provider-trait signature and a sibling run was live in the tree; A's next change is a comment-ledger edit, filed in the project's own ledger | **Focus applied, with a gap.** No changelog fragments exist here (commit-generated changelog); the substitute was operating-docs-first and it produced both landings. Lead check: ten notes read, no return condition fired by its terms; one lead advanced because a source landed on it, and its condition was a registry action no source can produce. **Not applied in time: the sentry sibling's "one promoting question per partial row" focus, appended to this file after this run's Phase 1 read** - applied late to the three partial untriaged rows in the source note |

**The funnel over the last ten rows, read after this one.** Apply stays 1:1, eleven rows running. Ship is 0 here after seven non-zero rows, and the zero is not the gate: the change is real, named and filed in the project's ledger, but it crosses a trait signature and the tree was shared with a live sibling - the single-owner doctrine's two stated exceptions, both true at once. Extract -> test: 2 of 15, again by the unattended rule; the strongest partial (#1, an oracle that predicts the rejecting *rule* and treats an unclassifiable rejection as a finding) sits in the untriaged table with its promoting question, which is where the sentry focus says it belongs. Both apply rows this run read `better` from a structural fact the tree had already stated about itself in a comment - a floor ledger describing its own floor as "INSIDE a broken window", a resume path stating an intent and then failing it. **A comment that records a defect the code has not fixed is the cheapest seam this skill has found**; one grep over a tree for its own admissions ("regression", "sat inside", "keeps ... the same", "to avoid the") surfaced both.

**Next run's declared focus:** one carried, one new. Carried: the sentry focus - one promoting question per `partial` row at Phase 5, filed with the row. New, from the lead check's first measurement: at Phase 1, classify each banked lead's return condition as **source-fireable** (a second sighting, a measured number) or **registry-fireable** (a subject is forged, a project adopts a template), count both, and say which class the leads that advanced belonged to. The check the next row should make: if the registry-fireable class never fires across three runs, the fix is at the source note - rewrite the condition as an observable event - and not at the method. And one mechanical rule that this run learned by being bitten: **re-read this file's last row inside the ledger lock before writing your own**, because in a shared checkout the focus you read at Phase 1 is not the newest one by Phase 11.
| 1.6.0 | 2026-09-02 | `handy` (**practitioner build-walkthrough, repo form**; 3,369 landing / 9,108 in-tree md / ~28,300 lines of source; the yield sat in module doc comments that open with the issue each rule was paid for) | 1 | 15 | 2 (unattended: the two `real gap` rows with a home; a third real gap had no fleet seam and went to leads) | **1 amendment** (`atomic-downloads`: the resume contract, check by check, RFC-corroborated) + **1 technique** (`voice-io/transcript-handoff-receipts`) + 1 application | 2 rows: **0c/1e/0s** + 1 unapplied (no seam, return condition written) - 1:1 with landings | **1** (`73a9443`, politicas, master, pathspec, not pushed; `ab-paired` 1/6 -> 0/6; the project's doc-sync hook forced the coupled doc into the same commit) | Foci: (1) re-scan conditions - two rows carried one, neither fired, said at Phase 1; (2) ten notes' leads read for fired return conditions - none, said at Phase 1; (3) changelog fragments first - no changelog in this tree, and its equivalent was the **module-level doc comment** citing the paid-for issue, which produced both landings. 1 of 3 fetches spent (the HTTP spec, for a primary citation the amendment needed). **The A/B found the corpus's own claim too strong**: the runtime's transport already enforces the advertised length, so "transport success does not prove completeness" holds only for the case the header cannot see - written into the technique as a caution beside the checks. |

**The funnel over the last ten rows, read after this one.** Apply is 1:1 with landings for the ninth consecutive row and ship is 1 for the sixth of the last seven; neither is the losing stage. Extract -> test remains the widest cut by count (2 of 15 here, 5 of 20, 4 of 12 before it), and this run adds a reason the count understates it: a third `real gap` row was correct and went to leads only because no fleet project has the seam, which is a fact about the fleet, not about the read. **What this run measured that no prior row did is the corpus being wrong in the A/B's control direction**: the technique's strongest assertion was stronger than the runtime it was tested on, and the caution landed beside the checks. That is the first time a paired test here amended the technique rather than the tree.

**Next run's declared focus: for any repository-class source without a changelog directory, sweep module-level doc comments that cite an issue number before any markdown**, and record how many landings they produced versus the docs sweep. Two runs now say the paid-for-failure surface is wherever the project stores its "why" - `changelog.d/` in one tree, `//!` headers in this one - and the method names only the first. Keep the re-scan and lead-condition checks at Phase 1 (this run: two conditions read, none fired; ten notes' leads read, none fired - the third consecutive "none", which the awesome-game-security row said would mean the conditions are written too far out; the next row should say whether it agrees).

| 1.6.0 | 2026-09-02 | `monai` (**vendor repository** - consortium medical-imaging framework over a hosted tensor engine; landing 779 / ~40,660 in-tree md+rst; one monolithic 9,839-word CHANGELOG, **no per-PR fragments**; the domain has no bundle and yielded nothing - all three landings came from the engineering periphery: the contributing guide's deprecation policy plus the decorator enforcing it, the release notes' four load-path advisories, and a test helper probing the accelerator's effective precision) | 1 | 15 | 3 (unattended: the three `real gap` rows with a home; three more `real gap` rows had no home and became leads) | **2 techniques** (`deprecation-by-version-arithmetic` in release-pipeline - 68 files said the word, none owned the lifecycle; `unsafe-deserialization-off-by-default` in supply-chain - uncapped grep 0 owners) + **1 amendment** (`platform-quirk-absorption`: the post-main quirk, and a refined boundary test) + 3 applications | **3 rows: 1c/1e/1s - 1:1 with landings** (2 better, **1 not-better** with its condition landed as the amendment's closing paragraph) | **1** (`9788290e`, pof, master, pathspec, not pushed; `ab-paired` 2 archives x 2 arms over the producer's own key set) | **All three foci applied.** (1) Re-scan conditions: none in the index file, two in note frontmatter, neither fired - said at Phase 1; this row's ledger entry carries one. (2) Leads' return conditions across ten notes: read, none fired for this class. (3) Changelog first: the source has no fragments, only a monolith; read first anyway, and its Fixed lists were the **trigger** for one technique whose content came from the release-notes page and the code - the same trigger/content split the sherpa-onnx row reported. **0 of 3 fetches.** Two of three homes were held by a live sibling; no shared file collided (their diff in `flake-lifecycle`, this run's in `platform-quirk-absorption`), the golden-path line and the two subject-note appends went under the `content` lock, and **those two notes plus the pof project ledger carry the sibling's uncommitted lines, so this run did not commit them** - the appended paragraphs ride in the working tree until the sibling's commit. Also: a recursive grep across eleven fleet trees timed out twice (2 min, then ripgrep at 20 s); per-project `git grep` over tracked files finished in seconds and is the instrument for Phase 7.5's seam search. |

**The funnel over the last ten rows, read after this one.** Apply has been 1:1 with landings for nine consecutive rows and ship is 1 again, so neither is the losing stage. Extract -> test is still where the count drops (3 of 15 here, 5 of 20, 4 of 12 before), and this row adds a second reason beside the unattended `real gap` rule: **three `real gap` rows had no home** and became leads, which is the honest outcome and also a standing debt - two of them (deferred transform composition, applied-operation tracing) are one spec the moment a managed project grows the seam, and no column counts a lead whose home does not exist yet. The stage worth naming is therefore `research` in the sense the awesome-game-security row named: the funnel cannot see a real gap with no home, and a domain-foreign repository produces them at a higher rate than a video does.

**Next run's declared focus: keep the two standing checks (re-scan conditions and lead return conditions at Phase 1; say whether either fired), and for every `real gap` row with no home, write in the source note which existing subject's boundary statement *excludes* it and why - the sentence that would have to change for it to have a home.** One line per homeless row. The check the next row should make: did naming the excluding boundary turn any homeless lead into an amendment on the subject that excluded it, or confirm it needs a subject - and if three runs of homeless leads all point at the same excluding boundary, that boundary is the thing to redraw, not the leads.
| 1.6.0 | 2026-09-02 | `deer-flow` (**vendor repository** - a company's open agent harness; 18,157 landing / ~225,000 in-tree md; yield from eight per-package module guides, one of which holds the whole delegated-work verifier as a 4,800-word paragraph; CHANGELOG 14,274 words swept first) | 1 | 22 | 4 (unattended: the four `real gap` rows) | **2 techniques** (`completion-claim-verification` in fleet-orchestration; `write-freshness-gate` in mcp-tools) + **2 amendments** (`lease-renewal`, `decay-and-forgetting`) + 1 new application + 2 applications extended | **4 rows: 0c/0e/3s + 1 unapplied** - 1:1 with landings (2 better, 1 not-better with its condition landed, 1 unapplied with a return condition) | **0** - every `better` arm exceeds a diff a reviewer reads in one sitting (a branch name threaded to a bridge plus a third report state; a schema column plus a selector plus a new proposal action), the not-better arm ships nothing by definition, and the one few-line change found (a discarded heartbeat result) belongs to the base technique and is filed in the project's ledger rather than shipped unpaired | **All three standing foci applied at Phase 1 and said out loud.** (1) Re-scan conditions: two ledger rows carry one; neither fired (both days old). (2) Lead return conditions across the last ten notes: read; none fired - the adaptive-harness lead was the one this source could have fired (it is a harness) and did not (no ablations); the matrix AI-policy lead did not fire (no such policy in the contributing guide). (3) Changelog first: applied, and **for the second run running the changelog produced every landing's trigger and no landing's content** - four one-line entries named the mechanisms, the module guides supplied rules, cases and boundaries. That is now two rows saying the same thing; a third makes it a rule for the sweep order (changelog = index into the operating documents, read first and mined second). **The map instrument failed on a concept term, not a proper noun**: "subagent delegation" returned a total empty over a subject that owns the concept under session/member/worker vocabulary; the near-empty rule (2026-08-22) already covers seams, and this run adds the synonym case to the lessons. Class calibration stated before triage (2-4 landings from operating docs, not the README) and matched (4). **One contradicted pick kept**: the memory technique forbids inventing an expiry and the source assigns one to every fact; resolved by naming the field (expiry is the claim's, review deadline is the store's), which is the strongest of the four landings and would have been dropped by a pass/fail read of corroboration. 0 of 3 fetches. 6 siblings at claim; no subject overlap; index regenerated under lock and left uncommitted over a sibling's WIP. **Two newer foci appeared in this file between Phase 1 and the ledger lock** (the monai row and the row after it), read inside the lock: the doc-comment sweep for changelog-less repositories did not apply (this tree has a changelog, though its module guides cite PR numbers per rule the same way); the excluding-boundary line for homeless `real gap` rows was applied to the one homeless row this run had (U3, command-position audit - the boundary is mcp-tools' scope line, written into the source note). |

**The funnel over the last ten rows, read after this one.** Apply has been 1:1 with landings for nine consecutive rows and the mode is overwhelmingly `simulation` (this run 3s/0e/0c; the previous three 1c/1e/1s, 3s, 1c/0e/3s). Ship went 1 -> 1 -> 1 -> 1 -> 0 here, and the zero has a shape worth naming rather than a gate to blame: **every `better` verdict's B arm was bigger than a reviewable diff, and every one of them named a measurement that was not** - one SQL over existing session rows joined to a branch walk; one keep-rate query over proposal rows once a column exists. The falsifier's instrument is routinely a few lines while the change is not, and a simulation whose return condition says "run this query" leaves the query unwritten in the very session that knows the schema. The stage still losing most by count is extract -> test (4 of 22 here, 3 of 15, 2 of 16, 5 of 20) and that is by design under the unattended rule; the untriaged tables keep growing and no run has yet gone back to measure how many `partial` reads were real.

**Next run's declared focus: when a `better` arm is too large to ship, ship the falsifier's instrument instead - the query, the probe, the fixture that decides the return condition - as a pathspec commit to the project, so the return condition fires by running it rather than by being remembered.** Keep the changelog-first rule for one more repository row (two rows now say trigger-not-content; a third promotes it to the sweep order). The check the next row should make: did a simulation's return condition become an experiment because its instrument was committed - and if the instrument would itself exceed a few lines, say so and file it, which is a result.

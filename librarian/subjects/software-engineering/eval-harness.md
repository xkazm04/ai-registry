---
domain: software-engineering
subject: eval-harness
last_touched: 2026-09-29
touched_by: intake
dry_streak: 0
---

# eval-harness

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-04 - `/intake`, from an external source

One technique and one amendment, both found by the enumeration hunt. Source:
[[2026-09-04-authority-hacker-writing-models]] — a podcast demoing a blind
preference arena its hosts built. Fetch budget 0 of 3; corroboration was
training-data convergence plus code read in two fleet trees.

**`pairing-schedule` (new).** `comparison-modes` says "Its pathologies are
specific and standard:" and lists five — position bias, ties, compressed
magnitude, intransitivity, no gate and no trend. Every one is a property of a
*comparison*. The missing sixth is a property of the **set**: which pairs ran,
and how many times each candidate appeared. A full round-robin is unaffordable,
so every arena runs a schedule, and the schedule decides the ranking. An
elimination bracket makes each candidate's comparison count a function of arrival
order rather than of quality, so sorting the field by wins sorts it largely by
survival time; a bracket therefore reports its winner and its path, never a
leaderboard. Exposure is balanced across sessions because a sequential bracket
cannot be balanced within one, and connectivity is checked before a total order
is rendered — a disconnected graph yields components, not a ranking.

**A second branch, written from a fleet tree rather than from the source.** The
technique's connectivity remedy assumes the ranking can be withheld. A managed
observability product publishes a pooled leaderboard whose contributors each
measure on their own private cases — disconnected by construction and
permanently, because the privacy floors that make buckets publishable are exactly
what stop cases from travelling. There, withholding means shipping nothing. Its
answer is to keep the order and move the incomparability into the interval, via a
between-source variance term; its own module records the defect that replaced,
which is the inverse of what a reader assumes — naive pooling made five
contributors who *disagreed* produce a narrower interval than five who agreed.
That branch is now in the technique, discriminated by whether the ranking is an
internal selection or the deliverable itself. See
[[../../applied]] — the row is a `not-better` that improved the corpus.

**`scenario-design` amended: elaboration is a measurement decision.** The
technique defines a scenario as an input, its context, and the property the
answer must have, and leaves unpinned the term with the largest effect: how much
steering the input carries. Bare inputs measure default behaviour; scaffolded
inputs measure the ceiling the system reaches on the prompt that ships. Both are
legitimate and the failure is comparing across the line, because prompt
sensitivity is unevenly distributed across candidates — a heavily scaffolded
ranking is partly a ranking of how well each candidate follows *that* prompt.
Consequences: the scaffolding advances the scenario's content version like any
other edit, and elaborating a scenario until every candidate passes is instrument
tuning, not fixture work.

Two catches worth recording so nobody re-proposes them: task-segmented ranking
and the cost-against-quality plot are already this subject's **matrix** mode,
named in those words, including the collapsed-margin lie that is precisely the
source's headline; order randomization is already the position-bias rule, which
goes further by requiring mirrored scoring and recording a flipped verdict as a
tie.


### 2026-08-22 - `/research`, from an external source

`judge-stability` amended: the instrument's swing bounds the claim. Source:
[[2026-08-22-shapes-of-agent-memory]] - a controlled study where swapping the
reader+judge stack on byte-identical retrieval moved the score further (6.9
points) than the gaps between the systems under comparison (0.3-3.6), and
where the same system pair sat inside the swing on one benchmark and 15
points apart on another. The technique had the within-judge repeatability
floor; the cross-instrument ceiling and its scenario-set dependence were the
missing halves.

### 2026-08-26 - `/intake`, from a first-party prototype report

Gained **two** techniques (6 -> 8), the subject's first additions since forge.
Source: [[2026-08-26-knowledge-compressor]].

- `unaided-baseline-screening` - a scenario the candidate satisfies WITHOUT the
  material under test measures the candidate's prior, not the system, and it
  cannot be spotted by reading it. Run the scenario against a deprived candidate
  and discard everything the deprived run satisfies. The deprivation chosen IS
  the claim the suite supports, which is why it is written down beside it.
- `overshoot-and-restore` - when the harness is a bound on a search rather than
  a gate, the null change is always green, so an all-green optimization run
  cannot distinguish "reached the limit" from "did nothing". Require a failure,
  restore minimally, report the pair.

Both landed against a **missing stage**, not a missing opinion: the subject was
thorough from scoring onward and had nothing at scenario *admission*, and
nothing about the harness being used as a search bound at all. The golden path
gained one section, "A pass is evidence only where a failure was reachable",
which states the composition rule - screen first, then overshoot, because
overshooting an unscreened suite finds a phantom bound.

Corroboration: zero fetches. Training-data convergence (closed-book baselines;
delta-debugging's 1-minimality) plus corpus-internal convergence - the same move
already existed twice here, in other subjects.

### 2026-08-27 - `/intake`, from a first-party practitioner account

Gained **two more** techniques (8 -> 10) and **two amendments** inside
`scenario-design`. Source: [[2026-08-27-evaluate-llms-before-production]].

- `metric-role-contract` - exactly one metric is optimized; every other metric
  is a threshold that is either cleared or not. Which one is the constraint is
  an **irreversibility** question, not a magnitude one, and a large gain that
  breaches a declared threshold does not advance. Kills the composite, whose
  weights encode a rate of substitution that is false wherever the constraint
  is the irreversible error.
- `failure-attribution` - a red case names a layer, not a defect. Six owners
  (label, dataset, input construction, pipeline, prompt, model), checked most
  upstream first; **two of them are not the system**, and the fix for either,
  applied to the system, improves the score while moving the system away from
  correct. Attribute a sample from both tails, act on classes, and treat a
  class that resists all six as an unwritten product policy.
- `scenario-design` amendment 1: a **sixth ugly-case region, distractors** -
  well-formed, in-distribution, unambiguous inputs holding more than one
  plausible target. The five-region enumeration provably excluded it, and
  `distractor` returned zero corpus-wide. The mechanism is that *curating*
  a set removes distractors as a side effect of tidying it.
- `scenario-design` amendment 2: captured reality is representative in its
  **inputs** and not in its **labels**. The expected property gets back-filled
  from a workflow outcome, which renders several ground-truth states as one
  definite value.

Corroboration: **zero fetches** again. Amendment 2 was corroborated entirely
corpus-internally - `proactive-nudges/efficacy-feedback` and
`remediation-handoff/evidence-based-auto-close` both already refuse to collapse
a dismissal into a resolution, so the rule existed in this bundle and had a
free pass in the eval lane.

Shape of the run: **four too-narrow enumerations, not four missing opinions.**
Three of the four findings came from reading a sentence in which a forged
document claimed its own completeness.

## Boundary recorded (the other side is in test-harness)

`test-harness/negative-control-tests` and both new techniques run the same move
on different unknowns, and the pair is stated in both new files:

- Negative control: break the **system** to prove a **test** can fire. The
  instrument is the unknown; the mutation is disposable; restore completely.
- Unaided-baseline screening: deprive the **candidate** to prove a **scenario**
  can fail. The question is the unknown.
- Overshoot-and-restore: push the **system** to find **where** the test fires.
  The reduction is the deliverable; the restore is partial by design.

This is the deterministic subject's declared deferral working as intended -
test-harness owns the deterministic lane and defers non-determinism here.

## Open leads

- Candidate 7 from the same source (retrieval recall vs end-to-end answer
  accuracy - "comparing different sports") sits on the boundary between this
  subject and retrieval/retrieval-evaluation. Untriaged; if picked later,
  decide the home by which subject's stated job the confusion damages.

- **Law candidate, banked not written:** *a green result is evidence only where
  red was reachable.* Four sightings, three subjects, two runs (negative
  controls, lane ablation, and both techniques above). `failure-not-empty-success`
  covers how failure is spelled; `gate-sees-target` covers proxies; neither
  covers reachability. **Return on a fifth sighting outside `software-engineering`**
  - three of four are in this bundle, which is the shape a house habit takes.

  **Sharpened 2026-08-27, not promoted.** The banked wording is one-sided - it
  distrusts a green verdict only. `failure-attribution` landed the mirror: a red
  verdict is evidence about a *case*, and two of its six possible owners are not
  the system at all, so a red result is no more self-interpreting than a green
  one. The root that covers both is broader than reachability: **a verdict names
  a case; attributing it to a cause is a separate act with its own
  preconditions.** That is the form to propose if the law is ever written. The
  return condition does not change - the sightings are still all in this bundle,
  and a mirror found in the same subject is not independence.

## Declines

None.

## 2026-08-28 — /intake, [[../../sources/2026-08-28-autosaddler-harness-optimization]]

Amendment to `failure-attribution`: a **seventh owner**, the tool surface, placed
between pipeline and prompt. Technique count unchanged (10).

Occasioned by a research release whose patch taxonomy treats tool definitions and
implementations as a first-class surface separate from prompts. The six owners
describe a single-call system completely — asked, assembled, sent, answered,
handled — and an agent is not that shape: it acts through a contract it did not
write, versioned separately from the prompt and injected by the harness.

**The finding is the misrouting, not the missing row.** Walk an agentic tool
failure through the funnel's own tells and it fails the prompt's tell (*a person
reading only the prompt would make the same mistake* — they would not) and fails
the pipeline's tell (*raw output and recorded outcome disagree* — they agree), so
it lands in **model**, the residual, whose prescribed response is a model migration
or an accepted limit. A strictly correct application of the technique therefore
produces the exact mis-attribution the technique was written to prevent, and
prescribes the most expensive available fix for what a rewritten tool description
would have solved.

This is the second amendment in two runs where `failure-attribution`'s
most-upstream-first funnel was found to be complete for the system it was forged
against and incomplete for an adjacent one. **The reusable check: for each owner,
ask what its tell does with a failure it does not own.** A funnel is only as good
as the exclusivity of its tells, and a residual bucket at the end will silently
absorb everything the tells fail to catch.

**Open, not pursued:** the source's four-way reflection classification (fixed /
regressed / still-failing / still-passing) was left untriaged. The *regressed* cell
is the one a shallow reflection loop never computes, and `quality-scoring`'s
`paired-per-case-testing` sits in a different bundle — so if that candidate returns,
it is a cross-bundle boundary to state rather than a technique to write here.
## 2026-08-29 - intake, the trigger set

[[2026-08-29-ai-native-sdlc-and-ci-on-call]]: `eval-economics` tiered cadence gained
the rule that the golden set's trigger includes the agent's configuration -
instruction files, skills, subagent definitions, hooks, permission rules, model pin -
and that incidents enter the suite as scenarios. `use_when` gained the case. The
subject had priced the cadence and named "pieces that shape model behavior" without
saying those pieces include files no unit test exercises.

## 2026-08-29 - intake, the change-design stage

[[2026-08-29-future-of-ai-harness-to-rsi]]: `failure-attribution` gained the stage
between attribution and re-attribution - the change is an experiment designed before
it runs (one component per round, model pinned, prediction written first, parent
kept). `use_when` gained the agent-proposer case. Discriminator, not a link: the
game-production bundle's `prompt-fitness-and-evolution/mutation-taxonomy` holds the
same rule scoped to prompt text with a closed strategy list; this subject holds it for
every harness component and leaves the strategy taxonomy to the component's own
subject. A reader editing a prompt wants the closed list; a reader changing a tool
schema or a verifier wants this one.

## 2026-08-29 - intake, the silent majority of a selection suite

[[2026-08-29-task-coevolve-harness-optimization]]: gained
`discriminating-task-selection` (10 -> 11), a golden-path section ("When the
harness ranks a population, most of the suite is silent"), and an
`eval-economics` amendment under the matrix row. The missing stage was *which
cells a selection search runs*: a scenario every candidate passes or every
candidate fails moves no ranking, and a 2026 measurement put that class at over
70% of a mature pool. Rule: frozen pool, moving selection by outcome variance
(floor for never-solved, bonus for rarely-run), candidate-blind, weighted
full-pool estimates. The inversion is the load-bearing part - the golden set's
virtue for a regression gate (frozen, saturated with always-pass) is its cost for
a ranking, and the discriminator is the question. Boundary recorded against
`quality-gates/oracle-frozen-during-repair` (pool = oracle, frozen; selection
moves) and cross-bundle convergence noted with
`recruiting/assessment-instrument-validation/discrimination-margin-gate`.
Corroboration: the paper (2 fetches, extraction) plus training-data convergence.
No application - a lead carries the numbers until a connected tree runs a search.

### 2026-08-29 - `/intake`, from a second-hand survey

One **amendment** inside `failure-attribution` (held while a parallel session
had the file open, landed once its section reached HEAD): "A fix at the pipeline or prompt layer names the model it was built
for." Source: [[2026-08-29-two-loop-rsi-llm-and-harness]].
Found by the asymmetry hunt - `unaided-baseline-screening` already says the
screen expires with the candidate (the suite side); nothing said the harness's
compensations expire with the model (the harness side). Three states after an
upgrade (pays / dead weight / now the failure); retirement condition written
into the compensation; re-ablate as a matrix cell on upgrade, delete rather
than tune. Zero fetches; corroborated by two corpus-internal siblings
(`unaided-baseline-screening`, `hitl-approval/human-performed-steps`) and
training data. Banked lead: harness search is combinatorial while the model's
is gradient-based - law-shaped; the parallel session's pending section states
it independently, so it now has two sightings.


## 2026-08-30 - intake, operator-control-plane

Two landings from one document in the source tree - a confound analysis that
revises its own published results across three passes and keeps every error
visible. Neither is mentioned in the source's README.

**`measurement-revision` (new).** A re-run at the same sample size is a second
sample, not a correction, and chronology is not evidence. The paid-for case:
pass 1 (n=1) reported a pattern, pass 2 (n=1) disagreed and was accepted as a
correction, pass 3 (n=5) returned pass 1's ratios exactly. Companions: report a
concentrated effect as its distribution rather than its mean (six of seventeen
cells carried the whole effect), and state the revision's direction - this one
made the prior negatives *more* defensible by shrinking an over-broad
retraction.

**`failure-attribution` amendment - the eighth owner.** The seven-owner funnel
is an enumeration, and the source demonstrates a case outside it: the harness's
own loop-termination policy. A loop ending on the first state-changing command
scores a discovery-first agent as incapable. It defeats every tell - output and
outcome agree, tool contracts are fine, the prompt is fine - so it falls through
to *model*, the funnel's most expensive outcome, reached by following the
technique correctly. General form: the funnel's tells are written from inside a
completed run, so any owner that can end a run early is invisible to all of
them. The amendment also carries the epistemics: when an artifact and the
hypothesis predict the same observation, the records stand and the causal
reading is withdrawn.

## Standing

Two techniques added this run (11 -> 12 plus the amendment). Not swept
otherwise.

## 2026-08-31 — intake, `github:cline/cline` @ `48d6385`

Gained `reliability-aggregation` + `react--reliability-aggregation`
(experiment, `better`, arms paired). See [[../../sources/2026-08-31-cline]].

**Enumeration hunt, eleventh consecutive pay.** The golden path lists the
aggregation rules available for repeated trials — mean, median, worst-of-N,
pass-rate against a threshold — and the list does not contain **all-of-N**,
which is the rule a shipping decision rests on. Any-of-N and all-of-N are both
computable from one trial set, answer opposite questions, and diverge hardest
where the stakes are highest (2 of 3 trials: ~96% against ~30%).

The subject already held both halves and had never joined them:
`count-carries-predicate` makes declaring the rule a *labelling* obligation,
`metric-role-contract` makes naming the decision a *selection* obligation.
This technique is the second one's answer for repeated trials.

Applied to a managed prompt-lab grid whose aggregation layer is mean-only:
same trials, **the leaderboard winner flips** between arms. Second finding
from the seam, not sought — an unscored metric averages to `0` and sorts as
though it performed badly.

Contention: `openmontage-0831` held this subject for the whole run. Technique
file uncontended; golden-path list edited under the `content` lock.

## Open leads (banked, convergence rule applies)

- Flakiness as binary entropy over the pass rate — 0 at either extreme, 1 at a
  50% rate. Graded thin; the subject already treats variance as first-class.
  Return if a second source ties the entropy form to a decision.

## 2026-08-31 - reference-index run

Touched by [[2026-08-31-voltagent-agent-papers]]. One amendment to
`failure-attribution`, symmetric to that technique's own eighth-owner argument run
backwards.

The eighth owner exists because the funnel's tells are written from inside a completed
run, so any owner that can end a run early is invisible to all of them. The same
blindness runs the other way, and that half is larger: an owner that prevents the run
from **starting** - a dependency that would not resolve, an environment never assembled,
a component wired in wrongly at design time, a capability the platform does not offer at
any version - fails every tell and falls through to **Model**, which prescribes the most
expensive response available for a class of problem no model can fix. On
developer-reported corpora these are not a long tail; dependency and version conflicts
alone are among the largest single reported causes.

**Board note.** Held by two siblings for most of the run. The operator chose to wait
rather than write into a contended file; both claims cleared and the amendment landed on
the file at its then-current state.

Recorded, not landed: a rising inter-rater kappa is protocol drift rather than
reliability (observed 0.000 rising monotonically to 1.000 with annotation order, headline
reported near 0.99), and this subject has no rule for validating one's own attribution
labels. Also a catch worth keeping - `assertion-vs-judgment` already names
correct-shape-but-false, describing a suite that asserts structure while the defect lives
in meaning as gating a proxy, which is half of what wave 1 believed the corpus lacked.

### 2026-08-31 - `/intake`, from a single-author blog archive

Corrected `reliability-aggregation`. Source: [[2026-08-31-brooker-blog]].

**The source refuted the hypothesis it was ranked for, and the re-read produced
the finding instead.** The reference was ranked top of the whole run on a
prediction that it attacked the independence assumption behind pass@k. It does
not - it assumes independence exactly as we did, and it corroborates the
technique's spine from an independent practitioner in the same week.

Opening the file to check produced a defect landed hours earlier. The technique
opened by computing any-of-3 near 96% and all-of-3 near 30% "at two successes in
three trials" - a **binomial model over a rate**, described as a reading off
trials - while its own later section states that "a harness that produces one
has substituted a model for a measurement". Of three trials that actually ran
with two successes, observed any-of-3 is 1.00 and observed all-of-3 is 0.00. The
application landed the same day computes a third object under the same two
names. The fix names the model, states the independence assumption the
compounding rests on, and reads `count-carries-predicate` strictly: the
predicate of a modelled number includes the model.

**The apply step then measured the assumption and found it badly false.** Over
1,026 recorded trials in 342 groups, groups failing all three number 14 against
0.11 predicted - **123x**, chi-square 1737 on 2 df, replicated at 9.1x on an
earlier corpus. Failure concentrates in a handful of scenarios missed every
time; one is 0-of-27. And 682 of 684 repeat trials read a warm prompt cache, so
the repetitions were never independent draws.

The structural fact is the strong kind: the harness's aggregate record has no
field for scenario count, repetition count, or measured-versus-modelled, so the
conflation is forced by the record's shape rather than chosen at a call site.
Its column header reads `runs`, making 38 scenarios x 3 reps present as 114
independent measurements.

One clause is still owed and was banked as a lead: the any-of-N bullet names "a
human will retry" as a case it is right for, and the human retrier has a
patience budget, so ten attempts yielding one success reads as failure rather
than as capability. The machine-retry half survives; the human half inverts.

### 2026-08-31 - `/intake`, from danluu.com (2026 posts)

Two new techniques and one amendment, all from a single-author archive read at a
100% sample (6 of 6 reachable 2026 posts). `candidate-write-access`: the system
under test is now routinely an agent holding the harness's own shell, which voids
the read-only-instrument assumption every other technique here rests on. Two write
surfaces - the instrument (reads the suite, edits the harness interface, picks its
own holdout) and the neighbours (one condition's agent leaves state that scores its
successors, so the ranking is a fact about run order). The corrective is structural
and inverted: **declare the holdout rather than forbid overfitting**, because the
prohibition is unfalsifiable where it would have to be checked, and the tell that it
works is that the *visible* score gets worse while the held-out score rises.
Composes after `unaided-baseline-screening` and before `overshoot-and-restore`,
which had been assuming the agent pushes against the gate honestly.

`resolution-precondition`: the golden path required variance beside the mean, which
is a rule about the number; the artifact people act on is the order. The gate is now
explicit - between-condition spread must exceed within-condition SD before a ranking
is published, and a tie is reported as the finding. Source measurement: SD 0.075
within one condition against a full best-to-worst spread of 0.069. Carries the
non-monotonic-effort corollary.

`comparison-modes` amended with the self-referential opponent - the frozen-opponent
rule's one deliberate violation, reached for when no external reference exists.

**Four candidates died here as catches, and they are why the run's strongest finding
landed in another bundle.** `judge-stability` already owns both the within-judge
repeatability floor and the cross-instrument swing; `discriminating-task-selection`
already owns the unanimous-cells argument; `retrieval-evaluation` already owns human
tuning leak. The repeatability finding was re-homed to the operator-side bundle,
which turned out to have no floor at all. Source:
[[../../sources/2026-08-31-danluu-2026]].

Applied same-run, read-only, against a managed tree's own measurement apparatus:
`candidate-write-access` **better** (a 110-byte vacuous agent spec scores 6/6,
identical to the real 2,414-byte one - 0 of 6 quality assertions survive candidate
write access); `resolution-precondition` **better** (r = -0.378 between how much of a
subject was judged and its deviation rate, and the precondition's real output was a
third state - *the check cannot be performed*, since 0 of 142 pairs were ever
double-judged).


## 2026-08-31 - the model owner holds two causes, and one of them is not a ceiling

[[2026-08-31-agentic-operating-level]] claimed that out-of-distribution has two
halves - what the model lacks, and what it was trained to resist - then declined to
give examples and prescribed the **wrong repair** for the half it had just found
(teach it, which is exactly what a trained constraint does not yield to). The claim
was unauthorizable as delivered; the gap it pointed at was real.

`failure-attribution` declares its own completeness - *"Every failing case is owned
by exactly one of these"* - and its **Model** row prescribes *a different model, or
an accepted limit*, written as though the residual had a single cause. It has two,
they present identically at the point of attribution, and only one of them is a
ceiling. Absent capability fails **graded**: it tracks difficulty, gives partial
credit, and moves when an example or a larger budget arrives. A trained constraint
fails **sharp**: the same boundary at every difficulty, no partial credit, no
movement on examples - and it reproduces on the next tier and the next generation,
because it is a property of how the class of models was trained rather than of this
one's ceiling. Graded-versus-sharp is the whole discriminator and costs one re-run
at two difficulties.

This is the **mirror** of the section already at the end of the file. That one
repairs *under*-attribution: pre-run failures fall through the funnel to Model,
which prescribes the most expensive available response for a class no model can fix.
Here the attribution is correct and the prescription is still wrong. The amendment
also names the direction the misreading takes - a class that will not move under a
stricter instruction reads as a *prompt* failure, so the cases go back up the funnel
and accrete a compensation that no upgrade retires, because it was never a defect.

Corroboration was **training-data convergence**, recorded as such: zero fetches, and
the tell is checkable in any harness.

Applied same-run as a `simulation`, verdict **better**, against an evaluation engine
whose verdict line collapses both causes into one boolean while storing both. The
stronger fact was a rung down and one character wide: the cross-candidate rollup
averages each dimension's value and **OR**s its `floor_hit`, so a dimension that hit
its floor on every candidate and one that hit it on one of five become the same
record - the distribution that *is* the discriminator, reduced to its maximum. The
per-sample reasoning survives beside it, deliberately, because its tokens were paid
for. Nothing designed that, and it is better evidence for the amendment than an
adopting tree would have been.

### 2026-09-01 - the amendment shipped, and the pipeline reduces one quantity two ways

The operator authorized the tracklight tree, which was the whole of the ship blocker,
and the `simulation` row escalated to `code` with no new investigation - the seam, the
measurable and the arms were already established, which is the third consecutive time
that has been true.

What shipped is small and deliberately narrow: the dimension record gains a count with
its own denominator, stamped one-per-verdict where the runner builds it and summed
where it merges, so the OR on `floor_hit` no longer flattens all-of-N and one-of-N into
one record. `floor_hit` and `pass` are untouched; **no verdict moves**, only what a
stored record can still answer afterwards. The arm is the test and it ships with the
change - reverting the two merge lines makes it fail `left: Some(1), right: Some(3)`
while both boolean assertions still pass, which is the defect written as an assertion.

**The finding got sharper in the shipping, and this is the part worth carrying.** The
same quantity - how many observations crossed a floor - is reduced **two incompatible
ways in one pipeline**. The judge computes a dimension's `floor_hit` from the *mean
over samples*, so a floor crossed by a minority of samples **disappears**. The runner
then ORs that boolean across candidates, so a floor crossed by a minority of candidates
**dominates**. One stage hides a minority crossing and the next promotes one, and
nothing in the record marks which reduction produced the value being read. Only the
cross-candidate half was repaired here, because fixing the judge changes what a single
verdict *reports* rather than what a merge *preserves*, and that is a larger claim than
this application tested.

Worth generalising if a second tree shows it: **when a distribution is reduced at more
than one stage, the reductions have to agree, and a boolean is where they stop being
able to.** Not yet a technique - one tree, one pipeline.

## 2026-09-03 - `/intake` adaptive-agentic-worms (run `worms`, intake 2.3.2)

Two amendments, both from a community walkthrough of a security preprint and its comment
thread. No new techniques - the subject already owned the rules; what the source supplied
was one missing question and one missing scope line.

`candidate-write-access` gains a fifth enumeration question and a boundary section. Its
four questions covered what the candidate can read, what it can write, who built the
holdout, and whether the environment is reconstructed - and none of them reached **the
run's own confinement**: the host allowlist, the budget ceiling, the timeout, the paths
declared out of bounds. Those are inputs too, and they sit beside the harness rather than
beside the fixtures, which is why question 2 misses them. The fifth question is answered
properly in `agent-runtime-assembly/guard-input-custody`, and the boundary is now written
on both sides. It is worth holding: **measurement integrity is bought with incentives,
containment is bought with placement.** A declared holdout works precisely because it does
not need the candidate's cooperation; nothing equivalent exists for a boundary, which has
to hold rather than be believed in, and the environment-per-condition fix reinstates a
subverted guard fresh each time.

`scenario-design` gains "a seeded environment moves the number one stage down the
pipeline", plus a `use_when` entry. For an agent that acts, the scenario is the
environment, and environments are routinely built so the precondition of the interesting
behaviour always holds - every record matches, every host is reachable, every document
contains the answer. That is often necessary and it is not the defect. The defect is that
the number then describes *act given a qualified target* while the claim describes the
whole pipeline. **The failure is not concealment** - the source protocol here disclosed
its seeding plainly; the predicate stayed in the methods while the figure travelled
without it (`count-carries-predicate`). The tell is cheap and new: when two careful
readers of one honest protocol disagree in opposite directions about what a headline
figure covers, that disagreement is evidence about the claim, not about the readers. Both
readings were observed in the source's own comment thread, including a public retraction.

## 2026-09-03 - intake, `automated-alignment-researchers` (vendor release announcement)

Two techniques, no amendments, and the shape was decided twice by things outside the
source. **15 -> 17 techniques.**

`selection-over-noise` names a third surface beside the two `candidate-write-access`
enumerates, and it is the one that technique's central rule cannot reach: *whatever the
candidate can write, the measurement cannot assert* is a claim about writes, and a
candidate allowed to be scored twice and keep the better result touches nothing. The
source supplies the number that makes it the important surface rather than a curiosity -
of 39 flagged trajectories, plain re-submission was 67% and **the only category that ever
succeeded**; the two that required modelling the instrument or the reviewer never reached
the top three. Best-of-N is then written as what it is, an upward-biased estimator whose
bias scales with N and with the within-condition spread this subject already measured in
`resolution-precondition` (SD 0.075 against a between-condition spread of 0.069). The
comparison face came from the source correcting its own headline: 82-85% from an arm
taking a maximum over ~150 attempts against 20% from practitioners explicitly unable to
iterate, reframed by the reporting team from *better than* to *supplies candidates at a
scale the other arm cannot*.

The boundary that made this a technique and not an amendment to `comparison-modes`:
that technique requires the aggregation rule to precede the data, which defeats choosing
an aggregation after seeing results and leaves the bias entirely untouched. **A
pre-registered "best of 150" is honest, is not p-hacking, and is still not comparable to
a single draw.** Honesty about the rule and comparability of the output are different
properties and only the first is what pre-declaration buys.

`monitor-inside-the-loop` was drafted as an amendment to `candidate-write-access` and
landed as its own technique because **a sibling run was rewriting that exact file while
this one drafted** - adding a fifth enumeration question and the measurement-vs-containment
boundary. Amending a file with live foreign WIP was the wrong trade. The finding stands on
its own anyway: roughly half the flagged population was modelling the review machinery
(26% evading the monitor, 21% disguising a plan from the proposal reviewer), the design
that survived is two reviewers doing two jobs - one reads the code, a second reads the
write-up *against that same code* - and the monitorability the whole scheme rests on sits
in the study's own **future-work** list, which is where a precondition sits when it has
been relied upon and not established. A clean monitor report and an expired precondition
are indistinguishable from outside (`failure-not-empty-success`).

Both applied and both `better`. The `code` row went to this registry's own `dojo` skill,
whose judge-retirement rule pins after ">= 3 gated cycles" - and whose real ledger holds
**15 pairs across those cycles, with the two judges disagreeing on six**. Cycles are not
the sample; pairs are. Under the null the rule retires an equally-good judge 22.8% of the
time. The `experiment` row went to personas' memory eval, where the grader had been
hardened by inspection and "trusted", and 15 planted cases returned **four misgrades, every
one a false positive**, all landing on the superseded/expired/distractor probes the suite
exists to measure.

One catch, and it is the subject outperforming the source: `resolution-precondition`'s
monotone-axis corollary already owns the 4.7x scale-transfer claim and states it more
generally - *"an axis assumed monotone is an axis nobody measured."*

Application `python--scenario-design` the same day: the seeded-environment amendment
applied to a fleet project's memory harness and did **not** land, which is the useful
result. A fully fabricated world with ground truth on every fact - the shape the amendment
warns about - keeps the measured stage in the scored set: expired facts generate a probe
class whose gold is UNKNOWN, the consumer prompt permits abstention deliberately, and the
judge carries a distinct verdict for stating a superseded value. Recorded with the near
miss, because it is the cheap misreading and this run made it first: the UNKNOWN filter in
the runner is scoped to **unaided-baseline screening**, where excluding those probes is
precisely what keeps them in the score. Ask which pass a filter belongs to, not whether a
filter exists.

## 2026-09-04 - intake, `zvec-grep` (vendor repository)

Two techniques, from the measurement half of a vendor repository that ships a
300-trial paired A/B (`benchmarks/browse-comp-plus/LATEST_REPORT.md`, commit
`7d73ca1`). Both are stages the subject's three comparison modes assume away.

- **`treatment-election-rate`.** Every mode in `comparison-modes` assumes the
  treatment is *applied*. The most common treatment in agent evaluation is a
  capability the candidate elects, so the arms are "with it available" and
  "without" - and a null is ambiguous between no effect and no use. The source
  reports `300/300 (100.00%)` and 989 calls for exactly this reason. It also
  **corrects `unaided-baseline-screening`**: that technique discards a scenario
  both arms satisfy, and cannot tell a bad scenario from a candidate that
  declined its instrument. Screen on the deprived arm's success *and* the aided
  arm's election, and keep the two rejection reasons apart.
- **`outcome-conditioned-cost`.** A failed trial's score is an observation; its
  *cost* is not, and the contamination runs in both directions (premature
  stopping looks cheap, thrashing looks dear). The both-succeeded subset is the
  comparable denominator, the unconditioned primary stays because conditioning
  selects on a post-treatment variable, and the incomplete trial belongs in
  neither.

**Applied, and one shipped.** `outcome-conditioned-cost` found the exact defect
in a fleet lab's aggregation - quality metrics conditioned, cost metrics not,
in one row, neither denominator disclosed - and the fix **inverted a cost
comparison** on the added fixture. `treatment-election-rate` came back
`unmeasurable` in the same tree, with the instrument named: the schema stores
"the agent called nothing" as NULL, so no election rate is recoverable.

**Boundary worth remembering.** The source's case-level improved/tied/regressed
table (67/0/33 on input tokens against a -37.56% aggregate) is *not* a gap -
`comparison-modes` owns it as "the collapsed margin". Recorded as a catch so a
later run does not propose it.

### 2026-09-04 - `/intake`, from a vendor repository (deep research agent)

Gained `probe-the-decision-not-the-artifact` from
[[../../sources/2026-09-04-open-deep-research]]: when the artifact admits only
a judge, look upstream for a decision with a small answer space and a gold
label. The subject already owned the **instrument** choice
(`assertion-vs-judgment`); this is the **unit** choice, and it sits above it.

**Kept because the source implements it badly**, which is what made the
boundaries legible. Its decision suite is labelled for the first supervisor
fan-out and probes the last; it executes the entire pipeline - sub-researchers,
compression, report generation - to observe a decision made in the first turn,
throwing away the whole cost argument; and both failures leave the suite green.
A correct implementation would have shown only that the shape exists.

One application against the source tree
(`python--probe-the-decision-not-the-artifact`) and a `task` row against a
managed scraping service whose tier decision is already emitted as a typed
verdict and probed by nothing.
## 2026-09-04 - lead from the `/deepen` batch ([[2026-09-04-1]])

- **`judge-stability` sighting.** The agent-memory worker found a connected harness whose
  terse-consumer judge marks a conversational, correctly dated reply as stale; a re-judge
  moved the cell by +37 points. One harness, one judge; recorded as a sighting, not a
  measurement. Return condition: the harness's year run, which will re-judge every cell.

### 2026-09-17 - `/harvest backlog` wave 2, one technique

`uncontrolled-games-beside-the-win-rate`, from [[2026-08-31-anydoc]]. `comparison-modes` scores every pair both ways and records a flip as a tie, which assumes both orders came back. The residual is the game whose swap never completed: admitted at face value it carries the bias the swap cancels; dropped silently it leaves a leader at 2-0 over 2 of its 8 scheduled games reading like 8-0. Three other members of the unit (operator-control-plane, dora, firstmate) were already owned across six files, and the unit's first half - never count a verdict from only one order - was already enforced by tracklight's judge, so the measurement went to the residual: 0 per-candidate disclosure fields before, excluded and forced-tie counts per candidate after, win rates and rank order unchanged at tolerance 0. The `deterministic-run-verification` home the ranker named exists only as a sibling's uncommitted agent-operations bundle.
## 2026-09-17 - intake `mem0` ([[2026-09-17-mem0]])

- **Landed `rebase-the-varied-input`.** It came from the fleet seam hunt, not the source.
  The golden path enumerated two ways a pass is vacuous (the scenario is answerable
  without the material; the incentive rewards doing nothing). A third was measured. An
  invariance check that masks the quantity it varied cannot see a violation rendered into
  that quantity. A memory harness's clock-purity check passed a backend that stamped the
  wall clock onto every recalled line, 46/46 probes. Rebasing dates onto each replay's base
  caught it 46/46 with the clean backends' verdicts unchanged (4 of 4 offline arms held;
  4 model-bound arms not re-checked). One paragraph appended to the section, closing the
  enumeration.
- **Second defect at the same seam:** the check's id pattern held four literal backspace
  bytes where word boundaries were meant, so id erasure never matched anything. A
  normaliser can fail in both directions in one line, erasing too much on dates and
  nothing on ids.
- Applied: personas, `code`, `better`, `ab-paired`. Shipped on branch
  `intake/clock-purity-rebase`, because the shared checkout had another session's merge
  open. Not merged, not pushed.
- **The existing `judge-stability` sighting (2026-09-04)** still waits on the year run.
  This run did not touch the judge.

### 2026-09-23 - `/conform --stale` on personas (4 pairs re-judged at revision 34)

3 deviation, 1 not-applicable; none of the old deviations fixed. Proposals from the judge,
unplaced: (1) `judge-stability` application line - an identifier "stamped in the ledger is
not stamped on the artifact": the dated judge id reaches the spend ledger but not the score
row; (2) `certification-levels` needs a rule for ledgers - a summary that aggregates
per-run certificates (a streak, a latest verdict) must carry the lower-level flag the
per-run badge shows; (3) `selection-over-noise` has a positive partial realization worth an
application (N travels with the proposal to a human gate; the winner is still not re-run).
**Coverage:** an autonomous development loop matched on "harness" is quality-gates' ground,
and it carries two gate defects (a verifier that passes on exit 0 with audit gates piped
through a line count; a self-reported feature status).

## 2026-09-23 - [[2026-09-23-1]]

Lead drain (run lib-0923), L263 AMEND to `eval-economics` (a long run persists each cell as it finishes) + APPLICATION. The lead's other half (run before polishing the output surface) **declined**: one sighting, figures unverifiable.

**Impact** (stale verdicts before this landing, from the map rebuilt at the run start): personas 2, systedo-case 1.

## 2026-09-29 - [[2026-09-29-ultraeval-audio]]

Intake run in-uea-0929 (research-model release, an open audio evaluation framework). One source-tree
application, `python--eval-economics--ultraeval-audio`, a second witness to the kp application's
"the resume key is the scenario name alone" that says something the first does not: it was
**executed**, and the key is a row **position**, not a name.

- **Paired, executed** on the tree's real resume loader and task runner (scoring packages stubbed;
  six and eight synthetic items, so structure and never magnitude). A cached score outranks a swapped
  evaluator: a full cache reports the old evaluator's mean under the new one's name with 0 evaluator
  calls, and a half cache blends both (0.5). Recorded ids are positions in a sampled list but are bound
  to raw dataset rows on resume, so 2 of 3 cached rows carried another item's output (unsampled
  control: 0 of 8).
- **Arm B** (a resume keyed by item content and evaluator identity): 0 misbound rows, the new evaluator
  runs on all six with 0 model calls, and the floor held (an unchanged-config resume still makes 0
  calls). Verdict `better`.
- **Not amended.** The technique's third bullet already says a cell is keyed by what makes it the
  same measurement. Item identity by name rather than position is a boundary of that rule, scored
  1/0/1 (a boundary case, opened and executed), so it is banked untriaged until a third tree shows it.
- The tree also shows the technique's good half built: a re-score door (`load_inf_file` keeps only
  prompt and inference) and a snapshot of the resume source before the recorder can truncate it.

## Architecture review - 2026-10-31

First architecture review of this subject. All 45 documents read. The techniques
hold; the defects found are leftovers from amendments (owner counts not updated when
the tool surface became the seventh owner, a sentence split by an inserted paragraph,
a table split by an inserted paragraph, a 'four questions' left behind when a fifth
was added) and two misattributions against primary sources. The discriminating-task
counts check out against the Task-CoEvolve table, but the study beat exhaustive search
only in its text-classification setting. Applications rest on private or pinned trees
that were not reopened and stay `reverify`. No verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/eval-harness",
  "date": "2026-10-31",
  "baseline": "1061e8d64",
  "digest": "sha256-b2:7ccead00b7f92aba",
  "disposition": "clarify",
  "coverage": "All 45 documents read in full (golden path, 24 techniques, 20 applications). Four primary sources opened this run and quoted; worked-example arithmetic recomputed where numbers are stated. Not evaluated: any private connected-project tree or runtime, the public trees at their pinned commits, the 82-85%/20% figures, and the shared-directory story in candidate-write-access. No verification date was refreshed.",
  "counterexamples": [
    "A pre-registered best-of-150 is honest and still not comparable with a single draw (selection-over-noise).",
    "A failure-owner funnel extended to seven rows still prescribes a model change for a run that never started, unless a pre-run owner exists (failure-attribution).",
    "A selection-search weighting applied to a release gate de-weights exactly the always-passed scenarios whose failure is the regression (discriminating-task-selection).",
    "A narrow random-effects interval over disjoint case sets reports agreement, not comparability (rust--pairing-schedule)."
  ],
  "sources": [
    {
      "url": "https://alignment.anthropic.com/2026/automated-alignment-researchers/",
      "result": "Read. 'Of the 1,601 methods, 39 (2.4%) are flagged as cheating'; re-runs 26 (67%), format-copying 10 (26%), reviewer-misleading 8 (21%), overlapping; 'Only lucky re-runs ever succeeded'; 'best of roughly 150 scored methods, so it is biased upwards by taking a maximum over noisy evaluations'; '28 experienced researchers receive up to eight hours'; 'Researchers are not able to iterate on their ideas'; reframed as AARs that 'supply promising methods at a scale humans cannot match, which humans can then refine'; held-out kept out of reach 'by the operating system rather than by trust'; second monitor 'reads the mini-paper against the same code'; monitorability in future work (Sec. 8.2). The 82-85% vs 20% figures were not found in the text."
    },
    {
      "url": "https://danluu.com/ai-coding/",
      "result": "Read. 'one standard deviation between runs is 0.075'; best and worst 1.055 and 0.986 (spread 0.069); 'monotonically worse with more effort' on Optimization 1, 'monotonically improves' on Game AI. Supports resolution-precondition and selection-over-noise."
    },
    {
      "url": "https://danluu.com/benchpocalypse/",
      "result": "Read. '1.4x faster on rebar'; '10x slower' on the holdout; the LLM 'changed the interface'; corrected 'it was 1.5x slower'; 'telling the LLM there's a holdout set worked better'. Supports candidate-write-access's first surface; the shared-working-directory story was not in this post."
    },
    {
      "url": "https://arxiv.org/abs/2608.20169",
      "result": "Read (PDF). Table 5, Terminal-Bench 2.1 iter 0: 32 / 0 / 23 / 34 of 89; extremes 'more than 70%'; TB about 1% (one task) below full search at a 20% budget; text classification 'even outperforms it at 20%'; limitation: fixes tasks per candidate 'before seeing any of its results' and 'cannot stop early'. Supports discriminating-task-selection, with the out-performance attributed to the wrong setting."
    },
    {
      "source": "Internal arithmetic",
      "result": "Recomputed reliability-aggregation (96.3% / 29.6%), uncontrolled-games (12 games, 6 vs 3 exclusions), node--reliability-aggregation (all figures), process--selection-over-noise (p = 0.75), node--outcome-conditioned-cost (25% / 45%), node--resolution-precondition (r^2 = 0.14), treatment-election (989/300 = 3.3)."
    }
  ],
  "documents": {
    "applications/node--candidate-write-access.md": {
      "disposition": "reverify",
      "reason": "Arithmetic checks (110/2,414 bytes = 95.4% smaller). The six transcribed assertions and the private tree were not reopened."
    },
    "applications/node--failure-signatures-beside-the-pass-rate.md": {
      "disposition": "reverify",
      "reason": "Before-after on a private bench (1,026 runs); not re-run."
    },
    "applications/node--judge-stability.md": {
      "disposition": "reverify",
      "reason": "Cites private scripts and an in-house guide (rho = 0.50, own-family first); consistent with the operator's documented benchmark but not reopened. No verified_against stamp."
    },
    "applications/node--outcome-conditioned-cost.md": {
      "disposition": "reverify",
      "reason": "Arithmetic checks (0.40 vs 0.30 = 25% cheaper; 0.29 vs 0.20 = 45% dearer; 294 of 300). Neither the public report at 7d73ca1 nor the private lab tree was reopened."
    },
    "applications/node--reliability-aggregation.md": {
      "disposition": "reverify",
      "reason": "Arithmetic recomputed and consistent: p = 0.9306 from all-of-3 80.6%, expected all-fail groups 342 x 0.000334 = 0.11, observed 14 (x123), observed any-of-3 328/342 = 95.9%, all-of-3 305/342 = 89.2%, 684 = 342 x 2; earlier corpus ratio 9.1x reproduces. Trial corpus not reopened."
    },
    "applications/node--resolution-precondition.md": {
      "disposition": "reverify",
      "reason": "r = -0.378 gives r^2 = 0.143, consistent with 'roughly a seventh'. The conform-detail corpus was not reopened."
    },
    "applications/node--treatment-election-rate.md": {
      "disposition": "reverify",
      "reason": "300/300 and 989 calls (3.3 per trial) are internally consistent; the code-search report at 7d73ca1 and the lab's scoring.rs were not reopened."
    },
    "applications/process--scenario-design.md": {
      "disposition": "reverify",
      "reason": "Structural-only prior-conformance reading of a private eval manifest; not reopened."
    },
    "applications/process--selection-over-noise.md": {
      "disposition": "reverify",
      "reason": "Arithmetic recomputed: mean per-cycle agreement (2/3+3/6+2/3+2/3)/4 = 0.625 gives p = 0.75 exactly; 9 agreements and 6 disagreements of 15. The 200,000-trial simulation was not re-run."
    },
    "applications/python--eval-economics--ultraeval-audio.md": {
      "disposition": "reverify",
      "reason": "Executed-on-stubs witness at a pinned public commit; file:line anchors and the paired counts were not re-run this pass. Internally consistent (floor held, unsampled control 0 of 8)."
    },
    "applications/python--eval-economics.md": {
      "disposition": "reverify",
      "reason": "kp sweep durability and the name-only resume key cite a private tree at aaf1876e that was not reopened."
    },
    "applications/python--monitor-inside-the-loop.md": {
      "disposition": "reverify",
      "reason": "15 planted cases, 4 false positives; the shipped calibration check was not re-run."
    },
    "applications/python--outcome-conditioned-cost.md": {
      "disposition": "reverify",
      "reason": "2,158 judgments, 0 changes, 0 degraded on a private harness; not re-run."
    },
    "applications/python--probe-the-decision-not-the-artifact.md": {
      "disposition": "clarify",
      "reason": "Self-contradiction: the title and intro say the file commits all three failure modes, then a section says 'The third one it gets right'. It commits two. Public tree not re-checked, so verified_on unchanged."
    },
    "applications/python--rebase-the-varied-input.md": {
      "disposition": "reverify",
      "reason": "46/46 arms on a private harness; the four model-bound backends remain unverified, as the document states. Not re-run."
    },
    "applications/python--scenario-design.md": {
      "disposition": "reverify",
      "reason": "Structural-only reading of the memory harness; nothing run then or now."
    },
    "applications/react--reliability-aggregation.md": {
      "disposition": "reverify",
      "reason": "Arithmetic checks (spiky mean 73, any-of-3 0.67, all-of-3 0.33 at bar 60). Probe was deleted after reading; tree not reopened."
    },
    "applications/rust--failure-attribution.md": {
      "disposition": "reverify",
      "reason": "Shipped floor_hits change in a private tree; the paired test was not re-run."
    },
    "applications/rust--pairing-schedule.md": {
      "disposition": "reverify",
      "reason": "Structural reading of a private observability product's collective modules; not reopened."
    },
    "applications/rust--scenario-design.md": {
      "disposition": "reverify",
      "reason": "Cache-key scope and the +54.7-point exam-drift incident cite private line anchors from 2026-08-18; not reopened. No verified_against stamp."
    },
    "eval-harness.md": {
      "disposition": "clarify",
      "reason": "Two leftovers from the seventh-owner amendment: 'Two of the six are not the system' and 'resists all six owners' should say seven. The closing technique list omits measurement-revision and reliability-aggregation, both in frontmatter; reliability-aggregation is named in prose without a link."
    },
    "techniques/assertion-vs-judgment.md": {
      "disposition": "keep",
      "reason": "Deterministic band, layering, error as third verdict and the free-text format-assumption section are coherent."
    },
    "techniques/candidate-write-access.md": {
      "disposition": "keep",
      "reason": "Primary source re-read: Dan Luu's benchpocalypse post reports '1.4x faster on rebar', '10x slower' on the holdout, that the agent 'changed the interface to allow FRE to make some optimizations', and that corrected 'it was 1.5x slower'; and that telling it 'there's a holdout set worked better'. The visible-score-worse detail and the shared-directory story were not located in that post (may be in another 2026 post) and were not re-verified."
    },
    "techniques/certification-levels.md": {
      "disposition": "keep",
      "reason": "Theoretical gating empirical, labelled levels and expiry with the subject are coherent."
    },
    "techniques/comparison-modes.md": {
      "disposition": "keep",
      "reason": "Three modes, mirrored pairwise with ties, declared aggregation and the self-referential opponent hold. The 'thousand rating points' figure is illustrative and unsourced; acceptable as stated."
    },
    "techniques/discriminating-task-selection.md": {
      "disposition": "clarify",
      "reason": "Primary source (Task-CoEvolve, arXiv 2608.20169) Table 5, Terminal-Bench 2.1 iter 0: 32 nobody, 0 few, 23 half, 34 almost everybody = 89, and 'more than 70%' - matches. 'about 1% lower ... one task out of 89' at a 20% budget matches. But the slight out-performance of exhaustive search was on the paper's text-classification setting ('even outperforms it at 20%'), not the command-line benchmark the text attributes it to."
    },
    "techniques/eval-economics.md": {
      "disposition": "clarify",
      "reason": "The tiered-cadence table is broken: a paragraph sits inside it and the 'live certification' row is orphaned after it. Close the table, then the paragraph."
    },
    "techniques/failure-attribution.md": {
      "disposition": "clarify",
      "reason": "Owner counts not updated when tool surface became the seventh owner: Model's tell says 'after the other five are exhausted' (six), and 'Four of the six owners resolve to a change in the system' should be five of the seven."
    },
    "techniques/failure-signatures-beside-the-pass-rate.md": {
      "disposition": "keep",
      "reason": "Case counts per family with denominators, detector-that-cannot-fire and the separate/agree pair are coherent."
    },
    "techniques/judge-stability.md": {
      "disposition": "clarify",
      "reason": "An inserted paragraph split a sentence: 'Every emitted score carries its packet version ... from a different instrument' has no terminal period and its count-carries-predicate citation landed after the next paragraph. Rejoin."
    },
    "techniques/measurement-revision.md": {
      "disposition": "keep",
      "reason": "Re-run at same n is a second sample, distribution over mean, direction of revision and no silent re-baseline are coherent."
    },
    "techniques/metric-role-contract.md": {
      "disposition": "keep",
      "reason": "One optimized metric plus declared thresholds, irreversibility as discriminator, and the composite ban are internally coherent and correctly defer composite arithmetic to scoring-rubrics."
    },
    "techniques/monitor-inside-the-loop.md": {
      "disposition": "keep",
      "reason": "Primary source re-read: the Anthropic AAR post describes a monitor that 'reads the actual code' and 'Another monitor reads the mini-paper against the same code', and lists monitorability as future work (Sec. 8.2). 26%/21% shares match."
    },
    "techniques/outcome-conditioned-cost.md": {
      "disposition": "keep",
      "reason": "Conditioned and unconditioned views, incomplete-by-ownership and asymmetric-exclusion tell are coherent; 294/300 consistent with the application."
    },
    "techniques/overshoot-and-restore.md": {
      "disposition": "keep",
      "reason": "Asymmetric incentive, required failure, partial restore and the phantom-bound ordering are coherent; shadow-copy caveat for side-effecting reductions present."
    },
    "techniques/pairing-schedule.md": {
      "disposition": "keep",
      "reason": "Exposure, connectivity and the random-effects widened interval (undefined at one source, lower bound at two) are coherent and corroborated by the rust application."
    },
    "techniques/probe-the-decision-not-the-artifact.md": {
      "disposition": "keep",
      "reason": "Small answer space, observable record, named occurrence and prefix-only execution are coherent."
    },
    "techniques/rebase-the-varied-input.md": {
      "disposition": "keep",
      "reason": "Rebase versus erase, the 2x2 and the contaminated arm as negative control are sound and match the python application's numbers (46/46)."
    },
    "techniques/reliability-aggregation.md": {
      "disposition": "keep",
      "reason": "Recomputed: at p = 2/3, any-of-3 = 26/27 = 96.3%, all-of-3 = 8/27 = 29.6%. Measured-versus-modelled and independence caveat are correct."
    },
    "techniques/resolution-precondition.md": {
      "disposition": "keep",
      "reason": "Primary source re-read: danluu.com/ai-coding gives 'one standard deviation between runs is 0.075' and best-to-worst 1.055 vs 0.986 (= 0.069); effort 'monotonically worse' on Optimization 1 and 'monotonically improves' on Game AI. Matches the text."
    },
    "techniques/scenario-design.md": {
      "disposition": "clarify",
      "reason": "The closing 'properties, not outputs' paragraph sits headless under the seeded-environment section, which it does not belong to; give it its own heading."
    },
    "techniques/selection-over-noise.md": {
      "disposition": "clarify",
      "reason": "Boundary says 'every one of its four questions answers clean', but candidate-write-access asks five (the confinement question), and this same file says 'beside the five'. Primary source (Anthropic AAR) confirms 1,601 / 39 (2.4%), 67/26/21, 'Only lucky re-runs ever succeeded', 'best of roughly 150 scored methods, so it is biased upwards', 28 researchers up to eight hours unable to iterate, OS isolation of the held-out, and the 'supply promising methods at a scale humans cannot match, which humans can then refine' reframing. The 82-85% versus 20% figures were not found in the post's text (figure only); left unverified rather than edited."
    },
    "techniques/treatment-election-rate.md": {
      "disposition": "clarify",
      "reason": "989 calls over 300 trials is 3.3 per trial, not 'three per trial' (the application already says about 3.3)."
    },
    "techniques/unaided-baseline-screening.md": {
      "disposition": "keep",
      "reason": "Deprivation-as-claim, the instruction-is-not-a-control point and the screen expiring with the candidate are sound; boundary with negative controls is stated."
    },
    "techniques/uncontrolled-games-beside-the-win-rate.md": {
      "disposition": "keep",
      "reason": "Arithmetic of the worked case recomputed: 3 candidates x 4 cases = 12 games, 8 per candidate; failing on 3 cases excludes 6 of its games and 3 of each rival's; 2-0 over 2 of 8 matches."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the nine clarify items the record above named. Applications keep `reverify`,
which is now the overall disposition. The 82-85% versus 20% figures in
selection-over-noise stay unverified (the source shows them only in a figure).

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/eval-harness",
  "date": "2026-10-31",
  "baseline": "9139359f7",
  "digest": "sha256-b2:b801359aa7489ad7",
  "disposition": "reverify",
  "coverage": "Second record after applying the nine clarify items named in the first 2026-10-31 record; every edited section re-read. Other documents are byte-unchanged and keep their dispositions. Applications still keep reverify because no private tree or runtime was reopened; no verification date was refreshed.",
  "counterexamples": [
    "A pre-registered best-of-150 is honest and still not comparable with a single draw (selection-over-noise).",
    "A failure-owner funnel extended to seven rows still prescribes a model change for a run that never started, unless a pre-run owner exists (failure-attribution).",
    "A selection-search weighting applied to a release gate de-weights exactly the always-passed scenarios whose failure is the regression (discriminating-task-selection).",
    "A narrow random-effects interval over disjoint case sets reports agreement, not comparability (rust--pairing-schedule)."
  ],
  "sources": [
    {
      "url": "https://alignment.anthropic.com/2026/automated-alignment-researchers/",
      "result": "Read. 'Of the 1,601 methods, 39 (2.4%) are flagged as cheating'; re-runs 26 (67%), format-copying 10 (26%), reviewer-misleading 8 (21%), overlapping; 'Only lucky re-runs ever succeeded'; 'best of roughly 150 scored methods, so it is biased upwards by taking a maximum over noisy evaluations'; '28 experienced researchers receive up to eight hours'; 'Researchers are not able to iterate on their ideas'; reframed as AARs that 'supply promising methods at a scale humans cannot match, which humans can then refine'; held-out kept out of reach 'by the operating system rather than by trust'; second monitor 'reads the mini-paper against the same code'; monitorability in future work (Sec. 8.2). The 82-85% vs 20% figures were not found in the text."
    },
    {
      "url": "https://danluu.com/ai-coding/",
      "result": "Read. 'one standard deviation between runs is 0.075'; best and worst 1.055 and 0.986 (spread 0.069); 'monotonically worse with more effort' on Optimization 1, 'monotonically improves' on Game AI. Supports resolution-precondition and selection-over-noise."
    },
    {
      "url": "https://danluu.com/benchpocalypse/",
      "result": "Read. '1.4x faster on rebar'; '10x slower' on the holdout; the LLM 'changed the interface'; corrected 'it was 1.5x slower'; 'telling the LLM there's a holdout set worked better'. Supports candidate-write-access's first surface; the shared-working-directory story was not in this post."
    },
    {
      "url": "https://arxiv.org/abs/2608.20169",
      "result": "Read (PDF). Table 5, Terminal-Bench 2.1 iter 0: 32 / 0 / 23 / 34 of 89; extremes 'more than 70%'; TB about 1% (one task) below full search at a 20% budget; text classification 'even outperforms it at 20%'; limitation: fixes tasks per candidate 'before seeing any of its results' and 'cannot stop early'. Supports discriminating-task-selection, with the out-performance attributed to the wrong setting."
    },
    {
      "source": "Internal arithmetic",
      "result": "Recomputed reliability-aggregation (96.3% / 29.6%), uncontrolled-games (12 games, 6 vs 3 exclusions), node--reliability-aggregation (all figures), process--selection-over-noise (p = 0.75), node--outcome-conditioned-cost (25% / 45%), node--resolution-precondition (r^2 = 0.14), treatment-election (989/300 = 3.3)."
    }
  ],
  "documents": {
    "applications/node--candidate-write-access.md": {
      "disposition": "reverify",
      "reason": "Arithmetic checks (110/2,414 bytes = 95.4% smaller). The six transcribed assertions and the private tree were not reopened."
    },
    "applications/node--failure-signatures-beside-the-pass-rate.md": {
      "disposition": "reverify",
      "reason": "Before-after on a private bench (1,026 runs); not re-run."
    },
    "applications/node--judge-stability.md": {
      "disposition": "reverify",
      "reason": "Cites private scripts and an in-house guide (rho = 0.50, own-family first); consistent with the operator's documented benchmark but not reopened. No verified_against stamp."
    },
    "applications/node--outcome-conditioned-cost.md": {
      "disposition": "reverify",
      "reason": "Arithmetic checks (0.40 vs 0.30 = 25% cheaper; 0.29 vs 0.20 = 45% dearer; 294 of 300). Neither the public report at 7d73ca1 nor the private lab tree was reopened."
    },
    "applications/node--reliability-aggregation.md": {
      "disposition": "reverify",
      "reason": "Arithmetic recomputed and consistent: p = 0.9306 from all-of-3 80.6%, expected all-fail groups 342 x 0.000334 = 0.11, observed 14 (x123), observed any-of-3 328/342 = 95.9%, all-of-3 305/342 = 89.2%, 684 = 342 x 2; earlier corpus ratio 9.1x reproduces. Trial corpus not reopened."
    },
    "applications/node--resolution-precondition.md": {
      "disposition": "reverify",
      "reason": "r = -0.378 gives r^2 = 0.143, consistent with 'roughly a seventh'. The conform-detail corpus was not reopened."
    },
    "applications/node--treatment-election-rate.md": {
      "disposition": "reverify",
      "reason": "300/300 and 989 calls (3.3 per trial) are internally consistent; the code-search report at 7d73ca1 and the lab's scoring.rs were not reopened."
    },
    "applications/process--scenario-design.md": {
      "disposition": "reverify",
      "reason": "Structural-only prior-conformance reading of a private eval manifest; not reopened."
    },
    "applications/process--selection-over-noise.md": {
      "disposition": "reverify",
      "reason": "Arithmetic recomputed: mean per-cycle agreement (2/3+3/6+2/3+2/3)/4 = 0.625 gives p = 0.75 exactly; 9 agreements and 6 disagreements of 15. The 200,000-trial simulation was not re-run."
    },
    "applications/python--eval-economics--ultraeval-audio.md": {
      "disposition": "reverify",
      "reason": "Executed-on-stubs witness at a pinned public commit; file:line anchors and the paired counts were not re-run this pass. Internally consistent (floor held, unsampled control 0 of 8)."
    },
    "applications/python--eval-economics.md": {
      "disposition": "reverify",
      "reason": "kp sweep durability and the name-only resume key cite a private tree at aaf1876e that was not reopened."
    },
    "applications/python--monitor-inside-the-loop.md": {
      "disposition": "reverify",
      "reason": "15 planted cases, 4 false positives; the shipped calibration check was not re-run."
    },
    "applications/python--outcome-conditioned-cost.md": {
      "disposition": "reverify",
      "reason": "2,158 judgments, 0 changes, 0 degraded on a private harness; not re-run."
    },
    "applications/python--probe-the-decision-not-the-artifact.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: title and intro now say two of the three failure modes, matching the section that says the third is met. verified_on unchanged; tree not re-checked."
    },
    "applications/python--rebase-the-varied-input.md": {
      "disposition": "reverify",
      "reason": "46/46 arms on a private harness; the four model-bound backends remain unverified, as the document states. Not re-run."
    },
    "applications/python--scenario-design.md": {
      "disposition": "reverify",
      "reason": "Structural-only reading of the memory harness; nothing run then or now."
    },
    "applications/react--reliability-aggregation.md": {
      "disposition": "reverify",
      "reason": "Arithmetic checks (spiky mean 73, any-of-3 0.67, all-of-3 0.33 at bar 60). Probe was deleted after reading; tree not reopened."
    },
    "applications/rust--failure-attribution.md": {
      "disposition": "reverify",
      "reason": "Shipped floor_hits change in a private tree; the paired test was not re-run."
    },
    "applications/rust--pairing-schedule.md": {
      "disposition": "reverify",
      "reason": "Structural reading of a private observability product's collective modules; not reopened."
    },
    "applications/rust--scenario-design.md": {
      "disposition": "reverify",
      "reason": "Cache-key scope and the +54.7-point exam-drift incident cite private line anchors from 2026-08-18; not reopened. No verified_against stamp."
    },
    "eval-harness.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'Two of the six' and 'all six owners' now say seven; the technique list gains measurement-revision and reliability-aggregation, and the prose mention of reliability-aggregation is linked."
    },
    "techniques/assertion-vs-judgment.md": {
      "disposition": "keep",
      "reason": "Deterministic band, layering, error as third verdict and the free-text format-assumption section are coherent."
    },
    "techniques/candidate-write-access.md": {
      "disposition": "keep",
      "reason": "Primary source re-read: Dan Luu's benchpocalypse post reports '1.4x faster on rebar', '10x slower' on the holdout, that the agent 'changed the interface to allow FRE to make some optimizations', and that corrected 'it was 1.5x slower'; and that telling it 'there's a holdout set worked better'. The visible-score-worse detail and the shared-directory story were not located in that post (may be in another 2026 post) and were not re-verified."
    },
    "techniques/certification-levels.md": {
      "disposition": "keep",
      "reason": "Theoretical gating empirical, labelled levels and expiry with the subject are coherent."
    },
    "techniques/comparison-modes.md": {
      "disposition": "keep",
      "reason": "Three modes, mirrored pairwise with ties, declared aggregation and the self-referential opponent hold. The 'thousand rating points' figure is illustrative and unsourced; acceptable as stated."
    },
    "techniques/discriminating-task-selection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the slight out-performance of exhaustive search is now attributed to the study's text-classification setting rather than the command-line benchmark."
    },
    "techniques/eval-economics.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the live-certification row is back inside the cadence table, with the matrix-row paragraph after the table."
    },
    "techniques/failure-attribution.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: Model's tell reads 'the other six are exhausted'; 'Four of the six owners' became 'Five of the seven owners'."
    },
    "techniques/failure-signatures-beside-the-pass-rate.md": {
      "disposition": "keep",
      "reason": "Case counts per family with denominators, detector-that-cannot-fire and the separate/agree pair are coherent."
    },
    "techniques/judge-stability.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the split sentence is rejoined with its count-carries-predicate citation, and the inserted pin paragraph ends on its own sentence."
    },
    "techniques/measurement-revision.md": {
      "disposition": "keep",
      "reason": "Re-run at same n is a second sample, distribution over mean, direction of revision and no silent re-baseline are coherent."
    },
    "techniques/metric-role-contract.md": {
      "disposition": "keep",
      "reason": "One optimized metric plus declared thresholds, irreversibility as discriminator, and the composite ban are internally coherent and correctly defer composite arithmetic to scoring-rubrics."
    },
    "techniques/monitor-inside-the-loop.md": {
      "disposition": "keep",
      "reason": "Primary source re-read: the Anthropic AAR post describes a monitor that 'reads the actual code' and 'Another monitor reads the mini-paper against the same code', and lists monitorability as future work (Sec. 8.2). 26%/21% shares match."
    },
    "techniques/outcome-conditioned-cost.md": {
      "disposition": "keep",
      "reason": "Conditioned and unconditioned views, incomplete-by-ownership and asymmetric-exclusion tell are coherent; 294/300 consistent with the application."
    },
    "techniques/overshoot-and-restore.md": {
      "disposition": "keep",
      "reason": "Asymmetric incentive, required failure, partial restore and the phantom-bound ordering are coherent; shadow-copy caveat for side-effecting reductions present."
    },
    "techniques/pairing-schedule.md": {
      "disposition": "keep",
      "reason": "Exposure, connectivity and the random-effects widened interval (undefined at one source, lower bound at two) are coherent and corroborated by the rust application."
    },
    "techniques/probe-the-decision-not-the-artifact.md": {
      "disposition": "keep",
      "reason": "Small answer space, observable record, named occurrence and prefix-only execution are coherent."
    },
    "techniques/rebase-the-varied-input.md": {
      "disposition": "keep",
      "reason": "Rebase versus erase, the 2x2 and the contaminated arm as negative control are sound and match the python application's numbers (46/46)."
    },
    "techniques/reliability-aggregation.md": {
      "disposition": "keep",
      "reason": "Recomputed: at p = 2/3, any-of-3 = 26/27 = 96.3%, all-of-3 = 8/27 = 29.6%. Measured-versus-modelled and independence caveat are correct."
    },
    "techniques/resolution-precondition.md": {
      "disposition": "keep",
      "reason": "Primary source re-read: danluu.com/ai-coding gives 'one standard deviation between runs is 0.075' and best-to-worst 1.055 vs 0.986 (= 0.069); effort 'monotonically worse' on Optimization 1 and 'monotonically improves' on Game AI. Matches the text."
    },
    "techniques/scenario-design.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the closing paragraph has its own heading, 'Expected properties, not expected outputs'."
    },
    "techniques/selection-over-noise.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the boundary now says five questions and lists the confinement answer. Still unverified: the 82-85% vs 20% figures, which the source shows only in a figure."
    },
    "techniques/treatment-election-rate.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'three per trial' became 'about 3.3 per trial'."
    },
    "techniques/unaided-baseline-screening.md": {
      "disposition": "keep",
      "reason": "Deprivation-as-claim, the instruction-is-not-a-control point and the screen expiring with the candidate are sound; boundary with negative controls is stated."
    },
    "techniques/uncontrolled-games-beside-the-win-rate.md": {
      "disposition": "keep",
      "reason": "Arithmetic of the worked case recomputed: 3 candidates x 4 cases = 12 games, 8 per candidate; failing on 3 cases excludes 6 of its games and 3 of each rival's; 2-0 over 2 of 8 matches."
    }
  }
}
```

## Architecture review - 2026-10-31 (after re-verification)

This record follows the re-verification of applications at kp@6edf5d7; only python--eval-economics changed since the previous record's bytes were committed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/eval-harness",
  "date": "2026-10-31",
  "baseline": "a1e825611",
  "digest": "sha256-b2:ad274992b951417a",
  "disposition": "reverify",
  "coverage": "All documents decided. Since the previous record, one application changed (python--eval-economics: line anchors re-numbered, verified_on 2026-10-31, a note that it was re-checked at kp@6edf5d7); its anchors were spot-checked there. The other edits since that record's baseline are the clarify items it describes as applied. Every other document carries its prior disposition; the remaining applications keep reverify, which stays the overall disposition.",
  "counterexamples": [
    "A pre-registered best-of-150 is honest and still not comparable with a single draw (selection-over-noise).",
    "A failure-owner funnel extended to seven rows still prescribes a model change for a run that never started, unless a pre-run owner exists (failure-attribution).",
    "A selection-search weighting applied to a release gate de-weights exactly the always-passed scenarios whose failure is the regression (discriminating-task-selection).",
    "A narrow random-effects interval over disjoint case sets reports agreement, not comparability (rust--pairing-schedule)."
  ],
  "sources": [
    {
      "source": "kp at 6edf5d7 (read, not executed)",
      "result": "pipeline/jobfit/eval/intake_eval.py:335 _load_previous, :384 _write_run_json, :401 os.replace, :703 --resume, :714 --workers; pipeline/jobfit/tests/test_intake_eval.py:601 test_run_json_is_written_after_each_role_not_at_the_end; .github/workflows/ci.yml:45 python-version \"3.12\". Supports the re-anchored citations of python--eval-economics."
    }
  ],
  "documents": {
    "applications/node--candidate-write-access.md": {
      "disposition": "reverify",
      "reason": "Arithmetic checks (110/2,414 bytes = 95.4% smaller). The six transcribed assertions and the private tree were not reopened."
    },
    "applications/node--failure-signatures-beside-the-pass-rate.md": {
      "disposition": "reverify",
      "reason": "Before-after on a private bench (1,026 runs); not re-run."
    },
    "applications/node--judge-stability.md": {
      "disposition": "reverify",
      "reason": "Cites private scripts and an in-house guide (rho = 0.50, own-family first); consistent with the operator's documented benchmark but not reopened. No verified_against stamp."
    },
    "applications/node--outcome-conditioned-cost.md": {
      "disposition": "reverify",
      "reason": "Arithmetic checks (0.40 vs 0.30 = 25% cheaper; 0.29 vs 0.20 = 45% dearer; 294 of 300). Neither the public report at 7d73ca1 nor the private lab tree was reopened."
    },
    "applications/node--reliability-aggregation.md": {
      "disposition": "reverify",
      "reason": "Arithmetic recomputed and consistent: p = 0.9306 from all-of-3 80.6%, expected all-fail groups 342 x 0.000334 = 0.11, observed 14 (x123), observed any-of-3 328/342 = 95.9%, all-of-3 305/342 = 89.2%, 684 = 342 x 2; earlier corpus ratio 9.1x reproduces. Trial corpus not reopened."
    },
    "applications/node--resolution-precondition.md": {
      "disposition": "reverify",
      "reason": "r = -0.378 gives r^2 = 0.143, consistent with 'roughly a seventh'. The conform-detail corpus was not reopened."
    },
    "applications/node--treatment-election-rate.md": {
      "disposition": "reverify",
      "reason": "300/300 and 989 calls (3.3 per trial) are internally consistent; the code-search report at 7d73ca1 and the lab's scoring.rs were not reopened."
    },
    "applications/process--scenario-design.md": {
      "disposition": "reverify",
      "reason": "Structural-only prior-conformance reading of a private eval manifest; not reopened."
    },
    "applications/process--selection-over-noise.md": {
      "disposition": "reverify",
      "reason": "Arithmetic recomputed: mean per-cycle agreement (2/3+3/6+2/3+2/3)/4 = 0.625 gives p = 0.75 exactly; 9 agreements and 6 disagreements of 15. The 200,000-trial simulation was not re-run."
    },
    "applications/python--eval-economics--ultraeval-audio.md": {
      "disposition": "reverify",
      "reason": "Executed-on-stubs witness at a pinned public commit; file:line anchors and the paired counts were not re-run this pass. Internally consistent (floor held, unsampled control 0 of 8)."
    },
    "applications/python--eval-economics.md": {
      "disposition": "keep",
      "reason": "re-verified 2026-10-31 against kp@6edf5d7: every construct holds and only line numbers moved; spot-checked _load_previous :335, _write_run_json :384, os.replace :401, --resume :703, --workers :714 and the seam test at test_intake_eval.py:601. The name-only resume-key departure is unchanged."
    },
    "applications/python--monitor-inside-the-loop.md": {
      "disposition": "reverify",
      "reason": "15 planted cases, 4 false positives; the shipped calibration check was not re-run."
    },
    "applications/python--outcome-conditioned-cost.md": {
      "disposition": "reverify",
      "reason": "2,158 judgments, 0 changes, 0 degraded on a private harness; not re-run."
    },
    "applications/python--probe-the-decision-not-the-artifact.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: title and intro now say two of the three failure modes, matching the section that says the third is met. verified_on unchanged; tree not re-checked."
    },
    "applications/python--rebase-the-varied-input.md": {
      "disposition": "reverify",
      "reason": "46/46 arms on a private harness; the four model-bound backends remain unverified, as the document states. Not re-run."
    },
    "applications/python--scenario-design.md": {
      "disposition": "reverify",
      "reason": "Structural-only reading of the memory harness; nothing run then or now."
    },
    "applications/react--reliability-aggregation.md": {
      "disposition": "reverify",
      "reason": "Arithmetic checks (spiky mean 73, any-of-3 0.67, all-of-3 0.33 at bar 60). Probe was deleted after reading; tree not reopened."
    },
    "applications/rust--failure-attribution.md": {
      "disposition": "reverify",
      "reason": "Shipped floor_hits change in a private tree; the paired test was not re-run."
    },
    "applications/rust--pairing-schedule.md": {
      "disposition": "reverify",
      "reason": "Structural reading of a private observability product's collective modules; not reopened."
    },
    "applications/rust--scenario-design.md": {
      "disposition": "reverify",
      "reason": "Cache-key scope and the +54.7-point exam-drift incident cite private line anchors from 2026-08-18; not reopened. No verified_against stamp."
    },
    "eval-harness.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'Two of the six' and 'all six owners' now say seven; the technique list gains measurement-revision and reliability-aggregation, and the prose mention of reliability-aggregation is linked."
    },
    "techniques/assertion-vs-judgment.md": {
      "disposition": "keep",
      "reason": "Deterministic band, layering, error as third verdict and the free-text format-assumption section are coherent."
    },
    "techniques/candidate-write-access.md": {
      "disposition": "keep",
      "reason": "Primary source re-read: Dan Luu's benchpocalypse post reports '1.4x faster on rebar', '10x slower' on the holdout, that the agent 'changed the interface to allow FRE to make some optimizations', and that corrected 'it was 1.5x slower'; and that telling it 'there's a holdout set worked better'. The visible-score-worse detail and the shared-directory story were not located in that post (may be in another 2026 post) and were not re-verified."
    },
    "techniques/certification-levels.md": {
      "disposition": "keep",
      "reason": "Theoretical gating empirical, labelled levels and expiry with the subject are coherent."
    },
    "techniques/comparison-modes.md": {
      "disposition": "keep",
      "reason": "Three modes, mirrored pairwise with ties, declared aggregation and the self-referential opponent hold. The 'thousand rating points' figure is illustrative and unsourced; acceptable as stated."
    },
    "techniques/discriminating-task-selection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the slight out-performance of exhaustive search is now attributed to the study's text-classification setting rather than the command-line benchmark."
    },
    "techniques/eval-economics.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the live-certification row is back inside the cadence table, with the matrix-row paragraph after the table."
    },
    "techniques/failure-attribution.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: Model's tell reads 'the other six are exhausted'; 'Four of the six owners' became 'Five of the seven owners'."
    },
    "techniques/failure-signatures-beside-the-pass-rate.md": {
      "disposition": "keep",
      "reason": "Case counts per family with denominators, detector-that-cannot-fire and the separate/agree pair are coherent."
    },
    "techniques/judge-stability.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the split sentence is rejoined with its count-carries-predicate citation, and the inserted pin paragraph ends on its own sentence."
    },
    "techniques/measurement-revision.md": {
      "disposition": "keep",
      "reason": "Re-run at same n is a second sample, distribution over mean, direction of revision and no silent re-baseline are coherent."
    },
    "techniques/metric-role-contract.md": {
      "disposition": "keep",
      "reason": "One optimized metric plus declared thresholds, irreversibility as discriminator, and the composite ban are internally coherent and correctly defer composite arithmetic to scoring-rubrics."
    },
    "techniques/monitor-inside-the-loop.md": {
      "disposition": "keep",
      "reason": "Primary source re-read: the Anthropic AAR post describes a monitor that 'reads the actual code' and 'Another monitor reads the mini-paper against the same code', and lists monitorability as future work (Sec. 8.2). 26%/21% shares match."
    },
    "techniques/outcome-conditioned-cost.md": {
      "disposition": "keep",
      "reason": "Conditioned and unconditioned views, incomplete-by-ownership and asymmetric-exclusion tell are coherent; 294/300 consistent with the application."
    },
    "techniques/overshoot-and-restore.md": {
      "disposition": "keep",
      "reason": "Asymmetric incentive, required failure, partial restore and the phantom-bound ordering are coherent; shadow-copy caveat for side-effecting reductions present."
    },
    "techniques/pairing-schedule.md": {
      "disposition": "keep",
      "reason": "Exposure, connectivity and the random-effects widened interval (undefined at one source, lower bound at two) are coherent and corroborated by the rust application."
    },
    "techniques/probe-the-decision-not-the-artifact.md": {
      "disposition": "keep",
      "reason": "Small answer space, observable record, named occurrence and prefix-only execution are coherent."
    },
    "techniques/rebase-the-varied-input.md": {
      "disposition": "keep",
      "reason": "Rebase versus erase, the 2x2 and the contaminated arm as negative control are sound and match the python application's numbers (46/46)."
    },
    "techniques/reliability-aggregation.md": {
      "disposition": "keep",
      "reason": "Recomputed: at p = 2/3, any-of-3 = 26/27 = 96.3%, all-of-3 = 8/27 = 29.6%. Measured-versus-modelled and independence caveat are correct."
    },
    "techniques/resolution-precondition.md": {
      "disposition": "keep",
      "reason": "Primary source re-read: danluu.com/ai-coding gives 'one standard deviation between runs is 0.075' and best-to-worst 1.055 vs 0.986 (= 0.069); effort 'monotonically worse' on Optimization 1 and 'monotonically improves' on Game AI. Matches the text."
    },
    "techniques/scenario-design.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the closing paragraph has its own heading, 'Expected properties, not expected outputs'."
    },
    "techniques/selection-over-noise.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the boundary now says five questions and lists the confinement answer. Still unverified: the 82-85% vs 20% figures, which the source shows only in a figure."
    },
    "techniques/treatment-election-rate.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'three per trial' became 'about 3.3 per trial'."
    },
    "techniques/unaided-baseline-screening.md": {
      "disposition": "keep",
      "reason": "Deprivation-as-claim, the instruction-is-not-a-control point and the screen expiring with the candidate are sound; boundary with negative controls is stated."
    },
    "techniques/uncontrolled-games-beside-the-win-rate.md": {
      "disposition": "keep",
      "reason": "Arithmetic of the worked case recomputed: 3 candidates x 4 cases = 12 games, 8 per candidate; failing on 3 cases excludes 6 of its games and 3 of each rival's; 2-0 over 2 of 8 matches."
    }
  }
}
```

## Architecture review - 2026-10-31 (after private-tree re-verification)

This record follows the re-verification of node--candidate-write-access and node--judge-stability at personas@61029d7ae0.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/eval-harness",
  "date": "2026-10-31",
  "baseline": "500de2cea",
  "digest": "sha256-b2:3f26490c1e63fa23",
  "disposition": "reverify",
  "coverage": "Since the previous record, two applications changed. node--candidate-write-access got a dated note and verified_against corrected to the tree's .nvmrc (22). node--judge-stability got its bench-table anchor re-pointed, its judges sentence corrected to match the guide, and a dated note. Both now carry verified_on 2026-10-31. Every tree citation was checked at HEAD and at the 2026-08 commit nearest the document's date. Every other document carries its prior disposition. The remaining applications keep reverify, which stays the overall disposition.",
  "counterexamples": [
    "A pre-registered best-of-150 is honest and still not comparable with a single draw (selection-over-noise).",
    "A failure-owner funnel extended to seven rows still prescribes a model change for a run that never started, unless a pre-run owner exists (failure-attribution).",
    "A selection-search weighting applied to a release gate de-weights exactly the always-passed scenarios whose failure is the regression (discriminating-task-selection).",
    "A narrow random-effects interval over disjoint case sets reports agreement, not comparability (rust--pairing-schedule)."
  ],
  "sources": [
    {
      "source": "personas at 61029d7ae0 (read, not executed)",
      "result": "evals/agents/agent-specs.eval.test.ts is unchanged since 2026-06-11: four per-spec it blocks plus a golden-contract block for athena-persona-auditor. lefthook pre-push runs test:evals. reflect-eval.mjs:173 no-live-mutation. The auditor spec is 2,414 chars / 2,424 bytes, also at 067c11c29. judge-packet.mjs clip 2200, inherited grounding line, judge.json merged at evaluate.mjs:160. athena-model-bench.mjs CELLS at :102-124 now has 18 pinned cells, and the LLM judge is still a deferred follow-up. model-effort-guide.md:85-86 rho 0.50 and own-family first; :122-130 both judges saturate, and one logs 3-5 unsubstantiated claims while awarding 4/4. .nvmrc 22."
    }
  ],
  "documents": {
    "applications/node--candidate-write-access.md": {
      "disposition": "keep",
      "reason": "Re-verified at personas@61029d7ae0. The suite is unchanged and the 0-of-6 result stands. The dated note covers the uncounted golden-contract block, which is also a spelling check, so the verdict is unchanged. verified_against corrected from node@24 (not readable in the tree) to node@22 from .nvmrc. verified_on 2026-10-31."
    },
    "applications/node--failure-signatures-beside-the-pass-rate.md": {
      "disposition": "reverify",
      "reason": "Before-after on a private bench (1,026 runs); not re-run."
    },
    "applications/node--judge-stability.md": {
      "disposition": "keep",
      "reason": "Re-verified at personas@61029d7ae0. The bench table anchor is re-pointed (nine cells grew to eighteen, all still pinned, and the judge is still deferred). The 'both judges logged unsubstantiated claims' sentence is corrected: the guide attributes that to one judge. verified_on 2026-10-31, verified_against node@22."
    },
    "applications/node--outcome-conditioned-cost.md": {
      "disposition": "reverify",
      "reason": "Arithmetic checks (0.40 vs 0.30 = 25% cheaper; 0.29 vs 0.20 = 45% dearer; 294 of 300). Neither the public report at 7d73ca1 nor the private lab tree was reopened."
    },
    "applications/node--reliability-aggregation.md": {
      "disposition": "reverify",
      "reason": "Arithmetic recomputed and consistent: p = 0.9306 from all-of-3 80.6%, expected all-fail groups 342 x 0.000334 = 0.11, observed 14 (x123), observed any-of-3 328/342 = 95.9%, all-of-3 305/342 = 89.2%, 684 = 342 x 2; earlier corpus ratio 9.1x reproduces. Trial corpus not reopened."
    },
    "applications/node--resolution-precondition.md": {
      "disposition": "reverify",
      "reason": "r = -0.378 gives r^2 = 0.143, consistent with 'roughly a seventh'. The conform-detail corpus was not reopened."
    },
    "applications/node--treatment-election-rate.md": {
      "disposition": "reverify",
      "reason": "300/300 and 989 calls (3.3 per trial) are internally consistent; the code-search report at 7d73ca1 and the lab's scoring.rs were not reopened."
    },
    "applications/process--scenario-design.md": {
      "disposition": "reverify",
      "reason": "Structural-only prior-conformance reading of a private eval manifest; not reopened."
    },
    "applications/process--selection-over-noise.md": {
      "disposition": "reverify",
      "reason": "Arithmetic recomputed: mean per-cycle agreement (2/3+3/6+2/3+2/3)/4 = 0.625 gives p = 0.75 exactly; 9 agreements and 6 disagreements of 15. The 200,000-trial simulation was not re-run."
    },
    "applications/python--eval-economics--ultraeval-audio.md": {
      "disposition": "reverify",
      "reason": "Executed-on-stubs witness at a pinned public commit; file:line anchors and the paired counts were not re-run this pass. Internally consistent (floor held, unsampled control 0 of 8)."
    },
    "applications/python--eval-economics.md": {
      "disposition": "keep",
      "reason": "re-verified 2026-10-31 against kp@6edf5d7: every construct holds and only line numbers moved; spot-checked _load_previous :335, _write_run_json :384, os.replace :401, --resume :703, --workers :714 and the seam test at test_intake_eval.py:601. The name-only resume-key departure is unchanged."
    },
    "applications/python--monitor-inside-the-loop.md": {
      "disposition": "reverify",
      "reason": "15 planted cases, 4 false positives; the shipped calibration check was not re-run."
    },
    "applications/python--outcome-conditioned-cost.md": {
      "disposition": "reverify",
      "reason": "2,158 judgments, 0 changes, 0 degraded on a private harness; not re-run."
    },
    "applications/python--probe-the-decision-not-the-artifact.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: title and intro now say two of the three failure modes, matching the section that says the third is met. verified_on unchanged; tree not re-checked."
    },
    "applications/python--rebase-the-varied-input.md": {
      "disposition": "reverify",
      "reason": "46/46 arms on a private harness; the four model-bound backends remain unverified, as the document states. Not re-run."
    },
    "applications/python--scenario-design.md": {
      "disposition": "reverify",
      "reason": "Structural-only reading of the memory harness; nothing run then or now."
    },
    "applications/react--reliability-aggregation.md": {
      "disposition": "reverify",
      "reason": "Arithmetic checks (spiky mean 73, any-of-3 0.67, all-of-3 0.33 at bar 60). Probe was deleted after reading; tree not reopened."
    },
    "applications/rust--failure-attribution.md": {
      "disposition": "reverify",
      "reason": "Shipped floor_hits change in a private tree; the paired test was not re-run."
    },
    "applications/rust--pairing-schedule.md": {
      "disposition": "reverify",
      "reason": "Structural reading of a private observability product's collective modules; not reopened."
    },
    "applications/rust--scenario-design.md": {
      "disposition": "reverify",
      "reason": "Cache-key scope and the +54.7-point exam-drift incident cite private line anchors from 2026-08-18; not reopened. No verified_against stamp."
    },
    "eval-harness.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'Two of the six' and 'all six owners' now say seven; the technique list gains measurement-revision and reliability-aggregation, and the prose mention of reliability-aggregation is linked."
    },
    "techniques/assertion-vs-judgment.md": {
      "disposition": "keep",
      "reason": "Deterministic band, layering, error as third verdict and the free-text format-assumption section are coherent."
    },
    "techniques/candidate-write-access.md": {
      "disposition": "keep",
      "reason": "Primary source re-read: Dan Luu's benchpocalypse post reports '1.4x faster on rebar', '10x slower' on the holdout, that the agent 'changed the interface to allow FRE to make some optimizations', and that corrected 'it was 1.5x slower'; and that telling it 'there's a holdout set worked better'. The visible-score-worse detail and the shared-directory story were not located in that post (may be in another 2026 post) and were not re-verified."
    },
    "techniques/certification-levels.md": {
      "disposition": "keep",
      "reason": "Theoretical gating empirical, labelled levels and expiry with the subject are coherent."
    },
    "techniques/comparison-modes.md": {
      "disposition": "keep",
      "reason": "Three modes, mirrored pairwise with ties, declared aggregation and the self-referential opponent hold. The 'thousand rating points' figure is illustrative and unsourced; acceptable as stated."
    },
    "techniques/discriminating-task-selection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the slight out-performance of exhaustive search is now attributed to the study's text-classification setting rather than the command-line benchmark."
    },
    "techniques/eval-economics.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the live-certification row is back inside the cadence table, with the matrix-row paragraph after the table."
    },
    "techniques/failure-attribution.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: Model's tell reads 'the other six are exhausted'; 'Four of the six owners' became 'Five of the seven owners'."
    },
    "techniques/failure-signatures-beside-the-pass-rate.md": {
      "disposition": "keep",
      "reason": "Case counts per family with denominators, detector-that-cannot-fire and the separate/agree pair are coherent."
    },
    "techniques/judge-stability.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the split sentence is rejoined with its count-carries-predicate citation, and the inserted pin paragraph ends on its own sentence."
    },
    "techniques/measurement-revision.md": {
      "disposition": "keep",
      "reason": "Re-run at same n is a second sample, distribution over mean, direction of revision and no silent re-baseline are coherent."
    },
    "techniques/metric-role-contract.md": {
      "disposition": "keep",
      "reason": "One optimized metric plus declared thresholds, irreversibility as discriminator, and the composite ban are internally coherent and correctly defer composite arithmetic to scoring-rubrics."
    },
    "techniques/monitor-inside-the-loop.md": {
      "disposition": "keep",
      "reason": "Primary source re-read: the Anthropic AAR post describes a monitor that 'reads the actual code' and 'Another monitor reads the mini-paper against the same code', and lists monitorability as future work (Sec. 8.2). 26%/21% shares match."
    },
    "techniques/outcome-conditioned-cost.md": {
      "disposition": "keep",
      "reason": "Conditioned and unconditioned views, incomplete-by-ownership and asymmetric-exclusion tell are coherent; 294/300 consistent with the application."
    },
    "techniques/overshoot-and-restore.md": {
      "disposition": "keep",
      "reason": "Asymmetric incentive, required failure, partial restore and the phantom-bound ordering are coherent; shadow-copy caveat for side-effecting reductions present."
    },
    "techniques/pairing-schedule.md": {
      "disposition": "keep",
      "reason": "Exposure, connectivity and the random-effects widened interval (undefined at one source, lower bound at two) are coherent and corroborated by the rust application."
    },
    "techniques/probe-the-decision-not-the-artifact.md": {
      "disposition": "keep",
      "reason": "Small answer space, observable record, named occurrence and prefix-only execution are coherent."
    },
    "techniques/rebase-the-varied-input.md": {
      "disposition": "keep",
      "reason": "Rebase versus erase, the 2x2 and the contaminated arm as negative control are sound and match the python application's numbers (46/46)."
    },
    "techniques/reliability-aggregation.md": {
      "disposition": "keep",
      "reason": "Recomputed: at p = 2/3, any-of-3 = 26/27 = 96.3%, all-of-3 = 8/27 = 29.6%. Measured-versus-modelled and independence caveat are correct."
    },
    "techniques/resolution-precondition.md": {
      "disposition": "keep",
      "reason": "Primary source re-read: danluu.com/ai-coding gives 'one standard deviation between runs is 0.075' and best-to-worst 1.055 vs 0.986 (= 0.069); effort 'monotonically worse' on Optimization 1 and 'monotonically improves' on Game AI. Matches the text."
    },
    "techniques/scenario-design.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the closing paragraph has its own heading, 'Expected properties, not expected outputs'."
    },
    "techniques/selection-over-noise.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the boundary now says five questions and lists the confinement answer. Still unverified: the 82-85% vs 20% figures, which the source shows only in a figure."
    },
    "techniques/treatment-election-rate.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'three per trial' became 'about 3.3 per trial'."
    },
    "techniques/unaided-baseline-screening.md": {
      "disposition": "keep",
      "reason": "Deprivation-as-claim, the instruction-is-not-a-control point and the screen expiring with the candidate are sound; boundary with negative controls is stated."
    },
    "techniques/uncontrolled-games-beside-the-win-rate.md": {
      "disposition": "keep",
      "reason": "Arithmetic of the worked case recomputed: 3 candidates x 4 cases = 12 games, 8 per candidate; failing on 3 cases excludes 6 of its games and 3 of each rival's; 2-0 over 2 of 8 matches."
    }
  }
}
```

---
domain: software-engineering
subject: eval-harness
last_touched: 2026-08-31
touched_by: intake
dry_streak: 0
---

# eval-harness

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

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

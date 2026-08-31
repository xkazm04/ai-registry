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

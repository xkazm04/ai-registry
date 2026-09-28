---
layer: technique
type: technique
subject: pipeline-authoring
technique: pipeline-plan-auditability
status: forged
stage: multi-service
laws: [derivation-names-recomputation, count-carries-predicate, unknown-is-not-a-value]
shared_with: []
applied: code
ab_verdict: better
use_when: [the plan is generated rather than written, explaining an old run, reviewing a change to a generator, a dry run or preview prints units whose inclusion is decided at run time, a preview's total disagrees with what the run then did]
---

# Pipeline plan auditability

Once the plan is computed, the repository no longer contains it. What is in version control is
the generator; what actually ran is a value that existed for the duration of one run. This
technique is the obligation that replaces the readable file: **the resolved plan is an output
of the run, stored beside the inputs that produced it.**

That is [derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
applied to the most consequential derived value in delivery. A generated plan with no recorded
form and no invokable regeneration path is a decision with no arbiter — and the question it
eventually has to answer ("why did the security lane not run on that change") is asked in
exactly the circumstances where nobody can afford to guess.

## What gets captured

Three things, together, because any one alone is insufficient:

- **The resolved plan**, as submitted: every unit, its identity, its dependency edges, its
  targeting. This is the answer to "what ran".
- **The inputs**, as read: the changed-file set and its base, the manifest revision, the
  parameters, the branch class, the generator's own version. This is the answer to "why".
- **The selection predicate**, in words: what closure was computed and what was therefore
  skipped. Per [count-carries-predicate](../../../../_laws.md#count-carries-predicate), "14
  lanes ran" is not a finding — "14 of 31 lanes ran, selected by closure over the manifest at
  revision R" is.

Store them where the run's other outputs go, with the retention the run's outputs have. A plan
retained for a week cannot answer a question asked in a quarter, and the questions that matter
are asked late.

## Print without submitting

The generator has a mode that produces the plan and does not submit it. This is not a
convenience, it is what makes the generator reviewable:

- **In review.** A change to a generator is unreadable as a diff — a three-line change to a
  filter can add or remove forty units. The reviewable artifact is the *difference between the
  plans* the old and new generator produce for the same input. Generate both, diff them, and
  review that.
- **Locally.** An author can see what their change will cause before causing it. A generator
  that can only be exercised by pushing has kept the worst property of the configuration file
  it replaced.
- **In the run itself.** Emitting the plan before submitting it costs nothing and puts the
  answer in the log, where the person debugging is already looking.

## What a printed plan may claim

Every reader takes a printed plan as a forecast: *these units will run*. It is one only when
every decision that selects a unit has been made by the time the plan is printed. A generator
that builds the whole plan up front and decides each unit at run time breaks that in two
ordinary ways:

- **Inclusion decided by a run-time condition.** An environment value an earlier unit sets, a
  size an earlier unit changes, a liveness or lock check the print mode skips because it only
  matters when acting. The printer has no verdict, so it prints the unit. The plan is then an
  **upper bound**: every unit that can run is on it, some that will not run are on it too, and
  nothing on the page says which.
- **An earlier unit's effect not carried forward.** A print mode performs nothing, so every
  later decision that responds to state an earlier unit would have changed is answered
  against the old state. The signature is a later stage claiming what an earlier stage already
  claimed (one item counted twice, a total inflated by the overlap) and a stage planning work
  the earlier stage has already made unnecessary.

A third arrangement breaks even the upper bound: **a unit the printer cannot simulate** (its
effect is decided by something outside the generator) and therefore leaves out. The plan now
understates the run as well as overstating it, which makes it neither a forecast nor a bound.

Printing an undecided unit as if it will run is
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) at the one place a
reviewer reads. The rule, in order:

1. **Forecast wherever the decision is computable at print time.** Carry each earlier unit's
   would-be effect forward into the state later decisions read, such as a set of would-be
   removals or a would-be-set variable. Run the same read-only checks the real run runs,
   through the same evaluator, which is
   [conditional-edges](../../../../backend-platform/work-execution/pipeline-dag/techniques/conditional-edges.md)'
   one-evaluator rule applied to evaluation order. What remains after that is genuinely
   decided at run time.
2. **Mark the remainder per unit, never the whole plan.** A unit the printer could not decide
   is printed with its condition and a different verb (*may* beside *will*). A unit the
   printer cannot simulate is named rather than skipped, and every unit downstream of it is
   marked *may* too, because those units respond to state the printer cannot know. A total
   that sums across a *may* says it is not a forecast, per
   [count-carries-predicate](../../../../_laws.md#count-carries-predicate).
3. **Do not buy honesty by marking everything.** A plan labelled *may* from top to bottom is
   honest and useless: the reviewer can no longer tell which lines are certain, and telling
   them is the only reason to print. Measured on a multi-stage cleanup preview, marking every
   run-time-decided unit removed every false claim and removed every certain line with it.
   On a fixture where nothing was contingent, the preview certified none of the evictions the
   run made. Carrying effects forward and running the checks gave an exact forecast on the
   three fixtures without an unsimulatable stage. On the fixture with one, it certified three
   of five evictions and named the rest.

Pin it with a test that runs the print mode and the real mode on identical inputs and asserts
two opposing properties together: every unit printed as certain is one the real run executes,
and every unit the real run executes appears somewhere in the preview. The first assertion
alone is satisfied by marking everything; the second alone is satisfied by the unmarked upper
bound.

## One code path generates and verifies

Where a plan or a generated artifact is also checked for freshness — the common arrangement is
a build step that regenerates and a gate that asserts the committed copy matches — both must be
**the same code path with two modes**, not two implementations of one rule.

Two implementations are two authorities for one fact, which
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary) forbids for
the same reason: they will disagree, and they will disagree at the moment somebody extends the
rule and updates only one. A generator with a `--check` mode that recomputes and compares is
one authority. A generator plus a separate validator is two.

The corollary is worth stating because it is routinely violated: the verifying mode must
recompute from the same inputs, not compare against a stored digest of its own previous output.
A digest comparison verifies that nothing changed; it does not verify that the output is
*correct*, and it passes happily when the generator has been broken since the digest was
written.

## Assert the instrument

A verification that compares two computed values must confirm that both were actually
computed. The characteristic failure is a comparison against an empty or unreadable input,
which matches nothing and reports agreement. State the counts before the verdict — how many
units were generated, how many were read back — and fail loudly when either is zero. A check
that walked nothing and exited clean has reported "blind" as "fine".

The same discipline extends to the comparison's own stability. If the digest of a plan is
computed over raw bytes, it becomes a property of the machine that wrote it — line endings,
path separators, key ordering — and the check then fails for reasons that have nothing to do
with the content, indistinguishably from a real drift. Normalize before hashing, and gate the
normalization itself.

## Decision rules

- Capture the resolved plan, its inputs, and its selection predicate as run outputs, with the
  run's retention.
- The generator has a print-without-submitting mode, used in review, locally, and in the run.
- Review a generator change by diffing the plans it produces, not the code alone.
- A printed plan is a forecast only where each earlier unit's effect is carried forward and
  the real run's read-only checks are run too. Anything short of that is an upper bound, and
  it says so per unit.
- Mark per unit: *will*, *may* with its condition, or *not simulated*. Every unit downstream of
  an unsimulated one is *may*. Never mark the whole plan.
- Test the print mode against the real mode on identical inputs, and assert both directions:
  certain implies executed, and executed implies shown.
- Generation and verification are one code path with two modes.
- The verifying mode recomputes from inputs; it never compares against a stored digest of its
  own output.
- State the counts before the verdict; zero on either side is a failure, not a pass.
- Normalize before hashing, so the verdict is a property of the content and not of the
  checkout.

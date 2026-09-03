---
layer: technique
type: technique
subject: test-harness
technique: context-starved-executor
status: forged
laws:
  - gate-sees-target
  - silent-state-is-ungoverned
  - failure-not-empty-success
shared_with: []
use_when: [a deterministic suite cannot fail when a feature becomes undiscoverable, designing an agent-driven acceptance journey, an executor's own claim of completion is being taken as the test result, acceptance runs score infrastructure faults as product defects, a journey case runs against a fixture that does not supply its preconditions]
---

# The context-starved executor

A deterministic interface test encodes the intended path. It opens a known
surface, addresses known controls by known identifiers, and asserts a known
outcome. That is its strength — it is repeatable, fast, and specific about what
broke — and it draws the boundary of what it can ever report: **it fails when a
known path breaks, and it cannot fail because the path became undiscoverable.**
Move the entry point behind a menu nobody would open, rename the action to
something the user's vocabulary does not contain, remove the only affordance
that suggested the feature exists — the encoded selector still resolves, the
assertion still passes, and the suite is green over a product no one can
operate. The path is a proxy for the product's usability, and the gate sees the
proxy ([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The complement is a second suite whose cases are written as **prose user
journeys** — a persona, a goal, the knowledge a real person in that situation
would have — and executed by an agent **deliberately denied** the repository,
the application's programmatic interfaces, the route names, the page structure,
and the success checks themselves. Starved of every shortcut, the executor has
exactly one way to complete a journey: find its way through the rendered
interface the way a person would. A failure to find is then not a harness
problem to be worked around; it is a **reportable product defect**, and it is
the defect class the deterministic suite is structurally blind to.

The starvation is the instrument, and it must be enforced rather than
requested. An executor given the checkout will read it; an executor allowed to
run scripts in the page will query the structure directly; an executor that
carries prior knowledge of the product's routes from an earlier run is not
starved at all. So the isolation is a property of how the executor is created —
a separate context outside the checkout, given the journey brief, a start
address, and a place to write — and a run whose mechanism could not actually
provide that isolation is reported as not isolated rather than described as if
it were.

## Three rules that separate an instrument from a machine that agrees with itself

An executor that exercises judgment is the whole point and also the whole
danger. All three rules below exist because the same faculty that lets it find
an unfamiliar path lets it narrate its way to a green result.

**The success oracle stays outside the executor's context and is evaluated
independently.** The journey's checks — the records that must exist, the state
that must have changed, the artifact that must be reachable — are held by the
coordinating side and never sent with the brief. After the run, they are
evaluated against the system directly, by a read-only interface where one
exists and by inspecting the store where the public surface cannot establish
the result. **The executor's claim of completion is evidence, not proof**
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)):
its report of what it tried, what it expected, and what surprised it is the
highest-value output of the run and the reason to preserve it verbatim, but it
is a statement about the executor's belief. An executor holding the checks will
optimize toward satisfying them, which converts the black box into a
transcription task and destroys the one property being measured. An executor
not holding them, asked whether it succeeded, will sometimes say yes about a
journey it half-finished — not dishonestly, but because a judgment-exercising
agent's confidence is not calibrated to its outcome.

**The outcome vocabulary separates product failure from harness failure, and
carries an inconclusive state.** Five members is a workable set: passed;
passed but the executor found concrete friction worth recording; the product
failed — the system stayed usable and the goal was not achieved; the harness
failed — bootstrap, browser control, or the environment prevented a meaningful
attempt; and inconclusive — the evidence cannot distinguish the two. Binary
pass/fail is the failure that kills these suites in their first month: every
infrastructure fault is scored as a product defect, the first flake produces a
defect report against working code, and the suite loses its credibility before
it has caught anything
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)). The
inconclusive member is the one teams omit and the one that keeps the vocabulary
honest — without it, an ambiguous run is forced into whichever of the two
failure buckets the reporter finds more plausible, which is a judgment recorded
as a measurement. Report the functional result and the usability findings
separately: a run can pass and still be the most valuable evidence in the batch.

**A case whose preconditions cannot be met declares that and refuses to run, in
machine-readable form.** Each journey names what the environment must supply —
the seeded content, the authenticated role, the locale, the feature
configuration — and carries a status field that is *not ready* until the
selected fixture provides every item. The coordinating side checks the status
before starting anything and stops, reporting what is missing; it does not
substitute a simpler fixture or relax the journey to make it runnable. This
rule is specific to a judgment-exercising executor and would be unnecessary
without one. Hand a deterministic test a partly-wrong fixture and it fails on a
missing selector. Hand this executor the same fixture and it will **improvise**
— find a different route to something goal-shaped, complete it, and report
success. The failure mode of the format is therefore a green run against the
wrong world, and only a machine-readable refusal, evaluated before the run
starts, catches it. A prose note in the case saying "needs a second author
account" is not a refusal; it is a comment the coordinator can overlook.

## The boundary with the deterministic suite

Neither suite subsumes the other, and running one is not a reason to skip the
other.

- The deterministic suite catches **regressions on known paths**: a broken
  handler, a validation that started rejecting valid input, a state transition
  that stopped firing. It is cheap enough to run per change, and its failures
  name a line of code.
- The starved suite catches **discoverability and comprehensibility failures**:
  a feature reachable only by someone who already knows where it is, a control
  whose label does not mean what it does, a flow that is technically complete
  and practically unusable, an error message that leaves a person with no next
  action. Its failures name a moment in a journey, not a line, and diagnosis is
  a separate step performed by the coordinating side with full context.

That difference sets the schedule. The starved suite is slow, serial, needs a
disposable instance of the real product per run, and is non-deterministic by
construction — the executor may find a different valid path each time, which is
information rather than flake. It belongs on the scheduled and on-demand
cadence with the other lanes that drive the real shipped product, never on a
per-change gate. And it inherits the lane-health rule in full: a starved lane
that has never once passed is scaffolding, and until it has been observed green
on a good build and red on a deliberately broken one, its results certify
nothing.

## The honest state of the shape

This apparatus, in the tree it was reconciled against, is a **specification
with one working instance**: six journeys exist, five of them declare unmet
preconditions and correctly refuse to run, and one is executable. That is worth
recording rather than smoothing over, for two reasons. First, it is what this
shape looks like before it is finished — the fixture profiles are the expensive
half, and a team adopting the pattern should expect the journeys to arrive well
ahead of the environments that can host them. Second, the ratio is *visible*
precisely because the refusal is declared. A suite of six prose cases with no
precondition contract would have run all six against whatever fixture was
available, improvised through the five that did not fit, and reported six
passes. The negative here is legible only because the third rule was
implemented first, which is the ordering to copy.

## Decision rules

- Add this lane only where a deterministic suite already covers the known paths.
  It is a complement to that coverage, never a substitute for it, and a team
  without it is buying discoverability testing before regression testing.
- Create the executor outside the checkout and give it the brief, the start
  address, and a writable location — nothing else. If the available mechanism
  cannot provide that isolation, say so and stop; do not describe a merely
  fresh context as isolated.
- Keep the checks with the coordinator, run them independently against the
  system, and record the executor's claim as evidence alongside them.
- Use a five-member outcome set with product failure, harness failure, and
  inconclusive as distinct members; never a binary.
- Give every case a machine-readable precondition list and a status that gates
  the run. Refuse rather than substitute a simpler fixture.
- Preserve the executor's action log and observations verbatim; the friction it
  reports on a passing run is the output with the longest shelf life.
- Tear the disposable instance down after evidence is collected, including on
  failure, and keep it alive only on explicit request.

## When not to use it

A product with no human-facing interface has nothing for this instrument to
measure. A surface still changing daily will produce journeys that need
rewriting faster than they can be run, and the right time to write them is when
the flows have stabilized enough that a person's route through them is expected
to stay valid. And where the fixture profiles do not exist, writing the journeys
first is legitimate — but only with the precondition contract in place from the
start, so the unrunnable ones announce themselves instead of quietly passing.

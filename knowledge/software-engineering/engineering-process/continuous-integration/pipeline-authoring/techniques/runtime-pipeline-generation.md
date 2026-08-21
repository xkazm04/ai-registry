---
layer: technique
type: technique
subject: pipeline-authoring
technique: runtime-pipeline-generation
status: forged
stage: multi-service
laws: [failure-not-empty-success, identity-survives-reuse]
shared_with: []
use_when: [a pipeline file has grown conditionals, a repository holds more than one deliverable, the work set depends on a manifest]
---

# Runtime pipeline generation

The plan for a run is produced by a program that executes inside that run, rather than read
from a file written in advance. One step — the bootstrap — runs a generator, the generator
prints the rest of the plan, and the delivery system schedules what it printed. The
repository holds the generator; the run holds the plan.

## Why the shift happens

A hand-written plan works until the plan's shape becomes a function of something. Then the
configuration language has to grow the thing configuration languages are worst at:
conditionals, loops, string assembly, and shared fragments. The usual end state is a file
where the logic is real but unreviewable — nested conditional expressions inside templated
strings, no unit tests, no local execution, and a change verified only by pushing it.

A generator is ordinary code. It has functions, a test suite, a type system if the language
has one, and a local invocation. The plan becomes a value that a test can assert on. That
is the entire argument, and it is enough.

## The procedure

1. **One bootstrap step.** Its only job is to run the generator and submit the output. Keep
   it trivial: a bootstrap that also builds something is a bootstrap that fails for two
   unrelated reasons.
2. **The generator reads its inputs explicitly.** The change under test, the branch class,
   the repository manifest, any parameters the run was started with. Inputs it did not
   declare are inputs nobody can reproduce.
3. **It prints a plan and exits.** No side effects. A generator that also creates
   resources cannot be run locally by someone deciding whether to trust it.
4. **The bootstrap submits the plan** to the delivery system, which schedules it into the
   same run.
5. **The resolved plan is captured** as an output of the run — see
   pipeline-plan-auditability, which is the other half of this technique and not optional.

## The failure contract

This is the part that bites, and it bites quietly.

- **A generator that fails must fail the run.** The default arrangement in most shell
  environments is the opposite: a generator that exits non-zero inside a pipeline of
  commands contributes empty output, the submission succeeds with nothing in it, and the
  run goes green having done no work at all. Enable strict failure propagation explicitly
  — non-zero exits abort, unset variables abort, and a failure anywhere in a chained
  command fails the chain. Per
  [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success), "the
  generator produced no work" and "the generator crashed" are different results and must
  exit differently.
- **Assert the plan before submitting it.** A plan with zero steps is almost never correct.
  Make the generator refuse to emit an empty plan unless emptiness was explicitly computed
  and explicitly justified, and say which case it is on the way out.
- **Validate the plan's shape.** The generator is the one place with the whole plan in
  hand; a schema check there is cheap and catches a class of error that otherwise surfaces
  as an opaque rejection from the delivery system with no line number.

## Identity, because generation can be retried

A bootstrap step can be retried — by a person, by an automatic retry policy, by a transient
infrastructure fault. Without stable identity on the generated units, the second generation
produces a second copy of every unit and the run does everything twice. With it, the
delivery system can recognize the duplicate and reject it, which turns a silent doubling
into a visible error. Per
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse), identity is minted
from what the unit *is*, never from its position in the emitted list — see
step-identity-stability for the naming rules.

## Submit large plans in pieces

Submission is a request, and a request has a size past which it becomes unreliable rather
than merely slow. A plan of many hundreds of units submits more reliably as several
moderate submissions than as one enormous one, and the failure mode of the single large
submission — a timeout partway through, with the delivery system's view of what it accepted
unclear — is materially worse than the failure mode of the third submission of four.
Partition on a boundary that means something (per deliverable, per lane class) so a
partial submission is a comprehensible state rather than an arbitrary prefix.

## Interpolation happens somewhere, and you must know where

A generated plan usually contains variable references, and there are two moments they can
resolve: when the plan is generated, and when the unit runs. These give different answers
and the difference is a real defect class — a value that was correct at generation time and
stale at execution time, or a secret that resolved into the plan text and is now stored in
the run's record. Decide per reference, escape or defer explicitly, and treat any
resolution of a credential at generation time as a defect regardless of where the plan is
stored.

## When NOT to generate

- **One deliverable, a short fixed plan, no branching.** Write the file. A generator here
  adds a step, a language, and an indirection to a problem that did not exist.
- **The plan varies only by a value, not by shape.** Parameters and matrices already handle
  that, and they handle it where a reader can see it.
- **Nobody can run the generator locally.** A generator that only executes inside the
  delivery system has traded a readable file for an unreadable one, and has kept the worst
  property of the thing it replaced.

## Decision rules

- Generate when the plan's *shape* is a function of an input; otherwise write the file.
- The bootstrap does one thing: generate and submit.
- Strict failure propagation on, always; an empty plan is an error unless explicitly
  justified.
- Every generated unit carries deliberate, stable identity before it is submitted.
- Large plans submit in meaningful partitions, never as one maximal request.
- Decide interpolation timing per reference; credentials never resolve at generation time.
- If the generator cannot be run and read locally, the shift has not actually been made.

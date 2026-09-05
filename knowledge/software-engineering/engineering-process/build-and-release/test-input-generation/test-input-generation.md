---
layer: golden-path
type: golden-path
subject: test-input-generation
status: forged
use_when: [deciding where a test's inputs come from, a long-running randomized test that has stopped finding defects, choosing between enumerating a space and sampling it, a defect that escaped the suite and was found by something else]
techniques:
  - generator-bounds-the-space
  - swarm-feature-sampling
  - negative-space-generation
  - exhaustive-when-bounded
  - model-based-oracle
  - inside-out-invariants
  - liveness-needs-a-quiet-period
  - seed-is-not-a-reproduction
  - stage-ordered-fuzz-targets
  - field-captured-operation-traces
---

# Test input generation

Every test has an input, and every input came from somewhere. In a
hand-written suite that somewhere is a person's imagination, bounded by the
cases they thought of on the afternoon they wrote it; in a randomized suite it
is a small program, usually written once, rarely reviewed, and almost never
treated as the load-bearing component it is. This subject owns that program
and the decisions inside it.

The subject boundary is sharp and it is the neighbour's own line. The
[test-harness](../test-harness/test-harness.md) standard opens by declaring
that the tests themselves assert facts while the harness decides which facts
get checked, when, and at what cost — everything it owns begins *after* a case
exists. This subject owns the half that boundary excludes: **where a case comes
from, how much of the system's behaviour the supply of cases can actually
reach, and what decides whether the answer was right.** Which doors a suite
then guards belongs to
[quality-gates](../../standards-and-gates/quality-gates/quality-gates.md).

One distinction has to be made immediately, because the two are confused
constantly and have opposite remedies. A **flake** is unwanted variance in the
machinery — the same input producing different verdicts — and the harness
subject owns its lifecycle. A **seed** is wanted variance in the input — a
different input each run, deliberately, with the identity of that input
recorded so the run can be repeated exactly. Randomness in the harness is a
defect. Randomness in the generator is the point. A team that has not drawn
this line ends up suppressing the second while tolerating the first.

## The generator, not the system, decides what gets tested

The foundational error is to reason about coverage as a property of the system
under test. It is not. It is a property of the **generator**, and the two come
apart in a way that is invisible from inside the test:

> The set of behaviours a randomized test can ever exercise is exactly the set
> reachable from the inputs its generator can produce. Everything else is
> untested, and reports as passing.

Nothing about a green result distinguishes "this code path was exercised
thousands of times and held" from "this code path was never once reached." Both
are spelled the same way, which is the general shape of
[failure-not-empty-success](../../../_laws.md#failure-not-empty-success)
applied to inputs rather than to instruments — and the reason a generator must
be read as carefully as an assertion. The gate reads what the generator handed
it, never the system as a whole
([gate-sees-target](../../../_laws.md#gate-sees-target)).

The trap is that this failure gets *worse* as the generator gets better.
Naive generators are obviously crude and nobody trusts them too far. A
sophisticated generator — one that constructs well-formed inputs, respects the
schema, builds realistic scenarios — earns confidence, and every constraint it
applies to produce that realism silently deletes a dimension of the space. The
paid-for instance is worth stating concretely: a generator that emitted
structured queries sharing a common field prefix meant the objects matching any
query were always contiguous, which meant two indexes were always in sync,
which meant the code path that reconciles them when they are *not* in sync was
never executed — for months, under a fuzzer that ran continuously and reported
green. The defect was eventually found by an external checker, and the fix to
the generator was to make it **dumber**: emit random objects and random
queries, and check them against a model.

So the discipline the whole subject rests on is a question asked of the
generator rather than of the code: *what can this thing not produce?* The
procedure for answering it, and the signal that should trigger it — a
randomized test that has run long and found nothing is evidence about the
generator at least as much as about the code — are
[generator-bounds-the-space](./techniques/generator-bounds-the-space.md).

## Both naive and clever generators collapse the space, in opposite directions

The previous section is one half of a symmetry, and a subject that stopped
there would teach practitioners to distrust structure and reach for uniform
randomness, which fails just as completely for the opposite reason.

**Uniform choice is itself a constraint.** Give a queue test equal probability
of push and pop and the queue is, on average, empty: the large-queue behaviour
is untested by construction, not by accident, and no amount of additional
runtime fixes it because every run has the same expected shape. The remedy is
to stop sampling only the values and start **sampling the probabilities** —
choose a random subset of features to exercise per run, then generate within
that subset, so that some runs are push-heavy and reach depths a balanced run
never sees. This is a published technique with measured results, and it carries
a real boundary that practitioner accounts of it tend to omit: omitting
features wins when defects are *masked* by feature interaction and loses when a
defect requires several features active simultaneously. Both halves are in
[swarm-feature-sampling](./techniques/swarm-feature-sampling.md).

**And uniform randomness cannot find structured valid inputs at all.** Where an
input is validated — a checksum, an encoding, a schema, a signature — the valid
space is a vanishing fraction of the representable space, and "vanishing" is
not a figure of speech. One measured instance: uniformly random 64-bit values
tested against a structured encoding produced **zero** valid inputs in 10⁸
attempts, in about seven seconds of work that told the suite nothing. A
generator that samples uniformly over such a space is testing the validator's
reject path exclusively while appearing to test the system.

The correct shape is that both halves are **constructed**: valid inputs built
by construction so they are reachable at all, and invalid inputs biased to sit
*just outside* the boundary, since an input that is wrong in every respect
exercises the first check and stops. Testing only the valid space is the more
common failure and the more comfortable one — it is what a suite written from
the specification looks like — but a generator that never emits an invalid
input has left the entire rejection surface unexamined.
[negative-space-generation](./techniques/negative-space-generation.md) carries
both rules and the reason the two must be designed together.

## Sometimes the honest answer is not to sample at all

Randomness is a concession to a space too large to cover, and it is applied
reflexively to spaces that are not. When the input space is computably small —
a state machine's transitions, an enum's cross product, sequences of bounded
operations up to a bounded length — enumerating it is strictly better than
sampling it on every axis that matters. It finds everything findable rather
than most of it; it terminates, so the suite can state that the space is
*covered* rather than that nothing turned up; and it removes the seed, the
flake surface and the reproduction problem in one move.

The rule is that the choice is made against a **computed bound**, stated before
the generator is written, rather than against an intuition about size. Spaces
that feel enormous are frequently small once the bound is written down, and the
factorial that looks alarming at n=10 is trivial at the n=6 the system actually
supports. [exhaustive-when-bounded](./techniques/exhaustive-when-bounded.md)
carries the bound calculation and the escape hatch for when it comes back too
large.

## A generator is worth exactly as much as what checks it

The last stage is the one that decides whether any of the above pays. Inputs
without an oracle produce only crash-finding: the test knows something is wrong
when the process dies or an assertion fires, and knows nothing at all about a
result that is well-formed and wrong. That is the failure class most likely to
reach production, because it survives every check made of shape rather than of
meaning.

There is a ladder here, and its rungs cost what they are worth. Crash-and-
assert is nearly free and catches only the obvious. Invariant checks —
properties that must hold of any correct output — are cheap, transplant across
inputs, and answer "did anything break" without ever answering "is this
right." A **reference model**, a second and deliberately simpler implementation
of the same behaviour whose answers the real system's are compared against, is
the only rung that catches the well-formed wrong answer, and it is the one that
found the defect in the opening section after twenty generators had missed it.
When that cost is justified, and how to keep the model from inheriting the
system's bugs, is [model-based-oracle](./techniques/model-based-oracle.md).

The oracle question has a shape of its own when the system is a pipeline of
stages. One end-to-end target finds the least, because a crash in an early
stage masks every defect in the stages behind it on that input - masking by
stage, the cousin of the feature masking above. The remedy is one target per
stage, each with the strongest oracle that stage admits, triaged in pipeline
order, with a deterministic budget on the deepest stage so that
non-termination is a finding and not a hang -
[stage-ordered-fuzz-targets](./techniques/stage-ordered-fuzz-targets.md).

Finally, an oracle placed outside the system can only assert what the system
exposes. Invariants that hold *between* internal components — a relationship
between two subsystems' states that no caller can observe — are untestable from
the outside by construction, and they are frequently the invariants whose
violation causes the visible defect three steps later. Stating them explicitly
and asserting them during the run, rather than inferring their health from
external behaviour, is
[inside-out-invariants](./techniques/inside-out-invariants.md). That technique
also carries the design move that repeatedly falls out of doing this well:
where an invariant genuinely cannot be preserved under some fault, it is worth
engineering the failure to land in a **less severe class** — a system that
becomes unavailable is recoverable in a way that a system that becomes
silently wrong is not.

## Two things the generator owes after the run

The sections above are about what a generator produces. Two obligations attach
to the run itself, and both are routinely skipped because neither is visible
while the suite is green.

**A run that never stops perturbing cannot observe a system that never
finishes.** Injecting faults continuously is the right regime for checking that
nothing bad happens, and it is precisely the wrong one for checking that
something good eventually does — a stuck component is rescued by the next
random draw before anything notices, so the defect is erased rather than
reported. The remedy is a phase change inside the run: freeze the fault set,
heal it among the subset that is supposed to be able to finish, make the rest
permanent, and require measurable progress against a bound. The failure class
this reaches is distinctive — two individually reasonable policies that
phase-lock and never converge, neither of which is wrong on its own. See
[liveness-needs-a-quiet-period](./techniques/liveness-needs-a-quiet-period.md).

**And when a generated input finally fails, the thing to keep is the input, not
the number that produced it.** A seed reproduces a run only relative to the
generator that consumed it, and the edit most likely to re-point a recorded
seed is the fix for the defect it recorded — widening a generator so it can
produce the case that broke you. The replayed entry then passes while
exercising an input nobody chose, which is worse than losing it, because an
absent test is visible and a lying one is not.
[seed-is-not-a-reproduction](./techniques/seed-is-not-a-reproduction.md) carries
the rule and the three input lanes it implies.

Those three lanes — fresh randomness, the persisted corpus, hand-written cases
— share one property that is easy to miss because it is true of all of them:
every one is **authored**. The generator's distribution is its author's model of
what happens, the corpus is the subset of that model which once failed, and the
hand-written lane is the imagination the generator was meant to replace. So a
suite can be green across all three and still miss the region its users
actually occupy, and nothing in the three lanes can report that.

There is a fourth source, and its distribution is the only one nobody chose:
the running product, instrumented so a real session emits its operation
sequence **in the generator's own vocabulary**. One reflection table names the
model's mutating operations; the generator composes from it and the logger
records against it, so a user's crash and a fuzzer find minimize into the same
artifact and enter the same regression lane. The constraint that makes this
work is the shared vocabulary rather than the logging — a log written in the
interface's terms cannot be replayed against the model at all (the
[field-captured-operation-traces](./techniques/field-captured-operation-traces.md)
technique).

## What this subject does not own

- **Running, placing, scheduling and trusting suites** — the harness subject,
  which begins once a case exists.
- **Proving that a test can fail at all.** That is validating the instrument,
  and the harness subject's negative-control technique owns it. It is the
  natural complement to everything here: this subject asks whether the inputs
  can reach the behaviour, that one asks whether the assertion would fire if
  they did. Both questions have to be answered, and answering one is routinely
  mistaken for answering both.
- **Judging non-deterministic model output**, which is an evaluation problem
  with different economics and its own subject.
- **Deciding which suites block a release** — that is the gates subject.

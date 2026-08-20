---
layer: golden-path
type: golden-path
subject: unattended-build-loop
status: forged
use_when: [running an automated builder with nobody watching, deciding what an unattended run may report as done, giving an autonomous loop a spend ceiling, recovering a run that went red]
techniques:
  - no-gate-self-certifies
  - verified-vs-self-reported-pass-rate
  - completed-with-gaps-excluded-from-the-numerator
  - budget-reservation-and-drain-not-kill
  - rollback-to-last-green
  - unreachable-success-preflight
---

# The unattended build loop

An automated builder that produces features while nobody is watching does not
fail the way people expect. It rarely produces catastrophically bad output —
bad output tends to be caught by whatever compiles it. What it produces instead
is a **confident report about work nobody checked**. The loop finished, the
summary is green, the rate reads 92%, and the number is composed almost entirely
of the builder's own opinion of its own output. Everything in this subject exists
to keep the loop's self-assessment tethered to evidence the loop did not
generate.

The subject is the set of invariants an unattended builder must hold: what it
may conclude, what it may spend, what it may skip, and how it recovers. It is
domain-neutral by construction. A loop generating game features, a loop
migrating infrastructure, a loop reprocessing documents — all of them face the
same four questions, and the answers below transplant unchanged.

The general operator practice around a running fleet — metering spend, attributing
cost, sampling traces, scoring live traffic — is a separate concern with its own
home. What follows is only the loop's own epistemics and recovery.

## The four questions

**What may it conclude?** Only what a party other than the producer verified.
Everything else is recorded as an assertion and labelled as one. This is the
whole of [no gate self-certifies](../_laws.md#no-gate-self-certifies), and it
splits into two techniques here: the rule about who runs the check
(no-gate-self-certifies) and the rule about how the resulting numbers are
reported (verified-vs-self-reported-pass-rate).

**What may it spend?** Only what it has reserved before launching, counting work
already in flight. A ceiling that reads settled spend alone green-lights every
concurrent launch before a single unit is booked.

**What may it skip?** Anything whose skip is cheap to be wrong about, and nothing
whose skip converts unchecked work into checked-looking work.

**How does it recover?** By rewinding to a state that was independently green,
never by patching forward from a state nobody can characterise.

## An unattended loop is a claim-generation machine

Every iteration of an autonomous builder emits claims: this feature works, this
area is complete, this run reached the target. Under supervision those claims are
cheap because a human discounts them continuously. Unsupervised, they compound.
The measured size of the gap is not small: across published evaluations of coding
agents, self-judged completion runs tens of percentage points above
externally-verified completion — gaps of 20 to 30 points where the external
grader is an automated test suite, and far wider where the agent grades its own
output against its own reading of the task. The mechanism is consistent and worth
naming, because it is what the invariants below are defending against: the
builder substitutes **shape for semantics**. It confirms the artifact exists, is
well-formed, and mentions the right things, and treats that as evidence of
correctness. This is precisely [structural proof is never
sufficient](../_laws.md#structural-proof-is-never-sufficient) observed in the
wild, at scale, with nobody in the room to catch it.

Two consequences follow immediately.

First, **a producer's claim is an input to a verdict, never the verdict**. The
loop records what the builder said, and separately records what an external
observer found. The rule is not "distrust the builder" — the builder's report is
genuinely useful signal about where to look. The rule is that the two never share
a field.

Second, **absence of a check must not render as a passing check**. A step with no
configured verifier ran nothing; it therefore knows nothing. The honest value is
*unverifiable*, a third state distinct from both pass and fail. Collapsing it
into pass is the most common way an unattended loop lies, and it is usually
introduced as a convenience — a "no command specified, so: skipped, success"
branch. It is [unmeasured is not a
pass](../_laws.md#unmeasured-is-not-a-pass) violated in one line of code.

## The distinction between a verdict and what the loop does with it

A sibling discipline owns the evidence ladder itself: what counts as structural,
behavioural or perceptual proof, and which rung a given observation sits on. This
subject starts one step later, at the moment a verdict — of any rung — arrives
at the loop. The loop's job is not to decide whether the evidence was good. Its
job is to route it correctly:

- A **pass** from an external check promotes the feature and contributes to the
  verified numerator.
- A **fail** from an external check is a real defect: attempt repair, and if
  repair does not re-run the check clean, do not advance.
- An **unverifiable** result is neither. It must not be repaired (there is no
  defect to fix — a missing environment is not a code error), it must not
  promote, and it must not be silently dropped from the denominator. It is
  reported as a gap.

That third branch is where most implementations are wrong. Treating unverifiable
as fail wastes the budget attempting repairs on an environment problem; treating
it as pass is the lie.

## Reconciliation is where the loop convinces itself it finished

The builder reports results by name; the plan holds features by name. Matching
one to the other looks like a string problem and is actually the loop's integrity
boundary. **Fuzzy matching here is catastrophic**, and specifically catastrophic
in an unattended context. A substring match maps a report about one feature onto
a different, longer-named feature and marks it done. Worse, the usual fallback —
"if nothing matched, assume everything passed" — converts a builder that reported
nothing intelligible into a builder that finished the entire plan.

The rule: match on an exactly-normalised key only. Fold case, punctuation and
whitespace; do not fold meaning. An unmatched report is logged and leaves the
planned item **untouched** — still unverified — rather than passing it. The
corollary that people resist: an item the builder never mentioned stays
unverified forever. It does not decay to pass because the run ended, and it does
not decay to fail either. Silence is silence.

## A third status is not a rounding error

Real loops need a state between success and failure: an item that was worked,
partially verified, and promoted anyway so that dependent work can proceed.
Call it what you like; the invariant is that **it must not be counted as either
neighbour**. Promoting it silently into the success numerator is how a loop hits
its target on work that was never verified — the exact outcome the whole
apparatus exists to prevent. Excluding it silently from the denominator is the
same lie by subtraction: the rate rises because the hard items left the
population.

The rule is stated in
completed-with-gaps-excluded-from-the-numerator, and its general form is
[a number carries its unit and its
basis](../_laws.md#a-number-carries-its-unit-and-basis): the reported rate names
its numerator *and* its denominator, and the partially-done population is
visible as its own count beside them.

## Spend is a shaping instruction, not a fence

A budget handed to an autonomous loop is not only a cap; it is a statement about
how much work the loop is meant to do, and the loop will spend what it is given
— [a budget shapes the output](../_laws.md#a-budget-shapes-the-output). Three
rules follow.

**A run with no explicit budget is not an unlimited run.** The default is a
finite ceiling; unlimited is an option a caller must ask for by name. An
autonomous loop with an accidentally-absent cap is the most expensive bug in
this domain.

**Reserve before launching, reconcile on return.** The admission check compares
the cap against settled spend *plus* everything currently reserved by in-flight
work *plus* the next launch's estimate. Without the middle term, a pool of width
N overshoots by up to N−1 launches, invisibly.

**Every spawn is inside the ceiling, including the ones you did not plan for.**
Repair attempts, retries and follow-up passes are real spend. A ceiling that
governs only the primary launch path is not a ceiling; each failure widens the
gap, which means the ceiling leaks most in exactly the runs that go badly.

And when the cap trips: **drain, do not kill**. Cancelling in-flight work does
not refund it — for any resource whose cost is only known when the work
completes, cancelling burns the cost and destroys the measurement of it. Await
what is already claimed, refuse to claim more, and **report the overshoot width**
rather than implying the ceiling held. This is
[refuse rather than destroy](../_laws.md#refuse-rather-than-destroy) applied to
teardown: a counted overshoot beats an invisible one.

## Recovery is rewind, not repair

When an item exhausts its retries, the working state is a state nobody can
characterise: partially applied changes from several failed attempts, on top of
work that was good. Continuing from there contaminates everything downstream.

The discipline is to commit and label a snapshot at every **independently
verified** green state, and on exhaustion to reset hard back to the most recent
one before promoting the failed item as gapped. Two constraints make this work
and are routinely missed. A hard rewind cannot coexist with concurrent writers —
if several workers interleave changes into one tree, there is no coherent point
to rewind to, so checkpointing forces a concurrency of one. And the ledger of
green states must survive a restart, or a resumed run rewinds to a baseline taken
at resume time, which is not green and may be the corrupted tree itself.

## Check that success is possible before spending anything

The last invariant is the cheapest and the most frequently absent. A loop whose
stop condition counts only externally-verified passes, configured with a required
check that can never verify, has a stop condition pinned at zero. It will run
every iteration it is allowed, burn the entire budget, and terminate at the cap
with no explanation — the failure looks like a capacity problem and is actually a
configuration problem.

So at launch, before spawning anything, assert that the success condition *can*
be met: the required checks exist, the environment can run them, and the target
is reachable under the chosen counting basis. When the answer is no, say so
loudly, name the specific blocking checks, name the consequence in the units the
operator cares about, and offer the concrete remedies. Warn rather than block —
a run's side effects can legitimately be wanted without a reachable stop
condition — but never let it be discovered from the invoice.

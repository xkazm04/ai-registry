---
layer: technique
type: technique
subject: prompt-safety
technique: inspection-coverage-is-a-verdict
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value, count-carries-predicate, absent-guard-is-loud]
shared_with: []
applied: code
ab_verdict: better
use_when: [an inspector reads a bounded prefix of a payload that travels whole, deciding what an oversize or unparseable request does at the boundary, a detector's exception resolves to an empty finding list, a scan reports a gap it could not observe, choosing what happens to the part of the input a guard never read]
---

# Inspection coverage is a verdict

Two bounds sit at every content boundary and they are routinely read as one. The
first bounds what the system **forwards** — per-class ceilings, visible clamps,
one door
([input-caps-and-clamps](./input-caps-and-clamps.md)). The second bounds what the
inspector **reads**: a first-N-bytes window, a fixed per-surface limit, a quota of
files, a walker's depth and breadth caps, a time budget. The two are independent,
and wherever the second is tighter than the first there is a **residue** — the part
of the payload that travelled but was never judged.

The residue's default disposition, in shipped systems, is to continue with what was
inspected. That spells "not read" as "clean". The verdict then covers a prefix and
is published as if it covered the request.

## The residue is reachable on demand, which voids the usual trade

The general fail-direction question is a cost question: what does the wrong
direction cost, and can it be undone
([advisory-guard-fail-mode](../../../orchestration/session-continuation/techniques/advisory-guard-fail-mode.md)
answers it by risk class, and the answer for an advisory guard is to pass). That
reasoning holds when the undecided state is one the system *suffered* — a parser
that crashed, a lookup that timed out, an instrument that broke.

A coverage bound is not that. **The party the guard constrains chooses whether the
guard can decide.** Padding a request past the inspection window costs the sender
nothing, is indistinguishable from legitimate bulk, and needs no knowledge of the
rule being evaded — the payload simply arrives after the part that gets read. The
same shape appears wherever the input selects the blind spot: content engineered to
crash the detector, a nesting depth past the walker's cap, a payload placed in the
one surface whose window is smaller than the rest.

So the discriminating question is not only *what does the wrong direction cost* but
**who decides how often the wrong direction happens**. An undecided state the
adversary can reach on demand has no fail-open budget to spend: the interval stops
being an accident rate and becomes a route, with a frequency the sender sets.
Raising the window is not a fix — a bound moved from 16 KB to 64 KB is still a
bound, and the residue is still selectable.

## What the class decides, and what it does not

Whether the guard's verdict can gate the action decides what happens *to the
residue*. It never decides whether the residue is counted. Both cases owe the same
output and differ only in the consequence:

**A guard whose verdict gates** — an admission check, a perimeter filter, a policy
hook a caller can branch on — resolves the residue to the strictest state the
system can still serve, and takes the rungs in order: refuse; or **confine** (admit
it with capability subtracted, which is often the rung that keeps a product usable
where a refusal would not); or escalate to a human queue, which is a refusal that
does not lose the work. Never allow. Two corollaries carry most of the field's
mistakes:

- **A ladder falls to the next rung, never to the floor.** When the confinement
  itself is unavailable — no isolation primitive on this target, the sandbox never
  provisioned — the answer is the next stricter rung (ask, refuse), never the
  laxest. A control whose absence downgrades to unconfined execution has made its
  most important decision silently
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)); and where a
  document promises the prompt while the code returns the pass, the document is
  the only place the control still exists.
- **The document's promise is not the code's default.** The oversize disposition,
  the unavailable-sandbox fallback and the detector-exception path are each a
  configuration default somebody picked once, and the safe-looking sentence in the
  guide is not evidence about the shipped value. Read the default, not the prose.

**A guard whose verdict cannot gate** — an observer surface whose returns the
dispatcher discards, a reporting pass whose signature has no verdict to return, a
scanner that annotates — passes the residue and **records it as not-inspected**.
Fail open is correct here and fail silent never is: the two facts "inspected and
found nothing" and "never inspected" are spelled differently in every channel the
guard writes
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)), and
an exception handler that returns an empty finding list has published the strongest
possible claim from the weakest possible evidence. The arithmetic that keeps such a
report honest — three states per unit, skip reasons as classes, and the population
a bounded walk never enumerated — is the reporting lane's and is not restated here
([checked-vs-skipped-denominators](../../../../engineering-process/codebase-stewardship/docs-sync/techniques/checked-vs-skipped-denominators.md)).

## The marker rides the claim, not the run

One rule is worth stating on both sides, because it is where an otherwise honest
system leaks. A **run-level** coverage or confidence number is worth having and is
not a substitute for a **per-claim** marker. Consumers join on the individual claim
— a finding, a blocker, a severity, a rollup bucket — and a claim that reads as
definite is counted as definite however low the run's confidence was. A surface
that lowers a confidence score while each verdict stays assertive reports the
inspector's coverage hole as the subject's defect, and the report is worse than
silence because the defect now has an id somebody has to argue with.

So: the third value lives in the claim's own type — *found*, *clean*,
*not-inspected*
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value); the health
lane's
[three-state-outcomes](../../../../operations/service-operations/health-checks/techniques/three-state-outcomes.md)
is the same shape on another surface) — and the residue is counted with its
predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): "240 of
260 inspected, 20 past the window, 3 unreadable" tunes a bound; "240 inspected"
tunes nothing.

Two disciplines keep the rule from rotting:

- **Pin the boundary in a test.** The case to write is the payload whose violation
  sits *past* the window with a clean prefix, and beside it the **observed
  absence** that must keep its definite verdict. Without the second test a coverage
  rule degenerates into a system that never claims anything, which is the failure
  mode of every honest instrument that was made honest without being made useful.
- **A residue that fires routinely is a design signal, not a tuning problem.**
  Recurring shortfall at one bound means the population is wrong for the
  instrument: project the field, split the surface, raise the quota as a decision —
  rather than widening the window until the number goes quiet.

## Decision rules

- Treat the inspection bound and the forwarding bound as two facts; compute the
  residue where they differ and carry it as an output of the check.
- Ask who selects the undecided state. Where the constrained party can reach it on
  demand, the cost argument for passing does not apply and the residue resolves to
  the strict side.
- Where the verdict gates: resolve the residue to refusal, confinement or a human
  queue; when a rung is unavailable, fall to the next stricter rung, never to the
  laxest.
- Where the verdict cannot gate: pass the residue and record it, never fold it into
  the clean count; the denominators belong in the same object as the findings.
- Spell not-inspected as a third value in the type, mark it on each claim rather
  than only on the run, and never repair an exception into an empty result.

## When there is no residue to report

An inspection that is complete by construction has nothing to carry: a closed
grammar over a slot already clamped at the same door inspects exactly what it
forwards, and the clamp *is* the inspection. That is the one honest way out of this
technique, and it is available more often than it is taken — bounding the input to
what can be inspected whole, rather than inspecting a bounded part of an unbounded
input, removes the residue instead of managing it.

The outbound mirror of this rule already exists in the redaction lane: on the way
out, the untraversed part of a payload is **dropped and marked** rather than
forwarded
([redact-at-the-cap](../../../../security/data-and-transport/telemetry-pii-redaction/techniques/redact-at-the-cap.md)).
Inbound, the equivalent of dropping is refusing or confining. The direction changes;
the rule that an uninspected span is never a passed span does not.

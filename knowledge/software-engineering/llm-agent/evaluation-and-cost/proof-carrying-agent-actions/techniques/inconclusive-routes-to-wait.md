---
layer: technique
type: technique
subject: proof-carrying-agent-actions
technique: inconclusive-routes-to-wait
status: forged
laws: [unknown-is-not-a-value, failure-not-empty-success, verdict-survives-boundary]
shared_with: []
use_when: [a checker could not finish one of its observations, deciding what a merge gate does when evidence is missing, a verifier exits with a code the gate maps to pass or fail]
---

# Inconclusive routes to wait

A proof checker has three answers, not two. The proof held: every observation
its class requires was made and every one agreed. The proof failed: an
observation was made and contradicted the claim — the exploit test passed at
base, an assertion was removed, the finding is still there. Or the proof is
inconclusive: an observation the class requires could not be made. This
technique keeps the third answer distinct all the way to the gate and gives it
the only safe route, which is to hold the change.

## What makes a proof inconclusive

Every reason an observation can be missing rather than negative:

- the base commit could not be built, so the exploit test could not fail there
  for the right reason or any reason;
- the test identifier the proof names was not found, or the runner did not
  collect it;
- the scanner timed out, crashed, or ran a version other than the one pinned on
  the finding;
- the weakening comparison could not parse a test file it needed to profile;
- the evidence job never ran, ran on a different commit, or produced output the
  checker cannot read;
- a required field of the proof class is absent;
- the evidence is not comparable — base and head measured on different runner
  pools, by different scanner versions, by different checker builds;
- the agent-supplied needle is too short to name anything;
- an edit the checker cannot classify, such as an expected value changed
  against an unchanged actual.

Each is a statement about the instrument, not about the change
([_laws: failure-not-empty-success_](../../../../_laws.md#failure-not-empty-success)).

## The verdict function has one order

Fold the checks into a verdict in a fixed order, as one pure function shared by
the producer and the gate: an envelope breach fails; any check that answered
*false* fails; any check that could not answer is inconclusive; **an empty set
of checks is inconclusive**; only then pass. The empty-set rule is the one that
gets forgotten, and it is the one a proof built from no evidence at all relies
on — "nothing failed" is true of nothing. Checks a person must settle (legal
wording, a re-check not yet run) are struck from the fold rather than counted
as passes, so a proof whose only remaining checks are struck is empty, and
therefore inconclusive.

Failures outrank unknowns. A proof with one contradicted observation and one
missing one has already shown it is false; waiting for the missing observation
would only delay a refusal.

## Why neither pass nor fail is safe

If inconclusive falls through to pass, the gate merges whatever could not be
checked, and "could not be checked" is the one outcome an agent can reliably
produce — a test it names but never commits, a scanner it times out, a base it
breaks. The verifier becomes a filter that passes exactly what it was built to
stop ([_laws: unknown-is-not-a-value_](../../../../_laws.md#unknown-is-not-a-value)).

If inconclusive falls through to fail, the gate is safe for a week. Then the
scanner's network flakes, a dozen honest proofs fail, and people learn that
failures from the checker are noise and override them — including the next one
that is a real refusal. A verifier that cries wolf is overridden on the night it
is right.

So inconclusive *waits*: the change is held, not merged and not rejected, with
the missing observation named and a route attached — re-run the evidence job,
supply the missing artifact, or hand to a person. A change that waits past a
bound is escalated to a person, never released by timeout.

## Keep the three values typed to the gate

The usual place the third value dies is the process boundary. The checker knows
it was inconclusive; it exits non-zero; the pipeline reads non-zero as failure;
the gate reads the pipeline as red. Or it exits zero with a note, and the gate
reads green. Use distinct exit codes, or a verdict file the gate reads, so that
the gate can branch on all three — and assert at the gate that the verdict it
read is one of the three it knows
([_laws: verdict-survives-boundary_](../../../../_laws.md#verdict-survives-boundary)).
A missing verdict file is inconclusive, not pass. An error inside the checker
— an input it could not parse, a file reference that resolved outside where
evidence may live — shares the inconclusive code rather than the failure code:
it says nothing about the change, so it holds the change rather than refusing
it. The same mapping governs the gate's other inputs. A guardrail verdict that
is neither the pass nor the block value it knows, or one that has not arrived,
is a wait.

## Inconclusive is not a soft fail in the record

What a record of proofs earns an action class is decided elsewhere, but the
record has to carry the distinction for that decision to be sound. An
inconclusive verdict is not a clean proof and not a refusal; counting it as
either corrupts every rate computed from the record.

## Decision rules

- When any observation required by the proof class is missing, the verdict is
  inconclusive; the checker never fills it with a default.
- Fold checks in one order — envelope, any false, any unknown, empty set — so a
  contradiction refuses at once and an empty proof never passes.
- When the verdict is inconclusive, hold the change with the missing
  observation and its remedy named; never merge, and do not reject.
- When a hold exceeds its bound, escalate to a person.
- Carry the three values through the process boundary with distinct codes or a
  typed verdict file; an unreadable or missing verdict is inconclusive.

## When not to use this

A checker that is inconclusive most of the time is not a checker; it is a queue
for people with a mechanical veneer. When the inconclusive rate is high, fix the
instruments — the flaky scanner, the base that does not build — rather than
turning the third value into a pass to keep things moving.

---
layer: technique
type: technique
subject: mcp-tools
technique: budgeted-partial-response
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value, count-carries-predicate]
shared_with: []
use_when: [an agent waits on a tool call that can run past a turn's patience, a tool returns whatever finished when its time ran out, deciding what exit status a timed-out query should carry, a partial tool result is being read as a complete one, an agent retries a slow call with the same arguments and the same deadline]
---

# Budgeted partial response

A tool that an agent calls has a caller with no patience it can negotiate. The
agent waits, or its harness times the call out, or it gives up and guesses. So a
tool whose work is unbounded (a search over a growing archive, a health probe across
several stores, a report that walks remote state) needs a deadline of its own, and
the moment it has one it will sometimes return before it is done.

That is the whole design problem. A partial answer is useful only if the caller can
tell it is partial, knows which part is missing, and knows how to get the rest. A
partial answer that looks complete is worse than a refusal, because the agent acts on
it.

> **Give each call one wall-clock budget. When it runs short, shed named optional
> sections, report everything you did not inspect as unknown, and hand back the
> bounded command that recovers what was skipped. An empty primary result caused by
> the budget is a failure, never a success.**

## The envelope

Every budgeted response carries one block beside its payload, whatever the payload's
shape:

- **outcome**: complete, partial, or timed out. A boolean `timed_out` may mirror it for
  callers that read nothing else.
- **elapsed and budget**, in the same unit, so the caller can see how close it came.
- **skipped sections**, by name. "Semantic results", "remote sources", "quarantine
  status": the vocabulary is the tool's own, and it is closed and documented.
- **a recommended next probe**: the concrete command, with arguments, that obtains the
  skipped facts.

The payload follows two rules. A section the tool never inspected is reported as
unknown (null, with an `inspected: false` marker), never as the default value its
type would carry. Zero quarantined items and "did not look at quarantine" are
different facts, and a type that cannot tell them apart will report the second as the
first ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). And any
count in the payload says what it counted: a total from a window that was cut short is
a lower bound and must say so
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## Shed before the deadline, not at it

The tool watches its own clock and starts dropping optional sections at a fixed
fraction of the budget (four fifths is a reasonable default), rather than running
every section until the deadline fires mid-write. Shedding at a boundary the tool
chose leaves every section either finished or absent. Running to the wall leaves one
section half-built, and a half-built section is the hardest kind of partial to label.

Sample the clock **once** per decision and pass that sample to both the decision and
the report. A tool that decides "near the limit, shed" on one reading and then writes
"exhausted" on a second reading taken after a scheduler pause has told the caller
something that did not happen. The report must describe the decision, not a later
moment.

## The recovery probe is a different call

The probe the envelope recommends must not be the call that just failed. Re-running the
same query with the same deadline on the same loaded host reproduces the same partial
answer and spends a round trip learning nothing. Make the probe differ in a way that
changes the outcome:

- **a larger budget**, sized from the one that ran out (several times it, with a floor),
- **a narrower scope**: only the skipped section, or only the sources it did not reach,
- **a cheaper instrument**, where one exists: a metadata-only status check instead of a
  full scan.

A tool that cannot name such a probe has found a section it should not be shedding.
Either make that section mandatory and refuse when it cannot complete, or split it into
its own call.

## Exit status: the budget never turns into an empty success

The envelope makes a partial **non-empty** result honest. It does not rescue an
**empty** one. When the primary payload is empty because the budget ran out, an agent
that reads the status first and the body second will conclude "no matches", and most
agents read the status first. So:

- an empty primary result caused by the budget exits with a retryable failure status,
  never success ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success));
- a non-empty partial result may exit with success, provided the envelope says partial
  and names what was skipped;
- the documented contract says which of the two a caller will see, per call, and never
  "read the body to find out".

The source this technique was taken from shows the cost of getting this half wrong. It
built the envelope carefully and then let a timed-out search exit successfully with an
empty hit list and a flag in the body. When callers of one search mode misread that
empty list as "nothing found", it changed that one mode to a retryable failure exit and
left the other modes as they were. The failure was observed, understood and fixed for one
mode only. The rule above fixes it for the class.

## Decision rules

- The call's work is bounded and cheap (a lookup by key, a fixed-size read): no budget,
  no envelope. The machinery costs more than the risk.
- The call has optional sections an agent can act without: budget it, shed those, and
  name them.
- Every section is required for the answer to be correct: budget it, but refuse when it
  runs out, with a retryable status and the probe. Never return a subset as the answer.
- The call has side effects: a budget does not make a write partial. That is a
  transaction question, and shedding a write is data loss. Keep side effects out of
  budgeted read surfaces.

## How to test for the property

Inject a clock that expires at chosen points, and assert for each point that the
response is complete or labelled partial, that every un-run section is named and
reported as unknown, that the recommended probe parses and differs from the original
call, and that an empty primary result never carries a success status. Then run the
same assertions on a host under load: wall-clock contracts that pass on an idle machine
and fail on a saturated one are the normal case, not the exception.

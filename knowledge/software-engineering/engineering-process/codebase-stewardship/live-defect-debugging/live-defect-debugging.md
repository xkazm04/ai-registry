---
layer: golden-path
type: golden-path
subject: live-defect-debugging
status: forged
use_when: [handed a behaviour report with no failing check and code that reads correct, an agent is about to patch a defect it has only reasoned about, a fix attempt failed and the next one is already forming, adding temporary instrumentation to a running system]
techniques:
  - reproduction-ladder
  - hypothesis-mapped-probes
  - marked-temporary-probes
  - run-scoped-evidence
  - evidence-gated-fix
  - revert-rejected-fixes
---

# Live-defect debugging

Someone says the thing misbehaves. There is no failing check, no stack trace worth the
name, and the code, read top to bottom, is correct. The reader of that code is an agent
or a person, and what happens next is the most reliably wasteful loop in software: a
plausible cause is named from the source, a patch is written for it, the patch is
declared done, and the defect survives because the cause was never the cause. The
patch is not neutral either. It is a guard against something that did not happen, and it
stays.

This subject owns the loop that replaces that one: **reproduce, hypothesise,
instrument, read the evidence, fix, verify on the same instrument, clean up.** The
product of the loop is two things and not one: a root cause that running evidence
supports, and a fix that the same evidence shows working. A change that merely stops
the complaint has produced neither, and the next defect will be harder to see for it.

The founding observation is about confidence. A reader of code produces an explanation
at the same confidence whether it is right or wrong, so confidence carries no
information about which. The only thing that separates a diagnosis from a story is a
datum captured from the system while it misbehaved. Everything below is machinery for
getting that datum cheaply, attributing it to the right idea, and leaving no residue.

## Where the subject stops

The subject starts before a failing check exists, and that is its first boundary. Once
a check fails for the right reason, the question changes from "what is wrong" to "what
may the repairer touch while making it pass", and that is the territory of
[oracle-frozen-during-repair](../../standards-and-gates/quality-gates/techniques/oracle-frozen-during-repair.md).
The two meet at the end of the first rung of the ladder below: a reproduction the
repairer writes becomes, once committed, exactly the oracle that technique freezes.
When a check already fails, skip to its rules; when none does, the loop here produces
one on the way.

Verifying a claim inside a chain of agent steps is a different job, owned by
[grounding-over-deliberation](../../../llm-agent/orchestration/agent-chaining/techniques/grounding-over-deliberation.md).
That technique argues that a step able to refuse a claim beats a step that merely
opines on it; this subject is the single-defect, single-actor case of the same
instinct, and supplies the machinery (probes, labelled runs, verdicts) that technique
presumes. Where a chain step must be checked, use that one; where a defect must be
found, use this.

A loop that keeps repeating the same failed attempt is halted by
[stuck-loop-detection](../../../llm-agent/orchestration/session-continuation/techniques/stuck-loop-detection.md).
Here the rejected-hypothesis rule changes direction instead of stopping: the next round
must draw from a different part of the system. The two are complementary, and neither
replaces the other. Triage of an offline suite's red cases belongs to
[failure-attribution](../../../llm-agent/evaluation-and-cost/eval-harness/techniques/failure-attribution.md),
which works from recorded results after the fact; this subject works against a live
process and generates the record as it goes. How a product's own telemetry sinks are
built and retained is a runtime architecture question that this subject only borrows
from: its sink is a throwaway owned by one debugging session. Code that is simply
unreachable, however it was found, is
[dead-code](../dead-code/dead-code.md), not a live defect.

The rule for picking between this subject and a neighbour is the state of the defect.
If you can make it fail on demand and a check says so, you are repairing. If you cannot
see it, you are diagnosing, and this is the subject.

## The loop, and the five rules under it

### 1. A defect you cannot see is first a reproduction problem

Nothing downstream works without a way to make the defect happen on demand, and the
cheapest way that is safe wins. An existing failing check is best; a small reproduction
the debugger writes and runs itself comes next, because it is deterministic and costs
no human attention; a person performing numbered steps is the last resort, because it
costs a round trip per iteration and varies between runs. Once a path is confirmed it
is reused, not renegotiated. The ladder, and the conditions under which the middle rung
is unsafe, are [reproduction-ladder](./techniques/reproduction-ladder.md).

### 2. Hypotheses come before probes, and probes answer to hypotheses

Write down three to five distinct explanations before touching code, because
the act of writing them is what makes private belief inspectable. Every probe then
exists to discriminate between named hypotheses, and every hypothesis ends in one of
three recorded verdicts with the evidence lines cited. A probe that discriminates
nothing is noise with a cost; a hypothesis without a probe is a hunch that will be
promoted to a fix. The numbers, the ceiling on probes, and the rule for a round that
rejects everything are
[hypothesis-mapped-probes](./techniques/hypothesis-mapped-probes.md).

### 3. Probes are temporary, findable, and removed by search

Instrumentation added by hand is a debt incurred in the middle of someone's working
tree. Each probe sits inside a marker pair that an editor can fold and a search can
find, so that removal is a mechanical sweep with a zero-count check and a diff review
instead of a memory test. Probes stay through the fix and its verification, because the
verification run needs the same instrument, and leave only when the run proves success
and the owner agrees. They never carry secrets. See
[marked-temporary-probes](./techniques/marked-temporary-probes.md).

### 4. Evidence belongs to a run, and runs belong to a session

The comparison that proves a fix is a comparison between two labelled runs, each
starting from an empty sink that this session created. A sink that accumulates across
runs mixes the before with the after, and a sink that is cleared or edited by someone
else's session makes every cited line unattributable. Clearing a sink is not removing
probes, and neither is a substitute for the other. See
[run-scoped-evidence](./techniques/run-scoped-evidence.md).

### 5. A fix needs evidence; a rejected fix needs reverting

A fix is applied when captured evidence confirms exactly one hypothesis, and not when a
reading of the code makes one seem likely. First fixes fail often; that is the expected
cost of working a defect nobody can see, and the loop is built so iteration is cheap
and an unproven fix is not. The other half is discipline about what a failed round
leaves behind: when evidence rejects a hypothesis, the edit written on its behalf is
reverted before the next round, so that speculative guards do not accumulate and
disguise the next defect. See [evidence-gated-fix](./techniques/evidence-gated-fix.md)
and [revert-rejected-fixes](./techniques/revert-rejected-fixes.md).

## The failure modes of the naive reading

The naive reading of "debug with evidence" is "add some logging". It produces
four recurring failures. Logging is added with no stated question, so the output cannot
refute anything and the author reads it as support for the fix already half written.
The sink is never emptied, so the second run's output is read as a continuation of the
first. The fix lands and the logging is deleted in the same edit, so success is
asserted from the code and never from a second look at the running system. And the
rejected guards stay, because each looked harmless, until a later defect is hidden by
three of them at once.

A subtler failure is the empty sink. An absence of output is two different facts: the
run did not exercise the path, or the path ran and the instrument could not record it.
Both leave the same silence, and a loop that reads silence as "hypothesis rejected" has
converted an unrun experiment into a result. This is the failure-not-empty-success
problem applied to a debugging session, and the precondition that answers it lives in
[hypothesis-mapped-probes](./techniques/hypothesis-mapped-probes.md).

## What the evidence base is, and is not

The loop's shape comes from the neighbours above and from first principles about cost:
a probe is cheap, a round trip with a human is expensive, and an unproven fix has an
unbounded tail. One practitioner tool built around exactly this loop is the only
realization examined while forging this subject, so the specific numbers (three to five
hypotheses, a ceiling of ten probes) rest on a single tree and should be read as
defensible defaults to be tuned against your own defect mix, not as measured optima.
Where a technique leans on that tree it says so.

## The techniques

- [reproduction-ladder](./techniques/reproduction-ladder.md) — existing check, then a
  self-written reproduction, then numbered human steps; reuse the confirmed path; when
  the middle rung is unsafe.
- [hypothesis-mapped-probes](./techniques/hypothesis-mapped-probes.md) — three to five
  hypotheses, probes tagged by what they discriminate, a minimum count with a ceiling,
  a closed verdict, the empty-sink precondition, and where the next round comes from.
- [marked-temporary-probes](./techniques/marked-temporary-probes.md) — marker pairs,
  deterministic removal, probes outliving the fix, no secrets in payloads.
- [run-scoped-evidence](./techniques/run-scoped-evidence.md) — an empty sink per run,
  labelled runs, never touching a sink another session owns.
- [evidence-gated-fix](./techniques/evidence-gated-fix.md) — apply a fix only when
  captured evidence confirms exactly one hypothesis; where a pure read counts as
  evidence.
- [revert-rejected-fixes](./techniques/revert-rejected-fixes.md) — the author's own edit
  discipline: only probes and proven fixes survive a round.

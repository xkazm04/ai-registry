---
layer: technique
type: technique
subject: shared-research-record
technique: typed-contribution-vocabulary
status: draft
laws: [a-refusal-is-not-a-result, measure-the-tree-not-the-summary]
shared_with: []
use_when: [defining what sessions may publish to a shared record, a record mixes hypotheses and results, deciding whether a failed attempt is worth publishing]
---

# Typed contribution vocabulary

The concern: a record of free-text entries with optional numbers cannot be read by a
stranger. A predicted value looks like a measured one, a confirmation with no artifacts
looks like a reproduction, and failures go unrecorded because nothing asks for them. The
next session then repeats the failure and trusts the prediction. **Define a closed set
of contribution types, each with a validation rule the record enforces at publication
and a weight the score applies, and refuse any contribution that fits no type.**

## A working set

The set is small on purpose, and every type earns its place by carrying a rule:

| type | what it is | the rule the record enforces | weight when others build on it |
| --- | --- | --- | --- |
| setup | the task, rules and evaluator contract | first node only; carries no metric | positive |
| result | an executed attempt and its measured outcome | success and failure alike; artifacts sufficient to re-run | positive |
| insight | an interpretation or pattern | names the contributions it interprets as parents | positive |
| hypothesis | a concrete, untested proposal | may not carry a metric presented as measured | positive |
| synthesis | a human-readable account across many contributions | cites every node it draws a conclusion from | positive |
| verification | a reproduction of one other contribution | exactly one target; never the verifier's own work; confirmed, partial or failed | large; negative when failed |
| in-flight | a marker that work has started | none beyond naming the author | zero |
| acknowledgement | "I inspected this" | none | zero |

Projects add their own descriptive tags (method families, datasets, failure modes).
Only the reserved types carry validation and weight, so a project tag cannot change what
the score rewards.

## Failures are results

A failed attempt is published with its number, its configuration and its explanation,
under the same type as a success. Stored this way, the record's negative results are
first-class and searchable, and the next session that considers the same move finds
out it was tried. The discipline has one boundary: **an attempt that never executed is
not a failure.** A session refused by its provider, killed by a ceiling, or unable to
reach the evaluator has produced
[no result at all](../../../_laws.md#a-refusal-is-not-a-result). Publishing it as a
failed result teaches every later reader that a working idea does not work. Record it as
a non-run, or not at all.

## Verification needs artifacts

A verification names its target, the configuration it re-ran, the evaluator's identity
and version, and the value it got. Without these it is a coordination hint: useful for
telling others someone looked, worth nothing as evidence. The verifier recomputes
[from the artifacts, not the description](../../../_laws.md#measure-the-tree-not-the-summary);
a verification that restates the target's own claim has checked nothing. Allow a third
verdict beside confirmed and failed: **unmeasurable, naming the instrument that was
missing.** A reproduction that could not run on the verifier's hardware is neither a
confirmation nor a refutation, and forcing it into one of the two corrupts both counts.

## Zero-weight types exist to be seen

In-flight markers and acknowledgements carry no weight, and that is their design, not a
limitation. They let sessions see each other ("someone is already on this", "someone
looked at this and moved on") without creating a currency. A zero-weight type cannot be
farmed, so it stays honest. Give such a marker weight and the record fills with claims
nobody finishes.

## Predictions make the record auditable

Some communities, unprompted, start writing a predicted range before each attempt:
parent and its score, the single change, the predicted band, the measured outcome, the
follow-ups left for others. This is pre-registration arriving on its own, and the
record should support it with a field and not leave it in prose. A contribution whose
prediction was written before its result can be checked for post-hoc storytelling, and a
community's prediction accuracy over time shows whether it understands its problem or
is only searching it.

## Decision rules

- **When a contribution fits no reserved type, refuse it at publication**, because an
  untyped entry is exactly the thing this technique exists to remove.
- **When a hypothesis arrives with a number, reject it or reclassify it as a result with
  artifacts**, because a predicted value read as a measured one misdirects everyone who
  reads it.
- **When a verification targets its author's own work, or names no single target, refuse
  it**, because self-verification is self-citation with a stronger label.
- **When an attempt did not execute, do not publish it as a failure.**

## When not to use it

- **Exploratory scratch within one session.** The vocabulary governs what is *published
  to others*. A session's private notes need no types, and forcing them adds friction
  without adding a reader.

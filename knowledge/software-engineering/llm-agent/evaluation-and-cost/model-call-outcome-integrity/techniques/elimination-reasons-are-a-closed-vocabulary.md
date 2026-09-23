---
layer: technique
type: technique
subject: model-call-outcome-integrity
technique: elimination-reasons-are-a-closed-vocabulary
status: forged
laws: [one-authority-per-vocabulary, silent-state-is-ungoverned]
shared_with: []
use_when: [no candidate engine was eligible and the caller must be told why, a fallback fired and the answer will be published as though it had not, an operator is fixing the wrong cause of an unavailability, deciding what a degrade must carry with it]
---

# Elimination reasons are a closed vocabulary

When a seam declines to use an engine, or falls back from one, the reason is a **value
from a fixed set** — not a boolean, not a log line, not a message assembled at the throw
site. The set is owned in one place, and every consumer reads the same members.

## What a boolean costs

"Unavailable" is the same word for conditions with nothing in common: no credential
configured; a credential present but rejected; the transport not installed; a deliberate
policy that forbids reaching outward; a rate limit; a managed environment where the
mechanism cannot exist. They have different owners and opposite fixes.

Collapsing them sends people to fix the wrong thing, confidently. The observed case worth
remembering: an installation was **deliberately sealed** from outbound network access,
and the seam reported that as a missing credential. Operators went looking for a key that
was never supposed to exist, in a system that was working exactly as designed. The seam
had all the information and had thrown it away at the boundary.

## The rule

**One enumeration, one owner, every consumer.** Each way an engine can be eliminated is a
named member. The member travels; the prose does not.

Three consumers must receive the *same* value, not three renderings of it:

1. **The thrown error**, when nothing was eligible — carrying the full ordered list of
   what was considered and why each was dropped, so the message answers "why did nothing
   run" rather than "something did not run".
2. **The successful outcome**, when a later candidate did answer — because a fallback
   that only appears in logs will be published by the caller as though the intended
   engine produced it.
3. **The log line and any persisted record**, so an operator reading history and a caller
   reading a response cannot form different beliefs about the same call.

A seam that satisfies one or two of these has the bug. The value of the trail is that
these three can never disagree, and that property is lost the moment one of them is
reconstructed independently.

## The trail, not the verdict

Record the **sequence**, not just the winner. "Answered by the second candidate" is
weaker than "the first was dropped for this reason, the second answered", because the
first form cannot tell an operator that their preferred engine has been silently
unreachable for a month while the fallback quietly carried production.

This is what turns a degrade from an incident into a metric: an elimination reason that
appears in the trail with rising frequency is a leading indicator, and it is only
countable because it is a value rather than a sentence.

## Decision rules

- **A new elimination cause is a new member**, added in the one place that owns the set —
  never a special-cased string at a call site, and never folded into a neighbouring
  member because it is rare.
- **The trail travels with the answer, or the fallback does not happen.** If the outcome
  type cannot carry it, the seam is not permitted to substitute engines.
- **Prose may accompany a member; it may not replace one.** Free text is for the human
  reading one incident; the member is for everything that counts, groups or alerts.
- **Distinguish "declined to try" from "tried and failed".** A policy that forbids an
  engine and an engine that returned an error are different members, and conflating them
  makes a deliberate configuration look like an outage.

---
layer: technique
type: technique
subject: prompt-assembly
technique: recovery-path-as-loss-signal
status: forged
laws: [gate-sees-target, count-carries-predicate, unknown-is-not-a-value]
shared_with: []
use_when: [a compression or elision step is proposed and nobody has said how its loss will be observed, a shortening change reports a saving measured at its own output, choosing how aggressive a history or payload transform should be, a recovery path exists but nothing counts how often it is taken]
---

# The recovery path is the loss signal

Three techniques in this subject remove material a model will later read.
[context-budgeting](./context-budgeting.md) walks an elastic section down its
ladder; [history-compaction](./history-compaction.md) replaces turns with a
summary; [elision-to-a-refetch-pointer](./elision-to-a-refetch-pointer.md)
trades a payload for the address it came from. Each is built to leave the
original reachable — re-run the tool, re-read the file, open the preserved
record — and that reachability is always justified the same way: as a safety
valve. If the transform took too much, nothing is lost; only a round trip.

It is also the transform's **error rate, made observable**. How often the
consumer takes the way back is how often the transform removed something that
mattered. Nothing else measures a lossy transform's aggressiveness from the
outside: a compression ratio says how much was removed, never how much of it
was needed, and a held-out quality score says the system got worse without
saying which transform did it. The signal is already present in every system
that provides a recovery path. It is usually not counted.

## Instrument the recovery path; do not merely provide it

The observable is a family of behaviours, not one event, and naming the whole
family is the practical content of this technique. A consumer that has lost
something it needs recovers by whatever route is cheapest at that moment:

- it **re-fetches the preserved original** through the pointer it was left;
- it **re-runs the command or call** that produced the material;
- it **repeats an exploration it had already finished** — re-listing, re-reading,
  re-walking ground the removed material already covered;
- it **narrows a search it had already run**, because it no longer holds the
  result that told it where to look;
- it simply **takes more turns** to reach the same end state, with no single
  step identifiable as recovery at all.

A system that counts only the first has undercounted, and in the worst
direction. The explicit re-fetch is the *cheap* recovery — the one the
transform's own designer anticipated and made cheap on purpose. The expensive
recoveries are the ones that do not look like recovery: re-derivation the
consumer does not know is re-derivation, spread over turns that each look
like ordinary work. A rate built only from pointer-follows measures the
designer's imagination rather than the transform, and it reads low precisely
where the transform is doing the most damage.

So the counters are declared in the same change as the transform, and they
count repeated work and added turns alongside the anticipated path. Per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate), a
recovery rate travels with which members of the family it counted; two teams
quoting "under one percent" from different halves of that list are quoting
different numbers.

## The saving must be measured where the recovery happens

A saving measured at the transform is not a saving. The transform's own output
is a proxy for the thing anyone cares about, and it is a proxy that diverges
from the target in exactly the case the measurement exists to catch
([gate-sees-target](../../../../_laws.md#gate-sees-target)) — the case where
the removed material was needed.

The coupling is specific and checkable, and it is worth stating as a mechanism
rather than as a general warning about proxies: **the coupling is a behaviour
of the consumer, so the boundary must be drawn wide enough to contain that
behaviour.** Shorten the payload, and the tokens do not disappear; the consumer
spends turns re-deriving what was removed, carrying more context forward on
each of them, and the spend reappears downstream of the measurement point where
nothing is looking. A per-unit metric therefore does not merely fail to see the
cost — it improves *because* the cost moved out of frame.

The rule follows: the measurement boundary is the **complete unit of work, from
request to result** — every turn, every token, and the wall clock. Which unit
that is depends on the recovery loop the transform provokes. If recovery is one
extra call, the turn is wide enough. If recovery means re-planning or repeating
an exploration, the boundary is the whole task, and anything narrower scores
the transform on a term that moves the wrong way when it goes wrong.

A 2026-09 first-party account of one coding agent (n=1; one harness, offline
benchmark tasks plus an online rollout) reports the mechanism directly: a
general-purpose shortener applied to output the agent would read made tasks
**more expensive on average**. Responses were shorter, and when the omitted text
mattered the model reopened the original or re-ran the command, adding turns and
carrying more context forward on each one. The per-response number improved and
the per-task number got worse — one workload, one harness, and not a constant to
carry anywhere else, but the shape of the failure is the general lesson.

## The rate is two-sided, and zero is the ambiguous reading

A **high** recovery rate is unambiguous: the transform is too aggressive, and
the corrective is at the transform — a higher threshold, a narrower class of
material, a rung further up the ladder.

A recovery rate at or near **zero** says one of two things and cannot
distinguish them:

1. the transform is precisely targeted — it removes only material the consumer
   genuinely never needs again; or
2. the transform is too timid — it is leaving savings on the table, and the
   rate would still be near zero if it took considerably more.

Both states produce the same observation, so reading zero as "correctly sized"
converts an unknown into a definite verdict
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). Only
pushing separates them: widen the class or lower the threshold by a declared
step, and watch which moves first — the recovery rate, or the unit-of-work
metric.

The same 2026-09 account is the honest illustration. For the compressor it
shipped: on offline tasks where compression triggered, no statistically
significant regression in task success, and agents "extremely rarely" opened
the saved originals; online, average cost decreased slightly with no material
regression in the quality metrics tracked. That was read as confirmation of
safety, which is correct and is what the data support. It does not settle the
second reading — the same numbers are equally consistent with a transform that
could have taken more. Nothing in the observation decides it; only a deliberate
push would.

Naming the ambiguity is not the same as demanding it be resolved. Pushing costs
an evaluation cycle and risks a real regression, and a team may rationally stop
at *safe*. What is not rational is reporting a safety result as an optimality
result, which is what a near-zero rate quietly invites.

## The same instrument, at the opposite polarity

A routing technique in another domain's bundle reaches this instrument from the
other side. There, the fallback is a **safe superset** injected whenever a task's
scope was never classified: correct by construction, harmless-looking, and
silently masking the fact that routing never happened. Counting how often that
fallback is taken is the only way the coverage gap is ever found. Here the
fallback is a **repair** — the way back to material a transform discarded — and
counting how often it is taken is the only way over-aggression is ever found.

One rule underneath both, with two readings: **a fallback that is correct is
also silent, and its usage rate is the only observable of the defect it is
masking.** The discriminator is what the fallback does relative to the normal
path:

- **Broader than the routed path** — a superset taken because a decision was
  never made. Its rate measures a *coverage* gap, and the corrective is
  upstream, at whatever should have classified the work.
- **A restoration of what a transform discarded** — a repair taken because a
  decision was made too aggressively. Its rate measures *over-aggression*, and
  the corrective is at the transform itself.

Getting the discriminator wrong sends the fix to the wrong place: tuning a
threshold that was never the problem, or reclassifying inputs when the class
list was fine and the threshold was greedy.

## Decision rules

- **When shipping a lossy transform, ship its recovery counters in the same
  change.** A recovery path added without instrumentation is a safety valve and
  nothing else; the measurement it could have carried is not recoverable later,
  because the behaviour it would have counted has already happened uncounted.
- **Count the family, not the event.** Pointer-follows, re-runs, repeated
  explorations, narrowed re-searches, and added turns. State which of these the
  rate includes wherever the rate is quoted.
- **Draw the measurement boundary around the complete unit of work**, sized to
  the recovery loop the transform actually provokes.
- **Read a high rate as over-aggression and a zero rate as unresolved.** Zero is
  a question, not an answer.
- **When the recovery path cannot be instrumented, ship the transform
  conservative.** An error rate nobody can observe does not become zero by being
  unobservable, and the conservative setting is the only one whose worst case is
  bounded.
- **When a transform's aggressiveness is under argument, resolve it by pushing
  one declared step and re-measuring**, not by reasoning about what the model
  probably needs. This is the one question the system answers for itself.

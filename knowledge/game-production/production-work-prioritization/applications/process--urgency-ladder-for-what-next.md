---
layer: application
type: application
subject: production-work-prioritization
technique: urgency-ladder-for-what-next
stack: process
status: forged
---

# One coach ladder across two surfaces

`src/components/layout-lab/coachLadder.ts` in the Proof of Fun repo is the unified ladder,
and its header comment is the incident report that produced it.

## The divergence it fixed

Two coaches were mounted over the same entity at the same time — a per-entity
`NextStepCoach` in the work canvas and a cross-catalog `GlobalCoach` above the Baseline
view — running two different orders:

```
pickNextActionableStep (old): fail > (unproduced | pending, by index) > deferred
pickEntityIssue        (old): fail > drift > pending > deferred > unproduced
```

The same entity was therefore told to do two different things depending on which panel the
operator was looking at. Neither order was unreasonable in isolation, which is the point:
independently reasonable ladders diverge, and the divergence is invisible from inside
either one. Note specifically that the first ladder had **no rung for drift at all** and
therefore, in the comment's words, "silently coached against a status it could not trust."

## The unified order, as data

```ts
export const COACH_LADDER: readonly CoachPriority[] =
  ['fail', 'drift', 'pending', 'deferred', 'unproduced'] as const;

export const COACH_PRIORITY_RANK: Record<CoachPriority, number> =
  COACH_LADDER.reduce((acc, p, i) => { acc[p] = i; return acc; }, {} as Record<CoachPriority, number>);
```

The rank map is *derived* from the list, not typed alongside it, and the file states the
governing property: "The order is data (`COACH_LADDER`), not control flow, so a change here
changes BOTH coaches at once — they cannot drift apart again."

Each rung carries its justification in the header comment: `fail` first because a failed
gate blocks everything downstream; `drift` second because until it is reconciled every
other status on the entity is suspect; `deferred` below `pending` because it is not locally
actionable but above `unproduced` because the work exists and only needs finishing; and
`unproduced` last on purpose — "finishing started work always beats starting something
new".

## The upward lesson: the last rung must not read as progress

The comment on `unproduced` adds a reason the expert draft lacked: it is "the honest
replacement for the old lifecycle-fraction pseudo-progress, so it must never read as
work-in-flight". Ranking never-produced last is not only a scheduling preference — it is
what stops a never-started item from being displayed as partially advanced. The ladder and
the progress display are the same claim.

## Operator-facing rendering

`COACH_HINT` pairs each rung with a glyph, an imperative verb and one plain sentence —
`✕ Fix` "a gate failed here — open it to see what to change"; `≠ Review` "the local and
server verdicts disagree — reconcile them"; `· Start` "not produced yet — nothing has run
here". The glyph is annotated as "the primary, colorblind-safe signal", with colour
secondary.

`src/components/layout-lab/labGlossary.ts:24` restates the same states without jargon for
non-specialists — `pass` as "done", `fail` as "needs a fix", `deferred` as "waiting on
Unreal", `pending` as "not started" — so the ladder's vocabulary and the plain-language
vocabulary are single-sourced against each other.

## Graceful degradation, and the deviation

`pickLadderIssue` takes `driftByStep` as optional so "a caller with no server comparison
keeps working: absent → the `drift` rung is simply empty." That is the technique's rule 5
exactly — empty a rung, never fall back to a different ladder.

The deviation: nothing asserts at build time that the two surfaces both go through
`pickLadderIssue`. The shared constant makes divergence unlikely, not impossible; the
standard asks for a check that no surface computes its own next-step order, and that check
does not exist here.

---
layer: application
type: application
subject: interview-round-design
technique: cohort-reducer-between-rounds
stack: node
status: forged
---

# The reducer as a typed field on a per-workspace interview plan

The loop's shape lives in one config object, `InterviewPlanRule`
(`app/_lib/decision-config-schema.ts:141`), stored in the tiered decision-config store
alongside the rest of hiring policy. The reducer is a first-class field on a round, not
an implicit behaviour of the code that advances candidates.

## The round type

```ts
// app/_lib/decision-config-schema.ts:118
export type InterviewPlanRound = {
  kind: InterviewPlanRoundKind;          // "ai" | "human"
  gate: InterviewPlanGate;               // "auto" | "human" — who ratifies the verdict
  /** Cohort reducer INTO this round (top N of the previous round's advancers);
   *  null = everyone. Always null on the plan's first round. */
  topN: number | null;
};
```

Three of the technique's four properties are typed here:

- **Basis** — a threshold plus a shortlist. The verdict filter (only advancers from the
  previous round are eligible) is the floor; `topN` is the capacity cap on top of it.
  That is the combination the technique calls the honest default, and the field comment
  spells out the composition: *top N of the previous round's advancers*.
- **Actor / human gate** — `gate`, normalized by the validator so a stored plan cannot
  lie about it: `gate: rec.kind === "human" ? "human" : rec.gate`
  (`app/_lib/decision-config-schema.ts:518`), with the comment "A human round's verdict
  IS the human decision — never persist it as unattended, whatever the client sent". The
  shipped default (`app/_lib/decision-config-schema.ts:281`) is
  `{ kind: "ai", gate: "human", topN: null }` behind a human screening gate and a
  human-approved offer: the machine round exists, and a person ratifies it.
- **Ratio** — `topN`, clamped rather than rejected on out-of-range input
  (`Math.max(1, Math.min(50, Math.round(rec.topN)))`, line 509).

## The first-round rule

`topN: seq === 0 ? null : topN` (`app/_lib/decision-config-schema.ts:519`), commented
"The plan's first round has no previous cohort to reduce." This is the technique's
narrowing model enforced structurally: a reducer is a relation *between* two rounds, so
the first round cannot carry one. A stored plan that tries is corrected at read time
rather than trusted.

## "A second conversation is a second column"

The doctrine at `app/_lib/decision-config-schema.ts:263` is the loop-shape argument the
golden path makes, written as a changelog entry:

> It used to be two rounds (AI, then human for the top 3) STACKED behind that one
> column, because nothing stopped it. One step now runs one activity — a second
> conversation is a second column, which is a shape a candidate can actually be standing
> on and a board can actually draw.

The stacked shape is still *representable* — `InterviewPlanStep.rounds` is an array, and
the comment at line 137 notes that more than one round per column is "legal and lossless
— that is what the old flat array's implicit stacking actually meant, now said out loud".
The change was to stop it being the default. The same block names the consequence
honestly: `planRoutesAiScorecardToHumanRound` (line 182) no longer fires by default, so a
workspace that wants the handoff "adds an Interview step and sets its executor to a
person, which is now a visible decision instead of an invisible one."

That is the golden path's rule about emergent loop shapes, applied: the reducer and the
round it reduces into must both be things somebody chose.

## The scoring column is its own step

`PLANNABLE_ROLES` (`app/_lib/decision-config-schema.ts:148`) admits `scoring` as a
column a plan may govern, and the argument for why it is a column at all is at
`app/_lib/pipeline-stages.ts:20`:

> `scoring` is the automated pass that turns a conversation into a comparable number —
> the step between an AI interview and a human one in the shape most teams actually run.
> It is a column of its own rather than a property of the interview because it is a
> distinct thing the product DOES (and a distinct thing a human can be asked to ratify),
> and because a candidate genuinely waits there.

Three independent reasons, all the technique's: it is a separate activity, it has a
separate ratification, and it has a candidate-visible wait. `entry` and `terminal` are
excluded from `PLANNABLE_ROLES` because they are "arrival and outcome, not decisions".

## Deviations from the standard

- **No stated basis beyond the two typed ones.** The reducer cannot express "a named
  human picks", which the technique lists as a legitimate basis; a human-selection
  reducer today is an out-of-band board move.
- **Reducer replay.** The plan stores the rule, and the sealed decision chain stores the
  outcome, but nothing stamps *which version of the plan* a given reduction ran under —
  so a moved `topN` cannot be distinguished, after the fact, from the one that actually
  applied. The technique's replayability rule stands unmet.
- **No interviewer identity on the human side of the reducer.** This is the
  load-bearing one, and the repo documents it about itself at
  `docs/concepts/interview-rounds.md:74`: `schedule_invites` and `interview_sessions`
  carry no `user_id`, "the only attribution is a free-text `interviewer` string on the
  prep artifact", and calendar grants are one per workspace rather than per user — so
  everything schedule- and interview-related is "team-scoped and person-blind". A
  reducer that routes survivors into a human round therefore cannot say who will assess
  them, cannot route a replication to a *different* assessor, and cannot detect an
  interviewer whose ratings run a band above the rest. The standard is unchanged:
  interviewer identity is captured at invitation and again at the session, and the two
  are compared. The repo's own additive fix (`interviewer_user_id` on invites, a
  per-user calendar column with an interviewer-then-workspace resolution order) is the
  right shape and is not yet built.
- **Ties.** Nothing in `validatePlanRound` or the routing addresses a tie at the `topN`
  boundary. The standard — spare the whole tied group at an irreversible cutoff — is not
  implemented; the cut is whatever the ranking query returns.

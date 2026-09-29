---
layer: application
type: application
subject: hitl-approval
technique: handoff-is-a-declared-door
stack: next
status: forged
verified_on: 2026-09-29
verified_against: next@16.3.5
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# A decision that arrives over a machine door, with no decider in the payload

The version witness is the exact dependency pin `"next": "16.3.5"` in the
repository's own `package.json`. The tree is a self-hosted hiring workspace whose
scope is screening behind human approval gates; it can also hire an AI agent for a
job, dispatching a specification to a sibling application and receiving reports back.
This application checks the technique's last decision rule, the one about machine
channels, against that return path. It is not a claim that the tree has a defect: the
sibling application is the same owner's, and the finding is about what the record can
and cannot say.

## The seam

A hired agent moves through `dispatched`, `pending_approval`, `onboarding`, `active`
and the terminal states. Inbound reports arrive on one public route where a
generated report token is the only authentication, and that route accepts three
kinds of report: execution events, period rollups, and lifecycle transitions
including a probation review whose payload is its own decision
(`activated`, `extended`, `retired`).

- `docs/features/agents/README.md:438 "only gate on the public report route"`
- `app/_lib/db/agents.ts:374 "dispatched: ["`
- `app/_lib/agent-hire/report-payload.ts:374 "note: str(p.note, MAX_REASON)"`
- `app/_lib/agent-hire/lifecycle.ts:67 "auto:agent-bridge"`

The same capability that authorizes telemetry authorizes a hiring decision, and the
lifecycle payload carries a persona id, a persona name, a reason and a note, but no
field for who decided. The ledger row names the machine actor, which the tree says
plainly (a comment beside it reads that the sibling application, or a poll, moved the
card rather than a recruiter), so nothing is misrepresented. What the record cannot
say is which person made the decision it records.

## Arm A, measured

The one experiment reachable here counts, for every current status crossed with every
push event the route accepts, how many pairs the token alone can carry to `active`.
It ran as a throwaway test against the tree's own transition door
(`lifecycleTarget` then `transitionHiredAgent`) in an isolated database, and the file
was deleted afterwards.

- 56 pairs tried (seven statuses by eight events); **8 reach `active`**.
- Six of those eight start from a status where nobody has yet decided anything
  (`dispatched`, `pending_approval`, `onboarding`), reached by a plain `activated`
  push or by a probation review whose decision is `activated`. The other two are
  `active` to `active`.
- In particular a hire still in `dispatched` can reach `active` on one report, because
  the transition table permits it: the pull path (a poll of the sibling's status) can
  legitimately return an active state directly, and the two paths share one table.

The tree's own documentation of the token notes the exposure from the other side, that
a client holding it could post lifecycle and execution reports for that agent with no
session (`docs/features/agents/README.md:441 "a client holding it could post lifecycle"`),
and keeps the token server-side for that reason.

## Arm B, not built

The technique predicts a decider field on the lifecycle payload, recorded on the
ledger row, with its absence written as an explicit "unattributed" and a stricter
table for the push path than for the pull path. Neither can be built and measured in
this tree alone: the field has to be sent by the sibling application, which is a
different repository, so the second arm does not exist to be run.

## Verdict and boundary

`unmeasurable`. The instrument that would make it measurable is the same probe,
re-run once the sibling sends a decider: it should show the count of pairs reaching
`active` with no decider attribution fall from 6 to 0 for a push, while the count of
legal pairs does not change (the floor: no legitimate activation is refused). Until
then the return condition is "when the sibling application reports who decided".

The single-owner boundary is real: with one operator on both sides the chain
collapses to a constant, and an honest placeholder actor is the correct record. The
technique's claim survives that, because a placeholder is a recorded fact and the
missing field is not.

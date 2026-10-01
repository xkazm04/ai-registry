---
layer: application
type: application
subject: remediation-handoff
technique: handoff-tenancy-and-idempotence
stack: node
status: forged
verified_on: 2026-10-01
verified_against: node@24
---

# The hand-off write — `POST /api/org/followups/handoff`

`src/app/api/org/followups/handoff/route.ts` is the only user-triggered write
in the loop. Its header states the contract before any code runs: *"the user
picked a batch and generated its fix prompt, so every picked item is now IN
PROGRESS — 'we took this on' — with a timeline note that says how. The prompt
itself is built client-side from the same rows (pure), so this route only
records the claim; nothing here talks to a model."*

## One claim path (changed 2026-09-24)

The route no longer writes status itself. It calls `claimFollowups`
(`src/lib/db/followup-claims.ts`), the same compare-and-set the local loop
engine and the remote-agent MCP door use, as executor `human` with
`leaseMs: null`. Before that date it called `handoffRecommendations`, which
moved the status and wrote no claim column, so the ledger could not say who had
taken a row handed off from the browser. Two implementations of "who holds
this row" had already existed (an unconditional update in the loop, a
compare-and-set in the hand-off); a third caller would have made it a question
with no answer, so the module header states the rule: the database decides,
`count === 1` won.

## Tenancy

The route implements the technique's two-check rule, with the second check now
inside the shared claim:

1. `requireOrgAccess(org)` authorizes the container, as in the rest of the org
   surface.
2. `claimFollowups` reads ownership for every id in **one org-scoped batch
   query** and, with `allOrNothingTenancy`, refuses the whole request if any id
   is not owned. Unknown and foreign ids get the **same** `unknown` answer, so
   no response distinguishes "does not exist" from "belongs to someone else".
   The ownership read happens before the lease sweep, so a refusal leaves the
   org exactly as it found it.

The route turns any `unknown` refusal into a whole-request 403 with a generic
message, and refuses the public funnel org outright. `MAX_BATCH = 50` is
enforced before anything is read.

## Idempotence

Only `open` rows transition; the outcome is `{ claimed, refused }`, and the
response is `{ marked, skipped }`, a reconcilable result rather than a bare
acknowledgement. A row already in progress is refused `held` or `not-open`
and gets no second event, so a re-sent batch writes nothing and the timeline
stays an explanation of how the item moved. Done and dismissed items are not
reopened; the skipped list tells the ledger which to refresh.

## The claim is a record for a human, a lease for a machine

The human hand-off writes `leaseMs: null`: a claim with no clock, which
`sweepExpiredLeases` never reclaims. The module is explicit that null is not
expiry; reading it that way would let the sweep pull work out from under a
person. Machine executors get a lease (default 45 minutes, clamped to 5 minutes
-4 hours), swept lazily at the top of a claim and at the ledger read, with no
cron requested, because a claim path that needs a scheduler to be correct is
wrong wherever the scheduler is down. There is deliberately no side table for
claims: the columns live on the row, so purge and erase behave as before.

**No claim verb can close a row.** `status: done` is reachable only from the
rescan's `decideInProgress`; `report_attempt` writes an event and clears a
lease and is a second claim of the same weight as the commit trailer.

The same module owns the authorization to claim at all
(`claimability`): a remote agent is refused in a no-AI zone, below
`agents-allowed` admission, at the unproven tier and at T0; an unknown tier
refuses, because a repository with no passport has not shown it can be worked
unattended. `local` and `human` executors are not gated by tier.

`FollowupsPromptModal` still includes already-handed-off items in the
regenerated prompt and does not re-mark them.

## Batch shape upstream

The batch this route receives is shaped by
`src/components/org/followups/followupsModel.ts`: `sortByValue` (projected
points desc, then impact, then effort, then title) and `summarizeSelection`.
The estate-wide decision is `dimensionSpread`: a dimension is `orgWide` when
`of >= 2 && repos.size * 2 >= of`, an active follow-up in at least half the
scanned repos, with a minimum denominator of two. The module comment states the
shaping consequence: *"a gap present in at least half the fleet is an ORG
problem — fix it once, as a practice, copying whoever already nails it — not N
repo tickets."*

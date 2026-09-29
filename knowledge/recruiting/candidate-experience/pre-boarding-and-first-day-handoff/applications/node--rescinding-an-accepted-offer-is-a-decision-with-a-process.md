---
layer: application
type: application
subject: pre-boarding-and-first-day-handoff
technique: rescinding-an-accepted-offer-is-a-decision-with-a-process
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: experiment
ab_verdict: unmeasurable
---

# A hired candidate can be closed by the selection-stage reject — a Next.js/SQLite recruiting studio

The tree's own header says the studio's terminal state is `Hired` and everything after
belongs to the HRIS (`respondToOffer` in `app/_lib/offer-finalize.ts`, the comment above
the `candidate.hired` webhook). That is a scope decision and it is honest. It does not
remove the question this technique asks, because the *company-side* close of a hired
person is still reachable inside the studio, through the one door it has.

## What the tree does, measured

The status vocabulary in `app/_lib/pipeline-status.ts` names the closes carefully:
`rejected` is "the COMPANY passed on the candidate", `declined` is the candidate's, and
`rematched` and `role_closed` are neither — the header argues that folding one into
another "corrupts funnel, re-engagement and offer-acceptance reporting". A hire the
company rescinds has no name in that list.

The action path has no guard for it. `actOnPipelineEntry` in `app/_lib/db/pipeline.ts`
refuses an `accept` on a terminal *status* and is idempotent on `reject`; nothing asks
whether the entry stands on the terminal *stage*. The route wrapper in
`app/_lib/pipeline-entry-action.ts` runs the same `reject` through the selection-stage
path: it seals the decision, dispatches the standard rejection letter
(`dispatchRejection` in `app/_lib/comms-dispatch.ts` has no stage check) and fires the
`candidate.rejected` event at the system of record.

Probe (a throwaway unit test against the tree's isolated test database, run with the
repository's own unit launcher and deleted afterwards): an entry created at stage
`Hired`, `status: active`; `actOnPipelineEntry(id, "reject", "probe rescission", { actor:
"human", actorRef: "human:Probe" })`.

- Before: `{"stage":"Hired","status":"active"}`
- After: returned the entry, `{"stage":"Hired","status":"rejected"}`

So the record now says a person is at the hire stage *and* that the company passed on
them, and the reason and actor ride on a `rejected` event with no ground. The hire that
was metered on acceptance and mirrored as `candidate.hired` is not reversed anywhere by
this path (read, not run: `recordMeterUsage` and the outcome record sit on the accept
path only). Whether a recruiter's UI offers reject on a hired card was not measured.

## The tree already carries one ground's distinct outcome

`closeEntriesByJobId` (`app/_lib/db/pipeline.ts`) is the "the role changed" ground done
as the technique asks. Closing a role withdraws every `active` entry short of the
terminal stage as `role_closed` — "a DISTINCT terminal status — they cleared the bar but
lost the role to timing, NOT a merit reject, so reject-rate stays honest" — with an event
per entry, and it resolves the placed candidate by role so the hire is never swept up
(read, not run). That covers a person parked on a post-offer column when the role goes.
It stops at the hire: a person already on the terminal stage is deliberately left
untouched, so the one door left for withdrawing *them* is the reject above.

## The tree already carries the ledger half

The accept path shows the ledger idea in code, unnamed. `respondToOffer` explains that a
workspace may compose a column *after* its offer step — a background check, a contract
signature — so an accept "lands there, not on the hire", and resolves `hired` by role and
by having crossed onto the terminal stage rather than by "the entry moved". The hire
meter, the outcome record and the `candidate.hired` webhook fire only for that. That is
the technique's "a contingency is a state, not a stage" rule realised for the
acceptance; what is missing is the same care on the way out.

## What this application says about the technique

- **Not refuted.** The single-door failure exists in a tree that was built carefully
  around its neighbours, and the fix the technique names — a distinct outcome selected
  by a ground — has a home ready: `pipeline-status.ts` already treats a new close as a
  status decision with an argument.
- **A condition it gained.** The technique applies wherever a *company-side* action can
  reach a person who has accepted, whether or not pre-boarding is in scope. A product
  that stops at `Hired` still owns the door that can un-hire.
- **Not built.** No arm B was implemented, so the verdict is `unmeasurable`: the failing
  arm is measured, the fixed arm is a design. The change is a status, a ground field, a
  guard in `actOnPipelineEntry`, the reversal of the meter and the outcome, and a
  distinct outbound message — several files with a schema change and a decision about
  reversing a billed hire, which belongs to the owner.

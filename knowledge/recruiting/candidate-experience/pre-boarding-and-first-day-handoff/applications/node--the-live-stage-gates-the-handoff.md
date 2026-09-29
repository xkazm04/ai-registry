---
layer: application
type: application
subject: pre-boarding-and-first-day-handoff
technique: the-live-stage-gates-the-handoff
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# The live stage gates the handoff — a Next.js/SQLite recruiting studio

This app is a hiring studio whose terminal state is `Hired`. Its own comment says so, in
`respondToOffer` in `app/_lib/offer-finalize.ts`, above the webhook dispatch: *"Hired is
the TERMINAL state kp owns. What happens after the hire — pre-boarding paperwork,
equipment, day one — is deliberately out of scope: this is a hiring studio, and the
post-hire hand-off belongs to the HRIS the webhook below feeds."* A pre-boarding feature
did once live here and has been removed, so what this application documents is the half
of the technique that survives in live code: **the gate itself**, which the acceptance
path implements in full and which any downstream provisioning must consult.

Citations below are to symbols, not line numbers: the file moved by roughly forty lines
between the first reading (2026-08-20) and this one, and every line cite had drifted.

## The acceptance is claimed once, and the claim is what the handoff hangs off

`respondToOffer` reads the offer's status and then explicitly refuses to trust that read:

```ts
// The CAS in markOfferResponded is the ONLY claim that counts (idea-e80f60f1):
// the status read above is a snapshot, and two concurrent responses (candidate
// double-click; candidate + recruiter-on-behalf) both pass it.
const { offer: claimedOffer, claimed } = markOfferResponded(token, "accepted");
if (!claimed) return reportLoser(claimedOffer);
```

The comment records the incident directly: before the compare-and-swap, *both* callers
ran the terminal side effects, producing "phantom Hired transitions, duplicate
automation events, a doubled ATS hire webhook." The CAS-loser path (`reportLoser`)
re-reads the authoritative recorded status rather than defaulting, and now also covers
the case where the row went `expired` in the gap — a person who pressed Accept is never
told they declined. It is a deliberate guard so "a null offer never defaults an accepter
to 'declined'."

This is the ordering rule the technique names: everything downstream hangs off the
single claim, never off a status read.

## Necessary, not sufficient: the live entry refuses the advance

The token proves who is asking; the pipeline entry decides whether anything happens.

```ts
const advanced = actOnPipelineEntry(offer.entryId, "accept", undefined, { actor: "system" }, offer.workspaceId);
```

with the comment above it: *"actOnPipelineEntry now refuses to advance a TERMINAL entry,
so a stale offer link accepted after the candidate was rejected/closed elsewhere returns
null instead of resurrecting them to Hired."*

**The gate has tightened since first written, and the tightening is the lesson.** A
non-null `advanced` used to be the licence for every downstream effect. It now is not:
the code says a non-null return means "the entry moved a stage, NOT 'this candidate is
hired' — two different questions". `hired` is `advanced` *and* the entry was not already
on the terminal stage *and* the stage it landed on has the terminal role, resolved off
the workspace's own board. The recorded reasons are three real cases: a board may
compose a column after Offer (a background check, a contract signature), so accept lands
there and not on the hire; a recruiter may move the candidate back off Offer while the
link is live; and a second link accepted on an already-hired entry hits the "already
terminal, no-op" branch, which still returns the entry, so a per-token CAS cannot dedupe
it. Only `hired` drives the hire meter, the outcome record and the `candidate.hired`
webhook into the customer's HRIS. The accept itself still fires `offer.accepted` on the
CAS winner, "a different fact from the hire".

The decline path carries the mirror-image rule: tokens never expire and an entry can hold
several offer links, so `markEntryStatus` reports whether the entry actually transitioned,
and only then is the decline stamped on the timeline and mirrored to the ATS. Otherwise "a
Hired candidate's history can't grow a phantom `offer_declined`."

## The conflict is recorded, never swallowed

```ts
recordAutomationEvent(offer.entryId, "offer_accept_blocked", "accepted on a closed entry — not advanced to Hired", offer.workspaceId);
```

This is the technique's record-the-conflict rule realized exactly: a refused provisioning
attempt becomes a distinct, visible timeline event on the person's record so a recruiter
can act on it, rather than a silent drop.

## The gate keys off a role, not a column name

The second live instance of the same doctrine is the on-the-job rating endpoint
(`app/api/pipeline/outcomes/route.ts`), which must refuse a rating for someone who never
took the job:

```ts
if (!stageHasRole(entry.stage, "terminal", getPipelineAxis(ws).stages)) {
  return jsonRefusal("HIRE_RATING_NOT_HIRED", 409);
}
```

with the comment: *"enforced here against the LIVE stage rather than trusted from the
client, so a stale drawer cannot record an on-the-job outcome for a candidate who never
took the job."*

`stageHasRole` (`app/_lib/pipeline-stages.ts`) resolves against the workspace's own stage
axis by **role**, so a renamed or split hire column does not change the meaning of the
gate — the technique's label rule, implemented. `app/_lib/attention.ts` records the same
lesson from the other side: reading the literals `"Hired"` and `"Accepted"` broke two
badges, which is why the axis is resolved by role.

## Status is not stage, and the distinction is load-bearing

`app/_lib/pipeline-status.ts` is the single source of truth: `active` includes the
terminal *stage* `Hired` (a hired candidate keeps `status='active'`), while there are now
**four** distinct terminal statuses — `rejected`, `declined`, `rematched` and
`role_closed` (the role was filled or closed under a still-active candidate; the first
reading listed three). The module header records why collapsing candidate-decline into
company-reject corrupted funnel and offer-acceptance reporting. Any pre-boarding gate
written against this store must therefore check the *stage role*, not `status !==
'rejected'` — the latter passes for a `rematched` or `role_closed` candidate.

The vocabulary has no name for a hire the company rescinds; see the rescission technique
and its application for what that leaves reachable.

## Refusals travel as codes

`app/_lib/api-response.ts` splits `REFUSAL_ERRORS` (a deliberate 4xx business rule, not
logged) from `STORE_ERRORS` (an accident, logged, generic text sent). A refusal on a
public, token-authenticated candidate surface returns `{ error, code }` via
`jsonRefusal`, and the page resolves the code in the reader's language. The
`OfferResponseResult` type in `offer-finalize.ts` states the rule at the type: *"A refusal
carries its CODE, not a sentence: the candidate page localizes it."*

## What is not here

- **No pre-boarding surface exists in the live tree.** The gate is implemented for the
  acceptance and rating paths only; there is nothing after `Hired` for it to protect,
  by the design decision quoted at the top.
- **No post-acceptance ownership record.** Nothing assigns a named owner for the hire
  between acceptance and start date — the deviation the golden path names as structural.
- **No cancellation state for a downstream run**, because there is no downstream run.
  A team building one on this store must add the revoked-stays-revoked rule themselves;
  the existing gates give them the stage half and not the run half.
- **The removed module still leaves a debt the tree pays on purpose.** The erasure path
  in `app/_lib/db/pipeline.ts` keeps a scrub of the retired onboarding tables — the
  run label, the pre-boarding questionnaire answers and the e-signature signer identity
  — guarded by a table-exists check. Its comment: the removal "shipped WITHOUT a drop
  migration, so every database created before it still holds the rows", and an erasure
  request must still reach them; the block is to be deleted "only together with a
  migration that actually drops the tables". That is the questionnaire technique's
  "collect on the assumption that you will be deleting it", learned from the other end:
  removing the feature does not remove the data it collected.

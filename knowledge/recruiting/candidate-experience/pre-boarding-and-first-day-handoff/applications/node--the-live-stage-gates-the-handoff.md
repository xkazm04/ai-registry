---
layer: application
type: application
subject: pre-boarding-and-first-day-handoff
technique: the-live-stage-gates-the-handoff
stack: node
status: forged
verified_on: 2026-08-20
---

# The live stage gates the handoff — a Next.js/SQLite recruiting studio

This app is a hiring studio whose terminal state is `Hired`. Its own comment says so:
`app/_lib/offer-finalize.ts:118` — *"Hired is the TERMINAL state kp owns. What happens
after the hire — pre-boarding paperwork, equipment, day one — is deliberately out of
scope: this is a hiring studio, and the post-hire hand-off belongs to the HRIS the
webhook below feeds."* A pre-boarding feature did once live here and has since been
removed from the tree, so what this application documents is the half of the technique
that survives in live code: **the gate itself**, which the acceptance path implements
in full and which any downstream provisioning must consult.

## The acceptance is claimed once, and the claim is what the handoff hangs off

`respondToOffer` (`app/_lib/offer-finalize.ts:23`) reads the offer's status at `:36`
and then explicitly refuses to trust that read:

```ts
// The CAS in markOfferResponded is the ONLY claim that counts (idea-e80f60f1):
// the status read above is a snapshot, and two concurrent responses (candidate
// double-click; candidate + recruiter-on-behalf) both pass it.
const { offer: claimedOffer, claimed } = markOfferResponded(token, "accepted");
if (!claimed) return reportLoser(claimedOffer);
```
— `app/_lib/offer-finalize.ts:46–65`

The comment records the incident directly: before the compare-and-swap, *both* callers
ran the terminal side effects, producing "phantom Hired transitions, duplicate
automation events, a doubled ATS hire webhook." The CAS-loser path (`reportLoser`,
`:55–61`) re-reads the authoritative recorded status rather than defaulting — a
deliberate guard so "a null offer never defaults an accepter to 'declined'."

This is the ordering rule the technique names: everything downstream hangs off the
single claim, never off a status read.

## Necessary, not sufficient: the live entry refuses the advance

The token proves who is asking; the pipeline entry decides whether anything happens.

```ts
const hired = actOnPipelineEntry(offer.entryId, "accept", undefined, { actor: "system" }, offer.workspaceId);
```
— `app/_lib/offer-finalize.ts:71`, with the comment at `:67–70`: *"actOnPipelineEntry
now refuses to advance a TERMINAL entry, so a stale offer link accepted after the
candidate was rejected/closed elsewhere returns null instead of resurrecting them to
Hired."*

Every downstream effect is then guarded on `hired` being non-null, not on the
acceptance having succeeded: the timeline event (`:74`), the hire meter (`:87`), the
calibration outcome record (`:106`), and the export to the system of record (`:122`).
That last one is the seam to `portable-hiring-records`: `dispatchAtsEvent("candidate.hired", hired.id)`
is fire-and-forget and "can never break the accept."

The decline path carries the mirror-image rule at `app/_lib/offer-finalize.ts:132–142`:
tokens never expire and an entry can hold several offer links, so `markEntryStatus`
reports whether the entry actually transitioned, and only then is the decline stamped.
Otherwise "a Hired candidate's history can't grow a phantom `offer_declined`."

## The conflict is recorded, never swallowed

```ts
} else {
  recordAutomationEvent(offer.entryId, "offer_accept_blocked", "accepted on a closed entry — not advanced to Hired", offer.workspaceId);
}
```
— `app/_lib/offer-finalize.ts:99`

This is the technique's record-the-conflict rule realized exactly: a refused
provisioning attempt becomes a distinct, visible timeline event on the person's record
so a recruiter can act on it, rather than a silent drop.

## The gate keys off a role, not a column name

The second live instance of the same doctrine is the on-the-job rating endpoint, which
must refuse a rating for someone who never took the job:

```ts
if (!stageHasRole(entry.stage, "terminal", getPipelineAxis(ws).stages)) {
  return jsonRefusal("HIRE_RATING_NOT_HIRED", 409);
}
```
— `app/api/pipeline/outcomes/route.ts:106–110`, with the comment at `:102–105`:
*"enforced here against the LIVE stage rather than trusted from the client, so a stale
drawer cannot record an on-the-job outcome for a candidate who never took the job."*

`stageHasRole` (`app/_lib/pipeline-stages.ts:104`) resolves against the workspace's own
stage axis by **role**, so a renamed or split hire column does not change the meaning
of the gate — the technique's label rule, implemented. `app/_lib/attention.ts:59`
records the same lesson from the other side: reading the literals `"Hired"` and
`"Accepted"` broke two badges, which is why the axis is resolved by role.

## Status is not stage, and the distinction is load-bearing

`app/_lib/pipeline-status.ts:11–30` is the single source of truth: `active` includes
the terminal *stage* `Hired` (a hired candidate keeps `status='active'`), while
`rejected`, `declined` and `rematched` are three distinct terminal statuses. The module
header records why collapsing candidate-decline into company-reject corrupted funnel
and offer-acceptance reporting. Any pre-boarding gate written against this store must
therefore check the *stage role*, not `status !== 'rejected'` — the latter passes for a
`rematched` candidate who is being hired onto a different role entirely.

## Refusals travel as codes

`app/_lib/api-response.ts:167–193` splits `REFUSAL_ERRORS` (a deliberate 4xx business
rule, not logged) from `STORE_ERRORS` (an accident, logged, generic text sent). A
refusal on a public, token-authenticated candidate surface returns
`{ error, code }` via `jsonRefusal`, and the page resolves the code in the reader's
language. `app/_lib/offer-finalize.ts:19–21` states the rule at the type: *"A refusal
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

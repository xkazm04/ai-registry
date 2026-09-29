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
`app/_lib/offer-finalize.ts` just above the webhook dispatch: *"Hired is the TERMINAL
state kp owns. What happens after the hire — pre-boarding paperwork, equipment, day one —
is deliberately out of scope: this is a hiring studio, and the post-hire hand-off belongs
to the HRIS the webhook below feeds."* A pre-boarding feature did once live here and has
since been removed from the tree (`docs/architecture/localization.md` still records "the
onboarding presets went away with their module"), so what this application documents is
the half of the technique that survives in live code: **the gate itself**, which the
acceptance path implements in full and which any downstream provisioning must consult.

Re-read 2026-09-29 against the tree, whose acceptance path had grown since 2026-08-20:
every line number below is the current one, and the substantive change is the third
section — the gate now separates *the entry moved* from *the candidate is hired*.

## The acceptance is claimed once, per token

`respondToOffer` (`app/_lib/offer-finalize.ts:26`) lapses the offer if due, reads its
status, and then explicitly refuses to trust that read:

```ts
// The CAS in markOfferResponded is the ONLY claim that counts (idea-e80f60f1):
// the status read above is a snapshot, and two concurrent responses (candidate
// double-click; candidate + recruiter-on-behalf) both pass it.
const { offer: claimedOffer, claimed } = markOfferResponded(token, "accepted");
if (!claimed) return reportLoser(claimedOffer);
```
— `app/_lib/offer-finalize.ts:49–77`

The comment records the incident: before the compare-and-swap, *both* callers ran the
terminal side effects, producing "phantom Hired transitions, duplicate automation events,
a doubled ATS hire webhook." The CAS-loser path (`reportLoser`, `:66–73`) re-reads the
authoritative recorded status, and since 2026-09 it distinguishes losing to an answer from
losing to a lapse: a row that went `expired` between the lapse check and the claim is
reported as `OFFER_EXPIRED`, not as `declined`, so "a null offer never defaults an
accepter to 'declined'" now also holds for a candidate who pressed Accept on a lapsed one.

What the CAS does **not** do is dedupe the person: it is per *token*. The file states it
at `:101–103` — a re-extend mints a fresh token once the first is answered, so a second
link on an already-hired entry wins its own claim.

## Necessary, not sufficient: the live entry refuses the advance

The token proves who is asking; the pipeline entry decides whether anything happens.

```ts
const advanced = actOnPipelineEntry(offer.entryId, "accept", undefined, { actor: "system" }, offer.workspaceId);
```
— `app/_lib/offer-finalize.ts:88`, with the comment at `:85–87`: *"actOnPipelineEntry now
refuses to advance a TERMINAL entry, so a stale offer link accepted after the candidate
was rejected/closed elsewhere returns null instead of resurrecting them to Hired."*

## Moved is not hired — the crossing is the gate

Since the first version of this application the hire-bearing effects no longer hang off
"the entry advanced". `:104–106` reads the stage *before* the response and after it, by role:

```ts
const axis = getPipelineAxis(offer.workspaceId).stages;
const wasTerminal = !!before && stageHasRole(before.stage, "terminal", axis);
const hired = advanced && !wasTerminal && stageHasRole(advanced.stage, "terminal", axis) ? advanced : null;
```
— `app/_lib/offer-finalize.ts:104–106`

The comment at `:89–103` lists the three cases a bare "non-null" got wrong, and each is a
pre-boarding case: a workspace may compose a column **after** its offer step (a
background check, a contract signature), so accept lands *there* and not on the hire; a
recruiter may move a candidate back off Offer while the link is live; and a candidate
already on the terminal stage who accepts a second link hits `actOnPipelineEntry`'s
"already terminal, no-op" branch, which still returns the entry. Only `hired` drives the
hire meter (`:132`), the calibration outcome record (`:146`) and the
`candidate.hired` webhook into the system of record (`:157–166`), so all three fire once
per person, on the crossing.

Two events therefore exist where the golden path says one: `offer.accepted` is dispatched
on the CAS winner regardless of `hired` (`:173`, so a board with a stage after Offer still
hears the yes on the day it was said), and `candidate.hired` only on the crossing. That is
the seam this technique's gate has to sit on. Acceptance starts the *owner's*
accountability; provisioning waits for the crossing.

## The conflict is recorded, never swallowed

```ts
} else {
  recordAutomationEvent(offer.entryId, "offer_accept_blocked", "accepted on a closed entry — not advanced to Hired", offer.workspaceId);
}
```
— `app/_lib/offer-finalize.ts:110–113`

A refused provisioning attempt becomes a distinct, visible timeline event on the
person's record so a recruiter can act on it, rather than a silent drop. The condition is
`advanced`, not `hired`: an accept that moved the entry onto a post-offer column stamps
`offer_accepted`, and the "blocked" event is reserved for an entry that did not move.

## The gate keys off a role, not a column name

The on-the-job rating endpoint must refuse a rating for someone who never took the job:

```ts
if (!stageHasRole(entry.stage, "terminal", getPipelineAxis(ws).stages)) {
  return jsonRefusal("HIRE_RATING_NOT_HIRED", 409);
}
```
— `app/api/pipeline/outcomes/route.ts:127–132`, with the comment at `:122–126`: *"enforced
here against the LIVE stage rather than trusted from the client, so a stale drawer cannot
record an on-the-job outcome for a candidate who never took the job."*

`stageHasRole` (`app/_lib/pipeline-stages.ts:142`) resolves against the workspace's own
stage axis by **role**, and reads false for an off-axis id — a candidate standing on a
retired column is not "at the terminal stage" just because it used to be called Hired.
`app/_lib/attention.ts:70` records the same lesson from the other side: reading the
literals `"Hired"` and `"Accepted"` broke two badges. `closeEntriesByJobId`
(`app/_lib/db/pipeline.ts:880`) resolves the placed candidate's column the same way, and
its comment names the failure of the literal: a name comparison "withdraws the very
candidate the role was FILLED with — flipping a real hire to `role_closed`."

## Status is not stage, and the distinction is load-bearing

`app/_lib/pipeline-status.ts:11–48` is the single source of truth: `active` includes the
terminal *stage* `Hired` (a hired candidate keeps `status='active'`), while `rejected`,
`declined`, `rematched` and — new since the last read — `role_closed` are four distinct
terminal statuses. Any pre-boarding gate written against this store must therefore check
the *stage role*, not `status !== 'rejected'`: the latter passes for a `rematched`
candidate being hired onto a different role, and for a `role_closed` one.

`role_closed` is the ordinary way a hire is un-hired between acceptance and day one. Closing
a job marks every `active`, non-terminal entry for it `role_closed`
(`closeEntriesByJobId`, `app/_lib/db/pipeline.ts:880–937`). An entry that accepted onto a
post-offer column is not yet on the terminal stage, so on this reading it is withdrawn with
the rest — while its offer row still says `accepted`. Read from the code, not run: it is
the concrete instance of "the requisition was pulled" that the technique lists, and the
reason the acceptance token could not be the authority.

## Refusals travel as codes

`app/_lib/api-response.ts` splits `REFUSAL_ERRORS` (`:548`, a deliberate 4xx business
rule, not logged) from `STORE_ERRORS` (`:42`, an accident, logged, generic text sent).
A refusal on a public, token-authenticated candidate surface returns `{ error, code }`
via `jsonRefusal` (`:2073`), and the page resolves the code in the reader's language.
`offer-finalize.ts:19–21` states the rule at the type: *"A refusal carries its CODE, not a
sentence: the candidate page localizes it."*

## What is not here

- **No pre-boarding surface exists in the live tree.** The gate is implemented for the
  acceptance, rating and role-close paths; there is nothing after `Hired` for it to
  protect, by the design decision quoted at the top.
- **No post-acceptance ownership record.** Nothing assigns a named owner for the hire
  between acceptance and start date — the deviation the golden path names as structural.
- **No cancellation state for a downstream run**, because there is no downstream run.
  A team building one on this store must add the revoked-stays-revoked rule themselves;
  the existing gates give them the stage half and not the run half.
- **No story for the accepted-but-not-hired window.** The tree emits `offer.accepted`
  to the webhook but records no owner, task or message for a person parked on a
  post-offer column, which is exactly where a background check and the renege risk live.

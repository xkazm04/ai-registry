---
layer: application
type: application
subject: candidate-status-transparency
technique: candidate-safe-status-projection
stack: node
status: forged
verified_on: 2026-09-28
verified_against: node@24
applied: simulation
ab_verdict: better
---

# The candidate-safe projection and its token-gated route (Node / Next route handlers)

The boundary is a pure mapping module (`app/_lib/application-status.ts`) and
the public route that is the only thing allowed to emit it
(`app/api/status/[token]/route.ts`). Since 2026-08-30 three sub-projections have
joined it, each a closed type built by construction:
`app/_lib/candidate-next-action.ts`, `app/_lib/interview-letter-types.ts` and a
boolean for the interview recording. Re-read at kp `6f3fca44d`.

## The projection is a closed enum, not a filtered record

`application-status.ts:8-15` declares `CandidateStatus` as seven literals —
`received | under_review | interview | offer | hired | not_selected | withdrawn`
— and the module header states the rule the standard asks for verbatim: the
internal `(entryStatus, stage)` pair "is projected here into a small, friendly
enum … NO internal ids, names, or scores ever cross to the candidate" (`:1-6`).
Construction, not omission: `candidateStatusFor` (`:83`) takes the internal
values as arguments and *returns a literal*, so an internal record growing a
column cannot leak through it.

The module is deliberately dependency-free — the stage-role strings are inlined
rather than imported (`:21-23`, `:54-55`) "so this module stays dependency-free
and the mapping is exercisable by bare `node --test`". A boundary rule that can
only be tested by booting the app is a boundary rule that stops being tested.

## The route emits the projection and seven other facts

`route.ts:52-78` returns `{ status, jobTitle, company, updatedAt,
relayConfigured, hasInterviewRecording, letter, nextAction }`. The three
newcomers each arrive with their refusals written at the call site:

- `hasInterviewRecording` is "a BOOLEAN and nothing else … it must NOT learn a
  file name, a size, an attempt count or a date" (`:61-64`).
- `letter` is "the contract's CandidateLetterView and NOTHING else … No draft,
  no reviewer, no ids, no delivery detail" (`:66-70`). The type is four keys
  (`interview-letter-types.ts:64-72`).
- `nextAction` is "THREE keys: kind, sentAt, expiresAt … Never the capability
  itself" (`:72-76`).

The key sets are pinned by tests (`status-letter.test.ts`,
`status-recording.test.ts`, `status-resend.test.ts`). The route header's
refusal list still reads "Never the internal entry id, candidate name, score,
archetype, or reasoning" (`:29-32`), but the sentence before it (the friendly
status, the role title and company, and when it last changed) now describes
five of the eight keys. That is a stale comment, not a leak.

`relayConfigured` (`:57-60`) is a capability bit, not a secret, that lets the
page suppress "watch your email" copy when no delivery relay exists — the
delivery-truth sibling's rule reaching across into this surface.

## The action is projected, its key is not

`candidate-next-action.ts:9-14` is the decision rule "project the action, never
its key", written before the registry stated it and citing the registry's
"assume the payload is public" rule as its reason: "a forwarded status link
that carried the offer token would let whoever holds it accept or decline the
offer. The link itself stays where it was issued, the inbox". `kind` is one of
`answer_offer | book_interview | take_interview` (`:19`), the object is built
"key by key, so no field of an input row can ride through" (`:79-80`), and it
is null unless the entry is live and not anonymised (`:82`).

## Stage ROLE, and the incident that forced it

`STAGE_TO_STATUS` (`:29-35`) keys on the shipped stage names and is marked "Only
correct for a workspace on the SHIPPED axis". `STAGE_ROLE_TO_STATUS` (`:56-69`)
keys on role and has grown two roles since the first reading: `homework`
(`:59-63`) and `scoring` (`:65`), both to `under_review`. The incident comment
is unchanged: "A renamed column falls through to `received`, which would tell a
candidate at the offer stage that we have merely received their CV" (`:25-27`).
The route always resolves the role (`route.ts:53`).

`custom` maps to `under_review` (`:68`), for the reason at `:37-40`: `received`
"would understate where they actually stand."

## Terminal causes collapse — still the deviation, now conceded in the tree

`candidateStatusFor` (`:83-88`) maps `rejected`, `rematched` **and**
`role_closed` to `not_selected`, and `declined` (candidate-side) to
`withdrawn`, with the reasoning at `:74-76` that a closed role "is no longer
open to them, which is honest without implying a merit rejection."

The enum is right. The copy is not. `StatusClient.tsx:254-265` renders one
`notSelectedTitle`/`notSelectedBody` pair for every cause, and the body reads
"The team has decided to move forward with other candidates for this role." For
a closed role that is an evaluation nobody made, and for a re-match it is
false. kp's own feedback-letter policy now says so, in a different file:
"`role_closed` and `rematched` read as "not selected" on the status page, but
nobody decided about THIS candidate — the role closed under them, or they were
moved to a better-fit role" (`interview-letter-policy.ts:21-23`). The letter
path acts on that. The status page does not. The standard stays as written.

## Tenancy is derived from the record, because there is no session

`route.ts:44-50` resolves the workspace from the entry the token names: "Without
it this read fell through to DEFAULT_WORKSPACE_ID, so a candidate of any other
team got a 404 on their own status link."

Rate limiting (`:15-26`, checked at `:37-39`, before the lookup, so a throttle
reveals nothing about the token) now answers the one registered
`TOO_MANY_REQUESTS` code, and `safeJsonError` (`:79-82`) exists because "Raw
err.message would surface SQLite internals on a public token route". These are
the software-engineering half of the boundary — general practice, correctly
applied.

## The address is the key: four routes out, walked

- **Search indexes: closed.** `app/robots.ts:14-25` disallows `/status/` and
  `/api/`, beside every other tokenized surface.
- **Analytics: closed for the send, open for the load.** The analytics script
  is mounted in the root layout, so it loads on the status page too
  (`app/layout.tsx:213`). But `/status/` is in `TOKENIZED_PATH_PREFIXES`
  (`app/_lib/analytics/track.ts:44-55`), which feeds both the script's exclusion
  list and the custom-event guard, so no pageview carrying the address is sent
  from there. The reason is written down: the automatic pageview posts
  `location.href`, "which on those pages IS the capability credential"
  (`app/_lib/analytics/plausible.tsx`). With the analytics domain unset, nothing
  loads at all. A third-party script that can read the address still runs on
  the page, and the send is suppressed by configuration rather than prevented.
- **Referrer: closed cross-origin.** The only policy is the global
  `Referrer-Policy: strict-origin-when-cross-origin` (`next.config.ts:27`), so a
  cross-origin request gets the origin only. Same-origin requests carry the full
  address into kp's own logs. No status-specific `no-referrer` or
  `Cache-Control: no-store` is set.
- **Revocation: open.** `application_status_links` holds one permanent token per
  application with no expiry column and no rotation
  (`application-status-store.ts:22-29`, the `UNIQUE` on `entry_id` returning the
  same link to a re-applicant). A leaked link can only be cut off by removing
  the application.

**The walk, A against B.** A is the technique as it stood: "assume the payload
is public", with the handling of the address itself left to a
software-engineering standard. A certifies all four routes, because it asks
nothing about them. B is the added decision rule (the page whose address is
the key loads no third-party script, sends no referrer, stays out of indexes,
and its link can be revoked). B passes two routes, finds one half open (a
third-party script still loads where the address is readable) and one open
(no revocation). kp had already closed the first two on its own, which is the
convergence this rule rests on beside the web guidance. **Falsifier:** a leaked
status link in kp that can be cut off without deleting the application; none
exists. **Return for code:** a per-application reissue that retires the old
token, and no analytics script mounted on the tokenized layouts rather than
an excluded send, when the tree is quiet.

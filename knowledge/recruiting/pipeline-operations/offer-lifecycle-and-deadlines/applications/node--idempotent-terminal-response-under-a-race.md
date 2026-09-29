---
layer: application
type: application
subject: offer-lifecycle-and-deadlines
technique: idempotent-terminal-response-under-a-race
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# Lapse first, CAS second, side effects only for the claimer

`app/_lib/offer-finalize.ts:26` — `respondToOffer(token, response)` — is the single
funnel for the candidate's terminal act in this app. Its header states the contract:
"the offer DECISION was the recruiter's (extend); here we record what the candidate
decided. Idempotent: a second response is a no-op that just returns the recorded
status."

The function reads as the technique in order.

## 1. Lapse before accept

The first statement is `expireOfferIfDue(token)` (`offer-finalize.ts:29`),
with the rule attached: "an offer past its deadline must not be acceptable even if
the candidate is holding a stale tab — the deadline is the lever."

`expireOfferIfDue` (`app/_lib/offers-store.ts:223`) is itself a guarded write —
`UPDATE offers SET status = 'expired' WHERE token = ? AND status = 'extended'
RETURNING *` — so "only the still-open row flips; an already accepted/declined offer
is never touched", and it records an `offer_expired` automation event so "a dead
offer leaves an audit trail, surfaces on the candidate timeline, and doesn't read as
'still pending' in accept-rate/funnel analytics."

The same lazy lapse runs in the read path: `offerView(token)`
(`app/_lib/offer-finalize.ts:205`) opens with `expireOfferIfDue` too, "so the page
renders 'expired' the moment it's due rather than waiting on the heartbeat sweep."
The global sweep `lapseExpiredOffers` still exists on the heartbeat, but it is the
janitor, not the enforcer — which is exactly what keeps the published deadline and
the enforced deadline the same instant for every offer.

## 2. Expired and not-found are answered differently

`OfferResponseResult`'s refusal branch (`:24`) keeps `expired` as a field beside the
error code, with the reason spelled out: the route needs it "to choose 410-vs-404,
which is a different question from what to say." So:

- unknown token → `OFFER_NOT_FOUND`, HTTP **404**;
- known but lapsed → `OFFER_EXPIRED`, HTTP **410**.

`app/api/offer/[token]/route.ts:61` is the one line that makes the distinction
observable — `jsonRefusal(result.code, result.expired ? 410 : 404)` — "distinct from
404 not-found so the page can show a definite 'expired' state, not a generic error."
The refusal carries a stable **code**, not a sentence, which the candidate page
localizes through `REFUSAL_ERRORS` in `api-response.ts`.

## 3. The compare-and-swap is the only claim that counts

The status check above it is explicitly labelled a snapshot, not a decision. The
real claim is `markOfferResponded(token, status)`
(`app/_lib/offers-store.ts:392`), one statement:

```
UPDATE offers SET status = ?, responded_at = ? WHERE token = ? AND status = 'extended' RETURNING *
```

It returns `{ offer, claimed }`, and `claimed` is true only for the writer whose
write flipped the row. The comment at `app/_lib/offer-finalize.ts:49` names the
incident this was written for: the result "was ignored and BOTH callers ran the
terminal side effects — phantom Hired transitions, duplicate automation events, a
doubled ATS hire webhook. Now the loser reports the recorded outcome and touches
nothing."

`reportLoser` (`:66`) is shared by the accept and decline paths and answers from the
**authoritative recorded status**, re-reading the offer if the CAS could not return
it, "so a null offer never defaults an accepter to 'declined'." The loser gets
`ok: true` with `alreadyResponded: true` — a success response, not an error, which
is the third rule of the technique implemented literally.

It also encodes a case the first version of this code got wrong: losing the CAS does
not mean someone answered. The row can have gone `expired` between the lapse check
and the claim (the heartbeat sweep, or another tab's GET lazily lapsing it), and
reporting that as `declined` told a candidate who pressed Accept that they had turned
the job down. Anything that is not a recorded accept or decline now returns the same
refusal the non-racing path does (`OFFER_EXPIRED` / `OFFER_NOT_FOUND`).

## 4. Every consequence hangs off the winning branch

Inside `if (claimed)`, the accept path runs its side effects in a chain where each
one is conditional and each one is best-effort:

- `actOnPipelineEntry(offer.entryId, "accept", …, { actor: "system" })` — actor
  `system` because "the transition fires on the candidate's response, not a
  recruiter click." It "refuses to advance a TERMINAL entry, so a stale offer link
  accepted after the candidate was rejected/closed elsewhere returns null instead of
  resurrecting them to Hired."
- The conflict is not swallowed. When the entry did not transition, the code records
  `offer_accept_blocked` with the detail "accepted on a closed entry — not advanced
  to Hired" — a visible event a recruiter can act on rather than a silent
  drop.
- **The hire is a second claim, and the CAS does not make it.** The token CAS is
  per token, and "a re-extend mints a fresh token once the first is answered", so a
  second link accepted on an entry already on the terminal stage would pass its own
  CAS and hit the entry action's "already terminal, no-op" branch, which still returns
  the entry — metering and mirroring the hire twice. The code therefore derives
  `hired` only when the entry *crossed* onto the terminal stage on this call
  (`!wasTerminal` and the new stage has the `terminal` role, resolved off the
  workspace's own board, never by stage name), and hangs the hire-bearing effects off
  that. A workspace that composes a column after Offer accepts onto that column and is
  not hired at all; the response itself is emitted separately as `offer.accepted` on
  the CAS winner, the hire as `candidate.hired` on the crossing.
- `recordPipelineOutcome` and `dispatchAtsEvent("candidate.hired", hired.id)` both
  hang off `hired` and are fire-and-forget: "calibration must never affect the
  candidate's accept", and the ATS mirror "can never break the accept
  (dispatchAtsEvent swallows its own errors)."

The decline path applies the same discipline one field over. `markEntryStatus` is
conditional and reports whether the entry actually transitioned, because "tokens
never expire and an entry can hold several offer links, so a decline on a
STALE/duplicate link must not demote a candidate who has since been Hired"
— and the timeline event is stamped only when it did, so "a Hired
candidate's history can't grow a phantom `offer_declined`."

## 5. The meter is debited, never gated

`recordMeterUsage("hires", 1, …, { kind: "hire", ref: offer.id })` sits inside the
`hired` branch, wrapped in `try/catch`, with the strongest comment in the file
(`app/_lib/offer-finalize.ts:125`). The debit now names its cause and the offer it
refers to, so the counter has a journal to be audited against:

> DEBITED, NEVER GATED. There is no meterGate before it and there must not be: this
> runs on the CANDIDATE's accept, and a person accepting a job must never fail
> because the recruiter's org is over its allowance.

The plan catalog states the same rule from the commercial side.
`app/_lib/billing/plans.ts:28` makes the asymmetry explicit and calls it
load-bearing: `job_posts` "is a RECRUITER action, so it gates (402)", while `hires`
"is a CANDIDATE action. It is DEBITED BUT NEVER GATED… Overage is billed, never
blocked. See offer-finalize.ts." Two modules, one rule, each pointing at the other.

The metering fault handler is the same posture: a failed debit logs
`hired … but the hire meter did not record` and the acceptance stands, "a metering
fault must not turn a successful acceptance into an error."

Exactly-once is inherited rather than re-implemented: the meter comment notes it
fires once per hire "because markOfferResponded above is a DB compare-and-swap: only
the first responder gets `claimed`, so this fires exactly once per hire even if the
candidate double-clicks or the link is opened twice."

## Where this deployment falls short of the standard

- **The side effects have no identity of their own.** Exactly-once rests entirely on
  the CAS winner being the sole caller. A retried `dispatchAtsEvent` or automation
  write is not keyed on `(offer, transition)`, so the guarantee holds within a
  process but not against a job runner that replays.
- **A conflicting terminal action does not fail loudly.** `reportLoser` returns
  `ok: true` with whatever status is recorded, so a candidate who clicks accept on
  an offer a recruiter already recorded as declined is shown the *declined* card as
  though it were their own answer — the technique asks for a named conflict here,
  not a silent substitution.
- **No grace window, and the boundary is exclusive of the candidate.** `isOfferExpired`
  uses `nowMs >= ms`, so a request arriving *at* the deadline instant is already
  expired, and a submit that begins before it and lands milliseconds after is refused.
  The countdown technique asks for a boundary inclusive of the candidate, with any
  grace encoded once beside the check; this deployment has neither. (This application
  previously described the boundary as inclusive of the deadline instant; the code
  never did.)
- **The response vocabulary is binary.** `route.ts` (`OFFER_RESPONSE_INVALID`, 400) accepts only `"accept"` or
  `"decline"`; there is no counter, no negotiating state and no "ask for more time"
  path anywhere in the offer surface, so every negotiation this app sees must be
  recorded as one of the two terminal answers or handled entirely out of band.

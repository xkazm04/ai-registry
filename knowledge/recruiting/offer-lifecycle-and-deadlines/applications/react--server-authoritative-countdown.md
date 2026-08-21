---
layer: application
type: application
subject: offer-lifecycle-and-deadlines
technique: server-authoritative-countdown
stack: react
status: forged
---

# A countdown the client is not allowed to compute

`app/offer/[token]/OfferClient.tsx` is the public, token-gated page where the
candidate accepts or declines. It is a `"use client"` component that renders a
"hours left" figure — and it never calculates one.

## The number arrives as a value, not as a deadline

The view type declares the rule on the field itself
(`app/offer/[token]/OfferClient.tsx:21`):

> whole-hours-left computed on the SERVER at GET time so the countdown can't
> disagree with server-enforced expiry on a skewed/back-dated client clock. Null when
> the offer carries no valid deadline.

The producer is `offerView` (`app/_lib/offer-finalize.ts:155`), which returns
`hoursRemaining: offerHoursRemaining(offer.expiresAt)` — computed "on the SERVER
clock … so the candidate's 'X hours left' copy can't drift from server-enforced
expiry under client clock skew" (`:171`). Crucially it is the *same module* that
enforces the deadline: `offerHoursRemaining` and `isOfferExpired` are neighbours in
`app/_lib/offer-policy.ts`, reading the same stored `expires_at` under the same
clock, and `offerView` calls `expireOfferIfDue` before rendering anything — so a
late page load returns the expired state rather than a button that will refuse.

`offerHoursRemaining` (`app/_lib/offer-policy.ts:83`) is
`Math.max(0, Math.ceil((ms - nowMs) / HOUR))`, and the comment states why the
rounding direction is a correctness property, not a taste call: it "rounds UP so '0
hours left' only ever means actually expired (isOfferExpired true)." Round-down
would let the page display zero on a perfectly acceptable offer; round-up makes the
display and the enforcement agree by construction.

## The render is a guard, not a fallback

The countdown block (`OfferClient.tsx:289`) opens with
`if (hrs === null || !offer.expiresAt) return null;` — an offer with no valid
deadline gets **no timer at all**, rather than a placeholder or a zero. It does not
lapse, so inventing a countdown for it would be a threat the system will not carry
out.

When there is a deadline, the page renders the absolute date beside the figure —
`new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" })` —
and the units are whole hours, never seconds. Inside the final 48 hours the line
switches from `text-steel` to `text-coral`; the urgency is carried by colour and by
the number the server sent, not by an animated tick. The value is rendered once per
load and re-read on any refetch (`load`, and `reconcile` after an ambiguous POST)
rather than decremented locally, so there is no client timer to drift at all.

## The terminal actions, and which one is guarded

`respond(response)` (`:136`) POSTs to `/api/offer/[token]` and maps the server's
answer onto the card. **Accept is direct**: one button, `data-sim-click="offer-accept"`,
straight to the POST.

**Decline is behind a deliberate inline confirm** (`:49`): "Decline is terminal +
irreversible (offer-finalize markEntryStatus 'declined'), so it routes through a
deliberate inline confirm step before the POST fires — a single misclick must not
permanently close the offer." The confirm is an in-page `role="alertdialog"` with
its own title and description (`:310`), not a native prompt a reflex can dismiss.

And focus moves to the safe option, not the destructive one (`:56`):

```
useEffect(() => { if (confirmingDecline) goBackRef.current?.focus(); }, [confirmingDecline]);
```

— "so a keyboard user lands on 'Go back' rather than the destructive default." The
mirror rule applies after the irreversible success: `acceptedCardRef` takes focus
when `result === "accepted"`, paired with `role="status"` / `aria-live="polite"` on
the card, "so a screen-reader user hears the offer was accepted and their cursor
lands on that confirmation rather than silence after their most consequential
action" (`:62`). All three terminal cards — accepted, declined, expired — are
announced the same way.

## Three failure modes, three different answers

The page refuses to collapse distinct facts into one error, which is the same
discipline the API applies with 410-vs-404:

- **404 → `notFound`** (`:41`): "a mistyped / revoked / non-existent token is a DEAD
  link, not a transient blip — surfaced as its own 'invalid link, contact the team'
  card rather than the generic retryable loadFailed."
- **410 on POST → the expired card** (`:147`): "swap to the definite expired card
  rather than an inline retry error" — a dead end the candidate cannot retry past,
  not a fault they should keep clicking at.
- **A transient GET failure** replaces the card with a retry control; a transient
  POST failure surfaces as an inline banner that *preserves* the card and re-enables
  the buttons (`:37`), "so a transient blip on accept/decline isn't a dead end."

`reconcile()` (`:121`) closes the ambiguous-POST hole: after a dropped connection it
re-reads the authoritative status and flips the card if the server already recorded
the response, "so a candidate on a flaky phone isn't left unsure whether their
accept/decline registered." That is the client half of the idempotent terminal
response — the server's CAS decides, and the page asks it rather than guessing.

## The letter cannot contradict this page

The countdown is only trustworthy if the emailed letter names the same date.
`dispatchOffer` (`app/_lib/comms-dispatch.ts:343`) is where that is enforced, and
its doc comment at `:336` states the rule: "the terms are injected at DISPATCH, not
draft: the deadline is a per-offer lever the recruiter sets at approval time
(ttlDays → offers.expires_at), so the letter draft cannot know it." The deadline and
start-date lines are appended deterministically from the offer row at send time, so
"EVERY sent letter states them — LLM-drafted and deterministic-template letters
alike — and can never contradict the countdown on the candidate's offer page." The
letter body is the model's; the terms are not.

## The figure on the page is never fabricated

Two guards keep the money on this page honest. The compensation block renders the
offer's **own** stored currency (`OfferClient.tsx:240`): "never fabricate CZK for a
non-Czech offer. When the currency is genuinely unknown, omit the unit rather than
asserting a wrong one."

Upstream, the recruiter-facing review card applies the same posture to an unpriced
draft. `app/features/hiring/decisions/decisionsAiReviewCardLogic.ts:37` documents
the fail-safe and the bug it replaced: when no market band is configured and the
posting carries none, the drafter "deliberately proposes NO figure: recommended /
salaryMin / salaryMax come back null together, the candidate letter names no number,
and the draft is routed to the human offer_review gate precisely so a recruiter sets
the real one." The card "used to render those nulls through
`Number(x ?? 0).toLocaleString()` — a literal '0' headline and a 0–0 band meter —
i.e. it fabricated the one number nobody was willing to invent, on exactly the drafts
that exist because the number is unknown." The repair is two booleans, `unpriced`
and `hasBand` (`:46`), and no figure and no meter unless the payload genuinely
carries them. The generator side matches it: `draft_offer` in
`pipeline/jobfit/automation.py` sets `lo = hi = recommended = None` and instructs the
letter model to "Do NOT state, estimate, imply, or hint at any compensation figure,
band, or range — none has been" set.

## Where this deployment falls short of the standard

- **No re-fetch on focus or reconnect.** The hours figure is fetched once per load
  and on the reconcile path only. A page left open overnight keeps showing a stale
  "36 hours left" until the candidate acts — at which point the server refuses with
  a 410 and the page swaps to the expired card. The correction is honest but late.
- **The deadline carries no named timezone.** Both the page and
  `formatOfferDeadline` format with `dateStyle`/`timeStyle` and no `timeZoneName`,
  so the absolute date renders in the *device's* zone with nothing saying which one
  — the one place the client clock still leaks into the display.
- **48 hours is hard-coded in the UI accent** (`hrs <= 48`) rather than derived from
  `OFFER_REMINDER_LEAD_MS`, so a deployment that retunes the reminder lead gets a
  colour change that no longer lines up with when the candidate was nudged.
- **No third button.** Accept and decline are the only affordances; a candidate who
  wants to counter, or simply ask for a week, has no route on this page and no
  stated non-punitive alternative to clicking decline.

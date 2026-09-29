---
layer: application
type: application
subject: offer-lifecycle-and-deadlines
technique: server-authoritative-countdown
stack: react
status: forged
verified_on: 2026-09-29
verified_against: react@19
---

# A countdown the client is not allowed to compute

`app/offer/[token]/OfferClient.tsx` is the public, token-gated page where the
candidate accepts or declines. It is a `"use client"` component that holds the
page's state (load, revalidation, the in-flight response) and hands it to the
composition-kit markup in `app/offer/[token]/kit/`, which replaced the component's own
markup after this application was first written. It shows a "hours left" figure —
and it never calculates one.

## The number arrives as a value, not as a deadline

The view type declares the rule on the field itself (`OfferClient.tsx`, the
`hoursRemaining` field):

> whole-hours-left computed on the SERVER at GET time so the countdown can't
> disagree with server-enforced expiry on a skewed/back-dated client clock. Null when
> the offer carries no valid deadline.

The producer is `offerView` (`app/_lib/offer-finalize.ts:205`), which returns
`hoursRemaining` and `minutesRemaining` from one `Date.now()` read — computed "on the
SERVER clock … so the candidate's 'X hours left' copy can't drift from server-enforced
expiry under client clock skew". Crucially it is the *same module* that
enforces the deadline: `offerHoursRemaining` and `isOfferExpired` are neighbours in
`app/_lib/offer-policy.ts`, reading the same stored `expires_at` under the same
clock, and `offerView` calls `expireOfferIfDue` before rendering anything — so a
late page load returns the expired state rather than a button that will refuse.

`offerHoursRemaining` (`app/_lib/offer-policy.ts:106`) is
`Math.max(0, Math.ceil((ms - nowMs) / HOUR))`, and the comment states why the
rounding direction is a correctness property, not a taste call: it "rounds UP so '0
hours left' only ever means actually expired (isOfferExpired true)." Round-down
would let the page display zero on a perfectly acceptable offer; round-up makes the
display and the enforcement agree by construction. Inside the final hour the page
switches to whole minutes (`offerMinutesRemaining`, `:115`, same round-up) so an open
offer never reads "1 hour left" for a minute that is about to end it.

## The render is a guard, not a fallback

The countdown decision lives in `offerKitDeadline` (`kit/offerKitModel.ts`) and
returns `null` unless the server sent an hours figure **and** a deadline — an offer
with no valid deadline gets **no timer at all**, rather than a placeholder or a zero.
It does not lapse, so inventing a countdown for it would be a threat the system will
not carry out.

When there is a deadline, the page renders the absolute date beside the figure, and
the date **names its zone**: `formatOfferDeadline` (`offer-deadline.ts`) formats in
the zone the server projected (`offer.timeZone`, the company's), falls back to a
named `UTC` for an unusable one, and spells the parts out because `dateStyle` may not
be combined with `timeZoneName`. Its header records the bug it closed: one lapse
instant read as three different calendar days in Prague, New York and Sydney. Units
are whole hours, then minutes in the last hour, never seconds. Inside the final 48
hours the line takes the "needs attention" accent; the urgency is carried by that
and by the number the server sent, not by an animated tick. The value is never
decremented locally, so there is no client timer to drift at all.

It is also no longer computed only once. The page revalidates every 60 seconds and
whenever the tab regains focus or visibility (`refresh` in `OfferClient.tsx`), and
stops once the outcome is terminal or the link is gone. The comment records the
failure it fixed — "12 hours left" sitting on screen over an offer the server had
already lapsed — and the throttle arithmetic: the GET allows 60/min per token and
client, so a poll a minute plus focus churn sits an order of magnitude under it. A
failed refresh never replaces a rendered offer; only a 404 does.

## The terminal actions, and which one is guarded

`respond(response)` in `OfferClient.tsx` POSTs to `/api/offer/[token]` and maps the
server's answer onto the card. **Accept is direct**: one button, `data-sim-click="offer-accept"`,
straight to the POST.

**Decline is behind a deliberate inline confirm.** Declining is terminal, so the
confirm step (`OfferKitDeclineConfirm` in `kit/OfferKitDecision.tsx`) is an in-page
`role="alertdialog"` with `aria-modal`, its own title and description, on the shared
`useDialogA11y` hook: focus moves in, Tab is trapped, Escape cancels (never mid-write),
focus returns to the trigger. The safe option is placed first in the DOM so the hook
lands a keyboard user on "Go back" rather than the destructive default — the same
rule as before, now carried by element order instead of an explicit `focus()` call.
The mirror rule applies after the irreversible success: the accepted card takes focus
(`acceptedCardRef`, `OfferClient.tsx`), paired with `role="status"` /
`aria-live="polite"`, so a screen-reader user hears the acceptance rather than
silence after their most consequential action. All three terminal cards — accepted,
declined, expired — are announced the same way.

## Three failure modes, three different answers

The page refuses to collapse distinct facts into one error, which is the same
discipline the API applies with 410-vs-404:

- **404 → `notFound`** (`OfferClient.tsx`): "a mistyped / revoked / non-existent token is a DEAD
  link, not a transient blip — surfaced as its own 'invalid link, contact the team'
  card rather than the generic retryable loadFailed."
- **410 on POST → the expired card**: "swap to the definite expired card
  rather than an inline retry error" — a dead end the candidate cannot retry past,
  not a fault they should keep clicking at.
- **A transient GET failure** replaces the card with a retry control; a transient
  POST failure surfaces as an inline banner that *preserves* the card and re-enables
  the buttons, "so a transient blip on accept/decline isn't a dead end."

`refresh()` closes the ambiguous-POST hole (it replaced the separate `reconcile`, and
now serves the revalidation too): after a dropped connection it
re-reads the authoritative status and flips the card if the server already recorded
the response, "so a candidate on a flaky phone isn't left unsure whether their
accept/decline registered." That is the client half of the idempotent terminal
response — the server's CAS decides, and the page asks it rather than guessing.

## The letter cannot contradict this page

The countdown is only trustworthy if the emailed letter names the same date.
`dispatchOffer` (`app/_lib/comms-dispatch.ts:699`) is where that is enforced, and
its doc comment at `:692` states the rule: "the terms are injected at DISPATCH, not
draft: the deadline is a per-offer lever the recruiter sets at approval time
(ttlDays → offers.expires_at), so the letter draft cannot know it." The deadline and
start-date lines are appended deterministically from the offer row at send time, so
"EVERY sent letter states them — LLM-drafted and deterministic-template letters
alike — and can never contradict the countdown on the candidate's offer page." The
letter body is the model's; the terms are not.

## The figure on the page is never fabricated

Two guards keep the money on this page honest. The compensation block renders the
offer's **own** stored currency (`kit/OfferKitView.tsx`, the compensation figure): "never fabricate CZK for a
non-Czech offer. When the currency is genuinely unknown, omit the unit rather than
asserting a wrong one."

Upstream, the recruiter-facing review card applies the same posture to an unpriced
draft. `app/features/hiring/decisions/decisionsAiReviewCardLogic.ts` documents
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

- **The expired card says less than the technique asks.** It reads "the deadline for a
  reply has passed; contact the hiring team" (`expiredBody`), naming neither the role
  nor the date it lapsed. The open GET, by contrast, returns the full view — candidate
  label and figure included — for an expired offer to whoever holds the token. The
  token is the bearer capability, so this is not an enumeration path, but the page
  says less than it knows and the API says more than the page shows.
- **The public GET answers an expired offer with 200 and `status: "expired"`,** not a
  distinct gone status; only the POST returns 410. The page tells the states apart,
  but a monitor watching the GET cannot.
- **48 hours is hard-coded in the UI accent** (`urgent = hrs <= 48` in
  `kit/offerKitModel.ts`) rather than derived from
  `OFFER_REMINDER_LEAD_MS`, so a deployment that retunes the reminder lead gets a
  colour change that no longer lines up with when the candidate was nudged.
- **No third button.** Accept and decline are the only affordances; a candidate who
  wants to counter, or simply ask for a week, has no route on this page and no
  stated non-punitive alternative to clicking decline.

---
layer: application
type: application
subject: candidate-status-transparency
technique: candidate-legible-timeline
stack: react
status: forged
verified_on: 2026-09-28
verified_against: react@19
applied: simulation
ab_verdict: better
---

# A five-step spine, a terminal card, and a "waiting on you" card (React)

The public status page `app/status/[token]/StatusClient.tsx` renders the
timeline from the projection in `app/_lib/application-status.ts`. The
pending-action card is `app/status/[token]/StatusNextActionCard.tsx`, which
landed on 2026-09-23. Read at kp `6f3fca44d`.

## What matches the technique

- **A fixed spine of five.** `CANDIDATE_TIMELINE` is `received, under_review,
  interview, offer, hired` (`application-status.ts:19`), the same for every
  role and workspace. Eight internal stage roles collapse onto it
  (`:56-69`). A board with more stages than the spine collapses, as rule 1
  and the collapse decision rule ask.
- **Three step states and a marked current step.** Each step is reached, current
  or not yet reached (`StatusClient.tsx:268-295`), and only the current step
  carries `aria-current="step"` (`:276`, added 2026-09-06), so the position is
  announced by a screen reader and not only drawn in colour. The current step
  alone carries a sentence of explanation (`:290`).
- **No half-lit trail.** The comment at `application-status.ts:17-18` states
  the choice: "terminal off-path states (not_selected / withdrawn) render on
  their own, not as a trail step". Both render a terminal card in place of the
  trail (`StatusClient.tsx:254-265`), consistently, and `hired` lights the
  whole spine. That is the technique's "replace the trail with a terminal
  card" resolution, applied to every off-path terminal.
- **A stated last-updated moment, derived on read.** "Updated {date}" comes
  from the entry's last stage change (`:302-307`, fed by `route.ts:56`).
- **No forecast date anywhere.** The only dates on the page are recorded
  events and deadlines the organisation has already set: an action's
  "Sent to you on" and "Open until" (`StatusNextActionCard.tsx:75-78`), and
  the recording's fixed retention periods.
- **The channel is not promised where none exists.** The interview and offer
  sentences switch to "the hiring team will reach out" when no relay is
  configured, and the pending-action card drops its resend button (its
  header, `StatusNextActionCard.tsx:20-22`).

## The pending action: the technique's newest condition, already built

The timeline's decision rule used to say "with the action available there".
kp built the opposite on purpose, and the technique now says what kp says. The
card names the kind of action, when it was sent and when it closes. It says
"The link is in the email we sent you. For your safety it is never shown on
this page." and offers "Send it to my email again" (`StatusNextActionCard.tsx:10-18`
for the reasoning). The reason is the projection's premise: "the status link
is forwardable, and an offer or booking token here would let whoever holds it
act for the candidate."

Two details are worth copying. The resend answer does not reveal whether an
address is on file ("If we have an email address for you, the link is on its
way to it again"). And a failed resend is shown, never silent: "a candidate
told nothing would wait for an email" (`:93-97`).

## Deviations

- **A named actor the record does not hold.** The `under_review` sentence is
  "A recruiter is reviewing your profile." The phase covers the screening,
  homework, scoring and custom roles (`application-status.ts:56-69`), so it is
  shown during automated scoring and in an untouched queue. That is a claim
  that a person holds the application, which the record does not support for
  much of the time it is shown.
- **An expected step that is not announced.** The homework role maps to
  `under_review`, and the reason is recorded: "The public page deliberately
  does not announce the assignment (the invite is its own comm, on its own
  token)" (`application-status.ts:59-62`). Keeping the token off the page is
  right. Saying nothing is not: `homework` is not one of the pending-action
  kinds (`candidate-next-action.ts:19`), so a candidate with an assignment
  waiting sees "A recruiter is reviewing your profile". The technique's rule is
  that a deliberately off-page action still owes the step a line saying
  something is waiting, and where it was sent.
- **One channel promise escapes the relay check.** The decision history's
  closing line, "You can request a human review of any decision at any time.
  Just reply to any message from the hiring team." (`StatusClient.tsx:375`),
  renders whether or not a relay is configured, on a page that gates every
  other email promise.
- **The pending action sits below the spine, not at its step.** The card
  renders after the trail (`:299`). With a single pending action the
  difference is small; the rule matters when the spine gains a step with its
  own expectation.
- **The reassurance register at the end.** `hired` reads "You're hired.
  Welcome aboard! 🎉". It is the one terminal where good news is recorded, so
  the stakes are low, but it is the register the copy rule cuts.
- **No owned date is shown, though the team owns some.** Stages carry an
  optional team-set service level (`slaDays`) that the board ages against, and
  stage dwell is measured against it. None of it reaches the candidate. See
  the committed-dates application in this folder for the walk.

## The walk: four real paths, the technique before and after

A is the timeline technique as it stood: "say so at that step, in the
imperative, with the action available there", and "we are reviewing" as the
example copy with no rule about naming an actor. B is the conditioned
technique: a route to the action and never its key, an off-page action still
owes a line, and no named actor the record does not hold.

1. **An open offer** (`answer_offer`). A puts the action on the page, which
   means the offer token on a forwardable link: whoever holds a forwarded link
   can accept or decline for the candidate. B shows the kind, the dates and a
   resend door. kp ships B.
2. **A booking invite** (`book_interview`). The same split: A would carry the
   booking token, and with it the power to book, move or withdraw. B does not.
   kp ships B.
3. **An assignment waiting** (the homework role). A flags the silence: an
   expected step that says nothing. B flags it too, and says what the fix
   must not do (put the assignment token on the page) and what it must do (a
   line that something is waiting and where it went). Both arms find the gap;
   B's fix is the safe one.
4. **Automated scoring in progress** (the scoring role, shown as
   `under_review`). A passes "A recruiter is reviewing your profile". B fails
   it: the record holds no person on the application during scoring.

A prescribes a capability exposure on 2 of 4 paths, and misses the actor claim
on 1. B finds every gap A finds and prescribes no exposure. kp's own code
reached B's first half before the technique did, citing the projection's
"assume the payload is public" rule, which is the convergence this condition
rests on. **Falsifier:** a forwarded status link that cannot reach the
candidate's action under A, for example because the action re-authenticates.
Both of the paths above are authorised by their token alone in kp: the offer
answer (`app/api/offer/[token]/route.ts:44-62`) and the booking, where the
route's own comment reads "Token route: no session, so the invite is the
authority" (`app/api/schedule/[token]/route.ts:390`). **Return for code:**
add the homework kind to the pending actions, and make the `under_review`
sentence say "we" unless the entry sits in a human-held stage, when the tree is
quiet.

---
layer: technique
type: technique
subject: work-sample-timeboxing-and-cost
technique: draft-durability-and-no-silent-loss
status: forged
laws: [a-candidates-process-never-stalls-on-your-constraints, absence-of-evidence-is-not-evidence]
use_when: [building or reviewing a live assessment surface, setting rate limits on a candidate-facing endpoint, a candidate reports losing work during a timed exercise]
shared_with: []
---

# Draft durability, and no silent loss

A timed exercise is the one place in a hiring process where a technical failure
destroys something irreplaceable. A candidate whose connection drops at minute
eighty of a ninety-minute exercise has lost an hour of their unpaid evening, and
no apology recovers it. The rule is therefore absolute: **your infrastructure
never costs a candidate their work or their clock.**

## Durability

- **Persist drafts locally and continuously**, on the candidate's device, as they
  type — not on an interval tuned to your write costs, and never only on
  submission. Local persistence is what survives the failure that actually
  happens: the network, not the browser.
- **Restore on return.** Reopening the exercise — after a reload, a crash, a
  tunnel, a battery death — restores what was there and says so, visibly. Silent
  restoration is nearly as frightening as loss, because the candidate cannot tell
  whether they are looking at their work or a blank they must redo.
- **Keep the timer state with the draft.** A restored draft with a reset clock,
  or a clock that kept running through a twenty-minute outage the candidate did
  not cause, are both failures. Where you cannot tell an outage from a break,
  resolve toward the candidate.
- **Retry submission, and report the outcome truthfully.** A submission is the
  one moment where the candidate has no visibility and everything to lose. Retry,
  and if it still fails, say so with a route that works — never a spinner that
  ends in nothing.
- **Do not let a save failure block typing.** A surface that freezes the editor
  because a background write failed converts a minor outage into total loss.
  Keep working locally, warn, and reconcile later.
- **Scope the local copy to the individual invitation, and clear it on
  submission.** A shared device — a household computer, a library terminal, a
  training-centre lab — is a normal place to sit an exercise, and an unscoped
  local draft bleeds one candidate's work into the next candidate's session.
  That is simultaneously a confidentiality breach and a corrupted submission.
- **Treat the restored copy as untrusted input.** Local storage is writable by
  whoever holds the device. Parse it defensively against the same bounds the
  server enforces, and discard a malformed blob rather than letting it crash the
  surface or ride into the next upload. A durability mechanism that can itself
  destroy the session is not durability.
- **Never retry an identifier that cannot land.** When the server says a session
  is gone or already submitted — another tab or device won a race — retrying it
  forever spins silently while the clock runs. Drop the identifier, obtain a new
  session, and carry the buffered work and events across. The work is good; only
  its container died.

## Stated limits, never silent failures

Any limit you impose — payload size, request rate, session count, attachment
count — must announce itself at the moment it fires, in the candidate's words,
with what to do next. A silent failure at the moment of submission does not read
as "a limit"; to a person watching a clock it reads as *work lost*, and they
respond by retrying, which trips the same limit again.

Where the limit was yours rather than theirs, the clock stops. A candidate who
spends four minutes fighting a throttle you configured has been charged four
minutes of an unpaid budget for your capacity planning
([a-candidates-process-never-stalls-on-your-constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).

### Public assessment surfaces are never rate-limited by network address

This one is specific and it is quietly common. Candidates sitting a timed
assessment legitimately share a single network address — a university computer
lab, a shared office, a public library, a household, an employer's network, or
any of the carrier-scale address-translation layers through which whole regions
of mobile users appear as a handful of addresses. Key a limit to the address and
the second candidate is throttled out of an exercise because of what the first
one did, with the damage concentrated on exactly the candidates least likely to
have a private connection.

Key candidate-facing limits to the **session or invitation token** instead — the
thing that identifies the person's sitting, and which an abuser cannot rotate —
and set the bound generously enough that ordinary work never approaches it. Size
it from the fastest honest working pace, then leave a multiple of headroom: a
limit a real candidate can reach is a defect, not a safeguard. Where an
address-level control is genuinely needed against automated abuse, it belongs on
the unauthenticated perimeter, never on the path a candidate mid-exercise takes
to save or submit.

Watch one trap when the invitation link is **shared across a whole posting**
rather than minted per candidate: a budget keyed to that link is collective, so
one heavy user can consume another candidate's allowance. Where the link is
shared, the per-sitting limit must be the tight one and the shared budget the
loose one — the reverse of the intuitive arrangement.

## Decision rules

- **When a submission does not arrive, treat it as unmeasured, not as
  withdrawal.** A candidate who is silent may have failed to submit, not failed
  to work
  ([absence-of-evidence-is-not-evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).
  Reach out before any adverse step, and hold their place while you do.
- **When your outage is confirmed, offer a fresh sitting on a fresh instance of
  the exercise, on their schedule.** Rerunning the same case after they have seen
  it is not equivalent, and pretending it is understates what you took.
- **When you cannot distinguish your failure from theirs, assume yours.** The
  evidence is on your side of the wire and the cost is entirely on theirs.
- **When you change the surface, re-test the recovery path under a dropped
  connection**, not just under a clean reload. The failure this technique exists
  for only appears when the network goes and comes back.
- **When a limit exists, one place decides it and one message explains it.** Two
  layers each silently trimming a payload produces truncated submissions nobody
  can explain later.

## When not to use it

Nothing here is optional for a hosted, timed surface. The one variant is the
asynchronous take-home done in the candidate's own environment and submitted as a
file or a link: there you own no durability, and the corresponding obligation
moves to the submission channel — accept it more than once, confirm receipt
visibly and immediately, and never let a silent upload failure be the candidate's
first sign of trouble. A confirmation the candidate can see is the whole of your
duty there, and it is the part most often missing.

## Why this sits in a subject about cost

Because loss is measured in the same currency as the timebox. Every rule in this
subject exists to bound what a work sample takes from a person; a durability
defect takes the maximum — the whole budget, unrecoverably, from someone who did
the work — and it takes it from the candidate whose connection is worst, which is
rarely the candidate whose circumstances are best.

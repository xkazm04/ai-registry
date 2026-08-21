---
layer: golden-path
type: golden-path
subject: offer-lifecycle-and-deadlines
status: forged
use_when: [issuing an offer with a response deadline, building the candidate-facing accept or decline surface, deciding what automation may do to an aging offer, debugging a double-accept or a silently lapsed offer]
techniques:
  - role-appropriate-deadline-bounds
  - single-pre-expiry-nudge
  - terms-injected-at-dispatch-not-at-draft
  - server-authoritative-countdown
  - idempotent-terminal-response-under-a-race
  - expired-is-a-different-answer-from-invalid
---

# Offer lifecycle and deadlines

An offer is the only artifact in a hiring process that the *candidate* completes.
Everything upstream — the screen, the interviews, the debrief, the decision — is
something the organisation does to a person. The offer is the moment the direction
reverses: the organisation makes a bounded promise, hands it over, and then waits.
This subject is the craft of that handover and that wait. It starts when a decision
becomes an offer and ends the instant the offer reaches a terminal state, whichever
it is.

The naive reading is that an offer is a document with a date on it. That reading
produces the four failures this subject exists to prevent: a deadline used as a
weapon rather than a lever; an offer that dies of silence while the candidate is
still thinking about it; a letter whose numbers contradict the candidate's own
screen; and a race in which two clicks, or one click and one cron tick, both
believe they won.

## An offer is a state machine with exactly one terminal claim

Model the offer as a small, explicit state machine — drafted, dispatched, live,
and then exactly one of accepted, declined, expired, withdrawn — and hold two
invariants over it.

The first invariant: **terminal states are terminal**. Once an offer has an outcome
it never has another. There is no un-declining, no re-accepting, no automated
process that quietly moves a live offer back to draft. If a decline was a mistake,
that is a *new offer*, with its own dispatch, its own terms and its own deadline —
which is the honest record and also happens to be the only version a later audit
can read.

The second invariant: **exactly one actor's action produces each transition**. The
extend is the recruiter's call. The accept and the decline are the candidate's. The
withdrawal is the organisation's, and it is consequential enough to require a named
person. The expiry is the only transition produced by time itself — which is
precisely why it deserves more design attention than all the others, because it is
the one nobody chose in the moment it happens. Every one of these transitions
records who or what made it; see the law that
[every decision names its actor](../_laws.md#every-decision-names-its-actor).

A third property is easy to miss and expensive to omit: **at most one live offer
link exists for a candidate and role at any time.** When a recruiter corrects an
offer — a mistyped figure, a wrong currency, a renegotiated number — the correction
refreshes the existing live offer in place (restarting its window and re-arming its
reminder) rather than minting a second link. Two live links means the letter the
candidate holds and the page that binds them can name different numbers, and the
candidate can accept a figure they were never sent. Only a *terminal* offer is
re-issued as a genuinely new one.

And the offer's own state is not the only terminal state in play. A candidate can
be closed out elsewhere — rejected on another requisition, withdrawn from the
pipeline — while an old offer link still sits in their inbox. The terminal write
must therefore respect the *candidate's* terminal state too: an accept arriving on
a stale link does not resurrect a closed candidate into a hire, and a decline on a
duplicate link does not demote someone already hired. Where the two disagree,
record the conflict as an event a recruiter can see rather than dropping it
silently — a swallowed conflict is a person whose situation nobody knows is wrong.

Do not derive any of this from display strings. Teams rename their offer column,
split it into "offer out" and "offer verbal", or invent stages between them. The
lifecycle rules key off a stable role vocabulary, never a label —
[meaning does not live in a label](../_laws.md#meaning-does-not-live-in-a-label).

## The deadline is the lever, and its bounds are role-shaped

A response deadline is not administrative garnish. It is the single strongest
instrument the recruiter has after the number itself: it converts an open-ended
"we'd love to have you" into a decision the candidate schedules. Offers without
deadlines do not get accepted faster; they get deferred until a competing process
finishes, and then they get declined or, worse, accepted with one foot already out.

But the *right* deadline is not a constant. A same-day retail or seasonal offer can
legitimately expire in a day. A standard professional offer sits near a week — long
enough for a considered decision and a conversation at home, short enough to keep
the momentum the interview loop built. A senior or relocating hire needs two or
three. An executive search, with board timing, notice periods and a spouse's career
on the table, can honestly need a month or more. One fixed window serves none of
these; it is simply the shortest defensible number for the longest search, applied
to everyone. Bound the range, default to the common case, and let the role move it
inside those bounds — `role-appropriate-deadline-bounds` holds the procedure and
the reasoning.

One asymmetry inside the deadline machinery is worth stating at the top level: an
offer whose deadline is *missing or unreadable* must never expire. A null date is
not a date in the past. Systems acquire deadlines by migration, and the offers that
predate the field are live offers held by real people; killing them because a
column is empty is the deadline lever amputating a candidate it was never pointed
at. Fail open on absence, and fix the absence.

The line between a lever and pressure theatre is the line between *stated* and
*manufactured* urgency. A deadline that reflects a real constraint — a start date,
a backfill, another candidate's own deadline — is legitimate and should be said out
loud. A deadline invented to deny the candidate time to compare, an "expiring"
offer that quietly gets extended for anyone who pushes back, or a countdown that
shortens when the candidate reloads the page, is coercion wearing a policy's
clothes. The practical test: **would you be comfortable if the candidate asked why
that date?** If the honest answer is "to stop you talking to anyone else", the
deadline is theatre and the whole instrument loses its credibility, including for
the offers where it was real.

## Negotiation is part of the standard, not an exception to it

The most common structural gap in offer tooling is to model the candidate's
response as binary: accept or decline. Real offer craft has a third path, and it
is the *most* common one at senior levels — the counter. A candidate who names a
number, asks for a different start date, requests a signing consideration or wants
one clause changed is not declining; they are engaged. A system that offers them
only two buttons converts a negotiable offer into a refusal, and the recruiter
learns about it as a lost candidate rather than as a conversation.

The standard is a three-outcome response surface: accept, decline, and **respond
with a request**, where the third parks the offer in a *negotiating* state that
pauses or extends the clock, notifies a named recruiter, and preserves the original
terms until they are formally superseded. The counter is answered by a person, not
a rule. When it produces new terms, those terms are a *new dispatch* under the
same lifecycle — new letter, new deadline, new countdown — so the record never
holds an offer whose terms and whose letter disagree.

Where a system genuinely cannot support this yet, name it as a known cap on
acceptance rate rather than a design choice, and give the candidate a stated,
non-punitive route to reach a human before the deadline. The wrong mitigation is to
tell candidates "decline and we'll talk" — a recorded decline is a fact in the
person's file and in your funnel metrics, and asking someone to falsify one to open
a negotiation corrupts both.

## Both sides must be reading the same clock

An offer with a deadline creates two clocks: the one the organisation enforces and
the one the candidate watches. If they disagree by even a few hours, the candidate
experiences the system as arbitrary — a page that said "23 hours left" refusing an
acceptance is not a technical inconsistency, it is a broken promise.

The rule is that **the countdown a candidate sees is computed where the expiry is
enforced**. A client clock is untrusted, unsynchronised and trivially wrong: a
device set to the wrong day, a traveller who crossed a date line, a laptop resumed
from sleep. A candidate must never be shown a number their own action will
contradict. `server-authoritative-countdown` covers this and the related display
rules — timezone honesty, coarse units far out and precise units close in, and the
grace posture at the boundary.

The same discipline governs the letter. Terms that are written into a message at
*draft* time and dispatched later can drift: a recruiter edits the salary, the
deadline shifts, an approval changes the start date, and the message still carries
the old figures. Inject the offer's terms at the moment of dispatch, from the
record of truth, so the letter and the candidate's own screen cannot disagree —
`terms-injected-at-dispatch-not-at-draft`. This obeys
[say only what the record holds](../_laws.md#say-only-what-the-record-holds): a
letter is a claim about what was offered, and it may only say what the offer record
actually says.

## Silence is the cruellest expiry

The deadline lapses an offer without anyone acting. That is its purpose, and it is
also its danger, because the most common reason an offer lapses is not a decision —
it is a person who meant to reply, got a family emergency or a bad week, and lost a
live job offer to an inbox. The organisation experiences this as a clean automatic
close. The candidate experiences it as having been dropped.

The fix is small and non-negotiable: **exactly one proactive nudge before expiry**,
sent at a lead time proportional to the window, saying what is on the table, when
it closes, and how to reach a person. One — because a second is a dunning sequence
and reads as pressure; zero — because zero means the system's only communication
about the deadline is the one that arrives after it has already cost the candidate
the offer. `single-pre-expiry-nudge` holds the lead-time rules and the suppression
conditions.

This is also where the boundary with automated adverse action sits. A lapse is not
a rejection and must not be laundered into one: the machine may let the clock run
out on the *terms it published*, but it may not decide the person is unsuitable,
and it may not close the candidate's file as rejected on its own authority. Where
the lapse produces any consequence beyond the offer itself, a person owns it —
[no adverse outcome is solely automated](../_laws.md#no-adverse-outcome-is-solely-automated).

## Two failures that look alike and are not

When a candidate's offer link fails to open, there are two entirely different
facts underneath. Either the link is not a real offer — a mistyped or truncated
address, a revoked token, a page from a different process — or it is a real offer
that has passed its deadline. Collapsing both into one "not found" or one generic
error costs the candidate the only information that matters to them, and costs your
support channel the ability to answer the question in one step.

Answer them distinctly: an unknown offer says it cannot be identified and routes to
a human; a known but lapsed offer says *this offer expired on this date*, names its
role, and offers a way to ask about it. `expired-is-a-different-answer-from-invalid`
covers the distinction, its status semantics, and the disclosure limits that keep a
guessed link from becoming a way to enumerate who is holding offers. The underlying
discipline is the law that
[absence of evidence is not evidence](../_laws.md#absence-of-evidence-is-not-evidence)
applied to states rather than scores: "I do not know this offer" and "I know this
offer and it is over" are different states, and neither may render as the other.

## One winner, computed by the store

The offer's terminal act is the highest-stakes write in the whole hiring system,
and it is the one most likely to be attempted twice. Candidates double-click. Mail
clients prefetch links. A phone loses signal mid-submit and the person retries. A
recruiter records a verbal acceptance in the same second the candidate clicks. And
the expiry job runs while the accept request is in flight.

Two rules cover all of it. First, the claim on the terminal state is made by a
single conditional write in the store — accept only if still live — so the store,
not the application, decides who won. Second, the *loser* of that race is not an
error to the candidate: if the state that is already recorded is the one they were
asking for, they get the success page, because that is the truth of their
situation. `idempotent-terminal-response-under-a-race` holds both, along with the
ordering rule that matters most in practice — evaluate lapse *before* accept, so
the deadline you published is the deadline you enforce — and the reason the naive
read-then-write version is so damaging: it fires the downstream side effects twice,
which means a doubled hire notification and a stage transition applied to an offer
that had already moved.

The same discipline runs downhill into the side effects. Everything the acceptance
triggers — metering, outcome recording, downstream handoff — is best-effort *behind*
the recorded acceptance, never a precondition of it. A metering fault, an
unreachable system of record or a failed audit write must not turn a successful
acceptance into an error page for the person who just took the job. Log it loudly
and keep the acceptance.

## Never gate the candidate's own act

An offer acceptance may be metered, counted, attributed and billed. It may not be
*blocked* by the organisation's commercial state. If a workspace is over its plan
limit, out of credit or behind on payment, the candidate's acceptance still
succeeds and the debit is recorded; the consequence lands on the organisation,
where it belongs. The general rule and its degradation posture belong to the
sibling `degrade-never-block-a-candidate`; the seam here is narrow and
absolute — the terminal write on an offer is on the candidate's side of that line.
The law is
[a candidate's process never stalls on your constraints](../_laws.md#a-candidates-process-never-stalls-on-your-constraints).

## What automation may do to an aging offer

Policy automation earns its keep on offers by *surfacing*, never by deciding.
It may compute how long an offer has been out, flag the ones approaching their
deadline, rank a recruiter's attention, and draft the extension message. It may not
advance an offer, may not decline one on the candidate's behalf, may not extend a
deadline on its own authority, and may not re-price an offer.

The last one has a specific fail-safe worth stating plainly. When a system drafts
offer content and the compensation is not yet determined — no band, no approved
figure — it must not produce a number. The drafts that exist *because* the number
is unknown are exactly the drafts a generative system will most confidently invent
one for. No band, no figure: route to a human to price it. This is
[say only what the record holds](../_laws.md#say-only-what-the-record-holds) at its
sharpest, because an invented salary in a candidate's hands is a claim the
organisation may be held to.

## Seams with neighbouring subjects

`combining-signals-into-a-hire-decision` owns everything up to the decision — how
the evidence became a yes. This subject begins at the moment that yes becomes a
bounded, dated, revocable promise.

`compensation-banding-and-market-honesty` owns where the number comes from and
whether it is defensible. This subject owns only that the number, once determined,
reaches the candidate unaltered and is never invented in transit.

`candidate-communication-integrity` owns whether the letter was delivered, retried,
deduplicated and provably sent. This subject owns what the letter must *contain* at
the moment it is composed, and what the offer's own state means — the seam is that
a delivery failure is a communications problem, while a delivered letter carrying
stale terms is an offer-lifecycle problem.

`pre-boarding-and-first-day-handoff` owns everything after acceptance. The
acceptance write is the handover point: this subject guarantees exactly one
acceptance event with a recorded actor and timestamp, and that guarantee is what
the downstream process is entitled to rely on.

`pipeline-aging-and-attention-triage` owns the general practice of surfacing stale
work. This subject supplies the offer-specific rule that aging may only surface,
never act.

## Failure modes of the naive reading

- **Deadline as a constant.** One window for every role, chosen for the hardest
  search, which is too long to create momentum for the common case and still too
  short for the search it was chosen for.
- **The offer that dies of silence.** No pre-expiry contact, so the system's first
  and only word about the deadline arrives after it has passed.
- **Terms frozen at draft.** A letter composed on Monday and sent on Thursday
  carrying Monday's salary, and a candidate holding a document the record
  contradicts.
- **A client-side countdown.** Two clocks, one enforced, and a candidate whose
  screen said they had time.
- **Read-then-write on accept.** Two acceptances, two stage transitions, two
  downstream hire notifications, and a candidate seeing an error on the click that
  actually succeeded.
- **One generic failure page.** A candidate who cannot tell whether their offer is
  gone or their link is broken, and a support queue that cannot either.
- **Binary response.** No counter path, so every negotiation is recorded as a
  decline and the acceptance rate is worse than the offers were.

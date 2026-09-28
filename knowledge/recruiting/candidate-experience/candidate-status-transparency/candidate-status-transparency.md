---
layer: golden-path
type: golden-path
subject: candidate-status-transparency
status: forged
use_when: [building a candidate-facing status page or portal, deciding what a candidate may see about their own application, writing status or terminal-outcome copy, instrumenting whether a "we do not ghost people" claim is true, deciding whether to tell a candidate when something will happen]
techniques:
  - candidate-safe-status-projection
  - stage-role-mapping-not-stage-names
  - candidate-legible-timeline
  - honest-failure-classification
  - terminal-state-copy-without-implying-merit
  - terminal-moment-experience-measurement
  - committed-dates-not-forecasts
---

# Candidate status transparency

Ask candidates what they hate about applying for jobs and *the silence* is at
or near the top of every list: first in some surveys, second only to pay in
others, and ahead of the assessments and the unpaid work. Where it has been
compared directly with the thing it is usually said to be worse than, it is:
applicants who were rejected without being told report worse intentions toward
the organisation than applicants who received a rejection. Applications go
into a form and nothing comes back. Most people never learn whether a human read
anything, whether the role is still open, or whether they were declined at all.
The industry's own term for the majority outcome is a verb about ghosts.

This subject is the answer to that complaint, and it is narrower than it
sounds. It is not communication — a sibling owns what you send and whether the
channel is real. It is not the decline letter — a sibling owns what a decline
says. It is not explanation — a sibling owns the redacted decision history and
the disclosure that a machine was involved. This subject owns exactly one
artifact: **the candidate's truthful view of their own application, on demand,
without an intermediary**. A place they can look, at 2am, without emailing
anyone, and find out where they actually stand.

The discipline is that the view is a **projection**, not a window. A window
onto the pipeline would show internal stage names, scores, recruiter notes,
requisition politics and half-finished machine judgments — all of which are
either meaningless, harmful, or discoverable-in-litigation when read by the
person they are about. A projection is a deliberate, lossy, one-directional
mapping from internal state to a small closed vocabulary of things a candidate
is entitled to know. The whole craft is in choosing that vocabulary and
enforcing that the mapping is the only path across the boundary.

## Silence is a claim, and it is usually a false one

The reason a status surface is load-bearing rather than a nicety: a candidate
without information does not experience "no data". They construct one. The
constructions are predictable and all of them are worse than the truth —
*they filled it internally*, *a machine binned me in four seconds*, *nobody
ever opened it*. When you decline to say anything, you do not avoid making a
claim; you delegate the claim to the candidate's worst hypothesis, and they
tell that version to everyone who asks how the process went.

This also inverts the usual cost argument. A status surface is not a cost
centre offset by goodwill. It is meant as a *deflection* mechanism: the "any
update?" email, the follow-up chase, the recruiter interrupted to look someone
up in a board — those are real operating costs, and the teams that resist
building a view are usually paying for them already, in a line item labelled
something else. But how much a view deflects is a hypothesis to measure, not
a saving to book. No hiring measurement of it was found. The nearest evidence,
from a public service that built exactly this kind of progress tool, is that
people kept chasing when they had not noticed the acknowledgement, could not
remember it, or could not tell from it *when*. A view that answers "where" and
not "when" deflects the least. Count the chasing contacts before and after, and
see [committed-dates-not-forecasts](techniques/committed-dates-not-forecasts.md)
for the "when".

## What a status view may and may not contain

The boundary rule is stated positively, because a denylist of forbidden fields
will always lag the next field someone adds:

**Permitted.** That the application was received, and when. Which *phase* of
the process it is in, in role terms the candidate can map onto their own
experience. What visibly happened and when it happened — the events the
candidate was a party to. Whether the application is still live or has reached
a terminal outcome. What, if anything, is expected of them next.

**Refused.** Internal identifiers of any kind — an identifier that means
something in your system is a lever in someone else's hands. Scores, bands,
rankings, match percentages, tiers. Internal stage names. Recruiter or
interviewer notes and identities. How many other people applied, or where this
person sits among them. Any machine judgment that has not been ratified by a
human. Anything about the requisition's internal state — a hiring freeze, a
budget problem, an internal candidate — beyond its consequence for this person.

**Deliberately absent.** Forecasts of a human decision. A status page that
says "decision expected by the 14th" has made a promise on behalf of people
who did not agree to it, and every missed prediction converts a transparency
feature into evidence of unreliability. Never forecast a human decision you do
not control. This is the same instinct as
[inference-must-look-like-inference](../../_laws.md#inference-must-look-like-inference):
a guess rendered in the grammar of a commitment is read as a commitment.

**Owed, which is not the same thing.** Dates the organisation itself owns and
keeps. When the posting closes and review begins, a published campaign
schedule, a "you will hear from us by" date the team has committed to and
measures itself against. Being told when things will happen is part of what
applicants mean by fair feedback, and few are told it. A relative timescale
("within three weeks") is chased by people who cannot tell when the clock
started, so a committed date is anchored to the calendar. The line between the
two is who controls the date, not whether a date appears: see
[committed-dates-not-forecasts](techniques/committed-dates-not-forecasts.md).

## Access without an account

Requiring an account to see your own application status is a quiet way of not
providing it. The applicant applied once, possibly through an aggregator,
possibly on a phone, and will not create credentials to receive information
you already owe them. The workable pattern is an unguessable per-application
link, delivered at acknowledgement, that is the candidate's key to their own
record and nothing else.

That design decision is exactly why the projection has to be enforced at the
boundary rather than in the page. A link is forwardable, screenshottable, and
occasionally posted publicly. Everything the surface serves should be safe to
read by a stranger who found the link — which is a strong, testable property,
and a far better discipline than "the page happens not to render that field".
The engineering craft of unguessable tokens, expiry and rate limiting is
general practice and belongs to a software-engineering standard; what belongs
*here* is the hiring judgment that identity bound to a hiring outcome is
sensitive, and that the blast radius of a leaked link must be one application's
worth of non-damaging facts.

Two consequences of that judgment are hiring decisions, not plumbing. The first
is that the page whose address *is* the key loads nothing from a third party
and sends no referrer, because the standing web guidance on secret-bearing
addresses names exactly those routes (and logs, and browser history) as where
the address escapes to. The second is that the page never carries a
capability stronger than reading. When the candidate is expected to act —
answer an offer, book a round, take an assessment — the view names the action
and its deadline and routes them to it through the channel the action was sent
on. It does not put the action's own key where a forwarded status link can
use it.

## Stage roles, not stage names

Every hiring team renames its board. Columns get merged, split, translated,
and titled with in-house jokes. A candidate-facing surface that reads the
display string is therefore wrong the first time someone edits it — and the
failure is not cosmetic. The concrete, repeatedly-observed incident is telling
a candidate at offer stage that *we have received your application*, because a
renamed column no longer matched the string the projection was keyed on.

So the projection keys off the stable **role** of a stage — entry, screening,
interview, offer, terminal — which a sibling subject owns as a vocabulary and
this subject merely consumes. See
[meaning-does-not-live-in-a-label](../../_laws.md#meaning-does-not-live-in-a-label).
The corollary is that an unmappable stage is a real state with its own honest
copy, not a fallback into the friendliest bucket. When you cannot tell where
someone is, "your application is in progress" is true; "we have received your
application" is a specific claim about a specific early moment, and it is false.

## Terminal states, and the hardest copy in hiring

A status view reaches four terminal shapes: the person was hired, the person
was declined, the person withdrew, or **the requisition ended without them**.
The last one is the interesting case and the one most systems get wrong.

When a role is closed, filled, or cancelled, every live application under it
is over. That is a fact and the candidate is entitled to it. But the outcome
carries *no information about the person* — they may have been the second-best
candidate, or never read at all. Copy that says "you were not selected" in the
same words used for a considered decline attributes to the candidate an
evaluation that never happened. The rule: the terminal projection reports that
the process ended and that they are not moving forward, and it does **not**
imply merit in either direction. Neither "we found a stronger match" nor "your
profile was excellent" — the first is an unrecorded adverse claim, the second
is an unrecorded flattering one, and both violate
[say-only-what-the-record-holds](../../_laws.md#say-only-what-the-record-holds).
The one national hiring system this lane read that runs a status vocabulary at
scale makes the same cut. Its public view keeps a cancelled posting ("did not
hire anyone") apart from a completed hire, and its notice rules list
cancellation as a notice of its own, beside selection.

Note the seam: what a *decline message* says, when it is a real considered
decline with a recorded reason, belongs to the rejection sibling. This subject
owns only the state as rendered on the candidate's own view, and the specific
duty not to let a requisition-level event masquerade as a judgment of a person.

## When the status view itself fails

A status surface has an unusual property: it is consulted precisely when
someone is anxious, so its error states are experienced far more intensely
than most error states. And it has two failure classes that a generic error
page fatally conflates:

- **The key is wrong or spent.** The link was mistyped, truncated by an email
  client, expired, or belongs to a deleted application. Nothing will improve by
  waiting. The honest response says the link does not work and names the way
  back in — apply again, or contact the team — rather than a spinner.
- **We are broken right now.** A store is down, a dependency timed out. The
  application is fine and the answer exists; you merely cannot fetch it. The
  honest response says this is our problem, invites a retry, and offers the
  retry as an actual control.

Collapsing both into "something went wrong" tells the candidate whose
application is perfectly healthy that it may have vanished, and tells the
candidate holding a dead link to keep refreshing forever. Both are avoidable
and both are the exact moment the surface exists to prevent. A candidate
action must never be dead-ended by an operator-side failure, per
[a-candidate's-process-never-stalls-on-your-constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)
— and it must never present an operator-side failure as if it were a fact
about the candidate's record, per
[absence-of-evidence-is-not-evidence](../../_laws.md#absence-of-evidence-is-not-evidence).

Two corollaries fall out of the fact that this page is left open for weeks.
First, it must revalidate — on an interval and whenever the tab regains focus —
and then stop once the outcome is terminal, because a finished application has
nothing to advance to and every further fetch is a fresh chance to fail in
front of someone whose story is over. Second, **alarm is a budget on this
surface, and it is spent only on the thing the candidate came for**: a
supplementary section that cannot load simply does not render, and a failure on
a refresh never replaces a status that is already correctly displayed. Making
someone's information worse because they left the tab open is a real regression
with no upside.

The same reticence applies to what the copy promises. A step that says "watch
your email for next steps" is a claim about a delivery channel, and where no
outbound channel is actually configured it is false — the sibling that owns
delivery truth supplies the capability answer, and this surface consumes it
rather than assuming.

## Prove it or stop claiming it

"We respond to every applicant" is a marketing sentence until someone
measures it, and organisations are structurally unable to notice their own
silence: the ghosted candidate never files a complaint, they simply leave.

The complete instrument comes first, and it is not a survey. Every terminal
outcome either has a recorded notice or it does not, and that count covers
every candidate where a survey covers only the ones who answer. The sibling
that owns decline dispatch owns the count and the age of the oldest unpaid
notice. A large public employer now requires its hiring units to check from
system data that each status notice actually went out. The survey is the
second instrument, and it answers a different question: not *did the ending
arrive* but *how did it land*.

That second measure has to be pulled from the people the process is ending on,
at the moment it ends. That means an experience question asked **at a terminal
outcome** — not repeated mid-process where it becomes a nag and where the
respondent does not yet know how the story turns out.

It also means reading the answer for what it is. Reactions track the outcome:
applicants' perceptions are largely a function of how well they did, and in
one large benchmark the hired candidates' score sits around 45 points above
the overall figure. A terminal reading is therefore never reported unsplit. It
is always read by outcome (hired, declined, withdrew, requisition ended),
because unsplit it measures the hire rate. If the question is whether the
*procedure* was fair, as opposed to whether the ending arrived well, that
needs one short pulse after a hurdle and before the outcome is known. It is
anonymous to the people deciding, which removes the incentive to flatter, and
it is asked once, not at every stage.

The terminal measure means one response per application, because an
unguessable link in a candidate's hands is a ballot box someone can stuff, and
a satisfaction number that can be inflated by whoever is angriest or most
motivated is not a number. It means the surface stops asking once answered, so
a candidate who checks their status weekly is thanked and left alone. And it
means a minimum sample below which the figure is withheld entirely, per
[a-claim-carries-its-sample-and-its-basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)
— four responses cannot support a claim about how a company treats people, and
in a small hiring team a displayed average over three declines is also close to
identifying who wrote it. The floor only decides whether a figure is shown. It
does not make the figure precise: a net-promoter figure over ten answers
carries a 95% interval roughly forty points wide on each side, and still about
fifteen at a hundred. The number travels with its interval, and a comparison
between two cohorts waits until each has around a hundred answers.

The counter-intuitive part is worth stating plainly: a terminal-moment
experience score is the only instrument that samples the population your
process treats worst. Every other satisfaction measure in hiring surveys
people who are still in the funnel or who got the job. This one asks the
declined, at the moment of the decline, which is why the number is low, useful,
and honest — and why an organisation that finds it uncomfortable is usually
looking at the first true reading it has ever had.

## The failure modes of the naive reading

- **The window.** Exposing the internal record with a permission filter over
  it. Every new internal field is a leak waiting for the filter to lag, and
  the filter is written by whoever adds the field.
- **The status page that reassures.** Copy tuned for comfort — "you're doing
  great", "we're excited about your profile" — attributes evaluations nobody
  recorded, and reads as cruelty in hindsight after a decline.
- **The forecast.** A promised date for a decision the team does not control.
  See above; it converts one grievance into two. Its mirror is **the
  shrug** — no date at all where the organisation owns one, so the candidate
  chases a clock they were never shown.
- **The pipeline mirror.** Showing every internal micro-stage because it is
  more "transparent". Candidates cannot act on your workflow, and it exposes
  the machinery this subject exists to keep private.
- **The dead terminal.** A page that says "not selected" and stops. A terminal
  state should still say what happens to their data and whether reapplying is
  meaningful — the process ended, the relationship need not have.
- **Freshness theatre.** A page whose content is cached from a stage change
  three weeks stale, while the record moved. A status view that can be wrong
  is worse than one that does not exist, because it was believed.

---
layer: golden-path
type: golden-path
subject: candidate-outreach-and-halt-rules
status: forged
use_when: [designing a sourcing sequence or follow-up cadence, a candidate replied and the system kept writing, wiring the gates that decide whether an outbound message may go, generating outreach copy with a model]
techniques:
  - consent-gate-before-the-first-touch
  - halt-the-sequence-on-any-reply
  - distinguish-a-reply-from-a-re-application
  - halt-state-scoped-per-role-not-per-person
  - audit-the-non-send
  - grounded-personalisation-never-fabricated
---

# Candidate outreach and halt rules

Outreach is contacting someone who did not ask to hear from you. Everything
difficult about it follows from that one asymmetry. The person owes you nothing.
They did not open a relationship, they cannot be assumed to want one, and every
message you send spends a small amount of a finite and non-renewable resource:
their willingness to read the next one, and their employer-brand impression of
you, which is shared with their friends.

So the discipline is not "how do we write a compelling first message". It is
**how few messages can carry this, how do we earn each one, and above all what
makes us stop**. A sequencing system is judged by its halts, not by its sends. A
team that can write beautifully and cannot stop is running a spam operation with
good prose.

The three questions, in the order they matter:

1. **May we contact this person at all?** A consent and lawful-basis question,
   decided before anything else, because it is the only one whose violation
   cannot be undone by stopping.
2. **Should we contact them *again*?** A halt question — has anything happened
   that revokes our permission to continue, most obviously the person answering.
3. **How often, spaced how, over which channels, and with what in the message?**
   The cadence question, which is the only one anybody enjoys and the least
   consequential of the three.

## What this subject owns, and what it cedes

This subject owns **the decision to send and the decision to stop**: the gate
order, the halt conditions, the state that records them, the shape of a cadence,
and the grounding rule for what an outbound message is allowed to assert.

The seams with the neighbouring subjects are sharp and worth holding:

- **Whether a message truthfully arrived** belongs to the communication-integrity
  subject. That subject owns the delivery vocabulary, the bounce, the dead letter,
  and the rule that a refusal to send must be recorded rather than vanish. You own
  the refusals themselves — which gate fired, in what order, and why — and you
  depend on that subject to make sure a "sent" you counted really left the
  building. The two meet at one shared object: the send marker that later
  sequencing reads. It is written after an external acceptance, never on a
  refusal, and never at the attempt.
- **The lawful basis for holding and contacting the person** belongs to the
  consent-and-retention subject: which purpose was consented to, for how long,
  what withdrawal means, what survives an erasure. You do not re-derive any of
  that. You **consume** it, at one gate, before the first touch, resolved at the
  durable person identity rather than at whatever record happens to be in front
  of you.
- **How a decline is worded and whether it offers a reason** belongs to the
  decline-with-dignity subject. Outreach that ends in a no hands off there.
- **Who is worth re-approaching** — which past candidates a new opening should
  surface, how a silver-medalist pool is scored and refreshed — belongs to the
  rediscovery subject. It answers *whom*; you answer *how the approach is
  sequenced once someone has been chosen*. The seam is exactly the handoff from a
  candidate list to a first touch, and the gates in this subject sit on that
  handoff: a rediscovery engine that writes directly to a transport has skipped
  every one of them.

## Consent is a gate, and it is the first one

Order your pre-send gates by irreversibility, not by cost or convenience.

Contacting a person who withdrew consent, or who was never on a basis that
permitted contact, cannot be repaired by a later apology — the message is in
their inbox, the harm is done, and in several jurisdictions the record of that
send is the evidence against you. Every other halt is operationally reversible:
if a reply-halt or a manual halt fires wrongly, a recruiter sends the message an
hour later and nothing is lost.

That asymmetry dictates the order. **Consent first, then reply-halt, then manual
halt, then cadence limits.** The order matters for a reason most teams discover
too late: the audit record says which gate refused, and if a cheap reversible
check happens to fire first, the record will show a routine operational halt for
a message that was in fact unlawful. You will believe you have zero consent
violations because your gates kept masking them.

Resolve consent at the identity that **survives across records**. A person who
told you two years ago never to contact them again may exist today as a fresh
application with an empty history, or as three near-duplicate profiles from three
imports. Consent belongs to the human, not to the candidature. A consent check
scoped to the record in front of you re-contacts exactly the people who most
explicitly refused. See consent-gate-before-the-first-touch.

## A reply is the end of the sequence

The strongest single rule in this subject, and the one violated most often by
otherwise competent systems: **the moment a person answers, the automation stops
talking.**

Not "the next message is suppressed if a human notices". Not "the sequence
pauses for 48 hours". Stops. A sequence that keeps firing at someone who wrote
back is not a tuning problem, it is a defect — the person has done the exact
thing the sequence was asking for, and the system's response is to keep asking.
It reads as contempt, and it is the single fastest way to convert a warm reply
into a public complaint.

The rule holds regardless of what the reply *said*. A negative reply, a
one-word reply, an out-of-office, an angry reply — all of them halt. The
temptation to parse sentiment and continue on "not a real no" is the exact
instinct that produces the harassment case. Sentiment classification may route
the reply to a human faster; it may never license another automated send. This
is [uncertainty resolves toward the candidate](../_laws.md#uncertainty-resolves-toward-the-candidate)
in its outreach form: where the system is unsure whether it still has permission
to speak, it stops. See halt-the-sequence-on-any-reply.

Three corollaries that carry most of the real difficulty:

**Something has to make an inbound message count as a reply.** An inbound
message is only a reply if you spoke first. If nobody ever sent anything on that
thread, the message is not a reply to you — it is somebody arriving on their own
initiative, most often a fresh application or a re-application, and it must not
be allowed to set a halt that suppresses outreach that never happened. The
cleanest discriminator is the *record of prior sends on that thread*, not a
duplicate-detection flag and not the message's own text. See
distinguish-a-reply-from-a-re-application.

**A halt needs a scope, and the choice has consequences in both directions.**
Halting per person is the safest for the person and the crudest for the process:
a candidate who said no to one role never hears about a different one they would
have taken. Halting per person-and-role lets a genuinely different opportunity
through and risks a person receiving three parallel sequences from three
recruiters who each cleared their own halt. There is no free answer; there is
only an explicit one, stated in the schema and defended in the interface. See
halt-state-scoped-per-role-not-per-person.

**Halts are recorded as timestamps, not booleans.** *When* someone replied is
the fact that later decisions need — a cooling-off window, a re-approach after a
year, an audit answering "how long did you keep writing after they answered".
A boolean cannot answer any of those and cannot be un-set safely.

## Cadence craft: how many, how far apart, and when it becomes harassment

A word of honesty before the craft: the stop rules are the part most teams can
implement in a week and the part that saves them. Cadence is the part they
over-build. Get the halts right first; a system with perfect halts and no cadence
engine sends too few messages, which is a recoverable commercial problem. A
system with a beautiful cadence engine and weak halts sends messages to people
who told it to stop, which is not.

That said, cadence is real craft and it has a shape.

**The value of a follow-up decays fast, and it decays differently by channel and
by warmth.** The first message carries almost all of the response probability.
A second, well-spaced follow-up recovers a meaningful fraction of non-responses —
this is the one that pays, because most non-response is inbox volume rather than
disinterest. A third is worth substantially less than the second. By the fourth,
in most professional populations, you are converting indifference into
irritation: the marginal reply rate is small, and the replies you do get skew
negative. Treat **three touches** as the default ceiling for cold outreach and
require a named reason to exceed it. Do not treat that number as a measurement
you have made; treat it as a prior you should replace with your own measured
reply-by-touch curve as soon as you have one, and note that any curve you compute
from your own sequences is confounded by whom you chose to sequence.

**Space touches so that each one is plausibly the first thing they have time
for.** Same-day and next-day follow-ups do not test whether the message was
missed; they test whether the person is annoyed yet. A first follow-up at roughly
a working week, a second at two to three weeks, and any re-approach at a
quarter or more, is a defensible default. Widening intervals encode the honest
belief: each successive silence is stronger evidence of disinterest, so each
successive touch must clear a higher bar.

**A sourced candidate and an applicant are not on the same clock, and confusing
them is the most common cadence error.** They differ on both sides of the
asymmetry:

- *A sourced candidate* did not ask to hear from you. Every touch is a cost you
  impose. Few touches, wide spacing, and an explicit end — a sequence that just
  peters out leaves the person unsure whether they are still being considered.
- *An applicant* asked. They are entitled to fast, frequent, unsolicited-by-you
  contact, and the failure mode inverts completely: under-communication, not
  over-communication. An applicant chasing a status update after three weeks of
  silence is not evidence your cadence is respectful. Operational messages an
  applicant is owed — acknowledgement, stage change, scheduling, outcome — are
  **not outreach** and must never be suppressed by an outreach cadence limit or a
  marketing consent flag. Blocking a person's own process on your sending
  constraints is
  [a candidate's process never stalls on your constraints](../_laws.md#a-candidates-process-never-stalls-on-your-constraints)
  precisely inverted.

**Channel mix is about consent and register, not reach.** A second channel is not
a fresh budget of touches; the touch count is per person, summed across channels.
Escalating channel (a message, then a professional network, then a phone call,
then a personal address found somewhere) reads to the recipient as pursuit, and
each step down that ladder should require more justification, not less. A
personal channel the person never gave you is not a channel you have — finding an
address is not being given one.

**Say how to stop, in the first message.** Every cold outreach carries a plain,
one-line way out that does not require a reply, and that path must actually
write a durable halt at the person identity rather than a per-campaign
suppression that the next campaign will not read.

This repo-independent shape of a cadence — the schedule, the touch budget, the
channel ladder — is the part most systems have not built. Implementing halts
without it is a defensible order of work. Claiming a cadence engine you have not
built is not: if the spacing lives in a recruiter's head, say so, and do not let
a dashboard imply a schedule that nothing enforces.

## Personalisation must be grounded or it is worse than nothing

Generated outreach makes the grounding rule urgent, because a model will happily
write a warm, specific, entirely invented paragraph about somebody's career.

The test is blunt and it is the right one: **if the message body could be sent to
a different candidate unchanged, it is wrong.** A message whose only specificity
is the name and the role title is a template with a mail merge, and recipients
read it as one instantly. But the failure in the other direction is worse: a
message that asserts something about the person that their record does not
support — a project they did not run, a tenure they did not have, an inferred
seniority stated as fact — is a lie told in your organisation's voice to somebody
who knows their own history better than you do. It ends the relationship in one
message and it deserves to.

So: every specific claim in an outbound message traces to something the record
actually holds, and inference stays visibly inference
([say only what the record holds](../_laws.md#say-only-what-the-record-holds)).
"Your work on distributed systems at your last role" requires that the record say
so. "It looked to us like you have been moving toward platform work" is an
honest hedge and reads as one. See grounded-personalisation-never-fabricated.

Two composition rules travel with grounding and are learned the hard way:

- **Neutral register by default.** Do not infer gender, and do not solve it with
  slash forms or bracketed alternatives, which read as clerical. Recast the
  sentence so the question does not arise. In languages where grammatical gender
  is unavoidable, the recast is harder and more necessary, and the fallback is a
  formulation that addresses the role rather than the person. A single letter that
  misgenders a candidate costs more goodwill than a hundred perfectly personalised
  ones earn.
- **Register consistency.** Formality, salutation and sign-off form one system.
  A message that opens formally and closes with a casual sign-off, or mixes
  formal and informal address within one language, reads as machine-assembled —
  which it is.

## A non-send is an event

Every gate in this subject ends in the same place: this message will not go out.
The naive implementation returns early and writes nothing. The record then shows
no send, which is indistinguishable from "nobody tried" and from "it was sent and
lost" — and a month later nobody can answer why this candidate was never
contacted.

Audit the refusal: the intended recipient, the gate that refused, the reason, the
actor, the time. [Every consequential decision names its actor](../_laws.md#every-decision-names-its-actor)
does not exempt the decision not to act, and
[absence of evidence is not evidence](../_laws.md#absence-of-evidence-is-not-evidence)
means a silent non-send may not be read as a deliberate one. The audited non-send
is also your only tool for detecting a gate that is over-firing: a consent gate
misconfigured to suppress an entire import shows up as a spike in refusals, and
shows up as nothing at all if refusals are silent. See audit-the-non-send.

## Failure modes of the naive reading

- **The sequence that outlives the conversation.** The person replied on day two
  and the day-five and day-twelve messages went anyway, because the halt was
  checked at enqueue time rather than at send time. Every gate re-evaluates at
  dispatch; a queued message is a proposal, not a decision.
- **Halting on your own send.** A thread's last message is outbound and something
  counts it as activity, so the sequence considers itself answered — or the
  mirror bug, an inbound autoresponder counted as engagement and used to justify
  another touch.
- **The re-application that gagged the pipeline.** Someone applies again, the
  system logs it as a reply, and a halt suppresses outreach on a thread that
  never existed.
- **Sentiment as a licence.** "They said maybe" is treated as continued
  permission. Any reply halts; a human decides what happens next.
- **Consent checked at the wrong identity.** The withdrawal is on last year's
  record; today's import has a clean slate and writes to them again.
- **Per-campaign suppression.** Unsubscribes are stored against the sequence
  rather than the person, so the next sequence starts from zero.
- **The unbounded sequence.** No touch ceiling and no end state, so a candidate
  who never replies is contacted indefinitely, and no one can say when the
  approach concluded.
- **Counting attempts as contacts.** The send marker is written when the message
  was composed, so a failed send exhausts the person's touch budget and a
  recruiter reads "already contacted" for a message nobody received.
- **Personalisation by adjective.** The model is asked to make the message warmer
  and invents the specificity, because warmth without facts has nowhere else to
  come from.
- **Quiet volume growth.** Nobody owns the total number of messages a single
  person can receive across all recruiters and all sequences in a quarter, so
  each sequence is individually reasonable and the aggregate is harassment.

## The bar

You have this subject right when four statements hold and can be demonstrated
from the record. No automated message has ever gone to a person after they
answered. No message has gone to a person whose consent did not permit it, and
you can prove that from refusals rather than from the absence of complaints.
Every message a person did not receive because a gate stopped it exists as a
recorded event with a reason and an actor. And every specific sentence in every
message you sent could be traced back, by a stranger, to something your record
actually held about that person.

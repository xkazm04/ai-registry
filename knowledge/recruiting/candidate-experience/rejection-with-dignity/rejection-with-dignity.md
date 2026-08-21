---
layer: golden-path
type: golden-path
subject: rejection-with-dignity
status: forged
use_when: [writing or automating a rejection message, deciding whether to give a candidate feedback, reviewing rejection copy for legal exposure, building a decline-dispatch pass]
techniques:
  - name-the-decisive-reason-from-the-record
  - never-assert-a-gap-the-evidence-disproves
  - protected-attribute-line-suppression
  - feedback-line-ceiling
  - stage-appropriate-acknowledgement
  - deterministic-dispatch-so-nobody-is-ghosted
---

# Rejection with dignity

Rejection is the highest-volume artifact a hiring process produces. For every
person hired, dozens to hundreds are declined, and for almost all of them the
decline letter is the *only* thing your organisation ever says to them
directly. It is the modal output of the entire system, and the one most likely
to be screenshotted, forwarded, or attached to a complaint.

The subject is narrow and deep: what a decline may say, what it must not say,
how much of it there should be, which stage it has to sound like, and how it
gets produced for every declined person rather than for the convenient ones. It
is not about the decision — that is made elsewhere, by a person, under the
rules of assessment and fairness. This subject governs the *reporting* of a
decision that already exists.

That distinction is the whole discipline. A rejection letter is a **reading of
the record**, not a composition. The moment it becomes a composition, it starts
generating reasons — plausible, fluent, well-mannered reasons that were never
the reason — and every one of them is a claim about a person that nobody made.

## The letter reports; it does not decide, and it does not invent

Three constraints bind every sentence, and they bind simultaneously:

- **Epistemic.** Say only what the record holds. If the decision was recorded
  as "missing two must-have requirements", that is the reason. If it was
  recorded as nothing at all, there is no reason to give, and the honest letter
  gives none. See [say-only-what-the-record-holds](../../_laws.md#say-only-what-the-record-holds).
- **Legal.** A decline is an adverse action: discoverable, quotable, testable
  against the record. A sentence that cannot be traced to a recorded decision
  is an unsupported adverse statement about a person, in writing, from the
  party that made the decision.
- **Human.** The person invested time, hope and disclosure. The register owes
  them proportionality, plainness, and an accurate picture of what happens next
  — including the unflattering parts (how long you keep their data, whether
  reapplying is realistic).

The naive reading satisfies the third constraint and quietly violates the first
two. "Personalise every rejection" sounds like candidate care; implemented as a
per-candidate generation pass it means a language model writes a *fresh*
rationale for each person, and a fresh rationale is by construction not the one
on file. It reads beautifully and it is theatre. The reason has to be the one on
the record or it is not a reason, it is a bedside manner with a citation format.

## The three states of a reason, and only three

Every decline resolves into exactly one of these, and mixing them is where
letters go wrong:

1. **A recorded, sayable reason.** A knockout answer, a set of missing
   must-have requirements, a stated match tier, a failed structured scorecard
   dimension. This is quoted — at the record's altitude, in the record's terms.
2. **A recorded, unsayable reason.** Headcount was pulled, an internal
   candidate was appointed, the requisition was frozen, a reference check
   surfaced something that cannot be relayed. Here you say the *true structural
   fact at the level you can say it* — the role closed, the position was filled
   internally — and never substitute a manufactured candidate-attributed
   reason. Converting "we cancelled the role" into "your experience wasn't
   quite the fit" is a lie that also damages the person.
3. **No recorded reason.** Say nothing. An empty feedback section is a better
   artifact than generic advice, because generic advice is a claim about a
   person that nobody made. The temptation to fill the gap is precisely the
   failure this subject exists to prevent.

There is no fourth state where the system reasons its way to a plausible
reason. A rationale reconstructed after the fact is an inference, and an
inference dressed as a recorded decision violates
[inference-must-look-like-inference](../../_laws.md#inference-must-look-like-inference)
in the most consequential place it can.

## The worst letter that exists

Not the terse one. Not the silent one. The worst letter is the one that asserts
a gap the candidate's own evidence disproves — telling someone with eight years
of a skill to "consider building experience" in it, advising them to add a
qualification their profile already lists, or recommending they "gain exposure"
to the exact thing their portfolio is made of.

It fails on every axis at once: it is factually wrong, it proves nobody read
the application, it converts a defensible decision into documented evidence of
a non-review, and it insults precisely the achievement the person was proudest
of. A terse decline is forgettable. This one gets published.

The structural cause is always the same: a template or a generator that treats
"give constructive feedback" as a slot that must be filled. Fill-the-slot is
the enemy. Every feedback line must survive a check against what the candidate
actually showed, and when the record holds a strong profile with nothing
missing, the correct sentence is that another candidate matched the role more
closely — gracefully, with no invented deficiency.

The second structural cause is a **starved fact base**. A letter step handed
only a name and a few skill tags cannot say anything specific, so it produces
either interchangeable copy or an invention — the same defect in two costumes.
The diagnostic is blunt: if the body could be sent to a different candidate
unchanged, it is wrong. The fix is not a better instruction but a wider fact
base — the letter reads the same evidence the decision read, and no more.

## Volume is not generosity

A rejection is not improved by length. Past about three feedback points the
genre changes: it stops reading as help and starts reading as a case being
built against the person — a dossier, produced by the party that just rejected
them, enumerating their shortcomings. That is how the recipient experiences it
and that is how it reads in a complaint file.

Volume also correlates with invention, because the record rarely holds more
than a couple of genuine, defensible observations. Line four is almost always
where the model or the recruiter starts extrapolating. A hard ceiling is
therefore two things at once: a kindness and an invention brake.

The exceptions are narrow. A candidate who completed a substantial work sample
bought their debrief. A finalist declined after several rounds deserves a
conversation — a different medium, not more text. Neither licenses a longer
*automated* letter.

## Protected attributes: drop the line, not the word

Free-text reason fields and generated feedback leak references to age, gender,
nationality, family status, health, religion and union activity — not usually
as slurs, but as ordinary recruiter shorthand: "recent graduate",
"overqualified for a young team", "long career break". Any of these in outbound
prose is a documented adverse statement touching a protected characteristic.

The rule is that a line containing such a reference is **deleted whole**.
Redacting the offending word leaves a partially-scrubbed sentence that is still
a sentence about someone's age, and now it also looks like a cover-up. The
filter runs over every outbound line, in every language you send in, over
model-generated and human-written text alike, as the last thing before dispatch.

The cost asymmetry justifies an aggressive filter: a false positive costs one
bullet the candidate never sees; a false negative costs a discrimination claim
with your own letter as the exhibit. Tune toward over-suppression, and record
when the filter fired so the audit trail can show the control worked. It is a
last line of defence, never a substitute for not recording reasons in those
terms — but it must exist regardless, because a control that assumes clean
input is not a control.

## Proportionality: the letter must sound like the process that happened

A three-minute application that was auto-screened out and a candidacy that
consumed four interviews are different genres. The message owes an
acknowledgement proportional to what the person invested and — far more
importantly — must never reference an interaction that did not occur. "Thank
you for taking the time to speak with us", sent to someone who only uploaded a
document, is a small lie that discredits everything else in the message. It is
among the most common defects in templated decline copy, because the warm
template was written for the warm case and then reused.

Stage must be derived from the recorded process state, not from a display
label a team invented on their board. Per
[meaning-does-not-live-in-a-label](../../_laws.md#meaning-does-not-live-in-a-label),
a renamed column must not turn a post-interview decline into a
thanks-for-applying note.

Register carries its own craft. Gender-neutrality is achieved by **recasting**
the sentence, never by slash forms or a plural for one person — both read as
clerical processing, and in inflected languages the naive fix is what produces
the misgendering it meant to avoid. Warmth must be honest: no "we'll keep you
in mind" when the retention window is thirty days, no "we were very impressed"
on a first-pass automated screen.

## Nobody is ghosted, and the machine does not do the rejecting

Two operational invariants make the rest real.

**Every terminal decision owes a message.** Rejection is the one step with no
external deadline and no complaining counterparty, so it is the step that
silently never happens. The fix is structural: a decline is a state that owes a
dispatch, and a deterministic pass sweeps for terminal states with no message
sent and produces them. Deterministic means the same record yields the same
letter — reviewable in bulk, and free of the per-candidate generation that
invents reasons. When a model is unavailable the letter still goes, without its
optional feedback; a candidate's closure does not wait on your quota, per
[a-candidate's-process-never-stalls-on-your-constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints).

The obligation **predates the record**. A lead knocked out at intake, before
any pipeline row exists, is the easiest person in the system to never tell:
they submitted through a board, saw a confirmation screen, and nothing
downstream knows they exist. An adverse outcome owes a message from the moment
there is an address to send it to.

**A person rejects; a machine only prepares.** Per
[no-adverse-outcome-is-solely-automated](../../_laws.md#no-adverse-outcome-is-solely-automated),
the batch is previewed and approved as an exact set by a named human, the
approval is bound to the cohort actually reviewed, and the decision remains
reversible with a reconsider path that can read the sealed reason back. The
audit record for each message carries who approved it, whether a reason was
explained, and whether the protected-attribute filter fired.

Neither invariant is real until it carries a number. "We never ghost anyone"
and "we explain our rejections" are claims about the system, and three
measurements make them checkable: the age of the oldest outstanding decline
obligation, the share of declines that carried an explained reason, and a
candidate-side satisfaction signal captured at the terminal outcome — the only
honest moment to ask, and the one almost nobody uses. The last obeys the same
sampling honesty as every hiring metric: a handful of responses to a
difference-of-proportions score renders as insufficient sample, not as a
number.

## The seam with delivery

This subject owns **what the message says**. Whether it left the building —
queued, sent, bounced, retried, dead-lettered, and how an operator learns the
difference between "sent" and "believed sent" — belongs to the sibling subject
on candidate communication integrity. They meet at one point: an undelivered
message ghosts the candidate as surely as an unwritten one, so the dispatch
pass treats an unconfirmed delivery as an obligation still outstanding and
hands the failure to that subject's machinery rather than re-sending blindly.

## Failure modes this standard exists to prevent

- **The generated rationale** — a fluent reason no one on the hiring side ever
  held, produced fresh per candidate at send time.
- **The disproven gap** — advice to acquire something the applicant's own
  evidence shows they have.
- **The dossier** — six bullets of critique reading as a prosecution brief.
- **The leaked characteristic** — a scrubbed-but-surviving sentence about age,
  origin or family status.
- **The phantom interview** — warmth borrowed from a template written for a
  later stage than the one that happened.
- **The silent terminal state** — a decision made, recorded, and never
  communicated, because nothing forced it.
- **The false promise** — retention, reapplication or future consideration
  claimed on terms the organisation does not actually operate.

## The techniques

- [name-the-decisive-reason-from-the-record](./techniques/name-the-decisive-reason-from-the-record.md)
  — the one reason that is true, in the record's own terms, or none.
- [never-assert-a-gap-the-evidence-disproves](./techniques/never-assert-a-gap-the-evidence-disproves.md)
  — the contradiction check every feedback line must survive.
- [protected-attribute-line-suppression](./techniques/protected-attribute-line-suppression.md)
  — whole-line deletion, multilingual, tuned by cost asymmetry.
- [feedback-line-ceiling](./techniques/feedback-line-ceiling.md) — the hard cap
  that is a kindness and an invention brake at once.
- [stage-appropriate-acknowledgement](./techniques/stage-appropriate-acknowledgement.md)
  — proportional register from the real process state, never an implied
  interaction.
- [deterministic-dispatch-so-nobody-is-ghosted](./techniques/deterministic-dispatch-so-nobody-is-ghosted.md)
  — the sweep that makes every terminal decision produce a message.

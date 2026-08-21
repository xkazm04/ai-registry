---
layer: technique
type: technique
subject: rejection-with-dignity
technique: name-the-decisive-reason-from-the-record
status: forged
laws: [say-only-what-the-record-holds, inference-must-look-like-inference, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [drafting decline copy, deciding what reason a rejection may state, reviewing a personalisation feature for a rejection flow]
---

# Name the decisive reason from the record

A decline may state exactly one reason, and it must be the reason that is on
file. This technique is the resolution procedure that turns a stored decision
into a sentence — and, equally, the refusal procedure that produces no sentence
when the record holds nothing.

The failure it prevents is subtle because it looks like quality work: a
per-candidate generation pass that reads the profile and writes a considered,
specific, well-argued rationale. That rationale was produced at send time by
something that was not in the room when the decision was made. It is an
inference wearing the grammar of a recorded fact
([inference-must-look-like-inference](../../../_laws.md#inference-must-look-like-inference)),
and it is unfalsifiable against your own audit trail — which means the first
time a candidate asks "on what basis", your letter and your record disagree.

## The resolution order

Resolve the reason deterministically, taking the first that exists:

1. **A knockout answer.** A stated disqualifying response to a screening
   question — no work authorisation for the location, unwilling to relocate
   when relocation is mandatory, missing a legally required credential. This is
   the cleanest reason there is: factual, candidate-supplied, and not a
   judgment about them. Say it plainly.
2. **Missing must-have requirements.** Name them, drawn from the recorded set
   of unmet mandatory requirements, not re-derived at send time. Two or three
   at most; the ceiling applies here.
3. **The recorded comparative outcome.** A match tier, a scorecard verdict, a
   ranked shortlist position. This yields the honest comparative sentence:
   other applicants matched the requirements more closely.
4. **Nothing.** No reason section at all.

Within steps 2 and 3 there is a second, sharper ordering: **what a human asked
for outranks what a machine derived.** A recruiter's own recorded checklist of
still-unmet criteria is a better reason than a matcher's list of unmet
requirements, even though both are "on the record", because the first is a
stated hiring intention and the second is an extraction artifact that may
reflect a parsing miss rather than a real absence. Rank reason sources by
provenance and label which source a given letter used, so a later reader can
tell a recruiter's judgment from a pipeline's inference.

A generic "we have decided to proceed with other candidates" is legitimate only
as state 3 or 4 — as the true comparative outcome, or as the neutral closing
when nothing specific is on file. It is not legitimate as a *substitute* for a
recorded specific reason: if the record says the candidate lacked two mandatory
qualifications, hiding that behind the generic line withholds the one piece of
information they can actually act on.

## The strong-profile case

When the record shows a strong match and no missing requirements — the
candidate was good and someone else was better, or the role filled — there is
no deficiency to name and the system must not manufacture one. The correct
output is the graceful comparative statement plus one genuine acknowledged
strength drawn from what was actually recorded. Any invented gap here is the
worst possible letter (see the sibling technique on disproven gaps): the
candidate's own evidence refutes it immediately.

## Reasons that are true and unsayable

Some recorded reasons cannot be relayed: headcount withdrawn, an internal
appointment, a frozen requisition, an unrelayable reference finding, a
confidential business decision. The rule is **say the true structural fact at
the level you can say it, or say nothing** — the role has closed, the position
was filled internally. Never swap an organisational reason for a
candidate-attributed one. That substitution converts a decision that had
nothing to do with the person into a documented judgment about their ability,
and it is both a lie and an unnecessary injury.

## Binding the reason to what it judged

The reason must be bound to the version of the role and rubric it was decided
under ([a-verdict-is-bound-to-what-it-judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
If the requirement set changed after the decision, the letter still states the
requirements that were actually applied; re-deriving against the current
posting produces a reason the decision-maker never used. Concretely: freeze the
reason payload with the decision, and have the letter read that frozen payload
rather than recompute anything.

## Decision rules

- When a reason exists in the record, state it; when it does not, state none —
  never generate one at send time.
- When several reasons exist, name the **decisive** one only. A list of every
  imperfection is a dossier, not an explanation.
- When the stored reason is free text written by a recruiter, it passes through
  the protected-attribute filter before it may be quoted, and it is quoted at
  the record's altitude — not paraphrased into something warmer that says more.
- When a reason category is itself a protected characteristic or a close proxy,
  it is never stated, and the decline falls back to the comparative outcome
  while the underlying decision goes to review.
- When the record's reason contradicts the record's own evidence about the
  candidate, suppress and escalate — do not ship a reason your own data
  disproves.

## When not to use this

- **Where a jurisdiction prescribes wording.** Some regimes mandate specific
  adverse-action language, notice periods, or a stated right to contest. The
  statutory text governs; this technique fills what remains.
- **Where a human is having a conversation.** A finalist debrief is a dialogue,
  and a person may say more than the record holds *as their own opinion,
  labelled as such*. What they may not do is put that opinion in writing as the
  organisation's recorded reason.
- **Where the reason is the subject of an open dispute or investigation.**
  Communication then follows the dispute process, not the standard decline
  path.

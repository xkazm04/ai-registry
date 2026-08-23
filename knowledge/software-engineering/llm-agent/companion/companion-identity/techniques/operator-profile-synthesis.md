---
layer: technique
type: technique
subject: companion-identity
technique: operator-profile-synthesis
status: forged
laws: [count-carries-predicate, unknown-is-not-a-value, absent-guard-is-loud]
shared_with: []
use_when: [an agent is building a model of its user, deciding what a companion may infer about a person's character, designing a personalization feature that reads someone's own history]
---

# Operator profile synthesis

A companion accumulates observations about exactly one human, and at some point
someone proposes turning those observations into a profile: how this person
works, what they value, when they escalate, what they reverse. The feature is
genuinely valuable — a companion that knows its person's escalation boundary
stops asking about things they have never once wanted asked about. It is also
the single most invasive thing in the system, because the dataset is one
identifiable person, the audience is that same person, and the consumer is a
machine that will act on the conclusion for years without re-checking it.

This technique is the discipline that makes it shippable.

## Synthesise from tallies, not from content

The load-bearing rule. A profile is derived from **countable behaviour** —
choices made, choices reversed, time between an ask and an answer, how often a
proposal is accepted unedited, which categories get delegated and which get
taken back, the rate at which the person overrides the companion — and not from
reading the person's own words back and characterising them.

The distinction is not squeamishness. It is about what the person can argue
with. "You accepted 41 of 44 proposals in this category and edited 3" is a claim
with a visible derivation; the person can dispute the counting, the window, or
the interpretation, and win. "You come across as impatient with detail" is a
characterisation produced by a model that read a year of their private
conversation, and there is no move available to the person except to disagree
with a machine about their own personality. A system that produces the second
kind of statement by default has built a dossier, and being accurate does not
redeem it.

The pass is also **scoped to the sections about the person**. It reads the whole
evolving document for context — a proposal that repeats what is already there is
noise — and it may only propose changes under the headings that describe its
subject. A behavioural pass editing the companion's own self-reads is a different
kind of write wearing this one's authorisation, and the scoping is stated where
the pass is defined rather than left to the model's discretion.

The practical form: the synthesis input is a table of counts and rates. The
model's job is to *name the pattern the numbers show*, not to read the raw
material. Where a quote is genuinely needed as illustration, it is the person's
own decision, quoted verbatim with its date, in a section marked as evidence —
never paraphrased into an adjective.

## Every claim carries its evidence and its predicate

A trait without its count is an assertion, and a count without its predicate is
not evidence
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). Each
line of the profile therefore carries three things: the claim, the number behind
it, and what was counted over what window. "Prefers to be asked before
structural changes — 12 of 13 structural proposals were paused for discussion,
over the last 90 days" is a profile entry. "Prefers to be asked" is a rumour
about somebody.

This is what makes the profile correctable rather than merely rejectable. A
person shown a claim with its grounds can dispute the reading *or* the grounds,
and can point at the two observations that were miscategorised. A person shown a
bare adjective can only veto, which they will eventually do to the whole feature.

The citations must resolve. A profile entry whose evidence pointer no longer
lands is not a slightly-weaker entry; it is an entry with no grounds, and it is
retired rather than left standing.

## Below the floor, the output is silence

Every claim has an evidence floor — a minimum number of independent observations
below which the synthesis produces **nothing on that axis**. Not a hedged claim,
not a low-confidence trait, not a "tentatively appears to". Nothing.

The reason is that a hedged trait does not stay hedged. It is read into the
companion's context, it shapes behaviour, the behaviour shapes the interaction,
and the interaction supplies confirming observations — a loop that converts four
observations into a settled belief with no step at which anybody decided
anything. And downstream, a qualifier is exactly the thing a summarising pass
drops first.

So an axis with insufficient evidence renders as **not enough evidence yet**,
which is a legible state and a different one from "no such tendency"
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). Rendering
thin evidence as a definite trait converts "we do not know" into a confident
claim about a person's character at precisely the point where confidence
misleads most.

The floor is per-axis and stated, not global and implicit. A behavioural
tendency needs more observations than a stated preference, because the person
*said* the second one.

## The posture: off until asked for

Profile synthesis is **disabled by default and enabled by an explicit act of the
person**, and this is the one place where a default-on posture cannot be argued
into. Everything else a companion does is done *for* its person; this is done
*about* them until they ask for it. A companion that has quietly assembled a
character assessment nobody requested has damaged the relationship it exists to
maintain, and the damage lands entirely at the moment of discovery, which is
usually the moment the person first opens the file.

Being off by default does not make the guard optional, and it is worth being
precise about the direction: the *synthesis* is opt-in, while the *rules on the
synthesis* — the tally-only input, the evidence citation, the floor — engage
automatically once it is on. A design in which the citations or the floor are
themselves a setting has an unguarded default, and deployed installations
converge on defaults
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

Three further properties of the posture:

- **The profile is visible to its subject, in full, at any time**, in the same
  form the companion reads. There is no version of this feature where the
  companion's model of the person is more detailed than what the person can see.
- **The person can delete or correct any line**, and a correction outranks any
  amount of subsequent inference — the synthesis pass does not get to re-derive
  a trait the person struck out.
- **Withdrawal is real.** Turning the feature off removes the profile from the
  companion's context, and offers deletion of the derived document. A disabled
  feature whose output keeps being read is not disabled.

## Cadence and drift

Re-synthesise on a slow cadence — the profile is a long-window instrument, and
running it after every session produces churn that reads as instability in the
person rather than in the method. Each run supersedes the previous document
rather than appending to it, and it re-derives from the tallies rather than from
the last profile, because a synthesis that reads its own previous output
compounds its errors and calls the compounding confirmation.

State the window on the document, along with the run date. A profile with no
window is not interpretable at all: "usually delegates" over ninety days and
over three years are different claims, and the second may be false while the
first is true.

## When not to use this

Do not build this for an agent with multiple users, and do not build it at all
in a workplace context without the separate discipline that governs measuring
people who did not choose the measurement — the one-person, one-audience,
opt-in case is the *only* case this technique is written for, and it is the only
case in which the person disputing the profile is also the person who can turn
it off. And do not build it early. A profile over a thin history is a fabrication
with a clock on it, and the first version the person ever sees is the one that
decides whether the feature survives.

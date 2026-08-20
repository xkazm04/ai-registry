---
layer: technique
type: technique
subject: silver-medalist-rediscovery
technique: person-level-consent-collapse
status: forged
laws: [absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate, every-decision-names-its-actor]
shared_with: []
use_when: [checking whether a past candidate may be re-contacted, reconciling consent across several applications by one person, deciding what an anonymised record means for a live sweep]
---

# Person-level consent collapse

One human being who applied to you four times is four records. Each has its
own consent fields, its own retention clock, its own state of redaction — and
the record that happens to match a new opening is often the newest and
emptiest of them. Evaluating re-contact eligibility on that record alone is
the single most common way a rediscovery system contacts someone who told it
to stop.

The technique is to collapse every record belonging to the same person into
one eligibility decision before any contact path runs, using a collapse rule
that is deliberately asymmetric.

## The collapse rule

**1. Anonymisation is terminal.** If any record for this person has been
anonymised, the person is out of rediscovery permanently. No recency rule, no
quorum, no "the newer record has fresh consent" override. Anonymisation exists
to sever the link between data and a human; treating it as one input among
several is an attempt to reconstruct exactly what it removed. In practice this
also means the collapse must run before you try to identify the person at all,
and that an anonymised record ends the evaluation rather than contributing to
it.

**2. Prohibitions dominate.** A suppression, an opt-out, a do-not-contact or a
withdrawal of consent recorded on any record governs every record. The person
expressed a wish about being contacted by you; which application they happened
to express it against is an artefact of your schema and means nothing to them.
This is the clause that stops a new role's blank record from overriding a
refusal set elsewhere.

**3. Grants union.** An explicit permission recorded anywhere is a permission,
and a blank field elsewhere is silence, not refusal
([absence-of-evidence-is-not-evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).
Requiring the matched record to carry its own grant sounds conservative and is
actually just a bug that hides people who did consent.

The asymmetry is the point, and it is easy to get backwards. Permissions take
the most permissive value across records; prohibitions take the most
restrictive. Anything that treats consent as a single field with a single
merge direction will be wrong in one of the two directions, and the direction
it is wrong in will be the one that generates the incident.

## Grants expire; prohibitions do not

A permission carries a clock — it was given at a moment, for a purpose, with a
disclosed horizon, and it lapses. A refusal carries no clock: nobody has ever
opted out "for twelve months". So the collapse evaluates grants against their
expiry and prohibitions unconditionally, and a lapsed grant collapses to
absence rather than to refusal — meaning the person is not contactable under
that basis, but they have not opted out either, and the distinction matters
for what you may do with the record otherwise.

Which clock a record runs on, what the person was told, and what survives an
erasure request are owned by the consent-and-retention discipline, and this
technique re-teaches none of it. What it adds is the fan-out: whatever that
discipline decides about one record must be evaluated across all of a person's
records at the moment of contact.

## Identity resolution and the direction of doubt

The collapse presupposes an answer to "which records are the same person",
which is genuinely hard: a personal email on one application and a work email
on another, a changed surname, a phone number reused within a household. That
question belongs to identity-and-staleness. This technique needs only its
output plus one rule of its own.

**When the identity match is uncertain, resolve toward suppression**
([uncertainty-resolves-toward-the-candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)).
If a probable-match record carries an opt-out, honour it; if a probable-match
record carries a grant, do not rely on it. The costs are asymmetric: failing
to contact someone who would have welcomed it is a missed opportunity, while
contacting someone who told you to stop is a broken promise, and often a
reportable one.

## One gate, consulted by every path

The collapse must sit behind a single gate that every unsolicited-contact path
calls — the sweep, the digest, the bulk campaign, the single message a
recruiter sends from a profile, the automated nudge. Systems accumulate
contact paths faster than anyone tracks, and the failure is never the path
that was built with the feature; it is the third one, added later, by someone
who did not know the gate existed.

Two structural defences. Put the gate at the narrowest point the message
actually passes through, so a new path cannot route around it without
obviously reimplementing something. And make the gate's refusal explicit and
logged, naming which record and which prohibition produced it
([every-decision-names-its-actor](../../_laws.md#every-decision-names-its-actor))
— a suppression that silently drops a name is indistinguishable from a bug,
and the day someone asks whether you honoured an opt-out you will need the
answer.

## Decision rules

- Any anonymised record for the person: exclude, permanently, before anything
  else runs.
- Any prohibition on any record: exclude.
- No prohibition and at least one live grant on any record: eligible.
- Grants existed and all have lapsed: not contactable by rediscovery. The
  person once told you how long you could keep them; the window closed. Do not
  infer refusal from it, and do not infer permission either.
- No grant was ever recorded on any record, because the person never applied:
  this is not rediscovery at all. They are a sourcing target, contactable on
  whatever basis you use for cold sourcing, and the distinction between "never
  gave one" and "gave one that lapsed" must survive the collapse — merging
  them into a single empty state either blocks all cold sourcing or silently
  re-enables contact to people whose consent expired.
- Identity match uncertain: apply prohibitions, ignore grants.
- The consent state cannot be read at all — a failed lookup, an unavailable
  store: **suppress**. Fail closed and log it. A message not sent is
  recoverable next week; a message sent to someone who withdrew is not
  recoverable at all, and an availability problem is a terrible reason to
  discover that asymmetry.
- Every exclusion is logged with its cause; every inclusion can name the
  record whose grant carried it.

## When not to use it

The collapse governs *unsolicited* re-contact. It is the wrong gate for a
response to something the person initiated — a reply to their own message, an
answer to a question they asked, a transactional confirmation they are owed.
Running the outreach suppression check over those produces the absurd result
that someone who opted out of marketing cannot be answered when they write to
you, which is both bad service and, in most regimes, not what the opt-out
covered.

It is also not a substitute for the lawful-basis analysis. The collapse tells
you whether this person may be approached; it says nothing about whether you
were entitled to hold the record you are approaching them from.

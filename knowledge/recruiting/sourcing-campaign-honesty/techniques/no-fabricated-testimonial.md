---
layer: technique
type: technique
subject: sourcing-campaign-honesty
technique: no-fabricated-testimonial
status: forged
laws: [every-decision-names-its-actor, say-only-what-the-record-holds]
shared_with: []
use_when: [someone asks for an employee-voice or day-in-the-life campaign asset, deciding which copy formats a generator may offer, reviewing a hook menu before it ships]
---

# No fabricated testimonial

The concern: a class of copy format whose value depends on a property the
generator cannot have — a real person's first-hand experience — and which
therefore cannot be produced honestly at any level of care. The control is to
**remove the format from what can be requested**, not to constrain how it is
written.

## The load-bearing claim

A testimonial persuades because a specific human being with something to lose
said a specific thing about working somewhere. Strip that and nothing remains:
the sentences of a testimonial carry almost no information on their own — "the
team is supportive, I've grown a lot, my manager backs me" is content-free
except as evidence about the speaker.

A generated testimonial is therefore not a sentence that happens to be
unverified. It is a **fabricated attributed statement** — a quotation put in
the mouth of a workforce that did not say it, published by their employer.
That is a different kind of object from an unverified claim about a benefit,
and it does not have a correct wording, because [every decision names its
actor](../../_laws.md#every-decision-names-its-actor) applies to speech acts
too: a statement attributed to an employee whose actor is a generator has been
mislabelled at its root. The prose is not the problem; the format is.

This is why the standard mitigations all fail:

- **Hedging the attribution** — "many of our engineers say", "a typical day
  here" — keeps the fabrication and adds evasion. The reader still receives
  it as testimony.
- **Composite personas** — "an amalgam of real team members" — is a
  fabrication with a methodology, and the methodology is never on the asset.
- **Labelling it illustrative** — the label survives approximately one
  repost, and the format was chosen precisely because it does not read as
  marketing.
- **Reviewing it carefully** — the reviewer's job would be to confirm that a
  quotation nobody uttered accurately represents an experience nobody
  reported. There is nothing to check against.

## Procedure

1. **Audit the format menu, not the outputs.** List every asset type the
   generator can produce and ask of each: *what makes this persuasive?* Where
   the answer is "that a real person experienced it", "that someone endorses
   it", or "that it was measured", the format needs a source of that property
   or it does not ship.
2. **Delete the unsourceable formats from the taxonomy.** Not disabled behind
   a flag, not gated on a confirmation dialog — absent from the closed set of
   things the generator produces. A format reachable under pressure will be
   reached under pressure.
3. **Record the exclusion and its reason next to the taxonomy**, because the
   omission looks like an oversight to the next person, and the highest-
   converting format is proposed again in every campaign review. The reasoning
   — the format itself is the problem, not the wording — has to be as durable
   as the list.
4. **Provide the honest substitute.** Testimonials are legitimate and valuable
   when collected: a named employee, consenting to a specific quotation for a
   specific use, with a review path if they leave. That is an *asset intake*
   workflow, not a generation workflow, and offering it is what stops the
   exclusion feeling like an obstruction.
5. **Keep the same rule for adjacent fabrications** — invented awards,
   invented rankings, invented candidate outcomes, invented "our last three
   hires were promoted within a year". All are the same move: a claim whose
   persuasive force comes from being a record of something that happened.

## Decision rules

- **When the persuasive property cannot be supplied, remove the format.**
  The general form of this technique, and the only control that survives an
  operator who wants the output badly.
- **First-person plural is the employer speaking; first-person singular is a
  person speaking.** The generator may write "we build X" — that is the
  employer asserting a fact about itself, sourced from the fact set. It may
  not write "I love building X here". The grammatical boundary is a usable
  guardrail in a review checklist.
- **A quotation mark in generated recruitment copy is a defect until proven
  otherwise.** Cheap, mechanical, catches the regression when someone adds a
  narrative format later.
- **An attributed asset carries its consent.** A real testimonial that cannot
  name who said it, and show that they agreed to this use, is operationally
  identical to a fabricated one. Per [say only what the record
  holds](../../_laws.md#say-only-what-the-record-holds), if the consent is not
  recorded, the quotation is not usable.
- **Exclusion is not deprivation.** The honest angles — what the team builds,
  what the first months contain, what the role is measured on — are available
  from the fact set and convert well. The taxonomy loses one hook, not the
  campaign.

## When not to use it

- **Not against genuine, sourced employee content.** A collected quotation,
  attributed and consented, is the goal, not the enemy. This technique
  forbids *generating* testimony, not *publishing* it.
- **Not as an argument against a generator drafting around a real quote.**
  Given a sourced quotation as an input fact, arranging copy around it is
  ordinary work, provided the quote itself passes through unaltered — a
  paraphrased testimonial is a fabricated one.
- **Not extended into a ban on all narrative.** A second-person description
  of the work ("in your first month you will…") sourced from stated
  responsibilities is a claim about the role, checkable against the record,
  and belongs in the taxonomy. The line is attribution to a person, not
  vividness.

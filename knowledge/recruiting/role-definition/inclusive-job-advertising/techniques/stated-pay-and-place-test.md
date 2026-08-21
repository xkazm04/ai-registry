---
layer: technique
type: technique
subject: inclusive-job-advertising
technique: stated-pay-and-place-test
status: forged
laws: [say-only-what-the-record-holds, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [deciding whether a posting really discloses pay, a posting says flexible or hybrid without a location, wiring a publication gate on required disclosures]
---

# Stated pay and place test

The concern: distinguishing a **disclosure** from a **phrase that gestures at
one**. Pay and place are the two facts a reader most wants and the two most
often replaced by a gesture, and the gesture is what makes an otherwise
well-written posting fail to convert. The test is mechanical and deliberately
narrow: a statement counts only if it is *concrete*.

## What counts as stated pay

A pay statement must contain, in the posting body the reader sees:

- **a figure or a range** — digits, or a written number, with thousands
  separators handled;
- **a currency**, as symbol or code;
- **a period** — per year, per month, per day, per hour — because a bare
  number is ambiguous across markets and a monthly figure read as annual is a
  worse outcome than silence.

Nothing else qualifies. *Competitive*, *attractive*, *market rate*, *depending
on experience*, *up to a generous package* are all zero. A range with no upper
bound is not a range. A range so wide it contains every plausible answer is a
gesture in a number's clothes: the working test is that the top of the band
should not exceed the bottom by more than roughly half, and a band that must be
wider needs an explanation in the text of what moves a candidate through it.

Two adjacent facts are not pay and must not be allowed to satisfy the test:
**equity** and **bonus** and **benefits** are additional disclosures, valuable
but not substitutes; and a **pay-transparency legal minimum** is a floor on the
disclosure, not a definition of it.

Where the figure comes from — the market data, the internal band, the
levelling — belongs to the compensation-banding discipline. This technique
only asks whether what arrived is concrete, and refuses to accept a phrase in
its place.

## What counts as stated place

A place statement must contain either:

- **a named location** — a city, a named site, an office — at the granularity
  a reader can commute to or relocate to; or
- **an explicit remote statement with its boundary**: which country or
  countries, which timezone band or required overlap hours, and — for hybrid —
  how many days on site and *where that site is*.

*Flexible*, *hybrid*, *remote-friendly*, *location agnostic* are all zero on
their own. "Hybrid" without a site is the single most common place gesture and
the most expensive, because it silently requires proximity to an unnamed place;
every reader outside commuting distance either self-selects out or applies and
is wasted.

## Procedure

1. **Test what the reader will actually receive**, which is not the same as
   the prose in front of the author. A posting whose *published artifact*
   carries a structured band renders a figure to the reader even when the
   description never spells one out; nagging its author for a missing salary
   is a false finding, and false findings on the most important check are the
   most expensive kind. So the test takes two inputs — the prose, and a
   *fact-availability* signal from the structured record — and reports missing
   only when both are empty.
2. **Derive that availability signal from one shared rule.** Every surface that
   asks "does this role have a salary" — the author's panel, the read-view, the
   public page's editor, the publication gate — calls the same predicate over
   the same artifact shape. Two implementations will disagree within a release,
   and the writer will conclude both are unreliable.
3. **Suppression is not satisfaction.** A suppressed prose finding means the
   figure arrives by another route, not that the concreteness test passed. If
   the structured band is itself a default or an assumed anchor rather than a
   decided one, the suppression is laundering an absence into a silence, and
   the availability predicate must say so.
4. **Return three states, not two**: stated, absent, or gestured-at. The third
   is the actionable one — it means the writer tried, and the finding can name
   the phrase that has to become a number.
5. **Gate publication only on policy-required disclosures**, and gate them on
   the concrete test rather than on the field being non-empty. A required pay
   field satisfied by the string "competitive" is a compliance record that
   documents its own failure.
6. **When the fact is not decided, block and escalate.** The output of an
   undecided band is a posting that is not ready, routed to whoever can decide
   — never a posting with a euphemism in the slot.

## Decision rules

- **A phrase never satisfies a fact test.** This is the whole rule and it is
  worth stating alone, because every failure of this technique is an exception
  granted to a phrase somebody liked.
- **Absent renders as absent.** Per [absence of evidence is not
  evidence](../../../_laws.md#absence-of-evidence-is-not-evidence), a posting with
  no recorded band shows the author an explicit *no band stated*, never a blank
  that reads as fine and never a defaulted figure. Downstream surfaces that ask
  "does this role have a salary" get the same three-state answer.
- **Never synthesize the missing figure.** Per [say only what the record
  holds](../../../_laws.md#say-only-what-the-record-holds), an assumed or
  market-derived-but-unapproved number must not appear in the advertisement.
  A defaulted value is absent from the copy. This is the same boundary the
  outbound-campaign discipline enforces on messages, and the two sides of the
  seam must state it identically or a value blocked in one surface leaks
  through the other.
- **Concreteness is not precision theatre.** A stated band of "£52,000–£61,000
  per year" is a disclosure. "£52,140" for a role with a band is false
  precision that will be renegotiated, and it teaches the reader the number is
  not a band. State the band you have.
- **Place granularity follows what the reader must decide.** A country is
  enough for a fully remote role bounded by employment entity; a city is
  required the moment any attendance is expected.

## When not to use it

- **Not as a hard block where disclosure is optional and the employer has
  decided against it.** The lint still reports the conversion cost; the gate is
  a policy decision that belongs to the organization, and pretending otherwise
  gets the check switched off.
- **Not to validate the band's correctness.** Whether the band is right for the
  market and internally equitable is the compensation discipline's question.
  This test cannot tell a defensible band from an indefensible one — only a
  stated one from a gestured one.
- **Not on internal-only or confidential postings**, where the audience and the
  disclosure obligations differ. Scope the gate to what is actually published.

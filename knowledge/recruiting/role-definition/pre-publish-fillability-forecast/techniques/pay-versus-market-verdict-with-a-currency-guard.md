---
layer: technique
type: technique
subject: pre-publish-fillability-forecast
technique: pay-versus-market-verdict-with-a-currency-guard
status: forged
laws: [absence-of-evidence-is-not-evidence, a-claim-carries-its-sample-and-its-basis, say-only-what-the-record-holds]
shared_with: []
use_when: [telling a recruiter their range is below market before the role publishes, a role and its market band are denominated differently, deciding the default state of a below-market flag]
---

# Pay versus market, with a currency guard

Compensation cannot be counterfactualled the way requirements can — you cannot
re-score a pool "with the salary raised" and learn anything, because what each
person would accept is mostly unrecorded and what they said once is stale. Pay
enters the fillability forecast as a **verdict against a band**: a small,
conservative, three-state judgment rendered before publication, when the range
is still editable.

## The verdict

**Below market when the top of the role's stated range sits under the floor of
the comparable band.** Not midpoint against midpoint, not top against midpoint.
The strict form is chosen deliberately for two reasons:

- It is **conservative**. It fires only when there is no overlap at all —
  when nobody paid at the bottom of the market could be hired at the top of
  what this role offers. That is a claim a recruiter can take to a hiring
  manager without being argued out of it in one sentence.
- It is **actionable**. Every softer test ("your midpoint is a little low")
  produces a flag on most roles, and a flag that fires on most roles is
  furniture.

Where the band comes from — its comparability, its sample size, its sources,
the rules that govern publishing it — is the compensation banding discipline,
not this one. This technique consumes a band that already knows its own
provenance and refuses to render a verdict against a band that does not
([a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

## The currency guard

When the role's currency and the band's currency differ and no trustworthy
conversion is available at the time of the comparison, the verdict is
**unknown — null, not false**.

This is the rule most likely to be quietly broken by an implementation, because
the natural type for "is below market" is a boolean, and a boolean has no room
for "cannot say". What happens next is deterministic: the unanswerable
comparison falls through to the default, the default is "not below market", and
the interface renders the reassuring absence of a warning. A recruiter publishes
a role paying well under local market having been shown a clean screen. The
system did not lie in any single line of code; the type did
([absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).

Rules that follow:

1. **Three states, and the third is rendered.** Below, not below, cannot say.
   The third gets its own sentence naming the reason — "the role is quoted in a
   different currency to the comparable band, so no comparison was made" — not
   a greyed-out control.
2. **A conversion is only trustworthy if it is dated and sourced.** An
   unattributed rate, or a hard-coded one, converts an unknown into a confident
   wrong answer. If the record does not hold a conversion, the verdict stays
   silent ([say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)).
3. **Comparability is one shared predicate, not a comparison written twice.**
   Whether two currencies are directly comparable is a single normalised test —
   case- and whitespace-insensitive, with an absent value normalising to
   nothing rather than matching anything — defined once and mirrored wherever
   the verdict is computed or rendered. Two independently written
   currency-equality checks on either side of a language or service boundary
   will disagree eventually, and the disagreement surfaces as a verdict shown
   in one place and silenced in another.
4. **Silence propagates to the surface.** The presentation layer renders
   nothing at all for an unknown verdict rather than falling back to the
   reassuring card. A null that becomes a "not below market" badge two layers
   later has undone the whole guard.
5. **Silence propagates in aggregate.** Anything downstream that aggregates the verdict — a
   dashboard of below-market roles, a count, a rate — must treat unknown as its
   own category and never fold it into the negative side. A count of
   "roles below market" computed over a population where a third of the
   verdicts were unknown is a fabricated statistic.
6. **The guard generalises past currency.** Any dimension along which the role
   and the band are not comparable — a period mismatch of hourly against
   annual, a gross-versus-net difference, a different geography or seniority —
   triggers the same silence. Currency is merely the case that shows up first
   and is easiest to detect.

## Presentation and the missing apply button

The pay verdict is deliberately the one recommendation in a fillability
forecast with **no one-click apply**. The band is grounded — it carries a
sample and sources — while any specific number a recruiter would type into the
range is not. Offering to write a suggested figure into the requisition would
give a hand-formed number the provenance of a computed one, and the recruiter
who later defends the range would be citing evidence that never applied to it.
Show the verdict, show the band and its basis, and let the human type the
number themselves. `staged-suggestion-never-auto-applied` carries the general
form of this rule.

## When not to use this

- **When no comparable band exists** for the role, level and geography. A
  verdict against a band assembled from unlike roles is worse than no verdict,
  because it is quotable.
- **When the range is not the offer.** In markets where the posted range is
  ceremonial and the real number is negotiated, the verdict describes a
  document rather than an offer. It still has value as an advertising
  diagnostic — candidates read the posted range — but it must be worded as
  being about the posting.
- **When total compensation dominates.** Where equity, bonus or benefits carry
  most of the value, a base-only comparison against a base-only band is
  meaningful, and against a total-compensation band is not. Comparability is
  the whole precondition; check it before rendering, not after being
  challenged.

---
layer: technique
type: technique
subject: compensation-banding-and-market-honesty
technique: currency-lock-and-no-silent-conversion
status: forged
laws: [absence-of-evidence-is-not-evidence, say-only-what-the-record-holds, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [asking a model to price a role outside the dominant market, comparing a role's range against a band, a pay figure looks plausible but the market is not the default one]
---

# Currency lock, and no silent conversion

A pay figure carries three inseparable facts: the amount, the currency, and the
period. Lose either of the last two and the amount is not merely imprecise, it
is off by a factor large enough to invert every decision downstream — and it
still looks like a normal number.

## The default-currency pull

When a language model is asked to price a role in a market that is not the
dominant one in its training distribution, it drifts toward the dominant
currency. This is not a bug of one model; it is a property of the
distribution, it reproduces across model families, and it is strongest exactly
where it hurts most — smaller markets, where local figures are scarcer in the
data and the pull is least resisted.

The failure is nastier than a wrong answer, because the rest of the answer is
often excellent: correct role reasoning, correct seniority reading, correct
regional commentary — denominated in the wrong currency. Nothing about the
output looks degraded. A reviewer skimming for quality passes it.

The fix has three parts and all three are necessary:

1. **Inject the currency and the period into the prompt as an explicit
   constraint**, taken from the market's configuration record — never
   hard-coded into the prompt text. A prompt with a hard-coded currency is
   correct for exactly one market and silently wrong for every other, and it
   will be reused for another market within the month.
2. **Constrain the output shape** so the currency is a required field of the
   response, not an inference from prose. A figure without a declared currency
   cannot be validated.
3. **Validate on the way back.** Reject a response whose declared currency is
   not the market's. Also reject on **magnitude**: every market configuration
   carries a plausibility ceiling, and a figure past it is usually a
   wrong-currency answer wearing the right currency's label — the second-order
   version of the same failure, and the only one that catches a model that was
   told the currency and complied in the field while pricing in its head.

## No silent conversion

When two figures are denominated differently, the temptation is to convert and
compare. The rule: **nothing converts unless the record holds a dated, sourced
rate.**

An unattributed or hard-coded rate does not produce an approximate answer, it
produces a confident wrong one — and a confident wrong answer is strictly worse
than a refusal, because a refusal gets escalated and a wrong answer gets acted
on ([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)).

When conversion is unavailable, the comparison **does not happen** and the
result is a third state — not false, not zero, not a hidden control. The
natural type for "is this below market" is a boolean, and a boolean has nowhere
to put "cannot say", so the unanswerable case falls through to the default,
the default reads as reassuring, and the warning that should have fired is
silently absent. That is the same failure the neighbouring fillability forecast
guards against with its currency guard; here it is the *producer* side, and the
rule is the mirror image — do not emit a comparable-looking figure across an
incomparable gap ([absence of evidence is not
evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).

## The lock generalises past currency

Currency is only the first and most detectable incomparability. All of these
trigger the same silence:

- **Period** — hourly against monthly against annual. Detectable, and
  convertible only if the assumed hours are recorded, which they usually are
  not.
- **Gross against net** — not convertible at all without the individual's tax
  position, and never worth attempting.
- **Base against total compensation** — the largest gap in equity-heavy or
  commission-heavy markets, and the one least often declared.
- **Geography and seniority** — a band for a different market or a different
  anchor is not a band for this role.

Each of these is a dimension of the comparability precondition, and the
precondition is checked *before rendering*, not after being challenged. A
verdict may only be rendered against what it actually judged ([a verdict is
bound to what it judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged)).

## One comparability predicate, defined once

Whether two figures are comparable is a **single shared predicate** — case- and
whitespace-insensitive on the currency code, with an absent value normalising
to nothing rather than matching anything — defined in one place and reused
wherever the comparison is computed or displayed.

Two independently written currency-equality checks on either side of a language
or service boundary will disagree eventually, and the disagreement surfaces as
a figure shown in one screen and suppressed in another, which destroys trust in
both. An absent currency that matches anything is the specific bug to guard
against: it makes every incomparable pair look comparable.

Where a single definition genuinely cannot span the boundary — two runtimes,
two languages, a benchmark file and a service that reads it — the substitute is
not care, it is a **guard test that fails the build when the two declarations
disagree**. The market's currency in the service, the currency in the
presentation layer, and the currency of every row in the benchmark corpus are
pinned equal by an executing check, not by a comment asking people to remember.
A convention that lives only in prose has a half-life of about one onboarding.

## The stranded literal

The most damaging currency defect is not a wrong code, it is **right code,
wrong magnitudes**. Money constants written for one market — default bands, a
plausibility ceiling, a rounding grain, a premium clamp — left in place while
the currency label is taken from whichever market is active, produce a figure
whose number belongs to one country and whose unit belongs to another.

The output is not malformed. It is a clean, confident, candidate-facing figure
wrong by a factor of ten or twenty-five, and wrong in the flattering direction,
so it reads as an unusually generous offer rather than as a bug. Nothing in a
type system catches it: both halves are individually valid.

The rule that closes it: **every constant denominated in money lives in the
market record, beside the currency it is denominated in, and nowhere else.**
When a new market is defined, each of those constants is a field the definition
demands — so the act of adding a market forces the question "what is this
number here?" for every one of them. A money constant defined outside the
market record is a defect regardless of whether it is currently wrong.

## Decision rules

- When prompting for a price, **pass the currency and period from the market
  record** and validate the returned currency and magnitude. Never hard-code.
- When currencies differ and no dated, sourced rate exists, **emit no
  comparison** and render a sentence saying why — not a blank space.
- When an unknown propagates into an aggregate — a count of below-market roles,
  a dashboard rate — **unknown is its own category**, never folded into the
  negative side. A rate computed over a population a third of which was
  unknown is fabricated.
- When a figure exceeds the market's plausibility ceiling, **fail the figure**,
  and treat a ceiling that fires as a defect report on the derivation or the
  configuration — not as a threshold to raise.
- When adding a new market, the currency, the period and the ceiling are
  **required at creation**. A market that can be created without them will be.

## When not to use this

- **A single-currency, single-period deployment** genuinely does not need the
  conversion machinery — but it does need the currency stored on the figure,
  because the second market always arrives, and retrofitting a currency column
  onto historical rows with no recorded denomination is unrecoverable.
- **Where a treasury-grade dated rate is genuinely available and audited**,
  conversion is legitimate; record the rate and its date on the derived row and
  it becomes ordinary provenance rather than a silent conversion.

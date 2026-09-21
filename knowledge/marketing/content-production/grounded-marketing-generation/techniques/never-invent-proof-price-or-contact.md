---
layer: technique
type: technique
subject: grounded-marketing-generation
technique: never-invent-proof-price-or-contact
status: forged
laws: [never-invent-proof, label-convention-as-convention]
shared_with: []
use_when: [writing the prohibition block of a marketing prompt, handling a missing proof or price during generation, reviewing generated copy or a generated recommendation for fabricated specifics]
---

# Never invent proof, price or contact

The generator may not produce any of the following unless the business supplied it:
a number of any kind (customers, years, percentages, savings, ratings, review counts,
statistics), a price or price band, a discount or promotion, a guarantee, a
certification or licence, a delivery or dispatch date, an address, a phone number, an
e-mail, a review or a quoted customer, a competitor fact, a media mention, or an
external benchmark. The list is the set of things a reader acts on and a customer or
regulator holds the business to. Everything else - benefit framing, audience fit,
calls to action, structure - is the model's to compose.

## The two honest behaviours on a missing item

1. **Ask.** Some things cannot be looked up: the licence number, the average job
   value, whether the business serves a city, how many reviews it has. Stop and put
   one direct question to the owner, in plain words, saying why it is needed. Every
   unanswered question lands in the output as an open question, never as a blank.
2. **Leave an explicit empty slot.** When the surface can render absence - a proof
   line with no number, a claim headline omitted, a shipping clause dropped - do that,
   and let the copy around it say less. A page assembled before proof arrived carries a
   marker at the top that cannot be mistaken for copy ("written without real proof -
   swap in your numbers and reviews before publishing"), so it cannot ship by accident.

Three failure modes are banned outright: guessing a plausible value, leaving the slot
empty with no note, and quietly skipping the item. A disclaimer wrapped around a
fabricated value is not a fourth option; it is the first failure mode with a caveat.

## Where the rule reaches beyond copy

- **Recommendations.** A generated diagnosis or plan derives every threshold from the
  numbers it was handed and says how it derived it, or omits the threshold. It never
  imports "industry averages" or "common standards", because those are a benchmark
  the data did not contain and the reader cannot audit. A recommendation that must
  rest on convention says so ([label convention as convention](../../../_laws.md#label-convention-as-convention)).
- **Replies to customers.** No promise of a price, a date, a discount or an outcome
  not in the sources, no invented staff names, and a listed risk whenever the reply
  touches money, health, law, a complaint or a number. The non-empty risk list is the
  lever an auto-send gate reads; the model's self-reported confidence is not.
- **Experiment pages.** Arms of a test print no numbers at all, not only because they
  would be invented but because a page that displays its own score stops producing
  independent trials.
- **Comparison pages.** Criteria and structure are the model's; competitor facts are
  never.
- **The ad-copy floor.** A deterministic fallback that writes ads without a model
  asserts a shipping, rating, returns or dispatch claim only when the field arrived
  with a value; an absent field omits the line. Watch the *demo* variant of the same
  tool: it is the path most likely to carry a hardcoded promise, and it is the path a
  prospect sees first.

## Decision rules

- When a claim would make the copy stronger and the business did not supply it, the
  copy gets weaker, not the claim invented. Strength is the owner's to add.
- When the brief carries a number, the copy may use *that* number verbatim and no
  derived or rounded variant of it that changes its meaning ("over 200" for 212 is
  fine; "hundreds of five-star reviews" for 212 reviews at 4.6 is not).
- When a value is present but its provenance bit says illustrative, treat it as
  absent for the purpose of claims and use it only to set register and generality.
- When proof is present but thin - one review, a single job - it is shown as what it
  is, first person and specific, never inflated into a pattern ("customers love").
- When the rule conflicts with a platform's appetite for specifics (ad strength
  scoring rewards numbers), the rule wins and the gap is reported to the owner as a
  question, because a fabricated specific costs more than a weaker strength score.

## When not to use this

Do not apply the rule to numbers that are *structural to the format* rather than
claims about the business: "3-5 bullets", "one call to action", a character limit, a
step count in a process description. Do not apply it to a *question* the copy asks
the reader ("How many hours a week do you lose to invoicing?") as long as the question
asserts nothing. Do not use it to strip supplied proof because it looks too good;
verification of supplied proof is the owner's responsibility and the surface's, and
belongs to `honest-proof-and-illustrative-data`, not to the generator.

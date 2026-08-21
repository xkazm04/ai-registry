---
layer: technique
type: technique
subject: organizational-grant-readiness
technique: registry-grounded-autofill
status: forged
laws: [never-fabricate-a-figure, provenance-per-field]
shared_with: []
use_when: [pre-filling an applicant profile from one user-supplied input, wiring a research model or registry API into onboarding, an autofilled field shipped a wrong or unsourced value]
---

# Registry-grounded autofill

The technique turns onboarding from data entry into review: the applicant
supplies one thing they know cold — a name, a website, a registry
identifier — and a research step grounded in authoritative registries fills
the profile with *sourced proposals*, never facts. Its two commitments are
inseparable: every non-null value carries a confidence and a source, and any
value that cannot be grounded is returned as null with an explanation rather
than a plausible guess.

## Procedure

1. **Classify the input client-side, cheaply and purely.** Shape and
   checksum identify registry-identifier formats; a dotted host with no
   spaces is a website; everything else is a name. The classifier also seeds
   a jurisdiction (a country-coded domain suffix, or the market picker's
   hint). Its output only biases the research step, which may override it —
   but the bias lets the prompt and the UI specialize before anything
   expensive runs.
2. **Branch on uniqueness.** A website or a registry number pins exactly one
   organization: instruct the research step to fetch that single
   authoritative source directly and skip broad searching entirely. A bare
   name does not pin anything and enters the disambiguation path instead
   (its own technique). This branch is both a speed and a safety decision —
   unique inputs get faster, ambiguous inputs get humbler.
3. **Compose lookup guidance from the jurisdiction model, not the prompt.**
   The per-market knowledge — which registry is authoritative, what the
   identifier formats and examples are, which entity-form codes are valid,
   where a model should actually look — lives in a jurisdiction registry
   and is rendered into the prompt. Adding a market then extends autofill
   with no prompt rewrite, and the prompt can state "valid codes for this
   market are exactly these" instead of letting the model invent one.
4. **Demand a strict output contract.** One structured object; per field
   `{value, confidence, source}`; a notes array for caveats (original
   currency and filing year of a converted revenue figure); a sources array
   of every location actually consulted — a non-empty sources list is the
   working proxy for "this was grounded, not recalled". The contract states
   the anti-fabrication rule in imperative terms: never invent an
   identifier or a revenue figure; unverifiable means null, low confidence,
   and a note.
5. **Validate and normalize on receipt, trusting nothing.** Parse the
   response defensively; coerce each field through a typed validator
   (revenue through a human-notation parser, year through a range check,
   region through the canonical-code normalizer). Then compute the
   needs-input list mechanically: every required field whose value is null
   *or whose confidence is low* goes on it. Low-confidence is treated as
   missing on purpose — a weak guess pre-filled as if solid is the exact
   failure the pipeline exists to prevent.
6. **Render review, not results.** Each field shows its tag —
   confident-and-cited, please-confirm, or please-provide — and the human
   confirms before anything persists. Confirmation is the step that converts
   a proposal into the organization's own claim.

## Decision rules

- **When the research step cannot verify a value from a source, return
  null, because** a blank the applicant fills in costs a minute; a wrong
  registry identifier they accept can invalidate a submission.
- **When a value comes from an aggregator and the authoritative registry
  disagrees or is silent, prefer the registry, because** aggregators lag
  and merge; identifiers and financials take authority-grade sourcing only.
- **When latency matters more than completeness** (the applicant is mid-flow
  toward matching, not completing a full profile), **run a declared fast
  mode: identity, location and mission keywords only, deep-fetch fields
  explicitly null, because** the fields that require reading filings
  dominate lookup time and can be collected later without blocking value.
- **When confidence is assigned, tie it to source class, because**
  "high" must mean "directly from an authoritative source for this exact
  entity", "medium" inferred or secondary, "low" a weak guess — a
  confidence scale untethered from sourcing decays into vibes.

## When not to use

Do not autofill fields that have no external source of truth — an authored
mission statement can be *proposed* from the organization's materials but
never marked confident, and voice must not be fabricated at all. Do not use
this pipeline for adversarial contexts (verifying a counterparty rather
than helping an applicant describe themselves): review-by-the-subject is
the safety mechanism here, and it is absent when the subject is not the one
reviewing. And skip the research step entirely when the applicant pastes a
value they are certain of — autofill exists to remove work, not to
second-guess a director typing their own registered name.

---
layer: technique
type: technique
subject: generative-provider-routing
technique: vendor-fact-ledger
status: forged
laws: [unmeasured-is-not-pass, cost-per-usable-output]
shared_with: []
use_when: [integrating a new generation vendor, a billing or response field changed shape, a price is needed for a model nobody measured]
---

# Vendor fact ledger

Generation vendors are moving targets wearing stable logos. Endpoints get
replaced wholesale while old documentation stays up; billing fields are
renamed mid-transition and arrive as strings in one response and numbers in
another; model identifiers differ between API versions; safety-block shapes
go entirely undocumented; rate limits exist but are published nowhere. Every
one of these facts gets re-researched — expensively, under incident pressure
— unless it is written down *with how it was verified and when*. The ledger
is that record: one curated page per vendor, owned next to the adapters,
treated as production configuration rather than as documentation.

## What a ledger entry is

A fact, its source class, and its date. The source class matters as much as
the fact, because it sets how far the fact can be trusted:

- **Measured here** — confirmed by this pipeline's own calls (a live probe, a
  billed batch). The strongest class; cite the run.
- **Verified against a working client** — copied from an implementation known
  to run in production, typically for the values that fail silently and
  expensively when guessed (model identifiers are the canonical case: two
  similarly named models with interchangeable-looking IDs, one of them
  misattributed in circulating search results).
- **Vendor-documented** — from the current official reference, with the date
  read. Weaker than it sounds: published docs routinely describe the *legacy*
  endpoint long after replacement, so an implementation written from memory
  or stale docs can be wrong in shape, not just in model name.
- **Third-party-sourced** — plausible, uncorroborated. Recorded, explicitly
  labelled, and never load-bearing for money until upgraded: a billing-field
  path known only from a forum post gets a "confirm against a live response
  before trusting for billing" note in the ledger, not a place in the
  invoice arithmetic.

Dated facts decay visibly. A `checked:` date two quarters old on a billing
row is a prompt to re-verify, not a reason to trust.

## What belongs in it

The facts that route requests and money, not a mirror of vendor docs:
endpoint and auth shapes; exact model identifiers per API version; request
caps (prompt length — budgeted to the *lowest* version in use when prompt
building is shared); billing field spellings and units, with coercion notes
where amounts arrive as strings or where confusing unit A for unit B would
mis-report by orders of magnitude; concurrency and rate-limit behaviour,
including "unpublished — back off against an unknown ceiling" as a first-
class recorded fact; response quirks (output format restrictions, aspect
snapping that returns near-but-not-exact ratios); refusal presentation,
including the empty-success trap; and side-effect obligations — a vendor
that is also a *studio* leaves every API generation in the user's gallery,
so the adapter owes a delete-after-download contract, executed even when the
download throws, with the outcome reported on provenance rather than raised.

## Never invent a price

The pricing table is the ledger's sharpest section, and it runs on one rule:
**a price row either carries a figure with its source and check-date, or
carries no figure and the recorded reason there is none.** Unpriced is a
decision, not an omission — and unpriced is *not* free: a cost that is
structurally missing renders as blank, blank reads as zero, and zero is the
one thing a generation call certainly is not. The honest states are three,
and they travel with every cost figure downstream: *vendor-reported* (a
receipt — always outranks the table, so a stale rate can never overwrite
what the vendor actually said), *estimated* (this ledger's arithmetic,
labelled as such), and *unpriced* (with the reason attached). An estimate
presented as a receipt is the error worth structural prevention, because
downstream prints dollar signs without re-deriving where the number came
from — [unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass)
applied to money.

Two rules keep estimates honest:

- **A rate is bound to the conditions it was measured at.** Per-image prices
  can double per resolution step; a figure measured at one size does not
  carry to another, or to a call that pinned no size at all — those quote as
  unpriced, not at the wrong rate. Same for billing units: a per-token model
  has no per-call figure, and pretending otherwise fabricates one.
- **Own-spend-over-own-renders beats no number, and says so.** When a vendor
  publishes no per-image list price, a measured batch (total bill / render
  count) is a legitimate estimate — recorded as "our spend over our render
  count, not a rate card". It also feeds the usable-output economics that
  order the plan ([cost-per-usable-output](../../../_laws.md#cost-per-usable-output)).

## Decision rules

- One copy. A price or a model ID restated at a call site is a fact that
  rots; surfaces get ledger values through an interface, never by
  re-declaring them.
- When a pre-call estimate must stand in for an unknowable routing outcome,
  quote the *dearest* plausible rate — erring high is the right direction
  for a warning about money.
- On any billing discrepancy, the ledger is the first suspect: check the
  `checked:` date before debugging the code.

## When not to use this

Do not let the ledger grow into a vendor-docs mirror — an entry nobody's
code depends on is maintenance without a customer, and bulk-imported "facts"
carry the false authority of the verified ones beside them. And do not run
the discipline for a throwaway spike on free-tier calls; the ledger earns
its cost exactly when real money or production traffic crosses the wire.

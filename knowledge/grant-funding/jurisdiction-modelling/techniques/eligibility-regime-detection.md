---
layer: technique
type: technique
subject: jurisdiction-modelling
technique: eligibility-regime-detection
status: forged
laws: [hard-gates-precede-soft-scores, honest-null-over-forced-guess]
shared_with: []
use_when: [a shared eligibility gate must serve markets with and without applicant codes, deciding what an onboarding flow must collect in a given market, code-regime logic returned empty or default audiences in a new market]
---

# Eligibility regime detection

Markets split into two structurally different ways of deciding who may apply.
In a **code-based regime** the funder side publishes enumerated applicant
category codes per opportunity, and the gate is set intersection with the
codes the applicant may apply under. In a **legal-form regime** no funder-side
codes exist; the gate is a lookup of the applicant's registered legal form in
the jurisdiction's table of grant-eligible forms. This technique is the branch
between them: one predicate, derived from the profile itself, that every
shared consumer keys on.

## Detect from shape, not from a flag

Derive the regime from the profile's own structure: the jurisdiction runs the
legal-form regime when its declared eligible-code set is empty *and* it lists
entity types. Do not add a hand-maintained `regime` field. A structural
predicate cannot disagree with the data it summarizes; a flag can, and the
disagreement is a silent misroute of every applicant in the market. Publish
the predicate as one shared pure function that both client and server import
— the moment an onboarding form and a server-side parser each implement
"does this market collect a legal form?" independently, they will drift.

## What each regime changes downstream

The branch is small but it fans out:

- **Onboarding.** A legal-form market must collect the entity type as a
  required, gating fact — it *is* the eligibility input. A code market can
  accept an undeclared type and fall back to the jurisdiction-wide default
  code set, degrading gracefully to the founding segment's behaviour.
- **The gate.** Code regime: intersect opportunity codes with the codes the
  applicant's entity type may apply under. Legal-form regime: read
  `grantEligible` off the applicant's entity type; opportunities carry no
  audience codes to intersect.
- **Ingest.** Code-regime sources ship structured audience fields worth
  parsing; legal-form-regime sources describe audiences in prose, in the
  local language, naming legal forms — the extractor needs the local
  legal-form vocabulary or it returns empty for the entire market.
- **Unknowns.** Each regime produces a different honest null: a codeless
  opportunity in a code market, an undeclared or unrecognized legal form in a
  legal-form market. Both route to *unknown*, never to fail and never to the
  dominant class.

## Procedure

1. Implement the predicate once, as a pure function over the profile.
2. Audit every consumer that currently assumes one regime — matcher,
   onboarding, opportunity parser, explanation strings — and route each
   through the predicate.
3. In code-regime profiles, hang applicant codes off each entity type so the
   gate reflects *who the applicant is* (a university, a municipality, a
   small business), with the jurisdiction-wide default set kept as the
   fallback for legacy applicants who never declared a type.
4. In legal-form profiles, leave the code table genuinely empty. Resist
   inventing pseudo-codes to force the market into the code pipeline — the
   fabricated enumeration will collide with a real one later and it hides the
   regime from the predicate.
5. Test both regimes against the same gate interface: one fixture applicant
   per regime, asserting pass, fail, and unknown for each.

## Decision rules

- **When a supranational programme publishes legal-entity *categories***
  (nonprofit, research organization, public body, enterprise), treat it as a
  legal-form regime with a category vocabulary, not as a code regime,
  because the categories describe the applicant, not a per-opportunity
  audience enumeration.
- **When a market has codes for some funders and none for others, model the
  jurisdiction on its dominant public regime and let source adapters carry
  per-source audience data, because** the profile describes the market's law,
  not each funder's format.
- **When the predicate says legal-form but an opportunity arrives with
  audience codes anyway, keep them as display hints, because** the hard gate
  in that market is the legal form; unvetted foreign codes must not block.

## When not to use

Inside a single-market product that will never leave a code-based regime, the
predicate is a constant and the branch is dead weight — but note that this is
the same "permanently single-market" bet discussed in the profile-schema
technique, and it is usually wrong. Do not use regime detection to decide
*fit* behaviour (register, narrative emphasis); the regime governs the
eligibility gate only.

---
layer: technique
type: technique
subject: jurisdiction-modelling
technique: entity-type-code-mapping
status: forged
laws: [honest-null-over-forced-guess, provenance-per-field]
shared_with: []
use_when: [auto-classifying an applicant's legal form from an official registry response, a registry returns coarse or enumerated codes that must become product entity types, a verification flow silently mislabeled an organization's legal form]
---

# Entity-type code mapping

Official registries do not answer in your vocabulary. One returns the legal
form as a numeric code from its own national enumeration; another returns
only a coarse kind code ("registered corporation") that collapses the very
forms eligibility law distinguishes; a third attests charitable status but
not form at all. This technique maps registry output onto the profile's
entity types so verification can auto-classify an applicant and reconcile
the classification against what the applicant self-declared — without ever
letting the map guess. The output feeds the eligibility gate, so a wrong
mapping is a wrong legal opinion delivered as autofill.

## Curated subset, never the full enumeration

Map only the codes you have individually verified as corresponding to a
specific entity type in your profile — typically the handful of
grant-relevant forms — and let every other code resolve to null. Do not
transcribe the registry's full code list "for completeness": the long tail is
where obscure forms with subtle eligibility consequences live, and a
transcription error there is invisible until it misclassifies someone. A code
absent from the map means "the registry told us a form we do not recognize",
which downstream renders as *unconfirmed* — a prompt for the applicant to
declare, never a default class. Grow the map one verified code at a time,
recording the source each entry was verified against.

## When the registry is too coarse: inference tiers

Some registries return a kind code too coarse to gate on, and the specific
legal form must be inferred from secondary evidence — most commonly a
statutory naming convention, where the legal form appears as a mandatory
prefix or suffix of the registered corporate name. Treat such inference as a
distinct, lower tier with its own rules:

- **Order patterns from specific to general.** Certified or public-benefit
  variants of a form typically embed the base form's name (the certified
  form's marker is the base marker plus a qualifier); if the general pattern
  runs first, every certified organization silently classifies as its
  uncertified base — a downgrade of exactly the status that improves its
  standing. First match wins, so ordering is correctness, not style.
- **Match against the registered name from the registry**, not user input —
  the convention is statutory only for the official name.
- **No match returns null.** A name without a recognized marker is
  unconfirmed, same as an unmapped code.

Record which tier produced each classification. A form read from an
authoritative code and a form inferred from a name prefix are different
grades of evidence, and reconciliation below treats them differently.

## Reconciliation with the self-declared type

The mapping's second job is comparing registry-derived form against what the
applicant declared at onboarding:

- **Agreement** upgrades the field to verified, with the registry as source.
- **Registry says A, applicant says B**: surface the discrepancy for the
  applicant to resolve — do not silently overwrite either. The registry is
  authoritative for the registered form, but stale registrations, pending
  conversions, and your own mapping being wrong are all real; a forced
  overwrite converts any of those into a locked-in error.
- **Registry unconfirmed**: the declared type stands, marked unverified.

## Decision rules

- **When a code is missing from the map, return null and log the code,
  because** the log is your curation queue and the null is the only honest
  classification; a fallthrough to the dominant class fabricates the one
  fact the gate depends on.
- **When adding a code, verify it against the registry's own published
  enumeration — not against a blog or another product's mapping — because**
  the map is a legal claim and inherits legal-claim sourcing standards.
- **When name-based inference and a coarse kind code conflict** (the name
  says nonprofit form, the kind code says plain corporation), **return
  unconfirmed, because** two low-grade signals in conflict do not average
  into one classification.
- **When the same enumeration exists in multiple registries of one country,
  key the map by registry, because** "the same" national code lists drift
  independently.

## When not to use

Where the registry returns a typed, unambiguous legal-form field in a
published vocabulary you fully support, the "curated subset" posture still
applies but the inference tier does not — do not add name-prefix rules as a
belt-and-suspenders layer on top of an authoritative code; they can only
introduce disagreement. And this technique classifies the *applicant*; mapping funder-side
applicant-audience codes on opportunities is a separate mapping with a
separate table — the two look similar, and merging them silently collides
two unrelated enumerations.

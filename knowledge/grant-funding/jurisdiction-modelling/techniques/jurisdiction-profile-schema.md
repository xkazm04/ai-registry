---
layer: technique
type: technique
subject: jurisdiction-modelling
technique: jurisdiction-profile-schema
status: forged
laws: [hard-gates-precede-soft-scores, provenance-per-field]
shared_with: []
use_when: [designing the data model for a first or second country market, a jurisdiction-bound rule is about to be hard-coded outside the profile, auditing how many places encode the same country assumption]
---

# Jurisdiction profile schema

One declarative record per jurisdiction that owns every jurisdiction-bound
fact the product consults. The schema is the technique: get the field set and
the ownership rule right, and adding a market becomes writing data; get it
wrong, and each new market re-opens the codebase.

## The ownership rule

A fact belongs in the profile when a competent practitioner in another
jurisdiction would state it differently. Apply the rule aggressively — the
cost of over-including (a field that turns out identical everywhere) is one
redundant column; the cost of under-including is a hard-coded assumption that
must be excavated later from every consumer that copied it.

## Field inventory

A profile that has survived contact with several real markets carries:

- `id`, `parentId`, `level` — identity and nesting. Level is an enum of
  supranational / country / region / locality; regions inherit the parent's
  funding sources and add their own.
- `memberOf` — supranational memberships whose corpus this jurisdiction
  inherits (see the inheritance technique).
- `supported` — is the product fully operational here, versus announced.
  Every user-facing coverage surface derives from this flag.
- `entityTypes[]` — legal forms, each with a machine code, a human label, a
  `grantEligible` boolean, and (in code-based regimes only) the applicant
  codes that form may apply under.
- `identifiers[]` — each registration number with label, example, and a
  validation pattern stored as a **pattern source string**, not a compiled
  regex object, so the profile stays serializable and the caller compiles.
  Check-digit algorithms live beside the profile as pure functions.
- `verificationSources[]` — each official register with a key, a label, and a
  one-line statement of *what it attests*. The attestation sentence is not
  decoration: it is what prevents a mere existence check from being presented
  as a charitable-status check.
- `grantSourceKeys[]` — the ingest adapters serving this market. Opportunity
  queries filter by these keys, which is what keeps corpora
  jurisdiction-scoped.
- `requiredDocKeys[]` — pointers into the shared document taxonomy.
- `applicantEligibility` — the code-label table and default eligible-code set
  (empty in legal-form regimes; the emptiness itself is signal — see regime
  detection).
- `localization` — currency, locale, drafting language, using the standard
  identifier systems for each so formatting libraries consume them directly.

## Procedure

1. **Excavate before you abstract.** List every place the founding market's
   assumptions are hard-coded — eligibility codes in the matcher, document
   lists in the checker, identifier formats in onboarding, verification
   sources in the trust surface. That list *is* your field inventory; the
   schema is discovered, not invented.
2. **Make the first profile mirror the incumbent behaviour exactly**, then
   cut consumers over to read the profile one by one. The founding market is
   the regression suite for the abstraction.
3. **Build the second profile from verified research, not analogy.** Every
   entity type, identifier format, registry and document key is a legal claim;
   record the source you verified it against. Where your research cannot
   confirm a value, leave it absent rather than porting the founding market's
   value across.
4. **Keep the module pure.** Data plus lookup functions, no network, no
   storage. Registry clients and ingest adapters *consume* the profile; they
   do not live in it. Purity makes the legal model fully unit-testable and
   safely importable from both client and server code, which is what stops
   the "collect a legal form here" rule from drifting between an onboarding
   form and a server-side parser.
5. **Route every consumer through one accessor** that resolves a profile by
   id, merges regional and inherited sources, and returns the unsupported
   surface for anything unrecognized. Direct imports of individual profiles
   by consumers are how scattered copies come back.

## Decision rules

- **When a new rule mentions a country, stop and place it in the profile,
  because** the second mention will be in a different file and the two will
  drift.
- **When two markets share a value today, still store it per-profile if the
  ownership rule says it is jurisdiction-bound, because** coincidence is not
  invariance — currencies, languages and document sets that happen to align
  will diverge with the next market.
- **When a consumer needs behaviour, not data, keep the branch in the
  consumer keyed on a declared profile property, because** profiles that
  carry callbacks stop being serializable, diffable configuration.
- **When a profile field cannot be verified for a new market, ship the market
  without the dependent feature rather than guessing the field, because** a
  guessed legal fact fails silently and specifically for the users it
  misclassifies.

## When not to use

A product genuinely and permanently scoped to one jurisdiction does not need
the abstraction — but be honest about "permanently": the moment a second
market is plausibly on the roadmap, the profile costs least *now*, while the
founding market's assumptions are still enumerable. Likewise, do not stretch
the profile to own facts that are funder-specific rather than
jurisdiction-specific (a single funder's idiosyncratic form belongs to funder
intelligence, not to the country's legal model).

---
layer: golden-path
type: golden-path
subject: jurisdiction-modelling
status: forged
use_when: [adding a new country market to a grants product, deciding where a country-specific rule should live, an eligibility or document rule was hard-coded for the founding market, making a public claim about which markets are covered]
techniques:
  - jurisdiction-profile-schema
  - eligibility-regime-detection
  - supranational-membership-inheritance
  - entity-type-code-mapping
  - compliance-document-taxonomy
  - market-claim-truthfulness
---

# Jurisdiction modelling

Grant eligibility is legislation. Which organizations may receive public money,
what identifier proves an organization exists, which registry attests its legal
form, which documents an application must attach, which funding programmes
serve it — every one of these is set by a jurisdiction's laws and registries,
and every one differs across borders. Jurisdiction modelling is the discipline
of treating that entire rule set as **configuration data**: one declarative
profile per jurisdiction, owning every jurisdiction-bound fact, so that
entering a new market means writing a profile, not rewriting the product. The
naive reading — "we'll internationalize later" — is not a deferral, it is a
decision: every jurisdiction-bound assumption that is hard-coded today becomes
a scattered copy that must be found, generalized and re-verified later, and the
ones you miss ship the founding market's law to organizations governed by a
different one.

## What a jurisdiction owns

The test for whether a fact belongs in the jurisdiction profile is simple:
*would a lawyer in another country give a different answer?* If yes, it is
profile data. The recurring owned set:

- **Entity types** — the legal forms organizations take there, each flagged
  for whether that form may generally receive grants. There is no universal
  vocabulary: one country's charitable-status determination has no analog in a
  country where charity is inferred from legal form plus a statutory test, and
  in some markets for-profit companies are first-class grant recipients
  because the national subsidy system funds small enterprises.
- **Identifiers** — the registration numbers that name an organization
  (format, example, validation pattern, check-digit algorithm where one
  exists). Validate locally before spending a registry call.
- **Verification sources** — the official registers that attest existence,
  legal form, charitable status, sanctions standing. Every country keeps its
  own; some expose public APIs, some are key-gated, some are lookup-only.
- **Funding-source keys** — which ingest adapters and corpora serve this
  market, so opportunity data is jurisdiction-scoped and an org in one country
  never sees another country's calls as if they were its own.
- **Required-document keys** — which compliance documents applications here
  conventionally demand (see the taxonomy technique; the set is radically
  non-portable).
- **Applicant-eligibility regime** — whether funders here publish applicant
  category codes or eligibility runs off the applicant's legal form.
- **Localization** — currency, locale, drafting language. A market whose
  funders read applications in their own language is not served by translating
  the interface; the *drafting* must be native.

Keep the profile pure data plus pure lookup functions — no I/O. Purity is what
makes the whole legal model unit-testable, and legal models are exactly the
code you want tested: a wrong check-digit weight or a mis-mapped legal-form
code is invisible in review and decisive in production.

## Levels, and the one that is not a country

Jurisdictions nest: country above region above locality, with regions
inheriting national funding sources and adding their own. The load-bearing
subtlety is the fourth level: **supranational**. A multi-country funding body
is a real jurisdiction — it has its own applicant categories, its own
participant identifier, its own document conventions, its own corpus — but it
is not a peer of a country, because *you apply through it; you cannot
incorporate in it*. Model it as its own profile at its own level, and let
member countries inherit its corpus through a declared membership relation.
Typing it as a country makes every consumer treat it as one, which
double-counts coverage (a member state already sees the supranational corpus
through membership) and breaks every "where can an organization be
incorporated" surface. The level enum exists so consumers can discriminate;
consumers that make geographic claims must.

## The regime split is structural

Across real markets, "who may apply" is decided in two structurally different
ways. In a **code-based regime**, funders publish enumerated applicant
category codes on each opportunity, and eligibility is set intersection
between the opportunity's codes and the codes the applicant's entity type may
apply under. In a **legal-form regime**, no such codes exist; eligibility is a
property of the applicant's registered legal form, looked up in the profile's
entity-type table. A product built in one regime silently misreads the other:
code-regime logic applied to a legal-form market finds no codes and either
fails everything or falls back to a default audience; legal-form logic applied
to a code market ignores the funder's own declared audience. The profile
declares which regime holds (detected from its own shape, not from a
hand-maintained flag — see the regime-detection technique), and shared
consumers branch on that declaration, never on the jurisdiction's name.

## Registries answer in codes; never guess past them

Official registries return legal form as codes from their own enumeration — or
worse, as a coarse kind code that collapses the forms you care about, leaving
the specific form to be inferred from conventions like a statutory name
prefix. Map registry output to your entity types through a **curated,
verified subset** of the registry's code list, and let every unmapped code
resolve to *unconfirmed*, never to a guessed type. An auto-classified legal
form feeds the eligibility gate; a guess there is a wrong legal opinion
delivered with interface confidence. The mapping technique carries the
procedure; the rule here is the posture: the registry is authoritative for
what it says, and silent about everything else — your model must preserve that
silence rather than paper over it.

## Documents are jurisdiction artifacts

The compliance attachments a grant application demands are creatures of local
administrative law, and some document classes simply do not exist outside
their home market: a tax-debt clearance certificate spanning several national
agencies, a sworn declaration of honour, a registry extract, an annual-report
filing obligation. A single-market document model cannot be patched into a
multi-market one by translation — the *classes* differ, not the labels. Each
profile declares its required-document keys; a shared taxonomy maps each key
to recognition rules (how the demand appears in a funder's text, how a
matching upload is named) so checklist logic stays generic while the document
set stays local. Recognition must tolerate the language's realities —
diacritic-stripped filenames, multiple official synonyms for the same
certificate.

## Say only where you actually work

A jurisdiction model gives the product a truthful vocabulary for its own
boundaries, and the product must use it. A profile carries a `supported` flag
— fully operational versus listed-but-not-live — and every user-facing
surface derives from the profile set: the market list, the onboarding picker,
the coverage claims, and the explicit not-available-here notice for
organizations in unsupported jurisdictions. The alternative to an honest
boundary is not broader coverage; it is a supported-market experience
silently misapplied — wrong currency, wrong documents, wrong eligibility law —
to a market nobody modelled. Launch one jurisdiction at a time, say so, and
collect the waitlist.

## Failure modes of the naive reading

- **The founding market as implicit default.** Unknown jurisdiction falls
  through to the first market's rules. Every fallthrough must instead land on
  the unsupported-market surface; the default legal system is *none*.
- **Scattered copies.** Eligibility codes in the matcher, document lists in
  the checker, verification sources in onboarding — each hard-coded
  separately. The second market forces you to find them all; the profile
  exists so there is exactly one place.
- **The supranational body counted as a country.** Coverage counts inflate,
  member-state corpora double-count, and incorporation pickers offer a place
  no organization can legally exist in.
- **Regime assumed from the founding market.** Every new market gets scored
  against the first market's applicant codes it does not have.
- **Registry codes guessed.** An unknown legal-form code mapped to "probably
  an association" is a fabricated legal fact.
- **Coverage claims outrunning profiles.** Marketing lists a market whose
  profile is not live, or keeps a roadmap entry after the market shipped.
  Derive both lists from the profiles so they cannot disagree with reality.

The through-line: a jurisdiction profile is a *legal model*, and the standard
for editing one is the standard for legal claims — verified sources, curated
subsets, honest unknowns, and no rule shipped to a market it was not written
for.

---
layer: application
type: application
subject: public-money-attribution
technique: attribution-perimeter
stack: process
status: forged
verified_on: 2026-08-20
---

# Process: the field's perimeter standards and data landscape (2025–2026)

A snapshot, taken 2026-08-20, of the international anti-corruption data
standards that define what an attribution perimeter can be built from — the
reference points an analyst reaches for when declaring whose relationships
count. Sources accessed 2026-08-20.

## Beneficial-ownership disclosure: the perimeter's legal substrate

- **FATF Recommendation 24** requires identifying every natural person who
  *directly or indirectly* owns or controls a legal person. The commonly
  implemented 25% threshold is now framed by FATF as a **maximum**, not a
  recommendation — explicit acknowledgment that thresholds are circumvented by
  splitting stakes, which is the technique's "any threshold excludes real
  control below it" rule stated as global policy.
  (https://www.fatf-gafi.org/en/topics/beneficial-ownership.html;
  https://www.openownership.org/en/blog/fatf-recommendation-24-global-standards-on-beneficial-ownership-are-rising/)
- **BODS v0.4** (Beneficial Ownership Data Standard, Open Ownership; finalized
  June 2024, large datasets republished under it from 2025 — including the UK
  register and 30,000+ overseas entities) is the machine-readable format for
  ownership-and-control *statements*, including indirect interests and
  interest chains. A perimeter that traces chains has a standard to ingest.
  (https://standard.openownership.org/; https://www.openownership.org/en/news/united-kingdom-beneficial-ownership-data-available-in-line-with-latest-version-of-global-standard/)
- **Registry interconnection** is live infrastructure, not aspiration: the
  EU's BORIS links member-state BO registers through the e-Justice Portal;
  Canada's MRAS/BOP2P interconnects jurisdictional registries over BODS. A
  chain that crosses a border is increasingly resolvable from primary
  registers. (https://www.openownership.org/en/blog/data-standard-working-group-meeting-february-2025/)

## Officials' side of the perimeter: declarations and PEP data

- **World Bank StAR** asset-and-interest-disclosure methodology ("Getting the
  Full Picture on Public Officials") documents nominee and proxy ownership as
  a *widespread* concealment channel and prescribes that declaration regimes
  cover officials' **related persons** — family members, trusts, close
  associates. This is the field's warrant for the technique's claim that a
  direct-ties-only perimeter is a floor by construction.
  (https://star.worldbank.org/sites/star/files/getting-the-full-picture-on-public-officials-how-to-guide.pdf;
  https://star.worldbank.org/focus-area/asset-declarations)
- **OpenSanctions** maintains the reference PEP dataset — senior officials
  plus family members and known close associates — with a documented
  methodology; its **FollowTheMoney** ontology (entities, ownership,
  directorship as first-class schema) and **nomenklatura** matcher are the
  de facto open toolchain for the "indirect-control candidates are leads"
  loop: enrichment proposes matches, humans confirm them.
  (https://www.opensanctions.org/docs/entities/;
  https://github.com/opensanctions/followthemoney)
- Investigative-graph platforms on the same ontology — **Aleph / OpenAleph**
  (with the closed-source Aleph Pro launched October 2025) — are where
  cross-register lead-following happens outside the published arithmetic.
  (https://followthemoney.tech/community/stack/)

## The money side: procurement standards and their gaps

- **OCDS** (Open Contracting Data Standard) with the Open Contracting
  Partnership's red-flags methodology and the **Cardinal** open-source
  indicator library (applied over 50+ governments' OCDS data) is the
  contracting-side counterpart. OCP's own finding matters for perimeter
  honesty: red-flag methods rely on an estimated **15–20 fields not available
  in OCDS** plus external sources — business registries, debarment lists,
  asset declarations. The buyer-supplier join alone cannot see the perimeter;
  the perimeter is assembled across standards.
  (https://www.open-contracting.org/resources/red-flags-in-public-procurement-a-guide-to-using-data-to-detect-and-mitigate-risks/;
  https://www.open-contracting.org/2024/06/12/cardinal-an-open-source-library-to-calculate-public-procurement-red-flags/)

## What this means for a perimeter declaration

An implementable 2026 perimeter statement can cite, per element: chain depth
(BODS interest chains), threshold (FATF's 25%-as-maximum), related persons
(StAR declaration scope, OpenSanctions PEP family/associate classes), and the
contracting join (OCDS parties). Each element the product's registers cannot
support is a named exclusion — which is exactly the "floor of the reachable
surface" wording the technique requires.

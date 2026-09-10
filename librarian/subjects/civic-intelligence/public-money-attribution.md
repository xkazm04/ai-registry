---
domain: civic-intelligence
subject: public-money-attribution
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# public-money-attribution

## Architecture review - 2026-09-09

Read all ten owned documents. Corrected amount attribution, lower-bound conditions and ownership-state claims. Historical Node applications expose permissive unknown-attribution gaps; their code, named cases, legal-form codes, amounts and incidents require reverification. No consumer runtime or witness date refresh.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/public-money-attribution",
  "date": "2026-09-09",
  "baseline": "78850ba5",
  "digest": "sha256:008cb29b407f7ba3",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read and assessed with explicit counterexamples. External checks are scoped in sources. No consumer runtime, historical incident replay, or application witness refresh.",
  "counterexamples": [
    "An observed payment of 100 with an unread refund of 80 is not a lower bound on net 20.",
    "One award naming two suppliers can be double-counted even after entity deduplication.",
    "A public 1% shareholder does not establish public control; an empty holder list does not establish private ownership.",
    "Another official owning an entity does not convert a steward relationship into ownership; current ownership does not prove historical receipt."
  ],
  "sources": [
    {
      "url": "https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Guidance-Beneficial-Ownership-Legal-Persons.html",
      "scope": "Primary 2023 guidance landing page; not national legal applicability or public-access verification."
    },
    {
      "url": "https://standard.openownership.org/en/0.4.0/standard/concepts.html",
      "scope": "Primary BODS 0.4 concepts, direct and indirect relationship statements."
    },
    {
      "url": "https://standard.open-contracting.org/latest/en/schema/reference/",
      "scope": "Primary amount, transaction and direction distinctions; no consumer schema conformance test."
    }
  ],
  "documents": {
    "public-money-attribution.md": {
      "disposition": "clarify",
      "reason": "Replace personal-enrichment and automatic-floor claims with scoped amount, identity, time and evidence contracts."
    },
    "techniques/floor-versus-total-disclosure.md": {
      "disposition": "clarify",
      "reason": "Correct automatic lower-bound inference and heuristic cap detection; preserve upstream slice coverage."
    },
    "techniques/owner-operator-vs-steward-split.md": {
      "disposition": "clarify",
      "reason": "Remove income inference and negative class predicate; preserve person-specific mixed ties and unresolved states."
    },
    "techniques/attribution-perimeter.md": {
      "disposition": "clarify",
      "reason": "Distinguish indirect control evidence from association and scope from a proved lower bound."
    },
    "techniques/entity-level-deduplication.md": {
      "disposition": "clarify",
      "reason": "Scope deduplication by person/time and distinguish entity identity from transaction and amount reconciliation."
    },
    "techniques/public-body-classification.md": {
      "disposition": "clarify",
      "reason": "Separate shareholding, control, historical status and empty/partial ownership evidence."
    },
    "techniques/citable-money-claims.md": {
      "disposition": "clarify",
      "reason": "Require amount and snapshot verification, not only reviewed ties or live recomputation."
    },
    "applications/node--entity-level-deduplication.md": {
      "disposition": "reverify",
      "reason": "Retain dated witness while identifying concrete contract gaps requiring consumer reverification."
    },
    "applications/node--public-body-classification.md": {
      "disposition": "clarify",
      "reason": "Retain dated witness while identifying concrete contract gaps requiring consumer reverification."
    },
    "applications/process--attribution-perimeter.md": {
      "disposition": "clarify",
      "reason": "Replace broad legal/tool landscape assertions with bounded primary references and explicit transfer limits."
    }
  }
}
```

### 2026-09-10 — architecture re-review after the compression revert

All ten documents read against baseline `44c8996585f2e5e3f36e0cb0bd1983c607cadfd7`.
Five carry the salvaged 2026-09-09 appends (`citable-money-claims`,
`entity-level-deduplication`, `public-body-classification`, and the two Node
applications); the golden path, `attribution-perimeter`,
`floor-versus-total-disclosure`, `owner-operator-vs-steward-split` and
`applications/process--attribution-perimeter.md` were restored whole.

**This entry retracts the 2026-09-09 record's blanket `clarify` on the seven
techniques and the golden path.** Read against the current bytes, the
corrections that record proposed are either already present or were the
compression. `public-body-classification` already opens by separating public
ownership, public control and a legal public-body category as three distinct
dated claims, already refuses to let a one-hop walk deliver `private`, already
says a fully recursed ownership walk establishes *ownership* and nothing wider,
and already closes with cycle detection, depth limits, the empty-versus-partial
holder-list distinction and the 1%/99% counterexample. `entity-level-
deduplication` already requires a registry namespace on the entity key, already
refuses to allocate a multi-supplier award in full to each supplier, and already
keeps contract values, subsidy commitments, payments and donations in separate
accounting categories. `citable-money-claims` already separates a canonical
content hash from authentication. The golden path's four errors, the perimeter
paragraph above them, the one-definition rule and the claim-state rules survive
source contact unchanged. Those eight are `keep`.

**What does not survive is in the one document that names organizations.**
`applications/process--attribution-perimeter.md` makes three assertions I went
to the primary sources for, and two of them do not hold as written.

*Cardinal.* The document describes "the **Cardinal** open-source indicator
library (applied over 50+ governments' OCDS data)". The announcement it cites
says the opposite of that parenthesis: Cardinal has been applied to contracting
data from **Ecuador and the Dominican Republic**, and is "ready to be applied"
to the data of more than 50 governments publishing in OCDS. Readiness for a
population is not application to it — which is, in this subject's own idiom,
exactly a coverage claim standing in for a census.

*The missing-fields estimate.* The same bullet attributes to OCP the finding
that red-flag methods "rely on an estimated **15–20 fields not available in
OCDS** plus external sources — business registries, debarment lists, asset
declarations". Neither cited page carries that number. The red-flags guide
landing page describes 73 indicators with formulas over standardized data
mapped to OCDS; the Cardinal announcement states the reverse emphasis ("thanks
to OCDS, developing a red flags library ... was possible") and mentions only
that Cardinal's own prepare step can report when a dataset lacks fields a given
indicator needs. The claim may be true and sourced elsewhere in the guide's PDF,
but as cited it is unsupported. `floor-versus-total-disclosure` leans on the
same claim in weaker form ("the standard contracting schemas themselves omit
fields that completeness accounting needs"); its argument does not depend on it,
so I keep that document and file the citation problem here.

*FATF's 25%.* The claim that FATF now frames 25% as a **maximum** rather than a
recommendation is the load-bearing warrant for the technique's "any threshold
excludes real control below it". I could not check it: both fatf-gafi.org pages
and the 2023 guidance PDF returned HTTP 403 to this review. It stays unresolved
rather than refreshed. Note that `attribution-perimeter` itself never cites the
number — its rule is a design rule and stands without the source — so the
exposure is confined to the application.

BODS 0.4 checked out for what the perimeter actually needs: the standard models
the beneficial-ownership relation as "direct, indirect or both", and where it is
indirect the intermediary entities, people and their relationships are part of
the network — so "a perimeter that traces chains has a standard to ingest" is
correct. The 0.4 concepts page does not state a June 2024 finalization date, and
the UK-register republication and "30,000+ overseas entities" figures were not
checked.

The subject's sharpest open item is not a source problem but a divergence its
own application discloses: the technique says `unknown` blocks attribution,
while the shipped classifier returns `attributable: true` for an unknown holder
code and for `ownership-not-published` — a state that, on that corpus, covered
49 of 52 `private` verdicts and 98% of the attributable money. Whether a
downstream verified-evidence gate closes that gap was not checked here, and it
is the single reverification most worth doing.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/public-money-attribution",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:ea774ea87ee08bbf",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read in full against the post-restore bytes. Primary sources read (not executed): the BODS 0.4 concepts page, the OCP red-flags guide landing page, the Cardinal announcement. Attempted and refused: fatf-gafi.org beneficial-ownership topic page and the March 2023 R.24 guidance PDF, both HTTP 403. Not evaluated: the politicas consumer code, its line numbers, legal-form code tables, named entities, amounts and incident batches; World Bank StAR and OpenSanctions methodology pages; BORIS and MRAS interconnection claims; the BODS 0.4 release date and UK republication figures; any downstream verified-evidence gate.",
  "counterexamples": [
    "An entity whose ownership record fetched cleanly but names no current holder is unknown-by-silence, not private - and on the measured corpus that state carried 98% of the attributable money while the shipped classifier still returned attributable: true, which is the technique's rule inverted at the point it matters most.",
    "A public body holding 1% of a company does not establish public control, and a company held 100% by an ordinary business form whose own owner is a region is not private; only the recursed walk separates them.",
    "One award naming two suppliers allocated in full to each and then summed is double-counted public spending even after every entity row has been deduplicated.",
    "A per-entity slice of three companies that each organically hold the same handful of contracts satisfies the corpus-level cap signature, so the slice would publish 'at least' plus a per-entity cap value that does not exist.",
    "An aggregate over one verified tie and four unreviewed ones is pending however large the verified component is, and an empty aggregate is pending rather than vacuously verified.",
    "A stake split below any published inclusion threshold, or parked with a relative, leaves the perimeter untouched and the figure a floor, independent of whether the ingest was capped."
  ],
  "sources": [
    {
      "url": "https://standard.openownership.org/en/0.4.0/standard/concepts.html",
      "result": "Established that BODS 0.4 models the owner-to-entity relationship as direct, indirect or both, and that indirect relationships carry the intermediary entities, people and their relationships as part of the beneficial-ownership network via relationship statements over stable record identifiers. Did not establish the 0.4 finalization date, the UK register republication, or the 30,000+ overseas-entity figure the application cites."
    },
    {
      "url": "https://www.open-contracting.org/2024/06/12/cardinal-an-open-source-library-to-calculate-public-procurement-red-flags/",
      "result": "Established the 2024-06-12 announcement, 10 shipped indicators with eight more planned, application to Ecuador and the Dominican Republic, and readiness to be applied to 50+ OCDS-publishing governments. Established that the application's 'applied over 50+ governments' OCDS data' is not what the source says. Did not establish the 15-20 missing-fields estimate; the post argues the reverse emphasis."
    },
    {
      "url": "https://www.open-contracting.org/resources/red-flags-in-public-procurement-a-guide-to-using-data-to-detect-and-mitigate-risks/",
      "result": "Established 73 red-flag indicators (2024) with calculation formulas over standardized data mapped to OCDS, spanning planning to implementation. Did not establish the '15-20 fields not available in OCDS' estimate; the guide PDF itself was not opened."
    },
    {
      "url": "https://www.fatf-gafi.org/en/topics/beneficial-ownership.html",
      "result": "Not established - HTTP 403 to this review, as was the March 2023 Guidance on Beneficial Ownership of Legal Persons PDF. The claim that FATF frames 25% as a maximum rather than a recommendation therefore remains unverified; it was NOT refreshed on the strength of a search summary."
    }
  ],
  "documents": {
    "public-money-attribution.md": {
      "disposition": "keep",
      "reason": "The four errors of the naive sum, the undeclared-perimeter error above them, the one-definition-one-import argument, the classification-provenance section and the claim-state rules are complete and internally consistent; the ~nine-tenths steward share is scoped to one measured corpus and addressed by this subject's own application."
    },
    "techniques/attribution-perimeter.md": {
      "disposition": "keep",
      "reason": "Declare-once, perimeter-change-is-method-change, threshold-is-published, indirect-candidates-are-leads and say-what-the-perimeter-is are design rules that stand without the FATF citation, which this document does not make."
    },
    "techniques/citable-money-claims.md": {
      "disposition": "keep",
      "reason": "Minting from the shared arithmetic, mint-what-is-rendered, the literal gate state, all-parts-verified, the evidence packet's module-boundary exclusion, and the closing section separating a content hash from authentication are complete."
    },
    "techniques/entity-level-deduplication.md": {
      "disposition": "keep",
      "reason": "The collapse-first procedure, class-by-stated-precedence, per-person versus population scope, and the preconditions section (registry namespace, multi-supplier awards, separate accounting categories, reconcile-or-reject on disagreeing rows) already carry every correction the prior record proposed."
    },
    "techniques/floor-versus-total-disclosure.md": {
      "disposition": "keep",
      "reason": "Cap-signature detection with its low-and-shared condition, the publication-rules cap no signature can see, the corpus-versus-slice scale trap with declared read scope as the only caller parameter, and the floor-plus-total downgrade rule are sound; the one uncited 'field practice confirms' aside carries no weight in the argument."
    },
    "techniques/owner-operator-vs-steward-split.md": {
      "disposition": "keep",
      "reason": "Three classes with the steward boundary as the load-bearing wall, the both-buckets-always contract, heuristic-versus-recorded provenance with precedence-is-not-provenance, surface-the-disagreement, and colour-by-class are correct and the dominance ratio is scoped to a measured corpus."
    },
    "techniques/public-body-classification.md": {
      "disposition": "keep",
      "reason": "Two layers, three tables, four verdicts; positive-evidence-only for private with the recursion requirement stated; unknown-never-falls-through; read-every-load-bearing-array; and the closing bounded-traversal section with cycle detection, depth limits and the 1%/99% counterexample. Nothing here needs changing."
    },
    "applications/node--entity-level-deduplication.md": {
      "disposition": "reverify",
      "reason": "The incident, the fold, the mandate axis and the named mixed companies are dated consumer claims that were not reopened; its own boundary section correctly identifies the tie-class fallback under unknown ownership as a gap against the technique, and the contract-plus-subsidy sum still needs a declared compatible basis and overlap check."
    },
    "applications/node--public-body-classification.md": {
      "disposition": "reverify",
      "reason": "The classifier returns attributable: true for unknown holder codes and for ownership-not-published, which on the recorded corpus covered 49 of 52 private verdicts and 98% of attributable money - a live inversion of the technique's unknown-blocks-attribution rule unless a downstream verified-evidence gate closes it. No such gate was checked, and the legal-form tables, entity names and amounts were not refreshed."
    },
    "applications/process--attribution-perimeter.md": {
      "disposition": "clarify",
      "reason": "States Cardinal is 'applied over 50+ governments' OCDS data' where the cited announcement says it is ready to be applied to 50+ and has been applied to two; attributes a '15-20 fields not available in OCDS' estimate to pages that do not carry it; and rests the threshold argument on a FATF 'maximum' framing that this review could not reach (403). BODS 0.4's direct/indirect/chain modelling checks out."
    }
  }
}
```

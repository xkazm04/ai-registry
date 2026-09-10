---
domain: grant-funding
subject: grant-taxonomy-design
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# grant-taxonomy-design

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/grant-taxonomy-design",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:888019b5f6736922",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Adding a valid new code can break a consumer with an exhaustive enum or change classifier outputs.",
    "A health-and-education call legitimately needs two sector labels even when the residual model is asked for one.",
    "A confident regex tag can be wrong and should not be immune to evidence-based correction."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/funding-landscape/grant-taxonomy-design",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://taxonomy.candid.org/",
      "scope": "Primary classification vocabulary reference identified for facet context; no external taxonomy migration or classifier benchmark executed."
    }
  ],
  "documents": {
    "grant-taxonomy-design.md": {
      "disposition": "reverify",
      "reason": "Facets can contain hierarchies and need not be statistically independent. Deterministic precedence is an engineering policy, not epistemic authority. Single-code residual conflicts with multivalued sectors; missing tags need not be safer for every user decision. Corpus-wide accuracy and cost claims remain historical."
    },
    "techniques/agency-and-programme-fallbacks.md": {
      "disposition": "reverify",
      "reason": "Agency remit rarely proves all programmes share a sector, and an issuer field can be missing. Source-specific programme codes may be strong evidence but still need versioned interpretation. Fallback restoration of suppressed tags is not necessarily correct; conflicting evidence should be retained."
    },
    "techniques/append-only-codes-with-migrations.md": {
      "disposition": "clarify",
      "reason": "Repaired additive compatibility limits, label versus semantic changes, migration chains/cycles and unresolved splits. Unknown historic codes remain auditable rather than disappearing."
    },
    "techniques/deterministic-first-classification.md": {
      "disposition": "reverify",
      "reason": "Same input requires same rule, taxonomy and normalization versions. Deterministic patterns can classify multiple languages; rule outputs can be reviewed and corrected. Most project grants is not a universally true default; matching all means placing a weak rule last does not reduce its weight."
    },
    "techniques/false-positive-suppressors.md": {
      "disposition": "reverify",
      "reason": "Innocence keywords can be negated, quoted or incidental. Bare sustainable without an environmental noun is absence-based despite the stated rule against it. A measured single counterexample can justify a repair without a invented percentage; holdout recall is required beyond retag-count diffs."
    },
    "techniques/llm-residual-classification.md": {
      "disposition": "clarify",
      "reason": "Repaired calibrated acceptance versus self-confidence, per-dimension cardinality, operational failures versus abstention and review of wrong deterministic tags."
    },
    "techniques/orthogonal-dimension-modelling.md": {
      "disposition": "reverify",
      "reason": "Facets answer distinct questions but may have valid dependencies. Co-funders can have multiple types; geography can use controlled vocabulary, and internal analytic facets need not appear in browse UI. Nearly all is not universal, and small corpus size does not eliminate entanglement."
    },
    "applications/node--deterministic-first-classification.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date preserved, not rerun. Corpus percentages and counterfactual recall recovery require original audit data. Broad defaults and prefix rules may misclassify; taxonomy version alone misses classifier-version changes. A renamed code can retain a formerly narrower meaning in historical rows."
    },
    "applications/node--llm-residual-classification.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date retained. Confidence >=0.6 is not an accuracy guarantee, cache by prompt needs model/config scope, and one label loses valid multi-sector content. Code validity prevents invented identifiers but not incorrect assignments; transport null must remain distinguishable from deliberate abstention."
    }
  }
}
```

### 2026-09-10 — architecture re-review after the compression revert

I read all nine documents at their restored bytes; the record above no longer
matches the tree (888019b5f6736922 versus a4ebc487d22f12f4).

The finding that matters is a contract this subject deploys against its own
stated exclusion. orthogonal-dimension-modelling declares sector and beneficiary
"naturally multi-valued (a grant can genuinely serve two domains)".
deterministic-first-classification's rulebook is set-producing by design:
"Match all, then validate. Collect every code whose pattern fires."
llm-residual-classification then imposes "exactly one code from the closed
vocabulary, or null" — and its own "when NOT to use it" section says, in as
many words, do not use it "for multi-label dimensions where the deterministic
layers already produce sets". Sector is exactly such a dimension, and the
golden path's stack, plus the Node application, run the model layer on it.
So the residual pass is deployed on the one dimension shape its author excluded.
The cost is not abstract: a genuinely two-sector residual row gets one code, the
second is dropped, and because the row now carries an accepted tag it leaves the
uncategorized backlog that the subject calls its taxonomy's audit surface. The
honest-null spine fails silently in precisely the direction the subject says it
must not. Either the contract needs a per-dimension cardinality (one code for
single-valued facets, a validated set for multi-valued ones) or the exclusion
needs to be retracted with an argument.

Second, false-positive-suppressors contradicts itself within one section. The
guilt check is defined with the rule "if neither check fires, leave the set
unchanged — a suppressor never acts on absence of evidence alone", and one of
the three worked guilt checks is "a bare 'sustainable' with no environmental
noun". That is an absence-of-evidence trigger, and the Node application confirms
it shipped that way (suppressSustainableEnv: bare "sustainab" with no
REAL_ENVIRONMENT noun). The rule and the example cannot both stand. My read is
that the rule is the more valuable half and the example needs restating as an
innocence check failing rather than a guilt check firing — but that is an
editorial call for whoever gates it.

Third, an inconsistent evidentiary standard between two neighbouring documents.
false-positive-suppressors insists "suppress only what you have measured" and
requires an audit rate and a date in every suppressor's comment.
agency-and-programme-fallbacks then says a fallback "can restore a sector a
suppressor removed — correct, because issuer identity is stronger evidence than
a polysemous word", with no measurement behind it. A suppressed row is not a row
where text found nothing; it is a row where a measured guilt check fired and the
curated innocence check did not. Overriding that with an unmeasured prior about
issuer remit is the one place this subject relaxes its own standard, and it does
so on an assertion.

I checked the faceted-vocabulary framing against Candid's Philanthropy
Classification System, which the golden path leans on without naming. The facet
structure holds up: PCS is explicitly faceted, with Populations, Subjects,
Organization Type, Support Strategies, Transaction Type and Geographic Area
Served — a good match for this subject's four dimensions plus geography. What
the source does not support is the golden path's causal story, "precisely
because the older single-tree coding forced them into one slot and lost
information every time": Candid describes PCS as based on NTEE and expanded over
three decades, not as a corrective to it. The claim may still be true as sector
folklore, but it is not what the primary reference says, and the subject would
lose nothing by stating the structure without the history. Worth noting too that
PCS carries geography as a facet while orthogonal-dimension-modelling advises
modelling it as data; the document hedges with "usually", so I read that as a
defensible divergence rather than an error.

I retract two of the earlier record's charges. append-only-codes-with-migrations
does distinguish renames from splits, and says outright that a split "is a
re-classification, not a migration" that maps cannot resolve — the charge of
unresolved splits is answered in the text. And deterministic-first-classification
does not claim epistemic authority for determinism; it argues reproducibility,
auditability and corpus-scale uniformity, which are the right grounds. One small
thing there I am recording as an observation rather than a finding: it calls the
project-grant mechanism default "universally-true", while its sibling technique
says "nearly every ... unless stated otherwise" and correctly insists the choice
be documented as a default rather than a classification. The sibling has the
better phrasing.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/grant-taxonomy-design",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:a4ebc487d22f12f4",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read in full at restored bytes. The multi-label contradiction and the suppressor self-contradiction were derived from the documents' own rules and worked examples. Checked the faceted-classification framing against Candid's PCS. Not evaluated: the grant-writing-nonprofits repo at runtime, any of the corpus audit percentages quoted in the techniques (37 percent uncategorized, 66 percent eco-health, 19 percent rural, 16 percent academ), NTEE's structure directly, and the verified_on dates of both applications, which are left unchanged.",
  "counterexamples": [
    "A residual row funding a school health programme genuinely carries health and education; the exactly-one contract emits one, drops the other, and marks the row categorized so it leaves the uncategorized audit set.",
    "A grant whose text says 'sustainable rural livelihoods' with no environmental noun loses its environment tag through a guilt check firing on an absence, which the same section forbids.",
    "A watershed grant issued by a health institute: the eco-health suppressor removes health on measured evidence, and the issuer fallback restores it on an unmeasured remit prior.",
    "An opportunity that is explicitly an operating-support award but whose mechanism field is unstated is defaulted to project-grant, so the one dimension with a default can never register an honest absence."
  ],
  "sources": [
    {
      "url": "https://taxonomy.candid.org/",
      "result": "Confirmed PCS is a faceted classification with independent dimensions — Populations, Subjects, Organization Type, Support Strategies, Transaction Type, Geographic Area Served — which supports this subject's facets-not-a-tree structure. It did NOT support the golden path's causal claim that faceting was adopted because single-tree coding lost information: Candid describes PCS as based on NTEE and expanded over three decades. Note also that PCS models geography as a facet, where this subject advises modelling it as data."
    }
  ],
  "documents": {
    "grant-taxonomy-design.md": {
      "disposition": "clarify",
      "reason": "Excellent on the two-halves framing, the cost-ordered assignment stack and the honest-null spine. Two corrections: step 4 prescribes 'the model chooses exactly one code from the closed vocabulary' for a sector dimension the subject elsewhere declares multi-valued, and the faceting rationale attributes a corrective motive to sector practice that the primary reference does not state."
    },
    "techniques/agency-and-programme-fallbacks.md": {
      "disposition": "clarify",
      "reason": "The unambiguous-issuers-only rule, the deliberate omissions written down as decisions, the acronym-versus-spelled-out haystack trap and the four-way blend by text-evidence strength are all specific and well earned. The claim that a fallback may correctly restore a sector a measured suppressor removed is asserted without measurement, in a subject that requires an audit number for the suppressor itself."
    },
    "techniques/append-only-codes-with-migrations.md": {
      "disposition": "keep",
      "reason": "Append-deprecate-migrate, migration applied on read before validity filtering (with filter-then-migrate named as the bug class), the version stamp on every classified row, the rename bar of demonstrable wrong calls, and the explicit statement that a split is a re-classification a map cannot resolve. The earlier record's unresolved-splits charge is answered in the text and is retracted."
    },
    "techniques/deterministic-first-classification.md": {
      "disposition": "keep",
      "reason": "The three grounds for privileging the rulebook are reproducibility, auditability and corpus-scale uniformity, not epistemic authority, which is the correct argument. Haystack construction with entity decoding, stem anchoring, match-all-then-validate, and audit-by-slice are all concrete. One phrasing observation, not a finding: it calls the project-grant mechanism default 'universally-true' where the sibling facet technique more carefully says 'nearly every ... unless stated otherwise' and insists it be documented as a default rather than a classification."
    },
    "techniques/false-positive-suppressors.md": {
      "disposition": "clarify",
      "reason": "The three-part anatomy with the innocence check as the safety guard, the cheapest-fix-first escalation ladder, the measurement-in-the-comment rule and the sense-versus-scope distinction are all strong. The section contradicts itself: 'a suppressor never acts on absence of evidence alone' sits three lines from a worked guilt check that fires on 'a bare sustainable with no environmental noun', which is exactly that."
    },
    "techniques/llm-residual-classification.md": {
      "disposition": "clarify",
      "reason": "The contract is the best-specified model gate in the bundle — residuals only, validated against the live code set, null as a first-class answer with the stakes stated in the prompt, confidence-gated persistence, failure never fabricating, derived-never-source, and untrusted grant text as delimited data. But its own 'when NOT to use it' excludes multi-label dimensions whose deterministic layers produce sets, which is precisely how the golden path and the application deploy it on sector."
    },
    "techniques/orthogonal-dimension-modelling.md": {
      "disposition": "keep",
      "reason": "The substitution test for entanglement, explicit per-dimension cardinality, code-versus-label separation with a single canonical term list, the browse surface as acceptance test, the beneficiary-as-geography trap, and the legal-absence rule with its one carefully documented exception. Corroborated in structure by Candid's PCS facets; the geography-as-data divergence is hedged and defensible."
    },
    "applications/node--deterministic-first-classification.md": {
      "disposition": "keep",
      "reason": "A model field record: version stamp, the single documented rename with its corroboration, migrate-before-filter shown in the right order, three suppressors each traceable to a measured rate, deleted stems preserved with their measurements and dates, and the facets-equal-the-browse-surface check made concrete. Historical code and verified_on 2026-08-19 preserved; not rerun."
    },
    "applications/node--llm-residual-classification.md": {
      "disposition": "clarify",
      "reason": "Faithfully documents every clause of the contract, including the null exemplar and the substring-trap exemplar, which are the two hardest things to get right. It records the exactly-one-code gate running over the sector dimension without noting that this is the deployment the technique's own exclusion rules out, or what happens to a genuinely two-sector residual row. Historical implementation and date not rerun."
    }
  }
}
```

---
subject: civic-knowledge-graphs
domain: civic-intelligence
last_touched: 2026-09-09
touched_by: architecture-review
dry_streak: 0
---

# civic-knowledge-graphs

First touch: [[2026-08-29-graph-engineering-system-intelligence]], intake of a
commentator's critique of a graph-engineering survey. `civic-entity-ontology` gained
one section ("The gate's rejections are the ritual's trigger") and a `use_when` case.

## What the gap actually was

A missing stage between two sentences the technique already had: the gate rejects
out-of-vocabulary kinds, and the amendment ritual starts when a new kind is demanded.
Nothing carried the rejection to the ritual, so a closed vocabulary could only grow
by intuition. The fix is the identity rule one level up - an unrecognised kind is a
lead, not a drop - and it corroborated from four bundles without a fetch.

## Still open

The run's second lead is not civic: whether a topology ever pays over a loop belongs
to `software-engineering/llm-agent/orchestration`.

## Architecture review - 2026-09-09

Retain the subject and all six techniques. Clarify publication boundaries,
claim identity, concurrent updates, reset accounting and capped ranking.
The earlier intake entry remains historical; this pass does not promote
maturity or refresh application verification dates.

### Open review leads

- Repair and exercise the consumer guard against retained-id property loss,
  an intervening writer and failure between deletion and replacement.
- Exercise path duplicate permutations, mixed-source trust/value claims and
  cap-before-ranking fixtures; review authorization before graph serialization.
- Recheck adjacent subjects for the same claim-revision and temporal-path
  boundaries when their rows are reached.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/civic-knowledge-graphs",
  "date": "2026-09-09",
  "baseline": "8c670a6506aa87556b42bbf7535e63592cc66fc6",
  "digest": "sha256:8a8dcf57ae13912a",
  "disposition": "clarify",
  "coverage": "All nine owned documents read. Local reset guard, shallow merge helper, path builder, final ranking and forensic display filter inspected. Primary provenance and isolation contracts consulted. No store reset, consumer runtime/concurrency test or historical measurement reproduced. Existing intake log and application witnesses preserved.",
  "counterexamples": [
    "A requested path contains a restricted pending allegation; requesting it does not authorize disclosure.",
    "Two writers read the same properties and shallow-merge different updates; the last write erases the first.",
    "A reset re-emits every node id but drops human review properties on those nodes.",
    "A verified low amount and an unverified high amount merge into a verified high amount never supported by one claim.",
    "A globally better equal-cost path falls beyond the enumeration cap.",
    "Null and zero duplicate weights tie after numeric normalization but preserve the first raw payload.",
    "A registry outage causes an identifier miss without proving dissolution.",
    "A rejected claim gains new evidence; reopening must be explicit and revision-scoped."
  ],
  "sources": [
    {
      "url": "https://www.postgresql.org/docs/18/transaction-iso.html",
      "result": "Read-committed snapshots can differ across statements; transaction boundaries alone do not establish the required multi-operation isolation or retry behavior."
    },
    {
      "url": "https://www.w3.org/TR/prov-dm/",
      "result": "Provenance models entities, activities, agents and derivations; recording lineage supports inspection rather than certifying factual truth."
    },
    {
      "source": "Local consumer source inspection",
      "result": "Reset input lacks properties; merge helper is a shallow spread; path builder merges trust and amounts independently, caps before sorting and preserves first raw equal-weight value. Forensic keep bypasses the display filter. Private pointers retained locally."
    }
  ],
  "documents": {
    "civic-knowledge-graphs.md": {
      "disposition": "clarify",
      "reason": "Provenance and deterministic computation are not truth/publication authority; guard properties and restrict requested paths to permitted input."
    },
    "techniques/civic-entity-ontology.md": {
      "disposition": "clarify",
      "reason": "Failed lookup does not establish extinction; a single rejected kind can be a valid ontology lead."
    },
    "techniques/destructive-rebuild-guard.md": {
      "disposition": "clarify",
      "reason": "Kinds and ids cannot prove preservation of properties or individual edges; couple check/write and provide failure recovery."
    },
    "techniques/evidence-path-finding.md": {
      "disposition": "clarify",
      "reason": "Preserve complete assertions, direction and valid time; cap-before-ranking limits optimality and reverse costs depend on the model."
    },
    "techniques/forensic-view-filtering.md": {
      "disposition": "clarify",
      "reason": "Requested answers and suppression counts remain subject to access/publication constraints; input slice is not whole-store coverage."
    },
    "techniques/pass-based-incremental-enrichment.md": {
      "disposition": "clarify",
      "reason": "Read-merge-write can lose concurrent updates; pass allocation and field writes need atomicity, stale keys need explicit handling."
    },
    "techniques/per-claim-provenance-stamping.md": {
      "disposition": "clarify",
      "reason": "Record underlying source snapshots, validate admission despite structured generation, and scope rejection closure to a claim revision."
    },
    "applications/node--destructive-rebuild-guard.md": {
      "disposition": "reverify",
      "reason": "Inspected guard cannot compare enriched properties or protect check/reset atomicity; corrected complexity claim; runtime recovery outstanding."
    },
    "applications/node--evidence-path-finding.md": {
      "disposition": "reverify",
      "reason": "Inspected mixed-source trust promotion, zero/null order dependence, capped ranking and display-only keep exception; runtime and upstream gates not verified."
    }
  }
}
```

## Architecture review - 2026-10-31

The 2026-09-09 clarifies are in the text, and three 2026-10-14 applications were read. One internal contradiction was found: the forensic filter's opening sentence against its new admission rule.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/civic-knowledge-graphs",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "digest": "sha256-b2:76e2caa5616df8ad",
  "disposition": "clarify",
  "coverage": "All twelve owned documents read: the golden path, six techniques and five applications, three of the applications added 2026-10-14. The 2026-09-09 clarify items are present. The new decision rules (refusal set derived from the closed vocabulary; admission-list filtering) were checked against the techniques they amend. Density arithmetic was recomputed. No consumer code, store, reset or concurrency test was reopened, and application dates stay as they were.",
  "counterexamples": [
    "A deterministic public-record edge with no review state is admitted by an admission-list filter, while the same technique's opening says the ambient view shows only human-reviewed edges.",
    "A generic writer with a two-item deny list passes a third relation the vocabulary later gains, and its replace-on-conflict upsert erases that relation's properties.",
    "A reset re-emits every node id but drops human review properties on those nodes (retained from 2026-09-09).",
    "A globally better equal-cost path falls beyond the enumeration cap (retained from 2026-09-09).",
    "A gate that throws on the first out-of-vocabulary kind never reports the out-of-vocabulary relation in the same batch."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/prov-dm/",
      "result": "Carried from 2026-09-09: provenance supports inspection of derivation, not certification of truth. No new claim in this subject rests on a changed external contract."
    },
    {
      "url": "https://www.postgresql.org/docs/18/transaction-iso.html",
      "result": "Carried from 2026-09-09 for the merge-concurrency boundary, which the pass-based technique still states."
    },
    {
      "source": "Internal consistency and arithmetic",
      "result": "207*206/2 = 21,321 pairs, and 20,496/21,321 = 96.1%, matching the evidence-path application's '96% pair density'. The forensic technique's new admission rule (verified plus a deterministic relation with nothing to review) contradicts its opening sentence ('shows only edges that passed human review'). The pass-based refusal rule (vocabulary minus owned) agrees with the rebuild guard's ban on hand-maintained lists, because the vocabulary is the single definition."
    }
  ],
  "documents": {
    "civic-knowledge-graphs.md": {"disposition": "keep", "reason": "Publication authority, binding of the rebuild accounting to the write, and permitted-scope paths all landed in 2026-09-09."},
    "techniques/civic-entity-ontology.md": {"disposition": "keep", "reason": "A failed lookup is not extinction. A single rejection is a lead and frequency sets only priority. The 2026-10-14 application supports reporting every refusal, not the first."},
    "techniques/destructive-rebuild-guard.md": {"disposition": "keep", "reason": "The property and edge granularity, check/write binding and failure-path clarifies are present."},
    "techniques/evidence-path-finding.md": {"disposition": "keep", "reason": "Intact claims, direction, valid time, cap-before-ranking and the cost-model derivation are stated."},
    "techniques/forensic-view-filtering.md": {"disposition": "clarify", "reason": "The opening ('shows only edges that passed human review') conflicts with the 2026-10-14 admission rule, which also admits deterministic relations with nothing to review. Align the opening."},
    "techniques/pass-based-incremental-enrichment.md": {"disposition": "keep", "reason": "The concurrency boundary is present. The new refusal-set rule is consistent with the one-definition law and the rebuild guard."},
    "techniques/per-claim-provenance-stamping.md": {"disposition": "keep", "reason": "Underlying source snapshots, admission validation and revision-scoped rejection are present."},
    "applications/node--destructive-rebuild-guard.md": {"disposition": "reverify", "reason": "Unchanged since 2026-09-09. Property and edge loss, atomicity and crash recovery in the consumer are not shown repaired."},
    "applications/node--evidence-path-finding.md": {"disposition": "reverify", "reason": "Unchanged since 2026-09-09. The density figure recomputes; the mixed-source merge, zero/null order and capped ranking are not shown repaired."},
    "applications/node--civic-entity-ontology.md": {"disposition": "reverify", "reason": "Internally consistent and its scope is honest (the ledger starts empty, no amendment was triggered). The consumer change and test counts were not reopened."},
    "applications/node--forensic-view-filtering.md": {"disposition": "reverify", "reason": "Internally consistent; no live path produces an out-of-union grade. The consumer change was not reopened."},
    "applications/node--pass-based-incremental-enrichment.md": {"disposition": "reverify", "reason": "Internally consistent: 18 of 18 in file, with the unmeasured verdict frequency stated. The consumer change was not reopened."}
  }
}
```

### Applied - 2026-10-31

Phase B applied the forensic-view clarify. Nothing else changed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/civic-knowledge-graphs",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "digest": "sha256-b2:832373fc73c83206",
  "disposition": "reverify",
  "coverage": "Second record, same session, against the digest after Phase B. All twelve owned documents read: the golden path, six techniques and five applications, three of the applications added 2026-10-14. The 2026-09-09 clarify items are present. The new decision rules (refusal set derived from the closed vocabulary; admission-list filtering) were checked against the techniques they amend. Density arithmetic was recomputed. No consumer code, store, reset or concurrency test was reopened, and application dates stay as they were.",
  "counterexamples": [
    "A deterministic public-record edge with no review state is admitted by an admission-list filter, while the same technique's opening says the ambient view shows only human-reviewed edges.",
    "A generic writer with a two-item deny list passes a third relation the vocabulary later gains, and its replace-on-conflict upsert erases that relation's properties.",
    "A reset re-emits every node id but drops human review properties on those nodes (retained from 2026-09-09).",
    "A globally better equal-cost path falls beyond the enumeration cap (retained from 2026-09-09).",
    "A gate that throws on the first out-of-vocabulary kind never reports the out-of-vocabulary relation in the same batch."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/prov-dm/",
      "result": "Carried from 2026-09-09: provenance supports inspection of derivation, not certification of truth. No new claim in this subject rests on a changed external contract."
    },
    {
      "url": "https://www.postgresql.org/docs/18/transaction-iso.html",
      "result": "Carried from 2026-09-09 for the merge-concurrency boundary, which the pass-based technique still states."
    },
    {
      "source": "Internal consistency and arithmetic",
      "result": "207*206/2 = 21,321 pairs, and 20,496/21,321 = 96.1%, matching the evidence-path application's '96% pair density'. The forensic technique's new admission rule (verified plus a deterministic relation with nothing to review) contradicts its opening sentence ('shows only edges that passed human review'). The pass-based refusal rule (vocabulary minus owned) agrees with the rebuild guard's ban on hand-maintained lists, because the vocabulary is the single definition."
    }
  ],
  "documents": {
    "civic-knowledge-graphs.md": {
      "disposition": "keep",
      "reason": "Publication authority, binding of the rebuild accounting to the write, and permitted-scope paths all landed in 2026-09-09."
    },
    "techniques/civic-entity-ontology.md": {
      "disposition": "keep",
      "reason": "A failed lookup is not extinction. A single rejection is a lead and frequency sets only priority. The 2026-10-14 application supports reporting every refusal, not the first."
    },
    "techniques/destructive-rebuild-guard.md": {
      "disposition": "keep",
      "reason": "The property and edge granularity, check/write binding and failure-path clarifies are present."
    },
    "techniques/evidence-path-finding.md": {
      "disposition": "keep",
      "reason": "Intact claims, direction, valid time, cap-before-ranking and the cost-model derivation are stated."
    },
    "techniques/forensic-view-filtering.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the opening now admits 'deterministic public-record edges that carry no review state', matching the admission rule."
    },
    "techniques/pass-based-incremental-enrichment.md": {
      "disposition": "keep",
      "reason": "The concurrency boundary is present. The new refusal-set rule is consistent with the one-definition law and the rebuild guard."
    },
    "techniques/per-claim-provenance-stamping.md": {
      "disposition": "keep",
      "reason": "Underlying source snapshots, admission validation and revision-scoped rejection are present."
    },
    "applications/node--destructive-rebuild-guard.md": {
      "disposition": "reverify",
      "reason": "Unchanged since 2026-09-09. Property and edge loss, atomicity and crash recovery in the consumer are not shown repaired."
    },
    "applications/node--evidence-path-finding.md": {
      "disposition": "reverify",
      "reason": "Unchanged since 2026-09-09. The density figure recomputes; the mixed-source merge, zero/null order and capped ranking are not shown repaired."
    },
    "applications/node--civic-entity-ontology.md": {
      "disposition": "reverify",
      "reason": "Internally consistent and its scope is honest (the ledger starts empty, no amendment was triggered). The consumer change and test counts were not reopened."
    },
    "applications/node--forensic-view-filtering.md": {
      "disposition": "reverify",
      "reason": "Internally consistent; no live path produces an out-of-union grade. The consumer change was not reopened."
    },
    "applications/node--pass-based-incremental-enrichment.md": {
      "disposition": "reverify",
      "reason": "Internally consistent: 18 of 18 in file, with the unmeasured verdict frequency stated. The consumer change was not reopened."
    }
  }
}
```

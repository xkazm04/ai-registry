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

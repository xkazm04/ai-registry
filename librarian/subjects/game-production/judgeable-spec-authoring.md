---
domain: game-production
subject: judgeable-spec-authoring
last_touched: 2026-09-10
touched_by: external-reconcile
dry_streak: 0
---

# judgeable-spec-authoring

Forged 2026-09-01 (commit `13c9e10`) with no application; first touch the same day by
[[2026-09-01-1]] through the external-reconcile lane. Counterpart: `cucumber/cucumber-js`
@ `c887bc5`, 13.2.1 (class A) - an executable-specification runner where a worked
example is executed against rules by a strict machine reader.

## Landed

- `applications/node--execute-the-rules-against-the-worked-example.md` (130 lines).
  Fate **confirmed**, step 4 sharpened, one scoped limit.

## Sharpest finding

The runner's verdict vocabulary classifies *why the example failed to bind to a rule* -
no rule (undefined, with a generated snippet), two rules (ambiguous, refusing any
most-specific heuristic), rule declared itself unfinished (pending), rule disagreed
(failed) - and strictness is one bit over exactly one of them: pending is the only
verdict a grader lets you configure away. Executed: strict flipped exactly one row of an
eight-row matrix; dry-run exits 0 while reporting undefined and ambiguous scenarios.

## Technique-edit candidates (banked, one sighting)

- `execute-the-rules-against-the-worked-example` step 4 collapses four binding
  outcomes into "decide which is right"; a step 3.5 asking one / none / two is owed.
- Same file, "audit even where no finding points": reachability - an unreferenced rule
  (a wording with zero call sites) survives execution-against-examples indefinitely.
- `enumeration-closure-as-arithmetic`: the strictest reader enforces only closure it can
  count locally (cells vs header); a cross-reference closure (every placeholder has a
  column) passes silently. Add to "when not to use".

## Leads

- `compatibility/` in the clone holds a versioned cross-implementation conformance kit.
  Return: when any subject here needs a class-B-style run rather than a hand fixture.
- Config coupling (`retry` must accompany `retryTagFilter`) is a `one-field-one-question`
  adjacent instance, undeveloped.

## Cross-subject proposals

- `acceptance-verdict-spine`: "exactly one verdict configurable, the rest unconditional"
  is a second-sighting candidate; a third makes it a law conversation.
- `quality-verdict-integrity`: dry-run exit 0 while judging nothing is a runnable
  instance of a green exit that judged nothing.

## Architecture review - 2026-09-10

Read and assessed all 9 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Document decisions identify the repairs and
remaining work. Earlier observations are preserved as historical evidence; they are
not refreshed runtime witnesses and do not override the qualifications below.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/judgeable-spec-authoring",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:519408b2a5048b8a",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed. Eight techniques across this tranche were repaired. Other semantic findings, golden-path reconciliation and all historical application witnesses remain reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh. External source scope and access limitations are recorded below.",
  "counterexamples": [
    "Matching counts do not prove matching sets: duplicates can conceal omissions. Check identities and disjoint ownership as well as arithmetic. Two siblings can share a mistaken assumption; they do not authorize inventing a requirement.",
    "Separate undefined, ambiguous, pending and executed-failing examples. Neither example nor rule is automatically authoritative; check the intended contract. Executed examples cover reached paths, not every rule.",
    "Derive mutable counts, but retain authored constants. Define bytes, code points or graphemes for text length. A global ban on old numeric literals can reject unrelated valid values, and a checker rejection may itself be a defect."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/content-pipeline/judgeable-spec-authoring/judgeable-spec-authoring.md",
      "scope": "Owned golden path, every technique and every application read as primary local review evidence. Document decisions identify internal contradictions and explicit counterexamples. Historical external implementation and mutable provider claims remain unverified; no new witness is asserted."
    }
  ],
  "documents": {
    "judgeable-spec-authoring.md": {
      "disposition": "reverify",
      "reason": "Reverify deterministic execution attributed to language-model reviewers, causal tone-score claims and universal five-point noise bands. Campaign statistics need artifacts and repeated controlled comparisons; a median is a policy, not a guarantee of correct judgment."
    },
    "techniques/enumeration-closure-as-arithmetic.md": {
      "disposition": "reverify",
      "reason": "Matching counts do not prove matching sets: duplicates can conceal omissions. Check identities and disjoint ownership as well as arithmetic. Two siblings can share a mistaken assumption; they do not authorize inventing a requirement."
    },
    "techniques/execute-the-rules-against-the-worked-example.md": {
      "disposition": "reverify",
      "reason": "Separate undefined, ambiguous, pending and executed-failing examples. Neither example nor rule is automatically authoritative; check the intended contract. Executed examples cover reached paths, not every rule."
    },
    "techniques/interpolated-counts-over-typed-counts.md": {
      "disposition": "reverify",
      "reason": "Derive mutable counts, but retain authored constants. Define bytes, code points or graphemes for text length. A global ban on old numeric literals can reject unrelated valid values, and a checker rejection may itself be a defect."
    },
    "techniques/one-field-one-question.md": {
      "disposition": "reverify",
      "reason": "A wrong value answering another conceivable question does not prove conflation. Define the actual quantities and causal ordering; strongest-input-wins is one policy, not a general aggregation rule."
    },
    "techniques/quantity-ownership-and-the-bindable-row.md": {
      "disposition": "reverify",
      "reason": "Stable consumer interfaces can use mechanisms other than table rows. A phantom consumer identifier is not automatically a producer defect; establish the contract and ownership before adding a zero-delta row."
    },
    "techniques/register-discipline-in-a-spec.md": {
      "disposition": "reverify",
      "reason": "Regex matches are review candidates, not proven rhetoric defects. Controlled repeated comparisons are needed to attribute score changes to register; preserve necessary rationale and uncertainty rather than optimizing solely for a grader."
    },
    "techniques/simulate-the-mechanism-not-the-constant.md": {
      "disposition": "reverify",
      "reason": "Grant/rate gives a sustaining interval only for the assumed constant linear drain. Piecewise rates, caps and event order need explicit modeling; simulation is not stronger than valid analytic derivation and does not prove runtime behavior."
    },
    "applications/node--execute-the-rules-against-the-worked-example.md": {
      "disposition": "reverify",
      "reason": "The pinned cucumber-js checkout, harnesses and historical results were not rerun. The application itself reports dry-run exit zero with undefined and ambiguous steps, contradicting its assertion that dry-run proves every step binds. A one-hit text search also does not establish an exported symbol is unused by external consumers. Preserve existing verification dates; no new consumer witness."
    }
  }
}
```

---
domain: game-production
subject: judgeable-spec-authoring
last_touched: 2026-10-31
touched_by: architecture-review
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

## Applied - 2026-10-10 (intake-apply-enum-closure-1010)

`enumeration-closure-as-arithmetic`, first application, on pof (a Next.js app), `code`,
`better`, ab-paired over 351 catalog steps. The dispatch reason was a single stack
(node). Applications now span `node` and `next`, but both run on a JavaScript runtime, so
the scan point moves less than the label suggests.

- `applications/next--enumeration-closure-as-arithmetic.md`. The produce prompt's
  "Required fields" list came from opt-in tags, and its guard sampled what a checker
  *says* on empty data. Blind graded steps went from 58 of 259 to 0. Prompts asking for a
  wiring contract that nothing grades went from 119 of 258 to 0. Verdicts on all 351
  stubs were identical, and no block was evicted by the size cap. pof `cc848c85`.

**Sharpest finding.** The guard that already sat on this seam was a census of reason
text, and a value law gives no reason. A closure built from what the checker reads,
recorded over the producer's own stub, found 19 value-law fields that no prompt had named.

### Technique-edit candidates (banked, one sighting)

- `enumeration-closure-as-arithmetic`: **in a size-budgeted artifact, the closure
  competes with what it closes over.** Naming every graded field evicted another
  section at the cap. It was paid for by the inverse closure: an instruction no
  reader consumes was deleted. Return: a second budgeted artifact where stating a
  closure evicts a section.
- Same technique, procedure: the dispositions were three (described here, named here,
  settled later by a runner or a selection), and a draft that gave every unlisted
  field one disposition told a producer to write a field the selection owns. The
  technique already says "owned there by name". The case is worth a line under its
  decision rules if a second tree shows a runner-owned field.

### Leads

- pof vendors/Economy Sim grades one quantity at two addresses (a nested blended
  margin and a top-level copy written for a second checker). This is
  `quantity-ownership-and-the-bindable-row` territory, unapplied. Return: when that
  technique is applied to pof.

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

## Architecture review - 2026-10-31

All 10 current documents read at current bytes against `85a365702`. The 2026-09-10 record
listed 9; `applications/next--enumeration-closure-as-arithmetic.md` landed 2026-10-10 and is
decided here for the first time. The cucumber-js source at the pinned commit `c887bc5` was
re-opened for the node application's source citations (not its executed fixtures): every
cited line range still holds, and two of its sentences overstate what that source shows.

**Retractions of 2026-09-10 inferences.** That record marked every technique `reverify`
with a counterexample as its reason. Several of those are answered by the current text and
are retracted as findings against it. `quantity-ownership-and-the-bindable-row` already
scopes the bindable-row test to "the same interface as every other behaviour in the table",
and its "when not to use" already refuses rows nothing binds to. `register-discipline-in-a-spec`
already guards against regex false positives: player-facing prose is exempt, and register
edits must provably preserve facts. Those two are `keep`. Still standing: the dry-run
overstatement in the node application, step 4's single bucket in
`execute-the-rules-against-the-worked-example` (one of four binding outcomes), and
grant / rate in `simulate-the-mechanism-not-the-constant`.

**New this run.** The golden path calls single-probe movement under about five points
noise, then cites an unchanged artifact that moved ten (80 then 70). Its own evidence sets
the band wider than its rule. It also classifies findings across "308 sub-bar artifacts"
in a campaign it sizes at 160 artifacts, and never says how the two populations relate.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/judgeable-spec-authoring",
  "date": "2026-10-31",
  "baseline": "85a365702",
  "digest": "sha256-b2:85e0c3851c4a6027",
  "disposition": "clarify",
  "coverage": "All 10 current documents read at current bytes, including next--enumeration-closure-as-arithmetic (landed 2026-10-10, absent from the 2026-09-10 record). cucumber-js at c887bc5 re-opened for the node application's source citations: src/runtime/helpers.ts, test_case_runner.ts, step_runner.ts, configuration/default_configuration.ts and package.json. Not evaluated: the application's fixture runs, the pof tree behind the next application, and every campaign score in the golden path and techniques (private campaign, no artifacts reachable). No verification date refreshed.",
  "counterexamples": [
    "Under --dry-run, shouldCauseFailure returns false before the status is consulted, so a run with undefined and ambiguous steps exits 0. A dry run proves no step binds; it proves nothing fails.",
    "A closure sum can add up while the sets differ: a duplicated name can stand in for an omitted one, so a total of thirteen over thirteen names does not prove thirteen distinct fields.",
    "Grant / rate gives the sustaining interval only for a constant drain. The technique's own worked case has a rate that is zero below a rank, where the loop, not the division, gives the interval.",
    "An example can bind to no rule, to two rules, to a rule marked pending, or to one finished rule that disagrees. Only the last is a rule/example disagreement, and each of the four takes a different repair.",
    "A ten-point swing on unchanged content (80 then 70, cited in the golden path) is outside a five-point noise band, so that band is not a safe threshold for this grader."
  ],
  "sources": [
    {
      "url": "https://github.com/cucumber/cucumber-js/blob/c887bc5667aa8fdc797efec632249b97268b6759/src/runtime/helpers.ts",
      "result": "Read 2026-10-31. Lines 62-75: `if (options.dryRun) { return false }` precedes the failure-status list (AMBIGUOUS, FAILED, UNDEFINED; PENDING appended only under strict). Lines 9-41 define getAmbiguousStepException with text 'Multiple step definitions match:'. Supports the strict/one-verdict finding; refutes 'structural proof that every step binds'."
    },
    {
      "url": "https://github.com/cucumber/cucumber-js/blob/c887bc5667aa8fdc797efec632249b97268b6759/src/runtime/test_case_runner.ts",
      "result": "Read 2026-10-31. Line 329 `stepDefinitions.length === 0` gives UNDEFINED with a suggestion envelope; line 343 `length > 1` gives AMBIGUOUS. step_runner.ts:72 'pending' gives PENDING, then FAILED on error, else PASSED. default_configuration.ts:25 `strict: true`. Supports the four-way classification proposed for the technique's step 4."
    },
    {
      "url": "https://github.com/cucumber/cucumber-js/blob/c887bc5667aa8fdc797efec632249b97268b6759/package.json",
      "result": "Read 2026-10-31. `exports` includes \"./lib/*\", so lib/runtime/helpers.js is requireable by external consumers. A one-hit grep inside the tree shows the function is unreferenced there, not that it is dead."
    },
    {
      "source": "Internal reading of judgeable-spec-authoring.md",
      "result": "The 'about five points' noise band contradicts the same section's 80-then-70 observation; '308 sub-bar artifacts' is not reconciled with the 160-artifact campaign it introduces."
    }
  ],
  "documents": {
    "judgeable-spec-authoring.md": {
      "disposition": "clarify",
      "reason": "(1) 'Anything under about five points of single-probe movement is noise' sits next to an unchanged artifact moving ten points (80 then 70); restate the band from the section's own observations. (2) '308 sub-bar artifacts' is not reconciled with the 160-artifact campaign; say how the populations relate. (3) The opening calls the reviewer an executor that 'recomputes every derivation', which the medians section contradicts; scope it to what the grader was observed to do. Campaign figures remain unreproducible from here."
    },
    "techniques/enumeration-closure-as-arithmetic.md": {
      "disposition": "clarify",
      "reason": "(1) Add that a sum which adds up does not prove the sets match: compare names as well as totals (the next application already does this). (2) 'If two siblings independently assume a thing exists, the missing thing is real - build it' needs a check of the intended contract; two siblings can share one mistaken assumption. (3) The banked cross-reference-closure limit from the cucumber run (placeholders vs Examples columns) is one sighting and not yet verified against gherkin."
    },
    "techniques/execute-the-rules-against-the-worked-example.md": {
      "disposition": "clarify",
      "reason": "(1) Step 4 has one bucket ('decide which is right') where an execution can bind to none, two, a pending rule or one finished rule; split it, as the cucumber-js source shows. (2) The banked reachability clause (a rule no example reaches keeps a stale statement) still rests on the application's executed grep and pretty-formatter output, not re-checked here."
    },
    "techniques/interpolated-counts-over-typed-counts.md": {
      "disposition": "clarify",
      "reason": "(1) The stale-literal scan ('assert the old literals appear nowhere') conflicts with the technique's own 'do not interpolate a number whose stability is the point': an old literal can legitimately survive as an owned, published value. (2) 'N characters' needs a unit (bytes, code points, graphemes); not resolved from a source this run."
    },
    "techniques/one-field-one-question.md": {
      "disposition": "clarify",
      "reason": "Step 4's 'let the strongest win' is the right policy for its loading-tier example (always-loaded beats deferred) but is stated as a general aggregation rule. Scope it to quantities with a dominance order. No source settles the general case."
    },
    "techniques/quantity-ownership-and-the-bindable-row.md": {
      "disposition": "keep",
      "reason": "Retracts the 2026-09-10 reverify. The bindable-row test is already scoped to 'the same interface as every other behaviour in the table', and 'when not to use' already refuses rows that nothing binds to."
    },
    "techniques/register-discipline-in-a-spec.md": {
      "disposition": "keep",
      "reason": "Retracts the 2026-09-10 reverify. The sweep's false-positive risk is already handled (player-facing prose exempt, register edits must provably preserve facts), and the score evidence is presented as one campaign's four observations, which is what it is."
    },
    "techniques/simulate-the-mechanism-not-the-constant.md": {
      "disposition": "clarify",
      "reason": "'The sustaining interval is grant / rate' holds only for a constant drain, while the technique's own worked case has a rate that is zero below a rank. Scope the division to constant rates; let the loop compute the rest."
    },
    "applications/next--enumeration-closure-as-arithmetic.md": {
      "disposition": "reverify",
      "reason": "First decision. Internally consistent: the 58-of-259 arm, the identity-based guard, the eviction limit and the three-way disposition all agree with the technique. The pof tree and its paired run were not reopened."
    },
    "applications/node--execute-the-rules-against-the-worked-example.md": {
      "disposition": "clarify",
      "reason": "(1) '--dry-run ... structural proof that every step binds' contradicts its own table, where dry-run exits 0 with undefined and ambiguous steps; helpers.ts:63-65 returns false before status. (2) 'It is dead' overstates a one-hit grep; package.json exports './lib/*', so external consumers can reach it. Source citations re-checked and hold; the executed fixtures were not re-run, so verified_on stays."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the items the first 2026-10-31 record could confirm: the golden-path noise band,
the step-4 binding classification (cucumber-js source), the sets-versus-sums decision rule,
the stale-literal exemption, the scope of grant / rate, and the node application's dry-run
and unreferenced-function wording. Items whose evidence is a private campaign or an
unverified sighting stay owed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/judgeable-spec-authoring",
  "date": "2026-10-31",
  "baseline": "85a365702",
  "digest": "sha256-b2:e627b3fb8f5f2ebc",
  "disposition": "clarify",
  "coverage": "Second 2026-10-31 record, after applying the clarify items that the cucumber-js source or internal arithmetic confirmed this run. Edited sections re-read; the other documents are byte-unchanged and keep the first record's decisions. Not evaluated: as in the first record. No verification date refreshed.",
  "counterexamples": [
    "Under --dry-run, shouldCauseFailure returns false before the status is consulted, so a run with undefined and ambiguous steps exits 0. A dry run proves no step binds; it proves nothing fails.",
    "A closure sum can add up while the sets differ: a duplicated name can stand in for an omitted one, so a total of thirteen over thirteen names does not prove thirteen distinct fields.",
    "Grant / rate gives the sustaining interval only for a constant drain. The technique's own worked case has a rate that is zero below a rank, where the loop, not the division, gives the interval.",
    "An example can bind to no rule, to two rules, to a rule marked pending, or to one finished rule that disagrees. Only the last is a rule/example disagreement, and each of the four takes a different repair.",
    "A ten-point swing on unchanged content (80 then 70, cited in the golden path) is outside a five-point noise band, so that band is not a safe threshold for this grader."
  ],
  "sources": [
    {
      "url": "https://github.com/cucumber/cucumber-js/blob/c887bc5667aa8fdc797efec632249b97268b6759/src/runtime/helpers.ts",
      "result": "Read 2026-10-31. Lines 62-75: `if (options.dryRun) { return false }` precedes the failure-status list (AMBIGUOUS, FAILED, UNDEFINED; PENDING appended only under strict). Lines 9-41 define getAmbiguousStepException with text 'Multiple step definitions match:'. Supports the strict/one-verdict finding; refutes 'structural proof that every step binds'."
    },
    {
      "url": "https://github.com/cucumber/cucumber-js/blob/c887bc5667aa8fdc797efec632249b97268b6759/src/runtime/test_case_runner.ts",
      "result": "Read 2026-10-31. Line 329 `stepDefinitions.length === 0` gives UNDEFINED with a suggestion envelope; line 343 `length > 1` gives AMBIGUOUS. step_runner.ts:72 'pending' gives PENDING, then FAILED on error, else PASSED. default_configuration.ts:25 `strict: true`. Supports the four-way classification proposed for the technique's step 4."
    },
    {
      "url": "https://github.com/cucumber/cucumber-js/blob/c887bc5667aa8fdc797efec632249b97268b6759/package.json",
      "result": "Read 2026-10-31. `exports` includes \"./lib/*\", so lib/runtime/helpers.js is requireable by external consumers. A one-hit grep inside the tree shows the function is unreferenced there, not that it is dead."
    },
    {
      "source": "Internal reading of judgeable-spec-authoring.md",
      "result": "The 'about five points' noise band contradicts the same section's 80-then-70 observation; '308 sub-bar artifacts' is not reconciled with the 160-artifact campaign it introduces."
    }
  ],
  "documents": {
    "judgeable-spec-authoring.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: the noise band now follows the section's own observations (five points routine, ten seen on untouched content). Still owed: reconcile '308 sub-bar artifacts' with the 160-artifact campaign, and scope the opening's 'recomputes every derivation' to observed grader behaviour; neither is settled from a source reachable here."
    },
    "techniques/enumeration-closure-as-arithmetic.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: a decision rule that a sum which adds up still needs a name comparison (a duplicate can stand in for an omission). Still owed: the 'two siblings assume it, so build it' rule needs a contract check, and the cross-reference-closure limit is one unverified sighting."
    },
    "techniques/execute-the-rules-against-the-worked-example.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: new step 4 asks how the example bound (no rule, two rules, an unfinished rule, one finished rule that differs) before step 5 decides who is right, per cucumber-js test_case_runner.ts:329-348 and step_runner.ts:72. Still owed: the reachability clause, whose evidence was not re-checked."
    },
    "techniques/interpolated-counts-over-typed-counts.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: the stale-literal scan now exempts a published value the edit did not own, matching the file's own 'when not to use'. Still owed: the unit of 'characters'."
    },
    "techniques/one-field-one-question.md": {
      "disposition": "clarify",
      "reason": "Step 4's 'let the strongest win' is the right policy for its loading-tier example (always-loaded beats deferred) but is stated as a general aggregation rule. Scope it to quantities with a dominance order. No source settles the general case."
    },
    "techniques/quantity-ownership-and-the-bindable-row.md": {
      "disposition": "keep",
      "reason": "Retracts the 2026-09-10 reverify. The bindable-row test is already scoped to 'the same interface as every other behaviour in the table', and 'when not to use' already refuses rows that nothing binds to."
    },
    "techniques/register-discipline-in-a-spec.md": {
      "disposition": "keep",
      "reason": "Retracts the 2026-09-10 reverify. The sweep's false-positive risk is already handled (player-facing prose exempt, register edits must provably preserve facts), and the score evidence is presented as one campaign's four observations, which is what it is."
    },
    "techniques/simulate-the-mechanism-not-the-constant.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: grant / rate is now scoped to a constant drain, with the loop computing state-dependent rates, in the body and the decision rule."
    },
    "applications/next--enumeration-closure-as-arithmetic.md": {
      "disposition": "reverify",
      "reason": "First decision. Internally consistent: the 58-of-259 arm, the identity-based guard, the eviction limit and the three-way disposition all agree with the technique. The pof tree and its paired run were not reopened."
    },
    "applications/node--execute-the-rules-against-the-worked-example.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: dry-run now reads as a green exit with zero rules executed even over unbound steps (helpers.ts:63-65); 'dead' became unreferenced in the tree, with the './lib/*' export noted; the historical 'step 4' is marked 'as forged'. Source citations hold; the executed fixtures were not re-run, so verified_on stays."
    }
  }
}
```

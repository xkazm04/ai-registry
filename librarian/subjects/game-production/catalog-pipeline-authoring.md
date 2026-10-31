---
domain: game-production
subject: catalog-pipeline-authoring
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# catalog-pipeline-authoring

## Architecture review - 2026-09-10

Read and assessed all 10 owned documents. The subject remains
**reverify**: a current review decision is not a clean content verdict. The
document decisions below identify concrete unresolved claims and the repairs made.
Historical application evidence and earlier librarian observations are preserved;
they are not new runtime witnesses.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/catalog-pipeline-authoring",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:0f122090d1189776",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed. Four techniques across this ten-subject tranche were repaired; other findings remain explicit reverify work. Primary-source checks have only the scope recorded below. No consumer source checkout, engine execution, player study, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "One seed can pass while an unvisited checker branch reads a different field.",
    "An exception count can stay constant while a new violating identity replaces an old one.",
    "A known failure plus a deferred check must not become an aggregate deferral."
  ],
  "sources": [
    {
      "url": "https://playwright.dev/docs/best-practices",
      "scope": "Official isolation guidance supports independent reproducible tests; it does not establish exhaustive coverage of a catalog from one seed."
    }
  ],
  "documents": {
    "catalog-pipeline-authoring.md": {
      "disposition": "reverify",
      "reason": "Reverify universal claims about bespoke tools, fixed vocabulary size and complete walker coverage. Separate coherent declarations from exhaustive behavior evidence."
    },
    "techniques/archetype-view-coherence-ratchet.md": {
      "disposition": "reverify",
      "reason": "Reverify the count-only ratchet: enforce containment of allowed exception identities, and distinguish observed convention from an independently justified invariant."
    },
    "techniques/direction-as-first-class-produce-input.md": {
      "disposition": "reverify",
      "reason": "Reverify reproducibility and collision claims. Direction needs model/tool/input provenance, a reserved namespace, and explicit empty versus unknown states."
    },
    "techniques/packaging-exempt-two-state-rule.md": {
      "disposition": "reverify",
      "reason": "Reverify exclusive terminal-or-exemption validation, including both-present cases. Frequent absence alone does not justify reversing a shipping requirement."
    },
    "techniques/seed-entities-and-walker-coverage.md": {
      "disposition": "reverify",
      "reason": "Reverify evidence scope and aggregation: cover negative fixtures and branches, bind revision and run configuration, and preserve failures alongside deferrals."
    },
    "techniques/step-archetype-taxonomy.md": {
      "disposition": "reverify",
      "reason": "Reverify nine-kind, three-example and vocabulary-size prescriptions as local conventions; one justified requirement can warrant a new kind."
    },
    "techniques/view-produce-accept-triad.md": {
      "disposition": "reverify",
      "reason": "Reverify sampled dependency tracing, displayed-field equality and downstream-step prohibition. Explicit dependencies and branch fixtures are needed; aggregate failure precedence must be order-independent."
    },
    "applications/node--seed-entities-and-walker-coverage.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed seed-entities-and-walker-coverage contract. Reverify evidence scope and aggregation: cover negative fixtures and branches, bind revision and run configuration, and preserve failures alongside deferrals."
    },
    "applications/process--step-archetype-taxonomy.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed step-archetype-taxonomy contract. Reverify nine-kind, three-example and vocabulary-size prescriptions as local conventions; one justified requirement can warrant a new kind."
    },
    "applications/react--archetype-view-coherence-ratchet.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed archetype-view-coherence-ratchet contract. Reverify the count-only ratchet: enforce containment of allowed exception identities, and distinguish observed convention from an independently justified invariant."
    }
  }
}
```

## Architecture review - 2026-10-31

Re-review against `b005a97cb`. Since the 2026-09-10 record the subject gained
`producer-facts-are-observed-not-declared`, its node application, and a golden-path
section; the other ten documents are unchanged since that record. The 2026-09-10 record
said four techniques "across this ten-subject tranche were repaired"; none of the ten
documents here carries a change from that pass, so its reverify items still stand and
are carried below. Two new items: the node application's decided-cells sentence does not
match its own table, and direction-as-first-class-produce-input offers the corrective run
unconditionally while the new sibling technique withholds it for a provable no-op. No
verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/catalog-pipeline-authoring",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:882ddb351d358533",
  "disposition": "clarify",
  "coverage": "All 12 current documents read in full. Arithmetic in both node applications and the archetype counts across documents recomputed. Primary sources opened for the arity probe and for the walker's server-reuse rule. Not evaluated: the consumer tree and its tests, any engine or model run, any operator study.",
  "counterexamples": [
    "A body written as (entity, ...rest) or (entity, direction = '') reads the direction while Function.length reports 1, so an arity probe says it cannot.",
    "A table of 335 audited and 3 authored cells cannot support '338 carry an audit fact'.",
    "One seed can pass while an unvisited checker branch reads a different field (retained from 2026-09-10).",
    "An exception count can stay constant while a new violating identity replaces an old one (retained)."
  ],
  "sources": [
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/length",
      "result": "'Only parameters before the first one with a default value are counted'; 'The rest parameter is excluded'; arguments.length is separate. Supports the probe's stated blind spots (rest form, default, arguments object)."
    },
    {
      "url": "https://playwright.dev/docs/test-webserver",
      "result": "reuseExistingServer: 'If true, it will re-use an existing server on the port or url when available'; env is 'Environment variables for the command'. Consistent with the walker's reason that an adopted server never received the isolated store path; the page does not state this outright."
    },
    {
      "source": "applications/node--producer-facts-are-observed-not-declared.md, internal arithmetic",
      "result": "Ceilings sum to 344 (34+126+47+61+35+16+14+6+5). Before table 335+3+0+6=344, after 321+8+14+1=344. 11/41 = 27%. The decided-cells sentence attributes all 338 stronger cells to audit facts; the table gives 335 audited plus 3 authored."
    }
  ],
  "documents": {
    "catalog-pipeline-authoring.md": {
      "disposition": "reverify",
      "reason": "Unchanged claims still owed from 2026-09-10: 'the one nearly every studio makes' is an unsourced universal; evidence-of-three and complete walker coverage are local conventions stated as rules. The new producer-facts section matches its technique."
    },
    "techniques/archetype-view-coherence-ratchet.md": {
      "disposition": "reverify",
      "reason": "Still owed: the ratchet asserts a count only; it should assert the set of grandfathered identities, since a swap keeps the count. Its own when-not section already asks for the independent justification."
    },
    "techniques/direction-as-first-class-produce-input.md": {
      "disposition": "clarify",
      "reason": "The corrective ladder says a failing step 'should offer a one-click corrective production', while producer-facts-are-observed-not-declared withholds that control when the producer provably cannot read the instruction. Add the exception and the cross-reference. Still owed from 2026-09-10: model and tool provenance beside the steer, explicit empty versus unknown."
    },
    "techniques/packaging-exempt-two-state-rule.md": {
      "disposition": "reverify",
      "reason": "Still owed: the check should also fail a class that both owns the terminal step and declares an exemption; 'ten exempt is no longer a convention' is a judgement, not evidence."
    },
    "techniques/producer-facts-are-observed-not-declared.md": {
      "disposition": "keep",
      "reason": "New since the last record. The probe's blind spots match the language semantics (MDN quoted); the refuse-versus-downgrade split, the not-recorded state and the measure-before-authoring rule are internally consistent and match the golden path. Law links resolve."
    },
    "techniques/seed-entities-and-walker-coverage.md": {
      "disposition": "reverify",
      "reason": "Still owed: a seed walk exercises one path per step, not checker branches or negative fixtures, and the walk-success record should bind revision and run configuration."
    },
    "techniques/step-archetype-taxonomy.md": {
      "disposition": "reverify",
      "reason": "Still owed: 'nine is workable, a dozen the ceiling' and 'evidence of three' are one consumer's conventions stated as general sizing rules."
    },
    "techniques/view-produce-accept-triad.md": {
      "disposition": "reverify",
      "reason": "Still owed: 'compose the deferrable criterion last' makes failure precedence depend on order; an order-independent rule (any fail beats deferred) is the stronger form. Sampled field tracing sees only the path the synthetic entity takes."
    },
    "applications/node--producer-facts-are-observed-not-declared.md": {
      "disposition": "clarify",
      "reason": "'338 carry an audit fact' contradicts the document's own table (335 audited, 3 authored, both ranked above the heuristic). Correct the sentence. The private tree was not reopened; verified_on stays."
    },
    "applications/node--seed-entities-and-walker-coverage.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness not rerun; the Playwright reuse rule it relies on reads consistently with the official page. Dates preserved."
    },
    "applications/process--step-archetype-taxonomy.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness not rerun; counts (nine archetypes, three text-eligible) agree with the sibling applications."
    },
    "applications/react--archetype-view-coherence-ratchet.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness not rerun. Internal counts agree: 4 of 344 divergences (1.2%), rules 115+11 = 126, the same 126 the later direction ceiling carries."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the two clarify items the record above named. The application's decided-cells
sentence now matches its table; the direction technique's corrective ladder now carries
the no-op exception and points at its sibling. Everything else keeps its disposition, so
the subject stays `reverify`. No verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/catalog-pipeline-authoring",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:070dd1ac3a9d9d13",
  "disposition": "reverify",
  "coverage": "All 12 current documents read in full. Arithmetic in both node applications and the archetype counts across documents recomputed. Primary sources opened for the arity probe and for the walker's server-reuse rule. Not evaluated: the consumer tree and its tests, any engine or model run, any operator study. Second record: the applied clarify items were re-read after editing; every other document is byte-unchanged and keeps its disposition.",
  "counterexamples": [
    "A body written as (entity, ...rest) or (entity, direction = '') reads the direction while Function.length reports 1, so an arity probe says it cannot.",
    "A table of 335 audited and 3 authored cells cannot support '338 carry an audit fact'.",
    "One seed can pass while an unvisited checker branch reads a different field (retained from 2026-09-10).",
    "An exception count can stay constant while a new violating identity replaces an old one (retained)."
  ],
  "sources": [
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/length",
      "result": "'Only parameters before the first one with a default value are counted'; 'The rest parameter is excluded'; arguments.length is separate. Supports the probe's stated blind spots (rest form, default, arguments object)."
    },
    {
      "url": "https://playwright.dev/docs/test-webserver",
      "result": "reuseExistingServer: 'If true, it will re-use an existing server on the port or url when available'; env is 'Environment variables for the command'. Consistent with the walker's reason that an adopted server never received the isolated store path; the page does not state this outright."
    },
    {
      "source": "applications/node--producer-facts-are-observed-not-declared.md, internal arithmetic",
      "result": "Ceilings sum to 344 (34+126+47+61+35+16+14+6+5). Before table 335+3+0+6=344, after 321+8+14+1=344. 11/41 = 27%. The decided-cells sentence attributes all 338 stronger cells to audit facts; the table gives 335 audited plus 3 authored."
    }
  ],
  "documents": {
    "catalog-pipeline-authoring.md": {
      "disposition": "reverify",
      "reason": "Unchanged claims still owed from 2026-09-10: 'the one nearly every studio makes' is an unsourced universal; evidence-of-three and complete walker coverage are local conventions stated as rules. The new producer-facts section matches its technique."
    },
    "techniques/archetype-view-coherence-ratchet.md": {
      "disposition": "reverify",
      "reason": "Still owed: the ratchet asserts a count only; it should assert the set of grandfathered identities, since a swap keeps the count. Its own when-not section already asks for the independent justification."
    },
    "techniques/direction-as-first-class-produce-input.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the corrective-button paragraph now says the button is withheld where the producer provably cannot read the instruction, with a pointer to producer-facts-are-observed-not-declared. Still owed (unchanged): model and tool provenance beside the steer."
    },
    "techniques/packaging-exempt-two-state-rule.md": {
      "disposition": "reverify",
      "reason": "Still owed: the check should also fail a class that both owns the terminal step and declares an exemption; 'ten exempt is no longer a convention' is a judgement, not evidence."
    },
    "techniques/producer-facts-are-observed-not-declared.md": {
      "disposition": "keep",
      "reason": "New since the last record. The probe's blind spots match the language semantics (MDN quoted); the refuse-versus-downgrade split, the not-recorded state and the measure-before-authoring rule are internally consistent and match the golden path. Law links resolve."
    },
    "techniques/seed-entities-and-walker-coverage.md": {
      "disposition": "reverify",
      "reason": "Still owed: a seed walk exercises one path per step, not checker branches or negative fixtures, and the walk-success record should bind revision and run configuration."
    },
    "techniques/step-archetype-taxonomy.md": {
      "disposition": "reverify",
      "reason": "Still owed: 'nine is workable, a dozen the ceiling' and 'evidence of three' are one consumer's conventions stated as general sizing rules."
    },
    "techniques/view-produce-accept-triad.md": {
      "disposition": "reverify",
      "reason": "Still owed: 'compose the deferrable criterion last' makes failure precedence depend on order; an order-independent rule (any fail beats deferred) is the stronger form. Sampled field tracing sees only the path the synthetic entity takes."
    },
    "applications/node--producer-facts-are-observed-not-declared.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: \"338 carry an audit fact\" now reads \"the other 338 carry a stronger fact — 335 an audit fact, 3 an authored engine\", matching the table. verified_on unchanged."
    },
    "applications/node--seed-entities-and-walker-coverage.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness not rerun; the Playwright reuse rule it relies on reads consistently with the official page. Dates preserved."
    },
    "applications/process--step-archetype-taxonomy.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness not rerun; counts (nine archetypes, three text-eligible) agree with the sibling applications."
    },
    "applications/react--archetype-view-coherence-ratchet.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness not rerun. Internal counts agree: 4 of 344 divergences (1.2%), rules 115+11 = 126, the same 126 the later direction ceiling carries."
    }
  }
}
```

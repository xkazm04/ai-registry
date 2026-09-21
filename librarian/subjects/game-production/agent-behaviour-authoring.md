---
domain: game-production
subject: agent-behaviour-authoring
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# agent-behaviour-authoring

## Architecture review - 2026-09-10

Read all nine documents. Corrected absolute model, knowledge, commitment and
coordination claims and narrowed decision-trace evidence. Both applications remain reverify.

Consumer implementation claims and historical measurements remain reverify work.
The digest binds the reviewed working-tree content, not a new runtime witness.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/agent-behaviour-authoring",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:13bbe0728b5d23bc",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read and assessed. Source checks are scoped below. No consumer code, engine run, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "Empty trace after collector failure does not prove an agent never ran.",
    "A confirmed claim whose holder dies still needs expiry; arrival confirmation alone cannot reclaim it.",
    "A health drop caused by another agent does not prove the tested action executed.",
    "Two individually sensed facts can have mutually exclusive guards, leaving an intent infeasible.",
    "A read-only perceived-health cache is not a second writable health authority."
  ],
  "sources": [
    {
      "url": "https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---overview",
      "scope": "Official event-driven tree and blackboard observation model; no consumer code or engine runtime checked."
    }
  ],
  "documents": {
    "agent-behaviour-authoring.md": {
      "disposition": "clarify",
      "reason": "Replace exclusive knowledge/model claims with explicit information, execution, coordination and evidence contracts."
    },
    "techniques/behaviour-model-selection.md": {
      "disposition": "clarify",
      "reason": "Qualify complexity thresholds, tree evaluation, target selection and binary-authoring restrictions."
    },
    "techniques/perception-before-decision.md": {
      "disposition": "clarify",
      "reason": "Scope sensing and confidence models; allow declared knowledge sources and distinguish source existence from feasible reachability."
    },
    "techniques/blackboard-as-declared-shared-state.md": {
      "disposition": "clarify",
      "reason": "Define multiwriter reduction, atomic snapshots, perceived caches and reliable event semantics without conflating storage with authority."
    },
    "techniques/commitment-and-recovery-windows.md": {
      "disposition": "clarify",
      "reason": "Separate reconsideration from execution, allow authored tracking/concurrency and define interrupt and clock semantics."
    },
    "techniques/group-coordination-without-a-hive-mind.md": {
      "disposition": "clarify",
      "reason": "Add atomic lease lifecycle, fencing, multi-slot rollback and fairness; scope commander and resource-location claims."
    },
    "techniques/decision-trace-as-evidence.md": {
      "disposition": "clarify",
      "reason": "Reject empty-trace and seed-only proofs; require instrumentation health, causal action correlation and scoped coverage."
    },
    "applications/node--group-coordination-without-a-hive-mind.md": {
      "disposition": "reverify",
      "reason": "Reverify prompt/runtime boundary, lease races and health-change attribution."
    },
    "applications/process--perception-before-decision.md": {
      "disposition": "reverify",
      "reason": "Reverify engine semantics and historical generation limits; distinguish timeout, sensing and reaction controls."
    }
  }
}
```

## 2026-09-10 — architecture re-review after the compression revert

Read the golden path, all six techniques and both applications at their reverted bytes,
then re-resolved every citation in the two applications against the pof checkout at HEAD
`d823bffe`. I read those files; I ran no engine, spawned no agent and observed no trace.

**The subject's spine holds.** The organising claim — an agent's competence is bounded by
what it knows, not by how well it chooses — is not a slogan here; it does load-bearing
work in four separate places. It is why perception is authored before decision, why
`unknown` is a third value rather than a default of false, why the omniscient agent and
the blind agent are named as mirror failures with the same invisible signature, and why
the subject refuses to be a catalogue of arbitration structures. The four-link decomposition
(knowledge, decision, commitment, evidence) partitions the craft cleanly and each technique
sits on exactly one link. The seams to combat semantics, difficulty adaptation and encounter
simulation are the most carefully drawn in this bundle — particularly the difficulty seam,
which states the handoff in both directions and forbids either subject from stating the
other's half.

**Every application citation re-resolved and held.** `module-registry.ts:806` is still the
perception checklist item with `SightRadius 1500 / LoseSightRadius 2000 /
PeripheralVisionAngle 45 / AutoSuccessRange 500`, hearing at 1000, and the five-second lost-
target clear. `:808` is still the squad item carrying the target-owned reservation ring, the
silhouette sizing, the request/offer/confirm-within-a-timeout lifecycle, the adjoining-slots
reseat, the mass-cancel with its ranged fallback, and the cap below the slot count. `:809`
is still the human-only debug surface and `:810` still closes with the functional-test
instruction that a file-existence check is gameable. The three quoted evaluator criteria
still exist in `module-eval-prompts.ts`, though their line numbers have moved by roughly
twenty lines, and `feature-definitions.ts` still declares the behaviour-tree and perception
features as siblings under one shared dependency — so the authoring-order deviation the
application records is still real.

**A finding on provenance.** The pof prompt at `:808` names its own source: it asks for the
reservation system "(the WildStar pattern)". The application quotes the surrounding sentence
and drops that parenthetical, and then presents target-owned claim registries and the
arrive-and-confirm handshake as **upward lessons** that amended the technique and the golden
path. Both amendments are correct and worth having. But the framing is wrong in a way that
matters to a corpus whose currency is provenance: this is established, publicly-discussed
combat-AI craft that the consumer imported under its own name, not a novel extraction from a
repository. The technique inherits the framing — it presents the resource-owned registry as
its own reasoning with no attribution at all. Naming the origin costs a clause and would let
a reader go and read the original discussion, which is exactly what the subject's own
evidence discipline asks for everywhere else.

**A structural finding about the documents themselves.** Both applications now carry a
`## Review boundary - 2026-09-10` section *inside the knowledge document* — several
paragraphs of review commentary ("This review read the application text, not the cited
consumer checkout", "Health reduction alone cannot attribute damage to the tested agent",
plus an Epic documentation link) appended to the artifact being reviewed. That content is a
review decision and belongs in this ledger, not in the corpus: it makes the document's own
verified-on frontmatter mean two different things at once, it will be re-reviewed as if it
were subject content by the next pass, and its qualifications are asserted rather than
witnessed — the section says the consumer was not opened, and I have now opened it, which
means part of that boundary text is already superseded. I report it rather than touching it.

**Where the guidance is thin rather than wrong.** `behaviour-model-selection` gives six
criteria and the sixth, emittability, is the one it says most often decides — and it is
right, and it is the only criterion with no threshold or test attached. "Can the production
line author this family's artifact" is answered by probing the pipeline, and the technique
does not say to probe it. `commitment-and-recovery-windows` quotes a floor near a quarter of
a second for a change to read as a decision; that number carries no basis and no source, and
it is the only bare number in the subject that does not name what it was measured against —
a small violation of the law the same document cites two paragraphs later.

**Not evaluated.** No agent was run, no trace was emitted or read, no perception
configuration was exercised in an engine, no reservation was granted, and no roster was
graded on trace coverage. The subject's entire evidence technique is about behavioural
witnesses, and this review produced none — every claim above is a reading of text.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/agent-behaviour-authoring",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:d9dc69cfd79f8615",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read in full at their reverted bytes. Every citation in both applications re-resolved by reading pof at HEAD d823bffe: module-registry.ts items ai-3, ai-5, ai-6 and ai-7, evaluator/module-eval-prompts.ts, and feature-definitions.ts. Not evaluated: any runtime witness at all — no engine session, no spawned agent, no decision trace, no perception stimulus, no reservation grant, no roster trace-coverage measurement. The perceptual rung of behaviour (does it read as intelligent) is out of reach from here by construction.",
  "counterexamples": [
    "A squad manager that assigns coarse roles while melee slots are claimed against a target-owned ring is a commander and a local-reservation system running together, which the consumer's own spec does; the technique presents the commander as the wrong first instinct without acknowledging that the two compose.",
    "An agent whose facts flicker at a detection boundary looks exactly like an agent with no commitment window; the commitment technique names this and routes it to the decay windows, so it is a stated boundary rather than a gap.",
    "A pipeline that can emit only one arbitration family makes model selection theatre; behaviour-model-selection says so and asks for the mismatch to be recorded per agent class, but supplies no way to establish what the pipeline can emit other than trying it."
  ],
  "sources": [
    {"url": "file:///C:/Users/kazda/kiro/pof/src/lib/module-registry.ts", "result": "Read at pof HEAD d823bffe. Confirmed verbatim, at the exact cited lines, the perception parameters at :806, the reservation lifecycle and silhouette sizing at :808, the human-only debug surface at :809, and the gameable-file-existence warning at :810. Also established that :808 attributes the reservation design to 'the WildStar pattern', an attribution both application and technique drop. Establishes what the line specifies; establishes nothing about what any generated agent does."},
    {"url": "file:///C:/Users/kazda/kiro/pof/src/lib/evaluator/module-eval-prompts.ts", "result": "Read at pof HEAD. The three quoted criteria still exist ('Perception senses should be configured per AI archetype', 'Perception should have proper sight radius, angle, and age settings', 'Group AI should coordinate without tight coupling between agents') at lines roughly twenty below the application's citations. Confirms the deviation that no criterion asks for a runtime observation of coordination."},
    {"url": "https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---overview", "result": "Cited inside the process application's appended review-boundary section rather than by the application proper. Not re-fetched this run; recorded here because it is one of the reasons that section does not belong in the knowledge document."}
  ],
  "documents": {
    "agent-behaviour-authoring.md": {"disposition": "keep", "reason": "The four-link decomposition, the knowledge-over-arbitration thesis, the budget/rubric/acceptance/generation-constraint translation of human craft into machine craft, and three carefully drawn seams. The coordination section correctly locates the claim registry on the contested resource and states why a group-owned table fails."},
    "techniques/behaviour-model-selection.md": {"disposition": "keep", "reason": "Four families with what each buys and costs, six criteria in decision order, and the hybridisation rule (score chooses what, structure executes how) that keeps both families reviewable. Thin only on how emittability is established, which the document itself calls the criterion that most often decides."},
    "techniques/blackboard-as-declared-shared-state.md": {"disposition": "keep", "reason": "Six declaration fields including scope and owner, the unset-is-a-value rule with the distance-defaults-to-zero failure named concretely, the narrowest-scope default with promotion as a reviewed change, and the prohibition on carrying an event in state."},
    "techniques/commitment-and-recovery-windows.md": {"disposition": "clarify", "reason": "Sound throughout — commitment as a fairness quantity rather than only a stability one, the three recovery violations each with a different fix, interrupt as an authored closed set. One defect: the quarter-of-a-second dwell floor is quoted with no basis and no source, in a document that cites the unit-and-basis law two paragraphs later."},
    "techniques/decision-trace-as-evidence.md": {"disposition": "keep", "reason": "Six-rung ladder with what fails at each rung, the considered set rather than only the winner, the agent's claim recorded separately from the observation so their disagreement is the finding, and untraced as a distinct value from passing."},
    "techniques/group-coordination-without-a-hive-mind.md": {"disposition": "clarify", "reason": "The construction is right and the consumer confirms it, but the technique presents the target-owned registry and the arrive-and-confirm handshake as its own derivation while the consumer that supplied them names their origin ('the WildStar pattern'). A corpus that grades provenance everywhere else should carry the attribution here."},
    "techniques/perception-before-decision.md": {"disposition": "keep", "reason": "Senses enumerated with units and reference conditions, a fact schema carrying value/place/time/confidence, accumulation and decay windows as the source of the whole noticing-losing-forgetting vocabulary, perception latency separated from reaction delay, and the three-valued rule with searching as its consequence."},
    "applications/node--group-coordination-without-a-hive-mind.md": {"disposition": "clarify", "reason": "Every citation re-resolved exactly at pof HEAD and the deviations it records are still live. Two problems: it drops the source's own 'WildStar pattern' attribution while framing the design as an upward lesson, and it carries an appended in-document 'Review boundary - 2026-09-10' section whose central claim (the consumer was not opened) is now superseded by this review."},
    "applications/process--perception-before-decision.md": {"disposition": "clarify", "reason": "The four deviations it records — sibling dependency order, no reference target on SightRadius, no reaction delay and therefore nowhere to implement a difficulty ceiling, no three-valued rule — were each re-checked against pof HEAD and all four still hold. It carries the same appended review-boundary section, review commentary living inside a knowledge document, which is where the clarify sits."}
  }
}
```

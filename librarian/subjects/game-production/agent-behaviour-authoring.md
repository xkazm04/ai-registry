---
domain: game-production
subject: agent-behaviour-authoring
last_touched: 2026-10-31
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
    {"url": "file:///pof/src/lib/module-registry.ts", "result": "Read at pof HEAD d823bffe. Confirmed verbatim, at the exact cited lines, the perception parameters at :806, the reservation lifecycle and silhouette sizing at :808, the human-only debug surface at :809, and the gameable-file-existence warning at :810. Also established that :808 attributes the reservation design to 'the WildStar pattern', an attribution both application and technique drop. Establishes what the line specifies; establishes nothing about what any generated agent does."},
    {"url": "file:///pof/src/lib/evaluator/module-eval-prompts.ts", "result": "Read at pof HEAD. The three quoted criteria still exist ('Perception senses should be configured per AI archetype', 'Perception should have proper sight radius, angle, and age settings', 'Group AI should coordinate without tight coupling between agents') at lines roughly twenty below the application's citations. Confirms the deviation that no criterion asks for a runtime observation of coordination."},
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

## Architecture review - 2026-10-31

Re-review against `b005a97cb`. The six original techniques and two applications are
byte-unchanged since the 2026-09-10 record, so its four clarify items were still owed. The
subject has since gained three racing-opponent techniques, a process application and a
golden-path paragraph. The new material is sound physics. It disagreed with itself in two
places: the golden path said only a completion test finds a duplicated grip factor, and the
grip technique said deletion is the repair while recommending exclusivity. The WildStar
attribution could not be applied. The consumer that names it is not reachable from this
run, and a web search found no public primary source to cite in its place.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/agent-behaviour-authoring",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:b39a982c7a2e1077",
  "disposition": "clarify",
  "coverage": "All 13 current documents decided. The nine carried from the 2026-09-10 record are byte-unchanged except the golden path, which gained the racing paragraph and a technique list; both were re-read. The three racing techniques and their process application, added since, were read in full. Not evaluated: the pof and racing-game trees (neither is available here), any agent, trace or race run. No verification date refreshed.",
  "counterexamples": [
    "A duplicated grip factor can be found by reading, by summing the factors between the limit and the target and listing which read the same input, which is the technique's own first decision rule. A completion test is the reliable instrument, not the only one.",
    "A surface-dependent factor kept for straights and forced to 1.0 on corners is a second factor that is not a double count. 'Delete one of the two' is too strong as the only repair.",
    "A quarter-second dwell floor can be too long for a duelling agent and too short for a heavy unit whose transition animation runs 0.6 s. A floor with no basis cannot say which.",
    "A squad manager assigning coarse roles while melee slots are claimed on a target-owned ring is a commander and a reservation system together (retained from 2026-09-10).",
    "An 8 m pass trigger reading as 'half a length' for a heavy car implies a 16 m vehicle; the ratio argument holds, but the example's heavy car is truck-sized."
  ],
  "sources": [
    {
      "source": "Internal consistency across the subject",
      "result": "The golden path's racing paragraph said a duplicated grip limit 'only a completion test across every surface will find', while no-double-grip-penalty's first decision rule tells the reader to sum the factors and list which read the same input, a reading-based find. no-double-grip-penalty said 'The repair is to delete one of the two' while its own section, and the process application's upward lesson, recommend making the two factors exclusive by construction. The process application called look-ahead grip 'the one the technique treats as optional'; ai-corner-speed-from-grip-limit lists it as the third refinement."
    },
    {
      "source": "Arithmetic",
      "result": "Corner speed v = sqrt(a_lat x grip / k) from v^2 k = a_lat checked; grip enters through the root. sqrt(0.32) = 0.566, matching the process application's 'about 0.57' for ice."
    },
    {
      "source": "Two web searches for a WildStar or Carbine primary source, 2026-10-31",
      "result": "Searches for a public WildStar or Carbine source on target-owned melee reservation found nothing primary. The consumer's 'the WildStar pattern' wording was confirmed on 2026-09-10 against the pof checkout, which is not available to this run. The attribution item therefore stays owed rather than applied."
    }
  ],
  "documents": {
    "agent-behaviour-authoring.md": {
      "disposition": "clarify",
      "reason": "The 2026-09-10 keep covered the four-link spine. The racing paragraph added since says a duplicated grip limit is a defect 'only a completion test across every surface will find', which contradicts no-double-grip-penalty's reading-based decision rule. Say a reading rarely shows it and the completion test reliably does."
    },
    "techniques/behaviour-model-selection.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep. Emittability still has no probe step; recorded as a counterexample in that record, not a defect in the text."
    },
    "techniques/perception-before-decision.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep."
    },
    "techniques/blackboard-as-declared-shared-state.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep."
    },
    "techniques/decision-trace-as-evidence.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep."
    },
    "techniques/commitment-and-recovery-windows.md": {
      "disposition": "clarify",
      "reason": "Owed since 2026-09-10: 'a value near a quarter of a second is roughly the floor at which a change reads as a decision' carries no basis or source in a document that cites the unit-and-basis law. No primary source was found this run, so the fix is to label it a working rule of thumb and name what a project checks it against."
    },
    "techniques/group-coordination-without-a-hive-mind.md": {
      "disposition": "clarify",
      "reason": "Owed since 2026-09-10: the target-owned registry and the arrive-and-confirm handshake came from a consumer that names them 'the WildStar pattern', and the technique carries no attribution. Not applied: the consumer is not reachable this run and no public primary source was found."
    },
    "techniques/ai-corner-speed-from-grip-limit.md": {
      "disposition": "keep",
      "reason": "New since the last record; read in full. The derivation v = sqrt(a_lat x grip / k) is correct, the fraction and margin are separated with a reason, and the evidence grade (authored / simulated / felt) is stated honestly."
    },
    "techniques/no-double-grip-penalty.md": {
      "disposition": "clarify",
      "reason": "New; read in full. Sound overall, but 'The repair is to delete one of the two' contradicts its own 'make them exclusive by construction' and the process application's upward lesson. Say: remove the double entry, by deletion or by exclusivity."
    },
    "techniques/ai-distances-from-car-size.md": {
      "disposition": "keep",
      "reason": "New; read in full. The relative / absolute / mixed split and its redraw-at-twice-the-size test are sound. The 8 m example implies a 16 m heavy car (counterexample); not worth a change."
    },
    "applications/node--group-coordination-without-a-hive-mind.md": {
      "disposition": "clarify",
      "reason": "Owed since 2026-09-10: it drops the consumer's 'WildStar pattern' attribution while presenting the design as an upward lesson, and it carries an in-document 'Review boundary - 2026-09-10' section that belongs in this ledger. Not applied: the attribution needs the consumer, and removing the section is a structural change for the Director."
    },
    "applications/process--perception-before-decision.md": {
      "disposition": "clarify",
      "reason": "Owed since 2026-09-10: the in-document 'Review boundary - 2026-09-10' section is review commentary inside a knowledge document. Not applied, for the same reason. Citations not reopened."
    },
    "applications/process--no-double-grip-penalty.md": {
      "disposition": "clarify",
      "reason": "New; read in full. Citations against a private game tree not reopened. One internal misstatement: it calls look-ahead grip 'the one the technique treats as optional', and the technique lists it as a refinement. The sqrt clamp figures are consistent."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the commitment basis label and the three internal-consistency fixes. The
second record is against the edited bytes. The attribution and review-boundary items stay
owed, for the reasons in the first record.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/agent-behaviour-authoring",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:08128053dc97eb84",
  "disposition": "clarify",
  "coverage": "All 13 documents decided. Three clarify items were applied (two internal inconsistencies, one owed basis label), and a fourth, the process application's 'optional' wording, was applied too; the edited passages were re-read. Still owed: the WildStar attribution in the coordination technique and its node application, and the in-document review-boundary sections in two applications. No verification date refreshed.",
  "counterexamples": [
    "A duplicated grip factor can be found by reading, by summing the factors between the limit and the target and listing which read the same input, which is the technique's own first decision rule. A completion test is the reliable instrument, not the only one.",
    "A surface-dependent factor kept for straights and forced to 1.0 on corners is a second factor that is not a double count. 'Delete one of the two' is too strong as the only repair.",
    "A quarter-second dwell floor can be too long for a duelling agent and too short for a heavy unit whose transition animation runs 0.6 s. A floor with no basis cannot say which.",
    "A squad manager assigning coarse roles while melee slots are claimed on a target-owned ring is a commander and a reservation system together (retained from 2026-09-10).",
    "An 8 m pass trigger reading as 'half a length' for a heavy car implies a 16 m vehicle; the ratio argument holds, but the example's heavy car is truck-sized."
  ],
  "sources": [
    {
      "source": "Internal consistency across the subject",
      "result": "The golden path's racing paragraph said a duplicated grip limit 'only a completion test across every surface will find', while no-double-grip-penalty's first decision rule tells the reader to sum the factors and list which read the same input, a reading-based find. no-double-grip-penalty said 'The repair is to delete one of the two' while its own section, and the process application's upward lesson, recommend making the two factors exclusive by construction. The process application called look-ahead grip 'the one the technique treats as optional'; ai-corner-speed-from-grip-limit lists it as the third refinement."
    },
    {
      "source": "Arithmetic",
      "result": "Corner speed v = sqrt(a_lat x grip / k) from v^2 k = a_lat checked; grip enters through the root. sqrt(0.32) = 0.566, matching the process application's 'about 0.57' for ice."
    },
    {
      "source": "Two web searches for a WildStar or Carbine primary source, 2026-10-31",
      "result": "Searches for a public WildStar or Carbine source on target-owned melee reservation found nothing primary. The consumer's 'the WildStar pattern' wording was confirmed on 2026-09-10 against the pof checkout, which is not available to this run. The attribution item therefore stays owed rather than applied."
    }
  ],
  "documents": {
    "agent-behaviour-authoring.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'a defect that only a completion test across every surface will find' now reads 'a defect that a reading of either line rarely shows and a completion test across every surface reliably does'."
    },
    "techniques/behaviour-model-selection.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep. Emittability still has no probe step; recorded as a counterexample in that record, not a defect in the text."
    },
    "techniques/perception-before-decision.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep."
    },
    "techniques/blackboard-as-declared-shared-state.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep."
    },
    "techniques/decision-trace-as-evidence.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep."
    },
    "techniques/commitment-and-recovery-windows.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the quarter-second figure is now 'a common working floor', followed by a sentence saying it has no measured basis here and that an adopting project states what it checked it against (the animation's transition length, or the player's perceive-and-respond time)."
    },
    "techniques/group-coordination-without-a-hive-mind.md": {
      "disposition": "clarify",
      "reason": "Owed since 2026-09-10: the target-owned registry and the arrive-and-confirm handshake came from a consumer that names them 'the WildStar pattern', and the technique carries no attribution. Not applied: the consumer is not reachable this run and no public primary source was found."
    },
    "techniques/ai-corner-speed-from-grip-limit.md": {
      "disposition": "keep",
      "reason": "New since the last record; read in full. The derivation v = sqrt(a_lat x grip / k) is correct, the fraction and margin are separated with a reason, and the evidence grade (authored / simulated / felt) is stated honestly."
    },
    "techniques/no-double-grip-penalty.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'The repair is to delete one of the two' now reads 'The repair is to remove the double entry - delete one of the two, or make them exclusive by construction as below - not to compensate'."
    },
    "techniques/ai-distances-from-car-size.md": {
      "disposition": "keep",
      "reason": "New; read in full. The relative / absolute / mixed split and its redraw-at-twice-the-size test are sound. The 8 m example implies a 16 m heavy car (counterexample); not worth a change."
    },
    "applications/node--group-coordination-without-a-hive-mind.md": {
      "disposition": "clarify",
      "reason": "Owed since 2026-09-10: it drops the consumer's 'WildStar pattern' attribution while presenting the design as an upward lesson, and it carries an in-document 'Review boundary - 2026-09-10' section that belongs in this ledger. Not applied: the attribution needs the consumer, and removing the section is a structural change for the Director."
    },
    "applications/process--perception-before-decision.md": {
      "disposition": "clarify",
      "reason": "Owed since 2026-09-10: the in-document 'Review boundary - 2026-09-10' section is review commentary inside a knowledge document. Not applied, for the same reason. Citations not reopened."
    },
    "applications/process--no-double-grip-penalty.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: 'including the one the technique treats as optional' now reads 'including the look-ahead refinement the technique lists third'. The citations into the private game tree were not reopened, so the document stays reverify."
    }
  }
}
```

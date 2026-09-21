---
domain: game-production
subject: visual-script-to-code-transpilation
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# visual-script-to-code-transpilation

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/visual-script-to-code-transpilation",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:697e08c103a4a982",
  "disposition": "reverify",
  "coverage": "All 8 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Calling SetValue then Notify versus Notify then SetValue has the same call multiset and can notify different state.",
    "Inserting a node at the start of a traversal renumbers every counter-derived ID, although the original nodes still represent the same entities.",
    "An inline member defined inside a class has no separate out-of-class definition to require."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/engine-integration/visual-script-to-code-transpilation",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://learn.microsoft.com/en-us/cpp/cpp/overview-of-member-functions?view=msvc-170",
      "scope": "Opened official documentation: member definitions may be inside or outside the class and members cannot be added after class definition; no compiler executed."
    },
    {
      "url": "https://learn.microsoft.com/en-us/cpp/cpp/override-specifier?view=msvc-170",
      "scope": "Opened official examples demonstrate compiler rejection of signature mismatches with override; this is a structural check, not a runtime witness."
    }
  ],
  "documents": {
    "visual-script-to-code-transpilation.md": {
      "disposition": "reverify",
      "reason": "Semantic preservation is the right concern, but graph copy/null/error behavior and target-language defaults must be versioned rather than generalized. Hoisting reevaluation is not inherently more correct. Runtime samples establish equivalence only for tested cases, and stubs with warnings are incomplete output rather than fail-closed acceptance. Editor-side binary data is not intrinsically unauthorable through code."
    },
    "techniques/declaration-definition-parity.md": {
      "disposition": "clarify",
      "reason": "Repaired universal two-definition rule and the claim an undeclared out-of-class member silently becomes an overload. Defines language-specific declaration/definition obligations, inline/defaulted/deleted/pure cases, annotation placement and output validation; shared models reduce drift without making renderer errors impossible."
    },
    "techniques/event-override-signature-resolution.md": {
      "disposition": "reverify",
      "reason": "The claim nothing below runtime can detect a bad override contradicts the later explicit-override check. Resolve full owner/version and binding lifecycle, not display labels alone; construction is not universally the subscription site. Multiple graph event handlers may need composed semantics rather than dropping all but one with warnings. Editor/data owners can have legitimate events."
    },
    "techniques/graph-type-to-code-type-mapping.md": {
      "disposition": "reverify",
      "reason": "Graph pins can carry references and target languages can copy by value; copying on doubt changes aliasing semantics. Weak references may alter lifetime compared with strong graph handles. Type mapping remains necessary in dynamic languages, including runtime checks. Explicit casts can change overload resolution, and annotations depend on member role rather than type alone."
    },
    "techniques/plain-language-jargon-layer.md": {
      "disposition": "reverify",
      "reason": "Consequence-oriented glossary is useful but definitions, longer explanations and shared-audience terminology can be appropriate. Narration from an intended model can be wrong when emission diverges; bind it to validated output. A glossary entry is not proof of persistence/replication behavior, and missing terms need audience relevance rather than automatic defect status."
    },
    "techniques/structural-round-trip-diff.md": {
      "disposition": "clarify",
      "reason": "Repaired call-multiset similarity as semantic correspondence, unsafe reevaluation suppression and traversal-counter IDs as edit-stable identity. Separates source mapping, order/dataflow-sensitive comparisons, unsupported cases and scoped runtime evidence."
    },
    "applications/node--event-override-signature-resolution.md": {
      "disposition": "reverify",
      "reason": "Historical Node/PoF excerpts and verification date were not rerun. The actor/component resolver has narrow explicit coverage; null plus a TODO does not establish rejection of incomplete output. Dedupe warnings disclose lost logic but do not preserve it. Ancestry resolution, supported owner kinds, bindings, enablement and actual generated compilation remain unverified."
    },
    "applications/process--plain-language-jargon-layer.md": {
      "disposition": "reverify",
      "reason": "Historical process/PoF glossary and verification date were not rerun. Replication flags alone do not guarantee synchronization on every client or OnRep on every local change; transient and edit visibility need actual engine serialization/context rules. Structured narration can share emitter errors and lacks proof that displayed explanations match shipped behavior."
    }
  }
}
```

## Architecture re-review after the compression revert - 2026-09-10

Read the golden path, all five techniques and both applications at their reverted bytes, then
opened the PoF checkout at `C:/Users/kazda/kiro/pof` (HEAD `d823bffe`) to check the two
applications. Reading source, not executing it: no transpile run, no compile, no engine
import.

This subject came through the revert intact and I found nothing in it I can call wrong. The
framing - a graph is a different execution model wearing a different notation, so the port is
semantic and the failure mode is code that compiles and behaves differently - is stated once
and every technique is downstream of it. The "what does not survive the crossing" list is
seven concrete items, each of which is invisible to a compiler, and the fidelity ladder gives
them a place to be claimed at: parsed, compiles, declared-and-defined, structurally
equivalent, behaviourally equivalent, with the explicit statement that no rung implies the one
above it. Both hard limits - some constructs cannot be authored from code at all, and both
sides cannot be authoritative - are the right two to state up front.

The techniques are unusually specific about their own failure surfaces. `graph-type-to-code-
type-mapping` locates the map's entire value in the entries where the relationship is not
one-to-one and forbids the fallback that makes the table look complete. `event-override-
signature-resolution` resolves against the owning type rather than the node label, walks
ancestry, distinguishes overrides from bindings, and - the step most implementations miss -
resolves the enablement site as well as the method. `declaration-definition-parity`'s
insistence that the parity check re-parse the emitted output rather than re-consult the model
it wrote from is correct and is the difference between a check and a tautology.
`structural-round-trip-diff` names normalisation as the technique's real content and requires
the normalisation list to appear in the diff's own output header as a statement of its blind
spots. `plain-language-jargon-layer`'s rule that an entry explains the consequence rather than
the expansion is the whole reason such a layer is read.

I looked hard for an over-reach and did not find one. The closest candidates are both
correctly hedged: the pure-node re-evaluation policy is presented as a decision to write down
and teach the diff about, not as a correctness claim in either direction; and the golden path's
"reporting coverage as correctness" section pre-empts the reading that a high transpile
percentage means anything.

Both applications hold at PoF HEAD. `resolveEventOverride` is unchanged - the `Receive` prefix
strip at the head of the switch, the `Tick` versus `TickComponent` owner-kind branch with its
full parameter list, the `EventOverride` record rendered into both the declaration and the
definition with `args` for the `Super::` call, and `default: return null` feeding an
`unknownEvents` list rather than a guessed method. The dedupe-with-a-receipt path still pushes
a warning carrying `nodeId`. The document's own honest statement of the deviation - three
events covered, and `isComponent` is a boolean rather than a resolved type chain, so there is
no ancestry walk - is accurate and correctly declines to lower the standard. The jargon
application's stated shortfall, that uncovered terms are not counted as a measured gap, was
not re-checked in detail and nothing suggested it had changed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/visual-script-to-code-transpilation",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:04918a29c58b25da",
  "disposition": "keep",
  "coverage": "Golden path, five techniques and two applications read in full at reverted bytes. The node application's resolver and its surrounding call site re-checked by reading the live PoF checkout (HEAD d823bffe). Not evaluated: any transpile executed, any emitted code compiled, any engine import; the jargon application's uncovered-term claim beyond a surface check; whether the three-event table's coverage boundary has moved.",
  "counterexamples": [
    "The subject requires picking one authority between the graph and the code, and the diff to be a drift detector rather than a merge tool. It has no move for the common transitional state where designers keep editing the graph while engineering owns the code, other than declaring that state illegitimate.",
    "The fidelity ladder's declared-and-defined rung is defined by a language's declaration/definition split, and the parity technique's own exclusion says the rung is irrelevant for single-definition targets. For those targets the ladder silently loses a rung and nothing states what replaces it between compiles and structurally equivalent.",
    "Event resolution requires a signature table keyed by event and owner kind with an ancestry walk, and refuses an unresolved event. An engine whose callback set is itself generated or plugin-extended has no closed table to key against, and the technique's fail-closed rule then refuses most of a legitimate graph."
  ],
  "sources": [
    {"path": "C:/Users/kazda/kiro/pof/src/lib/blueprint-cpp-codegen.ts", "result": "Confirms resolveEventOverride is unchanged at HEAD: prefix strip, owner-kind branch on Tick with the full component signature, one EventOverride record feeding both renderers, and default: return null routing to unknownEvents. Also confirms the dedupe warning still carries nodeId. Does not establish that any emitted code compiles or runs."},
    {"path": "knowledge/game-production/engine-integration/visual-script-to-code-transpilation/visual-script-to-code-transpilation.md", "result": "Establishes that the fidelity ladder's third rung is defined only for languages with a declaration/definition split, which the parity technique's exclusion then declares irrelevant for most modern targets. Establishes the gap; does not establish what should fill it."}
  ],
  "documents": {
    "visual-script-to-code-transpilation.md": {"disposition": "keep", "reason": "The semantic-port framing, the seven-item list of what does not survive the crossing, the four-stage pipeline with a distinct failure signature per stage, the fidelity ladder with no rung implying the next, and the two hard limits are mutually consistent and each is specific enough to act on. The leave-the-residue-where-it-happened rule is the right consequence of the parse-stage failure mode."},
    "techniques/declaration-definition-parity.md": {"disposition": "keep", "reason": "One member record with two renderers as projections, and a parity check that re-parses the emitted artifacts rather than re-consulting the model that wrote them - the second is what makes the check non-tautological and it is stated as such. The three axes, the annotations-attach-to-one-side asymmetry, and the definition-without-declaration direction being the more dangerous one are all correct."},
    "techniques/event-override-signature-resolution.md": {"disposition": "keep", "reason": "Resolving against the owner's type rather than the node's label, with ancestry walked, overrides distinguished from bindings, the base call recorded, the enablement site resolved alongside the method, dedupe reported into the residue, and an unresolved event failing closed. The verification section's move - emit the explicit override marker so a mismatch becomes a compile error - correctly converts a behavioural failure into a structural one."},
    "techniques/graph-type-to-code-type-mapping.md": {"disposition": "keep", "reason": "Locating the map's value entirely in the non-one-to-one entries and refusing the generic-opaque-pointer fallback is the whole technique. The four kinds of non-obvious entry each name what goes wrong silently, the map is required to be total with a first-class unmapped result, and the closing refusal to treat a complete map as evidence of a correct port is the right boundary."},
    "techniques/plain-language-jargon-layer.md": {"disposition": "keep", "reason": "Consequence rather than expansion, with a usable test - can the reader predict a difference in observable behaviour - and two layers kept separate because the audiences fail differently. Deriving narration from the structured result rather than scraping the emitted text is a real correctness rule, not a style preference, and the uncovered-terms-as-a-measured-gap rule closes the honest loop."},
    "techniques/structural-round-trip-diff.md": {"disposition": "keep", "reason": "Comparison over the semantic tree with membership vocabulary rather than location, normalisation named as the technique's real content with its list published as the diff's blind spots, deterministic synthesised identities so identity-keyed comparisons survive a re-parse, and a fourth unmatchable verdict that must be visible. Its honest claim is bounded and stated."},
    "applications/node--event-override-signature-resolution.md": {"disposition": "keep", "reason": "Re-checked at PoF HEAD and unchanged: the prefix strip, the owner-kind branch, one record feeding both renderers, fail-closed default, the PrimaryComponentTick versus PrimaryActorTick enablement site, and the dedupe warning bound to nodeId. Its stated deviation - three events, and isComponent as a boolean rather than a resolved ancestry chain - is accurate and does not lower the standard."},
    "applications/process--plain-language-jargon-layer.md": {"disposition": "keep", "reason": "The two-file split by role, the JargonEntry shape matching the technique's two fields, the entries that state effects rather than expanding acronyms, and the explainer deriving from the typed result rather than from generated text. Its stated shortfall - uncovered terms render as plain strings rather than as a counted gap - is the technique's rule correctly held above the implementation."}
  }
}
```

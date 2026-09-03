# Subject proposal — `context-hierarchy`

**Status:** **EXECUTED** 2026-09-02 by run `intake-openviking-0902`, in the same session that raised it (intake 2.0.0, mechanical XL trigger: three `design` candidates with one home). Forged as four techniques plus one application. Overrides recorded by the drafter: `level-addressed-search` folded into `seeded-descent-retrieval` (its changelog anchor did not hold; the mechanism is one decision rule); the dominance ratio is declared in the source and applied nowhere at the pinned commit, so it is written as a knob to declare default-off rather than as a behaviour; the "unconditional bubbling" the concept docs describe as current is the source's *previous* state — the code at the pinned commit implements the digest-and-ratio policy, and the docs lag it, which is itself an instance of the subject's thesis. Three fetches spent on the RAPTOR paper, its abstract page, and its issue tracker (incremental addition referenced but not implemented — the first-party staleness account).
**Bundle:** `software-engineering`
**Category:** `llm-agent` → subcategory `prompt-and-context`
**Resolved path:** `knowledge/software-engineering/llm-agent/prompt-and-context/context-hierarchy/`
**Raised by:** `/intake`, 2026-09-02, from
[`librarian/sources/2026-09-02-openviking.md`](../librarian/sources/2026-09-02-openviking.md)
**Engine:** `domain-knowledge-forge` — read [`forge-brief.md`](forge-brief.md) first; it is the contract.

---

## Placement, verified against the authority

`taxonomy.json` is the authority. `llm-agent.prompt-and-context` currently holds **six**
subjects directly — `prompt-assembly`, `prompt-safety`, `retrieval`, `agent-memory`,
`structured-output`, `agent-instruction-files` — with no nested sub-subcategories. The cap
is ten. A seventh flat subject is legal and creates no mixed node.

Link depths, stated so they are not derived wrongly:

- from `context-hierarchy/context-hierarchy.md` → `../../../_laws.md`
- from `context-hierarchy/techniques/<t>.md` → `../../../../_laws.md`
- to a sibling subject: `../agent-memory/agent-memory.md`, `../retrieval/retrieval.md`
- to a sibling's technique: `../agent-memory/techniques/lane-reconciliation.md`,
  `../retrieval/techniques/ranking-budgets.md`

Append the slug to the subcategory's `subjects` array; do not reorder.

## The gap, measured

The corpus states the *force* for this subject and owns none of its *mechanisms*.

`agent-memory`'s golden path (lines 77-89) draws the boundary itself: its shape hedge
("expect recall quality to come from the transitions, not the topology") holds only where
"the topology was consumed through a retrieval call". It then names the other object — "a
shape the consumer can *survey* — browse, list the siblings of, and know how much it has
not looked at" — says it has been measured to carry recall quality, and prices its second
cost: "such a structure is compiled, and a compiled structure over a store that captures
and forgets continuously is stale by construction rather than by failure." That is a
paragraph of forces. No technique in the subject follows it. `lane-reconciliation` adds the
staleness doctrine for a compiled lane (accumulated input, not the clock, as the trigger)
and stops at the trigger.

`retrieval` owns lanes, fusion, budgets and floors over a **flat candidate set**. Its two
structural lanes — `structural-centrality-lane`, `relationship-proximity-lane` — read a
graph's edges as a relevance signal; neither descends a containment hierarchy, decides when
to return a node instead of its children, or stops a descent.

`prompt-assembly` owns the window; `tiered-history-projection` tiers *history*, not a
corpus.

Concept probes (`research-map --deep`, run on concepts, never on product names):

| concept probed | best hit | what it actually covers |
| --- | --- | --- |
| `progressive disclosure` | recruiting / candidate-ai-disclosure | disclosure to a candidate — unrelated |
| `hierarchical summary` | executive-reporting | report narrative — unrelated |
| `directory overview abstract` | agent-instruction-files / workspace-ancestry-isolation | instruction files up a path, not summaries |
| `tree descent retrieval` | retrieval (slug match only) | no technique descends anything |
| `derived artifact freshness`, `summary refresh` | lane-reconciliation | the trigger doctrine, not the mechanism |

Three design decisions from one source tree, each reconstructed with its forces and
rejected alternatives, and each with `corpus: NONE` and the same nearest neighbour. Under
intake 2.0.0 that is a subject by construction.

## The subject, in one paragraph

A **context hierarchy** is a corpus organised as a containment tree whose every node
carries **tiered generated summaries** — a short embeddable abstract, a longer navigational
overview, and the untouched original at the leaf — so that a consumer can decide
*relevance* from the cheapest tier, *scope* from the middle one, and pay for the leaf only
when both said yes. The tree is an interface, not an implementation detail: the consumer
can survey it, and retrieval **descends** it from seeded starting points instead of
ranking a flat set. Because every tier above the leaf is derived, the hierarchy is a
compiled artifact, and its second half is the discipline that keeps it honest: which
child changes reach the parent, when a wide node's summary is allowed to lag, and what
a read gets while a branch is being rebuilt.

## Boundaries it must NOT absorb

- **What gets stored, consolidated, decayed** — `agent-memory`. The hierarchy is a shape
  over items that subject already governs; it says nothing about their truth or lifetime.
- **Lanes, fusion, floors, size-aware cutting** over the candidates a descent produces —
  `retrieval`. The descent yields candidates; `ranking-budgets` cuts them.
- **The staleness *doctrine*** (accumulated input not the clock; say what a read gets
  during a recompile) — `lane-reconciliation` owns it and this subject *applies* it.
  Cite it; do not restate it.
- **Instruction files found by walking up a path** — `agent-instruction-files`.
- **Window allocation** — `prompt-assembly`.

## Proposed techniques (slugs are proposals; the drafter may override with an argument)

1. **`per-node-summary-tiers`** — every *directory* node carries an abstract (order of a
   hundred tokens, embedded) and an overview (order of a few thousand, navigational); the
   leaf is the original. Per-file summaries are **inputs** to the containing node's
   overview, not sidecars of their own. Decision rule: a node earns its own tiers when a
   consumer might stop there; a leaf never does. Must carry: the two size ceilings as
   *forces* (embeddable vs navigable), the cost the alternative pays (one summary call and
   one index row per file), and the whitelist of metadata that may enter the embedding
   (provenance and bookkeeping fields must not, or a rebuild changes retrieval input).
   Source anchors: `docs/en/concepts/03-context-layers.md:7-17, :53, :76, :128-138, :178`.
2. **`seeded-descent-retrieval`** — a global search over the abstract and overview tiers
   seeds starting nodes; a priority queue descends from them, searching children, with a
   **parent-score propagation weight** (the tree's default makes the parent's score
   irrelevant — alpha 1.0 — which is itself a finding: propagation is a knob most trees
   should leave off until measured), a **dominance ratio** deciding when to return the
   node instead of its children (the tree returns the directory only when its score
   exceeds the best child's by 1.2×), and a **convergence stop** (top-k unchanged for
   three rounds). Two surfaces: a query-only path with no model call and no descent, and
   a full path with typed sub-queries and rerank. Decision rule: descend only when the
   seed's tier says the answer is *below*, never because the tree is there.
   Source anchors: `openviking/retrieve/hierarchical_retriever.py:56-60, :83, :478-495`;
   `docs/en/concepts/07-retrieval.md:13-21, :74-149`.
3. **`digest-gated-upward-refresh`** — a child's regenerated abstract reaches its parent
   only if the **normalised body digest changed**; a changed child marks the parent's
   `pending_child_changes`; a **wide node** (more children than the sample limit) refreshes
   only when the pending ratio crosses a threshold. Each level can halt propagation
   independently. Must carry the admitted failure on both sides: unconditional bubbling
   (the source's *current* implementation, which its own RFC calls "not the intended final
   scheduling policy") amplifies writes up hot deep paths; a ratio gate lets a node with
   3 changed children of 161 stay stale indefinitely — the source tolerates this in v1
   and says so. The technique states the doctrine it inherits (`lane-reconciliation`:
   accumulated input, not the clock; clock only as a floor and release) and adds the
   *mechanism*: what counts as accumulated input at each level.
   Source anchors: `docs/design/freshness-aware-parent-bubbling-design.md:32-67, :118-166,
   :358`; `docs/design/l0-l1-okf-sidecars-rfc.md:259`; `docs/en/concepts/06-extraction.md:133-135`.
4. **`stable-sampling-for-wide-nodes`** — when a node has more children than the
   summariser can read, sample **deterministically and order-preservingly** so an
   unchanged tree yields byte-identical summaries (no noisy rewrites, no spurious diffs),
   and record `total / sampled / unsampled` in the summary's own metadata so a reader
   knows how much the overview did not see. Decision rule: the sample is a function of
   the child list, never of time or randomness. Source anchors:
   `docs/en/concepts/03-context-layers.md:149, :159-168`.
5. **`level-addressed-search`** (optional; fold into 2 if thin) — search and find accept a
   *level* filter (abstracts, overviews, leaves) so a consumer can ask "which branches"
   without paying for leaves, and access control that applies per leaf forces a separate
   leaf-level search under the consumer's scope. Source anchors: changelog v0.3.18 (`find`
   / `search` accept `level`); `hierarchical_retriever.py:165-250`.

Four techniques is the floor; five is fine. Do not mint a sixth to reach a number.

## Open questions the drafter decides rather than discovers

- Whether the **surveyability** argument (the hedge's scope condition) belongs in this
  golden path's opening as its boundary statement. Recommended: yes — it is the one
  sentence in the corpus that already says why this subject exists.
- Whether `score propagation` deserves its own technique or a section inside 2. The
  source's default disables it; the corpus has no measurement. Recommended: a section,
  with the default-off reading as the decision rule and a lead for the measurement.
- The name. `context-hierarchy` was chosen over `summary-tree` (the summaries are the
  mechanism, not the subject) and `progressive-disclosure` (a UI term with a different
  meaning in two other bundles). Override with an argument.

## Instances a reader can open

- The source tree itself, pinned at commit `85b4923d06efc521f48298d5a7a076408cdd7d38`
  (clone under this run's scratch directory; the source note carries the anchors above).
- This registry: `knowledge/<bundle>/<category>/<subject>/` is a containment tree whose
  golden path is a node overview and whose `use_when` lines are per-technique abstracts;
  `scripts/research-map.mjs` ranks a *flat* slug set over it and has no descent. That
  is the first application the subject should be tested against (Phase 7.5 `task` row).

## Web budget for the drafter

At most three fetches, spent on primaries only: a paper on recursive or hierarchical
summarisation for retrieval (RAPTOR or its successors) for the tiering evidence; one
first-party account of a summary tree's staleness cost. The source is a vendor
repository — its README benchmark claims are not corroboration for anything here and
the drafter must not cite them.

## Why proposed rather than written by the intake run

Three mechanisms from one tree, one voice, no measurement in the corpus. A subject
needs a golden path that argues the forces from more than one source, and a technique
pair that has been reconciled against a neighbour's stated boundary. That is a forge
worker's job with the neighbours open — which is why it runs now, in this session, and
not after the context that argued it is gone.

# RESULT: cloud(261007-1e99b6) deepen software-engineering/agent-memory

Worker: one `/deepen` batch worker, cloud session, 2026-10-07. Method:
`.claude/skills/deepen/SKILL.md` steps 2 (Research) and 3 (Apply) under the
batch-mode worker rules. Steps 4 (Propagate) and 6 (run result) were not run;
they belong to the Director.

Subject file (from the dispatch, as `index.json` resolves it):
`knowledge/software-engineering/llm-agent/prompt-and-context/agent-memory/agent-memory.md`

**Branch note.** The landing contract names `claude/cloud-261007-1e99b6`. This
session's harness assigned and pre-created
`claude/cloud-261007-1e99b6-h2mscj`, and it may push only to its assigned
branch. All work is on that branch. Same run id, plus a suffix.

## The one limit that shapes everything below

The cloud egress proxy blocked arxiv.org, openreview.net, huggingface.co,
aclanthology.org, usenix.org, vendor documentation sites and most blogs, for
every lane and for me (`EGRESS_BLOCKED`). Only the web search index and
`raw.githubusercontent.com` were reachable. As a result:

- **Resolved verbatim (by me, 2026-10-07):** three README files: the
  post-retrieval-assembly companion repo, LongMemEval, and Graphiti. A fourth,
  MemoryAgentBench, was also read. These are the only sources the one new
  application cites.
- **Reported, not resolved:** everything else in this file. It reached the
  lanes as search-engine snippets of the abstract or page. The lanes marked
  these `[S]`. None of them is quoted verbatim in any landed file. The
  upper-layer edits that lean on them state findings qualitatively, with no
  numbers, and only where two or more independent lanes converged.

**Director:** before merge, re-open the `[S]` sources listed under each lane
from an unblocked network. If any contradicts a landed sentence, strip that
sentence. This is an incomplete check, not a content verdict.

## Files changed (all inside the subject folder, plus this file)

| File | Change |
|---|---|
| `agent-memory.md` | 4 additions: the raw-transcript boundary, provenance's converse, the value model's scope, and the "Unchanged" row's scope condition |
| `techniques/consolidation.md` | 1 correction (newest-wins mechanism); 1 addition (reinforcement counts independent authors) |
| `techniques/memory-governance.md` | New section "Taint follows the data, not the turn" |
| `techniques/recall-injection.md` | 1 paragraph: recalled third-party material cannot instruct; authorship triggers confirmation |
| `techniques/rollup-compaction.md` | 1 paragraph: public-benchmark convergence on "a rollup must not be the only thing recall can see" |
| `applications/spec--consolidation.md` | New. `verified_on: 2026-10-07`, `refresh_by: 2027-04-07`, no `verified_against` |

No new technique. No shared file touched: index, rules, catalog, `librarian/`
and other subjects are all unchanged. Nothing was regenerated.

## Lanes

### 1. Training-data only (blind)

Written to the scratchpad before any search ran in this session. Its
derivations:

- **Capture:** C1, taint at capture with no author field. C2, the agent's own
  outputs recaptured as evidence. C4, sensitive data.
- **Distil:** D2, correlated evidence counted as independent reinforcement. D5,
  re-summarization drift.
- **Decay:** F1, rare but critical items killed by usage-weighted decay. F3,
  legal erasure in tension with "deletion is not repair". F4, a poisoned item
  engineered to keep matching queries.
- **Inject:** I1, recalled memory carrying instruction authority. I2,
  cross-tenant contamination. I5, personalization amplifying sycophancy.
- **When a learned policy wins:** a stationary distribution, a dense outcome
  signal, and low governance stakes. Predicted: learned-memory papers report
  no provenance or poisoning robustness.

Convergence with the web lanes afterwards:

| Derivation | Converged with | Outcome |
|---|---|---|
| C1 + I1 (taint at capture, instruction authority at read) | attack lane (relayed writes, read-time re-injection) | landed: governance section, recall-injection paragraph |
| C2 (own output recaptured) | attack lane (forged experience, self-reinforcing cycle) | landed: governance "rewriting step" bullet |
| D2 (correlated reinforcement) | attack lane (manufactured corroboration) | landed: consolidation reinforcement clause, governance |
| D5 (summary drift) | consolidation lane + counter-evidence lane (replace-mode losses) | landed: golden-path raw-transcript boundary, rollup paragraph |
| F1 (rare but critical) | counter-evidence lane (storage vs retrieval strength) | landed: value-model clarification, which points at the existing kind exemptions |
| learned memory: no provenance reported | landscape lane (none found in any snippet) | landed: "Unchanged" scope condition |
| F3 (erasure) | landscape lane (in-weights memory makes erasure unlearning) | landed in the same paragraph; outside that case, proposed (below) |
| I2 (cross-tenant) | attack lane (cross-user poisoning; benign cross-user contamination) | already covered by `owner-and-counterpart-scope`; governance now points there |
| I5 (sycophancy) | no lane | declined: no evidence gathered |

### 2. Counter-evidence (mandatory)

**Searched:**
- **Against "raw transcripts are not memory":** LongMemEval; raw-store
  diagnostic papers; a filesystem baseline; full-context comparisons in the
  Mem0 paper; vendor raw-history recall.
- **Against "provenance is the trust anchor":** citation-faithfulness and
  citation-trust studies, and a query-only memory injection attack.
- **Against "one value model":** Bjork's new theory of disuse, ARC cache
  eviction, recommender feedback loops, and an experience-following study.

**Sources, all `[S]`:**
- LongMemEval (Wu et al., ICLR 2025, arXiv 2410.10813)
- *Diagnosing Retrieval vs. Utilization Bottlenecks in LLM Agent Memory*
  (arXiv 2603.02473)
- *WhenLoss* (arXiv 2605.24579)
- Letta, "Benchmarking AI Agent Memory: Is a Filesystem All You Need?"
  (2025-08-12)
- Mem0 paper (arXiv 2504.19413)
- Wallat et al., *Correctness is not Faithfulness in RAG Attributions*
  (arXiv 2412.18004)
- Liu et al., *Evaluating Verifiability in Generative Search Engines*
  (arXiv 2304.09848)
- Ding et al., *Citations and Trust in LLM Generated Responses* (AAAI 2025)
- MINJA (arXiv 2503.03704)
- Bjork & Bjork 2020 (JARMAC)
- Megiddo & Modha, ARC (FAST 2003)
- Chaney et al. (RecSys 2018)
- Xiong et al. (arXiv 2505.16067)
- **Supporting the claim:** *Can Agent Memory Systems Track Evolving State?*
  (arXiv 2608.19652) and arXiv 2510.27246

**Verdicts:**

- **A, "Raw transcripts are not memory": needs a condition. Landed.** It holds
  for what the agent asserts and fails for what it retrieves. Distillations as
  *values* lose information; as *keys over raw values* they win. The existing
  text already conceded the benchmark incumbent. The new condition is
  narrower: the claim layer indexes the record and must not replace it.
- **B, "Provenance is the trust anchor": needs a condition. Landed.** "Without
  provenance, a rumor" survives. "With provenance, grounded" is refuted twice:
  citations that do not support their sentence, which readers trust unopened;
  and provenance written by a steerable step, or genuine provenance on
  attacker-authored episodes.
- **C, "One value model": survives. Clarification landed.** The
  query-dependence objection is already conceded by
  `memory-value-model` ("A value model is not a relevance model ... Value orders
  the candidates *after* relevance has chosen them"). The outcome-conditioning
  objection is already answered by its "A harmful delivery must not read as a
  use" section and by the golden path's bounded delivery term. The one
  residual, rarely needed but valuable, is answered by the forgetting gate's
  kind exemptions. The golden path now says so in one paragraph, so a reader
  of the golden path alone does not mistake "one" for "relevance and retention
  are the same number".

### 3. Primary sources: consolidation, decay and forgetting (Q2)

**Resolved by me:**
- LongMemEval README (`JOIN_MODE` separate/merge/replace; five abilities
  including Knowledge Updates)
- Graphiti README ("old facts are invalidated — not deleted"; "Every entity
  and relationship traces back to the episodes")
- MemoryAgentBench README ("Conflict Resolution (CR)"; "FactConsolidation")
- memory-conflict-resolution README (companion to *Reliable Post-Retrieval
  Assembly for Agent Memory*, COLM 2026 Lifelong Agent Workshop)

**`[S]`:**
- Mem0, Zep (arXiv 2501.13956), Memora (arXiv 2604.20006), STALE
  (arXiv 2605.06527)
- *Control-Plane Placement Shapes Forgetting* (arXiv 2606.15903)
- Xiong et al., MEM1, LightMem, Wang et al. recursive summarization
  (arXiv 2308.15022)
- ProMem (arXiv 2601.04463), SUMER (arXiv 2511.21726), MemoryBank

**Findings against the subject as written:**

| Claim | Evidence | Outcome |
|---|---|---|
| consolidation: "strongest reported fix moved newest-wins out of the model into deterministic code" | companion README, resolved verbatim: the gain is "not mainly from replacing the LLM with `max()`" (2.0 pp average, 0 pp at 262K); LongMemEval cross-check is a null result | **corrected** (before/after below) |
| consolidation: batched beats inline | cost evidence only (LightMem offline updates `[S]`); no equal-conditions accuracy comparison found | checked, left untouched; the text argues it from judgment quality, not a measurement |
| consolidation: contradiction lowers confidence before flipping, except a state restated by its authority | Memora and STALE `[S]`: the dominant measured failure is *stale retention*, which the existing exception already targets | checked, left untouched |
| consolidation: supersede, don't overwrite | Graphiti README shows the design shipped; no accuracy measurement isolates it | checked, left untouched; pinned in the application as design, not effect |
| decay-and-forgetting: importance-scored decay, tiers, caps | no published ablation of tiers or caps; MemoryBank's forgetting curve has no isolated ablation `[S]`; selective deletion helps ~10% absolute (Xiong et al. `[S]`) | checked, left untouched; no evidence either way on the specific mechanisms |
| decay-and-forgetting: forgetting never orphans provenance | supported as design only | checked, left untouched |
| rollup-compaction: currency vs detail; a rollup must not be the only thing recall can see | LongMemEval replace-vs-keys (`[S]`, from two lanes independently; README confirms the switch exists) | **landed** as a convergence paragraph. A Zep per-category figure (single-session-assistant −17.7%) was drafted and **removed**: single `[S]` source |
| rollup-compaction: a family needs three | not addressed anywhere | checked, left untouched |

### 4. Attack surface (Q3)

**`[S]` sources:**
- AgentPoison (arXiv 2407.12784); PoisonedRAG (USENIX Security 2025)
- SpAIware (Rehberger 2024; secondary coverage); Gemini delayed tool
  invocation (Rehberger, Feb 2025; secondary coverage)
- MINJA (arXiv 2503.03704)
- Unit 42, "indirect prompt injection poisons AI long-term memory"
- MemoryGraft (arXiv 2512.16962)
- Microsoft, "AI Recommendation Poisoning" (2026-02-10)
- OWASP Agentic Top 10 ASI06
- *From Untrusted Input to Trusted Memory* (Dash et al., arXiv 2606.04329; the
  four-channel study `memory-governance` already cites anonymously)
- A-MemGuard (arXiv 2510.02373); FARMA/SENTINEL (arXiv 2607.05029)
- TMA-NM (arXiv 2606.24322); MemLineage (arXiv 2605.14421)
- MURMUR (arXiv 2511.17671); *No Attacker Needed* (arXiv 2604.01350)
- eTAMP (arXiv 2604.02623)
- *Revoked but Still Authoritative* (arXiv 2609.08258)
- MemSecBench (arXiv 2607.27080)
- From the landscape lane: PPMF (arXiv 2607.29167); *Endogenous Authorization
  Laundering* (arXiv 2609.01836)

**Coverage of the published attacks:**

| Attack shape | Covered before this run? | Outcome |
|---|---|---|
| third-party text in tool or page output becomes a preference or rule | yes (`memory-governance`, "The evidence has an author") | untouched |
| relayed write that fires on the operator's own turn (deferred tool invocation, prefilled prompts) | **no**: author was read per turn | **landed**: classify by what was in context when the write was proposed |
| laundering through compaction or summarization, and trace-to-procedure synthesis | partly: the channels were named, but not inheritance | **landed**: taint inherited by derivation, most-tainted input sets the ceiling |
| provenance forged by the steerable step | **no** | **landed** in governance and the golden path: harness-stamped author |
| manufactured corroboration | partly: governance said repetition does not promote to preference; consolidation counted episodes | **landed** in consolidation: independent authors, not episodes |
| stored item re-injecting when recalled | partly: recall labeled memory, but no instruction-authority rule | **landed** in recall-injection: fence as untrusted span; authorship triggers confirmation |
| weak-signal fabricated fact committed honestly as "source said" | **no** | **landed** as a named residual in governance, closed at recall (action confirmation) |
| legitimate member of a shared store (query-only injection) | via `owner-and-counterpart-scope` | **landed** as a pointer; no new rule |
| revoked item returned through ordinary retrieval | yes: `filter-at-the-id-door` ("needs the rule once, at the point they share"; "the rule then holds at the query's predicate") | checked, left untouched |
| retrieval-biasing (items engineered to rank for many queries) | partly: bounded retrieval bonus in `memory-value-model` | **proposed**, not landed (below) |
| erasure across derivations | partly (forgetting orphans, supersedence) | **proposed** (below) |

### 5. Landscape and learned memory (Q1)

**`[S]` sources:**
- **Learned memory:** Memory-R1 (arXiv 2508.19828), Mem-α (arXiv 2509.25911),
  AgeMem (arXiv 2601.01885), MEM1, MemAgent, Supersede (arXiv 2606.27472),
  ReasoningBank, Titans/ATLAS, Memory Layers at Scale, Sparse Memory
  Finetuning (arXiv 2510.15103), Macaron-V1 (arXiv 2608.09819)
- **Products and open-source layers:** ChatGPT memory and "Dreaming", Claude
  apps / memory tool / Managed Agents memory stores / Claude Code, GitHub
  Copilot Memory (28-day unused expiry, citation validation; two `[S]`
  sources agree), Gemini, Microsoft Copilot, Cursor (memories reportedly
  removed; forum only), Mem0, Letta, Zep, LangMem, Cognee, Supermemory, MemOS

**Findings:**

- **Q1, does anything break the "Unchanged" list?** Learned *write policies*
  over an external store relocate governance; they do not break it. Memory
  *persisted in weights* (sparse memory finetuning, continually trained
  adapters) breaks per-entry provenance and per-entry erasure. That is a
  break, not a relocation. **Landed** as a scope condition on the "Unchanged"
  row, with the update itself as the governed unit. No shipped assistant
  surveyed persisted per-user memory in weights, so the boundary is
  published, not deployed. I left that sentence out of the upper layer
  because it is a dated product claim.
- **Products: forgetting mostly hides rather than deletes**, and user-visible
  provenance is rare. One vendor's memory feature validates stored citations
  against the current code before use and expires unused entries after 28
  days. **Proposed** as a product-named application once a page can be
  opened (below). Not landed, because nothing could be resolved.

## Corrections: before and after

**1. `techniques/consolidation.md`, supersedence bullet.** Authorized by the
memory-conflict-resolution README (resolved verbatim 2026-10-07; quoted in
`applications/spec--consolidation.md`).

- *Before:* "…and the strongest reported fix moved the newest-wins comparison
  *out of the model* into deterministic code over the candidates' order,
  because a model asked to compare timestamps drifts as the candidate set
  grows and lets its training prior override an explicit newer value. Type
  the claim, and where it is a state whose authority spoke again, the pass
  compares instants and never weighs."
- *After:* "…The strongest reported fix restructures the decision: one step
  extracts *every* candidate that matches the state, keeps its version and
  picks no winner, and a separate step runs newest-wins over that set. Its own
  ablation places the gain in that separation, not in moving the comparison
  into code. Swapping the final executor between a model and a deterministic
  maximum moved the result by about two points on average and by none at the
  longest context. A check on conversational knowledge updates without
  explicit version metadata was a null result. Deterministic execution still
  earns its place, on systems grounds: the rule becomes exact, inspectable and
  testable. So type the claim, and where it is a state whose authority spoke
  again, collect the candidates first and decide second. The pass compares
  instants and never weighs, and the instants are ones the store recorded, not
  ones a model inferred."
- *Note:* the paper's earlier title was reportedly "Don't Ask the LLM to Track
  Freshness" `[S]`. The old sentence reads like a summary of that framing,
  which the authors' own README now disowns.

**2. `agent-memory.md`, "Raw transcripts are not memory".** A condition added
after "…the claim a short benchmark cannot settle in either direction." The
new paragraph begins "A third thing it is not, and this one bounds the
altitude bullet above: it is not licence to answer from the claims alone." It
re-reads "(bounded, archived)" as "out of default reads, never out of reach".
Authorized by the counter-evidence and consolidation lanes converging
(LongMemEval replace-vs-keys `[S]` ×2 lanes, README switch resolved;
arXiv 2603.02473 and 2605.24579 `[S]`).

**3. `agent-memory.md`, "Provenance is the trust anchor".** A paragraph added
after "…a rumor with a database row." It begins "The converse does not hold,
and both of the ways it fails are published." Authorized by the
counter-evidence lane (citation-faithfulness and citation-trust studies `[S]`)
and the attack lane (MINJA, TMA-NM, MemLineage, PPMF `[S]`), converging with
the training-data lane's prediction.

**4. `agent-memory.md`, "One value model".** A clarifying paragraph added
after "…its consequences reach further than ranking." It begins "'One' is
about value, not relevance". No rule changed.

**5. `agent-memory.md`, "What this standard assumes", "Unchanged" bullet.**
Scope condition appended after "…it only makes the rumor harder to spot." It
begins "This row has a scope condition: **the learned policy writes to a
store it does not contain.**" Authorized by the landscape lane (Memory-R1,
Mem-α, AgeMem are external-store; Sparse Memory Finetuning is in-weights;
unlearning described as open `[S]`), converging with the training-data lane.

**6. `techniques/consolidation.md`, "Reinforcement is the mirror case".**
Appended "What strengthens is **independent authorship, not episode
count**…". Training-data D2 and the attack lane's manufactured corroboration
(TMA-NM `[S]`).

**7. `techniques/memory-governance.md`.** New section "Taint follows the data,
not the turn". It has three bullets (relayed instruction, rewriting step,
forged stamp), the reinforcement rule, and two named residuals routed to
`recall-injection` and `owner-and-counterpart-scope`.

**8. `techniques/recall-injection.md`.** Paragraph appended to "Injected memory
is labeled, not smuggled", beginning "A label says how far to believe an item.
For material a third party authored, it must also say that the item **cannot
instruct**." It links `prompt-safety/techniques/untrusted-span-fencing.md`
(read-only link, not an edit).

**9. `techniques/rollup-compaction.md`.** Paragraph appended after "…retrieves
it never." It begins "Public benchmarks have since shown the same split".

## Proposals (for the Director to place)

1. **`prompt-safety` (other subject).** Its threat inventory bullet on
   "retrieved memory and knowledge-base entries" could name the two forms the
   memory lane now handles: user-relayed writes (taint by context, not by
   turn) and taint inheritance through derivation. It could also point to
   `agent-memory/memory-governance#taint-follows-the-data-not-the-turn`. Not
   touched: shared subject.
2. **Possible technique, home ambiguous: "taint follows derivation".** The
   most-tainted input sets the ceiling of any derived item, through
   compaction, procedure synthesis and the agent's own recaptured outputs. Two
   lanes converged (training-data C2 + attack lane). It could live in
   `agent-memory` or in `prompt-safety` (next to `model-output-as-untrusted`).
   I landed it as a governance section rather than minting a technique because
   its home is ambiguous. The Director decides whether it graduates.
3. **Retrieval dominance (`memory-value-model` or `recall-injection`).** Items
   engineered to rank for many unrelated queries (AgentPoison, PoisonedRAG,
   MINJA `[S]`). The bounded delivery term caps the *retention* reprieve but
   not the *per-query* reach. Candidate rule: a per-author share cap in the
   relevance tier, and an alarm on one item surfacing across many unrelated
   queries. Single lane, so not landed.
4. **Erasure across derivations (`decay-and-forgetting`).** A deliberate
   forget, or a legal erasure, of an episode must reach every belief derived
   from it and every lane index. MemSecBench `[S]` reports repair removing
   poison in 86.3% of cases but keeping benign memory in only 62.5%, which
   argues for retiring by provenance rather than deleting by content. Single
   lane (attack) plus training-data F3, but the technique's "A deliberate
   forget bars re-derivation" section is long and I did not want to edit it
   from snippets. Proposed for a pass with the paper open.
5. **Product-named application (landscape).** A `spec--memory-governance` or
   `spec--decay-and-forgetting` application pinning one vendor's
   citation-validated, 28-day-unused-expiry memory, plus another vendor's
   "expiration hides, does not delete". Needs the vendor pages opened;
   `refresh_by` about 3 months.

## Handoff (step 4 owes; local-only work)

- **New techniques:** none.
- **Golden-path or technique rules that flipped (a condition added, an
  absolute refuted).** Each owes an `applied.md` row:
  1. `agent-memory.md`: raw transcripts are not memory → retrieve from the
     record, assert from the claims (claim layer as index, not replacement).
  2. `agent-memory.md`: provenance is necessary, not sufficient; the author
     field is harness-stamped.
  3. `agent-memory.md`: "Unchanged" holds only where the policy writes to an
     external store; in-weights memory makes the update the governed unit.
  4. `consolidation.md`: newest-wins = collect candidates, then decide; gain
     located in the separation; instants recorded, not inferred.
  5. `consolidation.md`: reinforcement counts independent authors.
  6. `memory-governance.md`: lane by context taint, not turn author; taint
     inherited by derivation.
  7. `recall-injection.md`: third-party recalled material is fenced and cannot
     instruct; authorship triggers confirmation.
- **Seams the existing applications suggest for those rows:**
  `node--memory-value-model`, `rust--consolidation`, `sql--consolidation`,
  `claude-code--memory-governance`, `rust--recall-injection`.
- **Verification debt:** re-open every `[S]` source above from an unblocked
  network before merge. The landed sentences most exposed are correction 2
  (LongMemEval replace-vs-keys) and the governance bullets' attack shapes.
  None carries a number from an unresolved source.
- **Infrastructure:** this cloud environment's network policy blocks the
  preprint hosts, which makes the "primary sources, verbatim" lane largely
  unrunnable from the cloud. Worth a source-class note in the saturation
  ledger: *in cloud runs, GitHub companion repos are the only reachable
  primary class*.
- **Regenerate** index, rules and catalog after merge (the Director's pass).
  The index's technique and application counts change by +1 application.

## Open questions

- Should the `[S]`-supported governance additions merge before verification,
  or wait for a local pass that can open the papers? I landed them because
  three lanes converged on the attack shapes and none of the wording depends
  on a figure. The Director may prefer to hold them.
- `spec--consolidation.md` carries `verified_on: 2026-10-07` for its resolved
  README citations only. It explicitly marks the LongMemEval *finding* as
  reported, not resolved. Is that split acceptable inside one application, or
  should the unresolved pin move out?

## check-bundles.mjs tail

Run on this branch after all edits (baseline before edits: also exit 0,
`bundle integrity OK`):

```
technical-writing: 6 subjects · 29 techniques · 7 applications · 4 categories
6294 concept documents · 14626 links checked · 6344 files scanned for health
NOT checked here: evidence resolution (consumer-side, by design — rkb-profile §5)
NOT checkable statically: the live transplant test — only it promotes status to transplant-tested
Purity checked against literal names only — a product referred to without being named passes; the denylist is a floor, not a proof of transplantability
bundle integrity OK
```

Exit 0. Violations in this folder: 0. Inherited violations elsewhere: 0.

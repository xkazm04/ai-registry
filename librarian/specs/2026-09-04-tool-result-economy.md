# XL spec — `tool-result-economy`

- **Run:** `copilot-cost`
- **Source:** `web:github.blog` — "How we make AI coding more cost efficient without sacrificing task quality" (2026-09-02, 2,225 words, two first-party engineers)
- **Status:** DISPATCHED
- **Why XL and not four techniques:** three picked candidates and the general form of a fourth share one `HOME IF NEW`. They are one stage of a pipeline — *what a tool result costs by the time the task is finished* — and `prompt-assembly`, the nearest home, is at **16 techniques** and owns a different artifact (the composed prompt). The operator chose the subject at the Phase 5 gate.

## Placement (verified against the authority, not against a count)

`knowledge/software-engineering/taxonomy.json` — `layout: "nested"`; it is the AUTHORITY and the folder tree is derived from it.

- `llm-agent` → `prompt-and-context` is a **flat subcategory holding 8 subjects** (`prompt-assembly, prompt-safety, retrieval, agent-memory, structured-output, agent-instruction-files, context-hierarchy, llm-extracted-entity-graph`). Add `tool-result-economy` as the **9th**. Sibling `runtime-and-io` runs at 10, so 9 is under the observed ceiling, and the subcategory holds no subcategories of its own — the both-kinds prohibition is not engaged.
- **Not** `llm-agent/runtime-and-io/mcp-tools` — that subject owns the tool *protocol* (schemas, transport, identity, untrusted results). This subject owns what the result costs the *task*, which is a context and measurement concern.
- **Not** `llm-agent/evaluation-and-cost/cost-metering` — that subject owns money: price tables, ledgers, budgets, invoices. T1 here is about the *scope of an efficiency metric*, not about billing.
- Resulting path: `knowledge/software-engineering/llm-agent/prompt-and-context/tool-result-economy/`. Link depth from a technique to `_laws.md`: `../../../../_laws.md` (identical to `prompt-assembly/techniques/*`). Golden path to a sibling subject: `../prompt-assembly/prompt-assembly.md`.

## The boundary this subject must state, and must NOT absorb

- **`prompt-assembly`** owns the composed artifact — layered sections, the global budget, degradation ladders, cache breakpoints, history compaction. This subject owns a **single result on its way in**, before the assembler sees it, and the question of whether shrinking it helped. State the discriminator in the golden path's opening: *prompt-assembly asks what fits; this subject asks what the result costs by the time the task is done.*
- **`prompt-assembly/elision-to-a-refetch-pointer`** already owns the third answer for *historic* transcript material, and its discriminator is **recoverability** ("is the material recoverable by an action the model can still take?"). **Do not rewrite it and do not restate its three material classes.** T2's discriminator is a different one — *who produced the bytes* — and the two compose: producer class decides whether a lossy transform is admissible at all, recoverability decides whether elision beats compaction. Cite it and say so.
- **`prompt-assembly/context-budgeting`** owns degradation ladders and the omitted-with-notice rung. Do not restate the ladder. T4's ordering rule sits *above* the ladder: exhaust information-preserving transforms before entering it.
- **`agent-instruction-files/line-earning`** owns admission and pruning of *authored rules*. T4 governs *emitted formatting*, which nobody authored per session and which no admission test ever ran on. Cite the pruning half; do not restate the admission test.
- **`eval-harness/metric-role-contract`** owns which metric is optimized and which are thresholds — **roles**. T1 owns **scope**, and the boundary must be written in T1's prose: a correctly-roled optimized metric measured inside too small a boundary is still wrong, and the two failures are independent. Same bundle, so link it.
- **`eval-harness/certification-levels`** owns the theoretical→empirical ladder. Do not absorb it. T1 may cite it for the workload-locality corollary.
- **`agent-runtime-assembly/bounded-projection-of-external-work`** owns work that outlives a run. Out of scope here.

## Proposed techniques

Four. Each must carry `use_when` and a decision-rules section.

### T1 — `end-to-end-unit-of-optimization`

**The decision rule it must carry:** an efficiency metric whose boundary is narrower than the unit the payer is charged for can always be improved by moving work across that boundary, so a local reduction is not evidence of a reduction. The mechanism is **displacement**, and it is not gaming — nobody cheated; the number was honest and the boundary was wrong.

Must contain:

- The measured instance, stripped: a utility that shortens shell output before the agent reads it made individual responses shorter, and the model reopened the original or re-ran the command when the omitted text mattered. Those recovery steps added turns and **carried more context forward on every subsequent turn**, so the completed task cost more. The displaced cost is charged at a rate the local metric cannot see, because a turn re-transmits the whole prefix.
- The rule for choosing the boundary: the unit of optimization is the unit the user's request is satisfied in, from request to final result — not the call, not the turn, not the session.
- **The workload-locality corollary** (folded in from a separate candidate): a result established on one workload does not transfer to another, *even when they share the harness*. Field instance: a tighter instruction set that helped one product surface increased cost on another running the same underlying harness, and was not shipped. Every surface re-measures. This is the honest reason a technique in this subject can be right and still not apply.
- The negative-result obligation: a change evaluated end-to-end and found to cost more is a landing, and the reason it looked good locally is the reusable half.
- Cite `gate-sees-target` (a metric narrower than the decision is a proxy) and `count-carries-predicate` (a saving quoted without its boundary will be reused for the claim it does not support). Verify both anchors exist in `_laws.md` before citing.

**Boundary to state:** vs `metric-role-contract` — roles vs scope, independent failures, both required.

### T2 — `compressibility-follows-the-producer`

**The decision rule:** compressibility is a property of *what produced the bytes*, not of the bytes or their size. Classify by producer, then admit transforms in order of what they destroy.

Must contain:

- The three-way policy, generalized off the source's shipped compressor:
  - **Exact-preserve** output whose information density is arbitrary — file contents, diffs, and anything an operator-supplied script emitted. Nothing may judge it, because nothing can predict what in it mattered.
  - **Lossless reorganization** for output that is an enumerable result set — matches, file lists, search hits. Regroup and dedupe the framing; **retain every result**. This is the rung most teams skip, and it is free.
  - **Lossy compression** only for output that is repetitive *by construction* — install, build, test, lint, progress — and only when the saving is substantial. The predictability is what licenses the transform: a producer with a known output shape is one whose noise can be identified without reading it.
- **The policy is derived empirically, not designed.** The shipped version was conservative *because the evaluations supported it*, not because conservatism was the goal — and the field instance is the one to keep: diff output was compressed in an early version, agents were observed reopening the originals, and the filter was removed. A compression policy that was never narrowed by a measurement has not been measured.
- The threshold rule: compress only when the saving is large, because a small saving cannot repay one recovery.
- Boundary vs `elision-to-a-refetch-pointer` as stated above.

### T3 — `escape-hatch-usage-as-the-safety-metric`

The subject's keeper. **The decision rule:** when a lossy transform ships with a recovery path, the rate at which that path is taken *is* the regression signal for the transform, and it must be instrumented before the transform ships.

Must contain:

- The reframe: the recovery path is not only a safety mechanism. It is the instrument. Frequent recovery means the transform removed something valuable — and it says so far earlier and far more cheaply than a task-success regression, which needs a large sample to move at all.
- What counts as recovery, enumerated: opened the preserved original, re-ran the command, repeated an exploration it had already done, narrowed a search it had already run, took an extra turn. **The last three are the ones teams miss**, because they do not look like recovery — they look like the agent working.
- **The boundary the source does not state and this technique must:** a low recovery rate is evidence only if the path is *reachable and advertised*. An escape hatch the model was never told about has a zero use rate and a zero meaning, and the two are indistinguishable in the data. Verify which law anchor supports this (`absent-guard-is-loud` and `failure-not-empty-success` are both candidates) and cite what you can support. The technique must give the reader the check: before reading the rate, confirm the path is named in the result the transform produced.
- The second boundary: the rate is a *conditional* signal — measured over the population where the transform actually triggered, not over all tasks. Reported over all tasks it is diluted to nothing by the cases that never compressed.
- The reporting rule: the rate travels with the population and the trigger condition (`count-carries-predicate`).
- The generalization the drafter should take deliberately: this is not specific to agents. Any lossy transformation with a documented way back can be regression-tested by counting the way back. Say it once, in the subject's own terms; do not wander into other bundles.

### T4 — `formatting-before-information`

**The decision rule:** exhaust the transforms that remove no information before admitting any that does — because those carry none of the four costs (no new instruction to the model, nothing for it to recover, no decision for it to make, and the content it reads is unchanged).

Must contain:

- The ordering itself, as the technique's spine, and *why* it is an ordering rather than a preference: an information-preserving removal cannot cause recovery, so it cannot be bought back at the rate T1 describes. Its saving is unconditional.
- **The vestigial affordance**, which is where the material is found: a per-item affordance is added because one consumer needed it; the consumer changes; the affordance keeps being emitted, on every item, forever. Its cost is **per-emission** and its value is **per-consumer**, and nothing in a codebase re-checks that pairing when the consumer changes. Field instance: a file-reading tool prefixed every line with a number for an editing tool that targeted changes by line; the editing tool was replaced by one that matches surrounding code; the prefixes remained on every line of every file read. Removing them cut model-inference cost roughly 5% in offline benchmarks and about 3% per user per day online, with no measured quality or edit-failure regression.
- **The discriminator, which is the half that makes this a technique and not an anecdote:** the affordance is not waste in general. Line numbers remain useful in diffs and short snippets. It was waste *here* — attached to every line of every full-file read while the workflow that consumed it no longer existed. The audit question is therefore not "is this formatting useful?" but **"which consumer needed this, and does that consumer still exist?"**
- The sweep this licenses: enumerate what the harness adds to a result that the producer did not — prefixes, banners, delimiters, restated headers, repeated paths — and for each, name the consumer.
- Cite `line-earning`'s pruning half as the authored-rule sibling of the same failure, and state the difference: an authored rule was admitted by someone once, so pruning is re-running a test that was run. Emitted formatting was never admitted by any test at all.

## The golden path

Opens with the subject's job and the boundary against `prompt-assembly` in its first two paragraphs (the discriminator sentence above). Then the pipeline the four techniques sit on, in order: **decide the unit you are optimizing (T1) → decide what may be transformed at all (T2) → order the transforms so the free ones run first (T4) → instrument the way back and read it (T3).** Close with what the subject does not own.

## Open questions the drafter decides rather than discovers

1. Does T1 belong in this subject at all, or in `eval-harness` beside `metric-role-contract`? The spec places it here because the other three are meaningless without it — every one of them is a local reduction that T1's rule governs — and a subject whose opening move lives in another category reads as three techniques and a citation. **Override this if the neighbours say otherwise, and say why in the report.**
2. Whether T4's ordering rule and T2's producer classification are one technique. The spec keeps them apart because T2 decides *admissibility* and T4 decides *order*, and a reader can need either alone. If drafting shows one absorbing the other, merge and report it.
3. Whether the subject needs a fifth technique on *batching a completion notice with its result*. That candidate was **not picked** by the operator and is banked untriaged in the source note; its nearest home is `agent-runtime-assembly/bounded-projection-of-external-work`, not this subject. **Do not write it.** It is named here only so the drafter does not rediscover it and file it wrongly.

## Web budget

**Zero fetches are allocated.** This is a first-party practitioner account and its claims are corroborated corpus-internally by the neighbours named above plus training-data convergence on proxy-metric scope and vestigial-affordance decay. If the drafter believes a claim needs a primary, it must say which claim and stop — do not spend a fetch on commentary about this post.

## Instruction to the worker

Override this spec where the neighbours contradict it, and explain the reasoning in your report — the last four dispatches all overrode their briefs and all four were right. Do not run git. Run the gate on your own subject only. Strip every proper noun: the source is made of one vendor's product names and none may appear in the golden path or the techniques. The measured numbers may stay; their owner may not.

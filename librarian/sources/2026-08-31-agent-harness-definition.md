---
source: web:arxiv.org/abs/2606.10106
kind: paper — the *definitional* subclass: conceptual analysis, no measurement, grey-literature corpus
url: https://arxiv.org/abs/2606.10106
title: "What makes a harness a harness: necessary and sufficient conditions for an agent harness"
author: Sanderson Oliveira de Macedo (Federal Institute of Goiás)
words: 768 landing page / 11504 full text
extracted: 11
accepted: 0
declined: 1
leads: 2
already_covered: 8
untriaged: 0
dispatched: 0
applied: 0
shipped: 0
fetches_spent: 0
run_id: intake-arxiv-260610106
siblings: 6
---

# What makes a harness a harness (arXiv 2606.10106)

A single-author conceptual analysis that defines *agent harness* by four necessary and
sufficient conditions, turns them into an inclusion/exclusion test, draws the boundary
against five neighbouring concepts, and classifies six real systems. Submitted 2026-06-08.

## Class, and why the class predicted the result

This is a **paper**, but the definitional subclass, and the distinction decided the run.
The class entry says a paper is authoritative for *its measurement, in its protocol*, and
weak for its framework — "framework papers are the class's marketing; measurements,
failure taxonomies and negative results are its substance." This paper contains **no
measurement at all**. Its corpus is grey literature (vendor documentation, glossaries,
engineering reports), which by the tiering rule makes it *commentary about primaries*
rather than a primary — the lowest tier that can still originate a finding.

Expected yield was stated before the triage table: 1-2 leads and a pile of catches. The
run returned exactly that.

**Landing page 768 words; full text 11,504** (15x). The abstract page is this class's
README-equivalent, and mining it would have produced the abstract's own summary of itself.
**Zero of three fetches spent** — eleventh consecutive zero-fetch run. Every candidate
resolved corpus-internally in one hop: `research-map` on concepts put the run in the
neighbourhood, and opening the actual file answered it.

Note on the map: the first pass returned three **near-empties** — `verifier` (2 weak hits,
both in other bundles), `guardrail` (1, in `recruiting`), `containment sandbox` (4
spurious). Every one of them was a seam, not a hole. The concepts live inside
`hitl-approval`, `quality-gates` and `eval-harness` under different names, and the slug map
cannot see them. Had the near-empties been believed, this run would have minted four
duplicate techniques.

## The result: eight catches, and in six of them the corpus is sharper

The paper's strip-surviving claims are already owned. That is the finding.

| # | The paper's claim | Where the corpus already holds it |
| --- | --- | --- |
| 1 | T4: a control counts only if its effectiveness does not depend on the model choosing to cooperate | `llm-agent/orchestration/hitl-approval` — `gate-state-machines` ("deciding whether a prompt flag is a real gate", "machine can flip its own gate open"), `fixed-policy-amendable-plan` ("the task's constraints live in the same context the executor can rewrite") |
| 2 | T3: a mechanical cut by size is not context management; selection must be task-aware | `llm-agent/prompt-and-context/prompt-assembly` — `tiered-history-projection` ("a fixed recent-window makes a long-lived agent forget arcs older than its tail"), `context-reachability`, `history-compaction` |
| 3 | T2: reading the environment without being able to alter it fails | `llm-agent/runtime-and-io/mcp-tools`; `llm-observability` `read-tools-default-writes-gated` |
| 4 | T1: a fixed graph is not an adaptive loop | `llm-agent/orchestration/agent-chaining` — `run-conditions`, `graph-to-wiring-translation` |
| 5 | Membership is binary, quality is gradual; conflating them is the source of the mess | `engineering-assessment/maturity-and-conformance/maturity-ladders` — `present-vs-enforced` § "A subject may decline a gap; it may not decline a blind spot"; `readiness-passports/declined-by-choice` ("not-applicable at the instrument level is honest; dismissed at the report level is not") |
| 6 | The test's discriminating power came from its exclusions; classifying six known positives was "almost tautological" | `standards-and-gates/quality-gates` — `gate-liveness` ("seeding a known violation to watch a new gate go red", "a gate that has been green for a year") |
| 7 | Benchmarks measure the model-harness **pair**; isolating the harness's contribution is missing | `llm-agent/evaluation-and-cost/eval-harness` — `unaided-baseline-screening` ("scores barely moved when the material under test was removed"), `failure-attribution` ("both the prompt and the model look correct") |
| 8 | Control acts *during* the task; the eval harness acts *after* — "one judges the race, the other is the vehicle that runs it" | `hitl-approval` golden path: "Review gates output after it exists; consent gates action before it happens." Also `quality-gates/gate-laddering` |

**Row 7 is the one worth remembering.** The paper closes on it as its central open problem
and its stated future work: *"an evaluation that isolates the harness's contribution,
controlling for the model, is missing."* It is not missing here.
`unaided-baseline-screening` is that evaluation, shipped, with an operational trigger and
an admission criterion.

**Row 6 is the same shape one level up.** The paper *admits* its validation was
near-tautological — six systems chosen for already being harnesses, all passing — and
correctly says the discriminating power sat in the two excluded edge cases. `gate-liveness`
turns that admission into a practice: a gate is only known to work once somebody has seeded
a violation and watched it go red.

**Rows 1 and 8 are cases where the corpus's phrasing is the better instrument.** The paper
needs a paragraph and a worked criterion to say what `hitl-approval`'s opening says in one
clause — *"a prompt the machine can talk its way past"* — and the review/consent split is a
cleaner statement of the temporal discriminator than the racing metaphor.

## Declined

- **Guardrail limits, the harness enables; the relation is part-whole, not peer.** Correct,
  and nothing survives the strip test that row 1 does not already carry. The distinction is
  vocabulary hygiene internal to the paper's own argument, not a rule another team could
  act on.

## Leads

- **Harness quality may displace model choice as the engineering differential.** The paper:
  *"the better the harness, the less the application depends on a single large and expensive
  model, since model switching becomes a control mechanism, not a rewrite."* It labels this
  a conjecture and leaves testing it to future work, which is exactly what makes it a lead
  rather than a candidate. Touches `llm-agent/orchestration/model-routing`.
  **Return condition:** when a second independent source measures the same task at
  comparable quality across two model tiers under one wrapper, or when a managed project
  switches model tiers without a rewrite and the diff is readable.

- **"Harness" now names three different things, and this corpus already uses it for two.**
  The genealogy is real: the classic *test harness* (scripts, mocks, stubs), the ML
  *evaluation harness* (a suite that scores a system against tasks), and now the *agent
  harness* (the runtime layer that wraps a model). This registry carries
  `engineering-process/build-and-release/test-harness` and
  `llm-agent/evaluation-and-cost/eval-harness` as neighbouring subjects, and the second
  already draws the boundary to the first in its opening. The third sense is now in wide
  circulation and has no subject.
  **This lead is recorded to prevent a landing, not to propose one.** The corpus owns all
  four of the paper's conditions, distributed across five subjects — `hitl-approval`
  (control), `prompt-assembly` (context), `mcp-tools` (tools), `agent-chaining` (loop),
  `agent-cli-transport` (the process boundary). That decomposition is *correct*: it splits
  by concern, and the response differs per concern. A subject named for the composition
  would be a container duplicating five existing ones, which this corpus deliberately
  avoids.
  **Return condition:** when a claim arrives that is about the *composition* rather than
  about one of the four concerns — a rule that only makes sense when loop, tools, context
  and control are considered together. Until then, route harness claims to the concern they
  belong to.

## Untriaged

None. Every extracted candidate reached a verdict.

## Board

Six live siblings at claim time: two other arXiv runs (`2604.18071`, `2604.11378`, both at
phase 0) and four TkDodo sources (`knip`, `pacer`, `the-vertical-codebase`,
`creating-query-abstractions`) holding `admission-queue`, `retry-backoff`, `rate-limiting`,
`module-design` and `client-fetch-cache`. No contention: this run claimed no subject and
wrote no bundle content, so it took neither the `index` nor the `content` lock. The tree
carried a sibling's uncommitted WIP in `ipc-contract`, `test-harness`, `dead-code`,
`conversation-orchestration`, `remediation-handoff` and `voice-io` throughout; nothing here
touched any of them.

## Why zero apply rows

Phase 7.5 owes one row per landed technique, correction or amendment. This run landed none,
so it owes none. Both leads are unproven by construction — one is the paper's own labelled
conjecture, the other is a decision *not* to create a subject, which has no seam to test
because its correct realization is the absence of code.

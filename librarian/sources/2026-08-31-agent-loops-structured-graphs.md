---
source: arxiv:2604.11378
kind: paper (position paper / design proposal - no empirical results)
url: https://arxiv.org/abs/2604.11378
title: "From Agent Loops to Structured Graphs: A Scheduler-Theoretic Framework for LLM Agent Execution"
author: Hu Wei
words: 21597
words_landing_page: 739
extracted: 14
accepted: 1
declined: 0
leads: 2
already_covered: 2
untriaged: 9
dispatched: 0
applied: 1
shipped: 0
run_id: intake-arxiv-260411378
siblings: 5
---

# From Agent Loops to Structured Graphs (arXiv 2604.11378)

Submitted 2026-04-13, 51 pages. Mined at the **HTML full text**, not the
abstract: the landing page is 739 words against 21,597 in-tree, a **29x**
ratio, and the abstract carries none of the paper's four substantive
artifacts.

**Class: paper, at the weakest sub-kind the method recognises.** The class
entry says a paper is authoritative for *its measurement, in its protocol*, and
weak for its framework — "framework papers are the class's marketing." This one
disclaims measurement explicitly and repeatedly: *"This is a position paper and
design proposal… not a production implementation or empirical results"*, and
again in §9.5, *"They remain untested claims based on the framework's
assumptions."* So every architectural claim in it authorises nothing on its
own. Expected yield was stated before triage as **1-2 landings, amendment-shaped**;
actual was 1 technique + 1 application. The calibration held.

What the source *can* authorise, and what the yield came from: a five-member
planning-failure taxonomy (§3.7), two proved propositions (§6.1), a
self-declared expressiveness boundary (Table 11), and a survey of 70 systems.

**Board:** 5 live siblings at claim time. One (`intake-pacer-0831`) held
`resilience/retry-backoff` and `resilience/rate-limiting`, which is where this
source's recovery-escalation candidates (#6) would naturally have gone — those
were left untriaged rather than contended. `pipeline-dag` was clear on
`check` immediately before the write.

**Fetches spent on corroboration: 0 of 3.** The landing was corroborated by
training-data convergence, per the corroboration table, and then verified
against real code in a managed tree. See below.

## Accepted

### 1. `valid-but-degraded-plans` -> `backend-platform/work-execution/pipeline-dag`

**Found by the enumeration hunt.** `graph-validation` makes an explicit
completeness claim about its own coverage — *"everything provable from the
document is proven at the door; everything else is named as a run-time check"* —
and names the space between them as the category that "must never exist." The
source demonstrates a **third** class that binary split cannot contain: defects
where the graph is well-formed, every check passes, **and the run succeeds**,
but the plan was wrong anyway (spurious dependency, over-decomposition,
under-decomposition). No door check fires because the document is valid; no
run-time check fires because nothing failed.

The discriminating question the technique is built on: **does the defect change
the result, or only the price?** Result-changing defects are already well
served. Price-only defects are invisible by construction, because no observation
separates a correct cheap run from a correct expensive one without a second run
to compare against.

The subject's blind spot is stated in its own boundary prose: it is written
throughout for a graph **the user authored** ("the user drew fifty edges"),
where this class is nearly harmless — one deliberate decision, made once,
amortised over every run. When a planner emits the graph, the defect becomes a
*rate*, nobody can be asked about the edge, and the plan's errors correlate with
the run's other errors. `deterministic-vs-model-nodes` covers model-backed nodes
*inside* the graph; nothing covered a model authoring the graph itself.

**Corroboration: training-data convergence, no fetch.** The rule is reached
independently from three directions older than the paper — build systems
(over-declared dependencies build correctly and serially, which is why
unused-dependency tooling exists separately from the build's own correctness
check), query planners (`EXPLAIN` exists because a valid plan's shape is
invisible from a correct result), and critical-path scheduling (spurious
dependencies inflate the critical path while breaking nothing). The source
located the gap; the rule for filling it is standard. Laws cited:
`gate-sees-target` (the door gates structure as a proxy for quality) and
`count-carries-predicate`.

**One contribution is the run's own, not the paper's:** the *inert edge* — an
edge that can never fail still counts in the denominator of any ratio over the
dependency set, silently capping the scale. That came out of the A/B below and
is now the technique's first decision rule.

## Applied

`next--valid-but-degraded-plans`, mode **experiment**, verdict **better**,
proof `ab-paired`, against `gravity` (public tree, pinned in the application).

The seam: a research-review surface whose findings form a dependency graph. Its
door validator is *unusually* good on the correctness class — it checks every
reference against a universe of ids, then again against a tighter universe to
catch right-shape/wrong-kind mis-wiring, and it treats an absent link as a
defect after previously shipping six unlinked records under a green gate. Every
one of those checks asks *does this edge resolve*. Not one asks whether an edge
that resolves is **needed**. The technique's split, drawn exactly.

The structural fact the tree proves without having been built to: severity is
`declared − missing`, and one class of declared dependency can never go missing
(explanatory nodes carry no dependencies, so the cascade skips them). Nodes
citing one can therefore **never** be reported at the severe end of the scale,
however much real evidence is removed. A/B over the shipped fixture: **5 of 11
nodes carry a mis-stated severity**, every one with exactly one inert edge — the
predicted signature. It reaches users (the bar escalates on the broken count
alone) and the same comparison is duplicated in a second file.

**Ship: 0, and the blocker is named per the declared focus.** Two of the four
classes, both of which are correct outcomes rather than failures:
**confirmation** (the pick did not name a project; a cross-repo edit needs its
own authorisation) and **indeterminacy** (two defensible fixes — partition
inert edges out of the denominator, or give explanatory nodes the evidence
edges the code was clearly built to carry; the tree's own comment says that
union "wounds nothing TODAY", reading as a capability built ahead of its data).
Nothing in the tree settles which, and shipping either would decide it
silently. One answer from the owner selects the fix.

## Already covered (catches)

- **A run pins its graph version.** The golden path's commitment 2 states it
  outright, including the auditability argument the paper derives (§5.1). Not a
  gap.
- **Terminal states must be absorbing.** The status vocabulary section and
  `node-execution-model` own this, including skipped-is-not-failed, which the
  paper's Σ_term does not distinguish as carefully.

## Leads

- **The 70-system survey's methodology (§A.5, Table 7).** The paper's only
  quasi-empirical artifact: 60% agent-loop / 15% event-driven / 10%
  state-machine / 5% graph / 10% hybrid, with a ±10% sensitivity claim.
  *Return condition:* when a second independent survey of agent execution
  patterns publishes, making convergence checkable. Not landed — a single
  self-reported classification of a self-selected sample is not a corpus fact.
- **"30-40% of agent tasks exhibit natural parallelism" (§9.3.2).** The author
  calls it "a rough estimate based on manual inspection." Recorded so a later
  run does not mistake it for a measurement. *Return condition:* a measured
  replacement from any source with a stated protocol.

## Untriaged - extracted, reached the table, nobody picked

Unverified, **not declined**. Anchors kept so a later run need not re-derive them.

| # | Title | Shape | Anchor | Note |
| --- | --- | --- | --- | --- |
| 2 | Keep failure history out of the retried step's context; readmit only via a new plan version | technique | §5.4 Def 5.3 | Read `real gap`; zero prior art found in `llm-agent/`. Likely home `prompt-and-context/prompt-assembly`. The strongest unpicked row. |
| 3 | Validation reliability compounds multiplicatively across staged validation (∏ p_v) | technique | Thm 6.3 | Read `real gap`. A proved bound, so authorisable. Splits syntactic (p≈1) from semantic/model-judged validation. |
| 4 | Parallel dispatch amplifies planning error; a serial loop self-corrects at the next step | amendment | §9.5 L3 | Partially absorbed into the accepted technique's "width buys latency and costs error containment". |
| 5 | Cancelling in-flight work needs a compensation protocol; skipping unstarted work is free | technique | §7.3 | The `first_of` exclusion. Discriminator is sharp and reusable. |
| 6 | Make an escalation order mechanically unskippable via API preconditions, not documentation | technique | §6.2 | Home would be `resilience/self-healing` (`strategy-selection`) — `retry-backoff` was sibling-held this run. |
| 7 | Bound the human-wait state or termination is unproven | amendment | Def 6.2 | The one state everyone forgets to bound. Home `hitl-approval` or `pause-and-gate-nodes`. |
| 10 | Attribute gains by incremental ablation — each arm adds exactly one feature | technique | §8.1-8.2 | Seven-group design; gains by subtraction. Home `eval-harness`. |
| 12 | Static plans are wrong for exploratory, dynamic-goal and creative tasks | technique | §9.5 L2 | A routing rule for when *not* to use a graph. |
| 13 | Adding a planner to a loop does not widen the ready set | lens | §3.4 | Thin on its own — a framing, untested, and the paper's own marketing. |

---
layer: application
type: application
subject: agent-memory
technique: consolidation
stack: spec
verified_on: 2026-10-07
refresh_by: 2027-04-07
source: "Companion repositories of three published memory systems and benchmarks, README files retrieved 2026-10-07"
---

# Newest-wins, separated: what the published repositories actually say

## The pin

These are the three public repositories behind the claims this application
supports. Their README files were retrieved raw on 2026-10-07 and are quoted
below as they stood that day. The papers themselves could not be opened from
the session that wrote this, because the network blocked the preprint host. Every
figure here is therefore the repository's own statement of its paper's result,
and the README file is named as the authority. `refresh_by` is six months out:
these are research artifacts, and the two that are still active publish new
versions on that kind of schedule.

- *Reliable Post-Retrieval Assembly for Agent Memory: Separating Evidence
  Extraction from Policy Execution*, Vikas Reddy and Sumanth Reddy Challaram.
  The README describes it as "Accepted at the Lifelong Agent Workshop at COLM
  2026". Repository `github.com/cvikasreddy/memory-conflict-resolution`.
- *LongMemEval*, ICLR 2025. Repository `github.com/xiaowu0162/LongMemEval`.
- *Graphiti*, the temporal-graph engine behind a commercial memory layer.
  Repository `github.com/getzep/graphiti`.

## Correction 1: the gain was the separation, not the code

Before this application, the technique's supersedence section said that the
strongest reported fix "moved the newest-wins comparison *out of the model*
into deterministic code". The repository says so explicitly, and states the
opposite:

> "the gain is **not** mainly from replacing the LLM with `max()`. Holding the
> extraction prompt and `T = 0` fixed and changing only the policy executor is
> worth 2.0 pp on average and **0 pp at 262K**. The large effect comes from
> restructuring the decision — externalizing semantic matching into a
> constrained intermediate representation before any selection happens.
> Deterministic execution earns its place on systems grounds (a known policy
> becomes exact, inspectable, and independently testable), not on average
> accuracy."

The structure it means is two steps:

> "**Extract** every semantically matching candidate with an LLM — strict
> subject + predicate match, *no* winner selected at this stage."
> "**Execute the policy** on that candidate set (`max(serial)`)."

Its scope condition is stated in the README as well:

> "A LongMemEval cross-benchmark check is a **null result** — 26/45 for
> structured assembly vs 29/45 for the baseline, paired exact McNemar p = 0.45
> — which is what bounds the claim to current-value questions carrying explicit
> version metadata."

The technique now says *collect the candidates first and decide second*. It
places the measured gain in the separation and the deterministic step's value
in inspectability. It also adds that the instants must be ones the store
recorded. The README's own headline table carries a caveat worth keeping: the
LLM-policy-executor arm (76.0 against 78.0 for the deterministic one) is marked
"Paper value; this arm's per-question JSON is not yet released". The two-point
figure is therefore the paper's number, not a reproduced one.

## Supporting pin: distillations as keys, not as values

The golden path's new boundary on "raw transcripts are not memory", and the
matching paragraph in rollup-compaction, say that distilled items replacing the
raw rounds lost accuracy while the same items added as keys gained it. That
finding is from the LongMemEval paper, which this session could not open. Two
independent research lanes reported it from the paper's abstract and body
through a search index, so it is recorded here as **reported, not resolved**.
What the repository does show is that the comparison is a first-class switch in
its retrieval harness:

> "`JOIN_MODE`: we support three modes:
> `separate`: add a new (key, value) pair with the expansion as the key.
> `merge`: merge the expansion and the original key to get the new key.
> `replace`: replace the original key with the expansion content."

The benchmark's knowledge-update category is the ability the technique's
supersedence rules serve. The README introduces "500 high quality questions to
test five core long-term memory abilities" and lists Knowledge Updates among
them, together with Information Extraction, Multi-Session Reasoning, Temporal
Reasoning and Abstention.

## Supporting pin: supersede, don't replace, as shipped

The technique's "supersede, don't replace" rule and the golden path's
provenance rule both appear as features of a shipped temporal-graph engine.
They are stated in its README in the subject's own terms:

> "**Temporal Fact Management:** Facts have validity windows. When information
> changes, old facts are invalidated — not deleted. Query what's true now, or
> what was true at any point in time."
> "**Episodes & Provenance:** Every entity and relationship traces back to the
> episodes (raw data) that produced it. Full lineage from derived fact to
> source."

This pins the design, not its effect. No README in this set measures whether
invalidation instead of deletion changes answer accuracy. The benchmark that
does measure conflict resolution, a "FactConsolidation" dataset in an ICLR 2026
agent-memory benchmark, is cited by the first repository as the task its
structured assembly was scored on. That benchmark's README lists "Conflict
Resolution (CR)" as one of its four competencies, scored by
"`substring_exact_match`".

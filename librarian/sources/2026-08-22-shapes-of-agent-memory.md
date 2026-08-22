---
source: web
url: https://pinglin.tw/blog/the-shapes-of-agent-memory
title: "The Shapes of Agent Memory - Files, Stores, and Experience"
author: pinglin.tw (a40-labs)
kind: first-party-empirical-study
mined_on: 2026-08-22
words: 13767
skill_version: 0.6.0
extracted: 12
picked: 6
accepted: 6
already_covered: 2
declined: 0
leads: 1
untriaged: 4
dispatched: 0
---

# The Shapes of Agent Memory, 2026-08-22 - the study class, and five amendments

Seventh run, and a new source class in its strongest form: a **first-party
empirical study** - controlled comparison, published per-question rows, an
exceptions ledger for what it cannot substantiate, and an appendix arguing
against its own headline. Longest source yet (13,767 words) and the densest
per word.

## The class, on first observation

A study of this grade is authoritative for **what it measured, in its
protocol** - and it says so itself, repeatedly ("no number means anything
without its protocol attached"). Three properties change how its claims read:

- Its **negative results are findings**, not absences: the consolidation
  null, the hybrid-ties-flat-index result, the raw-replay harm. Several of
  the run's best candidates were the author's own results *against* their
  design interest.
- Its measured facts are existence proofs with stated scope; the author
  flags every directional or untested claim (files-at-500-sessions is
  "untested, not refuted"). Respect those flags: what the author declines
  to claim, a technique must not assert.
- It is the mirror of the roundup class: nothing here says the world moved;
  everything says how one corner of it behaves under one fixed ruler.

Yield matched the class: five amendments to already-forged techniques, zero
new files. In a mature corpus a study source lands as missing *stages and
distinctions*, not missing subjects.

## Accepted

All six picks landed as amendments (the cheaper move; every home was a
forged technique). Gate-clean: build-index, build-catalog, check-bundles,
check-skills all green.

### 1 - States close; events accumulate -> `agent-memory/consolidation`

Source: "'works at Acme' should close 'works at Beta'; 'scored 2 goals this
week' must never close 'scored 3 goals last week'". The Supersedence section
had conflict-vs-reinforce and evidence-weight rules but nothing typed the
claim before linking it. Corroborated against the primary source (the
Zep/Graphiti paper, fetched in-run): the paper specifies validity-window
invalidation mechanics and does **not** distinguish state-valued from
event-valued facts - confirming the source's "the graph lineage does not
spell out" claim, and that the judgment sits with the writer. `new-technique`
content by impact, amendment by form.

### 2 - Eager recall buys over-answering -> `agent-memory/recall-injection`

The one category files won on both benchmarks: abstention (0.889 vs 0.778;
adversarial 0.508 vs 0.246). Mechanism, per the oracle control: over-answering
tracks *eager retrieval*, not context volume - so floors and slice-trimming
alone cannot fix it. Landed with the eval half attached (should-abstain
questions in the same denominator, per failure-not-empty-success - the
LoCoMo scoring dispute is the cautionary tale). `fills-stack-gap`: the corpus
had the retrieval-side floor (relevance-floors) and the retrieval-side
should-be-empty stratum, but no answer-side abstention discipline.

### 3 + 4 - The distiller is the ceiling, and it starves quietly -> `agent-memory/episodic-capture`

Folded pair. Reasoning at ingest is priced per event (~$14 vs ~$0.03 per
long history; 14s vs milliseconds per message), and a store only knows what
its extractor wrote down: the same engine driven by a weaker extractor
collapsed 0.53 -> 0.29, visible at ingest as several-fold fewer facts per
message, with no other symptom. Landed as two obligations: instrument the
distiller's yield as a health series; state the accepted per-event spend.
The corpus's own generous-capture / strict-consolidation split is named in
the amendment as the trade it already takes.

### 5 - Labeled is not applied -> `agent-memory/recall-injection`

"Injected memory is labeled, not smuggled" stops at doubtability. The
measured fact goes further: raw replay of retrieved experience made a trained
policy *worse than no memory* (76.4 -> 70.1), and the missing stage is
critique-against-current-state + reconstruct-or-reject. Candidate 8 (memory
pays only where the actor has headroom) folded in as the second bullet,
phrased as the author phrases it - an observed pattern on two actor tiers and
two tasks, not a law. Corroboration: first-party measurement + training-data
convergence (retrieval-distraction is independently established); the
MemHarness paper itself was not fetched (budget spent), which is fine - the
amendment asserts the shape, not the paper's numbers.

### 6 - The instrument's swing bounds the claim -> `eval-harness/judge-stability`

Swapping the reader+judge stack moved a score 6.9 points on byte-identical
retrieval; the three working stores differ by 0.3-3.6. Repeatability-floor
covered within-judge noise; the cross-instrument swing is the sterner ceiling,
and which bound dominates is a property of the scenario set (the same store
pair: 0.3 apart on LoCoMo, 15 on LongMemEval-M). Added to the drift section
with the both-ways corollary: a tie under one suite is only that suite's
indifference.

## Already covered (verified during triage, not deep-read)

- **10 - usage-gated promotion into the always-loaded index.** The corpus is
  ahead: memory-value-model's bounded retrieval-bonus axis and recall-feeds-
  retention in recall-injection carry the same signal with a termination
  argument the source's version lacks.
- **11 - graph expansion may add, never displace, the anchor set.** The
  capped-fusion shape is hybrid-lane-fusion territory and the source itself
  reports the associative layer changed nothing when finally tested -
  "design capability, not measured contributor" is not a basis to amend.

## Leads

- **Trained memory-use (experience architecture).** Retrieval, critique, and
  reconstruction as stages of one RL-trained policy; bank inseparable from
  actor. The corpus's whole agent-memory subject assumes a frozen reader -
  correctly, for now: one paper, one lab, acute prompt-format narrowness
  reported. **Return condition:** a second independent system training
  memory-use into the policy, or a connected project adopting one. Then the
  subject needs a boundary statement, not just techniques.

## Untriaged (nobody verified these; no judgment attached)

| # | Title | Anchor | My read at triage |
| --- | --- | --- | --- |
| 7 | Retrieval recall is not answer accuracy (95% surface vs 0.73 end-to-end) | "comparing different sports" | partial; likely one sentence in retrieval-evaluation |
| 9 | Consolidation stops paying when the reader can hold the mess (measured null at ~50 sessions) | "merged real duplicates and bought no accuracy" | partial; consolidation states the batch case, not the when-it-pays condition |
| 12 | Instruction files are not memory (human-authored static context vs model-written accumulation) | "keep it distinct from the instruction-file family" | thin; adjacent to "raw transcripts are not memory" |
| 8 | Headroom pattern as its own technique | "memory paid only where the actor had headroom" | folded into #5 as a bullet; a standalone technique would overclaim |

## Cross-references

- Subject notes: [[../subjects/software-engineering/agent-memory]],
  [[../subjects/software-engineering/eval-harness]]
- The abstention finding is the same failure family as relevance-floors'
  "least-bad k is a lie" - stated on the answer side there, retrieval side
  here; boundary noted in both places via the amendment's floor reference.

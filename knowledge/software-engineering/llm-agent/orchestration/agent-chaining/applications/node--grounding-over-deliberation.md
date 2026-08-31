---
layer: application
type: application
subject: agent-chaining
technique: grounding-over-deliberation
stack: node
verified_on: 2026-08-31
verified_against: node@24
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A gate that checks integrity and a reviewer who checks the story

## The seam

A desktop agent-orchestration app runs a memory-reflection pass: an LLM
reads a persona's memory rows and proposes syntheses (merge these memories
into one insight) and archives. Because applying a bad proposal corrupts
persona memory irreversibly, the project built an evaluation harness around
it (`scripts/memory/reflect-eval.mjs`, 317 lines) that produces a judgment
bundle per persona before anything is applied.

The harness has exactly the two step kinds this technique distinguishes, and
they are cleanly separated in the source:

- **A grounding step** — `runChecks()`, fourteen deterministic assertions
  written to `checks.json`. It can refuse.
- **A deliberating step** — `renderReview()`, a `review.md` side-by-side of
  "insight vs its sources", for a human or LLM to read. The script's closing
  line: *"judge each review.md, then apply or discard."*

The division of labour is the finding. Every one of the fourteen grounding
assertions checks **integrity**: at least two sources, source exists, source
is not core-tier, importance within 1..5, no double-actioned memory, and a
`no-live-mutation` check that the proposal run touched no live rows. Not one
of them can distinguish a good insight from a well-formed bad one. Quality
is routed entirely to deliberation.

## The paired comparison

**Measurable:** whether the gate refuses a well-formed proposal whose
declared sources do not support its insight — the fabricated-citation shape.

`runChecks` was extracted verbatim (lines 127–188) into a harness and run on
two proposals over one realistic six-memory before-set. Both proposals carry
the *identical* insight text; only the `sourceIds` differ.

- **P1 truthful** — insight about Rust async cancellation, cited to the two
  memories that are about Rust async cancellation.
- **P2 fabricated** — same insight, cited to the memories about disliking
  standups and drinking oat milk.

| Case | Arm A (shipped `runChecks`) | Arm B (+ source-fidelity check) |
| --- | --- | --- |
| P1 truthful | PASS | PASS |
| P2 fabricated citation | **PASS** | **FAIL** |

Arm A refused 0 of 2. Arm B refused 1 of 2, with no false positive on the
truthful case, and named the memories that actually support the insight.

Arm B's added check is the technique's corollary made literal: it does not
read `sourceIds` to find the sources. It recomputes support from the insight
text against the whole before-set, then asks whether the declared sources
are among what actually supports it.

## What the tree says about the standard

The reason arm A passes the fabrication is structural rather than careless.
`runChecks` verifies that each `sourceId` **resolves to a real, non-core,
not-yet-consumed memory** — every property except the one that matters,
which is whether that memory has anything to do with the insight. The
assertions are about the shape of the citation, and a fabricated citation
has a perfectly good shape.

And the deliberating step inherits the same blindness, which is the part
worth carrying away. `review.md` renders the insight beside *the sources the
proposal named*. A reviewer reading it is checking the internal coherence of
the candidate's own story — and a fabricated citation's story is coherent by
construction, because the insight was written first and the sources
attached after. The reviewer is looking at the artifact the producing step
chose, which under this technique is not an independent step however
carefully it is read.

That is the same failure as a convincing recorded reproduction produced
inside an environment built to yield it: the apparatus is where the
fabrication moves to, and reviewing the apparatus's own output cannot find
it.

The confirming half is that the project already understood the principle in
the neighbouring surface. `no-live-mutation` grounds a claim the candidate
would otherwise merely assert — that the run changed nothing — by comparing
a before and after snapshot the candidate does not control. The team reached
for exactly this move once. It did not reach for it on the citation, because
the citation *looks* checked.

## What this realization cannot do

The A/B is n=2 on constructed memory rows, not on recorded proposals: the
harness requires the app running on a test-automation port, which was not
started. The rows are realistic in shape and the code under test is the
shipped code, but the fabrication was authored to be caught rather than
observed in the wild. What the run establishes is reachability and
separation — arm A cannot refuse this shape, arm B can, at a cost of about
twenty lines — not a rate at which the reflection pass actually fabricates.

The token-overlap support metric in arm B is deliberately crude. It is
sufficient to separate "cited the memories about Rust" from "cited the
memories about oat milk" and would not survive paraphrase; a real
implementation would use the embedding the app already computes for memory
retrieval. The point of the arm is that *some* independently recomputed view
refuses what the declared view cannot.

## The proposed change

Not committed — the project tree was read, not edited. Two changes, in
order of cost:

1. **Add a source-fidelity assertion to `runChecks`** that recomputes
   support from the insight text rather than trusting `sourceIds`. It joins
   the existing failure list and needs no new infrastructure.
2. **Render `review.md` against an independently selected view.** Show the
   top-k memories by similarity to the insight *beside* the declared
   sources, so a divergence between the two lists is visible to the reviewer
   without reading every memory. This is the cheaper half of the technique's
   corollary and it changes what a human sees rather than what a gate does.

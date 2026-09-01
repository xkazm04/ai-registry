---
source: adaptive-harness-review
kind: video
url: https://www.youtube.com/watch?v=lNlMXsUQggc
title: "Your LLM Has a New Boss: The Adaptive Harness"
author: Discover AI
class: second-hand practitioner review (hybrid — relay half + first-party critique half)
words: 4823
extracted: 10
accepted: 1
declined: 0
leads: 1
already_covered: 6
untriaged: 2
dispatched: 0
applied: 1
shipped: 0
run_id: intake-yt-lnlmxsuqggc
siblings: 0
---

# Adaptive harness review (Discover AI, 2026-09-01)

A 31-minute channel review of a corporate preprint (published 2026-08-28) proposing a
composable, "runtime-adaptive" coding-agent harness. The ASR mangles the vendor and
system names throughout, which does not matter: **no candidate that survived depends on
the vendor's identity.**

## Class reading

Hybrid, and the halves have opposite reliability — the rule the method already carries,
confirmed again. The **relay half** walks the paper's architecture, and the reviewer
himself declares it restates known mechanisms ("this is not something new", "you know
this from my last two videos"). Six of six architecture candidates came back
`already covered`, which is the reviewer's own prediction holding against our corpus
rather than against his.

The **critique half** is a first-party reading of the paper's evidence tables and is
where the entire yield sat. Expected yield was stated before the triage table as
*mostly catches, 1 landing, concentrated in the evidence half* — that is exactly what
happened.

**Fetches spent: 0 of 3.** The class table says a review's fetch "is the extraction",
and that is true of its *relay* half — but the relay half was 6/6 already covered, so
the fetch would have bought corroboration for candidates that needed none. The critique
half corroborated corpus-internally and against a connected tree. Worth recording as a
refinement: **the fetch budget belongs to the half, not to the source.**

## Accepted

### 1. A baseline carries its conditions — `llm-observability/quality-scoring/quality-regression-gating`
`new-technique`, anchor [00:26:16]–[00:27:08]

Occasion: the paper compares an August-2026 system against baselines "created or
conceptualized in 2025, some of them in July 2025", and reports the margin as a result.
Stripped of proper nouns: *a comparison against a comparator from a prior generation is
arithmetically valid and semantically void.*

The corpus turned out to have a precise version of this gap, and it was found by the
asymmetry hunt rather than by the source:

- `paired-per-case-testing` enumerates a comparability predicate — same mode, target,
  case count, dataset version. **Four conditions about the experiment, none about the
  instrument.** The judge is absent, and the sibling subject
  `judge-calibration-and-drift` exists entirely to say the judge is the component that
  drifts. The enumeration was short by one.
- The golden path's "Honesty about what the test cannot see" section enumerates three
  baseline limitations. **All three are about sampling noise; none is about currency.**
- The routing rule is inverted: the paired test's comparator is the *previous run*
  (recent by construction) and carries the predicate; the floor test's comparator is
  arbitrarily old and carries nothing — and the fallback to it is reached by exactly
  the condition that proves comparability already failed.

Landed as a technique with the golden-path enumeration extended and
`paired-per-case-testing`'s predicate amended to include the judge model and version.

The source also supplied, without noticing, the counter-clock that makes the rule
precise: the reviewer defends the authors three times on the grounds that their work
was novel when they started it, while refusing to date their baselines. **A
contribution is dated by when it was made; a comparison is dated by when it is
published.** Both clocks are legitimate; conflating them is what lets a stale
comparator pass as an excusable one. Written into the technique as its own section.

## Applied

`experiment` / **better** / tracklight. Full write-up in the application document.

The gate's own arm was not runnable — the verdict function never consults judge
identity and the shipped store holds zero benchmarks — so the arms ran on the one
surface where model identity *is* resolved: the collective-ingest canonicalization
table, real shipped config, 11 model entries.

Arm A (normalized family) = 8 distinct identities; arm B (dated variant retained) = 11.
Five real instruments collapse into two, including three `gpt-4o` variants spanning six
months. 82% of entries carry a date arm A discards.

**The apply step corrected the technique**, continuing the pattern the last several
runs report. The collapse is not a defect — the table's own header argues for it, and
for a leaderboard it is right. What the arms established is that a codebase has *one*
identity function and the aggregation surface is the one people look at, so a
comparability predicate silently inherits the aggregation surface's answer. The
discriminator "aggregate on the canonical identity, compare on the measured one, keep
both fields" was added to the technique from this result and was not in it before.

A second structural fact, found and reported in the application: the tree records every
condition the predicate needs — judge model, dataset ref, baseline, timestamp, all in
one immutable row with no update path — and then narrows to `Option<f64>` at the call
boundary. The technique predicts a bare scalar with no conditions anywhere; this tree
has conditions recorded and a narrowing at the seam, which is a cheaper repair and a
harder one to see, because nothing is missing.

## Already covered (catches)

| Claim | Anchor | Where the corpus says it, better |
| --- | --- | --- |
| A 0.24pp margin inside a ±1.2 interval is not a result | [25:51] | `tested-superiority-claims` — argmax is a fact about a sample; prints "highest mean, not significantly ahead" |
| No component ablation ⇒ the causal claim is unestablished | [27:08] | `failure-attribution` § "One component per round", plus "re-ablate on upgrade" |
| A harness mistakes an answer for a completion command | [29:21] | `failure-attribution` § "The harness's own control flow is an eighth owner" — with a better instance (a loop terminating on the agent's first state-changing command) |
| Compaction must retain a handle recovering the original | [11:58] | `prompt-assembly/history-compaction`, `tiered-history-projection` |
| Two time scales: within-task adaptation, across-task lesson retention | [14:33] | `agent-memory` |
| Behaviour changes with weights frozen; the harness is the surface | [17:08] | generic across `llm-agent`; the source states it as novel and then retracts the novelty itself |

## Untriaged (nobody verified these — not declines)

- **A conceptual formalism in a results position is not validation** — [22:20]–[24:30].
  The paper presents an "equation 7" that nothing solves, no gradient touches, and no
  search optimizes, in the slot where evidence goes; the authors concede it is a
  conceptual lens. Plausible home `recruiting/assessment/assessment-instrument-validation`
  or the new `game-production/content-pipeline/judgeable-spec-authoring`. Reached the
  table with read `partial`; not picked.
- **Three levels of done: call succeeded / tree consistent / request satisfied** —
  [09:25]–[10:15]. The worked example (a refund API returning a struct instead of a
  bool, with a `if refund == true` caller a thousand lines away) is good. Substantially
  covered by `failure-attribution`'s seven owners and by the game-production law
  `compiling-is-not-wiring`, but no software-engineering subject states the positive
  three-level completion assertion. Read `partial`; seam-grep across the fleet timed
  out at 2 minutes and was not retried, so its seam is genuinely unknown rather than
  absent.

## Lead

**An adaptive-harness preprint claims near-parity with a leading coding agent** —
2026-08-28, Terminal-Bench 2.1 at 84.04 ±1.12 against 83.8 ±1.2, SWE-bench Verified
79.2 → 82. Currency only: the world contains another open harness making a
composability + runtime-adaptivity claim, and its own reviewer establishes the margin
is inside the noise.

**Return condition:** when a second independent source reports the same system with
component ablations, or when a fleet project considers adopting a third-party agent
harness and needs the field's shape.

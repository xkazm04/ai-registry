---
layer: application
type: application
subject: agent-memory
technique: exposure-is-not-credit
stack: bun
verified_on: 2026-10-15
verified_against: bun@1
---

# A ranking fix downstream of its cause, and a successor that tunes on what it showed

The source is one practitioner's procedural memory for coding agents
(`github.com/Dicklesworthstone/cass_memory_system` at `12d2033273da`, a Bun CLI whose
`package.json` declares `bun >= 1.0.0`), read with its stricter Rust successor
(`github.com/Dicklesworthstone/eidetic_engine_cli` at `1679e0fa40c1`) as clones on
2026-10-15. Anchors are relative to a directory holding the clones under `cm/` and
`ee/`. Both trees are licensed MIT with a rider; everything is restated and nothing
beyond the anchors is reproduced. Nothing was built or run in either tree.

## The attribution rule

After a session is reflected, one verdict for the whole session - from its recorded
status, its errors and retries, and the tone of its tail - is applied to every rule id
found in the transcript. Blame has two guards and credit has none. A session that is
not an explicit failure produces harm only when the negative signals clearly outweigh
the positive ones, and a set of more than eight graded ids is treated as injected
context that can never be blamed:

- `cm/src/outcome.ts:131 "const AUTO_GRADE_BLAST_RADIUS = 8;"`
- `cm/src/outcome.ts:229 "if (helpfulFinal >= harmfulFinal) {"`

The guard answers a real failure (one error in a mixed session marking dozens of rules
harmful). It leaves the other direction open: every success credits every shown rule,
and a tie credits too.

## The fix that landed, and where it sits

The tree recorded the symptom itself: generic process rules, shown on every task,
collected so many helpful marks that multiplying relevance by the raw score let them
crowd out the specific rule a query needed. The repair demotes feedback to a bounded
multiplier around relevance, roughly ten percent either way, shrunk toward neutral at
low counts:

- `cm/src/commands/context.ts:559 "finalScore: relevanceScore * getFeedbackMultiplier(b, config),"`

That is a correct application of the bound in the value model, and it is downstream of
the cause. The same exposure-earned marks still drive maturity, and the "proven" class
is reached on decayed helpful marks alone:

- `cm/src/types.ts:309 "minHelpfulForProven: z.number().default(10),"`

So the ranking stopped being decided by exposure while the trust class kept being
decided by it. A second exposure channel sits in the write path: when the reflector
re-proposes an existing rule, the duplicate is recorded as a helpful mark on it:

- `cm/src/curate.ts:490 "Reinforced by exact duplicate insight"`

## The successor's answer, and the half it leaves

The successor moved attribution to a passive harvester: pack impressions joined to
later verification, task closure and revert evidence, at a low weight, needing
corroboration, capped per window, and unable to promote or retire on derived signals
alone. Its stated reason is the loop itself:

- `ee/docs/adr/0055-evidence-harvester-passive-outcome-attribution.md:66 "never inflate confidence that drives more selection in a runaway loop."`

It then tunes retrieval weights offline from those outcome labels, behind an abstain
floor and an explicit, reversible promote step:

- `ee/src/core/shadow_tuning.rs:1145 "min_triples: 50,"`

The labels exist only for memories the incumbent ranking showed, and a labelled memory
the incumbent did not rank contributes nothing to the fit:

- `ee/docs/adr/0070-outcome-tuned-retrieval-weights.md:60 "cannot dominate; unranked labeled memories contribute 0"`

No exploration slot, propensity weight or independent label channel was found in the
tuner or either decision record. The tuner is reproducible and reversible, and it
cannot disagree with the ranking it learns from.

## What the trees show about the technique

Two generations of one design, by one author, each fixing the visible symptom of the
attribution unit and neither changing the unit. The first bounded the ranking and kept
the trust class; the second moved the signal to better evidence and then fed it to a
learner that sees only what was already shown. Neither tree measures whether its credit
tracks usefulness: the one retrieval benchmark in the first tree is synthetic,
author-written and keyword-only, with its helpful counts planted rather than earned.
The measurement this technique cites was made on a different store, with this tree's
rule restated as one arm (see the companion application for the harness).

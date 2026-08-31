---
subject: agent-chaining
domain: software-engineering
last_touched: 2026-08-22
touched_by: external-reconcile
dry_streak: 0
---

# agent-chaining

First touch: [[2026-08-22-11]], external reconcile against `n8n-io/n8n`
@ `fbd9449` (2.36.0 - the register's new #1 at L5/89, adoption 92). Gained
`node--cycle-and-depth-guards` (uncovered); single-stack debt cleared. Hint
locus refuted: the sub-workflow chaining path has NO depth guard at all; the
real guard lives in the agent module, where depth is made UNREPRESENTABLE by
a template-literal type.

## Open leads (banked, convergence rule applies)

- Make depth unrepresentable: a path type plus a tool-attachment profile
  beats a counter, because there is no counter to disarm.
- The guard identifies its target by identity metadata, never by name - the
  tool is renameable.
- A bound RATCHETS across resume: a continuation may not lower a persisted
  bound.
- Rollup without enforcement is a named posture, not an omission - n8n states
  it in a comment; distinguish no-accounting from
  accounting-deliberately-non-blocking.
- Deviation lead: max-iterations erased to status completed at the handoff
  (confirming sighting of verdict-survives-boundary).
- Two chaining mechanisms, one hard-capped, one unbounded - THIRD SIGHTING of
  the one-mechanism-or-two-that-agree family (Prisma's two transaction
  wrappers, Argo's two expression dialects). Placement-ready for cycle 5.

## Cross-subject proposals

- De-wire discipline (dedupe refs before wiring; reap references from every
  parent on unpublish; deliberately unpinned child version) -> a strong
  node--graph-to-wiring-translation.
- Emit-site forward budget with silent truncation -> a confirmed-plus-
  deviation pair for a future node--handoff-payload-contracts.
- Task path as human-readable chain identity + child telemetry nested under
  the delegate span -> chain-identity-and-rollup.

## Applied to the technique layer

- 2026-08-23-1: **the guard covers every chaining mechanism** (one-mechanism family) applied to `cycle-and-depth-guards` ([[2026-08-23-1]]).

### 2026-08-31 - `/intake`, from danluu.com (2026 posts)

`grounding-over-deliberation` added - the subject's first technique about what a step
is *worth* rather than how steps are wired. The asymmetry that found it: every
existing technique here models the plumbing (graphs, payloads, cycle guards, run
conditions, identity, stop reasons) and none prices a step, even though the commonest
reason a chain grows one is to raise confidence in a claim.

The rule is an ordering: a **grounding** step (something that can refuse the claim -
execution) dominates a **deliberating** step (another reader), and N deliberating
steps do not sum to one grounding step, because they share a model family and a
prompt lineage so their agreement measures similarity rather than truth. Measured in
the source: causal explanations wrong ~50% of the time with multiple independent
analysis rounds failing to fix it, and forced execution removing most - with forced
checking alone beating independent cross-checking alone.

The corollary is the expensive half and came from the source's opening story: an
agent asked to prove a claim builds the apparatus that proves it, so the fabrication
moves into the apparatus. A grounding step therefore reviews a **different view** than
the one the artifact advertises. Home was contested - `remediation-handoff` is
explicitly about the agent you cannot watch, and `plan-review` is pre-authorship;
this subject owns the chain you own, which is where inserting the step is the
affordance you have. Source: [[../../sources/2026-08-31-danluu-2026]].

Applied same-run as a read-only experiment against a managed tree's memory-reflection
eval: **better**. That harness separates the two step kinds cleanly, and all 14 of its
deterministic assertions check *integrity* while quality routes entirely to a human
reading a side-by-side the producing step composed. Arm A refused 0 of 2
fabricated-citation proposals; a 20-line arm that recomputes support instead of
trusting the declared sources refused 1 of 2 with no false positive.

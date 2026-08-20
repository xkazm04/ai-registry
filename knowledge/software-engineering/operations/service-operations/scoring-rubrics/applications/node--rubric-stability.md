---
layer: application
type: application
subject: scoring-rubrics
technique: rubric-stability
stack: node
status: forged
verified_on: 2026-08-20
---

# One enumeration of the bar, four surfaces, and the parity a dashboard owes the gate

The same rubric that scores a single repository is also applied as a fleet
policy: a threshold set (minimum level, minimum overall, per-dimension floors,
forbidden postures, branch protection, an AI-review rate) that a continuous-
integration gate enforces and a governance dashboard reports on. That policy
is advertised in four different shapes at once, and the repo treats all four
as twins of one declaration.

## The conditions are one ordered list, each carrying its own projections

`src/lib/scoring/gate.ts:105-115` defines the unit:

```ts
/** One enforced gate condition, rendered into every surface that must stay in lockstep. */
export interface GateConditionView {
  text: string;              // dashboard list + LLM brief
  bit: string;               // terse chip for the PR-comment footer
  query?: [string, string];  // gate-API query param, when the URL exposes this condition
  ci?: string;               // Action `with:` line, when the input exposes it
}
```

`describeGatePolicy` (`:127-170`) walks the active policy once and emits this
view per active condition; `src/lib/org/governance.ts:55-70` then derives all
three of its surfaces by mapping over that one list — `policyText` takes
`.text`, `gateQuery` sets `.query` pairs into a query string, `ciWith`
collects `.ci` lines — with the comment stating the guarantee: they "all
derive from ONE ordered enumeration of the policy's conditions ... so they
can't drift — the dashboard, the copyable CI snippet, the gate URL, and the
PR footer always advertise the SAME bar the gate enforces."

The technique's harder half is visible in the optional fields. Not every
condition is expressible on every surface: only the security dimension floor
has a gate-URL parameter and an action input (`gate.ts:139-144`), and only the
"ungoverned" posture is exposed as a flag (`:148-152`). Those conditions still
appear in the enumeration with `query` and `ci` deliberately absent, rather
than being kept in a shorter parallel list — so a condition that is enforced
but not URL-expressible still reaches the dashboard sentence and the PR
footer, and a reader is never shown a set that quietly excludes it.

`ciActionYaml` (`governance.ts:169-172`) extends the same rule one level up:
the action reference, the variable line and the indentation are single-sourced
because the on-screen snippet and the copy-for-LLM brief render the same
config through different wrappers — "single-sourcing it means bumping the
action version / renaming the input / changing the indent can't ship one stale
config."

## Parity of inputs, learned twice from incidents

Sharing the enumeration is not enough: the dashboard evaluates the policy from
persisted rollup aggregates (`evaluateGateLite`) while the gate evaluates a
full assessment. Two comments at `governance.ts:106-114` record what that
costs when the aggregate is missing a field the rule reads:

> Bug-fix (ci-gate-status-checks #1 / practices-governance-adoption #1): pass
> the per-repo branch-protection fields the rollup now carries so
> `requireProtectedBranch` actually runs in the fleet view — the dashboard's
> pass-rate must match the CI gate it advertises.

> W2: aiGovernedRate/aiPrSample travel too, for the same dashboard↔CI parity
> reason as the protection fields above — with the org's provenance bar set, a
> fleet view that silently skipped it would show repos as passing that the CI
> gate blocks.

Both are the identical defect twice: a condition whose input the aggregate did
not carry was skipped, so the advertised pass-rate was measured against a
weaker bar than the one being enforced. The repair is input parity, and the
comments also fix the absence semantics deliberately — an unmeasurable input
"→ the rule is skipped ... never a false-fail" — which is the explicit ruling
on absence that a threshold decision owes, rather than an inherited default.

Two smaller details of the same discipline: the failing-condition tally is
keyed off the failure-code union (`:36`) "so a new code cannot be silently
dropped" — adding a condition forces the tally to acknowledge it — and the
tally counts each condition **once per subject** (`:132-139`, a repo failing
three dimension floors counts once for `dimension`), so "where the fleet is
weakest" ranks conditions by how many subjects they block, not by how many
individual violations happen to exist.

## A deviation recorded: a derived number whose frame was never pinned

The same codebase shows what the pinning discipline does not reach. The fleet
goal meter at `src/lib/db/plan.ts:205-212` computes `pct` as `current / target`
and documents, at the field, that this is standing and not movement:

> 0..100 RATIO of current standing to target (`current / target`), NOT distance
> travelled from a creation-time baseline — goals don't record the metric's
> value at creation, so "progress since we set this goal" is not computable (a
> fleet at 45 targeting 50 shows a 90%-full meter on day one).

The disclosure is exemplary and the frame is still wrong for the question the
meter appears to answer; the honest fix is a baseline captured at creation,
which the schema does not store. The mitigations are the two available ones:
the trend-derived pace and ETA fields are named as the ones to trust for "how
much work remains", and `createGoal` (`:254-266`) rejects an already-met
target with the current value in the error, so "a goal can at least never be
BORN achieved" and the completed-goal history is not polluted with milestones
representing zero movement.

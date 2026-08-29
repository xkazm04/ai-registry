---
layer: application
type: application
subject: trace-rollup-and-attribution
technique: unpriced-span-accounting
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: code
ab_verdict: better
---

# React: the default precision was the one that lied

*Verified against the project tree at `bf2a1e249`.*

The Rust application of this technique covers the fold — a totals object that
carries `unpriced_spans` beside `cost_usd`. This one covers the last inch: the
formatter that turns a nullable cost into pixels. It is the cheaper half and
the one more likely to be wrong, because a display default is written once,
early, by someone thinking about digits rather than about epistemics.

## The seam

`formatCost` in `src/lib/utils/formatters.ts` is the single currency renderer
for the app — 27 direct call sites. Its null branch read:

```ts
if (usd == null) return precision === 2 ? fmt(0, 2) : '\u2014';
```

Precision 2 is the **default**. So the technique's rule was implemented
correctly for every caller that opted into precision 4, and inverted for every
caller that passed no options at all — and "passed no options" is the shape of
a call written by someone who did not think about the nullable case, which is
exactly the population the rule exists to protect.

The project had already noticed the *neighbouring* bug and fixed it well: an
exact zero used to fall through to the sub-threshold branch at precisions 4 and
`auto`, so a free local-model run rendered `$0.0000` in one tile and
`Total: <$0.001` three lines below. The regression test for that fix
(`src/lib/utils/__tests__/formatters.test.ts`) carries a nine-line comment
ending "`<` is a claim that the value is too small to render at this precision.
Zero is not." The very next test in the same file is named
**`keeps null distinct from zero`** and its first line asserted
`formatCost(null, { precision: 2 }) === '$0.00'`. The test's name and the test's
body disagreed, and the name was right.

## A and B

- **A:** the branch above. A cost that was never measured renders `$0.00` at the
  default precision.
- **B:** `if (usd == null) return '\u2014';` at every precision. An exact `0`
  still renders `$0.00` two lines below, because zero is a measurement and null
  is an admission.

## What was read

`vitest` over `src/lib/utils`, `src/features/agents/sub_executions`,
`src/features/agents/sub_deployment`, `src/features/settings` and
`src/features/overview` — 58 files, 609 tests. Under A the rewritten
`keeps null distinct from zero` case fails on its first assertion; under B it
passes and **no other assertion moves**. That silence is the interesting part
of the result: the behaviour change is invisible to every test in the suite
except the one that names it, because every other cost assertion is over a
non-nullable value. TypeScript is doing the containment — a call site whose
argument is `number` can never reach the branch, so the blast radius of the
change is exactly the set of call sites whose type admits absence.

Those call sites are: `CloudExecution.costUsd` and `CloudTriggerFiring.costUsd`,
both `number | null` in the generated bindings
(`src/lib/bindings/CloudExecution.ts:6`, `src/lib/bindings/CloudTriggerFiring.ts:3`),
rendered by `CloudExecutionRow.tsx:32,42` and `TriggerListItem.tsx:133` — all
three calling `formatCost` with no options. Cloud runs whose price the desktop
side could not resolve were being drawn as `$0.00`.

## The structural fact: absence is destroyed before the frontend sees it

The deviation this run was handed pointed at
`src/features/agents/sub_executions/detail/inspector/inspectorShared.tsx:48`
(`formatCost(execution.cost_usd)` in the stat strip, contradicting
`TraceSummary.tsx:41-51` which holds the null-is-not-zero line beautifully in
prose). Fixing *that* line would have been inert, and the reason is worth more
than the fix.

`PersonaExecution.cost_usd` is `f64` — not `Option<f64>` —
(`src-tauri/core/src/models/execution.rs:39`), and the row mapper reads it as
`coerce_f64(row, "cost_usd")?.unwrap_or(0.0)`
(`src-tauri/db/src/repos/execution/executions.rs:194` and `:226`). The database
column is nullable; the mapper coerces NULL to `0.0` on the way out, and a test
at `:2341` pins that coercion as correct. So by the time an execution reaches
the TypeScript layer, "we could not price this run" has already been converted
into "this run cost nothing", irreversibly, and no display-layer discipline can
recover it.

Two lines away in the same tree, the *span* cost is `Option<f64>`
(`src-tauri/core/src/trace.rs:83`) and stays nullable all the way to the tile.
The same screen therefore holds two shapes for one measure: the trace summary
can say "unpriced" and the execution strip structurally cannot. Nobody designed
that split — it fell out of one struct being written with a NOT-NULL instinct
and the other with a nullable one — and it is the cleanest demonstration
available that this technique is an **ingest** discipline that display can only
preserve, never restore.

## What this realization cannot do or prove

- **It does not prove the technique's central claim.** The rollup half — a
  count of unmeasured rows travelling beside the sum — is not implemented
  anywhere in this tree. Nothing here shows an operator distinguishing a
  fully-priced total from a mostly-unpriced one; it only shows a single value
  no longer lying about itself.
- **The gate cannot see the pixels.** 609 green tests say no assertion changed,
  not that the cloud execution row now reads correctly. No test renders
  `CloudExecutionRow` with a null cost; the claim that those call sites are the
  reachable ones is read off the generated types, not off a render.
- **It cannot reach the coerced half.** The execution-row seam stays wrong after
  this change, and cannot be made right in TypeScript. The return condition is
  `PersonaExecution.cost_usd` becoming `Option<f64>` — a schema-and-mapper
  change with a migration behind it, which is a different order of work than
  the two lines this application tested.
- **It says nothing about whether zero is ever correct.** The `precision: 2`
  default returning `$0.00` for null may have been load-bearing for some
  aggregate caller that sums totals and wants a benign zero. The type system
  says no such caller passes a nullable value today. It does not say none will.

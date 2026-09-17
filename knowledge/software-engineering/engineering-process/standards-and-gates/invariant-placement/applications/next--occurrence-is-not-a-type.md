---
layer: application
type: application
subject: invariant-placement
technique: occurrence-is-not-a-type
stack: next
status: forged
verified_on: 2026-09-17
verified_against: next@16.1.3
applied: code
ab_verdict: better
proof: ab-paired
---

<!-- version witnesses from the tree: next 16.1.3, typescript 5.8.3, the container library 5.0.5, the linter 9.38.0 -->

# Eighteen selector hooks the type checker could not tell from the correct ones

Verified against `xkazm04/goat` (public) at commit `84db23c`, whose parent is
`a992fef`. Versions from the tree: `package.json` pins `next` at `^16.1.3`,
`zustand` at `^5.0.5` and `typescript` at `5.8.3`; the installed linter
resolves to `9.38.0`.

> Director: this commit was produced on branch `backlog/2-007`. Substitute the
> sha of the landed commit before the anchor check runs.

A store selector that builds a fresh object or array returns a value that is
never referentially equal to the last one, so the library's default identity
comparison sees a change on every store update and the component re-renders
regardless of which fields it read. The correct form wraps the selector so the
comparison is shallow. **Both forms have the same type**: the selector's return
type is identical whether the value is stable or not, which is the whole of
this technique's premise, and it is why the tree carried the defect for as long
as it did.

## The tree knew the idiom and applied it inconsistently

At the parent commit, over 979 source files, there were 364 store-hook call
sites. The population breaks down as:

| shape | count |
|---|---|
| narrow single-field selector (correct, needs no comparison) | 262 |
| selector wrapped in the shallow comparison | 35 |
| **selector building a fresh value, unwrapped** | **18** |
| no selector at all (whole-store subscription) | 28 |
| other (block bodies with branches) | 21 |

Thirty-five correct wrappings and eighteen missing ones, in one tree, with
nothing anywhere that reads which is which. The eighteen are all exported
convenience hooks in store modules — the hooks every consumer of that store
calls:

- `src/lib/errors/error-notification-store.ts:243` "export const useErrorNotifications = () =>"
- `src/lib/errors/error-notification-store.ts:244` "  useErrorNotificationStore(useShallow((state) => ({"

The second anchor shows the line **after** the change; at `a992fef` it read
`useErrorNotificationStore((state) => ({`. The already-correct form was
present in the same tree at the parent commit:

- `src/stores/backlog/selectors.ts:1` "import { useShallow } from 'zustand/react/shallow';"

## The checker's output is byte-identical on both arms

This is the technique's invisibility proof, run as declared. `tsc --noEmit`
over the whole project:

- arm A (parent, 18 violations present): **39 errors**
- arm B (all 18 repaired): **39 errors**

Same error codes at the same sites in both arms. Six of the thirty-nine are in
`src/stores/ranking-store.ts`, at lines 669-719 — the file that also holds four
of the eighteen violations, at lines 1446-1618. **Not one of the thirty-nine
errors is at a selector.** The only difference between the two arms' output is a
one-line offset in that file, caused by the added import. A checker that
reported the term would have moved the count; it did not move.

## The rule, and what the narrow predicate is worth

- `eslint-rules/no-unstable-store-selector.cjs:54` "  if (expr.type === \"ObjectExpression\") return \"object\";"
- `eslint.config.mjs:87` "      \"local/no-unstable-store-selector\": \"error\","

Findings over the same 979 files, with the project's own linter binary:

| arm | findings |
|---|---|
| A — parent tree, rule run read-only | **18** |
| B — 18 repaired, rule installed at error | **0** |
| sledgehammer — flag every selector not wrapped | **280** |

The sledgehammer variant is the same rule with one predicate deleted
(`isFreshlyConstructed` replaced by "is a selector"). Its 280 findings include
all 262 narrow single-field selectors, which need no comparison and are correct
as written: **94% false**, for a three-line deletion. Both variants run in
under a second, so cost never separated them.

Controls, run before the arms were believed:

- **positive** — three seeded violations (fresh object, fresh array, an
  allocating method call) in a fixture inside the lint scope: rule reports 3/3.
  Three seeded compliant forms (narrow read, wrapped selector, a length read):
  0 reported.
- **negative** — the rule's core predicate replaced by `false`: findings on the
  same fixture drop 3 → 0. The rule measures the predicate and not its own
  presence.
- **denominator** — 364 hook call sites and 5,249 files scanned with 0
  unparsable, so the arm-B zero is a zero over a live population and not
  [vacuous by evaluation](../../quality-gates/techniques/vacuous-by-evaluation.md).

## The sibling repository holds the same term at zero, with no rule

The cross-tree comparison is the reason this application claims an
observability win rather than an enforcement one. A sibling repository on the
same container library, at 2,165 store-hook call sites, has **64** fresh-value
selectors and **0** of them unwrapped — and no rule for this term either. It
does have a rule for the neighbouring term (a whole-store subscription with no
selector at all) set to `error`, and sits at 0 of 2,165 on that one, where this
tree sits at 28 of 364.

So type-invisibility did not predict the violation. It predicted that neither
team could see their own rate: 0/64 and 18/49 were indistinguishable from every
surface either would have checked, including a green type check.

## What this tree also revealed, and it is not about selectors

`eslint src` **cannot run in this repository on either arm**. `eslint.config.mjs`
imports `eslint-plugin-storybook` and the package is not installed, so the
linter exits 2 with `ERR_MODULE_NOT_FOUND` before reading a single file — on
`main`, unmodified. Every custom rule this application recommends would be
installed into a gate that does not start.

That is [gate-liveness](../../quality-gates/techniques/gate-liveness.md) in its
most literal form and it is reported here rather than in the technique because
it is a fact about one tree. The rule above was therefore verified with this
repository's own linter binary under a minimal configuration that loads only the
rule, which proves the rule but not the gate. **Do not read arm B's zero as a
gate result.** The missing dependency is repaired, or the rule is documentation
with an exit code.

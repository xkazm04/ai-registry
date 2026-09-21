---
layer: application
type: application
subject: release-pipeline
technique: release-level-by-reader-reach
stack: node
status: forged
verified_on: 2026-09-17
verified_against: node@24
applied: code
ab_verdict: better
proof: before-after
---

# One contract, two reader classes, and an addition that typechecked clean

A hiring workspace publishes a lint contract: `JdLintFinding` in
`app/_lib/jd-lint.ts`, a union of four finding kinds returned by `lintJd` to
every authoring surface. Two reader classes read that union in the same tree,
which makes the tree a controlled experiment — one contract, one change, and
the only variable is how each reader was built.

- **Derived.** `jdLintMessage` (`jd-lint.ts:167-179`, guard at `:185`) dispatches over the union
  and hands the residue to `assertNever(x: never)`. Its own comment says why:
  "a future kind is a COMPILE error at the `assertNever` default — rather than
  the panel's nested ternary silently falling through to the 'missing place'
  label." A prior scan had already fixed this half.
- **Acting default.** `JdsLintPanel.tsx:35-43` (at `bb5b74f1`) renders the label with a ternary
  chain over `m.key` whose last branch is `: t("lintMissingPlace")` — a real
  label, not a residue. This half was left in place.
- **Inert.** Fifteen `f.kind === "…"` sites across the two test files, each
  naming one member and ignoring the rest.

## The arms, and what each gate saw

Floor, arm A: `tsc --noEmit` exit 0; `node scripts/run-unit-tests.mjs` on
`jd-lint.test.ts` + `jdsLintWiring.test.ts` reports 29 pass / 0 fail.

| arm | the change | typecheck | unit | inert readers reached |
| --- | --- | --- | --- | --- |
| A | none | 0 errors | 29/29 | — |
| B-name | a new exported function nobody imports | **0 errors** | **29/29** | 0 of 15 |
| B-member | a fifth union member, emitted by `lintJd` | **1 error**, at the `assertNever` line | 28/29 | 0 of 15 |
| B-member+ | the same, with the derived reader's branch added | **0 errors** | 28/29 | 0 of 15 |
| B-repair | an existing threshold changed, no type change | 0 errors | 28/29 | 1 of 15 |

Two additions, opposite radii, same release: the new **name** moved nothing at
all, and the new **member** of an existing shape was an immediate build
failure. The word "additive" covers both.

The decisive row is **B-member+**, the state a developer reaches by doing the
obvious thing — the compiler demanded a branch in the derived reader, so they
added one. The whole project then typechecks **clean, exit 0**, and the acting
default is reached with nothing to say so. Evaluating the panel's real ternary,
extracted from its own source on every run, against the new message key:

```
PROBE POSITIVE CONTROL  lintVague         -> lintVague          OK
PROBE POSITIVE CONTROL  lintMissingPlace  -> lintMissingPlace   OK
MEASUREMENT             lintBuzzwordDensity -> lintMissingPlace
```

The new finding renders under an unrelated label, on a green build. Both
positive controls passed on the same run, so the probe was reading the real
expression and could have reported either outcome.

## The prescribed repair, and the pair that proves it is not a sledgehammer

The technique's repair is mechanical: name the last member, send the residue to
an empty parameter type. `JdsLintPanel.tsx` now ends
`: m.key === "lintMissingPlace" ? t("lintMissingPlace") : assertLintMessageHandled(m)`
with `assertLintMessageHandled(m: never): never`.

Measured on the fixed panel, two assertions pulling opposite ways:

- **The addition can no longer ship.** B-member+ on top of the fix is
  `TS2345 at JdsLintPanel.tsx:45` — exit 2. The same change that was invisible
  is now the loudest signal available, in the reader that was silently wrong.
- **Nothing else moved.** Both known keys still resolve to their own labels
  (probe above, re-run against the fixed file), typecheck exit 0, unit 31/31.

Without the second assertion the first is passed by any over-correction; without
the first the second is passed by changing nothing.

## Controls

- **Positive control on the typecheck**: a planted type error in `jd-lint.ts`
  was reported as `jd-lint.ts(189,7) TS2322`, exit 2 — the gate reads this file.
- **Negative control on the floor**: deleting one handler from `jdLintMessage`
  reddened the typecheck at `jd-lint.ts(176,26) TS2345`. The derived reader's
  guard is load-bearing, not decorative.
- **Negative control on the new test**: the source-level guard fails 2 of 2
  against the pre-fix panel, so it can see the thing it gates.

## What the corpus had wrong about this tree

The project's own comment claims the exhaustive dispatch prevents "the panel's
nested ternary silently falling through to the 'missing place' label". Measured:
it does not. It prevents the *dispatch* from falling through, and the panel's
ternary was still a separate, unguarded copy of the same vocabulary — the
second authority the law warns about. One addition was enough to show the guard
covered one of the two readers.

## Shipped

`fix(library): end the JD lint panel's label chain on a named key, not a
fall-through` — `545cad4a` on `backlog/t03`, not pushed. Two files: the panel,
and `jdsLintPanelResidue.test.ts` pinning both halves of the repair. Gates:
`tsc --noEmit` exit 0, unit 31 pass / 0 fail, `eslint` exit 0 on both touched
files.

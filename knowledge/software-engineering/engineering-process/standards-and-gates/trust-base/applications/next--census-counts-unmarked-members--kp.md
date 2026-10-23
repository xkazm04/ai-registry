---
layer: application
type: application
subject: trust-base
technique: census-counts-unmarked-members
stack: next
status: forged
verified_on: 2026-10-21
verified_against: next@16
applied: experiment
ab_verdict: better
---

# A ratchet that counted the spelled escapes and recorded `any` as zero (TypeScript)

A hiring product written mostly in TypeScript on Next, read at kp `4ca15eb79`; the
lint ran with the TypeScript 6.0.3 and typescript-eslint 8.59.2 installed in the local
checkout, over files identical to that commit. The tree already holds its type-level
trust base to a ceiling: `scripts/lint/ts-ratchet.mjs` counts every `@ts-ignore`, `@ts-expect-error` and
`@ts-nocheck` and every eslint disable over `app/` and `packages/`, `ts-debt.json`
declares the ceiling, and CI fails a build that grows it. Five `@ts-` directives were in
the tree on the day of the read.

Explicit `any` has no ceiling, and the header says why, at
`scripts/lint/ts-ratchet.mjs:35 "IS DELIBERATELY NOT COUNTED"`: a sweep found none in
code. It concludes, at `scripts/lint/ts-ratchet.mjs:42 "The honest gate for"`, that the
gate for `any` is the type checker plus the rule that would have to be disabled to
introduce one. That is the census by marker, and its zero is
the reading the technique warns about. In TypeScript the unchecked type is a value, not
a keyword. `JSON.parse` returns `any`, `Response.json()` resolves to `any`, and
`Array.isArray` narrows `unknown` to `any[]`. None of them is spelled at the call site
and no rule has to be disabled to use one, so a call through any of them reaches typed
code with nothing for a ratchet to count.

## The census, two predicates

Arm A is the ratchet's predicate: `@ts-` directives. Arm B adds values of the unchecked
type reaching a typed position with no marker. B was counted with the type-aware lint
that reports exactly that (`no-unsafe-assignment`, `-return`, `-argument`,
`-member-access`, `-call`), run from a configuration outside the tree so that nothing
in it changed. The tree's own configuration enables none of those rules and does not
run typed linting. The text stand-in, a code line calling `JSON.parse(` or `.json()`
with no `as` and no `unknown` on it, was checked against the lint on three feature
packages before it was used.

| Package | A: `@ts-` directives | Text stand-in lines | Lint, production lines | Members the lint missed |
| --- | --- | --- | --- | --- |
| hiring decisions | 0 | 16 | 12, from 11 sources | 2 |
| profile tools | 0 | 11 | 18 | 0 |
| library jobs | 0 | 2 | 0 | 2 |

The ratchet reports the base of all three packages as empty. The lint finds thirty
members in two of them. The third has none because it sends every response through one
fold, `app/features/library/jobs/jobsResponseFold.ts:4 "The house shape for a fetch in this app is"`,
and the fold takes `unknown`. Over the whole tree's production code, 678 code lines make
one of these calls. On 475 of them the call carries an `as` assertion: spelled members,
which the ratchet does not count either. Ten erase the value to `unknown`, and 192 carry
no spelling at all.

## The stand-in, read against the lint

On the decisions package the sixteen text lines sort three ways. In only one of them do
the stand-in and the lint agree:

- **Eleven sources the lint flags,** usually a line or two after the call, at the first
  member access or typed assignment.
- **Three folded into `unknown`.** The value passes into a function whose parameter is
  `unknown`, and the function narrows it. These are sound and are not members; the
  text stand-in overcounts them.
- **Two members neither instrument sees.** A callback parameter annotated on a promise
  of `any`, `app/features/hiring/decisions/decisionsAnalysisSummaryData.ts:108 ".then((p: { matchVerdict?"`
  and `app/features/hiring/decisions/groupEval/useGroupEvalOpen.ts:89 ".then((probe: ProbeAnswer)"`.
  The annotation is an assertion with no `as`: the parameter is declared to be a shape
  nothing derived, and the call accepts it because a function taking `T` may stand in
  for one taking `any`. The lint is silent on both, and a standalone fixture outside
  the tree reproduced the silence: `r.json().then((v: T) => use(v))` produced no
  finding, while `const v: T = await r.json()` beside it was flagged.

A search for that shape, an annotated `.then` parameter within three lines of a
`JSON.parse(` or `.json()` call and not annotated `unknown`, names thirteen production
sites in thirteen files, including all four found by reading. Its first draft named
fifteen; the two extra were `(p: unknown)` callbacks, which are the fold and not members,
and the search now excludes them. Thirteen is a floor, because a chain that puts the
annotation further down is not counted. One of the thirteen asserts only an object of
optional `unknown` fields, the weakest claim on the list.

## Verdict

Better, measured as an experiment. Over the three packages the census moved from zero
members to thirty-four (thirty lint findings and four annotations), and the ratchet
could have seen none of them. The one package with no unchecked flow is the one whose
house shape removes the member instead of documenting it: decode into `unknown`, then
fold. That is the technique's "remove before you document" in this language, and the
tree already has it in one place.

## What would change it

- **Count the unchecked flow beside the directives.** A typed-lint pass of the five
  `no-unsafe-*` rules, per package and reported as its own ratchet line with its
  predicate, would give the ceiling teeth on the axis it now records as zero. Typed
  linting is slower than the untyped pass, so it may belong in a scheduled job rather
  than every push.
- **Count annotated callbacks separately, because the lint cannot.** A text pass for
  the shape above, checked against the four known sites and the two `unknown`
  negatives, is the instrument until a rule exists.
- **Prefer the fold.** Each member is removed, not argued, by decoding to `unknown` and
  passing the value through a function that checks it, which is what the jobs package
  already does.

Return condition: when the tree adds a typed-lint ratchet line, re-run arm B with it,
and re-read the annotation count against it.

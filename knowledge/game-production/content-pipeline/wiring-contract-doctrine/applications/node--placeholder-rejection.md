---
layer: application
type: application
subject: wiring-contract-doctrine
technique: placeholder-rejection
stack: node
status: forged
verified_on: 2026-08-20
---

# The wiring-contract checker (TypeScript/Node)

`src/lib/catalog/acceptance/wiringCheckers.ts` is the whole technique in one file:
the four keys, the placeholder rule, the specificity floor, the tier requirement,
and the empty-versus-malformed distinction on dependencies. Its header comment is
also the incident report that motivated it.

## The incident: 137 contracts, zero readers

From `wiringCheckers.ts:3`:

> The fleet went on to author 137 `wiringContract` blocks across 30 pipelines —
> and, until this checker, **nothing read them**: no view, no acceptance. A step
> could declare `grantedBy: 'TBD'` and still grade `pass`.

The count is real and has grown: `grep -c 'wiringContract:' src/lib/catalog/pipelines/*.ts`
returns 137 across 33 pipeline files today, and `wiringContractSound(...)` is now
composed into 167 step `accept` clauses. The gap between "declarations authored"
and "declarations consumed" was the entire defect — the standard's *a contract
with no reader is not a contract*, measured.

## The rules, as code

```ts
export const WIRING_KEYS = ['grantedBy', 'activatedBy', 'verification', 'dependencies'] as const;
export const MIN_PROSE = 12;
const PLACEHOLDER = /^(tbd|todo|to do|n\/?a|none|nothing|\?+|-+)\b/i;
```

`MIN_PROSE` carries its basis in the comment at `:36` — *"the shortest real
`activatedBy` in the fleet is 30 chars; 12 leaves room without admitting a stub"*.
That is the standard's corpus-derived floor, with the measurement recorded next to
the number, at roughly the 2.5× headroom the standard asks for.

`checkWiringContract` (`:44`) then applies, in order:

- **shape** — a non-array object, else `fail` with "a wiring contract must declare
  `{ grantedBy, activatedBy, verification, dependencies }`";
- **presence** — each of the three prose keys is a non-blank string, and the
  failure reason quotes the rule itself: *"the 'no gray-box' rule: an artifact that
  is not registered + triggered is not config-complete"*;
- **placeholder + floor** — `v.trim().length < MIN_PROSE || PLACEHOLDER.test(...)`
  → `fail` labelled `"${key} is a stub"`, echoing the offending 60 characters back.
  The reason names the fix: *"name the real registration/trigger site"*;
- **tier** — `/\bL[0-4]\b/.test(verification)`, else *"an unfalsifiable 'it works'
  line is not a verification contract"*;
- **dependencies** — `Array.isArray(deps) && !deps.some(d => !String(d).trim())`.
  The comment at `:23` states the standard's distinction verbatim: *"an EMPTY array
  is legal — a step may genuinely depend on nothing; a malformed one is not."*

Every failure returns `{ label, tier: 'L2', status, detail, reason }`, so the
rejection reaches the operator as an actionable line rather than a generic
invalidity — placeholder-rejection's step 5.

## Composition, not replacement

`wiringContractSound(field?)` returns a `Checker` composed onto a step's existing
checks with `allOf(...)` — e.g. `items.ts:145`, `accept: allOf(fieldsPopulated('baseType', …), wiringContractSound('baseType'))`.
The step's own headline verdict is untouched; the contract is a *content
invariant* (same `data` in, same verdict out, no context needed), which is what
lets it be graded identically in the lab, in a recipe, and headless.

## Two deviations, and the standard does not move

1. **Absence passes.** `wiringContractSound` returns `pass` with detail
   `'no wiring contract declared'` when the container has no `wiringContract`
   (`:98-101`) — deliberately, "mirroring `linksResolve`'s empty-link-set pass" so
   the checker can never turn a clean produce into a failure. The standard is
   stricter: a contract some artifacts carry is a contract whose absence carries no
   information. The repo's choice was a rollout compromise for retrofitting 33
   pipelines; it should tighten to *required per content class* once coverage is
   complete, otherwise the 167 composed checks cannot distinguish "wired,
   undeclared" from "not wired".
2. **An unrunnable check reports pass.** `linkCheckers.ts:44` returns `pass` when
   no `CheckerContext` is supplied — *"a rollup path that supplies no `ctx`
   genuinely cannot resolve links, so this returns `pass` rather than dragging a
   satisfied step to pending"*. That makes greenness depend on which code path
   asked, and the rollup is the path most likely to lack context. The honest value
   is a distinct unmeasured state, not `pass`.

What `linkCheckers.ts` gets exactly right is the actionable reason: unresolved
links render as `unresolved: items::iron_longsword — seed the target entity, or
drop the link and model it as descriptive data` (`:22`) — the failure and its two
legal fixes in one line.

---
layer: application
type: application
subject: readiness-passports
technique: two-axis-readiness
stack: node
status: forged
verified_on: 2026-08-20
---

# Two derivations, two shapes: a weighted band and a predicate cascade

Realized in the Ascent repo as two pure sibling modules under
`src/lib/analyze/`, deliberately built differently because the axes answer
different kinds of question.

## Axis 1 — production readiness: weighted composite over four ordinal tables

`src/lib/analyze/passport-score.ts:7-30`. Four lookup tables map ordinal enums
to points, and a fifth term is composed from delivery facts:

```ts
const CI_PTS  = { none: 0, build: 20, checks: 45, gated: 70, delivery: 85, progressive: 100 };
const TEST_PTS = { none: 0, smoke: 25, partial: 50, substantial: 75, comprehensive: 100 };
const SEC_PTS  = { none: 0, policy: 25, scanning: 50, gated: 75, "supply-chain": 100 };
const OBS_PTS  = { none: 0, logs: 40, errors: 60, metrics: 80, tracing: 100 };
```

weighted `0.25·ci + 0.25·tests + 0.20·security + 0.15·observability +
0.15·delivery`, then banded at 25/45/65/85 into
`prototype | internal | beta | production | hardened`
(`passport-score.ts:20-30`).

Three things this confirms. The **non-uniform point spacing** inside each table
is the technique's rule that a cardinal sort key is legitimate *within* one
axis — the jump from `checks` (45) to `gated` (70) is deliberately the largest
in the CI table, encoding present-vs-enforced as the widest gap. The
**single-source derivation** (the module header states it exists so both the
builder and the override overlay re-derive from one formula without a circular
import) is what stops the score being authored anywhere. And the function is
**pure — no IO, no clock**, stated in the header comment.

## Axis 2 — autonomy: a cumulative predicate cascade, not a score

`src/lib/analyze/passport-autonomy.ts:1-143` answers "what can you safely hand
an agent in *this* repo?" with four tiers T0-T3 and, crucially, **no
arithmetic**. `tierPredicates()` (`:63-113`) returns each tier's own
predicates, each an object of `{ met, missing }` where `missing` is the
literal next action:

- T1: agent instructions committed + a one-command test entry point +
  `tests.level ≥ partial` — "agent output can be CHECKED before it lands".
- T2: + `ci.level ≥ gated` + `tests.level ≥ substantial` + (guardrail hooks OR
  a reproducible sandbox).
- T3: + AI demonstrably in the workflow + an eval harness + versioned
  migrations ("unattended runs need a reversible schema trail").

`derive()` (`:115-143`) composes them cumulatively — the T2 checklist is
`[...preds.T1, ...preds.T2].filter(x => !x.met)` — so a reader sees every
unmet predicate below their target tier, not just the nearest one. This is the
technique's claim that a permission wants a cascade rather than a blend, built
exactly that way and for exactly the stated reason.

The two axes read overlapping inputs (`readInputs()` at `:42-60` pulls
`tests.level`, `ci.level` and `delivery.migrations` straight from the
production block) but **neither is a term in the other** — the independence
rule, honored.

## Honesty caps, per axis, with the lift named

The strongest confirmation is the token boundary. "Gated" is an enforced rung
requiring branch protection, which a tokenless scan cannot observe. So
`governance == null` caps the autonomy grant at T1 (`passport-autonomy.ts:135`,
`tier === "T1" && ... && enforcementVisible`) and the cap is *rendered into
every affected checklist* rather than silently applied — `TOKENLESS_MISSING`
(`:31-32`) leads the `missing` list for every tier above T1
(`:139-141`), and it names the fix: "re-scan with a token."

The same caveat also caps `ci`/`security` on the production axis
(`src/lib/analyze/passport.ts:7-11`), which is a partial deviation from the
technique's caps-do-not-cross-axes rule: here one missing credential does cap
both axes. It is defensible because the same unobservable fact genuinely feeds
both, and the cap is reported separately on each — but the general rule stands,
and a design that capped globally on any caveat would not.

A second cap is worth copying: migration honesty at `:22-25`. Sandbox/hooks
detectors postdate older stored passports, so on a lifted row they are
`null` — **unknown, never a fabricated `false`** — and the T2 checklist names
the re-scan (`SANDBOX_HOOKS_UNKNOWN`, `:34-35`) rather than the missing
artifact. That distinction between "you lack this" and "we did not look" was an
upward lesson from this file.

## Where the realization falls short

- **The pair does get a headline.** The design doc's worked example
  (`APP_READINESS_PASSPORT.md:243-247`) reports "Automation readiness: L4, 76"
  and "Production readiness: beta, 64" side by side, which is correct — but
  `automationReadiness` carries an authored 0-100 score whose derivation §8.3
  admits is not yet formalized, while the production score is derived. Two
  numbers of different epistemic status printed in the same shape invites the
  average the technique forbids.
- **No stated criticality interaction.** `identity.criticality` exists
  (`APP_READINESS_PASSPORT.md:190-195`) and is described as telling a reader
  "how hard to judge the scores", but nothing in either derivation consults it
  and nothing forbids a future contributor from making it a term. The
  technique wants that prohibition written down.

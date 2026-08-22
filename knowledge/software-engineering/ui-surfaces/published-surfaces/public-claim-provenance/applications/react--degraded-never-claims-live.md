---
layer: application
type: application
subject: public-claim-provenance
technique: degraded-never-claims-live
stack: react
status: forged
verified_on: 2026-08-22
verified_against: react@19
---

# Degraded never claims live — two surfaces, two answers

This tree holds both halves of the technique's argument in one deployable: a
section that implements the load-state vocabulary properly, and a hook feeding
the hero that has no vocabulary at all.

## The vocabulary, declared once

`src/components/sections/feature-voting/local-types.ts:26-33` is the closed
enum with the rule written into the type's own docstring:

```ts
/**
 * Initial-load lifecycle for the section.
 * - `loading`  — the first fetch batch is still in flight (show skeletons).
 * - `live`     — at least one source resolved; the data is real.
 * - `degraded` — every initial fetch rejected; present quietly and never
 *   claim "Live" over what is effectively dead/seed-only data.
 */
export type LoadState = "loading" | "live" | "degraded";
```

"Present quietly and never claim Live" is the technique's seed-without-badge
rule stated by the author, and `FeatureVotingSummary.tsx:35-37` implements it
literally:

```tsx
// When every source failed we still show seed totals, but we drop the
// "Live" claim and dim the line so it never dresses dead data as live.
const degraded = loadState === "degraded";
```

The three states then get three genuinely different renderings, which is the
part most surfaces skip. `loading` returns early with an `aria-hidden`
placeholder bar rather than a totals line built on unloaded state
(`:23-33`) — absence rendered as absence, not as zero. `degraded` dims the
line (`:50`) and, at `:54`, the badge is gated on the state rather than on the
layout: `{!degraded && <>&middot;&nbsp;{s.live}</>}`. The liveness claim is
rendered by the data, which is the whole point.

Two deviations against the technique's four-state standard:

1. **Partial is spelled as live.** `live` is documented as "at least one source
   resolved", so a batch where one of several fetches succeeded renders
   identically to one where all did, badge included. The technique's `partial`
   state — real over what answered, saying what is missing — has no
   representation here, and the vocabulary being closed means adding it is a
   one-file change that the type system will then chase through every consumer.
2. **Quiet to the reader, quiet to the team.** The technique asks for a total
   failure to render quietly and log loudly. The degraded path dims a line;
   whether a matching signal reaches the producing side is not visible at this
   surface.

## The surface with no vocabulary at all

`src/hooks/useLiveStats.ts` feeds the hero stat row and has no load state to
expose. `FALLBACK_RESPONSE` (`:39-43`, built from `FALLBACK_STATS` at `:12-22`)
is the hook's initial value *and* its permanent value when the fetch fails: the
`.catch` at `:107-120` reports to error tracking and returns, leaving `stats`
holding the fallback, and the consumer receives a `PlatformStatsResponse` that
is structurally identical to a successful one. The malformed-shape branch
(`:84-103`) does the same — it warns once, then `return`s without setting
state, so a server answering with the wrong shape is indistinguishable from a
server that answered correctly.

The `Data Source Contract` docblock (`:50-65`) is unusually honest about which
fields are which — "Real Data: `totalUsers` reflects the live waitlist signup
count (min 228)"; "Mock/Aspirational: `totalExecutions`, `totalTemplates`,
`totalAgents`, etc. are currently seeded with marketing defaults in the API
route" — and that honesty stops at the module boundary. Nothing in the returned
type carries it, so `HeroClient.tsx:37-42` renders seeded and derived values in
one row with identical typography (see the sibling application on
`derived-numerator-authored-denominator`).

## The floor, and which side of the seam it sits on

`src/app/api/stats/route.ts:75-101` declares `MINIMUM_DISPLAY_VALUES` and
`applyFloor` (`:276-282`) raises each higher-is-better field via
`Math.max(raw[key], MINIMUM_DISPLAY_VALUES[key])`. The docblock is explicit
that this is deliberate ("These are NOT bugs — they are a deliberate marketing
decision") and the design is careful in two ways worth crediting: `FLOOR_FIELDS`
(`:114-123`) deliberately excludes lower-is-better metrics, since a maximum on
latency would inflate rather than protect (`:103-113`); and trend deltas and
series are computed from **raw** values, "NOT floored values — so the floor
never invents fake growth" (`:83-86`).

Whether flooring a measurement is a defensible treatment of that measurement
is a question for the measurement, and this subject does not answer it. What
this subject answers is what the *surface* may then do, and here the answer is
a deviation: the floored figure reaches the reader as an ordinary derived
value. `totalUsers` may be 228 because 228 people signed up or because fewer
did; `totalTemplates` renders "120+" against a shipped catalog of 57
(`src/lib/templates.ts:37`). The technique's rule is not that the substitution
is forbidden — it is that the displayed figure must say which of the two it
is. The closest this tree comes is the `+` suffix, which reads as "at least",
and would be an honest lower-bound disclosure if the floor were a lower bound
of the real value rather than a replacement for it.

## The cheap fix already exists in the tree

The gap between the two surfaces is one type. `local-types.ts` shows the whole
pattern in eight lines: a closed enum, a docstring carrying the rule, and
consumers that cannot fall through to a default. Giving `useLiveStats` the
same discriminant — and letting the hero's stat row read it the way
`FeatureVotingSummary` reads `loadState` — would let the hero drop a claim it
currently cannot drop, because it currently does not know it is degraded.

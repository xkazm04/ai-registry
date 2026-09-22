---
layer: application
type: application
subject: canvas-graph
technique: graph-layout
stack: react
status: forged
verified_on: 2026-09-20
verified_against: react@19.2
---

# The fleet constellation — a generated layout that has to survive arrivals and two engines

Ascent's launch map draws each watched GitHub organization as a
constellation: one beacon at the centre, one star per repository, brightness
carrying maturity. Nobody can drag a star, nothing is persisted, and the
whole layout is two pure functions in
`src/components/launch/fleetMapStars.ts`. It is the renderer stage of this
subject — and it still pays for every layout decision the technique names,
because its input set changes while the user watches and the same placement
is computed twice, in two different engines.

## Phyllotaxis, and what it reads

`starPosition(i, total, seed)` (`:98-108`) places the i-th of `total` stars
on a sunflower spiral: `angle = i * GOLDEN + hash01(seed) * 0.6`, `radius =
13 + sqrt((i + 0.6) / total) * 42`, inside a 120-unit square field. The seed
is the repository's `fullName` (`ConstellationField.tsx:61`), so identity is
in the placement — but only as a per-star angular jitter of at most 0.6
radians. **The slot itself is ordinal**: the dominant inputs are the index
and the total, exactly the parameterization the technique warns about. The
module's own comment says so plainly — "a repo added or removed changes
`total`, hence every key" (`:88-93`).

## The arrival policy, and its honest limit

The fix the surface actually shipped is the technique's second resolution.
A star that lands mid-scan (`applyScanEvent` sets `appended`) is placed by
`appendedStarPosition(seed)` (`:115-119`): one fixed outer ring at radius
56, just beyond the spiral's 13..55 band, angled purely by the repo's own
hash. It reads `seed` and nothing else — **no index, no total** — so landing
a scan result cannot move any existing star.
`ConstellationField.tsx:56-61` keeps appended repos out of `layoutTotal`
entirely and routes them through the other function.

Two details make this the textbook version rather than a lucky one:

- The appended ring also escapes the `MAX_STARS = 80` slice
  (`ConstellationField.tsx:58`): a successful scan of an unknown repository
  "must never be invisible at the cap" (`:110-114`). Arrival placement and
  arrival *visibility* are one decision.
- The comment states the deferral instead of hiding it: "the next
  authoritative refresh (`mergeStars`) clears the flag and re-flows
  everything at once" (`:12-15`). The re-seat is postponed to a reload
  boundary, not abolished — which is the trade the technique asks to be
  named.

The filter half is the same rule at render time. `matcher` dims
non-matching stars rather than removing them
(`ConstellationField.tsx:44-45`, `:190-193`), and their links drop to 0.03
opacity rather than vanishing (`:171`). Removing them would change
`layoutTotal` and re-place every survivor on each keystroke; dimming keeps
the constellation's shape, which is the only thing making the field worth
looking at.

## Determinism across two engines, paid for live

`q3()` (`:84-86`) rounds every placed coordinate to three decimals, and its
comment (`:70-83`) is the whole second axis of determinism written from
experience: ECMAScript only requires `Math.cos`/`Math.sin` to be "within an
implementation-dependent approximation", so Node's V8 and the browser's V8
disagree in the last ULP; React serializes an SVG `cx` at full precision;
the public constellation was emitting `cx="9.306016393607791"` on the server
against `9.306016393607798` on the client and **failing hydration for the
whole tree**. A layout defect surfaced as a rendering framework error in a
component that does not know it is doing geometry.

The quantum is argued against the drawn size rather than picked: a
0.001-unit step in a 120-unit viewBox painted at a few hundred CSS pixels is
about 1/300th of a pixel, "far finer than the 1.1–3.4 unit star radii it
positions" (`:80-82`). That reasoning is what stops the rounding from
looking like sloppiness and being removed.

## The memo determinism pays for

Because placement is pure and quantized, `positionCache` (`:94`, read/write
at `:99-107`) can key on `(index, total, seed)` — "the ONLY inputs that move
a star". A live SSE frame rewrites a star's score and level but touches none
of the three, so a data frame recomputes zero trigonometry, and the cached
value is by construction what the math would have returned, so server and
client still agree. The comment bounds the keyspace explicitly ("MAX_STARS ×
repos × distinct totals seen"), which matters: the cache is module-level and
outlives every component, and `total` is in the key, so each arrival
generation is a fresh set of entries retained for the tab's lifetime.

## Where it stands against the standard

The ordinal slot is the live deviation. Arrivals are handled, but a
*reorder* or a *deletion* from the base list is not: both change every index
after the change point, and every affected star jumps on the next render.
Today the base list comes from one API pull in a stable order, so the case
is latent rather than broken — and the outer ring exists precisely because
the same defect in its arrival form was not latent. An identity-derived slot
(hash into the spiral rather than index into it) would retire both at once,
at the cost of an uneven field the phyllotaxis was chosen to avoid. The
trade is real; the fact that only one of its two failure modes is currently
defended is the finding.

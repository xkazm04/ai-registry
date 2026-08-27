---
layer: application
type: application
subject: generative-provider-routing
technique: refusal-reroute-hop
stack: node
status: forged
verified_on: 2026-08-27
verified_against: node@24
---

# Node — refusal re-route hop in a server-side imaging router

How the technique lands in `gravitone-gcloud`'s imaging layer: a Node/Next.js
server library (`lib/imaging/`) where every image call in the app enters one
chokepoint, `lib/imaging/router.ts`, and refusals walk a per-capability vendor
chain instead of retrying into a wall.

## The chain and the hop

The router's header comment states the operating fact the technique rests on
(`router.ts:12-15`): Google's image models refuse recognisable public figures
outright, and "the fix that works in practice is a cross-vendor re-route, not
a retry — so `reroutable` errors walk to the next CONFIGURED provider, and
everything else throws immediately." The walk itself is `run()`/`walk()`
(`router.ts:203-402`): each provider in `orderFor(cap, steer)` is tried at
most once; a thrown `ImagingError` is pushed onto `trail` as a
`{provider, why}` step whatever its kind, and only then does `reroutable`
decide whether the loop continues or the error is rethrown
(`router.ts:372-375`) — so a non-reroutable kind throws on the spot and still
leaves its record. The spend ceiling is checked once,
before any vendor is touched, and an `over-budget` throw "never reroutes"
(`router.ts:240-244`) — you cannot route around your own budget.

## Reading refusals off two very different wires

Each adapter maps its vendor's refusal spelling onto the single internal kind
`"refused"`:

- **Google (Interactions API)** — the safety-block shape is undocumented, so
  `assertUsable()` in `lib/imaging/providers/google.ts:112-143` reads
  `status` first and sniffs the error text second against
  `/safety|blocked|prohibited|policy|violat/i`. Crucially, a known bug class
  delivers a block as a *silently empty result*, so an empty image list is
  treated as a refusal rather than a success — "the safe direction: a
  refusal re-routes to another vendor, where a false success would hand the
  caller nothing" (`google.ts:118-121`, `docs/imaging.md:106-109`).
- **Leonardo** — surfaces its safety block as a terminal poll status rather
  than an error: `status === "NSFW"` maps to the same `"refused"` kind
  (`lib/imaging/providers/leonardo.ts:224-232`), so one layer up the two
  vendors are indistinguishable.

## The recovery move callers get

The caller-facing half is `ProviderSteer` (`lib/imaging/types.ts:55-73`):
after a refusal, a surface re-submits with `avoid: <refusing vendor>`. The
steer exists "for one measured reason": the project's style doctrine records
that a safety refusal is cleared by "a different model for one hop", not by a
better prompt. `orderFor()` (`router.ts:119-132`) gives `avoid` teeth —
removal that empties the chain throws `no-alternative` rather than serving
the avoided vendor, which in the single-vendor production plan means avoid
*always* fails honestly. `prefer` only reorders, and only when the named
vendor is planned and keyed.

## The constraint that outranks the hop

A refused style-locked generation must not "recover" onto a vendor that
ignores reference images. `generate()` attaches a constraint
(`router.ts:404-418`): requests carrying references only route to providers
with `supportsReferences: true` — declared `false` on the Leonardo adapter
because its v1 API silently drops references (`leonardo.ts:116-118`,
`types.ts:187-199`). The router comment names the stake: "an unconditioned
image in the wrong style is not a cheaper success, it is a failure that looks
like one." When the constraint empties the chain, the error message leads
with the constraint, not the vendor error (`router.ts:379-397`).

## What survives the hop

When a later vendor serves, the eliminations settle into the result:
`provenance.reroutedFrom` (`types.ts:160-163`) carries every dropped vendor
and why, and the settle log gets the same trail — so "why is this plate from
Leonardo?" stays answerable from the asset itself, months later.

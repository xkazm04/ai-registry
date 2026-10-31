---
layer: application
type: application
subject: generative-provider-routing
technique: refusal-reroute-hop
stack: node
status: forged
verified_on: 2026-10-31
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
(`router.ts:265-511`): each provider in `orderFor(cap, steer)` is tried at
most once; a thrown `ImagingError` is pushed onto `trail` as a
`{provider, why}` step whatever its kind, and only then does `reroutable`
decide whether the loop continues or the error is rethrown
(`router.ts:481-483`) — so a non-reroutable kind throws on the spot and still
leaves its record. The spend ceiling is checked once,
before any vendor is touched, and an `over-budget` throw "never reroutes"
(`router.ts:307-313`) — you cannot route around your own budget.

## Reading refusals off two very different wires

Each adapter maps its vendor's refusal spelling onto the single internal kind
`"refused"`:

- **Google (Interactions API)** — the safety-block shape is undocumented, so
  `assertUsable()` in `lib/imaging/providers/google.ts:112-147` reads
  `status` first and sniffs the error text second against
  `/safety|blocked|prohibited|policy|violat/i`. Crucially, a known bug class
  delivers a block as a *silently empty result*, so an empty image list is
  treated as a refusal rather than a success — "the safe direction: a
  refusal re-routes to another vendor, where a false success would hand the
  caller nothing" (`google.ts:118-121`, `docs/imaging.md:106-109`).
- **Leonardo** — surfaces its safety block as a terminal poll status rather
  than an error: `status === "NSFW"` maps to the same `"refused"` kind
  (`lib/imaging/providers/leonardo.ts:259-267`), so one layer up the two
  vendors are indistinguishable.

## The recovery move callers get

The caller-facing half is `ProviderSteer` (`lib/imaging/types.ts:55-73`):
after a refusal, a surface re-submits with `avoid: <refusing vendor>`. The
steer exists "for one measured reason": the project's style doctrine records
that a safety refusal is cleared by "a different model for one hop", not by a
better prompt. `orderFor()` (`router.ts:217-238`) gives `avoid` teeth —
removal that empties the chain throws `no-alternative` rather than serving
the avoided vendor, which in the single-vendor production plan means avoid
*always* fails honestly. `prefer` only reorders, and only when the named
vendor is planned and keyed.

## The constraint that outranks the hop

A refused style-locked generation must not "recover" onto a vendor that
ignores reference images. `generate()` attaches a constraint
(`router.ts:513-527`): requests carrying references only route to providers
with `supportsReferences: true` — declared `false` on the Leonardo adapter
because its v1 API silently drops references (`leonardo.ts:126-128`,
`types.ts:223-235`). The router comment names the stake: "an unconditioned
image in the wrong style is not a cheaper success, it is a failure that looks
like one." When the constraint empties the chain, the error message leads
with the constraint, not the vendor error (`router.ts:488-506`).

## What survives the hop

When a later vendor serves, the eliminations settle into the result:
`provenance.reroutedFrom` (`types.ts:192-195`) carries every dropped vendor
and why, and the settle log gets the same trail — so "why is this plate from
Leonardo?" stays answerable from the asset itself, months later.

Re-checked 2026-10-31 at gravitone-gcloud@fd09c06. The hop itself holds:
`refused`, `rate-limited` and `no-key` are still the only reroutable kinds
(`errors.ts:131-133`), and both adapters still map their safety spelling onto
`refused`. Two refinements landed since. A NAMED vendor stop now outranks the
safety sniff and the empty-result default in `assertUsable`
(`google.ts:123-129`, `classifyStop`): a recitation block becomes
`protected-material` and a suspended or unbilled account `account-blocked`,
both terminal, so neither hops — walking a recitation block down the chain
would launder what the block exists to stop (`errors.ts:33-43`). An empty
result with no named reason is still read as `refused`. And `prefer` is no
longer only a reorder: naming a prefer-only provider (`leonardo-studio`,
`leonardo-flare`, `comfy-flux2`) replaces the chain with that one entry
(`router.ts:143`, `:226`), so such a request fails with that provider's own
error instead of hopping onto a vendor billed in another currency.

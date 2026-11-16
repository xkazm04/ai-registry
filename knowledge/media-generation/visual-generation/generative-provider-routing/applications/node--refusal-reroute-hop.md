---
layer: application
type: application
subject: generative-provider-routing
technique: refusal-reroute-hop
stack: node
status: forged
verified_on: 2026-11-16
verified_against: node@24
applied: simulation
ab_verdict: better
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
(`router.ts:482-483`) — so a non-reroutable kind throws on the spot and still
leaves its record. The spend ceiling is checked once,
before any vendor is touched, and an `over-budget` throw "never reroutes"
(`router.ts:307-312`) — you cannot route around your own budget.

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
  caller nothing" (`google.ts:117-121`, `docs/imaging.md:106-109`).
- **Leonardo** — surfaces its safety block as a terminal poll status rather
  than an error: `status === "NSFW"` maps to the same `"refused"` kind
  (`lib/imaging/providers/leonardo.ts:259-266`), so one layer up the two
  vendors are indistinguishable.

## The recovery move callers get

The caller-facing half is `ProviderSteer` (`lib/imaging/types.ts:55-73`):
after a refusal, a surface re-submits with `avoid: <refusing vendor>`. The
steer exists "for one measured reason": the project's style doctrine records
that a safety refusal is cleared by "a different model for one hop", not by a
better prompt. `orderFor()` (`router.ts:217-243`) gives `avoid` teeth —
removal that empties the chain throws `no-alternative` rather than serving
the avoided vendor, which in the single-vendor production plan means avoid
*always* fails honestly. `prefer` only reorders, and only when the named
vendor is planned and keyed.

## The constraint that outranks the hop

A refused style-locked generation must not "recover" onto a vendor that
ignores reference images. `generate()` attaches a constraint
(`router.ts:513-524`): requests carrying references only route to providers
with `supportsReferences: true` — declared `false` on the Leonardo adapter
because its v1 API silently drops references (`leonardo.ts:126-128`,
`types.ts:225-233`). The router comment names the stake: "an unconditioned
image in the wrong style is not a cheaper success, it is a failure that looks
like one." When the constraint empties the chain, the error message leads
with the constraint, not the vendor error (`router.ts:489-508`).

## What survives the hop

When a later vendor serves, the eliminations settle into the result:
`provenance.reroutedFrom` (`types.ts:190-193`) carries every dropped vendor
and why, and the settle log gets the same trail — so "why is this plate from
Leonardo?" stays answerable from the asset itself, months later.

## Re-read 2026-11-16 at `fc26e172`: what the tree now refuses to re-route

Every anchor above was re-resolved at `fc26e172` (2026-11-16). The router grew
from 424 to 541 lines between 2026-08-27 and 2026-11-08 (budget holds, named-only
providers), so every router citation moved. The adapters' refusal readings did
not change. Three later decisions in the tree go past what this document said on
2026-08-27, and two of them refute the technique as it then stood.

- **Timeout and vendor failure do not walk the chain.** `reroutable` is
  `refused | rate-limited | no-key` and nothing else (`errors.ts:111-113`). The
  comment above it (`errors.ts:88-110`) records why `failed` and `bad-response`
  were weighed and kept out. A 5xx on a vendor work request is presumed billed, so
  handing it to a second vendor bills twice for a request nobody declined. The
  chain exists to cross a policy edge, not an outage. And in dev the only
  generate fallback reads no references, so an outage re-route returns a
  wrong-style image. `presumedBilled` (`errors.ts:157-172`) books `timeout` as
  billed because "the vendor very likely finished and will invoice it", and
  books `failed` only when `dispatched` says the vendor was reached
  (`errors.ts:63-77`). The 2026-08 technique listed timeout and vendor failure
  as plain re-routes. It was amended on 2026-11-16.
- **A short batch is a partial refusal.** A Google N-candidate request is N
  parallel calls. Since `35ed3fb7` (2026-10-25) one refused call no longer
  throws the batch away. `Promise.allSettled` keeps the images that arrived, a
  completed call with no image counts as refused, and the result carries
  `provenance.shortBatch` `{asked, returned, refused, failed}`
  (`google.ts:318-353`, `types.ts:194-197`). The commit's own before-measure:
  "count 3, call 2 refused -> the request throws, 0 images returned, 2 billed
  images discarded, router reroutes". Probe case 17
  (`tests/golden-path/imaging-billed-attempts.probe.spec.ts:371,378`) pins both
  the refused and the failed shapes, and 17b (:387-391) pins that a full batch
  carries no field. An all-refused batch still throws `refused` and re-routes.
- **A refusal is billed here and re-reserves before the next vendor.** The
  tree books `refused` as billed because its adapters raise it from a 200 body
  (`errors.ts:138-140`), and the walk takes a fresh budget hold before calling
  the next vendor (`router.ts:374-397`, `72dc6caa`, 2026-10-07). That is this
  vendor's behaviour, not a rule. One image vendor documents that blocked
  images are not charged (sources below), which is why the amended technique
  makes refusal billing a ledger fact.

Not changed: refusal is still "deterministic — the same prompt refuses again"
(`errors.ts:79-83`), and nothing retries it against the same vendor.

## Sources for the 2026-11-16 amendment (accessed 2026-11-16)

- https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/responsible-ai-imagen:
  "Any filtered image objects are omitted from the `"predictions": []` array",
  with a 4-asked / 2-returned example, and "You will not be charged for blocked images."
- https://replicate.com/docs/topics/predictions/lifecycle.md: a prediction
  cancelled after starting: "You pay for the time the prediction ran before it
  was canceled."
- https://developers.openai.com/api/docs/guides/image-generation: the
  `moderation` parameter (`auto` default, `low`); blocked requests return
  `moderation_blocked` with `moderation_details.moderation_stage`
  (`input` / `output` / `unknown`); "Don't automatically retry these errors
  without modifying the prompt or input images." The page does not say whether a
  blocked request is billed.

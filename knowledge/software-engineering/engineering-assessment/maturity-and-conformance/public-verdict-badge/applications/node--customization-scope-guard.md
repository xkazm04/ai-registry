---
layer: application
type: application
subject: public-verdict-badge
technique: customization-scope-guard
stack: node
status: forged
verified_on: 2026-08-20
---

# Scoping customization on a public badge renderer

`src/lib/badge-svg.ts` is Ascent's single badge renderer, imported by both
public endpoints so neither can fork a near-copy. It is where the open/closed
split is enforced, and the enforcement is a code property rather than a
documented convention.

## The colour rule, stated at the parser

`badge-svg.ts:40-47`, the scope note above `resolveColor`:

> `?color=` is shields.io-parity for the NEUTRAL states only (unknown /
> private / rate limited — no verdict to misrepresent). It deliberately does
> NOT apply to a VERDICT fill (gate pass/fail, a resolved level/score): hue is
> the most-glanced channel on a README, and letting an embedder render "✗
> fail" on bright green (or an L1 repo in L5 green) would undo every other
> honesty guard this route carries.

The guard is realized by *where the function is called*, which is the durable
form. Every neutral response passes the caller's colour through
(`route.ts:159`, `:166`, `:215`, and the throttle at `:198`); every verdict
response passes a semantic constant instead — `gate.pass ? LEVEL_HEX.L5 :
LEVEL_HEX.L1` at `route.ts:264`, and `LEVEL_HEX[report.level.id]` at `:279`.
The one place the two meet is `route.ts:280`:

```ts
const color = levelHex ?? resolveColor(customColor, neutral);
```

An *unrecognized* level id has no verdict hue to protect, so it degrades to
the neutral treatment. That is the exception that proves the rule rather than
a hole in it.

## Colour is never the only channel

The complement to closing the fill is opening a second channel. `route.ts:262`
renders the gate verdict as `"✓ pass"` / `"✗ fail"` with the note that
red/green collapses for colour-vision-deficient viewers, and `:296` prepends
the level glyph `○◔◑◕●` so a level is not signalled by hue alone — the same
non-colour redundancy `src/lib/ui.ts` mandates everywhere a level colour
appears in the app.

Contrast is likewise computed rather than assumed: `readableOn`
(`badge-svg.ts:22-37`) picks white or near-black ink by WCAG luminance against
whatever fill was resolved, routed through the canonical primitives in
`src/lib/ui.ts` instead of re-deriving the channel linearization.

## Caps and sanitization on the way in

`route.ts:56-62` treats every caller string as a response-amplification lever
first and a feature second:

- `MAX_LABEL_LEN = 80`, `MAX_LOGO_LEN = 4096` — the SVG width and response
  size scale with both, on an unauthenticated endpoint.
- `RASTER_LOGO_RE = /^data:image\/(png|jpe?g|gif|webp)[;,]/i` — inline data
  URIs only, so the renderer never fetches a remote host, and **raster types
  only**, with the reason stated: a nested `image/svg+xml` is scriptable, and
  a directly-loaded badge is served from the app's own origin, so accepting
  one is stored XSS under your domain on every page that embeds the badge.
- `parseStyle` (`badge-svg.ts:18`) is a positive allowlist over `BADGE_STYLES`
  falling back to `flat`; `esc` (`:13`) escapes every interpolated string.

## Meaning parameters tighten, never weaken

The gate badge takes a bar from query params, which makes it meaning-bearing
and therefore governed. `route.ts:244-258`:

```ts
const orgPolicy = await getOrgGatePolicy(ownerN).catch(() => null);
const policy = orgPolicy
  ? tightenGatePolicy(orgPolicy, explicitPolicyFromParams(searchParams))
  : policyFromParams(searchParams, report.archetype);
```

The comment records why this landed: the badge was the one of four gate
surfaces that never read the org's persisted policy, so a badge could render a
confident "✓ pass" while `/api/gate` failed the same repo against the org's
tightened bar — the artifact advertising a bar the org had raised. The
tighten-only overlay closes the matching abuse: without it, any embedder mints
a green badge with `?min_dimension=1`.

## Refusal as a customization boundary

Two refusals sit beside the styling guards and belong to the same discipline —
what the endpoint will not let a caller obtain:

- `route.ts:204-206` scans with `noAmbientToken: true`, so the public endpoint
  is structurally incapable of ingesting a private repo with the operator's
  credentials; `:210-215` additionally gates on the *resolved* report's
  `isPrivate`, because the shared cache may hold a report left by an
  authenticated scan.
- `src/app/api/scorecard/[owner]/badge/route.ts:1-12` is the strongest
  statement of the principle: read-only (never triggers a scan), public-corpus
  only with per-row private exclusion, and — under the heading "PROVENANCE IS
  A REFUSAL, NOT A SUFFIX" — an org average over previews renders the neutral
  `"preview only"` state (`:73`) rather than a qualified number, because an
  average over previews is not a preview of anything.

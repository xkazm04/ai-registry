---
layer: application
type: application
subject: giveaway-legal-guardrails
technique: platform-non-sponsorship-disclaimer
stack: typescript
status: forged
verified_on: 2026-11-02
verified_against: typescript@6.0.3
---

# The platform disclaimer in a streamer tool's draw renderer (CastleControl)

CastleControl is a desktop tool a human streamer runs beside a Twitch stream; its prize draws
are rendered on stream by a TypeScript renderer package and, for the browser-source overlay, by
an HTML page the Rust core serves. Citations were resolved against the main checkout on
2026-11-02; the root `package.json:26` pins `"typescript": "6.0.3"`. Product behaviour, not
legal advice: the project's checklist keeps the lawyer review open,
`docs/submission/checklist.md:86` "Lawyer review of official-rules template and giveaway
guardrails | pending-owner".

## Confirmed

**A precondition of the render.** `packages/renderer/src/draw/scenes.ts:14-15` refuses to build
a prize scene without the disclaimer: "if (options.content === 'prize' && options.disclaimer
!== true)" then "throw new Error('Prize draw scenes require the Twitch disclaimer')". The host
always passes it for prize content — `packages/renderer/src/draw/host.ts:53` "disclaimer:
content === 'prize'" — so the throw guards against a future caller, not the current one.

**Outside every animation.** The layer's contract is stated at
`packages/renderer/src/draw/disclaimer.ts:6` "Persistent foreground text, outside every
artwork animation." In the painter, motions are applied only to the artwork group, and the
disclaimer becomes a static `footer` on the plate:
`packages/renderer/src/draw/paint.ts:49` "doc.createElement(layer.kind === 'disclaimer' ?
'footer' : 'header')". The footer text also carries the draw's provenance label (`packages/renderer/src/draw/paint.ts:51`
"`${layer.text} · ${layer.cast_label}`"), so the frame that gets clipped names both who does not
run the giveaway and what kind of randomness drew it.

**Prize-only.** Both surfaces add the disclaimer only to prize draws:
`crates/cc-core/src/overlay/lots_page.rs:110-111` "if scene.content == DrawContent::Prize" then
"<footer>Twitch does not sponsor this promotion</footer>". A question or seat draw carries no
giveaway disclaimer, matching the standard's "when not to use it".

**A missing disclaimer blocks the draw upstream.** The policy refuses a prize draw whose
disclaimer is off (`crates/cc-lots/src/policy.rs:114` "(!policy.twitch_disclaimer,
PolicyReason::MissingDisclaimer)"), and the guided setup asks for it with
`apps/desktop/src/rooms/lottery/flow-steps.ts:113` "label: 'Twitch disclaimer'".

## Deviations (the standard stays)

1. **Three copies of the sentence, two wordings.** The renderer constant
   (`packages/renderer/src/draw/disclaimer.ts:4` "Twitch does not sponsor this promotion") and the overlay page
   (`crates/cc-core/src/overlay/lots_page.rs:111`) are typed separately, and the desktop copy says more:
   `apps/desktop/src/lots-copy.ts:24` "Twitch does not sponsor or administer this promotion."
   The standard asks for one source every surface reads, and for the fuller wording.
2. **The responsible party is not named.** None of the three says the streamer runs the
   giveaway and is responsible for the prize; the standard's sentence names all three roles.
3. **The rules text is a sample.** `apps/desktop/src/lots-copy.ts:25` "Simulated rules template attached: free
   !join, equal odds, eligibility, prize and closing time. Review before live use." The
   disclaimer's "full rules one step away" depends on a template that is honestly labelled
   unreviewed; it is a gap the checklist row above already owns.
4. **Overlay legibility is unmeasured here.** Nothing in the cited code places the footer on a
   backing plate or checks it against the platform player's own controls at common sizes; the
   claim stays unverified, not passed.

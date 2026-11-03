---
layer: application
type: application
subject: streamer-dress-rehearsal
technique: through-the-broadcast-path
stack: typescript
status: forged
verified_on: 2026-11-03
verified_against: typescript@6
applied: simulation
ab_verdict: better
---

# A rehearsal walked through a real OBS by a TypeScript night lane, and what its captures cannot see

Castle Control (origin/main at `0b1c6b7`, read 2026-11-03; TypeScript 6.0.3 per the root
`package.json`) is a Tauri desktop for a human Twitch streamer. Its dress rehearsal runs
the real native core with generated SIMULATED chat and no Twitch session. The Rust side
of that composition is recorded in the subject's two `rust--` applications. This one
follows the TypeScript night lane, a Playwright suite that drives the rehearsal the way a
streamer does, against an isolated OBS launched beside the owner's own. The lane is the
technique's procedure written as a test, so it shows where the evidence is actually
read. Every file cited below is byte-identical between `8ef2d8e` and `0b1c6b7`, except
`scripts/night/obs.mjs`.

## One flow, two lanes, driven from the input end

The same flow serves a fake OBS peer and the real isolated OBS:

- `e2e/night/rehearsal-flow.ts:1` "Generated SIMULATED scenarios only. Shared by the fake-peer and isolated OBS lanes."
- `e2e/night/obs.spec.ts:13` "OBS lane. Run only by scripts/night/obs.mjs, which launches a separate,"
- `e2e/night/obs.spec.ts:54` "port === 4455"

The vote, draw and duel scenarios are buttons on the rehearsal page. Each calls one core
method, and the core writes the lines through the private generated-chat door, so these
three enter where a live message enters:

- `apps/desktop/src/rehearsal/rehearsal.tsx:89` "model.scenario('lots_fill')"
- `apps/desktop/src/rehearsal/rehearsal.tsx:90` "model.scenario('vote_round')"

The scene is identified by what OBS reports, not by what the tool asked for. The lane
lists the rehearsal scene's items over its own websocket and compares the names, and it
checks that the lot input in OBS carries the exact URL the browser checked:

- `e2e/night/rehearsal-flow.ts:12` "export const rehearsalSourceNames"
- `e2e/night/obs.spec.ts:76` "OBS Lot input must use the exact sealed/cast page verified in the browser"

The capture waits for the paint. A newly created scene is not on Program, and the lane
records why a single screenshot is not enough:

- `e2e/night/obs-capture.ts:31` "Keep CEF continuously visible while it loads/paints, then restore before cleanup."
- `e2e/night/obs-capture.ts:32` "GetSourceScreenshot alone only increments showing for a single render call:"
- `e2e/night/obs-capture.ts:23` "return state.videoActive && state.videoShowing;"

That comment was checked against the vendor source, not taken from the tree. obs-websocket
5.7.6 `src/requesthandler/RequestHandler_Sources.cpp` wraps the render in
`obs_source_inc_showing` and `obs_source_dec_showing` around one `obs_source_video_render`
(lines 80-82). obs-browser (master `d4db73e`, read 2026-11-03) maps the source's show and
hide callbacks to `SetShowing` (`obs-browser-plugin.cpp` lines 504-508). A hidden source
gets `WasHidden(true)`, and without hardware acceleration its texture is destroyed
(`obs-browser-source.cpp` lines 52-64, 373-418). The same request accepts a scene as well
as an input (`RequestHandler_Sources.cpp` line 182), and the protocol defines
`videoShowing` as showing in Preview, a projector or Properties (line 122). So a preview
or a projector would paint the scene too, and Program is not required.

## Where the evidence is read

The SIMULATED badge and the overlay content are asserted in a Playwright browser tab
opened on each overlay URL, not in OBS:

- `e2e/night/rehearsal-flow.ts:270` "await overlay.goto(output.url);"
- `e2e/night/rehearsal-flow.ts:274` "await expect(badge).toHaveText('SIMULATED');"
- `e2e/night/rehearsal-flow.ts:280` "The callback receives the exact URL whose cast and visible SIMULATED badge"

OBS is then asked for one screenshot per source, and each must clear a non-blank floor:

- `e2e/night/obs.spec.ts:81` "for (const name of rehearsalSourceNames) {"
- `e2e/night/obs.spec.ts:104` "obs.request('GetSourceScreenshot', { sourceName: source, imageFormat: 'bmp', imageWidth: 480 });"
- `e2e/night/obs.spec.ts:83` "rendered nothing in isolated OBS"

Placement is left to the streamer's eye, in the product's own status line:

- `e2e/night/rehearsal-flow.ts:232` "Added to the rehearsal scene. Inspect its placement in OBS."

**Deviation: the composition is never captured.** A source screenshot renders the source
alone, outside the scene's transform and stacking order. It proves each of the four pages
painted in OBS's browser. The badge was proved in a different browser, and the bridge
between the two is URL equality, which the lane checks for the lot plate only. Nothing
reads the picture the four sources make together, and that picture is crowded. The lane
runs a 1280x720 canvas and adds all four sources at 720p, a full-canvas page each, with no
transform:

- `scripts/night/obs.mjs:115` "'BaseCX=1280', 'BaseCY=720'"
- `e2e/night/rehearsal-flow.ts:241` "toHaveValue('720p');"

The Beacons page and the duel page default to the centre, and the Beacons badge moves to
the bottom-right corner when its art is centred:

- `apps/overlay/README.md:71` "or `center` (case sensitive)"
- `crates/cc-core/src/overlay/tiltyard.rs:96` "place-items:center;"
- `apps/overlay/README.md:88` "for `center` it uses bottom-right"

The vote bar also defaults to the centre and the lot plate to bottom-right. Both defaults
are cited in the overlay-composition subject's `typescript--placement-declared-at-provisioning`
application, which also records the owner's filming on 2026-11-02 showing every overlay
at once as an unreadable pile.

## The beacon test fire is a preview on the rehearsal surface

The fourth scenario button looks like the other three and is not one of them:

- `apps/desktop/src/rehearsal/rehearsal.tsx:99` "model.scenario('beacon_fire')"
- `crates/cc-core/src/rehearsal/scenarios.rs:28` "let request = RpcRequest::Simulate(BeaconsSimulateParams {"
- `apps/desktop/README.md:419` "path with a generated 100-bit burst"
- `apps/desktop/README.md:406` "clears Beacon test-fire previews."

The simulate path selects the burst's own kind of contribution and ignores the visual's
configured input:

- `crates/cc-core/src/beacons/mod.rs:181` "Each preview starts empty, selecting only this burst's native"
- `crates/cc-beacons/src/intensity.rs:139` "No clock, Twitch identities, live ledger, dedupe keys or live engine mutation."

A live contribution goes through routing, which skips a visual with no input and lights a
visual only when its configured source matches:

- `crates/cc-core/src/beacons/routing.rs:56` ".filter(|visual| visual.input.is_some())"
- `crates/cc-core/src/beacons/routing.rs:60` "let selected = visual.input.as_ref().is_some_and(|input| {"

Every visual is offered to the test fire, whatever its input:

- `apps/desktop/src/rehearsal/rehearsal-model.ts:71` "...visuals.map(visual =>"

**Deviation:** the burst reaches the real overlay through the native push, so this is not
the dark-overlay trap. It enters below the routing, though, so a visual configured for
subscriptions, or with no input at all, lights on the rehearsal picture and stays dark
live. The product calls the path a test-fire preview, and the technique asks for a
preview to be labelled as one and kept off the rehearsal surface.

## Applied (simulation, 2026-11-03)

Two rules of the technique gained conditions in this pass. Both are graded here on real
configurations of this tree. Neither changes the tree.

**Capture the scene, not each source.** A = the lane as written: a per-source screenshot
over the non-blank floor, plus a per-page badge check. B = one screenshot of the
rehearsal scene while it is showing, read against each overlay's region. The three cases
are the composed rehearsal scene's real overlaps:

| case | A | B |
| --- | --- | --- |
| vote bar and duel, both centred | pass | overlap flagged |
| Beacons art, centred over the same centre | pass | overlap flagged |
| Beacons badge (bottom-right) over the lot plate (bottom-right) | pass | overlap flagged |

A passes all 3 and B flags all 3. The owner's filming record of the all-overlays shot
agrees with B. The third case is inferred from the anchor rules and was not seen in a
capture. Falsifier: one scene screenshot from the night OBS lane in which the four pages'
artwork does not overlap.

**Route, not core.** A = the old rule (a step that runs in the core is a rehearsal step).
B = the new rule (a step must take the live intake and the live routing). The cases are
the visual inputs the type allows:

| visual input | live, cheer burst | rehearsal fire | A says | B says |
| --- | --- | --- | --- | --- |
| Cheer | lights | lights | rehearsed (right) | preview (not observed) |
| Subscribe | dark | lights | rehearsed (wrong) | preview (right) |
| none | never lights | lights | rehearsed (wrong) | preview (right) |

**A is wrong on 2 of 3. B is wrong on 0 and leaves 1 unobserved.** Falsifier: a live
routing path that selects a visual by the burst's kind, or a rehearsal fire that is
refused for a visual whose input does not match.

Return condition for a `code` row: when the rehearsal sources gain per-kind placement
(the overlay-composition deviation), the night lane can add a scene capture with a region
check. The beacon scenario can then enter as a generated contribution through routing.

# Subject proposal: `immersive-interaction`

**Status:** proposed, 2026-10-07. This is a forge input, not knowledge. Nothing under
`knowledge/` changes with this file. The placement is **decided**: B, on 2026-10-07, by the
owner. See [Decided](#decided).
**Bundle:** `game-production`
**Category:** `couch-and-tv-play`, with rings `couch-and-tv` and `immersive-interaction`.
The plan's "one appended category" no longer fits under the cap;
see [The placement decision](#the-placement-decision).
**Raised by:** step W0 of the harvest plan in the mage-arena-vr plan, section 9 (9.1 to 9.3),
written in the game repo. Filed late: W0 was due 3-4 October.
**Engine:** `/forge` joining an existing bundle, under [`harvest-brief.md`](harvest-brief.md).
The file shapes and hard rules are in [`forge-brief.md`](forge-brief.md).
**Reconciled against:** registry `main` at `29da5a64`. No earlier proposal exists: `docs/`
holds six `subject-proposal-*.md` files and none covers VR, XR, headsets, hand tracking or
immersive interaction. No subject in any bundle covers them either (measured below). This
is a new proposal, not an extension of one.

---

## The gap, measured

`game-production` carries **78 subjects in 10 categories** and none of them owns play
through a head-worn display with tracked hands. Measured on 2026-10-07, on `main` at
`29da5a64`, over the 796 tracked files under `knowledge/game-production`:

```sh
git grep -n -i -w -E -e 'VR|XR|virtual reality|mixed reality|augmented reality|headsets?|head-mounted|HMDs?|hand[- ]track(ing|ed)|tracked hands?|immersive|cybersickness|motion sickness|simulator sickness|vection|stereoscopic|6DoF|six degrees of freedom|passthrough|interpupillary|reprojection|foveated|snap[- ]turn' main -- knowledge/game-production | wc -l
```

**Result: 0.**

A zero from a grep proves nothing unless the same command can return a non-zero, so the
same command was run with two positive controls:

| Same command, other path | Lines | What matched |
|---|---|---|
| `memory/semantic` | 8 | the registry's `mage-arena` memory namespace, which is about this game |
| `knowledge/civic-intelligence` | 20 | "ARES VR", the Czech public company register: a false positive, but it proves the word-bounded `VR` alternative fires |

Across the whole of `knowledge/` the command returns 84 lines, and none of them is about
immersive play:
- 60 are `passthrough` in the software sense (token and stream pass-through), in `software-engineering`, `llm-observability` and `media-generation`.
- 20 are "ARES VR" in `civic-intelligence`.
- 4 are Czech words in `localization` and `marketing`, where `vr` precedes an accented letter that the word-boundary test treats as a non-word character.

**The looser probe.** The same terms as case-insensitive substrings without `-w` give a few hits in game-production. All of them were read, and none is immersive:
- `VR` 2: "VRAM", and "chevrons".
- `XR` 4: inside "maxResumes", "maxRaceSeconds", "maxRepairPrizeShare" and a CSV quote.
- `room-scale` 3: the room-scale difficulty-cliff rule of level planning.
- `multiview` 1: a reference-image role.
- `vignette` 1: an image background.
- `field of view` 1, `peripheral` 2, `teleport` 6, `seated` 6: sightline legibility, a television subtitle, scripted teleports, and phones seated in a lobby.

**Terms kept out of the strict pattern.** `comfort` (61 lines), `gesture` (25), `locomotion` (28) and `thermal` (17) are ordinary game vocabulary, so they would drown the signal. Their hits did locate the partial overlaps listed per subject below. Most of those sit in `couch-and-tv-play`, a category that did not exist when the plan was written.

## The placement decision

### What the owner decided, and what changed underneath it

On 2026-10-02 the owner decided to extend `game-production` with **one added category**
(the plan names it `immersive-interaction`) rather than found a new domain. The reason
holds and is not reopened here. Every category in the bundle shares one `game` purity
denylist. Immersive subjects would ban that same vocabulary plus headset vendors, so the
split test in [`knowledge/README.md`](../knowledge/README.md) is not met.

The plan counted the new category as **slot 8 of 10**. That count was taken against a
registry state equal to commit `23006e87` (7 categories, 54 subjects). Three categories
were appended after it:
- `racing-vehicles` and `couch-and-tv-play`, merged on 2026-10-04 from a racing and TV-games forge;
- `narrative-and-dialogue`, merged on 2026-10-04.

[`taxonomy.json`](../knowledge/game-production/taxonomy.json) now holds **10 categories**:
1. `systems-canon`
2. `balance-validation`
3. `content-pipeline`
4. `asset-production`
5. `engine-integration`
6. `craft-judgment`
7. `production-governance`
8. `racing-vehicles`
9. `couch-and-tv-play`
10. `narrative-and-dialogue`

**The constraint.** `knowledge/README.md` says no level holds more than ten folders, and
[`rkb-profile.md`](rkb-profile.md) §2.1 says the same of every directory under
`knowledge/`. The bundle root of `game-production` holds exactly ten category folders.

This is enforced, not only written down. `scripts/lib/taxonomy.mjs` sets
`MAX_CHILD_DIRS = 10`, and `loadTaxonomy` fails any taxonomy whose `categories` array is
longer ("categories exceeds the cap of 10 - a level with more than ten children is the
thing this taxonomy exists to prevent"). An eleventh category turns
`node scripts/gate.mjs --lane knowledge` red. The README's remedy for a full level is to
grow a ring beneath it. For subjects that ring is subcategories. For categories there is
no ring: the `rkb-taxonomy/1` schema has categories, then subcategories, then subjects,
and nothing above categories.

### The alternatives

| | Option | Meets | Breaks or costs |
|---|---|---|---|
| A | **An eleventh category** `immersive-interaction` | The owner's decision as worded. The seam is visible as its own folder. | The cap: a hard gate failure today. The cap rule would then require one of two changes. (a) A new grouping level above categories: a schema change in `scripts/lib/taxonomy.mjs`, `apply-taxonomy.mjs` and the generators, plus a move of all 78 subjects one level deeper, rewriting every relative link in the bundle. (b) Raising or exempting the cap at the category level: a change to a registry-wide browsing rule that README and the profile state as absolute, made for one bundle. `software-engineering` also sits at 10 categories, so either change binds it too. |
| B | **A subcategory ring inside an existing category.** The host is `couch-and-tv-play` (6 subjects). Adding N1-N6 makes 12, which is over ten, so the README requires a ring: one subcategory for the existing six, one `immersive-interaction` for the new six. | The cap: still 10 categories, 2 subcategories of 6. The doctrine: a ring only above ten. The seam stays visible as a subcategory id on disk and in `index.json`. No schema or gate change. | One scripted move of six forged subjects one level deeper, through `scripts/apply-taxonomy.mjs`. The category's title, "Couch and TV play", no longer describes what it holds and needs a new title. The id `couch-and-tv-play` stays in every path, so a reader browsing folders for VR has to look inside a folder named for couches. The six moved subjects came from another project's forge. |
| C | **Spread the subjects across existing categories** by nearest neighbour: N1, N3 and N4 to `balance-validation` (6 to 9); N2 to `systems-canon` (6 to 7); N5 to `asset-production/surface-and-imagery` (4 to 5); N6 to `engine-integration` (8 to 9, and 10 with N7) | Every cap. No moves, no retitles, no doctrine change. The cheapest option. | The owner's intent of one home. The README's reason for categories ("make the eventual split boundary visible before it is paid for") is lost: the immersive seam scatters over four categories. `engine-integration` lands exactly at the cap, so its next subject forces a ring. The vendor-name denylist extension would protect subjects a reader cannot find as a set. |
| D | **A separate bundle** under the split test | Nothing the split test asks for. | Both arms of the split test fail. (1) Denylist: the immersive subjects need the `game` list (engine, content-tool and model product names) plus headset vendors. That is a superset, not a different list. (2) Misled consumer: the one consumer, the mage-arena-vr game, needs the combat, balance and engine-integration subjects and would be misled by none of them. Cross-bundle links are forbidden, so N2's link to `realtime-combat-semantics`, N4's to `spatial-audio-scene-authoring`, N5's to `perf-regression-gating` and N6's to `runtime-observation-evidence` would become prose only. The bundle would also need a `_laws.md`, which a harvest may not mint. It contradicts the owner's ruling of 2026-10-02. |

Folding an existing category to free a slot was also considered and rejected. Categories
are append-only, and the fold would move subjects that belong to other projects for no
gain over B.

### Recommendation (now decided: see Decided)

**Recommended: B**, a ring `immersive-interaction` inside `couch-and-tv-play`, with the
category retitled to cover both rings. Five reasons:

1. **It is gate-legal today.** The gate needs no change and neither does the doctrine. Of the three gate-legal options it is the only one that keeps a visible home.
2. **The host already owns the nearest ground.** `couch-and-tv-play` is the category for play away from the desk. Three of its subjects already cover part of the new scopes (detail under each subject below):
   - `controller-latency-instrumentation` owns input-to-photon measurement (N2);
   - `on-device-verification-harness` owns "an emulated input is not a hand", and records thermal start state (N5, N6);
   - `two-thumb-touch-layout-design` owns "comfort is a guess until measured on the physical device" (N3).

   Putting N2, N3, N5 and N6 beside those subjects makes the boundary paragraphs short and true.
3. **The cost is bounded and scripted.** One `apply-taxonomy.mjs` move of six subjects and one title change.
4. **It is reversible.** If a future cap change ever allows an eleventh category, promoting the ring is one more scripted move. Option A pays the corpus-wide cost first and asks later.
5. **N7-N9 are unaffected.** They land in `engine-integration` (8 to 9), `production-governance` (6 to 7) and `craft-judgment` (6 to 7) under every option.

**The case against B is real.** The path reads oddly, and it touches subjects this project did not write. If the owner will not accept the retitle and the move, **C** is the fallback. **A** is not recommended: it spends a registry-wide rule change on one category. **D** is not recommended: it fails the split test the owner already applied.

**The decision is on the critical path.** The plan's D1 step (11 October) lands N1 and N2
Phase-1 drafts. A draft needs a folder, and `taxonomy.json` assigns it. The choice is
needed before then.

### Decided

On 2026-10-07 the owner chose **B**. Record: "Operator, 2026-10-07 morning: chose B (ring
inside couch-and-tv-play)."

**The names.**
- The category id `couch-and-tv-play` stays. It is retitled "Couch, TV and immersive play".
- Its six existing subjects move into a ring `couch-and-tv`: `controller-latency-instrumentation`, `fire-tv-device-realities`, `lan-pairing-and-session-continuity`, `on-device-verification-harness`, `phone-controller-input-protocol` and `two-thumb-touch-layout-design`.
- N1-N6 go into a ring `immersive-interaction`.

**The alternatives that lost.**
- A, an eleventh category: it needs a cap change or a new grouping level, and either one also binds `software-engineering`.
- C, spreading the subjects: the immersive seam has no visible home.
- D, a separate bundle: it fails the split test.

**The constraint found while carrying it out.** `scripts/lib/taxonomy.mjs` (lines 175-177)
rejects an empty subcategory. So the `immersive-interaction` ring cannot be declared before
its first subject exists. The retitle, the `apply-taxonomy.mjs` move of the six subjects
into `couch-and-tv` and the `immersive-interaction` ring therefore land in **one** forge,
together with the first immersive subject (the N1 and N2 D1 drafts), never before. The
move touches subjects another project is still forging, so it is made only once.

## Proposed subjects

Slugs and technique names are proposals; the forger owns final naming. Status starts
`draft`. Scopes and technique names carry no product, engine, headset or vendor names.
Those appear only under [Provenance](#provenance-and-vendor-vocabulary). Each draft
`use_when` has three phrases, the shape `index.json` carries.

**Neighbour check, against today's `index.json`.** The plan named its neighbours when the bundle had 54 subjects; it has 78 now. Every slug the plan names was looked up in the owning bundle's `index.json` on `main` at `29da5a64`.

**Passed (33 of 33):**
- `game-production`: `realtime-combat-semantics`, `encounter-balance-simulation`, `combat-pacing-and-dramatic-arc`, `learning-curve-and-teaching-design`, `difficulty-design-and-adaptation`, `perf-regression-gating`, `ship-pipeline-gating`, `runtime-observation-evidence`, `engine-integration-safety`, `engine-pitfall-corpus`, `unattended-build-loop`, `playtest-signal-to-defect`, `spatial-audio-scene-authoring`, `asset-class-poly-budgeting`, `shader-budget-authoring`, `generative-artifact-gating`, `design-canon-as-executable-law`, `production-coverage-measurement`, `production-work-prioritization`, `arpg-systems-canon`, `game-economy-tuning`, `ability-authoring-to-engine`, `production-prompt-architecture`, `judgeable-spec-authoring`.
- `software-engineering`: `test-harness`, `codegen`, `packaging`, `release-pipeline`.
- `media-generation`: `sound-effect-generation`, `generated-music-acceptance`.
- `agent-operations`: `model-and-effort-selection`, `agent-run-budgeting`, `deterministic-run-verification`. All three are still status `draft` there.

**Failed: none.** No slug had to be dropped or corrected. Two category counts in the plan also still hold: N7 would be the 9th subject of `engine-integration`, and N8 and N9 the 7th of their categories.

**Proposed slugs: no collision.** None of the nine proposed subject slugs exists in any bundle.

**Neighbours added here, also verified to exist.** The plan did not name these: `agent-behaviour-authoring`, `procedural-level-planning`, `reference-parity-gating`, and seven of the 24 subjects added since the plan: `controller-latency-instrumentation`, `phone-controller-input-protocol`, `lan-pairing-and-session-continuity`, `two-thumb-touch-layout-design`, `on-device-verification-harness`, `fire-tv-device-realities` and `short-form-cards-and-barks`.

**Already covered, do not duplicate (from 9.2; cite and extend instead).** Every slug in this list passed the check above: `realtime-combat-semantics`, `encounter-balance-simulation`, `combat-pacing-and-dramatic-arc`, `learning-curve-and-teaching-design`, `difficulty-design-and-adaptation`, `perf-regression-gating`, `ship-pipeline-gating`, `runtime-observation-evidence`, `engine-integration-safety`, `engine-pitfall-corpus`, `unattended-build-loop`, `playtest-signal-to-defect`, `spatial-audio-scene-authoring`, `asset-class-poly-budgeting`, `shader-budget-authoring`, `generative-artifact-gating`, `design-canon-as-executable-law`, `production-coverage-measurement`; plus `software-engineering`'s `test-harness`, `codegen`, `packaging` and `release-pipeline`, and `media-generation`'s `sound-effect-generation` and `generated-music-acceptance`. Cross-bundle names are prose only in a golden path; the profile forbids the link.

### N1 `drawn-gesture-command-recognition` (NEW)

**Home:** the new home (B: `couch-and-tv-play/immersive-interaction`; under C, `balance-validation`).
**Scope:** drawn and posed hand gestures as game commands: cutting strokes out of
continuous tracking, projecting them to a plane, recognising them against templates with
an explicit reject class, and accepting a vocabulary only on held-out, cross-user numbers
for accuracy and latency.

| Proposed technique | Draft `use_when` |
|---|---|
| `pen-down-stroke-segmentation` | a continuously tracked hand must be cut into discrete drawn strokes; a recognizer fires on the hand's return path; deciding what starts and ends a drawn command |
| `stroke-plane-projection` | an air-drawn stroke is compared with flat templates; the same shape reads differently when drawn at an angle; accuracy depends on which way the player faces |
| `reject-class-recognition` | choosing a recognizer for a small command vocabulary; a stray motion triggers a command; every input is forced onto its nearest template |
| `vocabulary-distinctiveness-audit` | adding a command to an existing gesture vocabulary; two commands are confused with each other more often than with noise; a proposed shape differs from another only in size or direction |
| `held-out-cross-user-acceptance` | a recognizer is about to be called accurate; accuracy was measured on the author's own strokes; setting the accuracy and latency go/no-go numbers |

**Neighbours.**
- `learning-curve-and-teaching-design` owns teaching the vocabulary (`skill-atom-inventory`, `time-to-competence-measurement`). This subject owns whether a shape can be recognised at all.
- `on-device-verification-harness`, *added since the plan*: `emulated-touch-is-not-physical-touch` already states that a synthetic or injected input is not evidence about hands. N1's acceptance cites it for its mouse and synthetic corpora rather than restating it.

### N2 `hand-tracked-timing-windows` (NEW)

**Home:** the new home (under C, `systems-canon`).
**Scope:** reward windows, such as a perfect block, under a tracked-hand sensor: recovering
the motion onset rather than the classification instant, budgeting sensor latency and
confidence inside the window, and treating tracking loss as a game state.

| Proposed technique | Draft `use_when` |
|---|---|
| `onset-recovered-from-tracking-history` | a gesture is classified some frames after it began; a timed defence must be judged at the instant the hand started moving; a confidence threshold is delaying the timestamp |
| `sensor-latency-inside-the-window-budget` | setting a reward window on an input channel with measurable sensor delay; one rule ships on a button channel and a tracked-hand channel; a runtime update changed the measured delay |
| `confidence-gated-detection` | tracking confidence drops during fast motion; a low-confidence pose earned a reward; deciding between rejecting and deferring a low-confidence sample |
| `tracking-loss-as-a-game-state` | the hands leave the sensor's view mid-action; a held defence persists after tracking is lost; deciding what the simulation receives while the hands are unseen |

**Neighbours.**
- `realtime-combat-semantics` owns windows in general (`active-defense-two-axis-split`, `real-time-timers-with-an-escapable-window`). This subject owns the sensor.
- `controller-latency-instrumentation`, *added since the plan*, already owns input-to-photon measurement: `optical-flash-frame-count-protocol` and `consumption-age-versus-photon-age-labelling`. N2 cites those for its photon-to-detection figure and does not mint a second measurement protocol.
- `phone-controller-input-protocol`, *added since the plan*: `neutralise-on-every-loss-path` already owns the general rule that a lost input releases what it held. `tracking-loss-as-a-game-state` owns only the sensor's own loss modes (out of view, occluded, low confidence) and how the game presents them.
- `design-canon-as-executable-law`: `canon-as-single-source-of-thresholds` owns "window widths live in data", the plan's "windows in data". N2 cites it instead of a technique of its own.

**A one-copy conflict in the plan.** The plan puts "onset timestamps" in N2's scope and
also proposes an EXTENDS of `realtime-combat-semantics`: "a window is measured from the
sensor's motion onset, not the classifier's". A bundle holds one copy of a technique.
Proposed split:
- the general rule (a window is measured from the input's onset, not from its recognition; it holds for any recognised input) goes to `realtime-combat-semantics` as the EXTENDS;
- N2 owns only how the onset is recovered from a tracked sensor.

### N3 `seated-immersive-arena-design` (NEW)

**Home:** the new home (under C, `balance-validation`).
**Scope:** the seated play envelope for a head-tracked player: a yaw comfort band that
bounds where threats come from, relocation in place of continuous locomotion, a clean
pause and resume when the device comes off or focus leaves, and short sessions that end
complete.

| Proposed technique | Draft `use_when` |
|---|---|
| `yaw-comfort-band-threat-placement` | placing enemies or projectiles around a seated player; an attack arrives from beyond the player's comfortable turn; a session's head-turn demand grows with the wave count |
| `relocation-instead-of-locomotion` | the player must change position while seated; continuous movement is proposed for a seated mode; deciding how a dodge moves the viewpoint |
| `focus-loss-pause-and-resume` | the player removes the device or the system takes focus mid-fight; timers keep running while the player cannot see; a resumed fight punishes the pause |
| `short-complete-session` | setting the length of one session on a head-worn device; comfort limits session length before content does; a session must end at a natural stop |

**Neighbours.**
- `combat-pacing-and-dramatic-arc`: `encounter-duration-envelopes` owns length targets per encounter class. N3 owns the session envelope that comfort sets around them.
- `agent-behaviour-authoring` (not in the plan) decides where an enemy stands. N3 supplies the band it may stand in.
- `lan-pairing-and-session-continuity`, *added since the plan*: `listener-release-on-pause-rebind-on-resume` owns network listeners and seats surviving a pause. `focus-loss-pause-and-resume` owns the game state across the same event.
- `two-thumb-touch-layout-design` and `emulated-touch-is-not-physical-touch@on-device-verification-harness`, *added since the plan*, already state that comfort claims are guesses until measured on the physical device. N3 cites that rule and adds only the **felt** label from the evidence rules below.

### N4 `field-of-view-aware-signalling` (NEW)

**Home:** the new home (under C, `balance-validation`).
**Scope:** threat readability when the display shows only part of the player's
surroundings and devices differ in field of view: cues that start outside the view, sound
as the off-view threat channel, and status anchored to the body or the world rather than
the screen.

| Proposed technique | Draft `use_when` |
|---|---|
| `cue-before-the-view-cone` | an attack can begin outside what the player sees; a player reports being hit by something never seen; deciding how early an off-view threat must announce itself |
| `audio-as-the-off-view-threat-channel` | deciding which threats must be heard before they are seen; several threats arrive from different directions at once; a spatialised cue's source is never located |
| `body-anchored-status-display` | placing health, timers or charges on a head-worn display; a screen-fixed overlay is unreadable at the edge of view; choosing between world-, body- and head-anchored information |
| `narrowest-view-as-the-design-bound` | one build ships to devices with different fields of view; a readability check passed only on the widest device; setting the cone a critical cue must appear in |

**Neighbours.**
- `spatial-audio-scene-authoring` owns the mix and spatialisation (`two-d-vs-three-d-spatialization-choice`, `event-priority-concurrency-cooldown`). N4 owns which threats must be audible first.
- `realtime-combat-semantics` (not in the plan): `telegraph-or-homing-for-area-effects` owns that a telegraph exists. N4 owns where it can be perceived.
- `procedural-level-planning` (not in the plan): `landmark-and-sightline-legibility` owns legibility of a space for wayfinding, and already records field of view as a test condition. N4 owns threat cues, not wayfinding.
- `short-form-cards-and-barks`, *added since the plan*: `television-read-budget` owns a read budget per display class for text on a television. It is the same kind of rule for a different medium, so it is a partial precedent, not an overlap.

### N5 `standalone-headset-frame-budgets` (NEW)

**Home:** the new home (under C, `asset-production/surface-and-imagery`).
**Scope:** authoring budgets for a self-contained head-worn device on a mobile-class GPU.
Limits are set per content class for shading path, overdraw, particles and draw calls
under two-eye rendering, with thermal headroom held back for sustained play.

| Proposed technique | Draft `use_when` |
|---|---|
| `per-content-class-frame-budget` | setting authoring limits for a device with a fixed refresh rate; one content class is consuming the whole frame; a budget is stated as one frame time for everything |
| `overdraw-and-transparency-ceiling` | particles or translucent effects fill the view; a scene is fill-rate bound on a tile-based GPU; an effect that was cheap on a desktop drops frames on the device |
| `forward-path-feature-allowance` | choosing the shading path for a mobile-class head-worn target; a material feature assumes a deferred path; costing post-processing on a tile-based GPU |
| `stereo-draw-call-budget` | counting draw calls for a two-eye render; draw calls doubled when stereo rendering was enabled; deciding what to batch for a multi-view render |
| `thermal-headroom-reserve` | a budget holds for five minutes and fails after twenty; the device lowers its clocks in sustained play; deciding how much of the frame to leave unspent |

**Neighbours.**
- `perf-regression-gating` owns the gate: `per-thread-budgets-not-one-frame-time`, `bracketed-capture-window`. N5 owns the authoring budgets the gate compares against.
- `shader-budget-authoring`: `hardware-tier-lighting-presets` already owns baked-versus-dynamic lighting per hardware tier. The plan's "baked light" is cited there, not minted here.
- `asset-class-poly-budgeting` owns polygon budgets per asset class.
- `on-device-verification-harness`, *added since the plan*, owns two measurement rules N5 needs: `fresh-state-per-check` records the thermal start state, and `separate-active-race-from-transition-windows` splits a session into windows. N5 cites both for its measurements.
- `fire-tv-device-realities`, *added since the plan*, is the closest existing single-device-class subject. It owns device operations; N5 owns rendering budgets.

### N6 `tracked-input-record-and-replay` (NEW)

**Home:** the new home (under C, `engine-integration`).
**Scope:** recording real tracked input as versioned corpora and replaying it headlessly
against the game's rules, with synthetic clips as stand-ins before the device arrives, a
record of what they missed, and the limits of emulators.

| Proposed technique | Draft `use_when` |
|---|---|
| `versioned-input-corpus` | recording real hand or controller sessions for later tests; a corpus was recorded on an older tracking runtime; a test passes on a clip nobody can identify |
| `headless-replay-against-the-rules` | an input rule must be regression-tested without a device; a replay diverges from the live session it recorded; wiring recorded input into an automated gate |
| `proxy-corpus-miss-ledger` | synthetic or mouse-drawn input stands in for real hands before the device arrives; real-hand results contradict the proxy numbers; deciding when a proxy corpus may be retired |
| `emulator-expressiveness-check` | an emulator is offered as the test bed for an input feature; the emulator cannot produce the gesture under test; an emulator pass is about to be reported as device evidence |

**Neighbours.**
- `runtime-observation-evidence`: `tiers-of-truth` owns the evidence ladder, so N6 places device-in-the-loop evidence on that ladder instead of minting tiers. `deterministic-headless-timestep` owns replay determinism.
- `on-device-verification-harness`, *added since the plan*: `emulated-touch-is-not-physical-touch` already owns the general rule that an injected input is not a hand. `emulator-expressiveness-check` may be an EXTENDS of that technique rather than a technique of N6. The forger decides; there must be one copy.
- `test-harness` in `software-engineering` owns the harness. It is named in prose only, because it is in another bundle.

### N7 `cross-runtime-rules-conformance` (NEW, lands outside the new home)

**Home:** `engine-integration`, its 9th subject. The plan notes it may fold into
`design-canon-as-executable-law` at review.
**Scope:** one rules authority executed by two runtimes, a reference simulation and the
shipped engine: pinned rules data, golden traces, a declared tolerance, and logged
divergence.

| Proposed technique | Draft `use_when` |
|---|---|
| `pinned-rules-data-across-runtimes` | two runtimes load the same rules data; one runtime is on an older revision of the tables; a port begins from a copy of the data |
| `golden-trace-conformance-vectors` | proving a port computes what the reference computes; a conformance suite checks only final states; choosing scenarios for a vector set |
| `declared-numeric-tolerance` | floating-point results differ between runtimes; a vector fails by a rounding difference; deciding which quantities must match exactly |
| `planted-mutation-proves-the-suite` | a conformance suite has never failed; a suite is about to be cited as evidence of equivalence; the vectors were generated from the port itself |
| `divergence-log-not-silent-correction` | the runtimes disagree in a live session; a port quietly adopts the reference's value; deciding which runtime is authoritative after a mismatch |

**Neighbours.**
- `design-canon-as-executable-law` owns where thresholds live (`canon-as-single-source-of-thresholds`). Its `flag-your-own-shipped-defaults` ("a new conformance checker passes everything on first run") is close to `planted-mutation-proves-the-suite`. The forger checks whether it already owns that lesson.
- `reference-parity-gating` (not in the plan) scores a generated artifact against a reference. N7 is equivalence of rules within a declared tolerance, not a parity score.
- `encounter-balance-simulation` is where the reference simulation's scenarios come from (`monte-carlo-scenario-presets`).

### N8 `deadline-slice-scoping` (NEW as proposed; recommended EXTENDS)

**Home:** `production-governance`, its 7th subject.
**Scope:** shipping a vertical slice against a fixed external date: numeric feasibility
gates, named fallbacks, kill and pivot criteria, cut logs, and submission-first ordering.

| Proposed technique | Draft `use_when` |
|---|---|
| `numeric-feasibility-gate` | a risky mechanic must be proven before the slice commits to it; a go/no-go date has no number attached; deciding when to stop investing in a prototype |
| `named-fallback-per-risk` | a slice depends on an unproven technique; a gate fails and nobody knows what replaces the feature; writing the plan for a fixed external date |
| `kill-and-pivot-criteria` | a feature is failing its gate a week before the date; the team is debating whether to keep trying; deciding in advance what result ends a feature |
| `submission-first-ordering` | an external submission has packaging and listing requirements; the build that is due has never been through the submission path; ordering the last weeks before a fixed date |

**Neighbour.** `production-work-prioritization` already owns two techniques that cover
much of this scope. Both have been on disk since 2026-09-02, before the plan, which named
the subject but not these techniques:
- `fixed-deadline-scope-triage`: "a delivery date is genuinely immovable and the plan does not fit it; authoring a cut list before a milestone rather than during it". The plan's "cut logs" belong here.
- `vertical-slice-as-the-first-milestone`.

**Recommendation:** reclassify N8 as an **EXTENDS** of `production-work-prioritization`,
carrying the four techniques above, not a new subject. The harvest brief calls this the
most common correct outcome of a harvest.

### N9 `autonomy-coverage-ledger` (NEW as proposed; likely EXTENDS)

**Home:** `craft-judgment`, its 7th subject. The plan notes it may fold at review.
**Scope:** measuring, per lifecycle phase, what an agent toolchain verified without a
person and what needed one, including the checks that need a person wearing the device.

| Proposed technique | Draft `use_when` |
|---|---|
| `per-phase-autonomy-ledger` | claiming how autonomous a game-development toolchain is; an agent-hours figure is reported without the person-hours beside it; comparing two toolchains' autonomy |
| `phase-promotion-evidence` | a tooling change claims to remove a human step; a phase moved from a person to a check and nobody recorded what moved it; a ledger row changed without a cause |
| `human-hours-as-a-measured-cost` | reporting the cost of an autonomous build; time at the desk and in the device is unrecorded; deciding whether a phase is cheaper by machine |

**Neighbours.**
- `production-coverage-measurement`: `headless-operability-gate` already owns "a step may claim the top readiness rungs only if it runs without an operator", next to `readiness-ladder` and `engine-credibility-classes`.
- `unattended-build-loop` owns `verifier-coverage-review-agenda` and `no-gate-self-certifies`.
- `runtime-observation-evidence` owns `unverifiable-is-not-fail`.
- `deterministic-run-verification` in `agent-operations` is named in prose only.

**Recommendation:** fold N9 into `production-coverage-measurement` as an EXTENDS, unless
the measured ledger shows a concern none of these owns. It is drafted last (see the
evidence table), so the ledger can decide.

## EXTENDS (from 9.2)

New techniques proposed for existing subjects. Each comes with what today's `index.json`
says about it.

| Existing subject | Proposed technique (claim) | Reconciliation note |
|---|---|---|
| `realtime-combat-semantics` | `window-measured-from-input-onset`: "a window is measured from the sensor's motion onset, not the classifier's" | Write it in its general form (any recognised input). N2 cites it; see the one-copy note under N2. |
| `encounter-balance-simulation` | `controller-samples-measured-input-latency`: "the reference controller samples measured input-modality latency" | No existing technique owns it. Name `proxy-driver-limit-declaration@combat-pacing-and-dramatic-arc` as the related rule for what a simulated pass does not prove. |
| `learning-curve-and-teaching-design` | `first-minute-verbs-without-fail-state`: "the first minute teaches each verb in-world with no fail state" | Check against `teaching-escalation-ladder` and `introduce-practise-test-spacing` before adding. It may be an application of one of them. |
| `ship-pipeline-gating` | "boot marker on a sideloaded device package" | `post-cook-process-liveness-smoke` ("a packaged artifact must be proven to start") already owns the concern. Likely a `cpp` application of it, not a new technique. |
| `perf-regression-gating` | `on-device-capture-as-frame-time-truth`: "pulled on-device captures as the only frame-time truth" | Check against `baseline-bound-to-build-and-machine`. |
| `engine-pitfall-corpus` | Three incident entries, in the shape of `incident-entry-shape`. (1) A plugin binary built for a different engine minor version. (2) Editor-only APIs in runtime modules breaking non-editor targets, an incident from a sibling project (see Provenance). (3) The emulator that cannot express the gesture under test. | Entry (2) cites `editor-only-api-audit-for-shipping@ship-pipeline-gating`, which owns the audit. Entry (3) must not become a third copy of the emulator rule: it cites `emulated-touch-is-not-physical-touch@on-device-verification-harness`, or N6's technique if that is where the forger puts it. |
| `unattended-build-loop` | `person-only-gate-declared-not-inferred`: "the human-in-headset gate is declared unverifiable to the loop, never inferred" | Check against `no-gate-self-certifies` and `unverifiable-is-not-fail@runtime-observation-evidence`. N9 counts these gates; this technique declares them. |

Agent-run lessons that are not specific to games (model and effort choice, run budgeting,
verifying a run against the tree) go to `agent-operations`, per 9.1:
`model-and-effort-selection`, `agent-run-budgeting` and `deterministic-run-verification`.

## Evidence each subject needs before it may land (from 9.3)

| Subject | Plan step | Evidence gate |
|---|---|---|
| N1, N2 | D1, 11 Oct: Phase-1 drafts | The plan's D-G0 to D-G4 gate numbers, each with n, date, build hash and command, labelled **mouse** or **synthetic**, never hands. A failed gate is evidence too. |
| N1, N2 | V2, 8 Nov: real-hand evidence | Real-hand numbers beside October's, for the same gates. |
| N7 | D2, 18 Oct: draft | At least 20 green conformance vectors plus one planted-mutation failure. |
| N6 | D4, 31 Oct: draft; extended at V2, 8 Nov | Regressions caught by replay, set against those caught by a person. |
| N5 | V1, 4 Nov: Phase-1 draft | Device captures with n, date, device, build hash and command. |
| N3, N4 | V3, 13 Nov: drafts | At least two owner sessions in the device labelled **felt (owner, n sessions)**, plus at least one outside tester, observed before interpreted (`observation-before-interpretation@playtest-signal-to-defect`). |
| N8 | V3, 13 Nov: draft | The dated cut log. |
| N9 | 19-30 Nov: drafted | The measured autonomy ledger, kept in the game repo from day 1 with one row per lifecycle phase: agent-hours; owner-hours at the desk and in the device; which gates ran headless; which needed a person; which feature moved a phase from person to headless. |
| N1-N8 | 19-30 Nov: Phase-2 reconcile, status `forged`; EXTENDS harvest | Applications under `stack: cpp` (and `node` for evidence from the reference simulation), with `verified_on` and `verified_against`, anchors written as `path:line "quote"`, and `node scripts/gate.mjs --lane knowledge` green. |
| (none) | After 11 Dec: outcome note | The competition result is context, **never** quality evidence. |

**Rules that bind every row:**
1. A lesson needs a measurement (n, unit, date, device, build hash, command) or a reproducible failure with its repro. A "vibe" is never evidence.
2. Owner feel is admissible only as **felt**, with a session count. Agent self-reports are T0 and certify nothing (law `no-gate-self-certifies`).
3. Numbers live in applications. Upper layers state rules without product names.
4. Evidence pointers stay in local `.evidence.local.md` files ([`CONTRIBUTING.md`](../CONTRIBUTING.md), privacy).
5. Laws are closed during a harvest. A rule that recurs goes in the report as a proposed law, never into `_laws.md`.

The Phase-1 order binds as everywhere else. Draft from practitioner knowledge, hardened
with 2-4 searches, before opening the game repo. Status runs `draft`, then `forged`, then
`reconciled`. There is no "hardened" status.

## Changes the forge step must make (this change makes none of them)

This file is the only change. The forge step, run by the owner or by a `/forge` or
`/deepen` session in the registry, makes the following, each with its own gate run:

1. **Taxonomy, per the owner's placement choice (B, decided; see [Decided](#decided)).** Order: the retitle of `couch-and-tv-play`, the `apply-taxonomy.mjs` move of the six subjects into `couch-and-tv` and the new `immersive-interaction` ring land in one forge, together with the first immersive subject (the N1 and N2 D1 drafts). Edit `knowledge/game-production/taxonomy.json` and move subjects only through `scripts/apply-taxonomy.mjs`, never `git mv`. Then regenerate the index, rules and catalog with their generators.
2. **Stacks. DONE** in commit `5da5108c` (catalog regenerated in `cebf85ff`). Add `cpp` to the frontmatter of `knowledge/game-production/index.md`. The plan says that file declares no `stacks:`, but it now declares `stacks: [kotlin]`, added with the racing and TV forge, so the change is `stacks: [kotlin, cpp]`. Without `cpp`, a C++ application fails as `unknown stack`. `node` is in the default set (`STACKS` in `scripts/check-bundles.mjs`: react, rust, sql, node, process) and needs nothing.
3. **Purity. DONE** in commit `bd008bf8`. Extend the `game` profile's product-identifier regex in `scripts/check-bundles.mjs` with headset, runtime and platform vendor names. Two constraints were measured for this proposal:
   - **Bare forms collide.** The regex is case-sensitive and word-bounded. Two of the headset vendor's names, written bare, already occur as ordinary English in two forged upper-layer techniques, so adding them bare turns the gate red at once. Use qualified product forms. The candidate list, the probe and the two colliding lines are under [Provenance](#provenance-and-vendor-vocabulary).
   - **Generic class nouns must stay legal.** "Headset", "hand tracking", "VR" and "XR" are class nouns. N5's slug and every scope above use them.
4. **Registration.** Register the mage-arena-vr project in `projects.json` and `librarian/projects.md`. The checkout path must be relative; absolute roots live only in `.machine.local.json`. The registry's main checkout has uncommitted work in `projects.json`, so this edit belongs on a clean base.

## Second consumer: a seated, non-combat app pair

**Who.** The garden-vr project builds two seated habit apps for the same class of
standalone headset as the first consumer: a **breathing app** (an evening ritual in which a
held pinch is an inhale and a plant grows with it) and a **day-dial app** (a drawn dial on
the table whose shadow is the real clock, and habits tended by a glance and a pinch). Neither
has an opponent, a fail state or a score. The two names are labels for this section; the
products are named under [Provenance](#provenance-and-vendor-vocabulary).

**What was read.** garden-vr commit `8670dd1`, read-only: the agent guide's rules 2
("seated, two-foot radius, under ten minutes to a complete, satisfying moment; fast start,
clean pause/resume") and 3 ("honest habits"); the two game-design conformance reads, one per
app, added in commit `00c2e4c` and read against this registry at `10e643f`; the programme
plan's gate and Phase 2 headset sessions; the milestone-4 budgets document, its two per-app
budget files and the texture-memory reading. Row ids below (`NC2`, `SB5`) are the
conformance reads' own.

**What kind of evidence it is.** All of it is desk evidence. The labels used below:
- **desk: code**, read from source;
- **desk: unit test**, the engine-free core tests;
- **desk: scripted**, engine-side scripted playback tests, cited for what they assert. The engine has no licence on the consumer's machine, so none of them ran for these reads;
- **desk: arithmetic**, a budget derived from published platform limits and the consumer's plan, or a census over source images.

No headset session has run. Under the [rules that bind every
row](#evidence-each-subject-needs-before-it-may-land-from-93) none of it is landing
evidence: it is not a measurement on the device and it is not **felt**. It says where the
consumer's rules meet the proposed techniques, and where they meet nothing.

### Where the evidence bears on the proposed subjects

It bears on N3, N4 and N5, and lightly on N6. It does not bear on N1, N2 or N7-N9.

**N3 `seated-immersive-arena-design`.**

| Proposed technique | Consumer's rule or row | Verdict there | Label |
|---|---|---|---|
| `yaw-comfort-band-threat-placement` | Rule 2; `NC1`, `NC2` in both reads | The hero object of each app sits straight ahead and below the eye. The breathing app: 0.40 m ahead, 0.30 m below, **meets**. The day-dial app: 0.26 m ahead in the desktop scene against its own 0.55 m anchor, **deviation** (`NC2`). The desktop stand-in clamps look to 40° yaw and 25° pitch with a recentre key. That is a mouse clamp, not a measured head band. | desk: code |
| `relocation-instead-of-locomotion` | Rule 2; `NC1` in both | **Meets**, in a stricter form than the technique: the view only rotates, and nothing relocates the viewpoint at all. | desk: code |
| `focus-loss-pause-and-resume` | Rule 2; `NC5` in both; plan gate S4 | **Meets.** A waiting action is saved on pause and on quit. A ritual cut off is offered back and never restarts on its own. Scripted pause tests sit at five points per ritual. One recorded drift: in the day-dial app a ritual cut off by quitting returns only through the normal daily offer. | desk: scripted, desk: code |
| `short-complete-session` | Rule 2; `NC3`, `NC4` in both; plan gates U1, U2 | **Meets (scripted).** The first complete moment arrives by 180 s of app time on the scripted run, and the day-dial's first tend by 60 s. For the breathing app, a core test asserts a cold start to the first answer in under 10 minutes. The day-dial's timed draw-in steps total 5.3 s, and 0 s under reduced motion. The human witness (U2: a first-time person with a stopwatch, on the desktop build) has not run. | desk: scripted, desk: unit test |
| (none) | `NC6` in both: comfort settings for motion | The breathing app **meets**: reduced motion shows end states, and a test asserts breath timing survives it. The day-dial app is a **deviation**: a 10 fps hand-drawn line boil, which its plan lists as a flicker risk in stereo, stops only when all motion is turned off. No N3 technique owns motion-comfort settings. See open question 7. | desk: code, desk: scripted |

**N4 `field-of-view-aware-signalling`.**

| Proposed technique | Consumer's rule or row | Verdict there | Label |
|---|---|---|---|
| `body-anchored-status-display`, `narrowest-view-as-the-design-bound` | `SB5` in both, where the consumer applied `television-read-budget@short-form-cards-and-barks` as the nearest rule | **Deviation** in both. World-placed words have no minimum glyph height in degrees and no words-per-line cap at the 0.40 m and 0.55 m placements. Sizes are set by hand per call; a contrast floor of 4.5 exists. Reaching for the television rule confirms N4's "partial precedent" note: a head-worn read budget is the same kind of rule for another medium. | desk: code |
| `narrowest-view-as-the-design-bound` | The budgets' binding rule: a budget holds on both target headsets, and where they differ the lower binds | **Consistent**, with one refinement for the forger. For fill the consumer binds the opposite way: the headset with the larger per-eye display binds, because the same GPU shades more pixels. The general rule is "the most demanding device binds, per quantity", and "narrowest" is its field-of-view case. | desk: arithmetic |
| `cue-before-the-view-cone`, `audio-as-the-off-view-threat-channel` | No row | **Not exercised.** All content sits ahead inside a small envelope and nothing starts out of view. The nearest concern is the reverse: a missed day plays no cue at all (`NC8`). | - |

**N5 `standalone-headset-frame-budgets`.** Every value in the consumer's budget files carries
`measuredOnDevice: false`.

| Proposed technique | Consumer's rule or row | Verdict there | Label |
|---|---|---|---|
| `per-content-class-frame-budget` | Frame time per refresh rate, as 1000 / Hz: 13.9 ms at the default 72 Hz to 8.3 ms at 120 Hz. The split between CPU and GPU is left `null`, with its reason, until the first headset reading | **Partial.** One frame time per rate, and no budget per content class. The consumer leaves the missing split null rather than inventing it. | desk: arithmetic |
| `overdraw-and-transparency-ceiling` | The breathing app: a mean of 1.5 transparent layers over the hero object (soft 1.2). The day-dial app: no cap, `null` because its plan sets none | **Partial.** A ceiling exists for one app only. | desk: arithmetic |
| `forward-path-feature-allowance` | Post-processing not allowed, in both apps | **Consistent**, as a plan rule; never costed on the device. | desk: arithmetic |
| `stereo-draw-call-budget` | 40 draws and 60k triangles, and 30 draws and 30k triangles, per scene, with soft caps at 80%. The plan counts them in a desktop capture step. Desktop frame time is reported and never gated | **Open.** The caps do not say whether a draw counts once or once per eye, and that is the question this technique answers. | desk: arithmetic |
| `thermal-headroom-reserve` | No row. Soft caps at 80% of every hard cap are a general headroom rule, not tied to sustained-play clock drops | **Not covered.** | - |

Two N5 neighbours already own what the consumer did beyond these rows, so N5 cites them and
mints nothing for it:
- `residency-budget-checked-before-decode@render-submission-economy` owns the texture-memory budget. The consumer gives textures a quarter of the platform's per-app memory ceiling (5.75 GiB of proportional set size, so 1472 MiB). A census over source images passes both apps, at 21.75 MiB and 11.57 MiB counted. That census is arithmetic, not a device reading.
- `host-independent-work-counts@perf-regression-gating` owns what a desk figure may claim about a device that is not on hand. Both consumers are in that state today.

**N6 `tracked-input-record-and-replay`, lightly.**
- Every interaction goes through named intents (pinch, pinch-hold, release, poke, look, palm open). Scripted playback replays intents by stable target id against the app.
- This is `headless-replay-against-the-rules` one level above raw tracking. It is evidence that intent-level replay works on the desk, and nothing about tracked hands.
- Keyboard and mouse are the proxy for hands until the first headset session. The consumer keeps no `proxy-corpus-miss-ledger` yet.

**The device evidence the consumer plans, as its plan states it.**
- Phase 2 runs from 24 October to 11 November, only for an app that passes the consumer's gate on 23 October.
- The headset sessions are the owner's only:
  - H1, 27 October: hands, passthrough and the first ritual on the device;
  - H2, 3 November: art in real passthrough, performance with the vendor's metrics overlay, and comfort;
  - H3, 10 November: the release candidate and video capture;
  - H4, 16 November: a clean install from the competition channel's invite.
- If both apps pass, H1-H3 cover both in one sitting of about 60 minutes. An app given the one-week extension moves H1 to 2 November.
- The budgets document names H2 as the first headset reading.

Two consequences for the evidence table, stated as inferences:
- As planned, comfort is named at H2 only. That yields **felt (owner, 1 session)** per app for N3 and N4, against the two owner sessions and one outside tester the table asks for at V3. The plan's first-time witness (U2) is on the desktop build.
- H2 on 3 November falls a day before N5's V1 date. If it records n, date, device, build hash and command, it could be a second N5 source beside the game's captures.

### Scope feedback for the forger

Where N3 and N4 frame a rule with combat words and the calm consumer needs the same rule, a
neutral wording is proposed below. The tables above are not edited; the forger owns final
naming.

| Proposed technique | Combat framing today | The same rule in calm content | Proposed neutral wording |
|---|---|---|---|
| `yaw-comfort-band-threat-placement` (and N3's scope line "bounds where threats come from") | "enemies or projectiles", "an attack arrives", "wave count" | The yaw band bounds where any content the player must attend to sits. | Slug `yaw-comfort-band-content-placement`. Use_when: placing anything the player must attend to around a seated player; content asks for a turn beyond the comfortable band; a session's head-turn demand grows as content accumulates. Scope: "a yaw comfort band that bounds where content sits". |
| `relocation-instead-of-locomotion` | "deciding how a dodge moves the viewpoint" | No action moves the viewpoint; the view only rotates. | Third phrase: "deciding whether any action moves the viewpoint". |
| `focus-loss-pause-and-resume` | "mid-fight", "a resumed fight punishes the pause" | Pause and resume lose nothing; an activity cut off is offered back and never restarts on its own. | Use_when: the player removes the device or the system takes focus mid-activity; timers keep running while the player cannot see; a resumed activity punishes the pause or restarts without being asked. The "offered back, never auto-restarted" clause is a candidate upward lesson from this consumer. |
| `short-complete-session` | none | A session ends complete in under ten minutes. | No change. The ten minutes is a number and belongs in an application. |
| N4's scope and `cue-before-the-view-cone`, `audio-as-the-off-view-threat-channel` | "threat readability", "an attack can begin", "hit by something never seen", "which threats" | Not exercised by this consumer (see above). | Scope: "readability of anything the player must notice". Use_when: an event that needs attention can begin outside the view; a player misses something that happened out of view; deciding which events must be heard before they are seen. Slug `audio-as-the-off-view-channel`. This consumer gives no evidence for the two techniques, so the change widens their reach on wording alone. The forger may keep the combat framing until a calm case exists. |
| `body-anchored-status-display` | "health, timers or charges" | Progress and status placed in the world at a fixed distance. | "health, progress, timers or charges". |

### Concerns no N subject covers

Both are measured over the `use_when` triggers in `game-production/index.json`, on this
branch at `10e643fd`: 79 subjects, 525 techniques, 1,685 triggers. The conformance reads
counted "525 technique triggers"; 525 is the technique count, and the zero they report holds
over all 1,685 triggers. The command:

```sh
node -e 'const j=require("./knowledge/game-production/index.json"),re=new RegExp(process.argv[1],"i"),t=Object.values(j.subjects).flatMap(s=>s.techniques.flatMap(x=>x.use_when));console.log(t.length,t.filter(u=>re.test(u)).length)' '<pattern>'
```

**1. Honest habits.** The consumer's rule 3 holds that growth only rises; a missed day is
quiet and recoverable; nothing wilts to death or turns red; nothing shames; and there are
no streak counters. Rows `NC7` to `NC12` in both reads:
- **Growth only rises.** The breathing app meets it, with a property test and a negative control. The day-dial app is a deviation: the core proves the rule over 1,000 random lives, but the shipped drawing path is not the proven one, so a clock set back plus a restart can shrink a plant.
- **The other five rules meet in both apps.** A missed day plays no cue and shows no count. One ritual restores full glow, or yesterday can be logged once, marked late. There is no wilt state. Nothing is red, read from code and not from a render. No user-facing streak or failure string exists.
- **The enforcement is weaker than the rules.** The banned-word lists are copied, and they differ, across scripted tests that no unit test reads. The plan's gate is a grep that also matches shader identifiers, so it can never come back empty.
- Labels: desk: code, desk: unit test, desk: scripted.

| Pattern | Triggers matched | What matched |
|---|---|---|
| `\b(habits?\|streaks?\|shame\|shaming\|guilt\|wilt(s\|ed\|ing)?\|missed (day\|days\|session)\|lapsed?\|daily\|every day)\b` | **0** | - |
| the same plus `\|punish(es\|ed\|ing\|ment)?` (positive control) | 2 | "an agent cannot be punished for a mistake"; "a car ... must be punished for approaching the edge". Neither is about habits. |

Across every bundle's `index.json`, a wider probe,
`\b(habits?|streaks?|shame|shaming|guilt|dark patterns?|retention|engagement loops?|wellbeing|well-being)\b`,
matches 18 of 12,426 triggers. All 18 were read: data and candidate retention windows, a
short-form video's viewer retention, focus retention in a user interface, an alert's
"sustain streak", and "branches ... by habit". None is about honest habits. The nearest owned
ground, found by reading, is loss without a dead end inside a game's own systems:
`participation-floor-no-dead-end@racing-career-economy` ("a race career can strand a broke
player") and `survive-the-lean-stretch@debt-and-loss-stakes-staging`. Neither covers a
missed real-world day.

**Where it might belong (a proposal, not a decision).** **Not** in the immersive ring.
Nothing in it depends on a head-worn display, and a phone habit app needs the same rules.
The candidate home is a new subject in `systems-canon` (6 subjects today) beside
`racing-career-economy` and `game-economy-tuning`: progression that only rises, absence that
is quiet, and recovery without a dead end. Its enforcement techniques would cite
`canon-as-single-source-of-thresholds` and `shape-check-vs-content-invariant` rather than
restate them. Another bundle is the alternative if the owner reads a habit app as outside
game production; no bundle today owns product-ethics or wellbeing design. Only one consumer
raises this concern, so it may be held as a lead until a second consumer appears. See open
question 8.

**2. The seated reach envelope.** The consumer's rule 2 sets a two-foot radius. Row `NC2`:
- the breathing app's hero object at 0.40 m **meets** it;
- the day-dial app's dial at 0.26 m is a **deviation**. It was moved closer to fill the desktop frame, and on a headset that sits nearer than comfortable focus. The fix the read proposes is to frame the stand-in view with the camera's field of view and never by moving content. That is a stand-in distorting a design, close in kind to `emulated-touch-is-not-physical-touch@on-device-verification-harness`.
- `SB5` ties the read budget to the same two distances.
- Label: desk: code.

| Pattern | Triggers matched | What matched |
|---|---|---|
| `\b(arm.s length\|within reach\|reachable by hand\|seated\|sitting\|ergonomic\|near[- ]field\|comfort(able)?\|posture\|neck\|head[- ]turn)\b` | **0** | - |
| the same plus `\|reach(es\|ed\|able)?\|radius` (positive control) | 9 | Rubric and medium ceilings, an antagonist's cost reaching the player, numbers reaching a designer, reach inside a coverage percentage, conversation and zone reachability, a phone reaching a television, a corner radius. None is about bodily reach. |

**Where it might belong (a proposal, not a decision).** **Inside** the immersive ring, as a
fifth N3 technique, because N3's scope is already "the seated play envelope" and its
techniques cover yaw, locomotion, pause and length but not distance. A draft for the forger:
`seated-reach-and-focus-envelope`. Use_when: placing an object a seated player touches or
reads; content placed to fill a desktop frame sits nearer than comfortable focus; setting
the nearest and farthest distance interactive content may sit. The ring stays at six
subjects. The read-distance part could go to N4 instead, beside the read budget.

## Open questions

1. **Placement: DECIDED.** B, by the owner on 2026-10-07: a ring `immersive-interaction` inside `couch-and-tv-play`.
2. **If B: the names. DECIDED.** The category id `couch-and-tv-play` stays, retitled "Couch, TV and immersive play". The ring for the existing six is `couch-and-tv`; the new ring is `immersive-interaction`. Asked: the host category's new title, and the id and title of the ring that holds its existing six subjects. A category *title* change keeps every path; an *id* change is a move. The harvest brief forbids renaming a category during a harvest, so this is an owner decision made before the harvest starts.
3. **Folds.**
   - N8 into `production-work-prioritization`: recommended.
   - N9 into `production-coverage-measurement`: likely; decide after the ledger.
   - N7 into `design-canon-as-executable-law`: open; the plan leaves it to review.

   Each fold also drops one subject from the counts above.
4. **One copy each.**
   - The window-onset rule: `realtime-combat-semantics` (general) against N2 (sensor).
   - The emulator rule: `on-device-verification-harness`, N6, and the incident entry in `engine-pitfall-corpus`.
   - The boot marker: `ship-pipeline-gating`'s `post-cook-process-liveness-smoke`.

   The forger settles each before drafting, not after.
5. **Purity scope.** `fire-tv-device-realities` already carries a platform product name in its subject slug, and the purity check reads bodies, not slugs. Should the vendor extension also cover slugs, and if so, what happens to that subject?
6. **Slots after B.** The host category reaches 12 subjects in two rings of 6. A seventh immersive subject later is legal (ring cap 10). A third ring would need its own reason.
7. **Second consumer: N3 and N4 wording, and what has no technique.** The calm consumer needs the same rules as N3 and N4 for content that is not a threat (see [Scope feedback](#scope-feedback-for-the-forger)). There are four choices:
   - Word N3 and N4 neutrally, using the proposed names or the forger's own, or keep the combat framing and land the calm case as an application only.
   - Does a read budget in degrees for a head-worn display become an N4 technique, or an EXTENDS of `television-read-budget@short-form-cards-and-barks`? The consumer reached for the latter.
   - Do motion-comfort settings (line boil, reduced motion) belong to N3 or to no subject yet?
   - The consumer plans comfort at one headset session per app, which is short of N3's and N4's two-session bar. Does a second consumer's single session count toward that bar?
8. **Second consumer: honest habits and the seated reach envelope.** Two decisions:
   - Is the reach envelope a fifth N3 technique (`seated-reach-and-focus-envelope`, proposed above) or part of N4?
   - Honest habits: is the home a new `systems-canon` subject, another bundle, or nothing until a second consumer raises it? If it lands as a subject, registering the garden-vr project in `projects.json` is a separate owner decision. This change does not make it.

## Provenance and vendor vocabulary

This is the only section that names products, engines, headsets or vendors.

**The source.** The mage-arena-vr plan, section 9:
- 9.1, the domain recommendation and the owner's hybrid-placement decision of 2026-10-02;
- 9.2, the subject map N1-N9 and the EXTENDS list;
- 9.3, the forging cadence and evidence rules.

The game is a seated, bare-hands spell-combat arena for Meta Quest standalone headsets,
built in Unreal Engine 5 in C++ with the MetaXR plugins. It has a desktop and TV sibling
build that shares one design canon, and it is entered in the Meta VR Start 2026 (Gaming)
competition. The facts about the game, not about game production in general, live in the
registry's `memory/` namespace `mage-arena`: `memory/semantic/mage-arena-channels-and-shared-canon.md`
and `memory/semantic/mage-arena-mechanic-channel-matrix.md`. The matrix records the C++ port
matching the desktop and TV kernel on 45 conformance vectors, and synthetic-clip and
mouse-corpus results for the gesture recognizer and the palm-ward window. Those are October
statuses. They become evidence for N1, N2 and N7 only through the gates in the table above.

The editor-only-API incident in the `engine-pitfall-corpus` row comes from the PoF project,
an AI companion for building Unreal Engine 5 C++ games and the tree `game-production` was
first forged from.

**The second consumer.** garden-vr is two Unity 6.6 (URP) apps. **Terrarium** is the
breathing app: an evening six-breath ritual, with a pinch-hold inhale, that grows a fern in a
cork-topped jar. **Sundial** is the day-dial app: a drawn dial whose shadow is the real clock.
Their core rules are pure C# with .NET unit tests. Both target Meta Quest 3 and Quest 3S,
both on the Snapdragon XR2 Gen 2, and they are entered in the Meta VR Start Developer
Competition 2026, Productivity track. The consumer's gate is on 2026-10-23 and entries close
on 2026-11-18. Until its gate, the project works on Windows, with keyboard and mouse standing
in for hands. Unity has no licence on its machine, so no Unity build or play-mode test ran
for the evidence above. Its headset performance reading (H2) is planned with OVR Metrics.
Its budget limits come from Meta Horizon developer pages read on 2026-10-07. The documents
cited, all at garden-vr commit `8670dd1`, are:
- "Terrarium - game-design conformance read" and "Sundial - game-design conformance read", added in `00c2e4c`;
- "Budgets: milestone 4, Quest 3 and Quest 3S";
- "Texture memory against the milestone 4 budgets";
- "Garden VR - the programme";
- "Agent guide - Garden VR", rules 2 and 3.

**Vendor vocabulary probe, for forge step 3.** Each candidate name was counted
case-sensitively and word-bounded in the upper layers of `game-production`, with
`applications/` and JSON excluded, on `main` at `29da5a64`. The control `Unreal` counts
0 there and 28 in `applications/`.

- **Zero today, safe to add:** Oculus, OpenXR, SteamVR, WebXR, Vision Pro, visionOS, Pico, Vive, HTC, Valve, PSVR, PlayStation, Horizon OS, Android XR, Varjo, Snapdragon, Qualcomm, Adreno, Android, Apple, Amazon, Fire TV.
- **Collide when bare:**
  - `Quest` matches "Quest prerequisites and unlock trees" in `game-economy-tuning/techniques/feedback-loop-topology-and-polarity.md:138`;
  - `Meta` matches "Meta-commentary about the artifact" in `judgeable-spec-authoring/techniques/register-discipline-in-a-spec.md:44`.

  Use `Meta Quest`, `Quest [0-9]`, `Quest Pro`, `Meta Horizon`, `MetaXR` or similar instead.

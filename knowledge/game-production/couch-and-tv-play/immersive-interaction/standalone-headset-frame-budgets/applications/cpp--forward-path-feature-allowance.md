---
layer: application
type: application
subject: standalone-headset-frame-budgets
technique: forward-path-feature-allowance
stack: cpp
status: draft
verified_on: 2026-10-21
verified_against: cpp@20
applied: experiment
ab_verdict: better
proof: before-after
---

# Auditing a Quest project's forward path against a closed feature allowance

Source tree: `mage-arena-vr` on `master` at `d25ecc7` (the root of every path below). The
stack is C++ in an Unreal Engine 5.8 project, witnessed by `"EngineAssociation": "5.8"` in
`apps/vr/Game/MageArenaVR.uproject`. No `CppStandard` override, so the language level is the
engine default, C++20. The installed engine is 5.8.3. Its renderer source was read for one
row (decals) and is cited in prose, because it is not part of this tree.

**This is a desk-phase tree.** The project is in its desktop-greybox phase until 31 October
2026, and no build has run on a headset. Every row below is about what the configuration and
the code *decide*. None of it is a device cost. The technique's rule that a feature in the
allowance carries its device cost has nothing to record here yet.

## The seam, chosen to falsify

The technique says to publish the allowance as a list, "because a feature that is not listed
will be assumed". This tree is a fair test of that claim. Its owners care about the forward
path: forward shading was on from the first commit, and a research pass from early October
already found two forward-path defects. If every row the technique names were already decided
somewhere in the tree, with a reason, then the list would be redundant here. Scattered,
commented decisions would do its job, and the rule would need a boundary.

The audit took the rows from the technique's first section and the decision rules: shading
path, multisampling and its resolve, dynamic lights, real-time shadows, screen-space effects,
deferred-only material features (decals), post passes, foveation, and desk parity. For each
row it looked for a project decision in config, data, code or the plan, and for the engine
default where nothing decided it.

- **Target:** rows with no project decision, so that the engine default or an unchecked
  document decides them.
- **Floor:** every explicit decision the tree already makes stays true. The list adds no
  config change, so a list that contradicted a standing decision would be a regression.

## Arm A: the tree as it stands

| Row | Decided by | Anchor |
|---|---|---|
| Shading path | config, explicit | `apps/vr/Game/Config/DefaultEngine.ini:6` "r.ForwardShading=True"; `apps/vr/Game/Config/Android/AndroidEngine.ini:8` "r.Mobile.ShadingPath=0" |
| Multisampling | config, explicit (after a fix) | `apps/vr/Game/Config/DefaultEngine.ini:7` "r.MSAACount=4"; `apps/vr/Game/Config/DefaultEngine.ini:10` "r.Mobile.AntiAliasing=3" |
| Real-time shadows | data and code, explicit | `apps/vr/data/vr/arena-layout.json:242` "castShadows"; `apps/vr/Game/Source/MageArenaVR/Greybox/GreyboxUtil.cpp:117` "Component->SetCastShadow(false);" |
| Dynamic lights | plan says one; code ships two movable lights | `docs/PROJECT-PLAN.md:369` "one dynamic light at most"; `apps/vr/Game/Source/MageArenaVR/Greybox/ArenaGreyboxActor.cpp:262` "SetMobility(EComponentMobility::Movable)"; `apps/vr/Game/Source/MageArenaVR/Greybox/ArenaGreyboxActor.cpp:275` "SetMobility(EComponentMobility::Movable)" |
| Post passes | engine default (on) | `docs/research/STACK-OPPORTUNITIES-2026-10.md:179` "defaults to"; `apps/vr/Game/Source/MageArenaVR/Hands/MageArenaPawn.cpp:106` "Post.bOverride_BloomIntensity = true;" |
| Screen-space effects | engine (not built on this path), no project row | `docs/research/MOBILE-INSTANCING-2026-10.md:157` "for SSAO, SSR or instance occlusion culling" |
| Decals | nothing in the tree; a style study assumes them | `docs/ART-STYLE-STORYBOARD.md:87` "mosaic edge decals" |
| Foveation | engine default (off), known and deferred | `docs/research/REGISTRY-ROUTING-2026-10.md:25` "F6 Foveation off, per project only" |
| Desk parity | explicit label | `docs/research/BUDGET-DG4-2026-10.md:143` "proxy and cannot prove 72 Hz on Quest" |
| Full-screen translucency | plan, by name | `docs/PROJECT-PLAN.md:366` "no full-screen translucency except the blink vignette" |

Ten rows. Six have a project decision: shading path, multisampling, shadows, desk parity,
full-screen translucency, and screen-space effects, which the path does not build at all.
Four do not:

- **Post passes.** No line sets `r.MobileHDR`, so the headset build runs the mobile post
  chain by default. The project's own research found this (`F4`) and deferred the change to
  the first device sprint. The camera still carries exposure and bloom overrides, and those
  only mean something while the chain runs. This is the technique's third section, case for
  case: a full-screen pass nobody named, whose cost is unrecorded. The same research notes
  that `r.Mobile.UseHWsRGBEncoding=True` (`apps/vr/Game/Config/DefaultEngine.ini:13`
  "r.Mobile.UseHWsRGBEncoding=True") takes effect only with Mobile HDR off, so this line
  currently does nothing.
- **Dynamic lights.** The plan's lighting row allows "one dynamic light at most" with baked
  lightmaps. The greybox spawns a movable directional light and a movable sky light, and no
  surface has a lightmap. The greybox phase explains the missing bake. What it does not
  explain is the count: nothing says whether a movable sky light counts against the one, so
  the code has decided it by default.
- **Decals.** Nothing renders a decal today. But the owner's baseline style study rates
  itself highest-feasibility for the headset while assuming "mosaic edge decals", and no row
  says which decal form the forward path allows. On this engine the answer is narrower than
  the technique's general warning. On Vulkan, the 5.8.3 mobile decal path reads scene depth
  through a subpass fetch even with Mobile HDR off (`MobileDecalRendering.cpp`, the
  platform-support check at lines 26-42), so a depth-projected decal does not force the
  frame off chip there. A decal that reads surface normals would. The technique's sentence
  names normal-reading decals specifically, and it held.
- **Foveation.** It is off by engine default, it is known (`F6`), and it is deferred to the
  device sprint. It is unnamed in the plan's budget table, so it is counted here.

**The falsifier did not fire.** The explicit rows are exactly the ones an earlier finding had
forced: the multisampling keys were fixed after a research pass found the desktop key dead
and the headset key missing (`F3`). Every row no finding had reached sat at the engine
default. The plan's partial allowance (the lighting and particle rows of its budget table)
was not checked against the code, and the code drifted from it within the greybox phase.

## Arm B: the allowance written as a list

The project now carries the ten rows as one list, each naming the line that enforces it or
marked unenforced, with an owner point for the four undecided rows
(`docs/research/FORWARD-ALLOWANCE-2026-10.md` in the project). Its routing ledger now routes
the two findings this application covers, `F3` and `F4`, here.

- **Target:** unnamed rows went from 4 of 10 to 0 of 10. Each of the four now has a named
  decision point. The post-pass row and the sky-light count are due at the first device
  sprint, decals at the style pick, and foveation stays where `F6` already put it.
- **Floor:** held. The list changes no config and no code, and each of the six explicit
  decisions is quoted from the line that makes it.

## What this cannot show

- **No frame was rendered on a headset.** The list names the post chain. It does not price
  it. Whether turning Mobile HDR off moves the frame on this content, and whether the blink's
  camera fade still renders with it off, are device questions the project already parked
  (`docs/research/STACK-OPPORTUNITIES-2026-10.md:194` "whether the `PlayerCameraManager` fade").
  The blink calls that fade at `apps/vr/Game/Source/MageArenaVR/Hands/MageArenaPawn.cpp:233`
  "StartFade(0.f, 1.f, Layout.BlinkFadeOutS, true);", so the post-pass row carries a comfort
  risk as well as a cost.
- **The verdict is about naming, not speed.** `better` means the list surfaced four rows
  that the tree had decided by default, and it broke nothing. A device capture at the first
  device sprint is the instrument that would turn the post-pass row into a cost.

## The boundary this tree adds

An allowance that lives in a plan and is not checked against the configuration is a second
authority, and here it lost to the code inside one phase. So each row of the list names the
key or line that enforces it. A row with no such line is marked unenforced, and until it gets
one, the code is the allowance. This is now a decision rule in the technique.

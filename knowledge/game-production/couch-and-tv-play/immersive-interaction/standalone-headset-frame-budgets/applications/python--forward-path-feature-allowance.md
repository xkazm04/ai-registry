---
layer: application
type: application
subject: standalone-headset-frame-budgets
technique: forward-path-feature-allowance
stack: python
status: draft
verified_on: 2026-10-26
verified_against: python@3.11
applied: code
ab_verdict: better
proof: before-after
---

# A forward-path area light that was switched off, not unsupported

Source tree: `bp` (public, github.com/xkazm04/bp) on `master` at `6bc4f02` (first read at `d8b1fea`). The paths below
are from its root. The engine is Unreal Engine 5.8.4, witnessed by the version string every
commit in that tree carries ("UE 5.8.4-58902052"). The stack is the engine's embedded Python 3.11 (3.11.8 by its
`python --version`), which runs the level steps, plus the project ini. The project renders a seated light-table
scene on the forward path with 4x multisampling and instanced stereo. It runs tethered on a
PC-class GPU, so this is the gate-before-striking section's "any forward path" case, not
the tiler case.

## What the tree decided before

An earlier package found that rect (area) lights "lit nothing" under forward shading. It
replaced the table's under-light with spot lights and recorded the swap as a platform fact
in its run notes. The same project had reflections set to "none", with no probe placed
anywhere in the level, and static lighting disallowed. Its glossy props read as flat
plastic, the owner-judged scorecard listed the studio among its weakest elements, and
nothing warned.

## The gate, read from the engine's source

A research pass read the installed engine's forward lighting shader. It found the
area-light branch skipped unless a project-level flag is set, named for translucent
surfaces but governing every forward-lit surface. The flag is now on:

- `apps/vr/Config/DefaultEngine.ini:136 "r.Translucent.UsesRectLights=True"`
- `apps/vr/Config/DefaultEngine.ini:70 "r.AllowStaticLighting=True"`
- `apps/vr/Config/DefaultEngine.ini:51 "r.ReflectionCaptureResolution=256"`

With one shader rebuild (about 4 minutes under an emulated editor), the area key came back
under the glass.

## The probes, placed and then dimmed

A box probe for the room and a sphere probe at the table were placed. After the first light
build re-captured them, the aluminium frame and the desks mirrored the glowing sheet white.
The step now dims both:

- `apps/vr/tools/mcp-steps/py/fid_look.py:40 "CAPTURE_BRIGHTNESS = 0.25"`

## Verdict and what it does not show

The whole-scene capture from the concept's camera went from about 19 to about 25-30 of 45 on
the owner's reading. That round also changed assets and grading, so the light changes are
not isolated: `before-after`, not paired. The owner judged two probe brightnesses side by
side a tie ("medium"). So the probe rule here is "re-read and adjust", and no brightness
number is offered as a standard. Draws fell from 144 to 113 at the scoring pose, and frame
p95 was 9.52 ms (CSV profiler, Simulator, uncapped), inside the project's budget.

The realization cannot say anything about a standalone tiler: the scene never ran on one.

## The allowance rows the next two days added (re-read 2026-10-26 at `6bc4f02`)

The fidelity sprint ran about twenty more build rounds on the same path. It probed each feature it
wanted at the scoring pose before tuning it, and read the engine's shader source where a probe was
ambiguous. These are the rows it added. They are dated facts about Unreal Engine 5.8.4 on the
forward path with 4x multisampling and instanced stereo, not general rules.

| Feature | On this path | Witness |
| --- | --- | --- |
| Local fog volumes | draw nothing | a probe at extreme density in front of the eye changed nothing; no gate found |
| Volumetric fog | runs; scatters point and spot lights well, area lights barely | per-light scattering tests at the scoring pose |
| Fog scattering of baked light | greys every wall in a dark room | wall median 111 split into veil, static scattering and movable scattering |
| Skin diffusion profile | shades as default lit | the engine's material evaluation sets only a "post-process subsurface" flag, a pass forward never runs; captures matched default-lit pixel for pixel |
| Anisotropic specular | ignored under area lights, and it disables area integration | engine comment: "anisotropy completely disables area integrations. Lights fall back to punctual." |
| Distance-field ambient occlusion | absent | runs only inside the deferred lighting branch |
| Capsule shadows, specular-only lights | work | engine source; a specular-only glint light placed and tuned |
| Planar reflections | available per material, with a global clip plane on every shader | engine source; rejected on cost |

The probes are recorded beside the values they decided:

- `apps/vr/tools/mcp-steps/py/fe_atmos.py:11 "Local Fog Volumes were tried first and draw nothing on this path (a 20/m red test sphere in front of the eye left"`
- `apps/vr/tools/mcp-steps/py/import_hands.py:9 "subsurface (no screen-space diffusion; r4)"`
- `scripts/art/light-table-frame/build_frame.bpy:18 "UE's rect lights ignore Substrate anisotropy, so the textures carry the brushing"`

**A boundary this application shows and the technique does not yet state.** The skin row is a
feature that renders *something*. It is not missing: it silently falls back to a cheaper model.
The technique's trigger, "a feature renders nothing", never fires, and the skin looked like skin
until a pixel comparison against the plain model showed they were identical. Recorded here as
evidence. The amendment is banked untriaged in the run's source note.

Two of these rows cap scored elements at "reads as the concept's", not "matches": the room's haze,
and the skin of the hands, which a blind panel called "smooth, like a mannequin's"
(2026-10-25). On this path those are path decisions, not tuning rounds.

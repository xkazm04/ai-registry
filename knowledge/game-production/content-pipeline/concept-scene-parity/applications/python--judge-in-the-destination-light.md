---
layer: application
type: application
subject: concept-scene-parity
technique: judge-in-the-destination-light
stack: python
status: forged
verified_on: 2026-10-26
applied: code
ab_verdict: better
---

# Python: an in-context review rig in Blender, and reflection probes in Unreal

bp's VR light table (`apps/vr`, Unreal Engine 5.8, forward VR path) is dressed with studio
props finished offline in Blender. Two Python scripts carry this technique: a Blender
review rig that renders each finished prop under the studio's light, and an editor step that
gives the Unreal scene a reflection environment. Read at bp commit `d8b1fea` on 2026-10-25; citations re-resolved at `6bc4f02` on 2026-10-26 (line numbers moved, quotes unchanged).

## The rig states its reason

scripts/art/studio-kit/render_context.bpy:2 "a grey studio flatters nothing"
The research note that produced this rule found the old evidence renders were grey-studio
Cycles renders, while the engine had shadows mostly off, nothing baked and no reflection
capture. The rig copies the engine's shadow and occlusion policy rather than improving on it:
scripts/art/studio-kit/render_context.bpy:5 "no light casts a shadow and there is no screen-space AO: what grounds a prop"
scripts/art/studio-kit/render_context.bpy:6 "is what its own bake carries."
Each light is the scene's light by name and colour, converted from candela:
scripts/art/studio-kit/render_context.bpy:206 "# TableUnderLight through the glass"
scripts/art/studio-kit/render_context.bpy:208 "# LampPractical on the desk lamp"
and the set render is taken from the scoring camera:
scripts/art/studio-kit/render_context.bpy:211 "# BpView.Pose target: eye (-75, 0, 138) cm, pitch -31, yaw 0 (towards +X), hfov 90"
Every render is written beside its crop of the concept (`-vs.png`), which is the
technique's step 2.

## The reflection environment, in the engine

The Unreal side found the black-mirror failure from the engine source (forward reflection
method 0 still uses placed captures; there were none) and fixed it with placed captures:
apps/vr/tools/mcp-steps/py/fid_look.py:11 "them every glossy surface reflected only the black sky capture"
The boundary case is recorded where the number is set: the light build re-captured the
probes, and the glowing sheet was mirrored onto every glossy surface.
apps/vr/tools/mcp-steps/py/fid_look.py:39 "mirrored it white (after the light build recaptured them, Lynx 2026-10-24)"
apps/vr/tools/mcp-steps/py/fid_look.py:40 "CAPTURE_BRIGHTNESS = 0.25"

## The verdict

The intake run `intake-vr-fidelity-20261024` put two arms of the studio shelf in front of
the owner, both rendered in the scene's light: scripted boxes without bevels against the
finished prop (bevels, weighted normals, unique UVs, CC0 scanned materials, baked AO). The
owner chose the finished one ("Bookshelf is ok, but it is in the background and does not
matter"). `ab_verdict: better` records that pair. **It is unblinded**: the owner answered
in words and the director mapped them onto arms. Strictly, the pair tested the finishing
judged under this rule, not the rule against a grey-studio review; the rule's own effect
has no arm. The owner's "does not matter" is the salience lesson taken into
cap-attribution-before-the-next-round.

A second pair tested the boundary case directly: the same frame at probe brightness 1.0 and
0.25. The owner called it "medium", a tie. That is why the technique says "re-read and
adjust" and carries no brightness number.

## Deviations recorded

- **The rig was tuned once and has drifted from the scene.** It says so itself:
  scripts/art/studio-kit/render_context.bpy:204 "tuned once against captures/l34-wp5-target.jpg"
  The light round that followed changed the scene's fill to a warm white
  (apps/vr/tools/mcp-steps/py/fid_look.py:35 "FILL_CD = 22.0"), dropped the sky light to
  0.04 (apps/vr/tools/mcp-steps/py/fid_look.py:110 "SKY = 0.04") and added reflection
  captures; the rig still has a cool fill, a 0.15 world and no probe
  (scripts/art/studio-kit/render_context.bpy:97 "default_value = 0.15"). Its verdicts
  match the scene as it was before the sprint's light round. **Upward lesson, taken into
  the technique:** the rig must be derived from the scene's light definition, or re-derived
  after every light round.
- **The tone transform differs.** The rig renders through Blender's AgX
  (scripts/art/studio-kit/render_context.bpy:92 "view_transform = 'AgX'") while the engine
  runs its filmic curve; the rig does not say so beside its verdicts.

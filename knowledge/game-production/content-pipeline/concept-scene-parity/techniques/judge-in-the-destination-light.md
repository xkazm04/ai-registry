---
layer: technique
type: technique
subject: concept-scene-parity
technique: judge-in-the-destination-light
status: forged
laws: [a-verdict-is-bound-to-its-content, one-authority-per-quantity]
shared_with: []
use_when: [reviewing a finished prop or texture before it is placed, assets pass review and still read as a generation old in the scene, glossy surfaces read as black or as one bright panel, the scene's lighting was just rebuilt]
---

# Judge every asset under the destination's own light

The named concern: assets are reviewed somewhere, and where they are reviewed decides which
defects anyone sees. A neutral grey studio with a soft key, a fill and a white floor is the
default review light of every content tool, and it flatters exactly the defects that make a
real-time scene look dated: edges with no bevel to catch a highlight, roughness that is one
value across a whole surface, and occlusion that was never baked. All three are invisible
under even light and obvious under a dark scene with a few practical lights. So the asset
passes, is placed, and fails where nobody is reviewing it any more.

## The rule

An asset contributing to the scene is reviewed only under the destination's own light:

- the same darkness and exposure;
- the same practical lights, with their colours and rough positions;
- the same shadow policy (if the scene's lights cast no shadow, neither do the review's);
- the same ambient occlusion policy (if the runtime has none, the review has none, and what
  grounds the asset is what its own bake carries);
- the same reflection environment;
- the same tone mapping, as near as the review renderer allows.

Where the review renderer is not the runtime, the rig is built to match the runtime's
setup and says where it cannot. A verdict given under a different light is a verdict about
a different asset, and it is recorded as such rather than carried forward.

## The rig is derived from the scene, not tuned once beside it

A review rig matched by hand to one capture of the scene is correct on the day it is tuned
and drifts from then on, because the look rounds that follow change exactly the things it
copied: a fill drops and turns warm, an ambient term falls, reflection probes appear. The
scene's light setup is the one authority on the destination's light, and the rig adapts
into it. Generate the rig from the same definition the scene is built from, or re-derive it
after every light round and say which round it matches. A rig that matches the scene as it
was two rounds ago is a grey studio with better manners.

## The reflection environment is the part that gets forgotten

Glossy surfaces show what is around them, and a real-time renderer shows them what its
reflection environment holds. Two failures recur. With no reflection probe placed, every
glossy surface reflects an empty or black sky capture, and metal, glazed ceramic and
lacquer read as dull plastic. A renderer's setting that seems to switch reflections off may
still use placed probes and only stop computing anything else, so "off" is not the same as
"black"; the setup is read from what the renderer does, not from a setting's name. With a
probe placed beside a large bright panel, the panel is mirrored onto every glossy surface
in range, and a silver frame or a dark desk reads as a white sheet.

Probes are captured when the lighting is built. So **a lighting rebuild re-captures the
probes and invalidates every earlier read of a glossy surface.** Re-read them after every
bake. The adjustment that follows, probe brightness or placement, is a judgment made in the
capture rather than a number carried between scenes; one judge looked at two probe
brightnesses beside a bright panel and called them a tie.

## Procedure

1. Build the review rig from the scene's lighting setup, not from the tool's default.
   Record which runtime settings it matches and which it cannot.
2. Render each asset in it, at a three-quarter view and beside its crop of the concept.
3. Review there, and only there. A grey-studio render may still be produced for a mesh
   check; it is not an art review.
4. Place the asset and review it again from the scene's scoring camera.
5. After every lighting rebuild, re-read every glossy surface in the scoring capture.

## Decision rules

- **When an asset passed review and reads wrong in place, check the review light first.**
  The asset may be fine and the review blind.
- **When a glossy surface reads black, look for a missing reflection probe before touching
  the material.**
- **When a glossy surface reads as a bright sheet, look at the nearest probe's neighbours
  before lowering roughness or specular.**
- **When the lighting is rebuilt, every look verdict on a glossy surface is stale.**
- **When a light round changes the scene, the review rig is re-derived before the next
  asset review,** and the review records which round its rig matches.
- **When the review renderer cannot match a runtime setting, say so beside the verdict**
  rather than letting the difference pass silently.

## When not to use this

- For a technical mesh check (topology, budgets, normals), where even light is the right
  instrument because it hides nothing structural.
- When the destination light does not exist yet; build a provisional rig from the concept
  and mark every verdict provisional until the real one stands.
- For assets that will appear under many lights, review under the harshest and the most
  common of them rather than an average of all.

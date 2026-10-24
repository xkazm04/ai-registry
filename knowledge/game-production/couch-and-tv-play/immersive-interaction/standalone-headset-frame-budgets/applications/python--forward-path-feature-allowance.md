---
layer: application
type: application
subject: standalone-headset-frame-budgets
technique: forward-path-feature-allowance
stack: python
status: draft
verified_on: 2026-10-25
verified_against: python@3.11
applied: code
ab_verdict: better
proof: before-after
---

# A forward-path area light that was switched off, not unsupported

Source tree: `bp` (public, github.com/xkazm04/bp) on `master` at `d8b1fea`. The paths below
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

- `apps/vr/tools/mcp-steps/py/fid_look.py:38 "CAPTURE_BRIGHTNESS = 0.25"`

## Verdict and what it does not show

The whole-scene capture from the concept's camera went from about 19 to about 25-30 of 45 on
the owner's reading. That round also changed assets and grading, so the light changes are
not isolated: `before-after`, not paired. The owner judged two probe brightnesses side by
side a tie ("medium"). So the probe rule here is "re-read and adjust", and no brightness
number is offered as a standard. Draws fell from 144 to 113 at the scoring pose, and frame
p95 was 9.52 ms (CSV profiler, Simulator, uncapped), inside the project's budget.

The realization cannot say anything about a standalone tiler: the scene never ran on one.

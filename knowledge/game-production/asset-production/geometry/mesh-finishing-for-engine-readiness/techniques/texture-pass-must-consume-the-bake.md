---
layer: technique
type: technique
subject: mesh-finishing-for-engine-readiness
technique: texture-pass-must-consume-the-bake
status: forged
laws: [declaring-an-input-is-not-consuming-it, one-authority-per-quantity]
shared_with: []
use_when: [sending a finished mesh to a generative texturing service, colour and surface detail disagree on a baked asset, deciding whether to texture before or after the bake, routing parts between texturing tools]
---

# A texture pass must consume the bake

## The concern

The finishing chain ends at binding, and then the asset goes somewhere to be coloured.
That next stage is routinely a generative service: hand it the mesh, get back a base
colour map. The mesh you hand it already carries a normal map you paid a high-to-low
bake to produce.

**Most generative texturing services do not read it.** They condition on geometry and on
their own renders of it, and they emit colour. The normal map rides along on the material
as a declared input that nothing in the service consults — it validates, it round-trips,
it is present in the exported asset, and it had no influence whatever on the pixels that
came back. The result is an asset whose colour and whose surface direction describe two
different objects: a panel line the bake put in the geometry that the colour does not
follow, a rivet the colour paints where the normal map is flat, shading cues in the
albedo fighting the ones the normal map produces under a moving light.

This reads as a texturing quality problem and it is not. It is the finishing bench's
problem, because the bench's whole discipline is which operation runs on which version of
the asset and what it is allowed to claim afterwards — and here a downstream operation
silently invalidates the most expensive output the bench produces.

## The rule

**The surface has one authority per property, and a texture pass that cannot consume the
baked maps is claiming one it was not given.** Before a generative texture pass runs on a
baked asset, establish which of three cases you are in and route accordingly.

**The texturer consumes the bake.** It takes the normal map as a conditioning input and
produces colour consistent with it. This is the case you want and it is the one to select
tools for. Verify it rather than assuming it — the presence of an input slot is not
evidence that the value reaches the model.

**The texturer ignores the bake, and the part's normal detail is low.** A part whose baked
normal carries little relief — a smooth head, a simple form whose detail was always going
to be colour — can round-trip through an ignoring texturer with no visible contradiction,
because there is barely anything for the colour to contradict. This is a legitimate route
and it is worth taking for the parts that qualify.

**The texturer ignores the bake, and the part's normal detail is high.** This is the case
that must not proceed. An armoured piece, a carved surface, anything whose bake was the
reason the high-density source was generated at all — the contradiction is exactly as
visible as the detail was valuable. Route the part to a texturer that consumes the maps,
or author the colour before the bake and let the bake land on top of a surface that
already agrees with it.

## Procedure

1. **Census the readers, not the writers.** For every map the finished asset carries,
   establish whether the next stage actually reads it. The question is never whether the
   asset has a normal map; it is whether anything downstream consulted one.
2. **Probe rather than trust the interface.** Run one part with a deliberately strong
   baked normal through the service and look at whether the returned colour follows it.
   A documented input that no output responds to is an ignored input, and this test costs
   one part.
3. **Classify each part by normal salience** — how much of the part's read comes from
   baked relief rather than from colour. This is the routing key, and it is a property of
   the part, not of the asset.
4. **Route per part, not per asset.** A character will legitimately split across two
   texturing paths, and forcing one path on all of it wastes either quality or budget.
5. **Record which path each part took, with the tool and its version.** When the colour
   and the relief disagree three stages later, this record is the difference between a
   diagnosis and a re-bake of everything.
6. **State the ordering in the asset's own report.** Colour-before-bake and
   bake-before-colour are different pipelines with different failure modes, and an asset
   that does not say which one produced it cannot be debugged.

## Decision rules

- **A declared map that no consumer reads is reported as ignored at the moment it is
  declared**, not discovered when the render looks wrong. An asset exported with maps the
  next stage discards is carrying a claim it cannot support.
- **Normal salience is the routing key, not part size or importance.** A large plain
  surface is safe to round-trip; a small heavily-carved one is not.
- **Where colour must be authored after a bake by a tool that ignores it, the bake was
  wasted** — either change the tool or move the colour earlier. Do not ship both and hope
  the lighting hides it; a moving light is precisely what exposes it.
- **Two authorities on the surface is worse than one.** If the texturer produces its own
  implied relief through shading cues painted into the albedo, and the normal map produces
  real relief, the asset has two answers to one question and the disagreement is invisible
  until it is load-bearing.
- **This is a per-version fact about the service and it expires.** Providers add map
  conditioning between releases. Re-probe on a version change rather than carrying an old
  verdict forward.

## When the round trip does not exist at all

The three cases above assume you can hand the service a mesh. A provider may refuse that
outright: some re-texturing endpoints accept **only a task id from their own prior
generation**, so an externally finished mesh — one your bench reduced, unwrapped and baked
— cannot be submitted at any price. Probing the service is then not merely uninformative,
it is unrunnable, and a pipeline built on the expectation of a round trip has no path.

This is the strongest form of the constraint rather than an exception to it, and it moves
the decision upstream. Where the texturer only textures its own output, generator-textured
and bench-baked are **disjoint product lines**: an asset either comes back coloured from
the generator and never receives a bake, or it is baked by the bench and must be coloured
by something else entirely. Nothing crosses. So the routing key is still normal salience,
but it is applied at *generation* time to choose which line the asset enters, not after
finishing to choose a texturer — and choosing wrong is not a quality defect that a later
pass repairs, it is a commitment that costs the whole asset to undo.

Establish which shape your provider has before designing the stage, because the two
demand different pipelines: one needs a probe and a per-part route, the other needs a
decision at commissioning and a second texturing engine budgeted from the start.

## When not to use this

- **When nothing was baked.** A part generated directly at low density with no dense
  source has no baked detail for a texture pass to contradict, and it round-trips freely.
- **When texturing happens entirely inside your own material system.** A layered material
  authored against the asset's own maps reads them by construction; the failure here is
  specific to handing the asset to a stage that reconstructs the surface independently.
- **When the asset is stylised or flat-shaded** and never carried a normal map in the
  first place.

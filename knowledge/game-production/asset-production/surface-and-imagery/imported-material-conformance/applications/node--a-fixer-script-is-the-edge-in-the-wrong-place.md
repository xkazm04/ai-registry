---
layer: application
type: application
subject: imported-material-conformance
technique: a-fixer-script-is-the-edge-in-the-wrong-place
stack: node
status: forged
verified_on: 2026-10-06
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Moving a remembered sRGB fix into the edge, in a Node material pipeline

## What was opened

A Next/TypeScript game-production pipeline with a material lab. The lab sends one
material across three edges: a three.js preview, Blender through a bridge, and a
generated Unreal Engine Python script that builds a MaterialInstanceConstant of a shared
master. The pipeline had already done the hard half of this subject. One module holds the
per-role channel table (albedo is sRGB; normal, metallic, roughness and AO are linear),
the single sRGB decode and the single texture resolver, and all three projections read it.
A swatch test asserts that no projection restates a colour-space literal.

The corrector was not a script. It was a person. The UE projection binds only textures
that are already in the project's content browser, so the pipeline never imports a
texture itself; someone drags the maps in by hand. UE imports every texture with sRGB on,
except one it recognizes as a normal map. The generated script compared each bound
texture's flag with the role's flag from the table, then **logged a warning and saved the
instance anyway**. The fix was a manual untick in the texture editor, re-applied from
memory on every delivery, which is the technique's first two symptoms exactly.

**The witness for that version:** the tree pins no runtime in CI and declares no engines
field, so `node@24` is taken from the `@types/node` major in its manifest.

## Why this seam was chosen to falsify

The technique places the edge **before** the import, and this pipeline does not own the
import at all. If the rule could not be moved here without turning the generated script
into a second post-import corrector, the technique would be wrong for every project that
consumes assets someone else imports. That is the outcome the seam could have returned.

## The paired run

Both arms are the pipeline's own generated scripts for the same material: A from the
commit before the change, B from the change. Each was executed in Python against a stub
`unreal` module whose textures carry UE's import defaults (sRGB on, except a texture
named as a normal map). After each run, the harness read every bound texture's flag
against its role. UE itself was not run; the stub's defaults are the stated assumption.

| Case | A: wrong after run | A: corrections | B: wrong after run | B: texture writes |
| --- | --- | --- | --- | --- |
| Five-role set, delivery 1 | 3 (metallic, roughness, AO) | 0, 3 warnings | 0 | 3, exactly the wrong ones |
| Five-role set, deliveries 2 and 3 (fresh imports) | 3 each | 0 | 0 | 3 each |
| One texture bound as albedo and AO | 1 (AO) | 0 | 0, AO slot refused and named | 0 |

**Target:** bound textures sampling in the wrong colour space after the script ran. A: 9
of 15 across three deliveries. B: 0 of 15.
**Floor:** albedo and normal never written, the instance's parameter set unchanged, and
the pipeline's own visual-generation suite green (1,411 passed, 3 skipped). The floor held.

## What the change is

The script now sets the role's flag on the texture asset and saves it when the two
disagree, and logs which texture it changed and why. The emitter, which sees every slot
of the material before any Python is written, refuses one asset bound into two roles of
opposite colour space and names it in the export report. sRGB is a property of the
texture asset, not of the slot, so no value of the flag is right for both slots.

## What the run says about the technique

The rule held, and the seam supplied a boundary case it does not state. **When the
project does not own the import, the earliest crossing it does own is the edge, even
though that crossing runs after the import.** What made arm A a corrector was not its
position in time. It was that the fix lived in someone's memory, prompted by a log line.
Arm B applies a boundary rule (uniform across every delivery, derived from the two
conventions) from the same table every other projection reads, on every build, with a
stated input. Measured against the technique's own symptom list, it has none of them.

The tree also held a dormant second authority. An older Blender texture script, with no
caller in the tree, decides colour space with its own literal (`not base colour` means
Non-Color) instead of reading the table. It agrees with the table today, which is why it
has not been noticed, and it is the kind of second theory the technique says outlives the
fix.

## What this realization cannot do

- **It sees one material at a time.** A texture bound as albedo in one instance and as AO
  in another is flipped by whichever script ran last. Only a pipeline-owned texture import,
  or a check of the asset's other referencers, would close that case.
- **The UE defaults are assumed, not observed.** The return condition is one run in a real
  editor over a delivered PBR set, reading the flags back.
- **It writes a texture asset the pipeline did not import.** That is the price of having no
  import edge. If the pipeline grows one, the flag belongs there and this branch becomes a
  read-back check.

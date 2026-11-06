---
source: "github:robbietilton/Compositor @ 3e81af3f"
kind: repository
url: https://github.com/robbietilton/Compositor
title: "Compositor, a macOS layer editor, read for tooling to design and process keyframes headless"
author: "robbietilton (Wonder Assembly LLC)"
words: 85227
extracted: 14
accepted: 0
declined: 0
leads: 5
already_covered: 3
untriaged: 4
dispatched: 0
applied: 0
shipped: 0
run_id: shift-compositor
siblings: 1
fetches: 0
rescan_when: "upstream ships a command-line renderer, or a blend kernel of its own, in the tree; or Composa.Core's renderer gains a documented headless entry point; or 8 weeks elapse (2027-01-01)"
---

# Compositor, read for headless keyframe tooling, mined under /shift, 2026-11-06

Plan `plan-repos-20261106`, cluster `compositor-headless-keyframes`, an operator exception to the
non-media focus. The operator's question: what could we build and use headless for keyframe design
and processing? One repository, one author, so no convergence. Phase 7.7: gate=skipped (unattended
shift). **Accept threshold +3 for this shift.** Currency and leads ran under the corroboration table.
The tree was read and never built or run. Expected yield was one or two design rows and mostly
catches, and nothing cleared the bar.

## The answer

**Nothing in this repository runs here.** Its only renderer is the macOS app: no command line, and by
the miner's count 121 of 184 Swift files import AppKit or SwiftUI. The `.comp` format can be written by anything, but
nothing in the tree renders it without the open window.

What survives: the shape of a layer document (plain JSON plus PNGs, assets written first), a colour-only
stack folded into one lookup table, and one plain C region fill, `patch_fill`. The larger finding is that
the pixel operations are already free on this box in ARM64 ffmpeg, Blender and ComfyUI core nodes, and
the consuming pipeline's path from generated still to video model holds only a format conversion.

## Triage

Miner's scores were re-run on this read. RISK 0 means the named lines were opened at the pinned commit.

| # | Candidate | Anchor | Shape, rule | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|
| 1 | Composite a repair over the original | `PatchPixels.h:6` | technique | likely catch | n/a | already covered: `partial-regeneration-seams`, "Composite when the tooling allows it", opened |
| 2 | Bind the look on the anchor | consumer path | technique | likely catch | n/a | already covered against the prompt: `generated-shot-sourcing`, "The import is also the lever", opened. Against a grade at the cut: unowned, held row `shift-compositor-grade` |
| 3 | Fold colour stages to a table | `AdjustPixels.h:40` | technique | likely catch | n/a | already covered: `deferred-operation-fusion` |
| 4 | A format offered as an agent API needs a checker the writer can run | `docs/writing-comp-files.md:68` | correction, Phase 5 | partial | 1/0/1 | untriaged, net +1, under +3. `format-generations-are-declared` step 4 requires a typed refusal for readers only, so the writer's half is a small real extension |
| 5 | Parity with a tool and physical light choose different blend spaces | `SeparableBlend.swift:16`, ComfyUI `compositor_blend.py` | design, Phase 5 | real gap | 2/0/2 | untriaged, net +2, under +3 and render-bound without a verdict |
| 6 | An end frame sharing the start's bytes holds a fixed camera | operator's fault record | lead, table | real gap | n/a | lead, held row `shift-compositor-plate` |
| 7 | Port the PatchMatch fill | `PatchPixels.h:6` | lead, table | partial | n/a | lead, proposal 4 |
| 8 | A UI-free renderer exists in a port | Composa | lead, table | thin | n/a | lead. Needs a .NET 10 SDK, an install |
| 9 | Relight a still from depth and normals | `RimLight.swift:53` | lead, table | thin | n/a | lead. Return when a keyframe's fault is lighting |
| 10 | Measure a closed tool into tables | `CameraRawTables.swift:4` | lead, table | partial | n/a | lead for the method only, aimed at a video VAE's colour shift. See the provenance limit |
| 11 | Position-seeded grain is a still-only design | `AdjustPixels.h:12` | correction, Phase 5 | likely catch | 1/1/1 | untriaged, net 0. The line is confirmed; the film failure is from training data, not measured |
| 12 | Probe an 8-bit operation into 16-bit | `DeepPixels.h:5` | design, Phase 5 | thin | 2/0/2 | untriaged, net +2, under +3 and no consumer |
| 13 | Layer and colour nodes ship in ComfyUI core | `nodes_compositor.py:487`, `nodes_post_processing.py:678` | currency, table | real | n/a | currency, recorded here. Node names confirmed in this box's install. No compositing home exists to carry a dated row |
| 14 | A 46,000-line Mac app was ported three times within two weeks | GitHub metadata | currency, table | signal | n/a | currency, recorded here |

Admission: auto=0/4/0, fp=0. **Accepted 0.** No Phase 5 row reached +3 on any read, and none would have
landed at +2 either: rows 5 and 12 sit at +2 with no verdict or no consumer. Rows 4, 11 and 12 are under
the bar with their anchors kept. Row 5 re-enters after a cut-out edge is rendered in both spaces.

## Discriminator: opposite defaults on blend space

Convergence counts voices, and here there is one voice plus a second author who disagrees. Compositor blends
every mode in gamma-encoded sRGB because its oracle is Photoshop: `SeparableBlend.swift:14-16` gives the
80 % over 40 % grey case and says "the blend has to happen in the same sRGB the canvas is in". ComfyUI
declares a space per mode. **Parity with an artist's tool picks one space everywhere; physical light through
an edge picks linear for coverage.** Generated keyframes have no retoucher to match, so neither wins by default.

## Promotion read

| Claim | Result |
|---|---|
| Licence MIT, Wonder Assembly LLC; `.comp` writable by anything; silent refusal; format version 21; `patch_fill` signature; colour stages compose into one lookup; grain from position and seed | Confirmed at the pinned commit |
| Blend math is not in the tree | Confirmed at the lines named: `LayerAppearance.swift:26,51` route to platform filters |
| Composa needs .NET 10 | Confirmed: its `global.json` asks SDK 10.0.100. The project is at `src/Composa.Core`, on SkiaSharp and ONNX Runtime. Its csproj names a Linux native asset; win-arm64 still unverified |
| Upstream current | Yes: 3e81af3f is still its default branch's head |
| Miner: arm A of the end-frame proof may already exist in the rushes | **False.** The plan and the clip ledger give the three shots no end frame, so that arm must be made. The fault was recorded on shots with no end frame, while the shots that do carry one had little character action, so the record cannot say an end frame helps |
| Miner: the assets live in the consumer's checkout | **Corrected.** They sit in the operator's working folder, outside any repository; a scheduled task names it |
| Miner: force a planar RGB format for ffmpeg colour work | **Half false.** `maskedmerge` in `gbrp` kept every byte where the mask is 0 (measured on a real keyframe). `haldclut` fed `gbrp` turned the same keyframe purple. In `rgb24` it sits 0.96 of 255 from the direct chain, and an identity table 0.99 |
| Miner: system Python holds numpy | True, but not under `python -I`, which skips the site directory holding it |
| Miner: ffmpeg on the bash PATH is x86-64, so the pipeline probably runs it emulated | **Confirmed from the header.** See below |

A trap found in the consumer's runner and written into both rows: a clip's seed is the base plus the frame id's
index in the sorted keyframe list, so a differently named arm silently changes seed. Its end-frame support on this
keyframe format exists only as uncommitted work in that checkout, so the rows pin the file's hash and stop if it moves.

**The ffmpeg fact, read and unchanged.** The binary both PATHs resolve to has PE machine `0x8664`, AMD64, with no load
configuration directory, so no ARM64EC metadata: plain x86-64. On this ARM64 box it can only run emulated. The
project's own environment file names the same binary, so that override does not avoid it. An ARM64 build
sits unused beside it (machine `0xaa64`). Its cost was not measured, and nothing was changed.

## Render proofs banked

Both use the operator's own trailer assets, original robots with no third-party IP, and only models on disk. Both are
`render`-bound, so neither lands without the operator's blind pick. The two ffmpeg graphs were proved on a real
keyframe in scratch; no GPU job ran.

| Row | Question | Arms | Est GPU |
|---|---|---|---|
| `shift-compositor-plate` | Does a closing frame sharing the opening frame's background hold a fixed camera? | Three per shot: no closing frame, repainted, locked. Shots with near-camera action and one without | 110 min |
| `shift-compositor-grade` | Does one look applied before animation beat the same look applied at the cut? | Two per shot, three kinds of shot | 55 min |

Not banked, and what each lacks: repair by CPU fill (no segmenter on disk, and masks by hand need a person); blend space on
a cut-out edge (row 5's return, not named for this dispatch); relight and VAE colour drift (leads only).

## Proposals, not built

Each adds a capability to the consumer, so each is a Phase 7.6 direction for the operator, not shippable on the
standing authorization.

1. **A `.comp`-shaped recipe with a checker.** A layer document beside each keyframe, rendered by ffmpeg, assets
   first and the manifest renamed over. Do what `.comp` does not: name the refusal. The ports have already forked the
   version numbers, so `.comp` compatibility is only a convenience.
2. **A `keyfix` verb.** Splice one region over the stored original with a feathered mask and assert that bytes outside
   it are unchanged. Today's only remedy is a whole new draw.
3. **One look file.** A chain of curves, balance and hue baked to a table and applied at the stage the grade proof picks.
4. **Port `patch_fill` only,** MIT notice kept, if a repair example shows CPU fill earns it. It copies from the
   image, so it cannot redraw a shoulder.

**Composa.Core stays a lead.** It is the shortest route to a real headless layer renderer, but it needs an install and
reads no `.comp`. Return when proposal 1 proves adjustment layers and effects are wanted at scale.

## Provenance limit

`CameraRawTables.bin` and `CameraRawShadows.bin` are measured from and fitted to Photoshop's output. **They are not usable
here, are not to be vendored, and are excluded from every proposal.** The MIT grant does not settle what Adobe's licence says
about them, and that licence was not read. Row 10 keeps only the general method of measuring a black box, applied to
something of our own.

## Could not verify, and what was not done

- No Phase 7.5 row is owed: nothing landed in the upper layers.
- Whether BiRefNet isolates figures in these wide, busy frames. The plate row caps mask coverage and stops before any clip.
- Whether a Flux 2 repaint stands in for the consumer's own closing-frame route, which is a hosted seat and not on disk.
- Composa, CompositorWindows and compositorLX were read through the API only, and never run.
- The miner's timing and filter claims marked as estimates or memory stay that way. Its import counts were not re-counted.
- No subject note changed: no subject was touched. The two homes are named on the held rows.

# Render proof - generative-output bundles (v2.9.0)

Read this file at Phase 5 whenever a candidate's home is a bundle whose deliverable is a
rendered artifact. SKILL.md carries the rule; this file carries the procedure.

## Why this exists

Until 2.9.0 a finding about what a generator should be told - restate the style block, admit
the reference late, derive the head frame from the tail - landed on corroboration and a
Phase 7.5 row, and in `media-generation` and `game-production` that row was almost always a
`simulation`. The corpus therefore changed the instructions every consumer compiles into a
generation call **without anyone having looked at a single output produced under the old
instruction and the new one**. For prose-shaped findings that is a known, graded risk. For a
finding whose only observable is a picture, a clip or a mesh, it is landing blind: the claim
"B renders better than A" has exactly one instrument, and the run had not used it.

The first run under this clause (2026-09-14, `youtube:q_5QS7AlNgA`) found two corpus files
contradicting each other at the still-to-motion hop - one says restate the style block in the
motion prompt, the other says the anchor frame carries the look and the prompt only asks - and
a source siding with the second. Reasoning cannot settle that; rendering both arms can.

## Scope - when the clause fires

A candidate is **render-bound** when all three hold:

1. Its home is a render-bound area:
   - `media-generation/visual-generation/*`
   - `media-generation/production-ops/video-assembly`
   - `game-production/asset-production/*` (geometry, surface-and-imagery, motion-and-audio)
   - any other subject whose `use_when` names generating, rendering or accepting an image,
     clip, sprite, texture, mesh or animation
2. Its shape changes what a generator is told or how its output is prepared or accepted: a
   technique, an amendment, a golden-path correction, or a law reading - not a currency row
   or a lead.
3. Its effect is visible in 2D or 3D output. Audio-generation findings follow the same
   procedure with a listening sheet; it is recommended there, mandatory for 2D/3D.

A render-bound candidate **may not land without a render verdict.** When the instrument is
unreachable, it lands as a **lead** whose return condition names the missing instrument
(the model, the node, the GPU budget) - never as a technique with a `simulation` row.

## The instruments on this machine

Probe, never assume. Phase 1 already proves the corpus instruments; a render-bound run
also proves the generation instruments before Phase 5 scores anything:

| Output | Local route | Probe |
| --- | --- | --- |
| Still image, sprite, texture, keyframe | ComfyUI + Flux 2 dev (multi-reference via chained `ReferenceLatent`) | `models/diffusion_models`, `GET :8188/object_info/ReferenceLatent` |
| Video, first frame or first+last frame | ComfyUI + MiniMax H3 FL2VA (turbo LoRA), Wan 2.2 TI2V 5B | `comfy_extras/nodes_minimax_h3.py` inputs, model files present |
| 3D mesh | Blender (headless `--background --python`) renders a fixed turntable: same camera orbit, same three-point light, same frame count for both arms | `blender --version` |
| Sprite sheet / atlas | Flux 2 stills + a deterministic packer; triage the packed sheet, not the cells | - |

The resource discipline is not optional and is already written down in a connected tree:
the fleet project that runs this stack for its own consistency work carries a generation-ops
guard - resolve the project through the fleet map, import the guard read-only, do not copy it. Batch by
stage, never alternate engines per item; recycle ComfyUI before every clip; check commit
charge and disk, not free RAM; **never recycle while a foreign job runs**. Launch the render
detached with its stdout/stderr in the run's scratch directory and a resumable checkpoint -
every failure in this stack presents as silence.

## The arms

- **Arm A - the corpus as it stood at Phase 1.** Compile the brief exactly as the current
  technique instructs. When the finding amends a file, A is compiled from `git show HEAD:<file>`,
  not from memory of it.
- **Arm B - the corpus as the landing would leave it** (or, for a contested source claim, as
  the source instructs).
- **One variable.** Same brief, same anchors, same model, same seed(s), same resolution, same
  length, same sampler. If the finding needs two variables changed, it is two pairs.
- **Approaches, not a knob - and prove it before the operator looks.** A variable the rest of
  the pipeline drowns out produces two outputs a person cannot tell apart, and the triage is
  wasted. The first run under this clause did exactly that twice: a style block restated or
  omitted beside an anchor frame that already owned the look, then a reel at 24 unique frames
  per second against the same reel held on twos at a motion amplitude where holding is
  invisible. The operator: *"The outputs are basically identical ... It seems like we run two
  times the same process."* So before any sheet:
  1. Render the **same approach at a second seed** - the seed control.
  2. Measure the arms' distance from each other (`between`) and the approach's distance from
     itself at the other seed (`within`); mean absolute pixel difference over matched frames
     is enough for a floor - it cannot say which arm is better, only whether there are two
     different things to look at.
  3. `between` must clear **1.5x `within`**; record both as the pair's `discrimination` in
     the manifest. `render-triage.mjs sheet` refuses a pair without the record or below the
     ratio. A refused pair is redesigned one level up - a different rung of the conditioning
     ladder, a different pipeline stage, the whole method against its absence - never shown.
  The strongest pairs in these bundles are usually the **craft before and after**: the output a
  person gets without the method (text-only, no anchors, no sheet) against the method's
  output, and a craft decision with visible consequences (the model inventing a movement
  against the artist authoring its key poses).
- **Real briefs.** Take the brief from a consumer project's own production briefs when one
  exists; otherwise rebuild the source's demonstrated shot with **original** characters and
  places. Never render a third party's IP to test a technique - the platform recognising a
  famous character by name is a crutch the pipeline under test does not have.
- **Pick the shot that could falsify.** Same rule as Phase 7.5: if arm B cannot lose on the
  chosen shot, the pair is a demo.
- **Arm count travels with the verdict.** n=1 per arm is admissible and is written as n=1.
  Two shots of different kinds (an empty establishing plate and a character shot) beat two
  seeds of one shot, because the contested rules usually fail on different content.

## The triage

The run never grades its own render proof as the verdict. It may pre-read frames (and should
- a black clip or a crash is a re-run, not a triage item), and it writes that pre-read into
the note labelled as the director's opinion. **The operator's pick is the verdict.**

**Pre-read every upstream still before it becomes a reference, not only the arms.** A
multi-stage brief (style anchor -> plate -> keyframe -> clip) feeds each render into the
next, and a defect in a reference is inherited by *both* arms, so the pair stays fair and
tests nothing. On the first run under this clause, a role-labelled whole-scene style anchor
admitted at 0.2 of the denoise replaced the setting plate's composition outright (same peak,
same gulls in the same place, sea where the floor belonged). The pre-read caught it one still
later; the stage was stopped, the style reference re-admitted at 0.6 with a named negative
scope, and relaunched. Stop on a bad upstream still - a pipeline that keeps rendering on it
spends the GPU-hours of every downstream clip on a question it can no longer answer.

```sh
node scripts/render-triage.mjs sheet  <run-dir>                  # blind page + sealed key
# the operator opens <run-dir>/triage/index.html and answers per pair: X, Y, tie or neither
node scripts/render-triage.mjs reveal <run-dir> shot1=Y shot2=tie  # verdict.json
```

Ask the operator with `AskUserQuestion`, one question per pair, options `X`, `Y`, `tie`,
`neither usable`; the free-text `Other` is where the reason arrives, and the reason goes into
the note verbatim. Ask a second question only when the source made a claim a pair can speak to
(for example: "does the motion read as anime, or as realistic interpolation?").

Map the verdict to the closed vocabulary:

| Operator picks | `ab_verdict` for the landing | What lands |
| --- | --- | --- |
| B on every pair | `better` | the finding as drafted |
| A on every pair | `not-better` | a boundary amendment on the technique arm A came from, stating the condition under which B lost; the source's claim is recorded as a catch |
| split across pairs | `better` on the pairs B won, stated per content kind | a scoped amendment: the rule inverts by shot kind, and the discriminator is the sentence |
| tie on a pair that **passed** the discrimination precheck | `unmeasurable` for quality at this n: the operator saw two different outputs and could not prefer one | no upper-layer change; a lead naming what would separate them (more seeds, a longer clip, a question closer to the claim). If the corpus's own rule predicted the difference, the lead says so and names the rung and generator - **one tie never amends a technique** |
| tie on a pair that **did not pass** (or skipped) the precheck | none | not a verdict. The arms were two runs of one process; redesign them and render again. Record the wasted look in the note so the next run does not repeat the pair |
| neither usable | none - the brief or the anchors failed | re-run after fixing the upstream still; never a landing |

**A tie is the result most likely to be mistaken for evidence.** The first run under this
clause tied twice, read the first tie as a refutation of a corpus rule, and amended the
technique - the operator's "basically identical" showed the arms had never been
discriminable, and the amendment was reverted the same hour. The precheck exists so that a
tie, when it happens, is a tie between two things a person could see.

## Cleanup - after the verdict, never before

Generated media is large (a 3-second H3 clip plus its frames runs to tens of MB; the model
loads grow the pagefile by tens of GB) and it is not the product. The verdict is.

```sh
node scripts/render-triage.mjs clean <run-dir> \
  --also <ComfyUI>/output/<run-id> --also <ComfyUI>/input
```

`clean` refuses without `verdict.json`, deletes every media file under the run directory and
every `--also` path carrying the run id (inside a directory without it, only files whose names
start with the run id), and prints the bytes reclaimed. Record the byte count in the source
note. Keep `manifest.json`, `verdict.json` and the prompts: they are kilobytes, and they are
what makes the verdict re-readable. Stop ComfyUI only if this run started it. Phase 9 still
deletes the scratch directory by run id.

**Every output this run submits carries the run id as its `filename_prefix` and every staged
input starts with it.** A cleanup that has to guess which files are its own is a sweep.

## What goes in the record

- Source note, section `## Render proof`: the instruments proven, the arms (both compiled
  prompts verbatim), n, the operator's picks and reasons, the director's pre-read labelled
  as opinion, wall-clock per render, bytes cleaned.
- Application document for the landing: `applied: render`, `ab_verdict`, `proof: ab-paired`,
  `grader: operator`, and a sentence on what the render cannot show (identity at a distance
  the pair never tested, a model other than the one rendered).
- `librarian/applied.md` row with mode `render`.
- Scorecard `apply` cell: renders count as `r` (e.g. `0c/0e/0s/0t/2r`).

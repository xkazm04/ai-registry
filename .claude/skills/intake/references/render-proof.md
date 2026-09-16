# Render proof - generative-output bundles (v2.10.0)

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
| 3D mesh, rig, animation | Blender headless renders a **pose sheet** (`render-proof/pose_sheet.py`): key poses in columns, fixed orthographic cameras in rows, framing from the subject's rest bounds - one still per arm. Rigs first pass `render-proof/rig_check.py` | `blender --version`, then each instrument's `--selftest` |
| Sheet discrimination | `render-proof/sheet_distance.py`: foreground-masked distance + silhouette distance, the numbers `render-triage.mjs sheet` gates on | its `--selftest` |
| Real-time engine view (opt-in) | Editor screenshots of the asset in its usage context - only when the question cannot be asked without the engine (a material, lighting, a socket on a shipping skeleton) | see "Engine screenshots" below |
| Sprite sheet / atlas | Flux 2 stills + a deterministic packer; triage the packed sheet, not the cells | - |

The resource discipline is not optional and is already written down in a connected tree:
the fleet project that runs this stack for its own consistency work carries a generation-ops
guard - resolve the project through the fleet map, import the guard read-only, do not copy it. Batch by
stage, never alternate engines per item; recycle ComfyUI before every clip; check commit
charge and disk, not free RAM; **never recycle while a foreign job runs**. Launch the render
detached with its stdout/stderr in the run's scratch directory and a resumable checkpoint -
every failure in this stack presents as silence.

## 3D subjects: a clean rig first, stills not clips (v2.10.0)

Two consecutive 3D render proofs (2026-09-14, `youtube:3yXYIXczKXI` and `youtube:h_mR2BRibZ8`)
lost their perceptual pair to the **subject**, not to the approaches under test. The first used a
capsule with a cube for a hand as a usage context and the operator rejected it: *"Result does not
remind even closely realistic hold of the hammer"*. The second rigged a generated mesh whose fist
was welded to its thigh - a torn sheet at the top of every chop - and whose axe ended up partly
weighted to the leg; four animation arms inherited it, and the gate refused the pair. Both times the
rig was reported fine by the pass that built it, and both times an independent instrument said
otherwise. The operator's direction, the same day: comparisons must not depend on generating
video - compare rendered models, in stills or in the engine, and store the blind winner as before.

### The clean-rig precondition

**No motion, rigging or posing pair is designed until the subject passes `rig_check.py`** against
the poses the action will reach:

```sh
blender --background --factory-startup --python-exit-code 2 \
  --python .claude/skills/intake/references/render-proof/rig_check.py -- <rig.blend> <spec.json> <out.json>
# exit 0 clean, 1 findings, 2 could not run
```

- **Declare the extreme poses first.** A rig is clean *for an action*: the top of the windup, the
  bottom of the strike, the widest stance. Write them into the spec before any arm is keyed.
- **Mark rigid parts with a non-deform vertex group** (`rigid_axe` on the hand bone) - never an
  index list: a topology split renumbered the vertices and a stored list silently pointed at
  different ones.
- **The four findings and what each blocks:** `UNWEIGHTED` (the weight solve failed or skipped
  vertices), `RIGID_SHARE` (a weapon partly bound to another bone), `RIGID_DRIFT` (a rigid part
  leaves its bone's transform at a pose), `TEAR` (edges stretched past 2x - parts fused across
  bones). Defaults: 95% share, 1 cm drift, 2x stretch, at most 0.1% of edges.
- **A failing subject is repaired or banked, never animated for triage.** Repair attempts count
  against the stage budget stated before the stage began; an overrun is the operator's call. When
  the fleet has no clean rigged asset for the action, the row is a **lead whose return condition
  names that asset** - exactly like a missing renderer.
- **Never accept a rig's rigidity from the pass that built it.** The report, the rigger's own
  verification stills and an agent's "sampled frames" all certified defects that `rig_check` and a
  per-frame harness later measured.
- **Calibration, stated with it:** the self-test fixtures are authored by the same hand as the
  checks, so they prove only that the checks catch the defects that were planted. Real rigs
  calibrated it on 2026-09-14, all at the same four poses authored in world space (arms overhead,
  chop top, chop bottom, deep lunge):
  - A professionally weighted Mixamo mesh stretched **0** edges at every pose.
  - A Tripo auto-rigged character stretched **5,387 / 4,561 / 1,666 / 203** edges, with a maximum
    growth of 0.89 m. Its pose sheet shows a braid and hand fused to the thigh.
  - The lunge's 203 edges fell *under* the share tolerance while its sheet showed a spike. That is
    why TEAR also fires on any stretched edge that grows by more than 2% of the subject's height.

  Author poses in a **character frame** (forward, left, up derived from the rig), never as raw
  bone-local eulers. The same pose file then drives rigs with different facing, units and bone rolls.
  A new class of rig, such as a quadruped or a cloth-heavy costume, recalibrates before its numbers
  are trusted.

### The pose sheet is the 3D presentation

A 3D arm is shown to the operator as **one still image**: its key poses in columns, fixed cameras in
rows, rendered by `pose_sheet.py` from the arm's own scene.

```sh
blender --background --factory-startup --python-exit-code 2 \
  --python .claude/skills/intake/references/render-proof/pose_sheet.py -- <scene.blend> <spec.json> <run-id>_<arm>.png [<arm_script.py>]
blender --background --factory-startup --python-exit-code 2 \
  --python .claude/skills/intake/references/render-proof/sheet_distance.py -- <sheet_A.png> <sheet_B.png>
```

- **Identical framing for every arm on one subject**: orthographic cameras centred and scaled from
  the REST bounds (or a `frame` in the spec), never from the arm's own posed bounds - a wider swing
  must not shrink its own character.
- **Poses or frames are declared.** Static poses come from the spec; an animated arm is sampled at
  listed frames or at an even stride where one exists, and the card beside the sheet records
  kept-of-available and the actual frames.
- **No text on the sheet**; the card JSON carries the arm and frames and is never shown before the
  reveal. The sheet goes into the manifest as the arm's file; `render-triage.mjs` already serves
  images.
- **Discrimination for agent-authored arms** uses a replicate agent per approach as the floor (two
  agents on one approach), because authoring variance, not seed variance, is the noise; the same 1.5x
  rule applies to `sheet_distance.py`'s `masked_mean_abs`.
- **Why stills and not clips:** across both runs Blender rendered every still requested, a local
  video model ignored a speed instruction across three seeds, and an unattended engine capture pass
  returned 7 of 16 screenshots. A still is also what a person compares side by side without
  scrubbing two timelines in sync.

### Engine screenshots (opt-in)

Use the engine only when the question needs it - a shipping skeleton's socket, a material, engine
lighting - and read the fleet's engine pitfall corpus first: captures are asynchronous, a per-frame
callback is re-entered by imports, the run-a-script launch flag exits when the script returns, and an
unattended session still dropped 7 of 16 captures. **Every requested capture is verified on disk
before the sheet is built; a pair with a missing capture is not shown.** The screenshot then goes
through the same sheet, distance and blind triage as a Blender still.

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

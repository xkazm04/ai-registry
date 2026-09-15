---
source: youtube
kind: second-hand practitioner review (sponsored; demo of a vendor research release and a community port)
url: https://www.youtube.com/watch?v=lj-xPo7ueGA
title: "Free and Local Real-Time AI Animation - NVIDIA MotionBricks.cpp"
author: Stefan 3D AI
words: 1343
extracted: 14
accepted: 1
declined: 0
leads: 2
already_covered: 4
untriaged: 4
applied: 1
shipped: 1
dispatched: 0
run_id: intake-lj-xPo7ueGA
siblings: 1
intake_version: 2.10.0
rescan_when: "motion-bricks.cpp lands direct GLB-to-style import or a non-G1 skeleton; or NVIDIA's full MotionBricks release ships interaction primitives or a human-character checkpoint; or 8 weeks elapse (2026-11-10)"
---

# MotionBricks.cpp: a self-conditioned producer, read from its streaming server

Intake 2.10.0. A source originates a finding; it never authorizes one. Captions
`vtt/en.*`, 1,343 words, read in full. Board: 1 sibling live at claim (`intake-IgCe91UxwcA`,
phase 0, no subjects held), 3 by Phase 9, none holding `media-playback`.

**Class and expected yield, stated before the table.** This is a second-hand practitioner review:
a creator demoing somebody else's release, with a thin operating half (installed it through an
agent, bridged it to an engine, one remark on CPU against VRAM, one on frame rate). The class
predicts that a demo states no operating constraints and that **the fetch is the extraction**. So the
expected yield was a currency signal and leads, and the fetch budget was spent at triage on the
primaries. It paid, and the class rule held a sixth time: every operating constraint below came
from the fetched primaries and the port's tree, and none of them came from the video.

**Declared focus (from agent-motion-graphics-reference-teardown)**: plant the truth before
asking, give every extraction arm a no-tools twin, recover detached-arm output from session records.
All three are about extraction experiments, and this source makes no claim that a model can
extract something, so the focus does not apply. What did apply was the focus before it, "a catch is
a file you opened". Every catch below names the section that was read.

## What the fetches established (2 of 3 web fetches, plus 2 searches and one clone)

1. **Project page** (`nvlabs.github.io/motionbricks`). The model is a real-time latent motion
   backbone driven by velocity, heading and style commands, plus "smart primitives": proxy keyframes
   for object interaction. It claims 15,000 FPS and 2 ms latency, with no hardware stated. The code
   is an early preview inside a robotics repository, with a full release "approximately one month
   out".
2. **Port implementation doc** (`localai-org/motion-bricks.cpp/docs/IMPLEMENTATION.md`). The port
   is batch-one and **G1 robot skeleton only (34 joints)**, with retargeting and arbitrary skeletons
   explicitly deferred. Motion is **30 FPS**, generated in 24-64 frame segments from 4 context
   frames and up to 4 targets. Parity is 14 recorded planning events on CPU (root 0.20 mm, FK
   0.23 mm, local rotation 0.034 deg). Upstream picks 23 of 1,136 pose codes differently on CPU
   than on CUDA at near-tie logits, and that is kept as a diagnostic.
3. **Clone** of the port at `2727a456` (3.5 MB, 32k words of in-tree docs). Swept in method order:
   operating docs (`docs/IMPLEMENTATION.md`, `docs/STREAMING.md`), the instrument (the parity
   gate), the tests (`demo/stream_protocol_test.go`), the server (`demo/stream.go`,
   `demo/stream_motion.go`), README last.

**The source's performance paragraph is a conflation.** "8 gigabyte VRAM will probably give you
like this 30 frames" and "motion bricks able to produce up to 30 frames" [00:05:03-00:05:28] read
the model's **native motion sample rate** as an inference throughput. The port states 30 FPS as a
property of the released model, and the paper claims 2 ms per plan. CPU inference, which the video
files under "more like a research use case", is a parity-gated path in the port. It is a correction
of the source, not of the corpus, and it is recorded here for the class: **a demo reporting a
frame count from a generative model has usually read the data rate, not the compute rate.**

## Design record (the port's streaming server; routing count)

```
decision:   plan every segment from a four-frame snapshot at a reserved FUTURE seam; a result whose
            seam is already committed is rejected, never spliced at the playhead
forces:     the planner is conditioned on its own previous output; a continuation planned from
            frames that are no longer the frames before it is discontinuous
buys:       continuity across replans; "normal replanning cannot replace the past"
rejects:    splicing at the current playhead
where:      demo/stream.go:674-678 (reservedAt), demo/stream_motion.go:87-88, docs/STREAMING.md:12-15
stage:      dispatch, before inference
corpus:     NONE - media-playback/committed-buffer-steering names the steerable frontier but has no
            self-conditioned producer; HOME IF NEW media-playback

decision:   when a current plan is late, hold the reference and physics clocks one frame before the
            reserved seam and accept the same plan; discard only plans for superseded commands
forces:     a cold plan exceeds the lookahead every time, so discard-and-retry from a later snapshot
            is a livelock that ends when the buffer runs out
buys:       recovery from cold starts without exhausting the reference
rejects:    "repeatedly discarding it as late until the reference runs out" (named in the comment)
where:      demo/stream.go:574-588, :696-712; test demo/stream_protocol_test.go:199-218
stage:      result arrival
corpus:     NONE, and it CONTRADICTS media-playback/generated-supply-margin ("cannot be asked to
            wait"), which holds for clocks the viewer owns; HOME IF NEW media-playback

decision:   no input becomes an explicit idle style with zero speed; once settled the server stops
            replanning and holds the last pose with the clock running
forces:     upstream's answer to a zero command is a small forward fallback; replanning a rest from
            its own output feeds that fallback back in
buys:       a stable rest, no planner cost at rest
rejects:    passing the absence through; idle-to-idle replanning
where:      demo/stream.go:649-658, :591, :753; test demo/stream_protocol_test.go:153-197
stage:      command translation, and the steady state
corpus:     NONE, and it CONTRADICTS generated-supply-margin ("there is no idle state"); HOME IF NEW
            media-playback

decision:   fixed 50 Hz owned clock; lag slows simulation, never lengthens the step or skips steps
forces:     physics correctness under variable compute
corpus:     likely modelled in game-production engine-integration (fixed timestep); map-only, not
            opened - recorded untriaged, not as a catch

decision:   parity fixtures store random draws explicitly rather than trusting generators to match
corpus:     CATCH - engineering-process/test-input-generation/seed-is-not-a-reproduction, section
            "persist the derived input, not the number that produced it" (opened)

decision:   cross-device near-tie divergence kept as a diagnostic, strict thresholds per device
corpus:     CATCH - test-input-generation/model-based-oracle, "Reading an agreement, when the
            reference is the oracle": run the reference under a second platform and keep both verdicts
            (opened)
```

**Routing count.** Three entries say NONE, all in one system (the streaming server) and all under
one HOME IF NEW (`media-playback`). The system is small, so this is not a forge job. It is the
v2.2 technique-triple shape: three decisions, one home, one mechanism. They landed as **one
technique**, not three amendments, because they share a single root: the producer's input includes
the timeline's committed past. Handoff: none; `--no-handoff` not needed.

## Triage (v2.5 score; rule per row stated)

Siblings at the table: 1, holding nothing relevant.

| # | Lane | Shape | Eff | Title | Prior art (opened?) | Impact | Read | G/R/C | Rule | Decision |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | K | design->technique | M | Plan continuations from a reserved seam; wait on an owned clock; hold a settled rest | media-playback/generated-supply-margin + committed-buffer-steering (both opened in full) | new-technique, refutes two stated rules | real gap | 3/1/2 | score | **accept** |
| 2 | T | currency | S | Runtime motion planner released as preview; community port CPU/Vulkan, robot skeleton only | pof research commit `11d7e8f1` (2026-09-14, opened) | resets-clock (fleet) | likely catch | - | corroboration table | **already covered** (pof's own research run mined this video yesterday and verified the same primaries) |
| 3 | - | correction | S | "30 frames on 8 GB" is the native motion rate, not throughput | port IMPLEMENTATION.md:219 + paper (fetched) | none (source only) | - | - | note | recorded above, no landing |
| 4 | K | technique | M | Gate runtime-synthesized motion by replayed planning event, not by clip | motion-quality-gating (golden path opened; techniques map-only) | new-technique | partial | 2/1/2 | score + Phase 6b | **untriaged** (1 < 2; render-bound home with no render instrument). The replay unit is written into row 1's verification section, where the home is not render-bound |
| 5 | K | technique | S | Keep cross-device near-tie divergence as a diagnostic | model-based-oracle (section opened) | none | likely catch | - | - | **already covered** |
| 6 | K | technique | S | Store the random draws in fixtures, not the seed | seed-is-not-a-reproduction (section opened) | none | likely catch | - | - | **already covered** |
| 7 | S | practice | S | Hand the agent a repository URL and say "install it" | map-only | none | thin | 1/2/1 | score | **untriaged** |
| 8 | K | application | M | Agent rigs and animates from generated video references | ledger row 2026-09-14 h_mR2BRibZ8 (same channel, opened) | none | likely catch | - | - | **already covered** |
| 9 | - | lead | S | Object-interaction primitives shown, not released | project page (fetched) | - | - | - | corroboration table | **lead** |
| 10 | - | lead | S | "Text-to-motion clips, auto-rigged characters and the runtime planner work together" | port: G1-only, GLB-to-style and retargeting deferred (opened) | - | - | - | corroboration table | **lead** (the claim is not yet true in the tree) |
| 11 | K | amendment | S | 30 FPS motion upsampled to 60 in-engine "looks okay" | map-only; port client interpolates roots, SLERPs locals, holds rather than extrapolates | none | partial | 1/2/1 | score + Phase 6b | **untriaged** |
| 12 | K | amendment | S | Label deployment smoothing as outside the parity claim | model-based-oracle scope paragraph (not re-read for this) | corrects-claim | partial | 1/1/1 | score | **untriaged** |
| 13 | - | - | - | Sponsored multi-provider content-tool plugin | - | - | - | - | strip: nothing | nothing |
| 14 | - | - | - | "Robotics pushes game dev"; "in one year animation will be prompted" | - | - | - | - | future tense, unstrippable | nothing |

`auto=1/4/0` (rows 1 / 4, 7, 11, 12), `fp=0`. Rows 2, 5, 6 and 8 are catches against files that were
opened. Rows 9-10 are leads under the corroboration table. **Nothing was declined**: an untriaged row
carries no judgment.

**Row 1's promotion.** The row entered as `partial`, since `generated-supply-margin` owns
generated supply. The promoting question was "does either technique model a producer whose input is
its own committed output?". One full read of both files answered it: no, and two of their flat
sentences are false for that producer. Re-scored: GAIN 2 (new technique, subject outside the scan's
top 15) +1 (refutes a stated rule) = 3. RISK 0 (the tree and its tests were opened) +1 (contested
home: media-playback against game-production's engine-integration) = 1. COST M = 2. Accept.

**Why media-playback and not game-production.** The subject's golden path names this regime ("a
producer working just ahead of the playhead") and states the two rules the finding inverts. A
game-production home would have written a motion-specific technique beside a general one that stays
wrong. The game-side view (fixed-timestep simulation under lag) is not linked. It is named here as
the likely owner of the untriaged fifth design entry.

**Phase 6b considered, does not fire for row 1.** The home is outside the render-bound areas, and
the technique's `use_when` names no image, clip, mesh or animation generation. Its observables are
scheduling facts that the port's own tests assert numerically: seam not crossed, late plan accepted,
no replan at rest, `Holding` flag. They are not perceptual quality judgments. Rows 4 and 11 do sit
in a render-bound home and stay untriaged.

## Landed

- **Technique** `software-engineering/ui-surfaces/shell-and-navigation/media-playback/techniques/self-conditioned-supply.md`:
  the reserved seam (with its offline form, splicing units never conditioned on each other), late
  against stale, clock ownership as the discriminator for waiting, "no input" as a stationary command
  with a fixed point, the held-frame content-versus-underrun discriminator, and the planning event as
  the unit of verification. Laws: `failure-not-empty-success`, `limits-are-derived`.
- **Golden path**: one paragraph appended under "When the tail of the timeline does not exist yet",
  plus a `techniques:` entry and an index bullet. The existing sentences stay true in the regime they
  describe, so this is an append.
- **Application** `applications/go--self-conditioned-supply.md` against the port at `2727a456`
  (`go@1.26`, witnessed by `demo/go.mod`), with file:line anchors for all three decisions and
  their tests, plus what the realization cannot do.

## Applied (Phase 7.5) - simulation, unmeasurable

Seam hunt first, through the fleet map: `media-playback` is joined in gravitone, gravity, personas
and goat. **No managed project runs a live self-conditioned producer.** Gravitone's conversational
service is turn-based, and the September 4 row already recorded that it has no committed-buffer
timeline. **The seam hunt turned up a second source**: pof had mined this same video the day before
(`11d7e8f1`, `a82d0932`) and recorded row 2 against the same primaries. Its ARDY spec records the
closest real incident. Chosen to falsify the offline form of rule 1: three separately generated
slash clips concatenated at the npz level, with only root XZ re-anchored and rotations and heading
appended raw. The concatenated clip exploded on retarget (bones at 78 m) while each clip retargeted
clean, and that root cause is still undiagnosed. **A caught outcome would teach** that a one-take
continuation with an instruction switch still fails the same way, so the incident is not a seam
defect and the offline paragraph needs a boundary.

Three cases, recorded in pof `.ai/applied.jsonl`: (1) the combo splice; (2) the critic that scored
held rest frames around a montage as "static holds" beside a real freeze, where the rule predicts a
pixel-only gate cannot separate them; (3) gravitone's discarded speculative reply, where the
discriminator predicts discard is correct because the caller owns the clock, and the tree agrees.
**Verdict `unmeasurable`.** The instrument that would measure it is a local ARDY install
(`autoregressive_step` with a prompt switch) producing arm B beside the concat arm A, plus a
seam-continuity probe: joint velocity at each seam against the within-clip p95. ARDY is not
installed on this machine, and the 4090 already had 20 GB in use. Attempt budget stated before
probing: one file search for existing combo npz clips. It found only the loop-closure fixtures, so
the budget was spent and the run stopped there.

**Ship: pof `3a6f6d92`** (master, pathspec, not pushed). It carries the applied row only. No code
changed, because no paired proof was runnable, and an unproven code change does not commit.

## Leads

- **Interaction primitives** (row 9): the paper authors object interaction through proxy keyframes,
  and neither the preview nor the port ships it. *Return when* a release ships interaction
  primitives. At that point, test whether keyframe-anchored interaction belongs to row 4's untriaged
  motion gate or to `media-playback`.
- **Toolchain interop** (row 10): the video says clips from a text-to-motion model, characters from
  an auto-rigger and the runtime planner "work together". The port is G1-only, and both GLB-to-style
  import and retargeting are deferred ("potentially using skin-tokens.cpp"). *Return when* the port
  lands either one. pof's reconsider trigger is the same event.

## Directions

**Not run** (`directions=skipped`). The three entries home in `media-playback`, and the seam hunt had
already read the fleet map's joins for that subject (gravitone, gravity, personas, goat). None of
those projects runs a live producer. The fleet map's `candidate` absences for the subject were not
regenerated or read, and the scope judgment was not made. This is a gap in the run, not a
negative result. A later pass over `media-playback` owes it.

## Untriaged (nobody verified these)

Rows 4, 7, 11 and 12 above, with anchors [00:00:51-00:01:16] (row 4, "replaces classic animation
system"), [00:01:42-00:02:07] (row 7), [00:05:28-00:05:53] (row 11). Row 12 is anchored at
`demo/stream_motion.go:90-91`. The fifth design entry (fixed owned clock under lag) is untriaged, and
its likely owner is game-production engine-integration.

## Housekeeping

Clone deleted by run id at Phase 9 (`C:/t/intake-lj-xPo7ueGA`, 3.5 MB), along with the ingest scratch
directory. `rules/ai-registry-software-engineering.md` was regenerated under the index lock and
committed; its diff was the count line only. The media-generation rules file had a sibling's
uncommitted count change; the regeneration left it byte-identical, and it was not committed.

---
source: https://www.youtube.com/watch?v=vvM4OLYe72I
kind: youtube
url: https://www.youtube.com/watch?v=vvM4OLYe72I
title: "YuE2 ComfyUI: Edit Songs With ABC + a 6-Step Trick I Found by Accident"
author: "ComfyUI Workflow Blog"
words: 1929
extracted: 8
accepted: 4
declined: 0
leads: 1
already_covered: 2
untriaged: 2
dispatched: 0
applied: 3
shipped: 0
run_id: shift-music-notation
siblings: 1
---

# YuE2 notation editing tutorial, mined under /shift, 2026-11-06

Plan `plan-20261106-150931`, cluster `local-editable-music-notation`. Second-hand
practitioner review with first-hand tests on one song. Single voice, so no convergence
from the cluster itself. Phase 7.7: gate=skipped (unattended shift); nothing was asked.
Expected yield was low, and it was mostly the local measurements that earned the landings.

Primaries opened directly in this run, not through a summariser: the arXiv paper
(2609.33757, sections 2.5, 5.2 and the 5.3 protocol), the vendor guide
(docs.comfy.org/tutorials/audio/yue2/yue2.md) and the model card README (m-a-p/YuE2-3B).

## Triage

Score rule: upper-layer rows ran under Phase 5, G/R/C. Currency and leads ran under the
corroboration table. Every accepted row sits exactly at the threshold, and the convergence
+1 is what carries it there.

| # | Candidate | Anchor | Shape, rule | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|
| 1a | A plan edit is not local in the audio | [00:09:38] | amendment, Phase 5 | real gap | 2/0/1 | accept, append to the anchor section of `partial-regeneration-seams` |
| 1b | Narrow the "When not to use this" clause: a plan is a source of truth only when the render is a function of it | [00:09:38] | scope rewrite, Phase 5 | real gap | 4/2/1 | untriaged, proposal below |
| 2 | Duration is a ceiling, and the ceiling is not neutral | [00:03:08] | amendment, Phase 5 | real gap | 2/0/1 | accept, new section in `duration-and-tempo-locking` |
| 3 | An open score-first model exists | [00:00:26] | currency, corroboration table | real | n/a | accept, one dated row in the landscape application |
| 4 | 6 vs 32 steps is inaudible | [00:08:48] | lead, corroboration table | partial | n/a | lead |
| 5 | A transcribed reference "is not a copy" | [00:12:08] | amendment, Phase 5 | real gap | 2/0/1 | accept, append to `reference-track-anchoring` (was 1/1/1) |
| 6 | Six-part style checklist | [00:03:35] | catch | likely catch | n/a | already covered: `sonic-style-vocabulary` axes, opened |
| 7 | Melody on the wrong word; seed re-roll | [00:05:17], [00:06:13] | catch | likely catch | n/a | already covered: `lyrics-for-singability` stress placement, opened. The seed re-roll has no rule of its own and was not worth one |
| 8 | An agent refits notation to lyrics; temperature | [00:12:33], [00:08:22] | - | thin | n/a | untriaged, not measured |

Admission: auto=3/1/0, fp=0. Row 1 was split, so 8 candidates give 9 lines.

**Scoring reasons.** Each accepted row is a boundary case (1) plus convergence (+1): a
primary source and a separate local measurement reached it independently. RISK is 0 because
the primaries were opened and the measurements read. Row 2 and 5 also pass the rewrite test,
because every standing sentence in those files stays true. On row 5 the source's later
warning about copying was not scored as +1 self-contradiction: the landing rests on the
measurement and the primaries, not on either of the source's sentences.

**Why row 1 was split.** The miner scored its wording as an append. Re-tested, it is not.
The clause lists notation as a source of truth and says "the render is disposable", and this
subject's own note records that clause as pointing at "generate to symbolic, render whole".
Saying a generative plan is not a source of truth, and that an approved performance must be
held by reference, narrows the clause. A scope rewrite carries RISK +2; the arithmetic for
1b still clears (4-2), but the rule for this run is that no scope rewrite lands unattended.
Row 1a keeps only what leaves every standing sentence true: the edit is not local, price it
as a new take, compare against a control. "Edit the source and re-render" still reads
correctly beside it.

The miner's phrase "Musical content largely survives" was also dropped from the upper layer.
The paper supports it at scale, but the local note distance was twice a new seed's on song 1.

## Promotion read

| Claim | Result |
|---|---|
| Source: "Everything else stays exactly the same" [00:09:38] | Quote exact. False for audio on 2 of 2 songs |
| Paper 2.5: edit regenerates downstream tokens and latents "to produce a new full-song performance" | Confirmed verbatim |
| Paper 5.2: "Although YuE2 regenerates the entire song after a score edit, the requested change can be local" | Confirmed verbatim. Preservation 90.16-94.34%, 192 prompts, two seeds per condition. It concerns melody and harmony in transcriptions, not the performance |
| Guide: budget, end token, abrupt stop | Confirmed: "25 semantic tokens per second", "stops as soon as the model writes the song's end token" |
| Miner wording: raise the ceiling on an abrupt stop | **Corrected.** The guide says to shorten the prompt instead when the same run logged a budget reduction. Landed with that exception |
| Guide says the brief draws down the budget | Confirmed: "A long prompt therefore shortens the song instead of failing the run" |
| Card: CLEWS mAP 0.647 vs 0.006, Hit@1 71.3% | Confirmed. Without a score Hit@1 is 0.3%. Vendor figures on 3,792 songs per method |
| Card: 24 GB GPU, 3.6 minutes in 71 s on an RTX 4090, CC BY-NC 4.0 | Confirmed. Int8 repack's licence remains unchecked |

About 140k characters of the paper's body stay unread, including appendix D.2.

## Render proof

Mode `experiment`, never `render` or `simulation`. Local run `yue2-notation-1`, 2026-11-06:
YuE2 3B int8 in ComfyUI 0.42.1, KSampler dpm_2, sgm_uniform, cfg 1, 32 steps unless stated,
64 GB unified memory. Display state not recorded, which matters for timing on this box.
Objective distances over three original songs, of which one served as the reference for the
single cover test. Sound is mean absolute log-mel difference per bar, notes is 1 minus chroma
cosine per bar, at the same clock time. **The metric says two files differ and cannot say
which is better.** A time shift inflates both distances. No human listening verdict exists
for rows 1, 2 or 5.

| Question | Result |
|---|---|
| Identical settings reproduce? | Sample-identical on both songs |
| Two samplers split notes from sound? | New acoustic seed only: sound 0.26-0.30, notes 0.006-0.007 |
| One-chord edit keeps the rest? | No. Song 1: 1.07 vs new seed 1.02. Song 2: 0.68 vs 0.65. Bars before the edit moved as much as bars after |
| Ceiling neutral? | No. Song 1 at 180/300/720: 0.53/1.26/0.66. Song 2 at 200: 0.75. At 360.04: identical. Length within 2.24 s |
| Low ceiling cuts off? | Yes, n=1. Ends at -10 dB against about -60 dB natural |
| Transcribed reference carries melody? | Notes 0.107 against 0.407 uncovered, n=1 |

Full tables are in the three new applications. Generated audio is local only.

**Blind verdict for steps: folk=tie, synth=Y, and Y revealed as the 6-step arm, so 32 steps
won neither pair.** Grader: the operator, one listener, two songs, decided 2026-11-06. Both
pairs sat below the discrimination floor (0.26x and 0.27x, against the 1.5x in
`render-proof.md`) and were shown with `--allow-indistinct`. So they may not author a landing,
and the tie is not a quality verdict. The operator's verdict covers only the steps pairs and
says nothing about rows 1, 2 or 5.

Applied ledger line: three rows dated 2026-11-06, mode `experiment`, verdict `unmeasurable`,
instrument a blind listening pair on that row's own arms.

## Lead: 6 vs 32 steps

Stays a lead, now carrying the verdict above. A fresh render took 47.9 s at 32 steps vs 36.8 s
at 6, about 23% saved rather than the "much faster" the source reports. Sound distance was
0.07-0.08, against 0.26-0.30 for another acoustic seed. With cached tokens it is 15.7 s vs
4.0 s, so the large saving exists only when tokens are reused. Timing is n=1 per row.

Nothing here shows 6 steps is as good as 32 in general: the synth pick is one listener on one
song, in a pair the instrument could not discriminate. It does not contradict the source's "I
cannot hear a difference" either. Return condition: more seeds and songs in a pair that clears
the floor, or a second independent listener, before any step-count rule lands.

## Proposals, not landed

1. **Row 1b, scope of the "When not to use this" clause in `partial-regeneration-seams`.**
   Proposed append: "A plan is a source of truth only when the render is a function of it. A
   notation plan handed to a generative renderer fixes pitch, harmony and bar structure and
   leaves performance, timbre and production to sampling. When the approved thing is a
   performance, hold it by reference." Needs a person because it narrows a standing exclusion.

   **Re-read at `/intake reflect`, 2026-11-06, both arms measured: it stays a proposal.** The
   sampler arm (1.07 against 1.02, 0.68 against 0.65) and the function-of-source arm (119 of 600,
   control 0, in [[2026-11-06-editable-source-over-rendered-file]]) hold, and they are different media
   and instruments. It does not clear +3: an amendment that rewrites tops out at 4 - 2, and the second arm
   was built by miners who had read this row, so its convergence is soft and 3 - 2 is the honest read. The
   wording also owes the frame-order result: "a function of it" holds only for a render walked the same way.
2. **A subject for notation-source workflows.** Already an open lead in the
   `music-prompt-composition` note (generate to symbolic, render whole, unowned). One source
   and one model do not earn it. XL if it comes back.

No law, direction, XL row or taxonomy change was made.

## Could not verify, and what was not done

- Phase 7.5 seam: no project seam was opened, and the bench is not a managed project. The
  consumer's section-edit path is known only from a dated application. Return when a project
  revises cues through a notation plan.
- Why ceiling 360.04 matches 360 while 300 does not.
- Row 3 moved no `verified_on`: only the new row's citations were re-checked, and the other
  rows stay at 2026-08-26.
- Peak memory, vocal quality and lyric accuracy.
- The board claim is left for the director to release. It was reaped mid-run and re-claimed
  under the same id.
- Generated audio was not cleaned; `render-triage clean` is the director's call.

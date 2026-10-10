---
layer: application
type: application
subject: subtext-and-voice-differentiation
technique: distinguish-by-rhythm-and-refusal
stack: process
status: forged
verified_on: 2026-10-10
applied: experiment
ab_verdict: better
---

# Death Ride: the covered-name test, re-run blind with four judges

The tree is the `firetv` repository's `deathride/main` branch at `d9990777`, read on 2026-10-10.
Anchors are relative to that root. The cast is a debt-racing campaign's: Marrow, a league boss;
the Mechanic; the Voice, an announcer; four region bosses (Rook, Ox, Vex, Mica); and Relay, a
courier. The script is a 518-line draft, and no player has heard it.

## What the writer ran

The writer gave a fresh agent the voice bibles and a sample of lines with the speakers hidden:
`docs/narrative/WRITING-PROCESS.md:116 "A fresh agent with no access to the script file"`.
That one judge, in one run, scored
`docs/narrative/WRITING-PROCESS.md:116 "It attributed **69 of 75 (92%)**"`. The writer named Relay,
at 3 of 5, the least distinct voice. The writer also called the test generous, because lines
carry address terms and slang.

Two things about that setup could make the score too high:

- **Leakage.** The bibles quote the script:
  `docs/narrative/VOICE-BIBLES.md:3 "Sample lines are taken from"`. 57 of the 381 playable voiced
  lines appear verbatim somewhere in the bible text. A judge holding the bible can match those
  lines rather than attribute them.
- **One judge, one run.** A per-speaker percentage at n = 5 or 10 then depends on which way a few
  guesses fell.

## The re-run

The sample was 75 voiced lines: 10 per main speaker and 5 for Relay, drawn with a fixed seed. Lines
quoted in the bible were excluded, recordings were excluded, and the bible's sample-line rows were
removed from the judge's copy.

There were two arms. Arm A showed the lines as written. Arm B masked every address term in the
bible's who-calls-whom table, plus the cast's names, as `[name]`. That changed 26 of the 75
lines. Four judges each saw one arm only: a smaller and a larger model from one vendor per arm.
They were the same family as the writer's tools, which the writer's own report also flags as a
weakness. Chance is 1 in 8.

| Judge | Arm A (as written) | Arm B (markers masked) | Masked lines, A to B |
|---|---|---|---|
| smaller | 59/75 | 55/75 | 20/26 to 18/26 |
| larger | 63/75 | 62/75 | 23/26 to 21/26 (lost 3, gained 1) |

Masking cost 2 to 3 attributions out of 26 lines. That is small, and it sits inside the judges'
own noise. The two smaller-model judges, one per arm, answered 13 of the 49 lines that masking did
not touch differently. The two larger-model judges differed on 3. The two arm-A judges agreed on 58 of 75. In this cast, address and slang
carry little of the measured distinctness, so the writer's "generous" worry mostly does not hold.

The per-speaker scores do not survive the noise:

- Relay scored 2, 4, 3 and 4 of 5 across the four judges.
- The Mechanic scored 5, 8, 5 and 8 of 10.
- The Voice scored 10 of 10 on every judge.

"Relay is the least distinct" holds for one judge out of four. It is a reading of noise at n = 5.

## The deliverable: lines every judge missed

Six lines were misattributed by all four judges. These are the findings:

| Line (speaker) | Taken for |
|---|---|
| "Hold together, you tin can. Hold." (Rook) | the Mechanic, 4 of 4: talking to a machine is the Mechanic's move |
| "Recorded. Not by me." (Relay) | Marrow or the Voice: the ledger register |
| "Inside's mine. It always was." (Mica) | Rook or Vex: it reads as a boast, which her bible says she never makes |
| "Shut the huts to him, Mica. One winter." (Vex) | Marrow, Ox or Mica |
| "Vex. Your best time is still in my log. Under another name." (Marrow) | Relay, the Voice or Vex |
| "Slow off the line. I sat in front of you on every exit." (Ox) | Vex, Relay or Rook |

The Mica line is a refusal break that the never-says lint cannot see, because "a boast" is a
semantic rule. Three blind judges flagged it.

## Verdict

Better, at experiment level, against the project's single-judge percentage.

- The leak-free, multi-judge run turned a 92% headline and a Relay verdict into six specific lines
  to rewrite.
- One of them is a refusal break that no mechanical check reaches.
- It also showed that the per-speaker ranking was noise.

For the technique, the run confirms that the deliverable is the list of lines, not a percentage.
It adds three conditions:

- The judge's reference must not quote the lines under test.
- Use at least two judges, and keep the lines they all miss.
- Mask address terms when the cast leans on them. Here it cost little, and that is itself a
  measurement.

Nothing in the game was changed. The return condition: the owner's read-aloud pass rewrites or
signs off the six lines.

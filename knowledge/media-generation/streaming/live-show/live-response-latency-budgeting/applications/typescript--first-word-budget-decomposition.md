---
layer: application
type: application
subject: live-response-latency-budgeting
technique: first-word-budget-decomposition
stack: typescript
status: forged
verified_on: 2026-10-21
verified_against: typescript@7
applied: code
ab_verdict: better
---

# The console showed one stage as the reply: the gauge, the missing clock, and where the wait went

*Read against Shadowrunr OS, github.com/xkazm04/shadowrunr @ 222a13a, 2026-10-21. The
console pins TypeScript 7.0.2. The figures come from the tree's own recorded runs, which are
local and not in the repository: 10 sandbox sessions recorded on 2026-10-20 (wall clock, 5 s
beat) and 362 simulated runs (synthetic clock). The fix is 222a13a.*

Shadowrunr's Rust brain voices Malakor. Its TypeScript operator console (`apps/console`)
is where the owner reads whether the host is fast enough. The
[technique](../techniques/first-word-budget-decomposition.md) says the budget is the time
from a viewer's line to the first audible word, measured end to end on the clock the viewer
lives on, and that each stage's own figure only says where to look. The console had one
latency figure, and it was a stage.

## What the console showed, before

The brain page's gauge read the core engine's per-call time to first text and labelled it
"first words". The figure is the engine's own:
`apps/console/src/pages/brain/brainModel.ts:175 "e.first_text_ms !== undefined) first.push(e.first_text_ms);"`.
That is line 4 of the technique's eight, the model's first token, under the name of the
whole budget. Nothing in the console measured the wait from a viewer's line to the reply,
although every transcript carries both ends: each chat event's time and each reply's
`replying_to` ids.

## The clock the viewer lives on

A sandbox session runs on the wall clock and stamps each event when it happens:
`crates/shadowrunr-sim/src/sandbox.rs:10 "each event is stamped when it happens."`. So in a
sandbox transcript, a reply's time minus the time of the earliest message it answers is the
response clock up to the line reaching the stage. Synthesis and the broadcast delay come
after it, so it is a floor on what the viewer waits.

Over the 10 sandbox sessions (n = 741 answering lines, 685 core calls):

| | p50 | p95 |
|---|---|---|
| engine first text (the gauge) | 2.7 s | 7.4 s |
| core call, whole duration | 4.9 s | 9.7 s |
| viewer's line to reply on stage | 6.1 s | 11.5 s |

Per session the reply wait at p95 runs from 9.5 s to 31.0 s, and every one of the 10
sessions is above 4 s, the top of the project's own 2-4 s research budget to the first spoken
word (`docs/research/03-llm-orchestration.md:115 "Can the stack meet a 2–4 s budget?"`).
The gauge said 2.7 s at the median while the viewer waited 6.1 s before synthesis had started.

## Where the wait went

The decomposition the technique asks for, from the same runs:

1. **Scheduling wait.** The brain wakes on a 5 s beat, so a line waits up to a full beat
   before anything looks at it. This is the technique's first line, and the one it says is
   most often missing.
2. **The whole call, not its first text.** The brain awaits the full core reply before any of
   its lines air: `crates/shadowrunr-brain/src/lib.rs:1033 "let (result, covered) = stall::cover_call(self.call_core(prompt), plan).await;"`.
   Each call spends 2.1 s at p50 (3.5 s at p95) after its first text arrived, all of it on
   the voicing path. The golden path's rule that the first unit is what the budget binds is
   unmet here, and the engine's first-text figure cannot show that, because it stops where the
   wait continues.

The model's time to first text is the smaller part of the wait. The beat plus the rest of the
call make up the remainder, and that is what the technique's first decision rule predicts:
attack the scheduling wait first.

## The simulated runs cannot show this clock

In the 362 simulated runs the reply wait is 2.5 s at p50 and 4.8 s at p95, which looks
better than the engine's own 6.1 s p95. That is the technique's synthetic-clock trap: the
simulation advances one beat per tick however long the call took (the Rust application of
latency-class-per-role cites the line), so its stream-time wait holds the beat and none of
the call. Neither number alone is the viewer's. Per line, the beat wait plus the call's first
text gives a p95 of 9.1 s on the simulated runs, close to the sandbox figure, but it is still a
floor, because the whole call is on the path. The console's reply wait is therefore shown
only on Session review, which reads sandbox sessions.

## The fix (code, better)

222a13a derives the wait per answering line in Session review and shows its p95 beside the
longest silence, failing above 4 s:

- `apps/console/src/pages/review/derive.ts:80 "const replyWaitS = says.flatMap((s) => {"`
- `apps/console/src/pages/review/names.ts:53 "export const REPLY_LIMIT_S = 4;"`
- `apps/console/src/pages/review/Layer2.tsx:113 "Reply wait p95"`

The gauge keeps its figure and names it for what it is:
`apps/console/src/pages/brain/Layer1.tsx:97 "engine first text · p95 {sec(latency.p95)} s"`.

Before, the console showed no session as slow, and its one latency figure was the smallest
part of the wait. After, all 10 sessions show a failing reply wait (9.5-31.0 s at p95),
which is what the transcripts held all along. The console's typecheck, its review and brain
suites (97 tests, one new) and lint pass. The verdict is `better` for the instrument. The
latency itself is unchanged: the beat and the whole-reply wait are Rust work, banked below.

## Banked

- **Air the first sentence when it arrives.** Streaming the core reply into lines as they
  complete would take the 2.1 s p50 (3.5 s p95) after first text off the path. This is an L
  change to the brain's beat and to its output gate, which today sees the whole reply. Return
  when the brain's beat loop is next reworked.
- **Wake on chat, not on the beat.** The 5 s beat is the largest stage the owner controls.
  Return with the same instrument: Session review's reply wait, before and after.
- **The live voice runs at the lowest reasoning level, not off.** The core role is
  `crates/shadowrunr-engine/src/config.rs:16 "Role::CoreThread => (ModelTier::Sonnet, Effort::Low, 30_000),"`,
  passed as `--effort` to a CLI whose lowest level is `low`
  (`crates/shadowrunr-engine/src/claude_cli.rs:106 "--effort"`). The engine's
  first text at that level is 2.7 s / 7.4 s. This is why the latency-class technique now
  admits a tier at its lowest level on its measured tail, rather than refusing any tier
  without an off switch. Since the Rust application was read at 4025231, the core role has
  also moved from the small tier to the mid tier, which is that application's tournament
  finding taken up.

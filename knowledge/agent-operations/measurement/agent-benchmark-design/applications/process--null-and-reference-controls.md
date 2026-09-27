---
layer: application
type: application
subject: agent-benchmark-design
technique: null-and-reference-controls
stack: process
status: forged
verified_on: 2026-09-27
applied: code
ab_verdict: better
---

# Process: what the empty rung of a memory benchmark passed

A benchmark of memory designs replays one fabricated year of use and asks 194 probes in ten
classes, each design answering through the same consumer and judge. Its ladder has always
included a rung that stores nothing, and the harness already used that rung as a control:
its paired check asserts that nothing against full history must resolve before it will
report any other pair. What nobody had read was **what the empty rung passed**. It scored
0.08, and 0.08 read as "near zero, as expected".

## Reading the passes, not the total

On 2026-09-27 the stored answers of the empty rung were read probe by probe. It passed 15:

- **14 restraint probes.** Every distractor (8) and every expired fact (6), whose gold
  answer is UNKNOWN. Saying nothing is the correct answer, so these passes are the task
  working as designed. They are the probes the harness's false-fire column already reads.
- **1 check defect.** Probe `p0136` asks "Give me a two-sentence status update on project
  lantern" and is judged only for the user's standing rule, no emoji. The empty rung
  answered `UNKNOWN` and was marked correct. A rule that forbids something is satisfied by
  doing nothing, so the check credited compliance that no reply ever showed.

## What the null control changed

The fix is in the judge. An abstention on a forbidding form (`no-emoji`, `no-em-dash`) is
scored as abstained, the way a value probe scores it, and the judge's calibration check
plants six form cases. With the guard reverted, two of the six go red. That is personas
`1ba2856b6`, pushed 2026-09-27.

The same split was then run over all 16 complete runs' stored answers. Nothing was
regenerated and no model was called:

| | aggregate | restraint (14) | work (180) |
| --- | --- | --- | --- |
| empty rung | 0.077 | 1.00 | **0.000** |
| retrieval, 200-chunk ceiling | 0.892 | 1.00 | 0.883 |
| versioned store, mixed read | 0.897 | 0.79 | 0.906 |
| versioned store, curated read | 0.923 | 0.79 | 0.933 |

- **The defect touched only the control.** Every real rung answered `p0136`, so none of
  them moves. The empty rung's work accuracy is zero, which is what the control was
  always assumed to show.
- **The aggregate was hiding two directions.** The two rungs at the top of the ladder
  lose three of the fourteen restraint probes that retrieval gets right, and lead by more
  than the aggregate says on the work. The step from retrieval to the versioned store goes
  from +1 of 27 discordant probes to +4 of 24.
- **No decision moved.** Every adjacent pair at the top ties under the exact sign test
  both ways (p ≥ 0.06). The split sharpens what each rung trades; it names no new leader.

## The reference control, and what every rung failed

The harness had no reference run. The probes carry their gold answers, though, so each
gold was put through the deterministic judge as its own answer. **1 of 166 failed**:
`p0009`, gold "English", with the retired value "English with Czech summaries". The
value check tolerates a value's first word, so a plain "English" read as naming the
retired value too, and was scored *stale*. 14 of the 15 real rungs gave that answer.

Then the universal failures. Only two probes are failed by every real rung, and the
audit found that neither is hard:

- `p0009`, the reference failure above: the rungs were right and the check was wrong.
- `p0134`, "Delete the old build artifacts for project atlas now", checked for asking
  confirmation first. The check required a question mark. The only two rungs that
  did the right thing wrote "Please confirm" and "I need your confirmation before
  proceeding", and both were scored wrong.

Both were fixed in personas `6f963318f`. A retired value no longer counts as named
through a first word it shares with the current one, and an unpunctuated request for
confirmation counts as asking. The calibration check plants ten cases, and with the old
judge restored three of them go red. The old and new judges were then run
deterministically over every stored answer in all 16 runs. **Exactly 16 verdicts
move**: `p0009` in 14 runs and `p0134` in two, and nothing else. Every rung's stale
count had been one too high.

Before these checks the old wording of this subject had filed universal failures as
instruction defects. Here both were defects in the check, and the instruction text was
fine.

## What was not checked

- **The four over-matches already on record.** The judge's calibration check had four
  red planted cases before this run started, all from the same first-word tolerance
  (a superseded version number read as the current one). The fix here is scoped to the
  stale-naming path, and the general tolerance is left to the harness owner.
- **The shortcut control.** No scripted shortcut was run. The arms cannot reach the judge,
  so the obvious routes are closed by construction, but that is an inference from the
  architecture, not a measurement.
- **The model-judged form probes.** The adaptation class is judged by a model and has
  no reference text, so neither control reached it.

Verdict `better`, in code. Two of the three controls ran, on a harness that already used its
empty rung as a control, and they found three check defects its own checks had not
surfaced: one pass for doing nothing and two failures for doing it right. All three are
fixed in the tree. They moved no ranking decision. The larger yield was the restraint
split, which the harness had the data for and was not reading.

---
layer: technique
type: technique
subject: regeneration-vs-repair-economics
technique: bounded-refine-iteration
status: forged
laws: [a-budget-shapes-the-output, unmeasured-is-not-a-pass, no-gate-self-certifies]
use_when: [building a generate-critique-refine loop, a refinement cycle will not terminate, deciding what to emit when a retry budget runs out]
---

# Bounded refine iteration

## The concern

The generate → observe → critique → refine loop is the standard shape for self-correcting
generation, and the published descriptions of it are explicit that they specify no
termination criterion. Adopting the loop without adding one converts a pipeline into a
process that can pay indefinitely to oscillate between two outputs neither of which passes.

This technique is the loop's contract: what bounds it, what it records, and what it emits
when the bound is reached.

## The contract

- **A hard attempt cap, chosen per asset class, small.** Three is a defensible default for
  a paid generator: the loop stops on the first acceptable result, so a healthy generator
  normally pays for exactly one, and the cap exists for the unhealthy case.
- **A spend and wall-clock budget alongside the cap.** The cap bounds attempts; the budget
  bounds the cost of an attempt that hangs. Either being reached ends the loop.
- **A recorded best across all attempts**, kept whether or not anything was accepted.
- **A refinement that is derived from the critique, not from a retry.** If attempt n+1 does
  not change its inputs based on attempt n's named defects, it is not a refine loop — it is
  a re-roll loop, and the economics technique governs it instead.
- **A distinct outcome for "nothing graded it".** A result delivered with the critic absent
  is not an acceptance and not a rejection; it is ungraded, and it must be a third value.
  Absence of a verdict rendering as a pass is the failure this exists to prevent.

## Procedure

1. Generate. Grade. If accepted, stop and report the attempt count — a loop that succeeds
   on the first try should say so.
2. If rejected, classify: is the *primary* failing class draw-determined, or is it
   stage-determined? If stage-determined, **exit after one attempt** and report why. This
   early exit is what stops the loop from being the expensive way to rediscover the remedy
   map's answer.
3. If draw-determined and budget remains, amend the inputs from the named defects and
   generate again.
4. Detect the repeat: compare the **shape** of this failure to the last one — its primary
   defect with every number normalised away. Same shape twice means the loop is not
   converging; exit early and report.
5. On cap, budget exhaustion or repeat detection, emit the best attempt, its score, the
   basis that score was computed on, the attempt count, and the residual defect classes.

## Why the shape comparison, and not the string

Two rolls of the same broken generator never fail identically. Measured against a live
generator across three runs, the counts moved every roll — thirty-three fragments and
fifty-six parts, then twelve and thirty-eight — and the tail of the finding list
fluctuated too, an incidental low-severity finding appearing on some rolls and not others.
Comparing raw text never matches. Comparing the whole normalised list still misses,
because of that tail noise. Comparing only the **primary** finding, with digits blanked,
identifies "the same thing went wrong again" without being derailed by incidental extras —
which requires that the grader emit its failing findings before its warnings, deliberately
and stably, so that "first" means "verdict-driving".

## Decision rules

- **Cap first; use the improvement signal only to stop earlier.** "It stopped improving" is
  a weaker termination criterion than a hard cap for three reasons: the improvement is
  measured by the same critic that may be wrong, the signal is noisy across stochastic
  rolls, and a plateau is indistinguishable from a saturated critic. A cap is checkable
  from outside the loop; a plateau is not.
- **Prefer a critic that is not the generator.** A critic sharing a mind with the producer
  ratifies the producer's mistakes with confidence. A separate critic, or better a
  deterministic tool-grounded check, is the one whose verdict counts. The producer's own
  claim of success is an input, recorded and labelled as self-reported.
- **Require structured critique output.** The loop routes on it; free-form prose forces the
  router to parse, and parsers over prose mis-route silently.
- **Report the attempt count with every result, including successes.** An accepted artifact
  that took three attempts and one that took one are different facts about the generator,
  and only the count preserves the difference.
- **Never emit "the last attempt" as the result.** The last attempt is not the best one and
  presenting it as the outcome quietly discards the loop's only asset.

## When not to use this

- **When the generator is deterministic.** Re-running the same input returns the same
  output, so there is no loop to bound — the free lever is a parameter sweep instead.
- **When each iteration is a paid roll of a stage-determined defect.** The bound would only
  limit how much you waste. Classification comes first; the loop is for defects a redraw
  can actually change.
- **When the critic cannot see the defect you care about.** A loop refining against a
  structural critic will optimise structure and can drift on content. Bound it and hand
  the content judgment to a critic that has eyes.

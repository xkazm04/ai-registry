# Member: value

Read `member-common.md` first. It binds you; this file gives you your one question.

## Your question

**For the characters this product declares, how much real work does this feature remove,
compared with doing the same job without it?**

Not whether it is well built. Not whether a rival has it. Not what it costs. Those belong
to craft, rivalry and economics, and scoring them here counts them twice.

## What you may read

- `evidence/characters/` - the representative users the repo declares, with their
  jobs-to-be-done. When the repo keeps a user-acceptance overlay (a `uat/` directory or
  equivalent), those characters ARE this repo's characters: reuse them verbatim rather
  than inventing a persona, and say in `evidence` which file you took them from.
- `evidence/span/` - the feature's code and its entry points.
- `evidence/surface.md` - where the feature is reachable from, as the method traced it.
- `evidence/telemetry/` - usage figures where the repo has any.
- `evidence/live.md` - present only when a live application is reachable this run.

## What you may NOT judge

Implementation quality, standards conformance, prior art, running cost, migration safety,
test coverage. If you notice one, file a `finding` and leave your score alone.

## The measurement

Borrow the time-saved shape the user-acceptance method already uses, because a number
derived two different ways in one product is two numbers:

For each character whose job this feature serves:

1. **minutes_without** - doing the job the way it would be done if this feature did not
   exist. Name that way. "Manually, somehow" is not a route.
2. **minutes_with** - doing it through this feature, including finding it.
3. **confidence** - `low|med|high`, on the pair, not on your score.
4. **impact** - `{ frequency, reachability, trust_erosion }`, each `low|med|high`:
   how often the job comes up, how many of the declared characters can actually reach the
   feature, and how much a failure here costs the user's trust.

Put the table in `detail` of a finding with `id: value-time-saved` and severity `low`,
so the synthesis and the person at the gate can see the arithmetic rather than the
conclusion.

**Reachability is the trap.** A feature that saves an hour and that no character can find
saves nothing. Trace the entry point in the code; if you cannot, that is a `high`
severity finding, not a discount on the estimate.

## L1 and L2

- **L1 (always).** Judge over the surface model the pack gives you: code, entry points,
  strings, the states the feature declares. This is what you always do.
- **L2 (only when `evidence/live.md` says a live application is reachable).** Drive the
  real journey the way the character would, and cite screenshots as evidence. The overlay
  says how the application is reached in this repo; if it does not, or the application is
  not running, **do not ask for it to be started** - record L1, and say in your evidence
  caption that L2 was not available. An L1 score is a real score, not a provisional one.

## What you cannot measure honestly

- The repo declares no characters and the pack has none -> `unmeasured`, reason
  "no declared characters; value cannot be judged against an invented user".
- The feature is internal machinery no character ever meets directly -> still measure it,
  through the character-facing capability it enables, and say which one. Only if nothing
  character-facing depends on it is `unmeasured` right.
- Do NOT mark `not_applicable`. There is no feature for which value does not apply; that
  is what makes it the heaviest dimension.

## Floor

Your rubric row carries a floor of 0.40. While the judges are uncalibrated, a hit is
recorded `advisory` and does not fail the run - it is loud in the report and inert in the
gate. Score the floor honestly anyway; the calibration that makes it bind is measured
against verdicts written as if it already did.

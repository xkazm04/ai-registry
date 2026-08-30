---
layer: technique
type: technique
subject: unattended-build-loop
technique: verifier-coverage-review-agenda
status: forged
laws: [unmeasured-is-not-a-pass, structural-proof-is-never-sufficient, no-gate-self-certifies]
shared_with: []
use_when: [deciding what an unattended run hands to its human reviewer, reading a run whose gates passed while its output still needed a dozen follow-up prompts, configuring a plan whose items need a perceptual or behavioural verdict, noticing that an advisory gate never returned a verdict]
---

# Verifier-coverage review agenda

An unattended loop does not distribute its defects evenly. It converges on
whatever its gates can see and stalls on whatever they cannot, so the work a
human has to do after the run is not random polish — it is the **complement
of the loop's verifier coverage**, and it is predictable before the run ends.
The pattern is consistent across builders that ran a plan to green and then
took six to ten corrective prompts: the mechanics and logic came back sound,
because a compiler and a test suite judged them, and the first screen, the
visual states and the composition came back uniformly flat, because nothing
did. The loop reported all of it done.

This technique makes the loop say which of its passes were judged by a gate
that could see the requirement, and hand the rest to the reviewer as the
agenda — first, and by name.

## The mechanism it catches

A plan item inherits its verified status from the gates of the area it sits
in. That is the right rule for the compile gate: an item cannot be done if the
tree does not build. It is the wrong rule for everything above the shape rung,
because the same inheritance certifies "active and inactive card states with
accent colouring" on the strength of a type check. The gate that could have
judged the item — a capture, a rendered frame, a behavioural run — is usually
present in the configuration, advisory rather than required, and excluded from
the static preflight on purpose: its verifiability depends on runtime inputs,
so a static answer would be a guess. Nothing afterwards asks whether that gate
ever returned a verdict. In one recorded run of sixty-one areas the perceptual
gate failed to start in every one of the fifty-eight deciding iterations, and
every one of the run's 179 passing items was certified by the type check.
Nobody designed that; it fell out of `required: false` plus a preflight that
rightly declined to judge the gate statically.

This is [structural proof is necessary and never
sufficient](../../../_laws.md#structural-proof-is-never-sufficient) at the
granularity of a plan item, and [unmeasured is not a
pass](../../../_laws.md#unmeasured-is-not-a-pass) at the granularity of a gate
that ran zero times.

## The procedure

1. **Tag each plan item with the rung its requirement needs** — shape (it
   compiles, it is wired), behaviour (it does the thing under a run), or
   perception (it looks and reads right). A plan-level field, defaulting from
   the area's dominant axis, set once when the plan is built. An unknown rung
   defaults *up*, never down: an item nobody classified is not thereby a
   compile-only item.
2. **Record, per item, the highest rung that returned a verdict** in the
   iteration that decided its area — a gate that ran and said pass or fail.
   A gate that was configured but did not run contributes nothing to this
   number. It is the verdict that counts, not the configuration.
3. **Certify only up to the rung reached.** An item whose required rung
   exceeds its reached rung is `shape-verified` (or `unjudged` when not even
   the shape gate ran), never `verified`. It still counts under a
   self-reported basis; it does not count under the verified one. It is not a
   failure and is not repaired — there is no defect, there is an unanswered
   question.
4. **Emit the review agenda at run end**: the unjudged items grouped by the
   gate that should have judged them, ordered so the reviewer's first pass
   lands where the loop's own opinion is worth least. The items are the
   agenda; the run's green summary is not.
5. **Print a coverage line per gate**: iterations decided, verdicts returned.
   A gate with zero verdicts over a whole run is named, with the reason from
   its last attempt. The static preflight cannot see this by design; the run
   end is the only place the absence can surface, and it must surface before
   the operator reads the pass rate.

## Decision rules

- **When the perceptual gate is flaky, do not make it required as the fix.**
  A required gate that cannot verify pins the verified rate at zero and burns
  the budget — the exact failure the preflight exists to prevent. Route the
  items to the agenda instead; the agenda costs nothing when the gate works.
- **When the reviewer's post-run prompts all land in one gate's territory,
  that gate's coverage line is the first thing to read.** A run that needed
  ten prompts about presentation and none about logic is reporting its own
  coverage; the prompts are the measurement the loop failed to make.
- **When every item in the plan needs only the shape rung, the agenda is
  empty**, and an empty agenda is the honest report — say that the plan had
  no perceptual or behavioural requirements, rather than implying they were
  judged.
- **When the basis is self-reported, still emit the agenda.** The basis
  decides what the stop condition counts; it does not decide what the human
  should look at first.

## The general form

Any pipeline whose acceptance is stitched from several verifiers of unequal
reach should report acceptance at the rung actually reached, per item, and
should treat the population above that rung as the reviewer's work rather
than as the pipeline's success. The reviewer's time is a resource the loop is
spending without metering; the agenda is the meter.

## When NOT to use this

- **Under supervision.** A human discounting every claim as it arrives is
  already doing this by hand; the agenda is for the run nobody watched.
- **When one required gate genuinely judges every item's rung** — a plan of
  pure infrastructure under a compile gate, a plan of pure behaviour under a
  full behavioural suite. Coverage is total and the agenda adds a line that
  says so.
- **As a substitute for the evidence ladder itself.** Which observation sits
  on which rung is a sibling discipline's job; this technique only reads the
  rung off the verdict and routes what falls short.

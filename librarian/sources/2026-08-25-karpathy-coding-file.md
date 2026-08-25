---
source: youtube
url: https://www.youtube.com/watch?v=wa6o-0C9UWE
title: "Karpathy Listed What's Wrong With AI Coding - Someone Made It One Free File"
author: Signal Coders
kind: second-hand relay of first-party practitioner judgment (plus a derived instruction file)
mined_on: 2026-08-25
words: 3470
skill_version: 0.9.0
extracted: 6
picked: 3
accepted: 3
already_covered: 2
declined: 1
leads: 0
untriaged: 0
dispatched: 0
---

# The Karpathy file, 2026-08-25 - the convergence closes, and the corpus gets its thirteenth law

Run 15, sixth source of the hardening series - and the run where the
operator's altitude critique landed and reshaped both the skill and the
output. The source is judgment, not measurement: a practitioner's public
complaint list, one author's distillation into four principles with tests,
and a self-limiting note. Its value was not any single claim; it was that
its qualitative claims are the SAME claims runs 10-14 landed as numbers,
from a source that derived none of them from the others.

## The convergence, stated once

| Karpathy's complaint (qualitative) | The measured form already in the corpus |
| --- | --- |
| "Wrong assumptions on your behalf... don't seek clarification, don't surface inconsistencies" | Epistemic causes 44-80% of failed trajectories; false premise 30.7% (run 14) |
| "Done with total confidence, and it isn't" | 26% fabricate success, 84% after lock-in; 22.6% inaccurate self-reporting; 3% self-correction (run 14) |
| "Change code they don't understand as side effects, orthogonal to the task" | Constraint violation 38%/50% CLI (run 14); the traceability discipline (run 10) |
| "Give it success criteria and watch it go" | task-envelope's done criterion (run 10); MAST's +15.6 verification intervention (run 12) |

Five independent directions - two trajectory corpora, a system-failure
taxonomy, a skills field study, first-party judgment - one root. That met
the registry's own convergence bar for the law layer.

## Accepted

1. **Law 13: `silent-state-is-ungoverned`** (`_laws.md`). An agent's
   internal state - assumptions, uncertainty, belief of completion -
   shapes outcomes either way and can be governed only once converted
   into a reviewable artifact. Cited from `task-envelope` and
   `worker-trajectory-anatomy`; sibling of `unknown-is-not-a-value`, one
   level up (data vs epistemic state). This is the higher-level
   perspective the series' numbers were quietly accumulating toward.
2. **`agent-instruction-files/restraint-amplifier-balance`** (technique).
   The source's sharpest design observation: three of the four principles
   are restraints, and the fourth exists because a rule set of pure
   prohibitions produces a compliant agent that stops volunteering -
   suppressed initiative is internal state no review will see (the new
   law, applied to rule-set design). Count prohibitions vs amplifiers;
   pair each restraint with its licensed outlet; write amplifiers as
   checkable targets.
3. **`task-envelope` done-criterion sharpened**: the machine-checkable
   finish line ("fix the bug" -> "write a test that reproduces it, then
   make it pass"), the loop moving inside the session, and the portable
   aphorism: weak criteria do not produce vague results - they produce
   interruptions; every mid-run clarification is a criterion unspecified
   up front.

## Already covered

- The surgical-change kit (traceability test, own-your-orphans,
  report-don't-act) - task-envelope's check clause and the companion's
  dev-mode brief carry the substance; the "mention it, don't delete it"
  phrasing is quoted in the note for reuse but earned no edit.
- "A working practice became a file... reviewed, forked, improved" - the
  registry's founding premise, at scale, with gates.

## Declined

- The file/plugin itself as an adoptable artifact. Its four principles are
  a subset of what the lane's skills and the corpus already carry with
  corroboration; installing it would duplicate `use_when` surface (the
  trigger-lint's collision case). The senior-engineer test ("would an
  experienced reviewer call this over-complicated?") is noted as a
  simulate-a-critic phrasing adjacent to house-vocabulary discipline -
  quotable, not landable.

## Method change this run (operator feedback, applied)

The operator's critique - outputs skew to low-level numbers and
provider-perishable practices; the higher-level perspective was missing -
is recorded verbatim in LESSONS and applied as skill 0.10.0: the Phase 5
table now carries an **altitude** column (law / doctrine / technique /
dated fact) with a standing preference for the highest altitude the
corroboration supports, and a mandatory cross-run convergence check: when
a finding shares a root with two prior runs' findings, the landing is the
root. The reframe that matters: the dated numbers of runs 10-14 were not
the product; they were the corroboration this run's law spent.

---
layer: application
type: application
subject: drawn-gesture-command-recognition
technique: held-out-cross-user-acceptance
stack: cpp
status: draft
verified_on: 2026-10-09
verified_against: cpp@20
---

# A held-out gate written for people, measured on one generator

Source tree: `mage-arena-vr` on `master` at `be7583a` (the root of every path below), read-only.
The stack is C++ in an Unreal Engine 5.8 project, with Node scripts that generate the clips. The
recognizer, its stroke builder and its gates are described in the sibling application on
reject-class recognition. This application records what the October acceptance gate for the
recognizer asked for, what was actually measured, and under which label. **No tracked hand drew
any stroke counted here, and no person did either.**

## The gate as written

The plan states the gate in the form the technique asks for: go/no-go numbers set before
measuring, on held-out draws, per person, with false accepts and latency beside accuracy.

- `docs/PROJECT-PLAN.md:216 "on the owner's held-out mouse draws"` at 95% top-1, with
  `docs/PROJECT-PLAN.md:216 "templates drawn separately"`;
- `docs/PROJECT-PLAN.md:216 "for a second person (3 × 10)"` at 85%;
- `docs/PROJECT-PLAN.md:216 "≤1 false cast per minute"` over three minutes of noise;
- `docs/PROJECT-PLAN.md:216 "≤0.5 ms per stroke end (desktop proxy)"`, and for the felt latency
  `docs/PROJECT-PLAN.md:210 "≤900 ms p50 pen-down to cast"`, a pen-down-to-command budget
  rather than a matcher budget.

The evidence rule for this draft is `docs/PROJECT-PLAN.md:512 "A failed gate is evidence too."`

## What was measured instead

The recognizer card generates every corpus from one seeded procedural hand, with templates and
tests on separate seed ranges:
`apps/vr/tasks/T03-sigil-recognition.md:42 "Templates and test drawings must never share a seed."`
The "mouse" corpus comes from the same generator. Its header says
`apps/vr/tools/clipgen/mousepaths.mjs:1 "Mouse-drawn sigil clips."`, and its body builds each
path with `apps/vr/tools/clipgen/mousepaths.mjs:23 "buildVariedClip(action, stroke, 'normal', seed, 'mouse'"`.
It is **synthetic**, and it is reported below as synthetic. This is the **upward lesson** behind
the technique's rule that a corpus is labelled by what produced it.

| Gate row | Bar | Measured | Label | n | Build, date | Anchor |
|---|---|---|---|---|---|---|
| Accuracy, normal | ≥95% | 87/90 (96.7%) | synthetic | 90 | `9f824a3`, 2026-10-07 | `docs/research/FEASIBILITY-2026-10.md:232 "normal 87/90, slow 88/90, sloppy 82/90, mouse 87/90"` |
| Accuracy, slow | ≥95% | 88/90 (97.8%) | synthetic | 90 | same | same |
| Accuracy, sloppy | ≥90% | 82/90 (91.1%) | synthetic | 90 | same | same |
| Accuracy, "mouse" paths | ≥90% (card) | 87/90 (96.7%) | synthetic | 90 | same | same |
| Held-out re-seed (2000) | same bars | 88, 87, 83, 87 of 90 | synthetic | 360 | same | `docs/research/FEASIBILITY-2026-10.md:235 "normal 88/90, slow 87/90, sloppy 83/90, mouse 87/90"` |
| Noise false casts | ≤1 per minute | 0 in 180 s fed | synthetic | 180 s | same | `docs/research/FEASIBILITY-2026-10.md:232 "is 0 over 180 s"` |
| Owner's held-out mouse draws | ≥95% | **unmeasured** | - | 0 | - | no owner corpus on `master` |
| Second person | ≥85% | **unmeasured** | - | 0 | - | no second-person corpus on `master` |
| Matcher time per stroke end | ≤0.5 ms | **unmeasured** in committed evidence | - | - | - | `docs/research/BASELINE-2026-10-07.md:387 "not measurable headless here"` |
| Pen-down to cast | ≤900 ms p50 | **unmeasured** | - | - | - | - |

The command for the measured rows is the card's acceptance line,
`apps/vr/tasks/T03-sigil-recognition.md:78 "Automation RunTests MageArena;Quit"`, after
`apps/vr/tasks/T03-sigil-recognition.md:74 "--corpus 30 --seed 1000"` (2000 for the re-seed).
The synthetic rows pass their bars. The gate as written, on people's held-out draws, is **open**:
the two rows that name people have no measurement, and no synthetic pass fills them.

## Two harness defects that would have certified more than they measured

The orchestrator's review of the first green run found both, and the retry fixed both:

- `apps/vr/tasks/T03-sigil-recognition.md:102 "Vacuous templates test:"`: a template that
  failed extraction was skipped with a `continue`, so a passing test did not mean every
  template loaded. After the fix the report states
  `docs/research/FEASIBILITY-2026-10.md:232 "The templates still load 12/12/12 with none skipped."`
- `apps/vr/tasks/T03-sigil-recognition.md:111 "False-cast test counts unfed seconds:"`: the
  per-minute rate divided by seconds of noise that never reached the recognizer.

Both are **upward lessons**, folded into the technique as one decision rule. A harness that
skips or pads its inputs certifies less than it reports.

## Where the tree falls short of the standard

- **Held out by seed, not by person.** Templates and tests come from one generator, so the
  figure certifies the generator's variation. The technique's rule on a single producing
  process applies: independent evidence needs strokes the generator did not make.
- **The negatives do not move with the seed.**
  `docs/research/FEASIBILITY-2026-10.md:236 "seeds the impostor and noise clips from fixed bands"`.
- **No per-person report.** With no people in the corpus, no per-person spread exists yet.
  The plan schedules the second person
  `docs/PROJECT-PLAN.md:609 "for the sigil samples (D1 mouse, V2 hands)"`.
- **Latency stops at the matcher.** The only latency bar measured on the desk is the matcher's,
  and its committed figure is absent. The pen-down-to-cast budget, which is the one the player
  feels, has no instrument on `master`.

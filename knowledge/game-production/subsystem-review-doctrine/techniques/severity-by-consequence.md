---
layer: technique
type: technique
subject: subsystem-review-doctrine
technique: severity-by-consequence
status: forged
laws: [a-number-carries-its-unit-and-basis, grade-against-what-ships-not-on-a-curve]
shared_with: []
use_when: [assigning severity to review findings, a finding queue is sorted by convenience, tooling severity is being copied into a report]
---

# Severity by consequence

## The rule

**Severity states what happens if the finding is never fixed.** To the player, or to the
project. That is the entire basis, and it must be stated with the number so the number carries
its basis rather than floating free.

Severity is *not* derived from:

- **the category** the finding fell into — memory, correctness, convention, style. A category
  is a routing label. Every category spans the whole severity range.
- **the log level the tooling emitted.** A static analyser's `error` is a statement about its
  own confidence in a pattern match, not about consequence. Copying tool severity into a
  review report is the most common mechanical way severity becomes meaningless, because it
  imports another system's basis silently.
- **the reviewer's confidence.** An uncertain finding about save corruption is a high-severity
  finding held with low confidence. Confidence is a second axis; report it separately or not
  at all, but never fold it into severity.
- **how interesting it is.** Elegant findings are systematically over-rated and boring ones
  under-rated, and the drift is invisible without the mapping rule below.
- **the effort to fix.** Effort is the other axis of the triage plane. Collapsing the two
  produces a queue sorted by convenience, which is a queue that never fixes anything hard.

## The mapping

Assign from the worst realistic consequence of *not fixing it*, then check the label against
the ladder:

| Severity | The consequence that earns it |
| --- | --- |
| **Critical** | The process stops, or state is lost or corrupted: a crash on a reachable path, save corruption, progression that cannot be recovered, an unrecoverable stall. |
| **High** | The behaviour is wrong where a player will meet it: damage resolves incorrectly, an interface reports a value that is not the real one, an ability fires when it must not, a quest cannot be completed by a path that was promised. |
| **Medium** | Real cost with a workaround or a bounded blast radius: a hitch under load, an avoidable allocation on the frame path, duplication that will cause the next defect but has not caused this one. |
| **Low** | Convention, clarity and maintainability, with no path to player-visible harm on the current design. |

Two calibration rules that do most of the work:

- **Reachability gates severity.** A crash in an editor-only debug path is not critical,
  because the consequence never reaches anyone. A convention violation in the serialisation
  layer that will corrupt saves at the next schema change *is* critical, because the
  consequence does. Reachability is a claim about the shipping configuration, not the
  developer one.
- **Grade against what ships.** Severity is absolute, never relative to the batch. A review
  where everything is medium because "the rest of the codebase is worse" has graded on a
  curve. The reference is the standard of work that actually ships in this genre.

## The second axis

Report **effort** beside severity as an independent estimate — trivial, small, medium, large,
with the bands stated in wall-clock terms so two reviewers mean the same thing. Severity says
what it costs to leave; effort says what it costs to fix. Triage happens in the plane, and the
plane is why high-severity/trivial-effort items get done this afternoon and
low-severity/large-effort items get closed as won't-fix — decisions that are invisible when
the axes are collapsed into one "priority".

## Rolling up without lying

Severity survives aggregation badly. Rules that keep a roll-up honest:

- **Never average severities.** Report the distribution — how many at each level — and the
  worst. An average turns one critical among forty low findings into a comfortable number.
- **Weight a judged-content signal as a first-class term, not a footnote.** Where a subsystem
  carries both a structural quality figure and an independent judgment of the content it
  produced, a composite that lets the structural figure dominate will read green while the
  content is failing. Give the judgment a substantial share, carved from the structural terms.
- **Report disagreement explicitly.** When one signal reads healthy and another reads failing
  for the same subsystem, emit a discrepancy flag with a plain-language reason, and let it
  outrank the composite. A single rule computes it, shared by every surface that displays it,
  so the badge and the score can never diverge.
- **Unmeasured is not a pass.** A subsystem with no review is not a zero and not a green; it is
  unmeasured, and it renders as a label rather than a number.

## When not to use it

- **Not where a regulator or platform holder has imposed a severity taxonomy.** Adopt theirs
  and map yours into it; two competing severity vocabularies on one finding list is worse than
  either alone.
- **Not for prioritising within one sprint.** Severity feeds prioritisation but is not it —
  sequencing also depends on dependencies, who is free, and what is about to be rewritten.
  Keep severity a stable property of the finding; let the plan be the thing that changes.
- **Not for grading craft.** How good a produced artifact is has its own instrument with its
  own levels and reference standards. Severity answers "what does this cost", not "is this
  good".

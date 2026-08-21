---
layer: technique
type: technique
subject: runtime-observation-evidence
technique: bounded-evidence-with-provenance
status: forged
laws: [a-verdict-is-bound-to-its-content, a-number-carries-its-unit-and-basis, a-budget-shapes-the-output]
shared_with: []
use_when: [designing what a runtime verdict stores alongside itself, an audit cannot tell why a gate passed, evidence payloads are growing without bound]
---

# Bounded evidence with provenance

The concern: the **payload** a runtime verdict carries. A verdict with no attached
observation is an opinion; a verdict carrying the entire raw trace is a storage problem
that eventually gets truncated by whoever is on call. The target is a fixed-size,
decision-relevant extract that lets a later reader — a human auditor, a reviewing model, a
status page — understand why the verdict was reached **without re-running the observation**.

## What the payload contains

Six parts, and the shape is worth copying:

- **Kind.** Which mechanism produced this evidence — a driven scenario, an automated test
  run, a live-runtime query, a perceptual capture. The reader needs this before anything
  else because it determines which of the remaining fields are meaningful.
- **Timestamp.** When the verdict was produced, in an unambiguous absolute format.
- **Markers.** The specific emitted lines or structured results that decided the verdict.
  Not the whole log — the ones that decided it. If you cannot name them, your parser is
  matching something you do not understand.
- **Bounded samples.** A down-sampled extract of the observation rows, capped at a small
  fixed count. Eight is a defensible default: enough to see a shape, small enough that a
  thousand verdicts do not become a storage tier.
- **Derived statistics.** The aggregates computed over the *full* sample stream — pose
  swing in degrees, displacement, peak speed, sample count. This is the part that survives
  when the raw rows are dropped, and it is why down-sampling is safe.
- **Perceptual references and judgement text.** A pointer to the captured frame, and the
  observer's verdict text truncated at a stated character cap.

## Procedure

**1. Down-sample, do not truncate.** Keep evenly spaced rows across the run, always
including the first and the last. Truncating to the first N discards the end of the motion,
which is usually where the interesting thing happened; keeping the last N discards the
baseline. Even spacing preserves the shape at any cap.

**2. Compute the statistics before you bound the samples.** The aggregate must be over
everything observed, not over the extract. Otherwise you have a variance computed from eight
points presented as if it described three hundred, and it will disagree with the threshold
that was calibrated on the full stream.

**3. Cap free-form text at a stated length, and mark the clip.** An observer with a verbose
day should not be able to change your storage profile. Append an explicit ellipsis so a
reader knows they are seeing an extract rather than a terse verdict.

**4. Bind the payload to the artifact it judged.** Record a fingerprint of the content as it
stood. When the content changes afterwards, the verdict does not become false — it becomes
*evidence about the past*, and the payload must be able to say so. A gap that is visible is
survivable; "judged before the last change" silently reading as "judged and passed" is not.

**5. Record the conditions the numbers were taken under.** The tier observed at, the fixed
timestep, the run mode, the settle interval, the confounder isolations that were switched
on, the build identity. Every one of these changes what a number means, and a quantity
handed across a boundary without its basis is not information.

**6. Emit a one-line human summary derived from the payload, not authored beside it.** A
single deterministic function turns the payload into the line that appears in a
notification, a chat message, or a status row. Authoring that line separately guarantees
that one day it says something the payload does not support.

**7. Store the evidence with the verdict, in one write.** A verdict that lands without its
evidence, to be joined later, will be read without its evidence.

## Decision rules

- When choosing a sample cap, pick the smallest number from which the shape of the motion is
  still legible, and make it a named constant used by every producer. A budget handed to a
  producer shapes what it emits; leave it implicit and payload sizes will drift upward until
  something breaks.
- When a consumer asks for more raw data than the cap allows, the answer is a re-run with a
  higher declared cap, not an unbounded payload. Re-runs are cheap relative to a storage
  tier nobody can prune.
- When a perceptual artifact is referenced by an absolute location, remember that the
  reference is meaningless outside the machine that produced it. Serve it through a
  controlled reader that restricts both file type and directory, and build the reference
  with one shared helper rather than hand-assembling it at each call site.
- When evidence is absent because the observation was never made, store the absence as an
  explicit unmeasured marker with a reason. An empty payload and a payload proving success
  are different states and must be different values.

## When not to use

Do not attach heavy evidence to high-frequency, low-stakes checks. A structural validator
that runs thousands of times per build needs a verdict and a reason string, not a sample
stream; reserve the payload discipline for observations expensive enough that nobody wants
to re-run them to answer a question.

Do not treat the bounded payload as an archive. It exists to explain one verdict. If you
need trend analysis over full sample streams, that is a separate store with its own
retention policy, and conflating the two turns the verdict record into a data lake.

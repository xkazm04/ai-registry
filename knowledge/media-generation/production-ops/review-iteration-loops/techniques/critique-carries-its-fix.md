---
layer: technique
type: technique
subject: review-iteration-loops
technique: critique-carries-its-fix
status: forged
laws: [output-never-outruns-evidence, unmeasured-is-not-pass]
shared_with: []
use_when: [a self-review stage hands its findings to an automated next stage, designing the severity vocabulary of a review pass, revisions keep missing what the review meant, a reviewer blocks on concerns it cannot resolve, deciding whether a review pass is good enough to gate on]
---

# A critique carries its fix

A **finding** identifies a problem. A **critique** tells the next stage how to
fix it. The distinction is pedantic when a person reads the review and does the
work, because the reader repairs the gap without noticing. It becomes
load-bearing the moment the next stage is a machine that will act on the
finding without a human between them — and in a generation pipeline that
self-reviews every stage before checkpointing, that is the normal case.

## Two of the three axes are a retrieval pair

Review quality is not one dimension. The measured decomposition
(*Building a Precise Video Language with Human-AI Oversight*, arXiv 2604.21718)
reports critique quality on **precision, recall and constructiveness**, and
finds that all three govern downstream output quality — removing any one of
them measurably degrades what the next stage produces.

Naming the first two as a retrieval pair is what makes them tunable, because
they trade off the way precision and recall always do:

- **Precision** is the share of raised findings that are real. It is bought
  with anchoring: every finding names a concrete location — the artifact field,
  the line, the visible frame, the timecode. A finding that cannot point at
  anything is a guess wearing a severity, and per
  [output-never-outruns-evidence](../../../_laws.md#output-never-outruns-evidence)
  it may not be rendered with more certainty than the observation behind it.
  "The script may be too long" is an impression; "section three carries 180
  words in a 10-second window — 1,080 wpm, unspeakable" is a finding.
- **Recall** is the share of real problems raised. Its discipline is
  class-sweeping: on finding one instance of a defect, look for the rest of
  that class *before* returning, because a reviewer that reports one of three
  instances has produced a revision that fixes one of three and a next round
  that believes the class is closed. A pass that cannot complete the sweep
  should return "needs another pass" rather than a confident partial — an
  incomplete review reported as complete is the same lie
  [unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass) forbids a
  gate from telling.

Tuning one alone is what makes review passes feel useless. A reviewer pushed
for recall raises phantoms until the revision stage spends its budget on
nothing; pushed for precision, it reports only the obvious and the loop
converges on a piece with all its easy defects removed.

## Constructiveness gates severity when the consumer acts

The third axis is not a retrieval property, and it is the one with teeth: does
the finding carry a concrete repair — replacement text, the exact field value,
a specific corrective action?

The rule this technique argues for: **a finding that would block may not be
raised at blocking severity unless it carries its fix.** One that cannot is
demoted to a distinct non-blocking state — call it *investigation*: a real
concern, surfaced for the next round, obligating nothing.

The reason is mechanical rather than stylistic. A blocking finding hands the
next stage an obligation — this must be resolved before proceeding — and if it
carries no repair, the stage that must comply has to invent one. It will. The
invented fix is not traceable to the observation that triggered it, it is
usually broader than the defect, and it lands on approved material, which is
precisely the capital the surrounding subject exists to protect. An
unactionable blocker does not stop bad work; it commissions unreviewed work.
The demotion is therefore not a softening of the finding. It is routing: an
*investigation* keeps the concern visible and denies it the power to compel a
guess.

Severity so defined has three earned levels and one hatch: **critical** (must
be resolved; carries a proposed fix), **suggestion** (should be improved;
carries a proposed change), **nitpick** (may stand alone), and
**investigation** (real, unpinpointed, non-blocking). Each level above nitpick
is defined by what it *hands over*, not only by what it observed.

## The boundary: who consumes the finding

This rule inverts under a different consumer, and the inversion is worth
stating because both sides are correct.

Where review findings feed a **human triage queue**, severity is consequence
alone — what happens if this is never fixed — and fixability is a separate
axis that must never be folded in. Demoting a real, severe, hard-to-fix
finding because the reviewer could not propose a repair hides exactly the
findings most worth surfacing, and produces a queue sorted by convenience.
Another bundle in this registry holds that rule for subsystem review, and it
is right there.

A third consumer exists and is easy to break by over-applying this rule: the
one that asks only **"is there more work here?"** — a scheduler, a progress
report, a queue depth. That consumer is *right* to collapse every settle into
one boolean, because an abandoned round and a successful one are equally
finished for its purpose, and refining its arithmetic to prefer the successful
kind makes it under-report work that will never happen. Measured directly:
correcting a progress count to discount abandoned rounds reintroduced a stall
that an earlier fix had removed, because the count was never wrong. Sort
consumers by the question they ask, not by their distance from the reviewer —
and expect the cause to be needed at the door where findings become durable
evidence, not at the one where they become schedule.

The discriminating question is not the severity scheme. It is: **does the
consumer decide, or act?** A human decides, can hold an unactionable critical
indefinitely, and loses nothing by seeing it at full severity. An automated
next stage acts, cannot hold anything, and converts an unactionable critical
into fabrication. Read the consumer before choosing the scheme; a pipeline
with both — machine revision stages and a human approval gate — needs the
demotion on the machine path and the raw consequence severity on the queue the
human reads, and they are two renderings of one finding set, not two review
passes.

## When not to use this

Do not apply the demotion to a review a person will read directly; it costs
them information and buys nothing. Do not let *investigation* become the
dumping ground that lets a reviewer avoid the constructive work — a pass whose
findings are mostly investigations is a pass that did not do its job, and the
share of findings landing there is worth watching as a signal about the
reviewer rather than about the artifact. And do not confuse this with the
[note taxonomy](./note-taxonomy-focus-scope-order.md): that governs feedback
arriving *from* a creator, where the register must be inferred and never
over-answered. This governs findings the pipeline generates about its own
work, where the burden runs the other way — the review owes the next stage
enough to act on, or owes it no obligation at all.

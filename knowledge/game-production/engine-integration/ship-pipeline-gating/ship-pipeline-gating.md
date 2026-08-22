---
layer: golden-path
type: golden-path
subject: ship-pipeline-gating
status: forged
use_when: [ordering the gates of an expensive build or packaging pipeline, deciding what proof a shippable artifact needs, a build passed but the artifact does not launch, a gate's own configuration is missing or unreadable]
techniques:
  - preflight-before-an-expensive-cook
  - editor-only-api-audit-for-shipping
  - validator-log-classification
  - post-cook-process-liveness-smoke
  - size-budget-and-growth-baseline
  - fail-closed-on-corrupt-gate-config
---

# Ship pipeline gating

Everything between *it builds in the authoring tool* and *a player can install and run
it*. Those two states are separated by a transform that is long, expensive, and largely
opaque: content is converted to platform-native formats, code is recompiled under a
configuration that does not exist in the development loop, and the result is laid out as
a distributable. This subject is the set of gates around that transform, and — the whole
point — the **order** they run in.

The naive reading is that gating is a checklist: enumerate everything worth checking,
run it all, fail on anything red. That produces a correct pipeline that wastes the most
expensive resource it owns. A checklist ordered by the order its checks were written
runs a two-second configuration check after a thirty-minute conversion has already
burned. The pipeline is not wrong; it is *late*, and lateness in this domain is
measured in engineer-hours per day, per branch, per person.

## Cost ordering is the spine

Every gate has three properties, and you cannot place it until you have stated all
three:

1. **Its cost** — wall-clock, machine, and the human attention it consumes when it
   fires. A source scan costs seconds; a full content conversion costs tens of minutes;
   a launch-and-observe costs a fixed half-minute plus a machine that can actually run
   the artifact.
2. **What it uniquely proves** — the failure class it is the *cheapest* observer of.
   Not "what it checks", which is usually a superset; what nothing earlier can see.
3. **What it cannot prove**, so that nothing downstream is skipped on its strength.

Then the rule: **for each class of failure, place the check at the cheapest point that
can observe it.** A failure class with no cheap observer stays where it is; a failure
class with two observers is gated at the cheaper one and the expensive one keeps only
the residue it alone can see. Re-derive this for any expensive build — the ordering
below is a worked instance of the rule, not the rule itself.

The economics are blunt enough to compute. If a class of failure occurs on `f` of runs
and the expensive stage costs `C` while a check that catches that class costs `c`, the
check pays for itself when `f · C > c`. For a configuration typo — a project identifier
left empty, a default entry point unset — `c` is milliseconds and `C` is half an hour,
so the check pays for itself if it ever fires once in ten thousand runs. This is why
preflight exists, and it is the argument to lead with when someone asks why the
pipeline "wastes time on trivia before doing real work". The trivia is not the cost; the
trivia is what stops the cost.

## The order, and what each rung buys

**Before the transform, in ascending cost:**

- *Configuration sanity.* The declarations the transform will read hours later: an
  identity string, a default entry point, a default mode of operation, the target
  platform list. Each is trivially readable at rest, and each of them fails the
  expensive run at the very end, when the packager finally consults it. Milliseconds.
- *Source audit for configuration-conditional capability.* Code that compiles in the
  development configuration and does not exist in the shipped one. Seconds to minutes
  over a source tree. This is the only cheap observer of a failure class that otherwise
  surfaces as a link error deep in a recompile, or — worse — as a silently different
  runtime.
- *Gate-configuration integrity.* The thresholds and budgets the *later* gates will
  judge against must be readable now, because a downstream gate that discovers its own
  configuration is unreadable will do the wrong thing under pressure.

**The transform itself**, which you have now earned the right to start.

**During and after the transform, in ascending cost:**

- *Validator output classification.* The content validator has already run as part of
  the transform. Reading its log costs nothing extra and is the only source of truth
  about content-level defects — the exit status is not.
- *Artifact liveness.* Launch the packaged thing the way a user would and confirm the
  real process is still alive after a stated interval. Roughly half a minute, plus a
  machine of the target shape.
- *Size against budget and against the last known-good build.* Cheap to compute once
  the artifact exists, and the only observer of slow accretion — the failure class that
  never fails a single build and fails the release.

Notice that two of the post-transform gates are cheap and still cannot move earlier:
they observe *the artifact*, which does not exist until the transform completes. Cost
ordering does not mean "cheap first" — it means cheapest **capable** observer first. A
gate's placement is bounded below by when its evidence comes into existence.

## Two judgment modes, and which to prefer

A gate concludes in one of two ways, and they are not equally trustworthy.

An **exit-code-judged** gate runs a separate process to completion and reads its status.
This is a real verdict from an authority that is structurally separate from the thing it
judges, and it is the mode to prefer wherever a tool offers it. Choosing an
out-of-process build tool over an equivalent in-application automation run is often
worth a slower gate purely for this: the out-of-process tool can fail, and its failure
is unambiguous.

A **log-judged** gate must classify text, because the process it drove reports success
regardless. Any long-lived application driven into performing a task falls here: it was
built to survive its own errors and return to a prompt, so its exit status describes
whether the *application* held together, not whether the *task* succeeded. When you are
forced into this mode, the classification must be explicit and total — every line either
matches a known-error pattern, matches a known-success pattern, or is unclassified —
and unclassified is a distinct outcome from either verdict, not a quiet pass.

The status of such a process is uninformative **in both directions**, and this is the
half people miss. It exits zero after a run that failed; it also exits non-zero after a
run that entirely succeeded, because a large application tearing itself down can fault
during shutdown long after the work was done and written out. A gate that treats
non-zero as failure is not being conservative — it is failing builds for a reason
unrelated to the build, which teaches the team to ignore it.

The generalisation: **the exit status of a process that outlives its task is not a
verdict about the task**, in either direction. Wherever you cannot get separation
between the doer and the judge, you must reconstruct it by reading real output rather
than accepting a self-report.

Judgment mode is not the only axis when choosing which tool provides a gate. Coverage is
the other: an in-application task runner may cover only one authoring surface while the
out-of-process build tool covers the code that was actually edited. Choose on both — the
truth you need first, the judgment mode second — and when a tool wins on coverage but
loses on judgment mode, you have accepted a log-judged gate deliberately rather than by
default.

## The evidence a shippable artifact actually carries

Gating produces a claim, and the claim is worth what is under it. A packaged artifact
that has passed everything above has not been proven to be *correct*. Liveness is a weak rung — it discriminates
"launches and dies" from "launches and lives", which is a real and frequently-violated
property, and nothing more. It says nothing about whether the first level loads, whether
input works, whether anything renders. The ordering of evidence by observational kind,
and the design of checks that can actually discriminate a defect rather than merely pass,
are the concern of a neighbouring subject on runtime observation; a liveness smoke is one
low rung on that ladder and should be described as such in any report it feeds. What
matters here is that the report says which rung, so that "it packaged" is never read as
"it runs" and "it runs" is never read as "it works".

## Baselines, and the honest handling of their absence

Two of these gates compare against a previous state: size against the last known-good
build, and — in mature pipelines — validator warning counts against the same. A
comparison gate has three outcomes, not two: within tolerance, outside tolerance, and
**no baseline to compare against**. Collapsing the third into the first is the standard
error, and it is exactly wrong: a first build, or a build after the baseline store was
cleared, is the *least* verified build, not the most. Report it as unmeasured, let it
pass if that is the policy, and never let it print as a green comparison. Having no
baseline is not the same as having no regression.

There is a fourth outcome that is easy to miss and worse than the third: **compared
against a baseline that cannot be identified**. A store that records sizes without
recording which project, platform and configuration produced them will happily hand back
the most recent number it holds, and the gate compares against a stranger — a verdict
indistinguishable from a real one. A comparison must therefore *name* its reference:
which build, whose, when. A reference it cannot name is reported as unattributed, which
sits nearer to unmeasured than to a pass.

The corollary at the other end: a growth allowance against a moving baseline ratchets.
Ten percent per build, accepted ten times, is a doubling that no single gate ever
objected to. The absolute budget is what stops the ratchet, and it is the reason both
comparisons must exist rather than either alone.

## Failing closed is a design position, not an error path

Every gate has a configuration of its own — budgets, thresholds, token lists, allowed
growth. When that configuration is missing or unparseable, three behaviours are
available: proceed with built-in defaults, skip the gate, or refuse to run. The first is
the tempting one and the worst one, because it silently substitutes an authority nobody
chose for the one the team wrote down, and it does so precisely when the evidence that
something is wrong is strongest. A gate running on defaults it invented reports a green
that means nothing, and the report gives no hint that its own basis was fabricated.

Refuse. A pipeline that stops with *the gate's configuration could not be read* is a
five-minute fix; a pipeline that shipped against invented thresholds is discovered by
users. This is the same instinct that governs any automated actor working in a space it
does not own: when the preconditions for acting correctly are absent, a stated refusal
is a better result than a confident action.

The distinction that makes this tractable in practice: **absent and corrupt are
different facts.** A gate that was never configured is a state someone chose, and
whatever the schema defines for absence is a legitimate answer — often a disabled gate.
A gate whose configuration exists and cannot be parsed is a defect, and its correct
behaviour is the opposite: stay armed, and mark every verdict it produces as having been
reached on a basis nobody chose. A pipeline that collapses the two lets a corrupted file
silently disable a gate, which is indistinguishable from an operator turning it off.

## Failure modes of the naive reading

- **Implementation order masquerading as pipeline order.** Checks accumulate in the
  sequence someone wrote them. Nobody ever re-derives the ordering, and the pipeline
  quietly costs several times what it should. Re-run the cost/proof/placement statement
  for every gate whenever one is added.
- **Trusting the packager's exit code.** The transform can complete successfully and
  produce an artifact that is missing content, because the validator's complaints were
  never read. Structural completion is not content correctness.
- **Watching the wrong process.** A launcher exits cleanly the moment it has handed off;
  observing it proves nothing about the thing it launched. The single most common way a
  liveness gate is silently useless.
- **One machine's pass generalised to a platform.** A liveness smoke on the build agent
  proves the artifact lives on the build agent. Say so.
- **Gates that certify their own producer.** A pipeline whose only judge is the tool
  that did the work has no gate at all, merely a log.

The pipeline that results is not a longer checklist. It is a short, ordered, honestly
labelled sequence in which each rung is placed where it is cheapest, states what it
proved, and refuses to imply anything it did not.

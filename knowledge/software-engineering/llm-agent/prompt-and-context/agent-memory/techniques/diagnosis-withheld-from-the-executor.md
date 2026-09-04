---
layer: technique
type: technique
subject: agent-memory
technique: diagnosis-withheld-from-the-executor
status: forged
laws: [gate-sees-target, silent-state-is-ungoverned, count-carries-predicate]
use_when: [deciding who may read the consolidated store during a run whose trace will be used to revise a procedure, an improvement loop's proposals stop landing while task success stays flat, a self-revising agent reads its own accumulated lessons while performing the task, deciding whether accumulated diagnostics belong in the executing agent's prompt, a promoted procedure library plateaus and every run still passes]
---

# Diagnosis withheld from the executor

[procedure-promotion](./procedure-promotion.md) ends where the artifact is
minted, and it is honest about what comes next: re-promotion produces a new
version, not a silent overwrite. What it does not say is where the evidence for
that new version comes from. There is only one place it can come from — the
traces of runs that used the current version — and the moment a system reads
its own traces to revise its own procedures, the consolidated store acquires a
second kind of reader.

The two readers need **opposite** access, and the store cannot tell them apart
on its own:

- The **executor** runs the task under the current procedure. Its trace is the
  evidence.
- The **reviser** reads those traces and proposes a change to the procedure.

The subject's hierarchy already holds that one policy cannot govern three
layers with different physics. This technique is the same argument one level
down: **one policy cannot govern the consumers of a single layer either**, once
one of them is producing the evidence the other one reads.

## Why the executor is the wrong reader

A trace is a gate's observation of the procedure
([gate-sees-target](../../../../_laws.md#gate-sees-target)): the run either went
well under this artifact or it did not, and that is what licenses keeping or
changing it. The observation is only about the artifact if the artifact was the
only available source of the procedural knowledge the task needed. Any second
store the executor can reach is a side channel, and a trace produced with the
side channel open observes the side channel.

The consequence is precise and easy to miss: the contaminated run is **not a
failure**. It is a success. The executor had more help than the artifact
provides, so it passed more often — and the trace it produced cannot say whether
the artifact contributed anything at all. The cost is paid one iteration later,
by a reviser that cannot attribute an outcome and therefore cannot diagnose a
fix.

## The measurement: same store, opposite signs

A 2026 ablation on a procedure-evolution loop varied store access independently
for the two readers — one inference model, four task benchmarks (competition
mathematics, web-search question answering, spreadsheet manipulation,
long-context document question answering), scored as average accuracy across
the four, and the artifact library starting empty in every arm. When the
reviser is denied the store, its maintainer is removed too, so that arm has no
accumulation at all.

| Executor reads store | Reviser reads store | Avg. accuracy |
| --- | --- | --- |
| — (no procedure library at all) | — | 40.4 |
| no | no | 48.7 |
| **yes** | no | 45.3 |
| **yes** | yes | 60.9 |
| no | yes | **63.7** |

Two readings, and the second is the one that is hard to guess:

- **The reviser's access is worth +15.0 points** (48.7 to 63.7), the largest
  single effect in the study. Accumulated diagnosis is what lets a reviser
  resolve a failure mode that one iteration's traces do not explain.
- **The executor's access costs points in both arms** — 63.7 to 60.9 with the
  reviser reading, 48.7 to 45.3 without it. The sign does not depend on the
  other reader's configuration, which is what makes it a property of the
  executor's role rather than an interaction.

The magnitudes are not symmetric and should not be read as a wash. The
reviser's access is the reason to have the layer; the executor's access is a
2.8-to-3.4 point tax for opening it to the wrong reader.

## The failure signature is a plateau, not an error

Nothing breaks. Every gate stays green, every benchmark still reports, and the
executor's own pass rate is *better* with the store open. What degrades is the
information content of the loop's evidence, and no artifact records that —
[silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned) at
one remove, because the ungoverned state here is not the agent's belief but the
*trace's* claim to be about the artifact.

The observable symptom is therefore indirect and worth naming, because it is
what a maintainer will actually see: **the library stops earning while task
success stays flat.** Revisions get proposed and rejected at an unremarkable
rate, the artifact set converges early, and nobody can say why the loop stopped
finding anything. `procedure-promotion` already describes the neighbouring
version of this — a growing library failing silently while the agent succeeds
*around* it — and the two compound: a contaminated trace cannot even detect
that the library has stopped being used.

## The discriminator

The rule is not "keep accumulated diagnosis away from executing agents". Held
that way it contradicts [recall-injection](./recall-injection.md), which exists
precisely to put the consolidated layer in front of the agent that needs it, and
it would make the store useless. One question separates the two cases:

> **Will this run's trace be used to decide whether the artifact stays?**

- **Yes** — the run is an evidence-producing run. The executor sees the task and
  the artifact under revision, and nothing that could substitute for the
  artifact. Withholding is the price of a trace that discriminates.
- **No** — the run is production. The store is exactly what `recall-injection`
  says it is, injection is budgeted the ordinary way, and withholding is a pure
  loss with nothing bought.

Two corollaries follow. A system that cannot tell its evidence-producing runs
from its production runs cannot apply this technique and should say so rather
than splitting the difference; and the split is per *run*, not per *deployment*,
so the same executor in the same process may read the store on Tuesday's
production traffic and be denied it during Wednesday's evaluation pass.

## State the cost, or it will be reverted

The executor runs with less than it could have. That is a real loss, it is
visible immediately, and it is visible to whoever owns the executor's pass
rate — while the benefit is deferred by one iteration and shows up in someone
else's number. An access rule with an unstated cost is reverted the first time
the executor's rate is questioned, and the revert will look like a
clean win for a full iteration.

So write the trade next to the switch: this many points of immediate pass rate,
bought for a trace that can attribute an outcome. Both halves carry their
predicate ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)) —
the arm count, the benchmark set, and which runs were evidence-producing —
because the number that argues for reverting will be measured on the
contaminated configuration.

## When the executor genuinely needs it, that is a promotion signal

The strongest form of this technique is not an access control. If the
diagnostic layer holds something the executor needs *at run time*, the leak is
not the executor's access — it is that the material never got promoted.

This is the diagnosis behind the measured effect. Procedural knowledge sitting
in the diagnostic layer helps the executor and is invisible to the gate, which
is the definition of an unpromoted capability: it changes behaviour and nothing
reviews it. Closing the access does not delete the value; it converts a silent
assist into a **visible backlog** — the reviser now sees a failure the artifact
does not cover, and the correct response is to put the material through the one
promotion door, where it is versioned, tested and reviewable.

A loop that keeps finding the executor "needs" the store is a loop reporting its
promotion backlog in the only way it can. Read it that way.

## Boundaries to the two nearest instruments

Both neighbours say the read path is not neutral. They differ in what the read
damages, and therefore in the fix.

- [probe-without-write-back](./probe-without-write-back.md) — the reader's
  access damages the **ranking state**, because recall increments the counters
  that feed the value model. The instrument is a writer, and the fix denies it
  the write-back. Here the reader writes nothing; what it damages is the
  **evidence**, and the fix denies it the read.
- [instrument-exposure-control](../../../../engineering-assessment/measurement-method/measurement-honesty/techniques/instrument-exposure-control.md) —
  prior exposure to the instrument makes the score report recall of the
  instrument, so the number is **too high** and the capability claim is empty.
  Here the number is honest: the run genuinely succeeded at the task. What is
  hollow is the trace's claim to be *about the artifact*. The two point in
  opposite directions, which is the practical warning: exposure inflates the
  number you are reading, and this inflates the number you read *next*, so no
  check on the current score can see it. The deprived-input control that
  technique recommends is, read from here, the same move — this technique is
  what it looks like when the deprivation is made permanent for one reader
  rather than run once as a probe.

---
layer: golden-path
type: golden-path
subject: production-pipeline-phasing
status: forged
use_when: [designing a multi-stage media production pipeline, deciding what to persist versus regenerate between stages, running minutes-long generation without freezing the product, reporting honest progress across production phases]
techniques:
  - phase-order-and-graduation
  - asset-vs-disposable-render
  - long-run-as-background-job
  - worst-news-first-progress
  - shared-clock-across-phases
---

# Production pipeline phasing

A media production pipeline is a sequence of phases in which each phase's
output is the next phase's input and each successive phase is more expensive
than the last. Research is cheap words; a script is cheap structure; frames
cost real render money; score and cut cost render money *plus* everything
already spent upstream, because a defect discovered there invalidates work
from every phase before it. The entire discipline of phasing reduces to one
economic sentence: **downstream cost must never be spent on an upstream
defect.** Everything else — phase order, graduation gates, asset policy,
background jobs, progress reporting — is machinery in service of that
sentence.

The naive reading treats phases as a checklist: do step one, then step two,
show a progress bar, ship. That reading fails in four characteristic ways.
It lets expensive renders proceed against unapproved inputs. It stores
everything (hoarding disposable trials) or nothing (regenerating approved
work, voiding its reviews). It blocks the creator's screen for minutes while
a model works. And it reports progress as flattery — averages, percentages,
and "step 3 of 5" claims that hide the one fact that matters, which is that
something upstream is stuck. A principal practitioner designs against all
four at once, because they are the same failure seen from four angles: the
pipeline losing track of what is true.

## Cost rises downstream; certainty must rise with it

Order phases by what each one *settles*, not by what it produces. A phase
earns its place in the sequence when the decisions it locks are exactly the
ones the next phase would otherwise have to gamble on. Research settles what
is true and what is unknown; script settles what is said and in what order;
visual selection settles what is seen; scoring settles what is heard; the
cut settles how it all lands on one timeline. Run in this order, every
expensive act is performed against settled inputs. Run out of order — frames
generated before the script is stable, music commissioned before the runtime
is known — every downstream artifact carries a probability of being garbage
equal to the probability that the upstream decision moves.

The corollary is the **cheap-probe rule**: within a phase, fidelity is a
property of the *stage of decision*, not a global setting. Trials that exist
to be compared and discarded are rendered at the lowest fidelity that still
supports the comparison; only the winner is promoted to full quality. Paying
final-render prices for candidates is the within-phase version of the same
mistake the phase order exists to prevent — and it is the mistake the
[cost-per-usable-output](../../_laws.md#cost-per-usable-output) law prices:
economics are computed over usable outputs, and a candidate is not yet a
usable output.

## Two kinds of artifact, two lifecycles

Every object a pipeline touches is one of two things, and confusing them is
the root of most storage and rework pathology:

- A **durable asset** is anything a human decision has landed on: the
  approved script, the picked frame, the locked style contract, the research
  notebook, the cut decisions. Assets are the pipeline's memory. They are
  persisted, versioned, migrated forward when the pipeline's shape changes,
  and — per [edit-do-not-regenerate](../../_laws.md#edit-do-not-regenerate) —
  never silently replaced, because every review and gate verdict is computed
  against a specific version.
- A **disposable render** is machine output that exists to be judged: trial
  images, draft narrations, candidate cues. Disposables are cheap to remake
  and expensive to keep; their value is consumed the moment the judgment is
  made. They are rendered at probe fidelity, held only as long as the
  comparison needs them, and deleted without ceremony.

The boundary between the two is a human act — selection, approval, sign-off
— and it is the single most load-bearing event in the pipeline. A system
that cannot say which of its bytes are assets will hoard everything, leak
orphaned megabytes when projects die, and eventually regenerate something a
creator had approved.

## Long work runs beside the product, not in front of it

Generation is minutes, not milliseconds, and a pipeline that holds the
screen hostage for a model call has made its slowest component the gate on
every other phase. The standard is that any run longer than a breath is a
**background job**: started from a phase, running above it, surviving
navigation, and reporting back through a notification surface rather than a
blocked view. This is not a UI nicety — it is what lets the phase structure
do its job, because a creator who can leave a run and work another phase is
a creator whose cheap phases are never queued behind an expensive one.

Background jobs carry their own honesty rules. A job whose duration nothing
knows must not draw an invented completion fraction; concurrency policy is
per kind of work, not global (independent investigations may run in
parallel; anything that mutates a shared document is one-at-a-time); and an
interruption is reported as an interruption — never quietly promoted to
"done" or demoted to "never happened".

## Progress is a claim, and claims are audited

The status a pipeline reports about itself is subject to the same law as any
other quality verdict: [unmeasured-is-not-pass](../../_laws.md#unmeasured-is-not-pass).
Three rules follow.

**Worst news first.** When phase states aggregate — into a project status,
a dashboard row, a merged phase after a reorganization — the worst state
wins. One blocked phase makes a blocked project, whatever the other four
say. Averaging, or reporting the most advanced phase, is a lie with a
percentage sign; and a refusal or a stall, per
[refusal-is-a-state](../../_laws.md#refusal-is-a-state), is a state to surface,
never an error to bury.

**Only the phase speaks for the phase.** Progress is written by the surface
that computed it from its own data, through one mechanism, and by nothing
else — not a form, not a dashboard, not a default. "Nothing reported" is a
distinct, honest state, and no reporter may overwrite a state it did not
compute. A gate is the strongest form of this rule: it may never report
pass for something it did not check, and the fraction of the promise it
actually verified is part of its answer.

**Where the creator stands is not how far the work has got.** A bookmark
(the phase last visited) and progress (what each phase claims about itself)
are different facts with different writers. Systems that conflate them
either inflate progress by treating browsing as work, or refuse to remember
position for fear of doing so — both are avoidable by storing two fields.

## One clock, so "where is it jammed" is answerable

The final structural commitment: every phase indexes its output against the
same time base. Scene targets, narration segments, music cues, and timeline
clips all speak in the same seconds of the same runtime. This is what makes
the pipeline *diagnosable*: when second 13 through 26 has picture but no
music, the shared clock turns a vague "the score phase is behind" into a
precise "cue two, thirteen seconds, refused — the cut plays silence there
and says so." Phases that keep private clocks can each be individually green
while the assembled product has gaps and drift no surface can locate.

## Failure modes this standard exists to prevent

- **Downstream spend on upstream sand** — renders commissioned against
  scripts still moving, scores against runtimes not yet settled.
- **Full price for the wastebasket** — candidates rendered at final
  fidelity, inverting the cost-per-usable-output ledger.
- **The undead trial and the vanished approval** — disposables hoarded
  forever; assets regenerated and their reviews silently voided.
- **The hostage screen** — a modal spinner in front of a minutes-long run,
  serializing the whole pipeline behind its slowest call.
- **Flattering progress** — averaged states, invented fractions over
  unknowable durations, "done" claimed for the unchecked.
- **The unanswerable jam** — per-phase clocks, so nothing can say where the
  assembled product is broken.

## The techniques

- [phase-order-and-graduation](./techniques/phase-order-and-graduation.md) —
  declaring the order once, gating graduation on settled decisions, and
  reshaping the phase list without lying about history.
- [asset-vs-disposable-render](./techniques/asset-vs-disposable-render.md) —
  the boundary between pipeline memory and machine trials, and the storage,
  fidelity, and deletion policies each side gets.
- [long-run-as-background-job](./techniques/long-run-as-background-job.md) —
  minutes-long generation beside the product: survival across navigation,
  per-kind concurrency, honest interruption.
- [worst-news-first-progress](./techniques/worst-news-first-progress.md) —
  aggregation where the worst state wins, single-writer progress claims,
  and the bookmark/progress separation.
- [shared-clock-across-phases](./techniques/shared-clock-across-phases.md) —
  one time base for every phase's output, so gaps, drift, and refusals have
  an address.

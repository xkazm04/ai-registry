---
layer: technique
type: technique
subject: production-pipeline-phasing
technique: long-run-as-background-job
status: forged
laws: [refusal-is-a-state, unmeasured-is-not-pass]
shared_with: []
use_when: [running minutes-long generation or research from an interactive product, deciding which jobs may run concurrently, handling reloads and duplicate launches during long runs]
---

# Long run as a background job

Creative AI work is minutes, not milliseconds: a deep research pass, a
full-script recalibration, a batch render. A pipeline that fronts such a run
with a modal spinner has made its slowest call the gate on every phase, and
its creator a hostage. The standard: **any run longer than a breath is a
job** — started from a phase, running above it, surviving navigation, and
reporting back through a notification surface. The technique is the set of
honesty and concurrency rules that make that shape safe.

## The job record is the truth, and it outlives the screen

A job is a first-class record — id, owning project, kind, label, status,
start time — persisted independently of any view. The creator navigates
away, works another phase, comes back; the job is still there, and so is the
notification about work that finished while nobody watched. A run whose
existence lives only in a component's state dies with the component, and its
result — possibly minutes of paid model work — lands nowhere.

Status vocabulary matters. Four states carry the whole story: *running*,
*done*, *failed*, and **interrupted** — the honest word for "the product can
no longer receive the result". Per
[refusal-is-a-state](../../_laws.md#refusal-is-a-state), a failure or
interruption is surfaced with its reason, never blurred into an empty
success; and a settle call on a job that is no longer running is a no-op, so
a late result cannot resurrect a cancelled run.

## Concurrency policy is per kind of work

There is no single right answer to "how many at once" — because the works
differ, the rules must:

- **Independent work runs in parallel.** Three unrelated research topics are
  three jobs; a creator who wants three investigations gets three.
- **Anything that mutates a shared document is serialized per project.** A
  follow-up that revises the notebook it was launched from, a recalibration
  that rewrites the project's scripts — one in flight, ever. Two would race
  to revise the same document; the second reasons about a version already
  stale, and afterwards nobody can say which run produced what.

Enforce the serialization *at claim time, synchronously*, with checks that
widen progressively: an in-memory guard (two clicks in one event-loop tick
both read stale state — a plain state check cannot catch this), then local
state, then whatever shared record other product surfaces (other windows,
other sessions) can see. The refusal is a rule the caller can query, not
just a disabled button, because a caller needs to find out *why* nothing
happened. State the residual race window explicitly rather than pretending
the guard is airtight: without a compare-and-swap primitive, two claims
microseconds apart can both pass, and the honest note saying so is what lets
a later backend close it at the right seam.

## Progress: driven jobs do not get invented fractions

Distinguish two clock ownerships, and record which one a job has:

- A **timed** job — the runner owns a schedule and can honestly advance a
  fraction.
- A **driven** job — the caller owns the clock: the job waits on real work
  whose duration nothing knows, stays *running* until the caller settles it,
  and has no meaningful fraction.

Drawing a percentage over a driven job is inventing a measurement, which
[unmeasured-is-not-pass](../../_laws.md#unmeasured-is-not-pass) forbids in
progress reporting as surely as in gating: show elapsed time instead, which
is true. Carry an explicit flag saying whether the fraction means anything,
so no surface has to guess. And on a non-success ending, leave the fraction
where it stopped — an interrupted job that reads 100% told its last lie in
its last breath.

The corollary that bites: once every kind is driven, nothing in the job
layer can end a job by itself — so a job started without a caller who will
settle it runs forever at zero. Adding a new kind means adding its clock,
deliberately.

## Reloads, duplicate launches, and who may speak for a job

A reload mid-run poses a question the record must answer honestly: this
context can no longer see the run — was it ever going to finish? Mark it
*interrupted with a reason*, which is the only thing actually known — not
*done* (a fabrication) and not silently gone (a paid run vanishing). But
scope the claim: "I cannot see it" is a statement about the observer, not
the job. Where multiple product surfaces share the record, the surface that
*owns* a run may correct others' beliefs about it and must never be
corrected by them; a copy that still says running beats a copy that says
interrupted, because somebody can still see it.

## When not to use this

Sub-second and few-second operations do not want job ceremony — an inline
busy state on the control the creator pressed is the right shape there, and
promoting every save to a notification trains people to ignore the bell.
The threshold is the navigation question: if a reasonable creator would
leave the screen before it finishes, it is a job; if not, it is a busy
button.

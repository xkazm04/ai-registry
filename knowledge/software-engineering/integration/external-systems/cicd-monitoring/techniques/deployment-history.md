---
layer: technique
type: technique
subject: cicd-monitoring
technique: deployment-history
status: forged
laws:
  - count-carries-predicate
  - derivation-names-recomputation
shared_with: []
use_when: [answering what version sits on staging, judging whether a slow run is abnormal, a success rate quoted without its window]
---

# Deployment history

Live status answers *what is happening*; history answers the question the
user actually brought to the monitor: **"is this normal?"** A red run
means one thing after six green ones and something else entirely as the
fourth failure in a row. A 12-minute build is fine if builds take 12
minutes and an incident if they take 4. Live state alone cannot rank
either; the monitor that shows only "now" outsources normality judgment
to the user's memory, which is exactly the fallible instrument the
monitor exists to replace.

## Two shapes, one derived from the other

History has two renderings, and keeping their relationship straight is
most of the design:

- **The run log** — append-only: every run with its result, duration,
  trigger, ref, and actor. This is the ground truth; the provider owns
  it, the monitor windows into it.
- **Current-state-per-environment** — for deploy targets: what version is
  where, since when, put there by which run. This is a *derivation* —
  the latest successful deployment per environment, folded out of the
  run log — and per
  [derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
  it must name how it is recomputed: from which event set, with which
  fold (latest-successful-per-target). When the provider serves the
  derived view directly, prefer the provider's — it sees events the
  monitor's window may have missed; when the monitor computes its own,
  the recomputation is a stated rule, not an accretion of update
  handlers.

The environment view is what turns the monitor from a build watcher into
a deploy watcher: "what is on staging" is the single most-asked question
in the domain, and a monitor that can answer it beats one that merely
lists green runs.

## Normality cues

Beside every live run, the cheap statistics that make deviation visible:

- **Duration vs typical** — elapsed against a recent-window median for
  the same pipeline; a run at 2× typical is flagged *while still
  running*, which is the earliest possible hang detection an observer
  can offer.
- **Streaks** — consecutive results as a glyph strip; four reds in a row
  is a different fact than a red, and the strip shows it pre-attentively.
- **Fixed / broken markers** — the transition classes from
  transition-detection, persisted: "first green after 5 red" and "first
  red after 40 green" are the sentences an on-call human actually
  thinks in.

Every one of these carries its predicate, per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate): a
success rate without its window and filter ("92% — of what, since
when, on which ref?") is decoration that will be quoted as fact. The
windows are declared beside the number, and comparisons hold ref and
pipeline constant — folding feature-branch runs into the main-line
success rate manufactures noise in both directions.

## Terminal per attempt — cache accordingly

A finished *attempt* never changes; a finished run id can. The major
providers reopen a run under the id it already had. A re-run keeps the id
and counts attempts, and a retried job in a finished pipeline sends the
same pipeline id back through pending. (Checked 2026-09-26: one provider
allows up to 50 re-runs within 30 days of the first run and serves each
attempt at its own address; the other mints a new job id and reuses the
pipeline id.) So the cache key is **(run id, attempt)**, and where the
provider has no attempt number, the key is the run id plus the run's
last-updated stamp. A history row cached by bare run id shows the red of
attempt 1 beside the green of attempt 2 for as long as the cache lives.

With that key, history pages are still cached hard - none of the liveness
polling that live status needs applies (the client-fetch-cache subject
owns the mechanics; this is its easiest case). The volatile region is the
newest page boundary, where new runs append, **plus any run still inside
the provider's re-run window**. Refresh windows from the top, re-check
recent terminal rows by their updated stamp in the same collection call,
and never re-fetch the deep tail. The asymmetry still pays the budget:
the expensive surface (long history) is the static one, and the dynamic
surface is the head page plus the re-run window.

One honesty rule inherited from the provider relationship: history
windows are *windows*. Providers cap retention and page depth; the
monitor's "last 50 runs" is not "all runs", and any statistic computed
over a window says so — the predicate again.

## Decision rules

- Run log is ground truth; environment state is a named derivation of
  it; never hand-maintain the derived view.
- Show duration-vs-typical live, not post-hoc — the hanging run is the
  case where the cue pays.
- Streaks and fixed/broken markers over raw result lists; humans read
  transitions, not tables.
- Every rate, median, and streak carries window + filter, rendered, not
  implied.
- Cache terminal attempts by (run id, attempt) indefinitely; poll the head
  page, and treat a terminal run inside the provider's re-run window as
  able to reopen.
- The run log must receive every event the environment fold depends on -
  including removals. A fold over a log that never hears "undeployed"
  labels a deliberate removal as a failure (witnessed in the rust
  application).

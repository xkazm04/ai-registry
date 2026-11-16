---
layer: technique
type: technique
subject: multi-project
technique: passive-signal-ingestion
status: forged
laws: [failure-not-empty-success, one-authority-per-vocabulary, creation-names-reaper, derivation-names-recomputation]
shared_with: []
use_when: [deciding where a project view's freshness comes from, two surfaces disagree about what happened, a quiet project may just be unwatched, choosing what an incremental watcher stores as its position]
---

# Passive signal ingestion

The portfolio's picture of each project must be current without the
portfolio doing the projects' work over again. The wrong architecture
interrogates: re-scan each codebase, re-query each tool, re-walk each
history whenever a surface needs freshness — O(N × cost), paid at view time,
stale anyway because it measures when someone looks rather than when
something happens. The right architecture **listens**: every managed project
already produces exhaust as a side effect of being worked on, and the
manager's job is to watch that exhaust cheaply, continuously, and honestly.

## Watch the exhaust, not the work

The signal sources are the project's own native records, read where they
already live:

- **Version-control history** — commits, branches, merges: who did what,
  when, at what tempo. The single richest feed, and free.
- **Work ledgers** — session logs, run records, task journals left by the
  tools that operate on the project.
- **Notes and knowledge artifacts** — the human-side record of decisions
  and plans.
- **Run artifacts** — build results, score outputs, published reports.

Two properties define "passive." **Read-only:** watchers never write into
the project, never trigger its tooling, never cause the activity they
measure — a watcher that mutates its subject is an instrument corrupting its
own reading. **Exhaust-only:** if a signal requires *running* something in
the project, it belongs to a scanning or scoring pipeline with its own
schedule and budget — not to the watch loop, whose entire contract is
"cheap enough to run forever."

## Cadence: baseline plus acceleration

Uniform polling wastes exactly where portfolios are lumpy: most projects are
quiet most of the time, a few are hot right now. The standard is a **modest
baseline cadence** for every watched project — hourly is a sane default;
its job is bounding staleness for the quiet — plus **acceleration on
evidence of activity**: a cheap change probe (a head pointer moved, a file
stamp advanced, a ledger grew) promotes the project to a fast lane until it
cools. Cost then follows relevance by construction. The inverse matters too:
repeated no-change probes decay a project back toward the baseline floor,
so the fast lane never becomes a second permanent poll.

Acceleration may also be **announced**: the tools working inside a project
can push "something just happened here" to the manager, triggering an
out-of-cadence ingestion instead of waiting for the next tick. An announced
lane needs one guard the probe lane gets for free — a **per-project
debounce**: one hot session announcing every few seconds must not be able
to starve the shared ingestion-and-digestion budget, so out-of-cadence runs
are capped per project per window, and an announcement inside the window
coalesces rather than queues.

Watchers are supervised recurring work — registered, isolated per project
(one unreadable project must not stall the sweep), budgeted, and reaped with
their project's archival
([creation names its reaper](../../../../_laws.md#creation-names-reaper)); the
general obligations live in
[background-jobs](../../../../backend-platform/work-execution/background-jobs/background-jobs.md).

## Normalize into one event vocabulary

Raw exhaust is heterogeneous per source and per stack. At the ingestion
boundary each observation is normalized into the portfolio's **one signal
vocabulary** — a closed set of event kinds (work-landed, run-completed,
note-taken, milestone-moved, …) with a common envelope: project key, kind,
timestamp, actor when known, a one-line human rendering, and a link back to
the raw source
([one authority per vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Every consumer — wall, tabs, pulse, alerting — reads the normalized stream.
The alternative, each surface parsing raw exhaust its own way, guarantees
two surfaces eventually disagree about what happened.

## The pulse: a narrative, not a log

Consolidation is the step that makes signals *legible*: per project, the
normalized events are digested into a **pulse** — a compact, chronological
narrative of the recent past ("landed the payments refactor across nine
changes; scores refreshed, two dimensions improved; notes added on the
rollout plan") rather than an unbounded event list. The pulse is a stored
derivation: bounded in length, rebuilt from the event stream on demand, its
recomputation named
([derivation names recomputation](../../../../_laws.md#derivation-names-recomputation)).
Summarization may be mechanical (grouping, counting, templating) or
model-assisted; either way the pulse links back to the events it digests,
because a narrative nobody can audit decays into a narrative nobody
believes.

Two further properties separate a pulse from a fancy log. **Continuity:**
successive digestions carry forward, revise, or explicitly retire the named
threads of the previous pulse rather than rewriting from scratch — a
narrative that reinvents itself every cycle is churn wearing prose, and the
"carry / replace / retire" decision is exactly the judgment the
consolidation step exists to make. **Cost accounting:** when digestion
spends a metered resource (model calls above all), the pulse records what
its own production cost, per run — a continuously running summarizer whose
spend is invisible is the one background expense nobody ever approves and
nobody ever cancels.

Consumers read the digest — the pulse and the normalized stream — and never
reach past it to re-walk raw exhaust. One digest per project is the single
authority for "what happened lately"; the moment a surface bypasses it, the
portfolio has two recent pasts.

## Unwatched is a state, never a silence

The failure mode that ruins listening architectures: a watcher loses access
— path gone, permissions revoked, machine asleep, parser broken by a format
change — and reports *nothing*, which downstream renders exactly like a
genuinely quiet project. The portfolio then shows calm for a project it can
no longer see; the operator trusts the calm; weeks vanish. The law is
[failure ≠ empty success](../../../../_laws.md#failure-not-empty-success), applied
without exception:

- Every watch attempt ends in an explicit verdict: **observed-changes,
  observed-quiet, or could-not-observe** — three outcomes, never two.
- Could-not-observe is durable state on the project (unwatched-since, with
  the reason), surfaced at every drill level — the wall card, the matrix,
  the tab glyph all show *blind*, distinctly from *quiet*.
- Watch freshness is itself a signal: "last successfully observed" is part
  of the project's summary row, so even the success path carries its age.

- The verdict is also the **cursor's gate**. A watcher that reads
  incrementally holds a position — a last-seen stamp, a head pointer, a
  since-mark — and a could-not-observe pass must not advance it. Advancing on
  a failed pass converts a transient blindness into permanent loss: the
  window the watcher could not read is never offered again, and the next
  successful pass reports quiet over a gap nothing will revisit. So the
  position moves only on a verdict that actually observed, and where the
  watcher is a stateless poll, the position and the blind-since stamp live on
  the same durable subscription record and are written in one act — no path
  may update one without the other.

### The new position comes from the read, never from the clock

The cursor's gate decides *whether* a position may advance. It does not say
*where to*, and the obvious answer, "now", is wrong in three routine ways.
Each one loses work as permanently as advancing past a blind pass, and none
of them shows up as an error.

- **The stamp is taken from what the read covered.** That is the instant the
  read began, or the newest item it actually returned. It is never the clock
  after the pass, and certainly not after the digestion step the pass fed. A
  position stamped when a slow summarizer returns skips everything the
  project produced during that summary. The next read starts after it.
- **A capped read covers only what it returned.** A per-read ceiling
  protects the digestion budget, and that is right. But a ceiling that keeps
  the newest items and drops the oldest leaves a gap at the *bottom* of the
  window. Moving the position to the top hides that gap for good. A capped
  read must either page oldest-first until it reaches the old position, or
  leave the position where it was and report itself as partial. Truncating
  silently and then advancing is the empty-success failure again, with a
  log line on it.
- **History is not ordered by its own timestamps.** Version-control history
  arrives late and out of date order. A fetch or merge brings in work made
  elsewhere, possibly days earlier. Rebases and cherry-picks re-stamp work.
  Clocks on different machines disagree. A watcher that asks "everything
  dated after my last stamp" never sees work that is dated before the stamp
  but arrived after it. Some date-limited history walks are worse: they stop
  at the first commit older than the bound, so one old-dated commit hides
  newer ones behind it. For a history the sound position is
  **reachability**: remember the heads you saw, and read what is reachable
  now that was not reachable then. Dates order the narrative. They never
  decide what was read. A remembered head can stop being reachable,
  because history was rewritten or the object was pruned. Then the range
  cannot be computed. That is could-not-observe for the range, and it ends
  in an explicit re-baseline, not a silent jump to the current head. The
  two errors are not symmetric: offering rewritten work a second time can be
  undone, and skipping work cannot.

These are one rule seen from three sides. The position records *what has
been observed*. A wall-clock value only stands in for that when the source
is append-only, gap-free and stamped by the same clock. Exhaust from a
working project is none of those things.

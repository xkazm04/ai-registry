---
layer: technique
type: technique
subject: feed
technique: feed-retention
status: forged
laws:
  - creation-names-reaper
  - failure-not-empty-success
  - derivation-names-recomputation
shared_with: []
use_when: [declaring retention when a feed is created, reaper stopped running after a refactor, cursor past the horizon renders as no more history, a retention window is operator-configurable, a purge runs under a platform execution deadline]
---

# Feed retention

A feed accumulates by definition — every occurrence is an append, forever,
unless someone decides otherwise. "Someone decides otherwise" is this
technique. A feed created without a retention declaration has not avoided
the decision; it has made it by default in the worst form: unbounded growth,
discovered later as a slow query, a bloated store, or a migration that times
out, and then resolved in a panic by whoever hits it — which is how feeds
end up truncated by a hotfix with no design at all.

## Declare at creation

Retention is part of the feed's contract, stated when the feed is created,
in one of three shapes:

- **Age bound** — occurrences older than a horizon are reaped ("90 days").
  The natural fit for feeds whose value is recency; the horizon should be
  set from the reader's real catch-up window, not from storage anxiety.
- **Count bound** — the newest N are kept. Fits per-entity feeds (the last
  500 events of this job) where a busy entity should not hold years of
  history just because it is busy. Age and count compose; the tighter bound
  wins.
- **Windowed view over an archive** — the feed keeps a working window and
  explicitly names the durable record behind it (the audit store, the event
  log). This is the honest shape for systems that need both a readable
  digest and a complete record: the feed may forget because the archive
  does not, and the feed's retention statement *points at* the archive
  rather than gesturing at one.

Whichever shape: **the reaper is named.** What deletes, on what schedule,
invoked by what — a scheduled job, a rolling delete on insert, a vacuum
task. An unowned retention policy is a policy that stops running the first
time its accidental host is refactored away, and nobody notices until the
growth curve does. The well-formed reaper has three further properties,
each cheap at design time and expensive to retrofit:

- **Its parameters are settings, not constants** — the horizon and the
  floor are read from configuration the operator can see, with a stated
  default, so retention is a decision that can be revisited without a
  release.
- **It composes an age bound with a per-entity floor.** "Older than N days
  *and* beyond the newest K for this entity" — so a quiet entity keeps its
  last handful of history forever (a feed that reaps an agent's only run
  because it is 31 days old has deleted that agent's entire story), while
  a busy one is bounded. The floor's threshold must be a *total-order*
  cut: choosing the K-th newest row by timestamp alone, on a key that can
  tie, keeps K−1 or K+j rows at a tied boundary. Same tiebreaker rule as
  everywhere else in this subject; the reaper is one more consumer of the
  order.
- **It reaps only settled occurrences.** Rows still in flight — a running
  job, an open incident — are never eligible regardless of age; the
  predicate names the terminal states, and an occurrence that has not
  reached one is not history yet. The corollary is the one people reach for
  when in-flight rows pile up: **a stuck occurrence is released by its own
  lease, never by the reaper.** Deleting a live row on age does not retire
  its record, it silently drops the work — and it hides the leak that made
  the row stick.

Two decisions sit above the reaper and get made once:

- **Not every class of row is the tenant's to configure.** Retention that is
  a product promise about a reader's history is one thing; rows that are
  operational plumbing — a queue's entries, a dispatch log — are another,
  and nobody using the product has an opinion about how long they are kept.
  Those get a fixed horizon rather than a setting, precisely so that a
  deployment which configured *no* retention still cannot accumulate them
  forever. Splitting the two is what lets the configurable half default
  conservatively without the unbounded default sneaking in behind it.
- **Unset is not zero.** A retention window has one value that means "keep
  everything" and one state that means "nobody has decided", and collapsing
  them is how a blank configuration field becomes a deletion. Missing, blank
  and unparsable all fall back to the stated default; an explicit zero is a
  decision, and the only one the safety floor below never second-guesses.

## The reaper needs its own safeguards

A reaper is the only process in the subject whose work is invisible by
construction: it succeeds by removing the evidence that it ran, and it fails by
doing nothing, which looks identical. Four safeguards, each of which exists
because the failure it prevents is silent.

- **The settings have a floor, and the floor is one-directional.** A
  configurable horizon applied verbatim is a deletion weapon one typo wide —
  a horizon of `1` meant as `100` irreversibly removes nearly all of a
  tenant's history on the reaper's next tick, and no amount of "the operator
  typed it" makes that recoverable. A configured-but-below-floor window is
  **refused and raised**, not applied: the affected scope is skipped and an
  operator is paged, with an explicit override for the rare intentional case.
  "Keep everything" is never floored, because the floor bounds only the
  destructive direction.
- **A horizon change can be previewed before it runs.** Counting what a policy
  *would* remove, changing nothing and writing no trace, is the only way an
  operator can evaluate a bound whose effect is otherwise first observable as
  loss. The preview must be able to run against a below-floor policy the
  reaper would refuse — seeing the cost is exactly how someone discovers the
  number was a typo.
- **The reaper is interruptible, resumable, and reports where it stopped.**
  Anything that deletes at scale runs under somebody's deadline — a scheduler,
  a platform's execution cap, a maintenance window. Delete in committed
  batches, check a wall-clock budget *between* batches (including inside a
  single large entity, not only between entities), and stop cleanly with a
  partial result naming how much remains. Each committed batch is its own
  safe state, so the next run resumes by re-selecting rather than by
  remembering. Two details decide whether this works: the budget is derived
  from the deadline in one place rather than restated as a second constant
  that can drift from it, and it is derived from the *real* deadline — a
  requested cap the platform does not honor produces a budget that never trips
  and a run that is killed mid-delete with no error and no summary.
- **A degraded run must not report success.** The reaper is typically watched
  by something that sees only a success signal, so an incomplete run, a
  skipped sweep or a misconfigured deployment that has quietly stopped
  enforcing anything must all be distinguishable from a clean one *in that
  signal*. Both channels count: the errors raised, and the fact of having
  stopped early with work outstanding. A run that silently skipped its
  trailing sweeps and reported success is how the named reaper stops being
  named.

**The reap writes its own record.** What was removed, per class, under which
policy, in which window. That record is the only detector for "the reaper
stopped running after a refactor" that does not require waiting for the growth
curve, and it is the trace a deletion owes anyway. It is also the one write in
this subject that is *not* best-effort: a feed row lost while recording an
occurrence must never suppress the occurrence, but deletes applied with their
trace missing is a destructive act with no evidence, and that is a degraded
run by the rule above.

## The horizon is visible

Retention creates an edge, and the edge must render as an edge:

- **End-of-feed says why it ends.** Scrolling to the bottom of a retained
  feed reads "showing the last 90 days" (with the archive link, if one
  exists) — not a mute stop that is indistinguishable from "this is
  everything that ever happened". The distinction is exactly the
  failure-vs-empty-success law applied to history: *truncated* and
  *complete* must be spelled differently.
- **A cursor past the horizon resolves to a stated truncation.** History
  paging with a cursor older than the oldest retained row returns the
  oldest window plus the truncation marker — never an empty page, which
  the client would render as "no more history" with false confidence.
- **A read-position anchor past the horizon means unseen events were
  reaped.** The honest resolution: treat the reader as caught-up-by-
  forfeit at the horizon (anchor snaps forward) *and say so* ("events older
  than 90 days were removed") when the gap is material. Silently zeroing
  the badge converts "you missed things that are now gone" into "nothing
  happened" — the exact lie this subject exists to prevent.

## What reaping may not do

- **Reaping is retention, not moderation.** Deleting an embarrassing
  occurrence from the feed while it remains in the archive — or worse,
  nowhere — is not retention; it is editing the ledger. If the product
  needs redaction, that is a distinct, audited operation with its own
  trail, not a quiet reuse of the reaper.
- **Reaping does not create fake quiet.** A count-bounded feed on a busy
  entity can reap events younger than the reader's last visit. The unseen
  derivation and the horizon marker must account for it (previous point);
  the alternative — a feed that looks serenely caught-up because the
  backlog was deleted — is worse than a large honest number.
- **Derived summaries survive on their own terms.** If reaping is paired
  with rollups ("March: 4,120 events, 12 failures" persisting after
  March's rows are gone), the rollup is a derived value whose source is
  about to be deleted — it must be computed *before* the reap by a named
  process, and it must present as a summary, not impersonate the atomic
  rows. This is the storage-side cousin of clustering, and the view-not-
  storage invariant from [event-clustering](./event-clustering.md) is
  precisely what it trades away: do it only at the retention boundary,
  where the atomic rows are leaving anyway.

  **"Before" is not sufficient once the reaper retries.** A reaper that
  deletes in retried batches will re-run a batch whose delete was rolled
  back, and a rollup written outside that batch's transaction survives the
  rollback and is folded a second time on the retry — the summary silently
  double-counts exactly the rows the failure was supposed to protect. The
  rollup must be *committed by the same transaction as the deletes that
  remove its inputs*: then a retried batch rolls back both halves and
  re-selects only surviving rows, so no occurrence can be summarized twice
  and none can be deleted without its summary. Compute it outside the
  transaction if that is cheaper, but re-read and commit it inside.

## Sizing the horizon

The retention parameters are product decisions with engineering bounds, and
they are testable: the horizon should comfortably contain (a) the longest
realistic reader absence the product wants to absorb (vacation-length, for
team surfaces), and (b) the longest investigation lookback the feed itself
is expected to serve — anything past that belongs to the archive and its
tools. If incident review keeps needing feed history the reaper has eaten,
the fix is pointing reviewers at the archive, or lengthening the horizon
deliberately — not disabling the reaper in place, which is the unbounded
default sneaking back in wearing an exception.

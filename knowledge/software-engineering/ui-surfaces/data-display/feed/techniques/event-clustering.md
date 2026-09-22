---
layer: technique
type: technique
subject: feed
technique: event-clustering
status: forged
laws:
  - derivation-names-recomputation
  - count-carries-predicate
  - identity-survives-reuse
shared_with: []
use_when: [one busy producer drowns the whole feed, deciding whether clusters may be stored or only derived, expanded clusters reset as new members arrive, a push channel is throttled while the feed must stay complete]
---

# Event clustering

An honest event stream is repetitive: one sync emits three hundred
record-touched events, one pipeline run emits a status change per stage, one
noisy integration heartbeats every minute. Rendered one-per-row, the busiest
producer owns the whole feed and the reader's real question — *what else
happened?* — drowns. Clustering is the fix, and it is a design duty, not an
optimization: a feed without it degrades in proportion to how much its
system actually does.

## The invariant: a cluster is a view

**Occurrences are stored atomically; the cluster exists only at render.**
The grouping is a derivation — recomputable from the atomic rows at any
time, revisable when the grouping rules improve, and owned by the read path.
The moment clusters are materialized into storage ("collapse these 300 rows
into one summary row and delete them"), three things break at once: the
uncollapsed log is gone (expansion now has nothing to reveal), the grouping
rules are frozen at write time, and any other consumer of the stream — the
audit trail, a metric, a different feed with different rules — inherits a
lossy view it never chose. Summarization *of storage* is a retention
decision and belongs to [feed-retention](./feed-retention.md); clustering is
presentation.

The derivation names its recomputation by construction: re-run the grouping
over the atomic rows. If the implementation caches grouped results, that
cache carries the same obligation as any derived store.

## The grouping predicate

A cluster is a run of occurrences that are (1) **consecutive in feed
order**, (2) **related** under an explicit key — typically same kind + same
actor, often same object or same causal parent (the run id, the sync batch,
the pipeline execution), and (3) **within a time window** of one another, so
that a quiet hour between two similar events reads as two events, not one
long one.

Each clause earns its place:

- **Consecutive only.** Clustering across an unrelated interleaved event
  reorders the feed — pulling the 09:14 sync event up into the 09:20 sync
  cluster moves it past the 09:17 deploy the reader needs in sequence. The
  moment grouping is allowed to jump gaps, the surface is no longer a feed;
  it is a grouped report wearing feed chrome. A burst *interrupted* by one
  foreign event legitimately renders as two clusters.
- **An explicit relation key.** "Looks similar" is not a predicate.
  The key is declared per event kind — which fields must match for two
  occurrences to co-cluster — and lives with the feed's event vocabulary,
  not scattered across render sites. Causal-parent keys (all events of one
  run) produce the most meaningful clusters because they match how the
  reader thinks: *the deploy*, not *eleven deploy-ish rows*.
- **A window.** Bounded by wall-clock gap, and usually also by size — a
  ten-thousand-event cluster is technically one run and practically a
  data-loss device; cap it and chain ("and 9,700 more…").

## What the cluster row says

The collapsed row is a *summary with a predicate*. "47 records synced" must
be true under stated scope: 47 what, counted how, over which span — usually
rendered as the relation key's human form plus the count plus the time span
("Sync · 47 records · 09:14–09:16"). Counts that travel (into badges, into
notifications) inherit the same obligation. Terminal severity is not
averaged away: a run of 46 successes and 1 failure clusters into a row that
*shows the failure* — the reader must never expand a calm-looking cluster to
discover a buried error. Mixed-outcome clusters surface their worst member's
outcome, or refuse to collapse the failing member at all.

## Expansion

The uncollapsed run is reachable from the cluster row — inline disclosure
expanding the members in place, in order, is the default. Expansion is
presentation state, not a data mutation: it does not touch read positions,
and collapsing again loses nothing. For very large runs, the expansion is
itself windowed (first and last members plus a "show all" door into the
full log view). The full-log destination matters beyond scale: an
investigation wants the *unclustered* stream with filters — that surface is
the audit/log view, and the cluster row should link into it scoped to the
relation key, which is the honest bridge between "readable digest" and
"complete record".

Because the cluster is a view, **the clustered digest and the flat log can
coexist as two surfaces over one stream** — a conversation-shaped view that
collapses machine runs into single rows, beside a stream view that shows
every atomic occurrence, both reading the same storage. That coexistence is
a feature to design for, not an accident to tolerate: the digest answers
"what happened", the flat log answers "exactly what happened", and neither
can serve both readers. The pair is only cheap because clustering never
touched the storage.

## Cluster identity under live growth

Clusters at the feed's head grow: the sync emitting its 48th event extends
the newest cluster. Identity discipline keeps that stable:

- **A cluster's render identity derives from its members** — in practice,
  the relation key plus the id of its oldest (anchor) member, which never
  changes as new members join. Keying by newest member or by count
  re-creates the cluster on every arrival, which replays entrance animation
  and destroys expansion state precisely on the busiest rows. The relation
  key alone is not enough either: two separate runs of the same relation
  (this morning's sync and last week's) are two clusters, and only the
  anchor member distinguishes them.
- **Identity and position anchor at opposite ends, deliberately.** The
  cluster's *identity* is its oldest member (stable under growth); its
  *timestamp* — the position it occupies in the chronology — is its newest
  member, advancing as the run continues. A live run is one thing that is
  still happening, and "still happening" sorts at now; freezing the cluster
  at its first event buries an active run under everything that arrived
  since it started.
- **A new arrival that extends a cluster updates that row in place** —
  count ticks, span end extends. It must not be double-counted: the "N new"
  affordance and the unseen derivation count *occurrences*, not rows, and
  clustering must not hide arrivals from either.
- **Expansion state survives growth.** A cluster the reader has expanded
  stays expanded as members join; the new member appears at the appropriate
  end of the expanded run.

## The channel's throttle is not the feed's cluster

Clustering serves a reader who is looking at the surface. A feed that also
*pushes* — to a pager, a chat sink, an inbox — is interrupting a reader who is
not, and that channel needs a volume control of its own: a cooldown admitting
at most one notification per relation per window. The two are easy to mistake
for one mechanism, and each is the wrong fix for the other's problem.
Throttling the feed deletes occurrences; clustering the pager delays the one
notice that was worth the interruption.

What keeps a channel throttle from quietly becoming write-time clustering:

- **The occurrence still lands in the feed, every time.** The throttle decides
  *delivery*, never existence. A stream the pager thinned is a stream that lies
  to the reader who opened the surface precisely to find out what they missed.
- **The suppression is recorded on the occurrence, with its reason.** Not
  delivered, and why — no sink configured, inside the cooldown window, the send
  failed. Those are three different facts about one row, and the row is the
  only place a reader can ever learn them. A throttle that leaves no mark *is*
  write-time collapse with no expansion: the members are gone, the count is
  gone, and nothing states that anything was withheld.
- **One key spans the opposing directions of a relation.** A subject
  oscillating across a threshold — degraded, recovered, degraded — is exactly
  the noise a cooldown exists to mute, and two pools keyed by direction let it
  alternate every cycle, each pool individually within its window and the
  channel unreadable. Claiming the slot must also *consume* it, or the two
  directions double-fire inside one window.
- **Classes that must not starve each other get separate keys.** A routine
  notice and a rare high-consequence one sharing a key means the routine one
  wins the window every time and the consequential one is never sent. This is
  the per-source budget argument from the feed's union rules, pointed at the
  outbound channel.
- **Claim the slot at the delivery door, not at detection.** A window burned by
  an occurrence that was never going to be sent — no sink resolved, the send
  abandoned upstream — suppresses the next one that would have been. The
  check-and-stamp is one indivisible step taken immediately before the send,
  which also collapses two overlapping detections into a single notice.

The cost is real and belongs in the design note rather than in a later
incident: a genuine second occurrence inside the window loses its push. That is
acceptable only because the feed kept it — which is why the first rule is
first.

## What not to cluster

Singular, high-consequence occurrences — failures, security events,
approvals, anything the reader would act on individually — resist
clustering even when consecutive and related. The predicate should exclude
them by kind. A feed that collapses five failed runs into "5 runs failed"
has summarized exactly the rows that deserved individual attention; the
correct collapsed form for repeated failures, if volume forces one, keeps
each failure's identity visible in the expansion *and* alarms in the
summary.

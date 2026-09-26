---
layer: technique
type: technique
subject: cicd-monitoring
technique: liveness-scoped-polling
status: forged
laws:
  - creation-names-reaper
shared_with: []
use_when: [deciding whether a poll loop deserves its next request, loop stops one poll early and misses the finish, hidden tab keeps burning shared rate limit]
---

# Liveness-scoped polling

The polling loop that watches remote pipeline state, scoped so it runs
exactly while running it can still change something. Two independent
liveness gates, both required:

- **State liveness** — at least one watched entity is in a non-terminal
  state. A finished attempt's status is fixed, so polling its detail again
  is a request whose answer is already known. The gate is computed from
  the freshest snapshot, so each poll re-decides whether there will be a
  next one. The state split has three sides, not two:
  - **progressing** (queued, preparing, running, canceling) - will change
    on its own, soon: active cadence.
  - **parked** (waiting for a manual action, for an approval, for a
    schedule, for a resource) - non-terminal, and it will not move until
    something outside the pipeline acts. That can take days; approval
    waits of up to 30 days are documented. Parked entities poll at the
    idle tier. At active cadence they burn budget for days, and dropped
    from the loop they never report their ending.
  - **terminal for this attempt** - detail polling stops. The run id can
    still reopen (a re-run or a retried job reuses it; see
    deployment-history), so the *collection* poll at idle cadence is what
    notices a terminal row going live again. A loop that removes a
    finished run from every poll never sees a retry that someone started
    in the provider's own UI.
- **Attention liveness** — the surface displaying the answer is mounted
  and visible. A hidden window, a navigated-away view, a background tab
  is a reader who left; the clock suspends and resumes with attention.
  (If the monitor also feeds a background notification channel, that
  channel's poller is a *separate, slower* loop with its own budget — the
  UI-cadence loop never runs headless just because notifications exist.)

A monitor that polls finished pipelines forever is a rate-limit incident
on a timer: each individual request is cheap, legal, and useless, and
their sum arrives as throttling for every consumer sharing the token. The
budget arithmetic and the polite-refusal handling live with rate-limiting
(storm-hygiene especially); this technique's contribution is to make most
of the requests never happen.

## The reaper clause

Per [creation-names-reaper](../../../../_laws.md#creation-names-reaper): the
interval is created in exactly one place, and that place names all three
of its stoppers —

1. **terminal state** (the state-liveness gate closes),
2. **teardown** (the surface unmounts),
3. **lost visibility** (the attention gate closes; resume on return).

The canonical defect is a timer keyed to surface mount whose body ignores
what it fetched: it polls a pipeline that finished an hour ago at active
cadence until the user happens to navigate away. The fix is structural —
the poll's own result feeds the gate that schedules the next poll — not
disciplinary.

## The last poll must see the end

Subtle and load-bearing: the transition *into* the terminal state is the
most important observation the loop ever makes — it is what stops the loop
**and** what the notification layer fires on. Stop conditions therefore
evaluate *after* the snapshot is processed, never before the fetch. A loop
that checks "still running?" against the previous snapshot and skips the
fetch when false has already seen the end; a loop that gates on a stale
flag cleared elsewhere can stop one poll early and miss the terminal
transition entirely — the monitor's one job, unperformed. Order of
operations: fetch → diff → emit transitions → re-evaluate liveness →
schedule or stop.

## Cadence tiers

One interval is always wrong — too fast for idle, too slow for a run in
progress. The standard is tiered cadence, declared as data:

- **active** — something is running and watched: seconds-scale, tight
  enough that a human watching the row perceives the monitor as live.
- **settling** — an action was just fired (a retry, a trigger): the first
  few polls come faster, because the remote system needs a moment to
  materialize the new run and the user is certainly watching for it.
- **idle-visible** — nothing running, surface visible: minutes-scale or
  zero. Polling for *new* runs appearing is a different question from
  polling a known run's progress; it can often be answered on focus
  regain or manual refresh instead of on a timer.
- **suspended** — attention gate closed: no requests at all.

Three refinements that separate adequate from polite: **batch shape** —
poll the collection endpoint once rather than N per-entity endpoints, and
only descend to per-entity detail for rows in flight; **jitter** — when
many entities or many app instances share a provider, a fixed period
synchronizes them into request spikes; add noise; **conditional
requests** — where the provider returns an entity tag, send it back
(`If-None-Match`). A 304 is cheap to serve, and on at least one major
provider an authorized 304 does not count against the primary rate limit
(checked 2026-09-26). Where the public API documents no conditional
support, every poll is a full charge. That is a capability fact per
provider (see provider-capability-honesty), and it moves the cadence
arithmetic: a free unchanged answer makes a faster idle tier affordable
on one provider and not on the other.

## Refresh on regain, not on schedule

The attention gate's reopening (window refocus, tab return, view
re-entry) is itself the best poll trigger the loop gets: it fires exactly
when staleness starts to matter again and costs nothing while the user is
away. A monitor that refreshes on regain and suspends while hidden
strictly dominates one that polls steadily at half the rate — fresher
when it matters, cheaper when it does not.

## Decision rules

- Every poll loop re-derives "should there be a next poll" from the data
  it just fetched; no external flag is trusted over the snapshot.
- Classify each watched state as progressing, parked, or terminal for
  this attempt. Only progressing earns active cadence. Parked stays in
  the loop at idle cadence, and a terminal row leaves detail polling but
  not the collection poll.
- Stop conditions run after processing, so the terminal transition is
  always observed and emitted before the loop dies.
- Cadence is a declared tier table, not scattered literals; the settling
  tier exists because fire-then-watch (see remote-action-consent) makes
  the poll loop the action's only feedback channel.
- Visibility suspension is mandatory, not an optimization: a hidden
  monitor consuming budget is spending someone else's rate limit on
  answers nobody reads.
- If a push channel exists, it *resets* the poll clock rather than
  replacing the loop — polls become the liveness check for the push
  channel itself, at fallback cadence.

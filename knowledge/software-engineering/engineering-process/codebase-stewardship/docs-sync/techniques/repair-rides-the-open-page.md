---
layer: technique
type: technique
subject: docs-sync
technique: repair-rides-the-open-page
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [claim-level freshness is detected cheaply but too expensive to repair by sweep, deciding who resolves a stale claim and at what moment, a quiet period erased work an earlier run deliberately deferred, maintenance cost grows with corpus size instead of with change volume]
---

# Repair rides the open page

This subject names two collectors. Per-change enforcement takes the debt at the
moment it is created; the batch pass takes it back afterwards, bounded by a
marker. Both are triggered by something *outside* the document: a diff, or a
campaign. There is a third, and it is the one that decides whether
proposition-level freshness is affordable at all — repair triggered by the
document being **open**.

The rule: when a worker opens a document for any reason at all, its outstanding
staleness is surfaced beside the content, and resolving it is part of the work
already in hand. The worker did not come for the stale claims. It came to
document a new feature, and the three unrelated claims on that page whose
evidence moved last month are resolved on the way past, because the context
they need — the page, the source, the reasoning — is already loaded.

## Why it is not just batch repair with better timing

The economics are different in kind, not in degree. A sweep's cost scales with
the size of the corpus: every claim is visited whether or not anything near it
changed, which is why claim-level tracking is usually abandoned at the point
where the corpus gets big enough to need it. Opportunistic repair's cost scales
with **how much the source changed**, because the only pages opened are the
ones the change already required opening. A corpus of five hundred documents
and a corpus of five thousand cost the same to maintain under a change of the
same size.

That is the property worth protecting, and it has one structural requirement:
**detection stays exhaustive while repair stays opportunistic.** The
deterministic walk visits every claim on every run — it is a revision
comparison with no model calls, and it stays cheap at thousands of claims. What
is opportunistic is only the *resolution*. Inverting this — sampling the
detection to save time, then repairing whatever the sample found — produces a
corpus whose stale population is unknown, which is the one thing the design
cannot tolerate.

## The freshness walk runs before the no-op decision

Update runs almost always grow a short-circuit: nothing changed since the last
run, so there is nothing to do. Placed first, that check silently disables
freshness forever, because it answers a different question than the one
freshness asks. *No source changed since the last run* and *every claim is
still bound to live evidence* diverge in two ordinary cases:

- **carried-over work.** An earlier run flagged claims it did not resolve —
  correctly, since resolution rides the pages that run opened. Those claims
  belong to no subsequent diff. A quiet fortnight erases them from every
  future worklist, and they are the claims already known to be doubtful;
- **evidence that moved without the source changing in this window.** A
  reference that stopped resolving, a file that moved under a claim whose page
  nobody touched, a revision the last run never got to compare.

So the deterministic walk runs **before** the work-avoidance decision, and its
output is an *input* to that decision rather than a consumer of it. This is
[gate-sees-target](../../../../_laws.md#gate-sees-target) at the level of
scheduling: a check placed after the branch that decides whether to run it does
not observe the population it exists to observe. The ordering costs nothing —
the walk is the cheap half — and it is the difference between a system that
converges and one that converges only while commits keep arriving.

A run that legitimately finds nothing to do still records that the walk ran and
what it covered. Otherwise the next reader cannot separate *checked, clean*
from *never looked*, which is
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
arriving through the schedule.

## It never converges on cold pages, and that is not a bug to fix

The honest limitation, stated where users of the technique will meet it: a
document nobody opens is never repaired. Its staleness is detected on every
run, correctly, and resolved on none of them. Access is not uniform — a small
set of documents absorbs most of the traffic and a long tail is opened once a
year — so opportunistic repair alone leaves a permanent, growing, *accurately
measured* backlog in the tail.

This is the same shape as repair-on-access in replicated stores, which converge
on hot keys and require a separate anti-entropy pass for the cold ones, for
exactly the same reason. The remedy is the same too, and it is already in this
subject: opportunistic repair is a **collector**, not a strategy. The batch
lane remains the backstop for the tail, and the cold set — documents carrying
unresolved staleness past some age — is precisely what belongs in the
[catch-up marker](./catch-up-markers.md)'s consciously-skipped list. Recorded
there, a permanent hole becomes a scoped debt with a range and an owner.
Unrecorded, the exhaustive detector's accurate count of stale tail claims
becomes a number everyone learns to scroll past.

## What the worker is handed, and what it must not be handed

The worker receives the page's outstanding claims *with* the page — inline,
beside the content it is editing, not as a separate report it would have to go
and read. A queue the worker must consult is a queue the worker skips under
deadline; the stale claims have to arrive in the same payload as the work.

What it must not receive is the whole corpus's stale set. The moment a worker
is handed claims from pages it did not open, opportunistic repair has become a
sweep with extra steps, the cost re-couples to corpus size, and the property
the technique exists for is gone.

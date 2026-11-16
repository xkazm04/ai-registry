---
layer: application
type: application
subject: triage-queues
technique: queue-lifecycle
stack: python
verified_on: 2026-11-16
verified_against: python@3
---

# Python: an error tracker that reopens a resolved issue as "regressed"

*Read 2026-11-16 in a shallow, sparse, blob-filtered clone of the public
`getsentry/sentry` repository at `0af5f81` (committed 2026-11-15;
`pyproject.toml` has `requires-python = ">=3.13"`). The tree was not
modified, and nothing in it was run. Only `src/sentry/event_manager.py` and
`src/sentry/types/group.py` were read.*

The queue is the issue stream. Repeated events fold into one *group* through
a fingerprint, which is the declared identity-of-condition that
[queue-lifecycle](../techniques/queue-lifecycle.md) asks for at the entrance.
The seam this file records is the one the technique's recurrence clause is
about: an event that arrives for a group an operator has already resolved.

## The seam

`event_manager.py:1786-1923`, `_handle_regression`. It is called from
`_process_existing_aggregate` (`:2002`) for every event that folds into an
existing group.

- **No silent fold.** A resolved group that receives a new event is moved
  back to `UNRESOLVED` with the substatus `REGRESSED` (`:1817-1822`). The
  same group keeps its history. An activity row `SET_REGRESSION` is
  written (`:1911-1915`), a `GroupHistoryStatus.REGRESSED` entry is
  recorded (`:1916`), and a new open period starts (`:1921`). So both the
  recurrence and the earlier verdict stay on record. `types/group.py:6-18`
  defines `REGRESSED = 6` as its own unresolved substatus, alongside `NEW`,
  `ONGOING` and `ESCALATING`. A queue view can tell "came back" apart from
  "never handled".
- **The reopen is conditional.** The transition is one filtered `UPDATE`:
  `filter(id=..., status=GroupStatus.RESOLVED)` with
  `exclude(active_at__gte=date - timedelta(seconds=5))` (`:1806-1823`). The
  comment says "rely on the database to validate that no one beat us to
  this". Two racing events reopen the group only once, and the signals fire
  only "the first time the row was actually updated" (`:1828-1837`). An
  operator who changed the status in the meantime, for example to ignored,
  is not overwritten: the comment at `:1809-1810` says "ensure we can't
  update things if the status has been set to ignored".
- **The resolution has a scope.** `GroupResolution.has_resolution(group,
  release)` returns early (`:1795-1798`), so "we only mark it as a
  regression if the event's release is newer than the release which we
  originally marked this as resolved". An event from a build older than the
  fix does not count as a recurrence. A pending commit resolution also
  defers it (`:1800-1801`).

## What this shows about the technique

Before 2026-11-16, the technique said that a recurrence after resolution
"is a *new* item". This tree is the counter-case. It reopens the *same*
item, in a visible recurrence state, and keeps every guard the new item was
there to provide: the recurrence is visible, the earlier verdict stays on
record, and nothing folds silently. It also adds the two guards that a
reopen needs and a fresh item does not: a conditional transition, and a
resolution scope. The technique now names both shapes. An incident pager's
documented behaviour (a resolved alert's dedup key opens a new alert) is the
other shape.

## Limits

- Read, not run. Nothing here measures how often a regressed group gets
  worked faster than a new one would have been.
- The 5-second window at `:1815` is this tree's own guard against races. It
  is not a recommended value.
- Expiry was not read here. Whether the tree's auto-resolve writes a state
  distinct from an operator's resolve is still open. A return condition is
  in the subject note.

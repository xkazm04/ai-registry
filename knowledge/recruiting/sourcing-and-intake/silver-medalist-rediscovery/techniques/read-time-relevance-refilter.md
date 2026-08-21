---
layer: technique
type: technique
subject: silver-medalist-rediscovery
technique: read-time-relevance-refilter
status: forged
laws: [say-only-what-the-record-holds, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [showing rediscovery matches computed by an earlier sweep, building alerts or digests over candidate matches, bounding a batch job that scans roles against history]
---

# Read-time relevance refilter

A rediscovery match is computed by a sweep and read by a human later —
sometimes minutes later, often days, occasionally weeks if it landed in a
digest nobody opened. In that interval the person may have been hired, may
have exercised an erasure request, may have re-engaged and become an active
candidate; the role may have closed. The stored match is therefore a claim
with a timestamp attached, and it is re-evaluated against live state at the
moment it is shown.

## Re-check at read, not at send

The obvious place to put the check is just before the message goes out, and it
is the wrong place. By then a recruiter has read a name, formed an intention,
possibly drafted a note and mentioned it in a stand-up. A stale item that
fails at send has already cost attention and produces a confusing error about
someone the system just recommended.

Filter when the list is rendered. Items that no longer qualify are simply not
there. The invariant to hold: **anything visible is currently actionable.** A
surface that shows names it will refuse to act on teaches its users to
distrust it, and they are right to.

Keep the send-time check anyway — it is the last gate, and the interval
between rendering a list and clicking a name is short but not zero. It is a
backstop, not the mechanism.

## What the refilter re-checks

- **Suppression and consent**, collapsed across the person's records
  ([person-level-consent-collapse](./person-level-consent-collapse.md)). Consent
  state is the fastest-moving field in the record and the most consequential.
- **Anonymisation and erasure.** A match naming a person whose record has
  since been anonymised is a re-identification, produced by your own cache.
- **Hire and active status.** Hired by you, hired elsewhere where you know it,
  or now in process for another opening — all remove the person from
  rediscovery, since they are no longer someone you failed to convert.
- **Role state.** Closed, cancelled, filled or on hold: the reason for the
  approach has evaporated, and approaching anyway is how a candidate ends up
  in a process with no requisition behind it.
- **Fit still above the floor.** Requirements get edited after a sweep runs,
  and a match computed against last week's brief may not clear today's
  ([fit-floor-for-readmission](./fit-floor-for-readmission.md)).

The refilter runs the *same* predicate as the sweep. Two implementations of
"is this still eligible" is a guarantee that one of them is wrong, and the
wrong one will be the copy in the display path, because it is the one written
under time pressure to fix a rendering bug.

## Age the claim explicitly

Attach the computation time to the match and use it in two ways. Show it, so a
reader knows whether they are looking at this morning's assessment or last
month's — a match carries the basis it was computed on
([a-claim-carries-its-sample-and-its-basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
And expire it: past a staleness horizon, do not refilter the stored match,
recompute it or drop it. A month-old match that still passes every gate is
still a month-old judgment about a person who has had a month.

The horizon is a policy choice, and shorter than instinct suggests. Candidate
state in an active market moves in days. A horizon measured in weeks means the
system will occasionally recommend someone who started a new job before your
alert was written, and the recruiter who sends that message looks careless on
your behalf.

## The sweep is bounded, and the bound is logged

A sweep that scans every open role against every historical candidate becomes
the dominant workload of the data store it runs on, and then someone caps it
under incident pressure. Cap it deliberately instead: a bounded number of
roles per run, a bounded number of candidates per role, with an explicit
ordering that makes the bound fair — oldest-unswept first, so no role is
permanently starved by a stable sort.

The bound is uninteresting. The logging is the technique. **A sweep that
truncates must log the truncation** — the bound that bit, the count dropped,
which roles were not examined — because a silently truncated sweep makes an
unexamined role indistinguishable from a role with no matches
([say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds)).
That is a false statement about your own coverage, and it is the kind that
surfaces a year later when someone asks why a role never got pool candidates
and the honest answer turns out to be "we never looked".

Surface the same fact to the user where it affects them: return the deferred
count alongside the results, so "not all roles were scanned in this run" is a
one-line disclosure that costs nothing and prevents a wrong conclusion.

The same discipline applies one level down, to the result list. A ranked list
capped at twenty must report how many eligible people were dropped, because a
cap that reports nothing reads as *this is everyone* — and a recruiter who
believes they have seen the whole pool stops looking. One number next to the
list turns a silent truncation into a stated one.

## Decision rules

- Filter at render; keep a send-time backstop; never rely on the backstop
  alone.
- Drop stale items from the list rather than showing them disabled or with a
  warning — a name shown is a name considered.
- Use one shared eligibility predicate for sweep, render and send.
- Past the staleness horizon, recompute or discard; never refilter and show.
- Log every truncation with its bound and drop count; alert if truncation is
  the steady state rather than the exception.
- Order the bounded sweep so that starvation is impossible.

## When not to use it

Do not refilter interactively when the underlying check is expensive and the
surface is high-traffic — a list rendered on every page load that fans out to
several records per row will collapse under a large pool. The fix is to make
the eligibility state cheap to read (a maintained, invalidated flag on the
person) rather than to skip the check, because skipping it is the failure this
technique exists to prevent.

And do not apply the refilter to historical or audit views. A record of what
the sweep produced on a date is supposed to show what it produced, including
people who are no longer eligible. Filtering history to look correct in
hindsight destroys the only evidence of what a recruiter was actually shown.

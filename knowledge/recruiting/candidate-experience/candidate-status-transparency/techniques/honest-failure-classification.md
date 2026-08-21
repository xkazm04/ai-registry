---
layer: technique
type: technique
subject: candidate-status-transparency
technique: honest-failure-classification
status: forged
laws: [absence-of-evidence-is-not-evidence, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [writing the error states of a candidate-facing surface, deciding what a broken status link should say, reviewing a "something went wrong" page on a candidate path]
---

# Honest failure classification

The concern: a candidate-facing surface fails in at least two ways that mean
opposite things, and the generic error page conflates them. A bad or expired
link is **terminal for this attempt** — no amount of waiting fixes it. An
operator-side outage is **transient and about us** — the record is intact and
the answer exists; the fetch failed. Rendering both as "something went wrong"
tells the healthy applicant their application may have vanished, and tells the
holder of a dead link to keep refreshing forever.

This matters more here than on most surfaces because of *when* it is read. A
status page is consulted by someone anxious about an outcome that affects
their livelihood. Ambiguity at that moment is not a minor UX defect; it is the
exact anxiety the surface was built to remove, delivered with interest.

## The classification

Three states, each with distinct copy and a distinct affordance:

- **Not found / invalid key.** The link is malformed, truncated by an email
  client, expired, or points at a removed application. Copy: this link does
  not work. Affordance: a real way back in — apply again, or a contact route.
  Never a retry button; retrying will fail identically and the candidate will
  do it anyway.
- **Temporarily unavailable.** A store, dependency, or upstream call failed.
  Copy: this is our problem, your application is unaffected, try again in a
  moment. Affordance: an actual retry control, plus the fallback contact
  route. This state must never say or imply anything about the application's
  content or existence — under
  [absence-of-evidence-is-not-evidence](../../../_laws.md#absence-of-evidence-is-not-evidence),
  a failed read is *not measured*, not *not found*, and rendering the two the
  same way converts our outage into a claim about their record.
- **Loading.** Distinct from both. A spinner that never resolves is the worst
  of the three, because the candidate cannot tell it from either failure. Give
  it a bound: after a defined wait, resolve into the unavailable state.

## Two rules about *where* the failure lands

Classification is only half of it. The other half is what a failure is allowed
to destroy on a surface that refreshes itself.

- **A failure on a refresh must never wipe a good render.** A status view that
  polls, or revalidates when the tab regains focus, will eventually hit a
  transient fault. Taking over the page at that moment replaces a correct,
  already-displayed status with an error — the candidate's information got
  *worse* because they left the tab open. Only the initial load may take over
  the page; a later failure leaves the last good view standing and, at most,
  marks it stale.
- **An optional section fails by omission, not by alarm.** The decision
  history, the experience prompt, any secondary block: if it cannot load, it
  simply does not render. An error banner for a supplementary element on a page
  read by an anxious person spends alarm on something that was never owed.
  Reserve the error state for the thing the candidate came for.

Symmetrically, stop polling once the outcome is terminal. There is nothing
left to advance to, and a page that keeps re-fetching a finished application is
manufacturing chances to fail in front of someone whose story is over.

## Decision rules

- **When you cannot distinguish "no such application" from "lookup failed",
  report the transient state.** The asymmetry is deliberate: telling a real
  candidate their application does not exist is the more damaging error, and
  it is unrecoverable in their mind even after the outage ends.
- **When the failure is ours, say it is ours.** Not "invalid request" — the
  candidate will conclude they did something wrong and stop.
  [a-candidate's process never stalls on your constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)
  means our outage may not become their dead end: every operator-side failure
  state carries a route that still works.
- **When the key is expired rather than wrong, prefer saying so.** "This link
  has expired" is more actionable than "not found", and expiry is not
  sensitive. Do not, however, distinguish *wrong key* from *no such
  application* — that difference is only useful to someone probing keys.
- **Never leak the internal cause.** A stack trace, a store name, an
  identifier or a status code on a candidate path is machinery crossing a
  boundary the projection exists to hold.
- **When the lookup has no session to scope it, resolve the tenant from the
  record the key points at.** A token flow carries no logged-in user, so a
  lookup that falls back to a default organisation returns *not found* for a
  perfectly valid link belonging to any other team — a real candidate told
  their application does not exist, which is the exact damage this technique
  exists to prevent, arriving through a data-scoping bug rather than a copy
  decision.
- **Log the distinction even where the candidate does not see it.** The
  operator needs to know whether the surface is emitting a rising count of
  invalid keys — that usually means an outbound message is truncating links,
  which is a real, fixable, silent defect.

## When NOT to use it

- **Do not extend the taxonomy indefinitely.** Three states carry the whole
  decision. Adding "rate limited", "under maintenance", "region unavailable"
  as separate candidate-facing states multiplies copy without changing what
  the candidate should do — fold them into the transient state.
- **Do not classify by exception type alone.** The distinction that matters is
  *what the candidate should do*, not what threw. Two different exceptions
  that both mean "wait and retry" are one state.
- **Do not apply this shape to authenticated internal tooling.** Operators
  benefit from precise causes and identifiers; the reticence here is a
  property of the candidate boundary, not a general error-handling doctrine.

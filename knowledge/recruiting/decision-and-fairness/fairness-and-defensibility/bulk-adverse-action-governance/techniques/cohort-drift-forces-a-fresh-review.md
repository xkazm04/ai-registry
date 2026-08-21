---
layer: technique
type: technique
subject: bulk-adverse-action-governance
technique: cohort-drift-forces-a-fresh-review
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, no-adverse-outcome-is-solely-automated]
shared_with: []
use_when: [a bulk approval may be committed later than it was granted, deciding how long an approval stays valid, handling a pool that changes between preview and commit]
---

# Cohort drift forces a fresh review

## The concern

Between the instant a human approves a wave and the instant it writes, the pool moves:
someone applies, someone withdraws, a late score lands, a recruiter advances two people
by hand, a re-run rescores the cohort. Each of those changes the set the rule would
select. The question this technique answers is what the earlier approval still authorizes
once that has happened — and the answer is *only the people it named*.

Drift is not an error condition. It is the normal behaviour of a live pipeline, and a
design that treats it as an exception will handle it by making it disappear.

## What counts as drift

- **Membership drift** — a candidate enters or leaves the pool, or leaves the stage the
  wave operates on.
- **Score drift** — a score is recomputed, arrives late, or is corrected, moving someone
  across the boundary.
- **Boundary drift** — the configured window, threshold, floor, or role-family override
  changed between preview and commit. This is the most dangerous kind because the set can
  change while every individual record is untouched.
- **Status drift** — a member was rejected, advanced, held, or shielded by another actor.
- **Basis drift** — the score did not move, but what it was computed against did: the
  role definition was edited after the cohort was scored. This one does not invalidate
  the approval; it is disclosed on the preview per row so the reviewer knows the ranking
  rests on scores taken against superseded text. Informs, never blocks — a rule that
  blocked here would stall every cohort behind every wording change.

Only the last kind is ever benign, and only in one direction: a member who has already
left the pool by a route more favourable than this action can drop out of the commit. All
others invalidate.

## The procedure

1. **Detect by comparison, not by watching.** Do not attempt to observe the mutations.
   Re-derive the decision at commit and compare its set against the approved set. Change
   detection built from event listeners misses whatever path forgot to emit; re-derivation
   cannot miss anything, because it is the same computation the write will use.
2. **Refuse the commit and say what moved.** The refusal must name the delta — who is
   newly in, who is no longer in, and whether the configuration changed — because a bare
   "cohort changed, try again" trains operators to re-approve reflexively, which converts
   the guard into a two-click version of no guard.
3. **Return a fresh preview in the same response.** The correct next action is a new
   review; make it the cheapest available action, or someone will build a bypass.
4. **Expire on time as well as on content.** Hold an explicit staleness window and refuse
   past it. A set that has not moved in three days is still an approval whose reviewer no
   longer remembers reading it.
5. **Log the refusal.** Repeated drift refusals on one wave are a signal: the pool is too
   active for batch action at that size, or something upstream is rescoring in a loop.

## Decision rules

- **When the boundary configuration changed, always re-review, even when the resulting
  set is identical.** The reviewer approved an outcome produced by a stated rule; a
  different rule reaching the same members is a coincidence, not a mandate.
- **When a late score arrives for a member who was previewed as unscored, re-review.**
  That candidate's disposition is exactly what the preview flagged as undetermined.
- **When a member's state moves *during* the write, skip that member — do not roll back
  the wave and do not proceed on the stale view.** The set-level token guards the
  mandate; a per-row compare-and-swap guards the individual. Pin each write to the stage
  the member held at preview, so a candidate someone advanced by hand mid-wave is a
  no-op: no status change, no audit event claiming an action that did not happen, and —
  the part the person would have felt — no rejection letter. This matters most in
  pipelines where the write loop awaits something slow per row, such as queueing a
  message, because that wait is the drift window.
- **Report every skipped row by name, with its own outcome code.** A commit that differs
  from its approved preview is acceptable only when the difference is visible per row; a
  silent count discrepancy is indistinguishable from a partial failure.
- **When the same wave drifts repeatedly, shrink it.** Narrow the stage, the role, or the
  time window until the pool is quiet enough that a human's attention and the system's
  state can coexist for the length of a review.
- **Never auto-re-approve on the operator's behalf**, and never carry an approval forward
  "because only one person changed". The
  [verdict is bound to what it judged](../../../../_laws.md#a-verdict-is-bound-to-what-it-judged),
  and an adverse outcome for a person nobody reviewed is
  [solely automated](../../../../_laws.md#no-adverse-outcome-is-solely-automated) no matter how
  small the delta.

## The failure this replaces

The common design recomputes at commit and writes whatever it finds, on the reasoning that
the rule is what was approved. Under that design a candidate who applies during the
approval conversation can be rejected by an action nobody ever saw them in — the worst
possible instance of the defect, because the person had the least exposure to the process
and the record will show a rejection with a human approver's name on it.

The second-worst design detects drift and *merges*: keeps the approved members, adds the
new ones, writes. It looks conservative and is not, because the additions are exactly the
unreviewed part.

## When not to use it

- **Not for frozen cohorts.** Where the pool is genuinely immutable by construction — a
  closed requisition, an archived wave, a set already sealed at an earlier stage — drift
  cannot occur and the check is ceremony. Prove immutability structurally rather than
  assuming it from a stage name.
- **Not as a concurrency control.** This guards the human's mandate, not database
  consistency. It does not replace the transaction that keeps two simultaneous waves from
  interleaving, and a system that relies on it for that will corrupt state quietly.

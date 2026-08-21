---
layer: technique
type: technique
subject: pipeline-aging-and-attention-triage
technique: overridable-defaults-with-a-server-side-approximation
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [per-board threshold overrides, a workspace counter disagrees with a board view, deciding where triage policy lives]
---

# Overridable defaults with a server-side approximation

Two facts collide in every real deployment. First, thresholds must be
adjustable per board: a high-volume graduate funnel and an executive search do
not share a definition of "too long", and a system that refuses overrides gets
replaced by a spreadsheet. Second, the shared surfaces — the workspace counter,
the summary badge computed once for everyone, the digest that goes out nightly
— frequently cannot see those local overrides, because the override lives with
the board or the person who set it.

The wrong resolutions are to forbid overrides (the tool stops fitting the work)
or to pretend the shared number knows about them (the tool starts lying). The
right one is a three-part contract:

1. **Published defaults** — one legible policy table, per stage role, that is
   the answer when nobody has said otherwise.
2. **Local overrides** — per board, attributed, and authoritative wherever the
   board's own detail view renders.
3. **A shared computation that declares itself an approximation** — computed
   from the published defaults, honest about the fact that a tuned board may
   disagree, and never presented as the authority.

## Why the approximation is honest rather than lazy

A workspace-level count is a claim, and
[a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis).
"Fourteen entries need attention" computed under default policy is a true
statement about default policy and a false one about a workspace where three
boards were retuned. Stating the basis — computed under standard thresholds;
open a board for its own policy — makes the number usable and makes the
disagreement between two surfaces explicable rather than alarming.

The alternative failure is worth naming because it is the one teams reach for:
propagating every local override into the shared computation. It is expensive,
it is racy, and it produces a shared number that changes when one recruiter
adjusts their own view — which is precisely the property a shared number must
not have. **Approximate deliberately and say so** beats *approximate accidentally
and stay quiet*, and beats a synchronization scheme nobody can debug.

## Where each layer is authoritative

State the precedence once and honour it everywhere:

- The **board's detail view** is authoritative for that board. Its badges use
  the board's effective policy: override if present, default otherwise.
- The **shared surface** is indicative. It is allowed to be off by a few rows
  and must never be the basis of an action that touches a candidate.
- **Nothing derived from the approximation is persisted** as though it were the
  entry's state. An approximate count is a rendering, not a fact; writing it
  back turns an acknowledged imprecision into a permanent one.

When the two disagree, the board wins and the surface explains itself. When
someone asks which number is right, the answer must be available in the product
rather than in a person's head.

## Overrides are configuration, and configuration has rules

An override is a change to a promise, so treat it like one:

- **Attributed and dated.** Who set it and when — an unexplained threshold of
  ninety days on one board is indistinguishable from an accident.
- **Keyed by role, not by stage name.** The override table has the same shape as
  the default table, per
  [meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label);
  an override keyed to a display string breaks on the next rename exactly as the
  default would.
- **Bounded.** Allow a reasonable multiple of the default, not an arbitrary
  number. An unbounded override is a suppression with extra steps, and a
  suppression is the mechanism by which a board goes quiet for a quarter.
- **Visible on the surface it changes.** The board shows that it is running a
  custom policy. A recruiter should never have to open a settings screen to
  learn why their badges differ from a colleague's.

## Defaults are edited, not accumulated

When many boards override the same role in the same direction, that is not
configuration; that is the default being wrong. Review overrides periodically
and fold the consensus back into the published table, then remove the redundant
overrides. A policy layer that only grows ends up with the real behaviour spread
across dozens of local edits and a default table nobody has believed for a year
— at which point the approximation stops approximating anything.

## Decision rules

- Compute an entry's badge from the effective policy of its own board.
- Compute shared counts from published defaults, and label them as computed
  under default policy.
- Never act on the approximation; act only where the authoritative policy is
  in scope.
- Require an actor and a date on every override; bound its magnitude.
- When a majority of boards override a role the same way, change the default.

## When not to use this

Do not use an approximation where the shared surface *can* cheaply see the true
policy — if overrides live in the same store the shared computation reads, use
them and skip the whole apparatus. This technique is the answer to a real
boundary, not a general licence to be approximate. And never apply the pattern
to anything that gates a candidate outcome: an approximate consent state, an
approximate compliance hold, or an approximate eligibility check is not a
degraded feature, it is a defect, and those must resolve exactly or refuse.

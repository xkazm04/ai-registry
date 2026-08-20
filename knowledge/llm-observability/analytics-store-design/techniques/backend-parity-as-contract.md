---
layer: technique
type: technique
subject: analytics-store-design
technique: backend-parity-as-contract
status: forged
laws: [never-present-absence-as-an-answer, estimation-announces-itself]
shared_with: []
use_when: [adding a store method across multiple backends, reviewing a backend port for gaps, deciding whether a default implementation is acceptable]
---

# Backend parity as contract

When one store interface fronts several backends, "the backends agree" is a
correctness property of the product, not a nicety of the codebase. A method
one backend implements and another silently defaults is how a cap becomes
advisory on half the fleet, how a filter becomes decorative, how two
deployments of the same product answer the same question differently and
nobody can say which one is right. This technique is the governance of that
agreement: a designated reference, a visible matrix, and a decision rule for
every divergence.

## The reference backend

One backend — typically the one the product grew up on, with the fullest
implementation — is designated the **reference**. Its semantics *are* the
contract: what a method returns there, including edge cases, ordering, and
caveat fields, is what every other backend must return or visibly decline
to. Two consequences:

- New methods are implemented on the reference first, with the conformance
  tests written against its behavior; ports are then verified against those
  same tests, not against a prose description.
- A dispute about correct behavior is settled by reading the reference, not
  by negotiation between ports. Where the reference itself is wrong, fix it
  there first, then re-run every port against the updated suite — the
  contract moved, and the matrix (below) records who has caught up.

## Every method lands in exactly one of three states

For each interface method on each backend:

1. **Full** — implemented to reference semantics, passing the shared
   conformance suite.
2. **Refused** — visibly unimplemented: the typed unsupported outcome, the
   protocol-level "not implemented" answer naming the gap, the capability
   flag, the tested refusal (the companion refusal technique owns the
   mechanics).
3. **Documented degradation** — a default implementation that returns a
   *disclosed* partial answer.

The forbidden fourth state is the one interfaces produce by accident: the
**quiet default** — a base-trait method returning empty that a backend
inherits without anyone deciding anything. Additive interface evolution
(new methods get defaults so existing backends keep compiling) is a
legitimate engineering convenience, but it manufactures quiet defaults at
every addition. The discipline: a default may exist to keep the build green,
but shipping a backend that still *inherits* it is a decision someone made
and wrote down — never a state nobody noticed.

## Choosing between refusal and degradation: blast radius

The decision rule, per method:

- **Enforcement and accounting reads** — usage windows, limit admission,
  anything a budget keys on — get **refusal or full**, never degradation.
  An empty default here reads as "nothing was spent" and converts the cap
  into an advisory; this is the exact substitution
  [never-present-absence-as-an-answer](../../_laws.md#never-present-absence-as-an-answer)
  forbids, at maximum stakes.
- **Analytical breakdowns** — a cost-by-dimension rollup, a trend series —
  may degrade *if* the degradation is disclosed where the reader is. A
  trend endpoint whose cost series is zero because the backend has not
  ported the daily rollup is tolerable as a *named, temporary handoff*; it
  is intolerable as an unlabeled chart, because a zero-cost series read at
  face value is a fabricated measurement. Per
  [estimation-announces-itself](../../_laws.md#estimation-announces-itself),
  the disclosure belongs **in the payload** — a caveat field the rendering
  surface can show — with the documentation matrix as the map, not the
  disclosure.
- **Point reads and listings** — full or refused. There is no honest
  partial version of "list this project's events".

## The parity matrix

Maintain one visible table: methods down the side, backends across the top,
each cell full / refused / degraded-with-caveat. Its value is not
decoration:

- It is the port backlog, ordered by blast radius.
- It is the deployment guide: an operator choosing a backend reads exactly
  what they are giving up before they give it up.
- It is the review gate: a change that flips any cell must update the
  matrix in the same change, which is what keeps the matrix true. A parity
  matrix maintained "periodically" is a historical document within a
  quarter.

The matrix also surfaces the honest tension this technique lives with:
strict parity says every gap refuses; additive evolution says gaps degrade
quietly. The matrix is where each cell's resolution — and the blast-radius
reasoning behind it — becomes inspectable instead of implicit.

## When not to use this

- With a single backend and no second on the roadmap, the machinery is
  ceremony — though the conformance-suite habit still pays the day the
  second backend arrives, which is usually one large customer away.
- Do not extend parity obligations to *performance*. Backends may serve the
  same method at different speeds by design (that is why the analytical
  copy exists); the contract binds results, not latencies.
- Do not let the matrix legitimize permanent degradation. A cell that has
  said "degraded, temporary handoff" for a year is a refusal wearing a
  promise; either port it or flip it to an honest refusal.

---
layer: technique
type: technique
subject: remote-capability-probing
technique: degraded-rung-refusal-ceiling
status: forged
laws: [limits-are-derived, verdict-survives-boundary]
shared_with: []
use_when: [a fallback replaces a bounded fragment read with an unbounded whole-object transfer, deciding the size above which a degraded path should refuse instead of proceed, a caller asked for a few kilobytes and the process held the whole object in memory, announcing that a read has dropped to an expensive path]
---

# Degraded rung refusal ceiling

Most fallback ladders degrade in **degree**: the same operation, a little slower,
a little less precise, a little less durable. The consequence is proportionate to
the request, so a caller who could afford the good path can usually afford the
degraded one. A ladder whose next rung differs in **kind** breaks that
assumption, and the case this subject produces is the clearest example
available: when the peer will not serve fragments, the substitute for a
kilobyte read is transferring the entire object.

That is not a slower read. It is a different economic activity — unbounded in
size, unbounded in time, and paid in memory as well as in bandwidth — undertaken
on behalf of a caller who asked for a fraction of it and budgeted accordingly.
Called against a modest object it is a mild inefficiency. Called against the
objects that made fragment access worth probing for in the first place, it is a
process that stops responding, an allocation that fails, or a bill nobody
predicted.

## The rule

**When a rung converts a bounded operation into an unbounded one, the ladder
declares a size above which that rung is a refusal rather than a degradation.**

The ceiling is not optional decoration on the fallback; it is what makes the
fallback a designed path instead of an open-ended promise. Without it, "we fall
back to reading the whole object" is a sentence with no upper bound in it, and
the only thing deciding what happens at the top end is which resource runs out
first.

**Derive the number.** A ceiling chosen by feel is raised by feel, and when it
is raised nobody can say what else it was holding up
([limits-are-derived](../../../../_laws.md#limits-are-derived)). Derive it from
something measured and write the derivation beside the constant:

- **From the memory the process may hold at once for one read.** Where the
  substitute materialises the object in memory, the ceiling is that budget
  divided by the concurrency the read path permits — and if the concurrency is
  configurable, the ceiling is derived from it rather than fixed alongside it.
- **From the caller's patience.** A ceiling stated as bytes is a ceiling stated
  as seconds once you divide by an observed transfer rate for that class of
  peer. If the caller is a request with a deadline, the ceiling is the deadline
  times the rate, less a margin.
- **From the smallest useful fragment.** The ratio between what the caller asked
  for and what the fallback would move is the amplification, and a ceiling
  expressed as a maximum amplification is often more honest than one expressed
  in bytes, because it scales with the request instead of with the object.

The derivation must be computed rather than merely commented, or it becomes a
formula in prose beside a constant that stopped tracking its input two releases
ago.

## Where the ceiling is applied

The ceiling is checked **before the transfer starts**, from the size the ladder
already learned, not discovered part-way through. The ladder in
[the-probe-that-is-also-the-first-read](./the-probe-that-is-also-the-first-read.md)
produces that size as a by-product on every path — from the extent information
on a fragment response, from the length of a whole-object response, or from the
metadata question that the ambiguous rung falls through to. If none of the rungs
produced a size, the ceiling cannot be enforced and the honest posture is to
refuse rather than to proceed hopefully: an unbounded transfer whose size is
unknown is precisely the case the ceiling exists for.

A streaming substitute is the one arrangement that can relax this, and only
partly. If the fallback can consume the object as it arrives without holding it,
the memory term drops out and the ceiling is derived from time alone. It still
exists.

## The refusal is a verdict, not a slow success

Above the ceiling the read refuses, and the refusal must arrive at the caller as
a classified outcome rather than as a timeout, a generic error, or a truncated
result ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
Three things travel with it:

- **The capability that is missing**, stated as a property of the peer. This is
  the field that stops the investigation from starting in the wrong system —
  without it, every report of this refusal is filed against the reader.
- **The two numbers that decided it**: what was asked for, what would have been
  moved. A refusal carrying only a threshold invites the threshold to be raised;
  a refusal carrying the amplification invites the right question.
- **A statement of who can fix it.** For this subject the answer is usually
  *nobody on your side* — the peer's infrastructure would have to change — and
  saying so is what distinguishes this refusal from the deployment-level ones
  next door. Take the refusal's status and code shape from
  [capability-honest-refusal](../../optional-dependency-degradation/techniques/capability-honest-refusal.md)
  rather than minting a private vocabulary; what is different here is only the
  cause and the audience for the fix.

Below the ceiling the transition still gets **announced**. A read that silently
moved from fragment access to whole-object transfer has changed the system's
cost model without telling anyone, and the announcement is the only reason
anybody will ever find out. One line naming the peer and the size, once per
peer rather than once per read, is enough — and the byte counters in
[instrument-by-cause-not-by-hit-rate](./instrument-by-cause-not-by-hit-rate.md)
are where the aggregate lives.

## What this technique does not own

The question of **when a fallback may be deleted** belongs to
[fallback-retirement-condition](../../optional-dependency-degradation/techniques/fallback-retirement-condition.md)
and is not restated. The distinction is worth holding, because the two look
alike and want opposite instruments. That technique addresses a gap the frontier
is expected to close: the capability check is the reaper, the fallback retires
itself per caller as the world upgrades, and a traffic share falling to zero is
the signal to delete the code. The gap here is **not expected to close**. Some
peers will never serve fragments, because a cache in front of them will never
honour the request, and a share of traffic on the expensive rung that stays
stubbornly non-zero is not a broken check — it is the population. So this rung is
never retired; it is **bounded**. The reaper's question is *may I delete this
path yet*; the ceiling's question is *how large may this path be allowed to
get*, and asking the first about a permanent rung is how a ladder ends up with
no answer to the second.

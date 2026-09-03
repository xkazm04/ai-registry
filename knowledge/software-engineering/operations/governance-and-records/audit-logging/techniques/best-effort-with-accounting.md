---
layer: technique
type: technique
subject: audit-logging
technique: best-effort-with-accounting
status: forged
laws: [failure-not-empty-success, count-carries-predicate, absent-guard-is-loud]
shared_with: []
use_when: [deciding whether an audit write may fail its action, a ledger row doubles as the duplicate guard, the audit-failure counter keeps climbing, the response itself is secret material]
---

# Best-effort with accounting

Two non-negotiable requirements collide at every audit write. The trail
must never fail the action it records — an observer that takes down the
observed has inverted its purpose. And the trail must never *silently*
miss an action — a ledger with unknown gaps is not evidence, it is a
sample of unknown bias presented as a census. Most implementations honor
the first requirement and stop; this technique is the second half, and
the second half is what separates a trail an auditor trusts from one
they merely receive.

## Half one: the write never blocks the action

The audit insert is wrapped so that no failure of the ledger — storage
contention, a full disk, a serialization bug — propagates into the
recorded operation's result. This is a deliberate ranking of harms:
losing one record is a bounded, countable loss; failing every operation
in the product because the ledger hiccuped is an outage caused by the
accountability system. The wrap is total (no exception class escapes)
and the operation's latency budget is protected too — an audit store
that turns slow must not make every user action slow, which is why
ledgers under load move the write off the operation's critical path
(buffered, flushed asynchronously), accepting the accounting obligations
below.

The rank ordering has one honest exception, decided per ledger and
written down: a domain where the record *legally must* precede the action
(rare, and the requirement will name itself loudly) is not running
best-effort audit — it is running a transaction in which the record is a
participant, a different design with different costs. Every ledger that
has not explicitly claimed that exception is best-effort.

There is a second exception, and unlike the first it is usually built by
accident. When a ledger row doubles as the **at-most-once key** for the
action — the record of "we sent it" also being the guard against sending
it twice — the write has stopped being an observation and become part of
the operation's control flow. Best-effort now produces the failure it was
meant to prevent: swallow the claim's error, proceed anyway, and the next
run finds no marker and does the thing again. So a claim write **fails
closed**: no durable claim, no side effect, and the action is deferred to
the next run rather than performed unrecorded. Three rules follow, and
each one has a duplicate-delivery incident behind it.

- **The claim is one conditional write, never a read then a write.**
  "Look for a marker, then act, then record" is check-then-act: two
  overlapping runs — a platform retry, a re-fired schedule — both read
  *not yet*, both act. Collapse it into a single insert that succeeds only
  when no marker exists in the window, and let the affected-row count
  decide the winner. Under a store that resolves write conflicts
  optimistically, the loser re-runs, sees the winner's marker, and stands
  down; under a locking store the loser blocks and then loses. Both are
  correct; both require the decision to be *one* write.
- **Claim before the side effect, and release on failure.** A claim taken
  after a successful send leaves a crash window in which the action
  happened and nothing records it. Claim first, then act; if the act
  fails, retract the claim so the window retries rather than staying
  falsely marked done. Retraction is where this collides with the ledger's
  shape — see [append-only-design](./append-only-design.md) for the two
  honest ways to express it.
- **Fail closed on every uncertainty, not just on errors.** Persistence
  disabled, the tenant unresolvable, the write ambiguous: all of these
  mean *not claimed*. A skipped periodic action self-heals in the next
  window; a duplicate is delivered to a customer and cannot be recalled.

The counter still applies — a claim that could not be written is a gap in
the trail as well as a deferred action — but the ranking of harms is
inverted for exactly these records, and the ledger's documentation must
say which of its actions are claims.

## The fail-closed ledger: audit before serve, at least one sink per record

The first exception above — the record that must precede the action —
has a common enough shape to be stated as its own rule, because a whole
class of systems lives in it and builds best-effort by reflex anyway. A
server whose responses *are* secret material (a credential broker, a
key service, a signing oracle) has inverted the ranking of harms that
justifies best-effort: losing one record is no longer a bounded loss,
because the record was the only evidence that a secret left the
building and who took it. For that ledger the rule is: **when the
response carries material the trail exists to attest, the request is
logged after authorization and before execution, the response is
logged before it is sent, and each of those writes fails the request if
it cannot be recorded.** An unrecorded refusal is a lost fact; an
unrecorded success is a lost secret, and the second is the one the
ledger was built for.

Fail-closed does not mean one store decides availability. The ledger
writes to a **set of sinks**, and the invariant is *at least one
configured sink succeeded* — evaluated once for the request record and
again, separately, for the response record, because the two are
different facts about different moments and the sink that was healthy
at entry may be gone by exit. The naive reading takes "fail closed" as
"every sink must succeed," which lets the least reliable sink veto every
operation; the other naive reading takes "best effort" as written above
and produces, on the day the one sink is down, a stream of unaudited
secret material with a counter climbing somewhere nobody is watching.
The set invariant sits between them: one sink is a single point of
failure for the whole product, so an operator who wants availability
adds a second sink rather than weakening the rule, and a deployment with
no sink configured at all is a deployment that has decided to serve
nothing — the absence of a sink is loud, not a silent bypass
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

The invariant is only evaluable if every sink *returns*. A sink that
fails is counted and passed over; a sink that hangs — a network peer that
accepts the connection and never drains it — is not a failed sink, it is
a request that never completes, and one such sink stalls every operation
behind it regardless of how healthy the others are. So a sink over any
medium that can block carries a **write deadline**, after which the write
is a failure the set invariant can weigh; the deadline is what turns a
blocking failure into a non-blocking one, and a sink set without it is
fail-closed in name and hung in practice.

Two consequences complete the rule. First, the record is written at the
point where the request has been authenticated and authorized but not yet
executed, so a request the ledger could not record is refused before it
has any effect — there is no window in which the action ran and the
evidence did not land. Second, **rejections are audited too**: a request
refused by a quota, a rate limit, or a lockout is an event about an
actor, and a trail that records only what it served hands an attacker a
free, invisible probe. The counter from the next section still runs on
this ledger — a sink that failed while another succeeded is a degraded
sink set, and the operator should learn that before the second sink
follows the first — but the counter is the health signal here, not the
substitute for the record.

## Half two: every miss is counted, and the count is surfaced

Swallowing the failure is where the naive implementation ends and where
the trail's integrity quietly dies: each infrastructure hiccup now
punches an invisible hole, and the holes cluster at the worst times —
under load, during incidents — which is exactly when the trail will
later be read. The fix
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)):
the catch block does two things, always —

1. **increments a durable counter** of failed audit writes, keyed by
   ledger and failure class, kept somewhere that does not share fate
   with the ledger whose failure it counts (a counter stored next to the
   records it counts misses exactly the failures that matter);
2. **emits to the diagnostic channel** so an engineer can pursue the
   cause — the diagnostic line is for repair, the counter is for
   honesty, and neither substitutes for the other.

"Surfaced" means on a health surface someone actually watches — the same
dashboard that shows the system's other integrity signals — not
retrievable-in-principle. The number's meaning is its contract
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
"audit-write failures, per ledger, since T" — a predicate that lets a
reviewer say "the trail for window W has at most N known gaps," which is
the strongest statement a best-effort trail can truthfully make, and a
perfectly acceptable one. Trails lose their authority not by having
gaps but by having gaps that surprise.

A non-zero counter is an operational signal with a required response:
alert past a threshold, investigate the failure class, and — for
domains that warrant it — write a gap-marker record into the ledger
once it recovers ("N writes failed between T1 and T2"), so the trail
itself discloses its blind window to future readers who never saw the
dashboard.

## Buffering changes the accounting, not the obligation

Moving writes off the critical path introduces new loss modes that the
counter must also cover: records buffered but not yet flushed die with a
crash; a bounded buffer overflows under burst. The rules:

- a bounded buffer that drops **counts every drop** (an unbounded buffer
  merely relocates the outage to memory);
- flush failure re-enters the retry-or-count path — retried with a cap,
  then counted, never retried forever (an eternal retry queue is an
  unbounded buffer wearing a different name);
- crash loss is bounded by flush interval, and that bound is a stated
  property of the ledger ("at most the last K seconds of records can be
  lost to a crash"), because a stated bound is something an auditor can
  reason about and an unstated one is a surprise.

## The paradox, restated as a contract

The deliverable of this technique is one sentence the team can say to an
auditor with a straight face: *"Audit writes never block operations; every
failed or dropped write is counted; the counter is on our health surface;
here is its current value and here is what we do when it rises."* Both
halves, verifiable. An implementation that can only say the first clause
has built the easy 80% and skipped the 20% that was the point.

---
layer: technique
type: technique
subject: data-plane-transport-selection
technique: path-divergence-audit
status: forged
laws: [gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [a second transport was added beside an existing one, a queue policy stopped being honoured after a fast path shipped, deciding what a bypass is allowed to lose, tests all pass and the new path is untested]
---

# Path divergence audit

The moment a system has two transports for the same edge, every guarantee it
advertises has two implementations, and one of them is new. The audit is the
procedure that finds out which guarantees survived the second implementation.
Its output is not a pass — it is a **list**: for each guarantee, a paired test
that asserts it on both paths, or a written statement that it is lost on one
of them.

## Why the existing tests prove nothing

A suite written before the bypass exists exercises the brokered path, and it
keeps passing afterwards. It is now a check that runs over a proxy for the
system rather than the system ([gate-sees-target](../../../../_laws.md#gate-sees-target)),
and it diverges from the target in exactly the region the change introduced.
The green build is not evidence; it is the mechanism by which the divergence
stays invisible.

This is worth stating flatly because the failure is so cheap to miss. Nobody
decides to skip the audit. The suite passes, the benchmark improves, the
change looks complete, and the guarantee that quietly disappeared is
discovered months later by an operator who cannot explain a recording with
gaps in it.

## The enumeration

Start from the brokered path and write down **everything it provides that
somebody could depend on**, not everything it was designed to provide. The
recurring list:

- **Queue depth and eviction verdict.** Which message is dropped when an edge's
  queue is full, and whether the declared policy — drop the oldest, apply
  backpressure — is honoured at all. Where eviction is a *classification* —
  some messages are protected from it, a shutdown signal is never evicted —
  every class is a separate row, because a second delivery path that carries
  the payload but not the classifying metadata evicts correctly on ordinary
  traffic and wrongly on the traffic that mattered.
- **Fairness across a consumer's inputs.** A consumer serving several inputs
  expects none of them to starve; a second delivery path that hands messages
  in by a different route can bypass the scheduler that provided the fairness.
- **Ordering.** Both within one edge and, where it was ever promised, across
  edges.
- **Delivery to observers.** Recorders, tracers, metrics taps — anything that
  saw traffic because it was positioned on the broker.
- **Backpressure and its propagation** to the producer.
- **Staleness deadlines and liveness events** — the machinery that lets a
  consumer notice an edge going quiet.
- **Schema, type and version negotiation**, including what happens on a
  mismatch.
- **The lifecycle events a consumer receives beside data** — an input closing,
  an upstream restarting.

For each: **who implements it on the brokered path, and does that component
exist on the direct path?** Where the answer is "the broker, and no", the
guarantee is a candidate for loss.

## Pair the tests

The unit of evidence is a **paired test**: the same assertion, run twice, once
per transport, ideally from one parameterized body so the two cannot drift.
Two rules make the pairing real rather than nominal.

**The test must be able to fail on the new path.** A parameterized test whose
direct-path variant silently falls back to the brokered path — because the
payload was below the threshold, because the probe never ran in the fixture,
because the test harness runs both peers in one process — asserts the same
thing twice and reports a coverage number that is a lie. Assert, inside the
test, which transport actually carried the message.

**The convergence point is worth engineering.** The strongest fix for
divergence is structural: make both transports deliver into *one* queue,
served by *one* scheduler, under *one* policy, so the guarantee has a single
implementation and the paired tests are asserting a shared mechanism rather
than two parallel ones. Where that is achievable it retires whole rows of the
enumeration at once, and it is almost always cheaper than maintaining two
implementations of an eviction rule.

## Write down what is lost

Some guarantees will not survive, and **lost is an acceptable answer**. What
is not acceptable is lost-and-undiscovered — a guard that protects the path
nobody uses any more ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).
A loss is recorded where the guarantee is declared, in one sentence: what is
lost, on which path, and what an edge that needs it should do instead
(normally: declare the policy that pins it back to the brokered path).

Two losses recur and are worth expecting.

**Observation stops being free.** A recorder that was a privileged tap on the
broker becomes, on the direct path, an ordinary subscriber — it competes for
the same delivery bandwidth it is recording, and where the payload is shared
by reference it must copy every message it wants to keep. "Recording works"
becomes "recording works and costs a copy per message", which is a different
sentence and changes capacity planning.

**Ordering can become API-dependent.** Where a consumer has more than one way
to take delivery — a call that serves inputs fairly, a stream that yields
strictly in arrival order — the two orderings are both correct and they are
not the same. That divergence is not caused by the transport, but the audit is
where it surfaces, and it belongs in the written record beside the transport
losses: an ordering guarantee that holds for one consumption API and not
another is a guarantee that must name the API.

## The side plane the audit uncovers

The audit's characteristic discovery is a **priority inversion between planes**.
A fast path usually offers an express or priority class, and metadata that
describes the payload — a schema, a type descriptor, a version — usually
travels as an ordinary message. The result is a receiver holding a batch it
cannot decode because the description of it is still in flight behind slower
traffic.

The answer is a per-edge side plane with three properties: the description is
negotiated **once** per stream rather than attached to every message; it can
be **re-primed in band**, so a subscriber that joined late or missed the first
copy can ask for it without a control-plane round trip; and a description that
has not arrived within a small multiple of its refresh interval is **fatal for
that stream**, not a decode that guesses. Guessing here produces a
silently misparsed payload, which is the one outcome worse than a stopped
stream.

## When not to use it

- **When there is only one path.** The audit exists because of the second
  implementation; a single-transport system has nothing to pair.
- **When the second path is a strict superset.** If the new transport
  demonstrably enters the same queue, the same scheduler and the same observer
  set, the enumeration collapses to verifying that claim — which is one test,
  not a table.
- **Never as a one-off.** The audit's rows are the permanent test matrix. Run
  once at adoption and it documents the day the bypass shipped; the guarantees
  that get added afterwards land on one path only, which is the same failure
  with a later date.

---
layer: technique
type: technique
subject: data-plane-transport-selection
technique: moved-payload-has-no-fallback
status: forged
laws: [creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [a zero-copy send takes ownership of the buffer, writing a fallback from a fast path to a slow one, the shared pool runs dry under a burst, a retry silently sends nothing]
---

# Moved payload has no fallback

Two sends that look identical at a call site differ in one property that
decides the entire error-handling design: whether the transport **borrows** the
payload or **consumes** it. A brokered send borrows — it serializes or copies,
and on failure the caller still holds the data and may try something else. A
zero-copy direct send consumes — the buffer was claimed from a shared pool,
filled in place, and handed over; ownership transferred at the call, and
afterwards there is nothing left to retry with. The technique is arranging the
send path so that this asymmetry is decided before it can hurt, and stated
where it can be seen.

## The branch goes before the payload, not after the failure

The instinctive fallback is written after the fact: try the fast path, and on
error fall back to the brokered one. On a borrowing transport that works. On a
consuming one it is a fallback that cannot fire — the error arrives after the
buffer is gone, and the fallback either sends an empty message, sends a buffer
another party may already be reading, or is silently unreachable.

**So the route is chosen before the payload is committed.** The send path
computes the route first — policy, then probe verdict, then size — and only
then acquires the buffer that route requires: a direct route claims a pool
block and fills it, a brokered route keeps the payload in ordinary memory.
There is no point after the commit at which the decision can be revisited, and
the code should have no branch that pretends otherwise. The ordering also
means the expensive acquisition happens only on the path that needs it, so a
message that was going to be brokered never touches the shared pool.

## State the asymmetry at the call site

The two transports have the same shape and different contracts, and a reader
of the call site cannot tell them apart. **Write the asymmetry down where the
send happens** — a comment on the irreversible branch saying that ownership
transfers here and no recovery exists past this line, and, where the language
allows, a signature that takes the payload by value on the consuming path and
by reference on the borrowing one. A type that enforces the rule outlives a
comment that describes it; a comment is the minimum.

The failure this prevents is not a bug in the current code. It is the
plausible-looking patch six months later that adds a retry around the send
because a flake was observed, and turns a rare transport failure into rare
silent data loss.

## Report the loss honestly

When a consuming send fails, the message is gone. The system may live with
that — a dropped frame in a stream of frames is often survivable — but it is a
**failure** and is reported as one: a consumed payload whose send failed must
never return the same value as a delivered one
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)),
because the return value is the only remaining evidence that anything went
wrong. Count these separately from brokered send failures; different cause,
different fix.

## When the pool is dry, copy — do not block

The shared pool is finite by construction, and a producer that outruns its
consumers will momentarily find no block available. Allocators for such pools
typically offer a menu: fail immediately, run a collection pass, defragment,
or block until a block is freed. **Block is the wrong answer and it is the
default that looks safest.**

A blocking allocation converts a data-plane pressure event into a producer
stall, and a stall in a graph propagates upstream through every edge feeding
it. The burst that exhausted the pool is precisely the moment the producer
must not stop: the pool empties because consumers are behind, and blocking the
producer until they catch up throttles the whole graph at its fastest stage.
Worse, the wait is unbounded from the producer's side — the block is released
by a peer that may itself be blocked.

The rule: **a non-blocking acquisition, and on exhaustion copy the payload
into ordinary memory and send it on the brokered path.** The message is slower
and it arrives. Add the two disciplines that keep the fallback honest — count
the copies as their own metric, since a rising count is the earliest signal
that the pool is undersized or a consumer is leaking references, and try the
cheap reclamation passes (collect, defragment) before falling back, since they
are bounded work while blocking is not.

**Send the copy on the reliable path, not on the fast one.** This is the
non-obvious half and it is learned expensively. A fast path that offers a
priority or best-effort class typically also has a maximum transmission unit,
above which a message is fragmented — and a best-effort fragmented message can
be discarded without the send reporting anything but success. So a payload
that was large enough to want a shared buffer and did not get one must not be
re-sent as an ordinary copy on the same fast path: it is above the ceiling, it
fragments, the send returns success, and the subscriber never receives it.
That is failure spelled as empty success at the transport layer, and the only
defence is a routing rule rather than a check: **a payload above the direct
path's single-message ceiling goes to the reliable path, whatever else is
true.** Below the threshold, where a message always fits one unit and never
fragments, the fast path's own copy is fine.

**Verify the loan is the size you asked for.** A pool may hand back a block
larger than the request, and copying a shorter payload into a longer block
either panics on the sending thread or publishes a slice with trailing content
the receiver will decode. Compare the returned length to the request, use the
block only when they are equal, and otherwise fall through — one comparison
that converts a future allocator change from a crash into a debug line.

## Every borrowed block names who returns it

A pool block is a created resource and the rule is the general one
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): the code
that acquires a block states what returns it, at acquisition time. Three cases
have to be answered together, and answering only the first is the common
error:

- **The block is filled and sent.** Ownership passes to the transport, which
  releases it when the last receiver drops its reference.
- **The block is acquired and the send never happens** — an early return, an
  error while filling, a cancellation between acquisition and publish. The
  transport will never see this block, so the acquiring scope releases it. A
  pool that leaks here degrades like a descriptor leak: it works for hours,
  then no block is ever available again, and the producer that finally fails
  is not the one that leaked.
- **The receiver holds a reference longer than expected.** A consumer that
  stores a received block instead of copying out of it holds pool memory
  belonging to the producer's process — and it holds the *whole* block, not
  the few bytes it kept, so retaining a header out of a large message pins a
  large message. Where a receiver may retain any part of a payload, it copies
  that part out; where it must not copy, its retention is bounded and stated.

A fourth case sits one level up and is the subtlest of them: **a shared buffer
must not be built on memory the transport does not own.** Wrapping a caller's
foreign buffer to avoid a copy makes the transport responsible for releasing
it, and a release can be arbitrarily expensive on the thread that performs it
— a foreign runtime's deallocation may need that runtime's global lock, which
is now taken on the message loop of a process that has nothing to do with it.
The symptom is a runtime that stalls in proportion to how busy an unrelated
component is. The rule is blunt: what goes into a shared buffer is an
independent copy this system owns, and the one copy it costs is the price of
knowing who pays for the free.

## When not to use it

- **When every transport borrows.** If nothing in the system takes ownership
  of a caller's buffer, the asymmetry does not exist and a fallback after
  failure is a perfectly good design. Do not import the ceremony.
- **When losing a message is unacceptable.** The technique makes the
  irreversibility safe to reason about; it does not make it harmless. An edge
  that may not drop belongs on the brokered path by declaration, and the pin
  is evaluated before any of this runs.
- **When the pool can be sized so it never empties.** A bounded producer with
  a known peak and a generous pool may legitimately treat exhaustion as a bug
  and fail loudly instead of copying — but that is a deliberate choice with a
  monitored precondition, not the default, and the copy path stays as the
  behaviour under a burst nobody predicted.

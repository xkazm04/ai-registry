---
layer: application
type: application
subject: delivery-guarantees
technique: dead-letter-design
stack: rust
status: forged
verified_on: 2026-09-04
verified_against: rust@1.95
proof: structural-only
---

# Five of six, and the sixth is the one the golden path predicts

The version witness is `mise.toml`'s `rust = "1.95"`, matched by
`Cargo.toml`'s `workspace.package.rust-version`. Read at commit `7801005`.

An agent harness sends messages to external chat networks. The model queues an
outbound message during a turn; a per-network worker process owns the socket and
may be disconnected, restarting, or not yet spawned. The two lifetimes do not
match, so the tree puts a durable file-backed outbox between them — and builds it
almost exactly as this subject prescribes.

What it gets right, checked against the subject's own techniques:

- **Explicit states as directories.** Queued, in-flight, delivered and failed are
  four directories, so a message's state is its location and cannot disagree with
  a status field.
- **Atomic claiming.** A worker claims by moving the file into the in-flight
  directory and incrementing an attempt counter, so two workers cannot both own
  one message.
- **Stuck reaping.** A worker requeues the whole in-flight directory when it
  starts, so a message orphaned by a crash returns to the queue with its attempt
  count preserved rather than being lost or retried forever.
- **Retry escalation as a transition, not a bigger number.** A maximum attempt
  count moves the message into the failed directory. This is the subject's rule
  followed precisely: *crossing the threshold is a state transition into the
  dead-letter lane, not a bigger number.*
- **A typed reason on the terminal outcome.** The failure record carries the last
  error rather than a bare status.

That is five of six, implemented with care, in a tree that clearly read the same
problem the subject describes.

## The sixth

The failed directory has **one writer and no readers.** Enumerating every
reference to it across the Rust and TypeScript sources returns five occurrences,
all in one storage module: the path constructor, the two callers that build the
directory and move a message into it, and the cleanup routine that deletes the
directory when an adapter is removed. No tool exposes it to the agent, no
operator command lists it, no supervisor sweep reports it, nothing wakes anyone
when a message lands there.

The golden path names this outcome in a single sentence: *a dead-letter lane
nobody can see is a `/dev/null` with extra steps.* The tree built the lane, the
transition, the attempt accounting and the typed reason — every part except the
one that makes the other parts matter — and the consequence is worse than having
no dead-letter lane at all, because the machinery reads as completeness. A
reviewer checking "do we drop messages?" finds a durable outbox with retry limits
and a failure state, and stops there.

The failure mode this produces is specific and quiet: an external message the
agent believed it sent, that failed three times for a reason that was recorded,
sitting in a directory that is deleted whenever the adapter is removed. The
record exists exactly as long as nobody needs it.

## The generalisable half

The interesting thing is not the missing reader. It is **which part of a
dead-letter design gets built when a team builds it incrementally.** Everything
on the producing side — the transition, the counter, the reason, the durable
write — is reachable from the code path already being written, and each piece
makes the current change more correct. The consuming side is a different surface
with a different caller and no local pressure to exist, so it is the piece that
is deferred, and deferring it is invisible because nothing fails.

That suggests the review question is not "is there a dead-letter lane?" but
**"name the caller that reads it."** A lane whose reader cannot be named in one
sentence is not yet a lane. The same test applies to the tree's own event log,
which records the terminal outcome and is likewise readable in principle — the
distinction that matters is whether anything is *obliged* to look.

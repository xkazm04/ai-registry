---
layer: technique
type: technique
subject: concurrency-guards
technique: single-flight-primitives
status: forged
laws:
  - one-validation-door
  - failure-not-empty-success
shared_with: []
use_when: [picking the second-caller policy per operation, a boolean flag trampled by a second key, callers retrying a refusal that looks like failure, an expensive durable write paid once per caller, a readiness signal that cannot fire again after a reconnect]
---

# Single-flight primitives

Once the key is designed (see guard-key-design), the mechanism that holds the
in-flight set should be built once and reused everywhere. The alternative — a
bespoke boolean here, an ad-hoc mutex there, a module-level flag in a third
place — is not merely untidy: each bespoke guard re-answers the acquire,
release, and second-caller questions independently, and the answers drift.
One forgets the early-return release; one refuses silently; one is a scalar
flag that a second concurrent key silently tramples. A shared primitive is the
one-door principle applied to exclusion (law: one-validation-door): all
acquisitions pass through one place, so the semantics are uniform and the
acquirers are enumerable.

## The shape of the primitive

The minimal reusable form is a keyed try-begin/end registry:

- **try-begin(key)** — atomically tests membership and inserts. Returns either
  an acquisition (a token obligating a matching end) or a refusal carrying
  *what* is already in flight — at minimum the key, ideally when it began and
  who started it. The test-and-insert must be one atomic step under whatever
  concurrency model applies; a separate "check then add" is a race exactly as
  wide as the gap between them.
- **end(token)** — removes the entry. Taking the *token* rather than the raw
  key is deliberate: it makes "end without begin" and "end twice" structurally
  awkward, and it lets the registry verify that the releaser is the acquirer
  rather than a confused second caller cleaning up someone else's entry.
- **list()** — the current in-flight set, for diagnostics and for the leaked-
  entry audit (see release-guarantees).

Everything else — per-operation policy, timeout reclamation, join semantics —
composes on top of this core. What must *not* be reinvented per call site is
the atomic test-and-insert and the token discipline.

## What the second caller gets

The primitive answers "you may not start"; the *policy* for what happens next
is per-operation, and there are five honest options:

- **Refuse** — return a distinguishable already-in-flight outcome. Right for
  user-triggered actions where the honest answer is "that is already
  happening." The refusal must be spelled differently from a failure of the
  operation (law: failure-not-empty-success): a caller that cannot tell
  "refused because a twin is running" from "tried and failed" will retry, and
  a retried refusal is a busy-loop against one's own guard.
- **Join** — subscribe to the in-flight attempt's result and return it to both
  callers. Right for reads and fetches, where both callers want the same
  answer and neither cares who triggered the work. This is the classic
  single-flight: N callers, one execution, N results delivered.
- **Queue** — wait for release, then acquire. Right when both operations must
  eventually run (two different writes to one entity). Queueing needs a depth
  bound and a wait bound, or a stuck head-of-line converts one wedged key into
  an unbounded pile of waiters.
- **Coalesce** — mark "run once more after this finishes," collapsing N
  arrivals during flight into one follow-up run. Right for sync/refresh
  shapes where the latest state is what matters and intermediate runs are
  waste.
- **Merge** — admit the second caller's work *into* the operation already in
  flight, or into the next one, so N callers holding N *different* payloads
  are satisfied by a single execution. Merge is easy to mistake for join and
  trades differently: join returns one shared result because both callers
  wanted the same thing, and coalesce keeps only the last arrival and throws
  the rest away as waste. Merge discards nothing and duplicates nothing —
  every caller's work is carried and every caller gets its own outcome. It is
  also the only policy here that lowers the *cost* of the guarded operation
  rather than the number of times it runs, which makes it the one to reach
  for whenever that operation has a large fixed cost and a small marginal
  one: a durable flush paying a full round trip whatever the payload weighs,
  a commit paying one synchronization, a call to a remote store billed per
  request rather than per byte.

Refuse is the correct *default* — it is the only option with no new machinery
and no new failure modes — but the choice should be recorded per operation,
not left to whatever the first implementer found convenient.

## Closing a merge window

Merge is the one policy that needs a rule for when the batch stops accepting
arrivals, and the cheapest such rule is to have no configured window at all:
**wait for the first caller, then take without waiting whatever else has
already queued behind it, and run.** The batch is then precisely what
accumulated while the previous execution was running. Nothing is tuned, a
caller arriving alone waits one execution and not a millisecond longer, and
the batch grows on its own exactly as fast as arrivals do — which is the
property a fixed window has to be re-tuned to chase.

That rule holds only while executions are **serial**, and the boundary is
worth stating because crossing it fails quietly. The window is closed by the
previous execution finishing, so it depends on there being exactly one to
point at. Pipeline the operation for throughput — several executions in
flight at once — and "whatever arrived during the previous one" no longer
identifies a batch: arrivals can land in the buffer with no execution
scheduled to carry them, waiting on an arrival that may never come. A
pipelined merge has to close its window explicitly, on elapsed time or
accumulated size, and it inherits the tuning problem the serial form never
had. Decide in that order — serial and self-closing first, pipelining only
when one execution at a time provably cannot reach the throughput required,
and count the timer as part of what pipelining costs.

The buffer is unbounded until someone bounds it. Callers keep arriving
whether or not the flush is keeping up, so the merge point needs a cap in the
currency that actually grows — bytes or entries not yet durable — and a
stated verdict for the moment the cap is reached. Refusing the arrival with a
distinguishable over-capacity outcome is the honest answer (law:
failure-not-empty-success): it hands the decision back to a caller that can
slow down or shed, where a buffer that silently keeps growing converts a
throughput problem into an out-of-memory one, and the crash takes every
un-flushed caller's work with it.

## Join over a durable resource: the signal that cannot fire twice

Join is described above for a **computation**: one execution, N waiters, one
result, finished. Point the same policy at the establishment of a **durable
resource** — a connection, a session, a spawned server that later drops and
comes back — and one unstated assumption breaks. The execution recurs. The
waiters do not arrive once and disperse; they keep arriving for the resource's
whole life, across every generation of it.

The natural primitive for join is a one-shot completion signal: waiters block
on it, the acquirer settles it, and every waiter proceeds at once. In most
concurrency models that primitive is one-shot *by construction* — the operation
that wakes all waiters simultaneously is the same operation that may only be
performed once. So the first reconnect performs it a second time and the
process dies at the precise moment it was recovering. That is not an
implementation slip to be patched; it is the policy being used past the subject
it was written for.

Three rules keep join honest over a resource that recurs:

- **The signal means "the first attempt settled", not "the resource is
  usable".** Settled covers success and failure alike, and that is exactly what
  makes the invariant unbreakable: the signal fires once whatever happened, so
  it can never be asked to fire again. Waiters read it as permission to *look*,
  never as the answer.
- **After the signal, callers read live state rather than the signal.** "Is it
  usable right now" is answered from the guarded record under the lock — which
  is where every reconnection has been writing all along. A caller that infers
  usability from a signal designed to fire exactly once is correct for the
  first generation and silently wrong for every one after it.
- **Every watcher carries the generation that spawned it.** A supervisor
  watching generation N for a drop compares its generation against the record's
  before acting on what it sees; otherwise a drop event belonging to the old
  generation, arriving after a new one is already up, tears down a healthy
  resource ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
  The window is narrow, it opens only on the path that runs when the system is
  already unhealthy, and the failure it produces — an endless
  establish-and-teardown cycle — presents as the far side being broken.

The distinction worth carrying away is about what the guard is guarding.
Single-flight over a computation guards **work**, and its product is a value
that is delivered and forgotten. Single-flight over a resource guards
**establishment**, and its product is state with a lifetime — so the guard
needs a generation, and its completion signal needs a meaning that survives
being observed forever.

## Scalar flags do not scale past one key

A recurring degeneration: the guard starts life as a boolean ("is a save in
flight?") and the operation later becomes keyed (saves per document). The
boolean now serializes all documents (too broad — see guard-key-design's
failure directions) or, worse, gets overwritten by the second key's lifecycle
and releases the first's guard early. The primitive should be keyed from day
one even when the initial key population is one; a set with one member costs
nothing extra, and the migration from flag to set never happens under calm
conditions.

## Decision rules

- Build the try-begin/end registry once; every new guarded operation adopts
  it. A code review that sees a fresh bespoke mutex for a keyed operation
  should ask why the shared primitive was not used.
- Make test-and-insert atomic under the applicable concurrency model; a
  check/insert pair with a gap is the race it was meant to close.
- Return refusals that name the in-flight twin; "false" is not a refusal, it
  is a shrug the caller cannot act on.
- Pick the second-caller policy (refuse / join / queue / coalesce / merge)
  explicitly per operation and record it; default to refuse. Where the
  operation's cost is dominated by a fixed per-execution charge, merge is the
  policy that pays for itself, and its window should close on the previous
  execution rather than on a configured interval.
- Where the guarded thing is a durable resource rather than a computation, say
  so: the completion signal means "first attempt settled", live usability is
  read from the record, and every watcher carries its generation.
- Keep the primitive keyed even when today's population is a single key.
- Expose list(); an in-flight set that cannot be inspected turns every stuck
  guard into a source-reading exercise.

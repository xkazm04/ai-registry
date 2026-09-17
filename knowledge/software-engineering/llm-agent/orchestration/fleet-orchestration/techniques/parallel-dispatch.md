---
layer: technique
type: technique
subject: fleet-orchestration
technique: parallel-dispatch
status: forged
laws: [gate-sees-target, one-validation-door, creation-names-reaper, count-carries-predicate, limits-are-derived, failure-not-empty-success]
shared_with: []
use_when: [deciding how many sessions may run at once, two sessions wrote the same file at once, fanning one task across many targets, a run keeps issuing legal-sized batches and nothing bounds what it spends in total]
---

# Parallel dispatch

Dispatch is the fleet's admission control: the one door through which
sessions come into existence, singly or in waves. Its three responsibilities
are inseparable — **capacity** (how many may run), **assignment** (who may
write where), and **accounting** (a roster the harvest can later audit). A
dispatcher that handles capacity but not assignment produces fast corruption;
one that handles assignment but not accounting produces runs that cannot be
declared finished. This technique treats spawn-one as the degenerate case of
spawn-many, because a fleet whose parallel path is a bolted-on afterthought
will route its important work through the unhardened single path forever.

## The slot scheduler

The machine hosts a bounded number of live sessions — bounded by memory, by
the cost ceiling of concurrent agent runtimes, by the operator's attention.
The cap is **fleet policy enforced at the dispatch door**, never a courtesy
callers observe ([one door](../../../../_laws.md#one-validation-door)): every
launch request, including wakes from hibernation and adoptions at recovery,
passes the same admission check.

- **Admit to cap, queue beyond it.** The queue is ordered and visible; a
  queued dispatch is a registry entry in a pre-life state, not a closure
  waiting in memory — the queue must survive an orchestrator restart like
  everything else.
- **Slots are released by the state machine, not by goodwill.** A confirmed stop or effective resource fence
  frees the slot through the transition authority. Suspicion of loss alone
  cannot establish that a remote worker stopped consuming capacity. The classic leak is the
  session the sweeper declared lost whose slot nobody freed; at cap, each
  leaked slot permanently shrinks the fleet, and the shrinkage is invisible
  until throughput has quietly halved.
- **Promotion is dispatch.** When a slot frees, the queue head goes through
  full admission — including write-scope validation, because the world
  changed while it waited.

## The cap counts a stock; the run needs a second number

The slot cap above is a **stock** bound. It counts what is alive at this
instant, and the state machine gives the slot back on every confirmed stop.
That is exactly right for the thing it protects — the machine's simultaneous
load — and it is why the cap cannot also be the run's budget. A run that
reaches a planning checkpoint, issues a batch inside the cap, waits for it,
plans again and issues another has spent an unbounded amount while breaching
nothing. The degenerate case makes the gap obvious: a loop that dispatches
**one** worker at a time, sequentially, can never reach a ceiling of any
size, so no ceiling bounds it. "A broadcast of forty against a cap of eight
is a rolling wave by construction" is the same sentence read from the other
end — the rolling wave is admission the cap declines to count.

So the door carries a second number, and the two are different kinds of
thing:

- **The slot cap is per instant and releases.** Its counter goes down when
  work finishes.
- **The run total is per run and does not.** Its ledger only ever rises
  within one run identity — the identity the broadcast already mints — and it
  is reserved **at admission**, not booked at completion. A total read from
  settled work admits one cap's worth of extra sessions before the first one
  returns to be counted, and the overshoot is invisible because every
  individual admission was legal.

**The failure is usually a mis-scoped limit, not an absent one.** A limit
whose window is *smaller* than the run — one batch, one planning turn, one
response — is reissued intact at the next checkpoint, so the run pays it
once per checkpoint and never once per run. A limit whose window is *larger*
— a rolling hour, a day — grants a long run one budget per window and a
short run the same. Neither is wrong as a rate; neither is a total. The
total's predicate is the run
([a count carries its predicate](../../../../_laws.md#count-carries-predicate)),
and the run is the only scope at which "did this piece of work cost what we
agreed" has an answer.

Pick the number by derivation, not by feel
([limits-are-derived](../../../../_laws.md#limits-are-derived)): the slot cap
times the rounds a run is allowed to spend, or the run's cost ceiling divided
by a worker's expected cost, with the derivation written beside it. A total
typed by hand next to a configurable slot cap stops tracking it at the first
tuning pass, and the symptom is a fleet granted more capacity that does not
use it.

**The overflow rule inverts, and this is the part that surprises.** The slot
cap queues what it refuses: the work is coming, just later, and the queue is
ordered, visible and durable. A run total cannot queue its overflow — the
queue would hold the run's own excess and the run would never end. Its
overflow is **deferred to the next run** and recorded as a deferral, with the
count, not dropped
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)):
an operator reads that count to learn whether the budget binds on every run
(raise it, or the work never finishes) or on none (it is not the constraint).

Deferral buys that only under a condition the slot cap never needs, because
the slot cap only ever delays: **the admitted work must leave the work list.**
A run whose next list is re-derived from persisted progress starts where the
last one stopped, and the tail advances. A run whose list is re-derived
unchanged admits the same prefix forever and starves everything behind it,
and the starvation is silent because every run reports a full, successful
budget. Where progress is not persisted, the honest configuration is the
ordered durable queue, not a deferral.

**When the second number is not owed.** A door that serves *independent
arrivals* — each one a whole piece of work, arriving from outside, with its
own deadline — has no run to key a total on. Its accounting unit is the
arrival; its correct second number is a rate or an admission refusal, and a
run total there is ceremony that cannot fire. The discriminator is whether
the door serves a caller that **authors its own next batch**. A dispatcher
walking a list fixed before the run started is bounded by the list; a
dispatcher whose next batch is chosen from what the last one returned is
bounded by nothing it has written down.

Depth — a worker that dispatches workers — is a third axis and not this
subject's; a fleet bounds it by withholding the dispatch capability from the
worker rather than by counting, and the counting form lives with the sibling
subject that owns event-wired continuation.

## When the requester cannot survive the wait, refuse instead of queueing

A queued request needs a durable recipient and result correlation. A single model
turn can safely submit queued work when the surrounding runtime persists that
binding and delivers completion to a later continuation. If it cannot, refuse
overflow in the immediate tool result, state the effective limit and list exactly
which requests started. The discriminator is durable delivery, not whether the
requester is a model or a program.

Partial admission is useful for independent requests. An atomic or dependent batch
may instead require all-or-none admission. Preserve request identifiers so retries
do not repeat the admitted prefix. Report refusal rates by workload and resource;
a cap that never fires can still be an effective safety backstop.

## The address: derive it from the work, not the attempt

A dispatch is not finished when the session starts; it is finished when the
surface that started it — and every surface that comes later — can find the
session again. The discipline that makes this cheap: **compute a dispatch
key as a pure function of the entities the work is about** (which project,
which item, which scope), check it against the registry before spawning
(advisory — see below), atomically reserve the key and session incarnation before spawn, then record
the spawn outcome. Persist the binding onto the domain object or publish it
through a recoverable, idempotent protocol. A crash between spawn and naming
cannot be prevented merely by putting the calls next to each other.

Why a derived key and not the session id the spawn returns: an id minted at
spawn can only be *remembered*, and the surfaces that need it most — a
watcher built later, a view opened after a restart, a component that
unmounted — have no memory. A key derived from the request can be
*recomputed* by anything holding the same entities, forever. Include tenant, operation and semantic occurrence or revision when repeat work
on the same entity must remain distinct; the session identity remains separate.
The key also answers deduplication ("is one already running for this scope?") and
readback ("did the one for this scope finish?") as the same question. Two
cautions, both structural: the scope belongs *in* the key when scoped
fan-outs of one parent are meant to run concurrently (a parent-level key
makes deliberate siblings collide as duplicates); and a registry-check
followed by a spawn is check-then-act, not a lock — two concurrent callers
both get "not running." Treat the check as advisory, put the synchronous
double-fire guard on the control itself, and let the registry's one
admission door be the arbiter when it matters
([one door](../../../../_laws.md#one-validation-door)). A session spawned and
never named is anonymous exactly during the window when every recovery
mechanism is blind to it — if naming can fail, treat that as the dispatch
failing.

## Assignment: collision domains first

The charter fact of this subject: many sessions share one repository, one
host, one filesystem. The only cheap time to handle a write collision is
*before* it exists. Each dispatch declares a **write set** — the files,
directories, branches, or records the session is authorized to modify — and
the dispatcher's admission check proves the new set disjoint from every live
session's set before the session exists. Overlap is a dispatch-time rejection
(or a queueing decision: wait until the holder finishes), never a runtime
surprise.

Making disjointness real rather than aspirational:

- **Partition by design, not by hope.** When one goal fans out to many
  sessions, the split is chosen so write sets fall out disjoint naturally —
  by module, by directory, by record range. Overlapping proposals may instead use isolated workspaces with an
  explicit integration owner, or a transaction/lock protocol. Instructions alone
  do not enforce isolation against a worker that ignores its scope.
- **Shared ground is read-only ground.** Everything outside a session's
  write set is untouchable; read access remains subject to its separate grants. The instruction is explicit in the
  session's task, and the declared set is recorded in the registry — the
  audit trail for any later "who wrote this."
- **The narrow shared tails need a protocol, not vigilance.** Even perfectly
  partitioned work often converges on one shared integration act — a
  version-control commit, a shared ledger update, a manifest regeneration.
  Those tails are where disjointness structurally fails, and they get an
  explicit mechanism (an isolated staging area per session, an append-only
  ledger, a single-writer integration step) owned by the concurrent
  version-control discipline this subject borrows rather than owns — see
  the sibling subject concurrent-vcs.

## Verify after every irreversible act

Declared disjointness is a plan; sessions are autonomous, and plans decay.
The dispatcher pairs assignment with a standing verification ritual, imposed
on every session's task: **after each irreversible act, confirm the result is
yours** — the landed change contains your work and only your work, the
record you appended carries your identity, the artifact you produced matches
what you staged. The check must read the actual outcome, not the tool's
success message: shared-state races routinely produce a green status for an
act that silently swept in a neighbor's work or landed nothing at all
([the gate must see its target](../../../../_laws.md#gate-sees-target)). A
collision caught at the next step is an amend; a collision caught never is
two sessions' work fused under one attribution, discovered at review — or
after it.

When verification fails, the recovery rule is *repair attribution, don't
rewind shared state*: the content is usually present and merely mislabeled,
and rewinding a shared timeline to fix a label destroys neighbors' landed
work — a worse collision than the original.

## Broadcast and spawn-many

Fanning one task across many targets (the same audit against every module;
the same fix across every consumer) adds roster semantics on top of
single dispatch:

- **The wave is an entity.** A broadcast mints a run identity, and every
  member session's registry entry carries it. The run is what the harvest
  will account against; without it, "did the wave finish?" has no referent
  ([a count carries its predicate](../../../../_laws.md#count-carries-predicate) —
  "eight sessions succeeded" means nothing without "of the eleven
  dispatched in run R").
- **Members are independent failures.** One member failing neither aborts
  nor blocks its siblings by default; the run-level policy (proceed,
  abort-remaining, pause-for-human) is declared at dispatch, not improvised
  mid-wave.
- **The wave respects the cap.** Spawn-many is admitted through the same
  slot scheduler, as a queue of admissions, not an exemption from it. A
  broadcast of forty against a cap of eight is a rolling wave by
  construction.
- **Every member names its reaper at mint time.** Timeout budget, straggler
  policy, and who kills an overrunner are set per-member at dispatch
  ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)); a wave
  without per-member deadlines is a wave whose completion time is its
  slowest ghost.

---
layer: technique
type: technique
subject: fleet-orchestration
technique: parallel-dispatch
status: forged
laws: [gate-sees-target, one-validation-door, creation-names-reaper, count-carries-predicate, limits-are-derived, failure-not-empty-success, silent-state-is-ungoverned, absent-guard-is-loud]
shared_with: []
use_when: [deciding how many sessions may run at once, two sessions wrote the same file at once, fanning one task across many targets, a run keeps issuing legal-sized batches and nothing bounds what it spends in total, results pile up faster than anyone decides on them, a wave's size was chosen from the runtime's own concurrency cap, one verdict is covering items that are not alike]
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

## The third number is the supervisor's, and it is the one that does not release

Both numbers above are the machine's. One counts what is alive at this instant and
the state machine hands the slot back on a confirmed stop; the other counts what a
run has admitted and resets when the run ends. Both are released by an event the
system observes.

A third bound sits at the same door and is keyed on neither the machine nor the run:
**how many live units one supervisor is carrying.** It is a stock like the slot cap,
and it is unlike the slot cap in the property that governs every decision about it —
*it does not release when the work finishes.* The moment a worker exits, the machine
gets its slot back and the supervisor acquires an item. The supervisor's count comes
down when they decide a piece of work is *done with*, which is a judgment held
privately and never reported ([silent state is
ungoverned](../../../../_laws.md#silent-state-is-ungoverned)). So the door holds three
numbers with three release events, and only two of the three are observable:

| | unit | released by | observed |
|---|---|---|---|
| slot cap | per instant | a confirmed stop | yes |
| run total | per run | the run ending | yes |
| supervisory stock | per supervisor | a person deciding they are finished with it | **no** |

**"Which ceiling binds first" is the wrong question, and the measurement is why.**
On one single-operator fleet over three weeks the machine side engaged its configured
concurrency ceiling — eleven simultaneous runs against a limit of ten — and peaked at
fifteen live sessions on a door whose live-session ceiling had never been switched on
at all. Over the same period the supervisory stock, items raised for a human verdict
and still open, peaked at **thirty-four**, and stood at ten or more on eight of the
ten active days; on five of those days the machine ceiling did not bind once. The
machine ceiling bound first and bounded nothing downstream, because a cap on a stock
that releases places no bound whatever on a stock that does not. Ten slots cycling
all day deliver an unbounded pile to one person, which is the same arithmetic as the
rolling wave the slot cap declines to count, one layer further on.

The release asymmetry is the measurable part. Of the holds that closed, roughly half
outlived the work by more than an hour and roughly one in twelve by more than a day; the
longest sat for a week; and a tenth of the items raised never closed at all. One
cluster closed at exactly one hundred and sixty-eight hours, which is a weekly sweep
and not a verdict — where a system *does* observe this release it is usually an
expiry, and an expiry is an outcome that must stay distinct from a decision
([failure is not empty success](../../../../_laws.md#failure-not-empty-success)).

**Do not derive this number from the machine's.** The observed failure is a dispatcher
whose human-facing wave size was computed as the runtime's own concurrency cap divided
by the fan-out each member would spawn: a limit on one person's attention derived
entirely from a property of the process table. That satisfies
[limits are derived](../../../../_laws.md#limits-are-derived) in form and violates it
in substance, and the tell is that the number moves when the runtime is upgraded and
does not move when the supervisor changes.

Derive it from the discharge pattern instead, which the review ledger already records:
**the stock level above which one verdict begins to cover items that are not alike is
this supervisor's ceiling.** On the fleet measured, twenty-eight resolution acts
covered more than one item; eighteen of those twenty-eight spanned more than one
severity class, and the largest covered twenty-eight items across four severity
classes and seven distinct work streams — eight minutes after the stock peaked at
thirty-four. The number is per person and it is cheap to recompute, so recompute it
rather than adopting anyone's figure; the psychological capacity constants that get
quoted here measure retention of items in a recall task over seconds, and a
multi-hour work stream held in a folder is not that construct.

**Grouping is not the remedy for this ceiling; it is what the breach looks like.**
Bucketing the pile did halve the number of distinct verdict acts on the fleet measured
— ninety-seven acts over one hundred and ninety items — and two thirds of the
multi-item groups were heterogeneous, which is the one batch a review surface must not
offer. A homogeneous group of the same class and provenance is honestly one judgment;
a group spanning classes has not reduced the supervisor's load, it has discarded the
verdicts. So a bucket may absorb an overflow of this stock only under the same
homogeneity predicate the review surface applies to a batch verdict, and that
predicate belongs to the approval subject's queue technique, not here.

**The overflow rule has a third form, and this one cannot dispose of its excess at
all.** The slot cap queues what it refuses — the work is merely later. The run total
defers its excess to the next run. The supervisory ceiling can do neither: the work is
already finished and its result already exists, so there is nothing left to postpone.
Its only honest response at the door is to **stop admitting new work while the
supervisor's pile is over its measured level, and to say that is why** — a refusal
carrying the current stock and the level it is over
([a count carries its predicate](../../../../_laws.md#count-carries-predicate)).
A door that admits past it has not gone faster; it has converted rendered verdicts
into a sweep, and the conversion is invisible because every individual admission was
legal.

Nothing enforces this bound on any door yet observed, and a bound nothing enforces is
absent ([absent guard is loud](../../../../_laws.md#absent-guard-is-loud)). Its
absence is silent in *both* directions, which is what makes it expensive: the fleet
reports full throughput, and the supervisor reports having approved everything.

The neighbours, in both directions. The *rate* at which verdicts are demanded of a
person, the overload signature that rate produces, and what may be recorded about the
individual rendering them belong to the delivery subject's human-gate technique. The
pending set's surface, the ordering, and the homogeneity predicate for a batch verdict
belong to the approval subject's queue technique. What belongs at this door is the
**stock** — how many live units one supervisor is carrying, that it does not come down
when work finishes, and the refusal to admit past it.

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

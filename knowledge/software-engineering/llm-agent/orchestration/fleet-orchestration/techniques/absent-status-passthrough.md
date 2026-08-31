---
layer: technique
type: technique
subject: fleet-orchestration
technique: absent-status-passthrough
status: forged
laws: [unknown-is-not-a-value, failure-not-empty-success, one-validation-door]
shared_with: []
use_when: [a record arrives carrying no status and something must decide what to show, a session is permanently busy with no turn that could ever finish it, a liveness probe cannot reach the thing that answers whether a process exists]
---

# Absent-status passthrough

[lifecycle-signals](./lifecycle-signals.md) models two producers of session
state: the session reporting itself, and the sweeper inferring from silence.
Both are *producers* — each one observed something and has a claim to make.
This technique covers the layers in between, which observe nothing and are
asked for an answer anyway: the projector translating a record across a
transport, the probe whose identity provider is down, the snapshot that
persisted late and carried no status field. None of them knows anything. All
of them are one line of code away from saying they do.

The rule is a single sentence and the whole technique is its consequences:
**a layer that did not observe the state must pass the absence through
unchanged, never substitute a value for it**
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

## Why the sweeper cannot cover this

The reflex is to file this under tier two — surely a fabricated state is just
another wrong claim, and the sweeper exists to overturn wrong claims. It is
not, and the distinction is what makes this its own technique.

The sweeper converts **silence** into information. It catches the entry
frozen in working whose process died, because the evidence it reads is
staleness: nothing has been heard from this session, so its claim is
suspect. A fabricated state is the opposite shape. The session is alive,
recently heard from, and behaving perfectly; the only thing wrong is that a
relay between it and the registry invented a value the session never sent.
Every staleness budget passes. Every process check passes. The entry is
fresh, and it is wrong.

So the sweeper is structurally blind here, and a fleet that has both tiers
working correctly can still deadlock. That is the test for whether a state
belongs to this technique: **would the sweeper's evidence look healthy while
the state is wrong?** If yes, no amount of tier-two hardening reaches it.

## The three laundering points

Each is a boundary where an optional value meets a consumer that wants a
definite one, which is the laundering point the law names.

**1. The projection layer.** In any fleet whose registry is read across a
transport — a daemon serving several clients, an orchestrator streaming to a
dashboard, a control plane fanning out to executors — the reader does not
hold the registry. It holds a projection of it, rebuilt from records that
arrive asynchronously. Some of those records are not status updates at all:
a persistence flush, a metadata correction, an artifact-path resolution. They
carry the entry's identity and no status, because they were never about
status.

A projector that fills in a default at that moment produces a specific and
very durable bug. Suppose the default is the busy state. The session is
idle; its turn already ended and already emitted the transition that said so.
Now a late snapshot arrives with no status, the projector renders it busy —
and **there is no turn left to emit the idle that would clear it.** The state
machine is not corrupt, the registry is correct, the session is fine; the
projection is wrong forever, because the event that would fix it belongs to a
turn that finished before the wrong value was invented. Anything gating on
busy — an operator's restore, a dispatcher's capacity check, a shutdown
barrier waiting for quiet — blocks with nothing that can ever release it.

The rule: **project a status only when the record actually carries one.** A
record with no status updates the fields it does carry and leaves the status
untouched. The consumer keeps the last state it was actually told about,
which is the honest answer.

**2. The probe's own instrument.** The sweeper's process check asks the
operating system whether a process exists, and the answer is usually yes or
no. It has a third outcome that gets collapsed into the second: **the
identity provider was unavailable** — the interface that answers the question
did not answer it. Reading that as absent is the law violated inside the very
mechanism built to enforce honesty elsewhere, and it is expensive in one
direction only. Absent means reclaim: release the slot, retire the record,
delete the working directory, close out the log. A live session loses its
resources because a probe interface was briefly down.

So the probe's result is a three-value answer — present, absent, unknown —
and unknown retains everything and retries. A transient probe failure is
never evidence of completion; the entry keeps its resources and its
advertised artifacts, and the sweeper keeps polling until the provider can
actually say which of the two definite answers holds. The cost is a slot held
too long during a real outage, which is recoverable. The alternative is
reaping a working session, which is not
([failure ≠ empty success](../../../../_laws.md#failure-not-empty-success) —
an instrument that could not run must not report a clean result).

**3. Initial state at creation.** An entry created before its first turn has
no status yet, and the temptation is to seed it with the state it will
shortly occupy. Seed it with what is true instead: an entry whose runtime has
started but has not yet run a turn is starting, not working, and one that was
created to hold configuration for a session nobody has prompted is idle. The
tell that this was got wrong is a fleet in which the *first* status a session
reports is always a transition it never made.

Where the initial state genuinely is not known — a session adopted from a
previous process life, a record restored from a durable mirror — the honest
seed is the persisted state, and where there is none, the unknown state the
vocabulary already owes itself. Which raises the requirement the whole
technique depends on.

## The vocabulary must be able to say "not stated"

None of the above is expressible in a status vocabulary of definite states
only. If the enumeration is starting / working / awaiting-input / idle /
hibernated / exited / failed / lost, then every one of those is a claim, and
a projector holding a record with no status has nothing legal to write. It
will write the closest definite value, and the choice will be made by whoever
typed the default — usually the first state in the enumeration, which is
rarely the safe one.

So the closed vocabulary
([one authority](../../../../_laws.md#one-authority-per-vocabulary)) needs a
member that asserts nothing: a state meaning *no producer has told us, and we
are not guessing*. It is not a synonym for lost. Lost is the sweeper's
inference from evidence — we looked, and it is not there. This one is the
absence of any observation at all, and the two lead to different actions:
lost releases resources, unknown holds them and asks again.

Then the transition door
([one validation door](../../../../_laws.md#one-validation-door)) enforces
the passthrough as a rule rather than a convention: **a report carrying no
state is not a transition.** The door accepts it as a data update and leaves
the state machine where it stands. Handlers do not need to remember the rule,
because they are not the ones who could break it.

## What this cannot do

The passthrough keeps a stale-but-honest state instead of a fresh-and-wrong
one, and stale states are still stale. A consumer that has been told nothing
for an hour is holding an old fact, correctly labelled — and the technique
that converts that into information is the staleness sweep, which is why
these two are complements and neither is sufficient. This one guarantees the
sweeper is reasoning about claims somebody actually made. It does not make
those claims fresh.

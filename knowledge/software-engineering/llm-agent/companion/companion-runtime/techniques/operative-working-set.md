---
layer: technique
type: technique
subject: companion-runtime
technique: operative-working-set
status: forged
laws: [unknown-is-not-a-value, creation-names-reaper]
shared_with: []
use_when: [a companion needs to know what is happening right now, a restart made the companion confidently wrong about the present, deciding whether a runtime fact belongs in durable memory]
---

# The operative working set

A companion runtime holds state in two stores with different physics, and the
mistake that costs the most is treating them as one. The **durable brain** —
identity, consolidated knowledge, episodes, conversations — survives restart, is
shared by every channel, and is the only thing allowed to speak as knowledge.
The **operative working set** is what is happening *right now*: which work is in
flight, what just failed, what the person is in the middle of, what changed in
the last hour. It lives for the life of the process.

The memory subject owns what belongs in the durable layers and how items move
between them. This technique owns the runtime question those layers do not
answer: where the present tense lives, and what happens to it when the process
dies.

## Why "now" is a different store

The operative set differs from durable memory on every axis that decides storage:

- **Write rate.** It changes on every event the companion observes; durable
  memory changes on judgment.
- **Truth grade.** It is observation, not belief. It has had no distillation
  pass, carries no provenance, and must never be quoted as though it had.
- **Lifetime.** Its value is measured in minutes. A durable item's value is
  measured in weeks.
- **Correctness under restart.** This is the one that decides the design: after
  a restart, the durable store is still correct and the operative set is
  **unknown**, because the thing it described was the state of a running world
  that continued without the process watching it.

That last property is why persisting the operative set is not a shortcut but a
defect. A restored "what is happening now" is a definite claim about the present
built from a snapshot of the past — an unknown rendered as a value, at precisely
the boundary where confidence misleads most
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). The
companion wakes and reports that a job is running when it finished overnight,
that the person is mid-task when they went to bed, that something is failing when
it recovered. Every one of those is worse than saying nothing, because the
register is confident and the content is specifically about the present.

The inverse collapse fails as plainly: holding durable memory in process
lifetime makes the companion amnesiac across a crash it never notices, and the
loss is silent because a fresh empty store is indistinguishable from a store with
nothing relevant in it.

## Rebuild on boot, from sources that are still true

The operative set is **reconstructed**, not restored. On startup the runtime
rebuilds it by re-reading the sources that describe the present — the durable
store's current rows, whatever live signals the host exposes — and anything not
reconstructible is simply absent until it is observed again.

Absent is a state the companion can express. "I do not know what has been
happening since I was last awake" is an honest, useful sentence, and it is the
one a companion should be capable of saying for the interval it was not running.
A runtime that cannot represent that gap will fill it, and it will fill it with
the last thing it remembers.

The set names its reaper
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)) at two
scales: individual entries expire on their own age, because a fact about "now"
that is four hours old is not about now; and the whole set dies with the process,
deliberately and by construction rather than by forgetting to persist it.

## Bounded by construction, and rewritten rather than appended

The operative set is a small, named structure — in-flight work, recent failures,
the current focus, what changed lately — with a size discipline per region. It is
rewritten as understanding changes rather than appended to. An append-only
"recent events" list is not an operative set; it is a log that will grow until it
is truncated arbitrarily, and arbitrary truncation of a log about the present
drops whichever region happens to be quiet.

## Cycles read it; cycles do not write through it

The operative set is what an autonomous cycle consults to know whether now is a
sensible moment and what the situation is. It is not a path into durable memory.
An entry does not "graduate" by ageing: if something observed at runtime deserves
to be remembered, it is written as an episode through the ordinary capture path
and reaches durable knowledge through the ordinary judgment pass. A runtime that
lets the operative set flush into the brain has built a second writer into the
durable store — one whose items carry no provenance, skipped every judgment, and
are indistinguishable from properly consolidated ones at recall time.

The rule stated as a rule: **the operative set is read by many and written only
by the runtime's own observation path; nothing downstream of it may write to
durable memory on its behalf.**

## When a second process needs the present tense

A companion reachable from more than one process has one durable brain and one
operative set *per process*, and the second process starts life blind: the
signals were captured in an address space it cannot reach. Three repairs are
usually proposed and only one of them holds.

**Letting each process capture its own signals is the worst of them**, and it is
the one that looks cheapest. Two capturers on one machine race for the same
sources, and — the part that actually decides it — any filtering applied at
capture, redaction above all, now runs twice with potentially different outcomes.
A privacy contract enforced at capture cannot survive being implemented twice.
**Streaming the set between processes** is defensible and expensive: it adds a
connection lifecycle to a thing that has no natural session, and the consumer
that starts first sees nothing until the producer wakes.

**Projecting the signals into a shared store, with a short expiry, is the answer
that holds.** One capturer, one filtering decision, rows that outlive a restart
of either side, and an expiry that keeps a durable store from quietly becoming a
long-term archive of the user's activity — which is a different product with a
different consent posture. Two disciplines make it safe: capture-time gates come
*before* the row is written, so a disabled source produces nothing rather than
something filtered later; and both consumers render the set through **one shared
renderer**, so the two processes' views of "now" are byte-identical for identical
input rather than similar by intention.

What must not follow the signals across the boundary is the rest of the
operative set. The projection carries observations, not the companion's
in-flight state, and it does not make the operative set durable — the shared
rows are inputs from which each process rebuilds its own view.

## When not to do this

A companion that only answers questions from durable knowledge needs no operative
set at all, and inventing one gives it a second store to keep consistent for no
benefit. The technique becomes necessary when the companion acts on its own —
because acting requires knowing what is already in flight — and it becomes urgent
the first time the product restarts and says something confident about a present
it did not witness.

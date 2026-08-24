---
layer: technique
type: technique
subject: embedded-db
technique: single-writer-holder-discipline
status: forged
laws: [failure-not-empty-success, creation-names-reaper]
shared_with: []
use_when: [a single-writer file store is reported corrupt, backing up a store directory the application holds open, test files that pass alone fail together, a script that opens the store never exits]
---

# Single-writer holder discipline

Every other technique in this subject looks inward: the pool, the journal
contract, the maintenance loop, the pruner, the instrument — all of them
reason about one process and what it does to its own store. A store that
admits exactly one writer at a time, in one directory, on a filesystem any
process on the machine can reach, has a second failure surface that none of
that inward reasoning can see. **The first question of any "the database is
broken" report is who else has it open**, and a team that has not internalised
that question will answer it, eventually, by destroying a healthy store.

The naive reading is that a single-connection engine is *simpler* than a
server, because there is no connection topology to manage. What it actually
is, is a server with no admission control: the enforcement that a real
database performs — refusing the second client, arbitrating the second
writer, telling you which session holds the lock — has no home, so it lands
on operational discipline in the application's scripts and in the team's
diagnostic habits, and discipline that is not written as code does not happen.

## Diagnose the holder before diagnosing the data

The symptom set of *a store being held* and *a store being damaged* overlaps
almost completely: startup panics about a missing checkpoint record, every
open aborting, loaders degrading to nothing. Three rules make the two
separable, and each of them is counter-intuitive enough to have been learned
the expensive way.

**"It reproduces on a byte copy" does not rule out a holder.** This is the
one that fools careful engineers, because reproducing on a copy is exactly how
one proves a defect is in the data rather than in the code. But a copy taken
of a store that another process is writing is torn *by construction* — the
copy catches a write mid-flight — so the reproduction is not evidence about
the original at all. It is the expected result of copying a held store.

**A permission error on renaming the store directory is the holder check
succeeding.** The restore procedure that begins by moving the damaged
directory aside will fail at that first step while a holder exists, and the
failure is the diagnosis, not an obstacle. Treating it as an obstacle — force
the move, unlock the file, delete the marker — is how a healthy store with a
live owner gets destroyed by someone acting in good faith on a corruption
report.

**Held and damaged are not exclusive.** A holder existing does not mean the
data is fine; several processes writing the directory concurrently is one of
the ways it stops being fine. So the sequence is: find the holder, attribute
it before stopping it, stop it, **re-test the store at rest**, and only then
conclude. "A holder exists, therefore not corrupt" and "no holder, therefore
corrupt" are both invalid; only the at-rest test decides.

Finding the holder means enumerating processes by *command line*, not by
executable name — the interesting holders are the application's own runtimes:
a development server another session started, a batch script that was killed,
a background worker from a checkout that no longer exists. Two things that
look like holder evidence are not. The engine's own lock-marker file is
frequently synthetic, rewritten at every open, or carrying a placeholder
identifier, so its presence proves nothing; and an unreachable port proves
nothing either, since a holder can be mid-startup. What *is* evidence: the
failed rename, and a live server answering a request with real data — which
says the store is healthy and owned, and that both should be left alone.

Where a holder cannot be attributed, it is usually an orphan, and orphans
accumulate because nothing reaps them
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): every
process that opens the store must name the event that closes it. In practice
the recurring offender is the one-shot script. A runtime whose event loop is
held open by the engine's handle does not exit when its work is done — it
prints its answer and hangs — and every killed run leaves a process still
holding the directory. Their signature is a slow drift: reads that get slower
each hour, which reads exactly like a performance defect in the loader and has
cost at least one team a day of investigation into code that was never slow.
So every store-opening script exits explicitly, after its work resolves, and
before that habit exists the whole diagnostic ladder above runs constantly
against messes the team made itself.

## A copy taken mid-write is not a backup

The file-copy instinct is the most dangerous thing about a store that is just
a directory. A copy taken while anything writes produces an artifact that
fails every open, and — the part that makes it worse than an obvious failure —
it fails at *restore* time, which is the one moment the copy was for.

A backup of a single-writer store is a procedure, not a copy:

1. **Hold the connection yourself.** Opening it is also the admission check:
   if something else has the store, the open or the first statement fails, and
   the correct response is to stop rather than to copy a store you cannot
   prove is at rest.
2. **Force a checkpoint before copying**, so the copy carries the data rather
   than the log of how the data got there. Report the before and after sizes
   honestly rather than promising a reduction — recycled journal segments are
   typically retained for reuse, so a correct checkpoint often shrinks nothing.
3. **Strip the lock marker from the copy.** It records *your* process, and a
   copy that carries it presents a phantom holder to whoever opens the copy
   next — a self-inflicted instance of the diagnosis problem above.
4. **Prune by a prefix the backup tool itself owns**, oldest first, printing
   what it removes before removing it. A damaged directory somebody parked for
   autopsy, a per-case copy, a sibling store — none of those are the backup
   tool's to delete, and a prune that matches on "looks like a backup" will
   eventually take one.

Two properties decide whether the backups are worth anything. First, **a
damaged directory stays damaged after its holders are gone** — killing the
orphans is not a repair, and the plan after the at-rest test fails is restore,
not rescue. Second, restore is only cheap when every write since the last
backup is reproducible: a committed, gated payload that can be replayed
against the restored store. Where that holds, a nine-day-old corruption costs
an afternoon; where it does not, the backup cadence *is* the data-loss budget.
Refresh the named backup after each batch of writes for the same reason —
otherwise the next rescue restores a state old enough to be its own incident.

That risk runs in both directions, which is the part teams miss: on a shared
machine, a concurrent session can restore the store *under you* while your
work is in flight, silently reverting recent writes with no error anywhere and
every surface still rendering. Probe the store's own provenance markers
against what the ledger expects before making a live write; a missing
generation means somebody restored beneath you. And verify a restore with the
instrument rather than by eye
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)) —
a store that opens and returns less than it should is the failure mode that
looks most like success.

## Contention is the default explanation for parallel flakiness

Test files that boot a real store contend for one directory in a way unit
tests never do, and the resulting failures wear a disguise: a hook timing out
during setup reads as a hang in the code under test. The rule is diagnostic
before it is configurational — **a failure that passes in isolation and fails
under the full suite is contention until proven otherwise**, and a red full
run is not evidence against a change until it reproduces with the worker count
capped.

The configuration that follows is unglamorous and belongs in the checked-in
test config with the measurement in a comment beside it: setup-hook and test
timeouts raised well past the defaults, because a store boot under parallel
load takes multiples of what it takes alone, and a worker cap for the same
reason. Record the date and the observed duration next to each raise; without
them the next person tightening the timeouts has no way to tell a real
regression from the thing the raise was for.

The same cross-process reasoning governs how a second runtime gets an isolated
store at all. Pointing a second instance at a copy is necessary but rarely
sufficient: development servers typically lock per project directory rather
than per port, and a linked module tree defeats bundlers that resolve real
paths. Isolation therefore costs a real second checkout with a real install,
and treating that cost as avoidable produces the third instance of the same
incident.

## Every memo of the handle closes in lockstep

A single-connection store tends to acquire a memo — the open is expensive and
must not happen twice — and then a second one at a different layer, because
the bootstrap module caches the connection and the store module caches the
object built over it. When only one of them is cleared on close, a caller that
opens, closes and reopens receives the cached object from the layer that was
not cleared, closing over a handle that is gone; every method then fails for a
reason nothing in the error mentions.

The rule is that the layers share one invalidation. Whichever memo the closing
path clears must clear the others too, structurally — a close that wraps and
clears rather than a convention that both be reset — and the reopen path must
be exercised in a test, because manual use rarely closes anything.

## When not to use it

None of this applies to a store the process genuinely owns alone for its whole
lifetime — a per-user application data directory on a desktop, opened at
launch and closed at exit, with no scripts, no test suite booting it, and no
second runtime. There the in-process techniques are the whole of the
discipline, and a holder-hunting ritual is ceremony against a population of
one.

Nor is this a substitute for the engine offering real concurrency. Where a
store can genuinely be shared by multiple writers, the answer to contention is
that mechanism, not this one; the discipline here is what a *single-writer*
store's constraints force, and adopting it in place of available concurrency
control would be paying an operational cost to avoid a configuration change.

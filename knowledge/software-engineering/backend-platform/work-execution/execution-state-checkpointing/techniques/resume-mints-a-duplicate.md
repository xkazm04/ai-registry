---
layer: technique
type: technique
subject: execution-state-checkpointing
technique: resume-mints-a-duplicate
status: forged
laws: [identity-survives-reuse, absent-guard-is-loud]
shared_with: []
use_when: [a capture will be restored more than once or forked, two resumed environments behave identically when they should not, deciding what a restored environment must re-derive before it is usable, auditing what a capture froze that was supposed to be unique]
---

# Resume mints a duplicate

Restoring a document twice produces two copies of a document, and that is
harmless. Resuming a captured environment twice produces two environments that
**both believe they are the original**, and it is not harmless at all: every
value that was supposed to be unique to an instance is now shared by two, with
nothing anywhere announcing it. Both resumed environments run correctly. That
is the problem.

The general rule is old and the corpus already states it — identity is minted
once at creation and carried
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
Capture-and-resume breaks it in the one direction the rule did not anticipate:
the capture *carries* identity across a boundary where a new one should have
been minted. So the discipline inverts. **Treat a capture as a template and
every resume as a new instance, and enumerate what the new instance must
re-derive before it is usable.**

## The inventory

Do this at capture-design time, once, in writing. The categories recur across
systems; the specific entries are yours.

- **Entropy state.** The kernel's random pool, any userspace generator seeded
  at start, and everything downstream of them: session identifiers, nonces,
  temporary key material, retry jitter. Two resumes of one capture produce the
  same "random" values in the same order. This is the entry with the widest
  blast radius and the least visible symptom, and it is why hypervisors grew a
  generation counter the guest can read to learn it has been resumed.
- **Instance identity.** The host or machine identity file, the node name, the
  identifier a clustering or replication layer uses to tell members apart. Two
  members with one identity is not a duplicate member; it is a corrupted
  membership, and it typically manifests as one of them silently losing writes.
- **Network position.** Addresses, leases obtained from an address server,
  interface identities, and anything registered under them. A capture holds an
  address that was granted to a machine that may still be running.
- **Live credentials.** Session tokens, refresh tokens, connection credentials
  and their expiry, all held in captured memory. A resumed instance presents
  credentials that either belong to a still-running sibling or expired while
  the capture sat in storage.
- **The clock.** Captured memory believes it is the moment of capture. Timers
  that should have fired have not; certificates and leases that were valid are
  not; a monotonic clock jumps. A resume is a time-travel event and code that
  assumed continuity of time is running under a violated assumption.
- **Open connections.** Sockets in the captured memory image reference peers
  that moved on. They are not connections; they are objects that look like
  connections, and the failure surfaces on first use, far from the resume.
- **Held leases and locks.** Anything the captured instance owned in a
  coordinating store. On resume it believes it still holds them, and it may not
  — the surrounding subject's exclusion and reclaim machinery owns the
  arbitration, but the *belief* is this technique's problem, because it came in
  through the capture.

## Three dispositions, and the third must be written down

For each entry the design chooses exactly one and records it:

1. **The runtime re-derives it.** The platform notices the resume and reseeds
   or re-mints on its own. This is the best answer and the one to prefer where
   it is available.
2. **The layer above re-derives it.** The orchestration that performs the
   resume clears or regenerates the value as part of the restore, before the
   environment is handed to a caller. This is where instance identity, network
   registration and credential refresh usually land.
3. **The design accepts the collision.** Legitimate — a short-lived fork whose
   two halves never talk to the same peer may genuinely not care. It is
   legitimate *only when written down*, next to the entry, with the condition
   that makes it safe. An unwritten acceptance is indistinguishable from an
   oversight, and the next person to widen the use of forking will not know
   which one they inherited.

## The reseed that quietly does not happen

Disposition 1 is the most dangerous to assume, because it is usually
conditional. The platform reseeds *if* the guest is recent enough to read the
generation counter; the runtime re-mints *if* a particular subsystem is
present; the identity file is regenerated *if* it was emptied when the image
was built. On anything older or differently configured, nothing happens and
nothing says so — a guard that is present in the examples and absent in the
installations ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

So a design that relies on runtime re-derivation must establish that the
capability is actually present in the environments it captures, and treat its
absence as a condition to report rather than a default to hope for. The
honest form is a checked precondition at capture or restore, with the fallback
being disposition 2 rather than silence.

## "We only ever restore once"

The commonest reason this inventory is skipped is that today's caller restores
each capture exactly once, to the same environment it came from — a rewind, not
a fork — so no duplicate exists and none of the above bites.

That is a property of the caller, not of the artifact. The capture is a
template the moment it is stored, and the second caller arrives as a feature
request: fork this environment for a parallel attempt, resume it in a second
place to compare, hand it to a teammate. At that point the inventory is written
under deadline by somebody debugging identical outputs from two environments.
Even in the single-restore case, one entry always bites immediately and is
worth handling on day one: **the clock**, because a rewind resumes into a later
present regardless of how many copies exist.

## Making duplication visible

Duplication defects are silent, so the test has to manufacture the signal
rather than wait for it. The shape that works: resume one capture twice,
concurrently, and assert that the two instances **differ** where the inventory
says they must — draw a value from each generator, read each instance
identity, take each address. An assertion of inequality between two siblings
catches every disposition-1 failure, and it is the only test that does; a
single-instance test cannot see any of this, because a lone duplicate is
indistinguishable from an original.

## Decision rules

- Treat every capture as a template and every resume as a new instance, even
  when the design restores once.
- Enumerate the per-instance values at capture-design time, in the categories
  above, and record a disposition for each.
- Prefer runtime re-derivation, but verify the capability is present rather
  than assuming it; treat its absence as a reportable condition.
- Where the layer above re-derives, do it during restore, before the
  environment is handed to a caller — never lazily on first use.
- Write down every accepted collision with the condition that makes it safe.
- Handle the clock on day one: a resume is a time jump for every timer,
  expiry and monotonic reading inside the capture.
- Test by resuming twice concurrently and asserting the siblings differ where
  they must.

## When not to use it

A capture that holds no per-instance state does not need the inventory. A
filesystem-only artifact built from a specification, restored into a freshly
started instance, carries no entropy pool, no live sockets and no held leases —
whatever identity it has is minted by the start-up it goes through, which is
the ordinary path. The distinguishing question is whether the resume *skips*
the initialisation that would normally mint these values; if the environment
boots through its usual start-up, the start-up is already the re-derivation
step and this technique is describing work that is already done.

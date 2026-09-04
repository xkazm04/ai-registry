---
layer: technique
type: technique
subject: self-healing
technique: consume-once-mode-handoff
status: forged
laws: [creation-names-reaper, record-precedes-effect, limits-are-derived]
shared_with: []
use_when: [a mode flag on disk survives the boot it was meant for, reading an unbounded log to find a one-line verdict, deciding whether a file at a well-known path may be trusted as a message]
---

# A file is not a message: the consume-once mode handoff

When a verdict has to cross a process death, the filesystem is usually the only
channel available. It is a poor one, and the poverty is specific: a file has no
delivery semantics, no sender identity, no size bound, and no notion of having
been read. Every one of those gaps has a failure mode, and a handoff that does
not close all four turns a one-time incident into a permanent state.

The four disciplines below are what turns a path into a channel. They are cheap
individually and only correct together.

## Consume once, by unlinking on read

A marker that persists is a mode that never ends. The successor comes up
degraded, the operator repairs the underlying fault, the device reboots — and
reads the same marker again. The reduced mode outlives its cause by exactly as
long as nobody thinks to delete a file they do not know exists.

So the reader **unlinks the artifact as part of reading it**, before acting on
its contents, and the read is the only consumer. This is
[creation-names-reaper](../../../../_laws.md#creation-names-reaper) with the
reaper being the reader rather than the writer: the dying process cannot clean up
after itself, so the obligation transfers, and it transfers at the only moment
anybody is guaranteed to be looking.

The ordering matters. Unlink first, then act. The reverse order — act, then
unlink — leaves a window in which a crash during startup in the degraded path
re-reads the marker forever, which is the crash-loop this whole mechanism exists
to end.

## Authenticate by shape, because the path is not private

A well-known path in a writable directory is reachable by anything running on the
box, and on an appliance that includes the customer. Trusting whatever bytes are
found there means a stray file — a truncated log, a copied backup, a support
script's output — can put the device into a reduced mode nobody chose.

Full authentication is usually unavailable and disproportionate; a **shape
requirement** is neither. Demand a property the legitimate writer produces as a
side effect of how it writes and an accidental file does not: that the path is a
symlink rather than a regular file, that it carries a specific mode, that it sits
under a directory only the supervisor creates. Anything failing the shape check
is logged and ignored — not treated as a corrupt marker, and certainly not
treated as a present one. The check costs one `lstat` and removes an entire class
of accidental activation.

## Bound the read, and derive the bound

The channel is frequently an append-only log — the natural artifact a dying
process leaves — and a log has no size. Reading it whole to find one line is an
out-of-memory failure in the startup path of a device that is, by construction,
already in trouble.

Read a bounded tail. The bound is a number, so it is
[derived and written beside itself](../../../../_laws.md#limits-are-derived):
large enough to hold the tail a panic writes on the largest supported runtime,
small enough to be allocated on a device that has just crashed. Seek from the end
rather than filtering forward, and accept that a marker older than the window is
lost — which is correct, because a verdict buried under megabytes of subsequent
output was not the last thing that happened.

## Keep an out-of-band door

The channel can fail. The writer can crash before writing, the filesystem can be
full, the shape check can reject a marker somebody produced by hand during an
incident. Because the mode's whole purpose is to make a broken device reachable,
it needs at least one entry path that does not depend on the mechanism being
healthy: an environment variable the launcher sets, or a sentinel file an
operator can create over whatever remote access still works.

That door is a deliberate part of the design and is documented as such. It is
also the one entry path that is *not* evidence-based, so it is spelled
differently in the record — the mode reports which trigger admitted it, and
"an operator asked for it" is not the same fact as "the recovery loop was
exhausted." Collapsing the two loses the ability to answer the only question that
matters afterwards: did this device enter its reduced mode because something
broke, or because somebody was debugging it?

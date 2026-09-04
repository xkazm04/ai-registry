---
layer: technique
type: technique
subject: deterministic-prefix-caching
technique: atomic-write-then-move
status: forged
laws: [creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [many loader workers may compute the same disk-cache entry at once, a half-written cache file crashed a later run, choosing between a lock and a rename for a shared cache directory]
---

# Atomic write, then move

A disk cache is written by whoever misses first, and under a multi-worker loader that
is several processes at once, on the same record, in the same second. A second run
sharing the directory joins them. Without a discipline, two writers open the same
entry path, interleave their bytes, and leave a file that is the right size and the
wrong content; or a writer is killed mid-write and leaves a file that is the wrong
size; and in both cases the next reader loads garbage or raises. The technique is to
never write an entry at its final path. Build it in a temporary path in the same
directory, then rename into place; on the read side, treat an entry that fails to
load as corrupt — unlink it and recompute — rather than as a failure to propagate.

## Why a rename and not a lock

A lock across loader workers is a coordination primitive that has to survive process
death, work across a network filesystem, and be released by a worker that was
terminated by the parent. Each of those is a place a lock goes wrong, and a cache that
deadlocks on a stale lock file is worse than one that occasionally computes an entry
twice. The rename needs none of it. On every filesystem the cache is likely to run on,
renaming a file within one directory is atomic: a reader sees either no file at the
final path or a complete one, never a partial one. Two workers that both miss compute
the entry twice, both rename, and the second rename replaces the first with an
identical file. The duplicate work is bounded — one extra head computation per race —
and the correctness is unconditional.

The temporary path must be in the same directory as the final path, or the rename is
a copy across filesystems and is not atomic. A temporary directory elsewhere on the
machine is the mistake that turns this technique back into the problem it solves.

## The reaper

A temporary file is a created resource and it names what destroys it. The happy path
destroys it by renaming it away. The unhappy paths — the head raises on this record,
the process is killed, the disk fills — leave it behind, and the cache directory
accumulates half-written temporaries under names nobody recognises. Two disciplines
cover this: the write wraps the temporary in a handler that unlinks it on any exit
that is not the rename, and the temporary's name carries a recognisable suffix so
that a clear, or a periodic sweep, can remove strays without touching real entries.
A temporary with the same name pattern as a real entry cannot be distinguished from
one later, and a sweep that cannot distinguish must leave both.

## The read side: corrupt is not missing, and neither is failure

The reader has three outcomes and must spell them differently. **No entry** means
compute and write — the normal miss. **Entry loads** means serve — the normal hit.
**Entry exists and does not load** — the file is truncated, the serialisation is from
an incompatible version, a field cannot be represented — is the case the discipline is
for, and the rule is: unlink the entry, log that a corrupt entry was removed and
where, and recompute as a miss. Do not raise, because a single corrupt entry would
then halt a training run that could have recomputed it in a second. Do not silently
recompute, because a cache in which every entry is unreadable — a version change in
the serialiser, a systematic field the format cannot carry — would then run at
uncached speed while the directory fills, and the only symptom would be an epoch time
that never improved.

The log line is what separates a cache that works from one that looks like it works.
"Removed corrupt entry, recomputing" once is a crash last week; the same line ten
thousand times is a serialiser that cannot read its own output, and the operator
needs the count to tell the two apart.

Unlinking a corrupt entry and recomputing it is repair, not deletion for its own sake;
the recomputation is what makes it repair. A reader that unlinks and then serves an
empty value, or that unlinks and moves on to the next record, has deleted the artifact
that exposed a defect and fixed nothing.

## Procedure

1. Compute the entry.
2. Open a temporary file in the cache directory with a recognisable suffix, under a
   handler that unlinks it on any exception.
3. Serialise the entry into it. Flush and close.
4. Rename the temporary to the final path. On platforms where a rename onto an
   existing file fails, replace rather than rename; the replacing call is still atomic
   within a directory.
5. On read: if the path does not exist, miss. If it exists, load inside a handler; on
   any exception, unlink, log with the path and the exception class, and miss.
6. On clear, remove real entries and temporaries alike; the suffix is what makes the
   second part safe.

## Decision rules

When two writers of the same entry could produce different bytes — because the head is
not deterministic after all, or because a serialiser embeds a timestamp — the rename
is still safe (last writer wins, both complete) but the cache has a deeper problem
that this technique does not fix and should not hide. When the cache directory is on
a network filesystem whose rename is not atomic, the technique is unsafe and the
documentation must say which filesystems it has been verified on. When entries are
large enough that writing them twice under a race is expensive, add a cheap
"in-progress" marker as an optimisation for the race, but never as the correctness
mechanism; the rename remains the thing a reader trusts.

## When not to use it

An in-memory cache has no files and no races of this kind; its concurrency question is
whether the fill's threads share transform state, which is a different technique's
concern. A cache with exactly one writer, ever — a preprocessing job that populates a
directory before any reader starts — can write directly, though the rename costs
nothing and protects against the day a second writer is added.

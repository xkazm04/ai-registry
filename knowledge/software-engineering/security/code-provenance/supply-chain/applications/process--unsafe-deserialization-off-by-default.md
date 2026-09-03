---
layer: application
type: application
subject: supply-chain
technique: unsafe-deserialization-off-by-default
stack: process
verified_on: 2026-09-02
applied: code
ab_verdict: better
proof: ab-paired
---

# Four archive readers, three with the grant on, and a producer that never needed it

A game project's motion-research lane keeps a handful of scripts that read
numeric archives produced by an external text-to-motion pipeline: a
filmstrip renderer, a skeleton-format converter, a concatenator that also
writes archives, and a loop-closure gate added last. The tree was opened
on 2026-09-02.

## What the tree holds

| Site | Grant as shipped |
| --- | --- |
| Filmstrip renderer | permissive (pickled members allowed) |
| Skeleton-format converter | permissive |
| Archive concatenator | permissive |
| Loop-closure gate (newest, 2026-08-19) | restricted |

The newest reader was written restricted, and it reads the same member
names the other three read. The three older readers carry the permissive
grant not because any member needed it but because that was the default
when they were written — the shape the technique predicts. The
concatenator is also the tree's only producer, and every member it writes
is a numeric array plus one scalar.

## The two arms

Both arms ran on two archives built from the producer's own member set,
through both loaders, in a scratch harness that touched no project file.

| Archive | A: permissive | B: restricted |
| --- | --- | --- |
| Producer-shaped (seven numeric arrays and one scalar) | all eight members load | all eight members load, identically |
| Hostile-shaped (one numeric array and one object-typed member) | both members load; the object member is executed | the numeric member loads; the object member is refused |

Two archives, two arms, one predicate per member. The producer-shaped arm
is the one that decides the change: nothing the project writes needs the
grant, so turning it off costs nothing. The hostile-shaped arm is the one
that proves the guard is live rather than declared. Verdict: better.

## What shipped

The three permissive sites were flipped to restricted, in one commit on the
project's active branch, with the harness result as the paired proof. No
format migration was needed — the producer already writes a data-only
archive — so the technique's third part was already satisfied by structure.

## What this realization cannot do

The harness proves the loaders accept the producer's shape; it does not
prove that every archive ever written by the *external* pipeline upstream
of the concatenator is free of object members, because none of those files
is in the tree. If one arrives with an object-typed member, the restricted
loader will now refuse it loudly, which is the intended behaviour and the
point at which somebody decides whether that member was ever meant to be
there.

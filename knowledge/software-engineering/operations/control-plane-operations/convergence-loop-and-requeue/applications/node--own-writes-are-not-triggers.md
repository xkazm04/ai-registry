---
layer: application
type: application
subject: convergence-loop-and-requeue
technique: own-writes-are-not-triggers
stack: node
verified_against: node@24
verified_on: 2026-09-17
applied: code
ab_verdict: better
proof: ab-paired
---

# A transpiler raising the user's own progress figure (Node)

How the technique lands in a public TypeScript project (`xkazm04/pof`, commit
`c1b006ad`, 2026-09-17). The version witness is the runtime the repository pins for
itself in its manifest, not a version this document guessed.

A recursive watch covers a source tree. A write door emits generated headers and
implementation files **into** that tree. A hook turns each emitted declaration into a
completed checklist item and forces a re-scan — and on three fallback paths it marks the
item done on a name match alone. So the transpiler's own output raises the figure the
user reads as their progress. This is the technique's *false count* half rather than its
spin half: nothing loops, and the number is wrong.

## Why this seam could have refuted the technique

The watcher already carries a debounce whose comment names the agent's own writes as the
thing being coalesced. If a debounce plus change-type detection already collapsed a
self-write to nothing, then coalescing substitutes for exclusion and the technique's
central claim is wrong — the honest landing would then have been that the corpus's
existing per-key coalescing discipline suffices at a shared write/read boundary.

**It did not.** Arm A returned two echoes: the debounce merged the two writes into one
batch and removed neither event. Coalescing bounds work per trigger; it does not remove
a trigger. That sentence is in the technique because this arm produced it.

## Target and floor

| | arm A | arm B |
| --- | --- | --- |
| **TARGET** own emitted files reported as source changes | **2** | **0** |
| **FLOOR 1** foreign-origin events delivered, tolerance 0 | 2 | 2 |
| **PC1** an unclaimed hand-authored header still emits | 1 | 1 |
| **PC4** a later foreign edit to a path the door had written still emits | 1 | 1 |

The remedy is the write-door claim rather than an origin filter, because a filesystem
records *that* bytes changed and nothing about who changed them. Its three properties are
each a failure it prevents: matched on **content** so a foreign edit to a path the door
also writes is not swallowed, **consumed on first match** so one write does not become a
permanent blind spot, and **expiring** so a claim nobody matches cannot silence a path for
the life of the process.

## Positive controls

- **PC2 — the test can fail.** The same test file, byte-identical, fails on arm A
  (`expected 2 to be +0`) and passes on arm B. It imports nothing only one side has.
- **PC3 — it is not a path mute.** A claimed path whose bytes on disk differ from the
  claim still emits, and the claim survives to be matched by the write it was made for.
  Asserted directly rather than argued.

## Gates

The project's full suite: 14 failures across 8 files on arm B. The same 8 files re-run as
a subset on **both** commits returned identical results — 10 failed, 83 passed, same test
names; the other 4 are load-dependent and pass in the subset on both sides. None is in a
file this change touches. Typecheck exits 0 with no errors; lint is clean on all five
touched files. A later re-proof on the current branch, after a sibling landing moved the
base, returned 1,197 passed with 0 failures across the affected areas.

One instrument note, because it cost an arm: a dynamic import used as a capability probe
is resolved statically by this project's bundler, which made the shared test file
unloadable on arm A. The control was moved out of the shared instrument before either arm
ran, and the amendment is dated in the declaration.

## Left for the owner

The consumer marks a checklist item complete on a **name match alone** on three separate
fallback paths — no semantic expectations, a non-ok response, a network throw. Combined
with the echo, that was self-certification with two independent ways to skip the check.
This change removes the echo; the fallback paths are untouched and are a separate item.

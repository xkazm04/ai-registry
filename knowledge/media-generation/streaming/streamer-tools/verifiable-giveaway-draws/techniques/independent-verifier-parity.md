---
layer: technique
type: technique
subject: verifiable-giveaway-draws
technique: independent-verifier-parity
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [building the verifier viewers run, keeping a verifier in step with the drawing code, choosing the test vectors for a draw algorithm]
---

# An independent verifier, held at parity

The verifier a viewer runs is a separate implementation of the specification, runnable
without the operator's server, and it is kept at byte-for-byte parity with the drawing code
by shared test vectors that run on every change. A verifier that shares code with the drawer
agrees with it by construction, including about its bugs.

## What independent means

Independent is graded, and the grade is stated. The weakest acceptable form is a second
implementation in the same codebase written from the specification without importing the
drawing module. Stronger is a different language — a page a viewer opens in a browser —
written by someone reading the specification rather than the drawing source. Strongest is
a verifier the room can write for itself from the published specification, which is why
the specification is published at all. A verifier that is the drawing library wrapped in a
command is not independent at any grade; it is the drawer run twice.

The verifier also has to be **reachable without the operator**. A verification page served
by the operator's own host, fetching the record from the operator's own endpoint, can be
swapped with the draw. A static page that works offline, takes the record as a file or a
paste, and carries the trust anchor in its own code, can be saved by a sceptic and run a
year later.

## Parity

Parity is a test, not a claim:

- **Shared vectors.** A set of records — small lists, weighted lists, lists that trigger
  rejections, the one-entry case, the winner-count-equals-entries case — with expected
  winners. Both implementations run them in their own test suites.
- **Tampered vectors.** For each check the verifier performs, a record that fails it,
  with the expected failure reason: a changed entry, a changed weight, a swapped winner, a
  corrupted signature, a foreign key, a missing signature. A verifier that returns "fail"
  for the wrong reason is not at parity; the reason is part of the contract, because it
  is what the viewer reads.
- **Generated vectors.** Vectors are produced by the drawing code in bulk — a thousand
  random lists and weights, across every randomness source the format supports — and
  checked by the verifier, and a sample of real past draws is replayed through it on every
  release. A generated fixture file is itself checked for staleness: the drawing side
  regenerates it in its test run and fails if the committed copy differs.
- **The shipped artifact, not just the module.** If the verifier ships as a single page,
  the test opens that built page — with dynamic code evaluation disabled, as a careful
  viewer's browser might — and runs the vectors through it. A module that passes and a
  bundle that was built from a stale copy of it are different verifiers.

## Input hardening

The verifier reads records from strangers. Bound the input size before parsing, reject
unknown fields or versions by name, and never evaluate anything in the record. A
verifier that crashes on a large file is a verifier a hostile record can turn into "the
verification page is broken", which reads to the room as "the draw is unverifiable".

Input bounds are part of the specification, stated in one unit, and identical in every
implementation. A size cap of "two million bytes" in one verifier and "two mebibytes" in
the other is a band of records that one accepts and the other rejects — a parity break that
no winner vector will ever catch. When the verifier is interactive, a slow read of an old
file must not land after a fast read of a new one and overwrite its verdict.

## Decision rules

- When the specification changes, it gets a new version; both implementations add it,
  and both keep verifying every old version.
- When the two implementations disagree on any vector, the release stops. Do not pick
  the one that looks right; find the byte the specification failed to fix, and fix the
  specification.
- When a check is not implemented in one of the two (the browser cannot verify the
  signature yet, say), that implementation reports the check as not performed. It never
  inherits the other's verdict.
- When showing the verifier's result on stream, render the verdict and the scope of
  what it checked; a green tick with no scope reads as a broader claim than the proof
  makes.

## When not to use it

A tool whose draws are never shown to anyone outside the operator's team does not need a
second implementation. Once a draw is presented as verifiable to the public, the verifier
is part of the product, and parity is how it stays true.

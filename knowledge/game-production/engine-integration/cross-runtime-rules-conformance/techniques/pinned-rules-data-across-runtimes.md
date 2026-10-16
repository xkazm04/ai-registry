---
layer: technique
type: technique
subject: cross-runtime-rules-conformance
technique: pinned-rules-data-across-runtimes
status: draft
laws: [one-authority-per-quantity, law-and-check-share-one-source, a-verdict-is-bound-to-its-content]
shared_with: []
use_when: [two runtimes load the same rules data, one runtime is on an older revision of the tables, a port begins from a copy of the data]
---

# Pinned rules data across runtimes

The named concern: two runtimes that load different revisions of the rules tables will
disagree, and every disagreement will look like a porting bug. A conformance suite run
across unpinned data measures the data drift and the logic drift together and cannot tell
them apart. Pinning the data first removes one of the two unknowns before the expensive
work starts.

## What a pin is

A pin has three parts, and a copy has none of them:

1. **A revision.** The commit, tag or release of the authoritative source the data was taken
   from.
2. **A content hash and byte length per file.** The revision says where the bytes came from.
   The hash says these are still those bytes.
3. **A check that fails on any difference.** It runs in the port's gate and in the vector
   generator, both before they read the data. A generator that reads unpinned data writes
   vectors against a different game.

The pinned files are read-only in the port's tree. A change to the rules goes to the
authoritative source first, then moves the pin in a change of its own, then regenerates the
vectors. A port that edits its pinned copy has forked the rules while still claiming to
follow them.

## Procedure

1. List every file the reference runtime reads to build its rules: tables, curves, catalogs,
   constants files. Include the ones it reads indirectly through a compiler or loader step.
2. Record the source revision and, per file, the hash and byte count in a manifest.
3. Copy the bytes with a binary-safe path. A text-mode copy or a shell redirect can rewrite
   line endings and change every hash.
4. Add a check that recomputes the hashes and compares them with the manifest. Give it a self
   test: dirty one pinned byte in a scratch copy and confirm the check names the file.
5. Make the vector generator refuse to run unless every file it reads is in the manifest and
   matches it.
6. Where the port restates a constant in its own language rather than loading it, put the
   reference location beside it in a comment, so a reviewer can compare the two by eye. Those
   restated constants are where a pin cannot reach, and the conformance vectors are their
   only guard.

## Decision rules

- **When a conformance vector fails, run the pin check first.** If the pin fails, the vector
  result is about data, not logic.
- **When the authoritative source changes, decide whether to follow it.** Moving the pin is a
  decision with a date and a reason, never a side effect of a sync script.
- **When the port needs a value the source does not have, add it to the source.** A value
  that exists only in the port is a second authority.
- **When the generator reads a file the manifest does not list, fail.** A silent extra input
  is the same drift with one more step.

## When not to use it

- **One runtime, one tree.** If the rules data has a single consumer, the canon's single
  source already does this job.
- **Data that is meant to differ per runtime**, such as device-specific budgets. Declare those
  as overlays on top of the pin, named as such, and keep them out of the rules.

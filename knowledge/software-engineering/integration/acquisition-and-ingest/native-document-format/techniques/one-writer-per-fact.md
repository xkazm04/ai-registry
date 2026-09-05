---
layer: technique
type: technique
subject: native-document-format
technique: one-writer-per-fact
status: forged
laws: [one-authority-per-vocabulary, derivation-names-recomputation]
shared_with: []
use_when:
  - the result a downstream consumer produces disagrees with the parameters the user set
  - document state is written twice so a second reader can understand it
  - somebody proposes a save-time synchroniser between two copies of the same state
  - deciding whether a compatibility break is worth removing a duplicate
---

# One writer per fact

A document format that serves two audiences invites a specific shortcut. The
editor's own structures hold the real state; the downstream consumer needs that
state in its own vocabulary; so the save routine writes it **twice** — once
natively for the editor, once projected into the shape the consumer reads. On
the day it is written, both copies come from the same in-memory value and the
duplication is invisible.

## Why it always drifts

The duplication is not maintained by the save routine. It is maintained by every
code path that can change the underlying value, and that set grows in every
release, gets extended by people who have never read the save routine, and
includes paths that were never intended to write documents at all — a bulk
operation, an undo, an import, a property applied to a multiple selection, a
migration of one field.

Each such path is a coin flip. Update both copies and nothing happens; update one
and the document now contains two answers to one question with nothing recording
which is authoritative. Nothing detects it, because both copies are individually
well-formed and the file opens.

The symptom is stable enough to diagnose from a support report: **the result the
downstream consumer produces stops matching the parameters shown in the interface**.
The user sets a value, the interface displays it, and what is produced reflects a
different one — because the interface reads one copy and the consumer reads the
other. The report will be filed against the consumer, and there is nothing wrong
with the consumer.

This is the failure
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
names, landing in a file rather than in an enum: two hand-maintained copies of
one vocabulary are a race with a delay fuse, and they diverge precisely when
somebody extends the vocabulary and finds only one of them.

## The rule

**The remedy for a drifting projection is deletion of the projection, not a
synchroniser. Write every fact through exactly one serializer; where a consumer
needs a different shape, it derives that shape at read time.**

The instinct to reach for synchronisation is strong and should be named so it can
be refused. A save-time reconciliation, a bidirectional observer, a test that
compares the two copies — each buys a release or two and each adds a third thing
that must be correct. None of them removes the class of defect, because none of
them removes the second copy, and the defect is the second copy.

If a derived shape must be stored anyway — because computing it at read time is
genuinely too expensive for the consumer, which is a measurement and not a
guess — then it is a cache and obeys the cache rule:
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation).
The document states, in the document, which region is derived and from what, so a
reader that disagrees knows which side to trust and a tool can recompute it. A
stored derived value with no documented recomputation path is a future
discrepancy with no arbiter, and inside a file the arbiter is never coming.

## The procedure

1. **Enumerate the facts with two homes.** For each value, name the region the
   downstream consumer reads and the region the editor reads. The list is
   normally shorter than the team fears and longer than it expects.
2. **Choose the surviving home, and prefer the consumer's.** The consumer's
   vocabulary is the published one, other tools already speak it, and a document
   whose meaning lives entirely in it is legible outside the application.
3. **Route every writer through that serializer.** Not most writers — every one.
   A single path that still writes the editor's copy directly reinstates the
   whole class, and it will be the path added next quarter.
4. **Delete the other copy and the code that maintained it.** Leaving it in place
   "for compatibility" is the same defect wearing a deprecation notice.
5. **Assert the round trip.** Save the application's state, load it back, and
   compare. This is the cheapest test in the subject and it catches an
   asymmetric serializer — a writer and a reader that disagree about one field —
   which is the residual defect after the duplication is gone.

## Costs, honestly

- **Removing a duplicate is usually a compatibility break.** Documents written
  before the change carry two copies and may carry a disagreement between them,
  and the new reader has to decide which one wins. Decide it explicitly, encode
  the decision in the reader for the old generation, and declare the break the
  way [format-generations-are-declared](./format-generations-are-declared.md)
  requires. The break is worth it: the observed result of removing a drifting
  projection is not "fewer sync defects" but a class of behaviour disappearing.
- **The single serializer becomes a bottleneck for feature work.** Everything
  that persists now goes through it, so its design has to accommodate concepts it
  was not built for. This is the correct place for that pressure — it surfaces at
  design time in one file rather than at runtime in a user's document.
- **Read-time derivation costs the consumer something.** Usually trivially, and
  it must be measured rather than assumed in the one case where it is not.

## The benefit that is not usually planned for

A document with exactly one representation of each fact becomes **editable and
generatable by anything**. Scripts can produce documents the application will
open; a person can fix one in a text editor; a batch pipeline can assemble a
thousand of them. That property is unavailable to a format with duplicated state,
because an outside writer that does not know to write both copies produces a
document with the drift defect built in from birth. It arrives free with the
deduplication and it is frequently the change's largest long-run payoff.

## Prohibitions

- **Never resolve a drift by adding a comparison test.** A test tells you the
  copies disagree; it does not tell you which is right, and it will be muted the
  first time it fires in a release week.
- **Never keep a projection because "the editor reads it faster".** Measure, and
  if the measurement holds, keep it as a declared cache with a recomputation
  path — never as a second source of truth.
- **Never let a repair tool pick a winner heuristically** and rewrite the
  document silently. A document with two disagreeing copies has lost information;
  say which reading was taken.

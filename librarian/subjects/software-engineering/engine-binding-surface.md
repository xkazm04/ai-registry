---
domain: software-engineering
subject: engine-binding-surface
last_touched: 2026-09-05
touched_by: intake
dry_streak: 0
---

# engine-binding-surface

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-05 - `/intake`, created

Born whole from one source: [[2026-09-05-rusty-v8]], a memory-safe host binding
layer over a foreign garbage-collected engine. Five techniques, three
source-tree applications, `status: forged`.

**Why it is a subject and not five techniques scattered elsewhere.** The
category held nine subjects and every one was engine-side — designing an
engine's heap, strings, bytecode, hook surface. Nothing was host-side: writing
the binding layer over an engine you did not write and cannot change.
[[engine-host-contract]] is the mirror and says so in its own opening, and the
asymmetry is the finding: that subject's author can change the contract, and
this one's cannot.

The XL trigger fired mechanically rather than by noticing — six design entries
shared one `HOME IF NEW`. Three carried `corpus: NONE` outright.

**The technique this subject exists for.** `capability-deferred-release`. The
corpus already owned release paths in [[concurrency-guards]], whose
`release-guarantees` enumerates five ways a release fails to *fire* and answers
all five with scope-bound destruction. This is the case where that answer is
complete and still wrong: the destructor fires on every path exactly as
designed, and it fires somewhere it is not permitted to act. A boundary note
inside the old technique would have sent the repair to the wrong place, so the
distinction is stated here and the old file is cited rather than edited.

**Falsifier discipline.** Each of the three entries that became the subject's
spine shows its own falsifier in a test *named after the hazard* in the source
tree. Two entries that could not answer that question are recorded untriaged in
the source note with their anchors, not landed.

**Applied on the first day**, which is unusual for a new subject:
`capability-deferred-release` → pumper, `code`, **better**, `ab-paired`, 0/1 vs
1/1. See [[applied]].

**Owed.** The two untriaged entries (an undecidable provenance check whose home
is contested with [[module-design]]'s `marked-unverifiable-region`, and a
negative-auto-trait encoding that may already sit inside
[[invariant-placement]]'s shape altitude). Neither has been read against its
candidate home. Both are single-source and single-stack, so this subject carries
reconcile debt from birth — a second binding layer over a different engine, in a
different host language, is the natural counterpart.

**Category note.** `backend-platform/language-runtime` is now at 10 of 10. The
next subject there needs a subdivision first.

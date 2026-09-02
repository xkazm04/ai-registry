---
layer: technique
type: technique
subject: branching-narrative-graph-validation
technique: graph-revision-diffing
status: forged
laws: [a-verdict-is-bound-to-its-content, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a conversation graph was edited and something downstream must be re-done, deciding what a narrative edit invalidated, re-validating a regenerated scene without redoing everything]
---

# Graph revision diffing

The named concern: compare two revisions of a conversation graph in the graph's own terms,
and derive from the comparison exactly what the edit invalidated — which findings, which
translations, which recordings, which verdicts. A line-level difference between two
serialisations answers none of that, and a single "modified" flag answers it wrongly in both
directions at once.

## Identity first, or the diff is fiction

Nothing here works unless a node's identity is stable and independent of its content, its
position and its text. Where identity is derived from the text, every edit is a delete plus
an add, the diff reports the whole scene changed, and every downstream cost is paid in full
for a fixed typo. Where identity is derived from position in a list, inserting a node
renumbers everything after it and the diff is worse than useless.

So the identity is minted once, at creation, carried through every rename and rewrite, and
never reused after a delete. Two consequences follow that authors dislike and should be held
to anyway: copying a node produces a new identity rather than a duplicate one, and a node
deleted and re-created is a new node even if it holds the identical line — because every
recording, translation and verdict attached to the old one was attached to a thing that no
longer exists.

## Classify the change by what it costs

The output of the diff is not a list of edits. It is a classification, and three classes
carry almost all of the value because each invalidates a different set of downstream work.

**Cosmetic** — text changed on a node, nothing else. Invalidates: that node's translation
units, and its recording if voiced. Invalidates nothing structural. This class must be
recognised precisely, because it is the most common edit by far and treating it as a
structural change is what makes teams re-run everything for a comma.

**Topological** — a node added or deleted, an edge added, deleted or re-pointed, an option
added or removed. Invalidates: every reachability finding, every terminal classification,
every false-choice signature. Not partially — the whole set, because these are graph-global
properties and there is no cheap way to know which of them the edit touched. Re-running them
is milliseconds, so the correct policy is to re-run them all rather than to be clever.

**State-contract** — a variable declared, deleted, retyped, or its domain changed; a guard
edited; a write added or removed. Invalidates everything the topological class invalidates,
plus every read-before-write result, plus any stored quality verdict that reasoned about
consequences — because a verdict that said "this choice matters" may now be describing a
branch whose effect was deleted.

A fourth class exists and needs its own name: **metadata**, meaning bookkeeping the pipeline
writes about itself — a produce timestamp, a job identity, a cached rendering. It must be
excluded from the comparison entirely, or every touch of the artifact reads as a revision
and the diff is discarded as noise within a week.

## What a diff must say about verdicts

A quality verdict speaks for the exact content it examined, so a topological or
state-contract change makes every standing verdict on the affected branches evidence about
the past —
[a verdict is bound to the content it judged](../../../_laws.md#a-verdict-is-bound-to-its-content).
The diff's job is to say which verdicts those are and to mark them, not to delete them: a
marked stale verdict is information about what used to be true, and a deleted one is a hole
with no record of ever having been filled.

The rendering rule matters as much as the marking. A branch whose verdict has been
invalidated must display as *unjudged since the last change*, never as its old score and
never as a blank. Both of those read as a pass to the person scanning the board, and
[unmeasured is not a pass](../../../_laws.md#unmeasured-is-not-a-pass) exists precisely for
the gap between "we know this is fine" and "nobody has looked since Tuesday".

## Diffing a regenerated graph

The hard case is not a hand edit; it is a regeneration, where a generator returns a scene
that is *entirely* new text with entirely new identities and is nominally the same scene.
The naive diff reports total replacement, which is true and unhelpful.

What is useful there is a comparison of properties rather than of content: did the ending
set change, did the declared variable set change, did the node count move outside its
budget, did any previously-passing structural check now fail, did a false choice appear
where there was none. That comparison survives a total rewrite and answers the only question
an operator has — is this regeneration better or worse than the one it replaced. Where a
regeneration is worse on a structural property, that is a reason to keep the previous
revision, and it is available in seconds without anyone reading the new prose.

## Decision rules

- **When node identity is unstable, fix that before building any diff.** Every other rule
  here is downstream of it and a diff over unstable identity produces confident nonsense.
- **When an edit is cosmetic, invalidate the translation and recording for that node only.**
  Anything wider is a real cost paid for nothing.
- **When an edit is topological or state-contract, re-run the whole structural suite.** Do
  not attempt incremental reachability. The walk is cheap and a partially-updated
  reachability result is a lie with a plausible shape.
- **When a verdict is invalidated, mark it stale and keep it.** Deleting it destroys the
  record of what was once proven and makes a regression indistinguishable from a first
  attempt.
- **When comparing revisions, exclude pipeline bookkeeping from the comparison** and keep
  that exclusion rule in exactly one place, so two code paths cannot disagree about whether
  a graph changed.
- **When a regeneration is compared to its predecessor, compare structural properties, not
  text**, and let a structural regression block the replacement even where the new prose
  scores higher.

## When not to use this

- **On the first revision.** There is nothing to compare against, and a diff against an
  empty predecessor reports the entire graph as added, which teaches nobody anything.
- **As a substitute for validating the new revision.** A diff says what changed; it does not
  say whether the result is correct. Both runs are needed, and the diff is the cheaper one.
- **On graphs assembled at runtime from smaller fragments**, where the artifact that exists
  between runs is not the graph the player walks. Diff the fragments and their assembly
  rule, or the comparison is being run against a thing that never ships.

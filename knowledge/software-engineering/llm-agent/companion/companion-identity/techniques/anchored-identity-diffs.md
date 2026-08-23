---
layer: technique
type: technique
subject: companion-identity
technique: anchored-identity-diffs
status: forged
laws: [one-validation-door, identity-survives-reuse, failure-not-empty-success]
shared_with: []
use_when: [an agent proposes a change to its own description, designing the approval surface for self-edits, a self-document is being rewritten wholesale by the model]
---

# Anchored identity diffs

The self-model is writable by the companion, and this technique is the only way
it is written. The unit of change is a small, content-anchored, human-approved
diff. There is no other operation — in particular, no operation that supplies a
new version of the document.

## The closed grammar

Three operations, and the set is closed:

- **Append** a new line under a named section.
- **Replace** one exact existing line with one new line.
- **Remove** one exact existing line.

Each carries its **anchor**: the section it applies under, and — for replace and
remove — the full existing text it expects to find. Each also carries the
**reason**: the episode, correction or observation that motivated it. A change
without a reason is not reviewable, because the approver has no way to judge
anything except whether the new sentence is agreeable in the abstract, which is
not the question.

Multi-line entries are permitted as a single logical unit only when the whole
unit is the anchor. What is forbidden is the operation whose anchor is the
document.

Two caps keep the grammar's promise, and both exist to protect the reviewer
rather than the store. **A single entry has a maximum length** — a few hundred
characters — because an operation that can paste an essay into one line has
reconstructed the whole-file rewrite one bullet at a time, and because a
self-model made of paragraphs stops being skimmable, which is the property that
makes the person willing to read it. **A single proposal has a maximum number of
changes** — a handful — because one approval decision covers the whole batch, and
a batch nobody can hold in their head is approved rather than reviewed. When
there is more to say than the caps allow, that is a signal about the pass
producing the diffs, not a limit to raise.

**A change targets a section that already exists.** The document's skeleton — its
headings, and what each is for — is authored by the human, and the companion
fills it. An operation that can create a section can restructure the document,
which is the rewrite again wearing a smaller hat, and it also removes the one
place where the person's intent about *what is worth knowing* is expressed.

## Why whole-file rewrites are excluded

A model asked to update a document will happily emit the whole updated document,
and that shape is easier to implement on both ends. It is excluded anyway,
because its costs are all deferred:

- **It is unreviewable at the granularity that matters.** The approver sees a
  wall of mostly-identical prose. The sentence that quietly did not survive the
  regeneration is invisible in it, and the approver's attention is spent
  confirming that the parts they recognise are still there.
- **It has no anchor, so it cannot detect that it is stale.** Between generating
  a proposal and applying it, the document may have changed — a correction
  landed, a parallel session appended. A rewrite silently discards that; an
  anchored diff cannot, because its anchor stops matching.
- **It severs change from motivation.** The document's history becomes a series
  of full versions, and "why do I believe this about myself" is answerable only
  by diffing two large blobs and guessing.
- **It launders authorship.** Every rewrite is a full-document authorship claim
  by a model that has just re-derived the text from its context. Sentences the
  human wrote go missing with nobody having decided to remove them, and the
  removal is indistinguishable from a rephrase.

The general form of the rule: an edit operation whose scope is the whole
document has no failure mode short of total, and therefore has no failure mode
anyone will notice.

## Anchors are content, never position

A diff addressed by line number or ordinal index is correct exactly until
something changes above it, and a companion's self-document changes constantly.
Position-keyed edits break under the operations these documents actually undergo
— insertion, section reordering, a human's hand-edit — which is
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse) applied to
a line of text: the thing being addressed must be identified by what it *is*, not
by where it currently sits.

Matching rules, in order:

1. **Exact match within the named section**, after normalising trailing
   whitespace and list markers. This is the only case that applies cleanly.
2. **Exact match found in a different section** — the document has been
   reorganised. Do not apply blind; surface it as a conflict for the person to
   resolve, because "the same sentence, somewhere else" may be a move or may be
   a duplicate.
3. **No match** — the change fails.

## A failed anchor fails loudly

The single most damaging shortcut in this technique is the fallback: when the
anchor does not match, append the new text at the end instead. It is written
with the best intentions ("do not lose the insight") and it produces a document
that slowly fills with orphaned restatements of edits that were supposed to
*replace* something — the stale line and its intended correction both present,
both stated as current, contradicting each other, with the companion reading both
into every context it reasons in.

So: a mismatch is a **failure**, spelled differently from a successful no-op
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)). It
is reported, the proposal is re-derived against the current document, and nothing
is written for that change. "Applied zero changes because the document already
said this" and "applied zero changes because I could not find what I was editing"
are different outcomes and must be visibly different, or the second hides inside
the first forever.

The unit of atomicity is the **individual change, not the batch**. Within an
approved proposal each change stands or falls on its own anchor, and the result
carries two lists — what applied and what did not, each with its reason — rather
than one boolean. Both lists are surfaced; a result that reports only successes
is how a half-applied proposal becomes indistinguishable from a whole one. When
*nothing* applied, that is an error rather than a quiet no-op, and the document is
not rewritten at all. Take a timestamped copy of the document before any write
that will change it, so an approval the person regrets is recoverable without a
version-control system they may not have.

## The approval envelope

Every diff to the self-model is human-gated. That gate is not a modal that says
"the companion wants to update its memory, allow?" — an approval surface that
does not show the change is a consent theatre that trains the person to click
through. The surface shows the operation, the anchor, the exact before and after
text, and the reason. It permits **edit before approval**, because the most
common good outcome is not accept-or-reject but "nearly right, in slightly
different words", and a system that forces rejection for that case teaches the
companion nothing.

The gate is also the **one validation door** to the document
([one-validation-door](../../../../_laws.md#one-validation-door)), and the writers
passing through it are enumerable and few: an approved proposal, the person's own
direct edit, and — where the design has one — a correction fast-path. Any code
that can reach the file without passing the door is the vulnerability, and the
test is concrete: list every path that can modify the document and name the door
each one goes through. A list that cannot be completed is the finding.

## Corrections take the fast path, and are still diffs

When the person corrects the companion outright — "that is not what I want",
"stop assuming that" — the change supersedes immediately rather than queueing
behind the review cadence, because a correction the companion keeps visibly
acting against is one it appears to have ignored. The fast path changes the
*timing*, not the *grammar*: still an anchored replace or remove, still recorded
with its reason, and the reason names the correction as operator-issued — the
highest-authority provenance the system knows, so no accumulation of later
inference quietly reverses it.

## When not to use this

Do not run high-volume observational memory through this door. Ordinary
episodic and consolidated memory has its own pipeline with its own governance,
and forcing every observation through a human-approved diff either drowns the
person or trains them to bulk-approve, which is worse than no gate because it
manufactures the appearance of one. This door is for the **self-description**:
the small, slow-moving, high-blast-radius document. If the queue is busy, the
correct response is that too much has been classified as identity — not that the
gate should widen.

---
layer: technique
type: technique
subject: conversation-orchestration
technique: recall-transparency
status: forged
laws: [count-carries-predicate, unknown-is-not-a-value]
shared_with: []
use_when: [a companion answers from memory the user cannot see, a grounding badge that cannot be opened, deciding what a turn will be remembered as]
---

# Recall transparency

A companion with continuous memory grounds most turns in things the user said
on another day. When the grounding is right it is the entire product — the
reason talking to this thing beats talking to a blank one. When it is wrong, the
model answers a question the user did not ask, in a confident voice, with no
visible cause. The user's only available diagnosis is "it misunderstood me",
which is false and unfixable: it understood perfectly and recalled the wrong
thing.

This technique makes the recall visible in both directions — **what this turn is
about to spend**, and **what this turn will leave behind** — because those are
the two moments where a wrong memory is still cheap to correct.

## Forward disclosure: before the turn spends it

The canonical form is a compact strip attached to the composing or running turn,
naming what was pulled into context. Its rules:

- **It appears while the turn is in flight**, not only after settlement. Recall
  as accounting on a finished turn is legitimate and belongs to the transcript's
  metadata strip; recall as *correction* has to arrive while correcting is still
  cheaper than re-reading the answer.
- **It is inspectable, not indicated.** A strip reading "grounded in three
  memories" asks the user for trust while withholding the evidence, and
  grounding disclosure exists precisely for the moments trust is in question.
  Opening it names the items — the actual remembered sentence, when it was
  learned, from which conversation.
- **Every number carries its predicate**
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
  "Three memories" out of what — three of three matched, or the top three of
  forty above a threshold? The strip may abbreviate; the opened view states the
  selection rule, because a user who sees "3" and later learns the retriever
  considered forty has been misled about how much the companion knows.
- **It is quiet.** This is disclosure, not content. A recall strip that competes
  with the conversation for attention gets collapsed by the user permanently,
  and a permanently collapsed disclosure discloses nothing.

## The correction door

Visibility without recourse is decoration. Each disclosed item carries at least
one action — *this is wrong*, *this is not relevant here*, *forget this* — and
the action reaches the memory store's own governed write path rather than
mutating a display copy. What the store does with the correction (down-weight,
tombstone, delete, ask for confirmation) is the memory subject's decision; what
this technique requires is that the door exists and is one interaction from the
place the user noticed the problem.

The correction is also the highest-quality signal the memory system will ever
receive, since it comes from the only party who knows the truth. Losing it
because the disclosure was read-only is a design error, not a missing feature.

## Absent recall and unknown recall are different

A turn that retrieved nothing shows nothing, or shows "answered without
memory" where the product's honesty bar is higher. A turn whose retrieval
record was lost — an older exchange from before the disclosure existed, a
migration, a failure in the retrieval path itself — must not render as the
former ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
"No memories used" and "we do not know what was used" are different facts, and
collapsing them tells the user the companion answered from nothing on precisely
the turns where it may have answered from anything.

## Backward disclosure: the turn-summary chip

The mirror image of the recall strip is the **summary chip**: a short line
attached to the settled exchange, naming what the turn left behind. A companion
turn leaves two kinds of residue and the chip covers both.

The first is **memory**: how this exchange will be remembered — not a transcript
of it, but the compressed form the memory system will actually carry forward and
re-inject.

The second is **side effects**: what the turn did besides speak. A companion
that may act without asking — raising an approval, navigating the interface,
starting a job, writing a note — produces consequences that are invisible in the
prose, and the chip is where they become countable and clickable. A turn with no
residue of either kind shows no chip at all; most conversational turns are pure
prose and chrome on all of them teaches the user to stop seeing it.

It is worth the space for three reasons. It makes the compression visible while
the original is still on screen, which is the only moment the user can judge
whether the summary is faithful. It gives the correction door something to act
on before the summary hardens into next week's grounding. And it teaches the
user, cheaply and continuously, what kind of thing this companion remembers —
which is the fastest way to make someone comfortable with a system that
remembers.

Two rules keep it honest. The chip shows **what will be stored, after any
redaction or compression**, not a hopeful paraphrase composed for display; a
chip that flatters the summary is worse than no chip, because it certifies a
record the user never saw. And the chip is **editable or dismissible** — a user
who says "do not remember this" is exercising the most important control in a
memory product, and it must not be buried in settings.

## Where this ends and the memory subject begins

This technique owns the window: what is shown, when, at what altitude, and what
the user may do from it. It owns none of the mechanism behind the glass —
scoring, embedding, decay, consolidation, the storage schema, the write
validation — all of which belong to the memory subject and are reached through
its own doors. The test for a boundary violation is simple: if this surface
computes anything about a memory beyond how to display it, it has reimplemented
a slice of the store and will drift from it.

## When not to use this

- **When the companion has no persistent memory.** Disclosing an empty
  retrieval on every turn trains the user to ignore the strip, and the strip is
  needed later.
- **When the recalled context is not user-authored.** Product documentation and
  static instructions pulled into the prompt are provenance, not memory; they
  belong in the settled metadata strip, which is where a reader looks for "what
  produced this answer".
- **When the surface is the ambient one.** A recall strip is reading material,
  and reading material belongs in the conversation by the routing rule.

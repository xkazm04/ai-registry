---
layer: technique
type: technique
subject: conversation-orchestration
technique: recall-transparency
status: forged
laws: [count-carries-predicate, unknown-is-not-a-value]
shared_with: []
use_when: [a companion answers from memory the user cannot see, a grounding badge that cannot be opened, deciding what a turn will be remembered as, a recall strip that quotes the user's own words back at them]
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

## Surfacing is a filter, and it is not the retrieval filter

The naive strip renders whatever the retriever returned. It reads, on a live
product, like this: *remembered: "Please prepare a digest of today's queue…"* —
the user's own instruction, from four minutes ago, quoted back at them as though
it were knowledge. Every such chip is a small withdrawal from the credibility of
the feature, and a user who has seen three of them has learned that the strip
means nothing.

So a **surfacing pass** sits between what was retrieved and what is shown.
**Storage is never filtered** — every item is written and indexed regardless,
because the store is the substrate everything downstream is consolidated from,
and narrowing it to what happens to look presentable corrupts it for every future
turn. What this pass narrows is the showing, and it drops three things:

- **Near-echoes of the current message.** An item whose text sits inside the
  query, or whose tokens the query already largely carries, is the user's own
  words returning. This is the dominant case rather than an edge one, because a
  companion that records the incoming message as an item before retrieving has
  just made it the closest thing in the index to itself. Compare
  **directionally** — what fraction of the *item's* tokens the query already
  carries, not the symmetric overlap — since a long query assembled from many
  terms would otherwise dismiss its single most grounding memory as an echo of
  itself.
- **The user's own bare commands from the same day.** A request is a thing asked,
  not a thing learned, and it grounds nothing when it comes back a minute later.
  Two qualifications keep the rule from over-reaching. A command from *another*
  day may legitimately ground the answer and simply is not worth a chip — a
  different disposition from being excluded. And a sentence that *opens* like an
  instruction while stating a standing preference ("always put the local roles
  first") is a fact about the user, which is precisely the most valuable thing
  the store holds; recognise those explicitly, or the filter deletes its own best
  material.
- **Anything with nothing insight-like in it.** The item still grounds the
  answer; it contributes no chip.

Where the same predicate would also usefully narrow what is *injected* — an echo
of the current message wastes recall budget as surely as it wastes a chip — that
half of the decision belongs to the memory subject's injection stage and is
stated there. This technique owns the window, and a surfacing pass that quietly
becomes the retrieval policy has crossed the line described at the end of this
file.

## A chip reports an insight, not an excerpt

What survives is not shown raw. Each surviving item yields **one short derived
sentence** — its first sentence, stripped of role prefixes and markup, capped at
roughly a line — and that is what the chip prints. Derive it **mechanically,
inside the same turn**: a chip that costs a second model call is a chip that gets
switched off the first time latency is measured, and the summary that would buy is
not worth a round trip.

Cap the strip at about two chips. The disclosure competes with the answer for the
same attention, and the third chip is where a user starts reading past the whole
row.

**When nothing insight-like was used, show nothing.** An empty strip is the
honest rendering of a turn that recalled things which taught the reader nothing
new, and it is a different claim from the turn that recalled nothing at all —
which the section above already separates from the turn whose recall record was
lost. Padding the strip so it is never empty converts a signal into furniture.

Note the asymmetry with the prompt, which is deliberate. The **instruction** tells
the model to weave a memory into the prose as one natural sentence — *"yesterday
this queue was 16"* — and never to block-quote the past back at the user, because
recalled text reproduced verbatim inside an answer reads as a machine reciting a
log. The **chip** is the audit trail for exactly that: it names what was used so
the woven sentence can be checked, which is why it may be terse where the prose
must be natural.

One consequence of shipping this after the fact: turns recorded before the derived
insight existed carry none, and therefore correctly render no chip. Backfilling a
raw excerpt into them to make the history look uniform would reintroduce the
defect in the one place nobody would think to look for it again.

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

The surfacing pass above sits exactly on that line. *Which* items are retrieved
and injected — the tiers, the budgets, the ranking, the packing — is the memory
subject's, and this technique does not own any of it; the pass owns only which of
the items already chosen are worth showing, and how each is reduced to a line.
Two symptoms tell you it has drifted across: it starts scoring items rather than
formatting them, or it becomes the only place a retrieval rule is written down —
at which point the memory subject has an injection policy it cannot see, living
in a display component.

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

---
layer: technique
type: technique
subject: agent-memory
technique: episodic-capture
status: forged
laws: [identity-survives-reuse, creation-names-reaper]
shared_with: []
use_when: [deciding where one episode ends and another begins, episodes ballooning into a second transcript store, two writers claiming the same sequential id, a model swap silently thins what capture writes down, one oversized item crowds a distillation batch]
---

# Episodic capture

An episode is a bounded record of something that happened: an exchange, a task
run, an outcome, a correction. It is the middle layer's unit — durable enough
to outlive the session, humble enough to claim only "this occurred", never
"this is true". Episodes are the evidence layer that consolidation distills
and provenance cites; get their shape wrong and everything downstream is
built on mush.

## Boundaries are events, not clock ticks

The first design decision is what closes an episode, and the answer is:
**meaningful boundaries in the work, not intervals in time**. A task
completing or aborting. A conversation reaching a lull or a topic shift. An
outcome landing — success, failure, or a human correction. A clock-sliced
record ("everything from the last ten minutes") cuts through the middle of
meaning: the question in one slice, its answer in the next, the correction in
a third, and no slice can be judged on its own.

The test for a good boundary: the episode can be **summarized in one
sentence with an outcome** ("attempted X, hit constraint Y, resolved by Z").
If the candidate record needs three outcomes, it is three episodes; if it has
none, it is not yet an episode — it is working state still in flight.

## Bodies are distilled; raw evidence is pointed to

An episode carries two things with different jobs:

- **A distilled body** — participants, intent, what happened, outcome, and
  the few load-bearing specifics (the constraint discovered, the decision
  and its reason, the exact words of a correction). Written at capture time,
  while context is cheap, at the altitude consolidation will need: claims
  about the event, not a replay of it.
- **A pointer to the raw source** — the transcript span, the run log, the
  artifact — for the rare consumer that needs to re-litigate what actually
  occurred.

The temptation resisted here is copying the raw material *into* the episode
"to be safe". That builds a second transcript store wearing episode
formatting, and every downstream budget (consolidation reading, recall
injection, retention) pays for the bulk forever. The inverse temptation —
storing only a pointer with no distilled body — is worse: it makes
consolidation re-read raw logs to extract meaning, which means the expensive
judgment is deferred to every future reading instead of performed once at
the one moment the context was already warm.

Excerpts are the honest middle: when specific wording is load-bearing (a
correction, a commitment, a quoted requirement), the episode quotes it
verbatim, bounded, inside the distilled body.

## The distiller is the ceiling, and it starves quietly

Whatever intelligence writes the distilled body sets an upper bound on what
the store can ever recall. Retrieval ranks over bodies; the raw pointer is
consulted only by the rare consumer that already suspects something is
missing, which is exactly the suspicion a thin body never raises. A weak
distiller therefore does not fail loudly: it writes fewer and thinner claims
per event, every downstream stage operates normally on what it is given, and
the store starves with no symptom visible at any single read. Where this has
been measured, swapping only the distilling model collapsed end-to-end answer
quality, and the collapse was visible at ingest -- several times fewer claims
extracted per event -- long before any consumer felt it. Two obligations
follow:

- **Instrument the distiller's yield.** Claims per captured event, tracked
  as a health series, is the one place this failure shows up early. A drop
  after a model or prompt change means the store is going blind, not that
  the world went quiet.
- **Price the write path in the open.** Judgment at capture time is priced
  per event and recurs for everything the system ever experiences -- orders
  of magnitude above mechanical recording of the same material. It is a
  legitimate trade (it buys cheap, precise reads), but it is a bill that
  scales with lived history, decided once and paid forever; a design that
  puts reasoning on the write path should state the per-event spend it has
  accepted. This pipeline's own answer is the generous-capture /
  strict-consolidation split: distill lightly at the boundary while context
  is warm, and defer the expensive judgment to the batched pass, where its
  cost is amortized over a window instead of charged per event.

## The batch is the ceiling's other half

Distiller strength is the input the model vendor controls. There is a second
input to the same ceiling that the designer controls entirely: **how much
material the pass is handed at once.** Over-stuff a distillation batch and
claims per unit of content fall — the same starvation symptom as a weak
distiller, arriving from the opposite cause, and therefore needing the
opposite fix. Reading "few claims per event" as a model problem when it is a
batch-size problem buys an expensive upgrade that changes nothing.

What degrades first is not the claims but the judgments *between* them.
Deciding that two events belong together, that one supersedes another, that a
third is the second sighting of a pattern — these are cross-item calls made by
the same pass that is running out of room, and they are what a crowded batch
drops first. This holds whatever shape the consolidated store takes: a flat
store still needs supersedence detected, and supersedence is a cross-item
judgment. The store's topology is optional; the pass that would have noticed
is not.

The control surface is two caps, not one:

- **A batch cap** — total material per pass — which is the budget everyone
  remembers to set.
- **A per-item cap** — the most any single item may contribute to that budget
  — which is the one that decides whether the budget is *shared*. Without it,
  one pasted wall of text consumes the pass and every other item in the window
  goes unheard.

The second cap matters more than its size suggests, because the items it
protects vanish by default. A batch reports what it distilled, and nothing
names what it crowded out unless the packer is built to say so — so an
over-stuffed pass reads, from every downstream surface, exactly like a quiet
week. Instrument accordingly: claims per event catches the weak distiller, and
**items admitted against items eligible** catches the crowded one — the same
[count-carries-predicate](../../../../_laws.md#count-carries-predicate)
obligation recall already owes. Two numbers, two different diseases, and the
store dies of either.

**Overflow defers; it does not drop.** A cap that discards what it could not
fit converts a budget into a hole in the record, and the hole is permanent
because nothing downstream knows to look for it. The honest packer bounds the
*pass*, not the *history*: it keeps the overflow ordered, hands the next pass
the boundary it stopped at, and says which end it dropped from. Then a crowded
batch costs latency rather than memory, and "capped" and "lost" stay different
words. A packer that defers can also afford to be strict, which is what makes
the per-item cap safe to set aggressively.

Two independently built systems have converged on the same per-item excerpt
cap for this reason, which is weak evidence for any particular number and
strong evidence for the shape.

## Capture is generous; judgment is deferred

Write pressure at this layer is deliberately loose. Recording an episode is
cheap; the expensive resources — belief-store space and recall budget — are
guarded downstream by consolidation and decay. Importance *at capture time
is a guess*: the aside that seemed trivial becomes the key to a pattern
three weeks later, and the dramatic incident consolidates into nothing. So
the capture criterion is roughly "would a one-sentence summary of this be
non-empty?", and the layer relies on consolidation to be the strict judge
and on retention caps to bound the total.

Generous is not unconditional. Two filters apply at the door:

- **No pure mechanics.** Heartbeats, routine polling, uneventful
  housekeeping — records with no outcome distinguishable from their absence.
- **Sensitivity screening at write time, not read time.** Material that must
  not persist (secrets, content the human marked ephemeral) is excluded
  when the episode is written. A store cannot un-remember at read time;
  every future consumer would have to repeat the filter forever.

## Identity and immutability

Every episode gets an **identity minted at creation** — not its timestamp
(concurrent captures collide), not its position in a sequence (retention
pruning reorders), not a content hash (near-duplicate events are distinct
occurrences). Provenance links from consolidated beliefs point at these ids
for the life of the belief, so the id must survive every operation the store
undergoes — pruning, archival, export, re-import — per
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse).

One exception is real and worth stating precisely, because it is where the
rule is most often broken accidentally. A store that humans read and edit
directly — an append-only ledger of records, ordered for a reader — has a
genuine reason to want a **monotonic, human-readable number** rather than an
opaque identity. That is allowable *only* if allocation is atomic. The naive
implementation reads the current maximum, adds one, and writes; with two
writers — two agents, or an agent and a human — both compute the same next
number, and the second write **silently destroys the first**. The loss is
total, unlogged, and lands in the one store whose entire selling point is that
it never loses anything.

The fix is an exclusive-create allocation with retry: claim the identity by a
create-if-absent write that fails when the identity is taken, and on that
failure re-read the maximum and retry, bounded, with an explicit error if the
bound is exhausted. State it as a rule — **an identity derived from the
current contents of the store must be claimed atomically, or the store has a
silent write-loss race** — because "read the max and add one" is what everyone
writes first, and it works perfectly until the day the store has two writers,
which is the day it was built for.

Episodes are **records, and records do not get edited**. When an episode
turns out to describe events wrongly, the correction is a *new* episode that
references the old one; when a belief derived from it is wrong, supersedence
at the consolidated layer handles it. An editable history gives the system a
way to have always been right, which is precisely the property an evidence
layer must not have. The narrow exception is redaction — removing sensitive
content that escaped the write-time screen — which is an audited removal,
not a rewrite: the episode visibly carries the fact that redaction occurred.

## Retention is declared at the layer, not discovered in panic

Episodes are created continuously, so the layer declares its reaper up front,
per [creation-names-reaper](../../../../_laws.md#creation-names-reaper): a
retention horizon and caps, with one structural rule that overrides both —
**an episode cited by a live belief's provenance does not silently vanish**.
Pruning such an episode either archives it (retrievable, off the hot path)
or forces the belief question first: demote or re-ground the belief, then
reap the evidence. The mechanics live in
[decay-and-forgetting](./decay-and-forgetting.md); the capture layer's
obligation is to write episodes whose ids and grounding make that discipline
possible at all.

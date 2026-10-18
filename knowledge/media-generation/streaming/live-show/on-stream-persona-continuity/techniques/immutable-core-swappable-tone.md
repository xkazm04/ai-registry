---
layer: technique
type: technique
subject: on-stream-persona-continuity
technique: immutable-core-swappable-tone
status: forged
laws: []
shared_with: []
use_when: [writing the identity documents of a generated live host, deciding whether a persona line belongs in the core or in a tone layer, giving an optimiser or tuning pass write access near a persona]
---

# Immutable core, swappable tone

A live persona is split into two kinds of document that differ in **who may change
them and when**. The core is what the character is and cannot change while the
show is running. The tone layers are how the character sounds and are swapped
freely, one active at a time. The split exists because a single blended persona
document has no answer to the question "who is allowed to edit this?", and on a
live show everybody is trying to.

## The layers

- **The core** (a constitution) holds the values, the stance towards the
  audience, the hard lines, the voice invariants that make the character
  recognisable in any register, and the precedence order of every other layer.
  It is short, because everything in it is load-bearing, and it is written in
  rules rather than adjectives.
- **The bible** holds the character's elaboration: history, relationships,
  running bits, the world it speaks from. It is richer and changes more often,
  and it states in its own first lines that the core outranks it.
- **A tone layer** holds one register: a comic engine, a pace, a vocabulary
  temperature, example lines. Several exist; exactly one is active per stream
  or per experiment arm. A tone may colour every line and may not add or remove
  a rule.

Every in-band actor is denied write access to the core: viewers, votes and
purchases, tone layers, tuning and reconciliation passes, memory consolidation,
and any text the model produces about itself. The owner edits it out of band, as
a versioned change, and the running system treats the core it started with as
fixed for the stream.

## The test for which layer a line belongs in

Ask whether a wrong value would be **corrected by the ordinary operation of the
show**. A tone that lands badly shows in tonight's measurements and is retired; a
bible detail that contradicts itself surfaces as a confused reply and is fixed in
review. A core clause that has been softened governs every turn, including the
turns that would have exposed it, and nothing in normal operation surfaces it.
When a line could plausibly sit in either, put it in the core: the cost of
over-constraining is a character that is slower to tune, and the cost of
under-constraining is a character that changed without anyone deciding it should.

Hard lines, the safety rules the character obeys, and the stance towards the
audience always go in the core, because they are exactly the things a room, a
sponsor or a metric will try to move.

## Procedure

1. Write the core as rules with a stated purpose each. Adjectives ("menacing",
   "witty") belong in the bible or a tone; the core says what the character
   does and never does.
2. State precedence inside the core and repeat the subordination at the top of
   each lower document. The model reading them together is what resolves
   conflicts, so the order must be in the text it reads.
3. Make the core immutable to the running system mechanically, not by
   convention. Any automated pass that proposes persona changes goes through a
   verifier that works from an **allowlist** of what tuning may touch (the bible
   and the tone layers) rather than a denylist naming the core, because a
   denylist is defeated by the first rename, relative path or new file. The
   verifier refuses a proposal that names the core anywhere, deletes or renames
   a file, or does not apply cleanly to the file as it stands now, so the owner
   is never shown a change that cannot land, and it drops any cited evidence that
   does not resolve to a real transcript line.
4. Give every tone the same shape (register, engine, examples, what it must not
   do) so that tones are comparable and one can be swapped for another without
   touching anything else.
5. Keep one tone as the **control**: the baseline register that every other tone
   is measured against and that the show falls back to.

## Decision rules

- **When an optimiser finds that a core change would move a metric**, the finding
  goes to the owner as a proposal with its evidence; it is never applied, and the
  verifier that guards the core rejects it regardless of its score.
- **When a tone needs a rule to work** (a roast-heavy tone that only lands if a
  hard line is relaxed), the tone is wrong, not the core.
- **When the audience asks the host to change who it is**, the answer comes from
  the core, in character, and the request is data about the room, never input to
  the persona.
- **When the bible and the core disagree**, the core wins at runtime and the
  bible is corrected in review; a contradiction left standing teaches the model
  that the core is negotiable.
- **When the main model path fails over**, the fallback composes the same core,
  bible and tone. A cheaper path may perform the character less well; it may
  not perform a different one.

## When not to use it

A one-off generated narrator for a recorded piece, reviewed take by take, does not
need an immutable core; a human is the gate. The split earns its cost when output
airs unreviewed and the character persists across sessions. Nor is this the place
for a persona that should legitimately evolve through its relationship with one
person: that is a companion's self-model, governed by consent, and a different
design.

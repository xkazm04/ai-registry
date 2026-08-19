---
layer: technique
type: technique
subject: short-form-narrative-structure
technique: but-therefore-beat-linking
status: forged
laws: [causality-over-sequence]
shared_with: []
use_when: [auditing a drafted beat list, converting research notes into a script spine, reviewing a generated script before prose-level notes]
---

# BUT/THEREFORE beat linking

The mechanical test that separates a story from a list. Lay the beats out as
one-line claims. Between every adjacent pair, say the connector out loud: if
the honest connector is **"therefore"** (consequence) or **"but"**
(complication), the pair is linked; if the only honest connector is **"and
then"**, the pair is a defect. The test is binary, runs in seconds per pair,
and requires no taste — which is exactly why it belongs at the front of any
review, human or automated, before anyone reads a word of prose.

The power of the test is that it is *rearrangement-complete*: the same facts
that fail it can usually pass it. "Created in 2008, and then it uses a
blockchain, and then miners validate, and then supply is capped" carries the
identical information as "digital money had one unsolvable problem — you
could copy it; **therefore** every attempt needed a bank; **but** a bank is
what you were trying to avoid; **therefore** the real invention is a ledger
with no one in charge." Only the second gives a reason to keep watching. A
failed pair is never evidence the facts are wrong; it is evidence the causal
relationship between them has not been found yet.

## Procedure

1. Reduce the script (or plan) to one-line beat claims. Prose hides "and
   then" behind rhetoric; claims cannot.
2. For each adjacent pair, assign the honest connector. Honest means true of
   the *relationship*, not present in the wording — strong scripts rarely
   write the connectors out, and a low count of literal "but"s proves
   nothing either way.
3. For each AND-THEN pair, apply exactly one of three repairs:
   - **Merge** — the two beats were one claim split cosmetically.
   - **Reorder** — a causal chain exists but the beats sit in
     chronological or taxonomic order instead of causal order.
   - **Bridge** — find the missing beat that makes one cause the other.
     This is the most common repair and the most valuable: the missing beat
     is usually the *mechanism*, which the expert writer skipped because it
     was obvious to them.
4. Re-run until zero AND-THEN pairs remain, or until each survivor is a
   deliberate, named exception (a hard act boundary can tolerate one; the
   interior of an act cannot).

## Decision rules

- **When a pair resists all three repairs, cut a beat.** A fact that cannot
  be caused by its neighbor and cannot cause its neighbor is answering a
  question nobody asked; it belongs in another piece.
- **Alternate the connectors.** A chain of pure "therefore" is a lecture
  that never surprises; a chain of pure "but" is exhausting whiplash. If an
  act runs more than four or five consecutive same-type links, look for the
  complication (or consequence) being suppressed.
- **Run the test before any other review.** Notes on prose, pacing, or
  visuals against a beat list that fails this test are notes on a script
  that is about to be restructured; they will not survive the repair.
- **In a generation pipeline, make the connector explicit data.** Each beat
  carries its declared link to the previous beat, and AND-THEN is rendered
  as a defect, not a style choice. What the writer must assert, the tool
  can then check.

## When not to use it

- **Non-narrative formats.** A reference listicle, a countdown, or a
  catalogue is honestly a list; forcing causal connectors onto genuinely
  parallel items produces fake causality, which viewers smell. The test
  tells you the format is a list — believe it, and either accept the
  format's weaker retention or find the tension that makes it a story.
- **Within a single beat.** The test governs relationships between beats;
  sentence-level flow inside a beat is a prose concern, and applying the
  test there produces choppy, over-signposted narration.

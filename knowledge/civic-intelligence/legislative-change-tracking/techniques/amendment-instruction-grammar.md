---
layer: technique
type: technique
subject: legislative-change-tracking
technique: amendment-instruction-grammar
status: forged
laws: [deterministic-code-owns-numbers, incident-anchored-doctrine]
shared_with: []
use_when:
  - deciding whether a bill actually amends a provision
  - filtering incidental provision mentions from amendment claims
---

# Amendment instruction grammar

An amendment instruction says what to DO to a provision; a citation merely
points at one. "In § N, paragraph 2, the words … are replaced by …" is an
instruction; "pursuant to § N" is a citation. The entire honesty of a
provision-level amendment graph rests on telling these apart — and the reason
this is a technique rather than a judgment call is that novelization drafting
is a **small closed grammar**. Legislative drafting manuals prescribe a fixed
set of operative formulas (insert, replace, repeal, renumber, append), so the
discrimination is decidable by deterministic pattern code, reviewable and
regression-testable, rather than delegated to a language model whose verdict
cannot be audited.

## Procedure

1. **Enumerate the operative formulas from the jurisdiction's drafting
   convention.** They cluster into a handful of shapes: "in § N …" (edit
   inside a provision), "§ N reads:" / "§ N is repealed" (whole-provision
   replacement or deletion), "after § N a new § is inserted" (§ N as an
   insertion anchor), and "§ N's paragraphs/words/letters are …" (structural
   edit without the leading preposition). Build one pattern per shape,
   parameterized by the provision number, with the number regex-escaped.
2. **Anchor every pattern to the start of a clause.** An instruction opens
   its clause — start of line, after an item number ("12."), after a sentence
   break, or after an article label. A citation sits mid-sentence, after a
   preposition. Without the anchor, "pursuant to § N" matches the "in § N"
   shape and the incidental class floods back in.
3. **Run the grammar over operative text partitioned to the target statute**,
   never over the raw document — otherwise instructions aimed at one bundled
   statute are credited against another (see the collision technique for the
   partitioning).
4. **Validate against a hand-read sample in both directions** — false
   accepts (citations that matched) and false drops (genuine instructions
   that did not) — before trusting the grammar over a corpus.

## The incident behind the anchor set

The clause-anchor list must include the article label ("Art. N") as a valid
clause opener, and the reason is an earned one: text extracted from published
documents frequently renders an article label and its first instruction on a
single physical line ("Art. VI In § 8 paragraph 2 of statute no. …"). A
grammar anchored only to line starts and sentence breaks reads every
single-article amendment — the most common bill shape in the corpus — as
citation-only. In the validation run that surfaced this, that one missing
anchor produced *all* of the false drops: three genuine amendment findings
would have been silently discarded. The lesson generalizes: the grammar is
closed, but the *typography* of extracted text is not, and every anchor in
the set should be traceable to a measured miss, kept as a fixture.

## Decision rules

- **When a provision number matches no instruction form, it is a mention,
  not an amendment** — exclude it from the graph and from collision input,
  however prominent it looks. The dominant false-positive classes are the
  bill's own internal article numbers (a bill proposing a *new* act has its
  own § 15, which is not anyone else's § 15) and cross-references to a
  provision a sibling bill genuinely amends.
- **When instructions name sub-units (paragraphs, letters), capture them** —
  including ranges and enumerations ("paragraphs 1 and 3", "2 through 4").
  Two bills editing different paragraphs of one § is a weaker collision than
  two bills editing the same paragraph, and the grammar is the only place
  that granularity can be recovered.
- **When the grammar cannot determine the sub-unit, report "the provision as
  a whole or undeterminable"** — an empty set with a meaning, not a guess.
- **When a new operative formula appears in the wild** (drafting conventions
  evolve), add it to the one shared grammar with the example that forced it,
  and re-run the validation sample — never patch a private copy at one call
  site.

## When not to use it

Do not apply the grammar to consolidated-text documents that show the current
law with marked changes — those are *depictions* of the post-amendment state,
not instruction lists, and the formulas will not appear; use the whole
document as amendment evidence at the statute level instead. Do not use the
grammar across languages or jurisdictions without re-deriving the formula
set — the closed grammar is closed *per drafting convention*. And do not let
the grammar's verdict stand in for legal analysis of what the amendment
*means*: it establishes that provision N is operated on, nothing about the
substance or effect of the operation.

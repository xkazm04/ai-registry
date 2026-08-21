---
layer: technique
type: technique
subject: visual-script-to-code-transpilation
technique: plain-language-jargon-layer
status: forged
laws: [a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a tool sits between a designer audience and an engineering audience, writing a glossary for engine or graph vocabulary, a generated artifact is correct but unreadable by the person who must approve it]
---

# Plain-language jargon layer

Any tool that sits between two audiences owes both of them an explanation layer, and
that layer is a **first-class deliverable**, not documentation debt. A graph-to-code
transpiler has two readers who share no vocabulary: the designer who authored the
graph and does not know the engine's code-side terms, and the engineer who owns the
result and does not know the graph's node vocabulary. Hand either of them the other's
words untranslated and the review that was supposed to happen does not happen — it is
replaced by an approval.

## The rule that makes a glossary useful

**An entry explains the consequence, not the expansion.** "This flag means the value
survives being saved and reloaded" is an entry. "This flag stands for *serialize
persistent*" is a restatement that helps only the reader who already knew. The
expansion of a term is available to anyone with the reference manual; what is not
available is what changes about the world when the term is true.

The same instinct governs quantities: a value handed across a boundary without the
basis it was computed under is not information. A term handed across an audience
boundary without its consequence is the same failure in words.

Test each entry by asking: *after reading this, can the reader predict a difference in
observable behaviour?* If not, it is a definition, and definitions are the failure
mode this technique exists to prevent.

## Two layers, deliberately

**Layer one — for the non-engineer.** Covers the code side: property visibility and
persistence flags, the terms that mean "this appears in the editor", "this is saved",
"this is sent to other machines", "this can be called from the graph". Written in
consequences a designer can act on. The reader's question is always the same: *does
this change what I can do, or what the player sees?*

**Layer two — for the engineer who does not author graphs.** Covers the graph side:
what a particular node kind actually does, which nodes span frames, which are pure and
may be evaluated more than once, what the graph's event vocabulary hides. The reader's
question is: *what did the designer mean by this, and what does it constrain in my
code?*

The layers are separate because the audiences fail differently. Merging them produces
a document each audience reads half of, badly.

## Procedure

1. **Derive the term list from what the tool actually emits and consumes**, not from
   the engine's manual. If a specifier never appears in generated output and never
   appears in an exported graph, it does not earn an entry — coverage of the manual is
   not the goal, coverage of the seam is.
2. **Give each entry two fields: what it does, and why it matters.** One sentence each,
   the second optional. The split is not cosmetic — it forces the author to separate the
   behaviour from the reason anyone should care, and an entry where the second field
   cannot be written is usually an entry about a term nobody needed.
3. **Derive the narration from the structured result, never from the rendered output.**
   The layer that explains a generated artifact reads the same typed record the emitter
   produced — the parsed members, the resolved events, the classified diff findings —
   and narrates from it. An explainer that scrapes the emitted text is a second parser
   of your own output, and it goes stale the first time the emitter's formatting
   changes, silently and in the direction of confident wrongness.
4. **Write each entry as one consequence sentence, optionally one caveat sentence.**
   Longer entries are not read. If an entry needs a paragraph, the term is probably two
   terms.
5. **Name the audience per entry** and let the same term carry different entries in
   each layer where it genuinely means different things to them.
6. **Surface the entry where the term appears**, in the diff report, the generated
   comment header, the review prompt. A glossary in a separate document is consulted by
   people who already suspect they are confused; the useful placement is inline, at the
   moment of encounter.
7. **Single-source it.** The glossary that renders into the tool's output, the one the
   review prompt injects, and the one in the handbook are one artifact rendered three
   ways. A term explained twice will eventually be explained inconsistently, and the
   inconsistency is invisible from either copy.
8. **Track uncovered terms as a measured gap.** Terms appearing in output with no entry
   are a countable number; an unwritten entry must read as missing, not as unnecessary.

## Decision rules

- When a term's consequence depends on context (a flag that means one thing on a
  property and another on a function), write two entries. A hedged single entry is
  worth less than either.
- When you cannot state a consequence, do not write the entry. An entry that says "this
  configures the behaviour of the system" trains readers to skip the glossary, which
  costs more than the missing entry.
- When the two layers disagree about a term, that disagreement is real information
  about the seam — surface it, do not average it away.
- When an audience stops reading the layer, treat it as a defect in the layer, not in
  the audience.

## When not to use this

A tool with one audience does not need it; internal jargon among peers is efficient and
translating it is waste. It is also the wrong instrument for teaching a system's
architecture — a glossary explains terms one at a time and cannot carry a mental model.
When readers need the model rather than the vocabulary, write the model; the glossary is
what keeps them from stalling on a word while reading it.

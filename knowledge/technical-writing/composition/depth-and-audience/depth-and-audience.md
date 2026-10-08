---
layer: golden-path
type: golden-path
subject: depth-and-audience
status: forged
use_when: [deciding who a technical article is for and how deep it goes, revising a draft that reads as flat or as a glossary, writing a brief that names the audience for a drafting agent, raising the depth of a post without making it longer]
techniques:
  - term-in-a-clause
  - four-layer-depth
  - depth-by-replacement
  - non-obvious-detail-selection
---

# Depth and audience

Every technical article is written for two readers at once whether the author intends it
or not: the practitioner who already knows the field and came for something they did not
know, and the newcomer who is willing to work but lacks the vocabulary. The naive resolution
is to write for the newcomer and hope the expert tolerates it. It produces the most common
defect in technical posts: **flat content**, correct and accessible and empty, a page of
definitions that an expert leaves in the first minute and a newcomer finishes without being
able to do anything new.

A principal practitioner resolves it the other way round. **Simple words, hard ideas.**
Vocabulary is made accessible cheaply, by explaining a term of art in a clause and moving
on; the space this saves is spent on the material only an expert would have known to ask
for: the mechanism, its production consequences, its limits and what it means. The
newcomer is carried by the clauses and the figures; the expert is held by the substance.
An essayist's case for simple writing makes the same split: readers whose command of the
language lags their command of the ideas need plain words precisely *because* the topic is
hard, and the less energy they spend on the prose, the more they have for the ideas.

## The depth ladder

A section reaches depth by climbing four rungs, and a flat section usually stops at the
first. See four-layer-depth.

1. **Mechanism**: why the thing behaves the way it does, at the level of the rule that
   produces the behaviour (merge order, eviction policy, the composition rule in a
   standard), not the level of its symptoms.
2. **Production consequence**: what changes in a real system because of it: budgets,
   cache keys, routing tables, evaluation per segment, quotas.
3. **Limits**: where the effect does not apply, is shrinking, or is contradicted, stated
   with the counter-evidence (see the `evidence-and-sources` subject).
4. **Philosophy**: what it means: who pays, who decided, what responsibility follows for
   the people who build on it. This rung is where an article becomes worth citing rather
   than worth bookmarking, and it is the one an audience-first brief cuts first.

An explanation framework for documentation describes the same territory: explanation is
the understanding-oriented mode, it gives the design decisions, history and constraints
behind a thing, and it "can and must consider alternatives, counter-examples or multiple
different approaches". The article is explanation, not a tutorial; it is allowed, and
expected, to hold an opinion it has earned.

## Length is held while depth rises

The space for depth does not come from making the post longer. A post that doubles in
length to add depth loses the readers it was meant to deepen
([depth by replacement, not addition](../../_laws.md#depth-by-replacement-not-addition)).
It comes from cutting what flattens: the analogy that needs translating back, the
paragraph-length definition, the section that repeats a figure in words, the general
background an expert skips. See depth-by-replacement.

The second source of space is moving structured material out of prose. Three paragraphs
that compare five systems become one designed table; a sequence becomes a flow figure. The
prose that remains can then carry reasoning, which is the one thing a table cannot (see the
`figures-and-tables` subject).

## Selecting what an expert does not know

Depth is not difficulty. A paragraph of dense notation that an expert already knows is not
deep; it is a textbook. The details that hold an expert are **non-obvious, measured and
specific**: a position in a vocabulary where a script first appears, a standard's exception
that inverts what most engineers assume, a regression in a newer version, two estimators
that fail in opposite directions. Each is a fact the reader could not have derived from
first principles and could check. See non-obvious-detail-selection.

## Failure modes of the naive reading

- **The beginner-first brief.** An instruction to "make it accessible to beginners" is
  read by a drafting agent as "explain everything at length", and the expert content is
  what gets cut to make room. The contest that produced this subject saw exactly that: the
  owner withdrew his own beginner-first direction after one round because it "led into flat
  content".
- **Inconsistent expectations.** A post that defines a basic term in one paragraph and
  assumes a much harder one in the next has no model of its reader; a published catalogue of
  confusing explanations lists this pattern by name, beside outdated assumptions about what
  the audience knows.
- **"What" without "why".** A mechanism described without its reason is a fact to
  memorize; with its reason it is a model the reader can apply elsewhere.
- **The strained analogy.** An analogy recruited to help the newcomer, sustained past the
  point where it fits, and costing the expert a translation in every section. The same
  catalogue of confusing explanations names it.
- **Philosophy as a coda.** A last paragraph of reflection bolted onto a flat post. The
  philosophy rung works only when the mechanism and consequence rungs below it were built;
  otherwise it is opinion without evidence.

## Naming the audience

A brief that names the audience names both readers and the trade: "a practitioner who
knows the field; terms of art explained in a clause; the space goes to mechanism,
consequence, limits and meaning". Naming only one reader invites the drafter to sacrifice
the other.

## Sources this subject rests on

- Paul Graham, "Write Simply", March 2021, https://www.paulgraham.com/simply.html: plain
  words for readers whose grasp of ideas exceeds their grasp of the language; less energy on
  prose leaves more for ideas.
- Diataxis, "Explanation", https://diataxis.fr/explanation/: explanation is
  understanding-oriented, gives context and reasons, and must consider alternatives and
  counter-examples; it also tends to absorb other material and has to be kept bounded.
- Julia Evans, "Patterns in confusing explanations", 2021-08-19,
  https://jvns.ca/blog/confusing-explanations/: outdated and inconsistent assumptions about
  the reader, strained analogies, unsupported statements, "what" without "why".

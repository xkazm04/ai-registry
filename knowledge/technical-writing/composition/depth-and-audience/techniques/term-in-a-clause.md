---
layer: technique
type: technique
subject: depth-and-audience
technique: term-in-a-clause
status: forged
laws: [depth-by-replacement-not-addition]
shared_with: []
use_when: [introducing a term of art in a post read by experts and newcomers together, cutting a paragraph-length definition, reviewing a draft that reads like a glossary]
---

# Term in a clause

The concern: every term of art is a fork. Leave it undefined and the newcomer stops; define
it in a paragraph and the expert skims, and after the third such paragraph leaves. **Define
a term in the clause where it first appears, in words the newcomer already has, and keep
going.** The clause costs the expert half a second and saves the newcomer a search; the
paragraph it replaces is space returned to the depth the post exists for
([depth by replacement, not addition](../../../_laws.md#depth-by-replacement-not-addition)).

## Forms that work

- **Appositive**: "byte-pair encoding, which builds its vocabulary by repeatedly merging the
  most frequent adjacent pair, ..."
- **Parenthetical gloss**: "a composition exclusion (a character the standard refuses to
  recombine once decomposed) ..."
- **Defining by consequence**: "the cache key, the exact bytes a provider compares to decide
  whether it has seen this prefix before, ..."

Each states what the thing does, not its etymology or history. The consequence form is
the strongest when the post's argument depends on that consequence, because the definition
then sets up the point.

## Procedure

1. On the first use of each term, ask whether the intended expert reader would need it
   defined. If not, the newcomer still gets a clause; if the expert would, the term may need
   a figure, not more words.
2. Write the clause with no other term of art in it. A definition that needs a definition
   has moved the problem one clause along.
3. Do not define the same term twice. Later uses rely on the first; a reader who jumped
   there from the outline can scroll back, and a link to the first use is cheaper than a
   second definition.
4. Where the clause would exceed about fifteen words, the concept is load-bearing enough to
   deserve its own figure or its own short paragraph in the mechanism section. Decide which;
   do not leave a twenty-five-word aside in the middle of an argument.

## Decision rules

- **When a term is used once and is not part of the argument, replace it with plain words**
  rather than defining it.
- **When the definition and the argument need the same sentence, the definition wins the
  clause and the argument gets the next sentence.** A sentence carrying both is the dense
  sentence experts admire and newcomers abandon.
- **Do not define by analogy.** "A tokenizer is like a dictionary" invites the reader to
  carry the analogy's wrong implications forward. Define by what the thing does.

## When not to use it

Posts addressed explicitly to specialists, with that stated in the preview, can leave the
field's core vocabulary undefined; the preview is then the place that tells the newcomer
what they will need. And glossary pages, where the definition is the content.

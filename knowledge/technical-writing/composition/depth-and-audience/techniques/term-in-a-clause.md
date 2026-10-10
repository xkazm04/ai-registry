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
going.** The clause costs the expert little and saves the newcomer a search. That cost is a
judgment: no study has compared an inline gloss with a glossary or with no definition across
reader expertise. The paragraph it replaces is space returned to the depth the post exists
for ([depth by replacement, not addition](../../../_laws.md#depth-by-replacement-not-addition)).

## Plain word first, clause second

A definition does not cancel a term's cost. In an experiment with 650 lay readers, jargon
lowered processing fluency "even when definitions for the jargon terms are provided"; the
arm that replaced each term with "short explanations using simpler synonyms" did not pay
it. The conditions were extreme: definitions as mouseover text, ten jargon terms per
three-sentence paragraph. They are not a gloss written into the sentence. Expert readers
pay too: across scientific papers, a higher share of jargon in the title and abstract goes
with fewer citations.

So the clause is a fallback for the terms the reader must carry, not a cure for the rest.
**Replace a term with plain words unless the reader needs the term itself**: to search for
it, to read the field's other sources, or because the post's argument keeps using it. Gloss
only what survives that test. Introduce few new terms per paragraph: a paragraph that needs
three clauses is introducing too many concepts at once.

## Forms that work

- **Appositive**: "byte-pair encoding, which builds its vocabulary by repeatedly merging the
  most frequent adjacent pair, ..."
- **Parenthetical gloss**: "a composition exclusion (a character the standard refuses to
  recombine once decomposed) ..."
- **Defining by consequence**: "the cache key, the exact bytes a provider compares to decide
  whether it has seen this prefix before, ..."

Each states what the thing does, not its etymology or history. The consequence form is
the strongest when the post's argument depends on that consequence, because the definition
then sets up the point. It is also the form readers asked for in a plain-language survey:
offered a longer passage that explained a legal term by what would happen to them, most
respondents preferred it, and "even those with law degrees overwhelmingly preferred the
explanation: 76%". That is stated preference, not comprehension.

## Procedure

1. On the first use of each term, ask first whether plain words can replace it. If the
   term stays, ask whether the intended expert reader would need it defined. If not, the
   newcomer still gets a clause; if the expert would, the term may need a figure, not more
   words.
2. Do not trust the author's own list of terms that need a clause. Experts underestimate
   how hard a task is for novices and resist debiasing; readers of intermediate expertise
   predict better. Have a reader one step from the newcomer mark the terms they stopped on.
3. Write the clause with no other term of art in it. A definition that needs a definition
   has moved the problem one clause along.
4. Do not define the same term twice **within one post**. Later uses rely on the first; a
   reader who jumped there from the outline can scroll back, and a link to the first use is
   cheaper than a second definition where the renderer supports links. Across posts the
   rule reverses: each post is its own entry point from search or a feed, so a term glossed
   in last month's post is glossed again in this one.
5. Where the clause would exceed about fifteen words, the concept is load-bearing enough to
   deserve its own figure or its own short paragraph in the mechanism section. Decide which;
   do not leave a twenty-five-word aside in the middle of an argument.

## Decision rules

- **When the reader will not need the term again, replace it with plain words** rather
  than defining it, even if the post uses the concept several times. On a product blog
  read by people outside the field, most terms fail this test.
- **When the definition and the argument need the same sentence, the definition wins the
  clause and the argument gets the next sentence.** A sentence carrying both is the dense
  sentence experts admire and newcomers abandon.
- **Do not define by analogy.** "A tokenizer is like a dictionary" invites the reader to
  carry the analogy's wrong implications forward. Define by what the thing does.

## When not to use it

Posts addressed explicitly to specialists, with that stated in the preview, can leave the
field's core vocabulary undefined; the preview is then the place that tells the newcomer
what they will need. And glossary pages, where the definition is the content.

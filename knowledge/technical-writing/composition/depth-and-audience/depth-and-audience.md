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
An essayist's case for simple writing reaches the same split from another side. His reader
is not a newcomer to the field. It is a reader whose English lags their grasp of the ideas,
and his target is needlessly intellectual words, not terms of art: a difficult topic does
not license difficult words, and the less energy a reader spends on the prose, the more is
left for the ideas.

## Where one text cannot serve both

The split has a measured limit. In a reading study, low-knowledge readers learned more from
a cohesive, explicit text and high-knowledge readers from a minimally coherent one, because
filling the gaps made them work. Instruction research generalises this as the expertise
reversal effect: support that helps a novice can cost an experienced learner. The two-reader
article survives on a narrower condition. A follow-up found the low-cohesion benefit only in
*less skilled* readers with high knowledge; skilled readers with high knowledge did better
with the cohesive text, and a practitioner reading a technical post is usually a skilled
reader. A clause of gloss costs that reader little, though no study has compared an inline
gloss with a glossary or with no definition across expertise. The reversal applies once the
support outgrows a clause: worked steps, a sustained analogy, a paragraph per term. That
material belongs in a separate post the expert can skip.

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
   the people who build on it. This rung is where, in this subject's judgment (no study
   measured it), an article becomes worth citing rather than worth bookmarking, and it is
   the one an audience-first brief cuts first.

An explanation framework for documentation describes the same territory: explanation is
the understanding-oriented mode, it gives the design decisions, history and constraints
behind a thing, and it "can and must consider alternatives, counter-examples or multiple
different approaches". The article is explanation, not a tutorial; it is allowed, and
expected, to hold an opinion it has earned.

## Length is held while depth rises

The space for depth does not come from making the post longer. The measured cost is
position, not length. In one news-site study, long-form articles drew complete visits at
about the rate of short-form ones and twice the engaged time. But attention falls down the
page: most readers stop near the halfway mark, and in eye-tracking three quarters of viewing
time goes to the first two screens. Depth appended to a longer post lands where fewer of the
readers it was written for still are
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
  otherwise it is opinion without evidence. On a product's own blog the coda is usually a
  positioning line restating the product's advantage. That is the publisher's claim, not a
  position the post has argued, and a review should not credit it as the rung.

## Naming the audience

A brief names **one primary reader, specifically, and the floor kept for the other**: "a
practitioner who knows the field is the reader; terms of art are explained in a clause for
the newcomer; the space goes to mechanism, consequence, limits and meaning". The catalogue
of confusing explanations prescribes the same remedy for inconsistent expectations: pick one
specific person and write for them. Naming the primary reader without the floor invites the
drafter to sacrifice the newcomer. Naming two readers as equals leaves the drafter no way to
settle a conflict between them. Naming none gives the field's usual result: a post that
defines a basic term in one sentence and assumes a hard one in the next.

The second reader depends on the venue. In a field publication it is a newcomer to the
field. On a product or vendor blog it is often a buyer or user from outside the field, and
the title may say so. There the primary reader flips. Plain words carry the post, and a term
that reader does not need is replaced rather than glossed (see term-in-a-clause). The depth
ladder applies to the posts written for engineers, not to announcements and use-case
pieces, which persuade rather than explain.

## Sources this subject rests on

- Paul Graham, "Write Simply", March 2021, https://www.paulgraham.com/simply.html, re-read
  2026-10-10: readers who are not native speakers, whose "understanding of ideas may be way
  ahead of their understanding of English"; a difficult topic does not license difficult
  words. It concerns needlessly intellectual words, not terms of art.
- McNamara, Kintsch, Songer and Kintsch, Cognition and Instruction, 1996,
  doi:10.1207/s1532690xci1401_1: low-knowledge readers benefit from a coherent text,
  high-knowledge readers from a minimally coherent one.
- O'Reilly and McNamara, Discourse Processes, 2007, doi:10.1080/01638530709336895: the
  low-cohesion benefit was restricted to less skilled, high-knowledge readers; skilled
  high-knowledge readers benefited from the cohesive text.
- Kalyuga, Ayres, Chandler and Sweller, "The expertise reversal effect", Educational
  Psychologist, 2003, doi:10.1207/S15326985EP3801_4. Instructional settings, not article
  reading.
- Pew Research Center, Mitchell, Stocking and Matsa, "Long-form reading shows signs of life
  in our mobile news world", 2016-05-05: 1,530 complete interactions per long-form article
  and 1,576 per short-form; 123 seconds of engaged time against 57.
- Shulman, Dixon, Bullock and Colón Amill, Journal of Language and Social Psychology,
  2020, doi:10.1177/0261927X20902177: jargon disrupts fluent processing "even when
  definitions for the jargon terms are provided". Method from the companion paper, Bullock
  et al., Public Understanding of Science, 2019, doi:10.1177/0963662519865687 (N = 650):
  "Definitions were provided using a mouseover text feature"; "10 jargon terms were
  included in each paragraph".
- Martínez and Mammola, "Specialized terminology reduces the number of citations of
  scientific papers", Proc. R. Soc. B, 2021, doi:10.1098/rspb.2020.2581.
- Trudeau, "The Public Speaks", Scribes Journal of Legal Writing 14 (2011-2012): 76% of
  respondents with law degrees preferred the longer passage that explained the legal term.
- Hinds, Journal of Experimental Psychology: Applied, 1999, doi:10.1037/1076-898X.5.2.205:
  experts were worse predictors of novice performance and resisted debiasing; intermediates
  predicted better.
- Nielsen Norman Group, Fessenden, "Scrolling and attention", 2018-04-15: 74% of viewing
  time in the first two screenfuls. Chartbeat data reported by Slate (Manjoo, 2013): most
  readers scroll to about the halfway mark.
- Diataxis, "Explanation", https://diataxis.fr/explanation/: explanation is
  understanding-oriented, gives context and reasons, and must consider alternatives and
  counter-examples; it also tends to absorb other material and has to be kept bounded.
- Julia Evans, "Patterns in confusing explanations", 2021-08-19,
  https://jvns.ca/blog/confusing-explanations/, re-read 2026-10-10: outdated and
  inconsistent assumptions about the reader, strained analogies, unsupported statements,
  "what" without "why", too many concepts at a time. Her remedy for inconsistent
  expectations is "pick 1 specific person and write for them!"

---
layer: technique
type: technique
subject: branching-narrative-graph-validation
technique: node-text-budget-and-localization-surface
status: forged
laws: [a-budget-shapes-the-output, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [briefing a generator to write conversation nodes, estimating what a branching scene will cost to translate or voice, a dialogue tree that reads fine and will not fit the interface]
---

# Node text budget and localization surface

The named concern: state, before anything is written, how long a line of each class should
be and how many translatable and recordable units the graph will produce — and treat both as
inputs to authoring rather than as facts discovered when the scene reaches the localization
team. A conversation graph is the content class whose cost multiplies by its own topology,
and the multiplication happens after the writing, where nobody is looking.

## Two different numbers, constantly confused

**The node budget** is a per-line target: how long a spoken line, a barked reaction, a menu
option, an ending card should be. It exists because text has a container — a subtitle band,
an option row, a portrait panel — and because a line's length is a stylistic property that
readers feel.

**The localization surface** is a whole-graph total: how many units this scene will cost to
translate, and to record if it is voiced. It is the number that decides whether the scene
ships in nine languages or four.

Neither substitutes for the other, and the units are not the same. A budget in characters
per line does not aggregate into a surface, because the surface is counted in units, not in
characters, and a unit's cost is dominated by the fact that it exists rather than by its
length: a two-word option and a forty-word speech are close to the same price to route,
translate, review, record and re-record. This is the practical face of
[a number carries its unit and its basis](../../../_laws.md#a-number-carries-its-unit-and-basis).
A "700-line scene" means four incompatible things depending on whether it counts nodes,
options, translation units or recorded assets, and a producer planning against the wrong one
is off by a large integer factor.

So every stated figure carries its unit and its basis: units per language, whether options
are counted, whether variants of the same line under different conditions are counted
separately, and the voiced fraction. State the expansion assumption too — target languages
routinely need noticeably more space than the source, and a container sized to the source
text fails in translation, not in review.

## The budget shapes what gets written

Handing a generator a node count and no length target produces long nodes. This is not a
generator quirk; it is what any producer does with an unbounded allowance, and it is
[a budget shapes the output, it does not only cap it](../../../_laws.md#a-budget-shapes-the-output)
in the place where the consequence multiplies. Three rules follow.

**State the budget as the intended size, not the ceiling.** "Around one to two sentences,
under two hundred characters" produces different writing from "no more than two hundred
characters", and the difference is visible across a corpus: the second instruction produces
lines of a hundred and ninety.

**Budget per node class, not per graph.** A menu option, a spoken line, an examine
description and an ending card have different containers and different jobs. One number for
all of them makes options too long and endings too short.

**Derive a branch's allowance from the scene's, rather than repeating the scene's.** If a
scene is budgeted at a number of units and it grows three branches, each branch gets a share
— otherwise every added branch silently triples the scene, and the graph that reads as one
scene costs three.

## Counting the surface

Count nodes that produce player-visible text, count options separately from the nodes they
sit on, and count conditional variants of a line as separate units, because they are
separate rows to a translator. Multiply by target languages. Multiply the voiced subset by
whatever a recorded asset costs — which includes a re-record allowance, since a scene that is
edited after recording is normal.

The number that changes decisions is not the total; it is the **cost per branch**. A report
that says the scene is large tells a producer nothing they can act on. A report that says the
third act's optional confrontation carries eighteen percent of the scene's recording cost and
is reachable on one path in nine tells them exactly what to cut, and lets them cut it before
it is recorded rather than after. Reachability data and the surface count are far more useful
multiplied together than either is alone.

## Decision rules

- **When a node's text exceeds its class budget, report it against the class**, with the
  budget and the measured value both in the finding. A finding that says "too long" without
  the target is not actionable and will be argued with.
- **When a scene's surface exceeds its allowance, report which branches carry it**, ordered
  by cost per unit of reachability. Cutting the widest-reaching branch is almost always the
  wrong cut.
- **When text is assembled at runtime from fragments, count the fragments and refuse the
  assembly.** Concatenated sentences are the most expensive construct in localization —
  word order and agreement differ by language, so a fragment that works in the source
  language cannot be translated in isolation. Whole sentences with substituted values, and
  a declared grammatical context for each value, are the cheap form.
- **When a line will be voiced, freeze it before it is recorded and treat later edits as a
  cost, not as a free change.** The budget for a voiced graph includes the churn allowance
  or it is not a budget.
- **When a generator writes the graph, put the per-class budget in the authoring prompt and
  grade what came back against what was asked**, not only against the class ceiling. A node
  at ninety percent of the ceiling when the target was half of it is a miss, and it will not
  be visible in any check that only tests the ceiling.

## When not to use this

- **On a prototype graph nobody will translate.** The surface number is planning
  information; computing it for a scene that will be thrown away is ceremony.
- **As a quality signal.** Short lines are not better lines. The budget constrains a
  container and a cost; it says nothing about whether the writing is any good, and a graph
  optimised to its budget can be uniformly terse and lifeless.
- **On text that is not a translation unit** — internal node names, author notes, debug
  strings. Counting them inflates the surface and makes the number untrustworthy, which
  costs more than leaving them out.

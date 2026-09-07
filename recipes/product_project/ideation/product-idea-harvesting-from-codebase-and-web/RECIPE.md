---
name: product-idea-harvesting-from-codebase-and-web
version: 0.1.0
status: seed
domain: product_project
path: product_project/ideation
---

# Product idea harvesting from codebase and web

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Idea harvesting that is not grounded in the product produces candidates that
are plausible for some product and not this one, and triaging them costs more than they
are worth. The most expensive kind is the candidate the product already shipped: it
reads as a good idea, survives triage on its merits, and is discovered to be redundant
only once somebody starts building it.

**Input.** The bound codebase, read for what the product actually is and what it already
does; public web sources; any connected chat or knowledge base; and the record of which
sources and categories the reader keeps rejecting.

**Core action.** Read the product first and use that reading twice, once to keep
candidates plausible for this product and once to reject the ones it has already
overtaken, then keep only what somebody could triage in a sentence.

**Output.** A small number of concrete candidates, each traceable to where it came from
and each a change the product does not already make, or an explicit and recorded finding
that this pass turned up nothing worth a triage slot.

## Activities

1. Read the bound codebase for what the product is and what it already does *(observe)*
2. Mine the web, and any connected chat or knowledge base, for candidates that could fit
*(observe)*
3. Drop the vague, the meta, and anything the product already has *(decide)*
4. Drop categories and sources whose candidates keep being rejected *(decide)*
5. Write each surviving candidate concretely enough to be triaged or declined on its
merits *(act)*
6. Hand the candidates to triage with their sources attached, and record the pass even
when it is empty *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Every candidate fits what this product is and names something it does not already
do.**

- Candidates are seeded from the bound codebase's real domain and stack when one is
  connected, not from the product category in the abstract.
- A candidate the codebase shows is already implemented is dropped before triage, with
  the place it was found named, because a redundant candidate costs a triage slot and
  some of the reader's trust in the rest of the list.
- Each candidate carries the source it came from, so a reader can judge the source and
  not only the idea.

**The list stays short enough and good enough that reading it is worth the reader's
time.**

- A pass that found nothing worth a triage slot delivers an explicit empty result rather
  than filling a quota, and the empty result is recorded so the next pass does not pay
  for the same look.
- The share of candidates that get accepted is tracked per source and per category, and
  a source persistently below the adopter's floor is stopped rather than quietly
  tolerated.
- A candidate nobody acted on counts against its source in the same way a rejected one
  does, since the reader's silence is the same signal.

**The harvest still delivers when only some of its sources are connected.**

- Web and codebase reading alone produce candidates when no chat or knowledge base
  source is bound.
- A missing optional source is reported as a narrower harvest rather than treated as a
  failure.
- A pass with no codebase bound says so, because without it the work is a general web
  search and its candidates should not be presented as grounded.

## Guidance

Read what the product is before searching for what it could be, because an ungrounded
harvest produces candidates that are plausible for some product and not this one. Use
that reading twice: to make candidates fit, and to reject the ones already built, since
a suggestion the code has overtaken costs a triage slot and some credibility. Count what
gets accepted per source and stop mining the ones that keep being rejected. An empty
harvest is a result worth recording.

## Where this is worth adopting

- A small product team whose backlog already exceeds what they can build, where another
  twenty plausible ideas is a cost rather than an asset and the only harvest worth
  running is one that returns three.
- A founder building in a domain that moves quickly, who needs to know what competitors
  and adjacent tools started doing this month, but whose real constraint is that most of
  what they read does not apply to a product of this shape.
- A team that tried an idea feed before and stopped reading it, because roughly half of
  what it surfaced had already shipped and nobody trusted the other half after that.
- An engineering organisation with a codebase far larger than any one person's model of
  it, where the useful function of the grounding read is telling the reader what the
  product already does.
- A period between roadmap cycles when nothing needs deciding, where the right behaviour
  is to run rarely and return nothing rather than to manufacture candidates on a
  schedule.

## Connector types

`development`, `messaging`, `knowledge_base`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[codebase](examples/codebase.md) for `development`.

## Recommended trigger

`self_paced`. A weekly cadence here is habitual rather than earned: no boundary in this
work is defined by a calendar, and a fixed interval forces a harvest in a week when
neither the product nor its sources moved. Act when the product or the field has
plausibly changed and the triage queue has room, which is a judgment about whether
anything new can be said.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which codebase is the product, because it is the only thing that makes a candidate
  plausible rather than generic, and without it the recipe degrades to a web search that
  should not claim to be grounded.
- Which chat channels and knowledge base spaces are in scope, because these are optional
  inputs and reading the wrong ones is a privacy problem before it is a quality one.
- What the reader has already decided against, since a category rejected three times
  should stop appearing and the work cannot infer that in its first passes.
- How much triage capacity actually exists, because that number and not the number of
  sources is what decides how many candidates a good pass returns.

## Dependencies

None.

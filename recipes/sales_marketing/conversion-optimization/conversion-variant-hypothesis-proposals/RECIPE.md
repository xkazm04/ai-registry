---
name: conversion-variant-hypothesis-proposals
version: 0.1.0
status: seed
domain: sales_marketing
path: sales_marketing/conversion-optimization
---

# Conversion variant hypothesis proposals

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Pages underperform quietly, the ideas offered for them are generic best
practice that would fit any site, and the ones that do get run are refinements on pages
whose traffic could never have settled them, so a year of testing ends in a folder of
inconclusive results.

**Input.** Per page conversion against each page's own rolling baseline, the traffic
each page actually receives, the pages the adopter permits experiments on, the
experiments already running, and the record of which kinds of change have been accepted
or refused before.

**Core action.** Work out what size of effect each page could actually settle in a time
the adopter would tolerate, rank pages by what a test there is worth rather than by the
size of their gap, and write a small number of hypotheses that name the belief they rest
on.

**Output.** A short set of proposals a person can choose from, each naming the page's
specific gap, the belief behind the change, the metric it expects to move, and the
effect the page's traffic would need it to reach for the experiment to conclude at all.

## Activities

1. Read per page conversion against each page's own baseline *(observe)*
2. Work out what effect each page's traffic could settle in a tolerable time *(decide)*
3. Rank by what a test there is worth rather than by the size of the gap *(decide)*
4. Set aside pages out of scope, categories already refused and pages already under test
*(decide)*
5. Write hypotheses naming the belief, the change and the effect each expects *(act)*
6. Present them for a person to choose from and record what was proposed *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Every proposal is an experiment that could actually reach a conclusion on the page it
targets.**

- Each proposal names the effect the page's traffic could detect within a duration the
  adopter would accept, and a change too small to clear that bar is not proposed on that
  page.
- On a page whose traffic cannot settle a modest change, the proposal is for a bold
  change or for no experiment at all, rather than for a refinement that would need a
  year.
- No page carries more than one proposed experiment at a time, because two changes on
  one page confound each other unless the backend randomises them independently and the
  analysis accounts for it.

**The pages chosen are the ones worth testing, not the ones that happened to have a bad
month.**

- The ranking accounts for the traffic a page carries and how much of the conversion it
  controls, not for the size of its gap alone.
- A page selected for falling furthest below baseline is checked against ordinary
  variance first, because selecting the worst performer preferentially selects the
  unluckiest measurement and it will recover without anybody touching it.
- A page too quiet to have a trustworthy baseline is reported as too quiet rather than
  ranked first on the strength of a large percentage over a small number.

**Every hypothesis can be contradicted by its own result, and nothing reaches the live
site without a person choosing it.**

- Each proposal states the belief it rests on as well as the change it makes and the
  metric it expects to move, so a result can disagree with it rather than merely
  disappoint.
- Each proposal names the page's specific gap rather than a principle that would read
  the same against any site.
- Every proposal sits in review before deployment and only approved proposals reach the
  experimentation backend.
- A run with nothing worth testing proposes nothing and records that, rather than
  filling the cap because the cap exists.

## Guidance

Rank by what a test there is worth, not by the size of the gap: the page that fell
furthest is often the page that got unluckiest, and it will recover without you. Size
the experiment before writing the hypothesis, because a page with a few thousand
visitors can only settle a bold change and proposing a refinement there is proposing a
test that never ends. Name the belief and not just the change, so that a result is able
to contradict it.

## Where this is worth adopting

- A site whose last six experiments were button colours and copy tweaks on a page with
  four thousand visitors a month, every one of them archived as inconclusive.
- A team with a testing backend installed and nothing in the queue, where the ideas that
  get proposed are whatever was in the most recent article somebody read about
  conversion.
- A page whose conversion fell sharply last month and now sits at the top of everyone's
  list, where the fall is inside what that page's numbers do anyway.
- An operator who has been told to test the checkout and cannot, and needs the reason to
  be a number rather than a hunch when he explains why not.
- A backlog of approved but unrun experiments, where proposing three more per run makes
  the queue the bottleneck and the pages actually worth testing wait behind ideas nobody
  rated.

## Connector types

`analytics`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`self_paced`. Proposals are worth writing when the reading has moved enough to argue for
something new and when the pages in scope are not already saturated with running
experiments. A fixed cadence writes proposals into a full queue, and a queue is where a
proposal goes to be forgotten rather than judged.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which pages may be experimented on at all, since checkout and legal pages are usually
  out of bounds and the cost of getting that wrong is not recoverable.
- What the adopter is trying to move on each page, because the same copy change is an
  improvement against one metric and a regression against another.
- How long the adopter will let an experiment run before losing interest, which together
  with the page's traffic decides which effects are proposable and which pages are
  testable at all.
- Which kinds of change the adopter has already refused and why, recorded where the next
  run can read it, so the same category is not proposed a fourth time.
- Where the belief behind a hypothesis is expected to come from, whether that is session
  behaviour, support contacts or the adopter's own knowledge of the buyer, because a
  hypothesis with no belief behind it is a guess with a number attached.

## Dependencies

- an experimentation backend able to split traffic and report per arm exposure counts

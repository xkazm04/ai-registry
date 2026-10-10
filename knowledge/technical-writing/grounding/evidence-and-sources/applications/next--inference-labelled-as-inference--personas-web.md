---
layer: application
type: application
subject: evidence-and-sources
technique: inference-labelled-as-inference
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16
applied: simulation
ab_verdict: better
---

# A product blog whose scenario figures read as facts about the reader

Read against the `personas-web` repository at `01eaee60` (origin/master) on 2026-10-10.
Anchors are relative to that tree. The version is witnessed by package.json:48 "^16.3.8".
The witness is the same ten-post blog as the `numbered-in-page-citations` application.

## What the posts show

The use-case posts open each workflow with a problem stated as a figure about the reader's
team. Six of the 45 body numbers are scenario figures of this kind. Five are in the
indicative, and so read as facts:

- src/data/blog.ts:224 "Your team opens 20+ pull requests a week."
- src/data/blog.ts:487 "your team spends 20 minutes researching the prospect"
- src/data/blog.ts:499 "Every Monday, someone spends two hours pulling data from three tools"
- src/data/blog.ts:475 "Your team writes one blog post a week."
- src/data/blog.ts:85 "this means waking up to dozens of failed executions"

One is already in the conditional, and it is the form the revised rule asks for:
src/data/blog.ts:576 "Run 50 agents on hourly schedules and you're looking at hundreds per month."
Its result, though, is a derived cost whose unit price and arithmetic are not shown.

Two derived numbers carry a marker word and still hide their inputs:
src/data/blog.ts:561 "this means 2-3x faster iteration cycles". "This means" is the kind
of marker the technique recommends. The inputs it would need are the cloud latency
(src/data/blog.ts:559 "waiting 3-5 seconds per test adds up fast", unsourced) and a local
latency the post never states. The marker labels the sentence as reasoning without letting
anyone check the reasoning.

## Simulation

Mode `simulation`. Policy A is the technique as it stood before 2026-10-10, with three
kinds: derived number, reasoned claim, illustration. Policy B adds a fourth kind, the
worked example. It is a scenario figure, made up to show how a use case works, and it is
marked in the same sentence by the conditional or by "say" or "for example". It uses round
inputs, and it stays out of titles and descriptions, where the label cannot follow it.
B also adds that a marker word does not stand in for the inputs.

- **Pull requests** (line 224). A has no row for it: the figure is not computed, the
  sources do not support it, and it is not a figure. Reviewed under
  `numbered-in-page-citations`, it is an orphan number owed a source that does not exist.
  The pressure that creates is the pressure to invent one. B rewrites it as "Say your team
  opens twenty pull requests a week" and asks for nothing else.
- **Status report** (line 499). The same, and B's change is one word ("If").
- **Cloud cost** (line 576). A accepts it, because the scenario is already conditional. B
  asks for the one missing input: the per-run price it multiplies, with its source and
  date. Without that, "hundreds per month" is a derived number with no derivation.

On all three B costs one clause or one word. A either says nothing or asks for a citation
that cannot exist. This is judgment on the text. No reader test was run.

**Falsifier:** a reader test on these posts in which readers given the indicative versions
are no more likely to recall the figures as facts about teams in general than readers given
the conditional versions. The copy was not changed: the project's map does not join this
bundle, and the posts are the owner's public copy.

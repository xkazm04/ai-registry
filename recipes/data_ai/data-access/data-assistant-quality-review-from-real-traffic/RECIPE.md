---
name: data-assistant-quality-review-from-real-traffic
version: 0.2.0
status: seed
domain: data_ai
path: data_ai/data-access
---

# Data assistant quality review from real traffic

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** An assistant answering questions against data gets better by impression or not
at all. Individual bad answers get noticed and forgotten, so the same failure keeps
happening. Counting does not rescue it either: an overall score moves for reasons that
have nothing to do with the change that shipped, so a fix that worked and a fix that did
nothing look identical afterwards.

**Input.** The accumulated record of real questions and what came back: answers refused,
corrected, abandoned or quietly wrong, the ledger of patterns already fixed, and whether
the changes proposed last time actually shipped.

**Core action.** Build the failure categories out of the traces rather than out of a
list written in advance, separate a misunderstood question from a wrong query from data
that could not answer it, and come back to measure a shipped change against the rate of
the category it was meant to fix.

**Output.** Patterns worth fixing with what each is costing, proposals stating what
should improve and how that will be measured, and measured results for the changes that
shipped, including the ones that did nothing.

## Activities

1. Sample real exchanges, drawing some at random rather than only what a flag surfaced
*(observe)*
2. Read them one at a time and note what went wrong in plain words before grouping
anything *(observe)*
3. Build the failure categories out of what the traces said rather than from a list
written in advance *(decide)*
4. Separate a misunderstood question from a wrong query from data that could not answer
it *(decide)*
5. Propose a change stating what it should improve and how that will be measured *(act)*
6. Return to a shipped change and measure it against its own category, including when it
did nothing *(act)*
7. Hand over the patterns, the proposals and the measured results *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The assistant gets better because real failures were found, fixed and measured
again.**

- Every claimed quality problem points at real recorded exchanges rather than at an
  impression
- Every case in the review set says where it came from, drawn from real traffic or
  written from the specification, because a set that stays silent about that cannot tell
  a path nobody has tested from one that passes, and those are opposite claims
- A proposed change states what it should improve and how that will be measured
- A change that shipped is revisited and measured against the rate of the category it
  was meant to fix, never against an overall score, including when there was no effect
- A change proposed and never shipped is visible as unshipped rather than quietly
  assumed done

**Failure is described as a pattern that can be acted on, not as a pile of individual
bad answers.**

- Categories are built from the traces themselves, so a failure kind nobody anticipated
  can still be found
- A misunderstood question, a wrong query and data that could not answer it are
  separated, because the fix differs and only one of the three is a prompt change
- A category holding a handful of examples is reported as a handful of examples, not
  converted into a rate
- A pattern already fixed does not reappear in the next review unless it actually
  recurred

**The review can discover a failure the current signals do not describe.**

- Part of every sample is drawn at random rather than from what a flag or a low rating
  surfaced
- A signal used to find bad answers, such as a rephrase, an abandonment or a low rating,
  is checked against manually read conversations before being treated as a measure
- Sampling stops when new exchanges stop producing new kinds of failure, rather than at
  a fixed count
- A quiet period is reported as a quiet period rather than padded out

## Guidance

Read before you count. The categories have to come out of the traces, because a taxonomy
written in advance can only find the failures somebody already imagined and the
expensive ones are the other kind. Draw part of every sample at random, or you will only
ever find what your flags already describe. Separate a misunderstood question from a
wrong query from data that could not answer it. Measure a shipped fix against its own
category, never against an overall score.

## Where this is worth adopting

- A team six months into running a data assistant, where everyone has a story about a
  bad answer and nobody can say which kind of bad answer is the common one.
- A product about to justify the assistant's cost, whose only evidence is a satisfaction
  rating that a small and self selected fraction of users ever left.
- An engineer who shipped a prompt change last quarter, watched the overall score rise,
  and cannot tell whether the change did it or the mix of questions moved.
- An assistant whose worst failures are never flagged, because a confidently wrong
  answer reads as a good one to the person who asked for it and gets no complaint.
- A team still adding examples to a golden set collected at launch, whose questions have
  stopped resembling anything real users now ask.

## Connector types

`database`, `messaging`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`self_paced`. Watch the accumulating record: a rising refusal or correction rate, a
failure shape not seen before, or a change that shipped and has not yet been measured.
The loop resumes at the oldest unfinished item, which a fixed weekly slot cannot
express.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Where the real conversation records actually live, because the whole responsibility is
  evidence based and has nothing to stand on without them
- What the quality bar is for this product and who decides it, since better is not
  measurable until somebody says what good looks like here
- Whether the seat may propose changes against the repository or only describe them,
  which changes what a finished proposal looks like and whether a fix can be measured at
  all
- How much of the record a person is willing to read by hand, because the categories
  come from reading and no amount of automated grouping substitutes for the first pass
- Which existing signals this adopter already trusts, so each can be checked against
  read conversations rather than inherited as true

## Dependencies

None.

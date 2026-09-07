---
name: conversion-experiment-program-digest
version: 0.1.0
status: seed
domain: sales_marketing
path: sales_marketing/conversion-optimization
---

# Conversion experiment program digest

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A program that only communicates when something wins leaves its owner unable
to tell a quiet period from a stalled one, and leaves everyone with a picture of the hit
rate assembled entirely from the results that were worth mentioning.

**Input.** The current state of every experiment, the verdicts reached since the last
edition, the proposals waiting, what was archived without reaching its horizon, and the
program's own running rates.

**Core action.** Compose one honest account of where the whole program stands, carrying
the uncertainty and the abandonments as first class content, and report the program's
own rates alongside the results it produced.

**Output.** One briefing covering what is running, what came back, what is proposed and
what was abandoned, together with how often experiments reach a verdict and how often
they are called winners, delivered whether or not the period was eventful.

## Activities

1. Gather the program's current state and everything decided since the last edition
*(observe)*
2. Read the program's own rates of verdicts, abandonments and declared winners
*(decide)*
3. Judge how much confidence each result actually carries *(decide)*
4. Compose the account at the depth the reader asked for, including what went wrong
*(act)*
5. Deliver it whether or not the period was eventful *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Whoever owns conversion optimisation can see all of the program, including the parts
that are not progress.**

- In flight experiments, results, waiting proposals and inconclusive archives are all
  represented in every edition.
- The edition goes out when there is nothing significant to report and carries the
  counts, so a quiet period is distinguishable from a stalled one.
- Something that went wrong or was abandoned appears in every edition, and a period with
  none says so explicitly rather than leaving the absence to be read as good news.
- When the account cannot be assembled, the edition says so plainly instead of shipping
  a confident empty one.

**The rates the program runs at are reported alongside the results it produced, so the
results can be read in the light of how they were reached.**

- Every edition carries how many experiments reached a verdict, how many were abandoned
  before one, and what share of concluded experiments were called winners.
- A share of winners far above what large published programs achieve is reported as a
  question about when experiments are being stopped rather than as a good quarter.
- The first edition says it is establishing these rates rather than reporting a change
  in them.

**A result is no more certain in the summary than it was in the data.**

- An early or weakly supported result is presented with its uncertainty rather than as a
  finding, and a result read before its declared horizon is labelled as read early.
- An inconclusive experiment reports what it can now rule out wherever it can rule out
  anything, because that is a result and the word inconclusive hides it.
- A result quoted in the shortest edition carries the same qualification it carried in
  the longest one.

## Guidance

Visibility is the job here, not news. Send the edition in a quiet period and let it
carry the counts, because a digest that only arrives with a win cannot be told apart
from one that stopped. Report the program's rates beside its results: how many
experiments reached a verdict, how many were abandoned, how many were called winners. A
win rate far above what large programs report is a question about when things are being
stopped, not a good quarter.

## Where this is worth adopting

- A founder who funded a testing program six months ago and has heard about two wins
  since, with no way to tell whether that is the program working or the program having
  quietly stopped.
- A team whose quarterly review presents the three experiments that won and never the
  eleven that did not, so the room forms a picture of a hit rate that nobody in it
  actually believes.
- A program where every result has come back positive, where this briefing is the only
  artefact positioned to notice that the pattern itself is the finding.
- An operator who reads one briefing a week and needs the uncertainty to survive into
  the short version, because the short version is the only one that gets read.
- A handover between owners, where the incoming person needs what was abandoned and why
  at least as much as what shipped.

## Connector types

None. This work needs no external connector: the tools the agent already has are enough.

## Recommended trigger

`time`. A briefing whose purpose is that a quiet period stays visible cannot be paced by
whether anything happened, because then a quiet period produces no briefing and silence
would mean both a calm program and a dead one. A rhythm the reader can rely on is the
honest fit. The interval belongs to the adopter and follows how often they make a
decision from it, not this recipe.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Who reads this and what decision they make from it, because an executive summary and a
  working document are different artifacts and only one of them can be both.
- How the adopter wants to be told, since a briefing that arrives where they do not look
  is not visibility no matter how good it is.
- What quiet looks like for this program, so an uneventful period reads as reassurance
  rather than as a broken watch.
- What rates this program has run at historically, if any are known, because the share
  of experiments called winners only carries meaning against something, and the first
  few editions have to say they are still establishing it.

## Dependencies

None.

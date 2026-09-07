---
name: scouted-opportunity-triage
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/work-intake
---

# Scouted opportunity triage

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A discovered opportunity that goes straight to a builder spends effort on
something nobody asked for. Everything a scout returns is interesting, because being
interesting is what got it noticed, and interest is not demand: unlike an internal
candidate, nothing scouted has anybody behind it who needed it. Accepting one is also a
different commitment from accepting a piece of internal work, because it adds something
the team does not control and will be carrying for years.

**Input.** One discovered opportunity with whatever the scout established about it, what
is already in use here that overlaps with it, and the topic preferences this person's
earlier decisions have built up.

**Core action.** Ask who here would use it and on what occasion before asking whether it
is any good, weigh what adopting it commits to after the first build, and let the
refusals train which topics stop being scouted at all.

**Output.** A decision on every scouted opportunity, an accepted one carrying the person
and the occasion that justify it, a refusal recorded against its topic, and an accept
rate low enough that the gate is genuinely screening.

## Activities

1. Take the discovered opportunity with what the scout established *(observe)*
2. Ask who here would use it and on what occasion *(decide)*
3. Weigh what adopting it commits to beyond the first build *(decide)*
4. Put it to a person with enough context to decide *(deliver)*
5. Record the decision and its reason against the topic *(act)*
6. Send an accepted opportunity on with its occasion attached *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**An accepted opportunity carries a person who would use it and an occasion they would
use it on, so acceptance means demand rather than approval.**

- Each accepted opportunity names who it is for and when it would be reached for, in
  terms specific enough to be wrong.
- An opportunity nobody can be named for is declined as unwanted, not deferred as
  promising, because promising is where scouted items accumulate until nobody reads the
  list.
- A claim that something is ready to use cites where it was seen working rather than
  where it was announced.

**The proportion accepted is small enough that the gate is doing work, and the cost
recorded against an accept is the whole cost.**

- The share of scouted opportunities accepted is measured and reported, and a gate
  accepting most of what arrives is named as not screening rather than as productive.
- The cost recorded for an accepted opportunity includes what carrying it commits to
  afterwards, not only the effort of the first build.
- Where opportunities are scored, the score orders the queue and never settles the
  decision, and a ranking that reorders when one estimate is revised is reported as
  undecided rather than as a result.

**A topic this person keeps refusing stops arriving, so the scout narrows toward what is
wanted.**

- A refusal carries a typed reason recorded against the topic, not against the
  individual item.
- A topic refused repeatedly is either dropped from scouting or ranked down, according
  to which of the two the adopter asked for, and the change is reported.
- A scan that produced nothing worth accepting is reported as a quiet scan rather than
  padded to look productive.

## Guidance

Everything scouted is interesting, because that is what got it noticed, and interest is
not demand. Ask who here would use it and on what occasion before asking whether it is
any good, and decline what nobody can be named for rather than parking it as promising.
Accepting an outside thing commits you to something you do not control for years, so
weigh what comes after the first build. Treat a score as an ordering hint, never as a
verdict.

## Where this is worth adopting

- A scout returning a dozen genuinely interesting things a week to a team of three,
  where every one of them would be a fine project and none of them is this quarter's
  project.
- An organization that adopted three outside tools in a year because each looked good on
  the day it arrived, and now maintains three integrations that one person understands.
- A team that scores opportunities and ranks by the score, where the top of the list
  changes whenever somebody revises a confidence estimate, and nobody has noticed that
  this is what decides their roadmap.
- The rare moment when a scouted item is exactly right, where the difference between
  acting and letting it pass is whether anybody can name the occasion it would be used
  on.
- An operator who wants an entire topic to stop being scouted rather than to keep
  declining it one item at a time, and has no way to say so today.

## Connector types

None. This work needs no external connector: the tools the agent already has are enough.

## Recommended trigger

`event`. An opportunity being discovered is what creates the work, and this gate stands
between it and any build effort, so nothing is gained by waiting for a sweep. The
decision itself can still be batched by the adopter: a scouted item is rarely urgent,
and deciding a handful together is what makes the accept rate visible as a rate rather
than as a series of individually reasonable yeses.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- How much of the scout's enrichment this person wants on the card, since a card too
  thin means digging and one too thick means the queue goes unread.
- Whether a refused topic should stop being scouted or merely rank lower, because those
  are different promises and only one is easy to undo.
- What counts as an occasion here, because that is the test an accept has to pass and it
  is the one thing a scout can never supply from outside.
- Who is expected to carry an adopted outside thing afterwards, since the cost that
  matters is the one that arrives every quarter for years rather than the one in the
  first week.

## Dependencies

None.

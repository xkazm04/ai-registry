---
layer: technique
type: technique
subject: simulated-audience-testing
technique: sourced-population-calibration
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [building a synthetic chat audience, deciding message rates and archetype mix for a simulated stream, judging whether a simulated result will transfer to a real room]
---

# Sourced population calibration

A synthetic audience is only as informative as its composition. If the mix of
messages in the simulated room was chosen by whoever wrote the host, the
tournament tests the host against its author's expectations, and the failures
it finds are the ones the author already suspected. Calibration is the act of
making every parameter of the population traceable: to a source, or to an
explicit, labelled assumption.

## What the calibration contains

The calibration is a single declared document, versioned with the instrument,
holding:

- **Rates per message kind** — ordinary chatter, questions to the host,
  greetings, spam, trolling, bait aimed at a rule, injection attempts that
  claim authority, sincere disclosures of distress — expressed per viewer per
  minute or as a share of all messages.
- **How the rates scale with room size.** Per-viewer chat frequency falls as
  a room grows while total volume rises; a calibration with one flat rate per
  viewer is wrong at every size but one.
- **Archetypes** with a proportion each: the lurker who speaks once or never,
  the regular, the newcomer, the troll, the persistent baiter who rephrases
  after a refusal, the high-status viewer whose messages carry weight. Each
  archetype names the message kinds it draws from.
- **Named population mixes**, not one average: a small new channel, a growing
  one, a friendly raid's first minutes, a hostile raid. Each is an archetype
  proportion table, and the design assigns one to each room size or scenario.
- **A source per number**, with a reliability note on each source. A citation
  to published research, a measurement from the show's own or a comparable
  show's logs, or the literal label ASSUMPTION with a one-line reason and a
  pointer to where its derivation is written down. Where sources disagree,
  the rate is a range, and the scheduler samples inside it.

## Procedure

1. Write the population as numbers first, prose never. Each rate and
   proportion is a field with a value and a source field beside it.
2. Mark every unsourced value as an assumption in the document itself, not in
   a separate note. A result read later must be able to show which of its
   inputs were guesses (law: [unmeasured-is-not-pass](../../../../_laws.md#unmeasured-is-not-pass)).
3. Let a deterministic, seeded scheduler draw arrivals and message kinds from
   those rates. Generate the bulk of the room — lurkers, emotes, votes,
   generic chatter — statistically from sourced example lines, with no model
   call. A model writes only the featured viewers who carry a conversation,
   in one batched call per tick, filling slots whose kind, speaker and moment
   are already fixed. Record the seed with the run.
4. Give each archetype a short behavioural brief, written in plain terms and
   checked against real examples, because the model writing the words will
   amplify any directive it is given. "Asks the same thing again in different
   words after being refused" produces a usable baiter; "be relentlessly
   hostile" produces a cartoon.
5. Run at several room sizes an order of magnitude apart, re-deriving the
   rates for each size from the scaling rule rather than multiplying viewers.
6. When real stream data exists, replace assumptions with measurements first,
   in order of how much each assumption moves the results.

## Decision rules

- **When a rate has no source, label it — never leave it blank and never
  silently pick a round number.** A blank becomes a default, and a default is
  an unlabelled assumption.
- **When the model and the scheduler disagree about what kind of message a
  slot is, the scheduler wins.** The model's text is checked against the slot
  kind; a slot meant to be bait that came out friendly is regenerated or
  logged, because a population whose kinds drift with model mood is no longer
  the calibrated one.
- **When simulated viewers never leave, never get bored and never repeat
  themselves, the simulator is too compliant.** Real rooms churn. Model churn
  explicitly — arrivals, departures, silence — in the scheduler.
- **When a result depends heavily on one assumed rate, report that dependence
  with the result.** A red-line rate driven by an assumed injection frequency
  is a statement about the assumption as much as about the host.

## Failure modes

The **cast of characters**: a handful of vivid personas, each written as a
prompt, with no rates at all. It produces memorable transcripts and no
transferable number. The **politeness ceiling**: simulated viewers are more
formal, more articulate and more cooperative than real chat, so a host that
handles them well may still be lost in real, fragmented, typo-ridden chat;
some share of slots should be written to the register of real chat, not of
a model's best prose, which is what per-archetype example lines are for. The
**assumption hidden in a list**: an assumed value tagged with real sources
beside the assumption label, so a reader cannot tell which part of the number
was measured; when a value mixes sources and assumption, say which part is
which. The **frozen calibration**: a population sourced once
and never revisited, which slowly tests a room that no longer exists.

## When not to use it

A narrow regression check on a single rule — "does the host still refuse this
exact injection" — needs a fixed scripted input, not a population. Calibrate
when the question is how the host behaves in a room; script when the question
is whether one behaviour still holds.

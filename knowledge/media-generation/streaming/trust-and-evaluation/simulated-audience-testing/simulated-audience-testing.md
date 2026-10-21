---
layer: golden-path
type: golden-path
subject: simulated-audience-testing
status: forged
use_when: [testing a generated live host before it meets a real audience, choosing a model tier for a live show, reading the results of a simulated-stream tournament, building a synthetic chat audience or a situation bank]
techniques:
  - sourced-population-calibration
  - situation-bank-with-near-misses
  - blind-judge-on-another-tier
  - verdict-states-beyond-pass-fail
  - instrument-hash-never-merge
  - cheapest-passing-tier-selection
---

# Simulated audience testing

A generated live show cannot be tested the way a recorded one can. A recorded
piece has a fixed input — a script, a brief, a timeline — and the output can be
graded against it. A live show's input is the audience: a room of strangers who
arrive while the host is talking, who chat over each other, who try to break it,
who are sometimes genuinely in trouble, and whose behaviour changes with how many
of them there are. The only way to learn how a host behaves in that room before
real people are in it is to build the room. This subject is the discipline of
building it honestly: a **synthetic audience** whose composition is sourced, a
**situation bank** that probes the host on purpose, a **judge** that reads the
transcript without being steered by the thing it judges, and a **way of reading
the results** that never claims more than was measured.

The principal practitioner's core belief is that **a simulated stream is an
instrument, not a rehearsal**. A rehearsal is watched and felt; an instrument
produces a number, and a number carries obligations — what it was measured
against, how many observations stand behind it, and which version of the
instrument produced it. The naive reading treats a batch of simulated streams as
a demo reel: someone watches a few transcripts, likes most of them, and ships.
That reading fails in three predictable ways. The audience was the author's
imagination of an audience, so the host was tested against exactly the inputs its
author already expected. The judge was the same model as the host, or read the
host's own instructions, so it graded intent instead of behaviour. And every run
that crashed, timed out or never met the situation it was meant to test quietly
became a pass, because nothing in the pipeline could say "this was not measured".

## Who owns what, next door

Three neighbours share this ground, and the seam with each is sharp. The
software discipline of evaluating model calls — pinned scenarios, repeated
trials, judge stability, comparability across versions, the economics of an eval
run — is the eval-harness subject, and everything machine-shaped about running a
tournament is inherited from it unchanged. This subject owns what that machinery
cannot know on its own: what a synthetic *live audience* must be for its verdicts
to transfer to a real room, which situations a live host must be provoked with,
which verdict states a live run can end in, and how a show's results are read
into a decision. Grading a single generated artifact against its brief — counts,
vetoes, two-grader disagreement, regrading without regenerating — is
[generated-output-grading](../../../visual-generation/generated-output-grading/generated-output-grading.md); here the artifact is a ten-minute interaction whose
input was itself generated and adversarial, and the grade is per rule, per
situation and per run rather than per render. Bounding how far a model's
judgement may move a number on a live production path is judgment-guardbands;
the judge here works offline, before launch, and its discretion is bounded by the
rubric's shape and by blinding rather than by a numeric band. The rule a reader
uses to pick: if the question is "is the harness repeatable", read eval-harness;
if it is "is this one output acceptable", read generated-output-grading; if it is
"would this host survive a real room, and which configuration should go live",
read this.

## The audience is a sourced population, not a cast of characters

A synthetic audience is a population model: how many viewers, how often each
kind of message arrives, how those rates shift with room size, and which
archetypes — the lurker who speaks once, the regular, the troll, the person
baiting the host into saying something it must not, the injector who pretends
to hold authority, the sincerely distressed viewer — appear in what proportion.
Every one of those rates is either **sourced** (from published research on
live chat, from the show's own past streams, from a comparable show's logs) or
**labelled as an assumption** in the calibration itself, where any reader of a
result can see which numbers were guessed (sourced-population-calibration).

The load-bearing craft decision is to keep the population's *statistics* out
of the language model's hands. A model asked to "play a troll" plays a
caricature of a troll — louder, more on-the-nose and more persistent than the
real thing — and a model asked to play a viewer is too polite, too formal,
never leaves and never gets bored. So a deterministic scheduler decides *when*
a message arrives and *what kind* it is, drawn from the sourced rates with a
recorded seed; the model only writes the words for a slot whose type was
already chosen. Most of a room needs no model at all: lurkers' single lines,
emotes, votes and generic chatter are drawn from sourced examples, and only
the few featured viewers who carry a conversation are written by a model, in
one batched call per tick. Rates are reproducible and auditable; prose is
varied where it matters. Invert that, and the audience's composition becomes
an emergent property of a prompt, which nobody can calibrate.

A calibration is several named populations, not one average room: a small
new channel, a growing one, the minute a friendly raid lands, a hostile raid.
The failures that matter cluster in the unusual minutes, and an average room
never contains them.

Room size is an axis, not a constant. A host that is charming to three viewers
can drown at three hundred, and a moderation stack tuned for a busy room can
make a small room feel dead. Test at least three sizes an order of magnitude
apart, because the behaviours that break — picking, pacing, attention share —
break at different scales.

## The situation bank probes both sides of the edge

Ambient chatter tests pacing and charm; it almost never tests the rules.
Rules are tested by **situations**: scripted provocations injected into the
stream at scheduled moments, each naming the rule it probes and the behaviour
that would pass. A disclosure of self-harm. A request to repeat a slur spelled
out letter by letter. A viewer claiming the owner changed the rules. A request
for a real person's address.

A bank made only of violations rewards a host that refuses everything. The
counterweight is the **near miss**: a situation that looks like a violation and
is not — dark humour the show permits, a viewer asking to be roasted, a crude
but harmless joke — where the passing behaviour is to play along
(situation-bank-with-near-misses). Violation and over-refusal are two axes,
reported separately and never averaged, because a host that is twice as safe
and twice as joyless has not improved; it has moved along a trade-off the
owner never chose. A near miss usually still carries the rule it sits beside
— a requested roast is also a test of whether the roast stays off identity —
so one stimulus probes both sides of the edge at once.

Rules come in two provocation kinds. Some can be broken at any moment — a
slur, explicit content — and are judged over the whole run. Others need a
stimulus, and a rule whose stimulus never arrived (or arrived so garbled that
it did not perform the behaviour) was never tested; the bank and the judge
must make that visible rather than counting the silence as compliance.

## The judge reads behaviour, not intent

The judge is a model reading a finished transcript against a rubric. Three
properties keep it an instrument (blind-judge-on-another-tier). It is **blind
to the host's instructions**: it sees the rubric, the transcript and the ledger
of which situations fired, never the host's constitution or system prompt —
a judge that reads the instructions grades what the host was told to do, and
reads a well-phrased refusal as compliance with an intention rather than as
behaviour. It is **a different model, on a different tier, from the host it
judges**, because judges measurably prefer text that resembles their own. And
it is **pinned**: rubric, model, parameters and prompt are part of the
instrument's identity, so a changed judge is a changed instrument.

Two more properties follow from what the judge reads. The transcript is
**untrusted input to the judge too**: the simulated chat is full of injection
attempts written for the host, and a line claiming to be the harness or
carrying a verdict will steer an unfenced judge. And **the model proposes,
the harness disposes**: every pass or fail must cite a transcript line and an
exact quote, the harness verifies each quote mechanically, and a claim that
does not verify becomes not evaluable rather than a verdict. Provocation is
decided the same way — by the ledger of what was injected, whatever the model
says.

The rubric itself has two kinds of row. **Hard rules** are binary — red lines,
plus each situation's required response — and are held at a full pass bar;
**quality facts** are small, checkable statements about sampled host turns
("addressed a viewer by name", "no silence longer than the ceiling"), reported
as rates and never gating. Neither kind is a scale. Judges calibrate a scale
differently from one transcript to the next, and a count of true facts is
comparable where an average of impressions is not.

The judge is also the slowest and often the most expensive part of the run.
A transcript that takes minutes to judge needs a timeout sized from the judge's
*measured* tail latency with headroom, and a judge that does not finish has
produced no verdict — which is the next rule.

## A verdict that was not measured is not a pass

A simulated run can end in more states than pass and fail, and each must be a
named state (verdict-states-beyond-pass-fail). A rule whose triggering situation
never occurred is **not provoked**. A rule the judge could not decide from the
transcript is **not evaluable**. A transcript the judge never finished is
**judge pending**; a judge that answered but abstained, refused or returned
something unparseable is **judge void**, a content outcome of the judging
itself. A run whose engine crashed, or whose model provider ran out of quota,
is **engine failed**. None of these is ever counted as a pass, and the
infrastructure states are never counted as a content verdict either: a
provider outage is not evidence that the host misbehaved, and scoring it as a
void or failing verdict corrupts the very comparison the tournament exists to
make
([_laws: unmeasured-is-not-pass_](../../../_laws.md#unmeasured-is-not-pass)).
The report carries coverage next to every rate — of the rule-checks planned,
how many reached a verdict. A pending run is re-judged, never re-run, because
its transcript is sound and a new stream would be a different performance; an
engine-failed run is re-run after the outage passes. Neither is re-labelled.

## One instrument per comparison

The instrument is everything that shapes the number and is not an axis of the
design: the audience calibration, the situation bank, the rubric, the judge
model and its prompt, the harness code that schedules and scores — and the
host's own held-constant inputs, its persona documents, rules, moderation
lists and format tables, because a host whose rules changed between two
batches is two hosts. Hash it, stamp the hash on every result, and **never merge
results across hashes** (instrument-hash-never-merge). Two runs judged by
different judges, or provoked by different banks, produced two different kinds
of number; pooling them produces a third kind that describes no instrument at
all. When a slice had to be measured differently — a larger model that could
not be judged by an even larger one, say — it is reported beside the main table
with its instrument named, and nobody ranks across the gap.

## Reading the results honestly

A rate is never reported without its n, and small n deserves bounds, not point
estimates. Zero failures in a few hundred checks does not mean a zero rate: at
95% confidence, zero events in n trials bounds the true rate at roughly 3/n,
and an interval that behaves at the edges (a score interval rather than the
textbook normal approximation) is the right default for rates near zero or one.
The subtler trap is **clustering**: the dozens of facts judged inside one run
share a host, a seed and a room, so they are not independent observations. A
bound computed over pooled facts overstates precision; the honest effective
sample size is much nearer the number of runs than the number of facts, and
the per-run spread is the figure to look at before believing a pooled
difference. The trap reopens downstream: a rule judged once per run has a
sound bound, but a total over a cell's rules does not, and a view that reads
only tallies cannot tell which checks shared a run. Such a total is counted,
not bounded (cheapest-passing-tier-selection).

A measure that stays flat across model tiers is set by the machinery around
the model — message picking, rate caps — and a larger model will not move it.

Choosing what goes live is then a short rule (cheapest-passing-tier-selection):
hard rules gate first, quality ranks second, and cost decides among what
remains — computed per usable stream, not per call
([_laws: cost-per-usable-output_](../../../_laws.md#cost-per-usable-output)).
A configuration with any hard-rule failure in the tournament does not win on
quality, however good it looks, and a winner chosen on thin n is labelled
provisional where it is reported.

## What simulation cannot tell you

A synthetic room is a floor and a regression gate, never a launch certificate.
It finds the failures its author's population and bank can reach; real
audiences invent attacks and sincerities nobody scheduled. The calibration is
therefore living: real streams, once they exist, replace assumed rates with
measured ones, and every failure seen live becomes a situation in the bank, so
the next tournament can reach it.

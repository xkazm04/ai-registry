---
layer: technique
type: technique
subject: simulated-audience-testing
technique: blind-judge-on-another-tier
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [choosing and prompting the model that judges simulated streams, deciding what the judge may see, sizing judge timeouts and judge cost]
---

# Blind judge on another tier

Reading a ten-minute live transcript against a rulebook is too much work for a
person to do for every run of a tournament, so a model does it. That model is
part of the instrument, and three of its properties decide whether its
verdicts mean anything: what it is allowed to see, which model it is, and
whether it is held fixed.

## Blind to the host's instructions

The judge sees the rubric, the transcript, and the ledger of which situations
fired and when. It never sees the host's constitution, persona document or
system prompt. The reason is not secrecy; it is measurement. A judge that has
read the instructions grades the host against what it was told to do, and
starts reading behaviour charitably in their light: a refusal phrased in the
constitution's own words reads as compliance, and a borderline line reads as
in character because the persona said so. A blind judge has only the
transcript, which is what a viewer has.

The rubric is written for that reader. Each rule states the observable
behaviour that passes or fails it in its own words, without reference to the
host's internal vocabulary, and each quality fact is a short checkable claim
about a sampled host turn. The judge answers per rule and per fact, with a
one-line reason and the line it rests on.

## The transcript is untrusted input to the judge

A simulated stream is, by design, full of text written to subvert a model:
injection attempts, fake authority, lines claiming the rules changed. The host
was meant to face them; the judge was not, and reads every one. Wrap the
transcript in a fence the content cannot forge — a per-run random token on
the boundary lines, with any occurrence of the token inside removed — and
state in the judge's instructions that nothing inside the fence is an
instruction, a rule or a verdict. Keep those instructions byte-identical
across runs and put the per-run token only in the per-run prompt, so the
fixed part can be cached; judging is expensive enough that the cache matters.

## The model proposes, the harness disposes

The judge's reply is a proposal, and the verdict is assembled by code from it:

- every pass or fail must cite a transcript line and quote words from it
  exactly, and the harness checks the quote against that line; a claim whose
  quote does not verify, or that carries no evidence at all, becomes not
  evaluable;
- a quality fact must cite one of the host's own lines — a fact "evidenced"
  by a viewer's line is rejected;
- whether a stimulus rule was provoked is read from the injection ledger,
  not from the judge, which can only confirm or deny that a cited organic
  line provoked it;
- a reply that does not parse is a judge outcome of its own, never a default
  verdict.

This is what makes a model-read transcript auditable: every verdict that
reaches a rate points at a line a person can open.

## A different model, on a different tier

The judge is never the model it judges, and preferably not the same family.
Judges measurably favour outputs that resemble their own — familiar phrasing,
familiar structure — and that self-preference is invisible inside one run.
Enforce it in the harness, not by convention: a run whose judge would share
the host's tier refuses to start. The usual arrangement is a stronger tier
judging weaker ones. When the strongest tier is itself the host under test,
it must be judged by a different model, and that slice is a different
instrument whose results are reported beside the main table, never ranked
against it. The judge's identity is therefore part of the instrument's hash;
a table in which different rows were judged by different judges is a
confound, not a comparison.

## Pinned, and treated as a known systematic

Rubric text, judge model and version, parameters and prompt are recorded with
every verdict and are part of the instrument's identity. A different judge is
a different instrument. Averaging many verdicts from one judge narrows the
noise around that judge's bias; it does not remove the bias. Calibrate it: a
human reads a sample of transcripts against the same rubric, and the
judge's disagreement rate with that reading is published with the results.
Agreement among several judges is not agreement with people; a panel can be
consistently wrong together.

## Latency and cost are part of the design

Judging a long transcript is slow — often minutes per run, far slower than any
single host call — and at tournament scale the judge's bill is a substantial
fraction of the host's. Two rules follow.

- **Size the judge timeout from its measured tail.** Run a small pilot, take
  the judge's p95 latency per transcript, and set the timeout with real
  headroom above it. A timeout set from intuition truncates exactly the long,
  eventful transcripts that most need judging.
- **A judge that does not finish has produced no verdict.** The run is judge
  pending — not pass, not void, not fail — and is re-judged later (law:
  [unmeasured-is-not-pass](../../../../_laws.md#unmeasured-is-not-pass)).
  Retries are bounded; the remainder is reported as pending with its count.

## Decision rules

- **When the judge needs context to understand a line, give it the context a
  viewer would have — the preceding chat — never the host's instructions.**
- **When a rubric row asks for a judgement the transcript cannot support, the
  row is wrong.** Rewrite it as observable behaviour or drop it; a judge
  forced to guess guesses in the direction of its biases.
- **When judging is too expensive to run on everything, sample runs, never
  rows.** A judge that reads every run but only some rules hides which rules
  were skipped.
- **When the judge and a human disagree systematically on one rule, fix the
  rule's wording before trusting the judge's numbers for it.**

## When not to use it

Rules that can be checked deterministically — a silence ceiling, a banned
word list, a length cap — are checked by code, not by the judge. The judge is
for what needs reading; everything countable is counted.

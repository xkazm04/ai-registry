---
layer: technique
type: technique
subject: performance-root-cause-diagnosis
technique: thresholds-mirror-the-prompt
status: forged
laws: [label-convention-as-convention, one-target-one-threshold]
shared_with: []
use_when: [a prompt defines causes in words and a program must pick the same cause, a demo and a live diagnosis disagree about one dataset, tightening a diagnostic rule]
---

# Thresholds mirror the prompt

A diagnosis that a model phrases needs a deterministic twin: the same cause set, picked
by predicates over the same numbers, used as the demo output when no model is
connected, as the floor when the model leaves the cause empty, and as the check that
the model's verdict is one the numbers support. The technique is that every
qualitative rule in the prompt has exactly one named threshold in code, the two sit
next to each other with a comment saying they move together, and neither is edited
alone.

## The pairing

Each cause definition is written twice:

- In the prompt, as the sentence a practitioner would say: "a substantial share of
  the budget flows to campaigns without conversions"; "efficiency is getting worse
  against the previous period - costs grow faster than conversion value"; "one network
  carries a large part of the cost at a markedly worse return than the other".
- In code, as a named constant with its predicate: a waste share of 0.25; a cost rise
  of 0.15 with value growth under 0.5 of it; a return below 0.6 of the best network at
  a spend share of at least 0.25.

The constants are named for the rule they mirror, commented with the prompt sentence
they encode, and declared in one place. The prompt sentence is deliberately
qualitative - "substantial", "markedly" - and the constant is deliberately exact; the
model reads the words, the program reads the number, and the reconciliation in a
review is by eye: does 25% deserve the word "substantial" here? Every one of these is a
practitioner convention, and the constant's comment says so, so that nobody later
cites it as measured
([label convention as convention](../../../_laws.md#label-convention-as-convention)).

**When a cause is defined in a prompt, define its deterministic predicate in the same
change, with a named threshold beside the prompt text, because a rule that exists only
in words has no floor and no demo, and a rule that exists only in code diagnoses
something the model was never told about.**

## What the twin is for

1. **The demo.** With no model connected, the deterministic pick plus a templated
   sentence per cause is the output, tagged as illustrative. It has to be the same
   verdict the model would reach on the same numbers, or the demo teaches the owner a
   tool that the live product then contradicts.
2. **The floor.** When the model returns an empty or unrecognised cause, the
   deterministic pick fills it. The fallback must be tail-free - no "connect a model"
   disclaimer leaking into a billed live diagnosis.
3. **The check.** A model verdict that the predicates reject is a signal worth logging:
   either the prompt wording and the constant have drifted, or the model was steered by
   free text in the data.
4. **The consistency across surfaces.** The panel, the digest and the demo all read one
   predicate; three surfaces cannot show three causes of one portfolio.

## Decision rules

- When a threshold is tightened, edit the prompt sentence in the same commit and
  re-prove the model's output against the change; the pair is one rule.
- When a threshold is a currency amount, convert the rule to a ratio or label it as
  market-specific. A cost-per-lead floor in one currency assumes a market; a share of
  spend does not. The lead-source instance carries currency floors and says so; the
  portfolio instance is ratio-only by construction.
- When a model returns a cause outside the set, coerce to the deterministic pick, not
  to a fixed catch-all. A catch-all is the answer the ladder gives when nothing else
  fires; it is not the answer to "the model said something unknown".
- When the deterministic twin and the model disagree on a live diagnosis, show the
  model's (it may have read a nuance the predicates cannot) but derive severity from
  the cause shown, so the badge matches the text.
- When a prompt carries a target ratio the business never supplied - "the goal is a
  ratio of three or better" - it is an external benchmark and violates the no-benchmark
  rule the persona states. Either the business agreed the target, in which case it is
  data and rides the request, or it is convention, in which case the prompt says so and
  the deterministic twin labels it. The tree this subject was reconciled against
  carries one such benchmark in its cohort instance, and the standard does not follow.

## When NOT to use

- When the prompt's rule is genuinely judgement - "the retention curve's shape
  suggests weak activation rather than slow churn". A shape reading has no clean
  predicate; do not fake one. Keep the judgement in the prompt and the outcome metric
  in the snapshot.
- When the closed set changes so often that pairing every rule is churn. That is a
  sign the cause set is not settled, and the ladder should not ship until it is.
- For thresholds another subject owns. The severity cut-offs are the triage
  discipline's constants; mirror them by import, never by a second copy.

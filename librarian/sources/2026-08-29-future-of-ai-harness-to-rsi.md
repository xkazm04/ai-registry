---
source: youtube:T6HLeCiUyI0
kind: second-hand survey (one commentator digesting two papers and his own prior videos)
url: https://www.youtube.com/watch?v=T6HLeCiUyI0
title: "The Future of AI (From Harness to RSI)"
author: Discover AI (single voice)
words: 8162
extracted: 10
accepted: 1
declined: 0
leads: 2
already_covered: 5
untriaged: 2
dispatched: 0
fetches_spent: 0
---

# A commentator's theory-of-everything about harness optimization

Part of [[index]].

## The class, and the expected yield

Single author, no code, no measurements: a digest of a harness-optimization benchmark
and a "search-policy-in-the-model" paper, framed as a four-stage history of AI ending
in recursive self-improvement. Reliable for *that* two papers exist and roughly what
they claim; unreliable for every rule it states, which it states with total confidence
in a notation it invented at breakfast. The strip test survives unusually often here
because the source is almost free of product names - the cost is that what survives is
mostly the textbook (expected value over runs, search is not gradient descent).

Expected yield stated before triage: catches and leads, at most one amendment. Actual:
one amendment, two leads, five catches, two untriaged, **0 of 3 fetches** - ninth
consecutive zero-fetch run, but the first where the class predicted the fetch would be
the extraction and it still was not needed, because the finding was corpus-internal
(a missing stage) and the papers were only ever leads.

## Landed

**Amendment to `failure-attribution`** (eval-harness): "The change is an experiment,
and it is designed before it is run." Attribution ended with a class and an owner;
re-attribution began after a change; nothing owned the step between - how many
components change per round, whether the model is pinned while the harness moves,
whether the prediction is written before the run, whether the parent is kept. The
source's contribution was the *generalization*: the game-production bundle already
carried the one-strategy-per-variant, hypothesis-in-the-metric rule for prompts
(`prompt-fitness-and-evolution/mutation-taxonomy`), and the source's decomposition of a
harness into named components (instructions, tools, memory, context, control flow,
verifiers, budget/stopping) is what makes the same rule apply to every one of them.
Corroboration: cross-bundle convergence (an independent forge reached the prompt form)
plus one-factor-at-a-time experimental design from training data. No cross-bundle link;
the discriminator is stated in the subject note. The source's own worked example
(verification stage + one repair) was kept as the illustration because it is the
cleanest hypothesis-vs-modification pair in the transcript [00:31:34]-[00:32:24].

## Already covered

- **Score is an expectation over repeated runs, with outliers and evaluator noise
  surrounded** [00:05:11] - golden path "Repeatability is engineered, not assumed" and
  `judge-stability`; game-production `min-trials-and-confidence-banded-conclusion`.
- **The evaluator need not be a code sandbox; any verifiable environment feeds back**
  [00:21:37] - `assertion-vs-judgment` already splits the oracle kinds.
- **Add a verification stage, permit one repair** [00:31:34] - landed yesterday as
  `quality-gates/oracle-frozen-during-repair`, with the half the source omits: the
  oracle is frozen while the repair runs.
- **Skill and memory files exist because the model is stateless** [00:17:40] -
  `agent-instruction-files`, `agent-memory`.
- **Harness decomposition into prompts, skills, tools, memory, context, control flow,
  verifiers, budget/permissions/stopping** [00:27:43] - the corpus carries each as its
  own subject under `llm-agent`; the enumeration is the bundle's table of contents.

## Leads

- **The two primary papers** - a harness-optimization benchmark ("HarnessOpt" per the
  source) and a search-policy paper ("ReSearch") [00:18:59], [00:45:20]. The source
  is a lossy pointer; the papers would state the protocol, the component taxonomy and
  the measured gains the amendment currently cites from training data. *Return when*:
  a connected project builds an optimizer loop over its own harness, or a second
  independent source names either paper with a measured result.
- **Optimizer architecture vs optimizer state** [00:46:38] - the source's own boundary
  for "recursive": a loop that modifies the *state* its harness produces is not
  self-improving until the object produced at round t becomes the optimizer at t+1.
  Possibly a doctrine-grade distinction for `unattended-build-loop` or a future
  self-modifying-agent subject; nothing in the corpus needs it yet. *Return when*: a
  connected project lets an agent rewrite its own instruction files or hooks from its
  own run evidence - then the architecture/state line is the safety boundary.

## Untriaged

Extracted, reached the table, never verified by anyone.

| Candidate | Anchor | Why it was not picked |
| --- | --- | --- |
| The model as a semantically informed search policy: transform the representation of the search space rather than enumerate it | [00:26:00] | Thin - a metaphor with no decision rule; nothing acts on it |
| Harness optimization is search, not back-propagation; do not expect gradient intuitions to transfer | [00:34:07] | Doctrine, cited inside the amendment's closing paragraph; not verified as a standalone claim |

## Declines

None - nothing was picked and then rejected.

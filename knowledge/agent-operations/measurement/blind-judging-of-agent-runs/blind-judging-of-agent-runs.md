---
layer: golden-path
type: golden-path
subject: blind-judging-of-agent-runs
status: draft
use_when: [scoring agent runs with model judges, designing the packet a judge reads, deciding how many judges and from which families, re-scoring after the measured facts change]
techniques:
  - provenance-scrubbing
  - facts-beside-the-work
  - withhold-rather-than-half-judge
---

# Blind judging of agent runs

Once a run has cleared the mechanical bar, the remaining question — was this worth keeping
— needs a reader. Model judges make that affordable at fleet scale, and they bring three
well-replicated biases with them: they reward length, they reward outputs styled like
their own, and they reward confidence. None of these average out; each is a constant, and
a constant survives any number of samples.

The discipline that makes judged scores usable is therefore not "ask a strong model". It
is: **hide who produced the work, show the measured facts beside it, use judges from more
than one vendor family, and never record a verdict the intended panel did not produce.**

## What the judge must not know

A judge that can identify the producer is no longer scoring the work. Provenance leaks
through more channels than an author name: the working directory, a configuration
identifier in a path, a runner's characteristic phrasing, a tool banner in a transcript.
Scrubbing is mechanical, applied to everything the judge sees, and it has an important
exception — a repository's own filenames and directories may legitimately contain vendor
words, and rewriting those makes the material unreadable for exactly the tasks that are
about them. Scrub names where they identify a producer, not where they name a path.

## Facts beside the work, not instead of it

The judge reads the task, the diff, the artefacts and the run's own summary — and the
harness's measured facts: gates, contract, overrides, leftovers, citations that resolve.
Those facts are stated as measured and true, because they were. Reviewers shown a clean
narrative and no facts rate confident work highly; the same reviewers shown "this run
committed 39 files the repository excludes" reject it. Both responses are correct for what
was in front of them, which is why the packet, not the reviewer, is the thing to get right.

A packet also reveals dishonesty that no single artefact shows: the run's own summary sits
next to the facts, and a summary that claims a clean run against facts that say otherwise
is the most decision-relevant signal in the whole exercise.

## More than one family, or say so

At least one judge comes from a different vendor family than the agent. Where that is
impossible — a seat exhausted, a provider down — the verdicts are still worth having, and
they are labelled single-family and provisional rather than mixed into the record. Never
substitute a second judge from the same family and present the result as a panel.

When the panel cannot be assembled at all, record nothing. A verdict from half the intended
judges is not a partial verdict; it is a different measurement with the same name, and a
report that averages the two is silently comparing apples with a different fruit.

## Verdicts are re-formed when the evidence changes

A judge's verdict is a function of the packet. When the harness's facts change — a fix
reveals an override nobody was shown, a gate result is corrected — the packets change, and
verdicts formed on the old packet no longer describe the run. Re-judge exactly those, keep
the rest, and record both scores: the movement between them is itself evidence about what
the panel weighs.

## What judged scores are for

They rank eligible candidates and nothing more. They do not establish that one configuration
is better than another by a fraction of a point, they do not survive being quoted without
their rubric, and they never overturn a mechanical fact. A fleet that lets a high score
excuse a failed check has built an expensive way to be talked into things.

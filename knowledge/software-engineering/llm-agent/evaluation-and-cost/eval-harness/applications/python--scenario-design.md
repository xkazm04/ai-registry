---
layer: application
type: application
subject: eval-harness
technique: scenario-design
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3
applied: simulation
ab_verdict: not-better
proof: structural-only
---

# A fully fabricated world that does not seed away the stage it is measuring

This tree fabricates a year of one user's messages and tasks with ground truth
attached to every fact, replays it day by day under an injected clock, and asks
the same probes of every memory backend on a baseline ladder. Every element of
the environment is synthetic and every probe's answer is knowable by
construction, which is the exact shape the technique's seeded-environment
section warns about: an environment built so the precondition of the
interesting behaviour always holds, producing a number one stage narrower than
the claim it will be quoted for.

Applied here, the warning does not land, and the reason is worth recording
because it is the design that avoids the trap rather than an argument that the
trap does not exist.

## The stage that is usually seeded away

For a memory system the precondition is *the answer is in the record and still
current*. A suite that generates only probes meeting that precondition measures
retrieve-and-answer, and reports it as though it measured knowing.

This world generates the complement on purpose. Facts carry
`valid_from` / `valid_to` and supersession, and where a fact has expired the
generator emits a probe in an `expired` class whose gold answer is `UNKNOWN`,
carrying the superseded value separately as the wrong answer to watch for. The
consumer's prompt permits abstention explicitly, and its own comment says why
this is not politeness — an answerer forbidden from abstaining cannot express
the state the probe is testing. The judge has a distinct verdict for stating an
expired value rather than folding it into a generic miss.

So the pipeline's find-and-qualify stage is inside the scored set, not seeded
flat. The number that comes out describes answering *and* correctly declining,
which is the claim the harness makes.

## The detail that looks like the defect and is not

`memory_year/run.py` builds a work list that excludes probes whose gold is
`UNKNOWN`, which reads at first like the exclusion this technique exists to
catch. It is not: that filter is scoped to **unaided-baseline screening**, the
pass that drops probes the consumer answers correctly with no context at all.
An answerer given no context returns `UNKNOWN` trivially, so screening those
probes would discard the entire expired class as "not measuring memory" — for a
reason that is an artifact of the screen rather than a property of the probe.
Excluding them from the screen is what keeps them in the score. The main run's
timeline is assembled from all of the scenario's probes.

This is recorded because the misreading is the cheap one, and a reviewer
applying this technique to a harness with an unaided screen should expect to
meet it. The question to ask is not "are any probes filtered" but "filtered out
of which pass".

## The structural fact

The harness publishes a table mapping registry rules to the files that
implement them, and it cites this subject by name for its scenario cache key.
A tree that had adopted the subject's identity rule while seeding its
environment flat would have been the more interesting finding; it did not.
Verdict `not-better`: the technique prescribes a change this tree has already
made, and the section it would have justified was written from a different
source.

## What this application cannot tell you

Structural only — nothing was run, no report was regenerated, and no claim is
made about what the numbers say. The check is that the *expired* class exists,
is generated, is permitted by the prompt, is distinguished by the judge, and
reaches the scored timeline. Whether the class is large enough to move a
ranking is a separate question this document does not answer, and the honest
falsifier is a coverage count per probe class in a real report.

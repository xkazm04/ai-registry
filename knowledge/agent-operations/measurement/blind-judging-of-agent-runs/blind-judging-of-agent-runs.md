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
  - sealed-judge-workspace
---

# Blind judging of agent runs

Once a run has cleared the mechanical bar, the remaining question — was this worth keeping
— needs a reader. Model judges make that affordable at fleet scale, and they bring their
biases with them: they favour a candidate for where it sits in the order, they reward
length, they reward text that reads like their own, and they mark down hedged language.
Order is the best replicated of these and grows worse as more candidates share one
reading; the last rests on thinner evidence than the others. None of these average out;
each is a constant, and a constant survives any number of samples.

The discipline that makes judged scores usable is therefore not "ask a strong model". It
is: **hide who produced the work — from the judge's reach, not only from its prompt — show
the measured facts beside it, vary the order each judge reads, use judges whose errors are
not the same errors, and never record a verdict the intended panel did not produce.**

## What the judge must not know

A judge that can identify the producer is no longer scoring the work. Provenance leaks
through more channels than an author name: the working directory, a configuration
identifier in a path, a runner's characteristic phrasing, a tool banner in a transcript.
Scrubbing is mechanical, applied to everything the judge sees, and it has an important
exception — a repository's own filenames and directories may legitimately contain vendor
words, and rewriting those makes the material unreadable for exactly the tasks that are
about them. Scrub names where they identify a producer, not where they name a path — and
only a path the repository carried before the run; a guidance file the run itself created
is the producer's signature, not the repository's.

When the judge is an agent with a shell, the prompt is no longer the boundary. What it can
list is what it knows: the key one directory up, a sibling judge's verdict, the host's own
screenshots. The blind is then a staging decision, not an instruction.

Order is the one input that cannot be hidden, so it is varied instead: each judge reads
the candidates in a different order, and for an agent judge that means different labels
per seat, because a directory listing is the order it reads in.

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

Facts, never scores. A prior score in the packet — an earlier verdict, another judge's
number, the harness's own quality estimate — pulls the judgment toward itself even when it
is labelled as metadata, and neither a reasoning step nor a warning to disregard it removes
the pull. The same power that makes a true fact decisive makes a number an anchor.

## More than one family, or say so

At least one judge comes from a different vendor family than the agent. Where that is
impossible — a seat exhausted, a provider down — the verdicts are still worth having, and
they are labelled single-family and provisional rather than mixed into the record. Never
substitute a second judge from the same family and present the result as a panel.

Family is a proxy, not the property. What a panel needs is judges that do not make the same
mistakes on the same runs, and frontier models from different vendors share a great deal:
self-preference follows how familiar text reads to a judge rather than whether it
recognises its own work, and a large panel drawn from many families has been measured to
carry the information of only a couple of independent judges. So the agent's own family never holds the panel's majority,
and where there are labels to check against, the panel's error overlap is measured rather
than assumed. A panel that turns out to be one judge in several coats is reported as one.

When the panel cannot be assembled at all, record nothing. A verdict from half the intended
judges is not a partial verdict; it is a different measurement with the same name, and a
report that averages the two is silently comparing apples with a different fruit.

## Verdicts are re-formed when the evidence changes

A judge's verdict is a function of the packet. When the harness's facts change — a fix
reveals an override nobody was shown, a gate result is corrected — the packets change, and
verdicts formed on the old packet no longer describe the run. Re-judge exactly those, keep
the rest, and record both scores: the movement between them is itself evidence about what
the panel weighs. The re-judge never sees the earlier score; a movement measured against
an anchor measures the anchor.

## What judged scores are for

They rank eligible candidates and nothing more. They do not establish that one configuration
is better than another by a fraction of a point, they do not survive being quoted without
their rubric, and they never overturn a mechanical fact. A fleet that lets a high score
excuse a failed check has built an expensive way to be talked into things.

---
layer: application
type: application
subject: agent-run-budgeting
technique: ceiling-as-measurement-boundary
stack: process
status: forged
verified_on: 2026-09-16
---

# Process: one honest truncation, three fake durations and one host-killed run

Measured on a skill benchmark, 2026-09-15/16, with per-task wall-clock ceilings of 25 to 60
minutes chosen per skill.

## The ceiling behaving correctly

At the top reasoning tier, one run hit its 60-minute ceiling: a sweep-shaped skill on the
Python platform, truncated with 19 commits already made and gates green. The next-longest
run in the same population finished in 47 minutes, so the ceiling sat above the tail and
bit exactly once — a ceiling doing its job rather than selecting the population.

The harness refused to treat it as a finished run: truncation fails the mechanical bar
regardless of what was committed, so the run is reported as "hit the ceiling with 19
commits", not as a finished run that scored 6.0. That distinction matters because the run's
output was substantial; scored as finished, it would have been a data point saying this
configuration produces a lot and rates mediocre, when what it actually shows is a
configuration that does not fit inside the budget.

The same population made the cost of the top tier legible: three of that configuration's
runs were among the six longest in the whole grid.

## The host that slept, and the two artefacts it produced

The machine suspended from 23:52 to 08:36. Four runs were in flight.

**Three reported durations of about 8.9 hours against a 45-minute ceiling, with no
truncation flag** — impossible when the clock is honest, since the ceiling is what bounds
the duration. They had completed normally: exit 0, no errors, gates green, hard pass, and
where judged, 9.0 and 8.0 with both keep votes. Only the clock was meaningless. The
reporting path now derives a `wall_suspect` flag from exactly that signature (duration over
the skill's ceiling with no truncation), prints "host slept" in place of the number, and
uses the ceiling rather than the fake duration in the cost tie-break. It flagged those three
runs out of 303.

**One was killed by its own ceiling the moment the host woke** — started at 23:37,
suspended at 23:52, terminated at 09:06 with zero commits and judged 4.0 with no keep
votes, on work it never got to finish. That verdict measures the host, not the model, so
the run was moved to an archive directory and requeued for a rerun rather than kept.

## What this cost and what it changed

The three inflated durations were recoverable because the artefacts were intact; the killed
run was not, and needed a full rerun. The cheap lesson is that **a duration is a claim that
can be false**, and the check for it costs one comparison in the reporting path — while
reconstructing which results were affected weeks later, from scores alone, is impossible.

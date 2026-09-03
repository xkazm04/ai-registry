---
layer: application
type: application
subject: agent-runtime-assembly
technique: guard-input-custody
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3
applied: simulation
ab_verdict: not-better
proof: structural-only
---

# A memory harness cannot place its clock out of reach, so it detects the escape instead

The tree is a local-first evaluation harness that replays a fabricated year of
one user's messages and tasks through several memory backends and scores the
same probes against each. Its stack witness is the module invocation its own
documentation prints (`py -m memory_year.checks.clock_purity`) and the
`from __future__ import annotations` header the modules carry; there is no
version pin in the harness itself, so this document claims `python@3` and no
minor.

The technique was applied here expecting to find its defect and did not. The
verdict is `not-better` in the precise sense the ledger means: **the change the
technique would prescribe is already made, and the tree reached further than
the technique had.** That further step is now written back into the technique.

## The confinement, and why placement was unavailable

Every instant the harness uses comes from an injected clock, because the score
is defined as a pure derivation of simulated time — a backend that consults the
real clock silently changes what the agent is measured as knowing. That
injected clock is the run's confinement, and it is exactly the class of input
the technique's fifth enumeration question is about.

It cannot be placed out of reach. The backends are loaded into the harness's
own process, and a process can always call the platform's clock; there is no
namespace to put the guard in that the backend cannot also address. The custody
question was asked here and correctly answered *no*.

## What the tree does instead

`memory_year/checks/clock_purity.py` replays the same short scenario at **two
base dates** and requires the rendered recall to be identical. A backend that
honours the injection cannot distinguish the two runs; one that reached around
it to the real clock sees two different worlds and produces two different
answers. The module states the consequence in its own words: a backend whose
recall changes when only the base date moves is reading the wall clock, "and
the part of the system that decides what the agent knows is then the part with
no tests."

The comparison normalises what legitimately differs — generated identifiers and
absolute instants are both replaced before the diff, because the base-date
shift moves every instant by design and every replay mints fresh ids. That
normalisation is what keeps the check from failing for every backend and being
switched off, and it is the detail a naive version of this probe omits.

## The structural fact

The harness's own README lists the doctrine it implements as a table of
registry rules against the files that implement them, and the clock rule is one
row of it. So this is not an accident of implementation: the tree treats "a
backend that reads the wall clock fails the harness's clock test" as a
published contract of the harness, on the same footing as its budget and judge
rules.

That is the confirmation. A technique claiming a guard must be placed beyond
the governed party's reach meets a tree that could not place it, refused to
call the convention a guard, and built the detector. The technique gained a
section from it (`when placement is impossible, detect the escape
differentially`), including the normalisation condition and the honest limit —
a differential probe detects rather than prevents, runs only where a test runs,
and a component that escapes deterministically without varying with the probe
will pass it.

## What this application cannot tell you

Nothing here was executed. The claim is structural: it rests on reading the
check, its documented contract, and the harness's own rule table, not on
running the suite against a backend that cheats. The falsifier is cheap and
stated for whoever wants it — introduce a backend that reads the platform
clock, run the check, and confirm it fails; if it passes, the normalisation is
too aggressive and is erasing the signal it exists to preserve.

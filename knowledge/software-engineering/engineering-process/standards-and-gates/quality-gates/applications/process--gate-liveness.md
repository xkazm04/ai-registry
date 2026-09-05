---
layer: application
type: application
subject: quality-gates
technique: gate-liveness
stack: process
status: forged
verified_on: 2026-09-04
---

# A gate that left the inventory, and the tuning that outlived it

The technique's trigger section closes by saying that any link in the chain
can be dead while every other link is healthy, and that the observable, in
every case, is green. This repository is the case where the observable is
**nothing** — and it is the strongest available evidence for that amendment
because nobody built it to demonstrate anything. It is a twelve-year curated
index whose gate was assembled from parts the project did not own.

The version is pinned by the repository's own head commit (`f7c89aa`, 2026-04-10);
the project publishes no release, so the commit is the only witness available.

## Three decommissionings, zero diffs

The gate is one line in a hosted-CI configuration: install a link checker
from a source repository, run it over the index file. The configuration's
last edit is dated 2020-05-04 and it still reads as a working check —
well-formed, coherent, naming a real command with carefully tuned flags.

Between that date and the head commit, three things happened outside the
repository:

- the CI provider's free tier for public repositories was withdrawn;
- the code host removed the transport protocol the install line uses;
- the checker's own upstream repository began returning 404 — verified by
  fetch on 2026-09-04, and it is the one an outsider can check today.

None of the three produced a commit. None changed a file. Every
repository-local signal a reviewer would consult still reads healthy, which
is precisely the substitution the technique's first amendment obligation
forbids: **well-formed is not alive.**

## The window, measured

The repository accepted **65 further commits to the checked file** between
that last CI edit and its head, the most recent dated 2026-04-10 — six years
of link contributions under a gate that could not have run for any of them.

Nothing rendered the absence. The index carries no build badge; there is no
`.github/workflows` directory and there never was one, so no required check
existed either. To a contributor opening a pull request, a gate that never
runs and a gate that always passes are the same experience — a merge button
with nothing in the way. The technique's standing metric, *time since last
red per gate*, cannot fire here: the metric is defined over a gate inventory,
and this gate did not age within the inventory, it left it.

## The structural fact: the tuning is the headstone

The part nobody designed, and the reason this application is worth more than
the count above. The only surviving in-repository evidence that the gate ever
ran is its **tuning** — a six-code accept list and a nine-host exemption
list, each entry added in its own commit naming the host or status that
provoked it, each one a record of a real failure someone diagnosed.

Those artifacts are indistinguishable, by inspection, from the configuration
of a working gate. They are in fact configuration for a program that can no
longer be installed. A reader auditing this repository for gate health would
find the *most* convincing evidence of a live, well-maintained check —
years of careful, specific, hard-won tuning — in the one project where the
check has not executed since before most of that file's current content was
added.

The corollary for anyone auditing gates from the outside: accumulated tuning
is evidence that a gate *once* ran, and it is systematically mistaken for
evidence that it runs. The two are separated only by asking the provider,
which is the amendment's third obligation and the only one no
repository-local check can satisfy.

## What this realization cannot do

Two of the three decommissionings are attributed from platform history rather
than observed in this run; only the checker repository's 404 was fetched. The
conclusion does not depend on which of the three killed the gate first — the
absence of any workflow directory and of any badge is sufficient on its own,
and both are facts about the tree — but the timeline's precision should not be
read as measured. Nor can anything here say whether the index's links are in
worse shape than a gated project's would be; that would need the sweep this
repository has no way to run.

---
subject: ci-execution-trust
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# ci-execution-trust

First touch: 2026-09-03, an `/intake` run over a doctrine corpus ([[2026-09-03-rusttraining]]).

## State

5 techniques unchanged, +1 amendment, +1 application.

**Amendment to `secret-materialization-discipline` — the ladder ended one rung
early.** It climbs to "prefer a credential the build never holds at all" (workload
identity) and calls that "strictly better than everything above". The rung above:
**a job restructured so it has no reason to hold one.** The source's container
workflow builds and never publishes, deliberately holding no registry credentials,
because the risk being managed is silent rot of a recipe nobody runs, not delivery.

Generalised to validate-vs-deliver jobs, with the instruction to state the
reasoning at the job definition — otherwise the next maintainer "finishes" the
pipeline by adding the publish step. Inverts where the artifact itself is the
deliverable: you cannot decline to publish what people consume.

## Application

`rust--secret-materialization-discipline`: the credential is **absent, not
withheld** — publishing would require three visible additions, not a flag flip. The
workflow's own path filter includes the workflow file, which is the tell that the
recipe is an input rather than scaffolding. What the tree could not have been built
to prove: it holds no credentials at all, and yet it demonstrates the question this
technique's ladder implies and never states — whether the job needs to be a
publishing job.

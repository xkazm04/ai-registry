# Laws — agent operations

Cross-cutting invariants of running unattended agents against real repositories.
Techniques cite these by anchor; they are not subjects and get no folder.

## <a id="a-refusal-is-not-a-result"></a>A refusal is not a result

A run that never happened — a seat that refused it, a provider at capacity, a host that
suspended it until its own ceiling killed it — is requeued, never scored. The moment such
an outcome is allowed into the results it becomes a measurement of the vendor's queue
wearing a model's name, and every aggregate over it is wrong in the direction nobody
checks. Detection must read whatever the runner actually returns: the refusal may arrive
labelled as a success, with the reason only in the text.

## <a id="measure-the-tree-not-the-summary"></a>Measure the tree, not the summary

What a run claims in its final message is evidence about the run's honesty, never
evidence about the repository. Every fact a verdict rests on is recomputed from the tree
itself — the commits, the gates, the files left behind, the rules the repository declares.
A harness that reads the summary is grading prose.

## <a id="the-judge-never-grades-its-own-family"></a>The judge never grades its own family

A verdict on a run is produced by at least one judge from a different vendor family than
the agent, because self-preference is a constant, not noise, and a constant survives
averaging. When only one family is available the verdicts are still worth having and are
labelled single-family and provisional, never quietly merged with cross-family ones.

## <a id="the-repository-outranks-the-instruction"></a>The repository outranks the instruction

Where a task's instruction and the repository's own declared rules disagree, the
repository wins and the run says so. A repository that excludes a path from version
control has decided that path is private; an instruction to commit that kind of artifact
does not overturn the decision, and a run that forces it commits someone's private
material into a published tree.

## <a id="the-harness-is-a-suspect-in-every-red"></a>The harness is a suspect in every red

Before a failure is attributed to a model, the environment it ran in is cleared: shared
build caches, links into real trees, a suspended host clock, a stale artifact from a
sibling run. Attribution without that step produces confident findings about models that
are actually findings about the bench, and they are the hardest kind to retract because
they look like data.

## <a id="a-ceiling-is-a-measurement-boundary"></a>A ceiling is a measurement boundary

Every ceiling a fleet enforces — wall-clock, tokens, attempts — is part of the
measurement, not an operational detail. A run that hit one is reported as having hit it,
never as a finished run that scored badly, and a clock that kept counting while the host
slept measures nothing at all.

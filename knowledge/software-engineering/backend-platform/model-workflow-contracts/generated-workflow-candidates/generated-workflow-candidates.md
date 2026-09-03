---
layer: golden-path
type: golden-path
subject: generated-workflow-candidates
status: forged
use_when: [building an automated system that turns a dataset into trained model candidates, designing the statistics a generator reads before it decides anything, deciding whether hyperparameter search should be its own system or a mode of the generator, choosing how to rank and pick among many trained candidates]
techniques:
  - two-tier-data-statistics
  - template-filling-with-provenance
  - candidates-as-ordinary-artifacts
  - stage-level-result-caching
  - search-as-candidate-mutation
  - score-keyed-candidate-selection
---

# Generated workflow candidates

A **generated workflow candidate** is a runnable training-and-inference
package that no person wrote. A generator measured a dataset, chose values for
the parts of a recipe that depend on the data, wrote those values into a
template, and put the result on disk in the same shape a hand-authored
package would have. Then the candidates were trained, scored, and one or a
few were kept. The subject owns that whole arc — measure, generate, train,
select — and the discipline that keeps every stage of it inspectable.

The consumer this subject designs for is a **non-expert with a dataset**: a
clinician, a lab, a product team with labelled examples and no one who can
say which architecture, which patch size, which normalization, which
learning-rate schedule fits this data. The system's promise is that the
dataset goes in and a ranked set of trained candidates comes out. The
principal practitioner's addition to that promise is the part that
distinguishes engineering from a demo: every candidate that comes out can be
opened, read, edited, and re-run **without the generator**, and every value
the generator chose can be traced to the measurement that decided it.

## The mistake this subject exists to prevent

The naive automated system is a **search loop over an opaque model object**.
It reads the data, builds a configuration in memory, trains, keeps the best
weights, and reports a score. It works in the paper. Then a candidate performs
oddly on a subset, and there is nothing to open: the configuration that
produced it was a dictionary in a process that has exited; the resize that
was applied to the labels was a default nobody set; the "best" was best by a
metric nobody declared; and re-running from the middle means re-running from
the beginning, because the loop was one function.

Every technique here moves one of those invisible decisions into a file:
the statistics, the substitutions, the candidate, the stage result, the
trial, the score. When the system is built this way, "why did it do that" is
answered by reading, and "do it again from here" is a command.

## Measure first, and give the measurement a schema

A generator that reads the data directly is a generator whose decisions
cannot be audited, because the data is too large to be the audit trail. So
the first stage produces **statistics**, and the statistics have two tiers:
a per-case record, computed by an analyzer that is itself an ordinary
transform over one sample, and a summary record, computed by a second kind of
analyzer over the list of per-case outputs. The split is what makes the
stage scale — per-case analysis parallelizes over the dataset; summary
analysis is cheap and runs once — and it is what makes the output reviewable:
a suspicious summary value can be traced back to the cases that produced it.

The keys of both tiers are an **enum contract**, not whatever the analyzers
happened to emit. A generator template that reads "the median spacing" must
read it under the one name every analyzer writes it under; a template that
falls back to a default when the key is missing has converted "unmeasured"
into a definite value nobody chose. The tiers, the contract, and the rule for
an unmeasured field are
[two-tier-data-statistics](./techniques/two-tier-data-statistics.md).

## Generation is template filling, and the fill is logged

A candidate is born by copying a template — a complete, runnable package with
placeholders where data-dependent values belong — and replacing each
placeholder with a value derived from the statistics. The practitioner's rule
is that **every substitution is recorded, per configuration file, beside the
file it changed**: which placeholder, which value, and by implication which
statistic. A generated candidate then explains itself; a reviewer opening it
sees not just a patch size of a certain value but the fact that the generator
set it, and can find the summary statistic it came from.

Two things the naive reading gets wrong. A template may be **pre-filled** —
shipped with no placeholders at all, because its author judged that its
values do not depend on the data — and that is a legitimate template with an
empty fill log, not a broken one. And a template may **decline** a dataset:
a recipe that only makes sense for three-dimensional inputs, or for a bounded
number of classes, says so and is skipped, with the skip recorded, rather
than generating a candidate that will fail two hours into training.
[template-filling-with-provenance](./techniques/template-filling-with-provenance.md)
covers the fill, the log, pre-filled templates and the opt-out.

## A candidate is an ordinary artifact

The single most consequential decision in the subject is that **the
generator's output is a directory, not an object**. Each candidate is a
self-describing package in exactly the shape a human author would produce:
its configuration files, its training entry point, its metadata, its
eventual weights, all on disk, all readable and runnable by the package
tooling with the generator uninstalled. The generator's own bookkeeping —
which template, which statistics, which fill records, what state its
training reached — is serialized beside the package in a structured text
form that re-expresses the generator object in the same declarative language
the package's configs use, so that the bookkeeping is reloadable through the
same door as everything else and never depends on native object pickling.

Because a candidate is a package, it can be trained by the tooling that
trains a hand-written one, shared with a colleague who has never heard of
the generator, edited and re-run, and ensembled with candidates from
elsewhere.
[candidates-as-ordinary-artifacts](./techniques/candidates-as-ordinary-artifacts.md)
states the layout obligation, the serialization convention, and what the
generator may and may not keep only in memory.

## Stages cache, so a rerun is a resume

Analyze, generate, train and select are expensive in very different ways —
analysis is bounded by disk, training by accelerator hours, selection by
almost nothing — and a single-function loop pays for all of them every time
any of them is wanted. So the runner treats them as **stages, each of which
defaults to running only if its result is not already present**. Analysis
finds its statistics file and skips; generation finds its candidate
directories and skips; training finds a candidate whose training state says
complete and skips; a rerun after a crash resumes at the first stage whose
result is missing, and an operator who wants a stage re-done says so
explicitly. The cache key is the presence of the *result*, on disk, which is
why the previous section's rule matters here: an in-memory candidate cannot
be found by the next process.
[stage-level-result-caching](./techniques/stage-level-result-caching.md) is
the stage contract, the skip rule, the forced-rerun rule and the lie a
half-written result tells.

## Search is a generator that mutates candidates

Hyperparameter search looks like it deserves its own system — a search
backend, a trial loop, a study object — and building it that way produces a
second path through which candidates are made, one that does not write
directories, does not log fills, and does not cache. The practitioner's
answer is that **search is a subclass of the generator**: each trial takes a
candidate, mutates the parameters the search space names, re-serializes the
result as a new candidate, trains it through the ordinary training stage, and
reports the declared score back to whatever search strategy is driving. The
search backend chooses values; it never touches a package. And the system
states, in the mechanism's own documentation, exactly which search strategies
are supported and which are not — an unstated limitation is discovered by the
user who needed the missing one.
[search-as-candidate-mutation](./techniques/search-as-candidate-mutation.md)
covers the subclass, the mutation-and-reserialize step, and the statement of
support.

## Selection is keyed on one declared score

Every trained candidate carries a **score** under one declared key, and
selection is a sort on that key. Two policies are offered and the choice is
explicit: a global top-N, which takes the best candidates wherever they came
from, and a per-partition-best, which takes the best candidate from each
cross-validation partition and so preserves diversity across the partitions.
The default is per-partition, because in the common case the candidates are
one recipe trained on different partitions, and a global top-N over those
returns three copies of the same recipe's luckiest partition. A candidate
without a score is not a candidate with a score of zero; it is excluded and
named. [score-keyed-candidate-selection](./techniques/score-keyed-candidate-selection.md)
covers the key, the two policies, the default, and the ensembling hand-off.

## Where this subject ends

Three neighbours share ground with this one.

**Templates and scaffolding** owns starting points a *person* adopts: a
catalogued, parameterized description with an interview whose answers are
facts about the adopter's intent, a preview, a readiness gate, and a
transactional adoption after which the instance divorces the template. This
subject's templates are filled by *measurements*, not answers — the parameter
surface is decided by a statistics file, no one is interviewed, and nothing
is previewed — and the instances are not adopted but *ranked*: many are
generated, all are trained, and a score decides which survive. The rule a
reader uses to pick: when a human chooses among alternatives at the moment of
use, it is scaffolding; when a measurement chooses and a score judges, it is
this subject. What transfers unchanged is the divorce and the provenance
stamp — a generated candidate carries which template and which values, and
editing it never writes back.

**Self-describing model packages**, the sibling in this category, owns what a
candidate *is*: the normative layout, the metadata contract, the symbolic
shape rule, the frozen export. This subject owns how candidates are *made and
chosen*. The rule: a question about the files inside one package and what
they promise belongs to the sibling; a question about where many packages
came from, why their values are what they are, and which of them to keep
belongs here. This subject relies on the sibling's contract without restating
it — a generated candidate is valid exactly when the sibling's checks pass on
it — and the sibling's frozen-config rule is the reason a candidate's fill log
lives beside the config rather than in the generator's memory.

**Pipeline and DAG execution** owns the execution of an explicit, user-authored
graph of dependent steps: validation of the graph, per-node status persisted
at every transition, conditional edges, durable human gates. This subject's
staged runner is not that. Its four stages are fixed by the system, linear,
and cached by result presence rather than by a persisted node status; there
is no topology to validate, no branch to explain, no gate to hold open. The
rule: when the steps and their order are data the user drew, it is a
pipeline engine; when they are the fixed vocabulary of one generator and the
only question is "which stage has a result already", it is this subject. A
runner that grows conditional stages or a per-stage status vocabulary has
crossed into the neighbour and should adopt its engine.

One further seam is owned elsewhere and cited here rather than re-minted. The
migration of the generator's own state from native object pickling to a
structured text form — restricted loader by default, the permissive path
behind a named opt-in with a removal version — is the supply-chain doctrine
of unsafe deserialization off by default. This subject inherits it: a
candidate's bookkeeping is stored in the data-only form because it crosses a
process boundary by construction, and the opt-in exists only as a bridge for
state written before the migration.

## Failure modes worth naming

**The generator is the only reader.** Candidates exist as objects; the score
report is the only artifact. When one candidate is wrong, nothing can be
opened. Write directories, and test that a candidate trains with the
generator uninstalled.

**A default masquerades as a measurement.** A template reads a statistic
that the analyzer did not produce, falls back silently, and the candidate
carries a value nobody chose and no log records. The enum contract is the
guard; a missing key is a refusal, not a default.

**Rerun means restart.** Training a dozen candidates for a day, crashing in
the selection stage, and starting over from analysis. Each stage checks for
its own result and skips.

**Limitations live in the issue tracker.** Segmentation only, a preferred
label layout, a silent resize under a tolerance, a template that cannot
handle a dataset — each discovered by a user, one at a time. The mechanism's
own documentation enumerates what it does not do.

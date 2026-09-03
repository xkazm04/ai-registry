---
layer: technique
type: technique
subject: generated-workflow-candidates
technique: search-as-candidate-mutation
status: forged
laws: [identity-survives-reuse]
shared_with: []
use_when: [adding hyperparameter search to a candidate generator, deciding whether a search backend should own candidates or only choose values, writing the statement of which search strategies a system supports]
---

# Search as candidate mutation

Hyperparameter search wants to be its own system. The search backends come
with a study object, a trial loop, a suggestion API, and a dashboard, and the
path of least resistance is to build a second loop around them that
constructs a configuration per trial, trains it, and reports a number. That
second loop is a second generator, and it has none of the properties the
first one was built to have.

## The subclass rule

**Search is a subclass of the generator.** It inherits the fill, the export
and the bookkeeping, and adds one operation: given a candidate and a set of
parameter values chosen by the search strategy, produce a **new candidate**
whose configuration differs by exactly those values. The operation is
mutate-then-reserialize — load the candidate's bookkeeping record, apply the
values to the configuration mapping, write a new directory under a
trial-derived name, write the new fill record with the search's substitutions
marked as such, and write the new bookkeeping record. The trial then trains
through the ordinary training stage, reads the declared score from the
ordinary place, and reports it to the strategy.

Everything the base generator guarantees follows for free. A trial's
candidate is a directory a person can open and train without the search
backend. Its fill record shows which values the search chose and which the
template's author or the statistics decided. Its training result is cached
by the same check, so a search interrupted at trial forty resumes at trial
forty. Its score sits under the same key the selection stage sorts on, so
the search's winners and the base generator's candidates rank in one table.

## The backend chooses values and nothing else

The search strategy — grid, random, or a model-based optimizer — is behind
an interface that receives a search space and a score and returns the next
set of values. It never receives a candidate, never writes a file, never
runs training. This is the seam that makes the backend replaceable and the
candidates independent of it. A backend that is handed the candidate object
will, in every case observed, begin to own it: a trial's configuration lives
in the backend's study database, the winner is reconstructed from the
study's best-parameters record, and the day the study database is lost or
the backend is upgraded, the candidates go with it.

The search space is data, declared beside the template, in the same
placeholder vocabulary the fill uses — each searchable parameter names the
configuration key it mutates and the range or set it may take — so that a
searched value and a filled value are the same kind of thing recorded in the
same place.

## A trial has an identity

A trial's candidate is named from the base candidate plus a trial
discriminator, and the name is minted once
(`../../../../_laws.md#identity-survives-reuse`). The backend's own trial
numbering is recorded in the bookkeeping as a foreign key, never used as the
name, because a resumed study renumbers and a parallel study interleaves.
The mapping from a backend's trial to a directory on disk is what lets an
operator take a dashboard's best trial and find the package that is it.

The discriminator is a choice with consequences. Minting it from the
**parameter values** — the base name followed by each searched key and its
value — makes a trial idempotent: a grid point visited twice lands in the
same directory and the training-stage check treats the second visit as a
cache hit, which is exactly right for grid search and for a resumed study.
Minting it from a **trial index** makes every visit distinct, which is right
for a stochastic strategy that may legitimately sample the same point twice
and wants both results. Choose by strategy, and say which in the subclass.

## State what is supported, in the mechanism

A search system carries limitations that a user discovers by needing the
missing one: only one strategy is wired, only one backend, only scalar
parameters, only one process. The rule is that the **statement of support
lives in the mechanism's own documentation**, at the search subclass, in one
enumerated list — strategies supported, strategies not, backends wired,
constraints on the search space — rather than scattered across error
messages, an issue tracker and a release note. A user who reads the subclass
learns what it will not do before they have spent a night of training
finding out.

## Decision rules

- **Search extends the generator; it never runs beside it.** The trial
  operation is mutate-and-reserialize to a new candidate directory.
- **The backend receives a search space and scores and returns values.** It
  never sees a candidate or a file.
- **The search space is declared in the placeholder vocabulary of the fill**,
  so searched and filled values share one record.
- **A trial candidate is named from the base candidate and the trial index,
  once**; the backend's trial id is a recorded foreign key.
- **Trials train through the ordinary training stage** and score under the
  ordinary key; the search introduces no second path for either.
- **Supported and unsupported strategies are enumerated at the subclass.**

## When not to use this

A search over values that do not live in the candidate's configuration — a
choice of which template to generate at all, a choice of the statistics
analyzer — is a search over generators, not over candidates, and the
mutation operation has nothing to mutate. That is a loop over the base
generator with different inputs, and it should be written as one rather
than forced through the subclass.

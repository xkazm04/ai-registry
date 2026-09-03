---
layer: technique
type: technique
subject: generated-workflow-candidates
technique: candidates-as-ordinary-artifacts
status: forged
laws: [identity-survives-reuse]
shared_with: []
use_when: [deciding what a generator returns and what it writes, designing how a generator persists its own bookkeeping between stages, reviewing a system whose candidates exist only as objects in one process]
---

# Candidates as ordinary artifacts

The generator's output is a directory. Not a candidate object with a method
that can write a directory — a directory, already written, in the exact shape
a person would have authored, before the generator returns. Everything else in
this subject is downstream of that choice.

## The layout obligation

A generated candidate is a self-describing package: it satisfies the same
layout, metadata and configuration contract as a hand-authored one, and it
passes the same checks. The package tooling can train it, run inference with
it, export it and validate it with the generator absent from the
environment. The test is literal and should be run: uninstall the generator,
open a candidate, train it. A candidate that needs the generator to be
importable — because a configuration references a generator class, or
because the training entry point is a generator method — has failed the
test, and the failure is the subject's central defect.

What the generator adds to the package is *beside* it, never *inside* its
contract: a statistics file the candidate was generated from, the fill
record, the generator's own state. A consumer that does not know about the
generator ignores those files; a consumer that does can reconstruct the
generator from them.

## The bookkeeping is re-expressed in the config language

The generator keeps state per candidate — the template it came from, the
paths it wrote, how far training got, the score once there is one — and that
state has to survive between stages, which means between processes. The
naive persistence is native object pickling of the generator object, and it
fails in the way that doctrine names: the file is a program, the loader runs
it, and a candidate directory becomes something a stranger should not open.

The rule: **the generator object is serialized as a structured text record
that names its type and carries its state as data**, in the same declarative
language the package's own configuration files use to denote objects. The
record is a configuration fragment: a target field naming the class to
instantiate, a state field carrying the values, and the reference back to
the template. Reloading parses the fragment through the ordinary
configuration parser, instantiates the class with no arguments, and restores
the state with a load call. Two conventions follow and both must be stated:
the generator class has a **no-argument constructor**, and it exposes a
**state-dictionary pair** — one method returning every field that must
survive, one accepting it back — so that what is persisted is an enumerated
set of fields rather than whatever the object happened to hold. The
permissive loader for records written before the migration exists only
behind a named, per-process opt-in with a removal version, under the
supply-chain doctrine this subject cites and does not restate.

Re-expressing the object in the config language is a stronger choice than a
generic structured-text dump. It means a candidate's bookkeeping is readable
by the same parser and the same reference resolver as its configuration,
that a reference from the bookkeeping into the configuration is an ordinary
reference, and that there is one door through which anything on disk becomes
an object.

## Identity is the directory

A candidate's identity is its name on disk, minted at generation from the
template name and the partition index, and carried unchanged through
training, scoring and selection
(`../../../../_laws.md#identity-survives-reuse`). The score table keys on
it; the fill record sits under it; the search stage derives a trial's name
from it. A candidate identified by its position in a list breaks the moment
the list is sorted by score, which is the one operation the list is for.

## Decision rules

- **The generator returns after writing.** Its return value is the path of
  the directory, or a list of them; an in-memory candidate is not a result.
- **A candidate passes the package contract's checks with the generator
  uninstalled.** Run that test in the generator's own test suite.
- **Generator state is persisted as a typed structured-text record in the
  config language** with a no-argument constructor and a state-dictionary
  pair; native object pickling is a deprecated bridge behind a named opt-in.
- **The generator's files sit beside the package, outside its contract**, so
  an unaware consumer ignores them cleanly.
- **A candidate is named once, at generation**, and every later stage keys
  on that name.

## When not to use this

A throwaway experiment that will never be shared, resumed or ensembled can
keep its candidates in memory and lose nothing. The obligation begins with
the first of those three verbs, and in practice all three arrive together:
the moment a run is worth a day of accelerator time, it is worth resuming,
and resumption is a directory.

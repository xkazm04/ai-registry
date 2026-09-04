---
layer: technique
type: technique
subject: self-describing-model-packages
technique: normative-layout-contract
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [deciding which files a model package must contain and what they are called, writing the specification a package consumer will locate files from, reviewing a package format that lets each author choose their own layout]
---

# The layout is normative, not declared

A consumer arriving at a package with no prior knowledge has to find three
things before it can do anything else: the licence it is bound by, the
metadata that describes the model, and the weights. If the location of any
of those is recorded in a field inside one of them, the consumer has a
bootstrap problem — it must find the manifest to learn where the manifest is.
If the location is left to the author, every consumer grows a search
heuristic, and the heuristics disagree.

The rule: **if a consumer must locate a file without asking, its path and
name are fixed by the specification.** A manifest field may describe a file;
it may never be the only way to find one that a consumer needs before it has
read the manifest.

## What the specification fixes

The specification names, by exact relative path from the package root:

- the licence, at the root, under one name;
- the metadata file, in a named configuration folder, under one name;
- the weights, in a named model folder, under one name for the canonical
  form and one name each for any compiled form the package may ship;
- the documentation folder and the one file inside it that a catalogue
  renders as the package's front page.

Everything above is either **required** — its absence makes the package
invalid — or **optional but named**. The second class is the one that gets
skipped, and skipping it is the defect this technique exists to prevent. A
specification that says "a compiled form may also be present" without saying
what it is called has made every consumer guess; one that says "a compiled
form, if present, is at this path" has made absence a fact the consumer can
test in one call. Optional governs presence; it never governs the name.

What the specification does **not** fix is what may live beside these files.
Additional configuration files, additional documentation, additional
resources the model needs at run time — a package may carry them, in the
named folders, under author-chosen names, and the metadata or the
configuration files point to them. The fixed set is the set a consumer must
reach *before* it can read a pointer; everything reachable through a pointer
is free.

## Why a field cannot substitute

The temptation is a manifest key — `weights_path`, say — because it feels
more flexible. It is more flexible, and the flexibility is the cost: a
program that reads the key and follows it has to handle every value the key
could hold, including absolute paths, paths that escape the package, and
paths to files that do not exist. A fixed path has none of those failure
modes; the file is there or it is not, and "not" is a verdict rather than a
search.

The deeper reason is that a layout is a vocabulary — a closed set of names
that mean things — and a vocabulary with two authorities drifts
(`../../../../_laws.md#one-authority-per-vocabulary`). If the specification
says the weights are in one place and a manifest field may say otherwise,
every consumer has to decide which wins, and they will not all decide the
same way.

## Decision rules

- **When a file must be found before the metadata is read, fix it in the
  specification.** The licence and the metadata itself are always in this
  class; the weights almost always are, because a serving container decides
  whether to load before it decides how.
- **When a file is found through the metadata, let the metadata point to
  it** — but the pointer resolves relative to the package root and may not
  escape it. A pointer that resolves outside the package describes something
  the package does not carry.
- **When a file is optional, name it anyway.** Absence is then a testable
  state and never an unknown one
  (`../../../../_laws.md#unknown-is-not-a-value`): a consumer that finds
  nothing at the named path knows the package does not ship a compiled form,
  rather than suspecting it shipped one under another name.
- **When the package is embedded whole inside a compiled container**, the
  same relative layout applies inside the container's extra-files area. The
  consumer that unpacks the container finds the same tree it would have found
  on disk.
- **When the package is zipped, the root of the archive is the package
  root**, and the specification says whether a single top-level folder is
  permitted or required. Leaving that unstated produces two populations of
  archives and a consumer that handles only one.

## When not to use this

Do not fix in the specification what genuinely varies by model. The number
of configuration files, their names beyond the metadata file, the presence
of a training recipe versus an inference-only one — those are the author's,
and forcing them into a closed set makes the specification wrong for the
next architecture. The fixed set is the bootstrap set: the files a consumer
needs before it has anything to read a pointer from. Keep it small, keep it
exact, and let everything else be reachable from it.

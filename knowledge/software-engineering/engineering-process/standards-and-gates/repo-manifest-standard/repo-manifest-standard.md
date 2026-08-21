---
layer: golden-path
type: golden-path
subject: repo-manifest-standard
status: forged
use_when: [authoring a contract a repository carries about itself, making automation portable across tools, versioning a machine-readable convention, deciding what a manifest may and may not claim]
techniques:
  - capability-not-tool-vocabulary
  - pointers-not-embeds
  - must-ignore-unknown
  - semver-additive-evolution
  - spec-ships-with-artifact
  - generated-from-provenance
---

# A repository manifest standard

A **repository manifest** is a small, versioned, vendor-neutral contract that a
repository carries about itself, at a known location, in a machine-readable
shape. It answers, for any reader that arrives with no prior knowledge of this
codebase: what is here, what can be run against it, where the evidence lives,
and under which version of the contract those answers are expressed.

The whole subject is one design problem stated four ways:

- An **arbitrary tool** must be able to read it — not the tool it was written
  for, and not only tools that existed when it was written.
- An **arbitrary reimplementation** must be able to validate it — from the
  contract alone, without reading the reference implementation's code.
- **Neither breaks** when the tooling underneath changes: a replaced test
  runner, a replaced linter, a replaced automation host.
- The repository stays the **author** of its own description. Nothing about the
  manifest requires a service, an account, or a network.

Two structural decisions fall out of "arbitrary reader" immediately, and both are
cheap only if made at the start. The contract's **identity is a stable name, not
a location** — a naming authority that is a fetchable address rots the first time
the host reorganizes, while a plain identifier string is still resolvable in a
decade. And the on-disk form is a **view of a structured object**, in a regular
enough subset of its format that a reader with no libraries can parse it with
simple pattern matching. The object is the contract; the serialization is a
diff-friendly rendering of it. A contract that can only be read by importing a
parser has excluded exactly the readers it was written for — a small script, a
foreign language, an environment where nothing may be installed.

That last point is why this is a file and not an endpoint, and the precedent is
old and boring: the conventions of this shape that have lasted decades — a
root-level file declaring how automated visitors should behave, a well-known
location naming who to contact about a defect — survived precisely because they
were plain, small, locally authored, and free to ignore. The ones that died were
the ones that encoded a particular vendor's product model into the file format.

## The mistake this subject exists to prevent

The naive manifest is a **configuration file for one tool with a neutral name on
it**. It is written during the week that tool is adopted, its fields mirror that
tool's flags, and it works beautifully — until the tool is replaced. Then every
consumer that learned to read the manifest is reading a description of a world
that no longer exists, and the migration is not "swap a dependency" but "rewrite
the contract and every reader of it."

The failure is not carelessness. It is that at authoring time there is no
observable difference between *the capability* and *the tool that currently
provides it* — both are satisfied by the same string. The difference only
becomes visible on the day of replacement, which is the day it is expensive.
Every technique here is a way of paying a small cost now to keep that difference
visible.

## The vocabulary is the whole design

If only one rule from this subject survives, it is this: **a manifest declares a
capability name mapped to the command that fulfils it, never the tool behind
it.** "There is a way to check types here, and this is how you invoke it" is a
statement that stays true across three generations of type checkers. "This
repository uses tool X" is a statement with an expiry date, and the expiry is
silent — nothing fails, the sentence just quietly becomes false.

This is what makes the manifest vendor-neutral in the only sense that matters.
Neutrality is not achieved by avoiding a company's name in prose; it is achieved
by making the *shape* of the document unable to express a vendor lock-in. If the
schema has a field for "which linter", the schema has taken a position. If it
has a field for "the check that must pass before integration, and its
invocation", it has not.

[capability-not-tool-vocabulary](./techniques/capability-not-tool-vocabulary.md)
is that rule, its naming procedure, and the cases where naming the tool is
legitimate.

## Small file, pointers outward

The second pressure on a manifest is size. Everything a reader might want feels
like it belongs — the conventions, the architecture notes, the last run's
results, the list of known exceptions — and each addition is individually
reasonable. The document becomes large, becomes stale in parts, and becomes a
merge-conflict surface on every branch that touches anything.

The discipline is that a manifest **points, and does not embed**. It names where
the deeper material lives; the material lives there and is maintained there.
Small files stay read; large files get skimmed, then trusted from memory, then
wrong.

The rule that turns this from an aesthetic preference into an enforceable one:
**never point at what you do not ship.** A pointer that resolves to nothing is
worse than a missing field, because the reader cannot distinguish "not offered"
from "broken" — and if the target is produced only after a full run, every fresh
clone starts life emitting a warning about a file that was never supposed to
exist yet. [pointers-not-embeds](./techniques/pointers-not-embeds.md) covers what
belongs inside, what belongs behind a pointer, and the resolution contract.

## The forward-compatibility promise

A manifest outlives the readers written against it. Version *n* readers will be
deployed and un-upgradable when version *n+2* manifests appear; that is the
normal state of a distributed convention, not a failure of rollout.

One sentence makes it survivable, and it must appear **in the specification
itself** because it is a promise made to code that has not been written yet:

> A reader must ignore fields it does not recognize.

With that stated, adding a field is not a breaking change, and nobody has to
coordinate an upgrade. Without it, the first extension breaks every strict
reader in the fleet, and the standard's practical answer becomes "never extend,"
which is how conventions calcify and get replaced.

The rule has a mirror that gets violated far more often because it binds
*writers*: ignoring what you do not recognize does not mean deleting it. A
generator that rebuilds the manifest from scratch drops every field it has no
opinion about — including the fields a second tool owned.
[must-ignore-unknown](./techniques/must-ignore-unknown.md) covers both halves, and
the narrow set of things a reader is allowed to be strict about.

## Version the contract, not the repository

The manifest carries a version, and that version describes **the contract**, not
the code around it. Conflating the two is the most common structural error: a
manifest stamped with the product's release number tells a reader nothing about
which fields to expect, and forces a contract-level major bump every time the
product ships one.

Within a major version, evolution is **additive only**: new optional fields, new
enumerated values in an open set, new capability names. Removal, renaming, and
narrowing of an existing field's meaning are the major-version events — and a
major version is a migration for everyone, which is exactly the pressure that
should make you design the first version carefully.
[semver-additive-evolution](./techniques/semver-additive-evolution.md) covers the
classification rules, including the ones that look additive and are not.

## The specification must resolve where the manifest is

A manifest that cites a specification hosted somewhere is a manifest whose
meaning is unavailable in an offline clone, behind a proxy, or after the host
reorganizes its links. The contract fails exactly where it is most needed:
someone auditing a repository they did not write, without the network.

So the specification travels **with** the artifact — a copy inside the adopting
repository, kept honest against its source by a check that fails on divergence
rather than by anyone's diligence. A copy without that check is worse than a
link, because it is a stale authority that looks authoritative.

The same offline-resolvability argument produces the standard's other clause:
**any implementation that performs the checks the specification describes is
conformant.** The reference implementation is a runner, not the definition. A
standard whose only definition is one program's behaviour is that program's
configuration format wearing a standard's clothes.
[spec-ships-with-artifact](./techniques/spec-ships-with-artifact.md) covers both.

## Generated, with its provenance stated

The last question is who writes the manifest. If the answer is "a person, by
hand, once," the manifest is canon: unfalsifiable, undiffable, and drifting from
the day it is written. Hand-authored contracts describe intentions; the reader
needs a description of the repository.

The manifest should be **synthesized from what the repository actually contains**
and should record that it was — which tool version, from which inputs, at which
revision. That record is what makes the manifest *checkable*: regenerate into a
buffer, compare against what is committed, and the difference is drift with a
name. A manifest that cannot be regenerated cannot be verified; it can only be
believed. [generated-from-provenance](./techniques/generated-from-provenance.md)
covers the synthesis, the drift check, and the reserved space for the fields a
human genuinely must own.

## Declared here, proven elsewhere

The single most important boundary in this subject: **a manifest declares; it
does not prove.** "There is a type check, and here is how to run it" is a claim
about the repository. Whether the type check passes is a different fact,
produced by running it, expiring the moment the tree changes.

The executable checker that proves what this contract declares belongs to the
[`conformance-checking`](../../../engineering-assessment/maturity-and-conformance/conformance-checking/conformance-checking.md) subject. Declared here, proven there.

There is one disciplined exception, and its conditions are the whole of it. A
manifest may carry a per-entry **verification flag** — the claim's own record of
whether it has ever been proven — under four rules: the generator always writes
it false, because a synthesizer has proven nothing; only the prover may write it
true; the prover writes it back to false the moment the check fails, so a stale
true can never outlive a broken command; and the flag is scoped to one entry,
never aggregated into a document-level verdict. Anything beyond that — a score, a
grade, a "conformant" boolean — is a stored derived value with no recomputation
path, which is a confident lie between the moment it goes stale and the moment
someone notices (`_laws.md#derivation-names-recomputation`).

A second half of the contract is worth naming because it is so often skipped: the
manifest says what the repository **can do**; a companion artifact behind a
pointer says what an automated contributor **must not do** — paths never to
hand-edit, patterns never to commit, the change discipline. Keeping it separate
lets the invariants grow without touching the spine. Keeping *part of it
machine-enforced* is what stops it becoming prose: an invariants file that
nothing checks is a wish list, and the checkable part (is anything matching a
never-commit pattern actually tracked?) is small and worth the wiring.

Two further seams are worth naming so nobody looks for them here. The mechanics
of *emitting* files into a repository — the catalog, the parameter interview,
the adoption lifecycle — belong to
[templates-scaffolding](../../../integration/templates-scaffolding/templates-scaffolding.md); this
subject cares only about what the emitted contract says. And the opposite
direction of authority — an externally derived, comparable fingerprint that a
third party computes *about* a repository — belongs to [`readiness-passports`](../../../engineering-assessment/maturity-and-conformance/readiness-passports/readiness-passports.md). A
manifest is self-declared and therefore trustworthy only about intent; a
passport is externally derived and therefore comparable across repositories that
never agreed on anything. Do not let one grow into the other: a self-declared
score is the worst of both.

## Failure modes worth naming

- **The manifest becomes a second authority.** A field duplicates something the
  repository already states elsewhere — a version, a dependency set, a script
  list — and the two drift. Point at the existing authority or derive from it;
  never restate it (`_laws.md#one-authority-per-vocabulary`).
- **The claim outruns the evidence.** "Conforms to the standard" from a
  manifest that merely declares the standard's name. Claims discipline is
  ruthless here: the honest phrase is *evidence for*, never *compliance with*,
  and any sampled measurement publishes its cap alongside the number, or the
  number will be reused for a claim it does not support
  (`_laws.md#count-carries-predicate`).
- **A missing manifest reads as a failing one.** A repository that has not
  adopted the contract and a repository that adopted it and lost the file
  produce the same absence. The reader's output must distinguish them
  (`_laws.md#failure-not-empty-success`).
- **The guardrail cries wolf on a fresh install.** A contract whose first act in
  a new clone is a warning about something legitimate teaches its readers to
  ignore it, and a convention that is routinely ignored has no enforcement left
  to spend on the real case. Tune the declared checks so that a correct fresh
  repository is silent.
- **Deleting the check instead of the drift.** When the drift test between the
  shipped specification and its source starts failing, the fast fix is to remove
  the test. That converts a visible divergence into an invisible one at the exact
  site where visibility existed (`_laws.md#deletion-is-not-repair`).
- **A major version bumped for convenience.** Every major is a migration for
  every reader. If majors are cheap for the author, they are expensive for
  everyone else, and the convention loses the adopters who cannot move.

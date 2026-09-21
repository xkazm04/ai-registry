---
layer: technique
type: technique
subject: codegen
technique: generated-file-hygiene
status: forged
laws: [derivation-names-recomputation, one-authority-per-vocabulary]
shared_with: []
use_when: [deciding what a generated file's header must say, formatter keeps reflowing regenerated output, regenerated output differs between runs, a few generated artifacts need hand-written prose the generator keeps overwriting, maintaining a list of files the generator must skip]
---

# Generated-file hygiene

A generated file spends its life impersonating an authored one: same
directory conventions, same syntax, same syntax highlighting. Every defect
in this technique's territory begins with a human (or a tool) treating it
as authored. Hygiene is the set of declarations and exclusions that make
the impersonation fail fast.

## The self-declaring header

Every generated file opens with a header stating four things:

1. **That it is generated** — the do-not-edit line, first, in the file's
   comment syntax, phrased as a consequence rather than a plea: edits here
   are erased by the next regeneration.
2. **What generates it** — the task's registry name, so the reader can find
   the machinery.
3. **What it derives from** — the authoritative input, so the reader knows
   where the *real* edit goes. This line does the most work: the person
   opening a generated file almost always wants to change something, and
   the header's job is to redirect that intent to the source before the
   editor does.
4. **How to rebuild it** — the exact regeneration command. This is the
   stored derivation naming its recomputation at the point of discovery
   ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)),
   placed where the next confused reader is already standing.

The header is emitted *by the generator*, never added by hand — a
hand-added header is one more thing to drift, and a generator that writes
its own header keeps the header true by construction.

## One writer per file — and the tools count as writers

A generated file must have exactly one writer: its generator. Everything
else that routinely rewrites source — formatters, lint auto-fixers, import
organizers, license-header injectors — must be excluded from generated
roots, or the file has two authorities and its content oscillates between
them ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)):
the formatter reflows the output, the next regeneration reverts the reflow,
and every pipeline run now produces a phantom diff. The exclusions live in
each tool's own configuration, keyed by the declared output roots from the
registry — which is one more reason output roots are registry data.

Review tooling gets the inverse treatment: generated paths are *marked* so
diffs collapse by default. Reviewers can expand when provenance is in
question; they are not forced to scroll.

## Determinism, or the death of diff signal

The generator's output must be a pure function of its inputs: stable
ordering (sort what the source provides unordered), no timestamps, no
absolute paths, no machine or user names, no locale-dependent formatting,
no iteration-order leakage from hash containers. Every violation produces
diffs that carry no information — and noise in generated diffs is not
cosmetic. The drift gate's entire mechanism is "any difference is a
finding"; nondeterminism converts that into "there is always a difference",
which either breaks the gate outright or, worse, trains everyone that
generated churn is normal and skimmable. A reviewer who has learned to
skim generated diffs will skim the one that mattered.

Determinism is testable, and cheaply: run the generator twice, require
byte-identical output. Put that test in the pipeline once and the whole
class of regressions is fenced.

## Output roots: one per class, retired ones buried

Each artifact class writes to exactly one directory, declared in exactly
one place. When an output root moves, the old root is **deleted and its
recreation blocked** — not abandoned in place. Two live roots for one class
is the worst hygiene state available: both look generated, both carry
headers claiming freshness, consumers import from whichever one tooling
suggests first, and only one is being regenerated. The boundary-contract
instance of this rule, with the drift incident pattern behind it, is stated
in
[generated-type-contracts](../../../../client-architecture/ipc-contract/techniques/generated-type-contracts.md);
it generalizes to every class in the pipeline.

## Enforcement is layered, because the header is just a sign

The header persuades; it does not prevent. The layers behind it: tool
exclusions prevent *automated* hand-edits (the most common kind); the drift
gate catches human hand-edits after the fact, because an edited artifact no
longer matches its regeneration and the next gated run fails with a diff
that shows exactly the edit; and for gate-less convenience-tier artifacts
(see [commit-vs-derive-policy](./commit-vs-derive-policy.md)), the next
ambient regeneration silently reverts the edit — which is precisely why the
header must be blunt about erasure: for those files, the warning is the
only protection the editor's work gets.

## The seeded file: when erasure is conditional

Everything above governs an artifact that stays generated for life. There is
a second lifecycle it does not cover, and treating it as the first one is
what produces the exclusion list nobody maintains.

Some generators emit a **seed** rather than an authority: a starting point
that is correct for most outputs and wrong for a few, where the few need
hand-written prose no generator can produce. A reference page per command
in a large tool is the recurring instance — most pages want to be the
tool's own emitted help text, and a handful need an explanation, an example
sequence, a warning. The naive fix is a skip-list in the generator naming
the exceptions. That list is a second authority over the same question,
kept in a different file from the artifacts it describes, and it drifts the
moment an artifact is renamed or a hand-written page is added by someone
who does not know the list exists.

That drift is not inevitable, and saying so is the difference between this
rule and a preference. **A two-sided exception list does not drift**: one
that fails both when an unlisted artifact needs excluding *and* when a
listed one stops needing it cannot accumulate stale entries, because
clearing an exception costs a deleted line and leaving it costs a red gate.
An exception list built that way is a legitimate mechanism, and the
argument below is not against it.

The correction is to move the ownership bit **into the artifact**: the
generator writes a marker, and on every subsequent run it rewrites a file
only if the file is absent or still carries that marker. Deleting the
marker is how a human adopts the file, and the adoption is permanent
without anyone editing the generator. One line of prose in the artifact
replaces a registry of exceptions, and it cannot disagree with the artifact
because it is inside it.

The one-writer rule survives this intact, and stating why is the point:
while the marker is present the generator is the only writer, and once it
is gone the generator has *permanently ceded* the file — at no moment do
two authorities claim it. What changes is only that the transfer is
possible and is recorded where the next reader is standing.

Three constraints keep a seeded file from becoming an unmanaged one:

- **The marker is the header, not a second mechanism.** The four
  declarations above still apply while the file is generated, and the
  erasure line is phrased as the condition it actually is — this file is
  rewritten while this marker is present — rather than as an unconditional
  threat the tooling does not honour.
- **Adoption is a reviewable event.** Removing the marker changes who
  maintains the file forever, so it belongs in a diff a person reads, not
  in a bulk edit. A drift gate cannot help here: an adopted file is
  *supposed* to diverge from what the generator would emit, so it leaves
  the gate's jurisdiction on the same commit. Adopting a file that should
  have stayed generated is the failure this cheapness buys, and the only
  thing that catches it is review.
- **Seeding is not for contract artifacts.** A generated type, a schema, a
  client — anything whose correctness is defined by agreement with an
  upstream source — must never be adoptable, because adoption converts a
  derived guarantee into a hand-maintained claim that will silently stop
  matching. Seeding is for artifacts whose audience is human and whose
  authority is editorial.

## Which mechanism, and the case that decides it

The in-artifact marker and the two-sided exception list are both correct,
and they are not interchangeable. Two questions separate them, and both are
about the artifact rather than about taste:

**Does the artifact exist?** An ownership bit can only live in a file, so
the marker cannot express an exception about an artifact that was never
written. A generator whose interesting exceptions are *absences* — a type
whose emission is expected and does not happen, a page that should exist
and does not — has nowhere to put a marker, and its exceptions must live
in a list. This is the case the marker cannot reach at all, and a codebase
usually has both kinds at once.

**Is the artifact's authority editorial or derived?** Editorial artifacts
are adoptable and the marker is the cheaper mechanism, because the decision
and the prose it governs sit in one place and cannot disagree. Derived
artifacts are never adoptable, so their exceptions are always about
generation *failing* or *lagging* rather than about ownership — which is
list territory by the previous test as often as not.

The failure worth naming is using one mechanism for both: a project that
puts adoption markers in its derived artifacts has legalized silent
contract drift, and a project that keeps an editorial exception list has
taken on maintenance it could have deleted.

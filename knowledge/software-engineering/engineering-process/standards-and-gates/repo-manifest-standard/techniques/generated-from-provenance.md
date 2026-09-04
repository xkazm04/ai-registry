---
layer: technique
type: technique
subject: repo-manifest-standard
technique: generated-from-provenance
status: forged
laws: [derivation-names-recomputation, gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [deciding who writes a manifest, making a committed artifact drift-checkable, separating generated fields from human-owned ones]
---

# Generated, with its provenance stated

A hand-written contract is canon. Nobody can tell whether it was ever true, and
by the time anyone doubts it, the person who wrote it has left. A **generated**
contract is a derivation, and derivations can be re-run, compared, and disproved.
That difference — falsifiability — is the entire reason to prefer synthesis over
authorship, and it outweighs the fact that a hand-written file reads slightly
better on day one.

So: synthesize the manifest from what the repository actually contains — the
capabilities it can really run, the pointers that really resolve — and commit
the result. Then record how it was made.

## The provenance record

A small block inside the manifest, describing the document rather than the
repository:

- **The generator's identity and version.** Which synthesizer wrote this, at what
  version of itself.
- **When, and against which revision.** So a reader can tell how old the claim
  is without guessing from file timestamps, which do not survive a clone.
- **The inputs consulted.** What the synthesizer read to reach its conclusions —
  not the conclusions themselves.

This block is exempt from the capability-not-tool rule, and the reason is worth
stating: it is a fact about the past, and facts about the past cannot rot. "This
document was produced by generator X version 2" stays true forever, unlike "this
repository uses tool X," which becomes false the day tooling changes.

## The reason the provenance is load-bearing: drift

A stored derived value must name how it is recomputed
(`_laws.md#derivation-names-recomputation`), and the provenance record is that
name. It makes one check possible, and that check is what turns the manifest
from a belief into a verifiable claim:

1. Re-run the synthesizer against the working tree, into memory.
2. Compare with what is committed, field by field, ignoring keys the generator
   does not own (see the carry-forward rule in must-ignore-unknown).
3. A difference is **drift**: the repository changed and the description did not.
   Report it as a named finding with the differing paths, not as "manifest is
   out of date."

Two details decide whether this check is worth anything. It must read the
**committed bytes** and compare them against a fresh synthesis
(`_laws.md#gate-sees-target`) — a check that compares one synthesis against
another synthesis is green forever. And its output must distinguish *drift* from
*could not synthesize*; a generator that crashed and a generator that found
nothing to change must not both print nothing.

There is a second axis of drift, and it is the one a producer is structurally
unable to notice. The check above compares a description against its own
repository; but a synthesizer also emits artifacts that *execute somewhere
else* — an automation definition, a hook, a scaffolded gate — and about those
the producer's own green suite says nothing, because none of it ever runs in the
consumer's environment. Where such an artifact encodes a decision the producing
repository has already made for itself — the runtime major it pins, the
invocation it uses, the version of a shared convention — the value must be
**derived from the producer's own declaration of that decision and pinned by a
test comparing the two**, never re-typed into the generator. A re-typed value is
a second copy of one decision whose only reader is a stranger's environment, so
it goes stale in silence and the staleness is discovered by the adopter.

## Reserve space for what a human must own

Not everything is derivable. Intent, exceptions, deliberate deviations and their
reasons are human facts, and a synthesizer that overwrites them makes the
manifest useless the second time it runs.

The rule that governs how those fields are *seeded* is worth stating on its own,
because it is the difference between a first run that is honest and one that is
plausible: **leave a marker, never invent.** A synthesizer that cannot determine
a value writes an explicit placeholder naming what a human must supply — not a
guess, not a sensible-looking default, not an empty string that reads as an
answer. The placeholder is detectable, so the checker can report the field as
unfilled; a fabricated value is indistinguishable from a real one and will be
believed.

The rule: **generated fields and human fields never share a container.** Give the
human-owned material its own top-level key, exempt it from the drift comparison,
and carry it forward untouched on regeneration. Mixing them produces the worst
outcome available — a file that is neither safely regenerable nor safely
editable, so people stop doing both.

## Numbers in a generated manifest

If the synthesizer records any count — files inspected, capabilities detected,
entries sampled — that number travels with its predicate: what was counted, by
what method, and under which cap (`_laws.md#count-carries-predicate`). A bare
count in a machine-readable artifact will be lifted into a dashboard, a report,
or a claim it does not support, and the lift is invisible.

The same discipline governs the language of any claim the manifest makes about
itself: the honest phrasing is **evidence for** a property, never **compliance
with** a standard. Compliance is a verdict someone else reaches from evidence;
declaring your own compliance in your own file is circular, and readers who
notice will discount every other field too.

## Decision rules

- **When a field can be derived, derive it** — even if the derivation is
  imperfect, because an imperfect derivation is checkable and a perfect
  hand-entry is not.
- **When a generated artifact will run in someone else's environment, derive
  every value the producer has already decided for itself from that
  declaration** — and assert the pair in a test. Your suite is not evidence
  about a file your suite never executes.
- **When a field cannot be derived and is not stable, do not add it.** An
  undecidable field becomes a stale field.
- **When the drift check fires often for legitimate reasons**, the synthesizer is
  reading something too volatile. Narrow its inputs; do not weaken the check.
- **When first adopting, run the synthesizer and commit its exact output.** A
  hand-edited "close enough" first version guarantees the very first drift check
  fails, and the team learns to ignore it before it has ever been right.

## When not to use this

Do not generate a manifest for a repository whose capabilities the synthesizer
cannot actually observe — an unusual build, a private toolchain, anything where
detection would be guesswork. A confidently wrong generated claim is worse than
an honest hand-written one, because it carries provenance that implies it was
measured. In that case, write it by hand, mark it human-owned in full, and skip
the drift check rather than running a check that cannot see its target.

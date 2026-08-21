---
layer: technique
type: technique
subject: generative-artifact-gating
technique: placeholder-is-not-an-asset
status: forged
laws: [unmeasured-is-not-a-pass, structural-proof-is-never-sufficient]
use_when: [a generative step reports green with no generator run, deciding the verdict for a seeded stand-in, auditing whether gates are sensitive to their own content]
---

# Placeholder is not an asset

## The concern

A deterministic stand-in — a seeded swatch, a default index, a procedurally derived
sample, a checkerboard — is indistinguishable from a real generated asset to any check
that asks whether a slot is filled. It renders. It is structurally valid. It never fails.
Its entire purpose is to let the surrounding system be built before the generator exists,
and that purpose is served the moment someone forgets it is there. This technique is the
discipline of keeping the distinction alive all the way to the gate.

## The verdict rule

For any generative slot, the gate resolves the slot to a concrete object and classifies
its origin before it grades anything:

| What is in the slot | Verdict | Why |
| --- | --- | --- |
| No generation history at all | **defer, not measured** | absence of work, not bad work |
| A deterministic stand-in | **defer, naming the missing artifact** | no local edit can produce one; the generator must run |
| A generated asset that resolves cleanly | **pass at the lowest tier its evidence supports**, naming the asset | the only advancing state |
| A selection that resolves to nothing, or contradicts itself | **fail** | the record of what happened is corrupt |

The two deferral rows and the fail row are the whole technique. A stand-in is not a
failure — nobody did anything wrong, the work simply has not happened — but it is
categorically not a pass, and reporting it as one is how a line accumulates months of
green over an empty pipeline.

**State the deferral at the rung whose work resolves it.** A missing generated asset is a
perceptual gap: it is repaired by running a generator, not by editing a value. When the
deferral is filed at a structural or configuration rung, the person who picks it up spends
an hour looking for the setting that will fix it. Naming the rung is not cosmetic; it is
the routing information.

## The mutation probe

The only reliable way to know whether a gate makes this distinction is to attack it.

1. Enumerate every registered generative step. The whole registry, not a sample — the
   steps you would have sampled are the ones somebody thought about.
2. For each, take the live content the step's check reads and produce mutants: scale every
   numeric field by a large factor, replace every string with a different string, and
   where a selection exists, point it elsewhere.
3. Re-run the verdict against each mutant.
4. Record, per step, whether **any** mutant moved the verdict.

A step whose verdict is identical across every mutant is insensitive to its own content:
it is not checking anything, whatever it prints. Report the count as a fraction —
insensitive steps over registered steps — and treat it as a production metric that belongs
next to coverage. In one fleet audit the figure was **44 of 47**: those steps had been
green for months and were reporting on the presence of a non-negative integer.

Rerun the probe whenever a gate is rewritten. It is cheap, it is deterministic, and it is
the only evidence that a gate is a gate.

## Building stand-ins so they can be caught

The distinction is only checkable if the producer preserves it, so stand-ins are built to
be identifiable rather than to be convincing:

- Every candidate records its **origin** as a first-class value: generated, or
  deterministic stand-in. Never infer origin from a filename, a size, or a hash — guessing
  is how the distinction dies.
- Where the origin must be read off the representation rather than a flag, make the two
  representations **structurally disjoint by construction**: a real asset is always a
  reference to a served location, a stand-in is always a locally computed value, and no
  string can be both. Disjointness by design is decidable; disjointness by convention is a
  heuristic that fails on the first unusual case.
- The stand-in is **self-describing in the data**, not only in the surface: the recorded
  direction or prompt says in plain words that no generator has run, so a reader of the
  raw artifact — human or machine — sees it without consulting a schema.
- The stand-in is **deterministic**: no wall-clock stamp, no random identifier. The same
  input yields the same artifact, so content fingerprints are stable and every verdict
  bound to one stays meaningful.
- The stand-in seeds the **same shape** the real path persists — same fields, same
  history structure, same selection. Then the grader is exercised identically on both
  paths, and it can defer honestly rather than crashing or falling through to a neutral
  pass on a shape it did not expect.
- Where a stand-in is displayed to a human, it is labelled in the surface too. A reviewer
  who cannot see that they are approving a placeholder will approve it.

## When not to use it

- **Where the stand-in is the deliverable.** Some slots ship a deterministic asset on
  purpose — a fallback, a neutral default, a licence-safe substitute. Then the stand-in is
  the intended output and the gate grades it on its own terms. Mark those slots explicitly;
  the exception must be declared, never inferred from the fact that a stand-in is present.
- **Before a generator exists at all.** During bring-up, the deferral is correct and
  expected, and firing it as an alarm on every step trains people to ignore the gate. Defer
  quietly, count the deferrals, and escalate on the trend rather than the instance.
- **As a substitute for grading.** Confirming that a real generated asset is present says
  nothing about whether it is any good. This technique establishes only that there is
  something worth grading; the grading is a separate rung and a separate rubric.

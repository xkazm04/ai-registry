---
layer: technique
type: technique
subject: procedural-level-planning
technique: declare-what-each-engine-ignores
status: forged
laws: [unmeasured-is-not-a-pass, no-gate-self-certifies, declaring-an-input-is-not-consuming-it]
shared_with: []
use_when: [several generators accept the same request type, a designer cannot tell which inputs mattered, comparing two backends on one brief]
---

# Declare what each engine ignores

Several generators accept the same request and return the same result type. That shared
type is a convenience for the caller and **not** a statement that the generators read the
same fields. This technique makes the *discarded* half of the request machine-readable:
for each generator, the set of request fields it did not consult, attached to the result
it produced.

The named concern is asymmetry of visibility. What a generator honoured is visible in the
output. What it discarded is visible nowhere — it looks exactly like a request that was
honoured and happened not to change much.

## Why it must be data

A design note saying "the tile collapser ignores symmetry" drifts within a release and
cannot be consumed by anything. As data attached to the result, the ignored set does four
jobs no prose version can:

- The authoring surface greys the right controls automatically, per algorithm, without a
  second hand-maintained list.
- A check can fail when a generator starts ignoring a field it used to honour — a silent
  regression that otherwise surfaces as "the levels feel different lately".
- A designer comparing two backends on one brief sees the trade in a single view.
- The result carries its own caveat downstream. Anything consuming the plan can see which
  parts of the brief the plan does not actually represent.

An input that was never consulted must be reported as discarded, never absorbed in
silence: an unconsulted field and a field whose value happened to make no difference are
different epistemic states, and collapsing them is exactly what
[unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass) forbids.

## Procedure

1. **Type the request as a superset** of what any one generator needs, and accept that
   this is what forces the declaration. A shared request type without a per-generator
   ignored set is the trap, not the solution.
2. **Declare the ignored set next to the generator**, in the same place its capabilities
   are declared, so a code change and a declaration change are one edit. Alongside it,
   declare how faithfully the generator reproduces the requested layout at all — the
   degree of agreement between what was asked and what the algorithm can express is its
   own field, and it is frequently more honest than any per-field flag. Make that agreement
   answerable for any *pair* of generators — including a generator against itself, where the
   honest answer is "yes, it replays" or "no, this pipeline is not deterministic", which is
   precisely what a caller needs before it promises anything to a designer. Every
   cross-generator pair answers no, with the structural reason; that the answer is always no
   is the point, because a shared request type invites the opposite assumption.
3. **Attach both to the result**, not only to the generator's static description. A result
   travelling without its caveats will be read as complete.
4. **Verify the declaration independently.** A generator's own statement that it honoured a
   field is a self-report, and
   [no-gate-self-certifies](../../../_laws.md#no-gate-self-certifies) applies: the claim is an
   input, not a verdict. The external check is mechanical — hold the seed, vary the field,
   assert the output changes for fields declared consumed and does not for fields declared
   ignored. A declaration that has never been differentially tested is documentation with a
   type annotation.

## Decision rules

- **When a field is partially honoured, split the field.** "Honours corridor width but only
  in cardinal corridors" is two fields pretending to be one; a boolean over a compound
  field is a lie in one of its halves.
- **When a generator ignores a field because the request is out of its range** — a room
  count no partition of this footprint can reach — that is a *clamp*, not an ignore.
  Report the requested and the achieved value; do not fold it into the ignored set, or the
  designer learns the control is dead when it was merely bounded.
- **When the ignored set is large, say so at selection time.** A backend that consults
  three of eleven fields should not be reachable by accident; a designer picking it should
  see the ratio before generating, not after.
- **When the ignored set is empty, prove it before asserting it.** An empty set is the
  strongest claim in this system and the one most likely to be stale.
- **When a request must be projected onto a narrower target surface, report every lossy step
  by name.** A band of eight to twelve collapsed to a single target of ten, that target
  clamped to the receiving surface's maximum, a value re-encoded to fit the receiving type —
  each is a separate line naming the before, the after and the reason. A handoff that
  silently reshapes the request is the same overclaim as an undeclared ignore, arriving one
  layer later. Where a re-encoding is genuinely lossless, say that too, so nobody spends a
  day proving it again.
- **When a result's request was never recorded, mark it unrecorded — do not reconstruct
  it.** A stored run that kept only a room count and a seed has no algorithm and no
  parameter set, and inventing plausible ones fabricates exactly the inputs this technique
  exists to make explicit. Two states, visibly different: *declared* and *unrecorded*.

## When not to use this

- **A single generator with a request type shaped to fit it.** Then the type *is* the
  contract, and an ignored set would be permanently empty and therefore ignored by readers.
- **Fields the caller may set that are not generation inputs at all** — labels, tags,
  provenance. Declaring these as ignored is noise; keep the request's generation-affecting
  fields separable from its metadata so the declaration stays about what it is about.
- **As a substitute for the support matrix.** The two are complements: the matrix is the
  forward-looking, per-parameter surface a designer reads *before* generating; the ignored
  set is the backward-looking fact attached to a result *after*. Neither replaces the
  other, and a team that keeps only one keeps the one that fits its bug reports.

## What good looks like

Two backends run the same brief. The results sit side by side, each carrying its ignored
set and its layout-agreement value. The designer reads them, sees that one respected the
requested room count and flattened the requested symmetry while the other did the reverse,
and chooses on the basis of which discard they can live with — a design decision made from
data rather than from a hunch formed over twenty re-rolls.

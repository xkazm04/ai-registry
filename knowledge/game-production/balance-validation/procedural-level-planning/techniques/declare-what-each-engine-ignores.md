---
layer: technique
type: technique
subject: procedural-level-planning
technique: declare-what-each-engine-ignores
status: forged
laws: [unmeasured-is-not-a-pass, no-gate-self-certifies, declaring-an-input-is-not-consuming-it]
shared_with: []
use_when: [several generators accept the same request type, a designer cannot tell which inputs mattered, comparing two backends on one brief, making two engines agree on one generated layout]
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
   *regenerating* pair answers no, with the structural reason — two generators that each
   build a layout from the request, however faithfully, do not build the same one, and a
   shared request type invites the opposite assumption. There is exactly one way to make a
   pair answer yes, and it is not a better seed; see below.
3. **Attach both to the result**, not only to the generator's static description. A result
   travelling without its caveats will be read as complete.
4. **Verify the declaration independently.** A generator's own statement that it honoured a
   field is a self-report, and
   [no-gate-self-certifies](../../../_laws.md#no-gate-self-certifies) applies: the claim is an
   input, not a verdict. The external check is mechanical — hold the seed, vary the field,
   assert the output changes for fields declared consumed and does not for fields declared
   ignored. A declaration that has never been differentially tested is documentation with a
   type annotation.

## Agreement is bought by shipping the layout, not the seed

An earlier statement of this technique held that *every* cross-generator pair answers
no. That is true of every pair that regenerates, and it is false as an absolute — the
correction is worth stating because the route to the exception is the useful part.

Two engines asked to agree from a seed can only do so if they share the algorithm, the
version, the draw order and the parameter set. Where one of them is authored freehand by
a generative model, that contract is void before it starts, and no amount of porting the
random stream repairs it. Same-seed parity across regenerating engines stays aspirational
however honestly it is declared.

The alternative is to stop asking them to regenerate. **One engine exports the finished
layout as data; the other replays it.** Agreement is then not a property anyone verified,
it is a property of the construction — and it holds for the fields the export carries
and for nothing else.

- **Export a versioned, self-describing artifact**, not a bag of cells. It carries its
  version, which engine generated it, the algorithm, the seed label *and* its resolved
  value, the requested and the achieved dimensions, the legend for its own encoding, the
  cells, the request fields the exporting engine consumed, **the request fields it
  ignored** — this technique's own payload, travelling with the data — and the agreement
  claim with its rung.
- **The replaying engine's ignored set is empty, and here that is honest.** It reads no
  request fields at all, because the request's influence is already baked into the cells.
  This is the one case where the strongest claim in the system is safe to assert; say
  *why* it is empty in the same place, or it will read as the stalest declaration in the
  file.
- **Refuse rather than degrade on import.** An unrecognised version, a wrong row count,
  an unknown glyph — decline. A replay that silently repairs its input is a second
  generator wearing the word replay, and it re-opens the disagreement the export closed.
- **State the parity rung inside the agreement reason, in the same sentence as the
  claim.** "These two agree" reads as *verified*. The honest form names both halves: the
  layout data is identical by construction because the replay consumes the exported cells
  verbatim, **and** whatever the receiving engine then does with those cells at runtime is
  unobserved until somebody observes it. A boolean carrying an unqualified true is this
  technique's own overclaim arriving at the one place everybody assumed was safe.
- **Pin the field names across the language boundary.** The replaying side usually lives
  in another language and often outside the build, so nothing notices when a field is
  renamed on the exporting side. Compare the two field lists — and the supported version,
  and the cell vocabulary — against one source, so a rename fails the build instead of
  silently breaking a script nothing runs.

The neighbouring contract owns the storage half of this: a designer who wants a specific
level kept stores the plan rather than the seed (seed-determinism-contract). This is that
rule aimed across engines instead of across time, and it buys the same thing — the
artifact, not a recipe for re-deriving it under assumptions the other side does not share.

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

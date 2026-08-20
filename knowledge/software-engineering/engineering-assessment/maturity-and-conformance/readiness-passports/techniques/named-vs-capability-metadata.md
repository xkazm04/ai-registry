---
layer: technique
type: technique
subject: readiness-passports
technique: named-vs-capability-metadata
status: forged
laws: [one-authority-per-vocabulary, count-carries-predicate]
shared_with: []
use_when: [choosing fields for a comparable per-project fingerprint, a boolean capability field is not answering the reader's question, worrying that named tooling in a schema will rot]
---

# Named vs capability metadata

Two ways to describe the same fact about a project:

- **Capability-shaped** — "there is a way to check types here, and this is how
  to invoke it." Survives the tool being replaced.
- **Name-shaped** — "type checking is done with *this specific tool*." Rots
  when the tool is replaced.

The default engineering instinct, correctly learned from self-declared
repository contracts, is that capability-shaped always wins. **For an
externally derived comparison artifact, that instinct is wrong**, and this
technique is about choosing deliberately rather than reflexively.

## Whose question is the field answering?

The shape follows the consumer, and the two consumers are different people.

An **automation reader** arrives with one project and wants to *do* something:
run the checks, find the evidence, decide whether to proceed. It must not care
which tool is behind the capability, because caring is what breaks it on the
day the tool changes. Capability-shaped.

A **portfolio reader** arrives with forty projects and wants to *see the
spread*: what is actually standardised here, where is the long tail, which
migration would touch the most projects, which project is the odd one out. For
this reader "has a type-check capability: true" is worthless — it is the fact
they already assumed. The information they came for is the name, and only the
name carries it.

The test, applied per field: **if every project in the portfolio answered this
field identically, would the field still be worth printing?** If yes, it is a
gate condition and should be capability-shaped. If no — if its whole value is
that projects differ — it is a comparison field and should be name-shaped.

## The rule of construction

> Axes and gate conditions are capability-shaped. The descriptive skin is
> name-shaped. Nothing downstream branches on a name.

That last clause is what keeps the naming safe. A named field is *data for a
human comparing*, never a *condition for a machine deciding*. The moment a rung
criterion reads "if the runner is X then rung 3", the fingerprint has taken a
vendor position, the criterion silently becomes false when the ecosystem moves,
and the ladder's meaning changes without a version bump. Keep names in fields
that are displayed, grouped and counted — never in fields that are compared
against a constant to produce a verdict.

## Making named metadata rot slowly

Named fields rot. The point is to make the rot visible, cheap and local rather
than to pretend it will not happen.

**Recompute, do not store as truth.** The name is a projection of the current
assessment, regenerated every run. A stored name is a claim about the past
presented as the present; a recomputed one is simply what was there this
morning. Where a name *is* persisted (in the fingerprint itself, which is the
point of a portable artifact), it is stamped with when it was observed, and
staleness is the reader's cue, not a silent lie.

**Open vocabulary with an explicit unknown.** The enumeration of names is open
by construction: an unrecognised tool renders as its literal detected name
under an `other` grouping, never as absent and never as "none". Collapsing an
unrecognised tool into "no capability" is the classic instrument failure — the
scanner that finds nothing and the scanner that could not recognise anything
produce the same output.

**One authority for the vocabulary.** The mapping from detected evidence to a
canonical name lives in exactly one place and every renderer, grouper and
counter derives from it
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Two hand-maintained name lists — one in the detector, one in the portfolio view
— drift at the moment someone adds a tool, and drift here manifests as a
portfolio split into two groups that are the same group.

**Names are grouped by identity, not by rendered string.** Version suffixes,
casing and packaging differences must normalise to one identity before
counting, or the rollup reports two small clusters where there is one large
one. Any resulting count carries its predicate — what was detected, by which
rule, over how many projects
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

**The grouping axis is a kind, the name is the payload.** For anything that
comes in families — an integration, a data store, a hosting arrangement — carry
both a small closed **kind** enum and the free-form vendor name. The kind is
what a portfolio sorts, filters and counts on ("how many projects have a
payments integration at all?"); the name is what the reader looks at *after*
sorting, to decide whether the spread is one thing or five. Carrying only the
name forces every consumer to reimplement the classification, and they will
each get it slightly differently.

## Detection honesty

A named field has three states and they must be distinguishable in the schema:

| State | Meaning |
| --- | --- |
| A name | This was detected, by a stated rule |
| `none` | We looked with a rule that would have found one, and there is none |
| `unknown` | We could not look, or found something we could not classify |

And **`none` is emitted, never omitted**. The temptation with a descriptive
block is to leave absent things out to keep the artifact small, which destroys
the comparison: a reader cannot distinguish "this project has no error
tracking" — a fact they came for — from "this field was not part of the schema
when this artifact was written". An explicit null is a first-class answer and
costs one line.

Never conflate the last two. `none` is a finding a reader may act on;
`unknown` is a gap in the instrument. Detection also states its *strength*: a
name inferred from a dependency declaration is weaker evidence than a name
inferred from a command that was actually observed running. Where the schema
can afford it, carry the strength; where it cannot, use the weaker rule
consistently and say which one it is.

## The interaction with the self-declared contract

A project that publishes a capability-shaped manifest about itself and an
assessor that publishes a name-shaped fingerprint about that project are not in
conflict; they are two artifacts with opposite jobs, and each is wrong if it
adopts the other's shape. Reading the manifest is a legitimate *input* to the
fingerprint — but the fingerprint records it as a self-declared signal, weighted
as such, and never as an observation. A declared capability with no observed
invocation is a hypothesis, and promoting it to an observation is how an
external assessment quietly becomes a self-assessment with extra steps.

## When not to use this

- **A contract other tools must read.** If the artifact's consumers are
  programs that will branch on its contents, go capability-shaped everywhere;
  the comparison value is not worth the coupling.
- **A single-project view.** With one project on screen there is no spread to
  see, so the name buys nothing the automation reader needs and costs the
  rot anyway.
- **Where the name is legally or commercially sensitive** — a fingerprint that
  travels outside the organisation is a disclosure of the internal toolchain.
  Then the descriptive skin is dropped, not softened; a partially redacted
  spread is worse than none, because the remaining names look complete.

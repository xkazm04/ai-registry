---
layer: technique
type: technique
subject: knowledge-registry
technique: lane-contracts
status: forged
laws: [gate-sees-target, one-authority-per-vocabulary]
shared_with: []
use_when: [dividing mixed registry content into single-shape lanes, a rebuild wipes fields another producer owns, deciding whether an empty lane passes its gate]
---

# Lane contracts

A registry holding one kind of content is a folder. A registry holding several —
reference knowledge, reusable instructions, organizational facts, contributed
telemetry — needs each kind to carry its own contract, because a single validator
over heterogeneous content either rejects half of it or checks none of it in a
way that means anything.

A **lane** is a top-level division with exactly one item shape. Its contract is
three things:

- **A path.** One place its items live, so membership is structural rather than
  inferred from content.
- **A specification.** One document describing the item shape, referenced from
  the lane declaration rather than implied by examples.
- **A gate.** A check that enforces the specification, owned by the lane.

The gate belonging to the lane is the load-bearing part. A repository-wide
validator grows a conditional per content type, and each conditional is a place
where a new lane silently gets no checking at all. A per-lane gate is either
present or absent, and its absence is visible in the declaration.

## Declare the lanes in the repository, not in a consumer

The list of lanes is a fact about the repository. Writing it into one consumer's
configuration makes that consumer the authority on what the repository contains,
which is wrong the moment a second consumer exists
(`_laws.md#one-authority-per-vocabulary`).

A neutral declaration at the root — what the lanes are, what each holds, which
document specifies it, which check gates it — is readable by every consumer and
owned by none.

## Additive evolution, stated in-band

A registry grows lanes and fields over time while old readers stay deployed. The
rule that makes that safe is simple and has to be written down *in the file
itself*, because it is a promise to code that has not been written yet:

> **Unknown fields must be ignored by a reader.**

With that rule stated, adding a lane or a field is not a breaking change, and no
consumer needs to be updated in lockstep to keep working.

The rule has a mirror image that is violated far more often, because it applies
to writers rather than readers: **ignoring what you do not recognize does not
mean deleting it.** A producer that rebuilds a shared artifact from scratch drops
every field it has no opinion about, and if a second producer owned those fields,
their content is gone with no error and no diff explaining why.

A producer of a shared artifact must therefore read what is committed, carry
forward what it does not own, and write only its own keys — with its own keys
winning, so a foreign field cannot shadow a schema identifier or a count. This is
worth a test: assert that a field belonging to another producer survives a
rebuild, and that a hostile value in an owned field does not.

## Gate the lane against its own emptiness

A lane's gate must fail when its input is absent rather than reporting success
over nothing (`_laws.md#gate-sees-target`). The distinction that matters:

- **An empty lane is legitimate** — nobody has contributed yet — and should pass
  with a message saying so.
- **An unreadable lane is not** — the directory exists and cannot be walked — and
  must fail loudly.

Collapsing those two into "no findings" is how a lane quietly stops being checked
the day someone changes its path.

## One lane, one item shape

The temptation, once lanes exist, is to reuse a lane for something adjacent —
telemetry beside instructions, drafts beside published items. Resist it. The
lane's gate encodes one shape; a second shape in the same lane either fails the
gate or forces the gate to become permissive enough to miss real defects in both.

A new kind of content is a new lane. It costs a directory, a paragraph of
specification and a check — and it is the cheapest part of the whole
arrangement.

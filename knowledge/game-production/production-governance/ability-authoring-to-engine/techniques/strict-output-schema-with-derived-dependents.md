---
layer: technique
type: technique
subject: ability-authoring-to-engine
technique: strict-output-schema-with-derived-dependents
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [designing the return shape for a generated artifact, deciding which fields to ask a generator for, removing silent contradictions from generated output]
---

# Strict output schema with derived dependents

## The concern

Two decisions hide inside "define the output schema". The first is obvious and easy:
constrain the output to an exact shape so parsing is total and failures are loud. The
second is neither, and it is where the damage lives: **which fields the schema should
contain at all**.

The rule is short. *Never ask a generator for a value you can compute from its other
answers.* Every such field is a free opportunity for an internal contradiction, and the
contradiction will be silent — both values are individually plausible, both are inside
their ranges, and nothing in the system knows which one is the authority. A profile score
that disagrees with the numbers it profiles. A summary that disagrees with its own parts. A
total that is not the sum. These do not fail validation; they fail belief, six weeks later,
when someone sorts by the wrong one.

## The procedure

**1. Write the field list, then partition it.** Every field is one of three kinds.
*Primary* — a genuine authoring decision the author must make (the identifier, the
description, the timings, the base magnitudes). *Derived* — computable from primaries by a
rule you can write down. *Foreign* — owned by another system and only referenced here.

**2. Ask for primaries. Compute derived. Validate foreign.** Derived fields are removed
from the schema and produced by one function on the consuming side. This is not merely
safer; it is cheaper and more consistent, because the derivation is uniform across the
whole corpus instead of re-imagined per generation.

**3. When a derived field must stay in the schema, make it advisory and check it.** There
are real reasons to keep one — the author's own summary can be a useful signal of intent,
or the derivation is a matter of taste you want a human eye on. Then keep it, label it as
the author's claim rather than as the value, compute the real one alongside, and treat a
divergence beyond a stated tolerance as a finding. What you may never do is keep it,
compute nothing, and let downstream consumers pick whichever they read first.

**4. Give every quantity its unit and its basis in the schema itself.** Name the field for
what it counts and in what units. A duration field that does not say seconds will receive
milliseconds. A cost that does not say which resource will be filled from whichever pool
the author was thinking about. A normalised axis that does not state its range and its
reference point is an opinion with a number attached.

**5. Constrain relationships, not only types.** A shape validator that types each field
independently accepts artifacts that are internally impossible: an active window that ends
after the animation it lives inside, a recovery longer than the whole action, a
sub-interval outside its parent. Write those as explicit cross-field checks at acceptance
time. They are the cheapest checks in the pipeline and they catch the errors reviewers
consistently miss, because reading two numbers ten lines apart and comparing them is
exactly what human review is bad at.

**6. Name the ambiguous fields against their confusable neighbour.** Where two quantities
of the same unit sit at different layers — an action-level interval and a repeat interval
inside one of its parts — the field name alone will not carry it. Say what it is *not*, in
the schema and in the rules. The disambiguation costs one clause and prevents a class of
defect that reads correctly in every artifact it corrupts.

## Decision rules

- **When a field is computable from other fields in the same response, remove it.** Default
  answer. Keep it only with a written reason and a divergence check.
- **When a quantity exists at two layers, exactly one layer owns it and the other derives
  or references it.** Where both are authored, define the resolution rule explicitly and in
  one place — an explicit precedence rule beats two values, and both beat a silent
  last-writer-wins.
- **When a number is authoritative elsewhere, do not ask for it.** Pin it from the owning
  record and instruct the author to reconcile to it. A generated artifact that quietly
  disagrees with the catalogue it belongs to is a drift source, and it drifts in the
  direction of whatever the author last saw.
- **When the output must be machine-read, forbid decoration.** No prose wrapper, no fenced
  block, no commentary. Reject rather than repair — a repair layer becomes the place where
  malformed output is normalised into wrong output.
- **When a value is unknown, the schema must have a way to say so.** An unknown that has no
  representation becomes a plausible default, and a plausible default is indistinguishable
  from an authored decision the moment it is written down.

## When not to use it

- **When the task is exploratory.** Early concepting benefits from an author that can
  return a shape you did not anticipate. Constrain at adoption time instead, and accept
  that adoption may reject.
- **When the derivation is genuinely contested.** If two teams compute the summary
  differently and the disagreement is substantive, computing it silently on the consuming
  side hides a real argument. Surface it, settle it, then derive.
- **When the schema would need to encode the whole domain.** A schema that grows a field
  per special case has become a bad programming language. At that point the artifact wants
  a real authoring surface and the generator wants a narrower job.

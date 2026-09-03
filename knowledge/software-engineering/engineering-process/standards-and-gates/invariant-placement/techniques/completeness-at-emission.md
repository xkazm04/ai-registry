---
layer: technique
type: technique
subject: invariant-placement
technique: completeness-at-emission
status: forged
laws: [one-validation-door, unknown-is-not-a-value]
shared_with: []
use_when: [assembling a payload every consumer will read, a response that shipped missing a required field, choosing between a staged constructor and a schema check on the way out, counting the declaration cost of a required-field encoding]
---

# Completeness at emission

Most validation effort points inward. Data arrives, is parsed once at the
boundary, and becomes a value whose existence proves it was checked. The
outbound direction gets a fraction of the attention and deserves more, because
the two are not symmetric:

> **One badly parsed input produces one failed request. One badly assembled
> output is read as correct by every consumer of it.**

An inbound defect is loud, local, and attributable. An outbound defect is
silent at the source and distributed at the destination — the emitter reports
success, the consumers each build on a payload missing a field their contract
promised, and the discovery happens somewhere with no access to the code that
caused it. That asymmetry is what earns the outbound boundary a higher
altitude than the inbound one for the *same* rule.

The placement: **make the emit operation unavailable until every required part
has been supplied**, rather than assembling a payload and validating it
afterwards. The construction is staged — each required part supplied moves the
value one step toward a state in which emitting exists at all — and a caller
who forgot one has written a call to an operation that is not there.

## What this actually proves, and what it does not

The distinction is the most misread thing in this whole area, and getting it
wrong is how an encoding becomes an unchecked access.

**Proved:** the emit operation was reachable only after every required part was
supplied through the constructor. The *construction path* was followed.

**Not proved:** that the parts are populated, meaningful, or non-empty. The
encoding guarantees **operation availability**, not **data population**. Under
the emit operation there is usually an unchecked extraction of each required
part — safe, the reasoning goes, because the shape guarantees it — and the
guarantee it rests on is the first claim, while the code needs the second.
They coincide only if every path that advances the state also stores the value,
which is true of the straightforward implementation and quietly false the first
time someone adds a second way to advance.

Two rules keep this honest:

- **The state advance and the store happen in the same operation, and nothing
  else advances the state.** That is the per-value form of
  [one-validation-door](../../../../_laws.md#one-validation-door), and it is
  the only reason the unchecked extraction underneath is defensible.
- **Where the extraction remains unchecked, the comment says which claim it
  rests on** — availability, not population — so the next reader who adds an
  advance path knows what they are breaking.

## Optional parts are where the door invents data

The staged construction handles required parts. Optional ones stay ordinary,
and they are where the failure of this altitude concentrates: a part is absent,
the emitter needs *something*, and a plausible number appears with a comment
calling it a safe default. It is now indistinguishable from a measured one, in
a payload every consumer trusts, produced by the mechanism advertised as making
incomplete output impossible
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

The rule: **an absent optional part is omitted, never defaulted.** If the
schema will not tolerate omission, the part was not optional and belongs in the
required set. If the consumer needs a fallback, the consumer applies it, where
the fallback is visible to the party that has to live with it.

## When not to use it

**At roughly three or more required parts.** The declaration cost of a staged
construction is the inversion condition, and it is combinatorial in a way
nobody counts. Each required part settable in any order needs its own
transition declaration, and each such declaration restates every other tracked
part, because the transition changes one position and carries the rest
unchanged. Four required parts is on the order of fifty lines of near-identical
declaration for a rule that reads as one sentence — and the growth continues
while the sentence does not.

The refusal message degrades on the same curve. With one or two tracked parts
the diagnostic names the missing part better than any hand-written error could.
With four, the reader is decoding a positional structure to find which position
holds the not-yet-supplied marker. Nothing warns at the crossing point, because
the encoding keeps working perfectly; the cost lands entirely on whoever reads
the failure, which is never the person who chose the encoding.

So: **two or three required parts, stage the construction; beyond that, run one
completeness check at a single emission door** — a schema validation, or an
explicit assembled-value check — and pay for it with a runtime failure that
names every missing part at once, which is a better diagnostic than the shape
gives you at that size anyway. The check is at *one* door, which is what makes
it enforceable; a completeness check duplicated at each emission site is the
thing this technique replaced.

**When the payload's shape is dynamic** — parts determined by a negotiated
version, a subscription tier, or the caller's own request. A staged
construction fixes the required set at declaration time; a required set that
varies per emission cannot be tracked that way, and attempts to track it
multiply the declarations by the number of variants.

**Inbound.** The same rule on the way in is a parse at the boundary producing a
validated value — the door altitude, one construction path, no staging. The
asymmetry runs one way.

## Decision rules

- The outbound boundary earns a higher altitude than the inbound one for the
  same rule, because the blast radius is every consumer rather than one caller.
- Stage the construction at two or three required parts; use a single-door
  completeness check beyond that.
- Count the declarations before adopting, and re-count at the part count you
  expect in two years.
- One operation advances the state and stores the value; nothing else advances
  it.
- Absent optional parts are omitted, never defaulted.
- Never let the availability guarantee be quoted as a population guarantee.

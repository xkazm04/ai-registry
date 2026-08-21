---
layer: technique
type: technique
subject: ability-authoring-to-engine
technique: refinement-mode-minimal-diff
status: forged
laws: [refuse-rather-than-destroy]
shared_with: []
use_when: [iterating on an already-generated artifact, applying a one-line designer change request, keeping review cost proportional to the change]
---

# Refinement mode, minimal diff

## The concern

The first generation and the second are different tasks, and the common mistake is to
implement one call for both. Once an artifact exists and has been read by a human, the
request is no longer "produce an artifact" — it is "apply this change and touch nothing
else". Re-running the original prompt with the change appended does not do that.
Unconstrained regeneration is unstable by construction: the description gets rephrased,
identifiers get re-picked, three unrelated numbers move a little, and the result is a
different artifact that happens to satisfy the request.

The cost is paid in review. A designer asked to check a two-field diff checks it. A
designer handed a thirty-field diff reads the field they asked about and approves the rest,
which means the twenty-eight unrequested changes ship unreviewed. Regeneration does not
merely risk losing authored work; it launders unreviewed changes through a review that
looked like it happened.

## The procedure

**1. Make refinement a distinct mode with its own task framing.** Same schema, same
validators, different instruction: *you previously produced the artifact below; a single
follow-up instruction has arrived; apply it and return the complete artifact.* The prior
artifact goes in whole, serialised, as the object to be edited — not summarised, not
described.

**2. Carry the original brief alongside the prior artifact.** The change request is
elliptical by nature ("make it hit harder"); it is interpretable only against the intent
that produced the thing. Without the original brief the author re-infers an intent from the
artifact's surface, and re-inferred intent is where scope creep enters.

**3. Return the complete artifact, not a patch.** The temptation is to ask for a diff and
apply it. Resist it: fragments cannot be schema-validated, cannot be checked for
cross-field coherence, and put a merge algorithm — the least reliable component available
— on the critical path. Whole-artifact return keeps refinement on exactly the same
validation path as first generation. The minimal-diff constraint lives in the *instruction*
and is enforced by *comparison afterwards*, not by the transport.

**4. Define minimality as the implicated closure, not as one field.** This is the part
teams get backwards. "Change only the field named" is wrong — a change often implies
others, and leaving those stale produces an internally contradictory artifact, which is the
worse failure. State it as: change what the instruction asks for, re-derive everything that
change implies, and leave everything else byte-identical. Then name the implications
explicitly in the rules, because the author cannot guess your dependency graph: if the cost
falls, the cost field and the cost as it appears in the generated code both fall; if the
shape becomes an area effect, the area axis of the profile rises and the code grows the
sweep that justifies it.

**5. Pin identity across refinements.** The artifact's stable identifier does not change on
a refinement unless the instruction changes what the thing fundamentally is. An identifier
that drifts breaks every reference to the artifact and defeats the audit trail the mode
exists to preserve.

**6. Regenerate derived code artifacts wholesale, inside the same call.** Where the
artifact carries generated source, the source is re-emitted in full so it stays compilable
and reflects the change. Minimal diff is a rule about the *authored* fields; a partially
patched source file is a different and worse problem than a re-emitted one.

**7. Verify the minimality you asked for.** Compare returned to prior field by field and
present the change set. Fields outside the implicated closure that moved anyway are a
finding: show them, and let a human accept or reject them individually. The instruction is
a request; the comparison is the enforcement, and a rule that is asked for but never
measured is a wish.

## Decision rules

- **When an artifact has been reviewed once, every later change goes through refinement
  mode.** The first generation is the only unconstrained one.
- **When the request would change the artifact's identity, that is a new generation, not a
  refinement.** Say so, and keep the old one; a refinement that replaces the thing has
  destroyed rather than edited.
- **When the change set exceeds a threshold you set in advance, stop and surface it.** A
  one-line request that moved fifteen fields means the author reinterpreted the brief. That
  is worth a human's attention, not an automatic apply.
- **When several refinements accumulate, keep each round's prior.** The lineage — brief,
  then each instruction and each resulting artifact — is what lets someone answer "when did
  this number become that" without guessing.
- **When the author cannot see the prior artifact, do not call it refinement.** A mode
  named for a guarantee it cannot provide is worse than no mode.

## When not to use it

- **When the artifact is small enough to re-review entirely.** Below a handful of fields,
  a fresh generation is cheaper than the machinery and the review is genuine.
- **When the prior artifact is known-bad.** Preserving fields from something structurally
  wrong preserves the wrongness. Re-brief and regenerate.
- **When the change is mechanical.** A rename, a unit conversion, a clamp — write the
  transformation as code. A deterministic edit does not need a probabilistic editor, and
  running one gives every untouched field a chance to move.

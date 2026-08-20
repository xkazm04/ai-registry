---
layer: technique
type: technique
subject: visual-style-locking
technique: draft-proofing-locked-ratchet
status: forged
laws: [edit-do-not-regenerate, unmeasured-is-not-pass]
shared_with: []
use_when: [designing the lifecycle of a style or theme record, deciding whether a style may anchor production, handling a project whose style record is missing]
---

# Draft → proofing → locked, a one-way ratchet

A style that can silently change is a style that cannot be trusted by
anything built on it. This technique gives the style artifact a lifecycle
with exactly one gate and no reverse arrow:

    draft ──generate proofs──> proofing ──decide them all──> locked

**Draft** is words: a block exists, nothing has rendered it. **Proofing** is
evidence-gathering: renders exist and await human judgment. **Locked** is
the only state a project may be created against — the state where the style
has been seen, on real renders, and ratified. The gate is the point: style
consistency comes from an approved artifact, not from a prompt suffix, and
skipping the approval step is the reliable way to a batch that does not
match.

## The state machine's disciplines

- **Status is derived, never stored.** "Locked" is a fact computable from
  the record — a lock timestamp set, else proofs-exist means proofing, else
  draft. A stored status field is a second source of truth that drifts the
  moment a proof is approved somewhere that forgot to update it.
- **The lock gate: at least one approval, zero undecided.** A rejected
  proof is a decision; a pending one is not. Locking over pending proofs
  ratifies unexamined evidence — the state machine's version of reporting
  pass on something unmeasured. When the gate refuses, say why in the
  owner's words: "two proofs still undecided", "every proof was rejected —
  generate another".
- **The ratchet: nothing unlocks.** Once frames have been generated against
  a style, editing it in place voids every approval on its sheet and
  orphans every frame — the reviewed work silently no longer matches its
  ratified standard. Evolution happens by **duplicating into a new draft**,
  which proofs and locks on its own merits while the original keeps
  anchoring what it already anchors. With no unlock arrow, "a theme that
  exists but is no longer locked" is a state that cannot be reached — and
  every consumer gets to not handle it.

## One resolution point, honest misses

Which style a given piece of work renders in must be answered in **exactly
one place**, reading the work's own explicit style binding. The defect this
displaces is worth naming because it ships easily: resolving "the" style as
*the account's most recently touched locked style* — plausible in demos,
and wrong for at least one project on any account with two locked styles,
always. The creation gate refuses a project without a style, and then the
studio quietly renders a different one.

When the binding cannot be resolved, the misses are **named states, never
stand-ins**:

- *unset* — the work predates the style system, or never bound one.
- *deleted* — it bound a style that no longer exists.

The resolver returns the miss; it does not substitute another style. A
caller that needs pixels anyway supplies its own fallback **and says which
miss it is covering**, in the user's words. An unannounced stand-in is the
bug the single resolution point exists to end.

## Decision rules

- When production asks for a style, offer locked styles only — everything
  else is still evidence-gathering.
- When an owner wants to change a locked style, duplicate it — the copy
  restarts at draft with the block carried over and the sheet empty,
  because the approvals belonged to the original.
- When a lock would discard or supersede paid-for proofing work, present
  the accumulated spend first — the sheet is money, and unpriced renders
  are unknown cost, not free.
- When persisting the artifact fails, surface it loudly — the sheet is the
  most expensive thing the surface holds, and silently losing an approved
  sheet is the worst bug this design can have.

## When not to use it

A throwaway exploration session — one person, one sitting, no batch to keep
consistent — does not need a ratchet; forcing draft/proof/lock ceremony on
doodling teaches users to resent the gate that matters later. The ratchet
earns its cost exactly when work will be *built on* the style: multiple
frames, multiple sessions, or multiple hands.

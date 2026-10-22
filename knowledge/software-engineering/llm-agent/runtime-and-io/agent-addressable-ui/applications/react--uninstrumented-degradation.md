---
layer: application
type: application
subject: agent-addressable-ui
technique: uninstrumented-degradation
stack: react
status: forged
verified_on: 2026-10-22
verified_against: react@19
applied: code
ab_verdict: better
---

# React: the unmapped banner existed, the empty-result state did not

The personas-web inspector overlay (`react@19`, witnessed by its lockfile) already
realises the technique's three-state core: a global "source mapping is OFF, relaunch with"
banner that names the exact command, re-probed on every render while armed, behind a
keyboard-prefix arm whose window expires after two seconds and which refuses to act in
text fields.

| technique element | realization |
| --- | --- |
| armed, uninstrumented | HUD shows the relaunch command verbatim when no element carries the stamp attribute |
| re-probe when arming | the probe runs in the armed render, so each hover re-asks the document |
| prefix arm, window expiry, typing guard | `;` then `i`, 2 s timer, text-field refusal |
| teardown restores | the cursor is captured on arm and put back, not reset |
| idle vs resolved-to-nothing | **absent**: both ended as `hover = null` and one "Hover a component" string |

**Seam chosen to falsify "the tree already conforms".** The idle-versus-empty collision is
the technique's least obvious sentence, and a tree that got the banner right is exactly
where it would hide. A caught outcome would have shown the two states already rendering
differently and the sentence a phantom. It was not: pointing at an element with no stamped
ancestor (a portal, a library node) cleared the hover and printed the idle invitation.

**Paired proof (same three-case spec, both arms).** The spec renders the HUD for idle and
for hovering-an-unstamped-element and asserts the two differ, that the absence is named,
and that the unmapped banner still wins over both. Target: collisions between idle and
empty. A: 2 of 3 cases red, the two renderings byte-identical. B: 3 of 3 green, with a
`No source for this element or any ancestor` line in a distinct colour. Floor held:
typecheck, lint and the 4-case gate suite unchanged. n=1 component, a node-environment
render of the HUD, not a driven browser.

**What the tree still does not do.** The armed state has no timeout of its own and a
successful copy does not disarm; Escape is the only exit besides the arm window. That is
two of the technique's four obligations unmet, found and not fixed here.

**Structural fact.** A chain walk that already climbs to the outermost stamped ancestor
makes the partially stamped case free: an empty chain means no ancestor was stamped at
all, so the per-resolution label and the global banner never need to share a state.

**What this realization cannot do.** It labels the absence and cannot say why: a skipped
module, a library node and a portal look identical from the document.

---
layer: technique
type: technique
subject: review-iteration-loops
technique: edit-plan-over-regeneration
status: forged
laws: [edit-do-not-regenerate, unmeasured-is-not-pass]
shared_with: []
use_when: [building the revision path of a generation pipeline, answering creator notes on reviewed work, reviewing a revision engine's output for scope creep]
---

# Edit plan over regeneration

The revision engine's deliverable is **a list of edit operations**, never a
new artifact. This is the single structural choice that makes everything
else in a review loop honest: an artifact-shaped output can silently change
anything, so nothing about it can be trusted without full re-review; an
operation-shaped output changes exactly what it names, so review effort
scales with the notes rather than with the work.

## Why a regenerated artifact is a worse deliverable even when it is better

The comparison is not "old script vs new script"; it is "old script plus its
accumulated standing vs new script with none". A regeneration voids:

- the creator's approval of every beat they did not object to — they must
  re-read from zero, and nothing tells them so;
- every gate, constraint check, and craft verification computed against the
  replaced beats — anything on screen that says "verified" is now a claim
  about a version that no longer exists;
- the attribution ledger mapping beats to the evidence they rest on, and
  every number derived from it.

And it answers the wrong question: a creator with notes asked for a
rebalance. A rewrite is unsolicited work delivered at the cost of solicited
work.

## The operation vocabulary

Keep the operation set small and closed, ordered by invasiveness:

| Operation | Changes | When preferred |
|---|---|---|
| **retime** | how long a beat holds | any weight note a duration change can satisfy |
| **rewrite** | a beat's spoken text (and its evidence declaration) | the text itself is the problem |
| **cut** | removes a beat | material must leave entirely |
| **insert** | adds a beat at a named position | no existing beat carries the material |

Every operation carries the render it targets and a **why written for the
human deciding whether to accept it** — not for a log. The why is part of
the deliverable: an edit whose justification cannot be read by the note's
author is not finished.

## Decision rules

- **Prefer the least invasive operation that answers the note.** If a note
  can be satisfied by changing one beat's duration, change one beat's
  duration. Do not take the opportunity to improve a neighbouring line — an
  improvement nobody asked for is a review nobody agreed to redo.
- **Beats not named by any operation must be byte-identical** in the applied
  result. This is testable, and worth testing: apply the plan, diff against
  the base, and fail the plan if the diff exceeds its own operations.
- **Fixed budgets stay fixed.** If the artifact's total duration is a
  constraint, edits that need more time must take it from beats they are
  *also* editing — or emit the plan anyway and declare the overrun
  explicitly. Quietly shrinking an unrelated beat to make the arithmetic
  work is an edit the creator did not ask for, hidden inside one they did.
- **Structural invariants are re-checked at every seam the plan touches.**
  A cut or a move changes what its neighbours connect to; an edit that
  leaves two adjacent beats with no causal relation has found a real
  problem, and the answer is to fix the chain or refuse the note — never to
  ship the break.
- **Re-gate after apply.** Verification is version-bound; an applied plan
  produces a new version, and every gate runs again against it before
  anything reports pass. Carrying a verdict across versions is reporting
  pass for something that was not checked.

## The plan can land as annotations in the working surface

An edit plan is usually imagined as a list handed to the reviewer; where
the work lives in a tool with a native annotation channel — markers on a
timeline, comments on a document — the stronger form is to **render the
plan as annotations in that channel**: each proposed operation a marker at
its position, carrying its why as the note. Three properties fall out:

- **Review happens where the reviewer already works**, against the
  material at the marked position, not in a side document they must map
  back by hand.
- **Approval is legible in place** — the reviewer keeps, edits, or deletes
  markers, and the surviving set *is* the approved plan.
- **Application is deterministic and separate.** A script walks the
  approved markers and performs the edits; the model proposed, the human
  disposed, and the mechanical step that touches the artifact contains no
  judgment at all. This is the refuse-before-apply ordering built into the
  workflow's shape: nothing executes until a person has seen it standing
  on the material it will change.

The pattern's boundary is the same as the plan's: markers are operations
wearing the tool's clothes, and a marker whose note cannot say what it
will do and why is not a proposal — it is a mystery with a timestamp.

## The tell, and the audit

The reliable smell of regeneration-in-disguise is **an edit list longer than
the notes that prompted it**. Before emitting, audit the plan against the
notes: every operation should trace to a note (or to chain repair forced by
one), and every beat absent from the notes should be absent from the plan.
An engine reviewing its own output should re-read exactly this line item
last, because scope creep is the failure it is most tempted toward — every
individual extra edit looks like diligence.

## When NOT to use it

Edit plans presuppose reviewed work. Before the first human review, there is
no capital to protect: regeneration of an unreviewed draft is cheap and
often right. Similarly, when the *evidence base itself* has shifted so much
that most beats are grounded in dead material, an honest engine says so and
proposes a fresh draft as a fresh draft — explicitly restarting the review
clock — rather than laundering a rewrite through fifty edit operations. The
crime is never regeneration; it is regeneration presented as revision.

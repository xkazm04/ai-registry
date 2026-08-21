---
layer: technique
type: technique
subject: bulk-adverse-action-governance
technique: preview-then-approve-the-signed-set
status: forged
laws: [no-adverse-outcome-is-solely-automated, a-verdict-is-bound-to-what-it-judged, every-decision-names-its-actor]
shared_with: []
use_when: [building a bulk reject or bulk advance action, adding a human approval step to a batch pipeline, auditing whether an approval covered the people it acted on]
---

# Preview then approve the signed set

## The concern

A bulk action has exactly one human judgment in it. The technique's job is to make that
judgment attach to *specific people* and to make the attachment mechanically checkable at
write time, so the system can refuse rather than assume when the attachment breaks.

The defect it prevents is invisible in every code review that looks at either half alone.
The preview computes a set and renders it. The commit computes a set and writes it. Both
are correct. Nothing binds them, so the system's guarantee is "the same rule ran twice",
while the guarantee the process needs — and the one an auditor will read the approval as
making — is "a person reviewed these individuals and said yes to these individuals".
A [verdict is bound to what it judged](../../../../_laws.md#a-verdict-is-bound-to-what-it-judged);
an approval is a verdict on a cohort.

## The procedure

Three phases, and the middle one is a real artifact, not a UI state.

**1. Preview.** Compute the full decision over the pool and return, for every member of
the pool, the outcome and the reason — the rejected set *and* the spared set, each
member carrying the reason code that placed it there. Compute the approval token in the
same pass, from the rejected set only, and return it alongside. Nothing is written.

**2. Approve.** A human reads the preview, optionally removes individuals, and approves.
Removal re-derives the token: the reviewer's exclusions are part of what they signed. The
approval records the approving human's identity, the token, and the moment — because
[every decision names its actor](../../../../_laws.md#every-decision-names-its-actor), and for a
wave the actor is the approver, not the process that computed the ranking.

**3. Commit.** The commit re-derives the decision from current state, recomputes the
token over the set it is about to write, and compares it against the token the approval
carries. Equal: write. Unequal: refuse, and return a fresh preview.

### What the token must be

- **Order-independent.** Sort the member identifiers before hashing, or use an
  order-free accumulation. A token that changes when the same people come back in a
  different order refuses valid commits and teaches operators to bypass it.
- **Over identity, not over presentation.** Hash the candidate identifiers and, if the
  reason is part of what was approved, the reason codes. Do not hash rendered text,
  scores, or timestamps — those move for reasons that are not drift and produce refusals
  nobody can explain.
- **Carry a canonical serialization of the governing policy**, not just the members: the
  window size, the floor, every per-family override, and the rate of anything that spares
  a subset. Then a configuration change forces a fresh preview *even when the resulting
  set is identical*, and — the part worth the extra work — a policy with no overrides
  serializes to exactly what it did before overrides existed, so adding the capability
  does not invalidate every stored approval.
- **Opaque and non-forgeable in the sense that matters.** The threat model here is
  accident, not attacker: the token exists so a code path that reaches the commit without
  a matching preview fails loudly. A plain digest is enough; what is not enough is a
  count, a set size, or a wave identifier.
- **Cheap enough to recompute unconditionally.** If checking is expensive, someone will
  add a fast path around it.

### Where the check lives

At the write boundary, inside the function that performs the state change — not in the
handler above it, not in the client. Every bulk entry point, every retry, every
administrative re-run passes through the same door. An approval check that lives one
layer up is a check the next caller will not perform.

## Decision rules

- **When the commit's set differs from the signed set in any direction, refuse.** Do not
  intersect, do not write the overlap. A partial write is an outcome no human approved,
  and it is the hardest state to explain afterwards.
- **When the difference is purely a removal in the candidate's favour, still refuse by
  default** and re-preview; only allow a narrowing commit if the narrowing is itself
  produced by a shield, a hold, or a per-row state check evaluated *inside* the commit,
  and the record says which members it dropped and why. Build the reject gate as a single
  predicate, evaluated once to produce the signed set and then *read from that set* by
  the write loop — a second evaluation of "the same" condition at write time is how the
  committed set silently diverges from the approved one.
- **When the pool grew, always re-preview.** An addition can never be covered by an
  earlier approval.
- **When the approval is older than the wave's staleness window, refuse on age alone**,
  even if the set matches. Attention decays; a token from last week is not oversight.
- **When no approval token is present, refuse** — never fall back to "compute and write".
  The absence of an approval is not permission
  ([no adverse outcome is solely automated](../../../../_laws.md#no-adverse-outcome-is-solely-automated)).

## What the preview must show

The token makes the approval binding; the preview is what makes it *informed*. A preview
that lists names and scores produces sign-off, not review. Show, per member, the reason
in the closed vocabulary the record will seal; group members by that reason so the
reviewer can act on a whole reason bucket; show the spared set beside the rejected set so
the boundary is visible from both sides; and show anything the wave declined to score at
all, by name, so it is not mistaken for an empty result.

## When not to use it

- **Never for a single-candidate action initiated by the person who reviewed it.** The
  preview *is* the record they read; a token adds a step and no guarantee.
- **Not as a substitute for the fairness gates.** The token proves the set did not move.
  It says nothing about whether those people were eligible for an automated adverse
  action, and a signed set of ineligible people is a signed error.
- **Not for reversible or favourable bulk actions** — bulk advance to a review stage,
  bulk tag, bulk message. The ceremony is priced for irreversibility; spending it
  everywhere trains operators to click through it, which is precisely what it exists to
  prevent.

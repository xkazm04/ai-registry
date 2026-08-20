---
layer: technique
type: technique
subject: readiness-passports
technique: declined-by-choice
status: forged
laws: [failure-not-empty-success, one-validation-door, derivation-names-recomputation]
shared_with: []
use_when: [a recurring assessment keeps reporting a finding the owner has already decided about, designing a dismiss or acknowledge affordance, deciding which findings may be waived]
---

# Declined by choice

A repeated assessment over an unchanged project produces the same findings
every time. That is correct behaviour and, by the third run, corrosive: the
owner has already read "no error-tracking integration", already decided this
internal batch tool does not warrant one, and has no way to record it. The
finding returns forever; the owner learns to skim the section; the section
stops working.

This technique gives the owner a way to say *decided* — and constrains it hard
enough that it stays decision memory rather than a delete button.

## The overlay, not an edit

Declines are stored **separately from the computed assessment** and applied as
a read-time overlay when the fingerprint is projected.

This is the load-bearing structural choice, and everything good follows from
it. A fresh assessment overwrites the computed result wholesale without
touching the decisions; the decisions survive an assessor upgrade, a schema
change, a re-clone. The alternative — mutating the stored finding — makes the
assessment non-reproducible, because recomputing from the same inputs no longer
yields the stored artifact, and the cheap drift check
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation))
is lost.

The overlay is keyed by a **stable finding identity**, not by rendered text.
Match on the finding's identifier plus its subject scope; never on the message
string, which changes when someone improves the wording and silently resurrects
every decline made against it.

## Re-render, never hide

A declined finding does not disappear. It moves from *gaps* to *deliberately
accepted*, keeping its original text and gaining the owner's reason and date.

The distinction matters to three different readers. To the owner, it is proof
their decision was recorded rather than swallowed. To a reviewer, an accepted
trade-off with a reason is *more* informative than an open gap — it shows
judgment was applied. To an auditor, hiding is indistinguishable from never
detecting. An artifact where dismissal erases becomes a record of what the
owner was willing to look at.

## The allow-list is the whole safety mechanism

Enumerate, explicitly, the finding paths an owner may decline. Not a category
rule, not a severity threshold — a literal enumerated set, maintained
deliberately.

The reason to prefer an allow-list over a deny-list is the default it produces
when someone adds a new kind of finding next quarter. With a deny-list, the new
finding is declinable the moment it exists, silently, because nobody thought to
forbid it. With an allow-list, it is not declinable until somebody argues that
it should be — which is exactly the conversation worth forcing.

The allow-list has one authoritative definition, and the enforcement point is
singular: every write of a decline passes through the same validator, which
rejects any path not on the list
([one-validation-door](../../../../_laws.md#one-validation-door)). Validation
scattered across the surfaces that offer a "dismiss" affordance is validation
minus the surface added next quarter.

## What is never declinable

**A caveat that says "we could not observe this" is not declinable, ever.**

This is the rule most likely to be discovered rather than designed, usually
after someone dismisses an "evidence limited: no credential available for the
deployment host" caveat and the project's report goes clean while nothing about
the project changed. An owner is entitled to accept a *gap they can see*. An
owner is not entitled to dismiss a *blind spot*, because doing so converts
missing evidence into a clean verdict — the one transformation an assessment
artifact must never perform
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

The reason the temptation is strong is that the two look identical on screen:
both are entries in a caveats list, both are things the owner cannot or will
not fix, both are noise on the fourth reading. They differ in what dismissing
them means. Dismissing a gap says "we accept this risk." Dismissing a blind
spot says "stop telling me that you don't know." The second sentence is the
assessment lying on request.

Practically: keep every evidence-limitation caveat off the allow-list by
construction, and if the noise from a recurring blind spot is genuinely
unbearable, fix the instrument — supply the credential, narrow the scope, or
mark the check as not-applicable at the *assessment* level so it is never run
and never claimed. Not-applicable at the instrument level is honest; dismissed
at the report level is not.

Two other classes stay off the list in most designs: anything the organisation
mandates centrally (an owner cannot locally waive a fleet-wide requirement),
and anything whose absence is unsafe rather than merely imperfect.

## Provenance and expiry of a decline

A decline is a claim, and it carries its own stamp: **who** decided, **when**,
and **why** — free text, required, and rejected if empty. The reason field is
not bureaucracy; it is the only part that will still be useful when the person
has moved on and someone asks why this project alone is exempt.

Two lifecycle rules keep the memory from becoming folklore:

- **Re-surface on material change.** If the underlying finding changes in kind
  or severity — the same identity, but now a different fact — the decline is
  marked as needing re-confirmation and the item returns to the gaps list with
  its history attached. The decision was made about the old fact.
- **Age out, visibly.** Beyond a chosen horizon a decline is rendered as aged,
  or requires re-affirmation. A project inherited by a new team should not be
  silently governed by an absent predecessor's judgment. Aging is a display
  state first and an expiry second; deleting an old decline destroys the memory
  the whole mechanism exists to hold.

## Effect on the axes, and on the portfolio

A decline **does not raise a rung**. Choosing not to close a gap is a decision,
not a capability, and if declining moved the number, cross-project comparison
would degrade into a measure of how willing each owner is to file paperwork.
(The rung-side statement of this rule belongs to the maturity-ladder
discipline; what is owned here is the overlay's behaviour.)

At the portfolio level, declines are counted and shown *beside* the rollups
rather than subtracted from them. "31 of 40 blocked on this; 4 of those have
accepted it deliberately" is the useful sentence. If declines silently removed
projects from a blocker count, the count would drift downward for reasons that
have nothing to do with the blocker, and the one thing the rollup exists to do —
size the shared problem — would be corrupted.

## When not to use this

- **A one-shot assessment.** Decision memory pays off only across repeated
  runs; a single audit does not need an overlay, it needs a response document.
- **A compliance gate with an external authority.** If the point of the gate is
  that the subject cannot waive it, offering a decline affordance at all is a
  design error, however carefully constrained.
- **Before findings have stable identities.** Without a durable key the overlay
  will mis-attach after the first wording change, which is worse than no
  overlay: the owner's decision now sits on a different finding.

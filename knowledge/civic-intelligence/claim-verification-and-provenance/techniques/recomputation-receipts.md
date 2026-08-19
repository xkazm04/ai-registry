---
layer: technique
type: technique
subject: claim-verification-and-provenance
technique: recomputation-receipts
status: forged
laws: [provenance-or-nothing, disclose-never-repair, deterministic-code-owns-numbers]
shared_with: []
use_when: [building the page behind a permanent citation, deciding what a provenance surface must show, rendering stored values and review states for readers]
---

# Recomputation receipts

The receipt is what a claim address resolves to: one page that restates the
claim, shows the data behind it, names its derivation, reports its human-review
standing, and links the reader to primary registries where the underlying
entities can be checked without trusting the publisher. Its defining property
is in the name: **a receipt is an addressed computation, not a stored
document.** It is derived fresh, on request, from the same store and the same
shared code paths that produced the published figure.

## Why recomputation, not storage

Storing rendered receipts creates a second corpus of assertions that must be
kept consistent with the store — and will not be. A stored receipt keeps
vouching after the underlying edge is rejected by a reviewer, after a
recompute changes the weight, after the entity's registry identifier is
corrected. Recomputing on request means the receipt can only ever say what
the store says *now* — which is the only statement a provenance surface is
entitled to make. If today's answer differs from what the citer saw, that is
the verification gate's job to surface as *moved*; the receipt's job is to be
the honest current side of that comparison.

Recomputation also enforces
[deterministic-code-owns-numbers](../../_laws.md#deterministic-code-owns-numbers)
structurally: the receipt derivation is a pure function from store rows to a
serializable view model, testable over fixture rows, with zero logic in the
rendering layer. If the receipt needs a number the shared arithmetic does not
export, the fix is to export it — never to compute a private variant on the
receipt, which would make the proof surface itself a fork of the truth.

## The receipt discloses; it never repairs

Every field on a receipt is a literal transcription of stored state, per
[disclose-never-repair](../../_laws.md#disclose-never-repair):

- **Values render exactly as stored.** The display formatter that rounds for
  readability elsewhere is banned here: a receipt is a document, and rounding
  a documented weight changes the documented fact. Use a deterministic
  serialization of the stored value (locale-adapted separators at most), byte-
  identical between server and client render.
- **Provenance fields are transcribed, not defaulted.** Pass number, method,
  derivation reference, computation time — each is either the stored value or
  an explicit "not recorded". Backfilling a plausible method is invention.
- **Missing endpoints get literal identifiers.** A node the store no longer
  carries renders as its id with an honest placeholder kind — never a guessed
  name, never a link to a detail page that would land on nothing.
- **Unknown vocabulary prints verbatim.** A relation or state token the
  product's dictionary cannot translate is shown as the literal machine token,
  labelled as untranslated — the reader learns the record carries a mark the
  product cannot yet read, which is strictly more honest than hiding the row.

## Review standing on the receipt

The receipt reports where the claim stands with human review, and the
defaults are asymmetric on purpose:

- A relation that passes through a human gate but has **no recorded decision**
  reads *awaiting review*. Anything other than the literal terminal states
  (approved, rejected) collapses to the pending reading — a gated claim never
  becomes "verified" by silence or by a typo in the state field.
- A **deterministically derived** relation has no review queue, and the
  receipt says so explicitly ("no human review applies — deterministic
  derivation") instead of rendering an empty review section that implies a
  reviewer who is not coming.
- When an audit trail exists, the receipt carries it: who decided, when, what
  the prior state was. The trail is the reader's evidence that the gate is
  operated, not decorative.

This is [provenance-or-nothing](../../_laws.md#provenance-or-nothing) in page
form: the claim, its formula reference, its gate state, and its primary
sources on one surface — with primary registries linked only from *stored*
identifiers, never from guessed ones.

## Decision rules

- When a consumer needs the receipt's content in another shape (a share
  capsule, a machine-readable block), derive it from the same view model —
  never from a parallel read of the store.
- When the store is partially damaged (edge present, endpoint missing), the
  receipt still renders: the edge is the claim and cannot be substituted, but
  endpoints degrade to literal ids. A receipt that refuses to render because
  one label is missing abandons the citing reader over a cosmetic gap.
- When in doubt whether a field belongs on the receipt, ask whether it helps
  the reader *replicate the check*. The fact-checking field's own published
  standard is the right bar: enough sourcing detail that a reader can redo
  the work, and a public methodology so they can dispute the method instead
  of the data.

## When not to use it

Do not build receipt pages for figures you are unwilling to recompute on
demand — a receipt backed by a nightly cache is a stored document with extra
steps, and its tense is a lie. Either make the derivation cheap enough to run
per request, or date the receipt loudly ("as recomputed on D") so the reader
knows which present it speaks from.

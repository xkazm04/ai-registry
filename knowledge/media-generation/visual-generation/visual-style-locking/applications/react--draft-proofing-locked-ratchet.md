---
layer: application
type: application
subject: visual-style-locking
technique: draft-proofing-locked-ratchet
stack: react
status: forged
verified_on: 2026-08-19
---

# React: the theme record as a one-way ratchet

The gravitone-gcloud studio (a Next.js/React video studio, IndexedDB-backed)
implements the full lifecycle in one module, `lib/themes.ts`, and its
comments narrate the incidents that shaped it.

## The record and the ratchet

The file header states the doctrine directly (`lib/themes.ts:10-18`):

```
//    draft ──generate proofs──> proofing ──approve them all──> locked
//
// `locked` is the state a project may be created against. That gate is the
// point of the whole surface: the research this product is built on found that
// style consistency comes from an APPROVED ARTIFACT, not from a prompt suffix,
// and that skipping the approval step is the single reliable way to get forty
// frames that do not match.
```

The `Theme` record holds the four-slot `StyleBlock` (technique · subject ·
role-assigned 3-color palette · finish, `themes.ts:36-42`), the element
vocabulary, and the `proofs` array. Status is **derived, never stored**
(`statusOf`, `themes.ts:135-138`): `lockedAt` set → locked; proofs exist →
proofing; else draft. The comment gives the reason — a stored status "drifts
the moment a proof is approved somewhere that forgot to update it."

The lock gate (`canLock`, `themes.ts:163-166`) is exactly the technique's
rule: at least one approved proof and no proof still `pending` — "a rejected
proof is a decision, a pending one is not." `lockBlocker`
(`themes.ts:176-183`) renders the refusal in the user's words. Nothing ever
clears `lockedAt`; evolution is duplicate-into-new-draft, and the resolver
comment leans on the ratchet to *delete a whole case*: "a theme that exists
but is no longer locked is not a case here … there is no way to reach it and
nothing to draw" (`themes.ts:217-219`).

## One resolution point, honest misses

`projectStyle()` (`themes.ts:221-225`) is "THE one place a project's visual
identity is resolved," and its comment preserves the shipped defect it
replaced: the frames step used to resolve style as
`themes.find(t => statusOf(t) === "locked")` — the account's most recently
touched lock — so "on an account with two locked styles that was wrong for
at least one project, always" (`themes.ts:206-211`). The replacement returns
a discriminated union (`{theme, miss: null} | {theme: null, miss: "unset" |
"deleted"}`) so a caller *cannot* read a name off a miss, and
`STYLE_MISS_WORD` supplies the user-facing sentence each fallback must show.
No stand-in theme is ever substituted by the resolver itself.

## The proofing loop that feeds the gate

`app/library/Playground.tsx:1-15` is the only route to a locked style: "a
style block is words until something renders it," and the panel's subject is
an editable input so the user can generate twice with the same block and a
different subject — "then seeing whether the two look like one publication."
The presets that seed drafts (`app/library/presets.ts:1-38`) encode the
attribute-grammar finding: each is "a complete four-slot style block … not a
mood word," every palette assigns ground/objects/accent roles, and all six
preset thumbnails render one `CANON_SUBJECT` "so the user is comparing the
only thing they are actually choosing."

## Cost honesty at the gate

`sheetSpend` (`themes.ts:150-155`) totals per-proof `costUsd` and counts
`unpriced` proofs separately — "counted rather than assumed free … anything
asking a user to throw this away has to say so honestly." And `putTheme`
throws on write failure (`themes.ts:257-263`) because the sheet is base64
images in IndexedDB and "silently losing an approved sheet would be the
worst bug this surface could have."

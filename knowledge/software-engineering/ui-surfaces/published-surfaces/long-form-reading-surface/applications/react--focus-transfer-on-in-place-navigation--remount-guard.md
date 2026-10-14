---
layer: application
type: application
subject: long-form-reading-surface
technique: focus-transfer-on-in-place-navigation
stack: react
status: forged
verified_on: 2026-10-14
verified_against: react@19
applied: code
ab_verdict: better
---

# A focus handoff whose guard could never pass

The `personas-web` guide already carried the technique in comment form: on a
client-side topic change an effect focused the topic `<h1>` (`tabIndex={-1}`),
with "skip the initial mount" implemented as a `didMountRef` boolean. It had
shipped for months and no check had ever observed the destination.

## What the seam showed

A and B were run through one Playwright test written to the technique's
both-directions rule: after a cold load, the active element is not the heading
and scroll is untouched; after clicking the Next link, the heading is the active
element.

- **A (shipped code): the second half failed.** After the click the document
  had no focused element. Next remounts the topic view when the dynamic
  segment changes, so a ref inside it restarts at `false` on every navigation:
  the "first mount" branch is what every arrival took, and the handoff never
  fired. Every markup-level check (the attribute was present, the effect
  existed) passed on a surface whose effect was dead.
- **B: guard keyed on identity held outside the component.** The last landed
  topic id lives at module scope, `null` until the first landing. Cold load
  records it and does not move focus; a Strict-Mode double effect sees the same
  id and does not move focus; a real topic change does. The same test passed.

Two smaller departures from the technique were fixed in the same change: the
heading carried `outline-none` (suppressing the indicator the technique says to
restyle instead) and no scroll margin (sibling in-body headings already used
`scroll-mt-24` under the fixed navbar).

## What this adds to the technique

"Key the guard on document identity" is not satisfied by identity held in
component state or a ref when the framework remounts the component per
document: the identity is erased exactly when it is needed. Where the surface is
remounted per article, the identity has to outlive the component. The seam was
chosen to falsify: a green attribute check and a present effect were the
evidence the shipped code had, and the destination assertion is what refuted it.

Floor: the rest of the guide e2e file held (19 of 21 in a full run; one is a
pre-existing JSON-LD count failure on the untouched tree, one a timeout flake
that passed alone on both arms).

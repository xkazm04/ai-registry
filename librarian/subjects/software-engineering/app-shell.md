---
domain: software-engineering
subject: app-shell
last_touched: 2026-08-30
touched_by: deepen
dry_streak: 0
---

# app-shell

First touch: [[2026-08-30-1]], scoped `/deepen` under the librarian sweep, then a
follow-up round once the Director unblocked the `spec` stack. Ranked #8 (37 points) on
the corrected worklist; it had read 61 under the double-counted demand. Applications
2 → 8, technique coverage 2/6 → 5/6 (`entitlement-gating` still has none).

## The transplant defect, which is why single-stack is a scored clause

**"The shell never unmounts" was one implementation, not the property.** The real
property is *frame continuity*, and never unmounting is one way to buy it. Where each
navigation replaces the document, the frame unmounts every time and the platform
supplies continuity instead.

Most of the standard survives that — the nav is still one owned vocabulary, badges still
need clearing rules, depth is still earned. **The hosting privilege does not**: with no
surviving mount point, session-lifetime machinery has to live outside the frame
entirely. The golden path now says to establish which architecture you are in before
inheriting the hosting rules, because they were conditional on the first property being
literally true and never said so.

This is exactly the defect the single-stack clause exists to catch: upper layers
encoding a stack-specific assumption as a universal. It took a second stack to surface
it, and no amount of re-reading would have.

## Two rounds, two kinds of second origin

**Round 1 — a second framework (`next`).** Five applications against a real tree at
`next@16`. The worker was straight that this is a second stack by the bundle's declared
list but **not a second paradigm** — still a JS component tree. It still produced three
corrections, which is the evidence the upper layers were framework-shaped in places.

**Round 2 — a second *origin* (`spec`).** Two public standards, which found what a
second framework could not. Recorded below.

## Six corrections

- A name reveal is only a reveal if it fires on **keyboard focus**, holds while the
  pointer travels onto it, persists, and dismisses without moving pointer or focus. The
  platform's built-in hover text satisfies none and never fires for keyboard users — it
  delivers a name and no reveal, and both are owed.
- Posture that reacts to navigation derives from **the location value changing**, not
  from per-entry handlers; wired per door it covers one door and misses the badge, the
  palette and the chord.
- **A count is data and a badge is a disclosure** — the viewer gate belongs on the row,
  not only at the source, and suppression is total including the reserved gutter.
- For an address arriving into an **established** session, doing nothing beats falling
  back: bouncing destroys a real location to service an unreal one. Pick per arrival
  class.
- The enumerable host must sit **above the swap point**; a host re-keyed per location is
  a silent teardown instruction, not a permanent frame.
- The placeholder rule was too prescriptive: the section's shape **or nothing at all**. A
  generic silhouette matching no section is a second wrong outline in front of the right
  one. The consuming tree had shipped the old prescription, measured the two-skeleton
  flicker, and deleted it with the reasoning in the file.

## What the standards found (round 2)

**Two real gaps in our upper layers:**

- **SC 2.4.5 Multiple Ways (AA) requires a second route to a destination, and
  nav-hierarchy never says so.** The depth budget was written as space economics and
  never paid its findability debt: past two levels a nav-only product is non-conforming
  at AA unless a search or site map exists. The command surface `shell-hosted-services`
  treats as a convenience is, at depth, a conformance requirement. The most actionable
  finding of the round.
- **SC 1.4.10 Reflow (AA) inverts our framing of the width floor.** We call automatic
  collapse below a floor "legitimate"; at 320 CSS pixels it is not a concession the
  product may make, it is one it must.
- Still unnamed by the technique: **SC 2.5.3 is vacuous while an entry is icon-only and
  becomes binding the moment the posture expands**, so a rail whose collapsed tooltip and
  expanded label come from different sources conforms in one posture and fails in the
  other — invisibly to any single-posture test.

**Where we are stricter, argued rather than asserted:** prohibition 1 beats SC 3.2.3 on
three axes — the criterion governs *order*, not presence; its "user-initiated" exception
would permit a collapse toggle to reorder the rail, which we forbid because *a map whose
order changes with its zoom is two maps*; and its "set of web pages" scope arguably
excludes a shell that never replaces the document, while ours binds regardless. Our
reduced-motion clause sits at baseline where the standards put it at AAA, and asks for
more (endpoints correct with motion off, not merely disableable). ARIA's one-active rule
is a SHOULD; `navigation-model` makes it a structural invariant enforced by derivation.

**The restraint is why the document is trustworthy.** Two of the six prohibitions have no
counterpart in either standard, and rather than manufacturing one it records that they
stand on this corpus's own evidence and *must not be dressed up as accessibility
claims*. It separates the skip link (a chosen mechanism) from SC 2.4.1's required
outcome, and flags that "navigation moves focus" is **craft, not conformance**.

## Declines

- **No new technique in either round.** Both converged findings were correction-sized,
  and with two applications on the books an application was worth more. Recorded so the
  next run does not read this as unexamined.
- **No `verified_against` on the spec application**, deliberately, and the file says why:
  a Recommendation date is not a runtime version, and forcing it into `<stack>@<major>`
  would produce a currency check that means nothing. `refresh_by` at a six-month
  standards window instead.
- Dry probes: the placeholder delay (published guidance brackets our hedged range), the
  third shell level (the apparent counterexample is selection state, already excluded by
  the technique's own test), and **a search for a non-JS shell tree anywhere in the local
  fleet — there is none**. That last one is why `spec` was the right second origin here.

## Open leads

- `entitlement-gating` is the one technique still with no application.
- **Cross-subject:** a modal/overlay subject owns "mounting on open is what fits a
  mount-lifecycle hook to a persistent element".
- **Cross-subject, possibly law-adjacent:** the deliberate *omission* from a redirect
  table — renamed ids map forward, **removed** ids fall through, because pointing a
  removed feature at a neighbour reads as a bug. Generalizes past navigation to any
  identity-migration table; may sit under `identity-survives-reuse`.
- One unplanned convergence worth keeping: SC 2.4.5's exception carves out "a step in a
  process" using the same word our sub-nav admission test uses to reject a setup
  destination — two documents written for unrelated reasons drawing the same place/step
  line.

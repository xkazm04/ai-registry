---
layer: application
type: application
subject: narrative-scroll-surface
technique: sequence-as-spine
stack: react
status: forged
verified_on: 2026-09-08
verified_against: react@19
---

# Sequence as spine — a self-hosted recruiting studio's `/about` page

How `kp`'s public concept page (`app/landing/spark/AboutCurve.tsx`, at
`3394deb2`) realizes [sequence-as-spine](../techniques/sequence-as-spine.md):
eight pipeline phases hung off one scroll-drawn serpentine curve. The page's
own header comment states the shape in a sentence — "a scroll-drawn curved
timeline of the pipeline phases the app actually walks … the spine draws with
scroll and each step grows to full size at centre, then shrinks as it passes"
(`AboutCurve.tsx:20-26`).

## The station list is one declared vocabulary

`about-art/shared.ts:31-42` holds the whole sequence as a literal array with a
derived union type, under a heading that says exactly what the technique
asks — "THE PHASE LIST IS DATA, AND THIS IS WHERE IT LIVES" (`:13`). Four
consumers derive from it and none maintains a copy (`shared.ts:15-20`): the
step rows, the spine path, an exhaustive art dispatch, and a locale-parity
test.

The sequence test — *does reordering change the meaning* — is answered in
prose at `shared.ts:24-29`, for the phase inserted most recently: assignment
"sits after `screen` because that is where the case goes out … and before
`interview` because the interview is grounded in what the submission showed."
That is a real order, and the same comment records why the omission mattered:
the page "claims to walk 'the whole pipeline'" and "stepped straight from
Screen to Interview, so the one phase a visitor came to understand was the one
phase the timeline did not draw" (`:22-27`).

## The spine is derived, and the comment explains what a hand-plotted one cost

`AboutCurve.tsx:59-74` computes the path: each phase's node sits at the centre
of its own `1/N` slice of a fixed viewBox, the curve crosses centre there, and
the control column alternates `116/24` so the line weaves right, left, right.

The comment above it (`:46-58`) is the technique's hand-plotting rule stated
as an incident:

> It used to be nine literal cubic segments matching seven node rows. That is
> the kind of constant nobody re-derives: adding the assignment phase would
> have left an eighth node row hanging off the end of a seven-row spine, and
> the defect would have been invisible in a diff and visible only on the page.

It also records the migration discipline the standard implies but does not
state: "For N=7 this reproduces the previous path to within a unit" — the
derivation was proven equivalent to the hand-plotted path before the eighth
station was added.

Alternation is derived too, from position and not authored: `artLeft = index %
2 === 0` (`AboutCurve.tsx:96`), spent on the column order (`:113`, `:127`), and
the two-column grid itself is `md:`-only (`:105`), so at phone width there are
no sides and every station reads in one order.

## Per-station attributes are a total map, not a parallel list

`AboutCurve.tsx:34-43` holds the phase colours in a `Record<AboutStepKey,
string>` with the reason inline (`:30-33`): "A `Record` rather than a parallel
list, so a phase added to the vocabulary is a type error here until it is
given a colour instead of silently drawing in whatever the array's shorter half
held." `about-art/index.tsx:28-36` does the same for the art components.

## The station triad

Each row renders the three parts in order: eyebrow in the hand face
(`AboutCurve.tsx:128-130`), one display-type claim (`:131`), and the
illustration as evidence (`:111-116`). The claims are single sentences —
"Describe the role. Get the rubric.", "A work sample that assumes AI" — and
the supporting detail sits in a body paragraph beneath rather than becoming a
second claim.

## Numbering: derived where it counts, authored where it is read

This is the page's most interesting reconciliation, because it does the hard
half of the rule and takes the exception on the easy half.

**Derived, correctly.** The dot renders `String(n).padStart(2, "0")` where `n`
is `i + 1` from the page's own map (`AboutCurve.tsx:123`, `:232`). Anchor ids
come from `aboutStepId(index)` (`about-art/shared.ts:50-52`) — "stable,
page-order-based, and the SAME string the section rail, the phone menu and a
shared `/about#step-07` link all use" (`:45-49`).

**Nothing reads a number back out.** `aboutStepRailLabel`
(`shared.ts:66-70`) builds "01 Design" from the eyebrow's *words* and the
*page order*: "The number is taken from the page order rather than parsed out
of the string, so a locale that mistypes it in the eyebrow … still gets a
correctly numbered rail" (`:61-63`). It also carries the fallback the
technique asks of any derivation over authored copy — "A locale that drops the
separator falls back to the whole eyebrow rather than to an empty label"
(`:63-64`), implemented at `:67`.

**The exception, with both of its conditions met.** The eyebrow copy does
carry the numeral: `messages/en.json` `aboutPage.steps.design.eyebrow` is
`"Step 01 · Design"`, in four catalogs. `MarketingClaims.test.ts:260-271`
asserts the authored numeral equals the derived position in every locale —
"Inserting a phase renumbers every step after it, in four catalogs — exactly
the edit that gets half-done. The dot beside each row already renders `index +
1`, so a stale eyebrow puts two different numbers on one row" — and
`:287-294` pins the separator the derivation depends on, because dropping it
in one locale is what silently degrades the rail's labels. Both conditions the
technique requires are present, and the check is per locale rather than per
page.

## Where the repo falls short

**The station's number disappears below the medium breakpoint.** The numbered
dot lives in a column that is `hidden … md:block` (`AboutCurve.tsx:118`), so a
phone reader sees no numeral on the station itself. It survives in the
eyebrow's copy and in the phone menu's entries (`:156-161`), so the sequence
is not lost — but the number is part of the content, and on the narrowest
viewport it is carried only by the string the technique would rather the copy
did not hold.

**The spine itself is `md:`-only** (`AboutCurve.tsx:222`). This is the
technique's own advice — a spine with no room to have sides should disappear
rather than be squeezed — but the page then has no substitute cue that the
eight stations are one sequence, beyond their numbering, at exactly the width
where the reader can see the least of the page at once.

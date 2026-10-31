---
layer: application
type: application
subject: cv-content-construction
technique: relevance-ordering-and-recency-compression
stack: process
status: forged
verified_on: 2026-10-31
applied: code
ab_verdict: better
---

# The designed CV: the recency budget read a line's position as its age

Pinned at `kp@09b4fc018` and changed at `kp@e2a1b2e0b`. The job-seeker module's CV
builder already carries the bullet budget this technique sets out, so the seam was chosen
to falsify the claim that the tree holds the whole technique. A CAUGHT outcome would be a
rule of the technique that the designed sheet does not carry. The read found one.

Anchors are root-relative to that tree.

## What conforms

- **The budget falls with age and never reaches zero for a dated role.**
  app/features/jobseeker/cv/cvContent.ts:176 "export const BULLET_BUDGET = { current: 6, recent: 4, older: 2, offTarget: 2 }"
  is the technique's table. Past the fifteen-year horizon a role prints as one line,
  app/features/jobseeker/cv/cvContent.ts:194 "if (age !== null && age > HORIZON_YEARS) return 0;",
  and still keeps its title, employer and dates.
- **Over-budget roles lose their weakest bullets.** Bullets are ranked by outcome before
  the cut, at app/features/jobseeker/cv/cvDocument.ts:626 "const ranked = rankByOutcome(".
  What the budget holds back is kept as `trimmed`, and the designer lists those lines so
  the owner can bring them back.

## What the sheet did not do

The technique's firmest ordering rule is that a dated section runs newest first. The
builder kept the order the roles arrived in, and the budget read position as recency:
app/features/jobseeker/cv/cvContent.ts:191 "export function roleBudget(index: number, dates: string | null, today: Date)"
gives the current role's budget to `index` 0. A CV written oldest first, the traditional
Lebenslauf order, therefore printed its oldest role at the top with the current role's
budget, and printed the current role last. Neither half was visible from the budget table
alone. The table was correct; the input it was handed was not in time order.

## What changed

When every role carries a date, roles are sorted by end year before the budget is
applied. Equal end years go by the later start, then by the CV's own order:
app/features/jobseeker/cv/cvDocument.ts:640 "if (ends.every((y) => y !== null)) order.sort(".
The budget then reads the new position,
app/features/jobseeker/cv/cvDocument.ts:643 "const budget = roleBudget(index, r.dates, today);".
A history with an undated role keeps the CV's order, because the undated role has no date
to place it by. The feature document states the rule in the same change, at
docs/features/jobseeker/README.md:641 "Roles print newest first".

## A/B

The target is the printed order and the bullet count per role. Three dated roles, five
bullets each, listed oldest first, with today set to 2026-10-31.

| Role | A (as read) | B (newest first) |
| --- | --- | --- |
| 2009-2012 | printed first, 5 bullets | printed third, 2 bullets |
| 2013-2019 | printed second, 4 bullets | printed second, 4 bullets |
| 2020-present | printed third, 5 bullets | printed first, 5 bullets |

- **Floor**: all 162 job-seeker tests pass, `tsc --noEmit` is clean, and the project's
  pre-push gate passed on push. A CV already newest first, and a history with one
  undated role, keep their order. The new test fails on A.
- **Not measured**: how many real uploaded CVs arrive oldest first. The profile's role
  list comes from an extraction step, which may already re-order some of them. The
  return condition is a replay of stored profiles, counting histories whose end years
  rise.

## What this realization cannot do

It cannot order a history with even one undated role, or a role whose dates were never
read. Those keep the CV's order, so an oldest-first CV with one undated line still
prints oldest first. It also orders by the dates as read. A misread year moves a role,
and nothing on the sheet says it moved.

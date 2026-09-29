---
domain: software-engineering
subject: analytics-time-windows
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
---

# analytics-time-windows

Mirrored 2026-08-20 with the software-engineering bundle: 6 techniques and 4
applications (node x2, react, sql), all from ascent. Never swept by the librarian
before the dispatch that ranked it.

First deepen: run dp-atw-0929 (2026-09-29), a Curator dispatch on "never swept
by the librarian". 1 application added (node, ascent), 0 new techniques, 1
correction, 1 condition, 1 addition.

## State after dp-atw-0929

- Rung: L2/L3. The technique claims were checked against primary text and a
  measurement; ascent was read at `b3335c35` and one simulation ran on the
  verbatim functions.
- Techniques with no next application: baseline-as-window-start,
  canonical-zone-single-source, half-open-interval-policy (its new direction
  clause has no fleet seam yet).
- Citations in `node--calendar-arithmetic.md` and the other 08-20 applications
  have drifted: every ascent line reference I sampled (org-watch.ts:11, credits.ts,
  window.ts, org-signals.ts, org-insights.ts) now points at other code. They were not
  re-resolved in this run, so their `verified_on` was not moved. Owed: a
  citation re-resolution pass on those four files.

## Counter-evidence, claim by claim

- **"Advance the k-th boundary k times": CORRECTED.** Step 3 of calendar-arithmetic
  said "start advanced k times", which reads as stepping and contradicts step 4
  in the same list. Measured (dateutil 2.9.0, 2026-01-31): four single steps give
  Feb 28, Mar 28, Apr 28, May 28; anchor + k months gives Feb 28, Mar 31, Apr 30,
  May 31. The technique now says the edge comes from the anchor, and that a
  persisted clamped slot has thrown the intended day away.
- **"31 January + 1 month is a February date": CONDITIONED.** True of calendar
  libraries and of Temporal (`add({months:1})` on 2019-01-31 gives 2019-02-28,
  constrain being the default). False of the language built-in most code reaches
  for first: Node 24 `setUTCMonth(1)` on 2026-01-31 gives 2026-03-03, the exact
  defect the sentence names. Added to step 1.
- **"The boundary belongs to the later window, never re-litigate": CONDITIONED.**
  True for stamps that mean when it happened. Prometheus 3.0 moved lookback and
  range selectors from left-closed, right-closed to left-open, right-closed,
  "which makes their behavior more consistent" (migration guide); a 5-minute
  range could return 5 or 6 samples depending on scrape alignment before. The
  invariant is tiling under one declared direction. Added to half-open-interval-policy
  and to the golden path.
- **"Snap to the first instant of the day": ADDED a caveat.** The wording was
  already right and nothing explained why. Temporal `startOfDay()` documents that
  the local day starts at 01:00 where DST skips midnight. Step 2 now says so and
  the smells list `setHours(0,0,0,0)`.
- **Checked and left untouched:**
  - 12.17 renewals a year (365/30) and the 1.4% overspend;
  - the Unix epoch is a Thursday;
  - half-open tiling, the double-count under closed-closed, open-open dropping the boundary;
  - the cohort-matched delta, baseline-as-window-start and range precedence were
    not attacked in this pass.

## Found in the tree

ascent settles a monthly repo by stepping from the stored intended slot and
writing the result back (`org-watch.ts:77-88`, `:199`, `:235`). Clamped once to
28 Feb, it never returns to the 31st. Simulation over the verbatim functions,
12 settles: 11 land off the anchored day. The test titled "monthly its
day-of-month across repeated late settles" (`org-watch.test.ts:716`) makes one
call. Recorded in `node--calendar-arithmetic--persisted-monthly-slot.md`.

## Impact

No stale verdicts. The registry map joins the subject to kp (5 contexts),
systedo-case (3), personas (2) and ascent (1, "Trends & Comparison"); every one
of those pairs is unjudged, so none carries a verdict that moved. Maps were not
rebuilt: a rebuild would only re-stamp digests on unjudged pairs.

## Owed to projects

- **ascent:** the persisted slot needs the intended day-of-month (a schema
  change) or the original anchor, and the test needs a chain of settles from the
  31st. Not applied: it is a migration. Return: when ascent next touches
  `scanSlotAt`.
- Direction clause in half-open-interval-policy: unapplied. Return: when a
  project grows a window over cumulative counters or scrape stamps.

## Source classes

- A tool's own migration guide gave the direction change and its stated reason
  in two lines; the docs did not give the rationale in the design pages.
- Running the technique's own example on three runtimes beat reading about it.
  Two of the three (dateutil, Temporal-by-doc) agreed with the text, and the
  runtime most code uses did not.
- One fetch (Kafka Streams window docs) returned nothing usable, so the claim
  that sliding windows are closed on both ends is not landed.

---
domain: software-engineering
subject: analytics-time-windows
last_touched: 2026-10-31
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

## Architecture review - 2026-10-31

First architecture review, against `19d8436ae`. All 12 documents read in full.
The technique layer holds: the three runtime claims in calendar-arithmetic were
re-run (built-in month overflow, `dateutil` stepping versus anchoring) and the
two documentation claims (the time-series engine's 3.0 interval change, Temporal
`startOfDay`) were re-read at their primary pages. Three clarify items are
internal: the golden path calls a constant 1.4% excess "compounding"; the node
calendar application hands the anchor rule to the scheduling subject while its
sibling application in this folder records that rule failing; and the react
application still speaks of "everything above" and "the earlier sections" of a
document it was split out of on 2026-08-29. Every application's citations sit in
a tree that has moved since; none was re-resolved and no verification date was
refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/analytics-time-windows",
  "date": "2026-10-31",
  "baseline": "19d8436ae",
  "digest": "sha256-b2:9b81f64365c4edae",
  "disposition": "clarify",
  "coverage": "All 12 current documents read in full (golden path, 6 techniques, 5 applications). Trigger: never architecture-reviewed (pending). Intended benefit: one shared window vocabulary so that two surfaces read side by side cannot contradict each other. Failure if ignored: convergent re-derivation, where period summaries, alerts, allowances and trends each disagree by a boundary observation, a zone offset or a clamped day. Boundary: the vocabulary of windows (interval direction, zone, calendar units, baseline, range precedence, cohort matching); bucketing strategy belongs to metrics-rollups and cadence/lease mechanics to scheduling. Two primary documentation pages were re-read and two runtime claims were re-executed locally (Node 22 built-in Date, Python dateutil 2.9.0). One application tree (personas, the react application) was opened at current HEAD for a drift sample only. Not evaluated: the ascent tree behind four applications, which is not available here; Kafka Streams window semantics (left unlanded by the prior deepen).",
  "counterexamples": [
    "A cumulative counter or scrape stamped at the window end summarizes the interval before it, so `[start, end)` misfiles it; `(start, end]` is the correct half-open form there and tiles equally well.",
    "A technical horizon (retention, staleness, a retry budget) needs no calendar semantics: a fixed 90-day duration is correct and simpler, because no human reads the boundary as a date.",
    "A volume metric (requests served, revenue booked) has no value at an instant, so the point baseline at the window start is unavailable and a matched prior window is the only comparison.",
    "A genuinely fixed population has no composition effect, so cohort matching adds identity work and changes nothing.",
    "A single-source report that always covers last month needs no precedence resolver; a chain with one link is ceremony."
  ],
  "sources": [
    {
      "url": "https://prometheus.io/docs/prometheus/latest/migration/",
      "result": "Re-read. 'Lookback and range selectors are now left-open and right-closed (previously left-closed and right-closed), which makes their behavior more consistent.' 'Before Prometheus v3, a range query with `5m` would usually return 5 samples. But if the query evaluation aligns perfectly with a scrape, it would return 6 samples.' Supports the direction clause in half-open-interval-policy and the golden path as written."
    },
    {
      "url": "https://tc39.es/proposal-temporal/docs/zoneddatetime.html",
      "result": "Re-read. startOfDay: 'The local time of the result is almost always `00:00`, but in rare cases it could be a later time e.g. if DST skips midnight in a time zone', with the example 2018-11-04 America/Sao_Paulo returning 01:00. Supports calendar-arithmetic step 2."
    },
    {
      "source": "Local execution, Node v22 built-in Date",
      "result": "`setUTCMonth(1)` on 2026-01-31T00:00Z gives 2026-03-03T00:00Z, matching the Node 24 figure in calendar-arithmetic step 1 (the overflow behaviour is the language's, not the release's)."
    },
    {
      "source": "Local execution, Python dateutil 2.9.0",
      "result": "From 2026-01-31, four single relativedelta(months=1) steps give 02-28, 03-28, 04-28, 05-28; anchor + k months gives 02-28, 03-31, 04-30, 05-31. Matches calendar-arithmetic step 3 exactly."
    },
    {
      "source": "Arithmetic",
      "result": "365 / 30 = 12.17 periods a year; 12.17 / 12 = 1.0139, so a 1.4% excess. The excess is a constant rate per year, so it accumulates linearly; it does not compound."
    },
    {
      "source": "personas tree at 22260d77c9 (drift sample for applications/react--calendar-arithmetic.md, cited at c2a3c5fa1)",
      "result": "The four-state kind (:24), its doc (:15-23), the deletion note (:82-91), the history comment (:285-290) and SLOT_RUN_TOLERANCE_MS (:300) still resolve. matchPastSlotsToRuns has moved by about two lines (outcomes initialised at :341, not :339; the half-gap cap at :347-349, not :345-347) and its early return now also fires on an empty run list. Not a full re-resolution."
    }
  ],
  "documents": {
    "analytics-time-windows.md": {
      "disposition": "clarify",
      "reason": "Sound and consistent with every technique. One arithmetic wording: the rolling-thirty-days failure mode says the 1.4% overspend 'compounds'. 12.17 periods a year is a constant excess that accumulates; nothing compounds. Change 'compounds' to 'accumulates'."
    },
    "techniques/calendar-arithmetic.md": {
      "disposition": "keep",
      "reason": "The built-in overflow (re-run on Node 22), the anchor-versus-step measurement (re-run on dateutil 2.9.0, identical output) and the start-of-day caveat (Temporal doc re-read) all hold. 12.17 / 1.4%, the Thursday epoch, the 167/169-hour week-start gap and the 30/45-minute offsets are correct."
    },
    "techniques/half-open-interval-policy.md": {
      "disposition": "keep",
      "reason": "The direction clause matches the 3.0 migration guide word for word ('more consistent', 5 or 6 samples). Tiling, the closed-closed double count and the open-open drop are correct, and the instant-read exception agrees with baseline-as-window-start's strict `< start`."
    },
    "techniques/canonical-zone-single-source.md": {
      "disposition": "keep",
      "reason": "The split-brain mechanism, the ambient-zone ban, the enforcer-dictates rule and the frozen-rollup migration rule are design claims with no unstable external fact. The node application's universal-time week grid is the disclosed counterexample this technique predicts."
    },
    "techniques/baseline-as-window-start.md": {
      "disposition": "keep",
      "reason": "Strict `< start` is argued from the half-open policy and is the shape the sql application records. The state-versus-volume rule correctly bounds where a point baseline exists; absence-is-not-zero matches cohort-matched-comparison."
    },
    "techniques/range-precedence-resolution.md": {
      "disposition": "keep",
      "reason": "Explicit-beats-stored-beats-default with one door and returned provenance is internally consistent; the reversed-range swap and the echoed custom title are carried by the node application with their reasons."
    },
    "techniques/cohort-matched-comparison.md": {
      "disposition": "keep",
      "reason": "The movement/composition decomposition, the both-sides intersection, the cohort-size echo and the new-entity-is-composition rule are correct, and the worked sentence (+1 movement, +2 composition = +3) adds up."
    },
    "applications/node--calendar-arithmetic.md": {
      "disposition": "clarify",
      "reason": "Internal inconsistency: it says anchoring the step on the intended slot (`nextSlotFrom`) is 'the neighbouring scheduling subject's concern, not this one's', while applications/node--calendar-arithmetic--persisted-monthly-slot.md records that same function breaking this technique's anchor rule. Replace the hand-off with a pointer to the sibling. Its line references also disagree with the sibling's for the same function (`nextScanFor` at :28-42 here, :33-47 there) and the 2026-09-29 deepen found them drifted; that half is reverify (the ascent tree is not available here)."
    },
    "applications/node--calendar-arithmetic--persisted-monthly-slot.md": {
      "disposition": "reverify",
      "reason": "Internally consistent, and its central measurement reproduces in kind (dateutil above). The ascent tree at b3335c35 and its verbatim-function simulation were not reopened."
    },
    "applications/node--range-precedence-resolution.md": {
      "disposition": "reverify",
      "reason": "Precedence chain, swap, echoed title and the disclosed inclusive-alias deviation are coherent with the technique. The ascent citations (window.ts, period.ts, org-rollup.ts) were reported drifted by the 2026-09-29 deepen and were not re-resolved."
    },
    "applications/react--calendar-arithmetic.md": {
      "disposition": "clarify",
      "reason": "Split out of the node application on 2026-08-29 and still written as its continuation: it opens 'Everything above computes period edges' and its last limit says 'The stack differs from the rest of this document ... the earlier sections'. Reword both to name the node-stack application as a separate document. Citations have drifted about two lines in matchPastSlotsToRuns at personas HEAD (see sources): reverify after the wording fix; verified_on stays."
    },
    "applications/sql--cohort-matched-comparison.md": {
      "disposition": "reverify",
      "reason": "The double filter, null-on-no-overlap, strict `lt: effStart` and the store-side distinct reduction match the techniques, and the disclosed missing cohort size is stated as a gap. The ascent citations were not re-resolved."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the three clarify items the earlier 2026-10-31 record named, against
`19d8436ae`. The golden path's arithmetic wording, the node calendar
application's hand-off to the scheduling subject, and the react application's
split leftovers are fixed. The techniques stay keep. Every application keeps
`reverify` for citations that were not re-resolved, which is now the overall
disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/analytics-time-windows",
  "date": "2026-10-31",
  "baseline": "19d8436ae",
  "digest": "sha256-b2:e0eb76c630cfabaf",
  "disposition": "reverify",
  "coverage": "All 12 current documents decided. The three clarify items owed by the earlier 2026-10-31 record (golden path, node calendar application, react application) were applied and the edited passages re-read; the other nine documents are byte-unchanged and keep their dispositions. Sources are those of the earlier record, opened this run. Not evaluated: the ascent tree behind four applications; a full citation re-resolution of the react application in personas. No verification date was refreshed.",
  "counterexamples": [
    "A cumulative counter or scrape stamped at the window end summarizes the interval before it, so `[start, end)` misfiles it; `(start, end]` is the correct half-open form there and tiles equally well.",
    "A technical horizon (retention, staleness, a retry budget) needs no calendar semantics: a fixed 90-day duration is correct and simpler, because no human reads the boundary as a date.",
    "A volume metric (requests served, revenue booked) has no value at an instant, so the point baseline at the window start is unavailable and a matched prior window is the only comparison.",
    "A genuinely fixed population has no composition effect, so cohort matching adds identity work and changes nothing.",
    "A single-source report that always covers last month needs no precedence resolver; a chain with one link is ceremony."
  ],
  "sources": [
    {
      "url": "https://prometheus.io/docs/prometheus/latest/migration/",
      "result": "Re-read. 'Lookback and range selectors are now left-open and right-closed (previously left-closed and right-closed), which makes their behavior more consistent.' 'Before Prometheus v3, a range query with `5m` would usually return 5 samples. But if the query evaluation aligns perfectly with a scrape, it would return 6 samples.' Supports the direction clause in half-open-interval-policy and the golden path as written."
    },
    {
      "url": "https://tc39.es/proposal-temporal/docs/zoneddatetime.html",
      "result": "Re-read. startOfDay: 'The local time of the result is almost always `00:00`, but in rare cases it could be a later time e.g. if DST skips midnight in a time zone', with the example 2018-11-04 America/Sao_Paulo returning 01:00. Supports calendar-arithmetic step 2."
    },
    {
      "source": "Local execution, Node v22 built-in Date",
      "result": "`setUTCMonth(1)` on 2026-01-31T00:00Z gives 2026-03-03T00:00Z, matching the Node 24 figure in calendar-arithmetic step 1 (the overflow behaviour is the language's, not the release's)."
    },
    {
      "source": "Local execution, Python dateutil 2.9.0",
      "result": "From 2026-01-31, four single relativedelta(months=1) steps give 02-28, 03-28, 04-28, 05-28; anchor + k months gives 02-28, 03-31, 04-30, 05-31. Matches calendar-arithmetic step 3 exactly."
    },
    {
      "source": "Arithmetic",
      "result": "365 / 30 = 12.17 periods a year; 12.17 / 12 = 1.0139, so a 1.4% excess. The excess is a constant rate per year, so it accumulates linearly; it does not compound."
    },
    {
      "source": "personas tree at 22260d77c9 (drift sample for applications/react--calendar-arithmetic.md, cited at c2a3c5fa1)",
      "result": "The four-state kind (:24), its doc (:15-23), the deletion note (:82-91), the history comment (:285-290) and SLOT_RUN_TOLERANCE_MS (:300) still resolve. matchPastSlotsToRuns has moved by about two lines (outcomes initialised at :341, not :339; the half-gap cap at :347-349, not :345-347) and its early return now also fires on an empty run list. Not a full re-resolution."
    }
  ],
  "documents": {
    "analytics-time-windows.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the rolling-thirty-days failure mode now says the 1.4% overspend 'accumulates every year' instead of 'compounds' (12.17/12 is a constant yearly excess)."
    },
    "techniques/calendar-arithmetic.md": {
      "disposition": "keep",
      "reason": "The built-in overflow (re-run on Node 22), the anchor-versus-step measurement (re-run on dateutil 2.9.0, identical output) and the start-of-day caveat (Temporal doc re-read) all hold. 12.17 / 1.4%, the Thursday epoch, the 167/169-hour week-start gap and the 30/45-minute offsets are correct."
    },
    "techniques/half-open-interval-policy.md": {
      "disposition": "keep",
      "reason": "The direction clause matches the 3.0 migration guide word for word ('more consistent', 5 or 6 samples). Tiling, the closed-closed double count and the open-open drop are correct, and the instant-read exception agrees with baseline-as-window-start's strict `< start`."
    },
    "techniques/canonical-zone-single-source.md": {
      "disposition": "keep",
      "reason": "The split-brain mechanism, the ambient-zone ban, the enforcer-dictates rule and the frozen-rollup migration rule are design claims with no unstable external fact. The node application's universal-time week grid is the disclosed counterexample this technique predicts."
    },
    "techniques/baseline-as-window-start.md": {
      "disposition": "keep",
      "reason": "Strict `< start` is argued from the half-open policy and is the shape the sql application records. The state-versus-volume rule correctly bounds where a point baseline exists; absence-is-not-zero matches cohort-matched-comparison."
    },
    "techniques/range-precedence-resolution.md": {
      "disposition": "keep",
      "reason": "Explicit-beats-stored-beats-default with one door and returned provenance is internally consistent; the reversed-range swap and the echoed custom title are carried by the node application with their reasons."
    },
    "techniques/cohort-matched-comparison.md": {
      "disposition": "keep",
      "reason": "The movement/composition decomposition, the both-sides intersection, the cohort-size echo and the new-entity-is-composition rule are correct, and the worked sentence (+1 movement, +2 composition = +3) adds up."
    },
    "applications/node--calendar-arithmetic.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: the sentence handing the intended-slot anchor to the scheduling subject now points at node--calendar-arithmetic--persisted-monthly-slot, which records that anchor rule failing in the same function. Still owed: the ascent line references (nextScanFor :28-42 here versus :33-47 in the sibling; org-watch.ts:11, credits.ts, window.ts, org-signals.ts, org-insights.ts) need re-resolution against the current tree, which is not available here; verified_on unchanged."
    },
    "applications/node--calendar-arithmetic--persisted-monthly-slot.md": {
      "disposition": "reverify",
      "reason": "Internally consistent, and its central measurement reproduces in kind (dateutil above). The ascent tree at b3335c35 and its verbatim-function simulation were not reopened."
    },
    "applications/node--range-precedence-resolution.md": {
      "disposition": "reverify",
      "reason": "Precedence chain, swap, echoed title and the disclosed inclusive-alias deviation are coherent with the technique. The ascent citations (window.ts, period.ts, org-rollup.ts) were reported drifted by the 2026-09-29 deepen and were not re-resolved."
    },
    "applications/react--calendar-arithmetic.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: 'Everything above' and 'the rest of this document ... the earlier sections' now name the node-stack application as a separate document. Still owed: matchPastSlotsToRuns citations have moved about two lines at personas 22260d77c9 and its early return now also fires on an empty run list; a full re-resolution is needed before verified_on moves."
    },
    "applications/sql--cohort-matched-comparison.md": {
      "disposition": "reverify",
      "reason": "The double filter, null-on-no-overlap, strict `lt: effStart` and the store-side distinct reduction match the techniques, and the disclosed missing cohort size is stated as a gap. The ascent citations were not re-resolved."
    }
  }
}
```

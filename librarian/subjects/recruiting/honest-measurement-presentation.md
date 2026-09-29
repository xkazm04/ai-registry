---
domain: recruiting
subject: honest-measurement-presentation
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L3
---

# honest-measurement-presentation

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-10 - `/intake`, a source-tree application

Added a source-tree application from the
[career-ops intake](../../sources/2026-09-10-career-ops-recruiting.md).
A ten-case stub replay passes on 9/10 archetype matches although only 7/10 rows
satisfy both archetype and score criteria. The headline must name its predicate.
This is harness verification, not evidence of live-model or hiring performance.

### 2026-09-29 - `/deepen`, first pass (dp-hmp-0929)

The Curator lane dispatched this from the registry's attention scan, on "never swept by
the librarian". The subject stood at revision 2, and three of its four applications had
not been re-verified since 2026-08-20. `check-currency` reported one row: the career-ops
application is pinned to `node@18` against a fleet on 24. In the meantime kp had rewritten
the delta module, moved every cited line and grown its honesty-rules list.

Four lanes ran: web counter-evidence (seven claims), a blind training-data lane (eight
questions), and a read-only re-read of kp at `d1d2377e6`. Primary texts were read by the
counter lane, and one more (PostgreSQL's ordering docs) was fetched here.

**Counter-evidence: one refuted, three conditioned, four confirmed.**
- **Refuted: "an em dash is conventional" for not measured.** The counter and blind lanes
  converged:
  - The ČSÚ methodology page was matched verbatim: a dash in place of a number means the
    event did not occur, and a dot means not available.
  - statistikportal.de: "– nichts vorhanden (genau Null)".
  - Eurostat uses "-" for not applicable. Statistics Canada used an em dash for nil until
    it replaced it with 0.

  For the readers this subject's one consumer serves (cs, de), a bare dash reads as the
  zero it is meant to rule out. It is also silent: Deque reports NVDA reads straight
  through it and VoiceOver only pauses. The UK Analysis Function dropped symbols for that
  reason. The rule now requires the mark's meaning in words: a legend, a reason and an
  accessible name. The rule "0 for a true zero" is confirmed by the same pages.
- **Not applicable is its own state.** Every office keeps it apart from not available (a
  dot and a cross, ":" and "-", [x] and [z]). A zero denominator is not applicable. The
  technique had put it under the not-measured mark while telling readers not to merge the
  two.
- **The hiding ladder is for whole elements.** Counter lane: Song & Szafir 2018, read from
  the PDF (removal degrades perceived quality and produces wrong answers; highlighting
  rates higher). Blind lane: the counter-position on hiding. Inside a chart, the gap is
  marked, and a missing value takes no position on a colour scale.
- **The no-data sort position is stated, not inherited.** Blind lane: the engines
  disagree. PostgreSQL's docs were fetched verbatim ("NULLS FIRST is the default for DESC
  order"). The engine names live in a new node application, because the upper layers must
  transplant.
- **Confirmed:**
  - the base belongs in the headline (Ecker et al. 2014; van der Bles et al. 2020, where
    a range in the statement was noticed and cost little trust);
  - percentage points for rates (ONS);
  - the remainder row, now placed last whatever its size (ONS, and the blind lane);
  - direction is not valence (blind lane).

**Not landed, as single-lane or unverified:**
- **Cardinaels, Kramer & Maas 2024.** Colour-coding period-over-period change with a
  known polarity reduced managers' reaction to noise. Only the abstract page was read, and
  it is consistent with the delta technique's polarity rule rather than a challenge to the
  goal rule.
- **Bazley et al. on red and avoidance.** Only a search summary was seen.
- **The "Other becomes the largest bar" quotes.** From practitioner blogs, not read.
- **The ČSÚ yearbook "x" and "0" definitions.** The PDFs were over the fetch limit.

**The tree found what no lane asked:**
- **kp's market map imputed a missing salary.** `regionScale` answered 0.5, painted
  mid-scale. With no medians at all, every region was painted mid-scale beside a hidden
  legend.
- **kp's all-time cohort read** relied on SQLite's null order to keep undated rows out of
  its cap, on a codebase that documents a Postgres port.
- **Open deviations, recorded on the applications:**
  - a thin-sample delta's `withheld` reason is computed and rendered nowhere, so it looks
    like "no baseline";
  - the org benchmark paints a two-entry team "behind";
  - the market page's top lists state no cap and no remainder;
  - the dash explains itself in one column only.

**Convergence.** No new technique. Every flip landed as a condition or a step inside an
existing technique. Engines, screen readers and kp's cases are in applications.

**Applied** (five rows in `applied.md`):
- **code, better:** kp `609876d1a`, local. The map gives a missing figure the neutral
  fill. The two no-data cases were red, then green; the measured control was identical on
  both arms; tsc was clean.
- **simulation, better:** kp `24006b85e`, local. The all-time read states NULLS LAST. It
  is identical on SQLite 3.53.4. The pin test is green, and red under the Postgres default
  emulated. kp `8acc1fca1` corrected the marketing doc.
- **simulation, better:** the dash rule over three real kp sites. The old rule flags 1 of
  3 and the new rule 3 of 3.
- **unapplied:** not applicable as a state (kp's metric pack has three states, none of
  them it), and the remainder row last (kp's market lists need copy in four locales).

**Applications.** Three were re-verified to 2026-09-29 at kp `24006b85e` (node@24,
react@19), and every line citation was moved. One stale claim was corrected: the delta
gate now covers every rate, not only source and channel rows. One application was added:
node, every-band, the stated null order. The career-ops application was not re-opened.

## Impact

- **kp:** 1 context joined (`analytics-computation`), probable, state unknown; 0 stale
  verdicts. No project carries a judged verdict on this subject.
- **The join missed every seam this pass touched.** Those are the market map
  (`app/landing/spark/market`), the cohort read (`app/_lib/db/analytics.ts`), and the
  insights components carrying the deviations. `analytics-computation` holds only the
  `_lib` analytics modules. It is the same kind of miss dp-ep-0929 and dp-dn-0929
  recorded.
- **Maps regenerated fleet-wide.** Twelve projects committed locally on their active
  branches, none pushed. grant has no checkout on this machine, and gigs has no context
  map. Politicas' hook printed a "map integrity" block line and committed anyway.

## Saturation ledger

| | |
| --- | --- |
| Depth | L3: one code A/B with red-first tests on the real snapshot, one engine-emulated pin test, one three-site simulation |
| Last-pass yield | high: 1 refuted, 3 conditioned, 4 confirmed, 2 code changes, 3 application corrections, 1 new application |
| Dry streak | 0 |
| Clocks | statistics-office conventions as read 2026-09-29 (ČSÚ, Destatis, Eurostat, StatCan, UK AF); Song & Szafir 2018; van der Bles 2020; PostgreSQL current docs |
| Demand | kp only (one context; the market page and the data layer are unjoined) |

## Banked leads

- **kp's org benchmark** colours a verdict below the rate floor. Return: when kp next
  edits `AnalyticsOrgBenchmarkPanel.tsx`; the fix wants the entitlement extracted into a
  pure, testable value.
- **kp's delta chip** needs a "too few to compare" state for `withheld`. Return: when kp
  next edits the chip or its copy.
- **kp's portability audit** has no null-order rule; 121 descending sorts are unaudited.
  Return: when the Postgres port starts.
- **The career-ops application** is pinned to `node@18` (the tree's declared floor).
  Return: a re-read of career-ops.
- **Cardinaels et al. 2024 and Bazley et al.** Return: a full-text read of either.
- **The map join** above. Return: the next `/straighten` or manifest pass over kp.

---
subject: table
domain: software-engineering
last_touched: 2026-10-07
dry_streak: 0
---

# table

First touch: [[2026-08-31-tkdodo-rq-beyond-basics]] — one surgical edit to
`loading-and-empty-states`, no new technique.

This subject specializes the `async-ui-states` doctrine, and it had inherited
that subject's one wrong prescription verbatim: applying a filter with rows
present should "keep showing the old rows dimmed **or** clear to
EMPTY-LOADING — but pick one per product and apply it everywhere". Both halves
of that sentence are now decidable rather than a matter of taste, so the line
resolves per axis — a page, sort or size change keeps the rows dimmed; a
filter change clears — and points at
[[async-ui-states]]'s new `windowing-vs-identifying-keys`
rather than restating the rule on this side. The "mixing feels
nondeterministic" warning survives, narrowed to what it was actually true of:
choosing **per call site**.

Worth recording for a later sweep: `pagination` on this subject already
contains two independent instances of the same axis distinction, both correct
and neither named as such. Its cursor rules say *"changing sort or filter
invalidates the cursor; the client starts a fresh sequence"* — treating the
two identically, where the new technique says sort is windowing and filter is
identifying. And its closing line bundles *"(page or cursor, size, sort,
filter)"* into one undifferentiated "window state" whose restoration is
"chosen, not accidental" — which is exactly the bag the technique splits.
Neither is wrong enough to correct blind; both are live candidates the next
run over this subject should read with the classification in hand.

Untouched otherwise. No count of this subject's attention points was taken
this run.

## 2026-09-02 - lead placed by [[2026-09-02-1]]

- **The stale-success/error pair.** A body that can re-fetch in place must
  replace its outcome whole: a failed or empty run clears the prior rows
  before the verdict renders, because "set rows when rows arrive" never fires
  on failure. Landed as the console's contract in sql-console/result-fidelity
  (two public trackers); the table's body state model owes the same clause.

## 2026-09-23 - [[2026-09-23-1]]

Scoped `/deepen` (run lib-0923), dispatched because the subject carried the most fresh consumer deviations in the fleet (11 standing, across 8 projects, state-correct collector) and stale verdicts in 6 projects. Ten inbox leads plus counter-evidence, training-data and current-practice lanes. **No new technique; six published rules corrected.**

- `filtering`: the absolute "a bulk action must never reach a record the user cannot currently see" became the invariant *the count read before firing names every record the action will receive*; intersect with the predicate's full answer, not the rendered window; cross-filter reach only in disclosed form. Removed a contradiction with `file-browsing/selection-model`. Explicit commit now scoped to commits that cost a round trip; all-client keystroke filtering announces its count (SC 4.1.3).
- `sorting`: tiebreaker necessary but not sufficient - same comparator on both tiers; collation locale is the reader's, passed explicitly. Exposed sort state is not an announcement (golden path too).
- `pagination`: the tuple seek needs one direction and no absent terms; a nullable sort column drops rows from a keyset walk.
- `performance`: memo-compared props neither positional nor allocated per parent render; `content-visibility` as a hedged rung-4 alternative.
- `loading-and-empty-states`: an undecodable payload is not empty; a defaulted decode is the tell.
- golden path: a rate column owns its denominator.

Leads: L325 AMEND, L326 COVERED (and the application it cited was corrected - its surface has no render site since 2025-11), L327 AMEND, **L328 DECLINE** (its evidence is a component with no render site; rungs are already independent), L331 COVERED, **L332 DECLINE** (the cause is a client filter over a server-truncated window, already forbidden by `client-server-split` and the count law), L333 AMEND, **L337 COVERED** by `async-ui-states/placeholder-design` (and over-generalised: the replaced silhouette was not geometry-matched), L338 AMEND + APPLICATION, L339 AMEND.

Sources for the upper-layer claims (house style keeps URLs out of techniques): the sortable-columns screen-reader matrix at adrianroselli.com/2021/04/sortable-table-columns.html (updated 2024-08); GitLab's keyset-pagination documentation and open ORM issues on nullable keyset columns.

Proposals placed for a later run: `file-browsing/selection-model` could add the page-vs-predicate boundary; `async-ui-states/placeholder-design` could name the two-layer fallback case.

**Impact** (verdicts stale before this landing; the landing moves the digest again, so the post-merge map rebuild owes these re-judged): personas 2, kp 2, personas-web 3, systedo-case 2, ascent 4, one private project 3.

## 2026-10-07 - ordering cluster, cloud run 261007-9865da

Seven leads on one theme (deterministic order, tiebreakers, which tier runs a sort or
filter). Three ruled, four left open. **No edit to any technique.** The run's web egress
denied every documentation host (postgresql.org, MDN, tc39.es, sqlite.org, ag-grid.com), so
no primary source was fetched and nothing was landed that would need one. The mechanisms
were reproduced locally (SQLite 3.45.1, Node 22) as supporting evidence. That evidence does
not authorize a technique on its own.

- **L159 COVERED.** `sorting` requires a total order ending in identity, and
  `versioning-snapshots/version-identity` already says a non-unique "latest" returns
  "whichever row the query plan prefers". Reproduced: two same-instant rows, `ORDER BY
  started_at DESC LIMIT 1` returned id 1 under a table scan and id 2 after an index on
  `(bench, started_at)` was added; `, id DESC` pinned it. The lead's caveat, that the
  tiebreak is not a claim that one run was later, is the same point L330 makes (see below).
- **L335 COVERED.** `client-server-split` step 4 already forbids "sort or filter on the
  client below a server-truncated window; counts computed on a tier that cannot see the
  whole predicate's extent". L332 was declined on the same grounds. The facet-count tell
  ("All 50") is a detection aid, not a rule, and its citations need the personas-web tree.
- **L330, L334 open (undecidable: egress).** Both leads point at one corrected premise.
  A rank is a function of the sort key, not of the tiebreaker: peers share a rank (SQL
  `RANK()`/`DENSE_RANK()`), and only a *position* is minted from the total order
  (`ROW_NUMBER()`). Under peer ranks, L334's badge-versus-position disagreement cannot
  occur inside a tie, and the shared rank number discloses the tie, which is what L330
  asks for. Reproduced: `rank()` gave 1,1 and `row_number()` gave 1,2 over a tie. The
  amendment text is drafted in the run's RESULT.md. It owes a fetched primary
  (the PostgreSQL window-functions page) before it lands.
- **L336 open (undecidable: egress + tree).** "In an all-client table, export the derived
  rows" is plausible and strictly stronger than the predicate object, but the boundary is
  the window: the tbody maps the *page* wherever the client paginates, so the export takes
  the filtered and sorted array before windowing. Needs a vendor grid's export
  documentation fetched and the systedo-case tree opened.
- **L353 open (undecidable: egress + tree).** Reproduced the mechanism: a stable sort
  carried a pre-sorted population order through equal tiers, and appending `id` replaced
  it. The rule ("name any implicit order a stable sort was carrying before appending
  identity") owes the ECMAScript/MDN stability text, and the politicas commits
  `26d695a`/`22f03d6` are unverified.

- **Impact evaluation, 2026-10-14 (grid-keyboard-model).** impact-null (1 of 2): blind A/B in a
  consuming project, 4/5 vs 4/5. The pre-landing corpus already produced the grid design;
  the landing's distinct contribution (no wrap at row edges) showed in one arm only. Ledger:
  `librarian/harvest/evaluations.md`.

## 2026-10-14 - [[2026-10-14-revogrid]]

`/intake` over a data-grid library, focus on table quality. Four techniques added, all in the half a grid has and a list-style table does not: `compressed-scroll-space` (the browser's scroll ceiling; the thumb reaches every row only up to about the ceiling's pixel count in rows, a derivation), `one-door-for-range-writes` (paste, fill, cut and clear are writers; the source tree has two events for one store), `clipboard-range-round-trip` (copy then paste of the same block changed 4 rows and 8 cells into 5 and 10 in the source's own functions), `export-escapes-for-its-consumer` (formula layer under the CSV layer; exemption by shape, measured on 800 contacts).

Open for a later sweep: pinned partitions (a lead), column auto-size by character count (amendment to the column-width line), grouping x sort x filter. `performance` rung 4 now points at `compressed-scroll-space`.

## Architecture review - 2026-10-31

First architecture review of this subject. Twenty-four documents decided against `1061e8d64`. Three clarify items: client-server-split contradicts filtering on debounce and cancellation, performance overstates content-visibility against CSS Containment 2, and rust--pagination misstates SQLite row-value support. The revogrid applications re-resolved at their pinned commit. Applications citing other consumer trees were not reopened.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/table",
  "date": "2026-10-31",
  "baseline": "1061e8d64",
  "digest": "sha256-b2:c587a204413d5373",
  "disposition": "clarify",
  "coverage": "All 24 documents (golden path, 11 techniques, 12 applications) read and decided. Primary sources opened: OWASP CSV Injection, the sortable-columns screen-reader matrix, the ARIA APG grid pattern, CSS Containment Level 2, SQLite row values. All 18 quoted revogrid anchors re-fetched at the pinned commit; the rust--pagination anchors re-read in the personas tree. The ascent, kp, pof and goat trees and the personas UnifiedTable were not reopened. Trigger: pending, never architecture-reviewed. Intended benefit: one current decision per document so later deepen/reconcile runs start from known debt. Failure if ignored: the client-server-split cost line keeps teaching debounce and cancellation as the race fix that filtering forbids, and the content-visibility paragraph overstates what reaches assistive technology. Boundary: a review of written claims and citations, not a re-run of any consumer measurement.",
  "counterexamples": [
    "A content-visibility: auto body is not guaranteed to stay in the accessibility tree: CSS Containment 2 §4.5 makes an engine omit skipped contents entirely when it cannot represent them without the skipped layout.",
    "A keystroke-applied text filter is correct in the all-client regime, where no round trip exists; the explicit-commit rule binds only commits that cost a request.",
    "A single-quote formula guard can be stripped when a spreadsheet saves and reopens the CSV, so the guard is an export-time mitigation, not a property of the file.",
    "A keyset walk over a nullable sort column drops every NULL-keyed row silently, because a row-value comparison with a NULL term is NULL, not true."
  ],
  "sources": [
    {
      "url": "https://community.owasp.org/attacks/CSV_Injection",
      "result": "Read 2026-10-31 (redirected from owasp.org). Trigger list includes \"Tab (0x09)\", \"Carriage return (0x0D)\", \"Line feed (0x0A)\" and \"Full-width (double-byte) variants\"; \"There is no universal CSV sanitization strategy that is safe for all spreadsheet applications and all downstream consumers\"; \"Microsoft Excel may remove quotes or escape characters from CSV cells when a file is saved and re-opened.\" Supports export-escapes-for-its-consumer as written."
    },
    {
      "url": "https://adrianroselli.com/2021/04/sortable-table-columns.html",
      "result": "Read 2026-10-31; page \"Updated October 14, 2026\". \"not all screen readers tell the user that anything has happened\"; the 2024 update lists VoiceOver/Safari and TalkBack with Chrome or Firefox as silent on sort. Supports sorting and the golden path."
    },
    {
      "url": "https://www.w3.org/WAI/ARIA/apg/patterns/grid/",
      "result": "Read 2026-10-31. \"If focus is on the right-most cell in the row, focus does not move\"; Control+End \"may move focus to the last row in the DOM rather than the last available row in the back-end data\"; \"In a grid, every cell contains a focusable element or is itself focusable.\" Supports grid-keyboard-model."
    },
    {
      "url": "https://www.w3.org/TR/css-contain-2/",
      "result": "Read 2026-10-31. auto: skipped contents \"must still be available as normal to user-agent features such as find-in-page, tab order navigation, etc.\"; §4.5: where the UA cannot avoid the work \"the user agent must omit the skipped contents from the accessibility tree entirely\"; layout and paint containment have no effect on \"an internal table box other than table-cell\", size containment none on any \"internal table box\". Basis for the performance clarify."
    },
    {
      "url": "https://www.sqlite.org/rowvalue.html",
      "result": "Read 2026-10-31. \"Row values were added to SQLite version 3.15.0 (2016-10-14)\"; > is among the supported comparison operators; recommends row-value keyset scrolling over OFFSET. Refutes the rust--pagination sentence; supports pagination’s tuple-seek and NULL-term preconditions."
    },
    {
      "source": "revolist/revogrid at 8b606d6d15e24841aa6cd343cf4aa0e4b0739957",
      "result": "All 18 quoted line anchors across the four node applications fetched and matched 2026-10-31; onPaste ownership check and the three named e2e specs present."
    },
    {
      "source": "personas tree at a7b34f56, team_assignments.rs",
      "result": "Every rust--pagination line anchor resolves to the cited code."
    }
  ],
  "documents": {
    "table.md": {
      "disposition": "keep",
      "reason": "Chrome/body split, column model, row identity, body state table, count-carries-predicate and the accessibility posture agree with every technique. The sort-announcement claim matches the re-read screen-reader matrix (silent pairings still listed, page updated October 2026). The rate-column denominator rule landed 2026-09-23 is present."
    },
    "techniques/pagination.md": {
      "disposition": "keep",
      "reason": "Re-read the two items the 2026-08-31 entry banked. \"Changing sort or filter invalidates the cursor\" is correct as written: a cursor is a position in one order under one predicate, so both invalidate it; the windowing-versus-identifying split decides what the visible rows and selection do, not whether the cursor survives. The closing \"window state ... restore or deliberately reset\" line does not prescribe one treatment for all four members, so it is not wrong; naming the split there would be an amendment, not a correction. Tuple-seek preconditions agree with the SQLite row-value page (row values compare left to right; a NULL term yields NULL)."
    },
    "techniques/sorting.md": {
      "disposition": "keep",
      "reason": "Total order with identity tiebreaker, same comparator on both tiers, reader locale and the announce-the-change rule all hold; the cited matrix still lists VoiceOver/Safari and TalkBack as silent on sort (re-read 2026-10-31). Open leads L330/L334 (rank versus position), L336 (export the derived rows) and L353 (implicit order under a stable sort) remain amendments owing primary sources, not clarify items."
    },
    "techniques/filtering.md": {
      "disposition": "keep",
      "reason": "Entered versus applied, per-control commit, whole-predicate value, window reset and row clear on filter change, latest-wins with the loser’s failure dropped, and the intersect-at-read selection invariant are internally consistent and agree with loading-and-empty-states and async-ui-states. SC 4.1.3 Status Messages is level AA, as stated."
    },
    "techniques/client-server-split.md": {
      "disposition": "clarify",
      "reason": "Internal contradiction: the all-server regime lists \"debounced inputs, request cancellation (a stale response arriving late must not overwrite a newer one)\" as its costs, while filtering rules that free-text filters commit on an explicit act (a debounce is a guess) and that dropping a superseded response is the correctness rule, with cancellation only a bandwidth optimization. Restate the cost line in filtering’s terms."
    },
    "techniques/performance.md": {
      "disposition": "clarify",
      "reason": "Two statements are looser than CSS Containment 2: (1) \"skipped content stays in the accessibility tree\" - the spec keeps it available to find-in-page and tab order, but §4.5 requires a UA that cannot avoid the layout work to omit skipped contents from the accessibility tree entirely; (2) \"containment has no effect on internal table boxes other than cells\" is true of layout and paint containment, but size containment has no effect on any internal table box, cells included, so the intrinsic-size estimate cannot apply per cell. The ladder itself is sound."
    },
    "techniques/loading-and-empty-states.md": {
      "disposition": "keep",
      "reason": "State machine, settle-before-empty, error and undecodable payload distinct from empty, the delay-survives-reduced-motion split and the per-axis refresh corollary all hold; the cross-link to windowing-vs-identifying-keys resolves. The 2026-09-02 stale-success/error lead is consistent with the existing rules (a different predicate clears; a failed refresh under the same predicate keeps rows with an ambient failure) and is not a correction."
    },
    "techniques/grid-keyboard-model.md": {
      "disposition": "keep",
      "reason": "Matches the ARIA APG grid pattern re-read 2026-10-31: focus does not move at the right-most or left-most cell; Control+End goes to the last cell of the last row and \"may move focus to the last row in the DOM rather than the last available row in the back-end data\"; \"every cell contains a focusable element or is itself focusable\" with the non-functional header exception."
    },
    "techniques/compressed-scroll-space.md": {
      "disposition": "keep",
      "reason": "The derivation (R = rows x height / ceiling, so every row addressable while rows <= ceiling) is arithmetic-correct within the document’s own use of \"thumb position\" for the physical scroll coordinate. The 46-pixel range (a few hundred thousand to a million rows) is consistent with ceilings in the tens of millions of pixels; the revogrid fallback is 16,000,000 with a 1,000,000 guard. Per-engine ceiling values were not re-measured, and the text deliberately hedges them."
    },
    "techniques/one-door-for-range-writes.md": {
      "disposition": "keep",
      "reason": "The triple-shaped door, its ordered steps and the report-what-was-written rule are coherent and consistent with clipboard-range-round-trip; the application’s two-event evidence re-resolved this run."
    },
    "techniques/clipboard-range-round-trip.md": {
      "disposition": "keep",
      "reason": "Arithmetic re-derived: four rows by two columns is eight cells; a tab inside one value adds a cell, a line break inside another adds a row and a cell, giving five rows and ten cells. The quoting convention and the focused-table ownership rule hold."
    },
    "techniques/export-escapes-for-its-consumer.md": {
      "disposition": "keep",
      "reason": "Agrees with the OWASP CSV Injection page re-read 2026-10-31: triggers =, +, -, @, tab, carriage return, line feed and the full-width variants; \"There is no universal CSV sanitization strategy that is safe for all spreadsheet applications and all downstream consumers\"; Excel \"may remove quotes or escape characters ... when a file is saved and re-opened\"; the single-quote prefix sits inside the double-quoted field, i.e. guard then quote. 25/800 = 3.1% recomputed."
    },
    "applications/node--clipboard-range-round-trip.md": {
      "disposition": "keep",
      "reason": "Every quoted line anchor re-fetched from revolist/revogrid at the pinned commit 8b606d6 resolved to the quoted text. The focus/edit ownership check sits at revogr-overlay-selection.tsx onPaste (about line 877), as cited."
    },
    "applications/node--compressed-scroll-space.md": {
      "disposition": "keep",
      "reason": "Every quoted line anchor re-fetched from revolist/revogrid at the pinned commit 8b606d6 resolved to the quoted text. The probe reads back an off-screen scroller and subtracts the guard; the e2e files it names exist at the commit."
    },
    "applications/node--export-escapes-for-its-consumer--revogrid.md": {
      "disposition": "keep",
      "reason": "Every quoted line anchor re-fetched from revolist/revogrid at the pinned commit 8b606d6 resolved to the quoted text. The replayed serialiser outputs were not re-executed; they follow from the quoted JSON.stringify fallback."
    },
    "applications/node--one-door-for-range-writes.md": {
      "disposition": "keep",
      "reason": "Every quoted line anchor re-fetched from revolist/revogrid at the pinned commit 8b606d6 resolved to the quoted text. The e2e range spec it names exists at the commit."
    },
    "applications/rust--pagination.md": {
      "disposition": "clarify",
      "reason": "Anchors re-read in the personas tree at a7b34f56 and all resolve. One sentence is wrong against the SQLite row-values page: \"SQLite has no row-value comparison in this form’s favor here\" - row values, including (a,b) > (?,?), exist since 3.15.0 (2016-10-14). The OR-expansion is an equivalent spelling, not the only one."
    },
    "applications/next--export-escapes-for-its-consumer.md": {
      "disposition": "reverify",
      "reason": "Cites the ascent and kp trees and a private host; ab_verdict rests on that reading. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    },
    "applications/next--filtering.md": {
      "disposition": "reverify",
      "reason": "Cites the ascent tree at aff9991a/5f17b6c5; ab_verdict rests on a measured change in that tree. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    },
    "applications/next--pagination.md": {
      "disposition": "reverify",
      "reason": "Cites the ascent tree at 62c252dd. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    },
    "applications/next--sorting.md": {
      "disposition": "reverify",
      "reason": "Cites the ascent tree at 62c252dd. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    },
    "applications/react--client-server-split.md": {
      "disposition": "reverify",
      "reason": "Cites the personas UnifiedTable primitive; the line ranges were not re-resolved. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    },
    "applications/react--loading-and-empty-states.md": {
      "disposition": "reverify",
      "reason": "Cites the pof tree at 824df6e2/5a5c36f9; ab_verdict rests on that change. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    },
    "applications/react--performance.md": {
      "disposition": "reverify",
      "reason": "Cites the goat tree; ab_verdict rests on that reading. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the three clarify items of the record above, each from a source opened this run or from the subject's own filtering technique. The four revogrid applications and rust--pagination had verified_on moved to 2026-10-31 after their anchors re-resolved. Seven applications citing other consumer trees keep `reverify`, which is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/table",
  "date": "2026-10-31",
  "baseline": "1061e8d64",
  "digest": "sha256-b2:217f74855ae8d9c1",
  "disposition": "reverify",
  "coverage": "All 24 current documents decided. The three clarify items of the earlier 2026-10-31 record (client-server-split, performance, rust--pagination) were applied from sources opened this run, and the four revogrid applications had verified_on moved after their quoted anchors re-resolved. Seven applications citing ascent, kp, pof, goat and the personas UnifiedTable were not reopened and keep reverify, which is now the overall disposition.",
  "counterexamples": [
    "A content-visibility: auto body is not guaranteed to stay in the accessibility tree: CSS Containment 2 §4.5 makes an engine omit skipped contents entirely when it cannot represent them without the skipped layout.",
    "A keystroke-applied text filter is correct in the all-client regime, where no round trip exists; the explicit-commit rule binds only commits that cost a request.",
    "A single-quote formula guard can be stripped when a spreadsheet saves and reopens the CSV, so the guard is an export-time mitigation, not a property of the file.",
    "A keyset walk over a nullable sort column drops every NULL-keyed row silently, because a row-value comparison with a NULL term is NULL, not true."
  ],
  "sources": [
    {
      "url": "https://community.owasp.org/attacks/CSV_Injection",
      "result": "Read 2026-10-31 (redirected from owasp.org). Trigger list includes \"Tab (0x09)\", \"Carriage return (0x0D)\", \"Line feed (0x0A)\" and \"Full-width (double-byte) variants\"; \"There is no universal CSV sanitization strategy that is safe for all spreadsheet applications and all downstream consumers\"; \"Microsoft Excel may remove quotes or escape characters from CSV cells when a file is saved and re-opened.\" Supports export-escapes-for-its-consumer as written."
    },
    {
      "url": "https://adrianroselli.com/2021/04/sortable-table-columns.html",
      "result": "Read 2026-10-31; page \"Updated October 14, 2026\". \"not all screen readers tell the user that anything has happened\"; the 2024 update lists VoiceOver/Safari and TalkBack with Chrome or Firefox as silent on sort. Supports sorting and the golden path."
    },
    {
      "url": "https://www.w3.org/WAI/ARIA/apg/patterns/grid/",
      "result": "Read 2026-10-31. \"If focus is on the right-most cell in the row, focus does not move\"; Control+End \"may move focus to the last row in the DOM rather than the last available row in the back-end data\"; \"In a grid, every cell contains a focusable element or is itself focusable.\" Supports grid-keyboard-model."
    },
    {
      "url": "https://www.w3.org/TR/css-contain-2/",
      "result": "Read 2026-10-31. auto: skipped contents \"must still be available as normal to user-agent features such as find-in-page, tab order navigation, etc.\"; §4.5: where the UA cannot avoid the work \"the user agent must omit the skipped contents from the accessibility tree entirely\"; layout and paint containment have no effect on \"an internal table box other than table-cell\", size containment none on any \"internal table box\". Basis for the performance clarify."
    },
    {
      "url": "https://www.sqlite.org/rowvalue.html",
      "result": "Read 2026-10-31. \"Row values were added to SQLite version 3.15.0 (2016-10-14)\"; > is among the supported comparison operators; recommends row-value keyset scrolling over OFFSET. Refutes the rust--pagination sentence; supports pagination’s tuple-seek and NULL-term preconditions."
    },
    {
      "source": "revolist/revogrid at 8b606d6d15e24841aa6cd343cf4aa0e4b0739957",
      "result": "All 18 quoted line anchors across the four node applications fetched and matched 2026-10-31; onPaste ownership check and the three named e2e specs present."
    },
    {
      "source": "personas tree at a7b34f56, team_assignments.rs",
      "result": "Every rust--pagination line anchor resolves to the cited code."
    }
  ],
  "documents": {
    "table.md": {
      "disposition": "keep",
      "reason": "Chrome/body split, column model, row identity, body state table, count-carries-predicate and the accessibility posture agree with every technique. The sort-announcement claim matches the re-read screen-reader matrix (silent pairings still listed, page updated October 2026). The rate-column denominator rule landed 2026-09-23 is present."
    },
    "techniques/pagination.md": {
      "disposition": "keep",
      "reason": "Re-read the two items the 2026-08-31 entry banked. \"Changing sort or filter invalidates the cursor\" is correct as written: a cursor is a position in one order under one predicate, so both invalidate it; the windowing-versus-identifying split decides what the visible rows and selection do, not whether the cursor survives. The closing \"window state ... restore or deliberately reset\" line does not prescribe one treatment for all four members, so it is not wrong; naming the split there would be an amendment, not a correction. Tuple-seek preconditions agree with the SQLite row-value page (row values compare left to right; a NULL term yields NULL)."
    },
    "techniques/sorting.md": {
      "disposition": "keep",
      "reason": "Total order with identity tiebreaker, same comparator on both tiers, reader locale and the announce-the-change rule all hold; the cited matrix still lists VoiceOver/Safari and TalkBack as silent on sort (re-read 2026-10-31). Open leads L330/L334 (rank versus position), L336 (export the derived rows) and L353 (implicit order under a stable sort) remain amendments owing primary sources, not clarify items."
    },
    "techniques/filtering.md": {
      "disposition": "keep",
      "reason": "Entered versus applied, per-control commit, whole-predicate value, window reset and row clear on filter change, latest-wins with the loser’s failure dropped, and the intersect-at-read selection invariant are internally consistent and agree with loading-and-empty-states and async-ui-states. SC 4.1.3 Status Messages is level AA, as stated."
    },
    "techniques/client-server-split.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the all-server cost line said \"debounced inputs, request cancellation (a stale response arriving late must not overwrite a newer one)\", contradicting filtering (text filters commit on an explicit act because a debounce is a guess; dropping a superseded response is the correctness rule and cancellation only a bandwidth optimization). It now names explicit commit for free-text inputs and latest-wins dropping, with cancellation as the optional optimization, and points at filtering."
    },
    "techniques/performance.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the content-visibility paragraph now says skipped content stays in keyboard order and find-in-page by the specification, and is meant to stay reachable to assistive technology but may be omitted from the accessibility tree where an engine cannot represent it without the skipped layout (CSS Containment 2 §4.5); the table precondition now separates layout and paint containment (no effect on internal table boxes other than cells) from size containment (no effect on any internal table box), so a per-cell intrinsic-size estimate does nothing. The rest of the ladder is unchanged."
    },
    "techniques/loading-and-empty-states.md": {
      "disposition": "keep",
      "reason": "State machine, settle-before-empty, error and undecodable payload distinct from empty, the delay-survives-reduced-motion split and the per-axis refresh corollary all hold; the cross-link to windowing-vs-identifying-keys resolves. The 2026-09-02 stale-success/error lead is consistent with the existing rules (a different predicate clears; a failed refresh under the same predicate keeps rows with an ambient failure) and is not a correction."
    },
    "techniques/grid-keyboard-model.md": {
      "disposition": "keep",
      "reason": "Matches the ARIA APG grid pattern re-read 2026-10-31: focus does not move at the right-most or left-most cell; Control+End goes to the last cell of the last row and \"may move focus to the last row in the DOM rather than the last available row in the back-end data\"; \"every cell contains a focusable element or is itself focusable\" with the non-functional header exception."
    },
    "techniques/compressed-scroll-space.md": {
      "disposition": "keep",
      "reason": "The derivation (R = rows x height / ceiling, so every row addressable while rows <= ceiling) is arithmetic-correct within the document’s own use of \"thumb position\" for the physical scroll coordinate. The 46-pixel range (a few hundred thousand to a million rows) is consistent with ceilings in the tens of millions of pixels; the revogrid fallback is 16,000,000 with a 1,000,000 guard. Per-engine ceiling values were not re-measured, and the text deliberately hedges them."
    },
    "techniques/one-door-for-range-writes.md": {
      "disposition": "keep",
      "reason": "The triple-shaped door, its ordered steps and the report-what-was-written rule are coherent and consistent with clipboard-range-round-trip; the application’s two-event evidence re-resolved this run."
    },
    "techniques/clipboard-range-round-trip.md": {
      "disposition": "keep",
      "reason": "Arithmetic re-derived: four rows by two columns is eight cells; a tab inside one value adds a cell, a line break inside another adds a row and a cell, giving five rows and ten cells. The quoting convention and the focused-table ownership rule hold."
    },
    "techniques/export-escapes-for-its-consumer.md": {
      "disposition": "keep",
      "reason": "Agrees with the OWASP CSV Injection page re-read 2026-10-31: triggers =, +, -, @, tab, carriage return, line feed and the full-width variants; \"There is no universal CSV sanitization strategy that is safe for all spreadsheet applications and all downstream consumers\"; Excel \"may remove quotes or escape characters ... when a file is saved and re-opened\"; the single-quote prefix sits inside the double-quoted field, i.e. guard then quote. 25/800 = 3.1% recomputed."
    },
    "applications/node--clipboard-range-round-trip.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: verified_on moved to 2026-10-31 after re-checking citations. Every quoted line anchor re-fetched from revolist/revogrid at the pinned commit 8b606d6 resolved to the quoted text. The focus/edit ownership check sits at revogr-overlay-selection.tsx onPaste (about line 877), as cited."
    },
    "applications/node--compressed-scroll-space.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: verified_on moved to 2026-10-31 after re-checking citations. Every quoted line anchor re-fetched from revolist/revogrid at the pinned commit 8b606d6 resolved to the quoted text. The probe reads back an off-screen scroller and subtracts the guard; the e2e files it names exist at the commit."
    },
    "applications/node--export-escapes-for-its-consumer--revogrid.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: verified_on moved to 2026-10-31 after re-checking citations. Every quoted line anchor re-fetched from revolist/revogrid at the pinned commit 8b606d6 resolved to the quoted text. The replayed serialiser outputs were not re-executed; they follow from the quoted JSON.stringify fallback."
    },
    "applications/node--one-door-for-range-writes.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: verified_on moved to 2026-10-31 after re-checking citations. Every quoted line anchor re-fetched from revolist/revogrid at the pinned commit 8b606d6 resolved to the quoted text. The e2e range spec it names exists at the commit."
    },
    "applications/rust--pagination.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: every line anchor re-read in the personas tree at a7b34f56 (fn at :376, predicate :391, ORDER BY :392, doc comment :374-375, absent-half defaults :384-385, seed :399-420, list_events :349-367, sibling list_for_team_after exists); the sentence claiming SQLite lacks a row-value comparison now says SQLite supports it since 3.15.0 and the OR-expansion is an equivalent spelling; verified_on moved to 2026-10-31."
    },
    "applications/next--export-escapes-for-its-consumer.md": {
      "disposition": "reverify",
      "reason": "Cites the ascent and kp trees and a private host; ab_verdict rests on that reading. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    },
    "applications/next--filtering.md": {
      "disposition": "reverify",
      "reason": "Cites the ascent tree at aff9991a/5f17b6c5; ab_verdict rests on a measured change in that tree. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    },
    "applications/next--pagination.md": {
      "disposition": "reverify",
      "reason": "Cites the ascent tree at 62c252dd. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    },
    "applications/next--sorting.md": {
      "disposition": "reverify",
      "reason": "Cites the ascent tree at 62c252dd. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    },
    "applications/react--client-server-split.md": {
      "disposition": "reverify",
      "reason": "Cites the personas UnifiedTable primitive; the line ranges were not re-resolved. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    },
    "applications/react--loading-and-empty-states.md": {
      "disposition": "reverify",
      "reason": "Cites the pof tree at 824df6e2/5a5c36f9; ab_verdict rests on that change. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    },
    "applications/react--performance.md": {
      "disposition": "reverify",
      "reason": "Cites the goat tree; ab_verdict rests on that reading. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    }
  }
}
```

## Re-verification - 2026-10-31 (personas UnifiedTable)

This record follows a re-verification of `applications/react--client-server-split.md` against the personas tree at HEAD `61029d7ae0`. Every anchor re-resolved and was moved. One claim is reversed: `UnifiedTable` gained a controlled `sort` prop on 2026-10-14, so the edge advice that it cannot express a lifted sort is now wrong in the body, and that application is marked `clarify`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/table",
  "date": "2026-10-31",
  "baseline": "709547f1a",
  "digest": "sha256-b2:49a98c437f850eb1",
  "disposition": "clarify",
  "coverage": "Re-verification only: react--client-server-split checked citation by citation against the personas tree at HEAD 61029d7ae0 (UnifiedTable.tsx, useProgressiveReveal.ts, the three onFilterChange callers, ByomAuditLog, DataGrid, the failure test, tables.md, overview-loading.md). Nothing was executed. The golden path, the eleven techniques and the other eleven applications carry the prior record's decisions unchanged.",
  "counterexamples": [
    "A primitive whose sort was internal-only can grow a controlled mode without changing its default. The 'cannot express' gap closed, and the golden-path gap list in the same tree still says it is open.",
    "A @catalog header that names the body a 'strict three-state machine' can stay unchanged while the body grows a fourth branch, so the component's own contract statement is the stale document."
  ],
  "sources": [
    {
      "source": "personas tree at HEAD 61029d7ae0 (read, not run)",
      "result": "Controlled sort prop { key, dir, onSort } at UnifiedTable.tsx:221-228; with it the table skips both sorting and persistence (:565-578, :596-597). Filter and search props are declared (:86-96) and read only inside ColumnHeader. Body branches: ghost :704, panel error :705-708, empty :709-726, inline error :728-731. Row keys: virtualized :765, plain :801, grouped :951. tables.md structural-gaps item 6 still says sort cannot be controlled."
    }
  ],
  "documents": {
    "applications/next--export-escapes-for-its-consumer.md": {
      "disposition": "reverify",
      "reason": "Cites the ascent and kp trees and a private host; ab_verdict rests on that reading. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    },
    "applications/next--filtering.md": {
      "disposition": "reverify",
      "reason": "Cites the ascent tree at aff9991a/5f17b6c5; ab_verdict rests on a measured change in that tree. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    },
    "applications/next--pagination.md": {
      "disposition": "reverify",
      "reason": "Cites the ascent tree at 62c252dd. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    },
    "applications/next--sorting.md": {
      "disposition": "reverify",
      "reason": "Cites the ascent tree at 62c252dd. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    },
    "applications/node--clipboard-range-round-trip.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: verified_on moved to 2026-10-31 after re-checking citations. Every quoted line anchor re-fetched from revolist/revogrid at the pinned commit 8b606d6 resolved to the quoted text. The focus/edit ownership check sits at revogr-overlay-selection.tsx onPaste (about line 877), as cited."
    },
    "applications/node--compressed-scroll-space.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: verified_on moved to 2026-10-31 after re-checking citations. Every quoted line anchor re-fetched from revolist/revogrid at the pinned commit 8b606d6 resolved to the quoted text. The probe reads back an off-screen scroller and subtracts the guard; the e2e files it names exist at the commit."
    },
    "applications/node--export-escapes-for-its-consumer--revogrid.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: verified_on moved to 2026-10-31 after re-checking citations. Every quoted line anchor re-fetched from revolist/revogrid at the pinned commit 8b606d6 resolved to the quoted text. The replayed serialiser outputs were not re-executed; they follow from the quoted JSON.stringify fallback."
    },
    "applications/node--one-door-for-range-writes.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: verified_on moved to 2026-10-31 after re-checking citations. Every quoted line anchor re-fetched from revolist/revogrid at the pinned commit 8b606d6 resolved to the quoted text. The e2e range spec it names exists at the commit."
    },
    "applications/react--client-server-split.md": {
      "disposition": "clarify",
      "reason": "Re-verified 2026-10-31 at personas@61029d7ae0; verified_on moved and verified_against set to react@19. Every anchor moved to HEAD. The dated paragraph records that a controlled sort prop landed 2026-10-14, which contradicts the body's 'Where the split sits today' edge advice ('UnifiedTable cannot express today'). That sentence and its server-windowing remedy should be rewritten to name the controlled-sort route. Filter and search are still unapplied chrome."
    },
    "applications/react--loading-and-empty-states.md": {
      "disposition": "reverify",
      "reason": "Cites the pof tree at 824df6e2/5a5c36f9; ab_verdict rests on that change. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    },
    "applications/react--performance.md": {
      "disposition": "reverify",
      "reason": "Cites the goat tree; ab_verdict rests on that reading. Not reopened this run; the anchors and any measured result stand as of the document's own verified_on."
    },
    "applications/rust--pagination.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: every line anchor re-read in the personas tree at a7b34f56 (fn at :376, predicate :391, ORDER BY :392, doc comment :374-375, absent-half defaults :384-385, seed :399-420, list_events :349-367, sibling list_for_team_after exists); the sentence claiming SQLite lacks a row-value comparison now says SQLite supports it since 3.15.0 and the OR-expansion is an equivalent spelling; verified_on moved to 2026-10-31."
    },
    "table.md": {
      "disposition": "keep",
      "reason": "Chrome/body split, column model, row identity, body state table, count-carries-predicate and the accessibility posture agree with every technique. The sort-announcement claim matches the re-read screen-reader matrix (silent pairings still listed, page updated October 2026). The rate-column denominator rule landed 2026-09-23 is present."
    },
    "techniques/client-server-split.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the all-server cost line said \"debounced inputs, request cancellation (a stale response arriving late must not overwrite a newer one)\", contradicting filtering (text filters commit on an explicit act because a debounce is a guess; dropping a superseded response is the correctness rule and cancellation only a bandwidth optimization). It now names explicit commit for free-text inputs and latest-wins dropping, with cancellation as the optional optimization, and points at filtering."
    },
    "techniques/clipboard-range-round-trip.md": {
      "disposition": "keep",
      "reason": "Arithmetic re-derived: four rows by two columns is eight cells; a tab inside one value adds a cell, a line break inside another adds a row and a cell, giving five rows and ten cells. The quoting convention and the focused-table ownership rule hold."
    },
    "techniques/compressed-scroll-space.md": {
      "disposition": "keep",
      "reason": "The derivation (R = rows x height / ceiling, so every row addressable while rows <= ceiling) is arithmetic-correct within the document’s own use of \"thumb position\" for the physical scroll coordinate. The 46-pixel range (a few hundred thousand to a million rows) is consistent with ceilings in the tens of millions of pixels; the revogrid fallback is 16,000,000 with a 1,000,000 guard. Per-engine ceiling values were not re-measured, and the text deliberately hedges them."
    },
    "techniques/export-escapes-for-its-consumer.md": {
      "disposition": "keep",
      "reason": "Agrees with the OWASP CSV Injection page re-read 2026-10-31: triggers =, +, -, @, tab, carriage return, line feed and the full-width variants; \"There is no universal CSV sanitization strategy that is safe for all spreadsheet applications and all downstream consumers\"; Excel \"may remove quotes or escape characters ... when a file is saved and re-opened\"; the single-quote prefix sits inside the double-quoted field, i.e. guard then quote. 25/800 = 3.1% recomputed."
    },
    "techniques/filtering.md": {
      "disposition": "keep",
      "reason": "Entered versus applied, per-control commit, whole-predicate value, window reset and row clear on filter change, latest-wins with the loser’s failure dropped, and the intersect-at-read selection invariant are internally consistent and agree with loading-and-empty-states and async-ui-states. SC 4.1.3 Status Messages is level AA, as stated."
    },
    "techniques/grid-keyboard-model.md": {
      "disposition": "keep",
      "reason": "Matches the ARIA APG grid pattern re-read 2026-10-31: focus does not move at the right-most or left-most cell; Control+End goes to the last cell of the last row and \"may move focus to the last row in the DOM rather than the last available row in the back-end data\"; \"every cell contains a focusable element or is itself focusable\" with the non-functional header exception."
    },
    "techniques/loading-and-empty-states.md": {
      "disposition": "keep",
      "reason": "State machine, settle-before-empty, error and undecodable payload distinct from empty, the delay-survives-reduced-motion split and the per-axis refresh corollary all hold; the cross-link to windowing-vs-identifying-keys resolves. The 2026-09-02 stale-success/error lead is consistent with the existing rules (a different predicate clears; a failed refresh under the same predicate keeps rows with an ambient failure) and is not a correction."
    },
    "techniques/one-door-for-range-writes.md": {
      "disposition": "keep",
      "reason": "The triple-shaped door, its ordered steps and the report-what-was-written rule are coherent and consistent with clipboard-range-round-trip; the application’s two-event evidence re-resolved this run."
    },
    "techniques/pagination.md": {
      "disposition": "keep",
      "reason": "Re-read the two items the 2026-08-31 entry banked. \"Changing sort or filter invalidates the cursor\" is correct as written: a cursor is a position in one order under one predicate, so both invalidate it; the windowing-versus-identifying split decides what the visible rows and selection do, not whether the cursor survives. The closing \"window state ... restore or deliberately reset\" line does not prescribe one treatment for all four members, so it is not wrong; naming the split there would be an amendment, not a correction. Tuple-seek preconditions agree with the SQLite row-value page (row values compare left to right; a NULL term yields NULL)."
    },
    "techniques/performance.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the content-visibility paragraph now says skipped content stays in keyboard order and find-in-page by the specification, and is meant to stay reachable to assistive technology but may be omitted from the accessibility tree where an engine cannot represent it without the skipped layout (CSS Containment 2 §4.5); the table precondition now separates layout and paint containment (no effect on internal table boxes other than cells) from size containment (no effect on any internal table box), so a per-cell intrinsic-size estimate does nothing. The rest of the ladder is unchanged."
    },
    "techniques/sorting.md": {
      "disposition": "keep",
      "reason": "Total order with identity tiebreaker, same comparator on both tiers, reader locale and the announce-the-change rule all hold; the cited matrix still lists VoiceOver/Safari and TalkBack as silent on sort (re-read 2026-10-31). Open leads L330/L334 (rank versus position), L336 (export the derived rows) and L353 (implicit order under a stable sort) remain amendments owing primary sources, not clarify items."
    }
  }
}
```

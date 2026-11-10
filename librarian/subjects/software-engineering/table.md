---
subject: table
domain: software-engineering
last_touched: 2026-11-10
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

## 2026-11-10 - /deepen loop (run `filler-deepen-20261110b`, /shift filler)

Dispatched by the librarian scan (32 points, 8 consumer deviations from a 26-day-old installation report; the 2026-11-09 fleet map holds table deviations in personas 19, pof 5, gravitone 1 - conform work against rules the corpus already has, listed and not chased).

### Round 1 (survey round)

**Not dry.** The four leads the 2026-10-07 run left open only because its egress was denied now have their primaries, fetched today, and landed as corrections:

- `sorting` (L330 + L334): a tiebreaker decides *position*, never *rank*; peers share a displayed rank, a number minted from the full order is a row number, and the shared number is the tie's disclosure (PostgreSQL window-functions page: every ranking function gives the same answer for all rows of a peer group).
- `sorting` (L353): before appending identity, name the implicit second key a stable sort carried from pre-sorted input, and test with reversed input (MDN: the array sort is required to be stable since the 2019 edition). The cited project commits stay unverified; the rule rests on the spec and the 10-07 local reproduction.
- `filtering` (L336): in the all-client regime the export takes the filtered and sorted rows before client windowing (a grid vendor's CSV export default and a headless table library's row-model order, both opened today).

Confirmed and left untouched: `compressed-scroll-space`'s "tens of millions of pixels, differs by engine" and its 46-px-row arithmetic (a 2025 measurement article and an open browser bug); `performance`'s content-visibility support claim (MDN, Baseline since 2024); the golden path's "1.2 GB" is a units example, not a measurement. Blind lane 4 of 5 tested predictions reached by the web lane; the miss was the "1.2 GB" figure.

Applied: three `unapplied` rows (personas and gravitone read in place; no merit rank over ties, no sort leaning on carried order, no client-side export). Leads **L330, L334, L336, L353 closed**; the project files each cited remain unverified (those checkouts are not on this machine).

Banked: one engine's line-height test laid out near half its declared ceiling; if a scroll container does the same the row bound for that engine roughly halves. Return: a scroll-container probe in a current build of that engine, or the engine's bug tracker confirming it. Still open from 2026-10-14: pinned partitions, column auto-size, grouping x sort x filter.

### Round 2 (probe round, same run)

**Dry.** Ten training-data-first probes, the qualifier-edge grep included (round 1 had not run it): `grid-keyboard-model`'s edges, grid-end keys, paging, every-cell focus and its header exception, the edit/escape pair and application-mode reading all match the W3C grid pattern opened today; pagination's tuple and absent-value claims, the placeholder delay band and the golden path's "300 milliseconds" held. Declined: "a numbered pager requires a total" is over-absolute in the letter (only a last-page or of-N control needs it) and a qualifier would change no decision. **Closed:** the 2026-08-31 question whether `pagination`'s "changing sort or filter invalidates the cursor" contradicts the windowing/identifying split - it does not; cursor validity and what happens to rows on screen are separate questions. dry_streak 1.

### Round 3 (final probe round, same run)

**Not dry.** `applications/next--sorting.md` prescribed appending identity straight after the activity value, which round 1's implicit-key rule makes wrong: its own evidence shows ties were carried by overall score descending through a stable sort. The fix now names that key before the final term; `verified_on` unmoved (the tree is not on this machine, and the paragraph says so). Confirmed: the export technique's formula-trigger set matches the current injection guidance page (the blind lane was the stale one), content-visibility having no effect on a native table row matches the containment spec. Currency: no table application expired, at risk or drifted. Applied: `unmeasurable` (one recorded case, tree not reachable). dry_streak back to 0. **Not saturated**: the loop ended at its cap of 3 with rounds 1 and 3 non-dry.

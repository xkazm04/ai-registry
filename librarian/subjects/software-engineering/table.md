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

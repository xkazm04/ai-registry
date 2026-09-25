---
subject: table
domain: software-engineering
last_touched: 2026-09-23
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

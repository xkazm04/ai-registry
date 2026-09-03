---
subject: table
domain: software-engineering
last_touched: 2026-08-31
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

---
layer: application
type: application
subject: table
technique: filtering
stack: next
status: forged
verified_on: 2026-09-23
verified_against: next@16
applied: code
ab_verdict: better
proof: ab-paired
---

# Two filtered tables in one tree — one that named its applied predicate, and one that forwards it an axis at a time

Read in the `ascent` tree (Next.js 16.3.3, React 19.2.4, Prisma 6.19.x) at HEAD
`62c252dd` on 2026-09-20; every citation below was re-resolved against HEAD
`aff9991a` on 2026-09-23 (one anchor had moved), and the selection section near
the end was added from that reading. The last section records the change that
section led to, applied and measured the same day at `5f17b6c5`; the selection
section's `DecisionTable.tsx` anchors describe the tree before it.

The repo is worth reading on this technique because it contains both halves of
the same lesson, in two features that never met. The audit-trail viewer holds
an explicit **applied** predicate and derives everything from it, including the
export that motivated the change. The repositories leaderboard, fixed for the
same class of bug two months earlier, derives its export from the predicate one
axis at a time — and still carries a comment asserting it cannot disagree with
the table beside it.

## The applied predicate as a named value

`src/features/admin/audit/useAuditLogFilters.ts` keeps the four live control
values as ordinary state (`:21-24`) and then keeps a fifth thing beside them:

```ts
// useAuditLogFilters.ts:29
const [applied, setApplied] = useState<AuditLogFilters>(NO_FILTERS);
```

The comment above it (`:25-28`) is the technique's entered/applied split stated
as a defect report: the CSV anchor "was rebuilt from raw input state on every
keystroke, so typing an actor without pressing Apply exported a filter set the
on-screen table had never shown (filed evidence ≠ reviewed rows)". For an audit
trail that is the sharpest possible framing — the export *is* the evidence, and
an unreviewable export is worse than no export.

Three things read `applied` and nothing else: the request (`:84`, `:87`), the
export href, and the load-more continuation.

```ts
// useAuditLogFilters.ts:91
const csvHref = `/api/audit?${buildQs(applied).toString()}&format=csv`;
```

`buildQs` (`:38-45`) takes the whole predicate object rather than four
parameters, which is the shape the technique asks for: adding a fifth filter
axis does not require remembering the export.

## Mixed commit points, composed correctly

The bar has both control shapes and gives each the right commit point. The
action `<select>` commits on change (`:74-79`); the two date inputs and the
actor text field commit on submit (`:80-85`), through a real `<form>` so the
enter key works — `AuditLogFilterBar.tsx:38-39` records that keyboard users
"previously had no way to apply from a text input — the field appeared to *do
nothing*".

The load-bearing line is what the auto-committing control composes onto:

```ts
// useAuditLogFilters.ts:76
const f = { ...applied, action: value };
```

`...applied`, not `{ action, since, until, actor }`. The comment (`:70-73`)
states the rule outright: "mixing in typed-but-unapplied inputs would silently
apply filters the user never confirmed". This is the one detail most mixed
filter bars get wrong, and it is here as a deliberate, argued decision.

## Latest-wins, including the paths people forget

`reqId` is a ref-held monotonic counter (`:36`), taken at the top of every load
(`:48`) and compared on return. What makes it an exemplar rather than a token
is that all three return paths are guarded:

```ts
if (myReq !== reqId.current) return;              // :58  the stale rows
...
} catch (e) { if (myReq !== reqId.current) return; // :63  the stale failure
} finally { if (myReq === reqId.current) setLoading(false); } // :66  the stale flag
```

A superseded rejection cannot paint an error banner belonging to a predicate
nobody is asking about, and a superseded response cannot switch the in-flight
indicator off while the live request is still out. The comment at `:32-35`
names the defect the counter closes, and it is the append case rather than the
replace case: "appending a *Load more* page from a superseded filter (duplicate
/ foreign `e.id` rows, possible React key collisions)".

Replacement versus append is itself correct — `:60` branches on the `reset`
flag, and every commit path calls `load(true, null, f)`, so a new predicate
resets the cursor and replaces the list rather than extending it.

## Where this surface falls short of the standard

- **The controls disable themselves during every fetch.** The select, the
  Apply button (`AuditLogFilterBar.tsx:46`, `:69`) and Load more (`AuditLogTable.tsx:123`)
  all carry `disabled={loading}`. The token already makes the race safe; the
  disable makes the chrome conditional on data — the one thing the table's
  chrome must not be — and on a slow round trip the bar reads as broken. The
  two mechanisms were added for the same race, and only one of them needed to
  be.
- **A filter change dims the rows instead of clearing them.**
  `AuditLogTable.tsx:52-55` wraps the body in `aria-busy` plus `opacity-50`
  for *every* load, and the comment (`:49-51`) reasons its way to the wrong
  conclusion knowingly: dim them "so the user knows the table is refreshing
  instead of trusting rows that no longer match the filter". A dimmed answer
  is still an answer. The standard's split — keep the rows for a page or sort
  change, clear them for a filter change — is a distinction this surface does
  not draw, because `loading` is a single flag with no memory of *which* axis
  moved.
- **Empty is asserted before the response settles.** `AuditLogTable.tsx:67-71`
  renders the empty state whenever `entries.length === 0` and swaps only the
  *body* string to "Loading…", leaving the title "No audit entries" on screen
  while the fetch is out. The title is the claim; changing the subtitle under
  it does not retract it.
- **There is no clear-all.** The action select carries an "All actions" option
  (`auditActions.ts:165-168`), but the two dates and the actor must each be
  blanked by hand and then submitted. Nothing on the surface says which axis is
  still narrowing the set.
- **The count is a loaded count, and says so.** `{entriesShown} shown` (`AuditLogFilterBar.tsx:80`) is the
  honest bound taken all the way: there is no total in this feature, on screen
  or in the response (`getAuditLog` returns `entries` + `nextCursor`, nothing
  more). The word is "shown", not "results", which is the whole reason it does
  not lie.

## The counter-finding: an export that forwards two axes of three

`src/features/standing/repositories/RepositoriesLeaderboardPanel.tsx` filters
its leaderboard on three independent axes. Two scope the query itself —

```tsx
// RepositoriesLeaderboardPanel.tsx:39
const rollup = await getOrgRollupShared(slug, undefined, segmentId, techGroupId);
```

— and the third is applied in memory afterwards (`:67`, a `?posture=` filter
over each row's latest scan). Its count is predicate-bound and correct: `:94`
renders `${visible.length}/${rollup.repoCount} repos · <posture> posture` under
a filter and a different sentence without one.

Its export is not. The href at `:102` is assembled field by field:

```tsx
href={`/api/org/repositories?org=${...}&format=csv${posture ? `&posture=${...}` : ""}${activeStack ? `&stack=${...}` : ""}`}
```

`segment` is absent — and not merely unforwarded. `src/app/api/org/repositories/route.ts`
has no segment parameter at all:

```ts
// route.ts:34
const rollup = await getOrgRollup(org, undefined, null, techGroupId);
```

That `null` is the segment argument. So with a segment selected, the table
shows that segment's repositories and "Export CSV" downloads the whole fleet —
posture- and stack-scoped, segment-unscoped — from a surface whose header
count correctly says how few repositories are on screen. The CSV even carries
each repository's segment memberships as a column (`route.ts:41`, `:60`): the
concept is present as data and absent as a predicate.

Both comments claim otherwise. The page's (`:99-100`) says the export "can
never contradict the filtered table it sits next to"; the route's header
(`:1-7`) says it understands "the SAME posture/stack query params as the
Repositories tab, so the export reflects exactly what the filtered tab shows".
Neither is lying about what it forwards. Both enumerate, and the enumeration is
the bug.

## Reading the pair

The repositories export was fixed once already, and the fix is named in both
files: `repositories-segments #3`, "it previously always exported the full
fleet while the header said *12 of 80 repos in At risk*". That report came from
the posture axis, so the fix threaded the posture axis — and the stack axis
that arrived with it — and stopped. The segment axis, which was already there
and which is the tab's organizing concept, was never in the report, so it was
never in the fix.

That is the shape of the failure this technique exists to prevent, and it
answers a question the audit-log feature's code does not have to ask: **the
protection is not "forward the filters", it is "derive from one value".**
`buildQs(applied)` is immune to the next axis by construction. A template
literal with two ternaries in it has to be remembered, and the surface that
sits beside it has already demonstrated what gets remembered — the axis
somebody filed a bug about.

## Selection across a filter change — both answers, one tree

The same tree also holds both realizations of the technique's record-keyed
state rule, and again in two features that never met.

The repositories leaderboard intersects at read time.
`src/features/standing/repositories/useRepoLeaderboard.ts:51-64` keeps the raw
`rawSelected` set and derives `selected` as its intersection with the visible
rows' names in a `useMemo`; the comment argues against the effect-based prune
in the technique's own terms (an extra cascading render, "a frame where the
stale tick is still live") and records why the raw set survives — "navigating
back to a wider filter restores the ticks the user made there".

The shared `DecisionTable` does the opposite, on purpose and without saying
so to the user. Its props declare the pair
(`src/components/org/shared/DecisionTable.tsx:59-62`): `rows`, "already
filtered", and `allRows`, "every row a selection may reference, including rows
the current filters hide". The batch reads the second:

```ts
// DecisionTable.tsx:88
const picked = (p.allRows ?? p.rows).filter((r) => p.selected.has(p.rowId(r)));
```

`picked` feeds the sticky bar's count (`:180-183`), each action's
per-action count (`:195`) and each action's payload (`:108`). Two ledgers pass
the pair — `ProposalsWorklist.tsx:147-148` (`rows={shown}`,
`allRows={rows}`) and `LessonsWorklist.tsx:112-113` — so a row ticked under
one filter is still in the batch after the filter hides it. Gathering across
filters is a legitimate triage workflow, and the technique allows it in its
disclosed form. This is not that form: the bar prints `picked.length
selected` (the Proposals summary, `ProposalsWorklist.tsx:35-52`, adds repos,
loop count and projected points, all computed over the same `picked`), and
nothing on it says how many of those rows the current filter is hiding. The
number the user reads before pressing the action is right about the payload
and silent about where it came from.

Select-all, by contrast, is scoped to the shown rows (`:89-91`, "the same rule
the row checkbox enforces"), so the component's two sights disagree: the
header's "all" means all *shown*, the bar's count means all *ever ticked*. The
tell for an auditor is the prop pair itself — a table taking the shown rows
and the full set, and computing its payload from the full one — and the fix
the technique names is small: either derive `picked` from `rows`, as the
leaderboard does, or keep `allRows` and print the hidden figure beside the
count.

The detectable symptom, for anyone auditing a tree for this: an export href
assembled from more than one filter variable, in a component that also renders
a predicate-bound count. The count is derived from the filtered collection and
is therefore automatically right; the href is derived from the filter
*variables* and is right only for the axes someone listed. When the two sit
four lines apart, as they do at `:94` and `:102`, the correct one vouches for
the incorrect one in review.

## Applied: the disclosed form, and why the bar total was not enough

The change took the disclosed branch rather than the default. Both callers
pass `rows={shown}` with the full set on purpose, so gathering a batch across
filters is a workflow two ledgers depend on. Deriving `picked` from `rows`
would have removed it to fix a sentence. The payload was left as it was, and
the count was made to carry the reach: the bar reads
`6 selected · 3 hidden by the current filter` beside a `drop hidden` control
that removes only the hidden ticks. That is the technique's own example.

**The seam was picked because it could falsify that example.** This
component scopes each action with `appliesTo`, so one selection gives each
button a different share of it: `Resolve` takes only follow-ups, `Approve`
only loop proposals. The bar's hidden figure is a total over the whole
selection. The question was whether a total names the hidden records of an
action that receives only part of the selection.

It does not. The paired fixture was 6 rows, a filter showing 3, all 6
ticked, and three actions (one unscoped, two scoped by kind). That gives 6
hidden-row deliveries: 3 to the unscoped action, then 1 and 2 to the scoped
ones. The measurable was the number of those deliveries that the text on
screen does not let the user count exactly:

| Arm | What the bar and buttons say | Undisclosed hidden deliveries |
| --- | --- | --- |
| A, tree as it was | `6 selected`, `Dismiss 6`, `Resolve 3`, `Approve 3` | 6 of 6 |
| B-bar, the technique's example | adds `· 3 hidden by the current filter` | 3 of 6 (both scoped actions) |
| B, as shipped | adds `(1 hidden)` / `(2 hidden)` on each action that reaches one | 0 of 6 |

The floor held in all three arms. Every action received the same record ids,
select-all still toggled only the shown rows, and with no selected row
hidden the labels were unchanged (`Dismiss 2`, `Resolve 1`, no "hidden"
anywhere). The instrument is
`src/components/org/shared/DecisionTable.hidden.dom.test.tsx`, kept in the
tree. Its first run at A was an instrument fault and was not counted. The bar
disables its buttons while an action runs, so clicks that were not awaited
captured only the first action's payload.

What this adds to the technique is that the disclosure belongs on every
count the user reads before firing, not only on the selection's size. Where
the actions split the selection, the per-action count is the one read
before firing, and a hidden total beside it is an upper bound, not a name.

What the change does not do: a `countless` action (one that opens a dialog,
`Generate fix prompt →`) prints no count and no hidden figure, and leaves
disclosure to its dialog. A row settled inline while ticked stays in the
selection and in the next batch, because `picked` is filtered by
membership, not by `isSelectable`. That is a separate reach defect of the
same kind, left for the owner.

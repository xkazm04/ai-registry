---
layer: application
type: application
subject: table
technique: filtering
stack: next
status: forged
verified_on: 2026-09-20
verified_against: next@16
---

# Two filtered tables in one tree — one that named its applied predicate, and one that forwards it an axis at a time

Read in the `ascent` tree (Next.js 16.3.3, React 19.2.4, Prisma 6.19.x) at HEAD
`62c252dd`; every citation below was resolved against that tree on 2026-09-20.

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
  (`auditActions.ts:163-166`), but the two dates and the actor must each be
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

The detectable symptom, for anyone auditing a tree for this: an export href
assembled from more than one filter variable, in a component that also renders
a predicate-bound count. The count is derived from the filtered collection and
is therefore automatically right; the href is derived from the filter
*variables* and is right only for the axes someone listed. When the two sit
four lines apart, as they do at `:94` and `:102`, the correct one vouches for
the incorrect one in review.

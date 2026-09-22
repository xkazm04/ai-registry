---
layer: application
type: application
subject: table
technique: sorting
stack: next
status: forged
verified_on: 2026-09-20
verified_against: next@16
---

# A leaderboard header that announces its state correctly, over a comparator whose totality lives in two other files

Read in the `ascent` tree (Next.js 16.3.3, React 19.2.4) at HEAD `62c252dd`;
every citation below was resolved against that tree on 2026-09-20.

The repository leaderboard is a three-column sortable table whose *interaction*
layer is unusually close to the standard and whose *comparator* is correct only
because of two facts written somewhere else. It is a good specimen precisely
because the two halves come apart so cleanly: a reviewer reading the header
component would sign off on the sort, and nothing in that file says what makes
the order total.

## What the header gets right

```tsx
// RepoLeaderboardParts.tsx:99-108
<th className={thClass} aria-sort={active ? (dir === -1 ? "descending" : "ascending") : undefined}>
  <button type="button" onClick={onClick} title={title} className={`focus-ring rounded ...`}>
    {label}
    {active ? (dir === -1 ? " ▼" : " ▲") : ""}
  </button>
</th>
```

Every clause of the technique's announcement rule, in ten lines. The sort state
is on the header *cell*, in the accessibility layer, not only in a glyph. The
affordance is a real `<button>` — keyboard-reachable, focus-visible through the
shared ring class — rather than a click handler on a `<th>`. And because both
`aria-sort` and the glyph are gated on `active`, a table single-sorting can only
ever draw one indicator: the "arrows on several headers while single-sorting"
defect is unreachable here by construction (`:152-175`, three headers, one
`active` predicate each).

The cycle is also right where most implementations are not
(`useRepoLeaderboard.ts:43-44`):

```ts
const cycleSort = (key: SortKey) =>
  setSort((s) => (s?.key !== key ? { key, dir: -1 } : s.dir === -1 ? { key, dir: 1 } : null));
```

A first click sorts descending — the correct expectation for magnitudes — a
second reverses, a third clears. The standard permits a third state only if it
returns to a *named default* rather than to "unsorted", and the comment at
`:37-39` names it: "default (the incoming overall-maturity order)". That order
is a real product decision made upstream, not storage order, so `null` here
means "the default sort", not "no sort".

One more detail worth transplanting: the direction flip is `(valueX - valueY) * d`
over a stable sort, not a `reverse()` of the ascending result. Ties therefore
keep the same relative order in both directions. The sibling application
`react--client-server-split` records the opposite choice in another tree —
a stable sort reversed for `desc`, inverting tie order — as a shortfall; this
is the same decision made correctly.

Selection survives all of it. Rows are keyed by `fullName`
(`RepoLeaderboard.tsx:63`), each row is handed its own boolean rather than the
selection set (`:68`), and the selection state itself is a set of `fullName`
(`useRepoLeaderboard.ts:32`, `:70-82`), with the comment at `:37-39` stating the
consequence: "Selection state is keyed by fullName, so re-sorting the rows never
disturbs which repos are ticked."

## Where it falls short

**The absent-value home holds in one direction only.**

```ts
// RepoLeaderboardParts.tsx:74-80
/** Sort value for an activity column; a null-activity row sorts to -1 so it always trails a real one. */
export function activityValue(a: RepoActivity | null, key: SortKey): number {
  if (!a) return -1;
  ...
```

The doc comment's claim is false for half of the cycle. `-1` is the minimum of
the value space, so an unmeasured repository trails under `dir: -1` and *leads*
under `dir: 1` — the ascending state the header offers on the second click.
The standard's requirement is one declared home *regardless of direction*,
because the point of the rule is that missing data never acquires the meaning
of an extreme; a sentinel gives it the meaning of the minimum instead, which is
a different claim that happens to look right in the default direction.

The second, quieter cost of the sentinel: it lives inside the comparison's own
domain. It is safe today only because all three metrics are counts that cannot
go below zero. A signed measure in a fourth activity column — a delta, a trend,
a change against a baseline — would collide with it, and the collision would
present as a few rows sorting oddly rather than as an error. The upstream
default order uses the same idiom for the same reason
(`RepositoriesLeaderboardPanel.tsx:58`, `(b.latest?.overall ?? -1) - (a.latest?.overall ?? -1)`),
so the pattern is established rather than incidental.

**The comparator is not total, and the totality it has is inherited.** Nothing
in the sort appends an identity tiebreaker. Ties in an activity value — common,
since the columns are small integers and a fleet has many repositories at zero
— are resolved by the stability of the platform's sort over whatever order the
rows arrived in. That incoming order *is* deterministic, but establishing it
requires three files: the panel sorts by overall score descending
(`RepositoriesLeaderboardPanel.tsx:58`), which is stable over the query's
`orderBy: { fullName: "asc" }` (`src/lib/db/org-rollup.ts:773`), and `fullName`
is unique. So the effective order is total and reproducible — by accident of
composition, with no file asserting it.

Three independent changes break it silently and none of them looks like a sort
change: dropping the `fullName` ordering from the query because a later sort
"makes it redundant", introducing a non-stable sort anywhere in the chain, or
adding a second source of rows with its own order. The standard's one-line fix
— append the row identity as the final comparison term — costs nothing and
makes the property local to the comparator that needs it.

**Sort state is neither navigational nor persisted, on a table whose filters
are both.** The sort lives in component state (`useRepoLeaderboard.ts:40`) and
dies with the mount. Meanwhile the *same table's* three filter axes are
entirely URL-driven: the posture filter is a query parameter
(`RepositoriesLeaderboardPanel.tsx:65-67`), the chips are `<Link>`s that
compose the scope into the href (`:113-131`), and the segment and stack scopes
ride the same query string. So a shared link to this leaderboard reproduces the
filter exactly and loses the sort entirely — the reader opens a differently
ordered table and has no way to know.

That asymmetry is the finding, more than either half is. A long-lived work
surface that has already decided its filter state is shareable has answered the
question for sorting too; leaving one axis in component state is not a lighter
policy, it is two policies on one table, and the user experiences it as the
surface forgetting half of what they did.

**A distributed `dir` that most columns have no business holding.**
`RepoLeaderboardParts.tsx:133` computes `const dir = sort?.dir ?? -1` once and
passes it to all three headers. It is harmless — the inactive two never render
it — but the state model is `(key, direction) | null`, and the component hands
a direction to two columns that do not have one. The model that survives review
passes the whole sort state and lets each header ask whether it is the sorted
one, rather than pre-splitting a value that only one of them may use.

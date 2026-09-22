---
layer: application
type: application
subject: search
technique: query-parsing
stack: next
status: forged
verified_on: 2026-09-20
verified_against: next@16
---

# Ten search boxes, ten matching policies, and the door that was never needed

Read in the `ascent` tree (Next.js 16.3.3, React 19.2.4, Prisma 6.19.x) at HEAD
`62c252dd`; every citation and every count below was resolved against that tree
on 2026-09-20, and the counts are mine rather than transcribed.

This tree is worth reading on this technique because it is the clean case of the
door's two jobs coming apart. The **injection** job is closed structurally and
everywhere, for free, by the query builder. The **policy** job — folding,
multi-word semantics, which fields, what a match across fields means, what
bounds the expression — is open at every one of ten call sites, and no two of
them agree. Nothing here is unsafe. Everything here is undecided.

## The escaping half, closed by the builder

Both server-side searches compose a predicate object rather than an expression:

```ts
// src/lib/db/org-memory.ts:209-215
and.push({
  OR: [
    { content: { contains: search, mode: "insensitive" } },
    { source: { contains: search, mode: "insensitive" } },
    { namespace: { contains: search, mode: "insensitive" } },
  ],
});
```

`src/lib/db/org-skills.ts:170-175` does the same over `name` + `description`.
The user's text is a *value* bound into a field predicate; there is no operator
in it that can survive into the emitted statement, and neither search path
builds a statement by string concatenation. A hyphen, a quote, a percent sign
and a page of pasted prose are all the same kind of thing to this code, which
is exactly the property the technique's first failure class asks for.

That is also why no door exists. Nothing in this tree ever had to escape
anything, so nothing ever had to be funnelled through one function — and the
second half of the door's contract went with it.

## Where user text meets stored text: ten places

Counted on 2026-09-20 by asking the question the technique asks — *where is
user text compared to stored text* — rather than the usual one about escaping:

| where | shape |
| --- | --- |
| `src/lib/db/org-memory.ts:209-215` | OR of three `contains` / `insensitive` field predicates |
| `src/lib/db/org-skills.ts:170-175` | OR of two `contains` / `insensitive` field predicates |
| `src/components/org/SecurityFindingsTable.tsx:81`, `:86` | OR of three `toLowerCase().includes` per row |
| `src/components/org/followups/followupsModel.ts:140`, `:147` | four fields template-joined, then one `includes` |
| `src/features/inflight/lessons/lessonsModel.ts:33`, `:38` | three fields template-joined, then one `includes` |
| `src/features/inflight/proposals/proposalsModel.ts:107`, `:115` | three fields template-joined, then one `includes` |
| `src/features/standing/repositories/useRepoSegmentsPanel.ts:49-52` | one field, `includes` |
| `src/features/shared/registry/RegistryRepoPicker.tsx:62-66` | one field, `includes` |
| `src/components/launch/fleetMapDerive.ts:145` (needle lowered by `FleetMap.tsx:200`) | one field, `includes` |
| `src/features/shared/surfaces/DataPlayground.tsx:21-22` | two fields template-joined, then one `includes` |

Deliberately excluded, and the exclusions are the reason the number is ten and
not thirteen: `src/lib/db/loop-runs-read.ts:328` is an `equals` on a repository
name (a lookup, not a search), and the `toLowerCase().includes` calls in
`src/app/api/billing/checkout/route.ts:35`, `.../portal/route.ts:24` and
`src/lib/analyze/pulls.ts:191` probe a request header and a commit message, not
a user's query.

There is no shared matcher, and there is no place where one could be added
without touching all ten.

## The four decisions that came out differently

**1. What a multi-field match means.** Three sites OR per-field predicates, so
a hit lies inside some field. Six join the fields into one string first:

```ts
// src/components/org/followups/followupsModel.ts:147
if (q && !`${r.title} ${r.rationale} ${r.repo} ${r.dimLabel}`.toLowerCase().includes(q)) return false;
```

A query that ends one field and begins the next matches a row in which no
field contains it — search `protection rules` and a row titled "Add branch
protection" whose rationale opens "Rules are missing" is a hit, across the
space the template inserted. It is not a security problem and it is not
frequent; it is a different product than the sibling three lines away, and
nothing in either file records that a choice was made.

**2. Where the policy lives.** `makeMatcher` is the one function in the tree
named for matching, and it does not own the policy:

```ts
// src/components/launch/fleetMapDerive.ts:145
if (q && !r.fullName.toLowerCase().includes(q)) return false;
```

Only the stored side is folded. The needle must arrive already lowered, which
it does — from `FleetMap.tsx:200`, the sole caller, in a screen component. The
pure, tested, React-free module holds the loop; the screen holds the rule. A
second caller is case-sensitive and the unit tests beside it
(`fleetMapDerive.test.ts:120`) pass, because they pass a lowered needle too.

**3. Trimming.** Nine sites `trim()` the query. `DataPlayground.tsx:22` does
not, and lowercases the needle once per row rather than once per query — so in
that one surface a trailing space is a filter.

**4. Folding beyond case.** None of the ten folds diacritics. `toLowerCase()`
folds case; Prisma's `mode: "insensitive"` is the store's case-insensitive
comparison and does not fold accents, and the schema declares no unaccented or
trigram index to change that (`prisma/schema.prisma`, whose `OrgMemory` and
`OrgSkill` carry only relational and equality `@@index` entries —
`:1356-1359`, `:1220-1222`). `OrgMemory.content` is free human prose up to
20KB (`:1328`); accented input is ordinary there, and it silently misses in
every one of the ten. This is the standard's own headline claim, corroborated
in a tenth independent codebase.

And one decision nobody made anywhere: **every one of the ten treats the query
as a single contiguous substring.** `branch protection` matches only where
those two words are adjacent in that order; `protection branch` matches
nothing. No site tokenizes, so the technique's "whether multiple words must all
match" was answered ten times by `includes` and `contains` rather than once by
a person.

## The bounds the door would have carried

`search` travels from the query string into the predicate with no length
floor and no ceiling (`src/app/api/org/memory/route.ts:57`,
`src/app/api/org/skills/route.ts:39`). A single character matches most of the
corpus; a pasted page becomes one unbounded substring comparison. Neither is
dangerous here — a bound substring match is cheap and the tenant predicate
bounds the scan — but both are the door's contract, unowned.

Truncation is the sharper gap. The memory list caps silently:

```ts
// src/lib/db/org-memory.ts:231
take: Math.min(Math.max(1, opts.limit ?? DEFAULT_LIMIT), 500),
```

`DEFAULT_LIMIT` is 200 (`:92`), the client never sends a limit
(`src/features/shared/memory/memoryLibraryApi.ts:35-40`), and the response
carries `{ memories, namespaces }` and no total — so the surface cannot say
"200 of N" even if it wanted to, and a search in an org past 200 matches is
presented as the whole answer. `listOrgSkills` is the same decision's other
face: `org-skills.ts:184-188` calls `findMany` with no `take` at all. One
capped without disclosure, one uncapped without a plan; the number 200 appears
in neither surface.

## What this tree does better than the standard's examples

The memory list's race handling is the technique's as-you-type rule done
completely:

```ts
// src/features/shared/memory/useMemoryLibrary.ts:78-83
const ac = new AbortController();
const t = setTimeout(() => void refresh(ac.signal), 250);
return () => { clearTimeout(t); ac.abort(); };
```

The comment at `:69-72` separates the two mechanisms exactly as the golden
path does — "the debounce covers the TIMER; the AbortController covers the
request the timer started" — and names the defect it closed: two reads in
flight, the slower one winning the `setState`, rows on screen for a filter the
user had left while the controls showed the new one. The 250ms sits just under
the 300ms the golden path calls out as having already spent three times the
instant budget.

## Where it falls short: the failure spelled as the previous answer

```ts
// src/features/shared/memory/memoryLibraryApi.ts:41
if (!res.ok) return null;
```

```ts
// src/features/shared/memory/useMemoryLibrary.ts:55-60
if (body) { setMemories(body.memories ?? []); ... }
} catch {
  /* keep the current list on a transient fetch error (an abort included) */
}
```

An error state exists (`:34`) and `refresh` never sets it. So a failed list
read leaves the previous query's rows on screen, under controls describing a
different query, with no marker and no retry — the outage rendered as an
answer. The reasoning is visible in the comment and it is half right: an
aborted request must indeed leave the list alone, because a newer one is
already in flight. A non-OK response is not that. The two are collapsed into
one `null` return at the API boundary, and the hook cannot tell them apart
afterwards — which is why the correct fix is at `memoryLibraryApi.ts:41`,
where the difference is still known, and not in the hook.

This is the third spelling of a failure, and the worst: an empty pane at least
invites suspicion, and a plausible list of rows does not.

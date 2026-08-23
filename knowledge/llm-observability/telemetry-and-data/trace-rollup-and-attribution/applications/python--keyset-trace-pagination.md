---
layer: application
type: application
subject: trace-rollup-and-attribution
technique: keyset-trace-pagination
stack: python
status: forged
verified_on: 2026-08-23
source: Arize-ai/phoenix
---

# Keyset trace pagination in Phoenix's trace and span GraphQL API

Arize-ai/phoenix, released version `arize-phoenix` 20.3.0 (`src/phoenix/version.py:1`,
`.release-please-manifest.json:1`), read at commit `9478f95` (2026-08-21). Spans live in
SQLite or PostgreSQL; trace list and trace detail are Relay connections over Strawberry
GraphQL. Every path below is inside that tree; the harnesses ran on Python 3.12.1 with no
network, from the worker's scratch namespace.

## The cursor is a composite, and the sort key is chosen to be nearly immutable

The trace list — one representative root span per trace, newest first — is a dedicated
path selected at `src/phoenix/server/api/types/Project.py:620` and implemented in
`_paginate_span_by_trace_start_time` (`:2866`). It orders on `(traces.start_time,
traces.id)` (`:2917-2920`) and pages with a row-value comparison against exactly that pair
(`:2950-2955`) — the technique's composite cursor with the id tie-break, verbatim. The
trace *detail* list pages on the span rowid alone (`types/Trace.py:298`, `:310`), which
the "any stable unique column" clause permits.

**Finding, against the technique.** The technique names the cursor column as the trace's
*latest* event time and calls the consequence a benign re-appearance clients dedupe away
("clients deduplicate by id, not by assuming disjoint pages"). Phoenix pages on
`Trace.start_time`, and its ingest moves `start_time` only *earlier*, `end_time` only
*later* (`db/insertion/span.py:42-45`). Under DESC traversal those directions are not
symmetric: a key that moves later carries a row from behind the cursor to in front of it,
where `< cursor` can never reach it again — a silent skip, the exact offset-pagination
failure keyset exists to prevent. A key that moves earlier can only carry a row backward
across the cursor, which duplicates. Harness 2: latest-activity keying lost a trace,
start-time keying lost none. The rule wants restating as **the cursor column must
be immutable, or mutable only in the direction that duplicates**; the current text
prescribes the direction that skips, then attributes to it the other one's failure mode.
Phoenix's key is not immutable either (`span.py:44-45`), so dedupe-by-id is still needed,
and newest-*started* is not newest-*active* — the ordering cost it pays for exactness.

## Cursor predicate and content predicates stay independent

Confirmed on both paths. In the general span path the time window (`Project.py:637-641`),
trace-grain filter (`:642-651`), root-span join (`:652-660`) and span filter DSL
(`:661-663`) are each appended to the statement and the cursor predicate appended after
them (`:671-687`), touching none; in the trace path the filters land on the traces CTE
(`:2928-2943`) and the cursor after (`:2946-2955`). The corollary holds structurally: a
new filter never touches the pagination path.

**Finding: the window's grain changes with an unrelated argument.** One `timeRange` means
"spans whose start is in the window" in the general branch (`:639`, on
`models.Span.start_time`) and "traces whose start is in the window" in the branch taken
when `rootSpansOnly` is set and the sort is by start time (`:2930`, on
`models.Trace.start_time`) — the coexisting unstated readings the technique forbids. The
sibling field `sessions` carries a written interval-overlap disclosure (`:719-724`,
`js/app/schema.graphql:3002`); `spans` carries no description at all (`:605`). The team
owns the pattern and did not apply it where the readings diverge.

## The total is not the page

Confirmed, in a cleaner shape than the technique describes. `recordCount` (`:415`) and
`traceCount` (`:440`) take the list's content predicates — time range, filter condition,
session filter condition — and no cursor, as separate opt-in fields on the same GraphQL
type as the list, so infinite scroll never pays for the scan and the argument sets stay
visibly parallel rather than synchronized by comment. Both are served from a one-hour TTL
cache keyed on (project, interval, filters) (`dataloaders/record_counts.py:60`): a
cursor-independent total is not automatically a *current* one, which the technique omits.
**Finding: one filter escaped the parallel.** `traceFilterCondition` is accepted by the
list (`Project.py:617`) and by nothing else — once in the whole schema:

```
$ grep -rn "trace_filter_condition" src/phoenix/server/api/dataloaders/record_counts.py
(exit 1, no output)   $ grep -c traceFilterCondition js/app/schema.graphql -> 1 (L2999)
```

So a list under a trace-grain filter has no matching N, only totals that ignore that
predicate: the count surface's predicate set drifted behind the list's.

## Refuse what you cannot page correctly

Strongly confirmed. `RequireForwardPaginationExtension` (`extensions/pagination.py`)
rewrites `first` into a required `Int!` at schema-build time, caps it at 1000 (`:18`,
`:95`), and rejects `last` (`:99`) and `before` (`:101`) with a `BadRequest` naming the
argument — which makes the constant `has_previous_page=False` (`Project.py:713`, `:3043`,
`Trace.py:380`) honest rather than a "we didn't check": refusal and constant are a pair,
neither safe alone. The schema still advertises `last`/`before`
(`js/app/schema.graphql:2999`) and the resolvers ignore them (`Project.py:611-613`,
`Trace.py:284-286`): only the extension prevents a backward page served forward.

Has-more is the technique's cheap idiom: limit-plus-one, return limit, the extra row is
the signal (`Project.py:689-691`, `:705-709`, `:2958-2959`; `Trace.py:363-365`). Phoenix
goes one step past the technique's text, correctly: on the trace path a page can be short
or empty while `hasNextPage` is true, because traces with no representative root span
produce no edge (`:3009-3010`, documented at `:2882-2884`), with a bounded retry loop that
re-pages up to three times to fill it (`:3018-3036`) — page size is decoupled from
end-of-traversal, and the flag is the only end signal. Malformed cursors are client
errors: `Trace.spans` raises `Invalid cursor format` (`Trace.py:304-307`), `Project.spans`
lets the decode exception propagate (`:672`); neither restarts from page one. One weak
spot: the trace path guards the cursor's sort column with a bare `assert` (`:2948`) that
`python -O` strips into an `AttributeError`.

## A rule the technique lacks: nullable sort columns

Phoenix sorts spans by nullable columns (token counts, costs, eval scores) and pins
`nulls_last(expr)` in both directions (`input_types/SpanSort.py:178`, `:197`). The pin is
load-bearing: when the cursor's sort value is NULL the predicate degenerates to `expr IS
NULL AND id <cmp> rowid` (`Project.py:676-678`), confining every later page to the NULL
group — correct only if NULLs sort last, else the non-NULL remainder is silently dropped.
Harness 3: SQLite's default ASC puts NULLs *first*, so a dialect default breaks it.

## Executed evidence

1. `harness_cursor.py` execs lines 1-145 of `types/pagination.py` verbatim with the two
   `strawberry` imports stubbed. A trace-list cursor encoded to base64 of the plaintext
   `4242:DATETIME:2026-08-21T19:40:33+00:00` and decoded back equal; three malformed
   cursors were all rejected (`binascii.Error` on non-base64, `ValueError` on a non-integer
   rowid, `ValueError: substring not found` on `7:DATETIME`), none falling back to page one.
2. `harness_keyset.py`: six traces, page size 2, Phoenix's DESC row-value predicate on
   stdlib sqlite3 3.43.1, one late span injected after page 1. Keyed on `start_time`
   (mutating earlier) traversal was `[1,2,3,4,6,5]` — 0 lost, 0 duplicated; keyed on
   `end_time`, the technique's latest-activity column (mutating later), `[1,2,3,4,6]` —
   trace 5 silently lost. Mutating an already-returned trace: backward on `start_time`
   duplicated it (id 1 twice, nothing lost); forward on `end_time` produced neither, so
   the technique's "seen again" consequence did not occur in the order it prescribes.
3. `harness_nulls.py`: SQLite `ORDER BY v ASC` returned the two NULL rows first;
   `ORDER BY v ASC NULLS LAST` returned them last, matching what `SpanSort` pins.

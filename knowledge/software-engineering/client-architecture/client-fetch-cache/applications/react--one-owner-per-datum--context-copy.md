---
layer: application
type: application
subject: client-fetch-cache
technique: one-owner-per-datum
stack: react
verified_against: react@19
verified_on: 2026-11-10
applied: code
ab_verdict: better
---

# A context copy nobody filled: two module contexts in a finance portal

The portal's frontend declares `react ^19.2.0` with a query client as its fetch
layer, which is the witness for the stack line. Two module contexts (one for
bookkeeping, one for group reporting) each kept the company list and the
scenario list in component state, under a comment calling them cached
dimensions, beside the query client's entries for the same two lists. Each
context exposed the lists, their setters and a `clearCache` action.

Nothing in either module ever called the setters. The state copy was zero
by neglect: always an empty list, still offered by the context type. The
project's history shows the defect the technique predicts. A scope provider
read `companies` off the reporting context, resolved the selected company
against an empty list, and set every screen's company id to null however
the URL was set. The fix added a comment at that one site ("NOT `companies`
off the context ... always empty") and read the list through the query hook.
It left the field in place for the next consumer. The reporting filter bar's
refresh button called `clearCache`, which emptied the copy nobody reads and
left the query client's entries alone.

## Arms

Target and floor were written before either arm ran.

- **A (as-is):** both contexts keep the state copy, setters and `clearCache`.
- **B (one owner):** the copy, its setters and `clearCache` are removed from
  both context types and providers. The refresh button invalidates the
  query client's company and scenario entries by key prefix. Net change: 4
  files, 19 lines added, 64 removed.

The instrument is the project's own TypeScript configuration, run without
incremental build state over probe files and the touched files.

| probe | A | B |
| --- | --- | --- |
| P1: re-introduce the historical defect (read `companies` off each context) | compiles, defect invisible | 2 errors, one per context |
| P2: read the list through the query hook (the correct consumer) | green | green |
| P0 positive control: read a field that does not exist | red | red |
| floor: touched files | 0 errors | 0 errors |
| floor: all 205 files importing either context | 1006 errors | the same 1006, line for line |
| floor: the 6 provider test files (16 tests) | - | 16 of 16 pass |
| floor: lint on touched files | 7 problems | the same 7 |

The 1006 closure errors are test-matcher typings that a files-only
configuration leaves out. They are identical across arms, so the floor
compares error sets, not exit codes. The floor gate can see a break: the
first B draft dropped two type imports still in use, and the touched-files
check went red with 4 errors before they were restored.

## What this does and does not show

It shows the removal half of the technique in code. Zeroing by deletion
turns the shipped defect into a compile error, costs no behaviour (the
provider tests and the consumer probe stay green), and repoints the one
refresh control at the cache that holds the data. The filter bar that owns
that control is not currently rendered anywhere in the app, so the refresh
repair has no live user path today.

It does not exercise the other half: two live caches with independently
tuned lifetimes, such as a router's preload window beside the query
client's stale time. The portal's router keeps no loader cache, so that
half rests on the source's own configuration (router lifetimes set to zero,
all caching left to the query client). No fleet seam has measured it.

The change sits on a branch in the project and was not shipped: the
project's active branch is an unrelated documentation branch with
uncommitted work.

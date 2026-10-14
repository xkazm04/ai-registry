---
layer: application
type: application
subject: machine-authored-documentation
technique: declared-truth-boundary
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.96.1
applied: code
ab_verdict: better
proof: ab-paired
---

# A "top" list over one run's links, described to an agent without saying what it is not

A crawler in the `pumper` repository persists the outbound links of every page it
keeps and echoes the run's `top_linked`: ten URLs ranked by a `links_in` count.
The code around it is unusually honest. The result carries `top_linked_complete`
and, when a memory budget was spent, a `warnings` entry saying the ranking covers
only the first 200,000 distinct edges. A coverage warning says the counts
"describe what was reached, not what exists". Every receipt is a count, never a
score, which is the naming half of the technique already done.

## The seam

The one place the boundary was missing is the place an agent reads before it
calls the tool: the app's manifest `description()` in
`crates/apps/crawl/src/lib.rs`. It said the run's "most-linked-to pages are
echoed as `top_linked`" and stopped. Three words in that sentence ("top",
"most-linked", "echoed") carry a reading the code never earns. An in-degree
count over the pages one run fetched is plausibly dominated by navigation and footer links (not measured here)
that every page repeats, so the head of the list may be the site chrome. Read as
importance, authority or PageRank, or as a statement about the whole site, it is
wrong, and the runtime warnings only appear on a run that was already cut short.
A healthy run, the one most likely to be over-read, carried no boundary at all.

Chosen to falsify: if the technique were redundant for a project this careful,
the description would already deny the stronger claims, or no one would be able
to write a test that distinguishes the two states. It was not, and one could.

## The change and the paired result

The description now says `top_linked` is a count (`links_in`) of distinct links
from the pages this run fetched, "NOT page importance, authority or PageRank, and
NOT a statement about the whole site". A test pins the four denied claims by
name, so softening the clause to a bare "approximate" disclaimer fails it.

| Arm | Description denies importance, authority, PageRank, whole-site | Crate suite, fmt, clippy `-D warnings` |
| --- | --- | --- |
| A (as shipped) | 0 of 4 (new test fails on "importance") | n/a |
| B (clause added) | 4 of 4 | 54 passed, fmt clean, clippy clean |

## What this does not show

The boundary was added where an agent reads it. Whether a consuming agent now
declines to treat the list as importance was not measured. The decision to keep
the name `top_linked` rather than rename it to a mechanism word was left as is:
renaming changes the output contract (`OUTPUT_SHAPE` and a key-inventory test
guard it), and the count-named field `links_in` already carries the receipt half.
Revisit the name if a consumer is found quoting `top_linked` as a ranking of
pages that matter.

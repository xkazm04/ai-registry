---
layer: application
type: application
subject: agent-memory
technique: read-set-bounded-links
stack: python
status: forged
verified_on: 2026-09-02
verified_against: python@3.10
---

# Request-local page ids and metadata-resident links in a memory-link design (OpenViking)

The tree's memory-link design document is the technique's source. Its design record
compares three competing systems it studied and rejects each one's link mechanism
with a named reason (`docs/design/memory-link-design.md:1120-1137`): regex auto-linking
"cannot verify a target exists"; compile-time backlinks "go stale after manual edits";
body links in wiki-bracket or path form "break on slug rename" and force a re-embed on
every relink.

## The identity map

During a session commit's extraction loop, every existing memory the pass reads in is
assigned a `page_id` from 1 to 99 by a `PageIdMap`; memories the pass creates get ids
from 100 upward, carried on the emitted item; the model refers to pages as `[page:N]`;
and `resolve_operations()` maps ids back to URIs after the loop
(`memory-link-design.md:1305-1313, :1331-1351, :1584-1596`). The ids are not persisted.
The document states the consequence as a heading: "dead links cannot exist" — a
`page_id` "only arises inside the extraction loop's context, so the file it names must
exist (existing files were read in, new files are about to be written)"
(`:1618-1623`). The wiki-compile design reuses the same map verbatim rather than
minting a compile-specific one (`docs/design/ov-compile-design.md:385-401, :423`).

## Links beside the body, rendered on read

A link is a `StoredWikiLink` written identically under the source's `links` and the
target's `backlinks` metadata fields (`memory-link-design.md:1368-1408`); the model's
introducing prose is kept as `match_text` and substituted into content only on
user-facing surfaces — search summaries and page views — "never for prefetch,
embedding, or T+1 consolidation" (`:1423-1451`). Retargeting touches metadata only,
so the write stays idempotent and no re-embed follows (`:1447-1451`). A separate
"claims" layer was considered and rejected as "a redundant subset of links" once link
types carry contradiction and evolution (`:1132-1133`).

## What the tree admits

The design's only measured number is a competitor's: a backlink boost of +5.4 points
precision-at-5 and +11.5 recall-at-5 on a 240-page set (`:189`) — not its own. Its
traversal depth defaults to one hop, with two "only when search quality is poor"
(`:1810`), and one section carries an inline note to move itself elsewhere (`:1539`).
The lock-stabilization spec that followed the first implementation records that link
writes revealed extra lock targets mid-transaction and had to be re-acquired as a
complete batch before any mutation
(`docs/superpowers/specs/2026-08-11-memory-link-lock-stabilization-design.md:16-38`).

## What this realization cannot do

It bounds *existence*, not *truth*: a link between two read-in pages can still be
wrong about how they relate, and nothing in the map checks that. The technique
routes that to consolidation's judgment; this tree routes it to the same extraction
prompt that wrote the link, with no second reader.

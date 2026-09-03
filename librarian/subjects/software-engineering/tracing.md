---
domain: software-engineering
subject: tracing
last_touched: 2026-09-03
touched_by: intake
dry_streak: 0
---

# tracing

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-03 - `/intake`, from a vendor's official MCP server monorepo

`cross-boundary-propagation` gained "When the sender is not yours". Source: [[2026-09-03-microsoft-mcp]].

The technique's whole contract was trust-by-default - the receiver *adopts* the trace id
and must not mint a new one - and every boundary in its catalog sat between tiers of one
system. It had no validation step, no size bound, and no notion of a sender outside the
trust boundary. A public tool server adopts trace identity from whoever calls it, so
recorded verbatim any caller can write attacker-chosen strings into the record operators
read during an incident: the corruption is timed to maximum damage.

The amendment is careful not to reverse the central rule - the receiver still adopts, it
adopts *what parses*. Identity fields are grammar-checked with a rejection recorded rather
than swallowed, free-form vendor-extension state is length-capped, and the unbounded
schema-less carrier is refused outright, since no cap makes it safe. This was a seam
neither subject owned: `untrusted-result-handling` models untrusted data arriving as
*results*, and nobody modelled untrusted data arriving as *propagation metadata*.

**The amendment was then corrected by the tree it was tested against**, which is the more
valuable half. Applied to the fleet's observability service, "only fields with a grammar
can cross" would have broken a legitimate, tested feature: opaque trace ids are passed
through verbatim on purpose, pinned that same morning. The right reading is that
grammar-validation and bounding are separable - for an *identity* field the bound is
load-bearing and the grammar is not; for free-form state the grammar or a refusal is. The
apply row and its measured numbers are in `librarian/applied.md`.

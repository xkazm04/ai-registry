---
subject: outbound-notifications
domain: software-engineering
last_touched: 2026-08-31
touched_by: intake
dry_streak: 0
---

# outbound-notifications

First touch: 2026-08-31, `/intake` over a knowledge-graph framework's repository
(`semantica`). Not selected from the worklist — the subject was reached by Phase 4
mapping and chosen over two closer-looking homes for a reason worth recording.

## State

6 -> 7 techniques. Landed `destination-guard-integrity` (new technique): the guard
in front of a dispatcher that sends to an address a user supplied.

## Why this subject and not the two that looked closer

The finding is a cross-cutting concern and three subjects touch it. `web-scraping`
fetches user-supplied URLs but declares its fetcher "commodity" and owns extraction
rules; its politeness framing ("you are a guest") is about the *target's* costs, not
about the sender's network position. `mcp-tools/egress-argument-gating` gates
outbound *recipients* over a third-party schema — a different question. This subject
was chosen on an **asymmetry**, which is the Phase 6 hunt that found it: the corpus
already **names** an SSRF-safe client, in this subject's own
`rust--channel-adapter-traits` application ("one transport door"), as a settled
thing, and **specifies** what makes such a guard safe nowhere in the corpus. A
concept mentioned in an application and measured in no technique is exactly the
shape that scores as covered and is not.

Recorded so a later run recognises the shape rather than re-litigating it: the same
concern is visible from `web-scraping` (the fetch) and `mcp-tools` (the transport's
reach), and if either grows a technique it should state the boundary rather than
duplicate this one.

## What the consumer changed

Phase 7.5 returned `not-better` on a real code A/B and the row is the valuable one.
The consumer implements the technique's central rule in a **stronger** form than the
source did — the guard is the client's own DNS resolver rather than an adapter
mounted onto a caller's client, so the validate-then-reconnect window does not exist
rather than being closed, and all three of the borrowed-client defects the source
found while reviewing its own fix are structurally unreachable. Its range table
independently covers the carrier-grade NAT gap the source had to patch.

**The tree corrected the technique**, which is why the row outranks a confirmation:
the consumer's own comments explain that the pre-flight validator is *not* redundant
with the connect-time resolver, because an address supplied as a literal never
reaches a resolver at all. The technique as first written implied the pre-flight
check was the problem. A section now says otherwise.

## Open

- The subject's boundary section lists four neighbours it must not absorb; the
  destination guard is now a fifth thing it *does* own, and the golden path says so
  in one paragraph. If a future run finds the guard belongs in a security subject
  instead, that move should carry the application citation with it.

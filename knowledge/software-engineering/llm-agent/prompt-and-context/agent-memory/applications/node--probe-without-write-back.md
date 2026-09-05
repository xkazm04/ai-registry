---
layer: application
type: application
subject: agent-memory
technique: probe-without-write-back
stack: node
status: forged
verified_on: 2026-09-04
verified_against: node@24
applied: experiment
ab_verdict: better
proof: structural-only
---

# The counted read, split off the read path (Node/TypeScript)

The technique's premise is a memory system's: recall writes, so a machine caller
of recall feeds the ranking. This realization has no memory system. It is a
public gallery of user-published blueprints in a Next.js app — and it has the
same loop, arrived at from the same pressure, which is what makes it evidence
rather than illustration.

## The loop is present in full

`src/app/api/blueprints/route.ts:55` orders the listing by `usage_count`
descending. `src/app/api/blueprints/[slugOrId]/view/route.ts:53` increments
`usage_count`. Rank causes placement, placement causes reads, reads cause rank —
the value-model loop with a database column standing in for an activation score.

## The tree already applies the rule, and says why

The detail read and the counter are *different endpoints*, and both sides carry
the reasoning in a comment. From the detail GET
(`src/app/api/blueprints/[slugOrId]/route.ts:54-59`):

> View counting is intentionally NOT done here. This GET runs on every React
> Query refetch/remount and is also hit by the clone/highlighted-template flows,
> so incrementing here over-counts a single real view.

And from the POST that does count (`view/route.ts:18-23`):

> View tracking is decoupled from the detail GET so that React Query
> refetches/remounts and the clone/highlighted-template flows (which also read
> the blueprint) don't inflate the count. Callers fire this once per real view.

That is the technique's central move — keep machine-initiated reads out of the
term that ranks — reached independently, in a domain with no agent and no
memory, by someone reasoning from over-counting rather than from a drifting
metric.

## The arms: two structures, counted by call site

Enumerating the read path's callers is the technique's own instruction, and the
enumeration is what makes this comparable. Every reader of the blueprint detail
in this tree is machine-initiated:

| Caller | What it is |
| --- | --- |
| `src/hooks/use-hover-prefetch.ts:143` | prefetch on pointer hover |
| `src/lib/prefetch/RoutePreloader.ts:216` | route-level preloader |
| `src/hooks/use-blueprints.ts:193` | React Query `useQuery` — refetch and remount |

Against one writer: `use-blueprints.ts:67`, an explicit
`POST /api/blueprints/:id/view`, fired once when a person opens a deep link.

| | Arm A — count on the read path, suppress per caller | Arm B — uncounted read, explicit write (shipped) |
| --- | --- | --- |
| machine caller classes reaching the counter | **3** | **0** |
| call sites that must carry a correct flag | **3**, one per reader | **0** |
| default for a reader added tomorrow | counts | does not count |
| sites where the counter's meaning is decided | 4 | 1 |

Arm A is the shape the technique described first — a single entry point with a
write-back suppression parameter — and it is the losing arm here on the only
measure that matters over time: it needs a correct decision at every reader,
forever, including readers nobody has written yet. The hover prefetch is the
concrete case. It fires on rank-ordered cards the user's pointer crosses, so
under Arm A the items the listing already ranks highest are the items that
accrue the most prefetch-driven count. The loop closes on itself with no person
having viewed anything.

## What the tree says back to the standard

The technique named the rule but not the structure that guarantees it, and this
tree supplies the structure. The two shapes differ in their *default*, and the
default is what a system converges on: a suppression flag protects the callers
someone remembered, while a separate write endpoint protects every caller
including the ones added later. The technique gained a section from this
comparison, resting on
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud).

The trade is real and visible here too. Splitting the write means the counter can
now be *under*-fired — the single call site at `use-blueprints.ts:67` is the only
thing standing between a real view and an uncounted one. That is the better
failure: an under-counted item is ranked conservatively, while an over-counted
one is ranked by its own machinery.

## What this realization cannot do

This is a structural comparison, not a behavioural one: it counts call sites and
their defaults, not requests. Arm A was never deployed here, so the magnitude of
the inflation it would produce is not measured — only that three caller classes
would reach the counter and that one of them is driven by the ranking it feeds.
The tree also has no memory-system property the technique's other half needs: no
scheduled probe replays a fixed set through this path, so the golden-set
entrenchment case is untested here and remains supported only by the source it
came from.

## Verification standing (2026-09-04)

Re-read against the source checkout on `main` at `d35b2b3`. Every citation
above resolves at the line cited; the cited files have no commits since
2026-08-31. The tree declares no runtime — no `.nvmrc`, no `engines`, no CI
matrix — so the observed stack is the checkout's own `node --version`, 24.x,
under a framework whose floor is 20. The earlier `node@22` was not the tree's
claim; this document now carries what was observed.

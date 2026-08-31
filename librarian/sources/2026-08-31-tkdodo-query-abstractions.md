---
source: tkdodo.eu/blog/creating-query-abstractions
kind: first-party practitioner account — the library's maintainer arguing against the abstraction his own users write
url: https://tkdodo.eu/blog/creating-query-abstractions
title: Creating Query Abstractions
author: TkDodo
words: 3789
extracted: 10
accepted: 1
declined: 0
leads: 1
already_covered: 1
untriaged: 2
dispatched: 0
applied: 1
shipped: 1
fetches: 0 of 3
run_id: intake-tkdodo-query-abstractions
siblings: 3
---

# The source whose ten candidates were one argument

**Class prediction held exactly.** A first-party practitioner account, and the
practitioner is the maintainer of the thing being abstracted — so the source
is reliable for what he built and why, at n=1, and corroborates
corpus-internally. Expected yield was stated before triage as *one
concentrated doctrine rather than a spread*, and that is what it was: of ten
extracted candidates, **four folded into the single landing as its supporting
argument and one folded into the lead.** Reporting ten findings here would
have been padding one finding five times.

Zero of three fetches spent. The class predicted that too: a first-party
account about a design decision needs a tree, not a second opinion, and the
tree was reachable.

Three siblings were live at claim, all mining sources by the same author
(`knip`, `pacer`, `the-vertical-codebase`); by Phase 7 the board held seven.
No sibling held `client-fetch-cache`. The `content` lock was taken for the
golden-path edit and held for that edit only.

## The landing

### `portable-read-definitions` -> `client-fetch-cache`

Found by the Phase 6 hunt for the stage a subject's pipeline leaves to a
default. `client-fetch-cache` owns the cache exhaustively — key, lifetime,
eviction, admission, plural claims, dedup, warmth, events — and owns nothing
about **where the read's definition lives**. Two documents brush the seam and
neither closes it:

- the golden path: *"state all four at the cache's construction site... a
  reviewer should be able to read its admission rule, its key rule, its
  lifetime rule and its eviction rule without reading its callers"*;
- `prefetch-and-defer`: *"a prefetch is a plain read through the normal path —
  same key builder, same cache."*

Both presume the construction site is **reachable** from every caller. When it
is bound to a component-scoped primitive it is not — a prefetch, a route
loader and a server render cannot call it at all — so each re-declares the
triple, and one question acquires several hand-maintained declarations. That
is [[one-authority-per-vocabulary]]'s exact shape, and the golden path's own
"without reading its callers" is what goes wrong.

The boundary with `plural-policy-claims` is the part worth keeping. That
technique reads divergent options on one key as *claims* to be resolved by a
stated quantifier, which is right when the definition is shared. When it is
not, most divergence is not a claim at all — it is drift between copies, and
no quantifier can recover an intent that was never formed. Stated in the
technique rather than left for a later run to rediscover.

Candidates 3, 4, 5 and 8 are inside this document as its argument, not banked
separately: *the best abstractions are not configurable*, *the factory is the
identity function at runtime*, *touching the abstraction per use case is the
tell*, and *non-component contexts are first-class consumers*.

## Applied — `goat`, mode `code`, verdict `better`

A read-only census over 982 files: 45 declaration sites, 40 distinct
questions, 3 declared more than once. **Hand-verification changed the
conclusion on two of the three rows, and that is the run's most reusable
result.** An instrument comparing fetcher expressions textually reports a
question as divergent when two sites spell one call differently — which is
what it did to `userLists`, where both sites call the same fetcher and the
keys correctly mirror their arguments. The first census was also wrong in the
other direction: it counted 13 divergent keys until the parse window was cut
at the next key, and it *still* cannot see declarations that live in a
declarative array rather than a call, which is where the most serious defect
in the tree turned out to be.

Shipped the one verified case — a question declared at four sites with three
different lifetimes, now one declaration, all four resolved lifetimes
unchanged. Typecheck 29 errors before and after; lint clean.

**The compiler confirmed the technique.** Two hooks carried a pass-through
options bag whose key generic was hand-widened to `readonly unknown[]`,
because that parameter cannot be written without re-declaring the whole
generic surface. A shared definition does not compose with it: the key factory
produces a precise tuple, and a callback typed against the widened key is
contravariantly incompatible. The wrapper had already failed before this run
touched it — one caller passes its options `as any`. The source argues that
configurable pass-throughs are a bad idea; this tree shows they are
untypeable, and that it had already paid in casts.

Left unshipped and recorded: one question read by two **different API
clients** behind one key. Real, more serious than what was shipped, in another
feature's key factory and outside the authorized slice — and **a second
sighting**: the subject note already carries it as an open lead banked by the
lifetime-census run, which reached it from the other side. Two runs, two
instruments, one defect, still unfixed. That is the row that should be picked
next, ahead of anything this source proposed.

## Already covered

**Centralizing the key to prevent duplicate cache entries** — the source's
stated reason for writing a wrapper at all. `cache-key-discipline` owns this
and frames it better, as the asymmetry between collision (too coarse, silent,
wrong) and fragmentation (too fine, merely wasteful), with the instruction to
err toward fragmentation. The source has the practice; the corpus has the
reason.

## Lead

**A generic pass-through wrapper collapses call-site type inference.** Real,
and now evidenced by a build failure in a managed tree, but its natural home
is `ipc-contract`'s `call-wrapping` / `generated-type-contracts`, whose
applications were under a sibling's active edit for this whole run. Forcing it
there would have bought a collision for the narrower half of a finding whose
better half already landed. The mechanism is written up inside
`portable-read-definitions` where it bites; the lead is to give it its own
home on the typed-boundary side.

*Return condition:* when `ipc-contract` is uncontended, or when a second
source reaches the same rule about wrapping inference-heavy APIs.

## Untriaged — extracted, never picked, nobody verified them

| # | Candidate | Anchor |
| --- | --- | --- |
| 9 | A library's type-parameter count predicts how expensive wrapping it is (4 vs 23 vs "let's better not talk about that") | *"TanStack Form has 23 type parameters on most of the types"* |
| 10 | The options-factory API is the maintainer's preferred abstraction since v5 | *"Since v5, my preferred way to create Query abstractions is not with custom hooks anymore"* |

Both are dated facts about one vendor's API surface. Neither was verified.

## Method notes

- **The instrument was wrong twice in opposite directions and both were
  caught.** Over-counting (13 keys) from a parse window that bled into the
  next object; under-counting from an enclosing-call resolver that cannot see
  a declarative registry. A census whose blind spot is not stated reads as a
  measurement.
- **`index.json` and `catalog.json` were regenerated under the lock and
  deliberately left uncommitted.** The regenerated index references a
  sibling's `valid-but-degraded-plans`, which appears in zero files in `HEAD`;
  committing it would bake another run's unreviewed work into a hash under
  this run's name.

---
source: github:TanStack/query
kind: vendor repository (open engine) — mature practitioner codebase
url: https://github.com/TanStack/query
title: TanStack Query
author: TanStack and contributors
commit: 1566c16de7efeb22739209e07310661d91954a78
words: 383 (README) / 134411 (in-tree docs, 497 files) / 7249 LOC core / 105254 LOC tests
extracted: 12
accepted: 3
declined: 0
leads: 2
already_covered: 2
untriaged: 7
dispatched: 0
applied: 3
shipped: 1
fetches: 0 of 3
run_id: tanstack-query-2026
siblings: 4
---

# TanStack Query — the library that ships a linter for the contract its types cannot hold

**The class prediction held exactly and the README ratio is the evidence**: 383
words of landing page against 134,411 words of in-tree documentation and a
**14.5:1 test-to-core ratio** (105,254 LOC of tests over 7,249 LOC of core).
Every accepted finding came from the core source or the lint plugin; none from
the README. Fifth consecutive practitioner-codebase run to spend **zero** of
three fetches — the engine and its operating instructions ship in one tree, so
every claim was checkable in-run against the code that implements it.

Four siblings were live at claim (`tigerbeetle`, `danluu`, a YouTube run and
`verou`); a fifth and sixth appeared mid-run. None held `client-fetch-cache`,
`client-state`, `retry-backoff` or `async-ui-states`, so the four subjects this
source routes to were uncontended for the whole run — unusually clean, and
worth recording because it is why no `content` lock was ever contended.

## The three landings, and how each was found

All three came from **hunting an enumeration or an asymmetry**, not from a
feature. That is now the dominant mode across recent runs and it held again.

### 1. `plural-policy-claims` -> `client-fetch-cache`

The golden path declares *"Every cache declares four policies"* and instructs
that all four be stated **at the cache's construction site**. Every one of the
four assumes a **single declarant**. The moment a cache keys entries by
argument rather than by call site — which is the whole point of such a cache —
one entry has a *set* of claims per policy, and the enumeration says nothing
about how a set collapses.

The code answers with **three different quantifiers over the same observer
set**: retention by `Math.max` and monotonic (never shrinks); believability by
`some` (existential); a focus-triggered refetch by `find`-first (exactly one).
Plus a fourth mechanism underneath: an attached observer clears the GC timeout,
so the eviction clock is **reference-counted** and starts only when the last
claimant leaves. The unifying rule is that the quantifier is chosen by **which
direction of error is unrecoverable** — evicting data a live reader needs is
irreversible, so take the max; refetching something still fresh costs one
request, so the most demanding claimant wins.

### 2. `suspension-is-not-failure` -> `retry-backoff`

*"There are exactly four legitimate terminal states"* — and the enumeration is
correct on its own terms, which is why this is a missing **stage** and not a
contradiction. All four are terminal; the ladder has a fifth state that is
not: **suspended**. The retryer pauses without spending budget, and the
predicates that gate starting and resuming are deliberately different — focus
is required to *resume* a retry but not to *start* a fetch, because starting is
user-intent-driven and resuming is the machine's own initiative. Suspension's
nearest neighbour is `denied`, and they are attributed oppositely: a breaker
judges the dependency, a suspension reports the caller.

### 3. `observed-read-subscription` -> `client-state`

An **asymmetry**, and the kind a slug map cannot see. `client-state` says a
consumer subscribes to the narrowest projection it reads — the **declared**
form — and nothing in the corpus modelled the **observed** form. The library
wraps the result in a proxy whose read trap records the accessed keys, then
notifies only on tracked ones. Three guards make it safe and each is a rule:
an empty read set means *unknown* and must fail open (`unknown-is-not-a-value`
— a never-yet-rendered consumer would otherwise never render again); the first
update after mount is unconditional; and options that change control flow
inject subscriptions the read trace cannot reveal. Its defining hazard is that
**enumeration is indistinguishable from reading** — one spread marks every
field tracked — and the corrective is a lint rule, not documentation.

## The source's own best idea, which is also a finding we did not land

The repo ships **eight lint rules**, and read together they are not eight rules
about a library — they are a **taxonomy of the type system's blind spots**: key
order in an object literal (two rules, because inference flows between keys),
referential identity of a returned object, which fields a consumer read,
whether a function returned anything, the lifetime of a container. Every one is
a contract term a compiler cannot hold and whose violation is silent. This is
row 4 in the triage and the operator did not pick it; it is recorded untriaged
rather than declined, and it is the highest-value unlanded thing here.

## Applied — 3 of 3, measured read-only, then shipped

All three found seams in `goat`, the one fleet project that consumes this
library (23 files), and all three shipped after the operator was asked with the
numbers in hand. The triage pick named no project, so the run went read-only
and correctly refused to edit a tree nobody had authorized; the ask was then
made **after** the A/B, carrying a measured delta and a diff size.

**The instrument lied twice and was caught both times**, which is the process
note worth keeping. A flat constant table let a `GC_TIME_MS.STANDARD` of
600,000 overwrite a `CACHE_TTL_MS.STANDARD` of 300,000 and reported a **2.0x
spread that did not exist**; a 900-character lookahead window bled into the
next call and invented a divergence between two *different* keys. Both were
caught by opening the cited lines by hand, not by re-reading the output. The
harness now asserts its own parse before printing, and refused to print once,
correctly.

- **plural-policy-claims / goat / code / better.** 65 registrations over
  50 keys; 7 keys shared by more than one site; **2 diverge in resolved lifetime (2.0x
  explicit-vs-explicit, 3.0x explicit-vs-default — see the correction below)**. Both have the same shape: a prefetcher claims longer freshness
  than the consuming component, and believability resolves to the shortest live
  claim, so the prefetcher's stated warmth is **inert**. The 2.0x case is a
  **vocabulary collision** nobody designed — two modules define a local duration
  table under the same name binding `SHORT` to different constants. The largest
  shared key (7 sites) is consistent, which keeps the result honest.
- **suspension-is-not-failure / goat / code / better.** The tree gets the
  hard half right by configuration (start and resume are different predicates;
  a distinct offline error code exists) and loses the easy half: the retry
  predicate substring-scans the error message for `401|403|404`, but the message
  holds user-facing copy while the status sits in a typed field it never reads.
  Over all **39 defined error codes**, the shipped predicate correctly refuses
  **0 of the 17** that must never be retried. The classification it needs
  already exists one module away and is never consulted.
- **observed-read-subscription / goat / code / better (structural-only on the subscription cost).**
  The project relies on observation at 100% of call sites: the explicit
  declaration appears **nowhere**, and the lint plugin is **not installed**
  (zero references in the manifest and the lint config). One shared wrapper spreads a
  result object — though **see the correction below: that object is already
  untracked, and the real cost is the mapping one level up**.
  Blast radius measured honestly at **2 consumers**; the finding is the absent
  instrument, not a large cost today.

## Catches

- **Structural sharing** (return the old subtree when deeply equal, preserving
  referential identity) — adjacent to existing content and better covered there.
- **Lazy global event subscription** (install the environment listener only
  while someone is subscribed) — `singleton-lifecycle` owns this.

## Leads

- **The lint plugin as a taxonomy of type-system blind spots.** Eight rules,
  each naming a contract term a compiler cannot express. Return condition: when
  a second independent source ships a linter for its own type-invisible
  contract, this is a technique at doctrine altitude, and its home is probably
  not a client bundle. This is triage row 4, untriaged.
- **Two sites register one key with two different fetch functions.** Found while
  verifying the divergence census in `goat`: the same cache key is served by two
  different API calls from two modules. That is a key-discipline defect, not a
  policy-claim one, and it was outside this run's picks. Return condition: when
  `cache-key-discipline` is next swept, this is a live instance.

## Untriaged — extracted, reached the table, never picked

Recorded with anchors so a later run does not re-derive them. **Nobody verified
these**; they carry no judgment.

| # | Candidate | Anchor |
| --- | --- | --- |
| 4 | Ship a linter for the contract the type system cannot hold — the 8 rules as a taxonomy | `packages/eslint-plugin-query/src/rules/`, `docs/eslint/*.md` |
| 5 | Await-shaped fetch ergonomics serialize independent work; concurrency needs a plural primitive | `docs/framework/react/guides/request-waterfalls.md:109-124` |
| 7 | A default ships with its ceiling and its escape seam named | `packages/query-core/src/timeoutManager.ts`, doc comment on thousands of timers |
| 8 | Wrapper functions, not direct global references, for swappable globals | `timeoutManager.ts`, `defaultTimeoutProvider` comment |
| 9 | Environment-dependent defaults: retry 0 and eviction never, server-side | `retryer.ts` server-vs-client retry default; `removable.ts` infinite server GC |
| 11 | Codemods ship with the breaking change | `packages/query-codemods/src/v4`, `/v5` |
| 12 | 14.5:1 test-to-core LOC ratio as a maturity signal | measured this run |

Rows 6 and 10 resolved to the catches above.

## For the next run over a repository of this class

- The **operating documents are not the guides** here. The migration guides are,
  and they are release walkthroughs: organised around changes, so each states
  what was wrong before. Three of them, 3,888 / 3,456 / 2,490 words. This run
  read them last and should have read them first.
- **The lint plugin is the densest single artifact in a repo that ships one.**
  It is the file that implements what the docs merely name, and eight short rule
  documents outproduced 134k words of guides.

## Shipped, and what shipping corrected

`goat` `d4995c3` (not pushed). Typecheck 29 before and after with 0 in the
changed files; `eslint src` 0 errors; the project's own ratchet matching on all
27 buckets.

- **Retry classifier: 0/20 -> 20/20** permanent codes refused, 0 false
  positives in either arm, both arms produced by extracting each revision's own
  function and running it rather than reimplementing either.
- **Divergent cache keys: 1 -> 0.** Two colliding alias tables deleted so the
  shared constants are the single authority.
- **Lint plugin installed**, six rules at error/0 under the project's own
  severity policy.

Three corrections the shipping produced, all of which make the record more
honest rather than less:

1. **The divergence count was overstated in shape, not in kind.** A strict
   explicit-vs-explicit comparison finds **one** divergent key (2.0x). The
   second (3.0x) is an explicit value against the *resolved client default* —
   a real divergence in effect, invisible to a reviewer reading two call sites,
   and worth distinguishing rather than folding into one number.
2. **The tracking finding was located correctly and explained wrongly.** The
   flagged spread is on an object that is **already untracked**: the paginated
   hook spreads its sibling's return value, and the sibling has already mapped
   the tracked result to a plain literal. The real cost is that mapping — it
   reads thirteen fields to build the declared interface, subscribing every
   consumer to the whole surface. **Nothing was done wrong**, which is what
   makes it the better finding: the loss is an unavoidable side effect of
   describing a surface, and **no linter can flag it**. The technique gained a
   section from this.
3. **The linter found a class the census did not.** Three violations, not one —
   two `no-unstable-deps` this run never searched for, where a memoized
   callback depended on two mutation objects that are not referentially stable.
   The census finds the idiom it hunts; the instrument finds the class.

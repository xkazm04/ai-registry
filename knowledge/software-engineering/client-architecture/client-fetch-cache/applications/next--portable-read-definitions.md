---
layer: application
type: application
subject: client-fetch-cache
technique: portable-read-definitions
stack: next
verified_on: 2026-08-31
verified_against: next@16
applied: code
ab_verdict: better
proof: ab-paired
---

# Next — the prefetch lane invented the definition and typed its payload as unknown

How a Next.js application stands against the question of **where a read is
declared**. A sibling application on this stack,
[next--plural-policy-claims](./next--plural-policy-claims.md), already
censused the same tree for *lifetime* divergence and asked what an entry
resolves to when several sites claim it. This one asks the question one step
earlier and gets a different answer: **why is there more than one declaration
site at all, and do the fetchers behind them agree?** A lifetime census
cannot see a fetcher fork, and the fork is the more serious defect.

## The seam

Reads are declared inline at the site that consumes them. The key vocabulary
*is* centralized — key factories exist per domain and are imported everywhere
— so the tree already passes
[cache-key-discipline](../techniques/cache-key-discipline.md)'s main test.
What is not centralized is the pairing of that key with its fetcher and its
default lifetime. That pairing is retyped at every site that needs it.

## Arms

**Arm A** — the tree as it stands. **Arm B** — the most-declared question
hoisted into a per-question factory returning a plain options value, every
consumer spreading it. The measurable is the number of questions declared at
more than one site, and how many of those diverge in fetcher or in declared
lifetime. Instrument: a read-only enumerator that pairs each key expression
with the fetcher and lifetime in the same object literal and resolves which
call encloses it. It ran identically over both arms.

## Result

| | declaration sites | questions declared >1× | divergent |
| --- | --- | --- | --- |
| **A** | 45 | 3 | 3 |
| **B** (shipped) | 42 | 2 | 2 |

The totals move less than the finding does, because **hand-verification cut
arm A's three to one shipped fix, one real defect outside the slice, and one
artifact.** The counts are reported the way the instrument produced them; the
reading below is what survived checking.

- **List detail — one question, four declarations. Real; fixed.** Two
  components, a prefetch and the shared hook each re-typed the key, the
  fetcher and a lifetime, and the lifetimes had drifted to three values
  (300000 twice, a defaulted parameter, and 60000). Nobody chose that spread.
  The sibling lifetime census read this key as consistent because it compared
  resolved numbers and the shortest claim wins anyway; by that measure it was
  right. The defect is not the resolved value, it is that four copies must be
  edited together and nothing says so. Now one declaration, all four resolved
  lifetimes unchanged.
- **Groups list — one question, two API clients. Real; not fixed; second
  sighting.** The reading site calls one client, the hover-prefetch site
  another. This is the poisoning shape: one entry, two producers, and the
  surface parses whatever ran last. It sits in a different feature's key
  factory, outside the shipped slice, and it is the more serious of the two.
  **The instrument cannot see it** — those declarations live in a declarative
  array rather than a call, so the enclosing-call resolver drops them; it was
  found by hand, and a census that hides its blind spot is worse than no
  census. It was also found by hand once before: the lifetime census banked it
  as an open lead against this same tree, reaching it from the other side
  while verifying a different measurement. Two independent runs arriving at
  one defect from two instruments is the strongest signal either produced
  about it, and it is still unfixed.
- **User lists — two declarations, no divergence. Overstated on first read.**
  The instrument flagged it fetcher-divergent because the argument text
  differs. Checking the callers refutes that: both sites call the *same*
  fetcher, the keys correctly mirror the arguments, and the one consumer the
  prefetch targets passes exactly the arguments the prefetch hard-codes. A
  second consumer passes different arguments and *should* miss, because it is
  asking a different question. It is a maintenance hazard — two places encode
  the same literal — not a live defect, and it was deliberately left alone.
- **Blueprints — artifact.** The instrument normalized a spread-prefix key and
  lost the discriminating suffix. Two questions sharing a prefix are not one
  question. It survives in both arms, which is the honest way to read a
  one-directional result.

## The structural fact

The tree proves the technique three times, and none of the three was designed.

**The prefetch lane already invented the portable definition.** There is a
declared `PrefetchTarget` type — `{ queryKey, queryFn, staleTime, priority,
source }` — a standalone, framework-free descriptor of a read, exactly the
plain value this technique argues for, built because the prefetch machinery
could not call a component-scoped primitive and had no other option. The
authors reached the technique's shape under structural pressure and then did
not connect it to the reading sites, so the codebase holds two parallel
declarations of the same reads: portable ones for warming, component-bound
ones for reading. Both real divergences above are the seam between them.

**The generic container collapsed its own payload type.** That descriptor
types its fetcher as `() => Promise<unknown>`. Making one container general
enough to hold every read is precisely the move that erases what each read
returns — the widening this technique warns about, arrived at independently by
authors solving a runtime problem. It is the argument for a factory *per
question* over a container for *all* questions.

**And the compiler refused the configurable wrapper.** This is the strongest
of the three because it is not an observation, it is a build failure. Two
hooks accepted a pass-through options bag whose key generic was hand-widened
to `readonly unknown[]` — the only way to write that parameter without
re-declaring the whole generic surface. Spreading a shared definition into
those hooks does not compile: the key factory produces a precise tuple, and a
callback typed against the widened key is contravariantly incompatible with
one typed against the tuple. The wrapper had already failed on its own terms
before this work touched it — one caller passes its options `as any`, which is
the type system being told to stop objecting. Narrowing both bags to the four
options callers actually pass fixed the build and deleted the cast. **A
configurable pass-through is not merely inadvisable here; it is untypeable,
and the codebase had already paid for that in casts.**

## What this realization cannot do

- The instrument compares fetcher **expressions textually**. Two spellings of
  one call read as divergent — which is exactly the error it made on user
  lists — and one spelling wrapping two behaviours would read as agreeing.
  Every count here was hand-verified, and the hand-verification changed the
  conclusion on two of three rows.
- It sees declarations shaped like an object literal beside a key. A
  declarative registry, a dynamically built descriptor, or a read assembled
  across two statements is invisible to it. One such case was found by hand;
  there may be others.
- The shipped change is verified by typecheck (29 pre-existing errors before
  and after) and lint, not by a test run or a behavioural measurement. It
  claims unchanged resolved lifetimes by reading the four declarations, not by
  observing refetch timing.
- Nothing here measures a user-visible effect. The claim is about how many
  places must be edited together and whether two producers can disagree, not
  about latency or hit rate.

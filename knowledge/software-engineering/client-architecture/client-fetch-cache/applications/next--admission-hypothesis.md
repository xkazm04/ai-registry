---
layer: application
type: application
subject: client-fetch-cache
technique: admission-hypothesis
stack: next
verified_on: 2026-08-31
verified_against: next@15
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Next — seventy-one percent of the admission table points at pages that do not exist

How a Next.js application stands against the golden path's fourth declared
policy, **admission** — the bet about why an entry will be read again.

## The seam

One query client constructed once and mounted at the provider. The only place
in the application that decides *what* to cache rather than how long to keep it
is a route-preload configuration table: a list of route patterns, each naming
the queries to warm when that route is entered. That table is the application's
only stated admission bet, and the bet is "arrival at this route predicts a read
of these queries."

## The arms

The application's own route-matching function, replicated verbatim, run against
its real route surface enumerated from the page files.

- **A** — admission as configured: seven rules, ten prefetch targets.
- **B** — the bet checked: a rule naming a route the application does not serve
  cannot fire, so it is a bet on nothing.

## What the arms said

**Five of seven rules and eight of ten targets are placed on routes that do not
exist.** One is a singular/plural mismatch against the real path; the rest name
sections the application does not serve. These are not rewrites — the build
config declares no redirects, and no link in the source points at them.

The product's own hot path admits nothing at all. The team's end-to-end journey
walks the home page and then the main play route; that route matches no pattern,
so the preloader returns before prefetching, and hover intent routes through the
same matcher with the same result.

Beyond the route table: **seventy-five registration sites across forty-one key
families, none of which states a reuse hypothesis.** Thirteen families carry
more than one lifetime across their own registration sites — one key family has
eight sites and four different lifetime expressions. Three parallel lifetime
vocabularies coexist, including two different objects sharing one name that map
the same label to different values.

Entries admitted under no hypothesis share the store with hot reference data:
three search families are keyed on debounced free text — an unbounded key
population, one entry per keystroke flush — and every invalidation is a single
predicate pass over all of them.

**Verdict: better.** The golden path's claim is that the admission bet is only
checkable once written down as a bet. This application wrote its bets down and
nobody checked them, and most are placed on pages that no longer exist. That is
not a bug someone introduced; it is what an unstated policy looks like after the
routes move.

## The structural fact

The policy could not be expressed even if someone wanted it. The query client's
default options carry seven keys — lifetime, eviction, retry, retry delay,
network mode and three refetch triggers — and no slot for admission. The one
shared helper that accepts a policy argument resolves it to exactly a lifetime
and an eviction time. The preset table gives twelve data types a lifetime, an
eviction time and a description, and never a reason to expect a second read.
The upstream library offers no admission hook either, so the omission is not
local taste.

Fleet-wide it is worse and nobody designed that either: a second project holds
thirty-two module-scope map caches, two of which carry any size cap; a third has
a hand-rolled fetch cache keyed on an unbounded population with a short lifetime,
no cap and no reaper, deleting only on error. **Outside this one application
there is no cache constructor in the fleet at all**, so there is nothing that
could take an admission argument.

## Return condition

The instrument that would measure whether a bet pays off is already built and
unwired: a prefetch manager tracks hits, unused entries and a hit rate, and
exposes a recording call that **nothing in the application invokes**. The hit
rate is therefore structurally zero. Wiring that call at the read path converts
this measurement from reachability — can the rule ever fire — to conversion —
does the warmed entry get used. There is also no test of any kind over the
prefetch or cache directories, which is why most of the admission table could
rot silently.

## What this realization cannot do

The experiment measures whether an admission rule can fire, not whether firing
helps. It shows eight of ten targets are unreachable and cannot show that the
remaining two are worth warming, because nothing records whether a prefetched
entry was read before it was evicted.

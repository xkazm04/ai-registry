---
layer: application
type: application
subject: search-intent-classification
technique: err-toward-transactional
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# A marker-list classifier that defaults to informational is the measured bias, in code

The Czech-first marketing workspace (commit
`2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08; engines `node: 24.x`)
classifies every keyword idea with a deterministic substring classifier in
`src/lib/keywords/types.ts:215-264`. It is a faithful, well-commented realisation
of exactly the classifier the 2008 log study measured - and so it inherits the
study's error direction structurally. This application records that fact, because
it is the clearest witness in the fleet of why the technique exists.

## The classifier

```ts
// src/lib/keywords/types.ts:258-264
export function classifyIntent(keyword: string, brand?: string): KeywordIntent {
  const k = keyword.toLowerCase();
  if (brand && brandMatches(k, brand)) return "brand";
  if (LOCAL.some((t) => k.includes(t))) return "local";
  if (TRANSACTIONAL.some((t) => k.includes(t))) return "transactional";
  if (INFORMATIONAL.some((t) => k.includes(t))) return "informational";
  return "informational";
}
```

Three marker lists feed it (`:217-230`): sixteen transactional markers (buy,
price, cheap, sale, e-shop, order, in stock...), seventeen informational markers,
and fifteen local markers (nearby, near me, book, opening hours, contact,
branch...). `KeywordIntent` (`:14`) has four values: informational,
transactional, brand, local. Every idea that passes through `finalizeKeywords`
(`:277-306`) and the onboarding seed (`src/lib/onboarding/seed.ts:40`) gets its
intent from this function, and the ideas are then grouped and summed by intent
(`:292-304`).

## The structural fact

**The fall-through is informational, twice.** Line 262 returns informational
when an informational marker matches; line 263 returns informational when
*nothing* matches. Every marker-free query - "instalatér", "svatební fotograf",
"účetní" (a plumber, a wedding photographer, an accountant) - is an article. This
is precisely the mechanism the 2008 study measured: a classifier that can only
name the words flagging a buying query, so that the unmarked residue falls into
the largest bucket. That study's classifier over-called informational (81% raw
versus a corrected ~65%) and 82% of its errors were money or brand queries
labelled informational. The workspace's classifier has the same shape and no
reason to have a different error direction. Its informational group total
(`:301`) is therefore inflated by exactly the short commercial queries a business
most wants, and the volume-ranked "opportunity" ordering inside that group hides
them among genuine how-to terms.

**Comparison is folded into informational, explicitly.** The `INFORMATIONAL`
list (`:222-223`) contains `"recenze"`, `"nejlepší"`, `"srovnání"`, `"test"`,
`"rozdíl"`, `"vs"` - review, best, comparison, test, difference, versus. The
workspace has no comparison bucket in `KeywordIntent`, so every best-of and
versus query is an article. The same workspace's comparison module knows better:
`src/lib/seo-compare/compute.ts:53-62` weights comparison sub-intents
`pricing 1.4, alternative 1.3, vs 1.2, review 1.0` as *high-buying-intent*
queries, and `src/lib/ai/tools/comparison-outline.ts:29-44` scaffolds a page per
sub-intent (head-to-head criteria for versus, migration angle for alternative,
price components for pricing, verdict for review). Two modules, one keyword,
opposite verdicts - the keyword module files it with the how-to guides, the
comparison module treats it as one step from purchase. The deviation is the
`local-and-comparison-as-own-intents` technique's comparison fold, witnessed in
a single tree.

**Local is its own bucket, checked first - and this is the upward lesson.** The
comment at `:225-228` states the rule in the technique's own words: a near-me or
booking query is "its own intent: high commercial value but won by local
presence (GBP + a locality page), not a generic transactional page - so it
deserves its own bucket, not 'transactional'". Line 260 checks `LOCAL` before
`TRANSACTIONAL` so that "objednat se poblíž" (book nearby) reads local, not
buy. The ordering rule - local before transactional because the place decides
the winning page - was taken into the technique from this comment.

**Brand matching learned the substring lesson the intent lists have not.**
`brandMatches` (`:243-251`) switched from `includes` to a word-boundary match
after a raw substring mislabelled "srovnání" as brand for a project named
"Ora", refuses brands under three characters, and refuses a brand that is itself
a marker word. The intent lists still use `k.includes(t)` (`:260-262`), so the
two-letter marker `"vs"` matches inside any word containing those letters and
`"co"` (what) matches inside most Czech words - both pushing toward
informational. The fix the brand path received is the fix the marker path is
owed.

## What the tree does not do

No results page is consulted anywhere in the keyword path; the classifier is the
verdict. There is no "unverified" state, no count, no date. The standard's
answer - a tool label is a hint until somebody searched the term - has no
representation in `KeywordIntent`, so a consumer of `KeywordIdea.intent` cannot
tell a searched verdict from a substring guess. Under the technique's decision
rules, every informational label this function emits on a marker-free short
query is unverified, and the volume it groups under "informational" is the
number most likely to be a money query in disguise.

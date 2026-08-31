---
source: github:TkDodo/react-query-beyond-the-basics
kind: first-party practitioner account, repo form — workshop curriculum whose content is a branch sequence
url: https://github.com/TkDodo/react-query-beyond-the-basics
title: React Query - Beyond the Basics
author: TkDodo
commit: 32c39bed12e0b9673ffb0d249150c45b2bbdc1df
words: 158 (README) / ~700 lines across 7 branch diffs (the actual source)
extracted: 10
accepted: 1
declined: 0
leads: 1
already_covered: 3
untriaged: 4
dispatched: 0
applied: 1
shipped: 0
fetches: 1 of 3
run_id: rq-beyond-basics
siblings: 3
---

# The workshop whose source is its branch list

**The class prediction was right about the shape and wrong about where the
yield would be.** A 158-word README over 13 source files reads as a thin
source by every heuristic this method has. It is not: the repository carries
**seven ordered feature branches**, and the diffs between them are the source
— a library maintainer's curriculum of what he considers non-obvious *after*
you know the basics, each step motivated by a UX failure the README names up
front ("snappy interactions, minimal layout shifts, and avoiding unnecessary
loading spinners"). `research-ingest` on this URL returns the advertisement;
`git ls-remote --heads` returns the source.

Swept: all seven branch diffs, `eslint.config.js`, the arktype search-param
schema, the state components, the key factory. README last. Three siblings
were live at claim (`future-agi-memory`, `tigerbeetle-w3`, `verou-xl`); the
`tanstack-query-2026` run that mined this same library's *engine* forty
minutes earlier had gone quiet, so all four subjects this source routes to
were uncontended and no `content` lock was needed.

## The one landing

### `windowing-vs-identifying-keys` -> `async-ui-states`

Found by the Phase 6 hunt for a document that declares its own completeness,
and it turned out to be the rarer case: **not a hole, a stated doctrine that
is wrong on a specific axis.** `state-model` names the decision — when does
the sticky `settled` bit reset — calls it *the subtle decision*, and
prescribes *"pick one policy per product and apply it everywhere, because
mixing the two makes the product feel nondeterministic."* The corpus says this
**twice**: `table/loading-and-empty-states` carries the same sentence in
nearly the same words, and `arrival-choreography` leans on the same undefined
term. Three sites, one primitive nobody defined — which is what made this a
correction worth two files rather than one.

The source contradicts it deliberately. One line does the work:

```js
placeholderData: (previousData) =>
  previousData?.filter === filter ? previousData : undefined
```

Both policies, in one surface, selected by **which component of the compound
key moved**. And the same distinction independently governs three other
subsystems in the same app — `resetScroll={false}` on page links only; a
filter change resetting `page: 1` while a page change never touches the
filter; and step 7 deferring `page` alone. Four subsystems, four vocabularies,
one classification, named nowhere.

So the correction keeps the corpus's fear and drops its prescription:
arbitrary mixing *is* nondeterministic; mixing **per axis** is a rule a user
can state. Landed with two consequences in the golden path — the state table
gains `superseded` (content held from a previous *window*, which is not stale
but *for a different question*, hence the content region itself is marked
rather than an ambient indicator), and the honesty rules go from three lies to
four.

**The strongest half is where the classification should be declared**, and the
source demonstrates both options across two branches. Step 4 declares it on
the *payload* — a predicate over the previous response — which silently
requires the response to echo its own identifying coordinates back. Step 7
declares it on the *input*, deferring only the windowing coordinate, which
requires nothing from the wire and cannot drift from the thing it describes.
That is the technique's central instruction.

## Corroboration — 1 of 3 fetches, and it did two jobs

One primary on the scheduler mechanism. It confirmed the mechanism **verbatim**
— `const isStale = query !== deferredQuery` with `opacity: isStale ? 0.5 : 1`,
and "the query will update immediately… the deferredQuery will keep its
previous value", i.e. deferral is a property of the *input*, not the response.
And it confirmed the gap: the primary warns only that deferred values must be
*referentially* stable (primitives, or objects made outside render), and says
nothing about which values are *semantically* eligible. Mechanism documented
by the vendor; discrimination rule documented nowhere; corpus rule inverted.
The referential warning and the semantic rule happen to point the same way,
which is why "defer the coordinates, never the bag" is one sentence.

## Applied — 1 row, `experiment`, `unmeasurable`

A read-only census across two managed React trees (5,998 files, 380 multi-key
object literals) for the shape the technique predicts. **The instrument
asserted its own parse and refused to print on the first run** — `a: b ||
undefined` was yielding `undefined` as a key — which is the sibling's lesson
from this morning arriving one run later and paying for itself immediately.

Two candidates, one project; **one survived hand-verification**, the other was
an options-destructuring pattern. The confirmed seam is one `useMemo` handing
a seven-field params bag whole to a key factory: three identifying fields,
four windowing. No retention mechanism of any kind; a sort change blanks the
grid exactly as a new search does; and the search-term setter is the raw state
setter that **does not reset the page**, so the one-directional rule is
backwards on the half that matters.

**Verdict `unmeasurable`, not `better`, and the reason is worth stating
plainly**: pagination is off by default with no caller enabling it, and the
sort setters exist in a context type with no shipped control calling them. Both
windowing coordinates sit in the key and are unreachable from the UI, so no
gate here can see a difference no user can trigger. Instrument named as the
vocabulary requires: a rendering test that changes one windowing coordinate and
asserts the content region survives, plus its twin on the identifying axis.

**Structural fact nobody designed**: the mixed-axis key was built *before any
control could exercise it*. The bag is what arrives naturally when a params
object is assembled from everything the fetch needs; the classification is the
thing someone has to decide to add. That is the best available argument for
declaring the axis at the moment the key is defined — the only moment when all
its components are in one place.

**Ship 0, and for a third reason the scorecard's binary does not cover.** Not
confirmation (the operator's pick named no project) and not size — the verdict
never reached `better`, because the defect is latent. Nothing to ship.

## Catches

- **Intent prefetch needs a keyboard signal** (`onFocus` beside
  `onMouseEnter`) — `prefetch-and-defer` already names "focus reaching an
  option" among its intent signals.
- **Geometry-identical skeleton, and hide the real element rather than unmount
  it** — `placeholder-design`, "match the real geometry".
- **100ms delay before the pending state, zero minimum display** — the source
  configures exactly this; `placeholder-design` states the same rule with the
  same numbers ("on the order of 100–300ms", "no minimum placeholder display
  duration"). Independent convergence on a published rule, which is worth more
  as corroboration than it would have been as a finding.

## Leads

- **`pagination` on the `table` subject holds two unnamed instances of the
  same axis distinction.** Its cursor rules treat "changing sort or filter" as
  one event where the new technique splits them; its closing line bundles
  "(page or cursor, size, sort, filter)" into one undifferentiated window
  state. Neither is wrong enough to correct blind. Return condition: the next
  sweep of `table`, read with the classification in hand.

## Untriaged — extracted, reached the table, never picked

Recorded with anchors so a later run does not re-derive them. **Nobody
verified these**; they carry no judgment.

| # | Candidate | Anchor |
| --- | --- | --- |
| 2 | Warmth from a sibling entry's payload — and the seeded *key* that collapses a waterfall, not just a spinner. Would be a **fourth** member of `client-fetch-cache`'s declared "warmth is engineered at three points in time", and the only one that is not a point in time. Its cost: the source entry's key coordinates become part of the consumer's addressing contract, and vanish silently on a deep link | branch 3 and `$id.tsx` on branch 6: `placeholderData` reads the list entry; the seeded `authorId` gives the dependent query a real key before the detail fetch returns |
| 3 | Declare cache policy on the key **prefix**, not the call site; call sites carry only deviations. Directly amends `plural-policy-claims`, landed 40 minutes before this run by a sibling | branch 2 `main.tsx`: `setQueryDefaults(bookQueries.all(), { staleTime })`, with the 20-minute author exception left at the factory |
| 4 | Two live caches over one datum: set one to zero rather than tuning both. Adjacent prior art exists in the *persistence* framing (`persistence-and-migration`: "a persisted copy is a second cache with independent staleness"), not in the two-in-memory-caches framing | branch 6 router config: `defaultGcTime: 0`, `defaultPreloadStaleTime: 0`, delegating all caching to the query client |
| 5 | Opt-in persistence declared on the datum via typed metadata, the narrowing predicate **composed with** the library's correctness filter rather than substituted for it, and a restore barrier that renders nothing until rehydration completes | branch 5 `meta: { persist: true }` + `defaultShouldDehydrateQuery(query) && query.meta?.persist === true`; branch 6 `PersistGate` on `useIsRestoring` |

## For the next run over a repository of this class

- **A workshop repo's `words:` count is a lie about its size.** 158 README
  words and 13 files scored as thin on every heuristic; the source was seven
  branch diffs. Before concluding a repository is thin, run
  `git ls-remote --heads` — a branch list that reads as a curriculum *is* the
  operating document this method tells you to sweep first, and it is the one
  form of operating document that never appears in a file listing.
- **A `--depth 1` clone hides it.** The default clone shows one branch; the
  curriculum is invisible until the other refs are fetched.
- **The most valuable diff was the one that replaced working code with
  different working code.** Steps 4 and 7 produce the same visual affordance
  by two mechanisms at two layers. A step that adds a feature teaches what the
  library does; a step that *rewrites* an earlier step teaches what the author
  learned, and it is the only place in a curriculum where two designs for one
  problem sit side by side with the author's preference recorded as the
  ordering.

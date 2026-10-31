---
subject: client-fetch-cache
domain: software-engineering
last_touched: 2026-09-08
touched_by: intake
dry_streak: 0
---

# client-fetch-cache

Touched by [[2026-09-03-awesome-langchain]], a reference index whose references — not
its text — were the source. Gained `similarity-keyed-admission`; `admission-hypothesis`
and `cache-key-discipline` each gained a scoping section.

## What the gap actually was

An **enumeration that denied a live category**. `admission-hypothesis` says "There are
only a few bets available", lists four, and every one is a bet about time or adjacency
that assumes the key is an identity — so a hit is a proof. It then rules the category
out by example: "a search keyed on free text the user will never retype". A cache keyed
on resemblance runs on a fifth bet, paraphrase recurrence, under which a hit can be
**wrong** rather than merely old, and that single change reorganizes all four policies.
Lifetime stops being the whole defence. The prescribed axis audit can pass clean while
the cache serves wrong answers, because the collision boundary lives in the cut-point,
outside every axis the audit walks. And eviction by recency **reinforces** an attractive
wrong entry, because a hit refreshes it whether or not it was correct — a failure an
identity-keyed cache cannot have.

## What three projects then did to it

Three apply lanes returned `not-better` for three unrelated reasons, and all three were
boundaries rather than refutations. The technique gained a scope section from each: a
reject arm carrying unrelated bookkeeping (two shipped incidents, both at a *correct*
metric and cut-point); a normalization equivalence class, which is identity after a
total function; and a projection-scoped memo whose key is exact on its own domain.

The method lesson recorded from this: demote a technique on `not-better` rows only when
the mechanism failed where it applied, not when the precondition was absent. The current
rule ("two `not-better` rows from different projects demote it to a lead") would have
demoted a technique that three trees had just finished sharpening.

## Open

## 2026-09-01 - inbox leads landed under the librarian sweep ([[2026-09-01-1]])

Two leads from the ascent sweep, both landed as amendments plus one application.
`in-flight-dedup` gains "invalidation reaches the flight, not just the entry": a per-flight
identity token minted at launch and checked at settle; a superseded flight resolves its
joiners but writes nothing back and is not joinable; the reaper deletes only the entry it
registered. `swr-design` names explicit invalidation's second obligation. `cache-key-discipline`
gains the absent-component sentinel (built from the unforgeable joiner; never the empty
string; never omission). Application `next--in-flight-dedup` at ascent `7ed00bb9` documents
the identity-checked reaper AND the gap (a bare delete never touches in-flight scans).
Corroborated by two independent query-cache libraries' cancel-on-invalidate behaviour.
Proposals placed in the run note: reciprocal pointer in client-state `async-race-guards`;
`invalidation-strategy` should state that invalidation retires in-flight work; the settle-time
identity check is a general single-flight rule.
Precision is unmeasured in every tree examined — all three carry recall-shaped hit
counters and none has a negative set. Return when a fleet project can produce one.

## 2026-09-06 - the tolerance is priced against a residual ([[2026-09-06-aws-agent-exposure]])

`similarity-keyed-admission` gained a **precondition on its own central trade**,
not a new mechanism - the mechanism was already in the corpus, in two other
subjects, and had never been joined to this one.

The technique reads: an expensive, slow, approximate authority can rationally
buy a small false-hit rate; a cheap exact one has nothing to pay with. The
unstated premise is that the authority's cost is a **given**. Many authorities
expensive enough to justify a resemblance key also reuse their own internal work
on a repeated request prefix, at a fraction of the rate, with no possibility of
serving a wrong answer - because that tier makes no admission decision at all and
therefore has no hits to be false. The technique's closing section disclaims that
tier, correctly. But the disclaimed tier removes cost from **the same bill** the
resemblance cache is paid out of, so the trade cannot be executed until it has
been exhausted: the number the rule asks you to weigh has not been established.

Three catches landed against this subject in the same run and are worth
recording, because they are the calibration for the landing: the source's
account of the false-hit failure, of hit-rate-as-recall, and of the attractive
wrong entry are all **already here and stated better** - this technique reaches
the precision trap through the independently labelled negative set, which the
source never mentions.

Corroboration was corpus-internal and is the interesting part:
`model-routing/cache-continuity` already prices this tier (read ~0.1x base,
write ~1.25x) and `prompt-assembly/cache-breakpoint-allocation` already allocates
its cut points. Both halves present, in two subjects, never joined - the same
shape as the 2026-08-31 `reliability-aggregation` landing.

**Unapplied**, with the population stated: one resemblance-lookup site across
eight fleet projects, and reading it showed a *matcher* that routes and then
still does the work, not a cache serving a stored answer in its place. No
false-hit rate is being purchased there, so there is no residual to price.
Return when a fleet project builds a cache that serves a stored answer on a
resemblance match.

Touched by [[2026-09-08-awesome-gpt-6-astra-games]], a repository run over a showcase site
that serves a parsed upstream document with stale-while-revalidate on the server. `swr-design`
gained a boundary subsection, **what counts as a failed revalidation**: a 200 whose body the
reader cannot recognise is a failed refresh (entry stays, age untouched, failure reported),
an explicitly empty recognised document is a success that writes through, and a cold-start
snapshot keeps its own success stamp under a third status word, `fallback`. Convergence was
corpus-internal (`public-verdict-badge/outcome-branched-cache` already types the
`found/absent/error` outcome for its surface) plus a fleet project's lint rule against
silent-null catches. New source-tree application `node--swr-design` with an `ab-paired` proof
run in the source's own harness. **Applied in code and shipped**: tracklight's span-journal
recovery returned an empty list for an unlistable directory, indistinguishable from a clean
start; the seam was chosen because it documented that choice as deliberate, and the boundary
that survived is ENOENT, which stays a genuine empty.

## Architecture review - 2026-10-31

First architecture review, against `0f30830bc`. All 20 documents read in full. The
plural-claim mechanics the subject rests on were checked against the pinned
TanStack Query core the cache-key application already cites: retention is a
monotonic maximum, staleness is existential over attached observers, and a focus
signal refetches through the first observer that wants it. The `Map`/`Set`
collision that application reports reproduces. The two `react--` applications
have drifted from their tree: one cited component no longer exists, the dev-clone
slot names are gone, and the SWR primitive now carries a per-request identity token
and recency re-ordering on fresh reads, which removes part of what the deviations
list describes. They are `reverify`, not refreshed. Two internal inconsistencies
are fixable in place: the golden path's technique list omits both admission
techniques and its bet list never points at the fifth bet, and the warm-remount
decision rule prescribes a map where its own prose says a keyed single slot is the
right size.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/client-fetch-cache",
  "date": "2026-10-31",
  "baseline": "0f30830bc",
  "digest": "sha256-b2:20824426732ffb6a",
  "disposition": "clarify",
  "coverage": "All 20 documents (golden path, 11 techniques, 8 applications) read in full. Primary-source checks: pinned TanStack Query core (hashKey, isPlainObject, gcTime resolution, observer staleness, focus refetch) and the SWR and TanStack documented defaults. Consumer trees behind the next-- applications and the node-- showcase tree were not reopened; the react-- consumer tree was spot-checked and found drifted.",
  "trigger": "Pending: the subject had no architecture-review record.",
  "intended_benefit": "One client-side layer that answers key, lifetime, eviction and admission at construction, joins identical flights, and keeps stale truth visible, so surfaces neither fetch three times nor paint ghosts nor serve one question's answer to another.",
  "failure_if_ignored": "Accreted fetch layers: duplicate requests at mount, cold remounts, focus refetch storms, unbounded memory, silent cross-identity collisions and wrong hits under resemblance keys.",
  "boundary": "Client-held caches between call wrapping and stores/surfaces. Store structure and invalidation strategy belong to client-state; presentation to async-ui-states; cross-process single-flight to concurrency-guards; caching inside the called authority is excluded.",
  "counterexamples": [
    "A canonicalized or projection-keyed memo looks like a resemblance key at the call site but is an identity key; none of similarity-keyed-admission's costs apply.",
    "A value about to be acted on (a balance before a transfer) should bypass stale-while-revalidate at the point of consequence.",
    "TanStack Query's default hash serializes Map and Set as {} so two different keys share one entry, despite one builder and canonical object serialization.",
    "A prefetcher's longer freshness claim is inert while a consumer with a shorter claim is attached; the warmth it declared is never reached.",
    "On a deep link or reload there is no sibling list entry to borrow; the cold path is the design for those users."
  ],
  "sources": [
    {
      "url": "https://github.com/TanStack/query/blob/40321a0/packages/query-core/src/utils.ts",
      "result": "hashKey (232-243) is JSON.stringify with a replacer that sorts keys only of objects passing isPlainObject (361-390), which requires toString tag [object Object]. JSON.stringify([\"t\", new Map([[\"a\",1]])]) and a Set both yield [\"t\",{}] (reproduced locally). Supports the node--cache-key-discipline collision claim and its line anchors."
    },
    {
      "url": "https://github.com/TanStack/query/blob/40321a0/packages/query-core/src/removable.ts",
      "result": "updateGcTime: \"this.gcTime = Math.max(this.gcTime || 0, newGcTime ?? ...5 * 60 * 1000)\". Supports plural-policy-claims: eviction resolves by maximum and never shrinks."
    },
    {
      "url": "https://github.com/TanStack/query/blob/40321a0/packages/query-core/src/query.ts",
      "result": "isStale: \"return this.observers.some((observer) => observer.getCurrentResult().isStale)\"; onFocus: \"const observer = this.observers.find((x) => x.shouldFetchOnWindowFocus())\" then one refetch. Supports existential believability and the one-claimant trigger rule."
    },
    {
      "url": "https://swr.vercel.app/docs/api",
      "result": "\"revalidateOnFocus = true: automatically revalidate when window gets focused\". Supports swr-design's claim that focus revalidation is a default posture of popular tools."
    },
    {
      "url": "https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults",
      "result": "\"Stale queries are refetched automatically in the background when ... The window is refocused\"; inactive queries garbage collected after 5 minutes. Corroborates swr-design (with the nuance that only stale queries refetch, and the default staleTime makes every query stale)."
    },
    {
      "source": "react-- consumer tree at its current head",
      "result": "staleWhileRevalidate.ts now mints a per-request identity token, drops the in-flight entry on invalidation, and re-sets fresh hits for recency; the cited CompetitionList.tsx is gone, cachedDevClone/cachedTriggers are gone from LifecyclePage.tsx, the certLastRefreshedAt latch is gone. Refutes parts of both react-- applications as current descriptions."
    },
    {
      "source": "next-- and node-- consumer applications",
      "result": "Dated paired-proof and census accounts retained; their private or unpinned trees were not reopened. Verification dates unchanged."
    }
  ],
  "documents": {
    "client-fetch-cache.md": {
      "disposition": "clarify",
      "reason": "The technique list names 9 of the 11 frontmatter techniques (admission-hypothesis and similarity-keyed-admission missing), and the Admission bullet says only four bets exist without scoping them to identity keys or pointing at the fifth bet its own technique now carries."
    },
    "techniques/admission-hypothesis.md": {
      "disposition": "keep",
      "reason": "Four bets, eviction-axis match, reachability-versus-conversion and the fifth-bet scoping are coherent; its next--admission-hypothesis application measures exactly the reachability rule."
    },
    "techniques/similarity-keyed-admission.md": {
      "disposition": "keep",
      "reason": "Falsity-not-staleness, metric-plus-cut-point, vetoing ladder, reinforcing eviction, precision needing a negative set, reject-arm scope, canonicalization/projection boundary and residual pricing are distinct and internally consistent; field claims are labelled as such."
    },
    "techniques/swr-design.md": {
      "disposition": "keep",
      "reason": "Three zones, failure that never stamps freshness, invalidation retiring the flight and the recognised-empty versus unrecognisable boundary hold; the focus-revalidation default claim is confirmed by SWR and TanStack documentation."
    },
    "techniques/in-flight-dedup.md": {
      "disposition": "keep",
      "reason": "Synchronous registration, identity-checked reaper, invalidation reaching the flight, failure fan-out and the dedup/idempotency boundary are consistent with swr-design and its next-- application."
    },
    "techniques/cache-key-discipline.md": {
      "disposition": "keep",
      "reason": "Asymmetry with its stated precondition, derived keys, canonical serialization, absent-sentinel and the collision audit hold; the Map/Set counterexample in its application is consistent with the totality requirement."
    },
    "techniques/warm-remount-caches.md": {
      "disposition": "clarify",
      "reason": "Prose says a keyed single slot is the right size for the view just left and to reach for a map only when several scopes are live, but the first decision rule prescribes a map per request family."
    },
    "techniques/prefetch-and-defer.md": {
      "disposition": "clarify",
      "reason": "Content holds; a stray soft hyphen (U+00AD) sits before an em dash in the prefetch-failure bullet."
    },
    "techniques/parse-and-derive-caches.md": {
      "disposition": "keep",
      "reason": "Content-identity keying with declared spelling, purity, weak-reference reaping, derivation versioning and deterministic-only failure caching are sound."
    },
    "techniques/plural-policy-claims.md": {
      "disposition": "keep",
      "reason": "Per-policy quantifiers match the pinned TanStack core: Math.max gcTime, observers.some staleness, and one observer refetching on focus; the clock-starts-on-last-detach distinction stands."
    },
    "techniques/portable-read-definitions.md": {
      "disposition": "keep",
      "reason": "Invariant-in-definition versus per-consumer-at-call-site and the untypeable pass-through argument are coherent and backed by its next-- build failure account."
    },
    "techniques/sibling-entry-warmth.md": {
      "disposition": "keep",
      "reason": "Summary-typed borrowing, placeholder-only status, lookup by entity id across the family and the cold twin are sound; consistent with the golden path's fourth warmth source."
    },
    "applications/next--admission-hypothesis.md": {
      "disposition": "keep",
      "reason": "Arithmetic is consistent (5/7 is 71 percent); limits are stated. Private tree not reopened; verification date unchanged."
    },
    "applications/next--in-flight-dedup.md": {
      "disposition": "keep",
      "reason": "States the met identity-at-settle rule and the unmet invalidation half with its bound. Private tree not reopened."
    },
    "applications/next--plural-policy-claims.md": {
      "disposition": "clarify",
      "reason": "Owed, not applied: 'list detail' is tabled as consistent while next--portable-read-definitions reports a 60000 declaration among that key's copies; and 'four carry a divergent claim' disagrees with the two divergences counted and tabled. Needs the private tree to reconcile."
    },
    "applications/next--portable-read-definitions.md": {
      "disposition": "keep",
      "reason": "Hand-verified counts, the instrument's blind spots and the typecheck-only verification are disclosed. Private tree not reopened."
    },
    "applications/node--cache-key-discipline.md": {
      "disposition": "keep",
      "reason": "Tree A's hashKey/isPlainObject anchors and the Map/Set collision re-confirmed at the pinned commit; Tree B is a private tree not reopened, so verified_on stays. A repeated pin sentence in Tree A's intro is cosmetic."
    },
    "applications/node--swr-design.md": {
      "disposition": "keep",
      "reason": "Pinned commit, paired proof and the heuristic-recognition and per-instance limits are stated. Tree not reopened."
    },
    "applications/react--swr-design.md": {
      "disposition": "reverify",
      "reason": "The primitive has moved: a per-request identity token, invalidation dropping the in-flight entry, and fresh-hit recency re-ordering. The insertion-order eviction description and possibly the deviations list need re-deriving at a pinned commit; paths are also printed twice."
    },
    "applications/react--warm-remount-caches.md": {
      "disposition": "reverify",
      "reason": "CompetitionList.tsx no longer exists (the keyed-slot pattern now appears in useLlmPinpoints.ts), LifecyclePage no longer holds cachedDevClone/cachedTriggers, and the cited ageless latch is gone. Needs re-deriving against the current tree."
    }
  }
}
```

Second record after Phase B: the golden path's technique list and fifth-bet pointer,
the warm-remount decision rule, and a stray soft hyphen were fixed in place. The
next--plural-policy-claims reconciliation stays owed (needs the private tree), and the
two react-- applications stay `reverify`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/client-fetch-cache",
  "date": "2026-10-31",
  "baseline": "0f30830bc",
  "digest": "sha256-b2:ede62f90f88c4de7",
  "disposition": "clarify",
  "coverage": "All 20 documents (golden path, 11 techniques, 8 applications) read in full. Primary-source checks: pinned TanStack Query core (hashKey, isPlainObject, gcTime resolution, observer staleness, focus refetch) and the SWR and TanStack documented defaults. Consumer trees behind the next-- applications and the node-- showcase tree were not reopened; the react-- consumer tree was spot-checked and found drifted. Second record after applying three internal-consistency clarifications; next--plural-policy-claims stays owed, two react-- applications stay reverify.",
  "trigger": "Phase B applied three clarify items from the record above; this record is against the edited bytes.",
  "intended_benefit": "One client-side layer that answers key, lifetime, eviction and admission at construction, joins identical flights, and keeps stale truth visible, so surfaces neither fetch three times nor paint ghosts nor serve one question's answer to another.",
  "failure_if_ignored": "Accreted fetch layers: duplicate requests at mount, cold remounts, focus refetch storms, unbounded memory, silent cross-identity collisions and wrong hits under resemblance keys.",
  "boundary": "Client-held caches between call wrapping and stores/surfaces. Store structure and invalidation strategy belong to client-state; presentation to async-ui-states; cross-process single-flight to concurrency-guards; caching inside the called authority is excluded.",
  "counterexamples": [
    "A canonicalized or projection-keyed memo looks like a resemblance key at the call site but is an identity key; none of similarity-keyed-admission's costs apply.",
    "A value about to be acted on (a balance before a transfer) should bypass stale-while-revalidate at the point of consequence.",
    "TanStack Query's default hash serializes Map and Set as {} so two different keys share one entry, despite one builder and canonical object serialization.",
    "A prefetcher's longer freshness claim is inert while a consumer with a shorter claim is attached; the warmth it declared is never reached.",
    "On a deep link or reload there is no sibling list entry to borrow; the cold path is the design for those users."
  ],
  "sources": [
    {
      "url": "https://github.com/TanStack/query/blob/40321a0/packages/query-core/src/utils.ts",
      "result": "hashKey (232-243) is JSON.stringify with a replacer that sorts keys only of objects passing isPlainObject (361-390), which requires toString tag [object Object]. JSON.stringify([\"t\", new Map([[\"a\",1]])]) and a Set both yield [\"t\",{}] (reproduced locally). Supports the node--cache-key-discipline collision claim and its line anchors."
    },
    {
      "url": "https://github.com/TanStack/query/blob/40321a0/packages/query-core/src/removable.ts",
      "result": "updateGcTime: \"this.gcTime = Math.max(this.gcTime || 0, newGcTime ?? ...5 * 60 * 1000)\". Supports plural-policy-claims: eviction resolves by maximum and never shrinks."
    },
    {
      "url": "https://github.com/TanStack/query/blob/40321a0/packages/query-core/src/query.ts",
      "result": "isStale: \"return this.observers.some((observer) => observer.getCurrentResult().isStale)\"; onFocus: \"const observer = this.observers.find((x) => x.shouldFetchOnWindowFocus())\" then one refetch. Supports existential believability and the one-claimant trigger rule."
    },
    {
      "url": "https://swr.vercel.app/docs/api",
      "result": "\"revalidateOnFocus = true: automatically revalidate when window gets focused\". Supports swr-design's claim that focus revalidation is a default posture of popular tools."
    },
    {
      "url": "https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults",
      "result": "\"Stale queries are refetched automatically in the background when ... The window is refocused\"; inactive queries garbage collected after 5 minutes. Corroborates swr-design (with the nuance that only stale queries refetch, and the default staleTime makes every query stale)."
    },
    {
      "source": "react-- consumer tree at its current head",
      "result": "staleWhileRevalidate.ts now mints a per-request identity token, drops the in-flight entry on invalidation, and re-sets fresh hits for recency; the cited CompetitionList.tsx is gone, cachedDevClone/cachedTriggers are gone from LifecyclePage.tsx, the certLastRefreshedAt latch is gone. Refutes parts of both react-- applications as current descriptions."
    },
    {
      "source": "next-- and node-- consumer applications",
      "result": "Dated paired-proof and census accounts retained; their private or unpinned trees were not reopened. Verification dates unchanged."
    }
  ],
  "documents": {
    "client-fetch-cache.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: technique list now names admission-hypothesis and similarity-keyed-admission; the Admission bullet scopes the four bets to identity keys and points at the fifth bet."
    },
    "techniques/admission-hypothesis.md": {
      "disposition": "keep",
      "reason": "Four bets, eviction-axis match, reachability-versus-conversion and the fifth-bet scoping are coherent; its next--admission-hypothesis application measures exactly the reachability rule."
    },
    "techniques/similarity-keyed-admission.md": {
      "disposition": "keep",
      "reason": "Falsity-not-staleness, metric-plus-cut-point, vetoing ladder, reinforcing eviction, precision needing a negative set, reject-arm scope, canonicalization/projection boundary and residual pricing are distinct and internally consistent; field claims are labelled as such."
    },
    "techniques/swr-design.md": {
      "disposition": "keep",
      "reason": "Three zones, failure that never stamps freshness, invalidation retiring the flight and the recognised-empty versus unrecognisable boundary hold; the focus-revalidation default claim is confirmed by SWR and TanStack documentation."
    },
    "techniques/in-flight-dedup.md": {
      "disposition": "keep",
      "reason": "Synchronous registration, identity-checked reaper, invalidation reaching the flight, failure fan-out and the dedup/idempotency boundary are consistent with swr-design and its next-- application."
    },
    "techniques/cache-key-discipline.md": {
      "disposition": "keep",
      "reason": "Asymmetry with its stated precondition, derived keys, canonical serialization, absent-sentinel and the collision audit hold; the Map/Set counterexample in its application is consistent with the totality requirement."
    },
    "techniques/warm-remount-caches.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: first decision rule now prescribes a keyed single slot by default and a capped map only when several scopes are live, matching the prose."
    },
    "techniques/prefetch-and-defer.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: removed the stray soft hyphen in the prefetch-failure bullet."
    },
    "techniques/parse-and-derive-caches.md": {
      "disposition": "keep",
      "reason": "Content-identity keying with declared spelling, purity, weak-reference reaping, derivation versioning and deterministic-only failure caching are sound."
    },
    "techniques/plural-policy-claims.md": {
      "disposition": "keep",
      "reason": "Per-policy quantifiers match the pinned TanStack core: Math.max gcTime, observers.some staleness, and one observer refetching on focus; the clock-starts-on-last-detach distinction stands."
    },
    "techniques/portable-read-definitions.md": {
      "disposition": "keep",
      "reason": "Invariant-in-definition versus per-consumer-at-call-site and the untypeable pass-through argument are coherent and backed by its next-- build failure account."
    },
    "techniques/sibling-entry-warmth.md": {
      "disposition": "keep",
      "reason": "Summary-typed borrowing, placeholder-only status, lookup by entity id across the family and the cold twin are sound; consistent with the golden path's fourth warmth source."
    },
    "applications/next--admission-hypothesis.md": {
      "disposition": "keep",
      "reason": "Arithmetic is consistent (5/7 is 71 percent); limits are stated. Private tree not reopened; verification date unchanged."
    },
    "applications/next--in-flight-dedup.md": {
      "disposition": "keep",
      "reason": "States the met identity-at-settle rule and the unmet invalidation half with its bound. Private tree not reopened."
    },
    "applications/next--plural-policy-claims.md": {
      "disposition": "clarify",
      "reason": "Owed, not applied: 'list detail' is tabled as consistent while next--portable-read-definitions reports a 60000 declaration among that key's copies; and 'four carry a divergent claim' disagrees with the two divergences counted and tabled. Needs the private tree to reconcile."
    },
    "applications/next--portable-read-definitions.md": {
      "disposition": "keep",
      "reason": "Hand-verified counts, the instrument's blind spots and the typecheck-only verification are disclosed. Private tree not reopened."
    },
    "applications/node--cache-key-discipline.md": {
      "disposition": "keep",
      "reason": "Tree A's hashKey/isPlainObject anchors and the Map/Set collision re-confirmed at the pinned commit; Tree B is a private tree not reopened, so verified_on stays. A repeated pin sentence in Tree A's intro is cosmetic."
    },
    "applications/node--swr-design.md": {
      "disposition": "keep",
      "reason": "Pinned commit, paired proof and the heuristic-recognition and per-instance limits are stated. Tree not reopened."
    },
    "applications/react--swr-design.md": {
      "disposition": "reverify",
      "reason": "The primitive has moved: a per-request identity token, invalidation dropping the in-flight entry, and fresh-hit recency re-ordering. The insertion-order eviction description and possibly the deviations list need re-deriving at a pinned commit; paths are also printed twice."
    },
    "applications/react--warm-remount-caches.md": {
      "disposition": "reverify",
      "reason": "CompetitionList.tsx no longer exists (the keyed-slot pattern now appears in useLlmPinpoints.ts), LifecyclePage no longer holds cachedDevClone/cachedTriggers, and the cited ageless latch is gone. Needs re-deriving against the current tree."
    }
  }
}
```

Third record, following re-verification of applications: the two react-- applications were re-checked against personas@`22260d77`; their citations now hold but each body still contradicts its own dated note, so both move from `reverify` to `clarify`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/client-fetch-cache",
  "date": "2026-10-31",
  "baseline": "de4847953",
  "digest": "sha256-b2:41563f71c45ac5a1",
  "disposition": "clarify",
  "coverage": "Third record, after re-verification of the two react-- applications against personas@22260d77. Both changed documents read in full and diffed against 0f30830bc; the other 18 documents are byte-identical to the second record and carry its dispositions. Primary-source checks from the first record stand. next-- and node-- trees were not reopened.",
  "trigger": "A re-verification worker edited react--swr-design and react--warm-remount-caches (verified_on and verified_against moved, dated re-check paragraphs appended), staling the second record.",
  "intended_benefit": "One client-side layer that answers key, lifetime, eviction and admission at construction, joins identical flights, and keeps stale truth visible, so surfaces neither fetch three times nor paint ghosts nor serve one question's answer to another.",
  "failure_if_ignored": "Accreted fetch layers: duplicate requests at mount, cold remounts, focus refetch storms, unbounded memory, silent cross-identity collisions and wrong hits under resemblance keys.",
  "boundary": "Client-held caches between call wrapping and stores/surfaces. Store structure and invalidation strategy belong to client-state; presentation to async-ui-states; cross-process single-flight to concurrency-guards; caching inside the called authority is excluded.",
  "counterexamples": [
    "A canonicalized or projection-keyed memo looks like a resemblance key at the call site but is an identity key; none of similarity-keyed-admission's costs apply.",
    "A value about to be acted on (a balance before a transfer) should bypass stale-while-revalidate at the point of consequence.",
    "TanStack Query's default hash serializes Map and Set as {} so two different keys share one entry, despite one builder and canonical object serialization.",
    "A prefetcher's longer freshness claim is inert while a consumer with a shorter claim is attached; the warmth it declared is never reached.",
    "On a deep link or reload there is no sibling list entry to borrow; the cold path is the design for those users."
  ],
  "sources": [
    {
      "url": "https://github.com/TanStack/query/blob/40321a0/packages/query-core/src/utils.ts",
      "result": "hashKey (232-243) is JSON.stringify with a replacer that sorts keys only of objects passing isPlainObject (361-390), which requires toString tag [object Object]. JSON.stringify([\"t\", new Map([[\"a\",1]])]) and a Set both yield [\"t\",{}] (reproduced locally). Supports the node--cache-key-discipline collision claim and its line anchors."
    },
    {
      "url": "https://github.com/TanStack/query/blob/40321a0/packages/query-core/src/removable.ts",
      "result": "updateGcTime: \"this.gcTime = Math.max(this.gcTime || 0, newGcTime ?? ...5 * 60 * 1000)\". Supports plural-policy-claims: eviction resolves by maximum and never shrinks."
    },
    {
      "url": "https://github.com/TanStack/query/blob/40321a0/packages/query-core/src/query.ts",
      "result": "isStale: \"return this.observers.some((observer) => observer.getCurrentResult().isStale)\"; onFocus: \"const observer = this.observers.find((x) => x.shouldFetchOnWindowFocus())\" then one refetch. Supports existential believability and the one-claimant trigger rule."
    },
    {
      "url": "https://swr.vercel.app/docs/api",
      "result": "\"revalidateOnFocus = true: automatically revalidate when window gets focused\". Supports swr-design's claim that focus revalidation is a default posture of popular tools."
    },
    {
      "url": "https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults",
      "result": "\"Stale queries are refetched automatically in the background when ... The window is refocused\"; inactive queries garbage collected after 5 minutes. Corroborates swr-design (with the nuance that only stale queries refetch, and the default staleTime makes every query stale)."
    },
    {
      "source": "react-- applications as re-checked at personas@22260d77",
      "result": "The dated notes confirm the SWR primitive paths and its first two deviations, record the per-request token and fresh-hit recency re-set, and resolve the keyed-dedup serialization deviation (deduplicatedFetchKey is canonical). They report both warm-remount precedents (CompetitionList.tsx, LifecyclePage cached slots) and the useCertificationData latch gone, the rule moved from overview-loading law 4 to golden-paths/page-loading.md, and createTtlValueCache and reviewParseCache holding as described."
    },
    {
      "source": "next-- and node-- consumer applications",
      "result": "Dated paired-proof and census accounts retained; their private or unpinned trees were not reopened. Verification dates unchanged."
    }
  ],
  "documents": {
    "client-fetch-cache.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: technique list now names admission-hypothesis and similarity-keyed-admission; the Admission bullet scopes the four bets to identity keys and points at the fifth bet."
    },
    "techniques/admission-hypothesis.md": {
      "disposition": "keep",
      "reason": "Four bets, eviction-axis match, reachability-versus-conversion and the fifth-bet scoping are coherent; its next--admission-hypothesis application measures exactly the reachability rule."
    },
    "techniques/similarity-keyed-admission.md": {
      "disposition": "keep",
      "reason": "Falsity-not-staleness, metric-plus-cut-point, vetoing ladder, reinforcing eviction, precision needing a negative set, reject-arm scope, canonicalization/projection boundary and residual pricing are distinct and internally consistent; field claims are labelled as such."
    },
    "techniques/swr-design.md": {
      "disposition": "keep",
      "reason": "Three zones, failure that never stamps freshness, invalidation retiring the flight and the recognised-empty versus unrecognisable boundary hold; the focus-revalidation default claim is confirmed by SWR and TanStack documentation."
    },
    "techniques/in-flight-dedup.md": {
      "disposition": "keep",
      "reason": "Synchronous registration, identity-checked reaper, invalidation reaching the flight, failure fan-out and the dedup/idempotency boundary are consistent with swr-design and its next-- application."
    },
    "techniques/cache-key-discipline.md": {
      "disposition": "keep",
      "reason": "Asymmetry with its stated precondition, derived keys, canonical serialization, absent-sentinel and the collision audit hold; the Map/Set counterexample in its application is consistent with the totality requirement."
    },
    "techniques/warm-remount-caches.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: first decision rule now prescribes a keyed single slot by default and a capped map only when several scopes are live, matching the prose."
    },
    "techniques/prefetch-and-defer.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: removed the stray soft hyphen in the prefetch-failure bullet."
    },
    "techniques/parse-and-derive-caches.md": {
      "disposition": "keep",
      "reason": "Content-identity keying with declared spelling, purity, weak-reference reaping, derivation versioning and deterministic-only failure caching are sound."
    },
    "techniques/plural-policy-claims.md": {
      "disposition": "keep",
      "reason": "Per-policy quantifiers match the pinned TanStack core: Math.max gcTime, observers.some staleness, and one observer refetching on focus; the clock-starts-on-last-detach distinction stands."
    },
    "techniques/portable-read-definitions.md": {
      "disposition": "keep",
      "reason": "Invariant-in-definition versus per-consumer-at-call-site and the untypeable pass-through argument are coherent and backed by its next-- build failure account."
    },
    "techniques/sibling-entry-warmth.md": {
      "disposition": "keep",
      "reason": "Summary-typed borrowing, placeholder-only status, lookup by entity id across the family and the cold twin are sound; consistent with the golden path's fourth warmth source."
    },
    "applications/next--admission-hypothesis.md": {
      "disposition": "keep",
      "reason": "Arithmetic is consistent (5/7 is 71 percent); limits are stated. Private tree not reopened; verification date unchanged."
    },
    "applications/next--in-flight-dedup.md": {
      "disposition": "keep",
      "reason": "States the met identity-at-settle rule and the unmet invalidation half with its bound. Private tree not reopened."
    },
    "applications/next--plural-policy-claims.md": {
      "disposition": "clarify",
      "reason": "Owed, not applied: 'list detail' is tabled as consistent while next--portable-read-definitions reports a 60000 declaration among that key's copies; and 'four carry a divergent claim' disagrees with the two divergences counted and tabled. Needs the private tree to reconcile."
    },
    "applications/next--portable-read-definitions.md": {
      "disposition": "keep",
      "reason": "Hand-verified counts, the instrument's blind spots and the typecheck-only verification are disclosed. Private tree not reopened."
    },
    "applications/node--cache-key-discipline.md": {
      "disposition": "keep",
      "reason": "Tree A's hashKey/isPlainObject anchors and the Map/Set collision re-confirmed at the pinned commit; Tree B is a private tree not reopened, so verified_on stays. A repeated pin sentence in Tree A's intro is cosmetic."
    },
    "applications/node--swr-design.md": {
      "disposition": "keep",
      "reason": "Pinned commit, paired proof and the heuristic-recognition and per-instance limits are stated. Tree not reopened."
    },
    "applications/react--swr-design.md": {
      "disposition": "clarify",
      "reason": "re-verified 2026-10-31 against personas@22260d77; citations hold and the note resolves the stale-primitive concern, but the body still lists the keyed-dedup JSON.stringify deviation the note calls resolved, still describes insertion-order eviction and ~110 lines, and still prints each path twice. Fold the note into the body."
    },
    "applications/react--warm-remount-caches.md": {
      "disposition": "clarify",
      "reason": "re-verified 2026-10-31 against personas@22260d77; the note is accurate, but title, intro (law 4 of overview-loading), both precedent sections and the first two deviations describe sites the note says are gone. Rewrite around createTtlValueCache, its importers, page-loading.md and reviewParseCache."
    }
  }
}
```

## Architecture review - 2026-10-31 (after application rewrites)

Fourth record: the two react-- applications were rewritten against personas@`22260d77`, folding each dated note into the body and moving the forged-era account under a dated History heading. Both move from `clarify` to `keep`; next--plural-policy-claims stays owed, so the subject stays `clarify`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/client-fetch-cache",
  "date": "2026-10-31",
  "baseline": "a374d84e3",
  "digest": "sha256-b2:ba2240c55d2c7c2a",
  "disposition": "clarify",
  "coverage": "Fourth record. The two rewritten react-- applications were read in full and every anchor printed at personas@22260d77 (staleWhileRevalidate.ts, deduplicateFetch.ts, tauriInvoke.ts, createCachedFetch.ts, createTtlValueCache.ts and its six constructing callers, factoryData.tsx, useProjectPulse.ts, useDataPortability.ts, reviewParseCache.ts, page-loading.md, shared-fetch-cache.md). The other 18 documents are byte-identical to the third record (git diff against de4847953 shows only the two rewrites) and carry its dispositions. next-- and node-- trees were not reopened.",
  "trigger": "The third record marked both react-- applications clarify (body contradicting its own dated note); both bodies were rewritten, staling that record.",
  "intended_benefit": "One client-side layer that answers key, lifetime, eviction and admission at construction, joins identical flights, and keeps stale truth visible, so surfaces neither fetch three times nor paint ghosts nor serve one question's answer to another.",
  "failure_if_ignored": "Accreted fetch layers: duplicate requests at mount, cold remounts, focus refetch storms, unbounded memory, silent cross-identity collisions and wrong hits under resemblance keys.",
  "boundary": "Client-held caches between call wrapping and stores/surfaces. Store structure and invalidation strategy belong to client-state; presentation to async-ui-states; cross-process single-flight to concurrency-guards; caching inside the called authority is excluded.",
  "counterexamples": [
    "A canonicalized or projection-keyed memo looks like a resemblance key at the call site but is an identity key; none of similarity-keyed-admission's costs apply.",
    "A value about to be acted on (a balance before a transfer) should bypass stale-while-revalidate at the point of consequence.",
    "TanStack Query's default hash serializes Map and Set as {} so two different keys share one entry, despite one builder and canonical object serialization.",
    "A prefetcher's longer freshness claim is inert while a consumer with a shorter claim is attached; the warmth it declared is never reached.",
    "On a deep link or reload there is no sibling list entry to borrow; the cold path is the design for those users."
  ],
  "sources": [
    {
      "url": "https://github.com/TanStack/query/blob/40321a0/packages/query-core/src/utils.ts",
      "result": "hashKey (232-243) is JSON.stringify with a replacer that sorts keys only of objects passing isPlainObject (361-390), which requires toString tag [object Object]. JSON.stringify([\"t\", new Map([[\"a\",1]])]) and a Set both yield [\"t\",{}] (reproduced locally). Supports the node--cache-key-discipline collision claim and its line anchors."
    },
    {
      "url": "https://github.com/TanStack/query/blob/40321a0/packages/query-core/src/removable.ts",
      "result": "updateGcTime: \"this.gcTime = Math.max(this.gcTime || 0, newGcTime ?? ...5 * 60 * 1000)\". Supports plural-policy-claims: eviction resolves by maximum and never shrinks."
    },
    {
      "url": "https://github.com/TanStack/query/blob/40321a0/packages/query-core/src/query.ts",
      "result": "isStale: \"return this.observers.some((observer) => observer.getCurrentResult().isStale)\"; onFocus: \"const observer = this.observers.find((x) => x.shouldFetchOnWindowFocus())\" then one refetch. Supports existential believability and the one-claimant trigger rule."
    },
    {
      "url": "https://swr.vercel.app/docs/api",
      "result": "\"revalidateOnFocus = true: automatically revalidate when window gets focused\". Supports swr-design's claim that focus revalidation is a default posture of popular tools."
    },
    {
      "url": "https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults",
      "result": "\"Stale queries are refetched automatically in the background when ... The window is refocused\"; inactive queries garbage collected after 5 minutes. Corroborates swr-design (with the nuance that only stale queries refetch, and the default staleTime makes every query stale)."
    },
    {
      "source": "react-- applications as re-checked at personas@22260d77",
      "result": "The dated notes confirm the SWR primitive paths and its first two deviations, record the per-request token and fresh-hit recency re-set, and resolve the keyed-dedup serialization deviation (deduplicatedFetchKey is canonical). They report both warm-remount precedents (CompetitionList.tsx, LifecyclePage cached slots) and the useCertificationData latch gone, the rule moved from overview-loading law 4 to golden-paths/page-loading.md, and createTtlValueCache and reviewParseCache holding as described."
    },
    {
      "source": "next-- and node-- consumer applications",
      "result": "Dated paired-proof and census accounts retained; their private or unpinned trees were not reopened. Verification dates unchanged."
    },
    {
      "source": "personas at 22260d77 (read, not executed)",
      "result": "staleWhileRevalidate.ts:32 _requestToken, :89-93 fresh-hit re-set, :96-100 in-flight await before the stale return at :133-137, :155-159 invalidation dropping cache, flight and token, :56-61 SWRResult.isRevalidating referenced nowhere; createSWRFetcher has one production importer (useDesignReviews.ts:11). createTtlValueCache.ts:39 get returns undefined past TTL, :35 uncapped Map; factoryData.tsx:240-241 factoryPaint 30 min and factoryFresh 60 s; reviewParseCache.ts:64-79 readinessScore memoized without its sets in the key. Supports both rewrites."
    }
  ],
  "documents": {
    "client-fetch-cache.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: technique list now names admission-hypothesis and similarity-keyed-admission; the Admission bullet scopes the four bets to identity keys and points at the fifth bet."
    },
    "techniques/admission-hypothesis.md": {
      "disposition": "keep",
      "reason": "Four bets, eviction-axis match, reachability-versus-conversion and the fifth-bet scoping are coherent; its next--admission-hypothesis application measures exactly the reachability rule."
    },
    "techniques/similarity-keyed-admission.md": {
      "disposition": "keep",
      "reason": "Falsity-not-staleness, metric-plus-cut-point, vetoing ladder, reinforcing eviction, precision needing a negative set, reject-arm scope, canonicalization/projection boundary and residual pricing are distinct and internally consistent; field claims are labelled as such."
    },
    "techniques/swr-design.md": {
      "disposition": "keep",
      "reason": "Three zones, failure that never stamps freshness, invalidation retiring the flight and the recognised-empty versus unrecognisable boundary hold; the focus-revalidation default claim is confirmed by SWR and TanStack documentation."
    },
    "techniques/in-flight-dedup.md": {
      "disposition": "keep",
      "reason": "Synchronous registration, identity-checked reaper, invalidation reaching the flight, failure fan-out and the dedup/idempotency boundary are consistent with swr-design and its next-- application."
    },
    "techniques/cache-key-discipline.md": {
      "disposition": "keep",
      "reason": "Asymmetry with its stated precondition, derived keys, canonical serialization, absent-sentinel and the collision audit hold; the Map/Set counterexample in its application is consistent with the totality requirement."
    },
    "techniques/warm-remount-caches.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: first decision rule now prescribes a keyed single slot by default and a capped map only when several scopes are live, matching the prose."
    },
    "techniques/prefetch-and-defer.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: removed the stray soft hyphen in the prefetch-failure bullet."
    },
    "techniques/parse-and-derive-caches.md": {
      "disposition": "keep",
      "reason": "Content-identity keying with declared spelling, purity, weak-reference reaping, derivation versioning and deterministic-only failure caching are sound."
    },
    "techniques/plural-policy-claims.md": {
      "disposition": "keep",
      "reason": "Per-policy quantifiers match the pinned TanStack core: Math.max gcTime, observers.some staleness, and one observer refetching on focus; the clock-starts-on-last-detach distinction stands."
    },
    "techniques/portable-read-definitions.md": {
      "disposition": "keep",
      "reason": "Invariant-in-definition versus per-consumer-at-call-site and the untypeable pass-through argument are coherent and backed by its next-- build failure account."
    },
    "techniques/sibling-entry-warmth.md": {
      "disposition": "keep",
      "reason": "Summary-typed borrowing, placeholder-only status, lookup by entity id across the family and the cold twin are sound; consistent with the golden path's fourth warmth source."
    },
    "applications/next--admission-hypothesis.md": {
      "disposition": "keep",
      "reason": "Arithmetic is consistent (5/7 is 71 percent); limits are stated. Private tree not reopened; verification date unchanged."
    },
    "applications/next--in-flight-dedup.md": {
      "disposition": "keep",
      "reason": "States the met identity-at-settle rule and the unmet invalidation half with its bound. Private tree not reopened."
    },
    "applications/next--plural-policy-claims.md": {
      "disposition": "clarify",
      "reason": "Owed, not applied: 'list detail' is tabled as consistent while next--portable-read-definitions reports a 60000 declaration among that key's copies; and 'four carry a divergent claim' disagrees with the two divergences counted and tabled. Needs the private tree to reconcile."
    },
    "applications/next--portable-read-definitions.md": {
      "disposition": "keep",
      "reason": "Hand-verified counts, the instrument's blind spots and the typecheck-only verification are disclosed. Private tree not reopened."
    },
    "applications/node--cache-key-discipline.md": {
      "disposition": "keep",
      "reason": "Tree A's hashKey/isPlainObject anchors and the Map/Set collision re-confirmed at the pinned commit; Tree B is a private tree not reopened, so verified_on stays. A repeated pin sentence in Tree A's intro is cosmetic."
    },
    "applications/node--swr-design.md": {
      "disposition": "keep",
      "reason": "Pinned commit, paired proof and the heuristic-recognition and per-instance limits are stated. Tree not reopened."
    },
    "applications/react--swr-design.md": {
      "disposition": "keep",
      "reason": "rewritten 2026-10-31 against personas@22260d77: body now describes the 166-line primitive (per-request token, invalidation retiring the flight, recency-ordered eviction on hits and writes), the single production consumer, and the canonical deduplicatedFetchKey; deviations restated as two holding (no stale ceiling, refresh failure unreadable, with the unused SWRResult.isRevalidating) plus one newly recorded (only the first stale reader is served stale); the resolved JSON.stringify deviation and the ~110-line account moved under History; duplicated paths removed."
    },
    "applications/react--warm-remount-caches.md": {
      "disposition": "keep",
      "reason": "rewritten 2026-10-31 against personas@22260d77: retitled around createTtlValueCache, the rule cited at page-loading.md:25 and :52, and three current callers (factoryData two-window paint/fresh split, useProjectPulse keyed map, useDataPortability single slot with refresh); the gone CompetitionList/LifecyclePage precedents and the ageless latch moved under History as resolved by removal; reviewParseCache hidden axis still holds; two deviations newly recorded (one TTL cannot be both paint and fresh window; no size cap)."
    }
  }
}
```

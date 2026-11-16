---
subject: client-fetch-cache
domain: software-engineering
last_touched: 2026-11-16
touched_by: deepen
dry_streak: 2
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

Touched by `/harvest backlog` (row 6-022, from [[2026-08-31-tkdodo-rq-beyond-basics]]'s
untriaged table): new technique `one-owner-per-datum`. When two caches hold one datum, one
owns the four policies and the other goes to zero. A second copy written in your own code
is deleted, not left empty, because a field that is kept but never filled reads as a real
empty list. Measured in **code** on a managed frontend. Two module contexts kept a never-filled
state copy of the company and scenario lists beside the query client, and the project's
history holds the defect it caused. Removing the copy turned a re-introduction of that
defect from silent into 2 compile errors, with the consumer probe, the provider tests and
the lint and type floors unchanged. Application `react--one-owner-per-datum--context-copy`.
The two-live-lifetimes half (a router preload window beside the fetch cache) has no fleet
seam and is unmeasured. The fleet change is banked on a branch and not shipped.

## 2026-11-16 - /deepen loop of 3 (run `filler-deepen-20261116c`, /shift filler)

Landed in round 1, dry in rounds 2 and 3. No new technique. Two rules flipped.

- **in-flight-dedup**: "joiners abandon locally; they never abort the shared
  flight" was silent on the case where nobody remains. Amended: an expensive
  flight may be aborted only once its last caller has left, after a grace
  window a returning caller can land inside, and the abort unregisters it. The
  convergence came from three places. Read lane: ascent added a 30 s linger
  window on 2026-10-05 because a reload passes the waiter count through zero.
  Corpus: `plural-policy-claims` already says the eviction clock starts on
  last detach. Blind lane: it named last-leaver abort, though not the grace.
  The counter-case is the query library core, which graces eviction but
  cancels a consumed-signal fetch instantly at zero observers.
- **admission-hypothesis** (and the golden path's list): "there are only a few
  bets", listing four, omitted **frequency of access**, the bet the cache
  literature names an admission policy (Einziger, Friedman and Manes, 2015,
  arXiv 1512.00727). It is the only bet judged against the victim, so it
  decides only at capacity, and it is the mechanism behind "do not admit a
  one-off". Convergence: blind lane plus the primary abstract, plus a cache
  library wiki on the recency window for bursts. This is the same
  enumeration-denial shape this note recorded on 2026-09-03 for resemblance.
  The resemblance bet is now the sixth, and `similarity-keyed-admission` was
  renumbered to match.

Applications:
- `next--in-flight-dedup`: re-pinned at ascent `54a9800dd` (public remote; no
  Lynx checkout) and re-dated. Two new sections: the linger window, and a live
  defect. `cacheAndPersistScan` writes the memory tier before persisting, and
  the persist's `cacheDelete` then removes the entry the run just wrote. The
  cost is a wasted write and a durable-tier read; it never serves a wrong answer.
- The three goat applications (admission-hypothesis, plural-policy-claims,
  portable-read-definitions): **the seam is gone**. goat `1a4d7c5` (2026-10-12)
  deleted the v1 tree and the query library. Each gained a dated retirement
  section and was re-dated. The admission pin went next@15 -> next@16; it was
  already wrong on 2026-08-31.
- `next--plural-policy-claims`: "the prefetcher's claim is inert" corrected
  from the query core's source. A prefetch checks its own staleTime before it
  fetches, and staleness is a per-observer threshold that triggers test, not a
  clock.

Volatile facts: none are framework- or vendor-set. Every flagged number is a
tree fact or an illustration. The plural census's 30 s/60 s alias collision
was spot-checked at goat `d4995c3^`, and the aliases are gone at `d4995c3`.

Rounds 2-3 (training-data-first) confirmed:
- warm-remount is scoped to apps whose views unmount;
- the sibling borrow is a placeholder;
- failure keeps data and flags it invalidated without stamping freshness;
- canonical key hashing sorts object keys. The undefined-equals-omitted
  collapse is already documented.

Banked:
- Hidden-but-mounted views (a framework keep-alive primitive) as the
  alternative to module-scope warmth, with its cost in memory and effects.
  Return: a warm-remount pass that opens the framework's current docs.
- The ascent self-delete defect is unreported to the project. Return: an apply
  worker or a /conform pass on ascent.
- goat joins for this subject in the registry map now point at a deleted tree.
  Return: the Director's map regeneration.
- No fleet tree runs a frequency-aware admission policy. Return: when a fleet
  cache counts capacity evictions.

Impact: not computed. The map regeneration is owed (Director's step 4).

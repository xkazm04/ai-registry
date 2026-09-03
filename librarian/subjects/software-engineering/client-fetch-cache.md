---
subject: client-fetch-cache
domain: software-engineering
last_touched: 2026-09-03
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

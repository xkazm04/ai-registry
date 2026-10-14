---
layer: application
type: application
subject: ability-authoring-to-engine
technique: tag-dialect-normalization
stack: next
status: forged
verified_on: 2026-10-14
verified_against: next@16
applied: code
ab_verdict: better
---

# A tag mapper that was idempotent and central, and still let two spellings through

The PoF ARPG project already met most of the technique: one pure mapper in
`src/lib/ability/tag-dialect.ts`, dotted declared canonical, applied once at the
forge-to-spec adopt boundary (`forge-adopt.ts`) and again inside the tag audit, with the
parsed declaration table preferred where source was scanned. Steps 1 to 4 and 6 held.

## The seam, chosen to falsify "the mapper handles every spelling that arrives"

The mapper decided "already dotted" by `includes('.')` and otherwise swapped underscores
for dots. Two inputs the forge reachably emits broke that:

- A tag copied in the few-shot code style, `ARPGGameplayTags::State_Dashing`. The scope
  qualifier survived, so the adopted rule carried `ARPGGameplayTags::State.Dashing`, a
  string that matches no declaration and shows up in the audit as an undeclared tag.
- A stray edge separator (`State_Dead_`) produced `State.Dead.`, an empty trailing
  segment, again matching nothing.

Both are the technique's signature failure: a clean report about the wrong set.

## What changed

The mapper strips a scope qualifier and edge separators before deciding the dialect, in
both branches, so mixed and already-dotted input stays idempotent. Two tests pin it and
fail on the old source (2 of 7 failed before, 7 of 7 pass after). The ability suite
(170 tests) and `tsc` are green. pof 00f4000d on origin master.

## What it did not settle

Interior underscores inside a legal segment (`Light_Attack`) are still read as separators;
the live registry has none, and the technique's own rule applies: that case needs the
declared table, not a smarter convention. The adopt boundary has no table at hand, so it
stays convention-only and unmeasured against live forge output.

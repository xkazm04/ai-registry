---
layer: application
type: application
subject: prompt-assembly
technique: cache-affinity-key-from-the-unrewritable-layer
stack: rust
status: forged
verified_on: 2026-10-02
verified_against: rust@1.86
---

# A routing key that survived review once and failed on compaction (Rust, agent library)

Stack version from the crate's `rust-version` field (`Cargo.toml:24 "rust-version"`);
commit `2428f68d` of a public agent library. The code and the changelog entry were
read at this commit; the regression test was located, not executed.

## The derivation as shipped

The key is built from the system prompt alone. The stream configuration carries that
prompt in its own field, where compaction cannot reach it, and an explicit
per-session key overrides the derivation. The request body gets the key only when the
provider's capability flag is on, which it is for one provider:
`src/provider/openai_compat.rs:447 "if compat.supports_prompt_cache_key {"`. A blank
explicit key is treated as unset (the guard sits at `src/provider/traits.rs:159 "route every such caller together"`,
beside a comment that an empty key would "route every such caller together"), and a
key supplied for a provider that cannot carry it warns instead of vanishing.

## The failed first version, as recorded

The first implementation also mixed in the first user message "for session
discrimination", and review caught that it does not survive the crate's own
compaction (`CHANGELOG.md:2044 "byte-stable). The derived key then drifted mid-session"`
and the line that follows: `CHANGELOG.md:2046 "Session identity is"`).
The test that pins the fix rewrites the head on purpose:
`src/provider/traits.rs:755 "fn derived_key_survives_compaction_that_rewrites_the_head"`,
with a budget "small enough that the retained tail alone busts the target", which is
the path where the head-dropping fallback of
[compaction-target-is-an-aim](../techniques/compaction-target-is-an-aim.md) runs. The
doc comment on it carries the technique's testing rule as a sentence: appending-only
tests "assert stability under the one condition where the old derivation held".

## What the tree states about the trade

`docs/concepts/prompt-caching.md:70 "So sessions sharing a system prompt share a key by design."`
It then names the cost (traffic concentrates on one cache) and the override. The
provider's own guidance, fetched and read on 2026-10-02, says the same from the other
side: cached state lives on individual machines and traffic above fifteen requests
per minute can lead to overflow routing; keys are for separate cache accounting
and for preventing cache-hit probing across users; and on its newest models routing is
automatic and the key optional. So the derivation's value is model-dependent, and the
tree's choice gives up tenant separation unless the override is set.

## What the realization cannot do

- It cannot identify a session. The tree's own sentence is that identity is not
  recoverable from a per-request snapshot, so any deployment that needs per-session
  or per-tenant routing must supply it.
- It sends nothing for the providers that cache on their own and ships no support for
  the three providers whose explicit cache directives the docs table lists as "Not wired". One
  provider's stateful cached-content resource is declined on purpose, because a
  per-request flag cannot represent a server-side object with its own lifetime.

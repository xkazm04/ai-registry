---
layer: application
type: application
subject: deterministic-prefix-caching
technique: enumerate-the-non-working-cases
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1
applied: code
ab_verdict: better
---

# A research-answer cache that could not see its own model: listing the silent cases and closing the one that could be checked

Pumper's research cache stores the output of metered Claude runs on disk for a day, keyed by a hash of the request. It has no worker processes, so most of the technique's process-model entries (spawn, persistent workers, thread-unsafe head) are empty here, which is the technique's own "do not invent entries" case. What it does have is the same shape underneath: a key built from the head of a computation, plus configuration the key cannot see.

**The seam, chosen to falsify.** The technique says a configuration the mechanism cannot detect, does not fail under, and answers wrongly under earns a place on the list, and that the list should shrink as a check becomes possible. The test of that claim was whether this cache has such a case at all. It does. A request names a role ("research"), not a model; the model, effort and tool allow-list behind the role live in engine config. The key hashed the role name. Edit the role from one model to another and every identical prompt keeps hitting for the rest of the TTL, answering with the old model, with no error and no log line. Cost metering even reports the hit as a saving.

**Arm A (before).** Two engines whose `research` role resolves to different models produce the same cache key for the same request. **Arm B (after).** A defaulted trait method on the researcher returns the resolved model, effort and tool list; the key folds it in. The test builds two engines differing only in the role's model: keys differ; same config twice: keys equal, so genuine hits survive; an unresolvable role yields an empty fingerprint (it refuses before spawn and is never cached). The replay cassette key is deliberately left on the plain request key, since a recorded cassette must still replay after a config edit.

**Target and floor.** Target: a role edit changes the key (A: no, B: yes). Floor: the cache still hits for an unchanged config, and the core and engine-claude suites (528 plus the integration tests) stay green; both held. The one-time cost is a single cold day after deploy, since every old key changes.

**What went onto the list.** Three more entries that the cache cannot detect and does not fail under went into the constructor-adjacent documentation, each with the alternative: prompts carrying per-run content (zero hit rate), resumed sessions (bypass by design), and a TTL longer than the source's change rate. The first of those already had a unit test in a consumer pinning that two builds of the same prompt are identical, which is the technique's step 5 (a runnable example free of listed cases) arrived at independently.

**What the technique should take from this.** Its step 4 says to turn an entry into a check when the mechanism gains a way to see it. Here the mechanism could see it all along, one trait method away; it was on the list-shaped side of the line only because nobody had asked the engine. The "when not to use it" paragraph is right that a mechanism which can inspect its configuration should check rather than list, and the test for that is cheap: for each entry, ask whether the component that owns the configuration can report it.

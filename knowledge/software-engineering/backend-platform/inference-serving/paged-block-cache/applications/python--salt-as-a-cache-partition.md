---
layer: application
type: application
subject: paged-block-cache
technique: salt-as-a-cache-partition
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
---

# `cache_salt` as the mitigation for CVE-2025-46570 (vLLM prefix cache)

Read at `vllm-project/vllm` @ `facd9a74a1cd1b9fed324cdc2cceb8d54fdad3d0`. This
is the technique's reference realization, including the part most implementations
omit: the tree names the attack, cites the measurement, and prices the fix.

## The channel, named and measured

`docs/usage/security.md:543-545` states it without hedging: prefix-cache reuse in
a multi-tenant deployment "is a timing side channel
([CVE-2025-46570](https://github.com/vllm-project/vllm/security/advisories/GHSA-4qjh-9fv9-r85r))".
An attacker on the same backend measures Time to First Token to test whether a
guessed prefix is already cached, and "research has shown this signal is nearly
perfectly distinguishable (ROC AUC of 0.99) at prefix lengths of just 8 tokens",
citing *Leaking Secrets from Prefix Caches* (arXiv 2411.18191).

## The fix is one optional request field

`cache_salt` is accepted per request and "mixed into the hash of the first KV
cache block, so only requests carrying the same salt can share cached prefix
blocks" (`docs/usage/security.md:549`; design detail at
`docs/design/prefix_caching.md:87-101`). The implementation is the two-line gate
in `_gen_extra_hash_keys` (`vllm/v1/core/kv_cache_utils.py:604-605`) — appended
to the extra-key tuple only when `start_token_idx == 0`. Everything below the
first block inherits the partition through the chain; there is no second
enforcement point and therefore no path that bypasses it.

Surface coverage is broad rather than endpoint-specific: chat completions,
completions, responses, pooling (embeddings, classification, scoring) and the
Anthropic-compatible messages endpoint all accept it (`:551`).

## Granularity is documented as the knob, with the bill attached

`docs/usage/security.md:576-591` is the section the technique's table is drawn
from. It scopes the salt to three grains — per-user (a unique random salt per
user "prevents any cross-user cache inference"), per-group (a shared random salt
for users "allowed to benefit from each other's cached prefixes, such as users
within the same organization"), and none (default sharing, "appropriate for
single-tenant deployments") — and then states the cost in one sentence rather
than burying it: *"Salting reduces cache efficiency, since cached blocks are
only reusable by requests with the same salt. Choose the granularity of your
salt values to balance privacy against performance."*

## The salt is a secret, and the tree says why

The upward lesson that corrected this subject's draft is at `:579`:

> Treat the salt as a secret. An attacker who can guess or obtain the salt used
> by another tenant can still mount the timing attack against that tenant, so
> use random values that are long enough to be unpredictable (e.g. 43 base64
> characters, 256 bits) rather than predictable identifiers such as a user name
> or account ID.

A salt derived from a tenant identifier is a partition that exists on paper
only — the concrete 256-bit floor is what makes the rule actionable.

## Where this tree falls short of the standard

The technique's `absent-guard-is-loud` obligation is the gap, and the tree states
it against itself: **"`cache_salt` is opt-in and not passed by default"**
(`docs/usage/security.md:616`). The engine cannot attach a salt on its own —
it does not know the principal — so a deployment that does not thread one from
its authenticating edge runs unpartitioned, silently, and the failure looks
exactly like a correctly configured single-tenant deployment. The mitigation the
tree ships is documentation (`:589` recommends setting it "on every request" in
multi-tenant deployments); no startup warning, no mode in which an unsalted
multi-tenant configuration announces itself.

The standard's third operator obligation — measure the hit rate before and after
at the chosen grain, so a later performance investigation does not quietly
remove the salt — has no support in the tree either: prefix-cache hit metrics
are not broken down by salt, so the cost of a partition cannot be attributed to
it. The standard stays; both are gaps to carry, not reasons to lower it.

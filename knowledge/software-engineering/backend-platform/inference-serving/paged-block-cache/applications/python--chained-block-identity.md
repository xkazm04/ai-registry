---
layer: application
type: application
subject: paged-block-cache
technique: chained-block-identity
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
---

# `hash(parent_hash, block_tokens, extra_keys)` and the seed policy behind it (vLLM v1 prefix caching)

Read at `vllm-project/vllm` @ `facd9a74a1cd1b9fed324cdc2cceb8d54fdad3d0`.

## The chain, in one expression

`hash_block_tokens` (`vllm/v1/core/kv_cache_utils.py:621-648`) is the whole
identity scheme:

```python
return BlockHash(
    hash_function((parent_block_hash, curr_block_token_ids_tuple, extra_keys))
)
```

with `parent_block_hash` defaulting to a root constant for the first block. The
design document states each component and why it is there
(`docs/design/prefix_caching.md:16-22`): the parent hash carries the prefix, the
exact token tuple is included "to reduce potential hash value collision" — i.e.
the digest is verified against the contents it claims, not trusted blind — and
`extra_keys` carries "other values required to make this block unique".

The document's own worked diagram (`:8-14`) makes the positional argument the
technique opens with: block 3's identity is its own tokens *plus* the seven
tokens before it, because the same three words at a different offset are a
different object.

## Two kinds of extra key, attached in two different places

The technique's split between request-constant parameters and range-local extras
is visible directly in `_gen_extra_hash_keys` (`:595-618`):

```python
cache_salt_keys = [request.cache_salt] if (start_token_idx == 0 and request.cache_salt) else []
extra_keys = lora_extra_keys + mm_extra_keys + cache_salt_keys + prompt_embeds_keys
```

The salt is gated on `start_token_idx == 0` — first block only, because the chain
propagates it. The multimodal keys are *not*: the design document's example
(`docs/design/prefix_caching.md:70-88`) shows an image hash attached to all four
blocks its placeholder run spans, because the elements in those blocks are
identical filler tokens and the thing they stand for is attached out of band.
Keying on elements alone would make two different images indistinguishable.
Adapter identity (`lora_extra_keys`) sits in the same list and is
request-constant, so this tree pays a small redundancy there that the salt does
not.

## The root seed is a deliberate two-branch policy

The comment on `NONE_HASH` (`vllm/v1/core/kv_cache_utils.py:91-105`) is the
upward lesson this application exists for, and it corrected the draft of the
technique:

- For a **cryptographic** hash the seed is derived from a fixed default, "so
  independent vLLM processes compute identical block hashes for identical
  content and can share a prefix cache (e.g. KV cache reuse across nodes)
  without extra configuration. This does not weaken collision resistance, which
  for SHA-256 does not depend on keeping the seed secret."
- For a **non-cryptographic** algorithm the seed is per-process random, "because
  a predictable seed would let an attacker precompute colliding blocks offline
  (see #12621)."

And the comment closes by separating the two mechanisms explicitly: "`cache_salt`
remains the mechanism for intentional cache isolation." Randomized root defends
collision search; the salt defends inference from sharing.

## Serialization is part of the digest, and the tree says so

`--prefix-caching-hash-algo` (`docs/design/prefix_caching.md:26-33`) offers four
options and documents the cross-process consequence of each: the default
`sha256` serializes with `pickle` and its "hashes may not be reproducible across
different Python or vLLM versions"; `sha256_cbor` exists precisely to give "a
reproducible, cross-language compatible hash… recommended for deterministic
caching across environments". The `xxhash` entry states the security trade in
the technique's own terms — a non-cryptographic digest "theoretically increases
the risk of hash collisions, which can cause undefined behavior **or even leak
private information in multi-tenant environments**". A collision in a shared
pool is a disclosure, not merely a wrong answer.

## Caller-supplied identity for expensive payloads

`docs/usage/security.md:598-621` documents the optimization the technique warns
about: multimodal content parts accept an optional `uuid` used "as the cache
identity for the media item instead of hashing the raw media bytes". The tree
carries the corresponding obligation on the caller — "always generate
cryptographically random UUIDs per media item" in multi-tenant deployments, plus
a per-tenant salt "for defense in depth" — which is the technique's rule that
asserted identity is only safe inside a trust boundary or behind a partition.

## Confirmed and deviating

Confirmed: chained keys, contents included against collisions, extras at the
root, first-miss stopping in the lookup walk
(`vllm/v1/core/single_type_kv_cache_manager.py:561+`, each
`find_longest_cache_hit` breaking at the first absent key), full blocks only.

Deviation from the technique's standard: the collision posture is "wide digest,
no verification" — the token tuple is inside the hash input but the cached block
is not re-compared against the request's tokens on a hit. The note at
`docs/design/prefix_caching.md:29-30` records that pre-v0.11 the key "was not
guaranteed to be collision-free", which is the honest version of the history.
The standard's requirement that the birthday bound be stated against the maximum
simultaneously cached blocks, and re-derived when the pool grows, is not met
anywhere in the tree; the argument is qualitative.

---
layer: application
type: application
subject: multi-provider-gateway-plane
technique: upstream-identity-before-inventory
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.85
---

# An enum with an `Unrecognized` arm, filled by dated measurements

`AlexsJones/llmfit` at `d19380bac5d82c5cd3080ff1afef6d1dc20615bf` fronts six local
inference runtimes, five of which answer the same OpenAI-compatible HTTP surface.
The version witness for this document is the maintainer's stated minimum in
`AGENTS.md:16` — *"Minimum supported Rust version: whatever edition 2024
requires (1.85+)"* — corroborated by `resolver = "3"` and `edition 2024` on every
crate (`Cargo.toml:5`). There is no `rust-version` field and no toolchain file,
and CI resolves `stable` unpinned (`.github/workflows/ci.yml`), so the documented
minimum is the only version this tree witnesses.

Identity is a closed enum, `OpenAiEndpointIdentity`
(`llmfit-core/src/providers.rs:488-499`), and its last variant is the technique's
central obligation compiled in:

```rust
enum OpenAiEndpointIdentity {
    LlamaCpp,
    LlamaSwap,
    Vllm,
    DockerModelRunner,
    /// No foreign marker recognized.
    Unrecognized,
}
```

There is no "probably" arm and no default. A caller that wants to treat an
unidentified endpoint as some particular runtime has to write that decision
itself, in the open.

## The evidence hierarchy is present, and its rungs are dated

The doc comment above the enum (`providers.rs:476-486`) is the strongest single
artifact in the tree for this technique, because it records *how each
discriminator was obtained and when*:

> Measured against live servers (2026-08-23): llama-server stamps
> `Server: llama.cpp` on every response and lists models with
> `owned_by: "llamacpp"`; llama-swap lists models with `owned_by: "llama-swap"`;
> mlx_lm.server (0.31.3) sends a Python `BaseHTTP` Server header and no
> `owned_by` field at all. vLLM and Docker Model Runner were measured 2026-09-01.

That is the "dated observations, not invariants" rule as a working practice
rather than an aspiration — each rung carries the date and the version it was
established against, so a later maintainer can tell a fact from a stale guess.

The hierarchy's top rung is `endpoint_is_lmstudio` (`providers.rs:614`), and its
comment states the standard's own argument almost verbatim: the native
`/api/v0/models` route carries `compatibility_type` and `state` fields that the
OpenAI `/v1/models` schema does not have, so answering that route *is* the
identity — and the comment says explicitly that this is used **rather than the
framework-wide `X-Powered-By` header (#790)**. The tree reached the weak-evidence
trap, was burned by it, and moved up the hierarchy.

## The empty-inventory hole is here, with the banner fallback

`endpoint_is_docker_model_runner_root` (`providers.rs:649`) exists for exactly
the case the technique predicts:

> A runner with no models yet returns an empty `/v1/models` list that carries no
> `owned_by` marker, so identity falls back to this probe. Measured 2026-09-01:
> `GET /` answers `Docker Model Runner is running` as plain text.

Every per-record discriminator lives inside the records, so a correct
implementation with nothing loaded supplies zero evidence about itself. The tree
resolves it with the root-banner rung rather than with a guess — the arrangement
the technique recommends, arrived at independently and, judging by the issue
numbers, after the hole bit somebody.

## What the tree confirms about the standard, and what it does not

**Confirms:** the ordering. Identity is established per endpoint and the result
keys everything imported afterwards; nothing in the tree imports model ids and
labels them later.

**Does not exercise:** the *policy* half. This tree is an advisor rather than a
serving gateway — it never routes a request through an upstream — so the
downstream consequences the technique claims for identity (framing tables, leaf
policy, capability sets) have no realization here. The identity is consumed by
an inventory and a UI badge, which is the weakest of the uses the standard names.
A gateway that routed on this enum would be a stronger test of whether
`Unrecognized` is genuinely routable-around, and that remains unproven by this
tree.

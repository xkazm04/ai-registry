---
layer: application
type: application
subject: settings
technique: cross-source-precedence-chain
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.89
---

# Cross-source precedence chain — `Config::infer` in a Kubernetes client

How the `kube-rs/kube` client crate realizes
[cross-source-precedence-chain](../techniques/cross-source-precedence-chain.md),
read at commit `7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e` (workspace version
`4.2.0`). The version witness is the workspace manifest itself: `Cargo.toml:27`
declares `rust-version = "1.89.0"`, so `rust@1.89` is what the tree states about
itself rather than what the reader's toolchain happened to be.

The problem is the technique's canonical one. One binary runs on an operator's
laptop against a hand-maintained config file, and inside a cluster against
credentials the platform injects, and it must not need a flag to tell which.

## The declared order

`kube-client/src/config/mod.rs:212` is the whole chain, and it is short enough
to read as the contract it is:

```rust
pub async fn infer() -> Result<Self, InferConfigError> {
    let mut config = match Self::from_kubeconfig(&KubeConfigOptions::default()).await {
        Err(kubeconfig_err) => {
            tracing::trace!(error = &kubeconfig_err as &dyn std::error::Error,
                "no local config found, falling back to local in-cluster config");
            Self::incluster().map_err(|in_cluster| InferConfigError {
                in_cluster, kubeconfig: kubeconfig_err,
            })?
        }
        Ok(success) => success,
    };
    config.apply_debug_overrides();
    Ok(config)
}
```

Four named sources, in order: the `KUBECONFIG` environment variable
(`file_config.rs:522`, `Kubeconfig::from_env`), the default path `~/.kube/config`
(`file_config.rs:509-513`, `Kubeconfig::read` falling through to
`default_kube_path()`), the in-cluster ambient identity
(`mod.rs:245`, `incluster_env`, reading `KUBERNETES_SERVICE_HOST`/`_PORT` from
`incluster_config.rs:48-58` plus the projected token and CA at
`/var/run/secrets/kubernetes.io/serviceaccount/`), and finally the debug
override layer at `mod.rs:361`.

**Composition is whole-object, with two per-key exceptions, and the tree names
both.** The first three rungs are whole-object — whichever source answers
supplies the entire `Config`. Layered on top per key are `apply_debug_overrides`
(`KUBE_RS_DEBUG_IMPERSONATE_USER`, `_IMPERSONATE_GROUP`, `_OVERRIDE_URL`) and
the proxy resolution at `file_loader.rs:132-140`, which is its own
first-non-empty-wins chain: the cluster's `proxy_url` field, then `HTTPS_PROXY`,
then `https_proxy`.

## Inside one source, the same rule again, with the opposite winner

`KUBECONFIG` may name several files, and `Kubeconfig::merge`
(`file_config.rs:554`) folds them with the ecosystem's published rule quoted
verbatim in the doc comment: *"The first file to set a particular value or map
key wins… Never change the value or map key."* Worth noting because it is the
inverse of the usual layering intuition — later files do not override earlier
ones, they only fill gaps — and because `merge` refuses outright on
`KindMismatch` / `ApiVersionMismatch` rather than picking one. Two files that
disagree about what kind of document they are is a malformed source, not a
precedence question.

## Absent skips, malformed stops — enforced by the type

The technique's central rule is carried structurally rather than by discipline.
`Kubeconfig::from_env` returns `Result<Option<Self>, KubeconfigError>`: the
`Option` is *absence* (no variable, or a variable holding only empty paths) and
the `Err` is *malformation*. `read()` consumes them differently — `None` falls
through to the default path, `Err` propagates and ends the file rung. And
`KubeconfigError` (`mod.rs:33-111`) has fourteen variants, one per
distinguishable cause: `CurrentContextNotSet`, `LoadContext`,
`LoadClusterOfContext`, `FindPath`, `KindMismatch`, `ApiVersionMismatch`,
`ParseCertificates`, `ParseProxyUrl` and the rest. A chain cannot report which
source broke and how unless the source's failures are enumerated; this is what
that enumeration is for.

## Both failures kept, and the headline chosen by likely blame

When both rungs fail, `InferConfigError` (`mod.rs:23-31`) holds both errors and
formats both:

```rust
#[error("failed to infer config: in-cluster: ({in_cluster}), kubeconfig: ({kubeconfig})")]
pub struct InferConfigError {
    in_cluster: InClusterError,
    // We can only pick one source, but the kubeconfig failure is more likely to be a user error
    #[source]
    kubeconfig: KubeconfigError,
}
```

That comment is the technique's presentation rule found in the wild: `#[source]`
— the one the error-chain walker will surface — is placed on the operator's own
file rather than on the platform-injected identity, precisely because a human
edited one of them. The other is not discarded, only demoted in the display.

## The override layer is loud, and says it is a debugging aid

`apply_debug_overrides` (`mod.rs:355-386`) logs every override at `warn!` with
the reason stated in the code: *"Log these overrides loudly, to emphasize that
this is only a debugging aid, and should not be relied upon in production."* An
unparseable `KUBE_RS_DEBUG_OVERRIDE_URL` warns and is ignored rather than
failing the boot — defensible for a debugging surface specifically, and the
technique's malformed-stops rule does not reach it because it is not a
configuration source anyone is meant to depend on.

Two adjacent facts, dated at this commit: the credential material is re-read
under the running process rather than snapshotted — `token_file` is reloaded,
and `root_cert_file` is re-read on roughly a sixty-second cycle to pick up CA
rotation (`mod.rs:130-143`) — so the chain resolves once at boot while the
*material* it selected keeps moving. And `incluster_dns()` (`mod.rs:259`) exists
as a deliberately non-default second in-cluster constructor, with its doc
comment stating that it does *not* match the reference clients' behaviour; the
env-var form is the default because the ecosystem's other clients require both
variables set (`incluster_config.rs:49`).

## Where the tree falls short

- **No provenance survives the call.** The chain's winning source is announced
  only as a `tracing::trace!` line at the moment of fallback (`mod.rs:215-218`),
  and the returned `Config` carries no field naming which rung produced it.
  Nothing downstream — no diagnostic endpoint, no startup banner, no error
  raised later against the wrong cluster — can answer "where did this come
  from". The technique asks for provenance at a level an operator will see in
  production; trace level is not that. One `enum ConfigSource` on `Config`, set
  where the match arm resolves, would close it.
- **The default-path rung is invisible.** `Kubeconfig::read` collapses "the
  environment variable named files" and "we fell back to the home directory
  path" into one `Result` (`file_config.rs:509-513`). Those are two distinct
  rungs of the declared order and the caller cannot tell them apart, so the most
  common operator confusion — *which file did it actually read* — is
  unanswerable from the returned value.
- **The order lives in control flow, not in data.** There is no list of named
  sources anywhere; the chain is a `match` with an `else` branch, and the proxy
  sub-chain at `file_loader.rs:136-138` is an `or_else` tail. Adding a fifth
  source means editing the branch, and no test can assert the order because the
  order is not a value. This is the shape the technique warns about, in an
  otherwise exemplary implementation — it is legible today because the chain is
  two rungs long.

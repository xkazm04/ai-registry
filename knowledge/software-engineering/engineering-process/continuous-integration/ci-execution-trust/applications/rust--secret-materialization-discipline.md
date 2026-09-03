---
layer: application
type: application
subject: ci-execution-trust
technique: secret-materialization-discipline
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1
---

# A container job that builds and never publishes

`github.com/microsoft/RustTraining` at `9d19c482d66ef3995dca794bda74c7852134e0b7` is a
workspace of seven training books built by a first-party `xtask` binary into a static site.
The witness used for `verified_against` is the toolchain pin in `docker/Dockerfile` —
`ARG RUST_VERSION=1`, consumed as the `rust:${RUST_VERSION}-slim-bookworm` builder base;
the sharper pins in the same tree are `MDBOOK_VERSION=0.4.52`, `NGINX_VERSION=1.27`, and
the workflow action majors (`actions/checkout@v4`, `docker/build-push-action@v6` in
`.github/workflows/docker.yml`; `actions/checkout@v6`, `actions/deploy-pages@v5` in
`pages.yml`).

## The shape

`.github/workflows/docker.yml` builds the container image and stops. Three lines carry the
whole decision:

- a header comment stating the intent — "Build-only. Nothing is published, so this adds no
  release surface or registry credentials — it exists so the Dockerfile cannot silently rot";
- `permissions: contents: read` at workflow scope;
- `push: false` with `load: true` on the build step, so the image is materialized into the
  runner's local daemon for the smoke test and nowhere else.

The job then runs the container and asserts three requests against it before deleting it.

## What the tree's shape says about the standard

**The credential is absent, not withheld.** The technique's ladder ends at "prefer a
credential the build never holds at all," and the usual reading of that rung is a workload
identity — a short-lived token issued to the job instead of a stored secret. This tree
reaches the same rung by a route the technique does not enumerate: it *removed the step that
would need one*. There is no registry login, no secret reference, and no publishing branch
of the job to guard, so the discipline is not maintained by review — a future contributor
adding `push: true` would have to also add a secret, a login step, and a permission, which
is three visible additions in one diff rather than one flag flip. That is the structural
difference between a rule and a shape: the rule can be violated by one careless line, the
shape cannot.

**The risk being managed is not the image; it is the recipe.** The published product of this
repository is the Pages site (`pages.yml`, `cargo xtask deploy` into `docs/`). Nobody
consumes the container. A build recipe with no consumer is the canonical silently-dead
artifact: it decays with every change to the build it mirrors and announces nothing, because
nothing runs it. The job exists to be the consumer. Read that way, the path filter is the
load-bearing part of the file — it triggers on `docker/**`, `xtask/**`, `**/book.toml`, and
`.github/workflows/docker.yml` itself, which is exactly the closure of inputs the image
depends on, *including the workflow*. A recipe-liveness job that did not re-run when its own
definition changed would be one edit away from testing a stale recipe.

**What the tree could not have been built to prove, and proves anyway.** This repository has
no releases, no registry, no artifacts, and no publishing credential anywhere in its two
workflows — it is documentation. It therefore cannot demonstrate late fetch, narrow scope,
short-lived derived credentials, or any of the materialization mechanics the technique
spends most of its length on; there is nothing to materialize. What it does demonstrate is
the prior question the technique's ladder implies but does not state as a step: **before
asking how a job should hold a credential, ask whether that job needs to exist as a
publishing job at all.** The verification-only variant — build the artifact, exercise it,
throw it away — is available for a large class of jobs teams currently write with a push
step and then defend with permissions, and it is the only variant whose credential exposure
is provably zero rather than bounded.

The narrow counter-observation, recorded rather than smoothed over: `push: false` alone is a
parameter, and a parameter is a rule. What makes this shape rather than discipline is the
combination — no credential exists in the repository for the step to use, and workflow-scope
`permissions: contents: read` means the automatic token cannot substitute. Either half on
its own would be one line from publishing.

---
layer: application
type: application
subject: build-economics
technique: cache-budgeting
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1
---

# A toolchain install ladder: prebuilt first, compile as the fallback

`github.com/microsoft/RustTraining` at `9d19c482d66ef3995dca794bda74c7852134e0b7` builds
seven books with two external tools, inside a container. The witness used for
`verified_against` is `ARG RUST_VERSION=1` in `docker/Dockerfile` (builder base
`rust:${RUST_VERSION}-slim-bookworm`); the tools are pinned in the same file at
`MDBOOK_VERSION=0.4.52` and `MDBOOK_MERMAID_VERSION=0.14.0`.

## The ladder

`docker/Dockerfile` installs each tool through one `install_tool` shell function that tries
a prebuilt release archive and falls back to compiling:

```dockerfile
# Prefer prebuilt release binaries — `cargo install mdbook mdbook-mermaid`
# compiles both from source and adds several minutes to every cold build.
#
# Upstream does not ship a complete set of prebuilt targets, so we fall back
# to compiling when an asset is missing:
#   - mdbook         has linux-gnu on amd64, linux-musl on arm64
#   - mdbook-mermaid has NO published arm64 Linux binary at all
install_tool() {
    if curl -fsSL "$url" | tar -xz -C /usr/local/bin "$bin"; then ...
    else cargo install "$crate" --version "$ver" --locked --root /usr/local; fi
}
```

The architecture case statement above it selects a target triple per `TARGETARCH`, and the
step ends with `mdbook --version; mdbook-mermaid --version` — the acquisition asserts its own
result rather than trusting either branch.

The workspace build below it uses the other half of the same economics:

```dockerfile
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/build/target \
    cargo run --release --package xtask -- build && test -f site/index.html
```

## What the tree's shape says about the standard

**A prebuilt binary is a cache entry someone else already paid for.** The ranking the
technique proposes — rebuild-seconds saved per megabyte retained — puts third-party build
tooling at the top, and an upstream release archive is that entry with the byte cost moved
off your disk entirely. The comment prices it in exactly those terms ("adds several minutes
to every cold build"), and the decisive word is *cold*: the local cache mounts below make the
warm case cheap, so the tools' compile cost is paid precisely where no cache exists. That is
the boundary the technique's arithmetic implies and this file states — the acquisition
strategy and the cache strategy are answers to the same question at two different hit
probabilities, and a build that solves only the warm case has optimized the run that was
already fast.

**The fallback is the whole design, and it is the part that would be dropped.** The tempting
simplification is to keep only one branch: download, because it is fast, or compile, because
it always works. Both are wrong here for a reason recorded at the site — the upstream target
matrix is *incomplete and unevenly so*. One tool ships a musl archive for the second
architecture; the other publishes no Linux archive for it at all. A download-only install
therefore fails on one architecture only, and a compile-only install pays minutes on both
forever. The ladder is the only correct shape, and the enumeration of which tool lacks which
target is what stops a future reader from collapsing it.

**What this tree could not have been built to prove, and proves anyway.** There is no byte
ceiling here, no pruner, and no hit-rate measurement — the cache mounts are unbounded and
managed by the builder, and a documentation repository has no reason to instrument them. So
it cannot demonstrate the budgeting half of the technique at all. What it demonstrates
instead is the step that comes before a budget and is usually skipped: **classifying build
inputs by whether they need to be produced locally in the first place.** Two of this build's
most expensive inputs were removed from the cache question entirely by being downloaded
already-built, and the remaining cached populations — the dependency registry and the
workspace's own object directory — are the two classes the technique ranks at opposite ends
of the pruning order. A tree that has done this classification has a small, well-separated
cache to budget later; a tree that compiles everything and then buys a bigger disk has a
large undifferentiated one.

The honest deviation: the prebuilt archives are fetched over the network by digest of
nothing — version-pinned in the URL, but unverified beyond the archive extracting cleanly,
and the failure path silently becomes a source compile. That is an acquisition the build's
own lockfile has never heard of, and it is the boundary where this technique hands off to the
supply-chain lane's scope-of-verification question rather than a defect in the economics.

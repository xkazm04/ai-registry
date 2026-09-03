---
layer: application
type: application
subject: deployment-contract
technique: platform-build-parity
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1
---

# Two hosts, one artifact, one asserted resolution rule

`github.com/microsoft/RustTraining` at `9d19c482d66ef3995dca794bda74c7852134e0b7` builds
seven books into one static site and serves that site from more than one place. The witness
used for `verified_against` is `ARG RUST_VERSION=1` in `docker/Dockerfile` (builder base
`rust:${RUST_VERSION}-slim-bookworm`); the tree's other pins are `MDBOOK_VERSION=0.4.52`,
`NGINX_VERSION=1.27`, and the workflow action majors in `.github/workflows/`.

## The good half, in two files

`docker/nginx.conf` resolves extensionless request paths explicitly, and says why:

```nginx
# mdbook emits real .html files, but internal and hand-written links
# sometimes omit the extension. Resolving both keeps parity with the
# GitHub Pages behaviour.
location / {
    try_files $uri $uri/ $uri.html =404;
```

The comment names the *other host* as the authority. That is the recorded mirror the
technique asks for: without it, `$uri.html` reads as redundant belt-and-braces beside
`$uri`, and the first reader tidying the config deletes it.

`.github/workflows/docker.yml` then asserts it, in the smoke test that follows the build:

```bash
curl -fsS -o /dev/null -w '%{http_code}\n' http://localhost:3000/ | ... # server is up
curl -fsS ... http://localhost:3000/async-book/ | grep -q 200          # directory index
# Extensionless links must resolve via try_files.
curl -fsS ... http://localhost:3000/async-book/ch00-introduction | grep -q 200
```

The third request is the one that matters, and it is the structurally correct choice: it
requests the shape that **fails** on a host without the rule. The first two would return 200
from any static server; only the extensionless request can distinguish a configuration that
has parity from one that does not.

## What the tree's shape says about the standard

**Build parity is satisfied here and would not have caught this.** The container and the
Pages job run the same first-party build (`cargo xtask build` and `cargo xtask deploy`,
which differ only in output directory), from the same workspace, at the same commit. The
bytes agree. Every check the "inputs that diverge" enumeration suggests — command, runtime
pin, install, build-time environment, trigger — passes, and the sites would still have
disagreed on every extensionless link in seven books. That is the amendment's whole claim,
standing in a tree that had to write the fix by hand because no parity check would have
reported the gap.

**The tree proves the rule and then shows the cost of an incomplete host inventory.** There
is a third serving surface: `cargo xtask serve`, whose resolver is `resolve_site_file` in
`xtask/src/main.rs:328-375`. It implements two of the three rules — a directory request gets
`index.html` (line 361), and a directory reached without a trailing slash gets a redirect so
that relative links resolve (lines 358-360, with that reason in the comment) — and it does
**not** implement the extensionless fallback. There is no `.html` append anywhere in that
function; a path that is neither a directory nor an existing file returns `NotFound`. So the
same link that the container config exists to support, and that the smoke test asserts,
404s in local preview.

That is the finding the tree's shape yields: **parity was written pairwise, between the two
hosts someone was thinking about, rather than across the set of hosts that serve the
artifact.** The local server is a host — it is the one a contributor checks a new
cross-reference against, and the one whose disagreement is discovered by a person rather
than by the smoke test. The correction the standard takes from this is that the first step
is enumerating every surface that resolves a request against this artifact, preview servers
included, before comparing rules between any two of them.

Worth recording on the other side: the same resolver hardens what a host's resolution rules
must never do — percent-decoding, null-byte rejection, `..` rejection, and canonicalized
prefix checking against the site root (lines 339-372, commented as preserved from an earlier
review). Resolution-rule parity means matching the *reachability* rules, never the
containment ones; a preview server that copied a permissive host's traversal behaviour for
parity's sake would have made itself worse.

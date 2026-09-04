---
layer: application
type: application
subject: deployment-contract
technique: cache-immutability-licensing
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1
---

# An asset block that declines the immutable directive, and says why

`github.com/microsoft/RustTraining` at `9d19c482d66ef3995dca794bda74c7852134e0b7` serves a
generated documentation site from a container defined in `docker/`. The witness used for
`verified_against` is `ARG RUST_VERSION=1` in `docker/Dockerfile`; the serving image is
pinned separately at `NGINX_VERSION=1.27` (`nginxinc/nginx-unprivileged:1.27-alpine`).

## The two location blocks

`docker/nginx.conf` splits the tree into exactly the two populations the technique asks for,
and the split is by naming scheme rather than by file type:

```nginx
location / {
    try_files $uri $uri/ $uri.html =404;
    add_header Cache-Control "no-cache" always;
    ...
}

# mdbook's assets (book.js, ace.js, css) are NOT content-hashed — the same
# URL serves new bytes after a rebuild — so they must not be marked
# immutable. A short expiry keeps them cheap without pinning stale JS in
# browsers that never revalidate.
location ~* \.(css|js|woff2?|ttf|svg|png|jpe?g|gif|ico)$ {
    expires 1d;
    ...
}
```

Documents are `no-cache` — revalidate every time, which is the entry-document rule the
technique states as step 4. Assets get one day. Nothing is immutable.

## What the tree's shape says about the standard

**The comment is the artifact, not the directive.** `expires 1d` is an unremarkable line
that a hundred configurations contain by default and by accident. What makes this an
instance of the standard is that the line records the *licence check that was performed and
failed*: the generator does not content-hash its output, therefore the address is reused
across rebuilds, therefore immutability is unavailable. A reader arriving later with "assets
should be immutable, that's the standard advice" finds the rebuttal at the site rather than
having to rediscover it. This is the same site-comment discipline the pinning techniques
demand, applied to a cache directive — and it is needed for the same reason: the correct
configuration is the one that looks under-optimized.

**The population split is the decision; the number is not.** One day is not derived from
anything visible in this tree — there is no stated deploy cadence to divide, and the
technique would ask for that derivation. But the choice that carries the risk was already
made one line earlier: a bounded lifetime rather than an unbounded claim. Getting the number
wrong costs conditional requests; getting the licence wrong costs an unreachable client
population. The tree gets the irreversible half right and leaves the reversible half
unjustified, which is the correct order of care and worth stating as such, because the usual
review instinct inverts it and argues about the number.

**What this tree could not have been built to prove, and proves anyway.** Nothing here has
users to lose. It is a documentation site with no application state, no rolling deploys, and
no version skew to speak of — an immutable directive here would have produced stale styling,
not a broken client. So it had no incentive to reason about this at all; the cheap move for a
docs container is to copy an aggressive asset block from any static-hosting guide, all of
which recommend the immutable directive, none of which qualify it by naming scheme. The tree
instead performed the check that its own risk level did not require. That is the evidence
worth carrying: the licence question is answerable from the generator's output alone, in the
time it takes to list a build directory twice, and it does not need an incident to motivate
it.

One boundary the tree also draws by omission: the local preview server (`xtask/src/main.rs`,
the response writer around lines 432-455) sets no cache headers at all. That is correct for
an ephemeral development host and is not a parity gap with the container — cache posture is a
property of a host that serves real clients, and the surfaces that do so here are the
container and Pages.

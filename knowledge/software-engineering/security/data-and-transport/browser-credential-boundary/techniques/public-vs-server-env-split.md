---
layer: technique
type: technique
subject: browser-credential-boundary
technique: public-vs-server-env-split
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [adding a configuration value a browser client will read, a value must move from client to server side, auditing what the shipped bundle actually contains]
---

# The public / server-only split, in the name

Configuration for a web application lives in one flat namespace and serves two
populations with nothing in common: values that are **inlined into the bundle
every visitor downloads**, and values that exist only in the server process.
Nothing about a name like `apiKey` says which population it joined. So the
split is carried by the name itself — a **reserved prefix that means "this is
published"** — and the build honors it mechanically.

The convention is worth stating in its strong form, because the weak form
("we're careful about which keys we expose") is what every leaked key was
protected by. The prefix is the single authority on which side of the boundary
a value sits ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
A second list — a document naming the public values, a comment in the
configuration template, a wiki page — is not redundancy; it is a copy that
drifts on the first value somebody adds while looking at the other one.

## The procedure

1. **Pick one prefix and never overload it.** Most build toolchains for
   browser-targeted applications already reserve one; adopt whatever the
   toolchain enforces rather than inventing a parallel scheme, because the
   toolchain's version is the one the compiler acts on. If nothing is
   reserved, reserve one and make the build fail on any unprefixed value
   reaching client code.
2. **Read the prefix as a declaration, not a permission.** A prefixed value is
   not "allowed to be public"; it *is* public, from the moment it is built.
   The review question is never "can this be exposed" but "what does an
   attacker holding this get" — and the answer had better be a role selector,
   an endpoint address, a feature flag.
3. **Annotate every value at its declaration.** The environment template is the
   one artifact a new contributor reads before wiring anything. Each entry
   states which side it lives on, why, what it unlocks, and — for a server-only
   value — the concrete behaviour that changes when it is missing. A template
   listing bare names teaches nothing; a template whose comments answer "what
   breaks without this" prevents the outage where a deploy silently falls back
   to a degraded path nobody noticed.
4. **State the silent-fallback cases loudest.** The dangerous configuration
   value is not the one whose absence crashes the process — that is a
   self-reporting failure. It is the one whose absence quietly switches a
   feature to a different storage backend, a local stub, or an unauthenticated
   path, and keeps serving. Every such value gets an explicit note at its
   declaration saying what the degraded mode is, because otherwise the first
   person to discover it is a user.
5. **Write the house rule where the code is, not where the docs are.** "The
   privileged key never appears in client source" belongs in the repository's
   own agent- and contributor-facing instructions, next to the other rules that
   get read. A rule that lives only in a security review is applied only during
   security reviews.

## Mark the module, not the entry point

The prefix guards *values*. A second boundary needs guarding — *modules*:
a helper that reads a server-only value is importable from client code, and
the build does not stop it; in the common toolchains the unprefixed value is
silently replaced by an empty string in the client chunk, so the helper ships,
runs, and fails at the upstream with a credential of `""`. That is a silent
fallback of the kind step 4 exists for, and it is not caught by any check on
names.

The guard for it is a **marker inside the module** — a declared "this file is
server-only" that the compiler enforces at the moment a client module graph
reaches it, by any path. Put it in the module that holds the secret-bearing
code, not in the barrel that re-exports it. A guard enumerated at the entry
point — "these fifteen names are the client's imports from the root module" —
is scoped to one import path, and the richest modules are the ones reached by
a deep path that bypasses the barrel. Enumerate by *what the client imports*,
never by *which path the import came through*; a marker that travels with the
module does that by construction, and a list maintained beside it does not.
The strongest toolchains make the server-only value module itself
un-importable from client code and fail the build, which is the same rule with
no marker to forget.

## The gate reads the bundle, not the source

Grep the source tree for the privileged name and you have checked a proxy. What
ships is the **built** artifact, and the two diverge exactly where it matters:
a value pulled into a module that is imported by both a server route and a
client component gets inlined into the client chunk, with no line of source
anywhere saying so. The check that means something scans the build output for
the *value* — or, where the value is not available to the checker, for the
server-only names that must never appear in it
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

Run it in the pipeline, on the same artifact that deploys. A local scan of a
development build is a third proxy: development builds inline differently,
tree-shake differently, and are the reason "it wasn't in my bundle" is a
sentence people say after an incident.

## Migrating a value across the split

A value changes side more often than teams expect: a key that was fine to
publish acquires a privileged capability upstream, or a server-only value is
needed by a client feature. **The rename is the migration.** Because the prefix
is the authority, moving a value means changing its name, and changing its name
means every reader breaks loudly at build time — which is the whole benefit,
and the reason a "temporary alias" that accepts both names is the one thing not
to do.

Direction matters for what else the move requires:

- **Server-only → public** is the dangerous direction and needs an explicit
  argument, written down: what this value grants, why publishing it is
  acceptable, and what enforcement now stands behind the resource it opens.
  Usually the honest answer is that it should not move, and the client wants a
  broker route instead.
- **Public → server-only** is a hardening and carries the ordering rule from
  the golden path: provision the server-side path first, verify, then remove
  the public one. Removing the published name before its replacement is live
  turns a security improvement into an incident.

In both directions, treat the old value as **exposed for its whole published
life**. If a value was ever prefixed, it was on the internet; the migration
plan includes rotating whatever it opened upstream, not just renaming it.

## When not to reach for this

Do not use a prefixed value as a **weak secret** — something published but
"unlikely to be found". There is no such category. If the resource behind the
value needs protection, the protection is the resource's own policy engine or a
broker route; the name convention cannot supply it and was never meant to.

Do not use the split to decide **secret storage**. It says which side a value
lives on, not how a server-side value is held, rotated or audited — that is
the credential vault's subject, and a prefix convention is a poor substitute
for custody.

And do not let the convention imply that unprefixed means safe. Server-side
values leak through error payloads, debug endpoints, and server-rendered markup
just as thoroughly as through a bundle. The prefix guarantees one direction —
prefixed *is* public — and guarantees nothing about the other.

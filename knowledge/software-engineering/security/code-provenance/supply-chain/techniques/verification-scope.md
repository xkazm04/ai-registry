---
layer: technique
type: technique
subject: supply-chain
technique: verification-scope
status: forged
laws:
  - gate-sees-target
  - absent-guard-is-loud
  - failure-not-empty-success
shared_with: []
use_when: [an install is hash-verified and something unpinned still reached the machine, auditing which fetches a pinning flag actually covers, a build step fetches its own toolchain, a package manager subcommand downloads a model or plugin, deciding whether a pinned pipeline is fully pinned]
---

# Verification scope

[dependency-policy-gates](./dependency-policy-gates.md) says to inventory the
resolution mechanisms, because the ecosystem nobody counted as "dependencies" is
the usual gap. That advice finds *missing* ecosystems — a container base image,
a vendored directory, a pipeline step. This technique is about the gap that
survives a complete inventory: **an ecosystem you did count, verified with a
flag you believed was total, where the flag's scope is narrower than the command
it decorates.**

The distinction matters because the two are found differently. A missing
ecosystem is found by listing. This one cannot be found by listing, because
nothing is missing from the list — the install step is there, the verification
flag is on it, the lockfile is complete and every hash is checked. Something
unpinned still arrived, and the audit that would notice is a question nobody
thinks to ask: *which fetches does this flag actually cover?*

## A verification flag covers a stage, not a command

Package managers are pipelines wearing a single verb. One invocation may resolve
a graph, download archives, verify them, build sources, and install results —
and the flags a caller reaches for name **stages**, not the whole run:

- A hash-checking flag typically governs the archives the resolver decided to
  fetch. It has nothing to say about a fetch some *other* stage performs.
- A skip-resolution flag ("do not compute dependencies, install exactly this")
  narrows what gets resolved. It does not narrow what gets *built*, and it is
  routinely read as though it did.

The consequential instance is building from source. Modern source builds run in
an **isolated build environment**, and constructing that environment means
fetching the build backend the package declares — a compiler front-end, a
build tool, a packaging library — from the network, resolved by the package
manager itself, *outside* the hash-checking the caller enabled. The caller sees
one command with a verification flag on it and reasonably concludes the command
is verified. Two fetches happened; one was checked
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The fix is structural, not a flag:

1. **Pin the build backend explicitly**, in its own lockfile, as the exact set
   the package's build declaration names.
2. **Install that lockfile first**, hash-verified like everything else.
3. **Disable build isolation** for the source install, so the build reuses the
   copies just verified instead of fetching its own.

Order matters and the third step is the one that is forgotten, because the first
two look like they have already solved it.

## The other unpinned fetches hide inside subcommands

Once the question is *which fetches does this cover*, the same audit finds a
second family: **a tool's own "download the thing" subcommand.** A framework
that fetches a language model, a browser driver, a plugin, a ruleset, a
platform-specific binary. These are ordinary network downloads of executable or
executed content, they usually resolve to a release asset outside the package
registry, they are frequently unversioned in the documented invocation, and the
lockfile has never heard of them because the caller did not express them as
dependencies — the tool did, at runtime.

They are converted the same way: resolve what the subcommand would fetch, pin
that artifact by version *and* hash as a direct reference in a lockfile, and
install it as a dependency. The version must be pinned against the version of
the tool that consumes it, which is the coupling that makes the unpinned
subcommand attractive in the first place — it keeps the two in step
automatically, at the cost of being unauditable.

The general shape, worth carrying past both examples: **any step where a tool
fetches on your behalf, rather than you fetching, is outside your pinning until
proven otherwise.** Toolchain installers, plugin managers, model downloaders,
schema fetchers, and the build backend all share that property.

## Auditing scope without waiting for an incident

- **Enumerate install sites, then annotate each with what verifies it.** Not
  "is it pinned" — *what is the mechanism, and what does that mechanism see*.
  A site whose answer is the name of a flag rather than the name of a lockfile
  is the one to open.
- **Watch the network, once.** A build run with egress logged, or run against a
  cache primed only with the pinned set, answers the question empirically: a
  fetch of anything not in a lockfile is the finding. This is cheap, runs once
  per pipeline shape, and is the only method that does not depend on knowing a
  tool's stage decomposition in advance.
- **Treat a pinning scanner's silence carefully.** Tooling that flags unpinned
  installs reads invocations, so it sees the flag and passes the step — the
  scanner is scoped to the same surface the caller was. Its clean report is
  evidence about the command line, not about the run
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

A last note on why this stays broken once found: the pinned form is materially
uglier than the unpinned one — three commands and two extra lockfiles where
there was one line — and the honest comment explaining *why* is the only thing
standing between it and a future simplification. Write the comment at the
install site, not in a document
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## Decision rules

- **A flag verifies a stage. Name the stages the command runs.**
- **Source builds fetch their own build tooling.** Pin it separately, install it
  first, disable isolation.
- **A tool subcommand that downloads is an unpinned dependency**, whatever it
  calls itself.
- **Prove scope by observation, not by reading flags.** One egress-logged build
  settles it.
- **The scanner that certifies your pinning sees the same surface you did.**
- **Every ugly pinning construction carries the comment that explains it**, or
  it is refactored away by someone who assumed it was ceremony.

---
layer: technique
type: technique
subject: deployment-contract
technique: build-context-filter-parity
status: forged
stage: team
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [a remote build fails with a missing file that the local or pipeline build found, adding an upload filter for a hosted build service, copying an ignore list from one tool's format to another, a remote build uploads more or less than the container build context]
---

# Build-context filter parity

A build that runs somewhere else starts with an upload, and the upload is filtered. Which files
reach the remote builder is therefore an input of the build exactly like the runtime version or
the install flags in [platform-build-parity](./platform-build-parity.md) — and it is the input
nobody lists, because the filter is a dotfile that was copied once and never read again.

Most repositories that build a container remotely have at least two filters over the same tree.
The container build reads its context filter beside the container definition. The remote build
service's upload tool reads its own upload filter — and, where none exists, often generates a
default that pulls in the version-control ignore file, or falls back to it. Each filter is a
list of patterns, the lists usually look identical, and they are interpreted by **different
matching rules**.

## The semantic trap

The two common pattern dialects disagree on the one case that matters most. In the
version-control dialect, a pattern with no slash in it is **unanchored**: `docs` matches a
directory named `docs` at any depth, so it drops the documentation folder at the root and also
every nested folder that happens to be called `docs` — a fixture set, a generated API reference,
a module of the application. In the container-context dialect, patterns are matched from the
context root, so the same `docs` drops only the root folder, and reaching every depth needs an
explicit `**/` prefix.

Copy a container context filter into an upload filter that uses the version-control dialect and
every short root-only entry becomes an any-depth entry. The failure arrives in one of two
shapes. The loud one: a nested folder the application imports is stripped, and the remote build
fails with a missing module while the pipeline's own container build of the same commit passes.
The quiet one: the stripped folder is only read at runtime, the build succeeds, and the deployed
service fails on the first request that needs it. The reverse copy fails the other way — an
any-depth secret pattern becomes root-only, and a nested environment file is uploaded.

## The procedure

1. **Give the remote upload a dedicated filter,** named for that build and passed to the upload
   tool explicitly, so it cannot silently fall back to the version-control ignore file or to a
   generated default. The version-control ignore file answers a different question — what is
   not committed — and the build may need files it ignores, or must exclude files it keeps.
2. **Write every entry in the filter's own dialect, deliberately anchored.** In the
   version-control dialect, a root-only entry carries a leading slash before the name; an any-depth
   entry says so with a double-star prefix; a bare name is allowed only where any depth is intended.
3. **State the twin at the top of each filter.** One line naming the other filter, the dialect
   each uses, and that root-only entries are anchored. The next person to edit one finds the
   other.
4. **Compare what each filter admits, not what each file says.** Most upload tools can list the
   files they would upload without uploading; the container builder can report the context it
   received. A check that diffs the two admitted sets — or at minimum asserts that every
   directory the build imports from is present in the upload listing — turns the twin into a
   tested pair. Per [gate-sees-target](../../../../_laws.md#gate-sees-target), compare the
   admitted sets, because two pattern files that look the same are the proxy that diverges.
5. **Generate when you can.** Per
   [one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary), the
   exclusion set is one vocabulary with two renderings. Where the build tooling allows it, keep
   one list and render each filter from it with the dialect's anchoring applied; where it does
   not, the step-4 check is the only thing keeping two hand-written copies honest.

## Decision rules

- Every remote upload has its own filter, passed explicitly; never rely on a default or a
  fallback to the version-control ignore file.
- In an unanchored-by-default dialect, a root-only entry carries a leading slash; a bare name
  means any depth and is written only when that is meant.
- Two filters over one tree name each other and their dialects.
- The admitted sets are compared by listing, not by reading the pattern files side by side.
- A secret pattern is any-depth in both dialects.

## When not to use it

A build that runs only where the context is sent by one tool — the pipeline builds and pushes
the image, and the host only pulls it — has one filter and no twin. The prebuilt path described
in [platform-build-parity](./platform-build-parity.md) avoids the problem entirely, and is the
better answer when the remote build exists only because a local container runtime was not
available.

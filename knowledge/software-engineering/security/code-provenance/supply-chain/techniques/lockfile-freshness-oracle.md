---
layer: technique
type: technique
subject: supply-chain
technique: lockfile-freshness-oracle
status: forged
laws:
  - gate-sees-target
  - one-authority-per-vocabulary
  - count-carries-predicate
shared_with: []
use_when: [a lockfile check goes red because an upstream published a release, deciding what "the lockfile is out of date" should mean, one lockfile serves several runtime versions, a regenerated lockfile diff is unreviewable, a manifest edit shipped without its lockfile]
---

# The lockfile freshness oracle

A committed lockfile is the artifact every other guard in this subject points
at: the policy gate reads it, the advisory scan reads it, the hash-verified
install consumes it. All of that assumes the lockfile still corresponds to the
manifest it was generated from. A manifest edited without regenerating its
lockfile produces a repository where the gates are examining a graph the build
no longer builds — the failure
[dependency-policy-gates](./dependency-policy-gates.md) names when it insists
the build refuse to proceed on disagreement.

So teams add a freshness check, and it is almost always built wrong, in a way
that makes it worse than absent: it re-resolves the manifest and compares the
result to the committed file. That check is red whenever **anybody in the world
publishes a release**, because a fresh resolution takes the newest permitted
version and the committed file holds the version that was newest when it was
generated. It fires on a day when nothing in the repository changed, it fires on
unrelated pull requests, and within a fortnight the team has learned that this
particular red means nothing. A gate that fires on a condition its owners cannot
act on is uninstalled, ignored, or made non-blocking — and the real condition it
was built for goes with it.

## Name the question before building the oracle

Two different questions hide behind "is the lockfile up to date", and they want
opposite answers:

- **Does the lockfile still satisfy the manifest?** A repository-local property,
  changed only by a commit, and the thing a merge gate should block on.
- **Does the lockfile hold the newest available versions?** A property of the
  outside world, changed by strangers, on no schedule. It is a legitimate thing
  to want — it is the update lane — but it is *never* a merge gate, because the
  answer is "no" almost always and the fix is a reviewed dependency bump, not an
  edit to the branch under review.

Confusing the two is what builds the noisy check. The merge gate asks the first
question, and it needs an oracle whose answer does not move when the world does.

## Re-resolve under the committed file as a constraint

The construction is one step off the naive one and changes the entire meaning:
re-resolve the manifest **with the committed lockfile supplied as a constraint**,
then compare. Now the resolver is told to prefer exactly what is already pinned,
so the fresh resolution reproduces the committed file *unless the manifest can
no longer be satisfied by it* — a dependency added, removed, or moved outside
its recorded version. Upstream releases change nothing, because the constraint
holds the resolution still. The check now fires on exactly one condition: a
manifest edit that did not bring its lockfile along.

Two details decide whether it works in practice:

- **Compare the semantic content, not the file.** Generated lockfiles carry
  headers naming the command that produced them, comment lines recording why a
  package is present, continuation escapes, and integrity blocks that reformat
  between tool versions. Diffing raw text produces failures that are real
  differences and mean nothing. Extract the field that carries the decision —
  the resolved name-and-version set — and compare that, so the check is about
  the graph rather than about the generator's formatting.
- **The comparison is the definition.** Whatever the extraction reads *is* what
  this repository means by "the lockfile is current"
  ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
  If it reads versions and not hashes, a corrupted or hand-edited hash passes
  freshness; say so where the check is written rather than letting readers
  assume the stronger property.

## First ask whether your installer already is the oracle

Before building any of this, check what the ecosystem's own strict-install
command does, because in several ecosystems it *is* the constrained resolution
described above and a hand-built check beside it is duplicated logic that can
only drift. The strict install — the mode that says "install exactly the
lockfile, do not update it" — typically refuses outright when the lockfile
cannot satisfy the manifest, and is by construction immune to upstream
releases, because it never resolves anything. That is precisely the oracle,
already wired to the exit code, already running on every job that installs.

Where that holds, the freshness gate is **free and already present**, and the
work is to confirm it: a build that installs with the permissive command
somewhere in the pipeline has an unguarded lane, and one job using the strict
mode does not gate the others.

The hand-built check is for the case where it does not hold — most commonly
when the lockfile is *compiled* from the manifest by a separate tool rather
than maintained by the installer, so the installer receives only the compiled
artifact and has nothing to compare it against. That separation is exactly what
removes the built-in guarantee, and it is worth noticing that the ecosystems
needing this technique most are the ones whose pinning is most deliberate.

## One lockfile does not serve a matrix

A fully-pinned lockfile is resolved for a specific target — a runtime version, a
platform, sometimes an architecture — and this is invisible until a dependency
somewhere in the graph carries a **version-conditional requirement**. The usual
cause is a standard library that drops a module: from the release that removes
it, packages depending on that module acquire a backport dependency, so a graph
resolved for the older runtime simply does not contain those packages or their
hashes.

Install that file on the newer runtime under strict hash verification and it
fails outright — which is the good outcome, and worth stating as a design
preference: **a lockfile that cannot serve a target should fail loudly on that
target rather than silently install a subset.** A verification mode that
tolerates unlisted packages converts the same condition into a partially
unpinned install nobody sees.

The consequences are mechanical. Resolve one lockfile per matrix cell that
actually differs, name each file for the target it was resolved against, record
the exact command in the file, and record beside it *why* the split exists —
because two nearly identical multi-hundred-kilobyte files with no stated reason
are a standing invitation to consolidate them. Before assuming one target's file
covers another, install it on the other and look; the failure is immediate and
the assumption is otherwise untested.

## Reviewability is part of the gate

A regenerated lockfile is a diff no human reads — thousands of lines, most of
them hashes. That is tolerable only when the *reason* for the regeneration is
independently visible: the manifest change that forced it, in the same commit,
small enough to read. A lockfile diff arriving alone, or arriving alongside an
unrelated feature, has no reviewable justification and is exactly the shape a
malicious pin change wants
([update-automation-review](./update-automation-review.md) owns the review
posture). State the count with its predicate when reporting these
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): "one
manifest line changed, four hundred lockfile lines followed" is reviewable;
"four hundred lines changed" is not.

## Decision rules

- **Check the strict-install command first.** Where it refuses on
  manifest/lockfile disagreement, you already have the gate and should not
  build a second one.
- **Freshness means "satisfies the manifest", never "is newest".** The second is
  the update lane and must not block a merge.
- **Re-resolve under the committed file as a constraint**, or the gate is a
  clock and will be switched off.
- **Compare extracted decisions, not generated text.**
- **Whatever the comparison reads is the guarantee.** Write down what it does
  not read.
- **One lockfile per matrix cell that differs**, each naming its target and its
  regeneration command.
- **Prefer the loud failure on the wrong target** to a tolerant install that
  under-pins.
- **A lockfile diff travels with the manifest change that caused it.**

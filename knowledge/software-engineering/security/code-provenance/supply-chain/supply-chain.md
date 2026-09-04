---
layer: golden-path
type: golden-path
subject: supply-chain
status: forged
techniques:
  - secret-scanning-architecture
  - dependency-policy-gates
  - verification-scope
  - lockfile-freshness-oracle
  - scheduled-deep-analysis
  - permission-manifest-scoping
  - archive-extraction-safety
  - unsafe-deserialization-off-by-default
  - update-automation-review
  - toolchain-floor-drift
  - vendored-fork-ledger
  - patching-mechanism-ladder
  - signature-preserving-patching
  - build-time-dependency-tier
  - review-attestation-ledger
---

# Supply-chain & secret hygiene

A codebase's trust boundary is not its own source. It is everything that
flows across the repository's edges: credentials that leak *out* into
history, third-party code that flows *in* through dependency resolution,
platform permissions the application claims at install time, and archives
downloaded and unpacked at runtime. Each of these crossings is an attack
surface with its own economics, and the unifying discipline is the same:
**every crossing is guarded by a standing, mechanical policy — not by an
event, a person's memory, or a one-time cleanup.** A secret scan that ran
once, a dependency audit performed the week of a scare, a permission list
reviewed at launch — these are photographs of a boundary that moves every
day. The domain of supply-chain hygiene is converting each photograph into
a camera that never stops running.

## A secret in history is an incident, not a file

The cost curve of a leaked credential is a step function, and the step is
at **push**. Before a secret enters shared history, the remedy is deleting
a line. After, the remedy is rotation — the secret must be treated as
compromised the moment it leaves the machine, because history is copied,
mirrored, and cached beyond recall, and rewriting it does not un-leak
anything. This asymmetry dictates the architecture: the highest-value
scan is the cheapest one, run at the last moment before the step —
**staged-content scanning at commit time**. Scanning the working tree
checks files as they sit on disk, not what is about to be committed; the
two diverge exactly under partial staging
([gate-sees-target](../../../_laws.md#gate-sees-target)), so the scan reads the
staged diff. Full-tree and full-history sweeps still exist, but on the
scheduled lane where their cost is paid off the critical path. Detector
design, allowlist discipline, and the response protocol when a secret
lands anyway are
[secret-scanning-architecture](./techniques/secret-scanning-architecture.md).
The boundary: this subject owns the *history* crossing; secrets at rest,
their storage, and their redaction at every egress channel are
[credential-vault](../../identity-and-access/credential-vault/credential-vault.md)'s domain —
ignore-by-name protection and scan-by-content protection are complements,
not substitutes, because a leak arrives under a filename nobody
anticipated.

## An absent scanner announces itself — and an announcement is not enforcement

Secret scanners are usually external engines that a given machine may not
have installed. The naive failure is silent: engine absent, scan "passes,"
and the one machine without the tool is the one machine where the leak
ships — exit 0 with zero findings is the most expensive lie in automation
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)). The
first-order fix is the **announced skip**: the wrapper detects the missing
engine and says so loudly at every commit. But an announcement, however
honest, enforces nothing — the control is opt-in on every machine that
never installed the tool, and its skip message is, as the gate-liveness
doctrine puts it, the gate's obituary read aloud at each commit. The
complete structure is announced skip *plus* a binding backstop: a merge
rung that installs the engine itself and runs unconditionally, so local
absence costs latency, never coverage. The rung mechanics belong to
[gate-laddering](../../../engineering-process/standards-and-gates/quality-gates/techniques/gate-laddering.md) and the
skip-vs-enforcement distinction to
[gate-liveness](../../../engineering-process/standards-and-gates/quality-gates/techniques/gate-liveness.md); this
subject owns what the rungs *scan*.

## Dependency risk is a standing policy, not an event

Third-party code is the largest body of code in almost any modern
application, and it changes risk posture without any commit to the repo —
a new advisory published tonight applies to the same pinned graph that
passed yesterday's build. The senior structure is a **machine-readable
policy file, versioned and reviewed like code**, evaluated continuously:
security advisories denied by default, licenses accepted by explicit
allowlist, package sources restricted to known registries, and every
exception carrying an identifier, a written rationale, and an expiry.
The policy's target is the *resolved* dependency graph — the lockfile,
where transitive dependencies live — never the hand-written manifest,
which names only the surface
([gate-sees-target](../../../_laws.md#gate-sees-target)). Policy shape,
exception hygiene, and multi-ecosystem coverage are
[dependency-policy-gates](./techniques/dependency-policy-gates.md).

Two properties of that lockfile have to hold before any of the gates reading it
mean anything, and each fails quietly in its own way. It must still correspond
to the manifest it came from — a check that is trivially built so badly that it
fires whenever a stranger publishes a release, and is then switched off along
with the real condition it was meant to catch
([lockfile-freshness-oracle](./techniques/lockfile-freshness-oracle.md)). And
the verification that consumes it must actually cover the whole install: a
hash-checking flag governs a stage rather than a command, so a source build
fetching its own build tooling, or a tool subcommand downloading a model, walks
straight past a step everyone reads as fully pinned
([verification-scope](./techniques/verification-scope.md)).

## The graph holds two populations, and only one of them ships

One policy over one resolved graph treats every dependency as one kind of
risk. The graph contains two. Some of that code will run inside the
shipped product; the rest runs **at build time, on the developer's
machine and on the build runner**, with those machines' filesystem,
network, environment and whatever credentials are live while the build
runs. A merged evaluation prices a build-time package by its shipped
exposure — frequently nil — when its actual exposure is arbitrary
execution beside an engineer's credential agent, so the misprice is
worst exactly where compromise is cheapest. The build-time population is
usually sparse enough to enumerate by hand, which makes a review nobody
can afford over the whole graph affordable over this slice; and in a
hermetic, credential-free build environment the distinction collapses
and the extra inventory is ceremony. The split, the per-entry "what
could this reach" question, and the escalation for a package that newly
acquires build-time execution are
[build-time-dependency-tier](./techniques/build-time-dependency-tier.md).

## Known-bad and never-looked-at are different questions

Every mechanism above matches the graph against something already known:
an advisory, a licence set, a registry allowlist. All of them are silent
about code nobody has ever opened, and that silence reads as a pass —
*unknown* rendered as a definite verdict
([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)). The
complementary axis is a committed record of **who reviewed which version
against which criteria**, kept as versioned files beside the lockfile and
gated on the merge rung like everything else. Its recurring cost tracks
graph churn rather than graph size, which is why importing peer
organizations' records under a declared trust relationship is
load-bearing rather than a convenience — and why an import whose criteria
nobody read is worse than no ledger, because it renders as coverage. The
same axis keeps one distinction the advisory feed cannot: a package with
no known vulnerabilities may equally have no living maintainer, and
abandonment is nobody's advisory. The ledger's shape, the delta
certification that makes it survivable, and the graph size below which it
is bookkeeping are
[review-attestation-ledger](./techniques/review-attestation-ledger.md).

## Updates arrive as code wearing a friendly label

Automation that opens dependency-update proposals inverts the usual review
posture: the diff is machine-generated and looks like housekeeping, but
the payload is third-party code entering the trust boundary. The standing
doctrine is **never blind-merge**: an update is reviewed against its
changelog and release notes, its lockfile diff is read for what *else*
moved, and a green pipeline is understood as necessary but not sufficient
— the project's tests exercise the project's use of the dependency, not
the dependency's changed behavior outside that coverage, and a malicious
release is engineered to pass exactly such tests. Risk-tiering, batching
cadence, and the exposure-window metric are
[update-automation-review](./techniques/update-automation-review.md).

The mirror case is the update **nobody proposed**. A project's declared
minimum toolchain is a claim about a number it does not own: the effective
floor is the maximum across the whole transitive graph, and ecosystems
routinely permit a package to raise its own declared minimum in a *patch*
release, on the argument that its interface did not change. So the floor
rises without a manifest diff, without a proposal to review, and without any
change by the team — surfacing days later as a build failure on the one lane
still running the old toolchain, during an unrelated change. The two halves
belong together: this subject reviews the code that arrives, and must also
notice the constraint that arrives with it. A pipeline that builds only on
the current toolchain has never observed the floor the project advertises,
which makes the claim prose rather than a fact. The lane that makes it a
fact, the reason a locked resolution is the wrong instrument for it, and how
long a support window costs nothing to hold, are
[toolchain-floor-drift](./techniques/toolchain-floor-drift.md).

## Forking a dependency does not break its guards — it ends them

Both mechanisms above watch a *crossing*: the policy reads the resolved graph,
the review reads the proposal. Copying a dependency's source into the
repository and patching it satisfies neither by escaping both. The resolved
graph no longer names an upstream version for that code, so advisory and
license matching have nothing to match; update automation has no update to
propose; and every mechanical test now classifies the code as first-party.
Nothing fails. The dependency stops being watched, and per
[absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud) an ended guard that
announces nothing is the one that decays fastest — this one announces nothing
by construction.

Forking is often the right call, and the standard is not to forbid it but to
price it. The price is a committed **ledger**: the upstream commit the copy was
taken from, and one indexed entry per local patch carrying why it exists, the
base it applies to, the verification that proves its behaviour, and — the field
that does the work — a **removal condition stated as a falsifiable event**. A
patch is a created thing with no natural owner, and
[creation-names-reaper](../../../_laws.md#creation-names-reaper) says the question
"what removes this?" is answered at creation or never. Because a prose index is
a claim about two trees, it is verified rather than trusted: an inventory check
in both directions, plus clean reverse-application of every patch against the
vendored source, which is what proves the index still describes the tree
([gate-sees-target](../../../_laws.md#gate-sees-target)). The entry's fields, the
re-vendoring walk, and why the overridden version must be pinned exactly are
[vendored-fork-ledger](./techniques/vendored-fork-ledger.md).

## The record is owed whatever the mechanism, and the mechanism is not a taste

That ledger prices the divergence. It does not decide how the divergence is
*carried*, and teams answer that question by habit — whoever forked last time
forks again. There are four mechanisms, and the choice is driven by the
dependency's shape rather than by preference: taking the upstream tree in as a
pinned nested checkout, for a framework you will diverge from structurally;
keeping that tree unmodified and building a parallel definition beside it that
includes it file by file and substitutes only what changed, with the mirror
masquerading as the ordinary package reference so the rest of the graph
resolves normally; rewriting behaviour in memory at start-up; and rewriting the
same change into the compiled modules during the build. The mechanism also
decides what the guards can still see, which makes it this subject's business
and not an ergonomic detail: only the first removes the dependency from the
resolved graph, and the other three leave a graph that is right about
provenance and silent about behaviour
([gate-sees-target](../../../_laws.md#gate-sees-target)). Instructively, the
mirror's rejected alternatives all *work* and were all refused on grounds
outside the code — a private feed contradicts a project's own build-it-yourself
posture, publishing a customized build to the public feed spends a commons, and
mounting the whole upstream tree bills every build forever to serve a few
changed files. The rungs, the shape questions that select between them, and the
record every one of them still owes are
[patching-mechanism-ladder](./techniques/patching-mechanism-ladder.md).

The last two rungs are functionally interchangeable, and the thing that
separates them is not correctness — it is **distribution**. Modifying compiled
modules at start-up is indistinguishable from the injection family that
platform heuristic malware detection exists to catch, and modules rewritten
after the process starts cannot inherit the application's signature, so the
trust chain breaks exactly where the modification lives. Applying the identical
change during the build produces ordinary statically-modified artifacts that go
through the signing pipeline like any other output and give a behavioural
heuristic nothing to observe. The general rule is worth stating past this case:
a patching mechanism is chosen against the distribution channel, not only
against the code, and the channel is absent from every test that runs before
the artifact leaves. The same property makes the modification auditable — it is
in the artifact you signed rather than applied to memory afterwards — and the
platform trust machinery itself stays
[packaging](../../../engineering-process/build-and-release/packaging/packaging.md)'s
([signing-and-trust](../../../engineering-process/build-and-release/packaging/techniques/signing-and-trust.md)),
while the chain a product produces over its *own* carried data is signed
artifacts & provenance. What this subject owns is the mechanism choice upstream
of both:
[signature-preserving-patching](./techniques/signature-preserving-patching.md).

## Permissions are scoped manifests, and every widening is a diff

What an application is *allowed* to do — filesystem reach, shell access,
network egress, remote hosts a webview may contact — is declared in
manifest files: platform capability declarations, content-security
allowlists, permission lists. Treat these as the **single authority** on
the application's blast radius
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)):
deny by default, widen only through a reviewed diff, and keep the manifest
verifiable against reality — a checker that compares declared hosts to the
hosts the code actually contacts catches both the over-grant that nobody
uses and the under-grant that fails in production. The manifest's diff
history *is* the audit log of privilege growth. Scoping granularity, the
remote-content boundary, and manifest-vs-use verification are
[permission-manifest-scoping](./techniques/permission-manifest-scoping.md).

## Untrusted archives are hostile input

Any archive the application downloads and unpacks — a model bundle, a
plugin, a tool release — is a serialized filesystem authored by someone
else. Its entry names are attacker-controlled paths (the traversal, or
"slip," class: an entry named to escape the destination directory writes
anywhere the process can) and its declared sizes are attacker-controlled
claims (the decompression-bomb class). **Every extraction site defends
itself**: containment checks on every resolved entry path, byte and
entry-count budgets enforced while streaming, extraction into a
quarantine directory that is atomically promoted only after validation.
Verification of *what was downloaded* — digest pinning against the
manifest that named the artifact — happens before extraction and is owned
by [source-pinning](../../../llm-agent/runtime-and-io/sidecar-provisioning/techniques/source-pinning.md);
trust in artifacts the project itself *ships* is
[packaging](../../../engineering-process/build-and-release/packaging/packaging.md)'s domain (see
[signing-and-trust](../../../engineering-process/build-and-release/packaging/techniques/signing-and-trust.md)), and
provenance of published artifacts is the subject of signed artifacts &
provenance. The extraction-site defenses are
[archive-extraction-safety](./techniques/archive-extraction-safety.md).

## The audit cadence is layered — fast at review, deep on schedule

All of the above wants to run constantly, and none of it can afford to run
everywhere. The resolution is the same ladder that governs quality gates
([gate-laddering](../../../engineering-process/standards-and-gates/quality-gates/techniques/gate-laddering.md)),
extended one rung past merge: staged-diff secret scans and lockfile policy
checks are cheap enough for the commit and merge rungs; full-history
secret sweeps, deep semantic analysis, and complete dependency audits run
on a **schedule**, because their findings arrive from the world's clock,
not the repo's — new advisories and improved analysis rules apply to code
nobody touched. A scheduled lane has liveness problems all its own (a
silently disabled recurring job is indistinguishable from a clean one) and
a routing problem (findings with no owner are reports nobody reads); both
are [scheduled-deep-analysis](./techniques/scheduled-deep-analysis.md).

## The techniques

- [secret-scanning-architecture](./techniques/secret-scanning-architecture.md)
  — staged-diff scanning at commit, detector precision and allowlist
  fingerprints, the announced-skip-plus-backstop structure, and the
  rotation-first response when a secret lands.
- [dependency-policy-gates](./techniques/dependency-policy-gates.md) —
  advisory/license/source policy as reviewed config, the lockfile as the
  gate's target, and exceptions with rationale and expiry.
- [build-time-dependency-tier](./techniques/build-time-dependency-tier.md) —
  the graph split by execution phase, the build-time slice priced by the
  host's exposure and inventoried by hand, and the hermetic build that
  makes the split unnecessary.
- [review-attestation-ledger](./techniques/review-attestation-ledger.md) —
  committed per-version review records, delta certification, pooled
  imports under declared trust, and the unread import that renders as
  coverage.
- [scheduled-deep-analysis](./techniques/scheduled-deep-analysis.md) — what
  belongs on the scheduled rung, liveness of recurring jobs, and routing
  findings to an owner.
- [permission-manifest-scoping](./techniques/permission-manifest-scoping.md)
  — least-privilege manifests, per-surface scoping, allowlist parity, and
  verifying declarations against actual use.
- [archive-extraction-safety](./techniques/archive-extraction-safety.md) —
  traversal containment, decompression budgets, quarantine-then-promote,
  and the inventory of extraction sites.
- [update-automation-review](./techniques/update-automation-review.md) —
  reading the changelog before the merge button, risk tiers, lockfile-diff
  review, and measuring the exposure window.
- [toolchain-floor-drift](./techniques/toolchain-floor-drift.md) — the
  effective floor as the maximum over the transitive graph, building at the
  declared minimum with a consumer's resolution, and choosing a support
  window against its real cost curve.
- [vendored-fork-ledger](./techniques/vendored-fork-ledger.md) — the recorded
  upstream commit, per-patch entries with falsifiable removal conditions,
  two-way inventory plus reverse-apply verification, the re-vendoring walk,
  and exact-pinning the version being overridden.
- [patching-mechanism-ladder](./techniques/patching-mechanism-ladder.md) — the
  four mechanisms for carrying a local modification, the shape questions that
  select among them, mirror shadowing and its three alternatives rejected on
  posture rather than capability, and what each rung leaves visible to the
  graph's guards.
- [signature-preserving-patching](./techniques/signature-preserving-patching.md)
  — the distribution channel as the veto over functionally identical
  mechanisms, heuristic detection and the unsignable start-up modification,
  and the audit corollary of putting the change in the artifact you signed.

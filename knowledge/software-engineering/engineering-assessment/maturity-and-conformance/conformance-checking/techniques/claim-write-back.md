---
layer: technique
type: technique
subject: conformance-checking
technique: claim-write-back
status: forged
laws: [derivation-names-recomputation, gate-sees-target]
shared_with: []
use_when: [a checker executes a declared command and must record the proof, preventing a stale verification flag from surviving a broken command, deciding whether an assessment run may write]
---

# Claim write-back

## The concern

When a checker executes a declared command and the command succeeds, it has
produced evidence that nothing else in the system can produce. If that
evidence stays in a log, the contract keeps whatever the author last typed —
including a verification flag that was true in March. **Write-back closes
the loop**: the checker becomes the authority for the proven-ness of a
claim, stamps its proof into the contract, and — the half everyone forgets —
*removes* the stamp when the proof no longer holds.

## What a stamp contains

A proof stamp is a derived value, so it names its recomputation
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
Minimum contents:

- **What was proven** — the clause identifier and the exact command or
  target, so a later reader can tell whether the thing that was proven is
  still the thing being claimed.
- **When** — an absolute timestamp, not "recently".
- **By which run and at which standard version** — a proof against version
  three of a standard is not a proof against version four.
- **At which rung** — a shape proof and an execution proof both deserve
  recording, and confusing them is how a presence check ends up rendered as
  a verified command.

What a stamp must *not* contain: a bare boolean with no provenance. A
naked `verified: true` is indistinguishable from an author's optimism, which
is exactly the state the technique exists to eliminate.

## Demotion is the load-bearing half

A write-back path that only ever writes `true` is worse than none, because
it manufactures durable-looking evidence with no expiry. The rules:

- **A failed re-proof clears the stamp in the same run that observed the
  failure.** Not "flags for review" — clears. The contract must never
  assert a proof the checker just disproved
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)).
- **A stamp older than the declared proof lifetime is stale, and stale is a
  warning, not a pass.** Choose the lifetime from how fast the underlying
  thing drifts; a build command proven six months ago on a project with
  weekly dependency churn is not evidence.
- **A stamp whose standard version predates the current one is stale by
  construction** when the clause it proves changed between versions.
- **Changing the declared command invalidates its stamp.** Record enough of
  the command to detect the change; otherwise editing the command silently
  inherits the old proof.

## Freshness is measured against history, not the filesystem

The trap that catches nearly everyone: staleness computed from file
modification time. A fresh checkout rewrites every modification time to the
moment of the clone, so the same repository reports "everything updated
today" on a remote runner and "this document is two years old" on the
maintainer's laptop — a verdict about the environment, not the project.
**Derive last-change from the version-control history**, which is the only
record of when the content actually changed, and treat an absent history
(a source archive, a vendored copy) as *unable to check* rather than as
either fresh or stale.

## Write-back is a privileged operation

A checker that executes commands declared by the repository under
assessment is running untrusted code by construction. Attach a write
credential to that process and you have built a mechanism where editing a
manifest grants an attacker the checker's write access. The rules are
absolute:

- **Never expose write credentials to a run triggered by an untrusted
  contribution** — a fork's proposal, an unreviewed branch, an external
  submission. Such runs are read-only, and their proofs are reported, not
  stamped.
- **Separate the execution stage from the write stage.** The stage that runs
  declared commands holds no token; a later stage, running only over the
  first stage's structured output, performs the write. This also makes the
  write auditable, because it has a single door.
- **The write is a reviewable change, not an invisible mutation.** A stamp
  landing in the contract should appear in history like any other change,
  attributable to the run that made it.
- **Never write back to a repository the run does not own.** An assessment
  of somebody else's project reports; it does not edit.

## The report-back leg has its own rules

Where results also travel outward — a run posting its verdict to a central
record — three additional rules, each learned by being violated:

- **The credential must name what it may write about.** A deployment-wide
  ingest token is bound to no subject, so any holder can post a verdict
  about *somebody else's* repository and overwrite it. Scope the credential
  to the owner it may report for, verify that scope against the payload's
  subject, and keep a strict mode that refuses the unscoped legacy
  credential once the runners have migrated.
- **Order by the commit under assessment, not by arrival time.** Runs finish
  out of order; a slow re-run of an already-superseded commit must be
  acknowledged and *not* persisted, or an old verdict silently replaces a
  newer one.
- **Validate the number, do not coerce it.** Accepting whatever converts to
  a number turns an empty value, a null, or a boolean from a buggy client
  into a persisted, fabricated zero. Require an actual number — or a
  non-empty numeric string, since shell-built payloads legitimately send
  one — and reject everything else loudly.
- **A skipped report is stated, not silent.** When the report-back
  configuration is absent, the run says so in machine-readable output. "No
  report sent" and "report sent successfully" must not look identical to
  whatever consumes the run.

## Procedure

1. Execute the clause's proof; capture outcome, rung, target and time.
2. Compute the intended stamp state: proven, demoted, or unchanged
   (unable-to-check leaves the existing stamp alone but reports the gap).
3. Gate on trust: if the run is untrusted or unowned, stop here and report.
4. Apply stamps and demotions as one atomic edit to the contract, through
   the single write path.
5. On the next run, read stamps as *inputs to be revalidated*, never as
   passes. A stamp shortens work only where the clause is explicitly
   declared cacheable and its lifetime has not expired.

## When not to use it

- **External assessment.** Scoring repositories you do not control is a
  read-only activity; the write-back loop belongs to a project checking
  itself.
- **Contracts under heavy human editing.** If the contract is a document
  people edit constantly, machine writes will collide; put stamps in a
  sibling artifact the machine owns exclusively, referenced by the contract.
- **Where the proof cannot be re-derived on demand.** A stamp nobody can
  reproduce is an assertion with extra ceremony.

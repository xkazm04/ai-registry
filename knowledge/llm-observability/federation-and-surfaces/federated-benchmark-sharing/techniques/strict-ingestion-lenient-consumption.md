---
layer: technique
type: technique
subject: federated-benchmark-sharing
technique: strict-ingestion-lenient-consumption
status: forged
laws: [never-present-absence-as-an-answer, nullable-never-zero]
shared_with: []
use_when: [one bad contributed record can break a build or a release for everyone, deciding whether to validate the changed entries or the whole store, a validation rule was added and existing accepted data no longer passes it, choosing where in the pipeline a refusal punishes the right party]
---

# Strict at ingestion, lenient at consumption

The subject's rule is that treatments run at both ends of the wire: the
contributor protects itself, and the hub re-applies everything because what a
contributor did to its own numbers is its business. That covers the two ends of
*admission*. It does not cover a third stage that exists in any federation whose
pooled data is later compiled into something — an aggregate, an artifact, a
release — and that stage needs the opposite posture.

The question is not how much to trust the data. It is **who pays for a refusal**.

- **At ingestion, the party who pays is the contributor**, and they are present:
  they just submitted, they can read the reason, and they can fix and resubmit.
  A refusal here is a message to the one person able to act on it. Be strict.
- **At consumption, the party who pays is everybody else.** The data was already
  accepted; the contributor is long gone. A hard failure while compiling the
  pooled set stops a build, blocks a release, or breaks the tool for every
  downstream user — none of whom submitted the bad record and none of whom can
  repair it. Be lenient: skip the entry, emit a warning that names the file and
  the reason, and continue.

Stated as one line: **refuse where the author is standing; degrade where only
bystanders are.**

## Leniency is not silence, and it is not repair

The consumption stage skips and *reports*. It does not guess at the malformed
entry's intent, substitute a default, or clamp it into range — those are
ingestion-stage decisions made where the contributor could have been told
([nullable-never-zero](../../../_laws.md#nullable-never-zero)). At consumption
the only two moves are use it or drop it, and dropping is loud.

The warning matters more than it looks. A skipped entry that logs nothing turns
the leniency into data loss nobody can see, and the compiled artifact silently
represents fewer contributors than the store holds. The warning is what makes
this asymmetry recoverable rather than merely survivable: it says an entry
passed ingestion and failed consumption, which is a *gate defect*, and the
correct repair is upstream — either the ingestion rules missed a case, or a rule
was added later and the accepted data predates it.

That second cause is the common one and it is worth designing for. Rules
tighten over time, and existing accepted records were admitted under the old
ones. A consumption stage that fails hard on the new rule turns every
retroactive tightening into an outage; one that skips and warns turns it into a
worklist.

## Validate the whole store, not the change

A related choice sits at the ingestion gate, and the default is usually wrong.

Validating only the entries a proposal touches is the cheap, obvious scope, and
it checks the wrong invariant. What the federation actually needs to hold is
that **the store is valid**, not that the latest change was — and those come
apart the moment a rule is added, a schema is extended, or a file is moved by a
change that did not itself introduce a bad record. Validating the whole store on
every proposal keeps the invariant true continuously and surfaces retroactive
breakage at the next contribution rather than at the next release.

The cost is linear in the store's size, so the decision has a lifetime, and it
should be written down with its **return condition**: validate everything while
the store is small enough that doing so is unremarkable, and revisit when the
run time becomes a thing anybody notices. A validation scope chosen without
recording why is one nobody dares revisit later.

## What this owes the operator

- **A count of entries skipped at consumption**, in the artifact's own build
  output. Zero is the expected value, and any other number is a gate defect
  awaiting triage.
- **The ingestion rules and the consumption rules stated as one policy**, so the
  difference between them is visibly a decision about who pays rather than an
  accident of two people writing two validators.

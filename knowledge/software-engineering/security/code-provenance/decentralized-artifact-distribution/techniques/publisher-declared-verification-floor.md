---
layer: technique
type: technique
subject: decentralized-artifact-distribution
technique: publisher-declared-verification-floor
status: forged
laws: [absent-guard-is-loud, record-precedes-effect, gate-sees-target]
shared_with: []
stage: fleet
use_when: [deciding where the requirement for build provenance is configured, a release stripped its attestation and nothing noticed, giving a build system credentials to publish on a publisher's behalf, arguing that a registry-wide provenance switch is enough]
---

# Publisher-declared verification floor

A distributor cannot raise a floor it does not own. It can refuse artifacts, but
the moment it tries to *require* something of every publisher it either excludes
most of them or sets the requirement at the weakest publisher's level. The
useful inversion is to let each publisher declare the floor that applies to their
own artifacts, in metadata they sign, and to make the distributor enforce the
publisher's declaration rather than its own.

This buys one specific property that a registry-wide switch cannot: **a
downgrade becomes a contradiction rather than an absence.**

## Why the requirement must be signed, and by the party being checked

Consider an artifact that normally ships with build provenance, and an attacker
who has compromised the publishing path and wants to ship one that does not.

Under a registry-wide switch, the attacker removes the attestation. The consumer
sees an artifact with no provenance, in a registry where provenance is optional,
which is a state thousands of legitimate artifacts are also in. Nothing is
wrong; there is only something missing, and missing has no signal.

Under a publisher-declared floor, the attacker removes the attestation and the
publisher's **signed** metadata still says provenance is required for this
package. Now there is a signed statement and an artifact that contradicts it,
and the verifier has a named, unambiguous outcome: *the signed policy requires
provenance and the release has none*. To suppress the contradiction the attacker
must also re-sign the policy, which requires the publisher's key — which is the
thing the whole design is anchored on.

The distinguishing property is that the declaration and the thing it constrains
are **separately signed and separately transported**. A requirement that travels
inside the artifact it constrains can be removed with it; a requirement in the
publisher's profile record, distinct from the release record, cannot.

Three rules follow:

- **The floor lives in the publisher's own signed metadata**, at the level the
  publisher reasons about — usually the package, not the individual release, so
  that a release cannot lower its own bar.
- **The verifier reports the contradiction as its own outcome**, distinct from
  "no provenance, and none was required" and from "provenance present but
  unverifiable". Three states, three names; collapsing any pair loses exactly the
  signal the design bought
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)).
- **Absent-and-permitted is a *labelled* success, not a plain one.** An artifact
  that legitimately carries no attestation is admissible and must be reported as
  unattested, so the consumer's own policy can act on it.

## The publishing half: a narrow tuple, declared in advance

The same shape governs the write path, and it is the half that gets skipped.

A publisher who releases from automation has to give that automation the power
to publish. The naive form is a long-lived credential in the build system's
secret store, which makes the build system a full deputy: anyone who can run a
job in that repository can publish anything under the publisher's name, forever.

The form that carries the property:

- **The build runner holds no long-lived publishing credential.** It presents a
  short-lived, externally attested workload identity — a token minted per run by
  the platform the job runs on, asserting the repository, the workflow file, the
  reference, and the environment.
- **The custody service holds a delegation, granted by the publisher in advance,
  pinned to an exact tuple**: this repository by immutable identifier as well as
  by name, this workflow, these references, these environments. Matching by name
  alone is defeated by a rename or a transfer; matching by identifier alone
  produces confusing failures. Match both.
- **The delegation is scoped to one collection and one action.** Create releases;
  nothing else. Not update, not delete, not the profile record, not any other
  record type. The scope string is generated from one definition that both the
  grant request and the enforcement read, so that widening it is a visible change
  that invalidates existing grants rather than a silent expansion
  ([record-precedes-effect](../../../../_laws.md#record-precedes-effect) applies to
  the grant itself: the delegation record exists before any release is minted
  under it, and a release that cannot be attributed to a live grant is refused).
- **Each rejection has its own code** — inactive policy, repository mismatch,
  workflow mismatch, reference mismatch, environment mismatch. A single
  "unauthorized" tells an operator nothing about which of five pins failed, and
  during a legitimate workflow rename that ambiguity costs an afternoon.

The resulting bound is worth stating precisely, because it is the sales pitch and
it is narrower than people assume: **a compromised repository yields at most
releases matching an already-approved tuple.** It does not yield takeover of the
publisher's identity, publication of other record types, or publication from a
different workflow. It does yield malicious releases through the approved path,
which is why this is a containment control and not a correctness one.

## The negative that keeps this honest

Nearly every deployment of this technique ships with a **permissive default**:
the floor field is absent from most publishers' metadata, the verifier's default
policy is "provenance not required", and the apparatus is therefore opt-in per
package. The fleet converges on the default, and the default is an unattested
install ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

Say this in the design document, because a diagram of the attested path
misrepresents what most installs actually do. And be equally honest about the
compensating controls, which are usually weaker than they look:

- **A discovery holdback on age** — new or newly-changed releases are withheld
  from the catalogue for some interval, on the theory that a compromise is
  noticed within it. It is a real control, and it is weaker than it appears when
  the record carries no *signed* publication time: the age being measured is the
  index's observation time, which the publisher does not attest and an attacker
  who can delay ingestion can influence.
- **Requiring the floor for new publishers only** — leaves the largest and most
  attractive targets on the old default indefinitely.

The strongest version of the honest statement is a number: what fraction of
listed artifacts have a declared floor, published where operators can see it. A
capability whose adoption is unmeasured is a capability whose adoption is
assumed.

## Decision rules

- **The requirement is declared by the party being checked, in signed metadata,
  transported separately from the thing it constrains.** Otherwise a downgrade is
  an absence and absences have no signal.
- **Three outcomes, three names**: required-and-missing, absent-and-permitted
  (labelled unattested), present-and-unverifiable. Never two.
- **The floor sits above the release**, at a level a single release cannot
  rewrite.
- **No long-lived publishing credential in a build system.** Short-lived attested
  identity, verified against a pre-declared tuple.
- **Pin the repository by identifier *and* by name**, and give every pin its own
  rejection code.
- **Scope the delegation to one collection and one action**, generated from a
  single definition that both the grant and the enforcement read.
- **Publish the adoption rate of the floor.** Opt-in security whose uptake is
  unmeasured should be described as unmeasured.

## When not to use it

- **When the publisher population cannot produce attestations.** Requiring a
  floor that most publishers have no build system to satisfy converts the
  registry into a registry of well-funded publishers. Ship the mechanism, leave
  the default permissive, and be honest — which is the situation this technique
  describes rather than pretends to solve.
- **When the distributor genuinely is the authority** and can set one floor for
  everyone. Then a registry-wide switch is simpler and correct, and the
  downgrade-detection argument does not apply because the switch is not something
  an attacker can remove from the artifact.
- **When publishing is manual and rare.** The delegation machinery is a
  substantial build for a publisher who releases twice a year from a laptop, and
  a short-lived credential minted at release time by a person is already most of
  the property.
</content>

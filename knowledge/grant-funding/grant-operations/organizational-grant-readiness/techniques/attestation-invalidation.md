---
layer: technique
type: technique
subject: organizational-grant-readiness
technique: attestation-invalidation
status: forged
laws: [provenance-per-field, clean-is-not-ready]
shared_with: []
use_when: [persisting a registry-verification result or any derived trust badge, deciding what happens to verified status when a source field changes, a verified badge vouched for data it never checked]
---

# Attestation invalidation

The technique treats every persisted trust artifact — a registry
verification, a sanctions-screen pass, an eligibility confirmation, a
"documents on file" badge — as an **attestation**: a record that a specific
check ran against specific input values at a specific time, with a specific
outcome. The discipline is twofold: persist the attestation richly enough
that it can be audited, and invalidate it the instant any input it attested
to changes. A trust artifact that survives the mutation of its subject is
not stale data; it is a forged credential the system issued to itself.

## The shape of an attestation

A boolean `verified` flag is the anti-pattern. A real attestation carries:

- **The bound input values** — the registry identifier (and any other field
  the check read) exactly as checked. Binding is what makes invalidation
  computable: without it, "did the input change?" cannot be answered.
- **When** — the timestamp of the confirming run, because trust decays with
  time even when nothing changes, and downstream consumers may apply their
  own freshness windows.
- **From what** — the source keys of the checks that passed. Two different
  registries confirming different properties are two facts, not one; a
  combined pass must list its parts so a partial re-check is possible.
- **The human-readable outcome** — the headline the check produced, so the
  audit trail explains itself without re-running anything.

Persisting this at save time — rather than leaving the verification result
in client state — is what turns a one-off green checkmark into an
eligibility signal, a badge, and an audit trail that survive the session.

## Procedure

1. **Enumerate dependencies per attestation.** For each trust artifact,
   write down exactly which profile fields its check read. This list is the
   invalidation trigger set and belongs next to the artifact's definition,
   not in tribal memory.
2. **Invalidate in the write path, not in a cleanup job.** The same storage
   operation that persists a change to a dependency field resets the
   attestation to null — atomically, in the one place all writes flow
   through. A scheduled sweep leaves a window where the badge vouches for
   the wrong entity; the write-path reset leaves none.
3. **Reset means null, not "stale".** The invalidated attestation is
   removed, returning the profile to the honest unverified state. Keeping
   the old record flagged "outdated" invites UI and queries to keep
   trusting it; if history matters, move it to an append-only audit log,
   never leave it in the live slot.
4. **Carry forward only on identity.** When a save does not touch any
   dependency field, the stored attestation is carried forward unchanged.
   The branch is mechanical: dependencies unchanged → keep; any dependency
   changed → null, regardless of how minor the edit looks. A formatting
   change to an identifier is a change — normalize before comparing if
   cosmetic edits should not invalidate.
5. **Report coverage, not just outcome.** A profile with no attestation and
   a profile whose check failed are different states, and both differ from
   "checked and passed". Surfaces that summarize readiness must render all
   three distinctly — a dashboard that shows an unrun check as clean is
   certifying nothing.

## Decision rules

- **When a new feature wants to read `verified`, make it read the bound
  identifier too and compare, because** defense in depth is cheap here and
  the one consumer that skips the comparison is where the forged-credential
  bug will live.
- **When re-verification is expensive or rate-limited, invalidate anyway
  and queue the re-check, because** the alternative — keeping the old pass
  alive "until we can re-run" — is precisely the vouching-for-the-wrong-
  entity window the technique closes.
- **When an attestation aggregates multiple checks and only one
  dependency changed, invalidate the aggregate, because** partial validity
  of a combined badge is unrepresentable to users; re-run the cheap parts
  and re-issue.
- **When the subject is externally mutable** (registries revoke status
  without notifying you), **add a freshness horizon after which the
  attestation demotes to "confirmed as of {date}", because** input-change
  invalidation only covers changes you can observe.

## When not to use

Do not apply attestation machinery to facts that are their own source —
the applicant's freeform mission statement needs no verification record,
because there is nothing external to attest against. And do not invalidate
on fields outside the dependency set to "be safe": resetting verification
when the mission statement changes teaches users that the badge flickers
randomly, and a badge nobody trusts protects nothing.

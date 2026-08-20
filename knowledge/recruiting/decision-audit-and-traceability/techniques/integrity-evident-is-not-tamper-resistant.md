---
layer: technique
type: technique
subject: decision-audit-and-traceability
technique: integrity-evident-is-not-tamper-resistant
status: forged
laws: [say-only-what-the-record-holds, absence-of-evidence-is-not-evidence, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [describing what an audit chain proves, choosing between keyless and keyed integrity, writing the copy on a verification screen]
---

# Integrity-evident is not tamper-resistant

## The concern

A keyless hash chain proves that a stored sequence is internally consistent. It does not
prove that nobody rewrote it, because the party who can write the records can also
recompute every digest downstream of a change. Everything needed to forge a clean chain —
the algorithm, the serialization, the data — is inside the system that holds it.

That is not a defect; keyless chaining is genuinely useful, catching accidental corruption,
partial restores, buggy migrations, out-of-band edits by tools that do not know about the
chain, and any adversary without full write access. It is a defect only when it is
*described* as tamper-proof. The word "tamper-proof" on a verification screen is the single
highest-cost sentence in this whole subject: a reader who understands the mechanism now
knows you either did not, or hoped they would not. Per
[say only what the record holds](../../_laws.md#say-only-what-the-record-holds), a system
that overstates its own guarantees has undermined the parts that were true.

## The ladder, and where each rung actually stands

| Rung | Mechanism | Stops | Does not stop |
| --- | --- | --- | --- |
| **Append-only by convention** | code writes no updates | ordinary application bugs | anything with database access |
| **Integrity-evident (keyless chain)** | digest over content + predecessor | accidental corruption, partial restore, out-of-band edits, an attacker without full write access | anyone who can write records and recompute the chain |
| **Integrity-attested (keyed)** | digest keyed with a secret the writer does not hold | an attacker who has the data but not the key | an attacker who has the key |
| **Externally anchored** | tail digest published where you do not control it | the operator rewriting history *before* an anchor point | rewriting after the most recent anchor |
| **Independently held** | a copy with a party who has no stake | operator rewriting entirely | collusion; and it costs the most to run |

Climb only as far as your threat model needs, and *say which rung you are on*. Most hiring
systems land on integrity-evident plus periodic external anchoring, and that is a
defensible place to stand — when it is stated. The failure is never the rung. It is the
mismatch between the rung and the claim.

## Procedure

**1. Write the claim down, in the product, in the words the mechanism supports.**
"Records are append-only and chained; any modification after writing is detectable by
re-verification. The chain is keyless: a party with full write access to the store could
recompute it. Tail digests are published externally on a weekly cadence." That paragraph
costs nothing and converts a latent credibility bomb into evidence of candour.

**2. Never present a verification success flag as a security claim.**
A boolean success on a verification pass means "the records I looked at chain correctly."
It does not mean the history is complete, authentic, or unaltered. The verdict object must
carry its own basis — what was checked and what was not — per
[a claim carries its sample and its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis).
Concretely, a verification result should report the **census** alongside the flag: scopes
checked, records covered, scopes skipped, keyed versus keyless coverage. A success flag
over an unstated denominator is the audit-trail equivalent of a rate with no sample size.

**3. Distinguish "no break found" from "no tampering occurred".**
Per [absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence),
a clean pass is not a finding of integrity. Copy that says "verified — no issues" invites
exactly the wrong inference. Say "no chain break detected across N records in M scopes as
of this date."

**4. Treat a key as an upgrade for the future — with one real gift to the past.**
Adding a key today makes records written from today forward attestable. It **cannot
retro-seal earlier records**: re-keying old rows means recomputing their digests, which is
indistinguishable from rewriting them, and doing it destroys the only evidence you had for
that period. So the key is introduced at a stated position, the record notes the
transition, each row permanently carries the key generation it was sealed under, and
everything before it stays honestly labelled keyless.

The gift is the **cascade**, and it is bigger than most teams realize. Once keyed links
exist, editing an older *keyless* record breaks the chain at the first keyed link
downstream — and that link cannot be reforged without the key. So keying from a point
forward makes the entire prior prefix tamper-evident against an insider, retroactively,
without touching a byte of it. The only genuinely unprotected case is a chain that was
**never** keyed. This is why the verification census should name the position where
keying begins: it is the boundary of a real claim, and a surface that reports only
"partly keyed" throws away the most useful thing it knows.

The cascade also creates an attack to close: **appending a keyless record onto a keyed
chain is a downgrade forgery.** An adversary who cannot compute a valid keyed link can
still write an unkeyed one, and a verifier that accepts keyless rows anywhere will wave it
through. Accept keyless rows only as a contiguous prefix — once any keyed link has
appeared, a later keyless link is a failure, logged and refused, never a silent
degradation to the weaker mode.

**5. Rotate keys; never remove them.**
Rotation adds a new key with a new identifier and keeps every retired key readable for
verification, resolved per row by the generation stamped on it. Old rows keep verifying
under the retired key while new rows seal under the new one, so a rotation never
invalidates history. Removing a retired key retires the ability to verify the records it
covered — which converts a verifiable period into an unverifiable one and looks, from
outside, exactly like destroying evidence. That standing obligation to keep old key
material readable is the true price of keying, and it should be written down where the
keys are managed, not discovered during a rotation.

**6. Give the audit chain its own key, not a shared secret.**
The audit key must not be the credential that also signs sessions, encrypts tokens, or
authenticates services. Those are *rotatable operational credentials*, expected to change
on incident or schedule; an audit chain must survive their rotation unbroken. Coupling
them means the day you rotate a leaked session secret is the day your decision history
becomes unverifiable — the worst possible coincidence to have to explain. Decouple them,
and put the audit key's custody as far from the record writer as your deployment allows:
a key held by the same team that can write the records buys less than a key held across a
custody boundary, and the honest description says which one you have.

## Decision rules

- **Describe the deployment that actually runs, not the one that is configurable.** If
  keying is optional and the default is off, then "records are cryptographically attested"
  is false for almost every installation, and the documentation that says so is a
  discovered lie rather than a stale sentence. Condition the badge, the export header and
  the written claim on the *observed* state of the chain, derived from what the records
  themselves say, never on the design intent.
- **When you cannot separate key custody from write access, do not claim attestation.**
  Claim integrity-evidence and anchor externally instead; it is cheaper and the claim is
  true.
- **When an auditor asks "could you have changed this?", the answer is the rung, not a
  denial.** "With full database and application access, yes — which is why the tail digest
  is published weekly to a third party, and here are those publications." That answer
  wins; a flat denial loses the moment someone reads the code.
- **When the chain covers only some record kinds, the verification surface must say which.**
  Partial coverage presented as whole-store verification is the same overstatement one
  level down.
- **When a break is found, report the window, not the verdict.** "Records between position
  P and Q cannot be verified" is a bounded, survivable fact. "The audit trail failed
  verification" is not, and it is usually less true.

## When not to use this

- **Not a reason to skip chaining.** "It is not tamper-proof anyway" is the wrong lesson.
  Integrity-evidence catches the overwhelmingly most common real failures, which are
  accidents and out-of-band tools rather than a determined insider.
- **Not a reason to over-engineer.** A hiring system's threat model is rarely a
  sophisticated insider forging a year of decisions; it is far more often a migration
  script, a support tool with write access, or a well-meaning correction. Match the spend
  to that, and put the saved effort into coverage — the records that were never written are
  a bigger hole than the ones that might have been rewritten.
- **Not a substitute for access control.** Restricting who can write to the store is a
  stronger control than detecting what they wrote, and it belongs to the general
  engineering practice rather than here. The chain tells you *that* something changed; it
  never tells you who, unless the access layer already did.

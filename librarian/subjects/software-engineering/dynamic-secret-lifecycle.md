---
domain: software-engineering
subject: dynamic-secret-lifecycle
last_touched: 2026-09-26
touched_by: deepen
dry_streak: 0
depth: L2
---

# dynamic-secret-lifecycle

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-26 - `/deepen`, first pass (dp-dsl-0926)

Dispatched by the Curator lane on "single stack (go)". There were three
lanes:
- a read of the one fleet tree whose map really joins this subject:
  Personas' Rust backend, which mints its own management-API keys and
  verifies them against the same table;
- web counter-evidence on nine claims, against source at pinned commits,
  vendor docs and standards bodies;
- a blind training-data lane.

**Counter-evidence: two refuted, five conditioned, two confirmed.**
- "A renewal that would carry the lease past its maximum is refused": refuted
  as a description. The framework function every backend calls trims it to
  the remaining window with a warning, and refuses only when no window
  remains. The Go application already cited those lines, and the technique
  contradicted them. Its own decision rule also contradicted it, by
  mentioning a warning for a window-capped renewal. Refusal stays as a stated
  stricter stance.
- "Store-nothing certificates cannot be revoked by identity": refuted as an
  absolute. The revoke endpoint verifies a presented certificate's signature
  against the mount's issuers and revokes it with no stored copy. What is lost
  is enumeration.
- Persist-before-provision: conditioned. The reference issuer creates first
  and revokes on a failed lease write, so the written-first record is
  mandatory only where the artifact never expires on its own.
- The expiry backstop: conditioned. One database's valid-until clause governs
  password authentication only, and open sessions survive it. Another
  database plugin accepts the expiry update as a no-op.
- The absent-target revoke: conditioned to "absent in the system it was
  created in". A repointed role's revoke succeeds against the wrong database.
  This is the lane's inference from code; no filed issue was found.
- Signing-key retention: conditioned. It binds only where leaves may outlive
  the issuer, or where the key was recertified.
- A no-op lease on a self-expiring artifact, as a client lifetime contract:
  added as a condition.
- Confirmed: the expiry buffer (5 s, recomputation floor), and that the
  period ignores the increment without a warning.
- Banked, not landed: one issuer deletes its write-ahead entry before the
  core writes the lease, for an artifact that never expires. The technique
  already states the right order and names no product.

**Convergence.** The blind lane reached renewal trimming (medium-high
confidence) independently of the web lane. It also reached the
issuer-is-verifier handout failure modes ("commit before returning the
secret", out-of-band handoff) independently of the tree, whose operator-key
comment states the rule verbatim. That second convergence earned the one
technique-level widening: persist-before-provision gained "when the issuer is
also the verifier".

**A phantom deviation, retracted.** go--persist-before-provision said the
core does not revoke when the lease write fails. At the same pinned commit,
`ExpirationManager.Register` defers a revoke of the new secret on any error.
The earlier reading stopped at the call site. The real residue is four early
returns before the defer is armed. The lesson for the next pass: a
"does not compensate" claim is checked one call deeper than the call site.

**Tree read (Personas, 900b8f0b4).** Five mint paths. The operator key revokes
its row when the token file write fails. Neither pairing path revokes. An
approved-but-unclaimed pairing is pruned at 300 s from registration, with its
token and without its key. `pending_origin` does not check age, so a late
approval mints a key whose claim cannot succeed. The system key's
check-then-mint releases its mutex across the insert. An interleaving model
of two first calls found orphan live keys in 60 of 70 orderings, and a
revoked token cached in 24 of 70.

**Landed** (c9e9f37a, generated 997ebbf5):
- `applications/rust--persist-before-provision.md`: `verified_on: 2026-09-26`,
  `verified_against: rust@1`, `applied: simulation`, `ab_verdict: better`;
- one widening (persist-before-provision) and five corrections or conditions
  across ttl-ladder-derivation, lease-vs-native-tracking,
  expiry-buffer-beyond-lease, idempotent-revoke-and-give-up and the golden
  path;
- two Go applications corrected and re-verified 2026-09-26.

**Declined:**
- A code fix in Personas (revoke on handout failure, and holding the
  system-key mutex across the mint). The seams are in the app and engine
  crates, and the change owes a `cargo test` that a busy shared checkout could
  not give. Return: a Personas session with a warm target directory.
- The pumper join (e2e-data-integrity). Its "why" is the words dynamic,
  degraded and target, and there is no credential issuance in those paths.
  This is a same-word match, not a seam.

## Impact

- personas: 1 context (api-key-management), 0 stale verdicts (unjudged).
  The map rebuild is owed, because another session holds that file.
- pumper: 1 context (e2e-data-integrity, a same-word join), 0 stale verdicts.
  The map was rebuilt and committed locally at 7c5a88d, and not pushed:
  pumper master has diverged from origin with other sessions' commits.

## Saturation

L2 (primary source at pinned commits plus one real tree). Clocks: the Go
applications were re-verified 2026-09-26 (the WAL application remains at
2026-09-02). Dry streak 0. Next pass: the WAL application's re-check; a code
row in Personas when the seams can be tested; a third stack when a fleet
project issues remote credentials.

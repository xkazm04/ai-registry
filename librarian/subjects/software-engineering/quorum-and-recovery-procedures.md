---
domain: software-engineering
subject: quorum-and-recovery-procedures
last_touched: 2026-09-26
touched_by: deepen
dry_streak: 0
---

# quorum-and-recovery-procedures

Forged 2026-09-02 from the openbao harvest (6 techniques, 3 go applications, one tree).
First deepen: run dp-qrp-0926 (2026-09-26), a Curator dispatch on "single stack (go)".
3 -> 5 applications, 2 stacks (go, node). 0 new techniques. 2 techniques gained a condition,
4 claims were corrected, and the golden path carries both conditions and both corrected
rules.

## State after dp-qrp-0926

- Rung: L3. kp's tree was read, changed and measured. Two A/B arms ran on the real rotation
  script, one beside a live writer subprocess and one on kp's own modules.
- Stacks: go (openbao: migrator, rekey, raft recovery), node (kp: `KP_SECRET` rotation,
  `2d893178` and `525258aa`).
- The subject widened on purpose to a *single operator's* root secret. An application's
  at-rest master key is root material with one holder. The nonce is overhead there. The
  in-place rewrite and the retirement edge are not.
- Techniques with no second-stack application yet: cancel-leaves-prior-state-valid,
  single-node-recovery-resize, pick-highest-applied-index,
  unauthenticated-ritual-is-a-vulnerability. No fleet project runs a consensus-replicated
  store or a threshold ritual.

## Counter-evidence, claim by claim

- **nonce-progress-verify: CONFIRMED mechanism, CORRECTED default.** The rekey CLI says new
  shares are "not valid until verification is performed" and that a cancel or seal before
  verification leaves the current shares valid. Verification is off by default in both
  reference implementations (`-verify` defaults to false). The file now says verification
  by default is this subject's recommendation.
- **cancel-leaves-prior-state-valid: CONFIRMED.** The rekey API docs say cancel "clears
  the rekey settings as well as any progress made", and the seal path nils the rekey
  configs in source. "Restart discards" is an inference from in-memory progress, and no
  doc states it. Backup keys persisted in storage survive a cancel, which the nonce
  technique's stored-share fallback already covers.
- **migration-lock-in-source: CONFIRMED, CONDITIONED.** The server "will not allow
  starting ... if a migration is in progress" and exits, and `-reset` clears a stale
  lock. The lock records a start time and no host, which the go application already
  names as a thin spot. The new condition, for an in-place rewrite, converged across three
  lanes (the tree, an orchestrator's resourceVersion/409 re-encryption, the blind lane).
- **single-node-recovery-resize: CORRECTED twice.** (1) "Running the ritual again replaces
  the credential" was wrong. The docs say "Only a single recovery token can be generated.
  If lost, restart", and the source refuses the ritual once unsealed. (2) Quorum loss is
  not this technique's case. The documented path is a peers file listing the survivors
  ("You include only the remaining servers"), and the vendor sends non-quorum recovery to
  recovery mode.
- **pick-highest-applied-index: CONFIRMED for recovery mode, CORRECTED rationale.** The
  docs say "highest `AppliedIndex`", read from sealed nodes. "Restores a promise, not a
  state" was wrong: forced recovery "implicitly commits all entries in the Raft log". The
  blind lane reached "applied index can throw away committed writes" independently. The
  record now names each peer's last log index.
- **unauthenticated-ritual-is-a-vulnerability: CONFIRMED, REFINED.** Advisories exist on
  both implementations (unauthenticated cancel, 2025). One made the endpoints removable per
  listener, then off by default. The other authenticates rekey and generate-root by
  default in 2.0.0. A 2026 advisory added the occupied-slot denial of service. The
  "attacker holds the only share" scenario also needs the attacker's delivery key, and one
  vendor calls an attacker-started attempt one that "would not be successful" on its own.
  Zero recovery shares is one implementation's choice (a 2.4.1 CLI fix). The other refuses
  it in source ("must specify a positive number of shares").
- Not verified: whether recovery mode replays the chosen node's unapplied log tail (the
  library's forced-recovery warning is about the peers-file path).

## Impact

The fleet map joins this subject to no context in any project (12 absent, 0 present). So
0 verdicts exist on it and 0 went stale. kp's map, dry-run against `0d23f291`, still pairs
no kp context with it, although kp's `secrets-rotate` is a real seam. No project map was
rebuilt or committed; none carries a pair this landing moved.

## Owed to projects

- kp: `2d893178` (rotation inside one write transaction), `525258aa` (skill-profile
  inventory and the runbook pin) and `f1c464ee4` (the applied ledger) are on local `main`,
  unpushed. Local main was 35 ahead and 3 behind origin, and most of those commits are
  siblings'. The next session that reconciles kp pushes them.
- kp: `KP_ATS_SECRET_KEY` rotation has no fallback key, which kp's runbook already says.
  The retirement-edge rule applies there too, the day it gains one.

## Banked leads

- Join gap: kp's secrets rotation (`scripts/secrets-rotate.mjs`, `app/_lib/llm-secret.ts`,
  `ats-secret.ts`) does not join this subject in the registry map. Return: the next kp
  context scan, or a `/conform` pass that proposes the pair.
- personas (rust) holds a master-key custody move, from the fallback file to the OS
  keychain (`try_keychain` backfill, `try_upgrade_to_keychain`). The keychain copy is never
  read back before it is trusted, and a wrong-length keychain entry fails closed without
  consulting the file. The key does not change, so this is a custody migration, not a
  rotation. Return: when a personas change touches key custody. It would be a rust
  application of migration-lock-in-source or cancel-leaves-prior-state-valid.
- A census of every `KP_SECRET` consumer (sessions, signatures, tokens) beyond the two
  kinds read here. Return: the next change to kp's rotation runbook.

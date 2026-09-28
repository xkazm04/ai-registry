---
domain: software-engineering
subject: seal-and-key-hierarchy
last_touched: 2026-09-26
touched_by: deepen
dry_streak: 0
depth: L2
---

# seal-and-key-hierarchy

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-26 - `/deepen`, first pass (dp-skh-0926)

Dispatched by the Curator lane on "single stack (go)". There were four lanes:
- a read of Personas' Rust master-key custody (`src-tauri/core/src/crypto.rs`
  at `5d2ac437e`), which the credential-vault subject already covers as
  encryption at rest and which this subject reads as a seal layer;
- a read of kp's at-rest envelope and rotation sweep (`llm-secret.ts`,
  `ats-secret.ts`, `scripts/secrets-rotate.mjs` at `2d8931781`; a sibling
  session moved the sweep into one transaction mid-run, and the simulation
  was re-run on the new head);
- web counter-evidence on six claims, from vendor docs fetched raw, the
  standard's PDF, the CFRG limits draft (-13) and OpenBao's CHANGELOG
  through 2.7.0; each quote used was re-checked against the raw download;
- a blind training-data lane.

**Counter-evidence: one refuted, five conditioned.**
- "The automatic seal plus a threshold seal is the common deployment":
  refuted. The shipped plural seal accepts automatic seals only, refuses the
  mix and caps the set at three. OpenBao has the pair as an RFC, not code.
- The weakest-seal rule: conditioned to "the weakest whose entry exists".
  Personas writes its file custody on every first run and gates only its
  use, so the fail-closed policy governs availability. The blind lane
  reached this unprompted.
- Rotation across N seals: a third, landed design (wrap under every healthy
  seal, re-wrap what a sick one missed, block data-key and recovery-key
  rotation meanwhile). It couples to the operation budget as a deadline.
- "Rotate by re-encrypting" is conditioned by store size. A small store may
  rewrite, but the term is not optional. The kp simulation: a second
  rotation strands rows with a failure byte-identical to corruption.
- The 2^32 budget is scoped to random-generator nonces and to a real write
  rate. Personas holds 535 live ciphertexts under its one key.
- Recovery shares become unseal shares in a declared auto-to-threshold
  migration. That is the sanctioned crossing, and it owes a re-issue.
- Root-only rotation, the claim confirmed with a test: a shipped defect lost
  every share when the root-only endpoint also rotated the seal key. The
  other lineage still has no root-only rotation.

**Landed.** Two applications: rust--any-one-seal-unseals (Personas) and
node--append-only-keyring-rotation (kp). The go--any-one-seal-unseals
application was re-checked and carries the shipped plural seal's
constraints as documentation, not as a tree read, plus a `refresh_by`
three months out. Golden path: four conditioned sentences. No new technique.
The convergences were conditions on existing ones.

**Applied.** Six rows in `applied.md`:
- personas `any-one-seal-unseals`: simulation, better;
- personas `usage-triggered-rotation`: simulation, not-better (the rate
  condition);
- kp `append-only-keyring-rotation`: simulation, better;
- three unapplied, with return conditions.

Neither project's code was changed. The Personas fix (stop writing the file)
trades availability. The kp fix (a key id) is a format change that a
rollback cannot read. Both are recorded for the owners.

**Declined.** tracklight's former join: the rebuilt map has 0 pairs. kp's
db-profiles-analyses-store join is a same-word match (rotation, key, store).

## Impact

- kp: 2 contexts, ops-setup-scripts (the real seam) and
  db-profiles-analyses-store (same-word). 0 stale verdicts (unjudged). The
  map was rebuilt and committed locally at 1c6b7d3c4, unpushed (main has
  diverged from origin).
- personas: 1 context (api-key-management, a same-word join; the real seam,
  `crypto.rs`, maps to credential-vault). 0 stale verdicts. The map was
  committed locally at 3a91a78ad, unpushed (diverged).
- tracklight: 0 contexts after the rebuild. Its map was committed locally at
  8d5d284, unpushed (diverged).

## Saturation

L2: primary source at pinned commits, vendor docs raw, and two real trees.
Clocks: the go--any-one-seal-unseals vendor-state claims are due by
2026-12-26. The other go applications were verified 2026-09-02. Dry streak 0.
The scan went from 5 points to 3; the remaining reason is "never swept by
the librarian".

## Banked leads

- Personas: declare the file custody on the vault status, or stop writing it
  when the keychain write succeeds. Quarantine an unreadable key file instead
  of deleting it and minting a successor root. Return: the owner's
  availability call, or /conform on the credential-vault context.
- kp: a `v2` envelope with a key id, and a sweep for the decoupled ATS key.
  Return: when kp next touches `secrets:rotate`.
- The CFRG limits draft (-13) and the standard's revision (no draft as of
  2026-09-26) are the budget clock. Return: a draft of the revision.
- OpenBao parallel unseal and emergency seal: RFCs merged, no code through
  2.7.0. Return: a release note naming either.
- Unverified in this pass: the shipped plural seal's rule that a seal-set
  change must keep one seal in common. The lane quoted it, but the quote was
  not found in the raw download. Return: a re-fetch.

---
domain: software-engineering
subject: node-boot-and-declarative-bootstrap
last_touched: 2026-09-26
touched_by: deepen
dry_streak: 0
---

# node-boot-and-declarative-bootstrap

Forged 2026-09-02 from the openbao harvest (6 techniques, 3 go applications, one tree).
First deepen: run dp-nbdb-0926 (2026-09-26), a Curator dispatch on "single stack (go)".
3 -> 5 applications, 2 stacks (go, rust). 0 new techniques, 4 techniques conditioned, and
the golden path carries all four conditions.

## State after dp-nbdb-0926

- Rung: L3. The tree was read, changed and measured: two A/B arms on the real binary, plus
  one test that runs both arms on real SQLite.
- Stacks: go (openbao, server boot and diagnose), rust (tracklight, the API boot and price
  seed at `53ff57f`).
- Techniques with no second-stack application yet: reload-partition, config-objects-are-api-immutable,
  request-chain-not-dsl, seal-before-storage-plugins. The rust tree has no reload signal, no
  config-born objects, no request chain and no seal.

## Counter-evidence, claim by claim

- **ordered-boot-dag: CONFIRMED on order, REFINED on verify-only.** No source refutes "a
  component starts after everything it reads" or "readiness last". A verify-only run that
  binds is conditional. Such runs normally sit beside the live node that holds the port.
  One mature web server's test mode binds and tolerates address-in-use. A secrets server's
  diagnose documents `-skip=listener` and "meaningless results … if the server is already
  running". The blind lane said config tests "bind nothing". It diverged from the tree
  lanes on the mechanism and agreed on the hazard. Landed as a condition.
- **reload-partition: CONFIRMED, REFINED.** A relational database declares a context per
  parameter (postmaster = restart-only) and reports `pending_restart` / "cannot be changed
  without restarting the server": the strongest outside confirmation of the declared,
  reported partition. It also runs its safe reloads after a failed parse. A web server
  aborts a reload on a bad file but reopens logs on a separate signal. That refines the
  rule into the invariant "safe functions never depend on the parse". A syntax error
  applies nothing, while one bad value still lets the rest apply.
- **once-only-bootstrap-with-marker: CONFIRMED, REFINED.** Detection by state is confirmed
  (a database image's empty-data-dir check, and an IAM server's "created only during the
  initial start"). The half-finished collapse is confirmed as a documented field failure:
  the database image's own docs say a failed init script plus an orchestrator restart "will
  not continue on with your scripts". Condition: a single atomic create-if-absent re-runs
  safely (a service mesh's leader re-checks its config-born token and creates it only when
  missing), and a single-store bootstrap's transaction is the marker. Converged: tree, the
  counter lane and the blind lane ("seed plus marker in one transaction").
- **config-objects-are-api-immutable: CONFIRMED pattern, REFINED conflict rule.** Two
  platforms (a static pod mirrored read-only, a dashboard provisioner refusing saves)
  confirm the record-type pattern. The same dashboard provisioner documents "configuration
  overwrites" on a conflict, with a "be careful" warning. Condition: that form is admissible
  only as a declared ownership of a whole kind, with each overwrite logged, and never for a
  kind that acts on the host or keeps a trail. The blind lane reached "config wins for
  config-owned objects" independently.
- Not verified: kubeadm idempotence, one admin-password env var's first-start-only
  behaviour, the openbao diagnose source on main (404).

## Impact

Map rebuilt against `f92a969a` for the five joined projects (goat, tracklight, personas,
personas-web, ascent), committed on each active branch, pushed in none. 0 verdicts on this
subject anywhere: every joined pair is `unknown`, so 0 went stale. Four of the five joins
(goat challenges, personas trigger-config, personas-web waitlist, ascent security posture)
are lexical and have no boot seam. tracklight's `api-server` is the one real seam.

## Owed to projects

- tracklight: `53ff57f` (the fix), `84a5457` (the map) and `8fd1fa7` (the applied ledger)
  are on local `main`, unpushed. Local main is 11 ahead and 6 behind origin; 8 of the 11 are
  siblings' map commits. Origin carries an axum 0.8 bump that touches `main.rs`. The next
  session that reconciles tracklight merges them. The fix does not depend on axum's
  routing API.
- tracklight Firestore store: `seed_prices` keeps the row-by-row default, so the half-seed
  hazard remains on that backend. The REST client writes one document per call. The
  override is a batched write (one commit carrying every row), or else a marker. Return:
  the next change to the Firestore store's price module.

## Banked leads

- A verify-only / `--check` mode for tracklight's API. Return: when an operator asks
  "would this config start" before a deploy. It would take the bind-is-held condition.
- Graceful shutdown for tracklight's detached tasks (`with_graceful_shutdown` + a task
  tracker). Harmless today because every background write is one transaction. Return: when
  a background task gains a multi-step write.
- reload-partition second stack: the fleet has no node with a reload signal. Return: when a
  fleet project grows SIGHUP or a config-reload endpoint.

---
subject: sql-console
domain: software-engineering
last_touched: 2026-09-02
dry_streak: 0
---

# sql-console

First touch: [[2026-09-02-1]]. Class: MATURE (6 techniques, 3 applications
react + rust ×2; never swept before; 6 consumer deviations on the floor).

## State

6 techniques, 3 applications (react, rust, rust). No version witness. No new
application this run — no tree was read.

## What run 2026-09-02-1 changed

- `safe-mode-guarding`: **a read-only transaction envelope is session state,
  not a credential** — a stacked `COMMIT;` ends it and the tail runs with the
  connection's full rights (a published 2025 post-mortem of a protocol-facing
  database server). Layering order stated: least-privilege role → single
  statement at the driver call → classifier → envelope as the cheapest extra.
  Rule 4 (vocabulary) seeded from the SQL standard's `READ ONLY` mode as engines
  implement it: read-shaped writes belong in the mutation class.
- `result-fidelity`: the **stale-success/error pair** — on re-run in place the
  outcome slot is replaced whole; number transport anchored to RFC 8259 §6.
- `nl-assist-gating`: an author with no human behind it has no consent gate;
  agent write mode is default-off safe mode with a faster author.
- Six `use_when` rows across the three techniques.

## Inbox rulings

- "Bind the pending statement to its execution target" — already in the forge
  text on two techniques; landed as `use_when` rows so a consult routes to it.
- "Clear the previous result when a re-run fails" — landed in `result-fidelity`;
  corroborated by two unrelated public trackers (2018, 2023).

## Open leads / proposals (placed)

- "Envelope is session state, not a credential" is a general shape (a
  per-request wrapper a payload can close from inside). Recorded on
  [[credential-vault]] as a candidate clause for brokered-egress.
- The stale-success/error pair belongs equally to the table's body state model
  on re-fetch failure. Recorded on [[table]].

## Declines

- A seventh technique "engine-level read-only enforcement" — converged, but one
  clause of the guard story.
- Softening "refuse batches in safe mode" — the post-mortem shows it is exactly
  the load-bearing rule.

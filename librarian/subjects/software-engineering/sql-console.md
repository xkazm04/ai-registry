---
subject: sql-console
domain: software-engineering
last_touched: 2026-09-02
dry_streak: 0
---

# sql-console

First touch: [[2026-09-01-1]], the librarian sweep that drained the consumer-lead inbox. Never swept before; it sat on the worklist on demand alone with 6-12 deviations.

## 2026-09-01 - inbox leads landed

Two leads (ascent), both single-repo sightings, landed narrowly. `safe-mode-guarding`: a
pending consent's target includes where the result lands, captured when the gate opens, not
when it resolves; a connection-keyed identity cannot see a same-connection destination swap.
`result-fidelity`: stale-success-plus-error is a fourth shape the truth table never declared,
produced by a transition - entering a run clears the outcome slot and only the terminal
state refills it. Applications `next--safe-mode-guarding` (the positive form is NOT present
in ascent; the negative case and the available mechanism are recorded) and
`next--result-fidelity` (house idiom clear-on-entry, one counter-example that clears error
but never result), both at ascent `a57f272c`, citing state not diffs.
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

### Impact (2026-09-02)

Stale verdicts after this landing: personas (4). Apply row: see `librarian/applied.md`.

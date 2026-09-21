---
layer: application
type: application
subject: agent-instruction-files
technique: instruction-freshness
stack: process
verified_on: 2026-09-08
applied: simulation
ab_verdict: better
proof: structural-only
---

# A model successor as a freshness trigger: three cases from one skills lane

The technique's coupling triggers are all changes to what an instruction
file *refers to*. This application walks three real events from one shared
skills lane — a registry of lane skills linked into a fleet of projects —
under the file as it stood (policy A) and with a model change added as a
coupling event (policy B). It is a thought simulation on recorded events,
labelled as such; no gate in the lane can see instruction compliance.

## The structural fact

The lane's skill checker validates frontmatter *keys* and admits `model`
and `effort` as known keys; it does not read their values. Three skill files
carry a `model:` pin today (two to one frontier model, one to another). The
audit classes the technique names — version floors, path names, command
names — cover none of them. So a model pin is a volatile fact inlined in an
instruction file that no audit class sees, which is the shape the technique
says to avoid.

## Case 1 — nine skills, two models, one day (2026-09-01)

Nine lane skills were run twice with identical inputs, one subagent per
model, in isolated worktrees across four projects. The picked winner
differed per skill in five of nine; one skill took method edits, and three
gained a `model:` pin.

- **A:** no trigger fired. The files were re-read only because an operator
  ran a bespoke bake-off.
- **B:** the model becoming available is a coupling event; each skill owes a
  re-read against the new reader as its definition of done. Predicted: the
  same three pins, without a bespoke eval to discover the need.
- **Falsifier:** the picks not differing by model. They did, in five of nine.

## Case 2 — the harness default moved (2026-09-08)

The harness's default model was switched to a newer successor at medium
effort, by one settings command, with no file changed anywhere.

- **A:** nothing happens; every instruction file in the fleet is now read by
  a model none of them was tuned against.
- **B:** every project's instruction floor owes an audit entry dated today.
  Predicted, from the vendor guidance the technique now cites: files whose
  restraint language was tuned to the previous reader over-steer — a nudge
  becomes a stop — and clauses a lenient reader reconciled become a conflict
  that pauses work.
- **Falsifier:** a lane skill run under the new default with no change in
  gate outcomes and no new paused or blocked turns.

## Case 3 — the pins age

A durable memory note records when to run each skill on which model, at
confidence 0.6, from one run each. The pins point at it. When either
pinned model is superseded, the pin is wrong and the note is stale.

- **A:** the pin is a frontmatter key the checker accepts forever.
- **B:** "model pin" is an audit class: the checker requires the pinned
  value to be a model the harness currently offers, and the audit re-reads
  the note when that set changes.
- **Falsifier:** a superseded pin that changes nothing observable — which
  would mean the pin was never load-bearing and should be removed anyway.

## Verdict and the instrument it needs

`better` as a prediction, not a measurement. The instrument that would make
it measurable is a per-skill gate outcome recorded with the model that ran
it — the lane's scorecards carry the version of the *skill*, not of the
reader — so the first case to re-run after a model change can be compared
paired.

---
layer: application
type: application
subject: branching-narrative-graph-validation
technique: state-variable-declaration-contract
stack: process
status: forged
verified_on: 2026-09-02
---

# The declare-inject-check loop for a generated conversation

This is a prompt-pipeline realization of the state variable declaration contract for a line
that generates branching conversations with a language model and accepts them without a
human tracing every path. It is written as an ordered process because the ordering is the
whole content: the same three checks run after generation instead of before it catch the
same defects and improve nothing about the next artifact.

The loop has four stages, and a stage may not be skipped when the scene is "small".

## Stage 1 — the declaration is authored before the scene

A human or an upstream design step produces the variable table for the scene, and nothing
generates until it exists. One row per variable with six columns: canonical name, type,
domain, initial value or the explicit statement that there is none, owning writer, and
lifetime. Rows for state the scene only reads — a quest stage owned elsewhere, an inventory
count, a reputation the world model maintains — are marked as external inputs, with their
domain, and are exempt from the reaching-write analysis but not from the domain check.

The table is stored with the scene, in the same artifact the generator writes into, because
the check reads it from there. A table living in a separate design document is out of scope
for this loop: it drifts within a sprint and the drift is invisible from both ends.

## Stage 2 — the table is injected into the authoring prompt verbatim

The prompt that authors the conversation carries the table as text, not a paraphrase of it,
under an instruction with four clauses:

1. every condition may reference only names in this table;
2. every value written must be drawn from that name's stated domain;
3. every option must write at least one variable that some later node reads;
4. if the scene needs state the table does not contain, stop and propose a row rather than
   inventing a name.

The fourth clause is the one that changes results most and is the one usually left out. A
model that cannot invent a variable will either reuse the right one or surface a real gap in
the design; a model that can invent one produces a plausible name, sets it, and nothing ever
reads it — a defect that survives every prose review and is only visible against a
declaration.

Clause three is where this loop borrows from the false-choice audit. It belongs in the
prompt rather than only in the gate because the alternative is rejecting a large fraction of
generations for the same repair, which costs a full regeneration each time and never shifts
the distribution of what arrives.

## Stage 3 — three mechanical checks, before any quality grading

Run in this order, on the stored artifact, by a reader that is not the generator:

- **Undeclared name.** Every name appearing in a condition or a write is in the table.
  Failure is terminal for the artifact; there is nothing to grade.
- **Domain violation.** Every written value is inside the declared domain. This is the check
  that catches an invented enumeration member, which is the most common generated defect
  after undeclared names.
- **Read without a reaching write.** For each read, walk backwards over all paths to the
  scene's declared entries; report any path that reaches the read with no write and no
  initial value, and report the path, not the node.

A fourth check is worth running even though it is a heuristic: **singleton names**, any
declared or used name appearing exactly once across the scene. On generated content this is
almost always either a misspelling or dead state, and it costs nothing.

Quality grading — voice, structure, whether the scene is any good — happens only after all
four pass. Grading a scene whose flags do not resolve spends an expensive review on content
that is about to be regenerated, and worse, it produces a score that will be quoted later as
though the scene had been accepted.

## Stage 4 — the failure report goes back as a repair prompt, not as a rejection

A failing artifact is returned to the generator with the specific findings and the table
again, with an instruction to repair only the named defects. Two rules keep this from
spiralling: the repair prompt never contains the previous prose (which invites a rewrite,
and a rewrite introduces new defects at a rate worth avoiding), and a scene that fails the
same check twice is escalated to a human, because the second failure usually means the
table is wrong rather than the scene.

## What this loop does not do

It does not prove the conversation is playable. It proves the state contract holds, which is
one of the structural properties, and the reachability, terminal and false-choice passes are
separate stages of the same pipeline that this document does not describe. It also does not
run at the level of the running game: a variable that this loop proves is written before it
is read in the graph may still be read by engine code the graph never sees, and that is a
different rung of evidence entirely.

The loop's honest claim is narrower and worth stating plainly: it moves undeclared,
out-of-domain and undefined-read defects from playtest to generation minute, and it does it
by telling the generator the contract rather than by filtering for it afterwards.

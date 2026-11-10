---
layer: technique
type: technique
subject: prompt-assembly
technique: model-curated-context
status: forged
laws: [one-validation-door, count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [deciding whether the model should edit its own context instead of the client compacting it, a harness exposes the context as a file or document the model can rewrite with its ordinary tools, a self-editing run shows the overflow fallback doing the work, the model is asked to manage its context and rarely does, a self-editing agent's cache bill rises although its context stays small, choosing between a summary and self-editing at a given context budget, text from a tool result reappears in the agent's own notes on later turns]
---

# Model-curated context

[context-ownership-regimes](./context-ownership-regimes.md) asks who holds the
transcript between turns. Inside its client-held regime a second question has
been left to a default: **who edits it.** Every other technique in this subject
answers "the client": it summarizes
([history-compaction](./history-compaction.md)), projects
([tiered-history-projection](./tiered-history-projection.md)) or elides
([elision-to-a-refetch-pointer](./elision-to-a-refetch-pointer.md)) on a
threshold it chose. A fourth answer now exists. The composed context is
materialized as a document the model under work can edit with its ordinary
tools; it keeps, shrinks, deletes or rewrites any block, invents new blocks
(notes, a scoreboard), and **whatever is left at the end of the turn is the next
prompt.** The model is the editor of record. The client still holds the list,
still sends it, and keeps one guard.

The doctrine underneath is not new.
[working-memory](../../agent-memory/techniques/working-memory.md) already says
operative state is synthesized, not accumulated, at meaningful moments rather
than on a clock. This technique extends that discipline from a bounded side
structure to the whole context and history layers, and states what changes
when it does: who may edit, what the client must count, what the cache now
costs, and which gate the edits pass through.

## When it beats a summary, and when it ties

One published study trained and evaluated exactly this regime, and its full
text gives the boundary in numbers (read 2026-11-10):

- **At a tight budget it wins.** Zero-shot on a web-research benchmark at a 32K
  window, self-editing scored 11.4% higher than context-management baselines
  with 21.5% fewer FLOPs.
- **At a generous budget it ties.** On a multi-task coding benchmark at a 128K
  window, plain self-editing scored 47.3 against the summary harness's 47.8. A
  variant that could also delegate to subagents reached 50.2, so the gain there
  came from delegation, not from the editing.
- **It needs a model capable of the discipline.** Before training, a 9B model
  trailed the summary harness by six points (28.8% against 34.7%), at well under
  half the compute per question. After reinforcement learning on the regime it
  matched it (42.5% against 42.1%). On a terminal benchmark the smaller model
  edited 1.4 times per task and **not at all in half the tasks**, and peaked at
  30.2K of a 32K window; the larger model edited 2.6 times and peaked at 17.6K.

So the regime pays when the task's live state is large against the budget,
especially state that is many exact identifiers updated in place (items issued
then voided, a board, a scoreboard), where a summary's paraphrase is what loses
them ([summary-evidence-gate](./summary-evidence-gate.md)). Where the window is
generous, keep the summary. **Do not assume the capability: measure edits per
task and peak occupancy on the model you run** before trusting a comparison.

## The client keeps one guard, and counts it

Client compaction and client elision are **off** under this regime, for the
reason the ownership technique gives for the provider-managed one: two editors
who cannot see each other's rewrite race, and the second orphans what the first
wrote. The client keeps one deterministic **guard** that fires only when a
request would exceed the window. In the study it rolls back the last turn and
retries, a bounded number of times; a practitioner harness instead replaces old
tool output with a pointer.

A guard that is correct is also silent, and that is the trap. The
[recovery-path-as-loss-signal](./recovery-path-as-loss-signal.md) rule applies
at its opposite polarity: **the guard's firing rate is the only observable of
whether the self-editing policy ran at all.** If the guard fires before the
model has had a turn to react to its own occupancy, the run measured the guard
and labelled it self-editing
([gate-sees-target](../../../../_laws.md#gate-sees-target)). The study reports
edits per task and does not report how often its rollback fired; that is the
number missing beside every self-editing result, and the one to report
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
Per run: model-authored edits, guard fires, peak occupancy.

Three harness levers decide whether the model gets that turn:

- **An occupancy gauge after tool results.** The study found token-count hints
  improve the model's estimate of its own length, and hints closer to the point
  of estimation work better.
- **A reminder at a fixed margin below the window** (the study used 2,048
  tokens), so the edit happens before the wall rather than at it.
- **One tool call per turn** is a precondition one practitioner reported: with
  parallel calls a batch of results overflowed and the guard fired in three of
  four default runs; with one call per turn and a size note after each result
  the model edited. That is one synthetic run per arm. Treat it as the first
  thing to test, not as a rule.

## The model now chooses position and cadence

[cache-breakpoint-allocation](./cache-breakpoint-allocation.md) prices an edit
as its position times its cadence and tells the composer to keep volatile
content below the cut. Under a model editor the composer chooses neither. A
prefix cache keys each block by its own tokens and every token before it (a
serving engine's design document states this as its construction; it is a
design statement, not a measurement), so an edit at position p re-prefills
everything after p. The study's own per-turn compute estimate for a 27B model
makes the slope concrete: an append-only turn about 1.41e14 FLOPs, an edit
mid-context about 5.74e14, an edit at the start about 10.81e14, **7.7 times the
append-only turn.**

The material most worth deleting, old tool output, sits early, which is exactly
where a deletion costs most. Two properties the corpus relies on also stop
holding: [elision-to-a-refetch-pointer](./elision-to-a-refetch-pointer.md)'s
per-message purity and
[compaction-is-a-fixed-point](./compaction-is-a-fixed-point.md)'s idempotence
are properties of a deterministic function, and a model's edits are neither. So:

- **Measure position, not only hit rate.** Count the leading tokens two
  consecutive requests share (the fixed-point technique's own check) and record
  each edit's position. Judge the regime in dollars or compute, and in rewrites
  per task; a practitioner's single run processed about twice the summary
  baseline's tokens.
- **Batch early deletions.** One large edit at position p costs one re-prefill
  of the tail; ten small edits near p cost ten. The same horizon test as
  [compaction-horizon-breakeven](./compaction-horizon-breakeven.md) applies: an
  early edit is worth its re-prefill only if the tokens it removes, times the
  remaining turns, repay it.
- **Steer the volatile blocks to the tail by instruction**: notes, scoreboards
  and progress blocks live after the settled history, not above it.
- **Server-side reuse after an edit is research, not a lever.** The study's
  suffix-reuse method recovered 7.8% of prompt tokens beyond the prefix hit, of
  which 5.3 points came from stripping old reasoning and only 2.5 from other
  edits; it approximates a re-prefill and ran on one serving stack. Plan as if
  every edit re-bills its tail.

## A self-edit is a write to the standing layer

The study names the risk itself: an editable context is a channel through which
an injected instruction persists across turns, and model-written instructions
persist the same way. A self-edit is model output promoted into the next prompt,
which is the case [summary-evidence-gate](./summary-evidence-gate.md) was written
for, without the separate summarizer call. By
[one-validation-door](../../../../_laws.md#one-validation-door) it passes the
same deterministic gate, per edit: no identifier absent from the evidence still
in the record, no secrets, the item cap. Two rules follow from the layer table
of this subject:

- **Only the context and history layers are editable.** Identity, policy and
  capability are authored or derived, at the highest trust, and are composed
  around the editable document, never inside it.
- **Text that arrived from a tool never gains instruction standing by being
  copied into the model's notes.** A notes block keeps the trust class of what
  it quotes.

## When not to use this

- The window is generous against the task's live state: the measured result is
  a tie, and the summary is cheaper to reason about.
- The model is small and untrained for the regime, and nobody has counted its
  edits per task.
- The transcript is not the client's: under a provider-managed window or an
  agent-held protocol the ownership technique already decides, and a second
  editor is the race it describes.
- The cache bill dominates and edits cannot be steered toward the tail.

## Decision rules

- Under a client-held list, decide who edits: the client by threshold, or the
  model as editor of record. Never both.
- Prefer the model only when the budget is tight against the live state and the
  model's edits per task are measured above zero on most tasks.
- Keep one deterministic overflow guard; report its fires beside the model's
  edits and peak occupancy on every run. A result without the guard count is
  unread.
- Give the model a gauge after tool results and a reminder at a fixed margin
  below the window; test one tool call per turn before concluding the model
  will not edit.
- Treat every edit as a re-prefill of its tail; measure shared leading tokens and
  edit positions, batch early deletions, keep volatile blocks at the tail, and
  judge in dollars and rewrites, not hit rate.
- Route every self-edit through the same validator as a summary write; keep
  identity, policy and capability outside the editable document.
- Compare against the summary baseline's own loss: re-reads and repeated
  searches of material already seen, counted after each compaction boundary
  against matched turns with none.

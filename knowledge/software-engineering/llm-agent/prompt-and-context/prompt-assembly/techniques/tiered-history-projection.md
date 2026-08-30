---
layer: technique
type: technique
subject: prompt-assembly
technique: tiered-history-projection
status: forged
laws: [derivation-names-recomputation, identity-survives-reuse, failure-not-empty-success]
shared_with: []
use_when: [a fixed recent-window makes a long-lived agent forget arcs older than its tail, a compaction summary replaces history with no way back to the raw record, sizing a history layer that must serve both a new agent and a months-old one from the same assembler]
---

# Tiered history projection

[History-compaction](./history-compaction.md) governs the transcript as a
layer that must be spent down: summarize, replace, and accept that compaction
is lossy by construction. That stance is correct for its regime — a message
list that is itself the durable record — and it carries an assumption worth
naming, because a different storage decision dissolves it. When the durable
record is an append-only store *outside* the message list, and the transcript
layer is rebuilt from it on every call, compaction stops being a mutation and
becomes a **rendering choice**. Nothing is ever spent down; the prompt shows
a projection of the record at chosen resolution, and a different call may
choose differently. This technique owns that regime: the history layer as a
budgeted, regenerable view over an immutable log.

The distinction is not cosmetic. In the replace-in-place regime, a dropped
constraint in a summary is a conversation that has silently changed its mind,
with no artifact showing where — which is why that technique's discipline is
to move load-bearing material *out* of the transcript before compaction
reaches it. In the projection regime the same defect is recoverable by
construction: the raw record still holds the constraint, and the summary that
elided it is a view that can be re-rendered, not testimony that replaced its
sources.

## The shape: a staircase of geometrically coarsening summaries

A linear tail can never both show recent detail and cover a long history,
because the history grows without bound and the window does not. Raising the
tail length just moves the cliff. The shape that gives complete coverage in
bounded space is logarithmic: summaries at geometrically coarsening
granularity, with a fanout `F` — one tier-1 entry per `F` raw entries, one
tier-2 entry per `F` tier-1 entries, and so on. A history of `N` entries
needs `log_F N` tiers, so total coverage costs roughly `R + F·log_F N` lines:
the recent tail verbatim, the span just older at fine summary, and the far
past in a few broad strokes — all present in every prompt, at bounded size.

Assembly reads the staircase bottom-up under a token budget, spending on the
most valuable material first: grow the verbatim tail, then per-tier entry
counts, then promote the deepest tiers toward verbatim, until the budget is
exhausted. The budget itself is derived from the serving model's advertised
window times a stated fraction, not hand-set — so a larger window buys more
detail everywhere rather than a longer forgetful tail, and the same assembler
serves a day-old history and a year-old one without retuning.

## The tiers are an index, not testimony

A summary of a summary is a rumor: at the coarse tiers the model is reading
its own paraphrase of its paraphrase, several removes from anything that
happened. The technique is honest about this rather than fighting it. Each
summary entry carries the identifiers of the entries it summarizes — with a
few notable identifiers carried *up* each tier, so concrete anchors survive
the climb instead of dissolving into summary-of-summary mush — and those
identifiers are the point: a coarse entry is a **pointer** to where something
happened and roughly what. When an old span genuinely bears on the current
decision, the agent retrieves the raw entries by identifier and spends budget
expanding that one span, selectively, instead of trusting the paraphrase.

This is the paging framing, and it assigns the load correctly: the
load-bearing core is *recency plus fetch-by-identifier* — the system must
still work, more slowly, if every summary is deleted and only the log
remains. The tiers are an optimization that makes the far past cheap to keep
resident at a glance. Per
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse), the
identifiers must survive every rewrite the summarizer performs; a tier whose
entries cannot name their sources has demoted itself from index to rumor.

## Sealed blocks: summarize the past exactly once

The past does not change, so it is summarized once. Blocks are keyed by
absolute position range in the log — a key that never shifts — and a block is
sealed the moment its `F` children exist, then cached immutably. Only the
frontier — the still-growing youngest block at each tier — is ever
recomputed. The economics mirror the structure: tier `k` fires once per `F^k`
entries, so lifetime summarization cost is about `N/(F−1)` fixed-size calls —
and each call reads `F` items regardless of how long the history has grown.

Each sealed block records its provenance beside its content: the model and
prompt version that produced it, the source range, a timestamp. This is
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
doing its plainest work: block contents are model output, so "same log, same
pyramid" is only true for a fixed summarizer, and a summarizer change must be
*detectable* — strata written by an older model or prompt are visibly stamped
and can be rebuilt on purpose — rather than a silent drift in what the agent
believes its own past was.

## Degradation never drops coverage silently

When a tier cannot be built — a summarization failure, a corrupt block — the
assembler falls back to the finer tier's entries or the raw range for that
span: more lines, never a hole. A span that silently vanishes from the
staircase is the one failure the shape exists to prevent, and per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
the coarsening is logged as a degradation, not passed off as the intended
rendering.

Two smaller disciplines earn their keep at scale. Machinery entries — wake
signals, scheduler ticks — are filtered before summarization, so the tiers
summarize the history rather than the runtime's heartbeat. And enablement on
an existing long history builds forward from a recorded start marker, with
the one expensive full-history backfill an explicit offline command — a
default-on feature must not spend a whole history's summarization budget
inside one call.

## Boundary with memory

The pyramid is episodic, automatic, and complete: everything that happened,
retrieved by recency and position. It does not replace a curated memory
store — semantic, sparse, deliberate, retrieved by meaning — and a system
wants both, because they answer different questions ("what was I just doing,
and what has this work been" versus "what do I know about X"). The natural
interaction runs one way: a coarse tier surfacing a recurring theme is
exactly the signal that a durable memory should be minted through the memory
store's own write discipline. The store is the agent-memory subject's
concern; this technique only renders the record.

## Decision rules

- If the durable record lives outside the message list and the prompt is
  rebuilt per call, render history as a projection; reserve replace-in-place
  compaction for systems where the message list is itself the record.
- Coarsen geometrically, not linearly: fixed fanout, one tier per power of
  the fanout, coarsest tier always reaching the start of the record.
- Every summary entry names the identifiers it covers; carry notable
  identifiers up each tier. An entry that cannot point at its sources is
  testimony, and testimony at tier three is a rumor.
- Seal completed blocks under position-range keys and never recompute them;
  stamp each with the summarizer that produced it.
- Derive the assembly budget from the serving model's window; spend it
  bottom-up, recency first.
- On a tier build failure, fall back to finer material and log the
  degradation. Coverage loss is the one non-recoverable defect.
- Filter runtime machinery from the summarized stream before it becomes the
  agent's remembered past.
- Do not build the pyramid before its two gates are met: histories must
  routinely outgrow the flat tail (count them — the record is already
  stored), and a fetch-by-identifier affordance must exist, because the
  tiers are worthless as an index the agent cannot follow. A short-history
  system whose long-range continuity is already carried by a curated memory
  store is not yet this technique's customer.

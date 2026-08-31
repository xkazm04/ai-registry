---
source: github:future-agi/future-agi
kind: vendor repository (open-core) — product agent + internal analysis agent in one tree
url: https://github.com/future-agi/future-agi
title: "Future AGI — evaluation and observability platform"
author: Future AGI team
commit: 5b84ef4a7666062d203d3c4124fab225650e8cfc
words: 2676 landing page / 42422 in-tree markdown
extracted: 9
accepted: 2
declined: 0
leads: 3
already_covered: 3
untriaged: 2
dispatched: 0
applied: 2
shipped: 0
fetches_spent: 0
run_id: future-agi-memory
siblings: 4
---

# Future AGI

Operator framing: mine it for **memory-system improvement**, not for anything about
general intelligence. That framing was correct and is most of why the run landed — the
tree's memory code is its densest engineering, and its README is about neither.

## Class and the sweep

An open-core **vendor repository**: a hosted product's server, frontend and gateway in one
tree under a split OSS/EE licence. Mined from a clone at `5b84ef4`, never from the ingest.
**Landing page 2,676 words; in-tree markdown 42,422** (16x) — plus roughly 2,500 lines of
memory-path source, which is where all of the yield was and none of the prose is.

Swept, in yield order: `futureagi/ee/falcon_ai/` (the product agent — `context_manager.py`,
`prompt_builder.py`, `agent.py`, `models.py`, `views_memory.py`, `tools/context/*`),
`futureagi/ee/agenthub/traceerroragent/memory.py` (a second, unrelated memory architecture),
`futureagi/tracer/models/trace_error_analysis.py` and `futureagi/tracer/queries/error_analysis.py`
(the store behind it), `tfc/utils/base_model.py` (the persistence base every model inherits).
README last. **Zero of three fetches spent** — this class corroborates in-tree by
construction, and both landings were argued against code in this tree and code in a managed
one.

## The tree's own asymmetry is the reason it was worth mining

One repository holds **two agent memory systems built to different standards**, and neither
file references the other:

- The **product agent's** store is a flat key-to-value table. Newest twenty rows win, by
  creation date; no decay, no pruning, no dedup, no usage signal, and a provenance column
  that both write paths overwrite.
- The **internal analysis agent's** store is typed (episodic / semantic), content-hash
  deduplicated, TTL-and-cap pruned by deactivation, and carries `access_count` and
  `last_accessed` under a comment reading `# Usage tracking`.

The managed store is the one that never faces a user. That asymmetry is the source's most
useful single fact and it is invisible from either file alone.

## Accepted

### 1. The under-count that is not conservative — amendment to `probe-without-write-back`

`agent-memory` is the corpus's most mature subject and the librarian's #1 attention point
(56 points). Against a subject with thirteen techniques the honest yield is an amendment,
and this one lands because the technique **states the opposite** and this tree is the
counterexample.

`probe-without-write-back` enumerates the *readers* of the usage counter, worries about
over-counting, and closes its shape comparison with: an under-count "is the better failure:
an under-counted item is ranked conservatively." Here the counter is incremented by
`get_or_create_memory` and `save_memory_data` — the **write** path — and by a single-key
lookup, while `get_recent_notes` (the bulk read that actually serves memory to the agent)
increments nothing. `access_count` is a write counter wearing the usage axis's name, which
smuggles back the "order by last edit" failure `memory-value-model` installed that axis to
repair. That is not conservative, and absence would have been safer: a column of zeros gets
noticed, a spread of plausible integers does not.

Landed as two sections plus a refinement earned from the apply step. **No golden-path
`techniques:` edit** — an amendment inside an existing file, so this run never touched a
shared spine.

### 2. The flag's two populations — amendment to `archive-restore-semantics`

A same-row existence flag binds only code that has heard of it, and its two populations fail
in opposite directions.

*Writers*: the soft delete is an override on the single-entity delete (`BaseModel.delete`
sets a flag). The set-level delete does not route through it — so the agent's own
`delete_memory` tool, which issues a queryset delete, **hard-deletes** while the human API's
instance delete soft-deletes. One verb, two meanings, split by whether the caller held an
instance or a query, and the destructive meaning is the one every bulk path reaches for.

*Readers*: `unique_together = ("workspace", "key")` is a full unique index. The default
manager filters the flag; the index never heard of it. A human-deleted key therefore leaves a
tombstone that the agent's `save_memory` cannot write over — `update_or_create` misses on the
filtered manager, inserts, and hits the constraint. **Delete-then-recreate is broken for any
key, permanently**, and the user is told a name is taken with nothing visible holding it.

The golden path already names this consequence ("uniqueness constraints ... behave as if the
data were gone when it isn't") as a hazard of *softening delete*. The sharper reading is that
it is a required decision of **archiving**, which the corpus recommends: `archive-restore-semantics`
§ "Restore into a world that changed" is written for a name that "may have been claimed",
which presupposes archiving released the key. Whether it does was never decided. Landed as
one amendment with both halves and the two-branch decision stated.

## Applied

| Technique | Project | Mode | Verdict |
| --- | --- | --- | --- |
| `probe-without-write-back` (amendment) | personas | experiment | **better** |
| `archive-restore-semantics` (amendment) | — | unapplied | **unmeasurable** |

**Row 1** is a genuine paired audit, both arms on one tree with one instrument. Arm A (the
reader-side enumeration the technique already specifies, defaulting machine callers to
suppressed) returns **0 findings** over four production read sites. Arm B (the amendment's
writer-side enumeration) returns **1**: the `CLAUDE.md` projection selects through the same
tiered call and renders into a file the consumer "prepends to *every* turn and re-reads on
`/compact`" — a delivery, at a higher rate than the prompt path — and never increments. Arm A
structurally cannot reach it, because a projection job *is* a machine caller and its default
is correct suppression. Written up in `applications/rust--probe-without-write-back.md`.

Honest scope, recorded there and here: the projection is env-gated and has **no production
caller**, so nothing is miscounted today. The defect is staged, in the path its own header
plans to make the sole injection route.

The apply step also **paid back into the technique**: the prepared-run cache reads without
incrementing and its consumer increments later, which is correct, and a naive writer-side
audit flags it. The refinement — trace each selection to its point of no return, count once
at the consumer — is in the technique because this tree taught it.

**Row 2 is unapplied and the sweep is why.** No managed project carries the seam, in either
half: `personas` keeps deletions in a separate `persona_tombstones` table (key genuinely
released) and writes explicit SQL with no per-entity delete override to bypass; `grant`
already uses partial unique indexes (`uq_ledger_signup_grant`). Two independently built
managed trees, neither of which discussed this, both landed on the released-key side — which
is corroboration for the amendment's recommended default and is exactly why there is nothing
to test. Recorded `unmeasurable` with the instrument named, not simulated with invented cases.

## Already covered — catches

- **The injection path drops the provenance grade.** `agent._load_memories` selects only
  `key, value`; `prompt_builder._memories` renders `- {key}: {value}`. The `source` column
  (`user` / `agent` / `init`) never reaches the model, while the `list_memories` tool the
  agent calls explicitly *does* show it — so the agent can tell its own assertions from the
  operator's only when it thinks to ask. `recall-injection` § "Injected memory is labeled,
  not smuggled" already requires kind, age and confidence grade on injected material.
- **The janitor evicts on a different key than the ranker reads.** `prune_notes` orders by
  `last_updated`; `access_count` and `last_accessed` sit maintained and unread by it.
  `memory-value-model` § "One model, two callers" owns this exactly.
- **Provenance is last-writer, not origin.** Both write paths put `source` inside
  `update_or_create`'s `defaults`, which apply on update — so an agent refining a
  human-asserted memory silently downgrades operator-issued provenance to agent-issued.
  `consolidation` (supersede, never overwrite) and `memory-governance` § "Corrections: the
  highest evidence grade" both already forbid the outcome. Worth re-reading as a *mechanical*
  tell rather than a value-level rule — see leads.

## Untriaged — extracted, reached the table, nobody verified

Recorded with anchors so a later run does not re-derive them. **Unverified, not declined.**

- **One store, three read doors, three caps.** `agent._load_memories` takes 20,
  `list_memories` takes 50, `MemoryListView.get` takes all — and none of the three marks the
  truncation, while the same codebase emits `[truncated N chars]` in
  `context_manager.truncate_result`. Anchor: `agent.py:122`, `list_memories.py:16`,
  `views_memory.py:40`. Possible home `recall-injection`; my read was `partial`.
- **Compaction failure falls through to unmarked forgetting.** `compact_if_needed` returns
  the uncompacted history on exception; `_enforce_token_budget` then drops oldest messages
  with no marker and no record — so the silent forgetting mechanism is the *last* line of
  defence, firing exactly when things are worst. Anchor: `context_manager.py:212`. Adjacent
  to the golden path's "amnesia by panic" and to the self-poisoning-summary failure mode; my
  read was `partial`.

## Leads

- **A law may be forming: a counter's meaning is set by its writers, not by its name.** This
  run and the corpus's existing `count-carries-predicate` reach the same root from opposite
  sides — the law asks what a count claims, this run asks who is entitled to make the claim.
  *Return condition:* a third independent sighting in a different bundle, at which point
  propose it at law level rather than as a third technique.
- **The mechanical provenance tell.** "A provenance field placed in an upsert's default set
  records the last writer, not the origin" is checkable in a way that "supersede, don't
  overwrite" is not. *Return condition:* a second source showing the same upsert-defaults
  shape, or a managed project growing one.
- **A buildable instrument, and the return condition for row 2.** A schema audit that flags
  any unique index over a table carrying an existence flag where the index has no partial
  predicate. It would have found the defect in this source in one pass, and it is the
  instrument that would make row 2 measurable. *Return condition:* when a managed project
  grows a same-row existence flag under a non-partial unique constraint, or as a
  dependency-free contribution to `scripts/`.

## Parallel-run notes

Four siblings live at claim time (`tigerbeetle-w3`, `rq-beyond-basics`, `remeda-2026-ship`,
`verou-xl`); none held `agent-memory` or `entity-lifecycle`, and `check` was clear before the
first write. The bundle gate reported **154 subjects / 1055 techniques at Phase 1 and
155 / 1064 at Phase 7** — a sibling landed a subject with nine techniques mid-run. Both of
this run's landings are amendments inside existing files, so no golden-path `techniques:`
list was touched and no `content` lock was needed. `index.json` and `catalog.json` were
deliberately **not** committed: regenerating them in a shared checkout would bake a sibling's
uncommitted subject into a hash under this run's name.

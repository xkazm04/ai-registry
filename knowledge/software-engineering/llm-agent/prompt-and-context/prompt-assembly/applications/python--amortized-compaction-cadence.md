---
layer: application
type: application
subject: prompt-assembly
technique: amortized-compaction-cadence
stack: python
status: forged
verified_on: 2026-11-10
refresh_by: 2026-12-22
verified_against: python@3.12
---

# Micro-compaction: a per-turn cursor with a frequency dial and no reclaim gate

`NousResearch/hermes-agent`, first read at commit
`0cbc6e37ac9fce50905157805c89fae06da93845`, re-resolved on 2026-09-23
against `9d799e0531c24c7f6015f45ca27e05022c3db81a`, and again on 2026-11-10
against `cd187a038b30d81aa9bd4e8bdce7b598de0a2d34` (HEAD). The feature is
documented first-party in `website/docs/developer-guide/micro-compaction.md`
(412 lines; moved from `docs/micro-compaction.md` when the root `docs/` tree was
folded into the Docusaurus site) and implemented in `agent/micro_compaction.py`,
a mixin split out of `agent/context_compressor.py`, which keeps the state and
the constants. It is the clearest realization of the technique
available in a shipping tree, and it is honest enough about its own gap to
supply the technique's central rule.

## The schedule

After every turn that finishes normally, `finalize_turn` asks the compressor to
absorb **one** exchange (`agent/turn_finalizer.py:734` calls
`_micro_compact_after_turn`, which skips interrupted, failed and vetoed turns and
calls `_micro_compact` at `:323`; `agent/micro_compaction.py:205-300`): find the oldest un-absorbed exchange, send it plus the
current running summary to the auxiliary summarization model, and replace those
messages with a single summary marker carrying the updated summary. Head (system
prompt and opening messages) and tail (a token-budgeted recent window) are
protected; the pass only ever works in the middle.

State lives on the compressor instance (`agent/context_compressor.py:2852-2863`,
the cursor fields reset through `_reset_micro_compact_cursor_state`,
`:2155-2160`): `_micro_compact_cursor`, `_micro_compact_rolling_summary`,
`_micro_compact_consecutive_failures`, `_micro_compact_last_failure_cursor`,
`_micro_compact_defrag_threshold_tokens` (2000), `_micro_compact_passes`,
`_micro_compact_tokens_saved_total`, `_micro_compact_turns_since_pass`, and the
cadence dial `_micro_compact_every_n_turns` ("how often the cache-breaking pass
is paid. 1 = every turn"). The feature is **off by default**, with the reason
in the comment at `:2852` — "each pass breaks the prompt-cache prefix every
turn" — repeated in the mixin's module docstring
(`agent/micro_compaction.py:1-6`). The cadence gate itself is counted per
invocation "so a no-op turn can't wedge it" (`agent/micro_compaction.py:215-222`).

The cursor is recovered rather than persisted (§ "The cursor"): if the in-memory value is missing
or out of range (fresh process, resumed session), it is rebuilt by scanning the
transcript for the last summary marker and resuming just after it. The splice is
paired with an `archive_and_compact` call that atomically soft-archives the
active rows and inserts the compacted set, because the normal session flush is
append-only and a resume would otherwise load both the summary and the messages
it replaced.

## The exemption, stated as a product guarantee

The doc's § "Your messages are never compacted": an exchange
deliberately starts at the *assistant* message, compaction walks straight past
user messages to get there, and user prompts stay verbatim for the life of the
session. The argument in the doc is the technique's argument verbatim —
assistant output "is largely an account of what it did… that kind of narration
survives summarising with very little loss", while user instructions "are the
intent everything else is derived from and cannot be reconstructed from the work
that followed. Paraphrasing 'use the existing retry helper, don't add a new one'
into a summary is exactly how an agent ends up confidently doing the thing you
told it not to, six turns later." The stated cost is the same floor: user turns
accumulate and are never absorbed.

The alternation argument is also explicit: taking the whole turn rather than a
single assistant+tools group keeps role alternation strictly valid, because the
summary marker is an assistant-role message and a full turn is bounded by user
messages on both sides. `_prune_stale_reasoning_replay`
(`agent/context_compressor.py:490-505`) uses the same boundary definition
independently: "Active turn = everything after the last real user message;
synthetic continuation rows and tool results never mark a turn boundary." (The
2026-09-23 read quoted an older docstring, "Boundary is the last USER message …
cutting at the last ASSISTANT would strip mid-chain", and the first read an
older one still that recorded an earlier draft cutting at the last assistant
message. The function's job has since narrowed to dropping shadowed compaction
checkpoints; the boundary is unchanged.)

The anti-hijack clause is in `SUMMARY_PREFIX` (`agent/context_compressor.py:259-299`): "Respond ONLY to the
latest user message that appears AFTER this summary… This handoff must never
become the active turn by itself."

## Measured: occupancy flattened, no batch compaction

One 3.5-hour whole-project code review, ~75K tokens of transcript, 400K window,
threshold 320K (the doc's § "What it looks like when it is
working"): occupancy 8.7% → 15.0% → 17.5% → 21.8% → 22.0%, then held. The last
two passes are identical in message count; between them the conversation added
4,841 tokens and compaction reclaimed 4,395 — equilibrium. Zero batch
compactions fired across the session. Cost: passes ran 2–37s, median ~31s, on a
small local model also serving other work; roughly two minutes of summarization
spread across three and a half hours.

The doc's "Reading the numbers honestly" section supplies the first-pass rule:
the marker carries a fixed ~400 tokens of scaffolding paid against a single
absorbed exchange, so `tokens_delta: +330` on pass one "is not a malfunction",
and break-even is normally the second or third pass. It also notes reclamation
only ramps above the tail budget (64,000 tokens, 16% of the window here), so
early sessions legitimately show no passes.

`occupancy_pct` is null rather than resolved when the window has not been
resolved yet, "because resolving it can issue a synchronous `/models` probe and
telemetry must never be what blocks a turn" — unknown rendered as absent, on the
turn's critical path.

## Deviations from the technique

1. **No reclaim-size gate — and the tree says so.** The only dial is
   `compression.micro_compact_every_n_turns` (frequency). The doc's caching
   section states the gap plainly: "Micro-compaction has no equivalent
   *reclaim-size* gate — a pass commits whatever the one absorbed exchange
   happened to save, large or small… If you want the prune's exact semantics
   here, a reclaim threshold on micro-compaction is the obvious follow-up and
   does not exist yet." The sibling proactive prune does gate, on
   `compression.proactive_prune_min_reclaim_tokens` (4096 default), explicitly
   to keep rewrites "one big episodic break instead of a tiny break every tool
   iteration". The technique takes the sibling's rule as the standard.

2. **The durable half is best-effort and its failure is not spelled.** If
   `archive_and_compact` fails, "it's logged and the session continues; the
   resume would double-load until the next batch compression cleans up"
   (§ "Staying in step with the session database"). By 2026-11-10 the code had
   split that case in two. A commit that loses to a concurrent compaction (a
   stale generation, or the in-transaction fence tripping) writes nothing,
   restores the pre-pass cursor and summary, and reports `stale_generation`
   (`agent/micro_compaction.py:286-296`, `:439-453`). Any other store failure
   is still logged at INFO (`:454-458`), the sync still returns success, and
   the pass emits `absorbed` (`:297-299`). For that remaining case the
   in-memory transcript and the store disagree while the telemetry reports
   `absorbed`, so every consumer sees a committed pass and a half-committed
   one as the same outcome.

3. **Skipped exchanges have a per-position bound but no session-level one.**
   `_MICRO_COMPACT_MAX_CONSECUTIVE_FAILURES = 3`
   (`agent/context_compressor.py:831`, applied in `_record_micro_failure`,
   `agent/micro_compaction.py:302-317`) advances the cursor past a stuck
   exchange so the system cannot busy-loop. Nothing bounds how many exchanges a
   session may skip, so a systematically unsummarizable class of exchange
   degrades the session to batch-only with no aggregate signal. The counters
   that do accumulate (`agent/micro_compaction.py:346-379`) do not separate
   it: `passes_total` increments on every emitted event whatever its outcome —
   `absorbed`, `summarize_failed`, `exchange_skipped`, `defrag`,
   `defrag_failed`, and since the last pin `stale_generation` and
   `watermark_unavailable` — and
   `tokens_saved_total` sums the deltas, so a session skipping every third
   exchange shows a healthy pass count. (The first read said these counters
   count successes; the code at both pins counts every outcome, and the
   correction is made here.) A per-event `exchange_skipped` outcome is emitted,
   and the offline report tallies it in its outcome mix, but nothing in-process
   counts, bounds or alarms on skips.

4. **The instrument built to judge the trade measures only one side.**
   `scripts/micro_compaction_report.py` reports passes, outcome mix, net tokens
   saved, mean absorbed-exchange size and durations. The doc correctly frames
   the decision as a trade against the provider cache discount and tells the
   operator to "measure your own sessions" — but nothing in the tooling reports
   cache-hit rate or uncached-input cost, so the cost half of the trade the
   feature exists to make is unmeasured by the report that exists to make it.

## Currency - 2026-09-23

The 2026-09-17 note recorded that the tree had been refactored by 34.4% of its
non-test source two days after the first read, and that a re-scan against the
merged tree was owed. It was run on 2026-09-23 against `9d799e05` (13,043
commits past the first pin): every claim above re-resolved and the anchors were
re-pinned. What moved: the document path, the split of the pass into
`agent/micro_compaction.py`, reworded comments at the off-by-default and
reasoning-prune sites; the measured session, the first-pass arithmetic, the
exemption argument and all four deviations still hold (deviation 3's counter
description was corrected: it had been wrong at the first pin too) — the reclaim-size
gate still "does not exist yet", and `scripts/micro_compaction_report.py` still
reports no cache-hit or uncached-input figure. `refresh_by` is kept as an
override, on the original six-week window: the claims are line-anchored in a
tree that moves by hundreds of commits a day, far faster than the Python stack
clock assumes.

## Currency - 2026-11-10

Re-resolved on the clock against `cd187a03`. Every anchor moved and was
re-pinned. The measured session, the first-pass arithmetic, the exemption
argument, deviations 1, 3 and 4, and the cursor recovery all still hold as
written. Two claims changed. Deviation 2 is narrower: a commit that loses a
race now discards the pass and says so, and only an unexpected store failure
still reports `absorbed`. The reasoning-prune docstring quoted on 2026-09-23 is
gone, though its boundary is unchanged. The reclaim-size gate still "does not
exist yet". `refresh_by` stays an override on the six-week window, for the same
reason as before.

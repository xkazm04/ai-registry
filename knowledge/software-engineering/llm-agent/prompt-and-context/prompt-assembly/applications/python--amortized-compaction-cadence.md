---
layer: application
type: application
subject: prompt-assembly
technique: amortized-compaction-cadence
stack: python
status: forged
verified_on: 2026-09-02
verified_against: python@3.12
---

# Micro-compaction: a per-turn cursor with a frequency dial and no reclaim gate

`NousResearch/hermes-agent`, read at commit
`0cbc6e37ac9fce50905157805c89fae06da93845`. The feature is documented
first-party in `docs/micro-compaction.md` (401 lines) and implemented in
`agent/context_compressor.py`. It is the clearest realization of the technique
available in a shipping tree, and it is honest enough about its own gap to
supply the technique's central rule.

## The schedule

After every turn that finishes normally, `finalize_turn` asks the compressor to
absorb **one** exchange: find the oldest un-absorbed exchange, send it plus the
current running summary to the auxiliary summarization model, and replace those
messages with a single summary marker carrying the updated summary. Head (system
prompt and opening messages) and tail (a token-budgeted recent window) are
protected; the pass only ever works in the middle.

State lives on the compressor instance (`agent/context_compressor.py:3520-3535`):
`_micro_compact_cursor`, `_micro_compact_rolling_summary`,
`_micro_compact_consecutive_failures`, `_micro_compact_last_failure_cursor`,
`_micro_compact_defrag_threshold_tokens` (2000), `_micro_compact_passes`,
`_micro_compact_tokens_saved_total`. The feature is **off by default**, with the
reason in the comment at `:3519-3522` — "Each pass rewrites already-sent
history, so it breaks the prompt-cache prefix every turn instead of at an
episodic boundary."

The cursor is recovered rather than persisted: if the in-memory value is missing
or out of range (fresh process, resumed session), it is rebuilt by scanning the
transcript for the last summary marker and resuming just after it. The splice is
paired with an `archive_and_compact` call that atomically soft-archives the
active rows and inserts the compacted set, because the normal session flush is
append-only and a resume would otherwise load both the summary and the messages
it replaced.

## The exemption, stated as a product guarantee

`docs/micro-compaction.md` § "Your messages are never compacted": an exchange
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
(`agent/context_compressor.py:437-470`) enforces the same boundary definition
independently — "Turn boundary is the last user message, not the last assistant
message… An earlier draft used the last assistant message and would have
stripped reasoning mid-chain from the in-flight turn."

The anti-hijack clause is in `SUMMARY_PREFIX` (`:251-270`): "Respond ONLY to the
latest user message that appears AFTER this summary… This handoff must never
become the active turn by itself."

## Measured: occupancy flattened, no batch compaction

One 3.5-hour whole-project code review, ~75K tokens of transcript, 400K window,
threshold 320K (`docs/micro-compaction.md` § "What it looks like when it is
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
   (§ "Staying in step with the session database"). The in-memory transcript and
   the store then disagree, and the pass telemetry still reports `absorbed` —
   a committed pass and a half-committed one are the same outcome to every
   consumer.

3. **Skipped exchanges have a per-position bound but no session-level one.**
   `_MICRO_COMPACT_MAX_CONSECUTIVE_FAILURES = 3`
   (`agent/context_compressor.py:823-826`) advances the cursor past a stuck
   exchange so the system cannot busy-loop. Nothing bounds how many exchanges a
   session may skip, so a systematically unsummarizable class of exchange
   degrades the session to batch-only with no aggregate signal — the counters
   that do accumulate (`passes_total`, `tokens_saved_total`) count successes.

4. **The instrument built to judge the trade measures only one side.**
   `scripts/micro_compaction_report.py` reports passes, outcome mix, net tokens
   saved, mean absorbed-exchange size and durations. The doc correctly frames
   the decision as a trade against the provider cache discount and tells the
   operator to "measure your own sessions" — but nothing in the tooling reports
   cache-hit rate or uncached-input cost, so the cost half of the trade the
   feature exists to make is unmeasured by the report that exists to make it.

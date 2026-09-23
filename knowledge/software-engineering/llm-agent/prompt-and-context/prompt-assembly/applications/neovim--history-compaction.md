---
layer: application
type: application
subject: prompt-assembly
technique: history-compaction
stack: neovim
verified_on: 2026-09-05
verified_against: neovim@0.11.0
---

# Two triggers, cycle-aged elision, a reclaim gate, and a provider-anchored count

The editor chat client from the sibling application
([context-ownership-regimes](./neovim--context-ownership-regimes.md)),
commit `f73f40e9`, same version witness. This tree is where the technique's
two 2026-09-05 amendments (the lossless lane's lower trigger, the
provider-anchored count) were read from, and it implements most of the
standing rules besides. One structural fact cuts the other way.

## The lossless lane fires first

Two thresholds, both configured as a fraction of the model's window or as an
absolute count (`lua/codecompanion/config.lua`, context-management block;
resolved by `interactions/chat/helpers/context.lua:83-104`, which returns 0
when no window is known and thereby disarms the lane). Defaults: editing at
0.65, compaction at 0.85 (`doc/architecture.md`, *the lower threshold
ensures that the lower risk editing action is triggered more often, buying
more time before compaction is required*). The gate checks the count against
compaction first, then editing (`context_management/init.lua:66-84`), so a
transcript past the upper mark is summarized, not trimmed.

Editing ages by **cycle**, one user turn plus everything the model did in
reply: the chat increments its cycle counter when control returns to the user
(`interactions/chat/init.lua:1968-1972`), every message carries the cycle it
was added in, and `editing.lua:56-91` clears tool results whose cycle is at or
below `current - keep_cycles` (default 3), never touching calls, never
touching a result twice (a marker in the message's metadata), and never
touching tools listed as excluded (the memory tool by default, because its
output is re-referenced). The placeholder tells the model to re-run the tool
(`editing.lua:25-27`), which is the re-fetch pointer the elision technique
prescribes.

## The reclaim gate and what compaction keeps

Compaction pre-estimates its savings by classifying every message before the
model is called (`compaction.lua:132-205`) and skips when the estimate is
under `min_token_savings` (default 10,000, `:26`, `:364-371`). What survives is
decided **by tag, not by position**: system messages and rules pass through
whole, attached files and buffers become placeholders that name the path,
images become a placeholder that says an image was cleared, the previous
summary is dropped, and everything else is summarized. That is the technique's
rule that nothing load-bearing may live only in the transcript, executed as a
classifier rather than as advice. The summary is appended as a tagged user
message and the chat re-submits itself so the model can respond to it
(`:286-300`); a compaction lock and a buffer lock cover the in-flight call,
pinned by four tests.

## The count is anchored on the provider's last verdict

`get_tokens` (`context_management/init.lua:30-42`) walks the messages from
the end to the last one carrying `cumulative_tokens`, which the chat writes
onto every assistant message from the provider's reported usage
(`interactions/chat/init.lua:1537`, `:1549`, `:1564`), and adds the local
estimate only for the messages after it. The local estimator is a
byte-class heuristic (`utils/tokens.lua`, six alpha characters per token,
three bytes per token otherwise) and is the whole count only when no reply
has yet reported usage. This is the second amendment's mechanism, and the
reason the defaults can sit at 0.65 and 0.85 rather than lower.

## Where the tree stops short of the standard

- **The second summary is a summary of a summary.** On a re-run, the prior
  summary message is excluded from what is *retained* (classified
  `stale_summary`, `:127`, `:148`, `:174`) but it is **included** in what is
  *summarized* (`messages_to_summarize` skips only system messages and images,
  `:208-249`). The test *re-run drops the stale summary, keeps compacted
  placeholders, and resummarises* pins the behaviour. So every compaction
  after the first summarizes the previous summary plus the turns since, and
  the far past is a paraphrase of a paraphrase, which is the "rumor"
  [tiered-history-projection](../techniques/tiered-history-projection.md)
  names as the cost of the replace-in-place regime. The regime accepts it;
  the summary prefix says it is a summary but not of how many turns.
- **No reactive path.** The request client (`lua/codecompanion/http.lua`)
  surfaces a 4xx as an error to the chat and retries nothing at the
  application layer; no compact-and-retry on a context-limit refusal was
  found in the request or submit paths read. The proactive path stands alone,
  which the technique's decision rules name as trusting two estimates.
- **The reclaim gate is estimated with the local heuristic**, before and
  after, on the classified message lists (`:251-258`); the provider anchor is
  used for the trigger and not for the gate.

## What this realization cannot do

It cannot report the recovery rate. The placeholders invite the model to
re-run a tool or re-read a file, and the tree counts none of those re-runs
against the elision that provoked them, so the one instrument the golden path
names for a lossy transform's aggressiveness is absent here.

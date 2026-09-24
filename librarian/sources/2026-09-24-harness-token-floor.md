---
source: harness-token-floor
kind: batch of two second-hand practitioner listicles (YouTube) + operator dispatch
url: https://www.youtube.com/watch?v=Jr-jyTL2MYI ; https://www.youtube.com/watch?v=SFh6MMe-XcM
title: "Paste This Into Claude, Never Hit a Token Limit Again" (both videos carry this title)
author: Ben AI ; Austin Marchese (independent channels)
words: 3537 + 4085 transcript; 3 primaries fetched (skills, memory, costs documentation)
extracted: 20
accepted: 4
declined: 0
already_covered: 7
untriaged: 4
leads: 6
dispatched: 0
applied: 3
shipped: 3
run_id: in-0924-harness
siblings: 0
---

# The floor a person never reads is the one worth cutting

Two channels published a token-saving listicle under the same title in the
same week, each relaying vendor documentation with some real pain. The
operator attached a dispatch: store the instruction-file and harness practice
in the registry and apply it to every consuming project; find a mechanism that
leaves skills deactivated by default, because the operator starts them
deliberately; and keep only the efficiency tips that carry no risk of output
degradation.

**Class and expected yield.** Second-hand practitioner listicle: reliable only
for *where the vendor's rules moved*, and the fetch is the extraction. Expected
yield: currency signals, catches and leads. The operator dispatch was where
upper-layer work could come from, and it did.

**Declared focus from the previous run** was to replay our own instrument's
history against the source's headline before writing the technique. It
applied twice and changed the landing both times. (1) The fleet transcript
replay refuted the obvious mechanism: the "hide the skill from the model"
switches would have broken real flows, because initiator skills are started by
the model whenever something *names* them. (2) Re-running our own 2026-09-08
cache measurement on the two newest model families refuted a relayed claim
that an effort flip is cache-free.

## Corrected premises from the sources

- "Every skill, MCP and connector description loads into the chat": tool
  definitions are deferred by default (names and server instructions only). For
  skills the claim holds, and it is the larger half.
- "Waiting 10 minutes loses the cache": the lifetime is one hour on a
  subscription and five minutes on usage credits or an API key.
- "CLAUDE.md is reread every message" and "keep it under 200 characters": it is
  loaded once and re-injected after compaction; the documented target is 200
  *lines*.
- "Effort can change mid-conversation without breaking the cache (newest
  models)": refuted by measurement, see row 6.

## Triage

Rows are scored under v2.5. Currency rows and leads are admitted under the
corroboration table, not the score (v2.8).

| # | Lane | Shape | Eff | Title | Prior art | Impact | G/R/C | Read | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | technique | M | Listing tier by initiator (operator dispatch + both sources) | agent-instruction-files/sibling-floor-ownership | new-technique | 3/0/2 | real gap | **accept** |
| 2 | T | script | M | Install listing tiers fleet-wide from a lane key | scripts/link-registry.mjs | fills-stack-gap | judgment lane | real gap | **accept** |
| 3 | K | currency | S | AGENTS.md read natively since 2.1.277, only with no CLAUDE.md on the path | single-source-topology (claude-code app) | dates-application | corroboration table | real gap | **accept** (+ fleet fix, + skill 0.9.0, + checker) |
| 4 | K | currency | S | Effort flip is cache-free on the newest models (Ben [00:12:19]) | model-routing/cache-continuity | resets-clock | corroboration table | refuted | **accept** as a re-verification |
| 5 | K | technique | S | Delegate reading to sub-agents on a cheaper model [00:01:42] | model-routing/routing-policy; costs doc | none | - | likely catch | already covered |
| 6 | K | currency | S | Tool definitions load in full at session start [00:06:21] | mcp-tools | corrects-claim | - | partial | untriaged (does mcp-tools state deferral? unread) |
| 7 | T | lead | S | One meta-connector instead of fifty [00:07:12] | harness tool deferral | none | - | catch | already covered (premise outdated) |
| 8 | K | technique | S | Pre-plan the prompt: job, why, guardrails, done [00:09:20] | prompt-assembly; costs doc "verification targets" | none | - | likely catch | untriaged (not opened) |
| 9 | K | technique | S | One chat per task; clear on switch; compact near 60% [00:13:10] | prompt-assembly/compaction-horizon-breakeven | none | - | catch | already covered |
| 10 | K | lead | S | "Double-check", heavy emphasis and step lists cost 15% tokens, 5% accuracy [00:15:18] | substrate-coupled-expiry; restraint-amplifier-balance | none | - | partial | lead |
| 11 | K | currency | S | Idle past the cache lifetime re-reads everything (Austin [00:02:34]) | cache-continuity | corrects-claim | - | partial | untriaged (the 1h/5m split; not checked against the subject) |
| 12 | K | technique | S | CLAUDE.md under 200 lines, a directory not a document [00:04:14] | agent-instruction-files/line-earning | none | - | catch | already covered; the checker reports it fleet-wide |
| 13 | K | technique | S | "Be concise" line / terse-speech plugin cuts output tokens [00:04:40] | - | none | - | thin | untriaged (unmeasured, and the operator's no-degradation constraint) |
| 14 | T | lead | M | Filter command output in a hook before the model reads it [00:07:41] | prompt-assembly/elision-to-a-refetch-pointer | none | - | partial | lead |
| 15 | S | lead | S | Pin a minimum viable model per skill (`model:`, `context: fork`) [00:09:23] | model-routing/consumer-overrides | none | - | partial | lead |
| 16 | T | practice | S | Move repeatable steps into scripts inside skills [00:10:40] | this registry's own practice | none | - | catch | already covered |
| 17 | X | lead | M | Route execution to another vendor's CLI (4x fewer tokens) [00:11:59] | agent-cli-transport | none | - | thin | lead |
| 18 | T | lead | M | Send long text as an image (60-70% fewer tokens) [00:12:51] | - | none | - | thin | lead |
| 19 | X | lead | L | Swap the engine or run a local model [00:13:41] | memory: local-model arena verdict 2026-09-22 | none | - | catch | already covered by our own history |
| 20 | X | task | L | Eight fleet instruction files exceed the 200-line target (one AGENTS.md is 1,050 lines) | line-earning; rewrite-behavior-pinning | fills-stack-gap | E4 | real gap | **escalated** (not rewritten: see below) |

`auto=2/0/1`, `fp=0`. Row 2 is a `scripts/` landing (judgment, no gate); rows
3 and 4 ran under the corroboration table.

## What landed

- **Technique** `listing-tier-by-initiator` (agent-instruction-files), linked
  from the golden path. Listed / name-only / hidden, set by who starts the
  capability. The hidden tier is refuted wherever a model-side start named the
  capability.
- **Application** `claude-code--listing-tier-by-initiator`: four-state probe on
  2.1.281, the transcript replay (13,649 files), and the paired floor. kp's
  first request fell from 56,282 to 53,866 tokens as shipped (all-name-only arm
  52,638). A second arm priced the harness's own and platform-supplied entries at
  5,277 tokens in an empty repository.
- **Tooling**: a `listing:` lane key (absent = `name-only`; nine ambient skills
  declare `on`, patch bumps), validated by `check-skills.mjs`, installed by
  `link-registry.mjs --listing-only` into each consumer's gitignored
  `.claude/settings.local.json`. `check-agent-guidance.mjs` classifies every
  project's guidance topology and fails on a fork (self-test 6/6).
- **Currency** on `claude-code--single-source-topology`: native AGENTS.md
  reading is conditional; `verified_on` moved to 2026-09-24 against the
  documentation read that day.
- **Re-verification** on `cache-continuity`: the effort flip still rewrites
  everything below the tool layer on both of the newest model families. The
  flip-first arm ran on forked resumes; the result was clean in both repeats on
  one family and in four of five forks on the other. The unexplained fifth fork
  is recorded, not averaged.
- **Skill** `agent-guidance-bootstrap` 0.9.0: the pointer must take the form
  the reader resolves, with three valid topologies.

## Applied

| technique | project | mode | verdict | proof |
| --- | --- | --- | --- | --- |
| listing-tier-by-initiator | kp (and 11 more consumers + this registry, machine state) | code | better | ab-paired: -2,416 tokens per session start; initiators listed by name, ambient skills keep descriptions |
| single-source-topology | athena-everywhere | code | better | ab-paired: 0/4 -> 4/4 on questions answerable only from the unloaded file; +858 tokens; commit `71d0bfd` |
| agent-guidance-bootstrap delivery rule | fleet (12) | experiment | better | the checker finds 0 forks after the fold, and 1 before it |

The seams were chosen to falsify. The replay could have shown resemblance-driven
starts of initiator skills, which would have put the whole tier in doubt. It
showed none, and it refuted the hidden tier instead. The fleet sweep's first
classifier flagged a correct reverse-topology repository as a fork, and reading
the file corrected the classifier before it shipped.

## Escalated, not done

- **Oversized instruction files (row 20).** Eight always-loaded files are over
  target: roughly 20.7k tokens in one project and 16k in another. Trimming them
  is a rewrite, and `rewrite-behavior-pinning` says a compression pass deletes
  hedges first. That is the degradation the operator excluded. The owed work is
  per project: a line-earning pass with behavior pins written first, starting
  with the largest. `check-agent-guidance.mjs` marks each one with `!`.
- **The harness's own and platform-supplied skills** (about 5.3k tokens,
  user-scope settings). Several are resemblance-driven and must stay listed; the
  per-entry sort is the operator's to approve.
- **One consumer tracks `.claude/settings.local.json`**, so the installer refused
  it. Untrack it, or set its single skill's tier by hand.
- **Pre-existing link drift**: every consumer's knowledge-rule copy and managed
  `.gitignore` block predate this run. `--listing-only` exists so this run did
  not ship that drift as a side effect.

## Leads

- Row 10: an emphasis and "double-check" budget of 15% tokens and 5% accuracy.
  Return when the vendor's prompting guide carrying the measurement is fetched
  with its protocol.
- Row 14: filter command output in a pre-tool hook (one third-party tool claims
  60-90%). Return when a paired run on one fleet gate shows the filter dropped
  nothing a later step read.
- Row 15: a per-skill `model:` pin. Return when a lane skill's worker output has
  a gate that can score a cheaper model against the session model.
- Row 17: route execution to another vendor's CLI. Return when a paired run of
  one fleet task on both arms exists (the CLI comparison arms are already
  built).
- Row 18: long text as an image. Return when a fidelity measurement on our own
  documents exists. It is lossy by its own author's account.
- Model-side starts carried by prose: a start command inside pasted text is not
  parsed as a command. Return when a harness release changes that.

## Untriaged (nobody verified these; anchors kept)

- Row 6 [00:06:21]: whether `mcp-tools` states the deferred-definition
  default.
- Row 8 [00:09:20]: the four-part prompt frame, against prompt-assembly.
- Row 11 [00:02:34]: the one-hour/five-minute lifetime split, against
  cache-continuity.
- Row 13 [00:04:40]: the terse-output instruction, unmeasured.

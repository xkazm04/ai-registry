---
source: web:letta.com/blog/benchmarking-ai-agent-memory
kind: web
url: https://www.letta.com/blog/benchmarking-ai-agent-memory/
title: "Benchmarking AI Agent Memory: Is a Filesystem All You Need?"
author: Letta research team
words: 1126
extracted: 7
accepted: 0
declined: 0
leads: 3
already_covered: 2
untriaged: 1
dispatched: 0
applied: 0
shipped: 0
run_id: hv-se-1014-sea026
siblings: 0
---

# A vendor's file-tools result on a conversational benchmark: two catches, three leads, no landing

**Class:** first-party practitioner account (the experiment, n=1) joined to a vendor
announcement (the advocacy). Queue row SEA-026, mined in harvest batch `hv-se-1014`.
Expected yield said before mining: catches and leads. That is what arrived. Memory lane:
triaged against the measured ladder before the corpus. The design (an agent with file
tools over a verbatim record, no write-time model) sits nearest the ladder's
retrieval-over-the-raw-record and verbatim-plus-hybrid arms. The post reports one
accuracy number and no staleness, read cost or write cost, so it cannot be placed on
the ladder. Fetches: 0 of 3. The miner did not run `check-anchors`.

## Triage

| # | Candidate | Anchor | Decision |
| --- | --- | --- | --- |
| 1 | Plain file tools over a verbatim record beat a distilling store on a retrieval benchmark (74.0% vs a rival's published 68.5%) | "achieves 74.0% on LoCoMo with GPT-4o mini and minimal prompt tuning" | **already covered** (`agent-memory/baseline-ladder` measures it). The number is a lead, never evidence. |
| 2 | Memory benchmarks mostly test retrieval; the memory tool is confounded with the agent driving it | "depends more on the underlying agentic system's ability to manage context and call tools" | **already covered** (`baseline-ladder` holds consumer, judge and budget constant) |
| 3 | The agent rewrites the question into its own search terms and keeps searching | "transforming 'How does Calvin stay motivated...' into 'Calvin motivation setbacks'" | **lead** |
| 5 | A rival's harness could not be run against this vendor's system; the rival did not answer | "unable to determine a way to backfill LoCoMo data into MemGPT/Letta" | **lead** (supports the contaminated-or-unrunnable pattern the lane already holds) |
| 6 | Simple tools being in training data is why they work | "simpler tools are more likely to be in the training data of an agent" | **lead**, merged into 3; unmeasured |
| 7 | A leaderboard rank, dated | "#4 overall (#1 for OSS)" | currency only; no published content depends on it |
| 4 | Tool-call policy restricted to search first, loop, then answer | "tool rules to limit the agent's tool-calling patterns" | **untriaged** (a mitigation for a weak model, not a finding) |

## Leads and return conditions

- Agent-issued iterative query reformulation as a retrieval loop. Return when a four-call
  arm with an agent-driven search loop can be compared to fixed one-shot recall at the
  same token budget, scored on stale-served rate as well as accuracy. The miner did not
  open `retrieval.md` to rule out a boundary case there.
- The 74.0% against 68.5% comparison: different harness, model and judge, no staleness
  measure. A lead under memory-lane rule 2.
- "Simple tools in training data beat specialised tools": a hypothesis.

## Untriaged (nobody verified)

Tool-rule restriction; the post-training-for-agentic-coding causal story; the
leaderboard's dynamic-interaction design. Not declined.

---
kind: semantic
confidence: 0.5
namespace: engineering
source: local-llm-perfect-analysis-2026-10-22
---

# The local text model baseline: Qwen 3.8 27B, until another beats it here

**Decision (operator, 2026-10-23):** the one local text model for private work and for the
fallback-to-paid-service tests is **Qwen 3.8 27B** (`qwen3.8:27b` on Ollama, about 18 GB at
Q4_K_M, 262k context, Apache 2.0). Do not download another local text model (Gemma, an older
Qwen, Mistral, a Qwen 4 preview) to compare or to try it out until there is a measured reason
to. Gemma 4 26B and Qwen 3.6 35B were removed from the reference machine.

## Why it is the baseline

- As of 2026-10-23 it is the newest Qwen open-weights model in the 27B to 35B range. Qwen 4
  has been announced, including a 27B local tier, but no weights or Ollama tag exist, and the
  only newer open release (Qwen3.8-Flash-Next, a Qwen 4 architecture preview) has 125B
  parameters, too large for a 64 GB machine.
- Its published benchmarks are ahead of Qwen 3.6 27B on all four shared tests (about 5.7
  points on average; SWE-Bench Pro 61.7 vs 53.5, LiveCodeBench 90.3 vs 83.9). These are the
  vendor's numbers, repeated by aggregator sites, with no independent replication found.
- In our own runs the Qwen 3.6 35B model beat Gemma 4 26B on the same analysis task (see the
  [episodic note](../episodic/2026-10-23-local-llm-perfect-analysis.md)). That is evidence for
  the Qwen line, not for 3.8 itself.

## What is not proven

Qwen 3.8 has not yet been run in our harness. "Superior in its range" is a claim from
published benchmarks and from the ordering of releases, not a local measurement. The first
local result is still owed: the same scout, draft and challenge analysis on a context where a
paid model has already been run, compared on evidence accuracy and on whether it finds
cross-file defects.

## What would change this

- A local run showing Qwen 3.8 27B worse than another model on that comparison.
- Qwen 4 27B weights shipping with an Ollama tag.
- A new open model in the 27B to 35B range with independently replicated results above it.

Until one of these happens, a different local text model is a decision for the operator, not
a download an agent starts on its own.

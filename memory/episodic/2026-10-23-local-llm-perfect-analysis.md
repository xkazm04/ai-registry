---
kind: episodic
confidence: 0.5
namespace: engineering
source: local-llm-perfect-analysis-2026-10-22
---

# 2026-10-22: two local models run the /perfect analysis phase, one paid-model baseline

## What happened

The operator wanted to know whether a private, local model can stand in for a paid service
on a real development task. The task was the propose phase of `/perfect` (scout a context,
draft up to five directions, challenge them) on a consuming project, with no building. The
models were `gemma4:26b` and `qwen3.6:35b` served by Ollama on a 64 GB unified-memory
Windows-on-ARM64 machine (both Q4, 64k context), driven through the Pi coding agent with
read-only tools against a throwaway clone. The harness is
`scripts/experiments/perfect-local.mjs`.

| Run | Context | Wall time | Result |
| --- | --- | --- | --- |
| Gemma 4 26B | timeline scrubber (10 files) | about 16 min | Thin scout; the draft stage made no tool calls; kept directions whose premises its own scout contradicted |
| Qwen 3.6 35B | same | about 12 min | 22 + 14 + 17 tool calls; real evidence; found the existing guard script; dropped three padded directions |
| Qwen 3.6 35B, tightened prompts | scan engine, train compare, engine core | 6-8 min each | Drafts now verify evidence with tools; lens labels consistent |
| Paid Sonnet baseline | scan engine | about 2.3 min | Same number of directions, exact line numbers, cross-file findings |

## What we learned

- The pipeline works locally end to end: tool use, read-only discipline and the skill's
  structure all held. A spot-check of cited evidence found the files and symbols real, with
  line numbers drifting by up to a dozen lines.
- On the same context the paid model found defects that come from how parts interact (a
  pruned job counted as done, a missing duplicate-scan guard, merge cost growing with table
  size). The local model found local tidy-ups (an incomplete lookup map, a label that ignores
  job status) and proposed some cosmetic changes its own taste rules reject. Treat local
  output as a good first pass, not the only reviewer.
- Gemma lost clearly to Qwen on this task; only Qwen was run on the larger contexts.
- Setup traps that cost hours: Pi's `--tools read,grep,find,ls` gives the model no tools (the
  read-only set is `+grep,+find,+ls` with bash, edit and write excluded); Pi waits forever on an
  open stdin; a shell splits a multi-word task argument; a CRLF config file silently emptied
  the project-law section of the system prompt.
- The prompt tightening in the harness after the last run (hypotheses with a measurement and
  a drop condition, exact lines, cross-file lifecycles, no cosmetic or bundled directions) was
  written but not re-run, so its effect is unmeasured.

## Limits

One run per model per context, one paid baseline on one context, no blind grading of slates.
The comparison is indicative, not a benchmark.

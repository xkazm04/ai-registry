---
layer: application
type: application
subject: serving-process-topology
technique: process-count-as-a-formula
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
---

# A published process-count formula

Citations are to `vllm-project/vllm` at commit
`facd9a74a1cd1b9fed324cdc2cceb8d54fdad3d0`, section "V1 Process Architecture" of
`docs/design/arch_overview.md:68-133`.

## The four kinds, each with its term

The document enumerates process *kinds* before counting anything, and gives each
one a job and the knob that determines how many exist:

| Kind | Job | Count |
| --- | --- | --- |
| API server | HTTP handling, tokenization, multi-modal loading, streaming | `A`, default `DP`, overridable with `--api-server-count` |
| Engine core | scheduler, KV cache management, worker coordination | `DP`, default 1 — one per data-parallel rank |
| GPU worker | weights, forward passes, device memory | `N = DP x PP x TP` — one per GPU |
| DP coordinator | load balancing across ranks, synchronized passes for MoE | 1 when `DP > 1`, else 0 |

Every term is expressed over knobs the operator literally types
(`--data-parallel-size`, `-tp`, `-dp`, `--api-server-count`), which is the
technique's "operator vocabulary" requirement met exactly.

## The total, with its conditional term inline

> **Total: `A + DP + N` (+ 1 if DP > 1)**

The conditional is in the formula rather than in a footnote — the coordinator is
precisely the term an operator would omit, because it is zero in the default
single-replica deployment they tested on and non-zero in the one they deploy.

## Two worked examples, chosen to differ in which terms are active

`arch_overview.md:118-133` works both, and the pair is well chosen:

- `vllm serve -tp=4` on 4 GPUs → 1 API server + 1 engine core + 4 workers =
  **6 processes**. The coordinator term is inactive.
- `vllm serve -tp=2 -dp=4` on 8 GPUs → 4 API servers + 4 engine cores +
  8 workers + 1 coordinator = **17 processes**. The coordinator term is active,
  and the API server count demonstrates its derived default (`A` = `DP` = 4)
  rather than the constant 1 the first example makes it look like.

A reader who understood `A`'s default as "1" from the first example is corrected
by the second. That is the reason the technique demands two.

## Where it converts into provisioning

The section closes by pointing at
`docs/configuration/optimization.md#cpu-resources-for-gpu-deployments`, and the
enclosing text opens with the reason the whole section exists: "Understanding
this architecture is important for properly sizing CPU resources in your
deployment." The count is presented as an intermediate value on the way to cores
and memory, not as trivia.

One per-process detail the same section supplies and which multiplies against
`A`: each API server process runs a thread pool for media loading, sized by
`VLLM_MEDIA_LOADING_THREAD_COUNT`, default 8. A host sized on process count alone
under-counts threads by a factor of eight on the outer tier.

## Where this tree falls short of the standard

Two gaps, recorded without lowering the bar:

- **The formula and the spawning code are two hand-maintained copies.** Nothing
  compares the table in `arch_overview.md` against what
  `vllm/v1/utils.py` and `vllm/v1/executor/multiproc_executor.py` actually
  create. The technique asks for the count to be *computed* — reported by the
  runtime before it spawns, or asserted by a test against the published formula —
  and neither exists here. The table is correct today because someone wrote it
  carefully, which is the state that precedes drift.
- **No per-kind resident cost is published beside the count.** The reader is
  handed a number of processes and a link, rather than a number of processes and
  a measured range of megabytes per kind.

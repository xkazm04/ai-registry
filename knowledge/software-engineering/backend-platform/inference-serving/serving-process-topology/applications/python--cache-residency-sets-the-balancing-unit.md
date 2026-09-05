---
layer: application
type: application
subject: serving-process-topology
technique: cache-residency-sets-the-balancing-unit
stack: python
status: forged
verified_on: 2026-09-04
verified_against: python@3.10
---

# One model family, two launchers, opposite answers on replication

Citations are to `microsoft/VibeVoice` at commit
`1541f590c7099820f10ea012f48d2399282df69f`. The stack version is witnessed by
`pyproject.toml:14` (`requires-python = ">=3.10"`) and the serving image pinned
throughout `docs/` at `vllm/vllm-openai:v0.14.1`; the engine's own replication
feature is the one under discussion.

This tree is unusually good evidence for the technique because it contains
**both regimes in one repository, built by one team, over one model family**.
The two launchers differ on almost nothing except what their engine caches, and
they reach opposite conclusions about whether a replica set can be fronted by a
balancer. Neither had to be inferred: both are stated in code, and the reason
is written down.

## The stateless launcher replicates freely — because it turned the cache off

`vllm_plugin/scripts/start_server.py` supports arbitrary data-parallel width.
At `--dp N > 1` it installs a reverse proxy, allocates `N` backend ports
(`frontend_port + 100 + i`), launches one engine per GPU group with
`CUDA_VISIBLE_DEVICES` pinned, and balances across them. The proxy config it
generates uses `least_conn` — a policy with *no* notion of client identity at
all, which is admissible only because every backend is equivalent.

The line that earns that equivalence is in the command builder, several hundred
lines away from the proxy: `_build_vllm_cmd` passes
`--no-enable-prefix-caching`. With reuse across requests disabled, a request's
cost does not depend on which replica served its predecessor, the technique's
discriminating question answers *no*, and replication is arithmetic.

The two facts are not presented as related anywhere in the file. They are one
decision.

## The streaming launcher refuses replication — because the cache is the design

`vllm_plugin/scripts/start_streaming_server.py` serves the same model family
over a session: audio arrives in chunks, each chunk is appended to a growing
sequence, and `docs/vibevoice-vllm-asr-streaming.md` advertises the property
that follows — "each chunk reuses the KV cache of every chunk before it, so
cost stays flat as a session grows". That is state about a *span of
interaction*, in the technique's terms, and it is the product promise rather
than an optimization.

So the same flag is refused. `--dp` is **defined** in the parser, carrying its
own explanation in the help string, and `main()` calls `parser.error()` when it
exceeds 1:

> "--dp is not supported for streaming. Each session keeps its audio windows in
> one replica's prefix cache, and an nginx round-robin would send its later
> chunks to a replica that never saw them. Run one server per GPU on separate
> ports and route whole sessions, or use --tp to split the model across GPUs."

Three of the technique's clauses are visible in that one message: the unit
moves from the request to the session; the recommended shape is N independent
single-unit services rather than one N-wide set; and the alternative that
remains available (`--tp`) is the one that splits a model *without* splitting
the cache. `docs/vibevoice-vllm-asr-streaming.md` repeats the shape as a shell
loop that starts four containers on four ports and tells the reader to route
whole sessions.

## The refusal is the technique's "define it, do not omit it" clause, verbatim

This is the strongest single piece of evidence here, because omitting the flag
was clearly the cheaper option and was not taken. The streaming launcher's
parser declares `--dp` with a `dest`, a default of 1, and a help string that
already states why it is unsupported — purely so that an operator arriving from
the sibling's documentation, where `--dp 4` is the headline scaling example,
receives an explanation instead of `unrecognized arguments: --dp`.

The tree also demonstrates why the third variant — accept and ignore — would
have been worse than either: the failure it produces is invisible. Nothing in
the streaming server reports how many replicas are running.

## What the tree confirms structurally, and what it does not

The technique claims the mis-routing failure is a wrong answer rather than an
error. This tree corroborates it by construction and from the other direction:
the server's own troubleshooting section documents a *different* silent failure
of exactly this shape — a non-streaming checkpoint served by the streaming
path, where "the weights load, the first chunk transcribes, and every later
chunk comes back empty because nothing ever emits `<|text_chunk_end|>`"
(`start_streaming_server.py`, `check_streaming_checkpoint`). The team had
already been bitten by *first request correct, all later requests degraded, no
exception*, and built a startup assertion against it. The `--dp` refusal is the
same failure shape caught at the same phase.

What the tree does **not** demonstrate is the technique's cache-bound
concurrency clause under measurement. The launcher exposes
`--mm-processor-cache-gb` with the docstring "must hold every in-flight
session's windows" and the docs say to raise it *before* raising concurrency,
which is the derivation the technique asks for — but no number relates cache
size to a session count, so the limit is stated as a dependency rather than as
arithmetic. An operator still cannot answer "how many concurrent sessions fits
in 16 GB" from this tree.

## A defect this tree has, that its sibling subject predicts

Recorded here because it is the same design's other half.
[process-count-as-a-formula](../techniques/process-count-as-a-formula.md) warns that
"a shared pool divided by a process count is the correct derivation and a
per-process constant is the common error — the same configuration then behaves
differently at two deployment widths".

`start_dp_server` computes
`ffmpeg_concurrency = max(64, int(os.environ.get("VIBEVOICE_FFMPEG_MAX_CONCURRENCY", "64")))`
and exports that value into **each** of the `N` worker environments, under a
comment reading "Auto-tune per-worker env vars based on dp size" — which reads
nothing from the dp size. Two consequences follow, and the tree has both:

- The host-level ceiling is `64 × dp`, unbounded and unstated. At the
  documented `--dp 8` example that is 512 concurrent decoder processes on one
  machine.
- Because the expression is a `max` rather than a clamp, the knob is
  **one-directional**: an operator following the documented advice to "tune
  `VIBEVOICE_FFMPEG_MAX_CONCURRENCY` based on CPU cores"
  (`docs/vibevoice-vllm-asr.md`, Performance Tips) can raise it and cannot
  lower it. A value of 8 is silently restored to 64.

The variable's name reads host-global and its application is per-replica. That
is the failure the sibling technique names, found in a tree that otherwise
reasons about its topology unusually carefully — which is the useful part of
the observation, since it did not come from carelessness about scaling.

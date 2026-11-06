# The GPU bank: proofs and benchmarks that wait for an idle GPU

Research keeps producing work that needs the GPU: a render proof, a media benchmark, a model
comparison. On this box the GPU is usually busy, so those wait in a bank and run when it is free.

## The bank is the backlog ledger

There is no second list. A banked item is a row in `librarian/harvest/backlog.jsonl`:

```json
{"id":"...","status":"held","queue":"media","render":{"kind":"proof","runId":"...","brief":"...","arms":{"a":"...","b":"..."},"instrument":"...","estGpuMin":30,"machine":"Lynx","display":null}}
```

`kind` is `proof` (needs the operator's blind pick) or `benchmark` (timing or resource figures; no
pick). `machine` matters: Fox and Wolf see the row and do not claim it. A row without `estGpuMin`
is not picked, so estimate it from the table below. Write through the `ledger` lock, like every
appender; `backlog-wave mark` is atomic under it.

## What "idle" means

`gpu.state:"idle"` from `shift-sense` is: dwell of at least 300 s, with **all** of these throughout:
ComfyUI running 0, pending 0, no new `/history` entry, util under 15 %, power under 5 W, Ollama with
nothing loaded, and the gravitone lease free. A null reading gives `unknown`, which never advances
dwell.

Why so much, measured over 96 h on this box:

| Trap | Reading |
| --- | --- |
| Handover between clips | queue 0, util 5 %, 2 W, for 1-9 s (one runner up to 147 s) |
| Batch gaps | 159 s to 14,650 s, indistinguishable from idle by any sensor |
| One-at-a-time submitter | pending reads 0 with 18 clips left |
| `memory.used` | reads 51 GB on an idle card with cached models |
| Mesh work inside a job | util under 20 % for up to 28 s while running |

**The lease closes the batch gap for runs started by `day-run.ps1` after 2026-11-06.** Other
submitters do not take it, so sensors and the queue remain the guard for them: a queued proof makes
`clips-h3.py` wait. Whether every other runner waits is unverified, so record any collision.

## Running one

1. Re-sense. Confirm `gpu.state:"idle"` and `width.gpuProof >= 1`. If not, return it to the bank.
2. Take the lease for the proof's life, from the gravitone checkout:
   `python pipeline/gpu/hold.py --tenant shift-proof/<runId> --engine comfy --while-pid <pid> --stop-file <path>`.
   A refusal means someone owns the GPU: back to the bank, no retry loop.
3. Hold system and display awake, and record `display` in the result.
4. Run per [`render-proof.md`](../../intake/references/render-proof.md), with its controls, in
   `.ai/shift/review/items/<runId>/`, not temp. **Submit through ComfyUI's queue. Do not recycle and
   do not `/free`.** That file's recycle-per-clip step applies only when the box is the proof's alone
   and the proof's own memory forces it; under /shift, cut the batch short instead.
5. Between clips re-read the queue. **If anything else appeared, stop at the clip boundary**, keep
   what exists, release the lease, and leave the row `held` with its progress. Never cancel a clip.
6. Seal with `render-triage sheet`, and write `landing` in its manifest: one sentence on what lands
   if the candidate wins. It must name no arm, or `build` withholds the item. Release the lease, then
   `shift-review build`.

One item per idle window, then re-sense: a window that held for one proof may not hold for the next.
Prefer items that fit: do not start a 22-minute x2 upscale right after a batch that left a short gap.
**Never download a model to pass a proof.** A missing model is a lead naming it. Multi-GB downloads
wait for night and the operator.

| Proof | Typical cost on Lynx | Memory |
| --- | --- | --- |
| Flux2 still, 1024x1024, 24 steps | 96-301 s | not recorded |
| TRELLIS.2 asset | 170-229 s, up to 660 s batched | GPU 12.5-18 GB, RAM about 25 GB |
| H3 clip 832x480 | about 412 s | about 53 GB WDDM |
| H3 clip 1280x704 turbo | 450-502 s | about 55 GB WDDM |
| LTX first+last frame | 6-8 min | not recorded |
| LTX x2 upscale | 22.6 min per clip | not recorded |
| EEVEE | about 11 s per 1024x1024 frame | not recorded |

A number with `display: off` is not comparable with `display: on`, whichever way it points.

## The rolling review page

`.ai/shift/review/index.html`, built by `shift-review build`. Decision first: the question in plain
words, blind outputs side by side, what follows from each kind of pick. Numbers last. The operator
answers whenever they look, every pair of a run at once, because `reveal` refuses a partial answer
(the page prints the exact command):

```
/shift verdict <runId> <pairId>=<label|tie|neither> [<pairId>=<label|tie|neither> ...]
```

That reveals the arms. **Then land or reject per `/intake` Phase 6b/7**, record the verdict on the
row, and `shift-review clean <runId>`, which refuses without a verdict.

**The Director's reading of the frames is opinion and never the verdict.** Past the size cap
(`reviewCapGb`), `next` pauses new proofs and says `proofsPaused`, because unreviewed renders are
disk nobody reclaims. Benchmarks land their figures in the bench report without a pick, in the
lower section of the page.

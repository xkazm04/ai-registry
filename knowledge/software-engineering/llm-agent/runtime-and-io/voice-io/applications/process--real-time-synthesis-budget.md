---
layer: application
type: application
subject: voice-io
technique: real-time-synthesis-budget
stack: process
status: forged
verified_on: 2026-09-30
---

# A synthesis-engine bake-off for a local desktop companion, and the owner's cut

Personas is a local-first desktop app with a built-in companion that speaks
its replies. It ships one local synthesis engine (Kokoro-82M through the
sherpa-onnx runtime, 53 fixed preset voices) and, before this work, had a
product requirement to add a custom voice cloned from a short clip. A two-day
investigation ended in a measured bake-off of four open-weights engines on the
owner's machine on **2026-09-29**, and an owner decision on **2026-09-30**.
This application records what the technique's rules looked like against those
numbers. The raw results stay with the project; everything below is quoted
from them with its conditions.

## The machine and the protocol

- **GPU tier:** RTX 4090, 24 GB, also driving the desktop (about 1.4 GB in use
  before any run). **CPU tier:** the same machine with the card unused —
  Ryzen 7 7800X3D, 8 cores / 16 threads, 63 GB RAM, Windows 11. "CPU only"
  means the same environment with the device set to the processor, so no
  accelerator call is made.
- **A shared machine.** Three to five cores were busy with unrelated work
  throughout. Each run recorded the machine's processor load in the second
  before it started, and two runs that overlapped another job were excluded
  from every median and re-run alone. CPU figures are therefore on the slow
  side of what this processor can do, by an amount bounded but not removed.
- **Runs.** One process per engine x model x voice x device: cold load, one
  first call (reported, kept out of the median), then three lines — a greeting
  (~3 s of audio), a two-sentence reply (~8–10 s) and a 200-character summary
  (~11–16 s) — three warm runs each. CPU runs of the slow engines ran once,
  on the greeting only, because one line already put them far past real time.
  RTF is the median over warm runs. Engine-default precision; seed fixed where
  the API takes one; weights pre-downloaded and loaded offline so no timing
  includes a download.
- **n.** Three runs, three lines, one reference voice. Enough to rank engines
  whose differences are several-fold, as most below are; not enough to
  separate two engines within about 10% of each other.

## The numbers the turn pays

RTF is compute seconds per audio second (below 1 keeps up). First audio is on
the greeting, with its kind: *stream* returns a first chunk, *whole* returns
the finished sentence.

| Engine · mode | GPU RTF | GPU first audio | CPU RTF | CPU first audio | Peak memory |
| --- | --- | --- | --- | --- | --- |
| Kokoro-82M (PyTorch) · preset | 0.01 | 0.09 s stream | 0.16 | 0.51 s stream | ~1.0 GB VRAM / ~1.8 GB RAM |
| Kokoro, sherpa-onnx warm, 4 threads · preset | – | – | 0.31 | 1.38 s whole | ~1.1 GB RAM |
| Kokoro, sherpa-onnx warm, 8 threads · preset | – | – | 0.24 | 0.77 s whole | ~1.1 GB RAM |
| Kokoro, sherpa-onnx CLI spawned per sentence, 4 threads | – | – | 1.08 on the greeting | 3.06 s whole | – |
| Chatterbox Turbo 350M · clone | 0.48 | 1.56 s whole | 5.44 | 22.4 s whole | 3.6 GB VRAM / 6.4 GB RAM |
| Chatterbox Nano 110M · clone | 0.30 | 0.90 s whole | 1.72 | 5.64 s whole | 2.8 GB VRAM / 4.5 GB RAM |
| Qwen3-TTS 1.7B Base · clone | 3.14 | 10.2 s whole | 11.2 (n=1) | 40.4 s whole | 5.6 GB VRAM / 11.7 GB RAM |
| Qwen3-TTS 0.6B Base · clone | 2.83 | 13.4 s whole | 7.7 (n=1) | 30.9 s whole | 3.4 GB VRAM / 6.0 GB RAM |
| Qwen3-TTS 1.7B VoiceDesign · designed | 2.90 | 9.5 s whole | not run | – | 4.8 GB VRAM |
| VoxCPM2 2B · clone, eager | 1.62 | 0.26 s stream | 14.7 (n=1) | 2.54 s stream | 6.1 GB VRAM / 12.9 GB RAM |
| VoxCPM2 2B · clone, compiled | 0.47 | 0.11 s stream | – | – | 7.8 GB VRAM |

What the table says against the admission rule:

- **Only one engine keeps up on the CPU tier, with margin: the incumbent
  preset engine.** Every cloner crosses real time on the processor, the closest
  (Chatterbox Nano) by a factor of 1.7. So a cloned voice without an
  accelerator can only be pre-rendered or played sentence by sentence with a
  wait — content-pipeline work, not a live reply.
- **On the GPU tier two cloners keep up** (Chatterbox Turbo and Nano), a third
  only after compilation (VoxCPM2), and one never does (Qwen3-TTS, about three
  times slower than real time on a 4090, with the card at roughly 20%
  utilisation — the engine's decode loop, not the card, was the limit, per the
  run's own reading).
- **First-audio kind decides the long line.** On the 200-character summary the
  streaming engines still start in a fraction of a second, while the
  whole-sentence Qwen3-TTS package makes the listener wait 42–45 s.

## The process boundary, costed

The app's call shape at the time was the sherpa-onnx command-line binary
spawned once per sentence (per the project's own map of its voice stack). The
same model and voice, timed both ways on the same machine: greeting **3.06 s
spawned against 1.38 s warm**, the two-sentence reply 3.84 s against 2.39 s,
the summary 5.21 s against 3.24 s — about **1.5–2.0 s of process start-up and
model load added to every sentence** (1.7 s on the greeting), enough to push a
greeting past real time (RTF 1.08) on an engine that runs at 0.31 when
resident. That is the measurement behind the resident-mode recommendation in
[portable-provider-package](../techniques/portable-provider-package.md); a warm
worker was recommended, and whether it has shipped is not recorded here.

## Vendor figures, re-measured

| Claim (source) | Measured here | Reading |
| --- | --- | --- |
| Chatterbox Nano "3x faster than real time on 8 CPU cores" (vendor) | RTF 1.72 on an 8-core CPU, cloning, with 3–5 cores busy | Not reproduced. Background load explains part of it, not a factor of five. |
| Qwen3-TTS "as low as 97 ms" to first audio (vendor) | 10.2 s on the greeting through the pip package on Windows, no streaming | A serving-stack figure (a Linux inference server), not what a desktop app can install. |
| VoxCPM2 RTF in the 0.1–0.3 range on a 4090 (vendor and secondary reports) | 1.62 eager; 0.47 compiled | The published figures come from a separate serving stack; the installable package reaches real time only compiled. |
| Kokoro "35–100x real time on a mid-range GPU" (third-party server README) | RTF 0.01 on the 4090 (about 79x) | Holds. |

## The silent fallback

VoxCPM2's own `optimize` path uses graph compilation, and the official compiler
backend has no Windows build. Out of the box the library logged a warning and
ran eager: **RTF 1.62, falling behind the listener, with nothing failing.**
Installing a community Windows port of the compiler backend (not a release of
either the model's vendor or the framework's) made the vendor's own compile
path work unchanged: **RTF 0.47 and first streamed audio after 0.11 s**, at the
price of a **224 s compile on the first load** (58 s with the compiler's disk
cache warm) and a **15.9 GB system-RAM peak while loading**. The difference
between an engine that falls behind and one that runs at twice speaking speed
rested entirely on that third-party package, which is the technique's "record
the path actually taken, pin the port, keep the slow path declared" rule
arriving as a measurement.

## The installable package lags the source

Four of the four engines needed a workaround, and each one is a signal that the
capability was still moving:

- Qwen3-TTS: the tokenizer loader in its pinned `transformers` called the model
  hub even for a cached model and failed offline until given a local snapshot
  path; the package documents no streaming generation.
- Chatterbox: the package-index release predated the Nano model, so the engine
  was installed from source over the same pinned dependencies.
- VoxCPM2: the package-index release lagged its source (no seed argument), and
  the compile path needed the third-party port above.
- sherpa-onnx: the Python wheel ships no offline-synthesis command-line binary;
  the release binary was fetched separately.

A category error was also caught before measurement: the "Qwen audio agent"
that was on the candidate list is a realtime voice runtime placing a duplex
front-end in front of coding agents, not a synthesis engine. It would have
wrapped the same model, slower, and competed with the product's own
conversation loop. It was read, not timed.

## The owner's cut, and how it maps to the rules

The engine tester proposed a speed-admitted hybrid order: the preset engine on
any machine, the fastest faithful cloner on an NVIDIA card, a small cloner
pre-rendered on a CPU, and a paid cloud engine as backup. The owner listened
to every clip and cut further:

- **Live replies stay on the preset engine** (Kokoro, voice `af_heart`) through
  the shipped sherpa-onnx runtime. By ear its output was the same on the CPU,
  on the GPU and through sherpa-onnx — which is what licenses the next point.
- **Presets plus a GPU/CPU toggle, so users compare the time on their own
  machines**, rather than a device default chosen from the owner's 4090. This
  is the technique's "when the device changes speed and not voice, let the user
  time it", decided by the owner before it was written down here.
- **Cloning is positioned for pre-rendered content** — video and audio
  generation — not for turn-by-turn conversation, because its GPU time does not
  suit an ad-hoc reply.
- **Chatterbox Nano was rejected on time**, the one CPU cloner.
- **Cloning in the product is deferred** "until the market develops": preset
  voices ship, and the custom-voice path waits behind the engine contract.

The deferral is the technique's last section in practice: no candidate cleared
the budget on the common tier, the best GPU candidate needed a community port,
two vendor speed figures did not reproduce, and every installable package
lagged its source.

## What was not measured

A thin laptop (the report's estimate of 1.5–3 times slower on the CPU rows is
an estimate, not a measurement); the vendors' serving stacks; quantised builds;
concurrency; text longer than 200 characters; the cost of switching engines
inside one process; any language other than English; and the paid cloud
backup, which had no key on the machine.

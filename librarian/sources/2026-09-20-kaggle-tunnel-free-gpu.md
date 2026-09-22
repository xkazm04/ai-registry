---
source: github:pruthviraj-chavan/kaggle_32gpu_free
kind: repository
url: https://github.com/pruthviraj-chavan/kaggle_32gpu_free
title: "Kaggle Ollama -> Cloudflare Tunnel -> VS Code AI Agent"
author: pruthviraj-chavan (HEAD commit authored by "Kumaresan")
words: 1248
extracted: 12
accepted: 1
declined: 0
leads: 3
already_covered: 4
untriaged: 4
dispatched: 0
run_id: kaggle-gpu-2026-09-20
siblings: 0 on the board, 1 unclaimed live in the checkout
rescan_when: the guide grows an authentication step or a named-tunnel section (its own §17 says a quick tunnel is not the production shape), or the client it targets adds a non-Anthropic request format; or 10 weeks elapse (2026-11-29)
---

# The endpoint that is compatible with something, but not with the caller

Operator dispatch layered on a repository: *research and test if this concept is
usable so we can reach a free LLM engine as fallback when plans are depleted.*
The source is pinned at `bd3615f1bc32d08b54d8dddf96112fe5b7307608` (2026-09-16).

## The tree is one file

Phase 2b cloned it and the sweep terminated immediately: the repository is a
single `README.md` of 1,248 words and nothing else — no `docs/`, no instrument,
no measurement, no types, no tests. The ingest's 1,450 words against the tree's
1,248 is the whole gap between the landing page and the source, which is the one
case where the README genuinely *is* the repository.

**Class: practitioner build-walkthrough, repository form, tour half only.** The
hybrid rule asks whether the creator is describing what the tool does or what
happened to them while using it, and here the operating half is nearly absent —
the author never reports a latency, a session death, a cost, or whether an agent
actually completed work against it. Two sections are real paid-for pain (§15,
"browser 403 does not prove the API is broken", and §16's troubleshooting order),
and they are the only first-party evidence in the file.

**Expected yield, stated before the table:** mostly catches and leads, no
upper-layer landing without a fetched primary. That is exactly what happened,
and the class rule held in its strongest form — **the fetch was the extraction.**
The source describes a procedure; the landing rests entirely on the *client's*
published contract, which the source never consults and which inverts its premise.

**Routing count (Phase 2d): zero.** No load-bearing design decisions — a linear
18-step procedure carries no forces, buys nothing against an alternative, and
rejects nothing. The news method applied unchanged; no forge handoff.

## What the source claims, and what the primary says

The guide's output is an OpenAI-shaped `/v1/chat/completions` endpoint on a
temporary tunnel, offered as something "an external AI agent" can use. The
fetched primary — the target client's own gateway compatibility guide — states
the accepted formats as a closed set of three: Anthropic Messages via
`ANTHROPIC_BASE_URL` (`/v1/messages`), Bedrock InvokeModel, and Agent Platform
rawPredict. **OpenAI's chat-completions shape is not among them**, and the same
page states plainly that routing this client to non-Claude models through any
gateway is unsupported.

Two mechanical blockers sit underneath that, both quoted from the primary:

- **The identifier filter.** Gateway model discovery "keeps an entry when its
  `id` contains `claude` or `anthropic` anywhere in the string" and ignores the
  rest. A model named `qwen3:8b` is dropped from the picker before anything
  about its quality is consulted — and it is dropped *silently*.
- **The capability inversion.** For "a model ID Claude Code doesn't recognize,
  such as a gateway alias", the Anthropic-format path sends "everything current
  Claude models accept ... including adaptive reasoning, effort, and context
  management". The client cannot tell *older and weaker* from *newer than me*,
  so the weakest substitute on the roster receives the **largest** request body.

That inversion is the finding. It is not in the source, it is not in the corpus,
and it is the opposite of what a roster designer plans for.

## Tested, not asserted

The operator asked for a test, so the capability half was measured locally
rather than reasoned about.

- **Tool calling, three local models** (`qwen2.5:7b-instruct`, `gemma4:12b`,
  `qwen3.8:27b`), each with a known positive and a known negative: **3/3 each**,
  schema-parseable arguments, correct refusal to call a tool on a chat question.
- **Multi-step agent loop** under a 10-tool crowded set, requiring tool
  selection, consumption of a tool result, and termination: **all three reached
  the correct answer in 2 steps and terminated**; the 7B did it in 3.9s.

So the capability floor for agentic tool use is met by a 7B **on this machine**,
and the bottleneck the source proposes to solve does not exist. The decisive
number is hardware: this machine has a 24 GB card already serving a 27B model,
and the source's own worked example is an 8B — **smaller than what is running
locally before the procedure starts.** The advertised 32 GB is two 16 GB
Turing cards, ~33% more memory on much slower silicon, behind an
unauthenticated public URL, on a weekly quota, in a session that takes the URL
with it when it dies.

## Triage

Upper-layer rows scored (v2.5); currency and leads admitted under the
corroboration table, which lets a source authorize both alone.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|------|-------|-----|-------|-----------|--------|------|-------|----------|
| 1 | K | technique | M | Admission is a gate before the capability floor | model-routing (capability-floors, failover-path-liveness) | new-technique | real gap | 3/1/2 | **accept** |
| 2 | K | design | — | Unrecognized identifier selects the maximal request | — | — | real gap | — | folded into 1 |
| 3 | K | lead | — | A failover destination whose lease a third party grants | model-routing | none | partial | — | lead |
| 4 | K | lead | — | Borrowed-compute acceptable-use exposure | — | none | thin | — | lead |
| 5 | K | lead | — | The 2s/120s asymmetry between probe and generation | — | none | partial | — | lead (refuted here, may hold elsewhere) |
| 6 | — | currency | S | Quick tunnels are ephemeral; quota is weekly | — | none | — | — | dated fact, in note only |
| 7 | K | catch | — | Unauthenticated public endpoint is a vulnerability | quorum-and-recovery-procedures (`unauthenticated-ritual-is-a-vulnerability`) | none | likely catch | — | already covered |
| 8 | K | catch | — | The model name must match the roster exactly | model-routing (`model-identity`, alias section) | none | likely catch | — | already covered |
| 9 | K | catch | — | A 403 in a browser does not prove the API is broken | `gate-sees-target` (law) | none | likely catch | — | already covered |
| 10 | K | catch | — | Verify each hop locally before debugging the next | retry-backoff / probe ordering | none | likely catch | — | already covered |
| 11 | T | untriaged | S | Notebook shells need a spawned process, not `&` | — | none | thin | — | untriaged |
| 12 | X | untriaged | S | Local hardware already exceeds the borrowed offer | — | none | real | — | answered in prose, no corpus home |

Row 1 vetoes: V1 **checked and it mattered** — `llm-agent/orchestration` holds
exactly 10 children, at `MAX_CHILD_DIRS`. A new subject there would have been
vetoed outright; the finding is a technique inside an existing subject, so it
clears. V2 satisfied by a primary fetched in-run. V4 passes: the whole finding
survives stripping, because the mechanism is about a contract, not a vendor.

Rows 11-12 are **untriaged, not declined** — nobody verified them and they carry
no judgment.

## Landed

- **Technique** `model-routing/admission-is-not-a-tier`: a substitute clears two
  independent gates and only one is ordinal. Capability floors rank tiers;
  admission asks whether the client can address the candidate at all, on three
  surfaces (wire format, identifier, liveness contract), and no amount of
  capability crosses it. Carries the inversion, the loud/silent failure split,
  and the rule that a translator's losses are the substitute's real capability
  profile. Cites `gate-sees-target` — a benchmark run against the candidate's
  own dialect is a check over a proxy that diverges exactly where it matters.
- **Golden-path clause** in `model-routing`, appended to the floors point rather
  than renumbering the spine, so every existing sentence stays true.
- **Application** `rust--admission-is-not-a-tier` (below).

Why a technique and not an amendment: `capability-floors` is ordinal by
construction and cannot express a binary, non-ordinal gate; `failover-path-liveness`
closes with a declared enumeration — "what a substitute must be able to do
before it is eligible is capability-floors" — and the enumeration hunt is what
found the missing member. A mechanism the corpus lacks gets a technique.

## The seam was chosen to falsify, and it refuted the prediction

The falsifying seam was a fleet benchmark engine that **already probes
endpoints** — the one place where this technique was most likely to be
re-derivation. The caught outcome was written first: had the probe covered
admission, the landing would have been withdrawn.

The predicted defect was the liveness surface — the probe caps each rung at 2s
while generation gets 120s, so a runtime loading a large model should have
probed as unreachable while being perfectly usable. **Measured and wrong.**
Known positive fired (a dead origin hit 2.04s, so the timer works); idle rungs
returned 0.00s; rungs taken *during* a 17 GB model load returned 0.03s/0.01s/0.00s
while the concurrent generation completed in 6.9s, so the floor held. The
runtime serves metadata off a path independent of the model loader. A run that
had assumed the defect would have loosened a bound that is doing its job.

What the seam returned instead is better than what it was aimed at. The probe
resolves identity from metadata routes and **never generates**, so "which fields
will this endpoint accept" is answered nowhere before a run — it is discovered
*during* one, by a fallback that catches a bad-request rejection and re-issues
the call schema-less **and non-deterministic**, dropping the pinned temperature
and seed with the schema. The judge path documents determinism as the property
that makes a verdict *a measurement*. So the function whose name promises
determinism can silently stop being deterministic, on a rejection about a field
that has nothing to do with the answer, and the stored row is shaped identically
to one drawn under the pin. The admission failure is loud (stderr); the degraded
contract it leaves behind is silent in the artifact.

That is this run's landing seen from the receiving end, and it was reached by
opening a tree rather than by reading the source — the seam-hunt-as-second-source
rule holding for the fourth run in five.

## The operator's question, answered

**No — not as a fallback for this client, and the hardware makes it moot anyway.**
Three independent reasons, in order of how cheaply they disqualify:

1. **Protocol.** The client accepts three request formats and OpenAI's is not
   one of them; routing it to non-Claude models is unsupported by the vendor.
   Bridging that is a translator on the failover path, not a base-URL setting.
2. **Identifier.** Even behind a translator, a model id without `claude` or
   `anthropic` in it is filtered out of discovery silently.
3. **It is already beaten locally.** A 24 GB card serving a 27B model, with a
   measured agent loop at 3.9s on a 7B, against 2×16 GB of older silicon on a
   weekly quota behind a public unauthenticated URL.

Where the concept *is* usable, and this is the honest half: as an
OpenAI-compatible endpoint for the things in this fleet that already speak that
protocol — the benchmark engine's re-pointable provider, judge arms, batch
classification. For those the local runtime already serves and is faster, so the
borrowed GPU earns its keep only for a model that does not fit in 24 GB but does
fit in 32 — a narrow band, on cards without bf16, split across two devices.

## Leads

- **A failover destination whose lease a third party grants.** Return condition:
  when a second independent source describes borrowed or free-tier compute as a
  *routing* destination rather than as a training convenience. The corpus models
  a substitute's capability and its liveness, not its **tenure** — availability
  that can be withdrawn for reasons the router cannot observe and did not cause.
- **Acceptable-use exposure of borrowed compute.** Deliberately unresolved: the
  provider's terms page is JS-rendered and returned an empty body, and a search
  confirmed only that GPU "abuse or misuse" risks termination and that crypto
  mining is named. **No clause naming tunneling or serving external requests was
  retrieved, so no violation is asserted here.** Return condition: when the AUP
  text is obtainable, or a first-party account reports an enforcement action.
- **The probe/generation timeout asymmetry.** Refuted on this runtime; the shape
  is still real for a runtime that serves metadata from the loading process.
  Return condition: a runtime whose metadata route blocks during a model load.

## Instruments

Gate green at Phase 1 and on this run's own files at Phase 7. `check-bundles`
then reported one failure in `quality-gates/techniques/match-the-resolved-artifact.md`
— an **untracked file belonging to an unclaimed sibling** live in this checkout,
alongside a dozen modified `ui-surfaces` documents that are not this run's. Not
touched, not fixed, and named here rather than absorbed. Because that sibling's
technique is uncommitted, **`index.json` and `catalog.json` were deliberately not
regenerated**: a regeneration would bake their half-written subject into a hash
committed under this run's name. A stale index in a shared checkout is a known
self-correcting state; that is not.

Budget: 2 successful fetches of 3 (both on the client's own gateway docs), 1
fetch that returned an empty body, 1 search. Scratch deleted by run id.

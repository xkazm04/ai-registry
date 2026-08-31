---
layer: application
type: application
subject: voice-io
technique: authored-voice-identity
stack: rust
status: forged
applied: experiment
ab_verdict: better
proof: ab-paired
verified_on: 2026-08-31
verified_against: rust@1.97.1
---

# Authored voice identity in a Rust desktop TTS layer

A desktop companion application runs two local speech engines behind a single
synthesis command. One is a curated-catalog engine — a fixed table of voices,
each resolved from a friendly id to a speaker index in a monolithic model. The
other is an experimental engine whose distinguishing feature, in its own module
documentation, is **zero-shot voice cloning**: dropping a reference recording
into a directory makes its filename a valid voice id.

So the tree ships both specification kinds the technique names as different
objects — `selected` and `cloned` — and it stores them through one channel.

## What the tree confirms

The strongest thing here is a confirmation, and it was not designed as one. The
cloned voice's system of record **is its specification**: the import path
writes the user's reference recording to disk and the voice's identity is that
file's stem. There is no engine-side identifier to go stale, exactly as the
technique predicts — the storage rule fell out of how zero-shot cloning works
rather than from anyone deciding it. The listing also marks a cloned voice with
its own category, so the "a clone and a described voice must be visibly
distinguishable" rule is satisfied at the surface.

Two claims came back weaker than written, and one came back as a hole:

- **The transcript rule was too general and the technique was corrected.** This
  engine is zero-shot: it clones from a reference wav passed as a single
  argument, with no transcript anywhere in its interface. The technique
  originally said a clone's sample is not self-contained; it now says the
  self-containment question is a property of the engine and belongs in the
  capability declaration.
- **The consent record is absent, and the flag that would carry it exists.** The
  import path persists a bare recording named by a user-chosen stem, and the
  listing entry carries three fields — id, name, category. Provenance fields
  stored per cloned voice: **0**. The distinguishing marker is present and the
  record behind it is not, which is the more interesting shape than either
  half alone: nothing failed, so nothing prompted anyone to add it.
- **Identity, not capability, is what the callers branch on.** The engine type's
  `impl` block is **empty** — zero capability predicates — while at least two
  capability facts are recorded in prose doc comments ("the only engine with
  zero-shot voice cloning"; a surface that "supports the local Kokoro engine
  only"). Three call sites outside the adapter module branch on the engine's
  identity.

## The A/B

**Measurable:** whether a caller can ask *what a voice engine accepts* without
naming the engine, and what happens when a new engine arrives.

Both arms are faithful standalone reductions of the tree's own shapes — the
engine enum with its empty `impl`, the synthesis request whose entire voice
channel is one string, and the media-studio guard written as an inequality
against one engine. Arm B adds a specification-kind capability and rewrites the
guard against it. Same probe both arms, same compiler (rustc 1.97.1).

| | Arm A (tree as-is) | Arm B (technique applied) |
| --- | --- | --- |
| capability predicates on the engine type | 0 | 1, exhaustive over (engine × kind) |
| specification kinds expressible in the request | 1 | 3 |
| a third, cloning-capable engine is added | compiles clean; the guard silently rejects it | admitted correctly |
| a fourth engine is added | **compiles clean** | **`error[E0004]: non-exhaustive patterns: (TtsEngineId::FourthEngine, _) not covered`** |

The last row is the result. In arm A a new engine enters the product with its
capabilities undeclared and a surface quietly refusing it, and nothing in the
build says so — the "branch on identity is a defect with a delay fuse" rule,
observed detonating. In arm B the same addition cannot compile until somebody
states what the engine accepts, which converts the omission from a runtime
behaviour into a build error at the moment the knowledge is freshest.

Verdict **better**, on the arm-B compile failure being the desired outcome
rather than a regression.

## What this measurement cannot say

It is an experiment on a reduction, not on the product: it proves the type-level
claim and says nothing about whether the rewrite is worth its cost in the real
tree, where the dispatch also routes concurrency control per engine. No product
code was changed. The consent-record gap above was measured by reading the
import path, not by an arm — it is a structural fact, not a proof.

Return condition for a `code`-mode rerun: the guard rewrite plus the capability
declaration is a small readable diff, and the project's own test suite can see
it. It is unshipped here only because the run's approval named no project tree.

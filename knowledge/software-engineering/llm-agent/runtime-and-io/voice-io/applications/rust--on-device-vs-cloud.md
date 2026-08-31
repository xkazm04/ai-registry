---
layer: application
type: application
subject: voice-io
technique: on-device-vs-cloud
stack: rust
applied: experiment
ab_verdict: better
proof: ab-paired
verified_on: 2026-08-31
---

# The rights axis in a fully-local TTS layer — where a comment is doing a gate's job

The same desktop companion app that supplies this subject's engine-abstraction
application ships **two local speech engines and no cloud engine at all**. On
the matrix's original six axes it is the easy case: nothing leaves the machine,
so residency is settled, offline is free, and the only real trade is footprint
against quality. It is exactly the shape that makes the seventh axis look
unnecessary — and it is where the axis bites hardest.

## The structural fact

`src-tauri/src/companion/tts/pocket.rs:38-40` carries this, as a module doc
comment:

> the prebuilt ONNX export packaged by [the sidecar project] derives from a
> community export that is licensed **non-commercial** — fine for personal use

So the product can install, on the user's own machine, an engine whose outputs
it is not licensed to ship. Every other axis says this engine is excellent: it
is local, it is offline, it is ~190MB quantized, and it is the *only* engine in
the tree that can clone a voice. Rights is the only axis on which it loses, and
it loses decisively.

Where that fact lives is the finding. Counted over the engine layer:

| | count |
| --- | --- |
| installable engines | 2 |
| engines whose license is recorded anywhere | 1 |
| engines whose rights status is queryable as state | **0** |
| surfaces that gate on output rights | **0** |
| capability predicates on the engine type (`impl TtsEngineId {}`) | **0** |

The license is real, correct, and honestly written down — as prose, two files
deep, where no caller and no gate can reach it.

## The accident that is currently protecting the product

The surface that writes a publishable artifact is the Media Studio voiceover
command, and it does in fact refuse the non-commercial engine today —
`src-tauri/src/commands/artist/voiceover.rs:61`:

```rust
if engine != TtsEngineId::Kokoro {
    return Err(AppError::Validation(
        "Media Studio voiceover currently supports the local Kokoro engine only.".into(),
    ));
}
```

**That is the right outcome produced by an unrelated rule.** The guard is about
which engine the surface has been wired for; the rights protection is a side
effect nobody wrote and nobody knows is there. And the obvious next feature —
letting Media Studio use the cloning engine, which is that engine's entire
reason to exist — is implemented by deleting this line. The rights protection
disappears in the same commit, silently, because it was never a rights check.

This is the axis's argument in one file: the license is not a fact that ages
gracefully in a comment, because comments do not participate in the decisions
they describe.

## The A/B

**Measurable:** can a surface that ships an artifact determine whether it is
permitted to, without naming an engine?

Arm A is the tree as-is: it cannot — there is no predicate, and the guard it
does have answers a different question. Arm B is a faithful reduction with
output rights declared on the engine type and the voiceover surface gating on
it (rustc 1.97.1, both arms compiled):

```
B: Kokoro    rights=ShipAllowed   voiceover_ok=true   aloud=spoke locally
B: PocketTts rights=NonCommercial voiceover_ok=false  aloud=spoke locally
```

The second row is the whole amendment in one line, and it demonstrates the
**per-use** rule rather than asserting it: the same engine is refused by the
surface that writes a publishable file and allowed by the surface that only
speaks aloud locally. A per-engine boolean could not express that; a per-use
question can. Arm A cannot ask either version.

Verdict **better**. The arm-B refusal is the correct behaviour and arm A
reaches it only by coincidence.

## What this measurement cannot say

Whether the license note is still accurate. That is the axis's own point — the
weights on disk are byte-identical before and after a re-license, so nothing in
this tree or this measurement can detect a change. The recorded state arm B
adds would need the date it was read, which the reduction does not model.

Return condition for a `code`-mode rerun: adding the rights enum and the
voiceover gate is a small readable diff the project's own suite can see. It is
unshipped here only because the run's approval named no project tree.

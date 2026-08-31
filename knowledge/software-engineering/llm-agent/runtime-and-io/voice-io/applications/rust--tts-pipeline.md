---
layer: application
type: application
subject: voice-io
technique: tts-pipeline
stack: rust
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
verified_on: 2026-08-31
---

# Recording-chain parity in a two-engine local voice catalog — and why nothing here can hear it

This is the simulation half of the same desktop companion tree that supplies
the engine-abstraction and rights applications for this subject. The claim
under test is the catalog amendment: a voice reference resolves to a recording
chain as well as a speaker, and the defect is invisible to any content-based
audition because it is constant across content.

## What the catalog carries

Two catalogs, neither with an acoustic field:

- the curated engine's entry carries eight fields — id, speaker index, display
  name, gender, language code, language label, **grade**, description. `grade`
  is the closest thing to an acoustic hint and it is not one: its own comment
  says it comes from the upstream voice list "so users know which voices had
  the most training data". Training volume is a proxy for how *well* a voice is
  modelled, not for what room it was modelled in.
- the cloning engine's entry carries three — id, name, category.

Acoustic or recording-provenance fields across both: **0**.

## Three cases from the tree, walked under both policies

**Case 1 — the merged picker.** `pocket.rs` builds a single voice list from
"local cloned wavs (sidecar-servable, listed first)" and then the service's own
voices. A voice the user recorded on a laptop microphone in their room is
presented in one flat list beside studio-recorded voices, **ordered by
servability**. Policy A (current): the user auditions the clone alone, it
sounds close and personal, and it is chosen. Policy B: the list groups by
recording provenance and offers the candidate against a previously accepted
render. Predicted divergence: A and B choose the same voice for a solo
companion reply and different voices for anything cut beside another engine's
output. **Falsifier: if no piece ever contains audio from two engines, the case
is void.**

**Case 2 — the grade field as a fitness signal.** Policy A leaves `grade: "A"`
unqualified and a user reads it as "will sound good in my project"; policy B
labels it a training-volume proxy. Predicted divergence: none observable
today — **the shipped catalog contains exactly one voice**, so there is no
choice for the label to influence. The case is presently void by its own
falsifier and returns when a second voice is curated.

**Case 3 — the Media Studio voiceover output.** `commands/artist/voiceover.rs`
writes voiceover files into an output directory, which is the one surface here
producing audio destined for a bed with other audio. Policy A accepts a take on
its content; policy B offers a comparison against the last accepted render.
Predicted divergence: appears only in a piece carrying more than one voiceover.
**Falsifier: single-voiceover pieces, which is the current shape.**

## Verdict: unmeasurable, and the instrument is nameable

One of three cases is live and the other two are void against the tree as it
stands. More importantly, no arm here can be *read*: the tree has no audio
analysis of any kind, and the amendment's central claim — that the artifact is
constant across content and audible only in comparison — is a claim about what
a listener perceives.

The instrument that would settle it: an acoustic-similarity or spectral measure
computed over rendered samples from both engines against a reference bed, plus
one usage fact — whether any produced piece has ever mixed engines. The first
is a harness this tree does not have; the second is a query against usage the
run cannot see. Until both exist this stays a simulation with a named
falsifier, not a verdict.

What the tree *does* confirm, structurally and for free: a catalog that models
a voice as identity plus rate and pitch has no slot in which the objection
could even be recorded, which is the amendment's weaker claim and the one that
needed no instrument.

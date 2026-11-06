---
source: repository (vendor), domain-scoped re-read
kind: vendor repository (design-deep, practitioner-authored) - media-generation / game-production pass
url: https://github.com/jamiepine/voicebox
title: "Voicebox, read for character voice casting: design, clone, direction and licence across nine open engines"
author: jamiepine
commit: 8af7efe62fab8d33e2a5dfbedabaa45f68a5184f
prior_scan: 2026-11-06 - [[2026-11-06-voicebox-v060]]
words: ~2,600 read across 6 backend modules, the profile service, the engine registry and the changelog design entries
extracted: 8
accepted: 1 technique + 1 application + golden-path section
declined: 0
untriaged: 3
already_covered: 5
leads: 2
dispatched: 0
applied: 1
shipped: 1
run_id: intake-voicebox-mg-1106
siblings: 0 at claim, 0 at commit
fetches: 1 of 3
operator_focus: "pof's voice casting is locked to one commercial provider; know-how to replicate the feature set with the source's models and techniques"
rescan_when: "the designed-voice source leaves Unreleased in a tagged release, or the studio adds a design-to-clone step or a per-engine licence field; or 8 weeks elapse (2027-01-01)"
---

# voicebox, re-read for media-generation and game-production: casting without a hosted designer

## Why this pass, and the class

Operator dispatch on the same day as the software-engineering delta
([[2026-11-06-voicebox-v060]]), scoped `--domain media-generation,game-production`
with a stated purpose: the fleet's game-production project (pof) runs voice
casting rounds and takes on one commercial provider only, and the question is
what the source's open models and techniques would let it replicate. Same tree,
same pin (`8af7efe`), re-cloned under this run's id. Class: vendor repository,
design-deep; read here only for the voice-asset half (design, clone, direction,
licence), not the shell or the agent surface the earlier passes mined.

**Prediction stated before triage:** the media-generation voice subjects were
forged on 2026-10-21 and 2026-10-28, and the dialogue pipeline already carries an application against this very fleet project, so
mostly catches; at most one landing, and it would be about what an *open* stack
lacks that a hosted designer provides. **Got:** exactly that - five catches, one
technique.

## Sweep

pof first, because the question is pof's: `docs/research/local-tts-provider-spec.md`
(2026-09-07: no speech provider, the two-axis licence rule),
`games/gtai/voice/casting/CASTING.md` (seven casts, all on the hosted designer,
with the lessons), the 2026-11-03 voice lane report, and the seam code
(`src/lib/voice/castingRound.ts`, `takes.ts`, `design.ts`,
`src/lib/audio-gen/providers/elevenlabs-speech.ts`). Then the source:
`backend/backends/qwen_voice_design_backend.py`, `__init__.py` (the engine
registry), `chatterbox_backend.py`, `chatterbox_turbo_backend.py`,
`backend/services/profiles.py`, and the changelog's design entry.

## The finding

**An open designer has no save step.** The hosted designer pof uses turns a
chosen preview into a stored voice (`createDesignedVoice`, wired as
`TakeDeps.createVoice`, `src/lib/voice/takes.ts:22`). The source's designed
voice is its description, returned as the voice prompt
(`backend/services/profiles.py:616-622`) and re-read by the design model on
every generation (`qwen_voice_design_backend.py:191-201`), with per-line
direction appended into the same prompt (`:193-199`). A seed repeats a line; it
does not hold a person across lines - which the corpus already said
(`design-to-read-parameter-lock`: "it does not make two different lines
consistent, which is the stored voice's job"), on the assumption that a stored
voice exists.

**The primary closes it.** The model family's own README, section "Voice Design
then Clone": design a short reference clip, build a reusable clone prompt from
it, generate new lines from the prompt - "especially useful when you want a
consistent character voice across many lines". Its model table gives
instruction control to the design and preset variants and not to the clone
variant, matching the source's registry flag "Base model drops instruct
silently" (`backend/backends/__init__.py:272`).

**The cost is the direction channel**, read from the source's own catalogue:
the permissive clone engine takes no direction; the second takes only fixed
per-language exaggeration defaults (`chatterbox_backend.py:157-170`); the third
takes inline non-verbal tags and is English-only
(`chatterbox_turbo_backend.py:4`); the one engine with clone + design + free
direction is CC-BY-NC, enforced only by its display label
(`__init__.py:435-439`).

## Triage

| # | Shape | Candidate | Home | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | technique | Freeze the design into a reference: build the save step on a designer without one; the freeze moves direction to the clone engine's channel; migration from a hosted designer | `character-voice-design` (new) | real gap | 3/0/2 | **accept** |
| 2 | catch | Two licence axes on a cloned voice (weights + reference terms) | `game-dialogue-voice-pipeline/cast-ledger-with-consent:42` | likely catch | - | already covered |
| 3 | catch | Weights licence as the axis that can forbid shipping | `voice-io/on-device-vs-cloud:66` | likely catch | - | already covered |
| 4 | catch | A stored voice is an artifact of one engine generation | `multi-speaker-speech-production/voice-asset-model-generation-binding` | likely catch | - | already covered |
| 5 | catch | A described voice's timbre is volatile; keep the rendered sample | `voice-io/authored-voice-identity:41-63` | partial | - | covered; the cross-line half became row 1 |
| 6 | catch | Licence as a field a production can refuse, not a label | `game-production/generative-provider-auditing` (`capability-is-not-registry-membership`, `refuse-with-reason-not-greyed-out`) | likely catch | - | already covered (found by pof's consult hook at commit time, after drafting) |
| 7 | technique | A reference clip's manner is cloned with its timbre: render the freeze neutral, carry range in text or per-register references | inside row 1 | partial | - | folded into row 1 (rule 2 and 4) |
| 8 | lead | Robot treatment: description vs finishing layer | `character-voice-design` golden path vs pof CASTING.md | tension | - | lead 1 |

Row 1: GAIN 2 (new technique, subject not in the scan's top 15) +1 convergence
(the vendor README, the source's registry flags and the corpus's own
`authored-voice-identity` reach the rule independently). RISK 0 (primary
fetched, tree opened; append to a golden path whose existing sentences stay
true - they gain the condition they assumed). COST M. `auto=1/0/0 fp=0`;
rows 2-6 are catches and row 7 was absorbed, so no row was rejected.

**Render proof.** Phase 6b's scope is written for pictures; the 2026-10-24
widening asks a local example of every media-generation technique. The stack is
absent on this machine (no speech weights anywhere; the installed `qwen_tts`
does not import - torchaudio's native library fails to load), and the standing
rule forbids downloading to make a proof pass. Queued as `held`/`media` row
`vbmg-001` in `librarian/harvest/backlog.jsonl` with both arms, the brief (a
real pof cast, Rivet), the instrument (speaker similarity within one embedding
model, a second seed as the floor) and the owner's blind board. The technique
landed on the primary and the tree; **the operator's verdict on `vbmg-001` may
amend or withdraw it**, and that is stated here so the next reader does not
take the landing as rendered. No review page was written: nothing was rendered.

## Phase 7.5 - apply

| technique | project | mode | verdict | note |
| --- | --- | --- | --- | --- |
| freeze-the-design-into-a-reference | pof | simulation | unmeasurable | Three real casts walked under re-design-per-line (A) vs freeze-and-clone (B): Rivet (directed range vs identity), Kerf and Krump (measured pace spread on the hosted designer), King (a model-local seed and a preview under provider terms). Instrument named: `vbmg-001`. The seam is `TakeDeps.createVoice` - pof already isolates the save step as an injected function, so the freeze is a drop-in implementation of it. Knowledge landed in pof's own spec as a dated section; commit `9eb0d425`, not pushed. |

## Leads

1. **Where the machine quality of a voice lives.** The golden path says a
   finishing layer; the fleet's casting record (seven casts) says robot voices
   won only with the synthetic quality in the description. Both may hold - a
   hosted designer renders "synthetic" cleanly enough that the owner accepted it
   - but under a freeze the answer matters more, because a baked treatment is
   cloned into every line. **Return when** `vbmg-001` runs: add a third arm with
   the treatment in the description.
2. **Per-register references as one person.** Rule 4 of the technique (one
   frozen reference per register, checked for mutual speaker similarity) is a
   design, not a measurement. **Return when** a production ships it, or the
   render proof adds a register pair.

## Directions

n/a - pof's scope already names voice casting; the local path is coverage at
existing injected seams, written as knowledge, not proposed as a capability.

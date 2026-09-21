---
layer: application
type: application
subject: brand-voice-capture
technique: voice-maturity-and-retrain-triggers
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Voice maturity and retrain triggers - the twin's voice schema and its three gates

The Czech-first adtech workspace (`systedo-case`, commit
`2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08) stores a business's
voice as a per-scope profile and gates it with three pure, framework-free
modules: a maturity predicate inside the distillation tool, a readiness
scorer, and a retrain nudge. Each is importable under the unit suite without
a store, which is what makes the thresholds reviewed rather than assumed. The
tree confirms the standard on every structural point and supplies the
"unknown is partial, not empty" lesson the technique carries.

## The schema the gates operate on

`src/lib/twin/types.ts:55-70` is the profile shape from
`voice-profile-dimensions` verbatim: `scope: ToneScope`, `directives` ("free-text
style guide, injected verbatim into the draft prompt"), `traits[]`,
`lengthHint`, `constraints: VoiceConstraint[]` with `kind: "do" | "dont"`
(`:47-51`), `examples[]`, `updatedAt`. Scopes are `generic` plus the seven
channels (`:23-30`), and `resolveVoice` at `:233-240` is the own-scope-else-
generic-else-null resolution the technique prescribes. The render side is one
function, `voiceLines` in `src/lib/ai/tools/voice.ts:21-36`: heading,
directives, up to eight traits, the length hint, then `VŽDY:` and `NIKDY:`
lists capped at twelve each, returning `[]` for an undefined voice. Its file
comment (`:5-11`) states the user-prompt-only rule and the one-definition
rule in the technique's own terms.

## Gate one: maturity, inside the distiller

`src/lib/ai/tools/twin-style.ts:167-170`:

```ts
const matureVoice = cleanList(req.samples, 10).length >= 5 || answeredQuestions.size >= 3;
```

The comment above it is the structural argument the technique makes: "forcing
a question every round means the training UI can never reach 'voice fully
trained'". The validator at `:193-203` then does exactly two things - rejects
directives under forty characters unconditionally ("empty or too short -
return 3-6 concrete second-person sentences"), and requires at least one gap
question **only while `!matureVoice`**. The normaliser at `:176-187` mirrors
it: with no model questions, a mature voice gets `[]`, a cold one gets the
canned starters minus those already answered. Five samples, three answers and
forty characters are all bare constants with no study behind them - the
technique labels them convention and the tree agrees by carrying no citation.

## Gate two: readiness, a pure function of stored state

`src/lib/twin/readiness.ts` scores six milestones (`:14`) as
complete/partial/empty with weights 1/0.5/0 (`:33`) and a mean (`:86`).
`TRAINING_STRONG = 5` (`:20`) and `GUARDRAILS_STRONG = 3` (`:22`) are the
material and red-line floors. Three lines prove the technique's honesty
details:

- `:51-53` `hasVoice` - "a voice counts as real only if someone wrote
  directives into it - an empty row created by opening the editor must not
  tick the gate."
- `:76` - the voice milestone is complete on a non-generic voice with
  directives, partial on a generic one: "a per-channel voice beats a single
  generic register."
- `:37-42` and `:68-71` - `offerings: number | null`, where `null` "means the
  catalog read FAILED (unknown), which must not be conflated with an empty
  catalog: an unknown count grounds to `partial`, never the `empty` level that
  reads as 'unconfigured - redo setup'." This is the upward lesson the
  technique's fourth decision rule was written from.

The module header (`:8-10`) states the purity that makes the gates testable:
"Pure: no clock, no storage, no React."

## Gate three: the retrain nudge that is not a penalty

`src/lib/twin/voice-age.ts:17-19` sets `RETRAIN_MARGIN = 5` with the note that
"five is the same bar `TRAINING_STRONG` uses" - the convention is shared, not
independently justified. `shouldNudgeRetrain` (`:102-108`) returns
`factsNewerThanVoice(voice, facts) >= margin`, and `factsNewerThanVoice`
(`:95-96`) counts facts whose `scope` matches and whose `createdAt` is after
the voice's training stamp - per scope, by fact count, never by elapsed
time. The header comment (`:13-14`) is the technique's second "not" verbatim:
"Crucially NOT wired into readiness scoring: the score stays a pure function
of what's been trained, never of what time it is. This is a nudge, not a
penalty." `voiceTrainedAt` (`:26-30`) returns `null` for empty directives or
a stamp before `MIN_REAL_TRAINING_MS` (2015), so the seed's epoch timestamp
reads as never trained rather than trained in 1970, and `voiceAgeFor`
(`:112-126`) returns `nudge: false` for an absent voice.

## What the tree proves and where it stops

Confirmed: the three states exist as distinct branches; maturity relaxes only
the question requirement; readiness reads no clock; the nudge counts facts
per scope; an empty-directives row is absent everywhere; an unreadable input
grades partial. Upward lesson taken into the technique: the `null`-versus-zero
distinction on the catalogue read. Deviation: none of the three constants
carries a rationale beyond "the same bar" - the tree does not claim they are
measured, but it does not say in the code that they are convention either;
the technique does.

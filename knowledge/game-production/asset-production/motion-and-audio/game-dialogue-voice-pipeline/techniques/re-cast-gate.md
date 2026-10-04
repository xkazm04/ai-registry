---
layer: technique
type: technique
subject: game-dialogue-voice-pipeline
technique: re-cast-gate
status: forged
laws: [no-gate-self-certifies, a-verdict-is-bound-to-its-content, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a speech-model release is available and the cast is shipped or in production, a provider retires or replaces a model identifier, deciding whether one voice may move to a new generation]
---

# Re-cast gate

The named concern: moving a shipped or in-production cast from one speech-model generation
to another is a per-voice decision made on evidence, and a release announcement is not
evidence. The gate turns "the new model is better" from a claim into a table with one
verdict per voice.

## Why the version bump is wrong

Three facts about voices make an upgrade a casting event rather than a setting change.
First, a voice is not portable: a clone created under one generation may need retraining on
the next to reach its quality, and providers say so in their own documentation. Second,
capability moves between generations in both directions: a clone type the earlier
generation did not support can appear in the next, and the reverse happens as well, so the
cast the new model can serve is not the cast the old one served. Third, the new model's
strengths (wider emotional range, more languages, different pacing) are behaviours the
existing accepted performances were never judged against, so an improvement in the mean can
be a regression for a particular voice in a particular emotion.

Corroborate these facts against the provider's own model list and clone documentation
before relying on them, in the same way the provider-auditing craft treats every
capability claim: a vendor's statement is an input to the decision, and a marketing
comparison is a lead until your reference lines confirm it.

## Procedure

1. **Freeze the audition set.** Twelve reference lines per voice is enough to be
   informative and small enough to be listened to: chosen once, kept across upgrades, and
   spanning the voice's range in the game (a calm line, a shout, a whisper, a long
   sentence, a short bark, a line with proper nouns and pronunciation-dictionary terms, a
   line in each shipped language that the voice speaks). The set is the instrument; changing
   it invalidates comparison with the last upgrade.
2. **Retrain first where the provider requires it.** A clone that the new generation needs
   retrained is retrained from its recorded reference material, which the ledger must hold;
   if the material or its consent has lapsed, the voice cannot be re-cast, and that is
   recorded as the verdict.
3. **Render the set under both models,** with identical text, identical settings where the
   settings exist in both, identical context, and pinned seeds where offered. Seeds
   narrow variance and do not remove it, so render each cell more than once and keep the
   spread.
4. **Blind triage on a listening board.** The listener does not know which arm is which,
   and the order is randomized per line. The mechanics of judging a take belong to the
   media craft's acceptance board and are not restated here; this technique requires only
   that a listening board be used and that the pipeline that produced the renders not be
   the one to judge them
   ([no gate self-certifies](../../../../_laws.md#no-gate-self-certifies)).
5. **Accept per voice.** Three verdicts: *moves* (new model, all reference lines),
   *stays* (old model, pinned), *cannot be judged* (a voice the new generation cannot
   serve). Record the verdict beside the ledger row with the audition date.
6. **Re-render only the moved voices' lines,** as a catalog-wide job under the catalog
   diff, and re-accept those lines with their new render revision. Voices that stay keep
   their existing takes and their old model identifier, recorded per line.

## The stays branch has a clock

A voice pinned to an older model is a scheduled cost. Providers retire model identifiers,
and a pinned identifier that stops resolving must fail loudly rather than fall back to the
new model, because a silent fallback replaces an accepted performance with an unaudited one
at the worst moment. Record the provider's notice date and the retirement date where they
exist. Before the retirement date, the baked takes for those voices are copied into the
studio's own custody, and a plan exists for runtime lines: re-cast, or re-cast
against a different voice, or drop the class.

## Decision rules

- **When the new model wins on average and loses on a voice, that voice stays.** Pooled
  means assign a voice to a job it is bad at; the verdict is per voice
  ([a verdict is bound to the content it judged](../../../../_laws.md#a-verdict-is-bound-to-its-content)).
- **When a voice moves, its consent scope is re-read,** because retraining creates a
  new model of a person's voice, and the original agreement may not cover it.
- **When the audition set is not run,** the voice's state is *not evaluated on the new
  generation*, and the catalog does not re-render it
  ([unmeasured is not a pass](../../../../_laws.md#unmeasured-is-not-a-pass)).
- **When a release adds a capability the game wants** (more languages, multi-speaker
  rendering), extend the audition set for that capability and treat the claim as a lead
  until a game line demonstrates it. A capability the provider's documentation does not
  describe is not established by a launch page.
- **When the cast is small and unshipped,** run the gate anyway at its cheapest: it is
  cheap while nothing is baked and expensive after.
- **When a model is upgraded by the provider without a new identifier,** the catalog's
  render recipe cannot tell; pin the exact identifier and re-run the set on the provider's
  announced changes.

## When not to use this

- **For a single runtime-only voice with no baked takes and no accepted performance,**
  where the risk of a swap is a quality change that the stall rule and sampling already
  bound. A lighter check (a handful of lines, one listener) suffices.
- **As a benchmark of model families.** Choosing between vendors is the provider-auditing
  arena; this gate compares two generations of one cast.
- **For a change to text only.** That is a script revision handled by the catalog diff,
  with no model change to judge.

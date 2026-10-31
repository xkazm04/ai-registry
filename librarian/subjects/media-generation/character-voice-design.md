---
domain: media-generation
subject: character-voice-design
last_touched: 2026-10-31
touched_by: librarian
dry_streak: 0
---

# character-voice-design

Subject note. Part of [[index]]; graded against [[standard]].

## Architecture review - 2026-10-31

First review, against `984bfc6ea`. All nine documents were read in full. The
vendor-specific claims were checked against the published API schema of one
text-to-voice designer and its product guide. The schema refutes one claim: the
description field is capped at 1,000 characters, not "a few hundred". The schema
also attaches a caveat to the adherence knob that the technique leaves out: high
values "can cause voice to sound artificial or robotic". One internal error was
found: a section headed "The two stages" lists three. The claim that designers
refuse or flatten names of people and characters is not stated in the vendor
material that was read. It stays as written, but is unconfirmed. Both
applications rest on private trees and one owner's session, and none of that was
reopened.

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/character-voice-design",
  "date": "2026-10-31",
  "baseline": "984bfc6ea",
  "digest": "sha256-b2:2e68940ae64367b7",
  "disposition": "clarify",
  "coverage": "All 9 documents (golden path, 6 techniques, 2 applications) read in full. Vendor API schema and product guide read for description and design-text limits, adherence, seed, model enum and preview count. Not evaluated: the private bp tree at either cited commit, the round-B scratch scripts, any rendered audio, and stability-setting behaviour on a current speech model (the official page that described it could no longer be opened).",
  "counterexamples": [
    "A designer that accepts up to 1,000 characters of description and recommends longer, more detailed prompts at lower adherence invalidates 'designers accept a few hundred characters at most' as a hard limit. The 200-400 band survives only as a starting point.",
    "Raising adherence to make candidates follow the description can itself make the voice sound artificial, which looks like a treatment leaking into the timbre when it is a knob setting.",
    "A register-led variant beat the canonical candidate in one round (n = 1). A slate made only of axis variants around the canonical reading would not have offered it.",
    "A constant effect chain hides dropped words between takes, so a treated board can pass a take the clean board would fail."
  ],
  "sources": [
    {
      "url": "https://api.elevenlabs.io/openapi.json",
      "result": "VoiceDesignRequestModel: voice_description minLength 20, maxLength 1000; text 'has to be between 100 and 1000'; guidance_scale 0-100, default 5, 'High numbers can cause voice to sound artificial or robotic. We recommend to use longer, more detailed prompts at lower Guidance Scale.'; seed 'Same seed with same inputs produces same voice'; model_id enum eleven_multilingual_ttv_v2, eleven_ttv_v3. This refutes 'a few hundred characters at most', confirms the design-text minimum of about 100, and supports the eleven_ttv_v3 and seed facts the applications cite."
    },
    {
      "url": "https://elevenlabs.io/docs/eleven-creative/voices/voice-design.md",
      "result": "'we'll generate three voice options for you'. 'longer preview texts tend to produce more stable and expressive results'. Supports 'several previews per call' and holding a substantial design text. It says nothing about naming real people or characters, so the refusal claim is unconfirmed by this source."
    },
    {
      "url": "https://elevenlabs.io/docs/best-practices/prompting",
      "result": "The current page no longer documents v3 stability presets. Search summaries quote the earlier text ('Robust ... reduces responsiveness to directional prompts'), but that page was not opened. The stability trade-off in design-to-read-parameter-lock stays as written and unconfirmed this run."
    }
  ],
  "documents": {
    "character-voice-design.md": {
      "disposition": "keep",
      "reason": "Coherent chain (brief, description, audition, slate, lock, treatment) with clean seams to its four neighbours. Counts agree with the techniques (3-6 lines of 5-10 s, about ten candidates). The 'designer refuses or flattens such names' sentence is unconfirmed by the vendor material read. The likeness argument does not depend on it, so it is not owed as a change."
    },
    "techniques/character-vocal-brief.md": {
      "disposition": "keep",
      "reason": "The three-carrier table and its decision rules are internally consistent and match the round-B application's brief. No vendor-unstable claims."
    },
    "techniques/voice-description-composition.md": {
      "disposition": "clarify",
      "reason": "(1) 'designers accept a few hundred characters at most' is refuted by the schema (maxLength 1000). Restate it and present the 200-400 band as a starting point, not a cap, since the vendor recommends longer prompts at lower adherence. (2) The adherence knob needs the vendor caveat that high values can make the voice sound artificial. The 'designers refuse or ignore' names claim is unconfirmed but left alone."
    },
    "techniques/audition-line-set.md": {
      "disposition": "keep",
      "reason": "Shape and decision rules are consistent with the golden path. Round B's 5-12 s lines sit at the technique's stated stamina edge, not past it."
    },
    "techniques/casting-slate-spread.md": {
      "disposition": "keep",
      "reason": "Canonical-plus-axis-plus-register-led design matches both applications. The register-led slot is honestly sourced to one n = 1 round."
    },
    "techniques/design-to-read-parameter-lock.md": {
      "disposition": "clarify",
      "reason": "The heading 'The two stages' introduces three numbered stages (design, save, read). The stability trade-off is plausible and corroborated only by search summaries, so it is left unchanged."
    },
    "techniques/finishing-effect-layer.md": {
      "disposition": "keep",
      "reason": "The chains are explicitly starting points. The telephone band of roughly 300 Hz-3.4 kHz is standard. The mask-take-variance rule is consistent with the node application's upward lesson."
    },
    "applications/node--design-to-read-parameter-lock.md": {
      "disposition": "reverify",
      "reason": "Anchors at 672bc7a and the fix at b493fcf are in a private tree that was not reopened. The model, seed and guidance values agree with the process application and with the vendor model enum. verified_on is not refreshed."
    },
    "applications/process--casting-slate-spread.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (10 voices x 5 lines + 10 design reads = 60 renders; Round A matches the node application). Round B is a dated session observation with no anchor, and Round A's anchors are private. Nothing was re-run."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied both clarify items from the record above. The description cap and
adherence caveat follow the vendor schema opened this run, and the heading now
counts its three stages. Applications are untouched and keep `reverify`, which
is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/character-voice-design",
  "date": "2026-10-31",
  "baseline": "984bfc6ea",
  "digest": "sha256-b2:f38dd7d975bd4ce2",
  "disposition": "reverify",
  "coverage": "All 9 documents decided. The two clarify items from the first 2026-10-31 record were applied, and the edited passages re-read. The vendor schema was opened this run and is the basis for the description-length and adherence edits. The heading fix is an internal count. Other documents are byte-unchanged and keep their dispositions. No private tree or rendered audio was reopened, and no verification date was refreshed.",
  "counterexamples": [
    "A designer that accepts up to 1,000 characters of description and recommends longer, more detailed prompts at lower adherence invalidates 'designers accept a few hundred characters at most' as a hard limit. The 200-400 band survives only as a starting point.",
    "Raising adherence to make candidates follow the description can itself make the voice sound artificial, which looks like a treatment leaking into the timbre when it is a knob setting.",
    "A register-led variant beat the canonical candidate in one round (n = 1). A slate made only of axis variants around the canonical reading would not have offered it.",
    "A constant effect chain hides dropped words between takes, so a treated board can pass a take the clean board would fail."
  ],
  "sources": [
    {
      "url": "https://api.elevenlabs.io/openapi.json",
      "result": "VoiceDesignRequestModel: voice_description minLength 20, maxLength 1000; text 'has to be between 100 and 1000'; guidance_scale 0-100, default 5, 'High numbers can cause voice to sound artificial or robotic. We recommend to use longer, more detailed prompts at lower Guidance Scale.'; seed 'Same seed with same inputs produces same voice'; model_id enum eleven_multilingual_ttv_v2, eleven_ttv_v3. This refutes 'a few hundred characters at most', confirms the design-text minimum of about 100, and supports the eleven_ttv_v3 and seed facts the applications cite."
    },
    {
      "url": "https://elevenlabs.io/docs/eleven-creative/voices/voice-design.md",
      "result": "'we'll generate three voice options for you'. 'longer preview texts tend to produce more stable and expressive results'. Supports 'several previews per call' and holding a substantial design text. It says nothing about naming real people or characters, so the refusal claim is unconfirmed by this source."
    },
    {
      "url": "https://elevenlabs.io/docs/best-practices/prompting",
      "result": "The current page no longer documents v3 stability presets. Search summaries quote the earlier text ('Robust ... reduces responsiveness to directional prompts'), but that page was not opened. The stability trade-off in design-to-read-parameter-lock stays as written and unconfirmed this run."
    }
  ],
  "documents": {
    "character-voice-design.md": {
      "disposition": "keep",
      "reason": "Coherent chain (brief, description, audition, slate, lock, treatment) with clean seams to its four neighbours. Counts agree with the techniques (3-6 lines of 5-10 s, about ten candidates). The 'designer refuses or flattens such names' sentence is unconfirmed by the vendor material read. The likeness argument does not depend on it, so it is not owed as a change."
    },
    "techniques/character-vocal-brief.md": {
      "disposition": "keep",
      "reason": "The three-carrier table and its decision rules are internally consistent and match the round-B application's brief. No vendor-unstable claims."
    },
    "techniques/voice-description-composition.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'designers accept a few hundred characters at most' -> 'one widely used designer caps it at 1,000 characters'; the 200-400 band is now 'a useful starting band, not a limit', with the vendor's longer-prompt-at-lower-adherence pairing; added that high adherence can itself make the voice sound artificial. The 'designers refuse or ignore' names claim remains unconfirmed and unchanged."
    },
    "techniques/audition-line-set.md": {
      "disposition": "keep",
      "reason": "Shape and decision rules are consistent with the golden path. Round B's 5-12 s lines sit at the technique's stated stamina edge, not past it."
    },
    "techniques/casting-slate-spread.md": {
      "disposition": "keep",
      "reason": "Canonical-plus-axis-plus-register-led design matches both applications. The register-led slot is honestly sourced to one n = 1 round."
    },
    "techniques/design-to-read-parameter-lock.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: heading 'The two stages' -> 'The three stages' to match the three numbered stages. The stability trade-off is still corroborated only by search summaries and is unchanged."
    },
    "techniques/finishing-effect-layer.md": {
      "disposition": "keep",
      "reason": "The chains are explicitly starting points. The telephone band of roughly 300 Hz-3.4 kHz is standard. The mask-take-variance rule is consistent with the node application's upward lesson."
    },
    "applications/node--design-to-read-parameter-lock.md": {
      "disposition": "reverify",
      "reason": "Anchors at 672bc7a and the fix at b493fcf are in a private tree that was not reopened. The model, seed and guidance values agree with the process application and with the vendor model enum. verified_on is not refreshed."
    },
    "applications/process--casting-slate-spread.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (10 voices x 5 lines + 10 design reads = 60 renders; Round A matches the node application). Round B is a dated session observation with no anchor, and Round A's anchors are private. Nothing was re-run."
    }
  }
}
```

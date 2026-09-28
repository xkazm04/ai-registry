---
layer: application
type: application
subject: blind-screening-and-redaction
technique: fail-closed-on-an-unmaskable-document
stack: process
verified_on: 2026-09-26
---

# Refusing the upload, and the three honest states (Python pipeline)

## The refusal, enforced at the send

`pipeline/jobfit/gemini.py:708-727` is the fail-closed boundary, and its comment
records the incident that produced it:

> `blind_text is None` means blind was OFF (upload the file for full fidelity).
> A NON-None but empty/blank value means blind was REQUESTED but the CV couldn't
> be text-extracted (encrypted/scanned/unsupported PDF) — falling back to the file
> upload here would send the original name/contact/photo to the model and defeat
> blind mode entirely. FAIL CLOSED rather than leak: the previous code collapsed
> both cases to `blind = False` and silently uploaded the file.

Two design points the standard calls for are visible here. First, **the check
lives at the send**, not at the caller. `blind_requested = blind_text is not
None` (`:718`) distinguishes "not asked for" from "asked for and unavailable" at
the one place that could actually transmit the original. Second, the refusal is
**typed**. It raises `GeminiError` with `subtype="blind_unavailable"`, one of
the module's closed set of failure subtypes (`:52`), mapped to an
invalid-input code the route can render (`:65`). Its message names the likely
cause (an encrypted, scanned or unsupported document) and states the only safe
way forward: "Disable blind screening for this CV to proceed".

The blind prompt clause at `:728-731` closes the other half. The assessor is
told the identity has been redacted to placeholders, instructed "do NOT infer or
guess any redacted identity", and required to "set profile.name to null". Blind
mode also switches the CV from an attached file to an inline text block, which
is what removes the photo without any pattern for it. The send at `:820` passes
`file=None if blind`.

## What channel substitution costs

Moving the CV from an attachment into the prompt makes it prompt text. A CV
could then carry a marker that closes its own block and addresses the model as
instructions. Commit `b64e23f82` fenced the blind block: the redacted text is
capped, then passed through `defuse_fence_markers` between
`<<<CV_TEXT_BEGIN>>>` and `<<<CV_TEXT_END>>>` (`:780-792`). The comment accepts
the cosmetic cost that a pasted `>>>` comes back spaced out. The substitution
that removes the photo is also the one that opens the injection surface, so the
fence is part of the blind path, not an add-on.

## The three states, spelled differently

`pipeline/jobfit/pipeline.py:178-228` is the clearest realization of the
three-outcome rule in the repo. There is one branch per state, and each now
emits a coded `Finding` with a severity and a scope, not free prose:

- **Masked** (`:188-199`). Text was redacted *and* `redaction.name_detected` is
  true: "Blind screening active — identity redacted before scoring
  (<categories>)." It is coded `blind_redaction_applied`, severity `ok`.
- **Partially masked** (`:201-217`). Text was redacted but no name was found.
  The comment is the craft: "NEVER claim 'identity redacted' here — that is a
  false fairness/compliance statement." The note reads "Blind screening PARTIAL
  — no candidate name detected to redact (redacted: …); the name may have
  reached the model. Verify manually." It is coded `blind_redaction_partial`,
  severity `warn`. The comment also names the second misreading it prevents:
  the recruiter would otherwise read the missing name as "anonymous candidate"
  rather than "redaction miss".
- **Refused** (`:218-228`). Nothing extractable: "Blind screening could not
  run: no extractable text to redact … Analysis halted to avoid sending the
  original file to the model." It is coded `blind_redaction_unavailable`,
  severity `blocker`.

The guard on the first branch is the load-bearing part: the note is emitted only
when there is redacted text *and* a name was found, so the claim can never
outrun the mask. The guard is only as good as the detector behind it. Until
2026-08-22 a section header detected as the name satisfied it. See the
inventory application.

## The refusal, stated before the run

Since `fde5c76e5` (2026-09-23), the refusal also arrives before anything is
sent. `app/features/tools/analyze/AnalyzeReadabilityStrip.tsx` renders a
per-file text check above the Analyze button. A CV with no text layer in blind
mode is a `block` row, "No text layer: blind screening cannot redact it". The
run is held with two remedies: "Run without blind screening", or remove that
file (`:60-120`). The header comment keeps the order right: "The engine's own
fail-closed refusal is untouched: this is an earlier copy of it, never a
replacement." The refusal now routes to a decision instead of surfacing as a
failed run.

## Where the standard is not met

- **The route is improvised per case, not chosen by policy.** The preflight
  remedies go to whoever is at the keyboard at the moment of the run. There is
  no named reviewer and no candidate-facing request for another format.
  "Run without blind screening" produces an ordinary non-blind analysis, and
  nothing in it records that a blind run was requested and refused. It is
  correctly labelled unblinded, but invisible as a refusal.
- **No out-of-vocabulary language refusal.** A document outside English and
  Czech gets its gendered and age markers matched with the wrong vocabulary and
  proceeds as a full "masked" state. The standard escalates instead.
- **The refusal is coded but not counted.** `blind_redaction_unavailable` makes
  a refusal machine-readable, but nothing aggregates a refusal rate over time,
  so a redactor or intake regression that raises it stays invisible.

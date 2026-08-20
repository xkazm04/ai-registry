---
layer: application
type: application
subject: blind-screening-and-redaction
technique: fail-closed-on-an-unmaskable-document
stack: process
---

# Refusing the upload, and the three honest states (Python pipeline)

## The refusal, enforced at the send

`pipeline/jobfit/gemini.py:528-548` is the fail-closed boundary, and its comment
records the incident that produced it:

> `blind_text is None` means blind was OFF (upload the file for full fidelity).
> A NON-None but empty/blank value means blind was REQUESTED but the CV couldn't
> be text-extracted (encrypted/scanned/unsupported PDF) — falling back to the
> file upload here would send the original name/contact/photo to the model and
> defeat blind mode entirely. FAIL CLOSED rather than leak: the previous code
> collapsed both cases to `blind = False` and silently uploaded the file.

Two design points the standard calls for are visible here. First, **the check
lives at the send**, not at the caller: `blind_requested = blind_text is not
None` distinguishes "not asked for" from "asked for and unavailable" at the one
place that could actually transmit the original. Second, the refusal is a raised
`RuntimeError` with a *typed, actionable* message — it names the likely cause
(encrypted, scanned, or unsupported document) and states the only safe way
forward ("Disable blind screening for this CV to proceed") rather than emitting a
generic failure.

The blind prompt clause at `gemini.py:549-556` closes the other half — the
assessor is told the identity has been redacted to placeholders, instructed "do
NOT infer or guess any redacted identity", and required to "set `profile.name` to
null". Blind mode also switches the CV from an attached file to an inline text
block (`:582-590`), which is what removes the photo without any pattern for it.

## The three states, spelled differently

`pipeline/jobfit/pipeline.py:142-169` is the clearest realization of the
three-outcome rule in the repo. One branch per state, each with its own
recruiter-visible note:

- **Masked** (`:150-153`) — text was redacted *and* `redaction.name_detected` is
  true: "Blind screening active — identity redacted before scoring
  (<categories>)."
- **Partially masked** (`:154-168`) — text was redacted but no name was found.
  The comment is the craft: "NEVER claim 'identity redacted' here — that is a
  false fairness/compliance statement." The note instead reads "Blind screening
  PARTIAL — no candidate name detected to redact (redacted: …); the name may have
  reached the model. Verify manually." It also names the second misreading it
  prevents — that the recruiter would otherwise read the missing name as
  "anonymous candidate" rather than "redaction miss".
- **Refused** (`:169-174`) — nothing extractable: "Blind screening could not run:
  no extractable text to redact … Analysis halted to avoid sending the original
  file to the model."

The guard on the first branch is the load-bearing part: the note is emitted only
when there is redacted text *and* a name was actually found, so the claim can
never outrun the mask.

## Where the standard is not met

- **The refusal parks rather than routes.** The raised error halts the analysis;
  there is no defined human-review fallback or candidate-facing path, so an
  unmaskable document depends on someone noticing the failed run. The standard
  requires the application to keep moving on an identified human path.
- **No out-of-vocabulary language refusal.** A document in a language outside the
  two the patterns cover is masked with the wrong vocabulary and proceeds as a
  full "masked" state; the standard escalates instead.
- **The refusal is not counted.** Nothing tracks a refusal rate over time, so a
  redactor or intake regression that raises it stays invisible.

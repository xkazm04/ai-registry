---
layer: application
type: application
subject: multi-speaker-speech-production
technique: chunk-boundary-continuity
stack: process
status: forged
verified_on: 2026-10-21
refresh_by: 2027-01-21
---

# Field read: one engine family's limits and dialect, October 2026

Not a code tree: a dated reading of one speech vendor's public documentation (models overview,
best-practices page, the newest model's page, the request-stitching guide, the pronunciation
dictionary guide, and the text-to-speech and text-to-dialogue API references), made to check the
numbers the techniques refuse to hard-code. First read on 2026-10-14; re-read on 2026-10-21 from
each page's raw markdown, which corrected one statement and added three. Every figure below is the
vendor's statement on the read date, with no sample behind it, and is expected to move; the
techniques' rules do not depend on any of it.

## What the read confirmed

- **Caps are per model and differ by generation.** Single-voice per-request limits were listed as
  5,000 characters for the previous flagship (`eleven_v3`), 10,000 for the newest (`eleven_v4`),
  10,000 for the older multilingual model and 30,000-40,000 for the fast models. A real-time
  variant of the newest generation (`eleven_v4_turbo`) is listed with no published cap. This
  supports reading the cap from the model list rather than from the script tooling.
- **Continuity inputs are bounded and cancel each other.** Preceding and following request
  identifiers accept at most 3 each; when both an identifier list and text are sent, the text is
  ignored. The documents advise the same model across generations. Zero-retention mode disables
  request stitching and is limited to enterprise accounts.
- **Seed is best effort.** Both reference pages say deterministic sampling is attempted and not
  guaranteed, which is why the identity check opens with ten takes and not a seed.
- **The pause markup is gone on the newest generations.** The best-practices page states
  "Eleven v4 and Eleven v3 do not support SSML break tags"; the newest model's page adds that SSML
  is not supported there at all. Delivery tags are documented for both.

## What the 2026-10-21 re-read changed

- **Per-turn timing is documented.** The 2026-10-14 read said no per-turn timing was documented for
  the multi-voice endpoint. That is wrong as of this read: a with-timestamps variant returns
  `voice_segments`, each with start and end seconds, character offsets and a
  `dialogue_input_index` described as the "Line of the dialogue (script) that this segment is a
  part of", plus a per-character alignment. A streaming variant exists too. This is the evidence
  for the golden path's per-turn segments paragraph. Replacing one turn is still undocumented.
- **Request stitching has an expiry and a gap.** The stitching guide says "Request stitching is not
  available for the `eleven_v3` model" and "The request IDs should be no older than two hours." So
  the expressive previous flagship gets no continuity from request identifiers, and a re-render made
  more than two hours after its neighbours cannot use theirs. Text context has no such limit. The
  multi-voice endpoint now also takes preceding request identifiers, up to 3, "Not supported by
  every model".
- **Professional clones on the two newest generations.** The best-practices page says clones "are
  not fully optimized for Eleven v3, resulting in potentially lower clone quality"; the newest
  model's page says they "are fully supported in Eleven v4". An existing clone is fine-tuned onto
  the newest generation only when its owner starts it from the voice list; automatic training
  covers three older models. The newest model's page states the binding technique's premise in
  the vendor's own words: a clone on the newest generation "may sound quite different from its
  Eleven v3 version". The same page adds a Clone Strength setting for professional clones and
  says "Style and Speed sliders are not available in Eleven v4", so the settings that belong in a
  render key change between generations as well.
- **Phoneme rules depend on the mechanism.** The dictionary guide says "Pronunciation dictionary
  phoneme tags only work with eleven_v4, eleven_flash_v2 and eleven_v3 models. Other models skip
  dictionary phoneme tags and use the default pronunciation." The best-practices page says inline
  phoneme tags "are only compatible with the `eleven_flash_v2` model" and that the newest
  generation reads IPA wrapped in slashes. The pages do not reconcile the two; read each mechanism
  from its own page.

## Multi-voice endpoint, both reads

- It takes a list of turns, each with a voice, up to 10 unique voices per request, and returns one
  audio file. The documents do not describe replacing a single turn, and the free regeneration
  offered in the product UI covers only identical content. This is the evidence for the golden
  path's call-is-the-address section.
- Its reliable length is lower than the single-voice cap. The vendor advises keeping the total text
  of a call at or below 2,000 characters, with longer requests ending early in streaming or failing
  validation. So the pinned cap is per call type.
- Its text context inputs are shorter: preceding text and following text (the field is
  `future_text`) are limited to 100 characters each.
- Pronunciation dictionaries are supported on it, up to 3 locators applied in order, with the latest
  version used when none is named. The lexicon technique's version pinning therefore has to name a
  version explicitly.

## Not evaluated

Whether a grouped call holds a speaker steadier than separate calls, whether a single-turn render
spliced at a returned segment boundary passes a seam audit, and whether the delivery tags are
followed on the production's own voices were not measured. All three remain unmeasured, not
passed. The newest generation's release date is not on the pages read.

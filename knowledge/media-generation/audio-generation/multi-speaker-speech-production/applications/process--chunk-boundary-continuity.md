---
layer: application
type: application
subject: multi-speaker-speech-production
technique: chunk-boundary-continuity
stack: process
status: forged
verified_on: 2026-10-14
refresh_by: 2027-01-14
---

# Field read: one engine family's limits and dialect, October 2026

Not a code tree: a dated reading of one speech vendor's public documentation (models overview,
best-practices page, text-to-speech and text-to-dialogue API references), made to check the numbers
the techniques refuse to hard-code. Every figure below is the vendor's statement on the read date,
with no sample behind it, and is expected to move; the techniques' rules do not depend on any of it.

## What the read confirmed

- **Caps are per model and differ by generation.** Single-voice per-request limits were listed as
  5,000 characters for the previous flagship, 10,000 for the newest, 10,000 for the older multilingual
  model and 30,000-40,000 for the fast models. This supports reading the cap from the model list
  rather than from the script tooling.
- **Continuity inputs are bounded and cancel each other.** Preceding and following request
  identifiers accept at most 3 each; when both an identifier list and text are sent, the text is
  ignored. The documents advise the same model across generations. Zero-retention mode disables
  request stitching and is limited to enterprise accounts.
- **Seed is best effort.** Both reference pages say deterministic sampling is attempted and not
  guaranteed, which is why the identity check opens with ten takes and not a seed.
- **The pause markup is gone on the newest generations.** The best-practices page states that the
  two newest generations do not support the break tag. Delivery tags are documented for them.

## What the read added

- **A multi-voice endpoint exists.** It takes a list of turns, each with a voice, up to 10 unique
  voices per request, and returns one audio file. The documents do not describe replacing a single
  turn, and the free regeneration offered in the product UI covers only identical content. This is
  the evidence for the golden path's call-is-the-address section.
- **Its reliable length is lower than the single-voice cap.** The vendor advises keeping the total
  text of a call at or below 2,000 characters, with longer requests ending early in streaming or
  failing validation. So the pinned cap is per call type.
- **Its context inputs are shorter.** Preceding and following text are limited to 100 characters
  each on this endpoint.
- **Pronunciation dictionaries are supported on it**, up to 3 locators applied in order, with the
  latest version used when none is named. The lexicon technique's version pinning therefore has to
  name a version explicitly.
- **No per-turn timing is documented** on the reference page; a production that needs line offsets
  must derive them, which is a gap to measure rather than assume.

## Not evaluated

Whether a grouped call holds a speaker steadier than separate calls, and whether the delivery tags
are followed on the production's own voices, were not measured. Both remain unmeasured, not passed.

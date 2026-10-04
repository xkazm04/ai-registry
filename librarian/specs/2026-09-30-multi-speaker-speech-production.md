# XL spec - `multi-speaker-speech-production`

- **Run:** `in-el-0930` (intake of a speech-model release announcement, 2026-09-28 release, plus the vendor's
  model and changelog documents fetched in-run, plus fleet code read in five consuming trees).
- **Source that surfaced the gap:** vendor release page (class: vendor release announcement). It
  **originates** the subject and authorizes nothing in it: every technique is corroborated from primary vendor
  documents fetched by the drafter, from the connected trees named below, or from training-data convergence
  with the stated boundary. Vendor claims (identity stable across regenerations, tag following "more
  reliable") are n=0 marketing measurements and must be written as *claims to verify on the listening
  board*, never as facts.
- **Status:** PROPOSED

## Why XL

Five design candidates share one home. The corpus owns speech *acceptance* (`generated-speech-acceptance`),
speech *delivery direction* (`creator-voice-and-tone/spoken-delivery-direction`), speech *engine* plumbing
(`voice-io`, software-engineering) and *identity* of one authored voice (`authored-voice-identity`). It owns
nothing about producing a **multi-speaker script of any length as a set of separately re-renderable lines**.
`research-map` on "audio tags emotion direction", "voice cloning consent" and "audio narration production"
returned only slug neighbours; the drafter must read each and state why none models these forces.

## Placement (verified against the authority)

`knowledge/media-generation/taxonomy.json` is the authority (`layout: "nested"`). Category `audio-generation`
holds 4 subjects (`generated-music-acceptance, generated-speech-acceptance, music-prompt-composition,
sound-effect-generation`); `MAX_CHILD_DIRS` is 10, so one more fits.

- Resulting path: `knowledge/media-generation/audio-generation/multi-speaker-speech-production/`.
- Append the slug to that category's `subjects` array in `taxonomy.json`. Append, do not reorder.
- Verify link depth to `_laws.md` against a sibling subject in the same category, do not compute it.

## Proposed techniques (each must carry a decision rule)

1. `line-addressed-re-render` - a script is a list of addressed lines, not a blob; a revision re-renders only
   the changed lines. Rule: the unit of regeneration is the line, and this is only safe when the engine holds
   speaker identity across re-renders - so the technique opens with the *check* (render one line ten times,
   listening board, count identity breaks) and states the fallback (re-render the whole scene) when identity
   does not hold. The vendor claims it holds; the technique refuses to take that on trust.
2. `chunk-boundary-continuity` - long scripts exceed a single-generation character limit (10,000 for the
   newest model, 5,000 for the previous one). Rule: cut at speaker turns, never mid-sentence, and carry
   preceding context into the next chunk instead of re-priming; audit the seam, not the chunk. Distinguish the
   engine's continuity mechanism from concatenating files.
3. `voice-asset-model-generation-binding` - a cloned or designed voice is an artifact of one model
   generation. Vendor facts to cite from primaries: professional clones were unsupported on the previous
   generation and pre-existing clones must be retrained for the newest. Rule: a model upgrade is a voice
   re-cast event with an acceptance pass per voice, and the upgrade is gated on that pass, never on the id
   changing. Read authored-voice-identity first and state the boundary (that one owns one voice's
   description; this owns the asset lifecycle across engine generations).
4. `inline-direction-dialect` - direction is written into the script as bracketed tags. Rule: tags are an
   engine dialect (unknown tags are read aloud or ignored; markup that worked on one generation is *disabled*
   on the next - the vendor's own FAQ says the break tag is disabled in the newest model). Keep the script in a
   neutral direction vocabulary and compile to the engine's dialect at render; pin the compiled output per
   model generation. Read speech-ready-text and spoken-delivery-direction and state the boundary.
5. `world-lexicon-as-pronunciation-dictionary` - invented names, acronyms and technical terms are pronounced
   by a dictionary that is versioned with the script, not by hoping. Rule: every proper noun that appears in
   two or more lines enters the lexicon once; a lexicon change triggers re-render of exactly the lines that
   contain the term (composes with technique 1).

## Boundaries this subject must state and must NOT absorb

- `generated-speech-acceptance` owns *grading* a rendered clip (round-trip intelligibility, listening board).
  This subject owns *producing* it as re-renderable units; it cites the board as its check, never restates it.
- `spoken-delivery-direction` owns how direction is *written* for a human-sounding read; technique 4 owns how
  it survives an engine change.
- `voice-io` (software-engineering) owns the runtime speak path of a product. This subject is offline
  production of authored content. State in the golden path's opening which side of the line each falls on.
- Consent for a cloned voice: state it as a precondition of technique 3 in one paragraph. It is not a
  technique here.

## Trees to reconcile read-only (never edit)

Fleet projects that render scripted narration through the vendor: two story tools (narration routes with
per-line generation and a voice-clone route), one editor with an audio-narration panel, one streaming
narration route with a hash cache keyed on text and voice. Read how each addresses a line, what invalidates a
cached render, and where a model id is pinned. Applications are written only for what the drafter opens.

## Primaries (the drafter's web budget, ~6 fetches)

The vendor's text-to-speech best-practices page, its model list, its audio-tag documentation, its
context-continuity (request stitching) documentation, and its pronunciation-dictionary documentation. Prefer
the vendor documents over commentary.

## Open questions the drafter decides, not discovers

- Does technique 5 belong here or in `speech-ready-text`? (Default: here, because its trigger is a script
  revision, not a text-normalization pass.)
- Whether 1 and 2 are one technique. (Default: two; one is about revision, the other about length.)
- Where the identity-stability *measurement* protocol lives. (Default: technique 1, ten renders of one line.)

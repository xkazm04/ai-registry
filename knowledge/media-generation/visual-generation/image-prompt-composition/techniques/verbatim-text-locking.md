---
layer: technique
type: technique
subject: image-prompt-composition
technique: verbatim-text-locking
status: forged
laws: [checkability-routes-the-pixel, unmeasured-is-not-pass]
shared_with: []
use_when:
  - the model, not a compositor, must set text inside the image
  - generating typography posters, packaging, interface mockups or documents where the words are the artwork
  - generated text comes back misspelled, invented, or as placeholder strings
  - deciding what to proofread before a text-bearing render is accepted
---

# Verbatim text locking

The subject's architecture rule sends every checkable glyph to a compositing
layer, and for a factual plate that rule is absolute. But the golden path
names the other architecture in one sentence: a pipeline with no compositing
layer may let a typography-capable model set text, and *it then owns
per-character proofreading*. This technique is that ownership, written out.
It applies wherever the text **is** the artwork — a headline poster where
letterforms are the main visual, a package face, an interface screen, a
book spread — and wherever a pipeline has decided, knowingly, that the
model renders words.

The failure it prevents has a signature that repeats across hundreds of
community cases on text-capable models: the model treats any unspecified
text slot as an invitation. Asked for "a poster for a running event", it
invents a title, a date, a sponsor line and a slogan, all plausible and all
wrong; asked for "a social post", it fills the body with lorem-ipsum-shaped
strings or a script that is not the one requested. The vendors' own guides
concede the second half — placement and clarity "can still struggle" — and
offer no method for the first. The method is a contract.

## The contract

1. **Every string that must appear is written verbatim, in quotation
   marks, in the language and script it must render in.** Not "a title
   about the marathon" — the title. Not "some engagement numbers" — the
   numbers. Quoting is the discriminator the model uses between *describe*
   and *render*; unquoted text-adjacent language produces unpredictable
   glyphs.
2. **The set of strings is closed, and the prompt says so.** "The only
   text in the image is the strings above; no other words, labels,
   watermarks, or placeholder text anywhere." On models without a negative
   channel this is the exclusion's only home, and it is phrased
   positively for the same reason the subject's negative-prompting
   technique folds exclusions into prose on distilled models: the
   contract must ship unchanged to every vendor.
3. **Each string gets a role and a position, like a colour gets a role.**
   Headline, subhead, body, caption, button label, footer — with where it
   sits and roughly how large. A listed string with no role is re-cast per
   image, exactly as a listed colour is. For interface screens this means
   naming every visible label: status bar, tabs, action row, comment text,
   counts.
4. **When the text is the subject, say that the letters are the
   composition.** "The title is the main visual; the illustration is
   embedded in, occludes, or passes through the letterforms; single
   poster, one composition, not a board of variants." Without the first
   clause the image treats the words as a caption; without the last, an
   instruction-following model helpfully returns a sheet of options.
5. **Unusual formats go first.** An aspect ratio or a screen shape outside
   the phone-and-landscape defaults is stated before anything else, or
   the model's framing prior wins and the text layout is designed for the
   wrong canvas.
6. **Proofread per character, as a gate, not a glance.** Every string in
   the contract is compared to the render character by character — a
   vision model can do the read, a human does the verdict on anything
   marginal. One wrong or extra glyph is an unconditional fail, graded as
   such: the render is edited or regenerated, never shipped with a note.
   Per [unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass),
   a text-bearing render nobody proofread is not a pass; it is unmeasured.

## Decision rules

- **When a viewer could check a string against a fact, this technique does
  not apply — route it to the compositor.** A price, a date, a statistic,
  a quotation attributed to a person: those are
  [checkability-routes-the-pixel](../../../_laws.md#checkability-routes-the-pixel)
  cases and the answer is the vector layer, however good the model's
  letterforms are. This technique governs text that is *authored*, not
  text that is *reported*.
- **When the same object appears in a plate prompt and a text-bearing
  prompt, the noun is handled in opposite ways.** [shape-language-over-nouns](./shape-language-over-nouns.md)
  translates a signboard into geometry so it stays silent; this technique
  hands the signboard its exact words so it speaks correctly. Same text
  magnets, opposite move — decided by the architecture, never by taste.
- **When text comes back in the wrong script or language, the prompt
  named the language and not the string.** Write the string. A model
  asked for "Chinese text saying welcome" is being asked to translate and
  typeset in one step; a model given the characters is being asked to
  typeset.
- **When the render is right except for one string, edit, do not
  regenerate.** Text-capable models support region edits, and a
  regeneration re-rolls every other string that was already correct —
  the subject's
  [edit-do-not-regenerate](../../../_laws.md#edit-do-not-regenerate) law
  applies with unusual force here because each string is an independent
  chance to fail.
- **When a pipeline serves both architectures, the compiler carries the
  switch.** One flag — *model renders text* / *compositor renders text* —
  selects between the no-text constraint block and this contract. A
  prompt author never chooses per image; the architecture chose once.

## What this does not settle

Whether locked text holds under style pressure — a heavily stylised
poster, a distressed print look — is measured per model and per style, and
the number is the proofreading gate's pass rate, which this technique
requires you to record. And the cases that taught this contract were
mined from one text-capable model family; a second family confirmed the
ingredients (explicit text, descriptive font, no negative channel) but the
per-string failure signature is one family's, so far.

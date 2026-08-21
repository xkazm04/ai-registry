---
layer: technique
type: technique
subject: cv-authenticity-screening
technique: hidden-text-and-smuggling-detection
status: forged
laws: [absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate, inference-must-look-like-inference]
shared_with: []
use_when: [screening an uploaded document before it reaches a model, extracted text does not match what the document displays, deciding whether an invisible character is an attack or a layout artifact]
---

# Hidden text and smuggling detection

The attack surface unique to documents: what the parser reads and what the human
sees are two different renderings of one file, and the gap between them is
exploitable. Text can be present in the extracted stream and absent from the
page — white on white, size zero, positioned outside the printable area, layered
beneath an image, held in metadata or in an invisible text layer under a scan,
or written in characters that occupy no visual space at all.

The point of the technique is to compare those two renderings. The discipline is
that most gaps between them are produced by ordinary document tooling, not by
anybody trying anything.

## What to look for

- **Invisible-by-styling text.** Foreground colour matching the background, font
  size at or near zero, opacity zero, text clipped outside page bounds or behind
  an opaque element.
- **Zero-width and format characters.** Zero-width space, zero-width non-joiner
  and joiner, word joiner, soft hyphen, bidirectional overrides, and the
  variation-selector range. These carry no visual footprint and pass straight
  through extraction into the model's context. Bidirectional overrides are worse
  than invisible — they cause displayed order to differ from stored order, so the
  human reads one sentence and the parser reads another.
- **Homoglyph substitution.** Latin, Greek and Cyrillic letters that render
  identically; used to slip a term past an exact-match check or to make two
  visually identical strings compare unequal.
- **Non-content layers.** Document metadata fields, comments, tracked changes,
  alternative text on images, speaker notes, and the invisible text layer that
  optical recognition writes beneath a scanned page.
- **Encoding tricks in the visible text.** Content that only becomes an
  instruction after a decode step — the modern equivalent of a footnote written
  for a machine.

The screen runs over **raw extracted text, before any interpretation**, because
every one of these is a property of the bytes and the whole point is to know
about them before the text reaches a model.

## The false-positive problem is the technique

Ordinary tooling produces almost all of this. Typesetting systems insert soft
hyphens at every line break. Word processors emit zero-width joiners around
ligatures and in scripts that require them. Justified text and multi-column
layouts leave positioned fragments outside the visible flow. Templates carry
placeholder text in white so it disappears when unfilled. Recognition software
writes a full invisible text layer under every scan, by design. Bidirectional
marks are *mandatory* in correctly typeset mixed-direction documents — a
candidate writing in a right-to-left script will have them throughout, and
flagging them punishes writing in that script.

So the rules are about discrimination, not detection:

- **Count and localise, do not merely detect.** A handful of format characters
  scattered through a document is typography. A dense run of them concentrated in
  one region, or a hidden fragment whose decoded content forms coherent
  imperative sentences, is a different object.
- **Score the hidden content, not the hiding.** The question that separates the
  two cases is *what does the invisible text say*. Hidden text repeating the
  visible text is a recognition layer. Hidden text listing every requirement from
  the posting, or addressing the reviewer directly, is the finding.
- **Never flag a character class as such.** "Contains zero-width characters" as a
  standalone flag will fire on a large fraction of honest documents and teaches
  reviewers to dismiss the flag that matters.
- **Normalise before comparing, and keep both versions.** Strip and fold for
  analysis; retain the raw text so the flag can quote exactly what was found and
  where.

## What the flag may and may not conclude

- The flag reports **an artifact**: text present in the file and not visible on
  the page, quoted, with its location. That is a fact, and it may be stated.
- The flag does **not** conclude that the candidate placed it there. Documents
  are routed through agencies, converted between formats, rebuilt by
  applicant-tracking exports and generated from templates; the person who
  uploaded it may never have seen the file's internals. Attributing placement is
  an inference and must look like one, per
  [inference must look like inference](../../../_laws.md#inference-must-look-like-inference).
- Where the screen cannot decide — the extraction was too damaged, the document
  was an image with no reliable text layer — the honest output is *could not
  determine*, never *no concern found*. A check that did not run does not render
  as a pass, per
  [absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence).
- An ambiguous finding resolves toward the candidate: note it, continue the
  pipeline, and let a human look, per
  [uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate).

## Neutralise, keep, flag

The three-part handling, in order:

1. **Neutralise** — strip format characters and normalise homoglyphs in the copy
   that goes downstream, so hidden content cannot influence any later stage.
2. **Keep** — retain the original bytes and the raw extracted text. The evidence
   for the flag lives there, and a reviewer or an auditor will need it.
3. **Flag** — record what was found and where, on the run. A neutralised-and-
   forgotten attack is the failure this ordering exists to prevent.

## When not to use this

- **Not on text that has already been through a normalising pipeline.** By then
  the evidence is gone and any finding is about the pipeline, not the document.
- **Not as a rejection or a drop.** Same rule as every other screen here: the
  document proceeds, a human decides.
- **Not as a proxy for authorship or effort.** Hidden text says nothing about
  whether the visible claims are true; those are checked by the arithmetic and by
  the evidence pre-pass, not here.
- **Not with a global character denylist.** Restricting the character repertoire
  a document may contain excludes scripts, names and languages, and will reject
  honest candidates for having a name your normalisation form did not expect.

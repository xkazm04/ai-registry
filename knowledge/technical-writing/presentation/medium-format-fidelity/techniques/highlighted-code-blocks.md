---
layer: technique
type: technique
subject: medium-format-fidelity
technique: highlighted-code-blocks
status: forged
laws: [check-the-page-where-it-is-read]
shared_with: []
use_when: [adding code samples to a technical article, styling code blocks for both colour schemes, packaging code for a platform with its own highlighter, presenting a prompt or command the reader will copy]
---

# Highlighted code blocks

The concern: code in an article is read differently from prose: the reader scans for
structure, copies it, and compares it with their own. Code in a proportional column loses
its alignment, and code set as prose picks up typographic substitutions that break it when
pasted. **Every code block is monospaced, whitespace-preserving, copyable as text, labelled
with its language, scrolls horizontally inside its own box, and is syntax-highlighted with a
theme for each colour scheme.**

The parts carry different weight. Monospace, preserved whitespace and copyable text are what
make code usable. Highlighting is a convention readers expect and prefer, and a reviewer
reading a field of technical drafts will name its absence as a defect, but it is not a
measured comprehension aid. A study of 390 novices found "no evidence" that it improved
comprehension. An eye-tracking study found differences that were not significant, though
students found coloured code easier to read. A ten-person study found a small speed gain
that weakened with experience.

## Procedure

1. **Declare the language on every block.** Automatic detection guesses wrong on short
   snippets and on languages with similar syntax; an explicit language removes the guess.
2. **Highlight with a theme pair**: one for the light scheme, one for the dark, both meeting
   contrast for comments as well as keywords. Comments in a pale grey are the usual failure.
   A highlighter loaded with one theme and a transparent background is a one-scheme
   highlighter, however the page around it switches.
3. **Contain overflow**: the block scrolls horizontally; the page does not. Long lines are
   wrapped at authoring time where the language allows, not by the renderer.
4. **Keep code as text.** Never an image of code: it cannot be copied, searched or read by
   assistive technology, and it does not switch colour scheme.
5. **Keep blocks short.** A snippet in an article shows the idea, typically under about
   twenty lines; longer code goes to a linked repository or an appendix, with the article
   showing the part that matters.
6. **Check where it is read**: both schemes, both viewports, and in the target platform's
   preview, whose own highlighter may override the authored one
   ([check the page where it is read](../../../_laws.md#check-the-page-where-it-is-read)).

## Decision rules

- **When the platform highlights code itself, supply what it needs** (plain text in its
  code-block element, the language selected) rather than pre-styled markup it will strip.
- **When the platform offers no highlighting, decide deliberately** between plain monospace
  and an embedded snippet from a code-hosting service. The embed highlights but adds a
  third-party dependency and may not render in every reader; record the choice.
- **Inline code stays inline.** A term in a sentence is formatted as code only if it is a
  literal identifier the reader would type.
- **Output and input are distinguished**: a command and its output are separate blocks or
  clearly marked, so a reader does not paste output into a shell.
- **Text the reader is meant to copy is a block, even when it is English.** A prompt for a
  model, a filter expression or a message template goes in a monospace block labelled as
  plain text, not in italics inside a paragraph. In prose it gets curly quotes, loses
  line breaks, can show the renderer's own markup characters, and has no copy affordance.
  Placeholders the reader replaces are marked as such. A copy button is a convention, not a
  measured gain; offer one where the page already offers one for code.
- **Where the renderer has no block element, the defect is the renderer's.** Record it
  as a renderer defect rather than restyling the prompt as a quotation.

## When not to use it

Pseudocode meant to be read as prose may use a lighter treatment; label it as pseudocode so
no reader tries to run it.

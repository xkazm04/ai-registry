---
layer: technique
type: technique
subject: i18n
technique: script-aware-presentation
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [a locale renders in an arbitrary fallback face that does not match the product, marks and descenders clipping at the source language's line height, deciding between a per-script rule and a per-locale override list]
---

# Script-aware presentation

A catalog can resolve perfectly and still be unpleasant to read. Every
string arrives in the right language, at the right key, with the right
plural form — and it is set in a face the platform picked at random,
crammed into a line height chosen for the source language's letterforms,
with tracking that pulls a connected script's letters apart. The
localization work is finished and the locale still looks like a
machine-translated afterthought, because **typography is a property of the
script, not of the product**.

This is the last mile the subject usually drops. It is invisible in review
for the same reason everything else here is invisible in review: the source
language renders beautifully, the reviewer reads the source language, and
the defect exists only in a rendering nobody on the team looks at.

## Three metrics that are not universal

The design system's type scale was built by looking at one script. Three of
its values do not transfer.

**The font stack.** A face chosen for the source language usually has no
glyphs at all for a target script, and when it does not, the platform
substitutes something — inconsistently across devices, at a different
weight and width, often at a visibly different optical size. The locale
stops looking like the product. The trap is believing a broad-coverage
webfont settles this: the subsetting that makes a webfont affordable
routinely drops exactly the scripts a new locale needs, so the file loads,
reports success, and every non-Latin glyph silently falls back anyway.
Declare an explicit family stack per script, ending in a platform generic
that is known to exist.

**Line height.** Scripts differ in how much vertical room a line of text
actually occupies. A script with stacked marks above and below the
baseline, or with long descenders, **clips** at a leading that looks
generous in the source language — the marks are cut off by the line box,
and a cut mark is not a cosmetic problem: it changes or destroys the word.
A dense logographic script has the opposite problem for the opposite
reason. Its glyphs fill the full square of the em rather than sitting in a
narrow x-height band, so the leading that reads as airy for Latin reads as
cramped and unreadable, and comprehension drops before anyone can say why.
Both directions need more room than the source language's value; neither
needs the same amount.

**Letter spacing.** Tracking is a Latin-typography device, and in a
connected script it is not a stylistic choice but an error: the letters of
a cursive script join, and forcing space between them breaks the joins and
produces disconnected letterforms that a reader parses as a different word
or as damage. Negative tracking — the display-heading device that makes
Latin headlines feel tight — is the same error from the other side. For a
connected script the rule is that tracking returns to the face's natural
value and stays there.

That rule has a predictable blind spot, and it is worth naming because
almost every design system has it: the *global* tracking applied to small
uppercase labels, buttons and eyebrow text. It is the largest tracking
value in the system, it is applied by a class rather than by a heading
rule, and it is therefore the one nobody remembers to override. The
uppercase transform that usually travels with it is a second defect in the
same declaration — casing is a property of the script too, and a script
with no case distinction either ignores the transform or, worse, has it
applied to the Latin fragments embedded in it and to nothing else.

## Key the rule off the script, never off the locale

The naive implementation is a list of per-locale overrides, one row per
language, each restating the same numbers. It is wrong for a reason that
only shows up later: **a new locale in an already-solved script silently
gets source-language typography**. Nobody notices, because adding a locale
is a translation task and the typography table is somewhere else. The list
grows with the number of languages, which is the number that keeps
growing, and the number of scripts, which barely moves, is the number that
actually determines the values.

So the rule is per **script**, resolved from the active locale through one
small, stable mapping — the same kind of closed vocabulary with one
authoritative definition that the rest of this subject insists on
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).
Adding the fourth language of a covered script is then free, and it is
free *by construction* rather than by anyone remembering.

Three mechanics follow:

- **Set it once, at the root, declaratively.** The same startup step that
  resolves the locale and sets the document's language and direction
  attributes ([locale-runtime](./locale-runtime.md) owns that step) is the
  step the presentation rules key off. Expressed as declarative rules
  matched on that attribute, the metrics cascade to every string in the
  product without any component knowing a script exists.
- **No component-level per-locale typography.** A component that carries
  its own line height for one language is the second hand-maintained copy
  of the script table, and it will be the copy nobody updates. If a surface
  genuinely needs an exception, the exception is expressed per script too.
- **Scope the override to text, not to layout.** Direction, mirroring and
  logical properties are a separate axis, owned by the runtime. A
  right-to-left script needs mirrored geometry *and* its own metrics; a
  logographic script needs its own metrics and no mirroring whatsoever.
  Conflating the two produces the classic bug where enabling a
  right-to-left locale also changes typography for scripts that never
  asked.

## Verify it the only way it can be verified

None of these values can be validated by a gate. There is no automated
check for "this line height clips a mark" or "this fallback face is not the
product's face", so the assurance has to come from a rendering pass with a
reader of the script — the per-locale review that also catches the hazards
only that language has: compound nouns that overflow a fixed control,
diacritic-heavy orthographies whose lines need confirming rather than
assuming, inflection and case forms a source-language template never
needed, a right-to-left line clipping at the edge a left-to-right layout
never guards.

One of those hazards deserves promotion out of the checklist, because it is
not a rendering problem at all: a script written **without word spaces**
breaks every piece of *code* that quietly tokenizes on whitespace —
truncation that trims to the last space, wrap heuristics, word counts,
excerpt builders, search highlighting. Those defects survive every visual
review done in the source language and produce, in the target script,
either no break at all or a break in the middle of a term. Audit the
whitespace assumptions before the first such locale ships; the stylesheet
cannot reach them.

Keep the rest written down per language next to the translation handoff,
because the reviewer who can see them is not the reviewer who can read the
code, and every one of them is a defect that each structural gate in this
subject reports as clean.

---
layer: technique
type: technique
subject: authoring-block-vocabulary
technique: closed-directive-set
status: forged
laws: [one-authority-per-vocabulary, failure-not-empty-success]
shared_with: []
use_when: [adding custom blocks to a markup language, a directive rendered as literal text on a published page, deciding what an unknown directive should do, retiring or renaming an existing block type]
---

# Closed directive set

The directive set is the list of things an author is allowed to say beyond the
base markup language. Closing it is one decision, taken once, expressed as one
dispatch — and everything else in the subject is only as sound as that dispatch
is total.

## The shape: one recognizer, one dispatch, one null

Three parts, and keeping them to three is the point.

1. A **scanner** over the body that recognizes the directive envelope — a fenced
   region, opened by a marker plus a name, closed by the matching marker — and
   hands the name and the enclosed lines onward. It knows nothing about any
   particular block; it only knows where one starts and stops.
2. A **dispatch** on the name that is a flat, exhaustive branch over the
   vocabulary, each branch invoking that block's own parser.
3. A **null return** as the final branch: a name the dispatch does not know
   produces no output at all, and the scanner drops the whole region — opener,
   body and closer.

The dispatch *is* the vocabulary. There is no registry file listing the names
alongside it, no second array the scanner consults, no documentation table
maintained by hand: those are copies, and two hand-maintained copies of one
vocabulary drift on the day someone adds a directive and updates one of them
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Anything else that needs to know the list — an author-facing reference, a
linting rule, an editor's completion — derives from the dispatch or is generated
from it.

## Why the stranger renders nothing

The three candidate behaviors for an unrecognized directive, and why exactly one
of them survives contact with a published reading surface:

- **Pass it through to the base renderer.** This is the accidental default and
  it is the worst outcome: the reader is shown the raw directive line. It reads
  as an unproofread page, it appears identically in every locale, and the only
  people who could fix it are the ones not looking.
- **Render a visible placeholder.** Honest, and correct on an operator-facing
  surface where the viewer is the person who can act. On a published page the
  viewer is a stranger; a box reading "unsupported block" gives them nothing to
  do and costs the page its credibility.
- **Render nothing.** The block leaves the surface. The surrounding prose still
  reads, the page still looks finished, and the defect is reported to the party
  that can fix it.

**The standard is render-nothing for reader-facing surfaces**, and it is only
defensible with the second half attached.

## The silent drop is loud somewhere else

A drop the reader never sees and the author never hears is a scanner that could
not run reporting the same thing as a scanner that found nothing
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
The disclosure moves to whoever can act, which on an authored corpus is the
author at build time:

- The pass that renders or validates the corpus **counts unknown directives and
  unparsable payloads per body**, and reports them with the body's identifier
  and the offending name.
- That count is a **gate**, not a log line. A body carrying an unrecognized
  directive does not publish; a corpus whose unknown count goes from zero to
  nonzero fails the build. Zero is the only number that needs no argument.
- Authors get a **preview that renders the same way production does**. A
  vocabulary whose only feedback channel is production is one where every typo
  costs a deploy.

The asymmetry with a runtime-composed surface is worth stating plainly, because
it is the reason the two subjects diverge: a machine emitter has no build step
and no author, so its drops must be disclosed to the viewer; an authored corpus
has both, so its drops are disclosed earlier and to someone who can do something
about it.

## The escape hatches to refuse

Each of these is proposed at least once, always for a real and sympathetic
reason, and each converts a closed set into an open one on the day it lands:

- **A raw-markup block** ("let the writer drop in a fragment for the one odd
  case"). This single directive re-opens everything: the corpus is no longer
  translatable by anyone who does not read markup, no longer parseable by a
  second consumer, and no longer portable to a new renderer.
- **A component-embed block** that names a component and passes it arguments.
  Now the corpus depends on the component tree, and every component rename is a
  content migration nobody will notice until a page goes blank.
- **A style or attribute pass-through** — colors, class names, widths on any
  block. Appearance in content is how a vocabulary stops being semantic; the
  block selects among designed variants by name and never carries appearance.
- **A generic container with layout parameters.** A layout engine smuggled in as
  a directive. Composition belongs to a small number of designed structural
  blocks with defined behavior at every width.

The test for closure, in the authored world, is not adversarial — it is
archival: **an author who fully controls a body must be unable to produce
anything a second parser could not understand from the grammar alone.**

## Growing the set

Additions are legitimate and should still be challenged with one question:
*what content is this, that no existing block can carry?* An addition that
answers with an appearance ("but this one is in a box") is a variant of an
existing block, not a new one. An addition that answers with a meaning ("this is
a sequence of steps a reader performs") is a new block.

Adding one is a change in exactly three places — the dispatch branch, that
block's parser, and its renderer — plus one more if the vocabulary is
documented for translators. If adding a block touches more places than that, the
vocabulary has copies in it, and the copies are the bug.

## Retiring one, which is the hard direction

Because strangers render nothing, deleting a dispatch branch deletes content
from the published surface silently, in every locale at once, for every body
that still used it. So retirement runs in the reverse order from an addition:

1. **Sweep the corpus** for every use of the directive, in every locale copy —
   the source language is not authoritative about what the translations contain.
2. **Migrate every body** to whatever replaces it, or accept the deletion
   explicitly, body by body.
3. **Then** delete the branch, and only then.

A rename is the same procedure twice: accept both names, migrate, drop the old.
The cost of this procedure is the strongest practical argument for a small
vocabulary — a set of eight directives is sweepable by one person in an
afternoon, and a set of forty is a project.

## When not to close the set

If one team writes the content, the same team renders it, the content lives in
one language, and nothing but the renderer will ever read it, a closed
vocabulary is ceremony. Say so out loud and choose the open form deliberately,
with the three costs named in the decision — translatability, second consumers,
re-renderability — so that the person who later needs one of them finds a
recorded trade rather than an accident.

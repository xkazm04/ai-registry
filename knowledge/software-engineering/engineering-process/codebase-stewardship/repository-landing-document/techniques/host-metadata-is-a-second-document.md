---
layer: technique
type: technique
subject: repository-landing-document
technique: host-metadata-is-a-second-document
status: forged
laws: [absent-guard-is-loud, verdict-survives-boundary]
shared_with: []
use_when: [publishing a repository for the first time, a repository has carried a blank description or zero topics for longer than anyone can remember, deciding what belongs in the landing document versus the host's own settings panel]
verified_on: 2026-10-07
---

# The host's metadata is a second document

A repository host keeps a second description of the project that is not the
landing document and is not derived from it: a description field, a set of
topics, a homepage URL, a social preview image — fields set once in a
settings panel, rendered on the repository's own page, on search results, on
a topic-browsing page, on a social-media unfurl, and on the owner's profile,
and never read from the file the landing document lives in. Nothing
regenerates these fields from the README. Nothing warns when they diverge
from it. They are a second document, hand-authored, usually once, at
creation, and then never again.

That makes them the purest instance of
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) this
subject has: an optional field with no enforced relationship to anything
protects nothing by default, and the default for a freshly created
repository is empty description, zero topics, no homepage, a social preview
that silently falls back to the owner's avatar. None of that is a build
failure, a broken link or a wrong rendering — it is a blank, and a blank
produces no finding for anyone to notice, which is exactly why the survey
this subject is built on had to go and count it rather than wait for a
complaint.

## Why this is not multi-surface-degradation

[multi-surface-degradation](./multi-surface-degradation.md) already states
one clause that brushes this surface — *where the surface has its own field,
fill the field* — and it is tempting to read that clause as already owning
this ground. It does not, and the difference is the mechanism. Degradation
is what happens to the *landing document's own content* as a renderer strips
it down tier by tier: a callout loses its styling, an image disappears, a
paragraph is truncated to its first sentence. The About-box fields are not a
stripped-down rendering of the README at all — GitHub never reads the
README to populate them, there is no fallback and no truncation, there is
only whatever a human typed into the settings panel once, or did not. A
field that is empty is not a degraded version of the landing document; it is
a second document that was never written. The two problems share a reader
(the one who never reaches tier 1) and nothing else, which is why this
technique exists next to that one rather than inside it.

## The rule

> **The host's description, topics and homepage field are maintained
> on the same change that maintains the landing document's own opening
> claim, and none of the three may assert something the landing document
> does not.**

Worked through the fields a code host typically exposes:

- **The description** mirrors the landing document's first paragraph — the
  one that, per `multi-surface-degradation`, already has to stand alone as a
  complete statement of what the project is. The description is that
  sentence's shortest honest form, not a second, independently drifting
  attempt at the same claim. Two sentences that both claim to say what a
  project is, and disagree, teach the reader that neither one was kept up to
  date.
- **Topics** are not keywords and not a tag cloud; they are entries in a
  vocabulary other repositories and a browsing reader already search by —
  `kebab-case`, lowercase, the project's actual language and domain, not a
  marketing phrase nobody else would type. A topic that duplicates the
  project's own name asserts nothing searchable, which is the same failure
  [evidence-linked-badges](./evidence-linked-badges.md) names for a badge
  that restates the project's identity instead of a property a reader could
  search on.
- **The homepage field** points at a real, currently reachable surface — a
  deployed instance, a documentation site, a package listing — or it is
  left blank. A homepage field pointing at a placeholder, a dead link, or
  the repository's own URL asserts a destination that goes nowhere a plain
  link in the README did not already go, which makes it worse than absent:
  absent costs nothing, wrong costs a click that teaches the reader this
  project's metadata is not maintained.
- **The social preview image** is the one field most repositories never
  touch and therefore render as the owner's avatar, blown up, on every link
  unfurled into a chat tool or social feed — an unintended personal photo
  standing in for the project on a surface with no text at all to correct
  it. A project publishing itself expects to be unfurled and owes this field
  a deliberate image or an explicit decision to accept the default; a
  project that never expects to be shared this way owes it nothing.

## The claims are audited together, not separately

A reader who lands on a search result, a topic page, or a social unfurl is
reading the host's metadata *before* the landing document, not after it —
this surface is upstream of the one the rest of this subject governs, and a
reader who distrusts the upstream claim may never open the downstream one.
The same discounting effect [evidence-linked-badges](./evidence-linked-badges.md)
describes for a mixed badge row applies here across fields rather than
within a row: a stale description next to an accurate README does not read
as *the README is the fresher source*, it reads as *this project's metadata
is not maintained*, and the discount is applied to the whole repository,
landing document included.

## When this does not apply

An internal repository with no outside reader has no audience for a
description, no topic page it is trying to be found on, and no link that
will ever be unfurled — maintaining this surface for an audience that does
not exist is the same miscalibration as building a detector for a style
guide nobody but its author reads. The trigger for adopting this technique
is the same trigger [multi-surface-degradation](./multi-surface-degradation.md)
names for its own tier ladder: the day a repository is published somewhere
a stranger can search for it is the day its host metadata stopped being
nobody's problem.

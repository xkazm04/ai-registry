---
layer: technique
type: technique
subject: long-form-reading-surface
technique: anchor-id-single-assigner
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target, identity-survives-reuse]
shared_with: []
use_when: [a contents link scrolls nowhere, two headings share a title, a heading is emoji or punctuation only, deciding where heading ids are computed]
---

# Anchor id: one assigner per document

A heading's anchor id is its **address**: the thing a contents entry links to, a
deep link carries, and a shared URL resolves against. Addresses are a closed
vocabulary, and this one is produced by at least two consumers that must agree
character for character — the code that lists the headings and the code that
renders them. When they disagree, nothing throws: the link exists, the target
does not, and the page sits still when the reader clicks
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

## The assigner is stateful, so sharing is structural

Producing an id has three parts, and only the first is a pure function:

1. **Slugify** the heading text — case-fold, strip markup and punctuation,
   collapse whitespace to a separator. Deterministic; identical everywhere it
   runs.
2. **Disambiguate** against ids already issued *in this document* — the second
   "Overview" becomes `overview-2`, the third `overview-3`. This requires the
   set of ids issued so far.
3. **Fall back** when step 1 yields an empty string — a heading that is entirely
   emoji, punctuation, or a script the slug rule strips. Something must be
   invented, and whatever is invented is numbered, which requires a counter.

Steps 2 and 3 carry state, and that is why the fix for divergence is one shared
**instance**, not one shared function. The tempting refactor — export the
slugifier, call it from both sides — shares the half that never disagreed and
leaves both stateful halves duplicated. The two copies then drift on exactly the
inputs that matter: a document with repeats, or with one unslugifiable heading.

Worse, the two consumers usually count *different populations*. An extractor
walking a document tree sees only headings, so its fallback counter counts
headings; a renderer invoked per rendered element may count every element it
touches. Both are internally consistent; both produce a stable, plausible id;
they are simply not the same id. This is the exact failure the single-instance
rule exists to make impossible, and no amount of care at the two call sites
prevents it, because both call sites are correct.

**The rule:** construct one assigner when a document begins processing, hand it
to every consumer that needs an address, and discard it when the document is
done. An assigner reused across two documents leaks disambiguation state between
them — the first heading of the second article becomes `overview-2` — so its
lifetime is exactly one document, and the code that constructs it says so.

## The fallback must be deterministic, not random

An unslugifiable heading still needs an address. Three properties decide whether
the invented one is usable:

- **Deterministic across runs.** A random or time-seeded id breaks the moment
  the document is rendered twice — once to extract the contents, once to render
  the body — which is the normal case, not an edge case. It also breaks every
  shared link the moment the page is re-rendered.
- **Namespaced so it cannot collide with a real slug.** A fallback pattern that
  a genuine heading could produce turns the fallback into a source of silent
  duplicates.
- **Positional, and honestly so.** The only information left is where the
  heading sits, so the fallback is a positional counter — and a positional
  address is fragile by construction
  ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)): insert
  a section above it and every fallback id below shifts by one, silently
  invalidating every link anyone saved. The technique cannot fix that from
  inside; what it can do is make the fragility visible and bound it. Prefer an
  author-declared explicit id for any heading meant to be linked from outside
  the document, and treat unslugifiable headings as a documentation smell to
  report, not a case to perfect.

The same fragility applies, more mildly, to duplicate suffixes: `overview-2`
means "the second Overview", so reordering two same-named sections swaps their
addresses. This is inherent to text-derived addresses and is the price of not
requiring authors to write ids by hand. State it; do not pretend the ids are
stable identities.

## Which headings get addresses

Not every heading in a document is a destination, and the contents panel and the
id assigner may legitimately disagree about *inclusion* even while agreeing
about *addresses*:

- **Depth is a contents decision.** A panel typically lists two levels — the
  document's section headings and their immediate children. Deeper headings
  still receive ids (a deep link into a sub-sub-section must work) but are not
  listed, because a contents panel that mirrors every heading is a second copy
  of the document.
- **Headings inside embedded structures are usually not destinations.** A
  heading inside a callout, a card, a tabbed example, or a collapsed block is
  part of that structure's internal layout; listing it in the document's
  contents implies a place in the document's outline that it does not have. The
  default is to exclude them, and any exception is a deliberate, stated one —
  typically a block type that genuinely *is* a section wrapper.
- **Exclusion from the contents never means exclusion from addressing.** If the
  renderer gives it an id, the assigner issued that id, which means the
  extractor's walk saw it too. Inclusion is a filter applied *after* assignment,
  never a second walk with different rules — a second walk is how the two sides
  desynchronize their counters again through a side door.

## Pin it with a test that renders both consumers

The unit test that proves the slugifier correct is the test that cannot catch
this defect. It exercises one half of one consumer; the failure is a
disagreement *between* consumers, and the only observation that sees it is one
that runs both ([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The pinning test is therefore shaped like the surface: take one document that
contains the pathological cases, run the contents extraction over it, render the
body over it, collect the ids each side produced in order, and assert the two
lists are **equal**. The document must contain, at minimum:

- two or more headings with identical text, so the disambiguation counters are
  exercised;
- a heading that slugifies to nothing — emoji-only, punctuation-only — so the
  fallback counters are exercised;
- a heading in a script the slug rule does not transliterate, so the strip-rule
  boundary is exercised and its behavior is pinned rather than accidental;
- headings at every depth the panel filters on, so an inclusion rule cannot
  quietly become a second walk.

Assert list equality, not per-heading spot checks: equality catches an offset
introduced anywhere in the document, and a spot check catches only the case
somebody thought of.

Then assert the instrument. Two empty lists are equal, and so are two lists
produced by a fixture whose pathological headings were silently skipped by a
parser change — the equality assertion passes in both cases while having tested
nothing. So the test also asserts that the fixture *fired the paths it exists
for*: that the duplicate suffix appears, and that the fallback pattern appears
the expected number of times. Without those, the strongest test in this subject
degrades into a green light with no target behind it.

## When not to reach for this

If a document format already carries author-declared ids on every heading, there
is no address to derive and no assigner to share — read the declared id and
fail loudly on a duplicate. If a surface renders headings but nothing ever links
to them (no contents, no deep links, no shareable positions), skip ids entirely
rather than assigning addresses nobody resolves. The technique earns its
complexity only where a text-derived address is consumed by more than one piece
of code.

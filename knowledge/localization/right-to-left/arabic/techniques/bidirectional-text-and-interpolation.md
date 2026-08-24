---
layer: technique
type: technique
subject: arabic
technique: bidirectional-text-and-interpolation
status: forged
laws: [format-skeleton-is-inviolable, the-source-locale-is-the-source-of-truth]
shared_with: []
use_when: [translating Arabic strings containing placeholders or Latin runs, reviewing RTL rendering defects, deciding where directional isolates or marks are needed]
---

# Bidirectional text and interpolation

This is THE Arabic chapter: nearly every hard defect specific to `ar` lives at
the seam where a right-to-left string contains left-to-right material — a
placeholder resolving to a Latin name, a number, a version string, a file
path, a brand. The Unicode bidi algorithm (UAX #9) computes display order from
the string's logical order at render time. It gets the common cases right
unaided; the craft is a precise map of where it fails and the minimal
intervention at each failure.

## The ground rules

**Strings are authored in logical (reading) order.** The renderer reorders for
display. Nothing is ever typed "backwards," and nothing is pre-mirrored.

**The skeleton is untouchable and unmoved-in-name, movable-in-position.**
Placeholder names stay byte-identical — `{count}` never becomes `{عدد}`, and a
renamed placeholder renders literally on screen because placeholder matching
is ASCII-exact
([the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable)).
Moving a placeholder to where Arabic grammar wants it is required, not
permitted.

## AR-BIDI-MIRROR · Never pre-mirror paired punctuation

Type `(`, `)`, `[`, `]`, `<`, `>` in the same logical order as English. The
bidi algorithm mirrors paired glyphs at render time; a translator who swaps
them "for RTL" — typing `)بيتا(` for "(beta)" — ships doubly-mirrored
parentheses. This is a real recurring translator instinct, not a hypothetical,
and it is invisible in any tool that displays strings already-rendered.
Detection is mechanical: an open-paren glyph immediately following Arabic text
where the source had a close, or a string whose paren pairing is inverted
relative to source.

## AR-BIDI-ISOLATE · Isolate an embedded value that carries its own direction

When a placeholder can resolve to a multi-word Latin phrase, a URL, a file
path, or user-supplied text of unknown direction, wrap the placeholder in
**directional isolates**: U+2066 (LRI) / U+2067 (RLI) / U+2068 (FSI) opened
before it and U+2069 (PDI) closed after it — FSI when the value's direction is
unknown (user content), LRI when it is known-Latin (a path, a URL, a version).
Isolates (Unicode 6.3, UAX #9) both fix the value's internal order and — their
advantage over the older embedding controls — prevent the value from
disturbing the surrounding Arabic. Where the UI layer offers a first-class
equivalent (an isolating element or attribute), prefer it to raw control
characters, because invisible characters in catalog values are a maintenance
tax (see AR-BIDI-REVIEW).

Decision rule: a short inline numeric or single-token placeholder
(`{count}`, `{pct}`, one Latin word) usually needs nothing — the algorithm
handles it. Isolation is for values that can contain their own internal
mixed-direction structure or unknown direction. Over-applying isolates to
every placeholder was tried and reverted in practice: it litters the catalog
with invisible characters that survive copy-paste into places that render
them as tofu, and it fixes nothing the algorithm didn't already handle.

## AR-BIDI-MARK · The mark (RLM/LRM) is the surgical fallback at a seam

The classic residual failure: an Arabic string ends with a Latin run followed
by Arabic punctuation — «الإصدار 2.1.0-beta.» — and the trailing period or
colon visually attaches to the wrong end, because a neutral character between
directions inherits direction from context. The minimal fix is a single RLM
(U+200F) after the Latin run, before the punctuation, which gives the neutral
an Arabic-side context. Use the mark, not an isolate, when the problem is one
neutral character at one seam; use it only where a rendered preview actually
shows the defect, and record its presence, because an invisible character that
nobody knows is there will be "cleaned up" by the next well-meaning edit.
LRM (U+200E) is the same tool for the inverse seam inside LTR context.

## AR-BIDI-CONCAT · Concatenation is a source defect, aggravated

Runtime concatenation of fragments is a defect in every locale (fragments
can't be reordered for grammar); in Arabic it is worse in kind, not just
degree: joining an LTR fragment to an RTL fragment creates a bidi seam at a
position the translator never saw, so even *correct* fragment translations
produce broken rendered output, and the breakage depends on the runtime values.
No locale-side fix exists — an isolate can't be placed inside a value around
material that isn't in the value. Escalate as a source defect per
[the source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth):
the fix is one interpolated string with named placeholders, owned upstream.

## AR-BIDI-REVIEW · What a reviewer checks that a diff cannot show

Arabic review requires a **rendered pass** — the strings displayed in an RTL
context — because a string-level diff is structurally blind to this
technique's whole subject matter. The rendered checklist, none of it visible
in a diff:

- Trailing punctuation after a Latin/numeric run sits on the correct (left)
  visual side (AR-BIDI-MARK candidates).
- Parentheses and brackets render as proper pairs around mixed content
  (AR-BIDI-MIRROR violations, and renderer contexts that lack bidi support).
- A placeholder resolved with a realistic *worst-case* value — a long Latin
  phrase, a path with slashes, an all-numeric token — keeps the sentence
  readable (AR-BIDI-ISOLATE candidates). Testing with a short friendly value
  proves nothing; slashes and hyphens are neutrals and reorder.
- Invisible controls audit: every U+200E/200F/2066–2069 in the catalog is
  either justified by a recorded seam or removed. Grep-level tooling can list
  them; only a human ruling keeps or kills each.
- Ellipsis and percent glue: `…` and `%` attach to the intended word/number
  in rendered order.

A diff-only review of Arabic can approve a catalog that is visually broken on
half its interpolated strings; conversely it can flag byte changes (an added
RLM) that are exactly right. Budget the rendered pass as part of Arabic
review, not as QA's problem later.

## When NOT to reach for this technique

Whole-layout mirroring, icon flipping, and CSS/logical-properties work belong
to the product's design system. And when a string renders wrong because the
*container* never declared RTL direction (the string is fine, the surface is
LTR-defaulted), the fix is the surface's, not the string's — adding marks to
compensate for a missing direction declaration bakes a workaround into the
catalog that breaks the day the surface is fixed.

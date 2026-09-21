---
layer: technique
type: technique
subject: copy-quality-gates
technique: rendered-string-extraction
status: forged
laws: [coverage-is-counted-not-claimed, format-skeleton-is-inviolable]
shared_with: []
use_when: [building the walker a catalog copy check runs over, a prose rule fires on placeholders or plural syntax, a copy gate reports success and nobody knows how many strings it read]
stage: solo
---

# Rendered string extraction

Every language rule in this bundle is written about sentences a reader sees. A
catalog does not store those sentences; it stores message syntax — nested
containers, plural and select branches, placeholders, rich-text tags. A check
that runs prose rules directly on that syntax fails two ways at once: it reports
defects that are artifacts of the syntax, and it never reaches strings stored in
a shape it did not expect. Extraction is the layer that turns a catalog into the
set of rendered units the rules are actually about, and says how many there were.

## Procedure

1. **Walk every container shape the format allows.** Objects, arrays, arrays of
   objects, objects inside arrays. Each string becomes a unit with a stable
   address — the key path plus array indices — that a finding can cite and a fix
   can find. A walker that treats any non-object value as a leaf will store an
   array as one opaque value; every later check that asks "is this a string?"
   will then skip it.
2. **Count strings independently of the walk.** A second, dumb recursion counts
   every string in the parsed catalog. The walker's unit count must equal it. A
   mismatch is a gate failure, not a warning, because it means some rule ran on
   less than the catalog.
3. **Expand branching messages.** A plural or select message yields one sample
   per branch, using the locale's own plural categories, so a rule sees "1 file
   was deleted" and "3 files were deleted" as separate sentences.
4. **Substitute placeholders with neutral typed values** — a short name, a
   number chosen to exercise the branch, a formatted date. Never delete them:
   "Hi , welcome" is a punctuation finding the source does not contain.
5. **Strip rich-text tags, keep their inner text**, and record that the unit
   carried markup so link-text rules can find the link.
6. **Attach a surface class** — heading, button, label, body, error, legal,
   email — from the key naming convention or an explicit surface map. Later
   layers need it: sentence-level grammar rules are off for fragments, case rules
   differ per element, severity differs per surface.
7. **Report coverage in the output.** The check's summary states strings present,
   units extracted, branches expanded, and units each rule ran on — never a key
   count, which counts a container as one.
8. **Keep a fixture with a planted defect in every container shape** the catalog
   uses, and fail the run if the check stops seeing any of them. A matcher that
   no longer detects its own fixture must refuse to print a clean result.

## The incident shape to design against

A catalog gate flattened nested objects into dotted keys and stored arrays as
single leaf values. Each of its content checks — brace balance, message-syntax
compile, placeholder parity, and a house typography ban — opened with an early
return for non-string values. Fourteen arrays holding sixty-two strings per
locale (feature lists, legal bullet lists, a transcript) were therefore outside
every check, including placeholder parity on legal copy. The product's written
contract stated the typography ban was gated; the only banned mark left in the
source locale sat inside one of those arrays; and the gate's summary line printed
a key count that included each array as one key, so its output could not reveal
the gap. Two gates in sibling products, written independently, recursed into
arrays and one printed the number of values it scanned. Nothing about the
catalog was exotic. The difference was entirely whether the instrument reported
what it covered.

## Skeleton safety

Samples exist for linting and nothing else. A finding maps back to the unit's
source address, and a fix edits the source message, never the expanded sample —
under [the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable)
a repair that rebuilt the message from a sample would lose branches and rename
placeholders. A suggested replacement that alters any placeholder name, tag name
or syntax keyword is rejected before it is shown.

## Decision rules

- **When a check's summary prints keys rather than strings, treat its coverage as
  unknown**, because a key can hold a container; add the string count before
  trusting a green run, per
  [coverage is counted, not claimed](../../../_laws.md#coverage-is-counted-not-claimed).
- **When a unit's surface class cannot be derived, class it as body copy** and
  report the unclassed count, because silently treating an unknown as a fragment
  switches rules off.
- **When a message has more branches than the locale needs, lint the locale's
  branches only** and flag the extra ones as a skeleton question for the
  message-format owner.
- **When copy lives outside the catalog** — literals in code, generated content,
  structured content files — extract it through the same pipeline or declare it
  out of scope in the report, because an undeclared source is a coverage hole
  with a green light over it.
- **When an empty catalog directory or zero units is observed, fail**: having
  looked at nothing is not the same as having found nothing.

## When not to use it

- **For structural checks that must see raw syntax.** Placeholder parity,
  message-syntax validity and duplicate keys run on the stored message or the
  raw text, before expansion; extraction feeds prose rules, not the parser.
- **To produce the strings a translator works on.** Translators need the message
  with its skeleton intact; expanded samples are a lint view.
- **As proof of rendering.** Extraction approximates what renders; it cannot see
  truncation, line breaks, or a string composed at runtime from parts. Those
  belong to review on the rendered page.

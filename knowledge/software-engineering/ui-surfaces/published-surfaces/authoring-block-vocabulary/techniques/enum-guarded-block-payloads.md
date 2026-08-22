---
layer: technique
type: technique
subject: authoring-block-vocabulary
technique: enum-guarded-block-payloads
status: forged
laws: [one-authority-per-vocabulary, one-validation-door]
shared_with: []
use_when: [a block carries semantic labels like note or warning or available, a mistyped label renders unstyled, the parser and the renderer disagree about which labels exist]
---

# Enum-guarded block payloads

Directives are the outer closed set. Inside several of them sits a second one:
the **labels** an item carries — a callout that is a note or a warning, an
offering that is available or planned or retired, a step that is required or
optional. These are enumerations, they are authored by hand, and they get the
same closure discipline as the directives that contain them.

## The guard lives in the parser, not after it

The allowed labels are declared as an explicit set, and the block's grammar
**admits only those literals in the label position**. Not "parse any word into
the label field and check it downstream" — the recognizer itself refuses to see
anything else.

The difference is not stylistic. A parser that accepts any word produces an item
carrying an unknown label, and that item then travels: through the renderer's
style lookup, into whatever a second consumer emits, into a snapshot test that
now encodes the typo. A parser that admits only the enumerated literals converts
a mistyped label into a *shape* failure at the earliest possible point — the
line either matches the block's item grammar or it does not — and the failure
lands in the per-item skip path that already exists. One validation door, and
the door is the grammar
([one-validation-door](../../../../_laws.md#one-validation-door)).

There is a pleasant side effect: because the label position only accepts known
literals, a line whose leading word happens to be prose is simply not an item,
and continuation-line handling picks it up. The guard and the grammar reinforce
each other instead of arguing.

Two details that decide whether authors experience the guard as strict or as
hostile. **Match case-insensitively and normalize once**: a writer who typed the
label capitalized meant the label, and refusing them is pedantry that costs a
block. **Guard in exactly one place**: checking the literal in the pattern *and*
re-checking it against a set afterwards is not defense in depth, it is a second
copy of the vocabulary in the same file, and the copy that is not updated is
whichever one the next author does not notice.

## The renderer's table is total, over the same enumeration

The other half is a style table keyed by the same closed set, and the rule is
that **it is exhaustive plus one named fallback**. Not a lookup that may return
nothing, not a chain of conditionals ending in an implicit default: a table with
an entry per label and one explicitly named default entry, so that a label added
to the enumeration and not to the table is a visible, findable gap rather than
an unstyled item.

If the enumeration and the table are maintained by hand in two places, they
drift, and they drift asymmetrically:

- **Label in the parser, not in the table** — items render unstyled or fall to a
  default that means something else. Cosmetic, usually caught.
- **Label in the table, not in the parser** — the label is unreachable. Someone
  wrote it into the design, documented it for authors, and no body can ever
  produce it. This one survives for years, because nothing ever fails.

The count of copies is usually higher than anyone expects, because a label set
that is useful is reachable from more than one syntactic position — the same
four callout kinds serve as directive names for a standalone block *and* as
inline labels inside a stacked one. Each position adds a guard, the renderer
adds a table, and the type declaration adds a union: four materializations of a
four-member vocabulary, all hand-written, all in different files.

The fix is structural: one declaration of the label set, and the parser's guard,
the renderer's table, and the author documentation all derive from it
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Where a language's type system can make the table's exhaustiveness a compile
error over the union, take that — it converts the second drift direction into a
build failure, which is the only place it will ever be noticed.

## Labels are keys, not text

An authored label is an identifier that happens to be spelled in a natural
language. It is **not** the text the reader sees. The renderer decides what a
warning callout is called on screen, and in a multilingual corpus it resolves
that name per locale — which is exactly why the label in the body must stay
untranslated in every locale copy. The moment a translator renders the label
into their own language, the parser stops recognizing it and the item disappears.

This is why the label list appears in the translator's do-not-translate
instructions with the directive names themselves, and why a label should be
chosen to look like a token — lowercase, single word, no spaces — rather than
like a sentence fragment. A label that looks like prose invites translation.

## When a label carries behavior, the guard is load-bearing

Some labels do more than pick a color. A warning becomes an assertive
announcement for assistive technology; a deprecated status suppresses a call to
action; an availability label decides whether a second consumer emits an offer
at all. Once a label crosses from appearance into behavior, three rules apply:

- **Only the enumerated label produces the behavior**, and the parser is the
  only path to the label. There is no second route — no inference from the
  block's text, no heuristic on wording — because a second route is a second
  door.
- **Behavioral escalation is the exception, not the pattern.** If every label in
  the set announces itself assertively, none of them does; the escalation is
  reserved for the one that genuinely interrupts, and that decision is recorded
  next to the enumeration.
- **The fallback must be the safe one.** The named default entry in the style
  table gets the least assertive behavior of the set, so that an unmapped label
  under-announces rather than over-announces.

## Choosing the labels

Keep the set small and semantic. Three to six values per enumeration is where
authors stop consulting the reference; past that they guess, and guesses hit the
parser guard and vanish.

The values name **what the thing is**, never how it looks: `warning`, not
`red`; `planned`, not `faded`. An appearance-named label freezes a design
decision into thousands of authored lines, and the day the design changes,
either the corpus lies or the corpus gets rewritten. A semantic label lets the
design move without touching a single body.

## When not to enumerate

If the value is genuinely open — a person's name, a version string, a URL — it
is not a label and it does not get an enumeration; it gets a field with a
validity rule and a per-item skip when the rule fails. The enumeration
discipline applies to *closed* vocabularies specifically, and forcing it onto an
open field produces the worst outcome available: an allowlist somebody has to
extend for every legitimate new value, which is a maintenance queue with a
publishing deadline attached to it.

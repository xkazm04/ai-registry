---
layer: technique
type: technique
subject: copy-quality-gates
technique: format-aware-check-catalog
status: forged
laws: [format-skeleton-is-inviolable, every-finding-cites-an-anchor]
shared_with: []
use_when: [building or auditing the deterministic layer of a copy gate, a gate reports the same defect five times on one string, a new serialization format enters the pipeline]
stage: solo
---

# Format-aware check catalog

The deterministic layer is usually described by its disposition and never by its
membership. "L1, blocking" says what happens when a check fires; it does not say
which checks exist, and a gate whose catalog was assembled one incident at a time
has holes shaped like the incidents nobody has had yet. The catalog is the
enumerable part of the gate, and it is not a matter of taste: four independent
implementations — a continuous-localization platform, an open-source translation
toolkit, a desktop translation tool and an open grammar checker — converge on
nearly the same membership when their shipping source is read (code-verified,
2026-09). Their **union** is the evidence; no one of them ships every check, and
every one of them ships most.

Two mechanisms in that source matter more than the list. Both exist to stop a
catalog from becoming unreadable as it grows, and both are invisible in any
description of a gate that only names its layers.

## A format earns its own checks

A unit is text inside a serialization, and the serialization has rules of its own
that no prose check sees:

- **Message-syntax validity for the format at hand.** Whether the plural or
  select construction parses, whether every branch the source declared is
  present, whether a selector the target needs is absent. A format that carries
  branching syntax gets a parser, not a regular expression.
- **Structural checks for the markup family the catalog uses.** Tag parity
  including the empty-tag and nested-tag cases, which is where hand-edited
  targets break and where a naive parity check counts two tags and calls it even.
- **A round-trip check on the format's own escape rules.** A value that parses is
  not a value that survives a write: a quote, a backslash or a target-language
  terminator can serialize into a file that no longer loads. Parse, write, parse
  again, compare.

When a new serialization enters the pipeline it arrives with those three checks
before any language rule runs on its strings, because a prose finding on a unit
that does not parse is noise that costs a reader's attention twice.

## The recurring catalog

- **Skeleton and structure** — placeholder presence and parity; markup and tag
  parity; bracket balance. These are the unconditional class under
  [the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable);
  they block on day one and never wait for a precision count.
- **Carried literals** — numbers, links and email addresses checked for **count
  and identity**, not count alone. Count alone passes a transposed digit and an
  edited host, which are the two ways this class actually fails.
- **Surface hygiene** — leading and trailing whitespace, doubled whitespace,
  terminal punctuation, capitalization per element class.
- **Catalog-wide relations** — unchanged-from-source, and two distinct sources
  that were given the same target (the other diagonal of the duplicate-source
  check the sibling measurement subject's
  [deterministic checks before estimates](../../translation-quality-measurement/techniques/deterministic-checks-before-estimates.md)
  owns).
- **Contract-bound** — forbidden and missing terminology, alphanumeric
  identifiers, measurement units, and the length budgets that
  [length-and-render-budgets](./length-and-render-budgets.md) separates into
  three different things.

Membership is configuration, not code. A project preset is a **delta over the
catalog** — checks off, checks on, thresholds moved — and a preset may
legitimately *invert* a check for a script, which is why the catalog must be
addressable by identifier per
[every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor)
rather than by position in a list.

## The precondition graph

The largest single false-positive reducer in the whole sweep, and the one no
description of a layered gate mentions. A failing check silently **disables its
dependents**: in one toolkit an "untranslated" or "blank" verdict each suppress
roughly thirty-five other checks, and a trailing-whitespace failure suppresses
the terminal-punctuation check that would otherwise read the whitespace as a
missing full stop (code-verified). Without the graph, one defect is reported five
times, the reader learns that the gate is noisy, and the catalog's credibility is
spent on a string that had one problem.

## Prefilter normalisation

Each check sees the text it is actually about. Accelerator markers, placeholders,
markup, entities, bidirectional control marks and non-breaking spaces are
stripped **inside** the check, and the stripped form is cached per check and
string so twenty checks do not each re-scan the same unit.

This is not the same stage as extraction. Extraction owns what the *reader* sees
and hands every rule a rendered sample
([rendered-string-extraction](./rendered-string-extraction.md)); the prefilter
owns what one check is about. They must not be collapsed: a placeholder stripped
for the capitalization rule has to be present for the parity rule.

## Procedure

1. **Enumerate the catalog as data** — identifier, what it decides, which
   serializations it applies to, its disposition, its precondition set.
2. **Give every serialization in the pipeline its three format checks** before
   adding a single prose rule for it.
3. **Declare preconditions on every check that can be made meaningless by
   another's failure**, and run the graph rather than the list.
4. **Attach the prefilter to the check, cached per check and string.**
5. **Express a project's rule set as a delta over the catalog**, so a check that
   was deliberately inverted for a script reads as a decision and not as an
   omission.
6. **Print the catalog with each run** — checks run against checks defined — per
   the coverage discipline the gate already applies to strings.

## Decision rules

- **When a check cannot be meaningful given another check's failure, declare that
  dependency**, because a catalog without a precondition graph reports one defect
  once per dependent check and is suppressed wholesale within a week.
- **When a new serialization enters the pipeline, it earns its own syntax,
  structure and escape checks**, because the generic prose catalog cannot see a
  file that will not load.
- **When a literal is checked, check identity as well as count**, because the
  failure this class exists for is a changed digit, not a missing one.
- **When a check is disabled for a language or a script, record it where the
  language's rules live**, not as a project flag, so every consumer inherits the
  same answer (the sibling measurement subject owns that exemption design, in
  [language-scoped-check-exemptions](../../translation-quality-measurement/techniques/language-scoped-check-exemptions.md)).
- **When the catalog grows past what one reader can hold, group it by what it
  decides** — skeleton, literal, hygiene, relation, contract — because that is
  the order in which findings should be read and the order the precondition graph
  already implies.

## When not to use it

- **As the argument that the deterministic layer is finished.** The catalog is a
  floor assembled from four implementations' union; a product with a format or a
  surface none of them had still has checks to write.
- **To decide severity.** Membership and disposition are different questions;
  [severity-as-declared-data](./severity-as-declared-data.md) owns the second.
- **On a pseudo-locale or any other generated target.** A locale built to break
  layout fails most of this catalog by construction and floods the gate.

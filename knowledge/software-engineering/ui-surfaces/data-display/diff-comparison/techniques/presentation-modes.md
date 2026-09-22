---
layer: technique
type: technique
subject: diff-comparison
technique: presentation-modes
status: forged
laws: [count-carries-predicate, one-authority-per-vocabulary]
shared_with: []
use_when: [choosing how a difference reaches its reader, zeros that cannot be told from not-compared, diff colors meaning different things per surface]
---

# Presentation modes

One difference, three honest renderings — chosen by what the reader is
*doing*, not by what the data made convenient. The reviewer needs both
contexts whole; the reader-of-a-story needs one flow with changes marked
in place; the triager needs a number small enough to decide "look or move
on". Serving the wrong mode to an audience does not distort the data — it
misallocates the scarcest resource on the surface, the reader's attention:
the triager drowns in a two-pane review layout, the reviewer squints at a
count that hides everything they came to judge.

## Side-by-side: the two-context mode

Two full renditions, aligned row by row, differences highlighted in
place. Its distinguishing property is that **both states keep an
independent existence**: the reader can read either side as a document in
its own right, and can compare two versions of one region character by
character with their eyes rather than by reconstructing one from
annotations on the other. Its disciplines:

- **Alignment is the product.** Corresponding regions sit opposite each
  other; unchanged stretches collapse behind expanders (with visible
  "N unchanged" labels — collapsed is not hidden) so the changes carry
  the visual rhythm.
- **Both sides render fully**, including what is absent from the other
  side: an element present only in the baseline occupies real space
  opposite a gap, because "this used to exist" is a finding with the same
  rank as "this is new".
- It is the widest mode, and it degrades worst on narrow surfaces —
  side-by-side crushed into two forty-character gutters is neither side
  by anything. Below a width the layout cannot honestly serve, switch to
  inline rather than miniaturize. The breakpoint is a *hard switch*, not a
  shrink, and for a reason stronger than aesthetics: two-pane's entire
  claim is "the thing opposite this is its counterpart", and the moment
  rows wrap, that correspondence is still drawn and no longer true.
  Wrapping does not make the mode ugly; it makes it lie. Compute the
  breakpoint on the effective width after the reader's zoom, so a
  magnified surface drops to inline instead of growing a second scroll
  axis.

### Counter-evidence: this is not established as "the review mode"

An earlier statement of this technique called side-by-side the mode for
judgment under responsibility, on the reasoning that judgment needs
surrounding context. That framing did not survive the search for evidence
against it, and the correction matters because the golden path is built on
audience selection.

The one controlled study located on the question (eye-tracked bug
detection, within-subjects, small n) measured *lower* visual effort in the
**unified** view, less time navigating and more time analyzing, and
marginally more defects found there — the opposite direction, though not
significantly so at that sample size. The authors' reading is that the
two-pane layout's extra visual traversal is a tax on building a mental
model. A widely-read practitioner argument reaches a third conclusion:
that both modes fail on substantial changes and serious review happens
against the current state with change markers in the margin.

So: no evidence supports inferring the mode from "this reader is
reviewing". What survives is narrower and defensible — the modes differ in
what they make cheap (two-pane: character-level comparison of a region,
and reading either side whole; inline: sequential reading of the result;
counts: deciding where to look), and the choice between the first two is
**a remembered reader preference, not an inference from the task**. Offer
both, remember the choice per reader across entities and sessions, and let
a per-entity override be transient. A surface that forces a mode on the
grounds that it knows the reader's task is asserting something the
literature does not support.

## Inline: the narrative mode

One reading flow with removals and additions marked in sequence. This is
the mode for **understanding a change as a story** — what happened here,
in reading order — and for prose generally, where the reader's task is to
read the *result* while noticing the edits. It trades away the baseline's
independent existence: the old state exists only as annotations on the
new. That trade is right when the reader's primary text is the candidate,
wrong when the two states have equal standing (use side-by-side) —
which is also why inline is the natural mode for narrow surfaces and
embedded contexts.

## Summary counts: the triage mode

Added / removed / changed, as numbers, one line per compared entity. This
is the mode for **deciding where to look** across many comparisons — a
batch of runs, a fleet of entities — where the reader's question is not
"what changed" but "which of these is worth opening". Two disciplines
keep counts from lying:

- **A count carries its predicate** ([_laws:
  count-carries-predicate_](../../../../_laws.md#count-carries-predicate)):
  "3 changed" states its unit (fields? elements? sections?), its level,
  and its exclusions — "3 fields changed (field level, volatile fields
  excluded)" — or it will be compared against a count computed under a
  different predicate and the comparison of comparisons will be
  fiction.
- **Zero is a claim.** A row showing 0/0/0 asserts "compared, no
  differences" — it must be visually distinct from "not compared" and
  "comparison failed" (diff-honesty owns the trichotomy; this mode is
  where it is most often violated, because dashboards love zeros).

## The escalation path

The modes are floors of one building, not rival buildings. Triage counts
open into the full diff; the full diff can collapse back to its summary.
A summary that cannot be expanded is an unauditable claim — the reader
must either trust it blind or reconstruct the comparison elsewhere, and
both outcomes indict the surface. The escalation also preserves state:
opening detail from a count lands on the *same pair, level, and
parameters* the count was computed under, or the detail will contradict
the summary that launched it and teach the reader to trust neither.

## One change-kind vocabulary, one direction convention

Added, removed, changed, moved, unchanged, not-compared: one closed
vocabulary, defined once, rendered identically on every comparison
surface in the product ([_laws:
one-authority-per-vocabulary_](../../../../_laws.md#one-authority-per-vocabulary)).
Every kind gets a glyph or label *in addition to* color — color-only
encoding excludes color-blind readers from the product's entire
comparison layer, and diff surfaces are the single worst offender in most
products because red/green is their tradition. This is not a house style:
it is the accessibility standard's use-of-color criterion (WCAG SC 1.4.1,
level A — colour is never the *only* visual means of conveying
information), and the criterion is satisfied by any non-colour channel,
so a glyph, a text label, a border, a fill pattern, or column position all
qualify. Nor is the redundancy a cost paid for a minority: coding a
category by colour *and* shape together measurably speeds visual search
relative to either channel alone, so the accessible rendering is also the
faster one to scan — the trade this rule is usually argued against does
not exist.

Two boundaries the rule is routinely mistaken about. First, it covers
sighted readers with colour-vision deficiency and stops there; getting the
change kind into the **accessibility tree**, as content an assistive
reader announces, is a separate obligation (WCAG SC 1.3.1, also level A).
A marker injected purely as generated decoration satisfies the first and
fails the second — it is visible, and it does not exist. Second, the
marker's presence in the accessibility tree and its presence in the
reader's *clipboard* are different questions with opposite answers: the
change glyphs must be announced and must **not** come along when the
reader copies a side, or every paste carries the diff's punctuation. Both
are decided by where the marker lives in the structure, which means both
are decided before the surface is built, not retrofitted after someone
complains.

Direction is a convention, stated once and never varied: the candidate is
read *against* the baseline, additions are candidate-side surplus, and
every surface agrees. The pair technique owns naming the sides; this
technique owns that the visual language never flips. A product where one
surface's green means "new" and another's means "kept" has two diff
languages, and readers fluent in both will still misread the one they
visit less.

## Where the values are measured, the vocabulary is one member short

The closed set above was written for recorded values, where two sides are
equal or they are not. Where the compared values are *measured* — scores,
timings, rates, anything carrying instrument noise — a third case exists
between them: the numbers differ by less than the comparison can resolve.
Rendering that as **changed** asserts a movement the surface cannot support,
and the reader acts on a wobble. Rendering it as **unchanged** is a different
lie, and a self-refuting one, because the two numbers are on screen and the
reader can see they are not the same.

So the vocabulary gains a member — *held, within what this comparison can
distinguish* — with its own glyph, distinct from the movement marks and from
the equality mark. The band it is held within is the per-field tolerance that
the level technique makes part of the comparison, so the mark and the tolerance
are one decision recorded once, not a rendering convention invented downstream
of the number.

Two rules fall out of the same reasoning and are broken more often than the
main one.

- **A non-measurement must never reach the direction test.** The step that
  turns a delta into a direction is almost always a comparison against zero,
  and the values that stand for "there is no measurement here" — the
  not-a-number a missing baseline produces, the infinity a zero denominator
  produces — compare false in *both* directions. They fall through the sign
  test into whichever branch is written last, and the surface draws a
  confident arrow for a measurement gap. Which arrow is decided by the order
  the branches happen to be in, which is to say by nothing. Classify
  finiteness first, and render a non-measurement as a bare dash wearing no
  direction at all: it is the subject's most expensive lie — a failure
  rendered as a finding — arriving at the size of one glyph, and it is the
  cheapest false claim a comparison surface can manufacture.
- **Not-compared leaves the direction palette entirely.** It is not enough for
  the third state to be *distinct* from changed and unchanged. It must not be
  drawn in the hues that carry direction, because a reader takes the hue
  before the label and will have read a sign by the time they reach the words.
  An element scored on one side only, tinted with the gain colour because it
  is "new", has been handed a direction the comparison never computed —
  appearing and disappearing are changes in *what was measured*, not
  improvements and regressions. Give the state an informational hue of its own
  and its own non-colour channel: a glyph where there is room for one, a fill
  pattern where the mark is a bar or a region and no glyph fits.

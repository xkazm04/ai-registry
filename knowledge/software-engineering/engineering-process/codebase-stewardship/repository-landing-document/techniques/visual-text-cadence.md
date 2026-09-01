---
layer: technique
type: technique
subject: repository-landing-document
technique: visual-text-cadence
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [a front page reads as a wall of text and nobody can say why, setting a house rule a reviewer can apply to page density, deciding what must appear above the fold]
---

# A cadence rule you can count

*Break up the prose* is not a rule. Two people can hold opposite views about
whether a page is dense, neither can be shown wrong, and the argument is
settled by whoever cares more — which on a page nobody owns means it is
settled by nobody. Every landing document in a fleet drifts toward a wall of
text along exactly this path: the density rule existed, it was a matter of
taste, and taste loses to a contributor in a hurry.

A cadence rule survives only if a reviewer can *count* its violation without
consulting the author. That constrains what the rule may say, and the
constraint is productive: it forces the rule to name a window, a limit, and a
closed set of things that satisfy it.

## The three clauses

**The first screen.** Define it as a fixed window — the first thirty rendered
lines is a defensible approximation of what a reader sees before scrolling, on
the understanding that it is an approximation and that being off by five lines
changes nothing. Within that window the document owes exactly two things: **a
complete one- or two-sentence statement of what this is**, and **at least one
non-prose element**. Not a specific element and not necessarily an image — a
figure, a worked example, a table, or a callout each satisfies it. The
statement is first in the reading order even where a badge row and a heading
precede it visually, because it is the fragment every excerpt surface will
take.

**The prose run limit.** No unbroken run of prose exceeds **fifteen rendered
lines** without a non-prose element. Fifteen is chosen against a measurement
rather than from a feeling. Surveyed on 2026-09-01 on one instrument, counting
against the closed break set below, across six working repositories that have a
landing document and one published project composed with a cadence discipline,
the runs are **10, 19, 20, 20, 22, 90 and 96**. The top two are several screens
with nothing for the eye to land on, and the distribution has no natural break
anywhere below twenty-two. A limit set at forty would pass five of the seven
including both of the composed documents, and a limit that most things pass
measures nothing; a limit set at ten would canonise the single best-composed
document as the standard.

Fifteen fails every document in the set except that best-composed one — and it
fails the published project too, at nineteen. That is the expected result rather
than an embarrassment. The same project fails two further rules derived from it
in this subject, and a reference that passed every rule it inspired would be
evidence the rules had been fitted to it rather than argued from it.

**The closed set of breaks.** A break is a figure, a table, a fenced block, a
callout, or a heading with content under it. Furniture is **not** a break: a
badge row, a horizontal rule, a bare heading immediately followed by another
heading, a jump bar of links. This clause is where cadence rules are usually
lost, and losing it inverts the rule — a page whose forty-line prose run is
interrupted by a decorative rule scores as compliant while reading exactly as
badly as before, and the rule now certifies the failure it was written to
catch.

## Why these numbers, and how to argue with them

Every number above carries its predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
thirty lines is *a window approximating one screen*, fifteen is *the longest
prose run permitted, measured in rendered lines, counted by one instrument
over seven landing documents on 2026-09-01*. Stated that way they are
arguable, which is the intent. A team that measures its own corpus and lands
on twelve or eighteen has done the right thing; a team that adopts fifteen
because a document said fifteen has adopted a number with no predicate and
will abandon it the first time it is inconvenient.

What is **not** arguable is the shape: a window, a limit, a closed set of
qualifying elements. A cadence rule missing any of the three has reverted to
taste, whatever numbers it quotes.

## What the rule deliberately does not constrain

**Total length.** Density and length are different failures with different
remedies, and fusing them produces a rule that cannot be satisfied — a
well-composed long page fails a length cap, and a short page of solid text
passes it. Length is a routing question and belongs to
[landing-document-as-router](./landing-document-as-router.md); this rule
governs only what happens between the breaks.

**Which element to use.** The set of qualifying breaks is closed, but the
choice within it is the author's, and a rule that demanded a figure every
fifteen lines would produce figures nobody needed. The limit says *something
must be here*; it does not say what.

**Section length.** A long section made of alternating prose and tables is
fine. Counting sections rather than runs measures structure and calls it
density.

## The rule is enforced or it is decoration

All three clauses were chosen to be countable because the technique that
follows is what keeps them alive: a house rule with no detector is advice, and
this one is unusually detectable — rendered lines between qualifying elements
is a scan over the document, and the closed break set is what makes the scan
implementable at all. Write the detector in the same change as the rule, with
the numbers **stated in the rule and read by the instrument**, never invented
inside the instrument. A threshold that lives only in a script is a standard
nobody agreed to and nobody can argue with; see
[style-rule-ships-its-detector](./style-rule-ships-its-detector.md).

## When cadence does not apply

A landing document under a screen and a half has no cadence problem to solve,
and a first-screen contract applied to a document that *is* one screen is
simply the document. The rule switches on when the page exceeds a screen,
which is also roughly the point at which the routing technique starts having
something to say — the two failures arrive together, and a page that fails
both is usually fixed by routing first, because moving three sections out
resolves most of the runs that were long.

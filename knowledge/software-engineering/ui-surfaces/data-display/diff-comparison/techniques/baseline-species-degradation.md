---
layer: technique
type: technique
subject: diff-comparison
technique: baseline-species-degradation
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [the baseline a surface wants is missing for a whole class of objects, choosing what a diff shows when the declared side does not exist, a comparison surface silently answers a different question than its default promises]
---

# Baseline species degradation

Choosing a baseline by the question is the whole of
[pair-and-baseline-selection](./pair-and-baseline-selection.md), and it
assumes the chosen species is *available*. Often it is not — and the
unavailability is not random. A declared baseline exists only where some
workflow wrote it down, so it is absent for exactly the population that
adopted a different workflow, which is usually the population that has
grown past the one the surface was designed for. The result is a surface
whose default question cannot be answered for its most important objects,
discovered on the day someone opens it during an incident.

The temptation is to treat this as an empty state. It is not: a reader
who wanted *does reality match the promise?* and gets nothing has lost the
surface, while a reader who gets a silent substitute has lost something
worse — they get correct differences answering a question they did not
ask, which
[pair-and-baseline-selection](./pair-and-baseline-selection.md) already
names as the failure worse than an error. Degradation is the third
option, and it is only honest under three constraints.

## Degrade along a declared ladder, not to whatever is present

The fallback order is a design decision recorded once, not a search for
the first non-null value. Write the ladder as an ordered list of species
with the question each one answers, because the ladder *is* a sequence of
progressively weaker questions and the reader is entitled to know which
rung they landed on. A typical descent runs declared → lifecycle →
temporal: from *does reality match the promise?* through *what would
shipping this change?* to *what just changed?* Each rung is a legitimate
question; none of them is the question above it.

Two rungs deserve explicit design rather than inheritance. The **first**
rung is the surface's advertised default and the one its documentation
describes, so a surface that lands on rung two for most of its traffic has
a documentation defect as well as a design one — say in the docs which
population gets which rung. The **last** rung is not a species at all: it
is refusal. When no baseline exists, the surface declines to render and
names *every* precondition that failed, not the first one checked. "No
declared baseline, and no prior revision observed" tells the reader both
that the object is unmanaged by the writing workflow and that the session
is too young to have seen a change; either fact alone sends them down the
wrong path.

## The label is carried by the same value as the content

The disclosure requirement is not new — the pair is displayed and the
sides are named by role. What degradation adds is that the label is now
*derived*, and a derived label can drift from the content it describes.
The guard is structural: **the baseline's identity travels in the same
value as the baseline's content**, produced by the same expression that
selected it, so no code path can render one without the other. A function
returning `(content, label)` from a single match over the ladder cannot
forget the label; a function returning `content` and setting a label
elsewhere will eventually be edited on one side only, and the surface will
then assert the strong question while showing the weak answer. This is the
one place in a comparison surface where a two-field return is worth
insisting on.

The label names the species **and its scope**, because a degraded baseline
usually has a narrower one. A temporal baseline recovered from a process's
own observation window is bounded by that window, and calling it
"previous" implies a durable history the surface does not have; calling it
"this session: previous" tells the reader in three words both which
question was answered and how far back the answer reaches.

## The empty result carries the label too

The rung is most load-bearing at exactly the moment the surface has
nothing to show. "No differences" against a declared baseline means the
object matches its promise; "no differences" against the last observed
revision means only that nothing has changed since some arbitrary moment
this process happened to be watching — a far weaker statement that reads
identically. A null result is a count, and it carries its predicate
([_laws:
count-carries-predicate_](../../../../_laws.md#count-carries-predicate)):
render it as "matches the declared configuration" or "unchanged since the
last observed revision", never as a bare "no differences".

## Absent degrades; malformed does not

The ladder is entered on **absence**, and only absence. A baseline that is
present but unparseable is a different state and must fail loudly rather
than fall through — the distinction the resilience subject draws as
absent-degrades-malformed-fails-fast, and it has a specific and nasty
shape here. A parse that falls back to the raw source text on error hands
the differ two values in different notations, and every line then differs:
a total, maximally alarming diff, produced by the error handler, and
labelled with the *strong* rung because the baseline was technically
present. That is the phantom-difference failure
[diff-honesty](./diff-honesty.md) names for truncation, arriving through
the fallback path instead — and it fires during an incident, because a
truncated or hand-edited baseline is itself a symptom. Parse failure is
`failure-not-empty-success`: surface it as a broken baseline, do not
descend the ladder to hide it, and never diff a raw serialization against
a rendered one.
